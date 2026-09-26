// quilt-murmur/murmur/tree_ops.mjs — E23: the WHOLE-TREE gardener's lifted
// operators. E20's receipted diagnosis: node-level operators act on single
// branches while the objective lives at the tree; legality-gated selection
// saturates node coherence at 1.0, so coherence-raising transplants starve
// STRUCTURALLY (E20 C2b) and the 3-policy node bandit has no signal left
// (E20 C3). The lift — operators act on SUBTREES, acceptance on the TREE:
//
//   T = wq·mean(γ^depth · quality over alive leaves WITH history)
//     + wc·canopyResonance + wd·lineageDiversity − ws·mean(depth²)/budget
//
//   pruneSubtree — kill a node AND its descent (their lineage identity dies);
//                  surviving siblings get re-parented metric credit (their
//                  failing streak eases — less competition for the parent).
//   graftSubtree — re-root a whole subtree under a different parent. This
//                  changes NO node's own history: only root-path DIVERSITY,
//                  DEPTH and lineage coupling move — exactly the quantities
//                  with headroom (E20's own lesson: change the SIGNAL when a
//                  metric saturates). Accept iff T rises on the candidate
//                  topology (cheap: the tree is ≤ 12 nodes).
//   spawnUnder   — jittered copy of a promising node as a fresh CHILD
//                  (spreader.branch; the receipt IS the lineage edge).
//
// canopyResonance is the E23 twist on the e20 recipe: Kuramoto coupling is
// STRUCTURE-AWARE, a_ij = traitAgree(i,j)·0.9^graphDist(i,j), 0 across
// forests — lineage faults tear the canopy, so "re-root where lineage
// coherence improves" is a real gradient instead of a saturated constant.
//
// The γ^depth discount IS the spec's depthPenalty implementation (inherited
// estimates fade with lineage distance from the root unless refreshed by new
// evidence); −ws·mean(depth²)/budget is kept as the explicit normalized term.

import { Resonance, agreementMatrix } from './resonance.mjs';

export class Tree {
  constructor({ gamma = 0.97 } = {}) { this.gamma = gamma; this.nodes = new Map(); }
  add(n) { this.nodes.set(n.id, n); return n; }
  get(id) { return this.nodes.get(id); }
  alive() { const a = []; for (const n of this.nodes.values()) if (n.alive) a.push(n); return a; }
  children(id) { return this.alive().filter((n) => n.parent === id); }
  subtree(id) { const out = []; const walk = (n) => { out.push(n); for (const c of this.children(n.id)) walk(c); }; const r = this.get(id); if (r && r.alive) walk(r); return out; }
  parentOf(id) { const n = this.get(id); return n && n.parent != null ? this.get(n.parent) : null; }
  rootPath(id) { const p = []; let n = this.get(id); while (n) { p.unshift(n.id); n = n.parent != null ? this.get(n.parent) : null; } return p; }
  height(id) { const sub = this.subtree(id); return sub.length ? Math.max(...sub.map((n) => n.depth)) - this.get(id).depth : 0; }
  inSubtree(rootId, id) { return this.subtree(rootId).some((n) => n.id === id); }
  leaves() { return this.alive().filter((n) => this.children(n.id).length === 0); }
  // distinct root-paths among alive leaves. In a pure tree every leaf's path
  // is unique, so this equals the alive-leaf count — the ANTI-COLLAPSE
  // quantity (greedy breeding collapses it to 1); the dedup keeps the metric
  // correct if lineage edges ever form a DAG (shared graft ancestry).
  lineageDiversity() { return new Set(this.leaves().map((n) => this.rootPath(n.id).join('>'))).size; }
  lcaDist(a, b) { const pa = this.rootPath(a), pb = this.rootPath(b); let i = 0; while (i < pa.length && i < pb.length && pa[i] === pb[i]) i++; if (!i) return null; return this.get(a).depth + this.get(b).depth - 2 * this.get(pa[i - 1]).depth; }
}

// view: snapshots of alive nodes {id, parent, depth, traits, hist, sc, tf}
// qualityFn: (hist, sc) -> node quality (the story math stays in the harness;
// the tree module stays world-agnostic). Candidate topologies are evaluated
// on cloned views — no mutation, so before/after T is a pure comparison.
export function scoreTree(view, qualityFn, { wq = 1, wc = 0.25, wd = 0.05, ws = 2, budget = 1200, gamma = 0.97, rSteps = 6 } = {}) {
  const idx = new Map(view.map((n, i) => [n.id, i]));
  const paths = view.map((n) => { const p = [n.id]; let cur = n.parent; while (cur != null && idx.has(cur)) { p.unshift(cur); cur = view[idx.get(cur)].parent; } return p; });
  const leaves = view.filter((n) => !view.some((m) => m.parent === n.id));
  const leafQ = leaves.filter((n) => n.hist.length).map((n) => Math.pow(gamma, n.depth) * qualityFn(n.hist, n.sc));
  const leafMean = leafQ.length ? leafQ.reduce((a, b) => a + b, 0) / leafQ.length : 0;
  const div = new Set(leaves.map((n) => paths[idx.get(n.id)].join('>'))).size;
  const meanD2 = view.length ? view.reduce((a, n) => a + n.depth * n.depth, 0) / view.length : 0;
  const A = agreementMatrix(view.map((n) => n.traits), view.map(() => 1));
  const agree = (i, j) => {
    if (i === j) return 0;
    const pi = paths[i], pj = paths[j];
    let k = 0; while (k < pi.length && k < pj.length && pi[k] === pj[k]) k++;
    if (!k) return 0; // different forests: no lineage coupling
    const d = view[i].depth + view[j].depth - 2 * view[idx.get(pi[k - 1])].depth;
    return A[i][j] * Math.pow(0.9, d);
  };
  let r = 1;
  if (view.length > 1) {
    r = new Resonance(view.map((n) => Math.PI * (1 + (n.tf ?? 0)) / 2),
      view.map((n) => 0.1 * ((n.tf ?? 0.5) - 0.5)), agree).step(0.1, 1.2, rSteps);
  }
  return { T: wq * leafMean + wc * r + wd * div - (ws * meanD2) / budget, r, leafMean, div, meanD2 };
}

// candidate view: move the subtree rooted at xId under pId (pure).
export function graftView(view, xId, pId) {
  const v2 = view.map((n) => ({ ...n }));
  const x = v2.find((n) => n.id === xId), p = v2.find((n) => n.id === pId);
  if (!x || !p) return null;
  const base = p.depth + 1, oldDepth = x.depth;
  const offs = new Map();
  const collect = (n, off) => { offs.set(n.id, off); for (const m of v2) if (m.parent === n.id) collect(m, off + 1); };
  collect(x, 0);
  // GAUNTLET FIX (22-c): pId inside x's own subtree would create a parent
  // cycle in the candidate view — silent topology corruption whose path walk
  // in scoreTree never terminates. Reject with the same contract as a missing
  // node (null); callers already skip null candidates.
  if (offs.has(pId)) return null;
  for (const n of v2) if (offs.has(n.id)) { if (offs.get(n.id) === 0) n.parent = pId; n.depth = base + offs.get(n.id); }
  return { view: v2, moved: offs.size, rootDepthDelta: base - oldDepth };
}

// candidate view: spawn a fresh child under pId (pure).
export function spawnView(view, pId, childId, traits) {
  const v2 = view.map((n) => ({ ...n }));
  const p = v2.find((n) => n.id === pId);
  if (!p) return null;
  v2.push({ id: childId, parent: pId, depth: p.depth + 1, traits, hist: [], sc: [], tf: 0 });
  return v2;
}

// kill node + descent; surviving siblings get re-parented metric credit.
export function pruneSubtree(T, id) {
  const par = T.parentOf(id);
  const sibs = par ? T.children(par.id).filter((c) => c.id !== id) : [];
  const killed = T.subtree(id).map((n) => n.id);
  for (const n of T.subtree(id)) n.alive = 0;
  for (const s of sibs) s.subFail = Math.max(0, (s.subFail || 0) - 1);
  return { killed, siblings: sibs.map((s) => s.id) };
}

// re-root the subtree at id under newParentId; depths inside the moving
// subtree shift by the re-rooting delta (sheet depth cells updated by caller).
export function graftSubtree(T, id, newParentId) {
  const n = T.get(id); const oldParent = n.parent;
  const sub = T.subtree(id); const offs = sub.map((m) => m.depth - n.depth);
  const oldRootDepth = n.depth;
  // GAUNTLET FIX (22-c): re-rooting into one's own subtree creates a parent
  // cycle (a.parent=b, b.parent=a) — the tree is silently corrupted and
  // rootPath()/lineageDiversity() loop FOREVER (receipted: child-process repro
  // hung until killed). Fail safe: throw. No legal caller hits this —
  // acceptance-scoring callers evaluate candidates via graftView, which now
  // rejects the same case with null.
  if (sub.some((m) => m.id === newParentId)) throw new Error(`graftSubtree: ${newParentId} is inside the subtree of ${id} — illegal re-root (cycle)`);
  n.parent = newParentId; const base = T.get(newParentId).depth + 1;
  sub.forEach((m, i) => { m.depth = base + offs[i]; });
  return { node: id, oldParent, newParent: newParentId, moved: sub.length, rootDepthDelta: n.depth - oldRootDepth };
}

// jittered copy of parentNode as a fresh CHILD — spreader.branch's receipt
// (ev.kind 'spawn', ev.from = parent) is the lineage edge, recorded forever.
export function spawnUnder(T, parentNode, { id, slot, spreader, rng }) {
  const base = new Map([['cour', parentNode.traits[0]], ['wis', parentNode.traits[1]], ['cha', parentNode.traits[2]], ['e1', parentNode.e1], ['e2', parentNode.e2]]);
  const br = spreader.branch(base, rng, { from: parentNode.id });
  const cl = (x, a, b) => Math.min(b, Math.max(a, x));
  return T.add({ id, slot, parent: parentNode.id, depth: parentNode.depth + 1,
    traits: [br.est.get('cour'), br.est.get('wis'), br.est.get('cha')].map((t) => cl(t, 0.05, 0.95)),
    world: parentNode.world, e1: cl(br.est.get('e1'), 0.05, 0.95), e2: cl(br.est.get('e2'), 0.3, 1.2),
    hist: [], sc: [], streak: 0, subFail: 0, subMean: 1, age: 0, alive: 1, done: false, spawnEv: br.ev });
}
