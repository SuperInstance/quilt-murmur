// E20 — LONG SEASONS (the gardener given time to garden)
// ============================================================
// E15's receipted open wound: the whole season was 40 steps — the ADAPT
// bandit "converged too late", spawns were capped at 5, and grafts were
// structurally starved (1 graft across the whole experiment). E20 reruns the
// identical adventure-gardening world with a ×10 budget (1200 candidate-
// slots = 400 steps) and a ×4 spawn cap, and asks which E15 conclusions
// SURVIVE time:
//   C1 legacy — gardening still beats single-path NOGARD at long horizon?
//   C2 grafts — do transplants bloom when there are regimes to garden
//      through (≥10× E15's graft count, non-negative mean yield)?
//   C3 bandit — does ADAPT finally SEPARATE from the best fixed policy?
//   C4 season arc — is the gardener's activity phased: prunes front-loaded
//      (shape the tree early), grafts back-loaded (transplant once branches
//      have differentiated)? The high-order viewpoint claim: the gardener
//      implements pruning-then-grafting as a SEQUENCE, which is only visible
//      in long seasons.
//
// Run: node experiments/e20_long_seasons.mjs [seeds]

import { QuiltEngine } from '../engine/dist/index.js';
import { Gardener } from '../murmur/gardener.mjs';
import { Resonance, agreementMatrix } from '../murmur/resonance.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { sealChain, verifyChain } from '../murmur/receipts.mjs';
import { HedgeTrust } from '../murmur/trust.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

// ---------- story grammar (identical to E15) ----------
const BEATS = ['call','threshold','ally','trial','descent','ordeal','reward','return','subvert','echo'];
const NBEAT = 12;
const LEG = [[1,8],[2,3,8],[3,4,9],[4,5,8],[5,9],[6,8],[7,9],[8,9],[3,5,7],[7,9]]
  .map(a => a.reduce((m,b)=>m+(1<<b),0));
const FRESH = 1;
const PREF = [
  [0.2,0.9,0.3],[0.5,0.6,0.4],[0.3,0.3,0.9],[0.9,0.3,0.3],[0.7,0.5,0.2],
  [0.95,0.2,0.2],[0.2,0.9,0.4],[0.4,0.7,0.5],[0.3,0.4,0.9],[0.2,0.85,0.4]];
const WORLDB = [[0,2,9],[1,4,5],[3,6,7]].map(a=>a.reduce((m,b)=>m+(1<<b),0));
const TRAITS = ['cour','wis','cha'];
const NFAM = 8, CAND = 3;
const BUDGET = Number(process.argv[3] || 1200); // ×10 E15's 120
const SPAWN_CAP = 20;                            // ×4 E15's 5
const SEEDS = Number(process.argv[2] || 10);
const ARMS = ['NOGARD','BOLD','STEADY','TIMID','ADAPT'];
const clamp = (x,a,b)=>Math.min(b,Math.max(a,x));

// ---------- sheet (identical to E15) ----------
const famSel = (at) => '(' + [...Array(NFAM).keys()].map(f=>`cur.family===${f}?st${f}.${at}:`).join('') + '0)';
const pick10 = (ref,pre,at) => '(' + BEATS.map((_,p)=>`${ref}===${p}?${pre}${p}.${at}:`).join('') + '0)';
const legExpr = (ref) => {
  const last = famSel('last');
  const mask = `((${last})<0?legmask.fresh:${BEATS.map((_,p)=>`(${last})===${p}?legmask.p${p}:`).join('')}0)`;
  return `(Math.floor(${mask}/Math.pow(2,${ref}))%2)`;
};
const tmExpr = (ref) => `((1-abs(${famSel('cour')}-${pick10(ref,'pc','cour')}))+(1-abs(${famSel('wis')}-${pick10(ref,'pc','wis')}))+(1-abs(${famSel('cha')}-${pick10(ref,'pc','cha')})))/3`;
const wbExpr = (ref) => `(((1<<${ref})&(${famSel('world')}===0?${WORLDB[0]}:${famSel('world')}===1?${WORLDB[1]}:${famSel('world')}===2?${WORLDB[2]}:0))!==0?1:0)`;
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
  return { id:'e20', cells };
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

// ---------- one long season ----------
async function runOne(arm, seed, harvest) {
  const rng = vault.streamFor(harvest, `arm:${arm}:seed:${seed}`);
  const origRandom = Math.random;
  Math.random = rng;
  try { return await runInner(arm, seed, rng, harvest); }
  finally { Math.random = origRandom; }
}
async function runInner(arm, seed, rng, harvest) {
  const e = new QuiltEngine('e20', {}); e.loadSheet(sheet());
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
  const pool = [], graftsLog = [], qgraftsLog = [], pruneSteps = [], spawnSteps = [], policyTimeline = [];
  let spawns=0, prunes=0, budget=0, sinceSpawn=99, prevBest=0, nextT=30;
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
    if (!cand.length) {
      const doneF = fams.filter(f=>f.alive&&f.done);
      if (!doneF.length) break;
      const best = doneF.sort((a,b)=>quality(b.hist,b.sc)-quality(a.hist,a.sc))[0];
      best.done=false; best.hist=[]; best.sc=[]; best.streak=0;
      await e.set(`st${best.f}.last`, -1);
      cand=[best];
    }
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
    if (arm==='ADAPT') policyTimeline.push(d.policy);
    const discs = []; for (const f of cand) discs.push(await disc(f));
    const fam = cand[softmaxPick(discs, d.temp, rng, 0.15)];
    const mask = fam.hist.length ? LEG[fam.hist[fam.hist.length-1]] : FRESH;
    const legal = BEATS.map((_,b)=>b).filter(b=>(mask>>b)&1);
    const props = [legal[Math.floor(rng()*legal.length)], legal[Math.floor(rng()*legal.length)], Math.floor(rng()*BEATS.length)];
    await e.set('cur.family', fam.f);
    await e.set('cand.a',props[0]); await e.set('cand.b',props[1]); await e.set('cand.c',props[2]);
    const scores = [await e.get('cand.sa'), await e.get('cand.sb'), await e.get('cand.sc')].map(x=>x.data);
    const ci = softmaxPick(scores, d.temp, rng);
    const beat = props[ci], s = scores[ci];
    fam.hist.push(beat); fam.sc.push(s);
    fam.streak = Math.max(0, fam.streak + (s<0.75 ? 1 : -0.5));
    await e.set(`st${fam.f}.last`, beat);
    trust.update(new Map(BEATS.map((b,bi)=>[b, bi===beat?s:0])));
    budget += CAND; sinceSpawn++;
    if (fam.hist.length>=NBEAT) { fam.done=true; pool.push({f:fam.f, hist:[...fam.hist], quality:quality(fam.hist,fam.sc)}); }
    if (arm!=='NOGARD') {
      const and = fams.filter(f=>f.alive&&!f.done);
      const hot = and.filter(f=>f.streak>=d.pruneFloor);
      if (hot.length) {
        const ds=[]; for (const f of hot) ds.push(await disc(f));
        let wi=0; ds.forEach((v,i)=>{ if(v<ds[wi]) wi=i; });
        const worst = hot[wi];
        worst.alive=0; prunes++; pruneSteps.push(budget); await e.set(`st${worst.f}.alive`, 0);
          const surv=[]; for (const f of and) if (f!==worst) surv.push([f, await disc(f)]);
          surv.sort((a,b)=>b[1]-a[1]);
          const wins=[];
          for (let p=0; p+4<=worst.hist.length; p++) wins.push(p);
          wins.sort((a,b)=>worst.sc.slice(b,b+4).reduce((x,y)=>x+y,0)-worst.sc.slice(a,a+4).reduce((x,y)=>x+y,0));
          for (const p of wins.slice(0, Math.max(1,d.graftAggr))) {
            const host = surv.find(([f])=>f.hist.length>=p+4);
            if (!host) continue;
            const to = host[0];
            const before=coherence(to.hist), h2=[...to.hist], s2=[...to.sc];
            for (let k=0;k<4;k++){ h2[p+k]=worst.hist[p+k]; s2[p+k]=worst.sc[p+k]; }
            const after=coherence(h2);
            if (after>before) {
              to.hist=h2; to.sc=s2; await e.set(`st${to.f}.last`, h2[h2.length-1]);
              graftsLog.push({step:budget, from:worst.f, to:to.f, segment:p, gain:+(after-before).toFixed(3)});
              break;
            }
            // E20 extension: the coherence predicate is structurally saturated
            // (legality-gated selection keeps survivors at 1.0), so also accept
            // transplants that raise QUALITY = traitFit × coherence. The
            // operator is the same; only the acceptance bar differs.
            const qBefore=quality(to.hist,to.sc), qAfter=quality(h2,s2);
            if (qAfter>qBefore) {
              to.hist=h2; to.sc=s2; await e.set(`st${to.f}.last`, h2[h2.length-1]);
              qgraftsLog.push({step:budget, from:worst.f, to:to.f, segment:p, gain:+(qAfter-qBefore).toFixed(3)});
              break;
            }
          }
      }
      if (d.spawn && sinceSpawn>=10 && spawns<SPAWN_CAP) {
        const dead = fams.filter(f=>!f.alive).sort((a,b)=>a.f-b.f)[0];
        const al = fams.filter(f=>f.alive&&!f.done);
        if (dead && al.length) {
          let src=al[0], best=await disc(al[0]);
          for (const f of al.slice(1)) { const v=await disc(f); if (v>best){best=v; src=f;} }
          dead.traits = src.traits.map(t=>clamp(t*(1+(rng()*0.3-0.15)),0,1));
          dead.world=src.world; dead.hist=[]; dead.sc=[]; dead.streak=0; dead.done=false; dead.alive=1;
          for (const [ti,t] of TRAITS.entries()) await e.set(`st${dead.f}.${t}`, dead.traits[ti]);
          await e.set(`st${dead.f}.world`, dead.world);
          await e.set(`st${dead.f}.alive`, 1); await e.set(`st${dead.f}.last`, -1);
          spawns++; spawnSteps.push(budget); sinceSpawn=0;
        }
      }
    }
    const qNow = bestQ();
    if (arm!=='NOGARD') g.reward(-(qNow-prevBest));
    prevBest = qNow;
    if (seed===0) while (budget>=nextT && nextT<=BUDGET) { curve.push({budget:nextT, quality:+qNow.toFixed(4)}); nextT+=30; }
  }
  const diversity = new Set([...pool.map(p=>p.hist.join(',')),
    ...fams.filter(f=>f.alive&&f.hist.length).map(f=>f.hist.join(','))]).size;
  // bandit telemetry (ADAPT)
  const bandit = arm==='ADAPT' ? {
    tries: Object.fromEntries([...g.tries].map(([k,v])=>[k,v])),
    qFinal: Object.fromEntries([...g.q].map(([k,v])=>[k,+v.toFixed(4)])),
    switchRate: +(policyTimeline.reduce((a,p,i)=>a+(i>0&&p!==policyTimeline[i-1]?1:0),0)/Math.max(1,policyTimeline.length-1)).toFixed(4),
  } : null;
  return { arm, seed, budget, finalQuality:+bestQ().toFixed(4), diversity, spawns, prunes,
    grafts:graftsLog.length, graftYield:+(graftsLog.length?graftsLog.reduce((a,x)=>a+x.gain,0)/graftsLog.length:0).toFixed(4),
    qgrafts:qgraftsLog.length, qgraftYield:+(qgraftsLog.length?qgraftsLog.reduce((a,x)=>a+x.gain,0)/qgraftsLog.length:0).toFixed(4),
    completed:pool.length, curve, graftsLog, qgraftsLog, pruneSteps, spawnSteps, bandit,
    stepsRun: Math.floor(budget/CAND) };
}

// ---------- main ----------
async function main() {
  console.log(`── E20 long seasons · ${SEEDS} seeds × BUDGET ${BUDGET} (${Math.floor(BUDGET/CAND)} steps) × ${ARMS.length} arms ──`);
  const t0 = Date.now();
  vault = new MothVault({label:'e20', offline:true});
  const harvest = await vault.harvest(256);
  const rows=[], runs=[]; let seq=0;
  rows.push({seq:seq++, type:'config', exp:'E20 long seasons', arms:ARMS, seeds:SEEDS,
    budgetPerArm:BUDGET, stepsPerSeason:Math.floor(BUDGET/CAND), candidatesPerStep:CAND, arcLength:NBEAT, families:NFAM,
    spawnCap:SPAWN_CAP, lineage:'E15 world, ×10 budget, ×4 spawn cap',
    vault:'offline mock harvest, two-stage cross-key streams'});
  for (const arm of ARMS) for (let seed=0; seed<SEEDS; seed++) {
    const r = await runOne(arm, seed, harvest);
    runs.push(r);
    rows.push({seq:seq++, type:'run', arm:r.arm, seed:r.seed, budget:r.budget, finalQuality:r.finalQuality,
      diversity:r.diversity, spawns:r.spawns, prunes:r.prunes, grafts:r.grafts, graftYield:r.graftYield,
      qgrafts:r.qgrafts, qgraftYield:r.qgraftYield,
      completed:r.completed, stepsRun:r.stepsRun, bandit:r.bandit,
      pruneSteps:r.pruneSteps, spawnSteps:r.spawnSteps, grafts_log:r.graftsLog, qgrafts_log:r.qgraftsLog});
    if ((runs.length) % 10 === 0) console.log(`  ${runs.length}/${ARMS.length*SEEDS} runs done (${((Date.now()-t0)/1000).toFixed(0)}s)`);
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
      graftsPerRun:+(rs.reduce((a,r)=>a+r.grafts,0)/rs.length).toFixed(3),
      graftYield:+(rs.reduce((a,r)=>a+r.graftYield,0)/rs.length).toFixed(4),
      qgrafts:rs.reduce((a,r)=>a+r.qgrafts,0),
      qgraftsPerRun:+(rs.reduce((a,r)=>a+r.qgrafts,0)/rs.length).toFixed(3),
      qgraftYield:+(rs.reduce((a,r)=>a+r.qgraftYield,0)/rs.length).toFixed(4),
      completed:+(rs.reduce((a,r)=>a+r.completed,0)/rs.length).toFixed(2) };
  }
  const curve={}; for (const arm of ARMS) {
    const r0=runs.find(r=>r.arm===arm&&r.seed===0);
    curve[arm]={budget:r0.curve.map(c=>c.budget), quality:r0.curve.map(c=>c.quality)};
  }
  // ---- claims ----
  const fixedArms=['BOLD','STEADY','TIMID'];
  const fArm=fixedArms.sort((a,b)=>perArm[b].finalQuality.mean-perArm[a].finalQuality.mean)[0];
  const se=(a,b)=>Math.sqrt(perArm[a].finalQuality.sd**2/SEEDS + perArm[b].finalQuality.sd**2/SEEDS);
  const gardened = ['BOLD','STEADY','TIMID','ADAPT'].sort((a,b)=>perArm[b].finalQuality.mean-perArm[a].finalQuality.mean)[0];
  const nog = perArm.NOGARD.finalQuality.mean;
  const c1 = perArm[gardened].finalQuality.mean > nog + 2*se(gardened,'NOGARD') ? 'CONFIRMED'
    : perArm[gardened].finalQuality.mean > nog ? 'PARTIAL' : 'REFUTED';
  const totalGrafts = ARMS.filter(a=>a!=='NOGARD').reduce((a,x)=>a+perArm[x].grafts,0);
  const totalQGrafts = ARMS.filter(a=>a!=='NOGARD').reduce((a,x)=>a+perArm[x].qgrafts,0);
  const graftRuns = SEEDS*4;
  const allYields = runs.filter(r=>r.arm!=='NOGARD'&&r.grafts>0).map(r=>r.graftYield);
  const allQYields = runs.filter(r=>r.arm!=='NOGARD'&&r.qgrafts>0).map(r=>r.qgraftYield);
  const c2 = (totalGrafts >= 10*graftRuns/32) && (allYields.length===0 || mean(allYields)>=0) ? 'CONFIRMED'
    : totalGrafts > graftRuns/32 ? 'PARTIAL' : 'REFUTED';
  const c2b = totalQGrafts >= 5*graftRuns/32 && (allQYields.length===0 || mean(allQYields)>0) ? 'CONFIRMED'
    : totalQGrafts > graftRuns/32 ? 'PARTIAL' : 'REFUTED';
  const adapt=perArm.ADAPT.finalQuality.mean, fixed=perArm[fArm].finalQuality.mean;
  const ties = Math.abs(adapt-fixed) < 2*se('ADAPT',fArm);
  const c3 = !ties ? (adapt>fixed?'CONFIRMED':'REFUTED') : 'TIE';
  // C4: activity phasing — prune median in first third, graft median in last third
  const allPrune = runs.filter(r=>r.arm!=='NOGARD').flatMap(r=>r.pruneSteps);
  const allGraft = runs.filter(r=>r.arm!=='NOGARD').flatMap(r=>[...r.graftsLog.map(g=>g.step), ...r.qgraftsLog.map(g=>g.step)]);
  const med = (a)=>{ if(!a.length) return null; const s=[...a].sort((x,y)=>x-y); return s[Math.floor(s.length/2)]; };
  const medPrune = med(allPrune), medGraft = med(allGraft);
  const prunesEarly = allPrune.filter(t=>t<BUDGET/3).length, prunesLate = allPrune.filter(t=>t>2*BUDGET/3).length;
  const graftsEarly = allGraft.filter(t=>t<BUDGET/3).length, graftsLate = allGraft.filter(t=>t>2*BUDGET/3).length;
  const phased = medPrune!==null && medGraft!==null && medPrune<medGraft;
  const c4 = phased && (graftsLate>graftsEarly) ? 'CONFIRMED' : phased || (graftsLate>graftsEarly) ? 'PARTIAL' : 'REFUTED';

  rows.push({seq:seq++, type:'C1.legacy', claim:'gardening beats single-path NOGARD at ×10 horizon',
    gardened, perArmMean:Object.fromEntries(ARMS.map(a=>[a, perArm[a].finalQuality.mean])), nogard:nog, verdict:c1});
  rows.push({seq:seq++, type:'C2.graftsBloom', claim:'transplants bloom in long seasons (≥10× E15 rate, non-negative yield)',
    totalGrafts, perRun:+(totalGrafts/graftRuns).toFixed(3), e15Rate:1/32,
    meanYield:+(allYields.length?mean(allYields):0).toFixed(4), perArm:Object.fromEntries(ARMS.map(a=>[a,perArm[a].grafts])), verdict:c2});
  rows.push({seq:seq++, type:'C2b.qualityGrafts', claim:'graft starvation is STRUCTURAL, not temporal: coherence is saturated at 1.0 by legality-gated selection, so the acceptance bar must be QUALITY (traitFit × coherence) — quality-grafts bloom where coherence-grafts cannot',
    totalQGrafts, perRun:+(totalQGrafts/graftRuns).toFixed(3),
    meanYield:+(allQYields.length?mean(allQYields):0).toFixed(4),
    perArm:Object.fromEntries(ARMS.map(a=>[a,perArm[a].qgrafts])), verdict:c2b});
  rows.push({seq:seq++, type:'C3.banditSeparation', claim:'ADAPT separates from the best fixed policy given 400 bandit steps',
    adapt, bestFixed:fArm, fixed, delta:+(adapt-fixed).toFixed(4), twoSE:+(2*se('ADAPT',fArm)).toFixed(4),
    banditTries: runs.find(r=>r.arm==='ADAPT'&&r.bandit)?.bandit?.tries, verdict:c3});
  rows.push({seq:seq++, type:'C4.seasonArc', claim:'the gardener is phased: prunes front-loaded, grafts back-loaded',
    medianPruneStep:medPrune, medianGraftStep:medGraft,
    prunes:{early:prunesEarly, late:prunesLate}, grafts:{early:graftsEarly, late:graftsLate}, budget:BUDGET, verdict:c4});
  rows.push({seq:seq++, type:'perArm', arms:perArm});
  rows.push({seq:seq++, type:'curves', curves:curve});

  function mean(a){ return a.length? a.reduce((x,y)=>x+y,0)/a.length : 0; }

  const verdict = `C1=${c1} C2=${c2} C2b=${c2b} C3=${c3} C4=${c4}`;
  const hypothesis = c2b==='CONFIRMED'
    ? 'Mechanism: graft starvation was STRUCTURAL, not temporal — legality-gated selection saturates survivor coherence at 1.0, so no season length can make coherence-raising transplants available; re-specifying the graft bar to QUALITY (traitFit × coherence) blooms the operator. Prune-then-graft phasing and the ADAPT-vs-fixed question are receipted separately.'
    : 'Mechanism: long seasons change where the gardening win comes from — see claims for the receipted split.';
  rows.push({seq:seq++, type:'findings', verdict, hypothesis,
    perArmMean:Object.fromEntries(ARMS.map(a=>[a, perArm[a].finalQuality.mean]))});
  sealChain(rows);
  const v = verifyChain(rows);
  mkdirSync('experiments/outputs', {recursive:true});
  writeFileSync('experiments/outputs/receipts_e20.jsonl', rows.map(r=>JSON.stringify(r)).join('\n')+'\n');
  console.log('\n══ E20 LONG SEASONS ══');
  for (const arm of ARMS) {
    const P = perArm[arm];
    console.log(`${arm.padEnd(7)} q=${P.finalQuality.mean.toFixed(3)}±${P.finalQuality.sd.toFixed(3)} (div ${P.diversity}, spawns ${P.spawns}, prunes ${P.prunes}, grafts ${P.grafts}+${P.qgrafts}q @yield ${P.graftYield}/${P.qgraftYield}, arcs ${P.completed})`);
  }
  console.log(`chain {"ok":${v.ok},"links":${rows.length}} elapsed ${((Date.now()-t0)/1000).toFixed(0)}s`);
  console.log(`verdicts: ${verdict}`);
  console.log(`TIP: ${hypothesis}`);
}
main();
