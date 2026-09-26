// quilt-murmur/murmur/gardener.mjs — the meta-viewpoint. git-agent's
// observe→plan→execute loop, murmur-agent's five thinking strategies, and
// nexus's reflex compiler all WALKED — one controller step at a time. The
// gardener FLIES: it reads three scalars off the mesh (order parameter r,
// trust entropy H, rolling regret improvement) and modulates the whole
// tree — temperature (exploration), spawn/prune rates, graft aggression —
// without ever touching an individual decision.
//
// Policies (the gardener is itself a bandit — meta-learning on 3 arms):
//   bold   — low temperature floor, spawn eagerly, graft on every death
//   steady — moderate everything (textbook simulated annealing)
//   timid  — high temperature (lots of exploration), rarely prunes
// Reward: rolling regret delta. Budget: each policy action costs spawn
// credits; the gardener cannot exceed maxBranches alive at once.

export const POLICIES = ['bold', 'steady', 'timid'];

export class Gardener {
  constructor({ maxBranches = 10, startCredits = 6, eps = 0.15 } = {}) {
    this.maxBranches = maxBranches;
    this.credits = startCredits;
    this.eps = eps;
    this.q = new Map(POLICIES.map((p) => [p, 0]));
    this.tries = new Map(POLICIES.map((p) => [p, 0]));
    this.policy = 'steady';
    this.history = [];
  }

  choose() {
    // epsilon-greedy over the 3 policies
    if (Math.random() < this.eps) {
      this.policy = POLICIES[Math.floor(Math.random() * POLICIES.length)];
    } else {
      this.policy = [...this.q.entries()].sort((a, b) => b[1] - a[1])[0][0];
    }
    this.tries.set(this.policy, this.tries.get(this.policy) + 1);
    return this.policy;
  }

  // observe = the mesh's vitals; returns the season's modulation.
  //   r          order parameter (0..1)      — consensus meter
  //   H          trust entropy (0..1)         — how opinionated trust is
  //   regretDr   rolling regret delta (<=0 improving)
  //   alive      current living branch count
  decide({ r, H, regretDr, alive }) {
    const g = 1 - H; // garden harder when trust has opinions
    let temp, pruneFloor, spawn, graftAggr;
    switch (this.policy) {
      case 'bold':
        temp = Math.max(0.02, 0.08 + 0.10 * r);
        pruneFloor = 3;
        spawn = alive < this.maxBranches && this.credits > 0 && (r < 0.55 || H > 0.85);
        graftAggr = 2;
        break;
      case 'timid':
        temp = 0.25 + 0.25 * r;
        pruneFloor = 6;
        spawn = alive < this.maxBranches && this.credits > 2 && r < 0.35;
        graftAggr = 1;
        break;
      default: // steady
        temp = Math.max(0.05, 0.15 - 0.10 * g + 0.08 * r);
        pruneFloor = 4;
        spawn = alive < this.maxBranches && this.credits > 1 && (r < 0.45 || regretDr > 0);
        graftAggr = 1;
    }
    if (spawn) this.credits--;
    const d = { policy: this.policy, temp: +temp.toFixed(3), pruneFloor, spawn: !!spawn, graftAggr, r: +r.toFixed(3), H: +H.toFixed(3), credits: this.credits };
    this.history.push(d);
    return d;
  }

  // called by the harness after the season's regret is known
  reward(regretDelta) {
    const q = this.q.get(this.policy);
    this.q.set(this.policy, q + 0.3 * (regretDelta - q));
  }

  // credits refill slowly — the gardener is frugal because budget is real
  refill(amount = 0.5) {
    this.credits = Math.min(8, this.credits + amount);
  }
}
