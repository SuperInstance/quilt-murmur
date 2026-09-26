// E23 — THE WHOLE-TREE GARDENER (graph-of-thought over SUBTREES)
// ============================================================
// E20 C2b (receipted): coherence-gated graft selection saturates node
// coherence at 1.0, so coherence-raising transplants starve STRUCTURALLY;
// E20 C3: the 3-policy node bandit has no more signal. Diagnosis: the
// operators act on NODES but the objective lives at the TREE. E23 lifts
// prune/graft to SUBTREE level under a high-order goal (murmur/tree_ops.mjs):
//   T = wq·mean(γ^depth·leaf quality) + wc·canopyResonance
//     + wd·lineageDiversity − ws·mean(depth²)/budget
// Arms (paired seeds, e20 beat world, 400 steps, budget ×10 e15):
//   NOGARD single-path control · NODE20 the e20 champion re-implemented
//   (BOLD policy, node prune + quality-grafts, dead-slot spawn) · TREE
//   subtree operators accepted on the TREE score · TREEG ablation: same
//   operators accepted on NODE quality — isolates what the goal buys.
//   C1 TREE>NODE20 quality · C2 transplants bloom where node-coherence
//   grafts starve · C3 TREE vs TREEG gap · C4 interpretable lineage
//   receipts, diversity does NOT collapse to a single path.
// Design decisions receipted in code: est cells st{f}.e1/.e2 carry per-
// lineage estimates (spreader.branch jitter + evidence refresh) into the
// score/discriminator; spawn is permission-gated, the acceptance signal
// only chooses the parent; one transplant per scan (e20 style).
// Run: node experiments/e23_tree_gardener.mjs [seeds] [budget]

import { QuiltEngine } from '../engine/dist/index.js';
import { Gardener } from '../murmur/gardener.mjs';
import { Resonance, agreementMatrix } from '../murmur/resonance.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { sealChain, verifyChain } from '../murmur/receipts.mjs';
import { HedgeTrust } from '../murmur/trust.mjs';
import { Spreader } from '../murmur/spreader.mjs';
import { Tree, scoreTree, graftView, spawnView, pruneSubtree, graftSubtree, spawnUnder } from '../murmur/tree_ops.mjs';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';

// ---------- story grammar (identical to E15/E20) ----------
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
// ---------- E23 constants ----------
const NFAM = 12, CAND = 3;
const BUDGET = Number(process.argv[3] || 1200); // ×10 E15
const SPAWN_CAP = 20, COOL = 10;
const SEEDS = Number(process.argv[2] || 10);
const ARMS = ['NOGARD','NODE20','TREE','TREEG'];
const GAMMA = 0.97, WQ = 1, WC = 0.25, WD = 0.05, WS = 2, BAR = 0.75, GRACE = 15;
const GRAFT_EVERY = 10, MAXDEPTH = 6, RSTEPS = 6, TOPP = 6;
const SCORE = { wq: WQ, wc: WC, wd: WD, ws: WS, budget: BUDGET, gamma: GAMMA, rSteps: RSTEPS };
const clamp = (x,a,b)=>Math.min(b,Math.max(a,x));

// ---------- sheet: per-family trait/est value cells + score formulas ----------
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
  return { id:'e23', cells };
}

// ---------- harness-side story math (e20) + reference mirrors ----------
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

// ---------- one season ----------
async function runOne(arm, seed, harvest) {
  const rng = vault.streamFor(harvest, `arm:${arm}:seed:${seed}`);
  const origRandom = Math.random;
  Math.random = rng; // gardener/spreader epsilon explore rides the vault stream
  try { return await runInner(arm, seed, rng); }
  finally { Math.random = origRandom; }
}
async function runInner(arm, seed, rng) {
  const e = new QuiltEngine('e23', {}); e.loadSheet(sheet());
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
  let spawns=0, budget=0, step=0, sinceSpawn=99, prevBest=0, nextT=120, verifyN=0, verifyBad=0, verifyCells=0;
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

  while (budget < BUDGET) {
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
        if (Math.abs((await e.get(`cand.s${k}`)).data - refScore(fam, pb)) > 1e-9) verifyBad++;
      }
      for (const n of T.alive()) { verifyCells++;
        if (Math.abs((await e.get(`st${n.slot}.fit`)).data - refFit(n)) > 1e-9) verifyBad++; }
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
    if (seed===0) while (budget>=nextT && nextT<=BUDGET) {
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
    completed:pool.length, stepsRun:step, verifyN, verifyBad, verifyCells, curve,
    treeT: isTree ? +scoreTree(viewOf(), quality, SCORE).T.toFixed(4) : null,
    opsLog: {graftsSub, prunesSub:prunesSub.map(p=>({step:p.step, root:p.root, killed:p.killed.length, subMean:p.subMean})), graftsCoh, graftsQ, spawnSteps},
    treeDump: arm==='TREE' ? { diversity:T.lineageDiversity(), nodes:T.alive().map(n=>({ id:n.id, parent:n.parent, depth:n.depth,
      traits:n.traits.map(t=>+t.toFixed(3)), world:n.world, e1:+n.e1.toFixed(2), e2:+n.e2.toFixed(2),
      histLen:n.hist.length, q:n.hist.length?+quality(n.hist,n.sc).toFixed(3):null,
      discQ:n.hist.length?+discQN(n).toFixed(3):null, rootPath:T.rootPath(n.id).join('>'), leaf:T.children(n.id).length===0 })) } : null };
}

// ---------- main ----------
async function main() {
  console.log(`── E23 whole-tree gardener · ${SEEDS} seeds × ${BUDGET} budget (${BUDGET/CAND} steps) × ${ARMS.length} arms ──`);
  const t0 = Date.now();
  vault = new MothVault({label:'e23', offline:true});
  const harvest = await vault.harvest(256);
  const rows=[], runs=[]; let seq=0;
  rows.push({seq:seq++, type:'config', exp:'E23 whole-tree gardener', arms:ARMS, seeds:SEEDS,
    budgetPerArm:BUDGET, stepsPerSeason:BUDGET/CAND, candidatesPerStep:CAND, arcLength:NBEAT, slots:NFAM,
    treeScore:{wq:WQ, wc:WC, wd:WD, ws:WS, gamma:GAMMA, bar:BAR, grace:GRACE, graftEvery:GRAFT_EVERY, maxDepth:MAXDEPTH, rSteps:RSTEPS},
    spawnCap:SPAWN_CAP, spawnCooldown:COOL, lineage:'E20 world + est cells e1/e2; subtree operators under TREE score',
    vault:'offline mock harvest, two-stage cross-key streams'});
  for (const arm of ARMS) for (let seed=0; seed<SEEDS; seed++) {
    const r = await runOne(arm, seed, harvest);
    runs.push(r);
    rows.push({seq:seq++, type:'run', arm:r.arm, seed:r.seed, budget:r.budget, finalQuality:r.finalQuality,
      storyDiv:r.storyDiv, lineageDiv:r.lineageDiv, depthMax:r.depthMax, spawns:r.spawns,
      prunesNode:r.prunesNode, prunesSub:r.prunesSub, graftsCoh:r.graftsCoh, graftsQ:r.graftsQ, graftsSub:r.graftsSub,
      meanTreeGain:r.meanTreeGain, meanNodeGain:r.meanNodeGain, meanCohGain:r.meanCohGain, meanQGain:r.meanQGain,
      completed:r.completed, stepsRun:r.stepsRun, verifyN:r.verifyN, verifyBad:r.verifyBad, treeT:r.treeT,
      ops_log:r.opsLog});
    if (runs.length % 10 === 0) console.log(`  ${runs.length}/${ARMS.length*SEEDS} runs done (${((Date.now()-t0)/1000).toFixed(0)}s)`);
  }
  const mean=(a)=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
  const sd=(a)=>{ const m=mean(a); return Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/a.length); };
  const perArm={};
  for (const arm of ARMS) {
    const rs=runs.filter(r=>r.arm===arm), q=rs.map(r=>r.finalQuality), dv=rs.map(r=>r.lineageDiv);
    perArm[arm]={ finalQuality:{mean:+mean(q).toFixed(4), sd:+sd(q).toFixed(4)},
      lineageDiv:{mean:+mean(dv).toFixed(2), sd:+sd(dv).toFixed(2)},
      storyDiv:+mean(rs.map(r=>r.storyDiv)).toFixed(2), depthMaxMax:Math.max(...rs.map(r=>r.depthMax)),
      spawns:rs.reduce((a,r)=>a+r.spawns,0), prunesNode:rs.reduce((a,r)=>a+r.prunesNode,0),
      prunesSub:rs.reduce((a,r)=>a+r.prunesSub,0), graftsCoh:rs.reduce((a,r)=>a+r.graftsCoh,0),
      graftsQ:rs.reduce((a,r)=>a+r.graftsQ,0), graftsSub:rs.reduce((a,r)=>a+r.graftsSub,0),
      meanTreeGain:+mean(rs.filter(r=>r.graftsSub>0).map(r=>r.meanTreeGain)).toFixed(4),
      meanNodeGain:+mean(rs.filter(r=>r.graftsSub>0).map(r=>r.meanNodeGain)).toFixed(4),
      completed:+mean(rs.map(r=>r.completed)).toFixed(2),
      verifyChecks:rs.reduce((a,r)=>a+r.verifyCells,0), verifyBad:rs.reduce((a,r)=>a+r.verifyBad,0) };
  }
  const curve={}; for (const arm of ARMS) { const r0=runs.find(r=>r.arm===arm&&r.seed===0);
    curve[arm]={budget:r0.curve.map(c=>c.budget), quality:r0.curve.map(c=>c.quality), lineageDiv:r0.curve.map(c=>c.lineageDiv)}; }
  // ---- claims ----
  const se=(a,b)=>Math.sqrt(perArm[a].finalQuality.sd**2/SEEDS + perArm[b].finalQuality.sd**2/SEEDS);
  // paired-seed stats (the spec pairs seeds; reported alongside the conservative arm-level 2SE rule)
  const paired=(a,b)=>{ const qa=runs.filter(r=>r.arm===a).sort((x,y)=>x.seed-y.seed).map(r=>r.finalQuality);
    const qb=runs.filter(r=>r.arm===b).sort((x,y)=>x.seed-y.seed).map(r=>r.finalQuality);
    const df=qa.map((v,i)=>v-qb[i]); const m=mean(df); const s=Math.sqrt(mean(df.map(x=>(x-m)**2)));
    return {meanDiff:+m.toFixed(4), twoSEpaired:+(2*s/Math.sqrt(df.length)).toFixed(4), wins:df.filter(x=>x>0).length+'/'+df.length}; };
  const cmp=(a,b)=>{ const d=perArm[a].finalQuality.mean-perArm[b].finalQuality.mean;
    return d > 2*se(a,b) ? 'CONFIRMED' : d > 0 ? 'PARTIAL' : 'REFUTED'; };
  const c1 = cmp('TREE','NODE20');
  const cB = {cohGrafts:perArm.NODE20.graftsCoh, meanCohGain:perArm.NODE20.graftsCoh?mean(runs.filter(r=>r.arm==='NODE20'&&r.graftsCoh>0).map(r=>r.meanCohGain)):0,
    qGrafts:perArm.NODE20.graftsQ, meanQGain:perArm.NODE20.graftsQ?mean(runs.filter(r=>r.arm==='NODE20'&&r.graftsQ>0).map(r=>r.meanQGain)):0};
  const gC = runs.filter(r=>r.arm==='TREE'&&r.graftsSub>0);
  const nSub = gC.reduce((a,r)=>a+r.graftsSub,0) || 1;
  const cC = {subGrafts:perArm.TREE.graftsSub, perRun:+(perArm.TREE.graftsSub/SEEDS).toFixed(2),
    meanTreeGain:+(gC.reduce((a,r)=>a+r.meanTreeGain*r.graftsSub,0)/nSub).toFixed(4),
    meanNodeGain:+(gC.reduce((a,r)=>a+r.meanNodeGain*r.graftsSub,0)/nSub).toFixed(4)};
  const c2 = cC.subGrafts>=5 && cC.meanTreeGain>0 ? 'CONFIRMED' : cC.subGrafts>0 && cC.meanTreeGain>0 ? 'PARTIAL' : 'REFUTED';
  const c3 = cmp('TREE','TREEG');
  const p1 = paired('TREE','NODE20'), p3 = paired('TREE','TREEG');
  const divOk = runs.filter(r=>r.arm==='TREE'&&r.seed===0);
  const c4 = perArm.TREE.lineageDiv.mean>=2 && divOk.length && divOk[0].curve.filter(c=>c.lineageDiv>=2).length >= 0.8*divOk[0].curve.length
    ? 'CONFIRMED' : perArm.TREE.lineageDiv.mean>=2 ? 'PARTIAL' : 'REFUTED';
  rows.push({seq:seq++, type:'C1.treeVsNode', claim:'TREE gardener beats the e20 node gardener on final quality at equal budget',
    tree:perArm.TREE.finalQuality, node20:perArm.NODE20.finalQuality, delta:+(perArm.TREE.finalQuality.mean-perArm.NODE20.finalQuality.mean).toFixed(4),
    twoSE:+(2*se('TREE','NODE20')).toFixed(4), paired:p1, verdict:c1});
  rows.push({seq:seq++, type:'C2.transplantsBloom', claim:'subtree transplants bloom where node-coherence grafts starve (accepted grafts with nonzero TREE gain on a saturated-coherence canopy)',
    node20:cB, tree:cC, note:'TREE transplants carry ~zero node-quality gain but positive TREE gain — the headroom lives in diversity/coherence/depth, invisible at node level', verdict:c2});
  rows.push({seq:seq++, type:'C3.highOrderGoal', claim:'the high-order goal matters: TREE-score acceptance vs node-quality acceptance (same operators)',
    tree:perArm.TREE.finalQuality, treeg:perArm.TREEG.finalQuality, delta:+(perArm.TREE.finalQuality.mean-perArm.TREEG.finalQuality.mean).toFixed(4),
    twoSE:+(2*se('TREE','TREEG')).toFixed(4), paired:p3, verdict:c3});
  const bestTree = runs.filter(r=>r.arm==='TREE').sort((a,b)=>b.finalQuality-a.finalQuality)[0];
  rows.push({seq:seq++, type:'C4.lineageReceipts', claim:'lineage receipts are interpretable: final tree of the best seed (nodes/depths/root-paths) + lineageDiversity does not collapse to a single path',
    bestSeed:bestTree.seed, bestQuality:bestTree.finalQuality, finalDiv:bestTree.lineageDiv,
    divOverTime:divOk[0].curve.map(c=>c.lineageDiv), meanFinalDivTree:perArm.TREE.lineageDiv.mean,
    meanFinalDivNode20:perArm.NODE20.lineageDiv.mean, meanFinalDivTreeg:perArm.TREEG.lineageDiv.mean, verdict:c4});
  rows.push({seq:seq++, type:'perArm', arms:perArm});
  rows.push({seq:seq++, type:'curves', curves:curve});
  rows.push({seq:seq++, type:'bestTree', arm:'TREE', seed:bestTree.seed, T:bestTree.treeT, tree:bestTree.treeDump});
  const verdicts = `C1=${c1} C2=${c2} C3=${c3} C4=${c4}`;
  const hypothesis = c1!=='REFUTED' && c2!=='REFUTED'
    ? 'Mechanism: lifting the operators to SUBTREE level opens the headroom node metrics lack — a transplant changes no node\'s own history, only root-path diversity, depth (γ^depth discount) and structure-aware lineage coupling, so TREE-positive moves exist on a canopy whose node coherence is saturated; the high-order acceptance goal converts them into quality.'
    : 'Mechanism: see claim rows — the tree view alone does not guarantee headroom converts to quality; the receipted split (C1–C4) localizes where it did not.';
  rows.push({seq:seq++, type:'findings', verdicts, hypothesis,
    perArmMean:Object.fromEntries(ARMS.map(a=>[a, perArm[a].finalQuality.mean]))});
  sealChain(rows);
  const v = verifyChain(rows);
  mkdirSync('experiments/outputs', {recursive:true});
  const rcPath = 'experiments/outputs/receipts_e23.jsonl';
  writeFileSync(rcPath, rows.map(r=>JSON.stringify(r)).join('\n')+'\n');
  // independent re-verification from the written file
  const v2 = verifyChain(readFileSync(rcPath,'utf8').trim().split('\n').map(JSON.parse));
  const summary = { exp:'E23 whole-tree gardener', elapsedMs:Date.now()-t0, perArm, claims:{C1:{verdict:c1, paired:p1},
    C2:{verdict:c2, node20:cB, tree:cC}, C3:{verdict:c3, paired:p3},
    C4:{verdict:c4, bestSeed:bestTree.seed, divOverTime:divOk[0].curve.map(c=>c.lineageDiv)}},
    curve, bestSeedTree:{arm:'TREE', seed:bestTree.seed, T:bestTree.treeT, tree:bestTree.treeDump},
    verify:{checks:runs.reduce((a,r)=>a+r.verifyCells,0), mismatches:runs.reduce((a,r)=>a+r.verifyBad,0), everyNSteps:20, tol:1e-9},
    chain:{receipts:{ok:v.ok, links:v.links, tip:rows[rows.length-1].row_hash}, fileRecheck:{ok:v2.ok, links:v2.links}},
    verdicts, hypothesis, vaultJobs:{live:0, mock:vault.offline} };
  writeFileSync('experiments/outputs/e23_summary.json', JSON.stringify(summary, null, 2));
  console.log('\n══ E23 WHOLE-TREE GARDENER ══');
  for (const arm of ARMS) { const P=perArm[arm];
    console.log(`${arm.padEnd(7)} q=${P.finalQuality.mean.toFixed(3)}±${P.finalQuality.sd.toFixed(3)} (linDiv ${P.lineageDiv.mean}, storyDiv ${P.storyDiv}, spawns ${P.spawns}, prunes ${P.prunesNode}+${P.prunesSub}s, grafts ${P.graftsCoh}c+${P.graftsQ}q+${P.graftsSub}sub, treeGain ${P.meanTreeGain})`); }
  console.log(`sheet verify: ${summary.verify.checks} cells checked, ${summary.verify.mismatches} mismatches`);
  console.log(`chain {"ok":${v.ok},"links":${rows.length}} fileRecheck {"ok":${v2.ok}} tip ${rows[rows.length-1].row_hash} elapsed ${((Date.now()-t0)/1000).toFixed(0)}s`);
  console.log(`verdicts: ${verdicts}`);
  console.log(`TIP: ${hypothesis}`);
}
main().catch(err=>{ console.error('FATAL', err); process.exit(1); });
