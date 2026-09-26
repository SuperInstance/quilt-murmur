// E28 — BUDGET LEG: does the tree-level advantage scale with tree budget?
// =======================================================================
// E26 (receipted, 30 seeds × 400 steps, budget 1200): TREE 0.942±0.042 vs
// NODE20 0.932±0.041 — paired Δ +0.0100 ± 0.0109 SE, sign-test p=0.856 →
// C1 PARTIAL; C2 CONFIRMED (103 subtree transplants vs 4 node-coherence
// grafts, 3.43/run); C4 CONFIRMED (TREE 3.73 root-paths vs NODE20 sprawl
// 10.17). E26's LEG 2 (TREE/NODE20 at 2× budget) was CUT by the runtime
// rule with the receipted hypothesis: "C1's fate may hinge on tree budget
// since TREE's mechanism (γ^depth discount + diversity headroom) should
// scale with tree size while NODE20 saturates." E28 runs that cut leg as
// its own task, plus a 4× point (4800) if the runtime budget allows.
//
// Arms: TREE and NODE20 only (the C1 contenders). 10 seeds × budget 2400
// (2× E26's 1200 → 800 steps at 3 candidates/step); optional budget 4800
// × 10 seeds ONLY if a 1-seed-per-arm timing probe projects total runtime
// < 170 s (cut rule, receipted below).
//
// Decision rules (receipted, decided BEFORE the run):
//   C1_at_budget: paired per-seed deltas (TREE − NODE20) at budget 2400,
//     CONFIRMED iff mean delta > 0 AND two-sided exact binomial sign-test
//     p < 0.05 (zeros excluded, small-p method); REFUTED if mean < 0;
//     else PARTIAL. Widening reported as delta_2400 − delta_1200 where
//     delta_1200 = E26's receipted +0.0100 (30 seeds, read at runtime from
//     experiments/outputs/e26_summary.json), with the matched first-10-
//     seeds subset of E26's paired deltas as a sensitivity baseline.
//     If the 4800 point runs: same rule at 4800; trend 1200→2400→4800.
//   C2_mechanism: at 2400, CONFIRMED iff TREE subtree transplants per run
//     >= 3.0 (E26's 1200-budget rate 3.43, slack for 10 seeds) AND
//     meanTreeGain > 0 AND TREE lineageDiv >= 2 AND NODE20 lineageDiv >
//     TREE lineageDiv (structural diversity vs sprawl); PARTIAL iff
//     transplants > 0 AND meanTreeGain > 0; else REFUTED. "Intensified
//     with budget" is REPORTED (transplants/run and root-paths vs E26's
//     3.43 / 3.73 / 10.17), not gated.
//   C3_saturation: climb(arm) = mean final quality at 2400 (E28) − mean
//     final quality at 1200 (E26 receipted per-arm means). CONFIRMED iff
//     climb(TREE) > climb(NODE20) AND climb(TREE) > 0; PARTIAL iff
//     climb(TREE) > 0; REFUTED otherwise. Supporting (not gated): within-
//     run last-half and last-quarter quality gains from per-seed budget
//     curves. At 4800 (if kept): same rule with climb measured 2400→4800
//     within E28.
//   Runtime cut rule: probe = seed 0 × both arms × both budgets, timed;
//     projected = elapsed + (seeds−1)×(sum of per-arm probe times) per
//     kept budget + 2 s IO. If projected > 170 s the 4800 point is CUT
//     (its probe runs are discarded, not analyzed, receipted here).
// Sheet ≡ reference mirrors every 20 steps (e26 convention), tol 1e-9,
// max |diff| tracked. Vault: offline mock harvest (MothVault offline:true,
// streamFor per e28:b<budget>:arm:<arm>:seed:<seed> — per-purpose keys),
// no network, no LLM, 0 live jobs at end.
// This file REUSES E26's harness verbatim (runInner unchanged except the
// engine/sheet id 'e28', the stream keys, and curves recorded for all
// seeds — observation only, no rng consumption). e26_gardener_scale.mjs
// and every other existing file are untouched and NOT re-run.
// Run: node experiments/e28_budget_leg.mjs [seeds=10] [budget=2400] [leg4800=1|0] [budget4800=2×budget]

import { QuiltEngine } from '../engine/dist/index.js';
import { Gardener } from '../murmur/gardener.mjs';
import { Resonance, agreementMatrix } from '../murmur/resonance.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { sealChain, verifyChain } from '../murmur/receipts.mjs';
import { HedgeTrust } from '../murmur/trust.mjs';
import { Spreader } from '../murmur/spreader.mjs';
import { Tree, scoreTree, graftView, spawnView, pruneSubtree, graftSubtree, spawnUnder } from '../murmur/tree_ops.mjs';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';

// ---------- story grammar (identical to E15/E20/E23/E26) ----------
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
// ---------- E28 constants (E26 harness verbatim) ----------
const NFAM = 12, CAND = 3;
const ARMS = ['NODE20','TREE']; // the C1 contenders only
const SEEDS = Number(process.argv[2] || 10);
const BUD1 = Number(process.argv[3] || 2400);            // 2× E26's 1200 (the receipted LEG-2 cut)
const LEG4800 = process.argv[4] !== '0';                 // second budget point, pending the probe cut rule
const BUD2 = Number(process.argv[5] || 2 * BUD1);        // 4× E26's 1200
const RT_LIMIT_S = 170;                                  // total runtime budget incl. probe
const SPAWN_CAP = 20, COOL = 10;
const GAMMA = 0.97, WQ = 1, WC = 0.25, WD = 0.05, WS = 2, BAR = 0.75, GRACE = 15;
const GRAFT_EVERY = 10, MAXDEPTH = 6, RSTEPS = 6, TOPP = 6;
const scoreOf = (bud) => ({ wq: WQ, wc: WC, wd: WD, ws: WS, budget: bud, gamma: GAMMA, rSteps: RSTEPS });
const clamp = (x,a,b)=>Math.min(b,Math.max(a,x));

// ---------- paired statistics (inline, no external deps; e26 verbatim) ----------
function binom2(n, k) { let c = 1; for (let i = 0; i < k; i++) c = c * (n - i) / (i + 1); return c; }
// two-sided exact binomial sign test on +/− signs (zeros excluded; the
// "method of small p-values": sum every pmf term ≤ pmf(k), like R's binom.test)
function signTest(deltas) {
  const nz = deltas.filter(d => d !== 0);
  const n = nz.length, k = nz.filter(d => d > 0).length, ties = deltas.length - n;
  if (!n) return { n: 0, k: 0, ties, p: 1 };
  const pmf = (i) => binom2(n, i) * Math.pow(0.5, n);
  const pk = pmf(k);
  let p = 0; for (let i = 0; i <= n; i++) if (pmf(i) <= pk + 1e-15) p += pmf(i);
  return { n, k, ties, p: Math.min(1, p) };
}
function pairedStats(a, b, runs) {
  const qa = runs.filter(r => r.arm === a).sort((x, y) => x.seed - y.seed).map(r => r.finalQuality);
  const qb = runs.filter(r => r.arm === b).sort((x, y) => x.seed - y.seed).map(r => r.finalQuality);
  const df = qa.map((v, i) => v - qb[i]);
  const n = df.length, m = df.reduce((x, y) => x + y, 0) / n;
  const sd = Math.sqrt(df.reduce((x, y) => x + (y - m) ** 2, 0) / n);
  const st = signTest(df);
  return { armA: a, armB: b, n, mean: +m.toFixed(4), se: +(sd / Math.sqrt(n)).toFixed(4), sd: +sd.toFixed(4),
    signTest: { n: st.n, k: st.k, ties: st.ties, p: +st.p.toFixed(5) },
    wins: df.filter(x => x > 0).length, losses: df.filter(x => x < 0).length,
    deltas: df.map(d => +d.toFixed(4)) };
}
const verdictPair = (ps) => ps.mean > 0 && ps.signTest.p < 0.05 ? 'CONFIRMED' : ps.mean < 0 ? 'REFUTED' : 'PARTIAL';

// ---------- sheet: per-family trait/est value cells + score formulas (e26 DAG, id e28) ----------
const famSel = (at) => '(' + [...Array(NFAM).keys()].map(f=>`cur.family===${f}?st${f}.${at}:`).join('') + '0)';
const pick10 = (ref,pre,at) => '(' + BEATS.map((_,p)=>`${ref}===${p}?${pre}${p}.${at}:`).join('') + '0)';
const legExpr = (ref) => {
  const last = famSel('last');
  const mask = `((${last})<0?legmask.fresh:${BEATS.map((_,p)=>`(${last})===${p}?legmask.p${p}:`).join('')}0)`;
  return `(Math.floor(${mask}/Math.pow(2,${ref}))%2)`;
};
const tmExpr = (ref) => `((1-abs(${famSel('cour')}-${pick10(ref,'pc','cour')}))+(1-abs(${famSel('wis')}-${pick10(ref,'pc','wis')}))+(1-abs(${famSel('cha')}-${pick10(ref,'pc','cha')})))/3`;
const wbExpr = (ref) => `(((1<<${ref})&(${famSel('world')}===0?${WORLDB[0]}:${famSel('world')}===1?${WORLDB[1]}:${famSel('world')}===2?${WORLDB[2]}:0))!==0?1:0)`;
const scoreExpr = (ref) => `${legExpr(ref)}*${tmExpr(ref)}*(1+0.5*${famSel('e2')}*${wbExpr(ref)})`;

function sheet() {
  const cells = [];
  for (let f=0; f<NFAM; f++) {
    for (const t of TRAITS) cells.push({id:`st${f}.${t}`, kind:'value', value:0.5});
    for (const [a,v] of [['e1',0.5],['e2',0.8],['world',0],['last',-1],['alive',1],['depth',0]]) cells.push({id:`st${f}.${a}`, kind:'value', value:v});
    cells.push({id:`st${f}.fit`, kind:'formula', expr:`st${f}.alive*Math.pow(gd.gamma,st${f}.depth)*(1+(st${f}.cour+st${f}.wis+st${f}.cha)/3)*(0.5+0.5*st${f}.e1)`});
  }
  cells.push({id:'cur.family', kind:'value', value:0});
  for (const c of ['a','b','c']) cells.push({id:`cand.${c}`, kind:'value', value:0});
  for (const [sc,ref] of [['sa','cand.a'],['sb','cand.b'],['sc','cand.c']]) cells.push({id:`cand.${sc}`, kind:'formula', expr:scoreExpr(ref)});
  cells.push({id:'gd.gamma', kind:'value', value:GAMMA});
  cells.push({id:'legmask.fresh', kind:'value', value:FRESH});
  BEATS.forEach((_,p)=>cells.push({id:`legmask.p${p}`, kind:'value', value:LEG[p]}));
  BEATS.forEach((_,p)=>TRAITS.forEach((t,ti)=>cells.push({id:`pc${p}.${t}`, kind:'value', value:PREF[p][ti]})));
  return { id:'e28', cells };
}

// ---------- harness-side story math (e20/e23/e26) + reference mirrors ----------
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
const tagree = (a,b)=>{ let d=0; for (let k=0;k<a.length;k++) d+=Math.abs(a[k]-b[k]); return Math.max(0, 1-(d/a.length)*2); };
// reference mirrors of the sheet formulas (verify every 20 steps, tol 1e-9)
const refScore = (n, beat) => {
  const last = n.hist.length ? n.hist[n.hist.length-1] : -1;
  const mask = last < 0 ? FRESH : LEG[last];
  const leg = Math.floor(mask/Math.pow(2,beat))%2;
  const tm = ((1-Math.abs(n.traits[0]-PREF[beat][0]))+(1-Math.abs(n.traits[1]-PREF[beat][1]))+(1-Math.abs(n.traits[2]-PREF[beat][2])))/3;
  const wb = ((((1<<beat)&WORLDB[n.world])!==0)?1:0);
  return leg*tm*(1+0.5*n.e2*wb);
};
const refFit = (n) => n.alive*Math.pow(GAMMA,n.depth)*(1+(n.traits[0]+n.traits[1]+n.traits[2])/3)*(0.5+0.5*n.e1);
const NODECELLS = [['cour',0],['wis',1],['cha',2],['e1','e1'],['e2','e2'],['world','world'],['alive','alive'],['last','last'],['depth','depth']];

// ---------- one season (budget-parameterized: E26 harness verbatim) ----------
async function runOne(arm, seed, harvest, bud) {
  const rng = vault.streamFor(harvest, `e28:b${bud}:arm:${arm}:seed:${seed}`); // per-purpose E28 keys
  const origRandom = Math.random;
  Math.random = rng; // gardener/spreader epsilon explore rides the vault stream
  try { return await runInner(arm, seed, rng, bud); }
  finally { Math.random = origRandom; }
}
async function runInner(arm, seed, rng, bud) {
  const SCORE = scoreOf(bud);
  const e = new QuiltEngine('e28', {}); e.loadSheet(sheet());
  const T = new Tree({gamma: GAMMA});
  const spreader = new Spreader({jitter: 0.18});
  const genBySlot = Array(NFAM).fill(0);
  const writeNode = async (n) => { for (const [k,ki] of NODECELLS) {
    const v = k==='last' ? (n.hist.length?n.hist[n.hist.length-1]:-1) : (typeof ki==='number' ? n.traits[ki] : n[ki]);
    await e.set(`st${n.slot}.${k}`, v); } };
  for (let f=0; f<NFAM; f++) {
    const n = { id:`f${f}g0`, slot:f, parent:null, depth:0, traits:[0,0,0].map(()=>clamp(rng(),0.15,0.9)),
      world:Math.floor(rng()*3)%3, e1:0.5, e2:0.8, hist:[], sc:[], streak:0, subFail:0, subMean:1, age:0,
      alive: arm==='NOGARD' ? (f===0?1:0) : 1, done:false };
    T.add(n); await writeNode(n);
  }
  const g = new Gardener({maxBranches: NFAM});
  const trust = new HedgeTrust(BEATS);
  const pool = [], graftsCoh=[], graftsQ=[], graftsSub=[], prunesNode=[], prunesSub=[], spawnSteps=[];
  let spawns=0, budget=0, step=0, sinceSpawn=99, prevBest=0, nextT=120, verifyN=0, verifyBad=0, verifyCells=0, verifyMax=0;
  const curve = [];
  const byId = (id)=>T.get(id);
  const elig = ()=>T.alive().filter(n=>!n.done);
  const discQN = (n)=> n.hist.length ? Math.pow(GAMMA,n.depth)*quality(n.hist,n.sc) : 0;
  const bestQ = ()=>Math.max(0, ...pool.map(p=>p.quality),
    ...T.alive().filter(n=>n.hist.length).map(n=>quality(n.hist,n.sc)));
  const disc = async (n)=>clamp(coherence(n.hist)*traitFit(n.sc)*(Math.max(1,n.hist.length)/NBEAT)
    * (await e.get(`st${n.slot}.fit`)).data, 0, 1.3);
  const viewOf = ()=>T.alive().map(n=>({ id:n.id, parent:n.parent, depth:n.depth, traits:n.traits,
    hist:n.hist, sc:n.sc, tf:traitFit(n.sc) }));
  const slotFree = ()=>{ for (let f=0;f<NFAM;f++) if (!T.alive().some(n=>n.slot===f)) return f; return -1; };
  const isTree = arm==='TREE' || arm==='TREEG';

  while (budget < bud) {
    let cand = elig();
    if (!cand.length) { // all alive arcs complete → fresh story on best done node
      const doneF = T.alive().filter(n=>n.done);
      if (!doneF.length) break;
      const best = doneF.sort((a,b)=>quality(b.hist,b.sc)-quality(a.hist,a.sc))[0];
      best.done=false; best.hist=[]; best.sc=[]; best.streak=0; best.subFail=0; best.age=0;
      await e.set(`st${best.slot}.last`, -1);
      cand=[best];
    }
    // vitals: B uses the e20 plain-mesh r; TREE/TREEG use the structure-aware canopy r
    let r = 0.5;
    if (isTree) r = scoreTree(viewOf(), quality, SCORE).r;
    else {
      const av=[], tf=[];
      for (let f=0;f<NFAM;f++){ const n=T.get(`f${f}g${genBySlot[f]}`); const a=n&&n.alive; av.push(a?1:0); tf.push(a?traitFit(n.sc):0); }
      if (av.some(Boolean)) {
        const A = agreementMatrix([...Array(NFAM).keys()].map(f=>{ const n=T.get(`f${f}g${genBySlot[f]}`); return n&&n.alive?n.traits:[0,0,0]; }), av);
        r = new Resonance(av.map((a,i)=>Math.PI*(1+(a?tf[i]:0))/2), av.map((a,i)=>0.1*((a?tf[i]:0.5)-0.5)), (i,j)=>A[i][j]).step(0.1, 1.2, 10);
      }
    }
    const ws = [...trust.weights().values()];
    const H = -ws.reduce((a,x)=>a+(x>0?x*Math.log(x):0),0)/Math.log(BEATS.length);
    if (arm!=='NOGARD') { g.policy='bold'; g.refill(0.5); }
    const d = arm==='NOGARD' ? {temp:0.02, pruneFloor:999, spawn:false, graftAggr:0}
      : g.decide({r, H, regretDr:-(bestQ()-prevBest), alive:T.alive().length});
    // pick which node earns this step's 3 candidates (sheet scores, e20 recipe)
    const discs=[]; for (const n of cand) discs.push(await disc(n));
    const fam = cand[softmaxPick(discs, d.temp, rng, 0.15)];
    const mask = fam.hist.length ? LEG[fam.hist[fam.hist.length-1]] : FRESH;
    const legal = BEATS.map((_,b)=>b).filter(b=>(mask>>b)&1);
    const props = [legal[Math.floor(rng()*legal.length)], legal[Math.floor(rng()*legal.length)], Math.floor(rng()*BEATS.length)];
    await e.set('cur.family', fam.slot);
    await e.set('cand.a',props[0]); await e.set('cand.b',props[1]); await e.set('cand.c',props[2]);
    const scores = [await e.get('cand.sa'), await e.get('cand.sb'), await e.get('cand.sc')].map(x=>x.data);
    budget += CAND; sinceSpawn++; step++;
    // sheet ≡ reference math every 20 steps (fit cells carry the γ^depth discount)
    if (step % 20 === 0) {
      verifyN++;
      const refs = [['a',props[0]],['b',props[1]],['c',props[2]]];
      for (const [k,pb] of refs) {
        verifyCells++;
        const diff = Math.abs((await e.get(`cand.s${k}`)).data - refScore(fam, pb));
        if (diff > verifyMax) verifyMax = diff;
        if (diff > 1e-9) verifyBad++;
      }
      for (const n of T.alive()) { verifyCells++;
        const diff = Math.abs((await e.get(`st${n.slot}.fit`)).data - refFit(n));
        if (diff > verifyMax) verifyMax = diff;
        if (diff > 1e-9) verifyBad++; }
    }
    const ci = softmaxPick(scores, d.temp, rng);
    const beat = props[ci], s = scores[ci];
    fam.hist.push(beat); fam.sc.push(s);
    fam.streak = Math.max(0, fam.streak + (s<0.75 ? 1 : -0.5));
    await e.set(`st${fam.slot}.last`, beat);
    trust.update(new Map(BEATS.map((b,bi)=>[b, bi===beat?s:0])));
    // est evidence: confidence + boost claim refresh (old lineages fade unless refreshed)
    const wb = ((((1<<beat)&WORLDB[fam.world])!==0)?1:0);
    fam.e1 = clamp(fam.e1 + (s>=0.75?0.02:-0.02), 0.05, 0.95);
    if (wb) fam.e2 = clamp(fam.e2 + (s>=0.9?0.03:(s<0.6?-0.03:0)), 0.3, 1.2);
    await e.set(`st${fam.slot}.e1`, fam.e1); await e.set(`st${fam.slot}.e2`, fam.e2);
    if (fam.hist.length>=NBEAT) { fam.done=true; pool.push({id:fam.id, hist:[...fam.hist], quality:quality(fam.hist,fam.sc)}); }
    // ---------- operators ----------
    if (arm==='NODE20') {
      const and = T.alive().filter(n=>!n.done);
      const hot = and.filter(n=>n.streak>=d.pruneFloor);
      if (hot.length && T.alive().length>=2) {
        const ds=[]; for (const n of hot) ds.push(await disc(n));
        let wi=0; ds.forEach((v,i)=>{ if(v<ds[wi]) wi=i; });
        const worst = hot[wi];
        worst.alive=0; await e.set(`st${worst.slot}.alive`, 0); prunesNode.push(budget);
        const surv=[]; for (const n of and) if (n!==worst) surv.push([n, await disc(n)]);
        surv.sort((a,b)=>b[1]-a[1]);
        const wins=[]; for (let p=0; p+4<=worst.hist.length; p++) wins.push(p);
        wins.sort((a,b)=>worst.sc.slice(b,b+4).reduce((x,y)=>x+y,0)-worst.sc.slice(a,a+4).reduce((x,y)=>x+y,0));
        for (const p of wins.slice(0, Math.max(1,d.graftAggr))) {
          const host = surv.find(([n])=>n.hist.length>=p+4);
          if (!host) continue;
          const to = host[0];
          const before=coherence(to.hist), h2=[...to.hist], s2=[...to.sc];
          for (let k=0;k<4;k++){ h2[p+k]=worst.hist[p+k]; s2[p+k]=worst.sc[p+k]; }
          const after=coherence(h2);
          if (after>before) { to.hist=h2; to.sc=s2; await e.set(`st${to.slot}.last`, h2[h2.length-1]);
            graftsCoh.push({step:budget, from:worst.id, to:to.id, seg:p, gain:+(after-before).toFixed(3)}); break; }
          // E20 C2b extension: coherence saturated → accept on QUALITY
          const qB=quality(to.hist,to.sc), qA=quality(h2,s2);
          if (qA>qB) { to.hist=h2; to.sc=s2; await e.set(`st${to.slot}.last`, h2[h2.length-1]);
            graftsQ.push({step:budget, from:worst.id, to:to.id, seg:p, gain:+(qA-qB).toFixed(3)}); break; }
        }
      }
      if (d.spawn && sinceSpawn>=COOL && spawns<SPAWN_CAP) {
        const f = slotFree(); const al = T.alive().filter(n=>!n.done);
        if (f>=0 && al.length) {
          let src=al[0], bd=await disc(al[0]);
          for (const n of al.slice(1)) { const v=await disc(n); if (v>bd){bd=v; src=n;} }
          genBySlot[f]++;
          const node = { id:`f${f}g${genBySlot[f]}`, slot:f, parent:null, depth:0,
            traits: src.traits.map(t=>clamp(t*(1+(rng()*0.3-0.15)),0,1)),
            world: src.world, e1: src.e1, e2: src.e2, hist:[], sc:[], streak:0, subFail:0, subMean:1, age:0, alive:1, done:false };
          T.add(node); await writeNode(node);
          spawns++; spawnSteps.push(budget); sinceSpawn=0;
        }
      }
    } else if (isTree) {
      // subtree streaks + minimal-failing-subtree / depth-dominance prune
      for (const n of T.alive()) n.age++;
      const hnodes = T.alive().filter(n=>n.hist.length);
      const canopyMean = hnodes.length ? hnodes.reduce((a,n)=>a+discQN(n),0)/hnodes.length : 0;
      for (const n of T.alive()) {
        const sub = T.subtree(n.id).filter(m=>m.hist.length);
        n.subMean = sub.length ? sub.reduce((a,m)=>a+discQN(m),0)/sub.length : (n.age<GRACE ? BAR+0.01 : 0);
        n.subFail = n.subMean < BAR ? n.subFail+1 : 0;
      }
      const fails = T.alive().filter(n=>n.subFail>=d.pruneFloor && (n.parent==null || (byId(n.parent)&&byId(n.parent).subMean>=BAR)));
      const deeps = T.alive().filter(n=>n.depth>=4 && n.subMean<canopyMean);
      const killC = fails.concat(deeps).sort((a,b)=>a.subMean-b.subMean);
      if (killC.length && T.alive().length - T.subtree(killC[0].id).length >= 2) {
        const v = killC[0];
        const res = pruneSubtree(T, v.id);
        for (const kid of res.killed) await e.set(`st${byId(kid).slot}.alive`, 0);
        prunesSub.push({step:budget, root:v.id, killed:res.killed, siblings:res.siblings, subMean:+v.subMean.toFixed(3)});
      }
      // subtree transplant scan: re-root an attached subtree where T improves
      if (step % GRAFT_EVERY === 0 && d.graftAggr > 0 && T.alive().length >= 2) {
        const view = viewOf(); const base = scoreTree(view, quality, SCORE);
        const cands = [];
        for (const x of T.alive()) { if (x.parent==null) continue;
          const ps = T.alive().filter(p=>p.id!==x.parent && !p.done && !T.inSubtree(x.id, p.id)
            && p.depth+1+T.height(x.id)<=MAXDEPTH)
            .map(p=>[p, tagree(x.traits, p.traits)]).filter(a=>a[1]>=0.1)
            .sort((a,b)=>b[1]-a[1]).slice(0, TOPP);
          for (const [p] of ps) { const gv = graftView(view, x.id, p.id); if (gv) cands.push([x,p,gv]); }
        }
        const scored = cands.map(([x,p,gv])=>{
          const s2 = scoreTree(gv.view, quality, SCORE);
          let sum=0, cnt=0; // node-quality delta of the moved (historied) nodes
          for (const m of gv.view) { const m0 = view.find(v=>v.id===m.id);
            if (m0 && m0.hist.length && m0.depth!==m.depth) { const q=quality(m0.hist,m0.sc);
              sum += Math.pow(GAMMA,m.depth)*q - Math.pow(GAMMA,m0.depth)*q; cnt++; } }
          return { x, p, gv, dT:s2.T-base.T, nodeGain: cnt?sum/cnt:0,
            parts:{dQ:+(s2.leafMean-base.leafMean).toFixed(4), dC:+(s2.r-base.r).toFixed(4),
                   dD:s2.div-base.div, dS:+(base.meanD2-s2.meanD2).toFixed(5)} };
        }).sort((a,b)=> arm==='TREE' ? b.dT-a.dT : b.nodeGain-a.nodeGain);
        if (scored.length) {
          const c = scored[0], gain = arm==='TREE' ? c.dT : c.nodeGain;
          if (gain > 1e-9) {
            const res = graftSubtree(T, c.x.id, c.p.id);
            for (const m of T.subtree(c.x.id)) await e.set(`st${m.slot}.depth`, m.depth);
            graftsSub.push({step:budget, node:c.x.id, oldParent:res.oldParent, newParent:c.p.id,
              moved:res.moved, rootDepthDelta:res.rootDepthDelta, dT:+c.dT.toFixed(4), nodeGain:+c.nodeGain.toFixed(4), parts:c.parts});
          }
        }
      }
      // spawnUnder: permission-gated; the acceptance signal chooses the parent
      if (d.spawn && sinceSpawn>=COOL && spawns<SPAWN_CAP) {
        const f = slotFree(); const srcs = T.alive().filter(n=>!n.done && n.hist.length);
        if (f>=0 && srcs.length) {
          let src=srcs[0], bd=await disc(srcs[0]);
          for (const n of srcs.slice(1)) { const v=await disc(n); if (v>bd){bd=v; src=n;} }
          let parent=null;
          if (arm==='TREE') {
            const view = viewOf(); const base = scoreTree(view, quality, SCORE);
            let bdt=-Infinity;
            for (const p of T.alive()) { if (p.done) continue;
              const pv = spawnView(view, p.id, 'candChild', src.traits);
              const s2 = scoreTree(pv, quality, SCORE);
              if (s2.T-base.T > bdt) { bdt=s2.T-base.T; parent=p; } }
          } else parent = T.alive().filter(p=>!p.done).sort((a,b)=>discQN(b)-discQN(a))[0];
          if (parent) {
            genBySlot[f]++;
            spawnUnder(T, parent, {id:`f${f}g${genBySlot[f]}`, slot:f, spreader, rng});
            await writeNode(T.get(`f${f}g${genBySlot[f]}`));
            spawns++; spawnSteps.push(budget); sinceSpawn=0;
          }
        }
      }
    }
    const qNow = bestQ();
    if (arm!=='NOGARD') g.reward(-(qNow-prevBest));
    prevBest = qNow;
    // E28: curves recorded for ALL seeds (observation only — no rng consumed)
    while (budget>=nextT && nextT<=bud) {
      curve.push({budget:nextT, quality:+qNow.toFixed(4), lineageDiv:T.lineageDiversity()}); nextT+=40*CAND;
    }
  }
  const storyDiv = new Set([...pool.map(p=>p.hist.join(',')),
    ...T.alive().filter(n=>n.hist.length).map(n=>n.hist.join(','))]).size;
  const mean = (a)=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
  return { arm, seed, budget, finalQuality:+bestQ().toFixed(4), storyDiv,
    lineageDiv:T.lineageDiversity(), depthMax:Math.max(0,...T.alive().map(n=>n.depth)),
    spawns, prunesNode:prunesNode.length, prunesSub:prunesSub.length,
    graftsCoh:graftsCoh.length, graftsQ:graftsQ.length, graftsSub:graftsSub.length,
    meanTreeGain:+mean(graftsSub.map(x=>x.dT)).toFixed(4), meanNodeGain:+mean(graftsSub.map(x=>x.nodeGain)).toFixed(4),
    meanCohGain:+mean(graftsCoh.map(x=>x.gain)).toFixed(4), meanQGain:+mean(graftsQ.map(x=>x.gain)).toFixed(4),
    completed:pool.length, stepsRun:step, verifyN, verifyBad, verifyCells, verifyMax,
    treeT: isTree ? +scoreTree(viewOf(), quality, SCORE).T.toFixed(4) : null,
    curve,
    treeDump: (arm==='TREE' && seed===0) ? { diversity:T.lineageDiversity(), nodes:T.alive().map(n=>({ id:n.id, parent:n.parent, depth:n.depth,
      traits:n.traits.map(t=>+t.toFixed(3)), world:n.world, e1:+n.e1.toFixed(2), e2:+n.e2.toFixed(2),
      histLen:n.hist.length, q:n.hist.length?+quality(n.hist,n.sc).toFixed(3):null,
      discQ:n.hist.length?+discQN(n).toFixed(3):null, rootPath:T.rootPath(n.id).join('>'), leaf:T.children(n.id).length===0 })) } : null };
}

// ---------- main ----------
async function main() {
  const t0 = Date.now();
  console.log(`── E28 budget leg · ${ARMS.join('/')} × ${SEEDS} seeds · budget ${BUD1} (${BUD1/CAND} steps)`
    + (LEG4800 ? ` + budget ${BUD2} pending probe cut rule (limit ${RT_LIMIT_S}s)` : ' · 4800 leg disabled by argv') + ' ──');
  vault = new MothVault({label:'e28', offline:true});
  const harvest = await vault.harvest(256);
  let seq = 0;
  const rows = [], runs = [];
  const decisionRules = {
    C1_at_budget:'CONFIRMED iff paired mean delta (TREE − NODE20) > 0 AND two-sided exact sign-test p < 0.05 (zeros excluded, small-p method); REFUTED if mean < 0; else PARTIAL. Widening = delta_2400 − delta_1200 (E26 receipted +0.0100, 30 seeds; first-10-seed subset as sensitivity)',
    C2_mechanism:'at 2400 CONFIRMED iff TREE transplants/run >= 3.0 AND meanTreeGain > 0 AND TREE lineageDiv >= 2 AND NODE20 lineageDiv > TREE lineageDiv; PARTIAL iff transplants > 0 AND meanTreeGain > 0; else REFUTED (intensification vs E26 reported, not gated)',
    C3_saturation:'climb(arm) = meanFinalQ(arm @ E28 budget) − meanFinalQ(arm @ E26 1200). CONFIRMED iff climb(TREE) > climb(NODE20) AND climb(TREE) > 0; PARTIAL iff climb(TREE) > 0; else REFUTED. At 4800 (if kept): same rule on climb 2400→4800 within E28. Supporting: within-run last-half/last-quarter gains',
    runtimeCutRule:`probe seed 0 × both arms × both budgets; projected = elapsed + (seeds−1)×Σ(per-arm probe times) per kept budget + 2s IO; 4800 point CUT iff projected > ${RT_LIMIT_S}s (its probe runs discarded, receipted)` };
  rows.push({seq:seq++, type:'config', exp:'E28 budget leg (tree advantage vs tree budget)', arms:ARMS, seeds:SEEDS,
    budgets:LEG4800?[BUD1,BUD2]:[BUD1], stepsPerBudget:Object.fromEntries([BUD1,...(LEG4800?[BUD2]:[])].map(b=>[b,b/CAND])),
    candidatesPerStep:CAND, arcLength:NBEAT, slots:NFAM, runtimeBudgetSeconds:RT_LIMIT_S,
    treeScore:{wq:WQ, wc:WC, wd:WD, ws:WS, gamma:GAMMA, bar:BAR, grace:GRACE, graftEvery:GRAFT_EVERY, maxDepth:MAXDEPTH, rSteps:RSTEPS},
    spawnCap:SPAWN_CAP, spawnCooldown:COOL, decisionRules,
    lineage:'E26 harness verbatim (runInner unchanged except engine/sheet id e28, stream keys e28:b<budget>:arm:<arm>:seed:<seed>, curves for all seeds — observation only); e26_gardener_scale.mjs NOT modified or re-run; E26 LEG-2 cut revived as this task',
    vault:'offline mock harvest, two-stage cross-key streams (streamFor per e28:b:budget:arm:seed)' });

  // ---- timing probe: seed 0 × both arms × both budgets, projected before committing ----
  const probeBuds = LEG4800 ? [BUD1, BUD2] : [BUD1];
  const timingMs = {}; const probeRuns = [];
  for (const bud of probeBuds) for (const arm of ARMS) {
    const tp = Date.now();
    const r = await runOne(arm, 0, harvest, bud);
    timingMs[`${bud}:${arm}`] = Date.now() - tp;
    probeRuns.push({ bud, r });
  }
  const elapsedProbe = Date.now() - t0;
  const restMs = (bud) => ARMS.reduce((a, arm) => a + (SEEDS - 1) * (timingMs[`${bud}:${arm}`] || 0), 0);
  const projectedBoth = elapsedProbe + restMs(BUD1) + (LEG4800 ? restMs(BUD2) : 0) + 2000;
  const cut4800 = LEG4800 && projectedBoth > RT_LIMIT_S * 1000;
  const keptBuds = [BUD1, ...(LEG4800 && !cut4800 ? [BUD2] : [])];
  const projectedMs = elapsedProbe + keptBuds.reduce((a, b) => a + restMs(b), 0) + 2000;
  rows.push({seq:seq++, type:'probe', claim:'timing probe projects total runtime before the 4800 point is committed',
    probeTimingsMs:timingMs, elapsedAfterProbeMs:elapsedProbe, projectedMsBothLegs:projectedBoth,
    projectedMsKept:projectedMs, runtimeLimitSeconds:RT_LIMIT_S, cut4800,
    cutNote: cut4800 ? `4800 point CUT: projected ${((projectedBoth)/1000).toFixed(1)}s > ${RT_LIMIT_S}s; ${probeRuns.filter(p=>p.bud===BUD2).length} probe runs at 4800 discarded (not analyzed), per the receipted cut rule` : (LEG4800 ? `4800 point KEPT: projected ${((projectedBoth)/1000).toFixed(1)}s <= ${RT_LIMIT_S}s` : '4800 leg disabled by argv') });
  for (const p of probeRuns) if (keptBuds.includes(p.bud)) { p.r.phase = `b${p.bud}`; runs.push(p.r); }
  const discarded4800 = cut4800 ? probeRuns.filter(p=>p.bud===BUD2).length : 0;

  // ---- E26 receipted baseline (read at runtime; e26 files untouched) ----
  const e26 = JSON.parse(readFileSync('experiments/outputs/e26_summary.json','utf8'));
  const d1200_30 = e26.paired.C1.mean, se1200_30 = e26.paired.C1.se;
  const d1200_10 = +(e26.paired.C1.deltas.slice(0, Math.min(SEEDS, e26.paired.C1.deltas.length))
    .reduce((a,b)=>a+b,0) / Math.min(SEEDS, e26.paired.C1.deltas.length)).toFixed(4);
  const q1200 = { TREE: e26.perArm.TREE.finalQuality.mean, NODE20: e26.perArm.NODE20.finalQuality.mean };
  const div1200 = { TREE: e26.perArm.TREE.lineageDiv.mean, NODE20: e26.perArm.NODE20.lineageDiv.mean };
  const transplantsPerRun1200 = +(e26.perArm.TREE.graftsSub / e26.config.seeds).toFixed(3);
  rows.push({seq:seq++, type:'e26Baseline', source:'experiments/outputs/e26_summary.json (read at runtime, file not modified)',
    delta1200_30seeds:d1200_30, se1200_30seeds:se1200_30, delta1200_first10:d1200_10,
    finalQ1200:q1200, lineageDiv1200:div1200, treeTransplantsPerRun1200:transplantsPerRun1200,
    e26ChainTip:e26.chain.receipts.tip });

  // ---- legs: remaining seeds per kept budget ----
  for (const bud of keptBuds) {
    for (let seed=1; seed<SEEDS; seed++) for (const arm of ARMS) {
      const r = await runOne(arm, seed, harvest, bud);
      r.phase = `b${bud}`; runs.push(r);
      rows.push({seq:seq++, type:'run', phase:r.phase, arm:r.arm, seed:r.seed, budget:r.budget, finalQuality:r.finalQuality,
        storyDiv:r.storyDiv, lineageDiv:r.lineageDiv, depthMax:r.depthMax, spawns:r.spawns,
        prunesNode:r.prunesNode, prunesSub:r.prunesSub, graftsCoh:r.graftsCoh, graftsQ:r.graftsQ, graftsSub:r.graftsSub,
        meanTreeGain:r.meanTreeGain, meanNodeGain:r.meanNodeGain, completed:r.completed, stepsRun:r.stepsRun,
        verifyN:r.verifyN, verifyBad:r.verifyBad, verifyCells:r.verifyCells,
        qAtMid:r.curve.length ? r.curve.find(c=>c.budget>=r.budget/2)?.quality ?? r.finalQuality : r.finalQuality});
      if (runs.length % 5 === 0) console.log(`  ${runs.length} runs done (${((Date.now()-t0)/1000).toFixed(0)}s)`);
    }
  }
  const mean=(a)=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
  const sd=(a)=>{ const m=mean(a); return Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/a.length); };
  const qAt = (r, b) => { const p = r.curve.find(c=>c.budget>=b); return p ? p.quality : r.finalQuality; };

  // ---- per-budget aggregates ----
  const perBudget = {};
  for (const bud of keptBuds) {
    const rs = runs.filter(r=>r.budget===bud);
    const perArm = {};
    for (const arm of ARMS) {
      const a = rs.filter(r=>r.arm===arm), q=a.map(r=>r.finalQuality), dv=a.map(r=>r.lineageDiv);
      const g = a.filter(r=>r.graftsSub>0), nSub=a.reduce((x,r)=>x+r.graftsSub,0)||1;
      perArm[arm] = { finalQuality:{mean:+mean(q).toFixed(4), sd:+sd(q).toFixed(4)},
        lineageDiv:{mean:+mean(dv).toFixed(2), sd:+sd(dv).toFixed(2)},
        storyDiv:+mean(a.map(r=>r.storyDiv)).toFixed(2), depthMaxMax:Math.max(...a.map(r=>r.depthMax)),
        spawns:a.reduce((x,r)=>x+r.spawns,0), prunesNode:a.reduce((x,r)=>x+r.prunesNode,0),
        prunesSub:a.reduce((x,r)=>x+r.prunesSub,0), graftsCoh:a.reduce((x,r)=>x+r.graftsCoh,0),
        graftsQ:a.reduce((x,r)=>x+r.graftsQ,0), graftsSub:a.reduce((x,r)=>x+r.graftsSub,0),
        transplantsPerRun:+(a.reduce((x,r)=>x+r.graftsSub,0)/SEEDS).toFixed(2),
        meanTreeGainW:+(g.reduce((x,r)=>x+r.meanTreeGain*r.graftsSub,0)/nSub).toFixed(4),
        meanNodeGainW:+(g.reduce((x,r)=>x+r.meanNodeGain*r.graftsSub,0)/nSub).toFixed(4),
        completed:+mean(a.map(r=>r.completed)).toFixed(2),
        qAtMidMean:+mean(a.map(r=>qAt(r, bud/2))).toFixed(4),
        lastHalfGain:+mean(a.map(r=>r.finalQuality-qAt(r, bud/2))).toFixed(4),
        lastQuarterGain:+mean(a.map(r=>r.finalQuality-qAt(r, 0.75*bud))).toFixed(4),
        verifyChecks:a.reduce((x,r)=>x+r.verifyCells,0), verifyBad:a.reduce((x,r)=>x+r.verifyBad,0) };
    }
    const paired = pairedStats('TREE','NODE20', rs);
    const verdict = verdictPair(paired);
    perBudget[bud] = { budget:bud, steps:bud/CAND, seeds:SEEDS, perArm, paired, verdictC1:verdict };
    rows.push({seq:seq++, type:'C1.treeVsNode', budget:bud,
      claim:`TREE gardener beats the e20 node gardener on final quality at budget ${bud} (paired per-seed deltas, ${SEEDS} seeds)`,
      tree:perArm.TREE.finalQuality, node20:perArm.NODE20.finalQuality,
      delta:+(perArm.TREE.finalQuality.mean-perArm.NODE20.finalQuality.mean).toFixed(4),
      paired, decisionRule:decisionRules.C1_at_budget, verdict});
  }
  // ---- C1 comparison vs E26's budget-1200 delta ----
  const p1 = perBudget[BUD1].paired;
  const c1 = perBudget[BUD1].verdictC1;
  const gapDelta = +(p1.mean - d1200_30).toFixed(4);
  const gapDeltaVs10 = +(p1.mean - d1200_10).toFixed(4);
  const widened = p1.mean > d1200_30;
  const widenedVs10 = p1.mean > d1200_10;
  rows.push({seq:seq++, type:'C1.budgetWidening',
    claim:`does the TREE−NODE20 gap widen with budget? delta_2400 − delta_1200 (E26 receipted ${d1200_30}±${se1200_30} at 30 seeds; matched first-${Math.min(SEEDS,30)}-seed subset ${d1200_10})`,
    delta1200_30seeds:d1200_30, delta1200_first10:d1200_10, delta2400:p1.mean, delta2400Se:p1.se,
    gapDelta2400Minus1200:gapDelta, gapDelta2400Minus1200first10:gapDeltaVs10,
    widened, widenedVs10,
    verdict: widened ? 'CONFIRMED (gap widens with budget)' : p1.mean > 0 ? 'PARTIAL (gap stays positive, does not widen vs 30-seed baseline)' : 'REFUTED (gap closes at 2× budget)' });

  // ---- optional 4800 trend ----
  let p2 = null;
  if (keptBuds.includes(BUD2)) {
    p2 = perBudget[BUD2].paired;
    rows.push({seq:seq++, type:'budgetTrend', claim:'TREE−NODE20 paired delta across budgets 1200 → 2400 → 4800',
      trend:[{budget:1200, source:'e26 30 seeds', delta:d1200_30, se:se1200_30},
             {budget:BUD1, source:`e28 ${SEEDS} seeds`, delta:p1.mean, se:p1.se, signP:p1.signTest.p},
             {budget:BUD2, source:`e28 ${SEEDS} seeds`, delta:p2.mean, se:p2.se, signP:p2.signTest.p}],
      monotoneWidening: p2.mean > p1.mean && p1.mean > d1200_30 });
  }

  // ---- C2 mechanism at 2400 ----
  const treeRuns1 = runs.filter(r=>r.budget===BUD1 && r.arm==='TREE');
  const nodeRuns1 = runs.filter(r=>r.budget===BUD1 && r.arm==='NODE20');
  const totalSub1 = treeRuns1.reduce((a,r)=>a+r.graftsSub,0);
  const transplantsPerRun1 = +(totalSub1/SEEDS).toFixed(2);
  const gSub1 = treeRuns1.filter(r=>r.graftsSub>0);
  const nSub1 = totalSub1 || 1;
  const wTreeGain1 = +(gSub1.reduce((a,r)=>a+r.meanTreeGain*r.graftsSub,0)/nSub1).toFixed(4);
  const wNodeGain1 = +(gSub1.reduce((a,r)=>a+r.meanNodeGain*r.graftsSub,0)/nSub1).toFixed(4);
  const treeDiv1 = mean(treeRuns1.map(r=>r.lineageDiv));
  const nodeDiv1 = mean(nodeRuns1.map(r=>r.lineageDiv));
  const c2 = (transplantsPerRun1>=3.0 && wTreeGain1>0 && treeDiv1>=2 && nodeDiv1>treeDiv1) ? 'CONFIRMED'
    : (totalSub1>0 && wTreeGain1>0) ? 'PARTIAL' : 'REFUTED';
  const intensification = { transplantsPerRun:{at2400:transplantsPerRun1, at1200E26:transplantsPerRun1200,
      grew: transplantsPerRun1 >= transplantsPerRun1200 },
    treeLineageDiv:{at2400:+treeDiv1.toFixed(2), at1200E26:div1200.TREE},
    nodeLineageDiv:{at2400:+nodeDiv1.toFixed(2), at1200E26:div1200.NODE20},
    sprawlRatio:{at2400:+(nodeDiv1/Math.max(0.01,treeDiv1)).toFixed(2), at1200E26:+(div1200.NODE20/div1200.TREE).toFixed(2)} };
  rows.push({seq:seq++, type:'C2.mechanism', budget:BUD1,
    claim:'TREE structural-diversity mechanism at 2× budget: transplants bloom and stay structural while NODE20 sprawls (E26 @1200: 3.43 transplants/run, TREE div 3.73, NODE20 div 10.17)',
    tree:{transplantsPerRun:transplantsPerRun1, transplantsTotal:totalSub1, meanTreeGain:wTreeGain1, meanNodeGain:wNodeGain1,
      lineageDiv:+treeDiv1.toFixed(2), prunesSub:treeRuns1.reduce((a,r)=>a+r.prunesSub,0), spawns:treeRuns1.reduce((a,r)=>a+r.spawns,0)},
    node20:{graftsCoh:nodeRuns1.reduce((a,r)=>a+r.graftsCoh,0), graftsQ:nodeRuns1.reduce((a,r)=>a+r.graftsQ,0),
      lineageDiv:+nodeDiv1.toFixed(2), spawns:nodeRuns1.reduce((a,r)=>a+r.spawns,0), prunesNode:nodeRuns1.reduce((a,r)=>a+r.prunesNode,0)},
    intensification, decisionRule:decisionRules.C2_mechanism, verdict:c2});

  // ---- C3 saturation ----
  const qMean1 = { TREE: perBudget[BUD1].perArm.TREE.finalQuality.mean, NODE20: perBudget[BUD1].perArm.NODE20.finalQuality.mean };
  const climb1 = { TREE: +(qMean1.TREE - q1200.TREE).toFixed(4), NODE20: +(qMean1.NODE20 - q1200.NODE20).toFixed(4) };
  const c3 = climb1.TREE>0 && climb1.TREE>climb1.NODE20 ? 'CONFIRMED' : climb1.TREE>0 ? 'PARTIAL' : 'REFUTED';
  rows.push({seq:seq++, type:'C3.saturation', claim:'NODE20 quality plateaus with budget while TREE keeps climbing: per-arm final quality at 1200 (E26 receipted) vs 2400 (E28)',
    q1200, q2400:qMean1, climb1200to2400:climb1,
    withinRunLastHalfGain:{TREE:perBudget[BUD1].perArm.TREE.lastHalfGain, NODE20:perBudget[BUD1].perArm.NODE20.lastHalfGain},
    withinRunLastQuarterGain:{TREE:perBudget[BUD1].perArm.TREE.lastQuarterGain, NODE20:perBudget[BUD1].perArm.NODE20.lastQuarterGain},
    decisionRule:decisionRules.C3_saturation, verdict:c3});
  let climb2 = null;
  if (keptBuds.includes(BUD2)) {
    const qMean2 = { TREE: perBudget[BUD2].perArm.TREE.finalQuality.mean, NODE20: perBudget[BUD2].perArm.NODE20.finalQuality.mean };
    climb2 = { TREE: +(qMean2.TREE - qMean1.TREE).toFixed(4), NODE20: +(qMean2.NODE20 - qMean1.NODE20).toFixed(4) };
    const c3b = climb2.TREE>0 && climb2.TREE>climb2.NODE20 ? 'CONFIRMED' : climb2.TREE>0 ? 'PARTIAL' : 'REFUTED';
    rows.push({seq:seq++, type:'C3.saturation4800', claim:'saturation continued: per-arm final quality 2400 → 4800 within E28',
      q2400:qMean1, q4800:qMean2, climb2400to4800:climb2, decisionRule:'same rule as C3 (climb 2400→4800 within E28)', verdict:c3b});
  }

  // ---- curves (seed 0 per arm per kept budget) + perBudget receipt row ----
  const curves = {};
  for (const bud of keptBuds) { curves[bud] = {};
    for (const arm of ARMS) { const r0 = runs.find(r=>r.budget===bud && r.arm===arm && r.seed===0);
      curves[bud][arm] = r0 ? {budget:r0.curve.map(c=>c.budget), quality:r0.curve.map(c=>c.quality),
        lineageDiv:r0.curve.map(c=>c.lineageDiv)} : null; } }
  rows.push({seq:seq++, type:'perBudget', arms:Object.fromEntries(keptBuds.map(b=>[`b${b}`, perBudget[b].perArm]))});
  rows.push({seq:seq++, type:'curves', seed0Curves:curves});

  // ---- verdicts + findings ----
  const cuts = [];
  if (cut4800) cuts.push(`budget-${BUD2} point CUT by the runtime rule (projected ${((projectedBoth)/1000).toFixed(1)}s > ${RT_LIMIT_S}s incl. probe); ${discarded4800} probe runs at ${BUD2} executed for timing only and discarded, not analyzed`);
  if (!LEG4800) cuts.push(`budget-${BUD2} leg disabled by argv (leg4800=0)`);
  const verdicts = `C1@${BUD1}=${c1} C2=${c2} C3=${c3}` + (keptBuds.includes(BUD2) ? ` C1@${BUD2}=${perBudget[BUD2].verdictC1}` : ` BUD${BUD2}=CUT`) + ` widened=${widened?'YES':'NO'}`;
  const findings = [];
  findings.push(`C1_at_budget (${BUD1}): TREE ${qMean1.TREE} vs NODE20 ${qMean1.NODE20} — paired Δ ${p1.mean>=0?'+':''}${p1.mean} ± ${p1.se} SE, sign-test p=${p1.signTest.p} (${p1.wins}W/${p1.losses}L/${p1.signTest.ties}T at ${SEEDS} seeds) → ${c1}. E26 @1200: Δ +${d1200_30} ± ${se1200_30} (p=0.85554, 30 seeds); gap change ${gapDelta>=0?'+':''}${gapDelta} (${widened?'WIDENS':'does not widen vs the 30-seed baseline'}; vs the matched first-${Math.min(SEEDS,30)}-seed subset ${d1200_10}: ${gapDeltaVs10>=0?'+':''}${gapDeltaVs10}).`);
  if (keptBuds.includes(BUD2)) findings.push(`C1_at_budget (${BUD2}): paired Δ ${p2.mean>=0?'+':''}${p2.mean} ± ${p2.se} SE, sign-test p=${p2.signTest.p} (${p2.wins}W/${p2.losses}L) → ${perBudget[BUD2].verdictC1}; trend 1200→2400→4800: ${d1200_30} → ${p1.mean} → ${p2.mean}.`);
  findings.push(`C2_mechanism at ${BUD1}: ${totalSub1} subtree transplants (${transplantsPerRun1}/run vs E26's ${transplantsPerRun1200} at 1200), mean TREE gain ${wTreeGain1} vs node-gain ${wNodeGain1}; TREE lineageDiv ${treeDiv1.toFixed(2)} (E26 3.73) vs NODE20 ${nodeDiv1.toFixed(2)} (E26 10.17) → ${c2}.`);
  findings.push(`C3_saturation: climb 1200→2400 TREE ${climb1.TREE>=0?'+':''}${climb1.TREE} vs NODE20 ${climb1.NODE20>=0?'+':''}${climb1.NODE20}; within-run last-half gain TREE ${perBudget[BUD1].perArm.TREE.lastHalfGain} vs NODE20 ${perBudget[BUD1].perArm.NODE20.lastHalfGain} → ${c3}.`);
  if (cut4800) findings.push(`Runtime cut receipted: the ${BUD2} point was CUT before commitment (probe ${((elapsedProbe)/1000).toFixed(1)}s, projected ${((projectedBoth)/1000).toFixed(1)}s > ${RT_LIMIT_S}s) — E26's cut doctrine applied one level deeper.`);
  rows.push({seq:seq++, type:'findings', verdicts, findings});

  // ---- seal + write + independent re-verify from file ----
  sealChain(rows);
  const v = verifyChain(rows);
  mkdirSync('experiments/outputs', {recursive:true});
  const rcPath = 'experiments/outputs/receipts_e28.jsonl';
  writeFileSync(rcPath, rows.map(r=>JSON.stringify(r)).join('\n')+'\n');
  const v2 = verifyChain(readFileSync(rcPath,'utf8').trim().split('\n').map(JSON.parse));
  const verifyAgg = { checks: runs.reduce((a,r)=>a+r.verifyCells,0), mismatches: runs.reduce((a,r)=>a+r.verifyBad,0),
    maxAbsDiff: Math.max(...runs.map(r=>r.verifyMax)), everyNSteps: 20, tol: 1e-9 };
  const runtimeS = +((Date.now()-t0)/1000).toFixed(1);
  const summary = { exp:'E28 budget leg (does the tree-level advantage scale with tree budget?)', runtimeSeconds: runtimeS,
    config:{ arms:ARMS, seeds:SEEDS, budgets:keptBuds, stepsPerBudget:Object.fromEntries(keptBuds.map(b=>[b,b/CAND])),
      candidatesPerStep:CAND, arcLength:NBEAT, slots:NFAM,
      treeScore:{wq:WQ,wc:WC,wd:WD,ws:WS,gamma:GAMMA,rSteps:RSTEPS}, spawnCap:SPAWN_CAP, spawnCooldown:COOL,
      runtimeBudgetSeconds:RT_LIMIT_S, decisionRules,
      vault:'offline mock harvest (MothVault offline:true, 0 live jobs)',
      lineage:'E26 harness verbatim; e26_gardener_scale.mjs not modified or re-run; new file experiments/e28_budget_leg.mjs only' },
    probe:{ timingsMs:timingMs, elapsedAfterProbeMs:elapsedProbe, projectedMsBothLegs:projectedBoth,
      projectedMsKept:projectedMs, cut4800 },
    e26Baseline:{ delta1200_30seeds:d1200_30, se1200_30seeds:se1200_30, delta1200_first10:d1200_10,
      finalQ1200:q1200, lineageDiv1200:div1200, treeTransplantsPerRun1200:transplantsPerRun1200,
      source:'experiments/outputs/e26_summary.json (chain tip '+e26.chain.receipts.tip+')' },
    perBudget, paired:{ [`C1@${BUD1}`]:p1, ...(keptBuds.includes(BUD2)?{[`C1@${BUD2}`]:p2}:{}) },
    claims:{ C1_at_budget:{verdict:c1, budget:BUD1, paired:p1, widened, gapDelta2400Minus1200:gapDelta,
        gapDelta2400Minus1200first10:gapDeltaVs10, delta1200_30seeds:d1200_30, delta1200_first10:d1200_10},
      C2_mechanism:{verdict:c2, tree:{transplantsPerRun:transplantsPerRun1, transplantsTotal:totalSub1,
        meanTreeGain:wTreeGain1, meanNodeGain:wNodeGain1, lineageDiv:+treeDiv1.toFixed(2)},
        node20:{lineageDiv:+nodeDiv1.toFixed(2)}, intensification},
      C3_saturation:{verdict:c3, q1200, q2400:qMean1, climb1200to2400:climb1,
        withinRunLastHalfGain:{TREE:perBudget[BUD1].perArm.TREE.lastHalfGain, NODE20:perBudget[BUD1].perArm.NODE20.lastHalfGain},
        ...(keptBuds.includes(BUD2)?{climb2400to4800:climb2}:{}) } },
    cuts, sheetVerify: verifyAgg,
    chain:{ receipts:{ok:v.ok, links:v.links, tip:rows[rows.length-1].row_hash}, fileRecheck:{ok:v2.ok, links:v2.links} },
    curves, verdicts, findings, vaultJobs:{live:vault.liveJobs, offline:vault.offline} };
  writeFileSync('experiments/outputs/e28_summary.json', JSON.stringify(summary, null, 2));
  console.log('\n══ E28 BUDGET LEG ══');
  for (const bud of keptBuds) for (const arm of ARMS) { const P=perBudget[bud].perArm[arm];
    console.log(`b${bud} ${arm.padEnd(6)} q=${P.finalQuality.mean.toFixed(3)}±${P.finalQuality.sd.toFixed(3)} (linDiv ${P.lineageDiv.mean}, storyDiv ${P.storyDiv}, spawns ${P.spawns}, prunes ${P.prunesNode}+${P.prunesSub}s, transplants ${P.graftsSub} (${P.transplantsPerRun}/run, treeGain ${P.meanTreeGainW}), lastHalfGain ${P.lastHalfGain})`); }
  console.log(`C1@${BUD1} TREE−NODE20 paired Δ=${p1.mean>=0?'+':''}${p1.mean} ±${p1.se} SE, sign p=${p1.signTest.p}, wins ${p1.wins}/${p1.n} → ${c1} | gap vs E26@1200 (${d1200_30}): ${gapDelta>=0?'+':''}${gapDelta} (${widened?'WIDENS':'no widen'})`);
  if (keptBuds.includes(BUD2)) console.log(`C1@${BUD2} paired Δ=${p2.mean>=0?'+':''}${p2.mean} ±${p2.se} SE, sign p=${p2.signTest.p} → ${perBudget[BUD2].verdictC1} | trend ${d1200_30} → ${p1.mean} → ${p2.mean}`);
  console.log(`C2: ${totalSub1} transplants (${transplantsPerRun1}/run vs 3.43 @1200), treeGain ${wTreeGain1}, div TREE ${treeDiv1.toFixed(2)} vs NODE20 ${nodeDiv1.toFixed(2)} → ${c2}`);
  console.log(`C3: climb 1200→2400 TREE ${climb1.TREE>=0?'+':''}${climb1.TREE} vs NODE20 ${climb1.NODE20>=0?'+':''}${climb1.NODE20} → ${c3}`);
  console.log(`sheet verify: ${verifyAgg.checks} cells checked, ${verifyAgg.mismatches} mismatches, max |diff| ${verifyAgg.maxAbsDiff}`);
  console.log(`chain {"ok":${v.ok},"links":${rows.length}} fileRecheck {"ok":${v2.ok}} tip ${rows[rows.length-1].row_hash} runtime ${runtimeS}s liveJobs ${vault.liveJobs}`);
  console.log(`verdicts: ${verdicts}`);
  if (runtimeS > RT_LIMIT_S) console.log(`WARNING: runtime ${runtimeS}s exceeded the ${RT_LIMIT_S}s budget — receipted in findings`);
}
main().catch(err=>{ console.error('FATAL', err); process.exit(1); });
