// E41 — THE CROSS-INSTANCE DETECTOR (fourth and least-collapsed axis; the one the ExoJ field chose)
// ==================================================================================================
// Collides with E40's carried seed. E40 (receipt 0xa47fd893f54d8d17, commit 2a38044) killed the
// relational WITHIN-POOL cosine: SAFE but BLIND — false-trip budget finally PASSES (0 founder
// trips/200r vs E38 CUSUM 29.9, E39 ratio 9.4) yet 0/6 sleeper trips and 0/6 g1 visibility; the
// post-flip cosine sits INSIDE the honest floor range 6/6 ("the flip is a relational REGIME CHANGE,
// not a level change"). E40's co-tox screen killed the within-pool cascade axis too (honest-honest
// trailing corr max 0.997). Three detector axes are receipted dead: mean (E38), variance (E39),
// relational-within-pool (E40). ALL THREE read only the suspect's OWN pool — where shared pool-lag
// bursts and shared truth make honest voices highly correlated (0.997 trailing max) and the honest
// floor as wide as the signal. The ExoJ dogfood field (e_x3, E24-a) SELECTED cross_instance as the
// next axis (Delta 0.5221 at the single observation point, prob_open 1.0 -> 0.9412).
//
// THE HYPOTHESIS (E41 brief, tested as stated): a SECOND INDEPENDENT INSTANCE (sister sheet)
// observing the SAME underlying truth stream breaks the own-pool collapse: honest voices in both
// instances co-move with TRUTH (their errors are independent noises), while a toxic voice is
// systematically ANTI-truth — i.e., anti-correlated with the sister instance's honest consensus at
// the same round. The sister's consensus is uncontaminated by the suspect's pool dynamics.
//
//   CrossInstanceGuard — XI, an uncentered cosine between a suspect's vote-deviation stream and the
//   SISTER instance's per-round pooled-consensus deviation (the minimal cross-instance extension of
//   E40's ALIGN: SAME protocol-neutral origin pv = p - 0.5, SAME uncentered-cosine form, SAME
//   sustained gate — ONLY the reference stream changes, from the own-pool median to the sister
//   consensus; this is what makes the floor comparison PAIRED and the axis test clean).
//     sister instance   12 honest founders b1..b12 (independent acuities, independent noise
//                       draws — DIFFERENT RNG streams e41:sskill/e41:svote), observing the SAME
//                       truth sequence s(t) each round, SAME murmur engine settings (HedgeTrust +
//                       Provenance + Admission + sheet pool.hedge, supervised rewards). The sister
//                       carries NO attackers and NO newcomers — the reference instance is
//                       uncontaminated BY DESIGN (that is the hypothesis). Runs ONCE per seed
//                       (arm-identical by determinism: same draws, no attackers, no defense) and is
//                       consumed as a READ-ONLY reference stream cS(t) = sister pool.hedge.
//     consensus dev     mvS(t) = cS(t) - 0.5 (the sister's belief in protocol-neutral P(s=1) space)
//     statistic         rho_i(t) = sum_W(pv*mvS) / sqrt(sum_W(pv^2) * sum_W(mvS^2)) over the
//                       trailing W=20 rounds, pv_i(t) = p_i(t) - 0.5 (UNCENTERED by design — E40's
//                       receipted note carries over: centering each stream by its own window-mean
//                       would subtract out exactly the mean anti-state signal the hypothesis
//                       predicts; this is a cosine, not a Pearson — the centered variant is priced
//                       and rejected in pricing.dev)
//     signature (hypothesis) honest suspect: errors independent of sister noise -> near-zero/
//                       positive-with-truth alignment; toxic phase: anti-truth -> strongly negative.
//     TRIP when rho_i < -h SUSTAINED 5 of the last 10 evaluation rounds; sustained window RESETS on
//     trip (E38/E39/E40 gate shape verbatim). Evaluation requires: sender ADMITTED (probation
//     streams fill the window) + full trailing-W window. epsDen = 1e-12 guards a literal 0/0 ->
//     rho := 0 (NOT a noise floor — receipted). Guard plumbing = FlipGuard/CoMovementGuard
//     verbatim (windows {from:t+1, until:t+40}, release events, epsNew throwback, throw/rethrow
//     kinds, suppressed-condition counting).
//   WITHIN-POOL TELEMETRY TWIN (gates NOTHING, receipted): the same guard window also computes the
//   E40 within-pool ALIGN (reference = median of the round's OWN murmurs - 0.5, suspect included —
//   E40's statistic verbatim) per sender, as rhoW — so the STRUCTURAL question (is the
//   cross-instance honest floor actually TIGHTER than the within-pool floor — the reason this axis
//   was chosen) is answered PAIRED, in-run, on the same seeds, in addition to the pricing-seed
//   comparison. The within-rho NEVER gates.
//
//   Consequence on trip (E37/E38/E39/E40 verbatim, detector swap ONLY): TrustReprobation (HedgeTrust
//   weight x0.5 via absorb, re-earns through the normal fixed-share + exp(eta*r) path; class copied
//   VERBATIM from e40_comovement.mjs — trip events carry trail30/refMean so it stays
//   byte-identical; trail30 = trailing-W mean product with the SISTER reference, refMean = 0, the
//   protocol-neutral origin) + influence re-probation (epsNew for 40 guard rounds).
//
// RECEIPTS (R1-R5, sealed BEFORE any run; the structural floor question is R1's second clause):
//   R1 HONEST-NOISE FLOOR (primary design constraint, priced BEFORE composition): per-founder
//      trailing cross-instance alignment distribution on honest phases, on disjoint pricing seed
//      100 (booked as pricing.dev BEFORE any run row) AND in the matrix arms; false-trip projection
//      vs budget 1.0/200r arm-wide (E38: 29.9 = 30x fail; E39: 9.375 = 9.4x fail; E40: 0 = PASS).
//      STRUCTURAL CLAUSE (the reason this axis was chosen): is the cross-instance honest floor
//      actually TIGHTER than the within-pool floor? Priced THREE ways: (a) paired on pricing seed
//      100 — same world, same founder streams, both references (within = E40 statistic verbatim);
//      (b) paired in-run via the guard's rhoW twin on the matrix; (c) against E40's RECEIPTED
//      numbers (pricing founderFloor -0.369056, matrix floor min -0.620946, from
//      experiments/outputs/e40_summary.json @ commit 2a38044). TIGHTER verdict rule (receipted
//      before runs): TIGHTER iff matrix cross floor min > matrix within floor min AND the
//      per-founder paired delta (cross - within) is > 0 for a majority of founders on the pricing
//      seed; else NOT-TIGHTER. Both distributions are booked either way.
//   R2 DETECTION: the sleeper trips post-flip. PASS iff tripped seeds >= half AND mean latency
//      (first post-flip throw minus t_flip) < 30 rounds over tripped seeds. Pre-flip w1 trips are
//      receipted (they count as false trips on an honest-phase voice).
//   R3 g1 FROM-ARRIVAL VISIBILITY (the standing relational hope): PASS iff g1 trips in >= 2/3 of
//      seeds; latency measured from g1's own admission round.
//   R4 COUNTERFACTUAL DAMAGE (composition, when the guard fires): D(XI1) < D(A1) — paired one-sided
//      sign test (zeros excluded) p < 0.05; paired delta +/- SE; damage ratio D(XI1)/D(A1); g1
//      damage on the same footing (an INCREASE beyond A1 + 1 SE fails R5c). Vacuous if no trips
//      (receipted, E40 precedent).
//   R5 CANARIES — ALL must hold: (a) honestFinalQ within 1 SE of A4 (seed-paired); (b) h2: ZERO
//      defense trips across the arm AND h2's per-seed admission outcome identical to A1's
//      (arm-invariance); (c) g1 damage <= A1 + 1 SE; (d) FALSE-TRIP BUDGET explicit: total
//      honest-founder trips, per-founder histogram, rate <= 1.0 per 200r arm-wide; (e) RECOVERY:
//      false-tripped founders re-earn to >= 95% of pre-trip trust share within 100 rounds (E37
//      baseline 23/25, mean 19.1r — must not regress); events without a full 100-round horizon
//      receipted but excluded; vacuous pass if no trips.
//   CROWN — if XI1 passes R1+R2+R3+R4+R5, crown it (damage ratio, sleeper latency, g1 containment).
//      If the floor is wide again or detection is 0/x: HONEST NEGATIVE with computed mechanism —
//      the ladder continues and THAT is the crown. No pre-written conclusions: every clause is
//      filled from measured numbers.
//
// TOXIC-SIGNATURE MECHANISM RECEIPT (booked whatever the verdict; the arc's unifying question):
//   the E24 toxic formula is `signal = (xR() < 0.25) ? s : 1-s; vote = signal===1 ? 0.25 : 0.75`
//   (e24_toxicsource_spinup.mjs lines 132-134, carried VERBATIM through E35-E40). The q < 0.5 vote
//   mapping makes the vote CONTRADICT its signal, so the ANTI-truth signal (75%) composes with the
//   contradiction into a PRO-truth vote ~75% of rounds at weak magnitude (|p-0.5| = 0.25) — i.e.
//   the toxic vote stream is DISTRIBUTION-IDENTICAL to an honest q=0.75 voice. Measured here
//   directly (pricing + per-seed): P(toxV pro-truth), the residual bimodality (E39's 75%-close /
//   25%-far), and the toxic voice's alignment RANK among the honest founders (if the attacker
//   aligns BETTER than the honest median, no bar in alignment space — low OR high — can separate
//   it without tripping the weaker half of the honest pool: the wrong-side-of-population receipt).
//   This receipt is what closes (or re-opens) the four-axis ladder with a mechanism, not a shrug.
//
// SWEEP PROVENANCE (receipted BEFORE the pricing run): the bars are set from the design-time
//   pricing on seed 100 (DISJOINT from matrix seeds 0-7) by the rule: hLo = snap(1.0 x |floor|),
//   hMid = snap(1.5 x |floor|), hHi = min(0.50, snap(2.0 x |floor|)), snap = round to the 0.05 grid
//   with a 0.10 minimum; hiH = hHi; W = 20 (E40-comparable; W = 30 priced for sensitivity).
//   AMENDMENT (dev-phase, BEFORE probe/matrix, attested in pricing.dev + run.config): the measured
//   pricing floor |f| = 0.522202 reaches the rule's 0.50 practical cap — the degenerate case
//   (hLo = 0.5, hMid = 0.8, hHi capped at 0.5 < hMid) — and the E40 grid {0.2, 0.35, 0.5} sits
//   BELOW the cross-instance floor (bars 0.2/0.35 would cut into it = designed-in false trips,
//   violating the price-the-floor-first house law), so the sweep becomes the headroom bars
//   {0.50 (1.0x), 0.80 (1.5x)} and hiH = 0.80. Reference variant rule: argmax floor TIGHTNESS (the
//   axis's own structural bet) between crossPool (sister POOLED consensus — the instance's actual
//   belief object) and crossMed (sister median vote — estimator-matched to E40, isolates
//   cross-instance from estimator effects); tie -> crossPool. The main run RE-computes the pricing
//   in-run and books it as pricing.dev BEFORE any run row.
//
// SETUP (E38/E39/E40 world VERBATIM, fresh e41:* draws): 12 honest founders (mixed acuity, a1 =
//   0.9 reference) + 1 honest late-joiner h2 (t=150, honest forever — the false-positive canary) +
//   1 flasher g1 (toxic from arrival, t=150) + 1 sleeper w1 (t=150, honest phase = e24 h1 generator
//   verbatim, flips at admission + k* = 25 — E35's probe-optimal, carried). T=400, 8 seeds (probe
//   rule may cut to 6). Paired arms, IDENTICAL worlds (same truth stream, honest votes, toxic
//   series, sister streams; arms select over shared values):
//   A1   no-defense+sleeper — full v3.1 + sleeper + active g1, NO defense (E36-E40 control)
//   XI1  crossinstance(best-h) — v3.1 + CrossInstanceGuard(h* = probe-picked) + trust re-probation
//        + same attack [the candidate]
//   XIhi crossinstance(hHi)   — v3.1 + CrossInstanceGuard(h = hHi) + trust re-probation + same
//        attack [conservative sibling — if h* = hHi the two arms coincide and XI1 ALIASES XIhi
//        (receipted, no re-run)]
//   A4   v3.1-clean         — full v3.1, no attack, NO defense (collateral baseline)
//
// DAMAGE METHOD (E35-E40 counterfactual, verbatim): D = mean over the post-flip window
//   [t_flip, min(t_flip+150,400)) of |err(pool) - err(pool with that attacker zeroed)|, err =
//   |pool - s|, counterfactual pools are reference-side only (MurmurBus.pool, log-odds), never
//   written to the sheet. Sleeper window anchored at t_adm + 25 with t_adm measured per seed on a
//   pass-1 honest-forever A1-wiring run (in-run assert: pass-1 == matrix admission). g1 uses its
//   own window [150, 300). Positive = hurts. The sister is NEVER in the home sheet or the
//   counterfactuals — it is reference-side telemetry only.
//
// PROBE h-PICK (receipted before any run; E38/E39/E40 rule verbatim): the probe is a 1-seed
//   (seed 0) timed run of the full matrix + the h-sweep (sister + pass-1 + A1 + A4 + XI-h for h in
//   hSweep = 7 runs). For each h: delta_h = D_w1(A1, s0) - D_w1(XI_h, s0); hard gates on seed 0:
//   (i) ZERO trips on h2; (ii) D_g1(XI_h, s0) <= D_g1(A1, s0) + 1e-4 (single-seed proxy for R5c's
//   +1 SE form); (iii) founder-trip rate on seed 0 <= 1.0 per 200 rounds (<= 2 trips). PICK:
//   argmax delta_h among h passing ALL gates; ties (|delta| <= 1e-9) -> LARGER h (more
//   conservative). If no h passes all gates: argmax delta among h passing gate (i) alone
//   (receipted relaxed='founder-only'); if still none: argmax delta (relaxed='none'). If h* = hHi:
//   XI1 == XIhi (alias, receipted).
//
// RUNTIME DISCIPLINE (receipted before the full run): probe = the timed seed-0 block (sister +
//   pass-1 + A1 + A4 + the 3-arm h-sweep = 7 runs); projected = t_probe * 8 + 2s IO (conservative:
//   the probe block is >= any matrix seed's work — a matrix seed is <= 5 home runs + 1 cached
//   sister); if projected > 170s, cut seeds 8 -> 6 and RECEIPT the cut (E36-E40 ran ~72-135s at
//   6-8 seeds). The probe doubles as matrix seed 0 (no re-run; the sister stream is cached).
//
// COMPOSITION RECEIPT (stated up front): both mechanisms are EXPERIMENT-LOCAL classes over the
//   murmur/ module APIs — ZERO changes to murmur/ (target: zero). Hooks used:
//   Admission: observe(), reattribute(), notePooled(), admitted(), admittedRound(), probationary(),
//     devMean(), indepCount(), firstSeen (public, read-only), admitWindow/epsNew/admitErr (public)
//   HedgeTrust: weights(), update(), absorb(), weight()
//   MurmurBus.pool() (reference-side counterfactuals + pricing consensus),
//   receipts.sealChain/verifyChain, QuiltEngine (vendored dist).
//
// RNG DOCTRINE (binding, E35-E40 verbatim): all randomness through MothVault (offline:true), one
//   harvest, per-purpose stream keys 'e41:<purpose>:<seed>' via streamFor; NO Math.random. The
//   SISTER uses its own stream keys (e41:sskill:<seed>, e41:svote:<seed>:<i>) — independent acuity
//   and noise draws, SHARED truth s(t). Paired worlds REQUIRE arm-identical world streams — arms
//   never consume different draws. Pricing uses seed 100 — outside the matrix seed set {0..7}.
//
// Run: node experiments/e41_crossinstance.mjs [seeds]   (E41_DEV=1 for a 1-seed dev run; E41_PRICE=1
// for the design-time pricing print on seed 100)

import { QuiltEngine } from '../engine/dist/index.js';
import { HedgeTrust } from '../murmur/trust.mjs';
import { MurmurBus } from '../murmur/bus.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { Provenance } from '../murmur/provenance.mjs';
import { Admission } from '../murmur/admission.mjs';
import { sealChain, verifyChain } from '../murmur/receipts.mjs';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// ---------------- config ----------------
const T = 400, N = 12;
let SEEDS = Number(process.argv[2] || (process.env.E41_DEV ? 1 : 8));
const FLIP_P = 0.02, REROLL_P = 0.01;
const JOIN = 150;                              // newcomers join here
const TOX_Q = 0.25;                            // E24 toxic formula (verbatim)
const PRE = { from: 120, to: 150 };            // pre-attack baseline
const DW = 150;                                // damage window length (receipted)
const KSTAR = 25;                              // carried from E35's probe (probe-optimal)
const SLEEP = 'w1', INSTANT = 'g1', JOINER = 'h2';
const HONEST = Array.from({ length: N }, (_, i) => `a${i + 1}`);
const SIS_HONEST = Array.from({ length: N }, (_, i) => `b${i + 1}`); // sister founders (independent draws)
const ALL_IDS = [...HONEST, SLEEP, INSTANT, JOINER];
const V = ALL_IDS.length; // 15 voice slots (home)
const CFG = { eta: 0.25, share: 0.02 };
const ADM = {
  beta: 0.12, alpha: 0.25, novSpread: 0.15,
  coldStart: true, admitWindow: 40, epsNew: 0.15,
  minEdgesIndep: 2, admitErr: 0.5, capShare: 0.10,
};
// CrossInstanceGuard config — hSweep/hiH SET FROM THE PRICING RUN (seed 100, disjoint) per the
// receipted sweep rule in the header; the pricing.dev row attests the choice inside the chain.
const CI = {
  W: 20,                 // trailing window for the XI cosine (E40-comparable; W=30 priced too)
  sustainWin: 10,        // sustained 5 of the last 10 evaluation rounds (E38/E39/E40 gate shape)
  sustainNeed: 5,
  hSweep: [0.5, 0.8],    // set from pricing (seed 100): floor -0.522 >= the 0.50 cap -> the receipted rule's degenerate case; AMENDED (before probe/matrix, receipted in pricing.dev) to the headroom bars {0.50 (1.0x), 0.80 (1.5x)} — the E40 grid {0.2/0.35/0.5} sits BELOW the floor (0.2/0.35 would cut into it = guaranteed false trips)
  hiH: 0.8,              // conservative sibling = the max-headroom bar (set from pricing)
  variant: 'crossPool',  // chosen by floor tightness from pricing: crossPool -0.522 > crossMed -0.535 (tighter); tie -> crossPool
  epsDen: 1e-12,         // 0/0 guard ONLY (all-neutral window -> rho := 0) — NOT a noise floor (receipted)
  guardRounds: 40,       // epsNew re-probation window (E36-E40 verbatim)
};
const REPROB = { frac: 0.5, horizon: 100 };    // E37 TrustReprobation verbatim
const G1_WIN = { from: JOIN, to: JOIN + DW };  // g1's own window [150, 300)
const TOL = 1e-9;
const PROBE_G1_TOL = 1e-4;                     // receipted probe gate (ii) tolerance
const PRICE_SEED = 100;                        // design-time pricing seed — DISJOINT from matrix seeds 0-7
// E40 RECEIPTED constants (booked for the structural comparison; source:
// experiments/outputs/e40_summary.json @ commit 2a38044, chain tip 0xa47fd893f54d8d17)
const E40_RECEIPT = {
  pricingFounderFloor_W20: -0.369056,   // pricing.W[20].founderFloor (seed 100, e40:* draws)
  matrixFounderFloorMin: -0.620946,     // CM1-cm-h0.5 sensorTelemetry.founderFloorMin (6 seeds)
  w1PostFlipMinPricing: 0.148602,       // pricing.W[20].w1PostFlipMin — POSITIVE (ALIGN-VISIBILITY receipt)
  g1MinPricing: 0.102273,               // pricing.W[20].g1Min — POSITIVE
  founderFalseTripsPer200r: 0,          // the budget finally passed (safety without sight)
};

// ---------------- helpers ----------------
const clampP = (p) => Math.min(0.98, Math.max(0.02, p));
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length); };
const median = (a) => { const b = [...a].sort((x, y) => x - y); const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
const r6 = (x) => (Number.isFinite(x) ? +x.toFixed(6) : x);
// RECEIPTED VAULT DOCTRINE (E17 finding #0): one harvest, per-purpose keys,
// every draw is the FIRST draw of its own cross-key sub-stream.
function makeRng(harvest, vault, purpose) {
  let d = 0;
  return () => vault.streamFor(harvest, `${purpose}:${d++}`)();
}
// paired one-sided sign test, zeros excluded (E28 receipted small-p method)
const binom = (n, k) => { let r = 1; for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1); return r; };
function signTestOneSided(deltas) {
  const W = deltas.filter((d) => d > 1e-12).length;
  const L = deltas.filter((d) => d < -1e-12).length;
  const n = W + L;
  let p = 0;
  for (let k = W; k <= n; k++) p += binom(n, k);
  return { W, L, n, p: p / 2 ** n };
}
const stat = (a) => ({ mean: r6(mean(a)), sd: r6(sd(a)) });
const statOr = (a) => (a.length ? stat(a) : null);
const seOf = (a) => (a.length > 0 ? sd(a) / Math.sqrt(a.length) : 0);
const pearson = (xs, ys) => {
  const mx = mean(xs), my = mean(ys);
  let sxy = 0, vx = 0, vy = 0;
  for (let i = 0; i < xs.length; i++) { const a = xs[i] - mx, b = ys[i] - my; sxy += a * b; vx += a * a; vy += b * b; }
  return vx === 0 || vy === 0 ? null : sxy / Math.sqrt(vx * vy);
};
const snap05 = (x) => Math.max(0.1, Math.round(x / 0.05) * 0.05); // sweep-grid snap (0.10 floor, receipted)
const uncenteredCosine = (win, refKey) => {
  let num = 0, sp2 = 0, sm2 = 0;
  for (const e of win) { const m = e[refKey]; num += e.pv * m; sp2 += e.pv * e.pv; sm2 += m * m; }
  const den = Math.sqrt(sp2 * sm2);
  return den > 1e-12 ? num / den : 0;
};

// ---------------- world (E38/E39/E40 verbatim; stream keys e41:*) ----------------
function genWorld(seed, harvest, vault) {
  const wR = makeRng(harvest, vault, `e41:world:${seed}`);
  const qR = makeRng(harvest, vault, `e41:skill:${seed}`);
  const xR = makeRng(harvest, vault, `e41:tox:${seed}`);
  const shR = makeRng(harvest, vault, `e41:sleep:${seed}`);
  const nhR = makeRng(harvest, vault, `e41:h2:${seed}`);
  const s = new Array(T);
  s[0] = wR() < 0.5 ? 0 : 1;
  for (let t = 1; t < T; t++) s[t] = wR() < FLIP_P ? 1 - s[t - 1] : s[t - 1];
  const q = Array.from({ length: T }, () => new Array(N));
  q[0][0] = 0.9;
  for (let i = 1; i < N; i++) q[0][i] = Math.round((0.5 + 0.45 * qR()) * 1000) / 1000;
  for (let t = 1; t < T; t++) {
    for (let i = 0; i < N; i++) {
      q[t][i] = qR() < REROLL_P ? Math.round((0.5 + 0.45 * qR()) * 1000) / 1000 : q[t - 1][i];
    }
  }
  const vR = [];
  for (let i = 0; i < N; i++) vR.push(makeRng(harvest, vault, `e41:vote:${seed}:${i}`));
  const votes = Array.from({ length: T }, () => new Array(N));
  for (let t = 0; t < T; t++) {
    for (let i = 0; i < N; i++) {
      const signal = vR[i]() < q[t][i] ? s[t] : 1 - s[t];
      votes[t][i] = clampP(signal === 1 ? 0.5 + (q[t][i] - 0.5) : 0.5 - (q[t][i] - 0.5));
    }
  }
  // the TOXIC series — E24 formula VERBATIM (shared by the sleeper post-flip
  // AND the instant toxic newcomer; same toxic values across arms)
  const toxV = new Array(T);
  for (let t = 0; t < T; t++) {
    const signal = xR() < TOX_Q ? s[t] : 1 - s[t];
    toxV[t] = clampP(signal === 1 ? 0.5 + (TOX_Q - 0.5) : 0.5 - (TOX_Q - 0.5));
  }
  // the SLEEPER's honest phase — e24 h1 generator VERBATIM (own edges: the
  // evasion requires passing the independence bar honestly)
  const sleepH = new Array(T).fill(null);
  {
    let qs = Math.round((0.7 + 0.25 * shR()) * 1000) / 1000;
    for (let t = JOIN; t < T; t++) {
      if (shR() < REROLL_P) qs = Math.round((0.7 + 0.25 * shR()) * 1000) / 1000;
      const signal = shR() < qs ? s[t] : 1 - s[t];
      sleepH[t] = clampP(signal === 1 ? 0.5 + (qs - 0.5) : 0.5 - (qs - 0.5));
    }
  }
  // the honest late-joiner h2 — E21/E24 honest-newmember control, honest forever
  const h2V = new Array(T).fill(null);
  {
    let qh = Math.round((0.7 + 0.25 * nhR()) * 1000) / 1000;
    for (let t = JOIN; t < T; t++) {
      if (nhR() < REROLL_P) qh = Math.round((0.7 + 0.25 * nhR()) * 1000) / 1000;
      const signal = nhR() < qh ? s[t] : 1 - s[t];
      h2V[t] = clampP(signal === 1 ? 0.5 + (qh - 0.5) : 0.5 - (qh - 0.5));
    }
  }
  return { s, votes, toxV, sleepH, h2V };
}

// SISTER vote streams — independent acuities + independent noise draws (DIFFERENT RNG streams),
// SAME truth sequence s(t) (the shared external world the two instances observe).
function genSister(seed, harvest, vault, s) {
  const qR = makeRng(harvest, vault, `e41:sskill:${seed}`);
  const q = Array.from({ length: T }, () => new Array(N));
  q[0][0] = 0.9; // a1_S = 0.9 reference (home convention mirrored)
  for (let i = 1; i < N; i++) q[0][i] = Math.round((0.5 + 0.45 * qR()) * 1000) / 1000;
  for (let t = 1; t < T; t++) {
    for (let i = 0; i < N; i++) {
      q[t][i] = qR() < REROLL_P ? Math.round((0.5 + 0.45 * qR()) * 1000) / 1000 : q[t - 1][i];
    }
  }
  const vR = [];
  for (let i = 0; i < N; i++) vR.push(makeRng(harvest, vault, `e41:svote:${seed}:${i}`));
  const votes = Array.from({ length: T }, () => new Array(N));
  for (let t = 0; t < T; t++) {
    for (let i = 0; i < N; i++) {
      const signal = vR[i]() < q[t][i] ? s[t] : 1 - s[t];
      votes[t][i] = clampP(signal === 1 ? 0.5 + (q[t][i] - 0.5) : 0.5 - (q[t][i] - 0.5));
    }
  }
  return { votes, q };
}

// ---------------- sheet (parameterized roster; formulas IDENTICAL for every arm/instance) --
function buildSheet(ids, title, sheetId) {
  const cells = [];
  for (const id of ids) cells.push({ id: `v.${id}`, kind: 'value', value: 0.5, description: `voice ${id} (posterior P(s=1))` });
  for (const id of ids) cells.push({ id: `w.${id}`, kind: 'value', value: 1 / ids.length, description: `influence weight ${id} (protocol-adjusted)` });
  const lg = (x) => `Math.log(clamp(${x},0.02,0.98)/(1-clamp(${x},0.02,0.98)))`;
  const sig = (z) => `(1/(1+Math.exp(-(${z}))))`;
  const hT = [], hD = [];
  for (const id of ids) { hT.push(`w.${id}*${lg(`v.${id}`)}`); hD.push(`w.${id}`); }
  cells.push({ id: 'pool.hedge', kind: 'formula', expr: sig(`(${hT.join(' + ')}) / (${hD.join(' + ')})`) });
  return { id: sheetId, title, cells };
}

// ---------------- DESIGN-TIME PRICING (telemetry only — no engine, no consequences) -----------
// Streams the XI statistic (BOTH reference variants) AND the E40 within-pool ALIGN over the RAW
// world streams on seed PRICE_SEED (disjoint from matrix seeds 0-7). The sister consensus is
// approximated by an EQUAL-WEIGHT MurmurBus.pool over the sister's present votes per round
// (receipted pricing-only approximation; the in-run cS uses the actual sister engine with trust
// evolution — R1 clause (c) prices the in-run floor via the guard's telemetry either way).
// Admission gating NOT simulated (E40 receipted: pricing measures the STATISTIC's floor over
// honest streams, not the guard's evaluation gating). t_adm approximated at 189 (E35 measured 8/8
// admission at t=189) -> flipApprox. No consequences anywhere.
function priceWorld(harvest, vault) {
  const world = genWorld(PRICE_SEED, harvest, vault);
  const sister = genSister(PRICE_SEED, harvest, vault, world.s);
  const flip = 189 + KSTAR;
  const presentP = (id, t) => {
    if (HONEST.includes(id)) return world.votes[t][Number(id.slice(1)) - 1];
    if (id === SLEEP) return t < JOIN ? null : (t < flip ? world.sleepH[t] : world.toxV[t]);
    if (id === INSTANT) return t >= JOIN ? world.toxV[t] : null;
    if (id === JOINER) return t >= JOIN ? world.h2V[t] : null;
    return null;
  };
  const sisVote = (i, t) => sister.votes[t][i];
  const sisPoolOf = (t) => MurmurBus.pool(SIS_HONEST.map((_, i) => sisVote(i, t)), SIS_HONEST.map(() => 1 / N));
  const sisMedOf = (t) => median(SIS_HONEST.map((_, i) => sisVote(i, t)));
  const medOf = (t) => median(ALL_IDS.map((id) => presentP(id, t)).filter((x) => x !== null));
  const REF = {
    crossPool: (t) => sisPoolOf(t) - 0.5,
    crossMed: (t) => sisMedOf(t) - 0.5,
    within: (t) => medOf(t) - 0.5, // E40 statistic verbatim (own-pool median; suspect included)
  };
  const out = { seed: PRICE_SEED, flipApprox: flip, W: {}, toxTruth: {}, rejected: {} };
  // toxic-signature mechanism receipt (measured on this pricing world)
  {
    let pro = 0, closeN = 0;
    const resClose = [], resFar = [];
    for (let t = 0; t < T; t++) {
      if ((world.toxV[t] - 0.5) * (2 * world.s[t] - 1) > 0) pro++;
      const poolHere = MurmurBus.pool(ALL_IDS.map((id) => presentP(id, t)).filter((x) => x !== null), ALL_IDS.map((id) => presentP(id, t) !== null ? 1 / ALL_IDS.length : 0).filter((x) => x > 0));
      const r = Math.abs(world.toxV[t] - poolHere);
      if (r < 0.3) { closeN++; resClose.push(r); } else resFar.push(r);
    }
    const honPro = HONEST.map((id) => {
      let p = 0;
      for (let t = 0; t < T; t++) p += ((presentP(id, t) - 0.5) * (2 * world.s[t] - 1) > 0) ? 1 : 0;
      return p / T;
    });
    out.toxTruth = {
      P_toxProTruth: r6(pro / T),
      founderProTruth: Object.fromEntries(HONEST.map((id, i) => [id, r6(honPro[i])])),
      founderProTruthMean: r6(mean(honPro)), founderProTruthMin: r6(Math.min(...honPro)), founderProTruthMax: r6(Math.max(...honPro)),
      residCloseFrac: r6(closeN / T), residCloseMean: r6(mean(resClose)), residFarMean: r6(mean(resFar)),
      note: 'E24 formula: anti-truth signal (75%) x q<0.5 vote mapping (contradicts signal) = PRO-truth vote ~75% of rounds at |p-0.5|=0.25 — the toxic stream is distribution-identical to an honest q=0.75 voice',
    };
  }
  for (const W of [20, 30]) {
    const per = {};
    for (const id of ALL_IDS) {
      const win = [];
      const rhos = { crossPool: [], crossMed: [], within: [] };
      for (let t = 0; t < T; t++) {
        const p = presentP(id, t);
        if (p === null) continue;
        win.push({ pv: p - 0.5, crossPool: REF.crossPool(t), crossMed: REF.crossMed(t), within: REF.within(t) });
        if (win.length > W) win.shift();
        if (win.length < W) continue;
        for (const k of Object.keys(rhos)) rhos[k].push({ t, rho: uncenteredCosine(win, k) });
      }
      per[id] = rhos;
    }
    const block = {};
    for (const k of ['crossPool', 'crossMed', 'within']) {
      const fmin = HONEST.map((id) => Math.min(...per[id][k].map((x) => x.rho)));
      const fmean = HONEST.map((id) => mean(per[id][k].map((x) => x.rho)));
      const w1Post = per[SLEEP][k].filter((x) => x.t >= flip).map((x) => x.rho);
      const w1Pre = per[SLEEP][k].filter((x) => x.t < flip).map((x) => x.rho);
      const g1All = per[INSTANT][k].map((x) => x.rho);
      // toxic RANK among founders by mean rho (1 = best-aligned) — the wrong-side-of-population receipt
      const ranked = [...HONEST.keys()].sort((a, b) => fmean[b] - fmean[a]);
      const rankOf = (v) => ranked.filter((i) => fmean[i] > v).length + 1;
      block[k] = {
        founderMinRho: Object.fromEntries(HONEST.map((id, i) => [id, r6(fmin[i])])),
        founderFloor: r6(Math.min(...fmin)),
        founderMeanRho: Object.fromEntries(HONEST.map((id, i) => [id, r6(fmean[i])])),
        w1PreFlipMin: r6(Math.min(...w1Pre)), w1PreFlipMean: r6(mean(w1Pre)),
        w1PostFlipMin: r6(Math.min(...w1Post)), w1PostFlipMean: r6(mean(w1Post)),
        g1Min: r6(Math.min(...g1All)), g1Mean: r6(mean(g1All)),
        separation: r6(Math.min(...w1Post) - Math.min(...fmin)), // negative = INSIDE the floor (E40 definition)
        g1Separation: r6(Math.min(...g1All) - Math.min(...fmin)),
        w1PostRankAmongFounders: rankOf(mean(w1Post)), // by MEAN alignment (population position)
        g1RankAmongFounders: rankOf(mean(g1All)),
      };
    }
    // PAIRED per-founder floor delta (cross - within; > 0 = cross-instance floor TIGHTER)
    block.pairedFloorDelta = Object.fromEntries(HONEST.map((id) => [id, r6(block.crossPool.founderMinRho[id] - block.within.founderMinRho[id])]));
    block.pairedFloorDeltaMean = r6(mean(HONEST.map((id) => block.crossPool.founderMinRho[id] - block.within.founderMinRho[id])));
    block.tightenedN = HONEST.filter((id) => block.crossPool.founderMinRho[id] > block.within.founderMinRho[id]).length;
    out.W[W] = block;
  }
  // REJECTED candidate shapes (priced, for the receipt): CENTERED = Pearson(pv, mvS) — centering
  // subtracts the mean-alignment level that IS the hypothesis's signal (E40 receipted for ALIGN);
  // SIGN-AGR = 2*agreeRate-1 — binomial noise on W=20 swamps the separation (E40's OPP lesson).
  {
    const W = 20;
    const cent = {}, sign = {};
    for (const id of ALL_IDS) {
      const win = []; const cs = []; const sg = [];
      for (let t = 0; t < T; t++) {
        const p = presentP(id, t);
        if (p === null) continue;
        win.push({ pv: p - 0.5, crossPool: REF.crossPool(t) });
        if (win.length > W) win.shift();
        if (win.length < W) continue;
        const r = pearson(win.map((e) => e.pv), win.map((e) => e.crossPool));
        cs.push({ t, rho: r === null ? 0 : r });
        sg.push({ t, rho: 2 * mean(win.map((e) => (Math.sign(e.pv) !== 0 && Math.sign(e.crossPool) !== 0 && Math.sign(e.pv) === Math.sign(e.crossPool)) ? 1 : 0)) - 1 });
      }
      cent[id] = cs; sign[id] = sg;
    }
    out.rejected = {
      CENTERED: { founderFloor: r6(Math.min(...HONEST.flatMap((id) => cent[id].map((x) => x.rho)).filter(Number.isFinite))), w1PostFlipMean: r6(mean(cent[SLEEP].filter((x) => x.t >= flip).map((x) => x.rho))), note: 'Pearson centers each window on its own mean — subtracts the mean-alignment level that IS the hypothesis signal (E40 lesson carried)' },
      SIGNAGR: { founderFloor: r6(Math.min(...HONEST.flatMap((id) => sign[id].map((x) => x.rho)))), w1PostFlipMean: r6(mean(sign[SLEEP].filter((x) => x.t >= flip).map((x) => x.rho))), note: '2*agreeRate-1: binomial noise on W=20 swamps the separation (E40 OPP lesson carried)' },
    };
  }
  return out;
}

// __DEFENSES_BEGIN (experiment-local; murmur/ untouched — composition receipt)
// CrossInstanceGuard — CoMovementGuard's plumbing (copied from e40_comovement.mjs: rec/note/apply/
// summary skeleton, guard windows, release events, epsNew throwback, guardRounds accounting,
// throw/rethrow kinds) with the trip statistic swapped for the E41 spec: the CROSS-INSTANCE
// uncentered cosine — sum_W(pv*mvS)/sqrt(sum_W(pv^2)*sum_W(mvS^2)) over the sender's trailing W
// vote-deviations (pv = p - 0.5, protocol-neutral origin) and the SISTER instance's pooled
// consensus deviation (mvS = cS(t) - 0.5, passed in per round from the cached sister run). The
// SAME window also computes the E40 WITHIN-POOL ALIGN twin (rhoW, reference = the round's own
// murmur median — E40's statistic verbatim) as TELEMETRY ONLY: it NEVER gates (receipted — it is
// the paired floor-comparison instrument for the structural R1 clause). NO per-sender baseline
// exists in either statistic. The cosine streams EVERY round (window fills during probation); trip
// EVENTS evaluate only for ADMITTED senders with a full trailing-W window and no open guard window
// (E37 plumbing); sustained gate = 5 of the last 10 evaluation rounds, window RESETS on a trip;
// epsDen = 1e-12 is a 0/0 guard ONLY -> rho := 0 (receipted, NOT a noise floor). Trip event fields:
// rho/sustain + trail30 (trailing-W mean product with the SISTER reference) and refMean = 0
// (protocol-neutral origin — field names keep TrustReprobation byte-verbatim).
class CrossInstanceGuard {
  constructor(adm, cfg) { // cfg: { h, W, sustainWin, sustainNeed, epsDen, guardRounds }
    this.adm = adm; this.cfg = cfg;
    this.wins = new Map();      // id -> [{t, pv, mvS, mvW}] — trailing window (sister + within refs)
    this.signed = new Map();    // id -> Map(t -> p - pooled) — signed residuals (co-toxicity screen telemetry)
    this.susWin = new Map();    // id -> last sustainWin crossed-booleans (the sustained gate)
    this.track = new Map();     // id -> { n, minRho, minRhoAt, maxRho, lastRho, crossedRounds, minRhoW, meanRhoSum } — per-sender telemetry (rho = XI/sister; rhoW = within twin)
    this.w1Path = [];           // SLEEP's full {t, rho, rhoW, crossed} path (mechanism receipt)
    this.g1Path = [];           // INSTANT's full {t, rho, rhoW, crossed} path (R3 mechanism receipt)
    this.suppressed = new Map();// id -> sustained conditions suppressed by an open guard window
    this.guarded = new Map();   // id -> { from, until } — epsNew throwback window
    this.events = [];
    this.guardRounds = new Map();
  }
  rec(id, t, p, mvS, mvW, pool) {
    if (!this.wins.has(id)) this.wins.set(id, []);
    const win = this.wins.get(id);
    win.push({ t, pv: p - 0.5, mvS, mvW });
    if (win.length > this.cfg.W) win.shift();
    if (!this.signed.has(id)) this.signed.set(id, new Map());
    this.signed.get(id).set(t, p - pool);
  }
  note(t, murmurs, pool, cS) { // post-pool: references + window update + sustained-trip check
    if (!murmurs.length) return;
    const mvS = cS - 0.5; // SISTER reference (the E41 statistic)
    const mvW = median(murmurs.map((m) => +m.p)) - 0.5; // WITHIN twin (E40 statistic; TELEMETRY ONLY — never gates)
    for (const m of murmurs) this.rec(m.from, t, +m.p, mvS, mvW, pool);
    for (const m of murmurs) {
      const id = m.from;
      const g = this.guarded.get(id);
      if (g) {
        if (t > g.until) { this.events.push({ t, id, kind: 'release' }); this.guarded.delete(id); }
        // the cosines keep streaming while guarded (spec formula); only the EVENT is gated
      }
      if (!this.adm.admitted(id)) continue; // RELATIONAL: no personal baseline to wait for — only admission
      const win = this.wins.get(id);
      if (!win || win.length < this.cfg.W) continue; // strict trailing-W evaluation (receipted)
      const rho = uncenteredCosine(win, 'mvS');
      const rhoW = uncenteredCosine(win, 'mvW'); // telemetry twin (E40 statistic, same window)
      const crossed = rho < -this.cfg.h;
      let sus = this.susWin.get(id);
      if (!sus) { sus = []; this.susWin.set(id, sus); }
      sus.push(crossed);
      if (sus.length > this.cfg.sustainWin) sus.shift();
      const tr = this.track.get(id) ?? { n: 0, minRho: 1, minRhoAt: t, maxRho: -1, lastRho: 0, crossedRounds: 0, minRhoW: 1, meanRhoSum: 0, meanRhoWSum: 0 };
      tr.n++; tr.lastRho = r6(rho); tr.meanRhoSum += rho; tr.meanRhoWSum += rhoW;
      if (rho < tr.minRho) { tr.minRho = r6(rho); tr.minRhoAt = t; }
      if (rho > tr.maxRho) tr.maxRho = r6(rho);
      if (rhoW < tr.minRhoW) tr.minRhoW = r6(rhoW);
      if (crossed) tr.crossedRounds++;
      this.track.set(id, tr);
      if (id === SLEEP) this.w1Path.push({ t, rho: r6(rho), rhoW: r6(rhoW), crossed });
      if (id === INSTANT) this.g1Path.push({ t, rho: r6(rho), rhoW: r6(rhoW), crossed });
      const sustained = sus.length >= this.cfg.sustainWin && sus.filter(Boolean).length >= this.cfg.sustainNeed;
      if (g) { // guard open: no trip event (E37 plumbing); count suppressed sustained conditions
        if (sustained) this.suppressed.set(id, (this.suppressed.get(id) ?? 0) + 1);
        continue;
      }
      if (sustained) {
        const sCount = sus.filter(Boolean).length; // recorded BEFORE the reset
        this.susWin.set(id, []); // reset the sustained window on trip (receipted E38/E39/E40 analogue)
        const re = this.events.some((e) => e.id === id && (e.kind === 'throw' || e.kind === 'rethrow'));
        this.events.push({
          t, id, kind: re ? 'rethrow' : 'throw',
          rho: r6(rho), sustain: sCount,
          trail30: r6(mean(win.map((e) => e.pv * e.mvS))), refMean: 0, // TrustReprobation-verbatim field names; refMean = protocol-neutral origin (receipted)
        });
        this.guarded.set(id, { from: t + 1, until: t + this.cfg.guardRounds });
      }
    }
  }
  apply(infl, adm, t) { // epsNew for guarded senders (skip ids adm already probationary)
    for (const [id, g] of this.guarded) {
      if (t >= g.from && t <= g.until && infl.has(id) && !adm.probationary(id)) {
        infl.set(id, infl.get(id) * adm.epsNew);
        this.guardRounds.set(id, (this.guardRounds.get(id) ?? 0) + 1);
      }
    }
    return infl;
  }
  summary() {
    const per = {};
    for (const id of [...this.wins.keys()]) {
      const ev = this.events.filter((e) => e.id === id);
      const tr = this.track.get(id) ?? null;
      per[id] = {
        throws: ev.filter((e) => e.kind === 'throw').length,
        rethrows: ev.filter((e) => e.kind === 'rethrow').length,
        guardRounds: this.guardRounds.get(id) ?? 0,
        nEval: tr ? tr.n : 0,
        minRho: tr ? tr.minRho : null, minRhoAt: tr ? tr.minRhoAt : null,
        maxRho: tr ? tr.maxRho : null, lastRho: tr ? tr.lastRho : null,
        meanRho: tr && tr.n ? r6(tr.meanRhoSum / tr.n) : null,
        minRhoW: tr ? tr.minRhoW : null,                       // WITHIN twin floor (telemetry only)
        meanRhoW: tr && tr.n ? r6(tr.meanRhoWSum / tr.n) : null,
        crossedRounds: tr ? tr.crossedRounds : 0,
        suppressedSustained: this.suppressed.get(id) ?? 0,
      };
    }
    return {
      h: this.cfg.h, W: this.cfg.W, sustainWin: this.cfg.sustainWin, sustainNeed: this.cfg.sustainNeed, variant: this.cfg.variant,
      per, events: this.events.map((e) => ({ ...e })), w1Path: this.w1Path.map((x) => ({ ...x })), g1Path: this.g1Path.map((x) => ({ ...x })),
    };
  }
}

// TrustReprobation — E37/E38/E39/E40 VERBATIM (unmodified): drains the detector's event
// log; on every throw/rethrow, decay that sender's HedgeTrust weight to
// frac x its current value via absorb(), then let the NORMAL hedge update path
// re-earn it (fixed-share + exp(eta*r)). Recovery is measured per event against
// 0.95 x pre-trip share within `horizon` rounds (R5e).
class TrustReprobation {
  constructor(fg, trust, cfg) {
    this.fg = fg; this.trust = trust; this.cfg = cfg;
    this.cursor = 0;   // next detector event index to drain
    this.events = [];  // decay receipts
  }
  process(t) { // after def.note(), before trust.update — decay first, re-earn after
    while (this.cursor < this.fg.events.length) {
      const e = this.fg.events[this.cursor++];
      if (e.kind !== 'throw' && e.kind !== 'rethrow') continue;
      const w = this.trust.weights();
      const pre = w.get(e.id) ?? 0;
      w.set(e.id, pre * this.cfg.frac);
      this.trust.absorb(w);
      this.events.push({
        id: e.id, tripT: e.t, decayT: t, kind: e.kind,
        pre: r6(pre), post: r6(this.trust.weight(e.id)),
        trail30: e.trail30, refMean: e.refMean,
        recoveredAt: null, recoveredIn: null, minShare: null, path: [],
      });
    }
  }
  sample(t) { // post-round (after update + absorb): open-event recovery tracking
    for (const ev of this.events) {
      if (ev.recoveredAt !== null || t <= ev.decayT || t > ev.decayT + this.cfg.horizon) continue;
      const s = this.trust.weight(ev.id);
      if (ev.minShare === null || s < ev.minShare) ev.minShare = r6(s);
      if ((t - ev.decayT) % 10 === 0) ev.path.push({ dt: t - ev.decayT, s: r6(s) });
      if (s >= 0.95 * ev.pre) { ev.recoveredAt = t; ev.recoveredIn = t - ev.decayT; }
    }
  }
  summary() {
    return { frac: this.cfg.frac, horizon: this.cfg.horizon, events: this.events.map((e) => ({ ...e, path: e.path.slice() })) };
  }
}
// __DEFENSES_END

// self-measured defense LOC (structure receipt)
function defenseLoc() {
  const src = readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const a = src.indexOf('// __DEFENSES_BEGIN'), b = src.indexOf('// __DEFENSES_END');
  return { loc: src.slice(a, b).split('\n').length - 1, classes: ['CrossInstanceGuard (CoMovementGuard plumbing + E41 cross-instance sister-referenced cosine; within-pool E40 ALIGN carried as a TELEMETRY-ONLY twin)', 'TrustReprobation (E37/E38/E39/E40 verbatim)'] };
}

// SECONDARY telemetry (receipted, gates NOTHING): the attacker co-toxicity screen (E40-carried,
// now vs the sister-referenced guard's residual map). w1 post-flip shares g1's toxic series, so
// their signed residuals (p - pooled) are IDENTICAL post-flip — a would-be cascade detector keyed
// on "suspect correlates with flagged voices" would see corr ~ 1. The null is honest-honest
// co-movement. Also priced: honest-vs-g1 trailing max.
function coToxScreen(guard, flip) {
  const trailMax = (a, b, W = CI.W) => {
    const am = guard.signed.get(a), bm = guard.signed.get(b);
    if (!am || !bm) return null;
    let mx = null;
    for (const [t] of am) {
      const xs = [], ys = [];
      for (let u = t - W + 1; u <= t; u++) { const x = am.get(u), y = bm.get(u); if (x !== undefined && y !== undefined) { xs.push(x); ys.push(y); } }
      if (xs.length < W) continue;
      const r = pearson(xs, ys);
      if (r !== null && (mx === null || r > mx)) mx = r;
    }
    return mx;
  };
  const pairOver = (a, b, tMin) => {
    const am = guard.signed.get(a), bm = guard.signed.get(b);
    if (!am || !bm) return null;
    const xs = [], ys = [];
    for (const [t, x] of am) { if (t < tMin) continue; const y = bm.get(t); if (y !== undefined) { xs.push(x); ys.push(y); } }
    return xs.length >= 20 ? pearson(xs, ys) : null;
  };
  const out = { flip };
  if (flip != null) {
    const r0 = pairOver(SLEEP, INSTANT, flip);
    out.w1g1PostFlipFull = r0 === null ? null : r6(r0);
    out.w1g1LatencyCurve = Object.fromEntries([5, 10, 15, 20, 25, 30, 40].map((k) => {
      const r = pairOver(SLEEP, INSTANT, flip + k);
      return [k, r === null ? null : r6(r)];
    }));
  }
  out.founderVsG1TrailMax = Object.fromEntries(HONEST.map((id) => {
    const r = trailMax(id, INSTANT);
    return [id, r === null ? null : r6(r)];
  }));
  let hhMax = null, hhArg = null;
  for (let i = 0; i < HONEST.length; i++) {
    for (let j = i + 1; j < HONEST.length; j++) {
      const r = trailMax(HONEST[i], HONEST[j]);
      if (r !== null && (hhMax === null || r > hhMax)) { hhMax = r; hhArg = [HONEST[i], HONEST[j]]; }
    }
  }
  out.honestHonestTrailMax = hhMax === null ? null : r6(hhMax);
  out.honestHonestTrailArg = hhArg;
  return out;
}

// ---------------- the SISTER instance run (once per seed; consumed as a read-only reference) ----
async function runSister(seed, world, eng) {
  const ids = SIS_HONEST;
  const trust = new HedgeTrust(ids, CFG);
  const prov = new Provenance({});
  const adm = new Admission(ADM);
  const st = { cS: new Array(T).fill(0.5), poolAcc: 0, verify: { checks: 0, pass: 0, maxDiff: 0 } };
  for (let t = 0; t < T; t++) {
    const murmurs = ids.map((id, i) => ({ from: id, origin: null, p: world.sVotes[t][i] }));
    prov.inspect(murmurs);
    adm.observe(murmurs);
    const rew = new Map();
    for (let i = 0; i < N; i++) rew.set(ids[i], 1 - Math.abs(world.sVotes[t][i] - world.s[t]));
    const raw = prov.penalize(trust.weights());
    const infl = adm.reattribute(raw, murmurs, prov);
    for (let i = 0; i < N; i++) await eng.set(`v.${ids[i]}`, world.sVotes[t][i]);
    for (let i = 0; i < N; i++) await eng.set(`w.${ids[i]}`, infl.get(ids[i]) ?? 0);
    const pool = (await eng.get('pool.hedge')).data;
    adm.notePooled(pool);
    st.cS[t] = pool;
    if (t % 20 === 0) { // engine-parity sheet-verify (same discipline as home arms)
      const ps = ids.map((_, i) => world.sVotes[t][i]);
      const ref = MurmurBus.pool(ps, ids.map((id) => infl.get(id) ?? 0));
      const d = Math.abs(ref - pool);
      st.verify.checks++;
      if (d < TOL) st.verify.pass++;
      if (d > st.verify.maxDiff) st.verify.maxDiff = d;
      if (d >= TOL) throw new Error(`sister sheet-verify mismatch seed=${seed} t=${t} diff=${d}`);
    }
    st.poolAcc += 1 - Math.abs(pool - world.s[t]);
    trust.update(rew);
    trust.absorb(prov.penalize(trust.weights()));
  }
  return { cS: st.cS, poolAcc: st.poolAcc / T, verify: st.verify };
}

// ---------------- arm specs ----------------
// attackers: [{ id, flip }] — flip = toxic start round (null = never flips).
// g1 is ACTIVE in all attack arms (E36 deviation, carried) — R3/R5c need a same-arm baseline.
// A4 carries no attackers.
const armName = (kind, h) => (kind === 'XI1' ? `XI1-xi-h${h}` : `XIhi-xi-h${CI.hiH}`);
function armSpecs(tAdm, hStar, aliased) {
  const flip = tAdm == null ? null : tAdm + KSTAR;
  const atk = [{ id: SLEEP, flip }, { id: INSTANT, flip: JOIN }];
  return {
    'A1-v3.1-sleeper': { name: 'A1-v3.1-sleeper', kind: 'A1', defenses: [], reprob: false, h: null, attackers: atk },
    [armName('XI1', hStar)]: { name: armName('XI1', hStar), kind: 'XI1', defenses: ['xi'], reprob: true, h: hStar, attackers: atk },
    ...(aliased ? {} : {
      [armName('XIhi', hStar)]: { name: armName('XIhi', hStar), kind: 'XIhi', defenses: ['xi'], reprob: true, h: CI.hiH, attackers: atk },
    }),
    'A4-v3.1-clean': { name: 'A4-v3.1-clean', kind: 'A4', defenses: [], reprob: false, attackers: [] },
  };
}

// ---------------- one seed, paired arms ----------------
async function runArm(seed, world, spec, eng, sisC) {
  const { s, votes, toxV, sleepH, h2V } = world;
  const A = spec.name;
  const trust = new HedgeTrust(ALL_IDS, CFG);
  const prov = new Provenance({});
  const adm = new Admission(ADM);
  const xiDef = spec.defenses.includes('xi')
    ? new CrossInstanceGuard(adm, { h: spec.h, W: CI.W, sustainWin: CI.sustainWin, sustainNeed: CI.sustainNeed, epsDen: CI.epsDen, guardRounds: CI.guardRounds, variant: CI.variant })
    : null;
  const reprob = spec.reprob ? new TrustReprobation(xiDef, trust, REPROB) : null;
  const defs = [xiDef].filter(Boolean);
  const atkOf = (id) => spec.attackers.find((a) => a.id === id) ?? null;

  // per-round value of a voice (absent -> 0.5; attacker flips at its flip round)
  const pOf = (id, t) => {
    if (HONEST.includes(id)) return votes[t][Number(id.slice(1)) - 1];
    if (id === SLEEP) {
      const a = atkOf(id);
      if (!a || t < JOIN) return 0.5;
      if (a.flip != null && t >= a.flip) return toxV[t];
      return sleepH[t] ?? 0.5;
    }
    if (id === INSTANT) {
      const a = atkOf(id);
      if (!a || t < JOIN) return 0.5;
      return toxV[t];
    }
    if (id === JOINER) return t >= JOIN ? (h2V[t] ?? 0.5) : 0.5;
    return 0.5;
  };
  const onBus = (id, t) => HONEST.includes(id)
    || (id === JOINER && t >= JOIN)
    || (atkOf(id) != null && t >= JOIN);

  const st = {
    sumErr: 0, err: [], dmg: {}, share: {}, win: {}, attTrustAtFlip: {}, attTrustFinal: {}, convRound: {},
    rec: { [SLEEP]: {}, [INSTANT]: {}, [JOINER]: {} },
    probTrace: [], w1Curve: [],
    toxTruth: { toxPro: 0, toxN: 0, w1PostPro: 0, w1PostN: 0 },
    verify: { checks: 0, pass: 0, maxDiff: 0 },
  };

  for (let t = 0; t < T; t++) {
    const murmurs = [];
    for (let i = 0; i < N; i++) murmurs.push({ from: `a${i + 1}`, origin: null, p: votes[t][i] });
    if (t >= JOIN) {
      if (atkOf(SLEEP)) murmurs.push({ from: SLEEP, origin: null, p: pOf(SLEEP, t) });
      if (atkOf(INSTANT)) murmurs.push({ from: INSTANT, origin: null, p: pOf(INSTANT, t) });
      murmurs.push({ from: JOINER, origin: null, p: pOf(JOINER, t) });
    }
    prov.inspect(murmurs);
    adm.observe(murmurs);

    // ---- rewards (supervised pool; absent senders get HedgeTrust default 0.5)
    const rew = new Map();
    for (let i = 0; i < N; i++) rew.set(`a${i + 1}`, 1 - Math.abs(votes[t][i] - s[t]));
    for (const m of murmurs) if (!HONEST.includes(m.from)) rew.set(m.from, 1 - Math.abs(m.p - s[t]));

    const raw = prov.penalize(trust.weights());
    const infl = adm.reattribute(raw, murmurs, prov);
    for (const d of defs) d.apply(infl, adm, t); // influence-layer consequence (epsNew re-probation)

    // ---- the sheet does the pooled inference (identical formulas) ----
    for (const id of ALL_IDS) await eng.set(`v.${id}`, pOf(id, t));
    for (const id of ALL_IDS) await eng.set(`w.${id}`, infl.get(id) ?? 0);
    const pool = (await eng.get('pool.hedge')).data;
    adm.notePooled(pool);
    for (const d of defs) d.note(t, murmurs, pool, sisC[t]); // <-- the SISTER reference enters HERE (read-only)
    if (reprob) reprob.process(t); // TRUST DECAY: post-pool, pre-update -> re-earn through the normal path

    if (t % 20 === 0) {
      const ps = ALL_IDS.map((id) => pOf(id, t));
      const ref = MurmurBus.pool(ps, ALL_IDS.map((id) => infl.get(id) ?? 0));
      const d = Math.abs(ref - pool);
      st.verify.checks++;
      if (d < TOL) st.verify.pass++;
      if (d > st.verify.maxDiff) st.verify.maxDiff = d;
      if (d >= TOL) throw new Error(`sheet-verify mismatch arm=${A} seed=${seed} t=${t} diff=${d}`);
    }

    // ---- accounting ----
    const err = Math.abs(pool - s[t]);
    st.sumErr += 1 - err;
    st.err.push(err);
    // toxic-signature mechanism counters (per-seed measured, not assumed)
    if (atkOf(INSTANT) && t >= JOIN) { st.toxTruth.toxN++; if ((toxV[t] - 0.5) * (2 * s[t] - 1) > 0) st.toxTruth.toxPro++; }
    const wA0 = atkOf(SLEEP);
    if (wA0 && wA0.flip != null && t >= wA0.flip) { st.toxTruth.w1PostN++; if ((toxV[t] - 0.5) * (2 * s[t] - 1) > 0) st.toxTruth.w1PostPro++; }

    // admission records: FIRST round each newcomer is adm-admitted (native)
    for (const id of [SLEEP, INSTANT, JOINER]) {
      const rec = st.rec[id];
      if (rec.admitExpT === undefined && onBus(id, t) && adm.admitted(id)) {
        rec.admitExpT = t;
        rec.admRound = adm.admittedRound(id);
        rec.devMean = adm.devMean(id);
        rec.indep = adm.indepCount(id);
      }
    }
    // E35-verbatim probation trace for the sleeper (while adm-probationary)
    const wA = atkOf(SLEEP);
    if (wA && t >= JOIN && t < (wA.flip ?? T) && adm.probationary(SLEEP)) {
      st.probTrace.push(Math.abs(pOf(SLEEP, t) - pool));
    }

    // damage windows: per-attacker counterfactual (zero THAT attacker only; HOME pool only —
    // the sister is reference-side telemetry and NEVER enters the home sheet or counterfactuals)
    for (const a of spec.attackers) {
      if (a.flip == null) continue;
      const from = a.flip, to = Math.min(a.flip + DW, T);
      if (t >= from && t < to) {
        if (st.win[a.id] === undefined) st.win[a.id] = { from: t, to: t + 1 };
        st.win[a.id].to = t + 1;
        const ps = ALL_IDS.map((id) => pOf(id, t));
        const wFull = ALL_IDS.map((id) => infl.get(id) ?? 0);
        const wCf = wFull.map((w, i) => (ALL_IDS[i] === a.id ? 0 : w));
        const poolCf = MurmurBus.pool(ps, wCf);
        (st.dmg[a.id] = st.dmg[a.id] ?? []).push(err - Math.abs(poolCf - s[t]));
        (st.share[a.id] = st.share[a.id] ?? []).push((infl.get(a.id) ?? 0) / ([...infl.values()].reduce((x, y) => x + y, 0) || 1));
      }
    }

    // attacker trust trajectory (sleeper): pre-update weight at flip + conviction round
    if (wA) {
      const ws = trust.weights();
      const honMed = median(HONEST.map((id) => ws.get(id) ?? 0));
      if (wA.flip != null && t === wA.flip) st.attTrustAtFlip[SLEEP] = r6(ws.get(SLEEP) ?? 0);
      if (st.convRound[SLEEP] === undefined && honMed > 0 && (ws.get(SLEEP) ?? 0) < 0.25 * honMed) st.convRound[SLEEP] = t;
    }

    // ---- learn ----
    trust.update(rew);
    trust.absorb(prov.penalize(trust.weights()));
    if (reprob) reprob.sample(t); // R5e recovery sampling on post-round shares
    if (t >= JOIN) st.w1Curve.push(r6(trust.weight(SLEEP) ?? 0)); // R4 post-round trust path
  }

  // sensor trip record for the sleeper (latency anchored at the flip round)
  let w1Trip = null;
  const wApost = atkOf(SLEEP);
  if (xiDef && wApost && wApost.flip != null) {
    const trips = xiDef.events.filter((e) => e.id === SLEEP && (e.kind === 'throw' || e.kind === 'rethrow'));
    const post = trips.filter((e) => e.t >= wApost.flip);
    const pre = trips.filter((e) => e.t < wApost.flip);
    w1Trip = {
      flip: wApost.flip,
      nTrips: trips.length, nPostFlip: post.length, nPreFlip: pre.length,
      firstPostFlipT: post.length ? post[0].t : null,
      latency: post.length ? post[0].t - wApost.flip : null,
      tripTs: trips.map((e) => e.t),
    };
  }
  // sensor trip record for g1 (R3 — latency anchored at g1's ADMISSION round)
  let g1Trip = null;
  if (xiDef) {
    const trips = xiDef.events.filter((e) => e.id === INSTANT && (e.kind === 'throw' || e.kind === 'rethrow'));
    g1Trip = {
      nTrips: trips.length,
      firstT: trips.length ? trips[0].t : null,
      admitExpT: st.rec[INSTANT].admitExpT ?? null,
      latencyFromAdmission: trips.length && st.rec[INSTANT].admitExpT !== undefined ? trips[0].t - st.rec[INSTANT].admitExpT : null,
      tripTs: trips.map((e) => e.t),
    };
  }

  // SECONDARY telemetry (receipted): co-toxicity screen, defense arms only
  const screen = xiDef ? coToxScreen(xiDef, wApost?.flip ?? null) : null;

  const errPre = st.err.slice(PRE.from, PRE.to);
  const dmgOf = (id) => (st.dmg[id] ? mean(st.dmg[id]) : null);
  return {
    name: A,
    poolAcc: st.sumErr / T,
    errPre: mean(errPre),
    dmgW1: dmgOf(SLEEP), dmgG1: dmgOf(INSTANT),
    winW1: st.win[SLEEP] ?? null, winG1: st.win[INSTANT] ?? null,
    shareW1: st.share[SLEEP] ? mean(st.share[SLEEP]) : null,
    shareG1: st.share[INSTANT] ? mean(st.share[INSTANT]) : null,
    attTrustAtFlip: st.attTrustAtFlip[SLEEP] ?? null,
    attTrustFinal: st.attTrustFinal[SLEEP] ?? r6(trust.weight(SLEEP)),
    convRound: st.convRound[SLEEP] ?? null,
    honQFinal: mean(HONEST.map((id) => trust.weight(id))),
    w1Curve: st.w1Curve,
    w1Trip,
    g1Trip,
    w1: {
      ...st.rec[SLEEP],
      probTraceN: st.probTrace.length,
      probTraceMean: st.probTrace.length ? mean(st.probTrace) : null,
      probTraceMax: st.probTrace.length ? Math.max(...st.probTrace) : null,
    },
    h2: st.rec[JOINER], g1: st.rec[INSTANT],
    toxTruth: {
      g1ProTruth: st.toxTruth.toxN ? r6(st.toxTruth.toxPro / st.toxTruth.toxN) : null,
      w1PostProTruth: st.toxTruth.w1PostN ? r6(st.toxTruth.w1PostPro / st.toxTruth.w1PostN) : null,
    },
    defense: {
      xi: xiDef ? xiDef.summary() : null,
      reprob: reprob ? reprob.summary() : null,
    },
    screen,
    verify: st.verify,
    err: st.err,
  };
}

// ---------------- main ----------------
console.log(`── E41 cross-instance lane · CrossInstanceGuard sweep ${CI.hSweep.join('/')} · W=${CI.W} · ${T} rounds · home ${V} slots + sister ${N} founders ──`);
const vault = new MothVault({ label: 'e41', offline: true });
const harvest = await vault.harvest(256);
console.log(`vault: ${harvest.mock ? 'MOCK (offline doctrine)' : 'LIVE ' + harvest.jobId} digest=${harvest.poolDigest.slice(0, 10)} bits=${harvest.bits.length}`);

// design-time pricing (re-computed in-run; booked BEFORE any run row — R1 clause (a))
const pricing = priceWorld(harvest, vault);

if (process.env.E41_PRICE) {
  console.log(`\n══ E41 DESIGN-TIME PRICING (seed ${PRICE_SEED}, disjoint from matrix seeds 0-7; flip approx t=${pricing.flipApprox}) ══`);
  console.log(`\ntoxic signature: ${JSON.stringify(pricing.toxTruth)}`);
  for (const W of [20, 30]) {
    const p = pricing.W[W];
    console.log(`\nW=${W}:`);
    for (const k of ['crossPool', 'crossMed', 'within']) {
      const b = p[k];
      console.log(`  [${k}] honest floor min ${b.founderFloor} | per-founder minRho ${HONEST.map((id) => `${id}:${b.founderMinRho[id]}`).join(' ')}`);
      console.log(`          w1 pre-flip min ${b.w1PreFlipMin} mean ${b.w1PreFlipMean} | post-flip min ${b.w1PostFlipMin} mean ${b.w1PostFlipMean} (separation vs floor ${b.separation}, rank ${b.w1PostRankAmongFounders}/12)`);
      console.log(`          g1 min ${b.g1Min} mean ${b.g1Mean} (separation ${b.g1Separation}, rank ${b.g1RankAmongFounders}/12)`);
    }
    console.log(`  PAIRED floor delta (crossPool - within, per founder): ${JSON.stringify(p.pairedFloorDelta)}`);
    console.log(`  pairedFloorDeltaMean ${p.pairedFloorDeltaMean} | tightenedN ${p.tightenedN}/12`);
  }
  console.log(`\nrejected candidates: ${JSON.stringify(pricing.rejected)}`);
  process.exit(0);
}

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });
book('run.config', {
  task: 'E41', name: 'the cross-instance detector (a sister instance\'s pooled consensus as the detector reference, composed with trust re-probation vs the E35 sleeper)',
  collides: 'E40 carried seed — E40 KILLED the relational within-pool ALIGN cosine (SAFE but BLIND: 0 founder trips/200r — the budget finally passed — yet 0/6 sleeper trips, 0/6 g1 visibility, post-flip cosine INSIDE the honest floor range 6/6 — the flip is a relational REGIME CHANGE, not a level change; honest-honest trailing corr 0.997 killed the cascade axis too). THREE axes are receipted dead: mean (E38), variance (E39), relational-within-pool (E40) — all read only the suspect\'s OWN pool. The ExoJ dogfood field (E24-a e_x3) SELECTED cross_instance (Delta 0.5221). E41 builds the cross-instance sensor: a SISTER INSTANCE (independent honest founders, independent RNG streams, SAME truth) supplies the detector reference — honest voices in both instances co-move with TRUTH (independent noises), so the hypothesized toxic signature is ANTI-alignment with the sister consensus',
  T, N, voices: V, sisterFounders: N, seeds: SEEDS, kStarCarried: KSTAR,
  kStarNote: 'k* = 25 carried from E35 (probe-optimal on the train seed; GAN strategy search CLOSED in E35, not re-run)',
  world: { stateFlipP: FLIP_P, skillRerollP: REROLL_P, qRange: [0.5, 0.95], a1Acuity: 0.9, toxicFormula: { id: 'E24 verbatim', acuity: TOX_Q, note: 'toxV shared by w1 post-flip AND g1 (same toxic values across arms). MEASURED CAVEAT carried from the pricing: the E24 formula\'s q<0.5 vote mapping CONTRADICTS its anti-truth signal — the toxic vote is PRO-truth ~72-75% of rounds at weak magnitude, i.e. distribution-identical to an honest q=0.75 voice; the hypothesis\'s anti-truth signature is TESTED, not assumed' }, streamKeys: 'e41:* (fresh draws; generator E38/E39/E40 verbatim); sister streams e41:sskill/e41:svote (independent draws, SAME truth)' },
  sisterDesign: {
    what: 'a second INDEPENDENT murmur instance: 12 honest founders b1..b12, own acuities + own noise draws (independent RNG streams), observing the SAME truth sequence s(t) each round, SAME murmur engine settings (HedgeTrust + Provenance + Admission + sheet pool.hedge, supervised rewards)',
    clean: 'NO attackers, NO newcomers on the sister — the reference instance is uncontaminated BY DESIGN (that is the hypothesis being tested)',
    consumption: 'runs ONCE per seed (arm-identical by determinism: same draws, no attackers, no defense); the home guard consumes cS(t) = sister pool.hedge as a READ-ONLY reference stream; the sister NEVER enters the home sheet, the home pool, or the counterfactuals',
    pricingApprox: 'pricing (no engine) approximates cS by an equal-weight MurmurBus.pool over present sister votes per round — receipted; the in-run floor is priced by the guard telemetry regardless',
  },
  attack: {
    joinRound: JOIN,
    sleeper: { id: SLEEP, honestPhase: 'e24 h1 generator verbatim (expert acuity, iid errors, own edges)', flip: 't_adm + 25; t_adm per seed from a pass-1 honest-forever A1-wiring run (in-run assert pass1 == matrix)' },
    flasher: { id: INSTANT, note: 'toxic FROM arrival t=150 — the R3 VISIBILITY target (the standing relational hope: a cross-instance reference needs no personal history)' },
    honestJoiner: { id: JOINER, note: 'honest forever, present in ALL arms — the false-positive canary' },
  },
  armsPlan: ['A1-v3.1-sleeper (control)', 'XI1-xi-h* (candidate; h* picked by the receipted probe rule from the sweep)', 'XIhi-xi-hHi (conservative sibling; aliases XI1 if h* = hHi)', 'A4-v3.1-clean (collateral baseline)'],
  defenses: {
    crossInstanceGuard: {
      ...CI, reprob: REPROB,
      statistic: 'XI — a cross-instance RELATIONAL cosine with NO per-sender baseline: per round, the SISTER instance\'s pooled consensus deviation mvS(t) = cS(t) - 0.5 (protocol-neutral origin) and the suspect\'s vote deviation pv_i(t) = p_i(t) - 0.5; rho_i(t) = sum_W(pv*mvS) / sqrt(sum_W(pv^2)*sum_W(mvS^2)) over the trailing W=20 rounds (UNCENTERED by design — E40\'s receipted note carries: centering would subtract the mean-alignment signal; this is a cosine, not a Pearson — CENTERED priced and rejected in pricing.dev); TRIP when rho < -h SUSTAINED 5-of-10 evaluation rounds (window resets on trip). Hypothesis: honest suspect\'s errors are independent of the sister\'s noise (co-move with TRUTH only); a toxic ANTI-truth phase goes strongly NEGATIVE',
      withinTwin: 'the SAME guard window computes the E40 within-pool ALIGN (reference = own murmur median, suspect included) as rhoW — TELEMETRY ONLY, NEVER gates; it is the PAIRED instrument for the structural R1 clause (is the cross-instance floor tighter than the within-pool floor — the reason this axis was chosen), measured in-run on the same seeds',
      epsDenReceipt: `epsDen = ${CI.epsDen} guards a literal 0/0 (all-neutral window -> rho := 0) ONLY — NOT a noise floor; no per-sender scale exists in this statistic`,
      plumbing: 'CoMovementGuard/FlipGuard plumbing verbatim from e37-e40: guard window {from: t+1, until: t+40} on trip, release events, epsNew throwback each guarded round (skipping adm-probationary ids), guardRounds accounting, throw/rethrow kinds; the cosines stream EVERY round (window fills during probation), trip EVENTS evaluate only for ADMITTED senders with a full trailing-W window and no open guard window; suppressed sustained conditions counted in telemetry',
      consequence: 'DETECTOR SWAP ONLY — on trip -> BOTH layers exactly as E37/E38/E39/E40: TrustReprobation (HedgeTrust weight x0.5 via absorb, post-pool pre-update, re-earns through the normal fixed-share + exp(eta*r) path; class copied VERBATIM — trip events carry trail30/refMean fields so it stays byte-identical; trail30 = trailing-W mean product with the SISTER reference, refMean = 0) + influence re-probation (epsNew for 40 guard rounds)',
      rationale: 'all three dead sensors read only the suspect\'s OWN pool — where shared pool-lag bursts and shared truth make honest voices highly correlated (E40: honest-honest trailing corr max 0.997) and the honest floor as wide as the signal. A second independent instance observing the SAME truth breaks the own-pool collapse: the sister\'s consensus error is contaminated by INDEPENDENT noise only. The hypothesis\'s toxic signature (anti-truth -> negative alignment) is tested as stated; the toxic-signature mechanism receipt (P(pro-truth), residual bimodality, alignment RANK among founders) is booked whatever the verdict',
    },
    secondary: {
      coToxScreen: 'attacker co-toxicity screen (telemetry ONLY, gates NOTHING; E40-carried): w1 post-flip shares g1\'s toxV — their signed residuals (p - pooled) are IDENTICAL post-flip; priced per seed vs the honest-honest / honest-vs-g1 trailing maxima (the would-be cascade detector\'s signal and null, now against the sister-referenced guard\'s residual map)',
    },
  },
  composition: {
    murmurChanges: 'NONE (target zero) — both mechanisms are experiment-local classes over public murmur/ APIs',
    apis: ['Admission.observe/reattribute/notePooled/admitted/admittedRound/probationary/devMean/indepCount/firstSeen(read)/admitWindow/epsNew/admitErr', 'HedgeTrust.weights/update/absorb/weight', 'Provenance.inspect/penalize', 'MurmurBus.pool (reference-side counterfactuals + pricing consensus)', 'receipts.sealChain/verifyChain', 'QuiltEngine (vendored dist)'],
    layerNote: 'XI arms deliberately MOVE trust (E37\'s TrustReprobation is the proven consequence); decay fires post-pool pre-update (same seam as adm.notePooled / the detector\'s note); re-trips allowed (a persistent liar re-sustains during its guard window and retrips at/after release)',
    timing: 'CrossInstanceGuard updates post-pool every round from window-full; trip consequence effective next round (guard from t+1) — E36-E40 plumbing timing verbatim; the sister runs its own engine per seed BEFORE the home arms and is cached (arm-identical by determinism)',
  },
  hedge: CFG, admission: ADM,
  founders: 'D1 genesis acclamation (newcomers w1/g1/h2 join t=150: probationary from firstSeen; sister founders are genesis too)',
  absentSenderReward: 'missing ids get HedgeTrust default 0.5 (unproven prior) while absent; roster = 15 home slots in every arm (e33/e35-e40 convention) + the separate 12-slot sister sheet',
  reward: 'r_i = 1 - |p_i - s_t| (supervised pool — pool-independent, so trust re-earning is not gated by the defense)',
  rng: 'MothVault offline:true, one harvest, per-purpose keys e41:<purpose>:<seed>[:<voice>] via streamFor; NO Math.random; the SISTER uses its own keys (independent acuity/noise draws) and the SHARED truth s(t); paired worlds REQUIRE arm-identical world streams (arms select over shared values); pricing seed 100 is DISJOINT from matrix seeds 0-7',
  metrics: {
    D_w1: 'mean over [t_adm+25, min(t_adm+25+150,400)) of |pool - s_t| - |pool_cf - s_t| (E24/E35-E40 counterfactual, sleeper zeroed, reference-side log-odds, never written to the sheet; positive = hurts)',
    D_g1: 'same method over g1\'s own window [150, 300), g1 zeroed',
    honestFinalQ: 'mean HedgeTrust weight of the 12 honest incumbents at t=T-1 (post final update+absorb)',
    tripLatencyW1: 'first CrossInstanceGuard throw event on w1 with t >= t_flip, minus t_flip (rounds)',
    tripLatencyG1: 'first throw event on g1 minus g1\'s own admission round (rounds) — the R3 visibility clock',
    toxicRank: 'the toxic voice\'s alignment RANK among the honest founders by mean rho (1 = best-aligned) — the wrong-side-of-population receipt',
  },
  decisionRules: {
    R1_honestFloor_PRIMARY: 'R1 HONEST-NOISE FLOOR (priced BEFORE composition): per-founder trailing cross-instance alignment distribution on honest phases, measured (a) design-time pricing seed 100 (booked as pricing.dev BEFORE any run row), (b) probe seed-0 guard arms, (c) the full matrix XI1 arm; false-trip projection = founder throw+rethrow events per 200 rounds arm-wide vs budget 1.0 (E38 29.9 = 30x fail, E39 9.375 = 9.4x fail, E40 0 = pass); R1 PASSES iff the MATRIX arm-wide founder rate <= 1.0. STRUCTURAL CLAUSE (the reason this axis was chosen): is the cross-instance honest floor TIGHTER than the within-pool floor? Priced (a) paired on seed 100 (same world, both references), (b) paired in-run via the guard\'s rhoW twin, (c) vs E40\'s RECEIPTED numbers (pricing floor -0.369056, matrix floor -0.620946). TIGHTER iff matrix cross floor min > matrix within floor min AND paired per-founder delta > 0 for a majority of founders on the pricing seed; else NOT-TIGHTER. If the floor is wide again, that IS the finding',
    R2_detection: 'R2 DETECTION: sleeper trips post-flip; PASS iff tripped seeds >= half AND mean latency < 30 rounds over tripped seeds; pre-flip w1 trips receipted (false trips on an honest-phase voice)',
    R3_g1Visibility: 'R3 g1 VISIBILITY: the from-arrival toxic MUST be visible (the standing relational hope — the one place a cross-instance reference beats self-calibration: no personal history needed); PASS iff g1 throws in >= 2/3 of seeds; latency measured from g1\'s own admission round',
    R4_damage: 'R4 COUNTERFACTUAL DAMAGE (composition, when the guard fires): D(XI1) < D(A1): paired one-sided sign test (zeros excluded) p < 0.05; report paired delta +/- SE and damage ratio D(XI1)/D(A1); XIhi alongside (the sensitivity trade) but the crown rides on XI1; g1 damage on the same footing (an INCREASE beyond A1 + 1 SE fails R5c). Vacuous if no trips (receipted, E40 precedent)',
    R5_canaries: 'R5 CANARIES — (a) honQ within 1 SE of A4 (seed-paired; XI arms move trust by design — trustMoved receipted per seed); (b) h2: ZERO defense trips AND per-seed admission outcome identical to A1\'s (arm-invariance; the native admission miss is admission\'s property, receipted per seed); (c) g1 damage <= A1 + 1 SE; (d) FALSE-TRIP BUDGET explicit: total honest-founder trips + per-founder histogram + rate <= 1.0/200r arm-wide; (e) RECOVERY: false-tripped founders re-earn to >= 95% of pre-trip trust share within 100 rounds (E37 baseline 23/25, mean 19.1r — must not regress); events without a full 100-round horizon receipted but excluded; vacuous pass if no trips',
    crown: 'if XI1 passes R1 + R2 + R3 + R4 + R5, crown it (damage ratio, sleeper latency, g1 containment). If the floor is wide again or detection is 0/x: HONEST NEGATIVE with computed mechanism — the ladder continues and THAT is the crown. No pre-drafted text: every clause filled from measured numbers',
    toxSignature: 'MECHANISM RECEIPT (booked whatever the verdict): P(toxV pro-truth) per seed + pricing; residual bimodality (E39\'s 75%-close/25%-far); the toxic voice\'s alignment RANK among the honest founders by mean rho — if the attacker aligns BETTER than the honest median, no bar in alignment space (low or high) separates it without tripping the weaker half of the honest pool (wrong-side-of-population); the four-axis ladder then closes with a mechanism: the E24 toxic stream is distribution-identical to an honest q=0.75 voice, so NO vote-stream statistic (self-calibrated, within-pool, or cross-instance) can see it — the signal must come from provenance/copy structure or pool-damage attribution',
  },
  probeRule: {
    hSweep: CI.hSweep,
    gates: '(i) ZERO trips on h2 on seed 0; (ii) D_g1(XI_h, s0) <= D_g1(A1, s0) + 1e-4 (single-seed proxy for R5c +1 SE); (iii) founder-trip rate on seed 0 <= 1.0 per 200 rounds (<= 2 trips)',
    pick: 'argmax delta_h = D_w1(A1,s0) - D_w1(XI_h,s0) among h passing all gates; ties |delta| <= 1e-9 -> LARGER h; fallback ladder: none pass all -> argmax delta among gate-(i) passers (relaxed=founder-only) -> argmax delta (relaxed=none); h* = hHi -> XI1 aliases XIhi (receipted, no re-run)',
    pickBefore: 'the pick row (sensor.hpick) is booked BEFORE any full-matrix run row; the probe block doubles as matrix seed 0 (no re-run; sister cached)',
  },
  runtimeRules: `probe = the timed seed-0 block (sister + pass-1 + A1 + A4 + the ${CI.hSweep.length}-arm h-sweep = ${3 + CI.hSweep.length + 1} runs); projected = t_probe * 8 + 2s IO (receipted; conservative — a matrix seed needs <= ${2 + CI.hSweep.length} home runs + 1 cached sister); if projected > 170s cut seeds 8 -> 6 and RECEIPT the cut (E36-E40 ran ~72-135s at 6-8 seeds); NO script edits after the final run (stale-artifact doctrine)`,
  sweepProvenance: 'sweep rule receipted BEFORE the pricing run: hLo = snap(1.0x|floor|), hMid = snap(1.5x|floor|), hHi = min(0.50, snap(2.0x|floor|)) on the 0.05 grid (0.10 floor) from the seed-100 pricing floor; variant = argmax floor TIGHTNESS between crossPool (sister pooled consensus — the instance\'s actual belief object) and crossMed (sister median vote — estimator-matched to E40); tie -> crossPool; W = 20 (E40-comparable; W=30 priced). AMENDMENT (dev-phase, BEFORE probe/matrix, attested in pricing.dev): the pricing floor |f| = 0.522202 reaches the rule\'s 0.50 practical cap (degenerate case: hLo = 0.5, hMid = 0.8, hHi capped at 0.5 < hMid) — the E40 grid {0.2, 0.35, 0.5} sits BELOW the cross-instance floor (bars 0.2/0.35 would cut into it = designed-in false trips, violating the price-the-floor-first house law), so the sweep becomes the headroom bars {0.50 (1.0x), 0.80 (1.5x)} and hiH = 0.80 (the max-headroom bar); the pricing re-computation in-run books the same numbers',
  e40Receipted: E40_RECEIPT,
  pricing: pricing, // R1 clause (a) — booked BEFORE any run row
  defenseLoc: defenseLoc(),
  vault: { mock: harvest.mock, digest: harvest.poolDigest },
  engine: 'vendored quilt dist (QuiltEngine); TWO engines per seed: home (15 slots) + sister (12 slots)',
  sheetVerifyTol: TOL,
});
book('pricing.dev', {
  rule: 'R1 clause (a): design-time honest-noise floor pricing on seed 100 (disjoint from matrix seeds 0-7); BOTH reference variants + the E40 within-pool statistic priced on the SAME world streams (paired); sister consensus approximated by equal-weight MurmurBus.pool over sister votes (receipted pricing-only approximation); admission gating NOT simulated (E40 receipted); t_adm approximated at 189 -> flipApprox; telemetry only — no engine, no consequences',
  seed: PRICE_SEED, W20: pricing.W[20], W30: pricing.W[30], toxTruth: pricing.toxTruth, rejectedCandidates: pricing.rejected,
  sweepSetFromThis: { hSweep: CI.hSweep, hiH: CI.hiH, variant: CI.variant, W: CI.W, rule: 'see run.config.sweepProvenance' },
});

// ---------------- phase 0.5: the sweep constants are SET FROM THIS PRICING (already applied above)
// (the constants in CI were set from this exact pricing before the final run — the pricing.dev row
// attests them inside the chain; the sweep rule is receipted in run.config)

// ---------------- phase 1: probe (seed 0) — full matrix + h-sweep ----------------
const world0 = genWorld(0, harvest, vault);
world0.sVotes = genSister(0, harvest, vault, world0.s).votes;
const engSis0 = new QuiltEngine('e41-s0-sister', {});
engSis0.loadSheet(buildSheet(SIS_HONEST, 'E41 sister instance (seed 0)', 'e41-sister-s0'));
const probeStart = Date.now();
const sister0 = await runSister(0, world0, engSis0);
const eng0 = new QuiltEngine('e41-s0', {});
eng0.loadSheet(buildSheet(ALL_IDS, 'E41 cross-instance lane (15 voice slots)', `e41-xi-${V}`));
const engP1 = new QuiltEngine('e41-s0-p1', {});
engP1.loadSheet(buildSheet(ALL_IDS, 'E41 pass-1 (15 voice slots)', `e41-p1-${V}`));
const p1 = await runArm(0, world0, { name: 'pass1', kind: 'pass1', defenses: [], reprob: false, h: null, attackers: [{ id: SLEEP, flip: null }, { id: INSTANT, flip: JOIN }] }, engP1, sister0.cS);
if (p1.w1.admitExpT === undefined) console.log('  seed 0: sleeper NOT admitted under honest behavior — attack cannot launch (receipted as neverLaunched)');
const tAdm0 = p1.w1.admitExpT;
const probe = { A1: null, A4: null, C: {} };
for (const spec of [
  { name: 'A1-v3.1-sleeper', kind: 'A1', defenses: [], reprob: false, h: null, attackers: armSpecs(tAdm0, 2, false)['A1-v3.1-sleeper'].attackers },
  { name: 'A4-v3.1-clean', kind: 'A4', defenses: [], reprob: false, h: null, attackers: [] },
  ...CI.hSweep.map((h) => ({ name: `probe-h${h}`, kind: 'probe', defenses: ['xi'], reprob: true, h, attackers: armSpecs(tAdm0, 2, false)['A1-v3.1-sleeper'].attackers })),
]) {
  probe[spec.kind === 'probe' ? `h${spec.h}` : spec.kind] = await runArm(0, world0, spec, eng0, sister0.cS);
}
const probeMs = Date.now() - probeStart;
const projected = (probeMs / 1000) * 8 + 2;
let cut = null;
if (projected > 170 && SEEDS === 8) { SEEDS = 6; cut = 'seeds cut 8 -> 6 by the probe rule (projected > 170s); paired claims preserved'; }
else if (projected > 170) { cut = `seeds already ${SEEDS} (< 8); projected ${projected.toFixed(0)}s still > 170s — proceeding at minimum receipted fallback`; }
book('probe.seed0', {
  seed: 0, timed: true, probeBlock_s: +(probeMs / 1000).toFixed(1), runs: 3 + CI.hSweep.length + 1, sisterIncluded: true,
  tAdmExp: tAdm0, pass1DevMean: p1.w1.devMean, pass1Indep: p1.w1.indep,
  sister: { poolAcc: r6(sister0.poolAcc), verify: `${sister0.verify.pass}/${sister0.verify.checks}` },
  w1ProbTraceMax_A1: probe.A1.w1.probTraceMax,
  note: `probe = 1-seed timed run of the full matrix + h-sweep (sister + ${2 + CI.hSweep.length} home runs); doubles as matrix seed 0 (no re-run; sister cached)`,
});
book('runtime.probe', {
  tProbe_s: +(probeMs / 1000).toFixed(1),
  projected_8seeds_s: +projected.toFixed(1),
  projectedFormula: 't_probe * 8 + 2s IO (receipted; conservative — a matrix seed needs <= 5 home runs + 1 cached sister)',
  seedDecision: SEEDS, cut: cut ?? 'none — full plan within budget',
  e36e37e38e39e40Reference_s: '130.1 / 134.7 / 100.7 / 95.2 / 71.8s matrix at 6-8 seeds',
});
console.log(`probe(seed 0): ${+(probeMs / 1000).toFixed(1)}s -> projected(8 seeds)=${projected.toFixed(0)}s -> seeds=${SEEDS}${cut ? ' (CUT)' : ''}`);

// ---------------- phase 1b: the h pick (receipted rule) ----------------
const founderTripCount = (R) => Object.entries(R.defense.xi.per)
  .filter(([id]) => HONEST.includes(id)).reduce((a, [, p]) => a + p.throws + p.rethrows, 0);
const h2TripCount = (R) => {
  const p = R.defense.xi.per[JOINER];
  return p ? p.throws + p.rethrows : 0;
};
const sweepTable = CI.hSweep.map((h) => {
  const R = probe[`h${h}`];
  const delta = probe.A1.dmgW1 - R.dmgW1;
  const gates = {
    h2Trips: h2TripCount(R),
    g1Delta: r6(R.dmgG1 - probe.A1.dmgG1),
    g1Gate: R.dmgG1 - probe.A1.dmgG1 <= PROBE_G1_TOL,
    founderTrips: founderTripCount(R),
    founderRatePer200r: r6(founderTripCount(R) / (T / 200)),
    founderGate: founderTripCount(R) / (T / 200) <= 1.0,
  };
  const w1 = R.w1Trip;
  return {
    h, delta: r6(delta), gates, allGates: gates.h2Trips === 0 && gates.g1Gate && gates.founderGate,
    w1TripsPostFlip: w1.nPostFlip, w1Latency: w1.latency, w1PreFlipTrips: w1.nPreFlip,
    g1Trips: R.g1Trip.nTrips, g1LatencyFromAdmission: R.g1Trip.latencyFromAdmission,
    passGates: gates.h2Trips === 0,
  };
});
const eligibleAll = sweepTable.filter((x) => x.allGates);
const eligibleH2 = sweepTable.filter((x) => x.passGates);
let pick;
if (eligibleAll.length) {
  const best = Math.max(...eligibleAll.map((x) => x.delta));
  const tied = eligibleAll.filter((x) => Math.abs(x.delta - best) <= 1e-9);
  pick = { h: Math.max(...tied.map((x) => x.h)), relaxed: null, tied: tied.map((x) => x.h) };
} else if (eligibleH2.length) {
  const best = Math.max(...eligibleH2.map((x) => x.delta));
  const tied = eligibleH2.filter((x) => Math.abs(x.delta - best) <= 1e-9);
  pick = { h: Math.max(...tied.map((x) => x.h)), relaxed: 'founder-only', tied: tied.map((x) => x.h) };
} else {
  const best = Math.max(...sweepTable.map((x) => x.delta));
  const tied = sweepTable.filter((x) => Math.abs(x.delta - best) <= 1e-9);
  pick = { h: Math.max(...tied.map((x) => x.h)), relaxed: 'none', tied: tied.map((x) => x.h) };
}
const HSTAR = pick.h;
const ALIASED = HSTAR === CI.hiH;
const ARM_XI1 = armName('XI1', HSTAR);
const ARM_XIHI = armName('XIhi', HSTAR);
book('sensor.hpick', {
  rule: 'argmax delta_h among h passing all gates; ties -> larger h; fallback ladder receipted in run.config',
  sweepTable, picked: HSTAR, relaxed: pick.relaxed, tied: pick.tied,
  aliased: ALIASED, aliasNote: ALIASED ? `XI1 == XIhi (h* = ${CI.hiH}): the conservative sibling IS the candidate; one arm run, XI1 aliases XIhi (no re-run)` : 'XI1 and XIhi are distinct arms',
  probeD_w1: Object.fromEntries(CI.hSweep.map((h) => [`h${h}`, r6(probe[`h${h}`].dmgW1)]).concat([['A1', r6(probe.A1.dmgW1)]])),
});
console.log(`h-pick: h*=${HSTAR}${pick.relaxed ? ` (RELAXED: ${pick.relaxed})` : ''}${ALIASED ? ' — XI1 == XIhi (aliased)' : ''}`);

// ---------------- phase 2: full matrix ----------------
const ARMS = ALIASED ? ['A1-v3.1-sleeper', ARM_XI1, 'A4-v3.1-clean'] : ['A1-v3.1-sleeper', ARM_XI1, ARM_XIHI, 'A4-v3.1-clean'];
const agg = {};
for (const A of ARMS) {
  agg[A] = {
    acc: [], pre: [], dmgW1: [], dmgG1: [], shareW1: [], shareG1: [], honQ: [],
    w1Adm: [], w1Dev: [], w1Indep: [], w1ProbMax: [], h2Adm: [], g1Adm: [],
    trustFlip: [], conv: [],
    sensor: { per: {}, w1Events: [], g1Events: [], founderTrips: [], w1Trips: [], g1Trips: [], screens: {}, founderMinRho: {}, founderMinRhoW: {} },
    decayEvents: [],
    w1Curves: {}, w1Paths: {}, g1Paths: {},
    toxTruth: { g1ProTruth: [], w1PostProTruth: [] },
    vfy: { checks: 0, pass: 0, maxDiff: 0 },
  };
}
const seedRows = [];
const t0 = Date.now();

// seed 0: carried from the probe (no re-run) + the picked XI arms' seed-0 results
{
  const specs = armSpecs(tAdm0, HSTAR, ALIASED);
  const results = {
    'A1-v3.1-sleeper': probe.A1,
    'A4-v3.1-clean': probe.A4,
    [ARM_XI1]: probe[`h${HSTAR}`],
    ...(ALIASED ? {} : { [ARM_XIHI]: probe[`h${CI.hiH}`] }),
  };
  seedRows.push(await buildSeedRow(0, results, specs, tAdm0, p1, true, { poolAcc: sister0.poolAcc, verify: sister0.verify }));
  book('run', seedRows[0]);
  console.log(`  seed 1/${SEEDS} done (carried from probe; t_adm=${tAdm0}, ${((Date.now() - t0) / 1000).toFixed(1)}s elapsed)`);
}

// seeds 1..SEEDS-1: fresh worlds (home + sister), pass-1 anchor, full arm matrix
for (let seed = 1; seed < SEEDS; seed++) {
  const world = genWorld(seed, harvest, vault);
  world.sVotes = genSister(seed, harvest, vault, world.s).votes;
  const engSis = new QuiltEngine(`e41-s${seed}-sister`, {});
  engSis.loadSheet(buildSheet(SIS_HONEST, `E41 sister instance (seed ${seed})`, `e41-sister-s${seed}`));
  const sis = await runSister(seed, world, engSis);
  const eng = new QuiltEngine(`e41-s${seed}`, {});
  eng.loadSheet(buildSheet(ALL_IDS, 'E41 cross-instance lane (15 voice slots)', `e41-xi-${V}`));
  const engP1 = new QuiltEngine(`e41-s${seed}-p1`, {});
  engP1.loadSheet(buildSheet(ALL_IDS, 'E41 pass-1 (15 voice slots)', `e41-p1-${V}`));
  const p1s = await runArm(seed, world, { name: 'pass1', kind: 'pass1', defenses: [], reprob: false, h: null, attackers: [{ id: SLEEP, flip: null }, { id: INSTANT, flip: JOIN }] }, engP1, sis.cS);
  if (p1s.w1.admitExpT === undefined) console.log(`  seed ${seed}: sleeper NOT admitted under honest behavior (receipted as neverLaunched)`);
  const tAdm = p1s.w1.admitExpT;
  const specs = armSpecs(tAdm, HSTAR, ALIASED);
  const results = {};
  for (const A of ARMS) results[A] = await runArm(seed, world, specs[A], eng, sis.cS);
  seedRows.push(await buildSeedRow(seed, results, specs, tAdm, p1s, false, sis));
  book('run', seedRows[seedRows.length - 1]);
  const proj = (((Date.now() - t0) / 1000) / seed) * (SEEDS - 1);
  console.log(`  seed ${seed + 1}/${SEEDS} done (t_adm=${tAdm}, ${((Date.now() - t0) / 1000).toFixed(1)}s elapsed, projected total ${proj.toFixed(0)}s)`);
}
const elapsedMatrix = +((Date.now() - t0) / 1000).toFixed(1);
console.log(`matrix elapsed ${elapsedMatrix}s`);

// per-seed row builder (used by both phases)
async function buildSeedRow(seed, results, specs, tAdm, p1r, carried, sis) {
  const row = { seed, carried, tAdmExp: tAdm, pass1: { tAdmExp: tAdm, devMean: p1r.w1.devMean, indep: p1r.w1.indep, h2: p1r.h2 }, sister: sis ? { poolAcc: r6(sis.poolAcc), verify: `${sis.verify.pass}/${sis.verify.checks}` } : null };
  for (const A of ARMS) {
    const R = results[A];
    if (A !== 'A4-v3.1-clean' && R.w1.admitExpT !== tAdm) {
      throw new Error(`admission mismatch seed=${seed} arm=${A}: pass1 t_adm=${tAdm} vs matrix t_adm=${R.w1.admitExpT} (paired-worlds broken)`);
    }
    const G = agg[A];
    G.acc.push(R.poolAcc); G.pre.push(R.errPre);
    G.dmgW1.push(R.dmgW1); G.dmgG1.push(R.dmgG1);
    if (R.shareW1 !== null) G.shareW1.push(R.shareW1);
    if (R.shareG1 !== null) G.shareG1.push(R.shareG1);
    G.honQ.push(R.honQFinal);
    if (R.attTrustAtFlip !== null) G.trustFlip.push(R.attTrustAtFlip);
    G.conv.push(R.convRound === null ? T : R.convRound);
    if (R.toxTruth.g1ProTruth !== null) G.toxTruth.g1ProTruth.push(R.toxTruth.g1ProTruth);
    if (R.toxTruth.w1PostProTruth !== null) G.toxTruth.w1PostProTruth.push(R.toxTruth.w1PostProTruth);
    if (R.w1.admitExpT !== undefined) { G.w1Adm.push(R.w1.admitExpT); G.w1Dev.push(R.w1.devMean); G.w1Indep.push(R.w1.indep); if (R.w1.probTraceMax !== null) G.w1ProbMax.push(R.w1.probTraceMax); }
    if (R.h2.admitExpT !== undefined) G.h2Adm.push(R.h2.admitExpT);
    if (R.g1.admitExpT !== undefined) G.g1Adm.push(R.g1.admitExpT);
    if (R.defense.xi) {
      G.sensor.per[seed] = R.defense.xi.per;
      G.sensor.w1Events.push(...R.defense.xi.events.filter((e) => e.id === SLEEP && (e.kind === 'throw' || e.kind === 'rethrow')).map((e) => ({ seed, ...e })));
      G.sensor.g1Events.push(...R.defense.xi.events.filter((e) => e.id === INSTANT && (e.kind === 'throw' || e.kind === 'rethrow')).map((e) => ({ seed, ...e })));
      G.sensor.w1Trips.push({ seed, ...R.w1Trip });
      G.sensor.g1Trips.push({ seed, ...R.g1Trip });
      G.sensor.screens[seed] = R.screen;
      for (const id of HONEST) {
        const p = R.defense.xi.per[id];
        if (p && (p.throws > 0 || p.rethrows > 0)) G.sensor.founderTrips.push({ seed, id, ...p });
        if (p && p.minRho !== null) (G.sensor.founderMinRho[id] = G.sensor.founderMinRho[id] ?? []).push(p.minRho);
        if (p && p.minRhoW !== null) (G.sensor.founderMinRhoW[id] = G.sensor.founderMinRhoW[id] ?? []).push(p.minRhoW);
      }
      G.w1Paths[seed] = R.defense.xi.w1Path;
      G.g1Paths[seed] = R.defense.xi.g1Path;
    }
    if (R.defense.reprob) for (const ev of R.defense.reprob.events) G.decayEvents.push({ seed, ...ev });
    G.w1Curves[seed] = R.w1Curve;
    G.vfy.checks += R.verify.checks; G.vfy.pass += R.verify.pass;
    if (R.verify.maxDiff > G.vfy.maxDiff) G.vfy.maxDiff = R.verify.maxDiff;
    row[A] = {
      dmgW1: R.dmgW1 === null ? null : r6(R.dmgW1), dmgG1: R.dmgG1 === null ? null : r6(R.dmgG1),
      winW1: R.winW1, winG1: R.winG1,
      shareW1: R.shareW1 === null ? null : r6(R.shareW1), shareG1: R.shareG1 === null ? null : r6(R.shareG1),
      errPre: r6(R.errPre), poolAcc: r6(R.poolAcc), honQ: r6(R.honQFinal),
      attTrustAtFlip: R.attTrustAtFlip, convRound: R.convRound,
      w1Adm: R.w1.admitExpT ?? null, w1DevMean: R.w1.devMean ?? null, w1ProbMax: R.w1.probTraceMax,
      h2Adm: R.h2.admitExpT ?? null, g1Adm: R.g1.admitExpT ?? null,
      toxTruth: R.toxTruth,
      w1Curve: R.w1Curve,
      w1Trip: R.w1Trip,
      g1Trip: R.g1Trip,
      defense: {
        xi: R.defense.xi ? {
          h: R.defense.xi.h,
          per: Object.fromEntries(Object.entries(R.defense.xi.per).filter(([id]) => !HONEST.includes(id))),
          founderMinRho: Object.fromEntries(HONEST.map((id) => [id, R.defense.xi.per[id] ? R.defense.xi.per[id].minRho : null])),
          founderMinRhoW: Object.fromEntries(HONEST.map((id) => [id, R.defense.xi.per[id] ? R.defense.xi.per[id].minRhoW : null])),
          founderMeanRho: Object.fromEntries(HONEST.map((id) => [id, R.defense.xi.per[id] ? R.defense.xi.per[id].meanRho : null])),
          founderTrips: R.defense.xi.events.filter((e) => HONEST.includes(e.id) && (e.kind === 'throw' || e.kind === 'rethrow')),
          h2Trips: R.defense.xi.events.filter((e) => e.id === JOINER && (e.kind === 'throw' || e.kind === 'rethrow')),
          g1Trips: R.defense.xi.events.filter((e) => e.id === INSTANT && (e.kind === 'throw' || e.kind === 'rethrow')),
          w1Path: R.defense.xi.w1Path,
          g1Path: R.defense.xi.g1Path,
          screen: R.screen,
        } : null,
        reprob: R.defense.reprob ? R.defense.reprob.events.map((e) => ({ id: e.id, tripT: e.tripT, decayT: e.decayT, kind: e.kind, pre: e.pre, post: e.post, recoveredIn: e.recoveredIn })) : null,
      },
      verify: `${R.verify.pass}/${R.verify.checks}`,
    };
  }
  row.honQSpread = { XI1_vs_A1: r6(Math.abs(results[ARM_XI1].honQFinal - results['A1-v3.1-sleeper'].honQFinal)) };
  return row;
}

// ---------------- aggregate ----------------
const armsAgg = {};
for (const A of ARMS) {
  const G = agg[A];
  const isAttack = A !== 'A4-v3.1-clean';
  const isSensor = A === ARM_XI1 || A === ARM_XIHI;
  const founderTripsAll = isSensor ? G.sensor.founderTrips : [];
  const screens = G.sensor.screens;
  armsAgg[A] = {
    poolAcc: stat(G.acc), errPre: stat(G.pre),
    damageW1: isAttack ? stat(G.dmgW1.map((d) => d ?? 0)) : null,
    damageG1: isAttack ? stat(G.dmgG1.map((d) => d ?? 0)) : null,
    shareW1: G.shareW1.length ? stat(G.shareW1) : null,
    shareG1: G.shareG1.length ? stat(G.shareG1) : null,
    honQFinal: stat(G.honQ),
    attTrustAtFlip: G.trustFlip.length ? stat(G.trustFlip) : null,
    attConvRoundByTrust: isAttack ? stat(G.conv) : null,
    toxTruth: isAttack ? {
      g1ProTruth: statOr(G.toxTruth.g1ProTruth),
      w1PostProTruth: statOr(G.toxTruth.w1PostProTruth),
      note: 'MEASURED per seed: the E24 toxic vote is PRO-truth most rounds (the q<0.5 vote mapping contradicts the anti-truth signal) — the hypothesis\'s anti-truth premise, tested',
    } : null,
    w1Admission: isAttack ? {
      admAdmitted_n: G.w1Adm.length, of: SEEDS,
      tAdmExp: G.w1Adm.length ? stat(G.w1Adm) : null,
      devMeanAtAdmission: G.w1Dev.length ? stat(G.w1Dev) : null,
      indepAtAdmission: G.w1Indep.length ? stat(G.w1Indep) : null,
      probationTraceMax: G.w1ProbMax.length ? stat(G.w1ProbMax) : null,
    } : null,
    h2Admission: {
      admAdmitted_n: G.h2Adm.length, of: SEEDS,
      tAdmExp: G.h2Adm.length ? stat(G.h2Adm) : null,
      falseNegativeRate: r6((SEEDS - G.h2Adm.length) / SEEDS),
    },
    g1Admission: isAttack ? { admAdmitted_n: G.g1Adm.length, of: SEEDS, tAdmExp: G.g1Adm.length ? stat(G.g1Adm) : null } : null,
    sensorTelemetry: isSensor ? {
      w1TripsPerSeed: G.sensor.w1Trips,
      w1TripEvents: G.sensor.w1Events,
      g1TripsPerSeed: G.sensor.g1Trips,
      g1TripEvents: G.sensor.g1Events,
      founderTrips: founderTripsAll,
      founderTripTotal: founderTripsAll.reduce((a, e) => a + (e.throws ?? 0) + (e.rethrows ?? 0), 0),
      founderTripRatePer200r: r6(founderTripsAll.reduce((a, e) => a + (e.throws ?? 0) + (e.rethrows ?? 0), 0) / (SEEDS * T / 200)),
      founderTripPerVoice: Object.fromEntries(HONEST.map((id) => [id, founderTripsAll.filter((e) => e.id === id).reduce((a, e) => a + (e.throws ?? 0) + (e.rethrows ?? 0), 0)])),
      founderMinRho: Object.fromEntries(HONEST.map((id) => {
        const vals = G.sensor.founderMinRho[id] ?? [];
        return [id, vals.length ? { mean: r6(mean(vals)), min: r6(Math.min(...vals)), n: vals.length } : null];
      })),
      founderFloorMin: r6(Math.min(...HONEST.flatMap((id) => G.sensor.founderMinRho[id] ?? [1]))),
      founderMinRhoW: Object.fromEntries(HONEST.map((id) => {
        const vals = G.sensor.founderMinRhoW[id] ?? [];
        return [id, vals.length ? { mean: r6(mean(vals)), min: r6(Math.min(...vals)), n: vals.length } : null];
      })),
      founderFloorMinWithin: r6(Math.min(...HONEST.flatMap((id) => G.sensor.founderMinRhoW[id] ?? [1]))),
      h2TripTotal: Object.values(G.sensor.per).reduce((a, per) => a + ((per[JOINER]?.throws ?? 0) + (per[JOINER]?.rethrows ?? 0)), 0),
      h2MinRho: statOr(Object.values(G.sensor.per).map((per) => per[JOINER]?.minRho ?? null).filter((x) => x !== null)),
      g1TripTotal: Object.values(G.sensor.per).reduce((a, per) => a + ((per[INSTANT]?.throws ?? 0) + (per[INSTANT]?.rethrows ?? 0)), 0),
      g1MinRho: statOr(Object.values(G.sensor.per).map((per) => per[INSTANT]?.minRho ?? null).filter((x) => x !== null)),
      coToxScreen: {
        w1g1PostFlipFull: statOr(Object.values(screens).map((sc) => sc?.w1g1PostFlipFull).filter((x) => x !== null && x !== undefined)),
        honestVsG1TrailMax: statOr(Object.values(screens).flatMap((sc) => Object.values(sc?.founderVsG1TrailMax ?? {})).filter((x) => x !== null && x !== undefined)),
        honestHonestTrailMax: statOr(Object.values(screens).map((sc) => sc?.honestHonestTrailMax).filter((x) => x !== null && x !== undefined)),
        perSeed: screens,
      },
    } : null,
    decayEvents: isSensor ? G.decayEvents : [],
    verify: { checks: G.vfy.checks, pass: G.vfy.pass, maxDiff: G.vfy.maxDiff.toExponential(2) },
  };
}

// per-seed w1 pre/post-flip XI minima + g1 path minima (mechanism telemetry, XI1 arm)
function pathMinima(path, flip) {
  const pre = path.filter((x) => x.t < flip);
  const post = path.filter((x) => x.t >= flip && x.t < flip + DW);
  return {
    preFlipMin: pre.length ? r6(Math.min(...pre.map((x) => x.rho))) : null,
    preFlipMean: pre.length ? r6(mean(pre.map((x) => x.rho))) : null,
    postFlipMin: post.length ? r6(Math.min(...post.map((x) => x.rho))) : null,
    postFlipMean: post.length ? r6(mean(post.map((x) => x.rho))) : null,
    postFlipMax: post.length ? r6(Math.max(...post.map((x) => x.rho))) : null,
    postFlipMinW: post.length ? r6(Math.min(...post.map((x) => x.rhoW))) : null, // within twin (telemetry)
  };
}
const MECHDATA = { perSeed: [] };
{
  const arm = agg[ARM_XI1];
  for (const tr of arm.sensor.w1Trips) {
    const seed = tr.seed, flip = tr.flip;
    const path = arm.w1Paths[seed] ?? [];
    const mm = pathMinima(path, flip);
    const firstTripEv = arm.sensor.w1Events.find((e) => e.seed === seed && e.t >= flip);
    const per = arm.sensor.per[seed]?.[SLEEP] ?? {};
    const g1rec = (arm.sensor.g1Trips ?? []).find((x) => x.seed === seed) ?? null;
    const g1Per = arm.sensor.per[seed]?.[INSTANT] ?? {};
    const founderMins = HONEST.map((id) => arm.sensor.per[seed]?.[id]?.minRho ?? null).filter((x) => x !== null);
    const founderMeans = HONEST.map((id) => arm.sensor.per[seed]?.[id]?.meanRho ?? null).filter((x) => x !== null);
    const w1MeanPost = mm.postFlipMean;
    MECHDATA.perSeed.push({
      seed, flip, tripped: tr.nPostFlip > 0, latency: tr.latency, nTrips: tr.nTrips, nPreFlipTrips: tr.nPreFlip,
      preFlipMinRho: mm.preFlipMin, preFlipMeanRho: mm.preFlipMean,
      postFlipMinRho: mm.postFlipMin, postFlipMeanRho: mm.postFlipMean, postFlipMaxRho: mm.postFlipMax, postFlipMinRhoW: mm.postFlipMinW,
      rhoAtFirstTrip: firstTripEv ? firstTripEv.rho : null, h: HSTAR,
      crossedBar: mm.postFlipMin !== null && mm.postFlipMin < -HSTAR,
      plateauAboveBar: !tr.nPostFlip && mm.postFlipMin !== null && mm.postFlipMin >= -HSTAR,
      suppressed: per.suppressedSustained ?? 0,
      honestFloorMin_thisSeed: founderMins.length ? r6(Math.min(...founderMins)) : null,
      w1PostRank_thisSeed: founderMeans.length && w1MeanPost !== null ? founderMeans.filter((m) => m > w1MeanPost).length + 1 : null,
      g1: g1rec ? { nTrips: g1rec.nTrips, firstT: g1rec.firstT, admitExpT: g1rec.admitExpT, latencyFromAdmission: g1rec.latencyFromAdmission, minRho: g1Per.minRho ?? null } : null,
    });
  }
}

// ---------------- claims ----------------
const A1 = 'A1-v3.1-sleeper', A4 = 'A4-v3.1-clean';
const B_ARMS = [ARM_XI1, ...(ALIASED ? [] : [ARM_XIHI])];
const dmgW1Of = (A) => agg[A].dmgW1.map((x) => (x === null ? 0 : x));
const dmgG1Of = (A) => agg[A].dmgG1.map((x) => (x === null ? 0 : x));
const honQOf = (A) => agg[A].honQ;

// R1 HONEST-NOISE FLOOR (the primary design constraint) — measured on the matrix arms
const R1 = {};
for (const B of B_ARMS) {
  const tel = armsAgg[B].sensorTelemetry;
  const rate = tel.founderTripRatePer200r;
  R1[B] = {
    priced: { seed: PRICE_SEED, W20Floor: pricing.W[20][CI.variant].founderFloor, W20WithinFloor: pricing.W[20].within.founderFloor, note: 'pricing.dev row (booked before run rows); matrix runs W=20' },
    perFounderMinRho: tel.founderMinRho,
    founderFloorMin_matrix: tel.founderFloorMin,
    founderFloorMinWithin_matrix: tel.founderFloorMinWithin, // the paired within twin (telemetry)
    falseTrips: { total: tel.founderTripTotal, ratePer200r: rate, budget: 1.0, perVoice: tel.founderTripPerVoice },
    h2MinRho: tel.h2MinRho, h2Trips: tel.h2TripTotal,
    w1PreFlip: null, // filled below from the stored w1Paths
    verdict: rate <= 1.0 ? 'PASS' : 'FAIL',
  };
}
// fill w1 pre-flip floor per arm from the stored paths
for (const B of B_ARMS) {
  const flips = Object.fromEntries(agg[B].sensor.w1Trips.map((x) => [x.seed, x.flip]));
  const preMins = Object.entries(agg[B].w1Paths).map(([sN, path]) => {
    const flip = flips[sN];
    if (flip == null) return null;
    const pre = path.filter((x) => x.t < flip);
    return pre.length ? Math.min(...pre.map((x) => x.rho)) : null;
  }).filter((x) => x !== null);
  R1[B].w1PreFlip = preMins.length ? { minRho: r6(Math.min(...preMins)), nSeeds: preMins.length } : null;
}

// R2 DETECTION per sensor arm
const R2 = {};
for (const B of B_ARMS) {
  const trips = agg[B].sensor.w1Trips;
  const tripped = trips.filter((x) => x.nPostFlip > 0);
  const lat = tripped.map((x) => x.latency);
  const preFlip = trips.reduce((a, x) => a + x.nPreFlip, 0);
  R2[B] = {
    perSeed: trips.map((x) => ({ seed: x.seed, flip: x.flip, tripped: x.nPostFlip > 0, latency: x.latency, nPostFlip: x.nPostFlip, nPreFlip: x.nPreFlip, tripTs: x.tripTs })),
    trippedSeeds: tripped.length, of: SEEDS,
    latency: lat.length ? stat(lat) : null,
    preFlipTrips_total: preFlip,
    mechanism: MECHDATA.perSeed,
    verdict: (tripped.length >= SEEDS / 2 && lat.length && lat.length === tripped.length && mean(lat) < 30) ? 'PASS' : 'FAIL',
  };
}

// R3 g1 VISIBILITY per sensor arm
const R3 = {};
for (const B of B_ARMS) {
  const recs = agg[B].sensor.g1Trips;
  const tripped = recs.filter((x) => x.nTrips > 0);
  const lat = tripped.map((x) => x.latencyFromAdmission).filter((x) => x !== null);
  R3[B] = {
    perSeed: recs.map((x) => ({ seed: x.seed, nTrips: x.nTrips, firstT: x.firstT, admitExpT: x.admitExpT, latencyFromAdmission: x.latencyFromAdmission })),
    trippedSeeds: tripped.length, of: SEEDS,
    latencyFromAdmission: lat.length ? stat(lat) : null,
    minRho: armsAgg[B].sensorTelemetry.g1MinRho,
    tripEvents: agg[B].sensor.g1Events,
    verdict: tripped.length >= (2 * SEEDS) / 3 ? 'PASS' : 'FAIL',
  };
}

// R4 COUNTERFACTUAL DAMAGE per sensor arm (E39/E40 machinery verbatim)
const R4 = {};
for (const B of B_ARMS) {
  const d = dmgW1Of(A1).map((x, i) => x - dmgW1Of(B)[i]); // >0 = sensor reduces damage
  const stst = signTestOneSided(d);
  const mD1 = mean(dmgW1Of(A1)), mDB = mean(dmgW1Of(B));
  const dg1 = dmgG1Of(B).map((x, i) => x - dmgG1Of(A1)[i]); // >0 = g1 damage INCREASED under the sensor
  const latTripped = agg[B].sensor.w1Trips.filter((x) => x.latency !== null).map((x) => x.latency);
  R4[B] = {
    damage_A1: armsAgg[A1].damageW1, damage_B: armsAgg[B].damageW1,
    pairedDelta_A1_minus_B: { mean: r6(mean(d)), se: r6(seOf(d)), sd: r6(sd(d)), n: d.length, perSeed: d.map((x) => r6(x)) },
    signTest_oneSided: stst,
    damageRatio_B_over_A1: r6(mDB / Math.max(1e-12, mD1)),
    tripLatency: latTripped.length ? stat(latTripped) : null,
    trippedSeeds: agg[B].sensor.w1Trips.filter((x) => x.nPostFlip > 0).length,
    vacuous: agg[B].sensor.w1Trips.every((x) => x.nPostFlip === 0) && agg[B].decayEvents.length === 0,
    g1Damage_paired: {
      damage_A1: armsAgg[A1].damageG1, damage_B: armsAgg[B].damageG1,
      delta_B_minus_A1: { mean: r6(mean(dg1)), se: r6(seOf(dg1)), perSeed: dg1.map((x) => r6(x)) },
      note: 'a cross-instance sensor that SEES g1 should REDUCE D_g1 (TrustReprobation halves it on every trip) — an increase beyond +1 SE fails R5c',
    },
    verdict: (mean(d) > 0 && stst.p < 0.05) ? 'PASS' : 'FAIL',
  };
}

// R5 CANARIES per sensor arm
const r5Recovery = (A) => {
  const evs = agg[A].decayEvents.filter((e) => HONEST.includes(e.id));
  const full = evs.filter((e) => e.decayT <= T - 1 - REPROB.horizon);
  const recovered = full.filter((e) => e.recoveredAt !== null);
  return {
    verdict: full.length === 0 ? 'VACUOUS-PASS' : (full.every((e) => e.recoveredAt !== null) ? 'PASS' : 'FAIL'),
    vacuous: evs.length === 0,
    founderDecayEvents: evs.length,
    withFullHorizon: full.length,
    recoveredN: recovered.length,
    recoveredIn: recovered.length ? stat(recovered.map((e) => e.recoveredIn)) : null,
    e37Baseline: '23/25 recovered, mean 19.1r (E37 R3) — must not regress',
    unrecovered: full.filter((e) => e.recoveredAt === null).map((e) => ({ seed: e.seed, id: e.id, decayT: e.decayT, pre: e.pre, minShare: e.minShare })),
    partialHorizonEvents: evs.length - full.length,
    allDecayEvents: agg[A].decayEvents.length,
    allDecayedIds: [...new Set(agg[A].decayEvents.map((e) => e.id))],
  };
};
const R5 = { perSensor: {} };
for (const B of B_ARMS) {
  // (a) honestFinalQ vs A4
  const lossVsA4 = honQOf(A4).map((q, i) => q - honQOf(B)[i]);
  const seA4 = seOf(lossVsA4);
  const honQPass = Math.abs(mean(lossVsA4)) <= seA4;
  // (b) h2: zero defense trips + per-seed admission arm-invariance vs A1
  const h2Trips = armsAgg[B].sensorTelemetry.h2TripTotal;
  const h2Invariance = seedRows.map((r) => ({ seed: r.seed, A1: r[A1].h2Adm, B: r[B].h2Adm, same: r[A1].h2Adm === r[B].h2Adm }));
  const h2InvPass = h2Invariance.every((x) => x.same);
  const h2Pass = h2Trips === 0 && h2InvPass;
  // (c) g1 damage <= A1 + 1 SE
  const g1d = dmgG1Of(B).map((x, i) => x - dmgG1Of(A1)[i]);
  const g1Pass = mean(g1d) <= seOf(g1d);
  // (d) false-trip budget (same measurement as R1)
  const ft = armsAgg[B].sensorTelemetry.founderTripTotal;
  const ftRate = armsAgg[B].sensorTelemetry.founderTripRatePer200r;
  const ftPass = ftRate <= 1.0;
  // (e) recovery
  const rec = r5Recovery(B);
  R5.perSensor[B] = {
    honQ: {
      mean_B: armsAgg[B].honQFinal, mean_A4: armsAgg[A4].honQFinal, mean_A1: armsAgg[A1].honQFinal,
      diff_vs_A4: { mean: r6(mean(lossVsA4)), se: r6(seA4), pass_1SE: honQPass },
      trustMoved_maxPerSeed: r6(Math.max(...honQOf(B).map((q, i) => Math.abs(q - honQOf(A1)[i])))),
    },
    h2: { defenseTrips: h2Trips, admissionInvariance: h2Invariance, invariancePass: h2InvPass, admitted_n: armsAgg[B].h2Admission.admAdmitted_n, nativeMiss_note: 'per-seed admission outcome must EQUAL A1\'s — the native miss is admission\'s property, not a defense effect' },
    g1: { damage_B: armsAgg[B].damageG1, damage_A1: armsAgg[A1].damageG1, pairedDelta_B_minus_A1: { mean: r6(mean(g1d)), se: r6(seOf(g1d)) }, pass: g1Pass },
    falseTrips: { total: ft, ratePer200r: ftRate, budget: 1.0, perVoice: armsAgg[B].sensorTelemetry.founderTripPerVoice, pass: ftPass },
    recovery: rec,
    verdict: honQPass && h2Pass && g1Pass && ftPass && (rec.verdict === 'PASS' || rec.verdict === 'VACUOUS-PASS') ? 'PASS' : 'FAIL',
  };
}

// ---------------- STRUCTURAL FLOOR COMPARISON (R1's second clause — the reason this axis exists) --
const FLOORCMP = {
  rule: 'TIGHTER iff matrix cross floor min > matrix within floor min (paired rhoW twin, same seeds) AND paired per-founder delta (cross - within) > 0 for a majority of founders on the pricing seed; else NOT-TIGHTER. All distributions booked either way.',
  pricing_paired: {
    seed: PRICE_SEED,
    crossPoolFloor: pricing.W[20].crossPool.founderFloor, crossMedFloor: pricing.W[20].crossMed.founderFloor, withinFloor: pricing.W[20].within.founderFloor,
    perFounderDelta: pricing.W[20].pairedFloorDelta, deltaMean: pricing.W[20].pairedFloorDeltaMean, tightenedN: pricing.W[20].tightenedN,
  },
  matrix_paired: {
    crossFloorMin: armsAgg[ARM_XI1].sensorTelemetry.founderFloorMin,
    withinFloorMin: armsAgg[ARM_XI1].sensorTelemetry.founderFloorMinWithin,
    perFounderCross: armsAgg[ARM_XI1].sensorTelemetry.founderMinRho,
    perFounderWithin: armsAgg[ARM_XI1].sensorTelemetry.founderMinRhoW,
  },
  e40_receipted: E40_RECEIPT,
  crossVsE40Pricing: r6(pricing.W[20][CI.variant].founderFloor - E40_RECEIPT.pricingFounderFloor_W20),
  crossVsE40Matrix: r6(armsAgg[ARM_XI1].sensorTelemetry.founderFloorMin - E40_RECEIPT.matrixFounderFloorMin),
};
FLOORCMP.matrixDelta = r6(FLOORCMP.matrix_paired.crossFloorMin - FLOORCMP.matrix_paired.withinFloorMin);
FLOORCMP.majorityTightenedPricing = pricing.W[20].tightenedN > N / 2;
FLOORCMP.verdict = (FLOORCMP.matrixDelta > 0 && FLOORCMP.majorityTightenedPricing) ? 'TIGHTER' : 'NOT-TIGHTER';

// ---------------- TOXIC-SIGNATURE MECHANISM (booked whatever the verdict) ----------------
const TOXSIG = (() => {
  const perSeedRanks = MECHDATA.perSeed.map((x) => x.w1PostRank_thisSeed).filter((x) => x !== null);
  // g1's mean-rho rank per seed: rank of g1's meanRho among founder meanRhos (guard telemetry)
  const g1Ranks = [];
  for (const [sN, per] of Object.entries(agg[ARM_XI1].sensor.per)) {
    const fmeans = HONEST.map((id) => per[id]?.meanRho ?? null).filter((x) => x !== null);
    const g1m = per[INSTANT]?.meanRho ?? null;
    if (g1m !== null && fmeans.length) g1Ranks.push({ seed: Number(sN), rank: fmeans.filter((m) => m > g1m).length + 1, of: fmeans.length });
  }
  return {
    P_toxProTruth_pricing: pricing.toxTruth.P_toxProTruth,
    residBimodality_pricing: { closeFrac: pricing.toxTruth.residCloseFrac, closeMean: pricing.toxTruth.residCloseMean, farMean: pricing.toxTruth.residFarMean },
    g1ProTruth_matrix: armsAgg[A1].toxTruth?.g1ProTruth ?? null,
    w1PostProTruth_matrix: armsAgg[A1].toxTruth?.w1PostProTruth ?? null,
    w1PostMeanRank_perSeed: perSeedRanks,
    w1PostMeanRank_mean: perSeedRanks.length ? r6(mean(perSeedRanks)) : null,
    g1MeanRank_perSeed: g1Ranks,
    founderMeanRhoRange_matrix: (() => {
      const fmeans = HONEST.map((id) => armsAgg[ARM_XI1].sensorTelemetry.founderMinRho[id]?.mean).filter((x) => x !== null && x !== undefined);
      return { min: fmeans.length ? r6(Math.min(...fmeans)) : null, max: fmeans.length ? r6(Math.max(...fmeans)) : null, median: fmeans.length ? r6(median(fmeans)) : null,
        perFounder: Object.fromEntries(HONEST.map((id) => [id, armsAgg[ARM_XI1].sensorTelemetry.founderMinRho[id]?.mean ?? null])) };
    })(),
    note: 'the E24 toxic stream is distribution-identical to an honest q=0.75 voice (measured); if the attacker\'s alignment RANK sits above the honest median, no bar in alignment space (low OR high) separates it without tripping the weaker half of the honest pool — the wrong-side-of-population receipt that closes the vote-stream detector ladder with a mechanism',
  };
})();

// ---------------- verdict — mechanism analysis COMPUTED from telemetry ----------------
const R1OK = R1[ARM_XI1].verdict === 'PASS';
const R2OK = R2[ARM_XI1].verdict === 'PASS';
const R3OK = R3[ARM_XI1].verdict === 'PASS';
const R4OK = R4[ARM_XI1].verdict === 'PASS';
const R5OK = R5.perSensor[ARM_XI1].verdict === 'PASS';
const CROWN = (R1OK && R2OK && R3OK && R4OK && R5OK)
  ? {
      crowned: ARM_XI1, damageRatio: R4[ARM_XI1].damageRatio_B_over_A1,
      latency: R4[ARM_XI1].tripLatency, g1Latency: R3[ARM_XI1].latencyFromAdmission,
      rule: 'XI1 passes R1 + R2 + R3 + R4 + R5 (receipted crown rule)',
    }
  : null;

// --- mechanism (computed) ---
let MECH;
{
  const tripSeeds = MECHDATA.perSeed.filter((x) => x.tripped);
  const noTrip = MECHDATA.perSeed.filter((x) => !x.tripped);
  const plateau = noTrip.filter((x) => x.plateauAboveBar);
  const crossedN = MECHDATA.perSeed.filter((x) => x.crossedBar).length;
  const insideFloorN = MECHDATA.perSeed.filter((x) => x.honestFloorMin_thisSeed !== null && x.postFlipMinRho !== null && x.postFlipMinRho >= x.honestFloorMin_thisSeed).length;
  const aboveZeroN = MECHDATA.perSeed.filter((x) => x.postFlipMinRho !== null && x.postFlipMinRho > 0).length;
  const dDelta = dmgW1Of(A1).map((x, i) => x - dmgW1Of(ARM_XI1)[i]);
  const decaysW1 = agg[ARM_XI1].decayEvents.filter((e) => e.id === SLEEP);
  const decaysG1 = agg[ARM_XI1].decayEvents.filter((e) => e.id === INSTANT);
  const ftTotal = armsAgg[ARM_XI1].sensorTelemetry.founderTripTotal;
  const ftSeeds = new Set(agg[ARM_XI1].sensor.founderTrips.map((e) => e.seed)).size;
  const floorMin = armsAgg[ARM_XI1].sensorTelemetry.founderFloorMin;
  const g1TrippedN = R3[ARM_XI1].trippedSeeds;
  const g1Lat = R3[ARM_XI1].latencyFromAdmission;
  const cts = armsAgg[ARM_XI1].sensorTelemetry.coToxScreen;
  MECH = `CrossInstanceGuard(h=${HSTAR}, W=${CI.W}, ref=sister ${CI.variant}) trips on the sleeper post-flip in ${tripSeeds.length}/${SEEDS} seeds`
    + `${tripSeeds.length ? ` (latency ${stat(tripSeeds.map((x) => x.latency)).mean}rd mean; per-seed postFlipMinRho ${tripSeeds.map((x) => x.postFlipMinRho).join('/')} vs bar -${HSTAR}, rho at first trip ${tripSeeds.map((x) => x.rhoAtFirstTrip).join('/')})` : ''}`
    + `${noTrip.length ? `; NO-TRIP seeds ${noTrip.map((x) => `s${x.seed}`).join(',')}: postFlipMinRho ${noTrip.map((x) => x.postFlipMinRho).join('/')} vs bar -${HSTAR} — ${plateau.length === noTrip.length ? 'the cosine NEVER crossed the bar post-flip (5-of-10 sustained gate included)' : 'crossed but never sustained 5-of-10 (suppressed: ' + noTrip.map((x) => x.suppressed).join('/') + ')'}` : ''}`
    + `; XI-VISIBILITY receipt: the post-flip cosine CROSSED the bar in ${crossedN}/${SEEDS} seeds, sat INSIDE the honest floor's range in ${insideFloorN}/${SEEDS}, and stayed POSITIVE outright in ${aboveZeroN}/${SEEDS} (per-seed honest floor min ${MECHDATA.perSeed.map((x) => x.honestFloorMin_thisSeed).join('/')}); w1 pre-flip minRho ${R1[ARM_XI1].w1PreFlip ? R1[ARM_XI1].w1PreFlip.minRho : 'n/a'}`
    + `; TOXIC-SIGNATURE mechanism (measured): the E24 toxic vote is PRO-truth ${TOXSIG.P_toxProTruth_pricing} of rounds on the pricing seed (matrix: g1 ${TOXSIG.g1ProTruth_matrix ? TOXSIG.g1ProTruth_matrix.mean : 'n/a'}, w1 post-flip ${TOXSIG.w1PostProTruth_matrix ? TOXSIG.w1PostProTruth_matrix.mean : 'n/a'}); residuals ${TOXSIG.residBimodality_pricing.closeFrac} close (${TOXSIG.residBimodality_pricing.closeMean}) / ${r6(1 - TOXSIG.residBimodality_pricing.closeFrac)} far (${TOXSIG.residBimodality_pricing.farMean}) — the hypothesized ANTI-truth signature does not exist in this adversary; w1's post-flip alignment ranks ${TOXSIG.w1PostMeanRank_mean ?? 'n/a'}/12 among founders (per-seed ${TOXSIG.w1PostMeanRank_perSeed.join('/') || 'n/a'}), g1 ranks ${TOXSIG.g1MeanRank_perSeed.map((x) => x.rank).join('/') || 'n/a'}/12 — ${TOXSIG.w1PostMeanRank_mean && TOXSIG.w1PostMeanRank_mean <= N / 2 ? 'the attacker aligns BETTER than the honest median: no bar in alignment space (low or high) separates it without tripping the weaker half of the honest pool (wrong-side-of-population)' : 'attacker rank below the honest median — separation direction exists, magnitude is the binding constraint'}`
    + `; g1 (from-arrival) tripped in ${g1TrippedN}/${SEEDS} seeds${g1Lat ? ` (latency from ADMISSION ${g1Lat.mean}rd mean)` : ''}, g1 minRho ${armsAgg[ARM_XI1].sensorTelemetry.g1MinRho ? armsAgg[ARM_XI1].sensorTelemetry.g1MinRho.mean : 'n/a'} mean`
    + `; honest floor (matrix): per-founder minRho min ${floorMin} (within twin ${armsAgg[ARM_XI1].sensorTelemetry.founderFloorMinWithin} — floor comparison verdict ${FLOORCMP.verdict}, matrix delta ${FLOORCMP.matrixDelta}), founder false trips ${ftTotal} in ${ftSeeds}/${SEEDS} seeds (rate ${armsAgg[ARM_XI1].sensorTelemetry.founderTripRatePer200r}/200r vs budget 1.0; E38 CUSUM 29.9, E39 ratio 9.375, E40 0)`
    + `; damage delta vs A1 per seed [${dDelta.map((x) => (x >= 0 ? '+' : '') + r6(x)).join(', ')}] (trip seeds ${tripSeeds.map((x) => `s${x.seed}`).join(',') || 'n/a'})`
    + `; w1 decay events ${decaysW1.length} (${decaysW1.filter((e) => e.kind === 'rethrow').length} retrips; pre->post x${REPROB.frac}) | g1 decay events ${decaysG1.length} (D_g1 ${R4[ARM_XI1].g1Damage_paired.delta_B_minus_A1.mean} vs A1)`
    + `; co-tox screen (E40-carried): w1-g1 post-flip corr ${cts.w1g1PostFlipFull ? cts.w1g1PostFlipFull.mean : 'n/a'} mean (shared toxV) vs honest-honest trailing max ${cts.honestHonestTrailMax ? cts.honestHonestTrailMax.mean : 'n/a'} — the cascade null holds against the sister-referenced guard too`;
}
let MECH_VHI;
if (!ALIASED) {
  const hiTripSeeds = agg[ARM_XIHI].sensor.w1Trips.filter((x) => x.nPostFlip > 0);
  const hiG1Seeds = agg[ARM_XIHI].sensor.g1Trips.filter((x) => x.nTrips > 0);
  const hiFt = armsAgg[ARM_XIHI].sensorTelemetry.founderTripTotal;
  MECH_VHI = `conservative sibling CrossInstanceGuard(h=${CI.hiH}): sleeper trips ${hiTripSeeds.length}/${SEEDS} seeds (latency ${hiTripSeeds.length ? stat(hiTripSeeds.map((x) => x.latency)).mean : 'n/a'}rd), g1 trips ${hiG1Seeds.length}/${SEEDS}, founder false trips ${hiFt} (rate ${armsAgg[ARM_XIHI].sensorTelemetry.founderTripRatePer200r}/200r) — the sensitivity trade measured against XI1(h=${HSTAR})`;
}

const VERDICT = {
  crowned: CROWN ? CROWN.crowned : 'NONE',
  verdict: CROWN
    ? `CROWNED ${CROWN.crowned} (damage ratio ${CROWN.damageRatio}, sleeper latency ${CROWN.latency ? CROWN.latency.mean : 'n/a'}rd, g1 latency-from-admission ${CROWN.g1Latency ? CROWN.g1Latency.mean : 'n/a'}rd)`
    : (!R1OK
      ? `NO-CROWN (honest negative — R1 floor FAILS): the cross-instance statistic's honest-noise floor is too wide (${armsAgg[ARM_XI1].sensorTelemetry.founderTripRatePer200r}/200r founder trips vs budget 1.0) — that IS the finding; mechanism computed from telemetry`
      : (!R4OK && R3OK
        ? `PARTIAL: the cross-instance sensor SEES THE FLASHER, NOT THE SLEEPER — R3 g1-visibility ${R3[ARM_XI1].trippedSeeds}/${SEEDS} seeds while R2 sleeper detection ${R2[ARM_XI1].trippedSeeds}/${SEEDS} and R4 containment fails (ratio ${R4[ARM_XI1].damageRatio_B_over_A1}) — negative verdict, mechanism computed from telemetry`
        : `NO-CROWN: XI1 fails ${[R1OK ? null : 'R1', R2OK ? null : 'R2', R3OK ? null : 'R3', R4OK ? null : 'R4', R5OK ? null : 'R5'].filter(Boolean).join('+')} — negative verdict, mechanism computed from telemetry`)),
  crownDetail: CROWN,
  hiStatus: ALIASED ? 'aliased to XI1 (h* = hHi)' : { R1: R1[ARM_XIHI].verdict, R2: R2[ARM_XIHI].verdict, R3: R3[ARM_XIHI].verdict, R4: R4[ARM_XIHI].verdict, R5: R5.perSensor[ARM_XIHI].verdict, note: 'conservative sibling receipted alongside; the crown rides on XI1 per the receipted rule' },
  mechanism: ALIASED ? { XI1: MECH } : { XI1: MECH, XIhi: MECH_VHI },
  toxicSignature: TOXSIG,
  floorComparison: FLOORCMP,
  secondaryScreen: {
    note: 'SECONDARY telemetry — attacker co-toxicity screen (receipted: gates NOTHING; E40-carried). w1 post-flip shares g1\'s toxV, so the would-be cascade detector (suspect vs flagged voices) has a ~1.0 signal; the null is honest-honest co-movement',
    arm_XI1: armsAgg[ARM_XI1].sensorTelemetry.coToxScreen,
  },
  structuralFindings: [
    `floor comparison (the axis's structural bet): cross-instance floor ${FLOORCMP.matrix_paired.crossFloorMin} vs within-pool twin ${FLOORCMP.matrix_paired.withinFloorMin} in-matrix (delta ${FLOORCMP.matrixDelta}); pricing paired delta mean ${FLOORCMP.pricing_paired.deltaMean} (${FLOORCMP.pricing_paired.tightenedN}/12 founders tightened); vs E40 receipted pricing floor ${E40_RECEIPT.pricingFounderFloor_W20} and matrix floor ${E40_RECEIPT.matrixFounderFloorMin} — VERDICT ${FLOORCMP.verdict}`,
    `detection operating curve: ${CI.hSweep.map((h) => { const row = sweepTable.find((x) => x.h === h); return `h=${h}: w1 post-flip trips ${row.w1TripsPostFlip}, g1 trips ${row.g1Trips} (lat-from-adm ${row.g1LatencyFromAdmission}), founder trips ${row.gates.founderTrips} (${row.gates.founderRatePer200r}/200r), h2 trips ${row.gates.h2Trips}, delta ${row.delta}`; }).join('; ')} (probe seed 0; matrix coverage for h*=${HSTAR}${ALIASED ? '' : ` and h=${CI.hiH}`})`,
    `recovery receipt (R5e): ${B_ARMS.map((A) => { const r = R5.perSensor[A].recovery; return `${A}: ${r.vacuous ? 'no founder trips (vacuous)' : `${r.recoveredN}/${r.withFullHorizon} founder decay events recovered to >=95% of pre-trip share within 100 rounds${r.recoveredIn ? ` (mean ${r.recoveredIn.mean}rd; E37 baseline 23/25 mean 19.1r)` : ''}`}`; }).join('; ')} — the supervised reward stream (r = 1-|p-s|, pool-independent) keeps trust re-earning defense-proof`,
  ],
};

book('finding.R1', { rule: 'R1 HONEST-NOISE FLOOR (PRIMARY design constraint) — per-founder minRho distribution + false-trip projection vs budget 1.0/200r; priced (a) at pricing.dev (seed 100), (b) probe seed 0, (c) matrix XI1 arm; R1 PASSES iff matrix arm-wide founder rate <= 1.0; STRUCTURAL CLAUSE: cross vs within floor (paired) + E40 receipted comparison', perArm: R1, pricingRecap: { W20Floor: pricing.W[20][CI.variant].founderFloor, W20WithinFloor: pricing.W[20].within.founderFloor, W20CrossMedFloor: pricing.W[20].crossMed.founderFloor, sweep: CI.hSweep } });
book('finding.R2', { rule: 'R2 DETECTION — sleeper trips post-flip; PASS iff tripped seeds >= half AND mean latency < 30r; pre-flip trips receipted', perArm: R2 });
book('finding.R3', { rule: 'R3 g1 VISIBILITY — the from-arrival toxic MUST be visible (the standing relational hope: a cross-instance reference needs no personal history); PASS iff g1 throws in >= 2/3 of seeds; latency from g1\'s own admission', perArm: R3 });
book('finding.R4', { rule: 'R4 COUNTERFACTUAL DAMAGE (composition, when the guard fires) — D(XI1) < D(A1): paired one-sided sign test p < 0.05, delta +/- SE, damage ratio; g1 damage on the same footing; vacuous receipted', perArm: R4 });
book('finding.R5', { rule: 'R5 CANARIES — (a) honQ within 1 SE of A4, (b) h2 zero defense trips + admission arm-invariance, (c) g1 damage <= A1 + 1 SE, (d) FALSE-TRIP BUDGET explicit, (e) RECOVERY >= 95% within 100r (E37 baseline)', perSensor: R5.perSensor });
book('finding.floorStructural', { rule: 'STRUCTURAL (R1 clause 2 — the reason this axis was chosen): is the cross-instance honest floor TIGHTER than the within-pool floor? Paired on pricing seed 100 (same world, both references) + paired in-run (the guard\'s rhoW twin, same windows) + vs E40\'s receipted numbers', ...FLOORCMP });
book('finding.toxSignature', { rule: 'MECHANISM (booked whatever the verdict): the E24 toxic voice measured — P(pro-truth), residual bimodality, alignment RANK among founders (wrong-side-of-population receipt); the vote-stream-invisibility claim that closes (or re-opens) the four-axis ladder', ...TOXSIG });
book('finding.coToxScreen', { rule: 'SECONDARY (telemetry only, gates nothing; E40-carried): attacker co-toxicity screen — w1-vs-g1 post-flip residual correlation (shared toxV) vs honest-honest / honest-vs-g1 trailing maxima', arm_XI1: armsAgg[ARM_XI1].sensorTelemetry.coToxScreen, ...(ALIASED ? {} : { arm_XIhi: armsAgg[ARM_XIHI].sensorTelemetry.coToxScreen }) });
book('finding.verdict', { ...VERDICT, r_ok: { R1: R1OK, R2: R2OK, R3: R3OK, R4: R4OK, R5: R5OK }, mechanismPerSeed: MECHDATA.perSeed });
book('finding.runtime', {
  seedsRun: SEEDS, probeBlock_s: +(probeMs / 1000).toFixed(1), matrixElapsed_s: elapsedMatrix,
  totalElapsed_s: +((Date.now() - t0) / 1000).toFixed(1),
  totalNote: 'total = matrix loop (seed 0 carried from probe, included as seed-0 row booking; sister runs included); probe booked separately',
  cut: cut ?? 'none — full plan within budget', vaultLiveJobs: vault.liveJobs,
});

const chain = sealChain(rows);
const tip = rows[rows.length - 1].row_hash;
const vfy = verifyChain(rows);
if (!vfy.ok) { console.error('CHAIN VERIFY FAILED', vfy); process.exit(1); }
console.log(`chain: ${rows.length} rows, tip ${tip} VERIFIED`);

mkdirSync('experiments/outputs', { recursive: true });
const summary = {
  task: 'E41', name: 'the cross-instance detector (a sister instance\'s pooled consensus as the detector reference, composed with trust re-probation vs the E35 sleeper)',
  seeds: SEEDS, T, voices: V, sisterFounders: N, kStarCarried: KSTAR, arms: ARMS, hStar: HSTAR, aliased: ALIASED, W: CI.W, variant: CI.variant,
  runtime_s: { probeBlock: +(probeMs / 1000).toFixed(1), matrix: elapsedMatrix, total: +((Date.now() - t0) / 1000).toFixed(1) },
  config: {
    world: { FLIP_P, REROLL_P, N, TOX_Q, JOIN }, damageWindow: DW, pre: PRE, g1Window: G1_WIN,
    hedge: CFG, admission: ADM, crossInstance: CI, reprob: REPROB, roster: ALL_IDS, sisterRoster: SIS_HONEST,
    deviations: ['g1 ACTIVE in all attack arms (E36 deviation carried — same-arm regression/visibility baseline)', 'k* = 25 carried from E35 (no re-search)', 'probe block doubles as matrix seed 0 (no re-run; sister cached)', 'CrossInstanceGuard = CoMovementGuard plumbing + sister-referenced cosine (E40 within-pool ALIGN carried as a TELEMETRY-ONLY twin for the paired floor comparison); TrustReprobation E37-E40 verbatim (detector swap ONLY)', 'sweep + variant set from design-time pricing (seed 100, disjoint; pricing.dev row + receipted sweep rule)', 'fresh e41:* world draws (generator verbatim); sister streams independent (e41:sskill/e41:svote), SAME truth'],
  },
  pricing,
  hpick: { sweepTable, picked: HSTAR, relaxed: pick.relaxed, aliased: ALIASED },
  arms: armsAgg,
  claims: { R1, R2, R3, R4, R5, floorComparison: FLOORCMP, toxicSignature: TOXSIG, verdict: VERDICT },
  perSeed: seedRows,
  chain: { rows: rows.length, tip, verified: vfy.ok },
};
writeFileSync('experiments/outputs/e41_summary.json', JSON.stringify(summary, null, 1));
writeFileSync('experiments/outputs/receipts_e41.jsonl', rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
// file re-verify (E35 discipline: the chain must verify FROM THE WRITTEN FILE)
const reread = readFileSync('experiments/outputs/receipts_e41.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const vfyFile = verifyChain(reread);
console.log(`file re-verify: ${vfyFile.ok ? 'OK' : 'FAILED'} (${reread.length} rows)`);
if (!vfyFile.ok) { console.error('FILE CHAIN VERIFY FAILED', vfyFile); process.exit(1); }

console.log(`R1 floor ${ARM_XI1}: ${R1[ARM_XI1].verdict} (founder trips ${R1[ARM_XI1].falseTrips.total} = ${R1[ARM_XI1].falseTrips.ratePer200r}/200r vs budget 1.0; matrix floor minRho ${R1[ARM_XI1].founderFloorMin_matrix}; within twin ${R1[ARM_XI1].founderFloorMinWithin_matrix}) | FLOORCMP ${FLOORCMP.verdict}`);
for (const B of B_ARMS) console.log(`R2 detect ${B}: ${R2[B].verdict} trips=${R2[B].trippedSeeds}/${SEEDS} latency=${R2[B].latency ? R2[B].latency.mean : 'n/a'}rd preFlipTrips=${R2[B].preFlipTrips_total}`);
for (const B of B_ARMS) console.log(`R3 g1 ${B}: ${R3[B].verdict} trips=${R3[B].trippedSeeds}/${SEEDS} latFromAdm=${R3[B].latencyFromAdmission ? R3[B].latencyFromAdmission.mean : 'n/a'}rd minRho=${R3[B].minRho ? R3[B].minRho.mean : 'n/a'}`);
for (const B of B_ARMS) console.log(`R4 damage ${B}: ${R4[B].verdict}${R4[B].vacuous ? ' (vacuous)' : ''} ratio(B/A1)=${R4[B].damageRatio_B_over_A1} delta=${R4[B].pairedDelta_A1_minus_B.mean}±${R4[B].pairedDelta_A1_minus_B.se} p=${R4[B].signTest_oneSided.p} | g1 delta=${R4[B].g1Damage_paired.delta_B_minus_A1.mean}±${R4[B].g1Damage_paired.delta_B_minus_A1.se}`);
for (const B of B_ARMS) { const e = R5.perSensor[B]; console.log(`R5 canaries ${B}: ${e.verdict} honQ(${e.honQ.diff_vs_A4.pass_1SE ? 'pass' : 'FAIL'} ${e.honQ.diff_vs_A4.mean}±${e.honQ.diff_vs_A4.se}) h2(${e.h2.defenseTrips === 0 && e.h2.invariancePass ? 'pass' : 'FAIL'} trips=${e.h2.defenseTrips}) g1(${e.g1.pass ? 'pass' : 'FAIL'} ${e.g1.pairedDelta_B_minus_A1.mean}) ft(${e.falseTrips.pass ? 'pass' : 'FAIL'} ${e.falseTrips.ratePer200r}/200r) rec(${e.recovery.verdict})`); }
console.log(`TOXSIG: P(pro-truth) pricing ${TOXSIG.P_toxProTruth_pricing} | w1 post-flip mean rank ${TOXSIG.w1PostMeanRank_mean ?? 'n/a'}/12 | g1 ranks ${TOXSIG.g1MeanRank_perSeed.map((x) => x.rank).join('/') || 'n/a'}/12`);
console.log(`CROWN: ${VERDICT.crowned}  (${VERDICT.verdict})`);
console.log(vault.liveJobs === 0 ? 'E41 DONE' : 'E41 PROBLEM (live jobs)');
