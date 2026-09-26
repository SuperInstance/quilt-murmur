// quilt-murmur/murmur/trust.mjs — trust as online learning (Hedge / multiplicative
// weights with fixed-share). This is the mesh's answer to nexus-git-agent's
// behavior-based trust engine, promoted from hand-tuned scores to a regret-
// bounded learner.
//
// Math: w_i(t+1) = ((1-α)·w_i(t) + α/N) · exp(ε·r_i(t)), then normalize.
//   - ε (eta)     learning rate: how fast trust moves on one reward
//   - α (share)   fixed-share: forgets regime flips; tracks non-stationary
//                 experts (Herbster & Warmuth). Without it trust saturates
//                 and a factor that turns bad keeps its crown forever.
// Regret guarantee: vs best fixed expert O(√(T ln N)/ε); fixed-share tracks
// the best SHIFTING expert with O(√(T·S·ln N)) where S = shifts.
//
// In the mesh, the "experts" are FACTOR CELLS (endorsement voices) and
// MURMUR SENDERS. Trust weights are written back into trust cells so the
// sheet's own formulas consume them — the learning lives outside, the
// inference lives inside.

export class HedgeTrust {
  // ids: expert ids. opts: eta (default 0.35), share (default 0.03)
  constructor(ids, { eta = 0.35, share = 0.03 } = {}) {
    this.ids = [...ids];
    this.eta = eta;
    this.share = share;
    this.w = new Map(ids.map((id) => [id, 1 / ids.length]));
    this.history = []; // per-step weight snapshots (post-normalize)
    this.updates = 0;
  }

  weights() {
    return new Map(this.w);
  }

  // Overwrite the trust state with the given map (e.g. a protocol layer's
  // penalized weights). Missing ids keep their weight; values renormalized.
  absorb(m) {
    for (const [id, v] of m) if (this.w.has(id)) this.w.set(id, v);
    const Z = [...this.w.values()].reduce((a, b) => a + b, 0) || 1;
    for (const id of this.ids) this.w.set(id, this.w.get(id) / Z);
    return this.weights();
  }

  weight(id) {
    return this.w.get(id) ?? 0;
  }

  // rewards: Map id -> r in [0,1] (1 = this expert predicted well).
  update(rewards) {
    const N = this.ids.length;
    let maxLog = -Infinity;
    const raw = new Map();
    for (const id of this.ids) {
      // fixed-share blend toward uniform BEFORE the exponential reweight
      const blended = (1 - this.share) * this.w.get(id) + (this.share / N);
      const r = Math.min(1, Math.max(0, rewards.get(id) ?? 0.5));
      const lg = Math.log(blended) + this.eta * r;
      raw.set(id, lg);
      if (lg > maxLog) maxLog = lg;
    }
    let Z = 0;
    for (const id of this.ids) {
      const v = Math.exp(raw.get(id) - maxLog); // stable softmax-style
      this.w.set(id, v);
      Z += v;
    }
    for (const id of this.ids) this.w.set(id, this.w.get(id) / Z);
    this.history.push(new Map(this.w));
    this.updates++;
    return this.weights();
  }

  // normalized Shannon entropy of the weight vector, 0..1.
  // Low entropy = the mesh has OPINIONS about who to trust.
  // High entropy = uniform skepticism (nothing proven yet).
  entropy() {
    let H = 0;
    for (const id of this.ids) {
      const p = this.w.get(id);
      if (p > 1e-12) H -= p * Math.log(p);
    }
    return H / Math.log(this.ids.length);
  }

  // leader = the expert the mesh currently trusts most (with margin)
  leader() {
    const sorted = [...this.w.entries()].sort((a, b) => b[1] - a[1]);
    return { id: sorted[0][0], w: sorted[0][1], margin: sorted[0][1] - (sorted[1]?.[1] ?? 0) };
  }

  snapshot() {
    return Object.fromEntries(this.ids.map((id) => [id, +this.w.get(id).toFixed(5)]));
  }
}

// Per-branch trust decay floor for pruning decisions: a branch that has been
// ranked last for `patience` consecutive rounds loses the gardener's protection.
export function trackStreaks(branchIds) {
  const last = new Map(branchIds.map((b) => [b, 0]));
  return {
    observe(rankOrder) { // rankOrder: branch ids best->worst this round
      for (const b of branchIds) {
        const pos = rankOrder.indexOf(b);
        if (pos === rankOrder.length - 1) last.set(b, last.get(b) + 1);
        else last.set(b, 0);
      }
    },
    streak(b) { return last.get(b) ?? 0; },
  };
}
