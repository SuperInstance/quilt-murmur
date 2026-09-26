// quilt-murmur/murmur/bus.mjs — the murmur bus: ambient, low-bandwidth,
// probabilistic messages between cells. This is murmur-agent + Murmur +
// murmur-protocol-v2 reborn: not a wiki, not a network protocol — a CONVENTION
// carried by cell values and integrated by log-odds pooling.
//
// A murmur (the envelope, murmur-protocol-v2's inheritance):
//   { topic, from, p, n, ttl }
//   topic  — what is being whispered about (e.g. "b3:wins" = branch 3 wins)
//   from   — the sender cell/factor id (its trust weight gates its voice)
//   p      — the sender's belief probability in [0,1]
//   n      — evidence mass (how strongly the sender speaks; confidence)
//   ttl    — rounds this murmur stays live before evaporating
//
// Integration (the belief pooling): speakers are not equal. The bus pools
// log-odds weighted by SENDER TRUST × EVIDENCE MASS:
//   L(topic) = Σ_i  w_i · n_i · logit(p_i)      (p_i clamped to [0.02, 0.98])
//   posterior(topic) = sigmoid(L / Σ_i w_i·n_i) — a trust-weighted average
//                      in log-odds space (logarithmic opinion pool)
// This is the mathematically right way to merge uncertain witnesses: a
// confident liar with low trust gets outvoted by a hesitant truth-teller
// with high trust. nexus's "quarantine bad nodes" falls out for free —
// a zero-trust sender's murmur has zero influence.

const clampP = (p) => Math.min(0.98, Math.max(0.02, p));
export const logit = (p) => Math.log(clampP(p) / (1 - clampP(p)));
export const sigmoid = (x) => 1 / (1 + Math.exp(-x));

export class MurmurBus {
  constructor({ trust = null, ttlDefault = 2 } = {}) {
    this.trust = trust;      // HedgeTrust over sender ids (optional; uniform if null)
    this.live = [];          // active murmurs
    this.ttlDefault = ttlDefault;
    this.log = [];           // every murmur ever whispered (provenance)
    this.integrations = 0;
  }

  whisper({ topic, from, p, n = 1, ttl }) {
    // GAUNTLET FIX (22-c): fail-safe at the envelope boundary. A non-finite p
    // or n previously poisoned the WHOLE topic: infl = w*n stays finite while
    // logit(NaN p) makes L NaN -> posterior NaN (one bad voice silently
    // destroyed every other voice's evidence), and a NaN n makes W NaN ->
    // posterior silently 0.5. Both repros receipted; now loud throws.
    if (!Number.isFinite(+p)) throw new Error(`whisper: p must be finite, got ${p}`);
    if (!Number.isFinite(+n)) throw new Error(`whisper: n must be finite, got ${n}`);
    const m = { topic, from, p, n, ttl: ttl ?? this.ttlDefault, t: this.integrations };
    this.live.push(m);
    // GAUNTLET FIX (22-c): snapshot the envelope into the log. pulse() decays
    // ttl IN PLACE on the live members, and live/log used to share object
    // references — the provenance log ("every murmur ever whispered") silently
    // aged with the live queue (receipted: log.ttl 3 -> 1 after two pulses).
    this.log.push({ ...m });
    return m;
  }

  // Age one round, then pool per topic. Returns Map topic -> {
  //   posterior, voices, agreement (1 - normalized dispersion),
  //   dominant (highest-influence sender), trustMean }
  pulse() {
    this.integrations++;
    this.live = this.live.filter((m) => --m.ttl > 0);
    const byTopic = new Map();
    for (const m of this.live) {
      if (!byTopic.has(m.topic)) byTopic.set(m.topic, []);
      byTopic.get(m.topic).push(m);
    }
    const out = new Map();
    for (const [topic, murmurs] of byTopic) {
      let L = 0, W = 0, wsum = 0;
      let dominant = null, domInf = -Infinity;
      const ps = [];
      for (const m of murmurs) {
        const w = this.trust ? this.trust.weight(m.from) : 1 / murmurs.length;
        const infl = w * m.n;
        L += infl * logit(m.p);
        W += infl;
        wsum += w;
        ps.push(m.p);
        if (infl > domInf) { domInf = infl; dominant = m.from; }
      }
      const posterior = W > 0 ? sigmoid(L / W) : 0.5;
      // dispersion: mean |p_i - pooled|, agreement = 1 - dispersion (0..1)
      const disp = ps.reduce((a, p) => a + Math.abs(p - posterior), 0) / ps.length;
      out.set(topic, {
        posterior,
        voices: murmurs.length,
        agreement: 1 - Math.min(1, disp * 2),
        dominant,
        trustMean: wsum / murmurs.length,
      });
    }
    return out;
  }

  // ---- static helpers for in-sheet murmur math (mirror of the formulas) ----
  // The sheet computes the same pooling with formula cells; these exist so the
  // harness can verify the sheet's pooled cells against the reference math.
  static pool(ps, ws) {
    for (const p of ps) if (!Number.isFinite(+p)) throw new Error(`pool: p must be finite, got ${p}`); // GAUNTLET FIX (22-c): NaN in -> NaN out was silent
    let L = 0, W = 0;
    for (let i = 0; i < ps.length; i++) {
      const w = ws[i] ?? 1 / ps.length;
      L += w * logit(ps[i]);
      W += w;
    }
    return W > 0 ? sigmoid(L / W) : 0.5;
  }
}
