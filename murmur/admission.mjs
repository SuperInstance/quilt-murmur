// quilt-murmur/murmur/admission.mjs — murmur-protocol-v3.1: COLD-START
// ADMISSION CONTROL + FRACTIONAL (per-murmur) ATTRIBUTION.
//
// This module closes E19/PROTOCOL-V3.md open problems #1 and #3 by
// COMPOSING Provenance — provenance.mjs is NOT rewritten and never mutated
// here; admission reads its tags (tagOf) and keeps hard tags as the BACKSTOP.
//
// THE RESIDUAL VULNERABILITY (E19 receipt): a brand-new sender is 'clean' by
// default while it fills Provenance's window (provenance.mjs: me.length <
// window -> 'clean'), so a block of fresh copiers carries FULL influence for
// ~window rounds (spin-up), and after conviction the per-SENDER hard tags are
// coarse (everything a convicted sender says is x epsEcho forever until it
// reforms). v3.1 makes influence CONTINUOUS and EARNED:
//
//   1) FRACTIONAL per-murmur attribution. Each sender carries a continuous
//      echo-score s_j in [0,1] = EWMA (rate beta) of its edge-alignment rate
//      vs its best CORROBORATED source (time + value + jump aligned edges at
//      lag L >= 1, content match-rate >= confirm — the E19 finding #0/#1
//      doctrine: only edge-precedence has direction, alignment is a RATE).
//      Per murmur, value-novelty n_j(t) in [0,1] = distance of p from the
//      best-matching recent value of any other PRESENT sender (within tol =>
//      0; > tol + novSpread => 1). The influence multiplier is
//           m = (1 - s_j) * (alpha + (1 - alpha) * n_j),   alpha ~ 0.25,
//      so a copied VALUE with a copied HISTORY cannot ride on its sender's
//      remaining goodwill: the novelty term reacts INSTANTLY (round one of
//      copying) where the echo-score needs ~2 novelty events to climb — the
//      two mechanisms are complementary in time.
//      RECEIPTED LIMIT (kept honest, measured in E21): value-novelty is
//      direction-blind — the copied source's own murmur also loses novelty
//      while copies exist (its value sits in the copiers' recent history).
//      Direction lives in s_j only. Hard tags cap the extremes:
//           infl = w * min(m, tagCap),  tagCap: echo->epsEcho, dup->epsDup,
//      clean->1; verified relays keep prov.influence semantics exactly
//      (influence = epsRelay x trust(origin)) — a relay's evidence is BY
//      CONSTRUCTION echoed, so it must never be judged by the independence
//      bar below.
//
//   2) COLD-START ADMISSION. firstSeen per sender; a sender younger than
//      admitWindow is PROBATIONARY (influence x epsNew). Admission requires
//      BOTH (a) age >= admitWindow and (b) independent evidence: >= minEdges
//      own novelty edges NOT attributable as echoes of any other sender
//      (edges are cached independent/dependent at creation time — direction
//      is fixed then), AND mean |p - pooled| during probation <= admitErr
//      (it was USEFUL, not just present). AGGREGATE CAP: the total influence
//      mass of all probationary senders in one round is capped at capShare
//      of the round's total (probationary entries rescaled; total mass
//      preserved) — the sybil flood-breaker: no number of fresh copies can
//      buy more than capShare of the vote, no matter how their trust was
//      bootstrapped.
//
// DESIGN DECISION D1 (genesis acclamation): senders present at the FIRST
// observe() round are founders — admitted at round 1, never probationary.
// Rationale: admission prices UNKNOWN JOINERS of a running mesh; the genesis
// crowd is constitutive. Forcing founders through probation was rejected on
// receipted grounds: (i) honest declared relays would strand forever (their
// edges are echoes of their origin by design -> independence bar unsatisfiable),
// (ii) the mesh's first ~100 rounds would be taxed for no anti-sybil gain —
// the attack surface this module closes is MID-STREAM joiners. Boundary note:
// sybils present AT genesis are trust's problem (E17/E19 territory), not
// admission's.
//
// BOUNDARIES (honest scope): a voice with NO novelty edges ever (e.g. a
// constant p ~ 0.5 sender) can never satisfy the independence bar and stays
// probationary — correct: it was never useful. A pure-noise joiner PASSES
// independence (its random edges echo nobody) and may pass admitErr; the
// outcome learner (HedgeTrust) is what demotes it — admission gates IDENTITY
// economics, not competence.

const clampP = (p) => Math.min(0.98, Math.max(0.02, p));
const q6 = (v) => Math.round(v * 1000) / 1000;

export class Admission {
  constructor({
    // --- fractional attribution (mirrors Provenance's detector constants) ---
    maxLag = 6,           // lags L in 1..maxLag considered
    tol = 0.03,           // content/edge match tolerance
    window = 30,          // recent-value window for novelty + content match
    edgeTheta = 0.15,     // |dv| above this is a novelty edge
    aw = 100,             // edge-alignment attribution window
    minEdges = 2,         // evidence floor for scoring a rate at all
    confirmEdges = 0.8,   // alignment rate needed to count as corroborated
    confirm = 0.8,        // content match-rate needed to corroborate (k, L)
    beta = 0.12,          // EWMA rate of the echo-score s_j
    alpha = 0.25,         // novelty floor in the multiplier m
    novSpread = 0.15,     // distance beyond tol that maps to full novelty
    // --- cold-start admission ---
    coldStart = true,     // false => fractional-only (isolation arm)
    admitWindow = 40,     // probation length (rounds since firstSeen)
    epsNew = 0.15,        // probationary influence multiplier
    minEdgesIndep = 2,    // independent-evidence bar (own, non-echoed edges)
    admitErr = 0.5,       // mean |p - pooled| bar during probation
    capShare = 0.10,      // aggregate probationary influence cap
    // --- hard-tag backstop caps (mirror provenance defaults) ---
    epsEcho = 0.15,
    epsDup = 0.5,
    epsRelay = 0.2,
  } = {}) {
    Object.assign(this, {
      maxLag, tol, window, edgeTheta, aw, minEdges, confirmEdges, confirm,
      beta, alpha, novSpread, coldStart, admitWindow, epsNew, minEdgesIndep,
      admitErr, capShare, epsEcho, epsDup, epsRelay,
    });
    this.hist = new Map();      // sender -> rolling quantized values (<= maxLag+window+2)
    this.edges = new Map();     // sender -> [{t, v, prev, jump, indep}] (all history)
    this.firstSeen = new Map(); // sender -> first observe() round
    this.echo = new Map();      // sender -> continuous echo-score s_j in [0,1]
    this.admitAt = new Map();   // sender -> admission round (null = probationary)
    this.devSum = new Map();    // sender -> sum |p - pooled| during probation
    this.devN = new Map();      // sender -> rounds counted
    this.round = 0;
    this.lastMurmurs = [];      // murmurs of the current round (for notePooled)
    this.lastMult = new Map();  // sender -> fractional multiplier m this round
    this.lastInfl = new Map();  // sender -> final influence this round
    this.capBoundRounds = 0;    // rounds where the cap actually REDISTRIBUTED mass
    this.lastCapScaled = false; // whether the cap scaled this round
  }

  // ---- per-round observation (call once per round, BEFORE reattribute) ----
  observe(murmurs) {
    this.round++;
    const ids = murmurs.map((m) => m.from);
    for (let j = 0; j < ids.length; j++) {
      const id = ids[j];
      if (!this.hist.has(id)) {
        this.hist.set(id, []);
        this.edges.set(id, []);
        this.firstSeen.set(id, this.round);
        this.echo.set(id, 0);
        this.devSum.set(id, 0);
        this.devN.set(id, 0);
        // D1: genesis crowd (present at the first observe) admitted by acclamation.
        this.admitAt.set(id, (this.round === 1 && this.coldStart) ? 1 : null);
      }
      const h = this.hist.get(id);
      const v = q6(clampP(+murmurs[j].p));
      if (h.length > 0 && Math.abs(v - h[h.length - 1]) > this.edgeTheta) {
        const prev = h[h.length - 1];
        const jump = +(v - prev).toFixed(6);
        // Independence is FORENSIC and fixed at creation: does ANY other known
        // sender have a value+jump-aligned edge at t-L (L >= 1)? A later
        // matcher would be j's copier, not j's source — direction preserved.
        const indep = this.isIndependent(id, this.round, v, jump);
        this.edges.get(id).push({ t: this.round, v, prev, jump, indep });
      }
      h.push(v);
      if (h.length > this.maxLag + this.window + 2) h.shift();
    }

    // ---- continuous echo-score s_j: EWMA of best corroborated alignment rate
    // MIRROR GUARD (E21 port of provenance.mjs finding #2): near-twin honest
    // pairs align BOTH ways at different lags, and flat plateau twins match
    // everyone's content (finding #0) — so a candidate conviction (id echoes k
    // at L) is rejected whenever k echoes id at ANY lag at least as strongly.
    // Without this the soft layer re-discovers finding #0 inside itself: the
    // COPY SOURCE gets s≈0.92 and is crushed to 2% influence while the hard
    // layer correctly acquits it (receipted in E21's first run: a1MFrac 0.021).
    for (const id of ids) {
      const recent = this.edges.get(id).filter((e) => e.t > this.round - this.aw);
      if (recent.length < this.minEdges) continue; // no rateable evidence: hold s
      let rate = 0;
      for (const k of ids) {
        if (k === id) continue;
        const kEdges = this.edges.get(k) ?? [];
        if (kEdges.length === 0) continue;
        const kRecent = kEdges.filter((e) => e.t > this.round - this.aw);
        let kBest = 0; // k's best echo-rate against id (reverse direction)
        if (kRecent.length >= this.minEdges) {
          for (let L2 = 1; L2 <= this.maxLag; L2++) {
            let a2 = 0;
            for (const ke of kRecent) {
              if (recent.some((e) => e.t === ke.t - L2
                && Math.abs(e.v - ke.v) <= this.tol
                && Math.abs(e.jump - ke.jump) <= this.tol)) a2++;
            }
            kBest = Math.max(kBest, a2 / kRecent.length);
          }
        }
        for (let L = 1; L <= this.maxLag; L++) {
          let aligned = 0;
          for (const e of recent) {
            if (kEdges.some((ke) => ke.t === e.t - L
              && Math.abs(ke.v - e.v) <= this.tol
              && Math.abs(ke.jump - e.jump) <= this.tol)) aligned++;
          }
          const r = aligned / recent.length;
          if (aligned >= this.minEdges && r >= this.confirmEdges && r > kBest
            && this.matchRate(id, k, L) >= this.confirm) {
            rate = Math.max(rate, r);
          }
        }
      }
      this.echo.set(id, (1 - this.beta) * (this.echo.get(id) ?? 0) + this.beta * rate);
    }

    // ---- admission evaluation (uses deviation data through the previous round)
    if (this.coldStart) {
      for (const id of ids) {
        if (this.admitAt.get(id) != null) continue;
        if (this.round - this.firstSeen.get(id) + 1 < this.admitWindow) continue;
        const devM = this.devN.get(id) > 0 ? this.devSum.get(id) / this.devN.get(id) : Infinity;
        const indep = this.edges.get(id).filter((e) => e.indep).length;
        if (indep >= this.minEdgesIndep && devM <= this.admitErr) {
          this.admitAt.set(id, this.round);
        }
      }
    }
  }

  isIndependent(id, t, v, jump) {
    for (const [k, eList] of this.edges) {
      if (k === id || eList.length === 0) continue;
      for (let L = 1; L <= this.maxLag; L++) {
        if (eList.some((ke) => ke.t === t - L
          && Math.abs(ke.v - v) <= this.tol
          && Math.abs(ke.jump - jump) <= this.tol)) return false;
      }
    }
    return true;
  }

  // content match-rate of me's window against k's window shifted by L
  matchRate(me, k, L) {
    const oh = this.hist.get(k), mh = this.hist.get(me);
    if (!oh || !mh || oh.length < L + this.window || mh.length < this.window) return 0;
    const meWin = mh.slice(mh.length - this.window);
    const seg = oh.slice(oh.length - L - this.window, oh.length - L);
    let m = 0;
    for (let i = 0; i < this.window; i++) if (Math.abs(meWin[i] - seg[i]) <= this.tol) m++;
    return m / this.window;
  }

  // value-novelty of p against the PRESENT crowd's recent values (0..1)
  noveltyOf(id, p, murmurs) {
    let d = Infinity;
    for (const m of murmurs) {
      if (m.from === id) continue;
      const h = this.hist.get(m.from);
      if (!h || h.length === 0) continue;
      for (let i = Math.max(0, h.length - this.window); i < h.length; i++) {
        const dd = Math.abs(+p - h[i]);
        if (dd < d) d = dd;
      }
    }
    if (d === Infinity) return 1;
    return d <= this.tol ? 0 : Math.min(1, (d - this.tol) / this.novSpread);
  }

  // ---- influence re-attribution (v3.1). weights: raw (penalized) trust map
  // from the learner; prov: the shared Provenance instance whose HARD TAGS
  // cap the extremes. Returns Map sender -> influence (present senders only;
  // absent senders get 0 from the caller).
  reattribute(weights, murmurs, prov) {
    const out = new Map();
    const mult = new Map();
    const prob = [];
    for (const m of murmurs) {
      const id = m.from;
      const w = weights.get(id) ?? 0;
      const t = prov ? prov.tagOf(id) : { tag: 'clean' };
      let infl, mf;
      if (t.tag === 'relay') {
        // verified relay: prov semantics exactly; never judged by independence
        infl = (weights.get(t.of) ?? w) * this.epsRelay;
        mf = null;
      } else {
        const n = this.noveltyOf(id, m.p, murmurs);
        const s = this.echo.get(id) ?? 0;
        mf = (1 - s) * (this.alpha + (1 - this.alpha) * n);
        const cap = t.tag === 'echo' ? this.epsEcho : (t.tag === 'dup' ? this.epsDup : 1);
        infl = w * Math.min(mf, cap); // hard tag = backstop CAP on the extreme
      }
      if (this.coldStart && this.admitAt.get(id) == null) {
        infl *= this.epsNew; // probationary
        prob.push(id);
      }
      out.set(id, infl);
      mult.set(id, mf);
    }
    // ---- AGGREGATE CAP (sybil flood-breaker): probationary mass <= capShare
    // of the round's total. Fixed point: P' = capShare*(Z - P + P')  =>
    // P' = capShare*(Z-P)/(1-capShare), so the POST-cap share is exactly
    // capShare; then a uniform renormalize back to the original total Z
    // (uniform scaling has no effect on the normalized pool — it only keeps
    // the in-sheet share meters comparable across rounds).
    this.lastCapScaled = false;
    if (this.coldStart && prob.length > 0 && this.capShare < 1) {
      let Z = 0;
      for (const v of out.values()) Z += v;
      let P = 0;
      for (const id of prob) P += out.get(id);
      if (P > this.capShare * Z + 1e-15 && Z - P > 1e-12) {
        const target = (this.capShare * (Z - P)) / (1 - this.capShare);
        const f = target / P;
        for (const id of prob) out.set(id, out.get(id) * f);
        const g = Z / (Z - P + target);
        for (const [id, v] of out) out.set(id, v * g);
        this.capBoundRounds++; // cap REDISTRIBUTED mass (mixed population)
        this.lastCapScaled = true;
      }
    }
    this.lastMurmurs = murmurs;
    this.lastMult = mult;
    this.lastInfl = out;
    return out;
  }

  // ---- call AFTER the round's pooled posterior is known (arm-specific:
  // each Admission instance is fed ITS arm's pool). Tracks usefulness
  // (mean |p - pooled|) for probationary senders.
  notePooled(pooled) {
    for (const m of this.lastMurmurs) {
      if (!this.coldStart || this.admitAt.get(m.from) != null) continue;
      this.devSum.set(m.from, (this.devSum.get(m.from) ?? 0) + Math.abs(+m.p - pooled));
      this.devN.set(m.from, (this.devN.get(m.from) ?? 0) + 1);
    }
  }

  // ---- accessors ----
  age(id) { return this.firstSeen.has(id) ? this.round - this.firstSeen.get(id) + 1 : 0; }
  admitted(id) { return !this.coldStart || this.admitAt.get(id) != null; }
  admittedRound(id) { return this.admitAt.get(id) ?? null; }
  probationary(id) { return this.coldStart && this.admitAt.get(id) == null; }
  echoScore(id) { return this.echo.get(id) ?? 0; }
  indepCount(id) { return (this.edges.get(id) ?? []).filter((e) => e.indep).length; }
  devMean(id) { const n = this.devN.get(id) ?? 0; return n > 0 ? (this.devSum.get(id) ?? 0) / n : null; }
}
