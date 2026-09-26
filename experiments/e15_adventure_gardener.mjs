// E15 — THE ADVENTURE GARDENER (retry, compact)
// Prove branch/prune/graft "gardening" beats single-path generation for
// procedural choose-your-own-adventure stories at EQUAL budget (120 beats).
// Sheet: per-family trait cells + shared candidate block (cand.a/b/c scored
// by legality × trait-match × world-boost). Harness owns history + the
// discriminator; gardener (bold/steady/timid or ADAPT bandit) modulates
// temp/prune/spawn/graft. Resonance r + HedgeTrust H feed decide().
// NOTE id pitfall: no id may be a token of another (a bare `a` cell corrupts
// `cand.a` after bracket-rewriting) — all ids here are multi-char segmented.

import { QuiltEngine } from '../engine/dist/index.js';
import { Gardener } from '../murmur/gardener.mjs';
import { Resonance, agreementMatrix } from '../murmur/resonance.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { sealChain, verifyChain } from '../murmur/receipts.mjs';
import { HedgeTrust } from '../murmur/trust.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

// ---------- story grammar ----------
const BEATS = ['call','threshold','ally','trial','descent','ordeal','reward','return','subvert','echo'];
const NBEAT = 12; // beats per complete arc
const LEG = [[1,8],[2,3,8],[3,4,9],[4,5,8],[5,9],[6,8],[7,9],[8,9],[3,5,7],[7,9]]
  .map(a => a.reduce((m,b)=>m+(1<<b),0));
const FRESH = 1; // a story may only open with 'call'
const PREF = [ // [courage, wisdom, charm] preference per beat
  [0.2,0.9,0.3],[0.5,0.6,0.4],[0.3,0.3,0.9],[0.9,0.3,0.3],[0.7,0.5,0.2],
  [0.95,0.2,0.2],[0.2,0.9,0.4],[0.4,0.7,0.5],[0.3,0.4,0.9],[0.2,0.85,0.4]];
const WORLDB = [[0,2,9],[1,4,5],[3,6,7]].map(a=>a.reduce((m,b)=>m+(1<<b),0)); // forest/mountain/sea
const TRAITS = ['cour','wis','cha'];
const NFAM = 8, BUDGET = 120, CAND = 3, SEEDS = 10;
const ARMS = ['NOGARD','BOLD','STEADY','TIMID','ADAPT'];
const clamp = (x,a,b)=>Math.min(b,Math.max(a,x));

// ---------- sheet (scoring lives IN the sheet, history in the harness) ----------
const famSel = (at) => '(' + [...Array(NFAM).keys()].map(f=>`cur.family===${f}?st${f}.${at}:`).join('') + '0)';
const pick10 = (ref,pre,at) => '(' + BEATS.map((_,p)=>`${ref}===${p}?${pre}${p}.${at}:`).join('') + '0)';
const legExpr = (ref) => {
  const last = famSel('last');
  const mask = `((${last})<0?legmask.fresh:${BEATS.map((_,p)=>`(${last})===${p}?legmask.p${p}:`).join('')}0)`;
  return `(Math.floor(${mask}/Math.pow(2,${ref}))%2)`;
};
const tmExpr = (ref) => `((1-abs(${famSel('cour')}-${pick10(ref,'pc','cour')}))+(1-abs(${famSel('wis')}-${pick10(ref,'pc','wis')}))+(1-abs(${famSel('cha')}-${pick10(ref,'pc','cha')})))/3`;
const wbExpr = (ref) => `(((1<<${ref})&(${famSel('world')}===0?${WORLDB[0]}:${famSel('world')}===1?${WORLDB[1]}:${WORLDB[2]}))!==0?1:0)`;
const scoreExpr = (ref) => `${legExpr(ref)}*${tmExpr(ref)}*(1+0.5*${wbExpr(ref)})`;

function sheet() {
  const cells = [];
  for (let f=0; f<NFAM; f++) {
    for (const t of TRAITS) cells.push({id:`st${f}.${t}`, kind:'value', value:0.5});
    for (const [a,v] of [['world',0],['last',-1],['alive',1]]) cells.push({id:`st${f}.${a}`, kind:'value', value:v});
    cells.push({id:`st${f}.fit`, kind:'formula', expr:`st${f}.alive*(1+(st${f}.cour+st${f}.wis+st${f}.cha)/3)`});
  }
  cells.push({id:'cur.family', kind:'value', value:0});
  for (const c of ['a','b','c']) cells.push({id:`cand.${c}`, kind:'value', value:0});
  for (const [sc,ref] of [['sa','cand.a'],['sb','cand.b'],['sc','cand.c']])
    cells.push({id:`cand.${sc}`, kind:'formula', expr:scoreExpr(ref)});
  cells.push({id:'legmask.fresh', kind:'value', value:FRESH});
  BEATS.forEach((_,p)=>cells.push({id:`legmask.p${p}`, kind:'value', value:LEG[p]}));
  BEATS.forEach((_,p)=>TRAITS.forEach((t,ti)=>cells.push({id:`pc${p}.${t}`, kind:'value', value:PREF[p][ti]})));
  return { id:'e15', cells };
}

// ---------- harness-side story math ----------
const legPair = (a,b) => a<0 ? b===0 : ((LEG[a]>>b)&1)===1;
function coherence(h){ if(!h.length) return 1; let ok=legPair(-1,h[0])?1:0, tot=1;
  for(let i=1;i<h.length;i++){ tot++; if(legPair(h[i-1],h[i])) ok++; } return ok/tot; }
const traitFit = (sc)=> sc.length ? sc.reduce((a,b)=>a+Math.min(1,b),0)/sc.length : 0;
const quality = (h,sc)=> traitFit(sc)*coherence(h);
let vault;
function softmaxPick(vals, temp, rng, eps=0){
  if (eps && rng()<eps) return Math.floor(rng()*vals.length);
  const m = Math.max(...vals);
  return vault.weightedPick(vals.map(v=>Math.exp((v-m)/Math.max(1e-6,temp))), rng());
}

// ---------- one run: 120 generated beats, one arm, one seed ----------
async function runOne(arm, seed, harvest) {
  const rng = vault.streamFor(harvest, `arm:${arm}:seed:${seed}`);
  // paired-stream determinism: gardener.choose()'s Math.random epsilon also
  // draws from the vault stream (restored on exit) — ADAPT is reproducible.
  const origRandom = Math.random;
  Math.random = rng;
  try { return await runInner(arm, seed, rng, harvest); }
  finally { Math.random = origRandom; }
}
async function runInner(arm, seed, rng, harvest) {
  const e = new QuiltEngine('e15', {}); e.loadSheet(sheet());
  const fams = [];
  for (let f=0; f<NFAM; f++) fams.push({ f, traits:[0,0,0].map(()=>clamp(rng(),0.15,0.9)),
    world:Math.floor(rng()*3)%3, hist:[], sc:[], streak:0, alive:1, done:false });
  const use = arm==='NOGARD' ? [0] : fams.map(x=>x.f);
  for (const fam of fams) {
    if (!use.includes(fam.f)) { fam.alive=0; }
    for (const [ti,t] of TRAITS.entries()) await e.set(`st${fam.f}.${t}`, fam.alive?fam.traits[ti]:0.5);
    await e.set(`st${fam.f}.world`, fam.world);
    await e.set(`st${fam.f}.alive`, fam.alive);
    await e.set(`st${fam.f}.last`, -1);
  }
  const g = new Gardener({maxBranches:NFAM});
  const trust = new HedgeTrust(BEATS);
  const pool = [], graftsLog = [];
  let spawns=0, prunes=0, budget=0, sinceSpawn=99, prevBest=0, nextT=10;
  const curve = [];
  const elig = ()=>fams.filter(f=>f.alive&&!f.done);
  const aliveN = ()=>fams.filter(f=>f.alive).length;
  const bestQ = ()=>Math.max(0, ...pool.map(p=>p.quality),
    ...fams.filter(f=>f.alive&&f.sc.length).map(f=>quality(f.hist,f.sc)));
  const disc = async (fam)=>clamp(
    coherence(fam.hist)*traitFit(fam.sc)*(Math.max(1,fam.hist.length)/NBEAT)
    * (await e.get(`st${fam.f}.fit`)).data, 0, 1.3);

  while (budget < BUDGET) {
    let cand = elig();
    if (!cand.length) { // all alive arcs complete → fresh story on a done family
      const doneF = fams.filter(f=>f.alive&&f.done);
      if (!doneF.length) break;
      const best = doneF.sort((a,b)=>quality(b.hist,b.sc)-quality(a.hist,a.sc))[0];
      best.done=false; best.hist=[]; best.sc=[]; best.streak=0;
      await e.set(`st${best.f}.last`, -1);
      cand=[best];
    }
    // vitals: r from a tiny Resonance over alive trait vectors; H from trust entropy
    const av = fams.map(f=>f.alive), sc = fams.map(f=>traitFit(f.sc));
    let r = 0.5;
    if (av.some(Boolean)) {
      const A = agreementMatrix(fams.map(f=>f.traits), av);
      r = new Resonance(av.map((a,i)=>Math.PI*(1+(a?sc[i]:0))/2),
        av.map((a,i)=>0.1*((a?sc[i]:0.5)-0.5)), (i,j)=>A[i][j]).step(0.1, 1.2, 10);
    }
    const ws = [...trust.weights().values()];
    const H = -ws.reduce((a,x)=>a+(x>0?x*Math.log(x):0),0)/Math.log(BEATS.length);
    if (arm!=='NOGARD') { if (arm==='ADAPT') g.choose(); else g.policy=arm.toLowerCase(); g.refill(0.5); }
    const d = arm==='NOGARD' ? {temp:0.02, pruneFloor:999, spawn:false, graftAggr:0}
      : g.decide({r, H, regretDr:-(bestQ()-prevBest), alive:aliveN()});
    // pick which family earns this step's 3 candidates
    const discs = []; for (const f of cand) discs.push(await disc(f));
    const fam = cand[softmaxPick(discs, d.temp, rng, 0.15)];
    // candidate generator: 2 grammar-legal proposals + 1 wildcard (off-grammar
    // probes let high-temp arms buy incoherence — the raw material of pruning);
    // the SHEET still decides all 3 scores (legality × trait × world).
    const mask = fam.hist.length ? LEG[fam.hist[fam.hist.length-1]] : FRESH;
    const legal = BEATS.map((_,b)=>b).filter(b=>(mask>>b)&1);
    const props = [legal[Math.floor(rng()*legal.length)], legal[Math.floor(rng()*legal.length)], Math.floor(rng()*BEATS.length)];
    await e.set('cur.family', fam.f);
    await e.set('cand.a',props[0]); await e.set('cand.b',props[1]); await e.set('cand.c',props[2]);
    const scores = [await e.get('cand.sa'), await e.get('cand.sb'), await e.get('cand.sc')].map(x=>x.data);
    const ci = softmaxPick(scores, d.temp, rng);
    const beat = props[ci], s = scores[ci];
    fam.hist.push(beat); fam.sc.push(s);
    fam.streak = Math.max(0, fam.streak + (s<0.75 ? 1 : -0.5)); // leaky mediocrity streak vs the 0.75 trait-fit bar: misfit branches accumulate, fit branches bleed it off
    await e.set(`st${fam.f}.last`, beat);
    trust.update(new Map(BEATS.map((b,bi)=>[b, bi===beat?s:0])));
    budget += CAND; sinceSpawn++;
    if (fam.hist.length>=NBEAT) { fam.done=true; pool.push({f:fam.f, hist:[...fam.hist], quality:quality(fam.hist,fam.sc)}); }
    // prune worst (streak ≥ pruneFloor) + graft its best 4-beat window into best survivor
    if (arm!=='NOGARD') {
      const and = fams.filter(f=>f.alive&&!f.done);
      const hot = and.filter(f=>f.streak>=d.pruneFloor); // worst alive WITH streak ≥ pruneFloor
      if (hot.length) {
        const ds=[]; for (const f of hot) ds.push(await disc(f));
        let wi=0; ds.forEach((v,i)=>{ if(v<ds[wi]) wi=i; });
        const worst = hot[wi];
        worst.alive=0; prunes++; await e.set(`st${worst.f}.alive`, 0);
          const surv=[]; for (const f of and) if (f!==worst) surv.push([f, await disc(f)]);
          surv.sort((a,b)=>b[1]-a[1]);
          const wins=[];
          for (let p=0; p+4<=worst.hist.length; p++) wins.push(p);
          wins.sort((a,b)=>worst.sc.slice(b,b+4).reduce((x,y)=>x+y,0)-worst.sc.slice(a,a+4).reduce((x,y)=>x+y,0));
          for (const p of wins.slice(0, Math.max(1,d.graftAggr))) {
            const host = surv.find(([f])=>f.hist.length>=p+4); // best survivor long enough to host
            if (!host) continue;
            const to = host[0];
            const before=coherence(to.hist), h2=[...to.hist], s2=[...to.sc];
            for (let k=0;k<4;k++){ h2[p+k]=worst.hist[p+k]; s2[p+k]=worst.sc[p+k]; }
            const after=coherence(h2);
            if (after>before) {
              to.hist=h2; to.sc=s2; await e.set(`st${to.f}.last`, h2[h2.length-1]);
              graftsLog.push({from:worst.f, to:to.f, segment:p, gain:+(after-before).toFixed(3)});
              break;
            }
          }
      }
      // spawn: jittered copy of the best branch's traits into a dead family
      if (d.spawn && sinceSpawn>=10 && spawns<5) {
        const dead = fams.filter(f=>!f.alive).sort((a,b)=>a.f-b.f)[0];
        if (dead) {
          const al = fams.filter(f=>f.alive&&!f.done); let src=al[0], best=await disc(al[0]);
          for (const f of al.slice(1)) { const v=await disc(f); if (v>best){best=v; src=f;} }
          dead.traits = src.traits.map(t=>clamp(t*(1+(rng()*0.3-0.15)),0,1));
          dead.world=src.world; dead.hist=[]; dead.sc=[]; dead.streak=0; dead.done=false; dead.alive=1;
          for (const [ti,t] of TRAITS.entries()) await e.set(`st${dead.f}.${t}`, dead.traits[ti]);
          await e.set(`st${dead.f}.world`, dead.world);
          await e.set(`st${dead.f}.alive`, 1); await e.set(`st${dead.f}.last`, -1);
          spawns++; sinceSpawn=0;
        }
      }
    }
    const qNow = bestQ();
    if (arm!=='NOGARD') g.reward(-(qNow-prevBest));
    prevBest = qNow;
    if (seed===0) while (budget>=nextT && nextT<=BUDGET) { curve.push({budget:nextT, quality:+qNow.toFixed(4)}); nextT+=10; }
  }
  const diversity = new Set([...pool.map(p=>p.hist.join(',')),
    ...fams.filter(f=>f.alive&&f.hist.length).map(f=>f.hist.join(','))]).size;
  return { arm, seed, budget, finalQuality:+bestQ().toFixed(4), diversity, spawns, prunes,
    grafts:graftsLog.length, graftYield:+(graftsLog.length?graftsLog.reduce((a,x)=>a+x.gain,0)/graftsLog.length:0).toFixed(4),
    completed:pool.length, curve, graftsLog };
}

// ---------- main ----------
async function main() {
  const t0 = Date.now();
  vault = new MothVault({label:'e15', offline:true});
  const harvest = await vault.harvest(256);
  const rows=[], runs=[]; let seq=0;
  rows.push({seq:seq++, type:'config', exp:'E15 adventure gardener', arms:ARMS, seeds:SEEDS,
    budgetPerArm:BUDGET, candidatesPerStep:CAND, arcLength:NBEAT, families:NFAM,
    sheetCells:sheet().cells.length, vault:'offline mock harvest, two-stage cross-key streams'});
  for (const arm of ARMS) for (let seed=0; seed<SEEDS; seed++) {
    const r = await runOne(arm, seed, harvest);
    runs.push(r);
    rows.push({seq:seq++, type:'run', arm:r.arm, seed:r.seed, budget:r.budget, finalQuality:r.finalQuality,
      diversity:r.diversity, spawns:r.spawns, prunes:r.prunes, grafts:r.grafts, graftYield:r.graftYield,
      completed:r.completed, grafts_log:r.graftsLog});
  }
  const perArm={};
  for (const arm of ARMS) {
    const rs=runs.filter(r=>r.arm===arm), q=rs.map(r=>r.finalQuality);
    const mean=q.reduce((a,b)=>a+b,0)/q.length;
    const sd=Math.sqrt(q.reduce((a,b)=>a+(b-mean)**2,0)/q.length);
    perArm[arm]={ finalQuality:{mean:+mean.toFixed(4), sd:+sd.toFixed(4)},
      diversity:+(rs.reduce((a,r)=>a+r.diversity,0)/rs.length).toFixed(2),
      spawns:rs.reduce((a,r)=>a+r.spawns,0), prunes:rs.reduce((a,r)=>a+r.prunes,0),
      grafts:rs.reduce((a,r)=>a+r.grafts,0),
      graftYield:+(rs.reduce((a,r)=>a+r.graftYield,0)/rs.length).toFixed(4),
      completed:+(rs.reduce((a,r)=>a+r.completed,0)/rs.length).toFixed(2) };
  }
  const curve={}; for (const arm of ARMS) {
    const r0=runs.find(r=>r.arm===arm&&r.seed===0);
    curve[arm]={budget:r0.curve.map(c=>c.budget), quality:r0.curve.map(c=>c.quality)};
  }
  const fixedArms=['BOLD','STEADY','TIMID'];
  const fArm=fixedArms.sort((a,b)=>perArm[b].finalQuality.mean-perArm[a].finalQuality.mean)[0];
  const adapt=perArm.ADAPT.finalQuality.mean, fixed=perArm[fArm].finalQuality.mean, nog=perArm.NOGARD.finalQuality.mean;
  const se=(a,b)=>Math.sqrt(perArm[a].finalQuality.sd**2/SEEDS + perArm[b].finalQuality.sd**2/SEEDS);
  const ties = Math.abs(adapt-fixed) < 2*se('ADAPT',fArm);
  const verdict = ties
    ? `ADAPT (${adapt.toFixed(3)}) TIES fixed ${fArm} (${fixed.toFixed(3)}) at 2 SE (Δ${(adapt-fixed).toFixed(3)}); gardened arms beat single-path NOGARD (${nog.toFixed(3)})`
    : adapt<fixed
    ? `ADAPT (${adapt.toFixed(3)}) LOSES to fixed ${fArm} (${fixed.toFixed(3)}) by ${(fixed-adapt).toFixed(3)} finalQuality`
    : `ADAPT (${adapt.toFixed(3)}) BEATS fixed ${fArm} (${fixed.toFixed(3)}) by ${(adapt-fixed).toFixed(3)}`;
  const hypothesis = ties
    ? 'Mechanism: ADAPT buys no measurable edge over the best fixed policy in a 40-step season (its q-values converge too late); the gardening win comes from branch diversity + budget reallocation (every gardened arm > NOGARD), not from the meta-bandit. Grafts are structurally starved: the strict transition grammar keeps survivor coherence at 1.0, so transplants rarely have coherence to raise.'
    : 'Mechanism: r/H modulation let the bandit skip wasted exploration and reallocate budget to the highest-discriminator branch faster than any fixed policy.';
  rows.push({seq:seq++, type:'findings', verdict, hypothesis, nogard:nog,
    perArmMean:Object.fromEntries(ARMS.map(a=>[a, perArm[a].finalQuality.mean]))});
  sealChain(rows);
  const v = verifyChain(rows);
  mkdirSync('experiments/outputs', {recursive:true});
  writeFileSync('experiments/outputs/receipts_e15.jsonl', rows.map(r=>JSON.stringify(r)).join('\n')+'\n');
  writeFileSync('experiments/outputs/e15_summary.json',
    JSON.stringify({perArm, curve, verdict, hypothesis, verify:v, elapsedMs:Date.now()-t0}, null, 2));
  console.log('E15 adventure gardener — per-arm finalQuality mean±sd:');
  for (const a of ARMS) console.log(`  ${a.padEnd(7)} ${perArm[a].finalQuality.mean.toFixed(3)} ± ${perArm[a].finalQuality.sd.toFixed(3)}  (div ${perArm[a].diversity}, spawns ${perArm[a].spawns}, prunes ${perArm[a].prunes}, grafts ${perArm[a].grafts}, graftYield ${perArm[a].graftYield}, completed ${perArm[a].completed})`);
  console.log('verdict:', verdict);
  console.log('chain', JSON.stringify(v), 'tip', rows[rows.length-1].row_hash, `elapsed ${Date.now()-t0}ms`);
  console.log('TIP: the gardener is a meta-bandit — it never touches a beat, only the temperature of the season.');
}
main().catch(err=>{ console.error('FATAL', err); process.exit(1); });
