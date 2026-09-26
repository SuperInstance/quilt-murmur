// quilt-murmur/murmur/resonance.mjs — agreement as phase-locking (Kuramoto).
//
// MOTH's contribution to the mesh is not "random numbers" — it is a PHYSICS
// OF AGREEMENT. Each living branch is an oscillator whose phase encodes its
// current opinion (its rank position becomes its initial angle); its natural
// frequency ω encodes how fast its opinion is moving; coupling K between two
// branches is their endorsement agreement (cosine similarity of endorsement
// vectors). Branches that agree pull each other into phase lock; disagreeing
// branches tear the mesh apart.
//
//   dθ_i/dt = ω_i + (K/n)·Σ_j a_ij·sin(θ_j − θ_i)
//
// The ORDER PARAMETER  r = |mean(e^{iθ})|  is a single scalar a META-CELL can
// read: r ≈ 1 the mesh has consensus; r ≈ 0 the mesh is torn. The gardener
// spends budget based on r — this is the "viewpoint that recognizes the
// higher-abstracted goal of the greater tree", implemented as a scalar read
// off a coupled oscillator system living in the sheet's phase cells.
//
// Honest science note: r must EARN its keep. We receipt corr(r_t, future
// regret) each run — if consensus today doesn't predict smaller regret
// tomorrow, we say so (like the QM v1 honest loss in quilt-learn).

export class Resonance {
  // phases: Float64Array (radians); omegas: per-branch drift;
  // agree(i,j): coupling matrix entry in [0,1] (endorsement similarity)
  constructor(phases, omegas, agreeFn) {
    this.theta = Float64Array.from(phases);
    this.omega = Float64Array.from(omegas);
    this.agree = agreeFn;
    this.traj = []; // r(t) trajectory
  }

  step(dt = 0.1, K = 1.2, steps = 20) {
    const n = this.theta.length;
    for (let s = 0; s < steps; s++) {
      const d = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        let acc = 0;
        for (let j = 0; j < n; j++) {
          if (i === j) continue;
          acc += this.agree(i, j) * Math.sin(this.theta[j] - this.theta[i]);
        }
        d[i] = this.omega[i] + (K / n) * acc;
      }
      for (let i = 0; i < n; i++) this.theta[i] += d[i] * dt;
    }
    const r = this.orderParam();
    this.traj.push(r);
    return r;
  }

  orderParam() {
    const n = this.theta.length;
    if (!n) return 0;
    let sx = 0, sy = 0;
    for (let i = 0; i < n; i++) { sx += Math.cos(this.theta[i]); sy += Math.sin(this.theta[i]); }
    return Math.hypot(sx / n, sy / n);
  }
}

// Endorsement vectors → agreement matrix. vecs: array of {branchId, vec:[p1..p5]}
// coupling a_ij = 1 - mean|p_i - p_j| (agreement in [0,1]), masked to alive pairs.
export function agreementMatrix(vecs, alive) {
  const n = vecs.length;
  const A = Array.from({ length: n }, () => new Float64Array(n));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j || !alive[i] || !alive[j]) { A[i][j] = 0; continue; }
      let d = 0;
      for (let k = 0; k < vecs[i].length; k++) d += Math.abs(vecs[i][k] - vecs[j][k]);
      A[i][j] = Math.max(0, 1 - (d / vecs[i].length) * 2);
    }
  }
  return A;
}

// Correlation of r_t with next-round |regret| — the honesty check.
export function corr(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return null;
  const mx = xs.slice(-n).reduce((a, b) => a + b, 0) / n;
  const my = ys.slice(-n).reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
  }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null;
}
