// quilt-murmur/murmur/spreader.mjs — the Spreader reborn: graph-of-thought as
// cell copying. A branch IS a copy of a sheet region (factor estimates + its
// own seed); pruning and grafting are the evolutionary operators.
//
//   branch(base, seed)  — copy the base factor estimates, jitter by the seed
//                         stream (Spreader doctrine: "copy a cell state and
//                         from that point change the seed slightly")
//   prune(cands, floor) — kill branches ranked last too long (selection)
//   graft(dst, src, ids)— transplant factor estimates from one branch into
//                         another (crossover of fruit across bloodlines)
//
// In engine terms: a branch's estimates are VALUE CELLS — copying is loadSheet
// with mutated defaults; grafting is set() with a receipt. The branch topology
// stays shared (same formula formulas), so diversity is STRUCTURED, not just
// re-rolled noise: every branch remains interpretable by the same cell grammar.

import { fnv1a64 } from './receipts.mjs';

let BRANCH_SEQ = 0;

export class Spreader {
  constructor({ jitter = 0.18 } = {}) {
    this.jitter = jitter;
    this.events = []; // receipt-ready spawn/prune/graft rows
  }

  // base: Map factorId -> estimate value.
  // rng: a per-branch stream (vault.streamFor — per-seed re-seeding protocol).
  // Returns { id, seed, est } — the harness writes est into the new branch's
  // value cells (the actual "cell copy" step happens in the sheet).
  branch(base, rng, { from = null, graftSrc = null, graftIds = [] } = {}) {
    const id = `b${++BRANCH_SEQ}`;
    const seed = fnv1a64([id, Date.now() % 1e9, Math.floor(rng() * 1e9)]);
    const est = new Map();
    for (const [k, v] of base) {
      // gaussian-ish jitter via sum of 3 uniforms (Irwin–Hall, ~N(0, σ))
      const u = (rng() + rng() + rng()) / 1.5 - 1; // in [-1, 1]-ish
      est.set(k, v * (1 + u * this.jitter));
    }
    // GRAFT: transplanted estimates override jitter — the fruit moves intact,
    // only the receiving branch's non-grafted factors keep the mutated copy.
    for (const g of graftIds) {
      if (graftSrc && graftSrc.est.has(g)) est.set(g, graftSrc.est.get(g));
    }
    const ev = {
      kind: graftIds.length ? 'graft.spawn' : 'spawn',
      branch: id,
      seed,
      from,
      graftSrc: graftSrc ? graftSrc.id : null,
      graftIds: [...graftIds],
      est: Object.fromEntries(est),
    };
    this.events.push(ev);
    return { id, seed, est, ev };
  }

  prune(cands, { floorStreak = 4, maxDead = 2 } = {}) {
    // cands: [{ id, streak, rank }] — prune the worst-ranked branches whose
    // last-place streak exceeds floorStreak, at most maxDead per generation.
    const doomed = cands
      .filter((c) => c.streak >= floorStreak)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, maxDead);
    for (const c of doomed) {
      this.events.push({ kind: 'prune', branch: c.id, streak: c.streak, rank: c.rank });
    }
    return doomed.map((c) => c.id);
  }

  graftPlan(deadBranch, survivors, trust, { maxGrafts = 2 }) {
    // Choose which factor estimates to transplant: the factors the mesh
    // TRUSTS MOST are the ones worth moving intact (trust guides the knife).
    const ranked = [...trust.weights().entries()].sort((a, b) => b[1] - a[1]).slice(0, maxGrafts).map((e) => e[0]);
    if (!survivors.length) return null;
    const src = survivors[Math.floor(Math.random() * survivors.length)];
    return { src, ids: ranked, from: deadBranch };
  }

  digest() {
    return fnv1a64(this.events);
  }
}
