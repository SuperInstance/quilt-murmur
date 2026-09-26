// quilt-murmur/murmur/provenance.mjs — murmur-protocol-v3: provenance-carrying
// murmurs. THE receipted next lever from E17: outcome-trust ranked a
// plagiarist slightly below its source by accident of lag, but it never SAW
// the echo — and a block of echoes (source + N copies) can amplify one
// observer's voice into apparent consensus. Trust math cannot fix that; the
// PROTOCOL must. The v2 envelope
//      { topic, from, p, n, ttl }
// grows one field:
//      { topic, from, origin, p, n, ttl }
//   origin — declared original producer of the content (null = "I made this")
// and the bus grows a POLICING LAYER that inspects content, not claims.
//
// RECEIPTED DESIGN FINDING (E19 finding #0, discovered while building this
// module): raw content matching CANNOT attribute direction inside a slow-
// flipping world. Within a regime every honest expert's stream is nearly
// constant, so a source's present matches its copier's PAST as well as vice
// versa — autocorrelation is direction-symmetric (a1 matched e1's history at
// stable lags and got branded an echo of its own plagiarist). Only NOVELTY
// has direction: a regime crossing (edge) appears in the source's stream
// BEFORE it appears in the copy's. So attribution is EDGE-PRECEDED:
//   j echoes k  iff  j's edges occur at k's edges + a consistent lag L ≥ 1
//                    (≥ minEdges of them), corroborated by a high content
//                    match-rate at (k, L) over the recent window,
//               and  the reverse edge-precedence does not hold.
// A declared origin that verifies by content match is a RELAY (checked
// FIRST — a verified claim beats content suspicion). Flat content that also
// matches someone's past is DUP (honest redundancy — two eyes of equal
// acuity colliding at p≈0.5); flat content matching no one is CLEAN (a
// harmless near-0.5 voice).
//
// Tags (reviewed every round, they UNSTICK when the copying stops):
//   'echo'  — plagiarism: influence ×ε_echo, trust penalty while confirmed
//   'dup'   — redundancy: influence ×ε_dup, no penalty (their agreement was
//             not theft, merely wasted mass)
//   'relay' — honest re-broadcast: influence = ε_relay × trust(origin);
//             range extension, never a new independent vote
//   'clean' — no confirmed pattern
//
// The sheet never changes: pool formulas are untouched. Provenance only
// changes WHAT WEIGHTS ARRIVE at the w.* cells. The protocol is a convention
// carried by cells — murmur-protocol-v2's own doctrine, one layer deeper.

const clampP = (p) => Math.min(0.98, Math.max(0.02, p));
const q6 = (v) => Math.round(v * 1000) / 1000;

export class Provenance {
  constructor({
    maxLag = 6,           // lags L ∈ 1..maxLag considered
    tol = 0.03,           // |v_j(t) − v_k(t−L)| ≤ tol counts as a content match
    window = 30,          // content match-rate window (rounds)
    confirm = 0.8,        // match-rate ≥ confirm corroborates attribution
    edgeTheta = 0.15,       // |Δv| above this is a novelty edge
    aw = 100,             // attribution window for edge-alignment rate
    minEdges = 2,         // minimum value-aligned edges (evidence floor)
    confirmEdges = 0.8,   // fraction of my edges that must value-align at (k,L)
    dupSigma = 0.02,      // sender content sd ≤ this over window = flat
    epsEcho = 0.15,       // influence multiplier on confirmed plagiarists
    epsDup = 0.5,         // influence multiplier on flat duplicates
    epsRelay = 0.2,       // multiplier on trust(origin) for verified relays
    penalty = 0.15,       // per-round trust multiplier (1−penalty) while 'echo'
    floor = 0.02,         // trust weight floor after penalties
  } = {}) {
    Object.assign(this, {
      maxLag, tol, window, confirm, edgeTheta, aw, minEdges, confirmEdges, dupSigma,
      epsEcho, epsDup, epsRelay, penalty, floor,
    });
    this.hist = new Map();   // sender -> rolling quantized votes
    this.edges = new Map();  // sender -> [{t, v}] novelty edge list (all history)
    this.tags = new Map();   // sender -> { tag, of, lag }
    this.events = [];        // every tag transition, for receipts
    this.round = 0;
  }

  // ---- per-round inspection. murmurs: [{from, origin, p}], order-stable. ----
  // Returns Map sender -> current tag string.
  inspect(murmurs) {
    this.round++;
    const ids = murmurs.map((m) => m.from);
    for (let j = 0; j < ids.length; j++) {
      if (!this.hist.has(ids[j])) { this.hist.set(ids[j], []); this.edges.set(ids[j], []); }
      const h = this.hist.get(ids[j]);
      const v = q6(clampP(+murmurs[j].p));
      if (h.length > 0 && Math.abs(v - h[h.length - 1]) > this.edgeTheta) {
        // an edge carries VALUE EVIDENCE: post value, pre value, jump size.
        // A copier reproduces the same jump to the same value; two honest
        // eyes crossing the same regime do NOT (different acuities ->
        // different post-edge levels). This is what makes attribution
        // directional where raw content matching cannot be (E19 finding #0:
        // within a regime, constant streams match everything).
        this.edges.get(ids[j]).push({ t: this.round, v, prev: h[h.length - 1], jump: +(v - h[h.length - 1]).toFixed(6) });
      }
      h.push(v);
      if (h.length > this.maxLag + this.window) h.shift();
      // prune edges outside the attribution window (+lag slack)
      const myE = this.edges.get(ids[j]);
      if (myE.length > this.aw + this.maxLag + 2) {
        this.edges.set(ids[j], myE.filter((e) => e.t > this.round - this.aw - this.maxLag - 2));
      }
    }

    const tagsNow = new Map();
    const echoMeta = new Map(); // id -> {k, L} for this round's echo findings
    for (let j = 0; j < ids.length; j++) {
      const me = this.hist.get(ids[j]);
      const myEdges = this.edges.get(ids[j]);
      if (me.length < this.window) { tagsNow.set(ids[j], 'clean'); continue; }
      const meWin = me.slice(-this.window);
      const mean = meWin.reduce((a, b) => a + b, 0) / meWin.length;
      const sd = Math.sqrt(meWin.reduce((a, b) => a + (b - mean) ** 2, 0) / meWin.length);

      // content match-rate of me against k's past at lag L (helper)
      const matchRate = (k, L) => {
        const oh = this.hist.get(k);
        if (!oh || oh.length < L + this.window) return 0;
        const seg = oh.slice(oh.length - L - this.window, oh.length - L);
        let m = 0;
        for (let i = 0; i < this.window; i++) if (Math.abs(meWin[i] - seg[i]) <= this.tol) m++;
        return m / this.window;
      };

      // ---- 1) RELAY first: a verified declared origin beats suspicion ----
      const origin = murmurs[j].origin;
      if (origin && this.hist.has(origin) && origin !== ids[j]) {
        let r = 0;
        for (let L = 1; L <= this.maxLag; L++) r = Math.max(r, matchRate(origin, L));
        if (r >= this.confirm) {
          tagsNow.set(ids[j], 'relay');
          continue;
        }
      }

      // ---- 2) ECHO by edge-precedence RATE + content corroboration ----
      // An ALIGNMENT is not just a time match: the copied edge must arrive at
      // the same VALUE with the same JUMP (within tol). And attribution needs
      // not two lucky alignments but a RATE: a copier reproduces ~ALL of the
      // source's edges (shifted, value-true); two honest eyes with the same
      // acuity share levels but their error timings are independent — their
      // alignment rate is ~coincidence. E19 finding #1: edge COUNT convicts
      // innocents (dense error trains + equal levels make lag-lucky
      // pairs common); edge RATE does not.
      const cand = [];
      if (myEdges.length >= this.minEdges) {
        const recent = myEdges.filter((e) => e.t > this.round - this.aw);
        if (recent.length >= this.minEdges) {
          for (let x = 0; x < ids.length; x++) {
            if (x === j) continue;
            const kEdges = this.edges.get(ids[x]);
            if (!kEdges || kEdges.length === 0) continue;
            const kRecent = kEdges.filter((e) => e.t > this.round - this.aw);
            // MIRROR GUARD (E19 finding #2): for periodic trains, alignments
            // exist at every lag ≡ Δ (mod period) — the source's edges match
            // its copier's at L = P−d as well as the copier's matching the
            // source's at L = d. So k must not echo j at ANY lag as strongly
            // as j echoes k at L; otherwise the pair is a mirror, not a
            // conviction.
            let kBest = 0;
            for (let L2 = 1; L2 <= this.maxLag; L2++) {
              if (kRecent.length < this.minEdges) break;
              let a = 0;
              for (const ke of kRecent) {
                const jt = ke.t - L2;
                if (recent.some((e) => e.t === jt
                  && Math.abs(e.v - ke.v) <= this.tol
                  && Math.abs(e.jump - ke.jump) <= this.tol)) a++;
              }
              kBest = Math.max(kBest, a / kRecent.length);
            }
            for (let L = 1; L <= this.maxLag; L++) {
              let aligned = 0;
              for (const e of recent) {
                const kt = e.t - L;
                if (kEdges.some((ke) => ke.t === kt
                  && Math.abs(ke.v - e.v) <= this.tol
                  && Math.abs(ke.jump - e.jump) <= this.tol)) aligned++;
              }
              const rate = aligned / recent.length;
              if (aligned < this.minEdges || rate < this.confirmEdges) continue;
              if (rate <= kBest) continue; // mirror: k echoes j at least as strongly elsewhere
              const corr = matchRate(ids[x], L);
              if (corr < this.confirm) continue;
              cand.push({ k: ids[x], L, rate, kBest, aligned, corr, kIsEcho: (this.tags.get(ids[x])?.tag === 'echo') });
            }
          }
        }
      }
      if (cand.length > 0) {
        // root-of-copy-chain preference: attribute to the cleanest source —
        // a copy-of-copy re-attributes to the ROOT, not to the middleman.
        cand.sort((a, b) => (a.kIsEcho - b.kIsEcho) || (b.rate - a.rate));
        const best = cand[0];
        tagsNow.set(ids[j], 'echo');
        echoMeta.set(ids[j], { k: best.k, L: best.L, rate: +best.rate.toFixed(3) });
        continue;
      }

      // ---- 3) DUP: flat AND redundant with someone's past ----
      if (sd <= this.dupSigma) {
        let dup = false;
        for (const id2 of ids) {
          if (id2 === ids[j]) continue;
          for (let L = 1; L <= this.maxLag; L++) {
            if (matchRate(id2, L) >= this.confirm) { dup = true; break; }
          }
          if (dup) break;
        }
        tagsNow.set(ids[j], dup ? 'dup' : 'clean');
        continue;
      }

      tagsNow.set(ids[j], 'clean');
    }

    // ---- sync persistent state; tags must UNSTICK when copying stops ----
    for (let j = 0; j < ids.length; j++) {
      const id = ids[j];
      const now = tagsNow.get(id) ?? 'clean';
      const prevT = this.tags.get(id);
      if (!prevT || prevT.tag !== now) {
        if (prevT && (prevT.tag === 'echo' || prevT.tag === 'relay' || prevT.tag === 'dup')) {
          this.events.push({ t: this.round, from: id, tag: now, was: prevT.tag, reason: 'lost' });
        }
        this.tags.set(id, { tag: now, of: null, lag: null });
      }
      if (now === 'echo' && (!prevT || prevT.tag !== 'echo')) {
        const meta = echoMeta.get(id) ?? { k: null, L: null, rate: null };
        this.tags.set(id, { tag: 'echo', of: meta.k, lag: meta.L, rate: meta.rate });
        this.events.push({ t: this.round, from: id, tag: 'echo', of: meta.k, lag: meta.L, rate: meta.rate });
      } else if (now === 'relay' && (!prevT || prevT.tag !== 'relay')) {
        this.tags.set(id, { tag: 'relay', of: murmurs[j].origin, lag: null });
        this.events.push({ t: this.round, from: id, tag: 'relay', of: murmurs[j].origin });
      }
    }
    return tagsNow;
  }

  tag(id) { return this.tags.get(id)?.tag ?? 'clean'; }
  tagOf(id) { return this.tags.get(id) ?? { tag: 'clean' }; }

  // ---- re-attribution: trust weights (raw, from the learner) -> influence
  // weights (what the sheet's pool should consume). Returns Map id -> infl.
  influence(weights, murmurs) {
    const out = new Map();
    for (const m of murmurs) {
      const w = weights.get(m.from) ?? 0;
      const t = this.tagOf(m.from);
      if (t.tag === 'echo') out.set(m.from, w * this.epsEcho);
      else if (t.tag === 'dup') out.set(m.from, w * this.epsDup);
      else if (t.tag === 'relay') out.set(m.from, (weights.get(t.of) ?? w) * this.epsRelay);
      else out.set(m.from, w);
    }
    return out;
  }

  // ---- state-level penalty: multiplies confirmed plagiarists' trust down.
  // Callers should write the result BACK into the learner (absorb) so the
  // penalty persists across rounds. Returns a new Map (does not mutate).
  penalize(weights) {
    const out = new Map();
    for (const [id, w] of weights) {
      const t = this.tagOf(id);
      if (t.tag === 'echo') out.set(id, Math.max(this.floor, w * (1 - this.penalty)));
      else out.set(id, w);
    }
    const Z = [...out.values()].reduce((a, b) => a + b, 0) || 1;
    for (const [id, w] of out) out.set(id, w / Z);
    return out;
  }

  // ground-truth confusion: truth = Map id -> 'echo' | 'relay' | 'clean'
  confusion(truth, ids) {
    const cm = {};
    for (const id of ids) {
      const got = this.tag(id), want = truth.get(id) ?? 'clean';
      const key = `${want}->${got}`;
      cm[key] = (cm[key] ?? 0) + 1;
    }
    return cm;
  }
}
