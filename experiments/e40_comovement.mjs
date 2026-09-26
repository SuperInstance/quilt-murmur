// E40 — THE CO-MOVEMENT SENSOR (cross-voice flip-round co-movement detection)
// ==================================================================================================
// Collides with E39's carried seed. E39 (receipt 0x2743856b93de03ee) killed the variance lens:
// the honest-expert baseline variance is as WIDE as the toxic variance (MIRRORED BIMODALITY — the
// ratio is blind to which mode dominates), honest founders' own regime-noise bursts naturally hit
// ratio 2.75-7.34 (9.4x false-trip budget), and the false trips REDISTRIBUTE trust toward the
// unflagged flipper (V1 1.096x WORSE than the undefended control, sign p=0.996). E38 killed
// mean-shift CUSUM (post-flip mean sits AT/BELOW the sleeper's own probation mu; flat-sigma floor
// = 30x budget). Two structural constraints are now receipted for ANY future detector:
//   (1) the signal must be RELATIONAL (suspect-vs-pool), not self-calibrated — g1 is invisible to
//       any self-calibrated design because its own baseline IS the attack (0 trips at h=3.5);
//   (2) the honest-noise floor of the statistic must be PRICED BEFORE composing trust
//       consequences (E38 30x, E39 9.4x).
// E39's telemetry carries the co-movement seed: w1<->g1 residual sign-correlation lag0 = 0.54-0.99
// (co-toxicity is CONTEMPORANEOUS — they share toxV), honest founders vs g1 max 0.46.
//
// E40 builds exactly the relational sensor:
//
//   CoMovementGuard — ALIGN, an uncentered cosine between a suspect's vote-deviation stream and
//   the pool-consensus deviation stream (a RELATIONAL statistic: the reference is the POOL's
//   behavior, not the sender's own history — there is NO per-sender baseline anywhere in this
//   detector, which is precisely what makes a from-arrival toxic visible).
//     consensus m(t)  = median of the round's murmured votes (robust to the <= 2 toxic voices;
//                       suspect's own vote included — a 15th-of-15 effect, receipted)
//     deviation pairs  pv_i(t) = p_i(t) - 0.5 (the protocol-neutral origin: votes are posteriors
//                       P(s=1), 0.5 = no information) and mv(t) = m(t) - 0.5
//     statistic        rho_i(t) = sum_W(pv*mv) / sqrt(sum_W(pv^2) * sum_W(mv^2))  over the
//                       trailing W=20 rounds (UNCENTERED: centering each stream by its own
//                       window-mean would subtract out exactly the anti-state mean that IS the
//                       signal — receipted design note; this is a cosine, not a Pearson)
//     signature        an honest voice of ANY acuity leans WITH the consensus on average
//                       (E[(p-0.5)(m-0.5)] = (q-.5)(2q-1)E|m-.5| > 0 even at q=0.55), so its
//                       cosine sits ABOVE zero; a liar votes the anti-state side 75% of rounds
//                       (E24 toxic formula), so its cosine goes NEGATIVE — strongly, from
//                       ARRIVAL, with no personal history needed.
//     TRIP when rho_i < -h (sweep {0.20, 0.35, 0.50}, bars priced on the honest floor by the
//     design-time pricing run, seed 100 — disjoint from matrix seeds 0-7) SUSTAINED for 5 of the
//     last 10 evaluation rounds; the sustained window RESETS on a trip (E38/E39 analogue).
//     Evaluation requires: the sender ADMITTED (probation streams still fill the window, so a
//     newcomer is evaluated the round it is admitted with a full window) + a full trailing-W
//     window. epsDen=1e-12 guards a literal 0/0 (all-neutral window) -> rho := 0.
//
//   SECONDARY AXIS (telemetry ONLY — gates NOTHING, receipted): the attacker co-toxicity screen.
//   w1 post-flip reuses g1's toxic series, so their SIGNED residuals (p - pooled) are identical
//   post-flip — a would-be cascade detector ("suspect correlates with OTHER flagged voices")
//   would see corr ~ 1. We price it: w1-vs-g1 full-window + trailing-window post-flip
//   correlation, honest founders vs g1 max, and the honest-honest pairwise trailing max (the
//   cascade null). Reported in finding.coToxScreen; nothing gates.
//
//   Consequence on trip (E37/E38/E39 verbatim, detector swap ONLY): TrustReprobation (HedgeTrust
//   weight x0.5 via absorb, re-earns through the normal fixed-share + exp(eta*r) path) +
//   influence re-probation (epsNew for 40 guard rounds). TrustReprobation is copied VERBATIM from
//   e39_variance.mjs (trip events carry trail30/refMean fields so the class stays byte-identical;
//   trail30 = trailing-W mean product, refMean = 0 — the protocol-neutral origin, receipted: no
//   self-baseline exists in this detector). Guard plumbing (windows {from:t+1, until:t+40},
//   release events, epsNew throwback, suppressed crossings, throw/rethrow kinds) is FlipGuard's,
//   E37/E38/E39-verbatim.
//
// THE QUESTION (receipted as R1-R5 below): is the honest-noise floor of the relational statistic
// narrow enough to price bars that (R2) see the flip fast, (R3) see g1 FROM ARRIVAL — the one
// place a relational design can beat self-calibration — while (R4) containing damage when
// composed with trust consequences and (R5) keeping the canaries clean? If the honest floor of
// ALIGN is itself too wide, that IS the finding — receipt it with numbers.
//
// SETUP (E38/E39 world verbatim, fresh e40:* draws): 12 honest founders (mixed acuity, a1 = 0.9
// reference) + 1 honest late-joiner h2 (t=150, honest forever — the false-positive canary) +
// 1 flasher g1 (toxic from arrival, t=150 — the REGRESSION canary in E38/E39, but the VISIBILITY
// target here: R3 requires the relational sensor to see it) + 1 sleeper w1 (t=150, honest phase =
// e24 h1 generator verbatim, flips at admission + k* = 25 — E35's probe-optimal, carried). T=400,
// 8 seeds (probe rule may cut to 6). Paired arms, IDENTICAL worlds (same truth stream, honest
// votes, toxic series; arms select over shared values):
//   A1   no-defense+sleeper — full v3.1 + sleeper + active g1, NO defense (E36-E39 control)
//   CM1  comovement(best-h) — v3.1 + CoMovementGuard(h* = probe-picked from the sweep) +
//                             trust re-probation + same attack [the candidate]
//   CMhi comovement(0.50)   — v3.1 + CoMovementGuard(h = 0.50) + trust re-probation + same
//                             attack [conservative sibling — measures the sensitivity trade; if
//                             h* = 0.50 the two arms coincide and CM1 ALIASES CMhi (receipted,
//                             no re-run)]
//   A4   v3.1-clean         — full v3.1, no attack, NO defense (collateral baseline)
//
// DAMAGE METHOD (E35/E36/E37/E38/E39 counterfactual, verbatim): D = mean over the post-flip
// window [t_flip, min(t_flip+150,400)) of |err(pool) - err(pool with that attacker zeroed)|,
// err = |pool - s|, counterfactual pools are reference-side only (MurmurBus.pool, log-odds),
// never written to the sheet. Sleeper window anchored at t_adm + 25 with t_adm measured per seed
// on a pass-1 honest-forever A1-wiring run (in-run assert: pass-1 == matrix admission). g1 uses
// its own window [150, 300). Positive = hurts.
//
// DECISION RULES (receipted EXACTLY, BEFORE the full run; brief numbering R1-R5):
//   R1 HONEST-NOISE FLOOR (the primary design constraint, priced BEFORE composition): the
//      ALIGN floor = per-founder distribution of minRho (the most negative cosine reached) over
//      honest phases, measured three ways — (a) DESIGN-TIME pricing on seed 100 (disjoint from
//      matrix seeds 0-7; booked as the pricing.dev row BEFORE any run row), (b) the probe's
//      seed-0 guard arms, (c) the full matrix CM1 arm. False-trip projection: founder throw
//      + rethrow events per 200 rounds arm-wide vs budget 1.0 (E38: 29.9 = 30x fail; E39: 9.375
//      = 9.4x fail). R1 PASSES iff the MATRIX arm-wide founder rate <= 1.0.
//   R2 DETECTION: the sleeper trips post-flip. PASS iff tripped seeds >= half AND mean latency
//      (first post-flip throw minus t_flip) < 30 rounds over tripped seeds. Pre-flip trips on w1
//      are receipted (they count as false trips on an honest-phase voice).
//   R3 g1 VISIBILITY: the from-arrival toxic MUST be visible to a relational sensor — this is
//      the one place a relational design can beat self-calibration (E38: "g1 invisible by
//      construction"; E39: 0 trips at h=3.5). PASS iff g1 throws in >= 2/3 of seeds. Latency
//      measured from g1's own admission round (the guard evaluates from admission; the window
//      fills during probation).
//   R4 COUNTERFACTUAL DAMAGE (composition): D(CM1) < D(A1) — paired one-sided sign test (zeros
//      excluded) p < 0.05; report paired delta +/- SE and damage ratio D(CM1)/D(A1). CMhi
//      receipted alongside (the sensitivity trade) but the crown rides on CM1. g1 damage
//      reported on the same footing (a relational sensor that SEES g1 should REDUCE D_g1 — a
//      first in the arc; an INCREASE beyond A1 + 1 SE fails R5c).
//   R5 CANARIES — ALL must hold:
//      (a) honestFinalQ within 1 SE of A4 (seed-paired);
//      (b) h2: ZERO defense trips across the arm AND h2's per-seed admission outcome identical
//          to A1's (arm-invariance; the E39-native 7/8 admission miss is admission's property,
//          receipted per seed, not a defense effect);
//      (c) g1 damage <= A1 + 1 SE (SE of the seed-paired difference; a DROP is the expected
//          relational win and passes trivially);
//      (d) FALSE-TRIP BUDGET — explicit: total honest-founder trips, per-founder histogram,
//          rate <= 1.0 per 200 rounds arm-wide (same measurement as R1c);
//      (e) RECOVERY — false-tripped founders re-earn to >= 95% of pre-trip trust share within
//          100 rounds (E37 baseline: 23/25, mean 19.1r — must not regress); events without a
//          full 100-round horizon receipted but excluded; vacuous pass if no trips.
//   CROWN — if CM1 passes R1 + R2 + R3 + R4 + R5, crown it with its damage ratio, sleeper
//      latency, and the g1-containment receipt (the first sensor in the arc to see a
//      from-arrival liar). If R4 fails while R3 holds: receipt the PARTIAL verdict ("sees the
//      flasher, not the sleeper"). If R1 fails: honest negative — the floor IS the finding.
//      No pre-drafted text: every clause is filled from measured numbers.
//
// PROBE h-PICK (receipted before any run; E38/E39 rule verbatim, h := |negative-cosine| bar):
// the probe is a 1-seed (seed 0) timed run of the full matrix + the h-sweep (pass-1 + A1 + A4 +
// CM-h for h in {0.20, 0.35, 0.50}). For each h: delta_h = D_w1(A1, s0) - D_w1(CM_h, s0); hard
// gates on seed 0: (i) ZERO trips on h2; (ii) D_g1(CM_h, s0) <= D_g1(A1, s0) + 1e-4 (single-seed
// proxy for R5c's +1 SE form; 1e-4 ~ 5x E37's measured founder-decay leak, chosen before the
// run); (iii) founder-trip rate on seed 0 <= 1.0 per 200 rounds (<= 2 trips). PICK: argmax
// delta_h among h passing ALL gates; ties (|delta| <= 1e-9) -> LARGER h (more conservative). If
// no h passes all gates: argmax delta among h passing gate (i) alone (receipted
// relaxed='founder-only'); if still none: argmax delta (relaxed='none'). If h* = 0.50: CM1 ==
// CMhi (alias, receipted).
//
// RUNTIME DISCIPLINE (receipted before the full run): probe = the timed seed-0 block (pass-1 +
// A1 + A4 + the 3-arm h-sweep = 6 runs); projected = t_probe * 8 + 2s IO (the probe block is >=
// any matrix seed's work: 5 runs when h* != 0.50, 4 when aliased — the projection is
// conservative); if projected > 170s, cut seeds 8 -> 6 and RECEIPT the cut (E36-E39 ran
// ~95-135s at 6-8 seeds). The probe doubles as matrix seed 0 (no re-run).
//
// SWEEP PROVENANCE (receipted): the sweep {0.20, 0.35, 0.50} and W = 20 were set from the
// design-time pricing run (E40_PRICE=1, seed 100 — DISJOINT from matrix seeds 0-7). The pricing
// mode is part of this artifact (telemetry-only streaming of ALIGN/PROD/OPP + the co-toxicity
// screen over the raw world streams — no engine, no consequences); the main run RE-COMPUTES the
// same pricing in-run and books it as the pricing.dev row BEFORE run.config's run rows, so the
// sweep choice is attested inside the chain.
//
// COMPOSITION RECEIPT (stated up front): both mechanisms are EXPERIMENT-LOCAL classes over the
// murmur/ module APIs — ZERO changes to murmur/ (target: zero). Hooks used:
//   Admission: observe(), reattribute(), notePooled(), admitted(), admittedRound(),
//     probationary(), devMean(), firstSeen (public, read-only), admitWindow/epsNew/admitErr
//     (public config fields)
//   HedgeTrust: weights(), update(), absorb(), weight()  <- the trust-decay hook
//   MurmurBus.pool() (reference-side counterfactuals), receipts.sealChain/verifyChain.
// CoMovementGuard = FlipGuard's PLUMBING verbatim (rec/note/apply/summary skeleton, guard
// windows {from:t+1, until:t+40}, release events, epsNew throwback, guardRounds accounting,
// throw/rethrow kinds) with the trip statistic swapped: per-sender self-calibrated baselines ->
// the pool-referenced ALIGN cosine (NO per-sender baseline anywhere). TrustReprobation is copied
// VERBATIM from e39_variance.mjs (unmodified — it reads only the detector's event log). The
// cosine streams EVERY round with a full trailing window (the spec formula); trip EVENTS
// evaluate only for ADMITTED senders with no open guard window (E37 plumbing) — suppressed
// sustained conditions are counted in telemetry; on a trip event the sustained window resets.
//
// RNG DOCTRINE (binding, E35-E39 verbatim): all randomness through MothVault (offline:true), one
// harvest, per-purpose stream keys 'e40:<purpose>:<seed>' via streamFor; NO Math.random. Paired
// worlds REQUIRE arm-identical world streams — arms never consume different draws. Fresh e40:*
// draws (the world GENERATOR is E37/E38/E39 verbatim; the stream-key prefix is per-task by
// doctrine). Pricing uses seed 100 — outside the matrix seed set {0..7}.
//
// Run: node experiments/e40_comovement.mjs [seeds]   (E40_DEV=1 for a 1-seed dev run; E40_PRICE=1
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
let SEEDS = Number(process.argv[2] || (process.env.E40_DEV ? 1 : 8));
const FLIP_P = 0.02, REROLL_P = 0.01;
const JOIN = 150;                              // newcomers join here
const TOX_Q = 0.25;                            // E24 toxic formula (verbatim)
const PRE = { from: 120, to: 150 };            // pre-attack baseline
const DW = 150;                                // damage window length (receipted)
const KSTAR = 25;                              // carried from E35's probe (probe-optimal)
const SLEEP = 'w1', INSTANT = 'g1', JOINER = 'h2';
const HONEST = Array.from({ length: N }, (_, i) => `a${i + 1}`);
const ALL_IDS = [...HONEST, SLEEP, INSTANT, JOINER];
const V = ALL_IDS.length; // 15 voice slots
const CFG = { eta: 0.25, share: 0.02 };
const ADM = {
  beta: 0.12, alpha: 0.25, novSpread: 0.15,
  coldStart: true, admitWindow: 40, epsNew: 0.15,
  minEdgesIndep: 2, admitErr: 0.5, capShare: 0.10,
};
const CO = {
  W: 20,                 // trailing window for the ALIGN cosine (priced; sweep provenance receipted)
  sustainWin: 10,        // sustained 5 of the last 10 evaluation rounds (E38/E39 gate shape)
  sustainNeed: 5,
  hSweep: [0.2, 0.35, 0.5], // probe sweep — bars priced on the honest floor (pricing.dev row)
  hiH: 0.5,              // conservative sibling (CMhi)
  epsDen: 1e-12,         // 0/0 guard ONLY (all-neutral window -> rho := 0) — NOT a noise floor (receipted)
  guardRounds: 40,       // epsNew re-probation window (E36-E39 verbatim)
};
const REPROB = { frac: 0.5, horizon: 100 };    // E37 TrustReprobation verbatim
const G1_WIN = { from: JOIN, to: JOIN + DW };  // g1's own window [150, 300)
const TOL = 1e-9;
const PROBE_G1_TOL = 1e-4;                     // receipted probe gate (ii) tolerance
const PRICE_SEED = 100;                        // design-time pricing seed — DISJOINT from matrix seeds 0-7

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

// ---------------- world (E38/E39 verbatim; stream keys e40:*) ----------------
function genWorld(seed, harvest, vault) {
  const wR = makeRng(harvest, vault, `e40:world:${seed}`);
  const qR = makeRng(harvest, vault, `e40:skill:${seed}`);
  const xR = makeRng(harvest, vault, `e40:tox:${seed}`);
  const shR = makeRng(harvest, vault, `e40:sleep:${seed}`);
  const nhR = makeRng(harvest, vault, `e40:h2:${seed}`);
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
  for (let i = 0; i < N; i++) vR.push(makeRng(harvest, vault, `e40:vote:${seed}:${i}`));
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

// ---------------- sheet (15 voice slots; formulas IDENTICAL for every arm) --
function buildSheet() {
  const cells = [];
  for (const id of ALL_IDS) cells.push({ id: `v.${id}`, kind: 'value', value: 0.5, description: `voice ${id} (posterior P(s=1))` });
  for (const id of ALL_IDS) cells.push({ id: `w.${id}`, kind: 'value', value: 1 / V, description: `influence weight ${id} (protocol-adjusted)` });
  const lg = (x) => `Math.log(clamp(${x},0.02,0.98)/(1-clamp(${x},0.02,0.98)))`;
  const sig = (z) => `(1/(1+Math.exp(-(${z}))))`;
  const hT = [], hD = [];
  for (const id of ALL_IDS) { hT.push(`w.${id}*${lg(`v.${id}`)}`); hD.push(`w.${id}`); }
  cells.push({ id: 'pool.hedge', kind: 'formula', expr: sig(`(${hT.join(' + ')}) / (${hD.join(' + ')})`) });
  cells.push({ id: 'amp.w1', kind: 'formula', expr: `w.${SLEEP} / (${hD.join(' + ')})` });
  cells.push({ id: 'amp.g1', kind: 'formula', expr: `w.${INSTANT} / (${hD.join(' + ')})` });
  cells.push({ id: 'amp.h2', kind: 'formula', expr: `w.${JOINER} / (${hD.join(' + ')})` });
  return { id: `comovelane-${V}`, title: `E40 co-movement lane (${V} voice slots)`, cells };
}

// ---------------- DESIGN-TIME PRICING (telemetry only — no engine, no consequences) -----------
// Streams ALIGN (+ the two REJECTED candidate shapes PROD/OPP) and the co-toxicity screen over
// the RAW world streams on seed PRICE_SEED (disjoint from matrix seeds 0-7). The main run books
// this as the pricing.dev row BEFORE any run row; the sweep constants are set from it. t_adm for
// the pricing flip is approximated at 189 (E35 measured admission at t=189, 8/8 seeds) — receipted
// as a pricing-only approximation; admission gating is NOT simulated (pricing measures the
// STATISTIC's floor over honest streams, not the guard's evaluation gating).
function priceWorld(harvest, vault) {
  const world = genWorld(PRICE_SEED, harvest, vault);
  const flip = 189 + KSTAR;
  const presentP = (id, t) => {
    if (HONEST.includes(id)) return world.votes[t][Number(id.slice(1)) - 1];
    if (id === SLEEP) return t < JOIN ? null : (t < flip ? world.sleepH[t] : world.toxV[t]);
    if (id === INSTANT) return t >= JOIN ? world.toxV[t] : null;
    if (id === JOINER) return t >= JOIN ? world.h2V[t] : null;
    return null;
  };
  const medOf = (t) => median(ALL_IDS.map((id) => presentP(id, t)).filter((x) => x !== null));
  const out = { seed: PRICE_SEED, flipApprox: flip, W: {}, rejected: {}, coTox: {} };
  for (const W of [20, 30]) {
    const per = {};
    for (const id of ALL_IDS) {
      const win = [];
      const rhos = [];
      for (let t = 0; t < T; t++) {
        const p = presentP(id, t);
        if (p === null) continue;
        win.push({ pv: p - 0.5, mv: medOf(t) - 0.5 });
        if (win.length > W) win.shift();
        if (win.length < W) continue;
        let num = 0, sp2 = 0, sm2 = 0;
        for (const e of win) { num += e.pv * e.mv; sp2 += e.pv * e.pv; sm2 += e.mv * e.mv; }
        const den = Math.sqrt(sp2 * sm2);
        rhos.push({ t, rho: den > 1e-12 ? num / den : 0 });
      }
      per[id] = rhos;
    }
    const fmin = HONEST.map((id) => Math.min(...per[id].map((x) => x.rho)));
    out.W[W] = {
      founderMinRho: Object.fromEntries(HONEST.map((id, i) => [id, r6(fmin[i])])),
      founderFloor: r6(Math.min(...fmin)),           // most negative honest cosine anywhere
      founderMeanRho: Object.fromEntries(HONEST.map((id) => [id, r6(mean(per[id].map((x) => x.rho)))])),
      w1PreFlipMin: r6(Math.min(...per[SLEEP].filter((x) => x.t < flip).map((x) => x.rho))),
      w1PreFlipMean: r6(mean(per[SLEEP].filter((x) => x.t < flip).map((x) => x.rho))),
      w1PostFlipMin: r6(Math.min(...per[SLEEP].filter((x) => x.t >= flip).map((x) => x.rho))),
      w1PostFlipMean: r6(mean(per[SLEEP].filter((x) => x.t >= flip).map((x) => x.rho))),
      g1Min: r6(Math.min(...per[INSTANT].map((x) => x.rho))),
      g1Mean: r6(mean(per[INSTANT].map((x) => x.rho))),
      h2Min: r6(Math.min(...per[JOINER].map((x) => x.rho))),
      separation: r6(Math.min(...per[SLEEP].filter((x) => x.t >= flip).map((x) => x.rho)) - Math.min(...fmin)), // post-flip w1 minus honest floor (negative = INSIDE the floor)
      g1Separation: r6(Math.min(...per[INSTANT].map((x) => x.rho)) - Math.min(...fmin)),
    };
  }
  // REJECTED candidate shapes (priced, for the receipt): PROD = mean product (scale varies with
  // |m-0.5| -> cross-seed bar instability); OPP = direction-opposition rate (binomial noise on a
  // ~0.46 low-q honest null drowns the 0.67 toxic signature).
  {
    const W = 20;
    const prod = {}, opp = {};
    for (const id of ALL_IDS) {
      const win = []; const prods = []; const opps = [];
      for (let t = 0; t < T; t++) {
        const p = presentP(id, t);
        if (p === null) continue;
        const mv = medOf(t) - 0.5;
        win.push({ pv: p - 0.5, mv });
        if (win.length > W) win.shift();
        if (win.length < W) continue;
        prods.push(mean(win.map((e) => e.pv * e.mv)));
        opps.push(mean(win.map((e) => (Math.sign(e.pv) !== 0 && Math.sign(e.mv) !== 0 && Math.sign(e.pv) !== Math.sign(e.mv)) ? 1 : 0)));
      }
      prod[id] = prods; opp[id] = opps;
    }
    out.rejected = {
      PROD: { founderMin: r6(Math.min(...HONEST.flatMap((id) => prod[id]))), w1PostFlipMean: r6(mean(prod[SLEEP].slice(Math.floor(flip / 1)))), g1Mean: r6(mean(prod[INSTANT])), note: 'scale varies with E|m-0.5| — no dimensionless bar' },
      OPP: { founderMax: r6(Math.max(...HONEST.flatMap((id) => opp[id]))), w1PostFlipMean: r6(mean(opp[SLEEP])), g1Mean: r6(mean(opp[INSTANT])), note: 'low-q honest null ~0.46 vs toxic ~0.67 — binomial noise over W=20 swamps the gap' },
    };
  }
  // co-toxicity screen pricing: signed residuals vs an equal-weight pooled reference
  {
    const resid = {};
    for (const id of ALL_IDS) {
      resid[id] = new Map();
      for (let t = 0; t < T; t++) {
        const p = presentP(id, t);
        if (p === null) continue;
        const ps = ALL_IDS.map((i2) => presentP(i2, t)).filter((x) => x !== null);
        resid[id].set(t, p - MurmurBus.pool(ps, ps.map(() => 1 / ps.length)));
      }
    }
    const pairOver = (a, b, tMin) => {
      const xs = [], ys = [];
      for (const [t, x] of resid[a]) { if (t < tMin) continue; const y = resid[b].get(t); if (y !== undefined) { xs.push(x); ys.push(y); } }
      return xs.length >= 20 ? pearson(xs, ys) : null;
    };
    const trailMax = (a, b, W = 20) => {
      let mx = null;
      for (const [t] of resid[a]) {
        if (t < W) continue;
        const xs = [], ys = [];
        for (let u = t - W + 1; u <= t; u++) { const x = resid[a].get(u), y = resid[b].get(u); if (x !== undefined && y !== undefined) { xs.push(x); ys.push(y); } }
        if (xs.length < W) continue;
        const r = pearson(xs, ys);
        if (r !== null && (mx === null || r > mx)) mx = r;
      }
      return mx;
    };
    let hhMax = null, hgMax = null;
    for (let i = 0; i < HONEST.length; i++) {
      const rHg = trailMax(HONEST[i], INSTANT);
      if (rHg !== null && (hgMax === null || rHg > hgMax)) hgMax = rHg;
      for (let j = i + 1; j < HONEST.length; j++) {
        const r = trailMax(HONEST[i], HONEST[j]);
        if (r !== null && (hhMax === null || r > hhMax)) hhMax = r;
      }
    }
    out.coTox = {
      w1g1PostFlipFull: r6(pairOver(SLEEP, INSTANT, flip)),
      w1g1TrailLatencyCurve: Object.fromEntries([5, 10, 15, 20, 25, 30, 40].map((k) => [k, r6(pairOver(SLEEP, INSTANT, flip + k))])),
      honestVsG1TrailMax: hgMax === null ? null : r6(hgMax),
      honestHonestTrailMax: hhMax === null ? null : r6(hhMax),
      note: 'would-be cascade detector (suspect vs flagged g1): w1-g1 ~ 1 post-flip (shared toxV) vs honest-honest null below',
    };
  }
  return out;
}

// __DEFENSES_BEGIN (experiment-local; murmur/ untouched — composition receipt)
// CoMovementGuard — FlipGuard's plumbing (copied from e39_variance.mjs's VarianceGuard:
// rec/note/apply/summary skeleton, guard windows, release events, epsNew throwback, guardRounds
// accounting, throw/rethrow kinds) with the trip statistic swapped for the E40 spec: the
// RELATIONAL ALIGN cosine — sum_W(pv*mv)/sqrt(sum_W(pv^2)*sum_W(mv^2)) over the sender's trailing
// W vote-deviations (pv = p - 0.5, protocol-neutral origin) and the round's consensus deviation
// (mv = median-vote - 0.5). NO per-sender baseline exists anywhere in this detector — the
// reference is the POOL's behavior (mv is shared across senders), which is what makes a
// from-arrival toxic visible (R3). The cosine streams EVERY round (window fills during
// probation); trip EVENTS evaluate only for ADMITTED senders with a full window and no open
// guard window (E37 plumbing); sustained gate = 5 of the last 10 evaluation rounds, window
// RESETS on a trip; epsDen = 1e-12 is a 0/0 guard ONLY -> rho := 0 (receipted, NOT a noise
// floor). Trip event fields: rho/sustain + trail30 (trailing-W mean product) and refMean = 0
// (protocol-neutral origin — field names keep TrustReprobation byte-verbatim).
class CoMovementGuard {
  constructor(adm, cfg) { // cfg: { h, W, sustainWin, sustainNeed, epsDen, guardRounds }
    this.adm = adm; this.cfg = cfg;
    this.wins = new Map();      // id -> [{t, pv, mv}] — the sender's trailing vote-deviation window
    this.signed = new Map();    // id -> Map(t -> p - pooled) — signed residuals (co-toxicity screen telemetry)
    this.susWin = new Map();    // id -> last sustainWin crossed-booleans (the sustained gate)
    this.track = new Map();     // id -> { n, minRho, minRhoAt, maxRho, lastRho, crossedRounds } — per-sender statistic telemetry
    this.w1Path = [];           // SLEEP's full {t, rho, crossed} path (mechanism receipt)
    this.g1Path = [];           // INSTANT's full {t, rho, crossed} path (R3 mechanism receipt)
    this.suppressed = new Map();// id -> sustained conditions suppressed by an open guard window
    this.guarded = new Map();   // id -> { from, until } — epsNew throwback window
    this.events = [];
    this.guardRounds = new Map();
  }
  rec(id, t, p, mv, pool) {
    if (!this.wins.has(id)) this.wins.set(id, []);
    const win = this.wins.get(id);
    win.push({ t, pv: p - 0.5, mv });
    if (win.length > this.cfg.W) win.shift();
    if (!this.signed.has(id)) this.signed.set(id, new Map());
    this.signed.get(id).set(t, p - pool);
  }
  note(t, murmurs, pool) { // post-pool: consensus median + window update + sustained-trip check
    if (!murmurs.length) return;
    const mv = median(murmurs.map((m) => +m.p)) - 0.5; // roster median vote (suspect included — receipted)
    for (const m of murmurs) this.rec(m.from, t, +m.p, mv, pool);
    for (const m of murmurs) {
      const id = m.from;
      const g = this.guarded.get(id);
      if (g) {
        if (t > g.until) { this.events.push({ t, id, kind: 'release' }); this.guarded.delete(id); }
        // the cosine keeps streaming while guarded (spec formula); only the EVENT is gated
      }
      if (!this.adm.admitted(id)) continue; // RELATIONAL: no personal baseline to wait for — only admission
      const win = this.wins.get(id);
      if (!win || win.length < this.cfg.W) continue; // strict trailing-W evaluation (receipted)
      let num = 0, sp2 = 0, sm2 = 0;
      for (const e of win) { num += e.pv * e.mv; sp2 += e.pv * e.pv; sm2 += e.mv * e.mv; }
      const den = Math.sqrt(sp2 * sm2);
      const rho = den > this.cfg.epsDen ? num / den : 0;
      const crossed = rho < -this.cfg.h;
      let sus = this.susWin.get(id);
      if (!sus) { sus = []; this.susWin.set(id, sus); }
      sus.push(crossed);
      if (sus.length > this.cfg.sustainWin) sus.shift();
      const tr = this.track.get(id) ?? { n: 0, minRho: 1, minRhoAt: t, maxRho: -1, lastRho: 0, crossedRounds: 0 };
      tr.n++; tr.lastRho = r6(rho);
      if (rho < tr.minRho) { tr.minRho = r6(rho); tr.minRhoAt = t; }
      if (rho > tr.maxRho) tr.maxRho = r6(rho);
      if (crossed) tr.crossedRounds++;
      this.track.set(id, tr);
      if (id === SLEEP) this.w1Path.push({ t, rho: r6(rho), crossed });
      if (id === INSTANT) this.g1Path.push({ t, rho: r6(rho), crossed });
      const sustained = sus.length >= this.cfg.sustainWin && sus.filter(Boolean).length >= this.cfg.sustainNeed;
      if (g) { // guard open: no trip event (E37 plumbing); count suppressed sustained conditions
        if (sustained) this.suppressed.set(id, (this.suppressed.get(id) ?? 0) + 1);
        continue;
      }
      if (sustained) {
        const sCount = sus.filter(Boolean).length; // recorded BEFORE the reset
        this.susWin.set(id, []); // reset the sustained window on trip (receipted E38/E39 analogue)
        const re = this.events.some((e) => e.id === id && (e.kind === 'throw' || e.kind === 'rethrow'));
        this.events.push({
          t, id, kind: re ? 'rethrow' : 'throw',
          rho: r6(rho), sustain: sCount,
          trail30: r6(mean(win.map((e) => e.pv * e.mv))), refMean: 0, // TrustReprobation-verbatim field names; refMean = protocol-neutral origin (receipted)
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
        crossedRounds: tr ? tr.crossedRounds : 0,
        suppressedSustained: this.suppressed.get(id) ?? 0,
      };
    }
    return {
      h: this.cfg.h, W: this.cfg.W, sustainWin: this.cfg.sustainWin, sustainNeed: this.cfg.sustainNeed,
      per, events: this.events.map((e) => ({ ...e })), w1Path: this.w1Path.map((x) => ({ ...x })), g1Path: this.g1Path.map((x) => ({ ...x })),
    };
  }
}

// TrustReprobation — E37/E38/E39 VERBATIM (unmodified): drains the detector's event
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
  return { loc: src.slice(a, b).split('\n').length - 1, classes: ['CoMovementGuard (FlipGuard plumbing + E40 relational ALIGN cosine — no per-sender baseline)', 'TrustReprobation (E37/E38/E39 verbatim)'] };
}

// SECONDARY telemetry (receipted, gates NOTHING): the attacker co-toxicity screen.
// w1 post-flip shares g1's toxic series, so their signed residuals (p - pooled) are IDENTICAL
// post-flip — a would-be cascade detector keyed on "suspect correlates with flagged voices"
// would see corr ~ 1. Priced per seed per defense arm: (a) w1-vs-g1 Pearson over the full
// post-flip window and over [flip+k, T) for k in {5..40} (the cascade's latency curve);
// (b) honest founders vs g1 trailing-20 max (the cascade null, per founder);
// (c) honest-honest trailing-20 max over ALL founder pairs (the cascade null, arm-wide).
function coToxScreen(guard, flip) {
  const trailMax = (a, b, W = CO.W) => {
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
    out.w1g1PostFlipFull = pairOver(SLEEP, INSTANT, flip) === null ? null : r6(pairOver(SLEEP, INSTANT, flip));
    out.w1g1LatencyCurve = Object.fromEntries([5, 10, 15, 20, 25, 30, 40].map((k) => {
      const r = pairOver(SLEEP, INSTANT, flip + k);
      return [k, r === null ? null : r6(r)];
    }));
    out.w1g1PostTrailMax = (() => { const r = trailMax(SLEEP, INSTANT); return r === null ? null : r6(r); })();
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

// ---------------- arm specs ----------------
// attackers: [{ id, flip }] — flip = toxic start round (null = never flips).
// g1 is ACTIVE in all attack arms (E36 deviation, carried) — R3/R5c need a same-arm baseline.
// A4 carries no attackers.
const armName = (kind, h) => (kind === 'CM1' ? `CM1-cm-h${h}` : `CMhi-cm-h${CO.hiH}`);
function armSpecs(tAdm, hStar, aliased) {
  const flip = tAdm == null ? null : tAdm + KSTAR;
  const atk = [{ id: SLEEP, flip }, { id: INSTANT, flip: JOIN }];
  return {
    'A1-v3.1-sleeper': { name: 'A1-v3.1-sleeper', kind: 'A1', defenses: [], reprob: false, h: null, attackers: atk },
    [armName('CM1', hStar)]: { name: armName('CM1', hStar), kind: 'CM1', defenses: ['cm'], reprob: true, h: hStar, attackers: atk },
    ...(aliased ? {} : {
      [armName('CMhi', hStar)]: { name: armName('CMhi', hStar), kind: 'CMhi', defenses: ['cm'], reprob: true, h: CO.hiH, attackers: atk },
    }),
    'A4-v3.1-clean': { name: 'A4-v3.1-clean', kind: 'A4', defenses: [], reprob: false, attackers: [] },
  };
}

// ---------------- one seed, paired arms ----------------
async function runArm(seed, world, spec, eng) {
  const { s, votes, toxV, sleepH, h2V } = world;
  const A = spec.name;
  const trust = new HedgeTrust(ALL_IDS, CFG);
  const prov = new Provenance({});
  const adm = new Admission(ADM);
  const cmDef = spec.defenses.includes('cm')
    ? new CoMovementGuard(adm, { h: spec.h, W: CO.W, sustainWin: CO.sustainWin, sustainNeed: CO.sustainNeed, epsDen: CO.epsDen, guardRounds: CO.guardRounds })
    : null;
  const reprob = spec.reprob ? new TrustReprobation(cmDef, trust, REPROB) : null;
  const defs = [cmDef].filter(Boolean);
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
    for (const d of defs) d.note(t, murmurs, pool);
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

    // damage windows: per-attacker counterfactual (zero THAT attacker only)
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
  if (cmDef && wApost && wApost.flip != null) {
    const trips = cmDef.events.filter((e) => e.id === SLEEP && (e.kind === 'throw' || e.kind === 'rethrow'));
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
  if (cmDef) {
    const trips = cmDef.events.filter((e) => e.id === INSTANT && (e.kind === 'throw' || e.kind === 'rethrow'));
    g1Trip = {
      nTrips: trips.length,
      firstT: trips.length ? trips[0].t : null,
      admitExpT: st.rec[INSTANT].admitExpT ?? null,
      latencyFromAdmission: trips.length && st.rec[INSTANT].admitExpT !== undefined ? trips[0].t - st.rec[INSTANT].admitExpT : null,
      tripTs: trips.map((e) => e.t),
    };
  }

  // SECONDARY telemetry (receipted): co-toxicity screen, defense arms only
  const screen = cmDef ? coToxScreen(cmDef, wApost?.flip ?? null) : null;

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
    defense: {
      cm: cmDef ? cmDef.summary() : null,
      reprob: reprob ? reprob.summary() : null,
    },
    screen,
    verify: st.verify,
    err: st.err,
  };
}

// ---------------- main ----------------
console.log(`── E40 co-movement lane · CoMovementGuard sweep ${CO.hSweep.join('/')} · W=${CO.W} · ${T} rounds · ${V} voice slots ──`);
const vault = new MothVault({ label: 'e40', offline: true });
const harvest = await vault.harvest(256);
console.log(`vault: ${harvest.mock ? 'MOCK (offline doctrine)' : 'LIVE ' + harvest.jobId} digest=${harvest.poolDigest.slice(0, 10)} bits=${harvest.bits.length}`);

// design-time pricing (re-computed in-run; booked BEFORE any run row — R1 clause (a))
const pricing = priceWorld(harvest, vault);

if (process.env.E40_PRICE) {
  console.log(`\n══ E40 DESIGN-TIME PRICING (seed ${PRICE_SEED}, disjoint from matrix seeds 0-7; flip approx t=${pricing.flipApprox}) ══`);
  for (const W of [20, 30]) {
    const p = pricing.W[W];
    console.log(`\nW=${W}:`);
    console.log(`  ALIGN honest floor: per-founder minRho ${HONEST.map((id) => `${id}:${p.founderMinRho[id]}`).join(' ')}`);
    console.log(`  ALIGN honest floor min ${p.founderFloor} | founder meanRho ${HONEST.map((id) => p.founderMeanRho[id]).join('/')}`);
    console.log(`  w1 pre-flip  min ${p.w1PreFlipMin} mean ${p.w1PreFlipMean}`);
    console.log(`  w1 post-flip min ${p.w1PostFlipMin} mean ${p.w1PostFlipMean}  (separation vs floor: ${p.separation})`);
    console.log(`  g1 from arrival min ${p.g1Min} mean ${p.g1Mean}  (separation vs floor: ${p.g1Separation})`);
    console.log(`  h2 min ${p.h2Min}`);
  }
  console.log(`\nrejected candidates: ${JSON.stringify(pricing.rejected)}`);
  console.log(`co-tox: ${JSON.stringify(pricing.coTox)}`);
  process.exit(0);
}

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });
book('run.config', {
  task: 'E40', name: 'the co-movement sensor (cross-voice flip-round co-movement detection: a pool-referenced ALIGN cosine composed with trust re-probation vs the E35 sleeper)',
  collides: 'E39 carried seed — E39 KILLED the variance lens (mirrored bimodality: honest baseline variance as wide as toxic; honest regime-noise bursts hit ratio 2.75-7.34 = 9.4x budget; false trips REDISTRIBUTE trust toward the flipper, V1 1.096x WORSE than control, p=0.996) and carried two structural constraints: (1) the signal must be RELATIONAL (suspect-vs-pool) — g1 is invisible to any self-calibrated sensor because its own baseline IS the attack; (2) PRICE the honest-noise floor BEFORE composing trust consequences. E39 telemetry: w1<->g1 residual sign-corr lag0 0.54-0.99 (co-toxicity contemporaneous), honest founders vs g1 max 0.46. E40 builds the relational sensor',
  T, N, voices: V, seeds: SEEDS, kStarCarried: KSTAR,
  kStarNote: 'k* = 25 carried from E35 (probe-optimal on the train seed; GAN strategy search CLOSED in E35, not re-run)',
  world: { stateFlipP: FLIP_P, skillRerollP: REROLL_P, qRange: [0.5, 0.95], a1Acuity: 0.9, toxicFormula: { id: 'E24 verbatim', acuity: TOX_Q, note: 'toxV shared by w1 post-flip AND g1 (same toxic values across arms; the co-toxicity screen exploits this, the ALIGN sensor does NOT need it)' }, streamKeys: 'e40:* (fresh draws; generator E38/E39 verbatim)' },
  attack: {
    joinRound: JOIN,
    sleeper: { id: SLEEP, honestPhase: 'e24 h1 generator verbatim (expert acuity, iid errors, own edges)', flip: 't_adm + 25; t_adm per seed from a pass-1 honest-forever A1-wiring run (in-run assert pass1 == matrix)' },
    flasher: { id: INSTANT, note: 'toxic FROM arrival t=150 — in E38/E39 the regression canary and INVISIBLE to self-calibration; here the R3 VISIBILITY target (a relational sensor must see it from arrival)' },
    honestJoiner: { id: JOINER, note: 'honest forever, present in ALL arms — the false-positive canary' },
  },
  armsPlan: ['A1-v3.1-sleeper (control)', 'CM1-cm-h* (candidate; h* picked by the receipted probe rule from the sweep)', 'CMhi-cm-h0.5 (conservative sibling; aliases CM1 if h* = 0.5)', 'A4-v3.1-clean (collateral baseline)'],
  defenses: {
    comovementGuard: {
      ...CO, reprob: REPROB,
      statistic: 'ALIGN — a RELATIONAL, pool-referenced cosine with NO per-sender baseline: per round, consensus m(t) = median of the round\'s murmured votes (robust to the <= 2 toxic voices; suspect\'s own vote included — a 15th-of-15 effect, receipted); deviations pv_i(t) = p_i(t) - 0.5 (protocol-neutral origin: votes are posteriors P(s=1), 0.5 = no information) and mv(t) = m(t) - 0.5; rho_i(t) = sum_W(pv*mv) / sqrt(sum_W(pv^2)*sum_W(mv^2)) over the trailing W=20 rounds (UNCENTERED by design — centering each stream on its own window-mean would subtract out exactly the anti-state mean that IS the signal; this is a cosine, not a Pearson); TRIP when rho < -h SUSTAINED 5-of-10 evaluation rounds (window resets on trip). Honest voices of ANY acuity lean WITH the consensus on average (E[(p-.5)(m-.5)] = (q-.5)(2q-1)E|m-.5| > 0 even at q=0.55); the E24 liar votes the anti-state side 75% of rounds so its cosine goes NEGATIVE from ARRIVAL',
      epsDenReceipt: `epsDen = ${CO.epsDen} guards a literal 0/0 (all-neutral window -> rho := 0) ONLY — NOT a noise floor; no per-sender scale exists in this statistic`,
      plumbing: 'FlipGuard plumbing verbatim from e37/e38/e39: guard window {from: t+1, until: t+40} on trip, release events, epsNew throwback each guarded round (skipping adm-probationary ids), guardRounds accounting, throw/rethrow kinds; the cosine streams EVERY round (window fills during probation), trip EVENTS evaluate only for ADMITTED senders with a full trailing-W window and no open guard window; suppressed sustained conditions counted in telemetry',
      consequence: 'DETECTOR SWAP ONLY — on trip -> BOTH layers exactly as E37/E38/E39: TrustReprobation (HedgeTrust weight x0.5 via absorb, post-pool pre-update, re-earns through the normal fixed-share + exp(eta*r) path; class copied VERBATIM — trip events carry trail30/refMean fields so it stays byte-identical; refMean = 0, the protocol-neutral origin — no self-baseline exists) + influence re-probation (epsNew for 40 guard rounds)',
      rationale: 'both self-calibrated axes are dead (mean E38, variance E39) because they calibrate on the sender\'s OWN probation — the flip is invisible when the toxic phase resembles the honest phase, and a from-arrival liar is invisible by construction. ALIGN calibrates on the POOL\'s honest geometry instead: the reference stream mv(t) is shared by all voices, so the honest floor is a POOL property (priceable once, per the E39 design constraint) rather than a per-sender history — and a liar needs no history to be anti-aligned with the consensus',
    },
    secondary: {
      coToxScreen: 'attacker co-toxicity screen (telemetry ONLY, gates NOTHING): w1 post-flip shares g1\'s toxV, so their signed residuals (p - pooled) are IDENTICAL post-flip — priced per seed: w1-vs-g1 full-window + trailing-window post-flip Pearson, honest founders vs g1 trailing max, honest-honest trailing max over all founder pairs (the would-be cascade detector\'s null)',
    },
  },
  composition: {
    murmurChanges: 'NONE (target zero) — both mechanisms are experiment-local classes over public murmur/ APIs',
    apis: ['Admission.observe/reattribute/notePooled/admitted/admittedRound/probationary/devMean/firstSeen(read)/admitWindow/epsNew/admitErr', 'HedgeTrust.weights/update/absorb/weight', 'Provenance.inspect/penalize', 'MurmurBus.pool (reference-side counterfactuals)', 'receipts.sealChain/verifyChain'],
    layerNote: 'CM arms deliberately MOVE trust (E37\'s TrustReprobation is the proven consequence); decay fires post-pool pre-update (same seam as adm.notePooled / the detector\'s note); re-trips allowed (a persistent liar re-sustains during its guard window and retrips at/after release)',
    timing: 'CoMovementGuard updates post-pool every round from window-full; trip consequence effective next round (guard from t+1) — E36-E39 plumbing timing verbatim',
  },
  hedge: CFG, admission: ADM,
  founders: 'D1 genesis acclamation (newcomers w1/g1/h2 join t=150: probationary from firstSeen)',
  absentSenderReward: 'missing ids get HedgeTrust default 0.5 (unproven prior) while absent; roster = 15 slots in every arm (e33/e35/e36/e37/e38/e39 convention)',
  reward: 'r_i = 1 - |p_i - s_t| (supervised pool — pool-independent, so trust re-earning is not gated by the defense)',
  rng: 'MothVault offline:true, one harvest, per-purpose keys e40:<purpose>:<seed>[:<voice>] via streamFor; paired worlds REQUIRE arm-identical world streams (arms select over shared values; no Math.random); pricing seed 100 is DISJOINT from matrix seeds 0-7',
  metrics: {
    D_w1: 'mean over [t_adm+25, min(t_adm+25+150,400)) of |pool - s_t| - |pool_cf - s_t| (E24/E35-E39 counterfactual, sleeper zeroed, reference-side log-odds, never written to the sheet; positive = hurts)',
    D_g1: 'same method over g1\'s own window [150, 300), g1 zeroed',
    honestFinalQ: 'mean HedgeTrust weight of the 12 honest incumbents at t=T-1 (post final update+absorb)',
    tripLatencyW1: 'first CoMovementGuard throw event on w1 with t >= t_flip, minus t_flip (rounds)',
    tripLatencyG1: 'first throw event on g1 minus g1\'s own admission round (rounds) — the R3 visibility clock',
  },
  decisionRules: {
    R1_honestFloor_PRIMARY: 'R1 HONEST-NOISE FLOOR (priced BEFORE composition): the ALIGN floor = per-founder distribution of minRho over honest phases, measured (a) design-time pricing seed 100 (booked as pricing.dev BEFORE any run row), (b) probe seed-0 guard arms, (c) the full matrix CM1 arm; false-trip projection = founder throw+rethrow events per 200 rounds arm-wide vs budget 1.0 (E38 29.9 = 30x fail, E39 9.375 = 9.4x fail); R1 PASSES iff the MATRIX arm-wide founder rate <= 1.0. If the honest floor of ALIGN is itself too wide, that IS the finding',
    R2_detection: 'R2 DETECTION: sleeper trips post-flip; PASS iff tripped seeds >= half AND mean latency < 30 rounds over tripped seeds; pre-flip w1 trips receipted (false trips on an honest-phase voice)',
    R3_g1Visibility: 'R3 g1 VISIBILITY: the from-arrival toxic MUST be visible (the one place a relational design beats self-calibration — E38 "invisible by construction", E39 0 trips); PASS iff g1 throws in >= 2/3 of seeds; latency measured from g1\'s own admission round (the window fills during probation)',
    R4_damage: 'R4 COUNTERFACTUAL DAMAGE (composition): D(CM1) < D(A1): paired one-sided sign test (zeros excluded) p < 0.05; report paired delta +/- SE and damage ratio D(CM1)/D(A1); CMhi alongside (the sensitivity trade) but the crown rides on CM1; g1 damage on the same footing (a relational sensor that SEES g1 should REDUCE D_g1 — an INCREASE beyond A1 + 1 SE fails R5c)',
    R5_canaries: 'R5 CANARIES — (a) honQ within 1 SE of A4 (seed-paired; CM arms move trust by design — trustMoved receipted per seed); (b) h2: ZERO defense trips AND per-seed admission outcome identical to A1\'s (arm-invariance; the native 7/8 admission miss is admission\'s property, receipted per seed); (c) g1 damage <= A1 + 1 SE (a DROP is the expected relational win); (d) FALSE-TRIP BUDGET explicit: total honest-founder trips + per-founder histogram + rate <= 1.0/200r arm-wide; (e) RECOVERY: false-tripped founders re-earn to >= 95% of pre-trip share within 100 rounds (E37 baseline 23/25, mean 19.1r — must not regress); events without a full 100-round horizon receipted but excluded; vacuous pass if no trips',
    crown: 'if CM1 passes R1 + R2 + R3 + R4 + R5, crown it (damage ratio, sleeper latency, g1 containment — the first sensor in the arc to see a from-arrival liar); if R4 fails while R3 holds, receipt the PARTIAL verdict ("sees the flasher, not the sleeper"); if R1 fails, honest negative — the floor IS the finding; NO pre-drafted text: every clause filled from measured numbers',
  },
  probeRule: {
    hSweep: CO.hSweep,
    gates: '(i) ZERO trips on h2 on seed 0; (ii) D_g1(CM_h, s0) <= D_g1(A1, s0) + 1e-4 (single-seed proxy for R5c +1 SE; 1e-4 ~ 5x E37\'s measured founder-decay leak, chosen before the run); (iii) founder-trip rate on seed 0 <= 1.0 per 200 rounds (<= 2 trips)',
    pick: 'argmax delta_h = D_w1(A1,s0) - D_w1(CM_h,s0) among h passing all gates; ties |delta| <= 1e-9 -> LARGER h; fallback ladder: none pass all -> argmax delta among gate-(i) passers (relaxed=founder-only) -> argmax delta (relaxed=none); h* = 0.5 -> CM1 aliases CMhi (receipted, no re-run)',
    pickBefore: 'the pick row (sensor.hpick) is booked BEFORE any full-matrix run row; the probe block doubles as matrix seed 0 (no re-run)',
  },
  runtimeRules: 'probe = the timed seed-0 block (pass-1 + A1 + A4 + the 3-arm h-sweep = 6 runs); projected = t_probe * 8 + 2s IO (conservative: a matrix seed needs <= 5 runs); if projected > 170s cut seeds 8 -> 6 and RECEIPT the cut (E36-E39 ran ~95-135s at 6-8 seeds); NO script edits after the final run (stale-artifact doctrine)',
  sweepProvenance: 'sweep {0.20, 0.35, 0.50} and W = 20 set from the design-time pricing run (E40_PRICE=1, seed 100 — DISJOINT from matrix seeds 0-7); the pricing mode is part of this artifact (telemetry-only streaming of ALIGN + rejected candidates PROD/OPP + the co-toxicity screen over raw world streams — no engine, no consequences); the main run re-computes the same pricing in-run and books it as the pricing.dev row BEFORE run rows, so the sweep choice is attested inside the chain',
  pricing: pricing, // R1 clause (a) — booked BEFORE any run row
  defenseLoc: defenseLoc(),
  vault: { mock: harvest.mock, digest: harvest.poolDigest },
  engine: 'vendored quilt dist (QuiltEngine)', sheetVerifyTol: TOL,
});
book('pricing.dev', {
  rule: 'R1 clause (a): design-time honest-noise floor pricing on seed 100 (disjoint from matrix seeds 0-7); t_adm approximated at 189 (E35 measured 8/8 admission at t=189) -> flipApprox; admission gating NOT simulated (the pricing measures the STATISTIC floor over honest streams, not the guard\'s evaluation gating); telemetry only — no engine, no consequences',
  seed: PRICE_SEED, W20: pricing.W[20], W30: pricing.W[30], rejectedCandidates: pricing.rejected, coTox: pricing.coTox,
  sweepSetFromThis: CO.hSweep, wSetFromThis: CO.W,
});

// ---------------- phase 1: probe (seed 0) — full matrix + h-sweep ----------------
const world0 = genWorld(0, harvest, vault);
const eng0 = new QuiltEngine('e40-s0', {});
eng0.loadSheet(buildSheet());
const probeStart = Date.now();
const engP1 = new QuiltEngine('e40-s0-p1', {});
engP1.loadSheet(buildSheet());
const p1 = await runArm(0, world0, { name: 'pass1', kind: 'pass1', defenses: [], reprob: false, h: null, attackers: [{ id: SLEEP, flip: null }, { id: INSTANT, flip: JOIN }] }, engP1);
if (p1.w1.admitExpT === undefined) console.log('  seed 0: sleeper NOT admitted under honest behavior — attack cannot launch (receipted as neverLaunched)');
const tAdm0 = p1.w1.admitExpT;
const probe = { A1: null, A4: null, C: {} };
for (const spec of [
  { name: 'A1-v3.1-sleeper', kind: 'A1', defenses: [], reprob: false, h: null, attackers: armSpecs(tAdm0, 2, false)['A1-v3.1-sleeper'].attackers },
  { name: 'A4-v3.1-clean', kind: 'A4', defenses: [], reprob: false, h: null, attackers: [] },
  ...CO.hSweep.map((h) => ({ name: `probe-h${h}`, kind: 'probe', defenses: ['cm'], reprob: true, h, attackers: armSpecs(tAdm0, 2, false)['A1-v3.1-sleeper'].attackers })),
]) {
  probe[spec.kind === 'probe' ? `h${spec.h}` : spec.kind] = await runArm(0, world0, spec, eng0);
}
const probeMs = Date.now() - probeStart;
const projected = (probeMs / 1000) * 8 + 2;
let cut = null;
if (projected > 170 && SEEDS === 8) { SEEDS = 6; cut = 'seeds cut 8 -> 6 by the probe rule (projected > 170s); paired claims preserved'; }
else if (projected > 170) { cut = `seeds already ${SEEDS} (< 8); projected ${projected.toFixed(0)}s still > 170s — proceeding at minimum receipted fallback`; }
book('probe.seed0', {
  seed: 0, timed: true, probeBlock_s: +(probeMs / 1000).toFixed(1), runs: 6,
  tAdmExp: tAdm0, pass1DevMean: p1.w1.devMean, pass1Indep: p1.w1.indep,
  w1ProbTraceMax_A1: probe.A1.w1.probTraceMax,
  note: 'probe = 1-seed timed run of the full matrix + h-sweep (6 runs); doubles as matrix seed 0 (no re-run)',
});
book('runtime.probe', {
  tProbe_s: +(probeMs / 1000).toFixed(1),
  projected_8seeds_s: +projected.toFixed(1),
  projectedFormula: 't_probe * 8 + 2s IO (receipted; conservative — a matrix seed needs <= 5 runs)',
  seedDecision: SEEDS, cut: cut ?? 'none — full plan within budget',
  e36e37e38e39Reference_s: '130.1 / 134.7 / 100.7 / 95.2s matrix at 6-8 seeds',
});
console.log(`probe(seed 0): ${+(probeMs / 1000).toFixed(1)}s -> projected(8 seeds)=${projected.toFixed(0)}s -> seeds=${SEEDS}${cut ? ' (CUT)' : ''}`);

// ---------------- phase 1b: the h pick (receipted rule) ----------------
const founderTripCount = (R) => Object.entries(R.defense.cm.per)
  .filter(([id]) => HONEST.includes(id)).reduce((a, [, p]) => a + p.throws + p.rethrows, 0);
const h2TripCount = (R) => {
  const p = R.defense.cm.per[JOINER];
  return p ? p.throws + p.rethrows : 0;
};
const sweepTable = CO.hSweep.map((h) => {
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
const ALIASED = HSTAR === CO.hiH;
const ARM_CM1 = armName('CM1', HSTAR);
const ARM_CMHI = armName('CMhi', HSTAR);
book('sensor.hpick', {
  rule: 'argmax delta_h among h passing all gates; ties -> larger h; fallback ladder receipted in run.config',
  sweepTable, picked: HSTAR, relaxed: pick.relaxed, tied: pick.tied,
  aliased: ALIASED, aliasNote: ALIASED ? 'CM1 == CMhi (h* = 0.5): the conservative sibling IS the candidate; one arm run, CM1 aliases CMhi (no re-run)' : 'CM1 and CMhi are distinct arms',
  probeD_w1: Object.fromEntries(CO.hSweep.map((h) => [`h${h}`, r6(probe[`h${h}`].dmgW1)]).concat([['A1', r6(probe.A1.dmgW1)]])),
});
console.log(`h-pick: h*=${HSTAR}${pick.relaxed ? ` (RELAXED: ${pick.relaxed})` : ''}${ALIASED ? ' — CM1 == CMhi (aliased)' : ''}`);

// ---------------- phase 2: full matrix ----------------
const ARMS = ALIASED ? ['A1-v3.1-sleeper', ARM_CM1, 'A4-v3.1-clean'] : ['A1-v3.1-sleeper', ARM_CM1, ARM_CMHI, 'A4-v3.1-clean'];
const agg = {};
for (const A of ARMS) {
  agg[A] = {
    acc: [], pre: [], dmgW1: [], dmgG1: [], shareW1: [], shareG1: [], honQ: [],
    w1Adm: [], w1Dev: [], w1Indep: [], w1ProbMax: [], h2Adm: [], g1Adm: [],
    trustFlip: [], conv: [],
    sensor: { per: {}, w1Events: [], g1Events: [], founderTrips: [], w1Trips: [], g1Trips: [], screens: {}, founderMinRho: {} },
    decayEvents: [],
    w1Curves: {}, w1Paths: {}, g1Paths: {},
    vfy: { checks: 0, pass: 0, maxDiff: 0 },
  };
}
const seedRows = [];
const t0 = Date.now();

// seed 0: carried from the probe (no re-run) + the picked CM arms' seed-0 results
{
  const specs = armSpecs(tAdm0, HSTAR, ALIASED);
  const results = {
    'A1-v3.1-sleeper': probe.A1,
    'A4-v3.1-clean': probe.A4,
    [ARM_CM1]: probe[`h${HSTAR}`],
    ...(ALIASED ? {} : { [ARM_CMHI]: probe[`h${CO.hiH}`] }),
  };
  seedRows.push(await buildSeedRow(0, results, specs, tAdm0, p1, true));
  book('run', seedRows[0]);
  console.log(`  seed 1/${SEEDS} done (carried from probe; t_adm=${tAdm0}, ${((Date.now() - t0) / 1000).toFixed(1)}s elapsed)`);
}

// seeds 1..SEEDS-1: fresh worlds, pass-1 anchor, full arm matrix
for (let seed = 1; seed < SEEDS; seed++) {
  const world = genWorld(seed, harvest, vault);
  const eng = new QuiltEngine(`e40-s${seed}`, {});
  eng.loadSheet(buildSheet());
  const engP1 = new QuiltEngine(`e40-s${seed}-p1`, {});
  engP1.loadSheet(buildSheet());
  const p1s = await runArm(seed, world, { name: 'pass1', kind: 'pass1', defenses: [], reprob: false, h: null, attackers: [{ id: SLEEP, flip: null }, { id: INSTANT, flip: JOIN }] }, engP1);
  if (p1s.w1.admitExpT === undefined) console.log(`  seed ${seed}: sleeper NOT admitted under honest behavior (receipted as neverLaunched)`);
  const tAdm = p1s.w1.admitExpT;
  const specs = armSpecs(tAdm, HSTAR, ALIASED);
  const results = {};
  for (const A of ARMS) results[A] = await runArm(seed, world, specs[A], eng);
  seedRows.push(await buildSeedRow(seed, results, specs, tAdm, p1s, false));
  book('run', seedRows[seedRows.length - 1]);
  const proj = (((Date.now() - t0) / 1000) / seed) * (SEEDS - 1);
  console.log(`  seed ${seed + 1}/${SEEDS} done (t_adm=${tAdm}, ${((Date.now() - t0) / 1000).toFixed(1)}s elapsed, projected total ${proj.toFixed(0)}s)`);
}
const elapsedMatrix = +((Date.now() - t0) / 1000).toFixed(1);
console.log(`matrix elapsed ${elapsedMatrix}s`);

// per-seed row builder (used by both phases)
async function buildSeedRow(seed, results, specs, tAdm, p1r, carried) {
  const row = { seed, carried, tAdmExp: tAdm, pass1: { tAdmExp: tAdm, devMean: p1r.w1.devMean, indep: p1r.w1.indep, h2: p1r.h2 } };
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
    if (R.w1.admitExpT !== undefined) { G.w1Adm.push(R.w1.admitExpT); G.w1Dev.push(R.w1.devMean); G.w1Indep.push(R.w1.indep); if (R.w1.probTraceMax !== null) G.w1ProbMax.push(R.w1.probTraceMax); }
    if (R.h2.admitExpT !== undefined) G.h2Adm.push(R.h2.admitExpT);
    if (R.g1.admitExpT !== undefined) G.g1Adm.push(R.g1.admitExpT);
    if (R.defense.cm) {
      G.sensor.per[seed] = R.defense.cm.per;
      G.sensor.w1Events.push(...R.defense.cm.events.filter((e) => e.id === SLEEP && (e.kind === 'throw' || e.kind === 'rethrow')).map((e) => ({ seed, ...e })));
      G.sensor.g1Events.push(...R.defense.cm.events.filter((e) => e.id === INSTANT && (e.kind === 'throw' || e.kind === 'rethrow')).map((e) => ({ seed, ...e })));
      G.sensor.w1Trips.push({ seed, ...R.w1Trip });
      G.sensor.g1Trips.push({ seed, ...R.g1Trip });
      G.sensor.screens[seed] = R.screen;
      for (const id of HONEST) {
        const p = R.defense.cm.per[id];
        if (p && (p.throws > 0 || p.rethrows > 0)) G.sensor.founderTrips.push({ seed, id, ...p });
        if (p && p.minRho !== null) (G.sensor.founderMinRho[id] = G.sensor.founderMinRho[id] ?? []).push(p.minRho);
      }
      G.w1Paths[seed] = R.defense.cm.w1Path;
      G.g1Paths[seed] = R.defense.cm.g1Path;
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
      w1Curve: R.w1Curve,
      w1Trip: R.w1Trip,
      g1Trip: R.g1Trip,
      defense: {
        cm: R.defense.cm ? {
          h: R.defense.cm.h,
          per: Object.fromEntries(Object.entries(R.defense.cm.per).filter(([id]) => !HONEST.includes(id))),
          founderMinRho: Object.fromEntries(HONEST.map((id) => [id, R.defense.cm.per[id] ? R.defense.cm.per[id].minRho : null])),
          founderTrips: R.defense.cm.events.filter((e) => HONEST.includes(e.id) && (e.kind === 'throw' || e.kind === 'rethrow')),
          h2Trips: R.defense.cm.events.filter((e) => e.id === JOINER && (e.kind === 'throw' || e.kind === 'rethrow')),
          g1Trips: R.defense.cm.events.filter((e) => e.id === INSTANT && (e.kind === 'throw' || e.kind === 'rethrow')),
          w1Path: R.defense.cm.w1Path,
          g1Path: R.defense.cm.g1Path,
          screen: R.screen,
        } : null,
        reprob: R.defense.reprob ? R.defense.reprob.events.map((e) => ({ id: e.id, tripT: e.tripT, decayT: e.decayT, kind: e.kind, pre: e.pre, post: e.post, recoveredIn: e.recoveredIn })) : null,
      },
      verify: `${R.verify.pass}/${R.verify.checks}`,
    };
  }
  row.honQSpread = { CM1_vs_A1: r6(Math.abs(results[ARM_CM1].honQFinal - results['A1-v3.1-sleeper'].honQFinal)) };
  return row;
}

// ---------------- aggregate ----------------
const armsAgg = {};
for (const A of ARMS) {
  const G = agg[A];
  const isAttack = A !== 'A4-v3.1-clean';
  const isSensor = A === ARM_CM1 || A === ARM_CMHI;
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
      h2TripTotal: Object.values(G.sensor.per).reduce((a, per) => a + ((per[JOINER]?.throws ?? 0) + (per[JOINER]?.rethrows ?? 0)), 0),
      h2MinRho: statOr(Object.values(G.sensor.per).map((per) => per[JOINER]?.minRho ?? null).filter((x) => x !== null)),
      g1TripTotal: Object.values(G.sensor.per).reduce((a, per) => a + ((per[INSTANT]?.throws ?? 0) + (per[INSTANT]?.rethrows ?? 0)), 0),
      g1MinRho: statOr(Object.values(G.sensor.per).map((per) => per[INSTANT]?.minRho ?? null).filter((x) => x !== null)),
      // w1 pre/post-flip ALIGN minima are computed per seed in MECHDATA (from the stored w1Paths)
      coToxScreen: {
        w1g1PostFlipFull: statOr(Object.values(screens).map((sc) => sc?.w1g1PostFlipFull).filter((x) => x !== null && x !== undefined)),
        w1g1PostTrailMax: statOr(Object.values(screens).map((sc) => sc?.w1g1PostTrailMax).filter((x) => x !== null && x !== undefined)),
        honestVsG1TrailMax: statOr(Object.values(screens).flatMap((sc) => Object.values(sc?.founderVsG1TrailMax ?? {})).filter((x) => x !== null && x !== undefined)),
        honestHonestTrailMax: statOr(Object.values(screens).map((sc) => sc?.honestHonestTrailMax).filter((x) => x !== null && x !== undefined)),
        perSeed: screens,
      },
    } : null,
    decayEvents: isSensor ? G.decayEvents : [],
    verify: { checks: G.vfy.checks, pass: G.vfy.pass, maxDiff: G.vfy.maxDiff.toExponential(2) },
  };
}

// per-seed w1 pre/post-flip ALIGN minima + g1 path minima (mechanism telemetry, CM1 arm)
function pathMinima(path, flip) {
  const pre = path.filter((x) => x.t < flip);
  const post = path.filter((x) => x.t >= flip && x.t < flip + DW);
  return {
    preFlipMin: pre.length ? r6(Math.min(...pre.map((x) => x.rho))) : null,
    preFlipMean: pre.length ? r6(mean(pre.map((x) => x.rho))) : null,
    postFlipMin: post.length ? r6(Math.min(...post.map((x) => x.rho))) : null,
    postFlipMean: post.length ? r6(mean(post.map((x) => x.rho))) : null,
    postFlipMax: post.length ? r6(Math.max(...post.map((x) => x.rho))) : null,
  };
}
const MECHDATA = { perSeed: [] };
{
  const arm = agg[ARM_CM1];
  for (const tr of arm.sensor.w1Trips) {
    const seed = tr.seed, flip = tr.flip;
    const path = arm.w1Paths[seed] ?? [];
    const mm = pathMinima(path, flip);
    const firstTripEv = arm.sensor.w1Events.find((e) => e.seed === seed && e.t >= flip);
    const per = arm.sensor.per[seed]?.[SLEEP] ?? {};
    const g1rec = (arm.sensor.g1Trips ?? []).find((x) => x.seed === seed) ?? null;
    const g1Per = arm.sensor.per[seed]?.[INSTANT] ?? {};
    const founderMins = HONEST.map((id) => arm.sensor.per[seed]?.[id]?.minRho ?? null).filter((x) => x !== null);
    MECHDATA.perSeed.push({
      seed, flip, tripped: tr.nPostFlip > 0, latency: tr.latency, nTrips: tr.nTrips, nPreFlipTrips: tr.nPreFlip,
      preFlipMinRho: mm.preFlipMin, preFlipMeanRho: mm.preFlipMean,
      postFlipMinRho: mm.postFlipMin, postFlipMeanRho: mm.postFlipMean, postFlipMaxRho: mm.postFlipMax,
      rhoAtFirstTrip: firstTripEv ? firstTripEv.rho : null, h: HSTAR,
      crossedBar: mm.postFlipMin !== null && mm.postFlipMin < -HSTAR,
      plateauAboveBar: !tr.nPostFlip && mm.postFlipMin !== null && mm.postFlipMin >= -HSTAR,
      suppressed: per.suppressedSustained ?? 0,
      honestFloorMin_thisSeed: founderMins.length ? r6(Math.min(...founderMins)) : null,
      g1: g1rec ? { nTrips: g1rec.nTrips, firstT: g1rec.firstT, admitExpT: g1rec.admitExpT, latencyFromAdmission: g1rec.latencyFromAdmission, minRho: g1Per.minRho ?? null } : null,
    });
  }
}

// ---------------- claims ----------------
const A1 = 'A1-v3.1-sleeper', A4 = 'A4-v3.1-clean';
const B_ARMS = [ARM_CM1, ...(ALIASED ? [] : [ARM_CMHI])];
const dmgW1Of = (A) => agg[A].dmgW1.map((d) => (d === null ? 0 : d));
const dmgG1Of = (A) => agg[A].dmgG1.map((d) => (d === null ? 0 : d));
const honQOf = (A) => agg[A].honQ;

// R1 HONEST-NOISE FLOOR (the primary design constraint) — measured on the matrix arms
const R1 = {};
for (const B of B_ARMS) {
  const tel = armsAgg[B].sensorTelemetry;
  const rate = tel.founderTripRatePer200r;
  R1[B] = {
    priced: { seed: PRICE_SEED, W20Floor: pricing.W[20].founderFloor, W20Separation: pricing.W[20].separation, note: 'pricing.dev row (booked before run rows); matrix runs W=20' },
    perFounderMinRho: tel.founderMinRho,
    founderFloorMin_matrix: tel.founderFloorMin,
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

// R4 COUNTERFACTUAL DAMAGE per sensor arm (E39-R1 machinery verbatim)
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
    g1Damage_paired: {
      damage_A1: armsAgg[A1].damageG1, damage_B: armsAgg[B].damageG1,
      delta_B_minus_A1: { mean: r6(mean(dg1)), se: r6(seOf(dg1)), perSeed: dg1.map((x) => r6(x)) },
      note: 'a relational sensor that SEES g1 should REDUCE D_g1 (TrustReprobation halves it on every trip) — a first in the arc; an increase beyond +1 SE fails R5c',
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
    h2: { defenseTrips: h2Trips, admissionInvariance: h2Invariance, invariancePass: h2InvPass, admitted_n: armsAgg[B].h2Admission.admAdmitted_n, nativeMiss_note: 'per-seed admission outcome must EQUAL A1\'s — the E39-native miss is admission\'s property, not a defense effect' },
    g1: { damage_B: armsAgg[B].damageG1, damage_A1: armsAgg[A1].damageG1, pairedDelta_B_minus_A1: { mean: r6(mean(g1d)), se: r6(seOf(g1d)) }, pass: g1Pass },
    falseTrips: { total: ft, ratePer200r: ftRate, budget: 1.0, perVoice: armsAgg[B].sensorTelemetry.founderTripPerVoice, pass: ftPass },
    recovery: rec,
    verdict: honQPass && h2Pass && g1Pass && ftPass && (rec.verdict === 'PASS' || rec.verdict === 'VACUOUS-PASS') ? 'PASS' : 'FAIL',
  };
}

// ---------------- verdict — mechanism analysis COMPUTED from telemetry ----------------
const R1OK = R1[ARM_CM1].verdict === 'PASS';
const R2OK = R2[ARM_CM1].verdict === 'PASS';
const R3OK = R3[ARM_CM1].verdict === 'PASS';
const R4OK = R4[ARM_CM1].verdict === 'PASS';
const R5OK = R5.perSensor[ARM_CM1].verdict === 'PASS';
const CROWN = (R1OK && R2OK && R3OK && R4OK && R5OK)
  ? {
      crowned: ARM_CM1, damageRatio: R4[ARM_CM1].damageRatio_B_over_A1,
      latency: R4[ARM_CM1].tripLatency, g1Latency: R3[ARM_CM1].latencyFromAdmission,
      rule: 'CM1 passes R1 + R2 + R3 + R4 + R5 (receipted crown rule)',
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
  const dDelta = dmgW1Of(A1).map((x, i) => x - dmgW1Of(ARM_CM1)[i]);
  const decaysW1 = agg[ARM_CM1].decayEvents.filter((e) => e.id === SLEEP);
  const decaysG1 = agg[ARM_CM1].decayEvents.filter((e) => e.id === INSTANT);
  const ftTotal = armsAgg[ARM_CM1].sensorTelemetry.founderTripTotal;
  const ftSeeds = new Set(agg[ARM_CM1].sensor.founderTrips.map((e) => e.seed)).size;
  const floorMin = armsAgg[ARM_CM1].sensorTelemetry.founderFloorMin;
  const g1TrippedN = R3[ARM_CM1].trippedSeeds;
  const g1Lat = R3[ARM_CM1].latencyFromAdmission;
  const cts = armsAgg[ARM_CM1].sensorTelemetry.coToxScreen;
  MECH = `CoMovementGuard(h=${HSTAR}, W=${CO.W}) trips on the sleeper post-flip in ${tripSeeds.length}/${SEEDS} seeds`
    + `${tripSeeds.length ? ` (latency ${stat(tripSeeds.map((x) => x.latency)).mean}rd mean; per-seed postFlipMinRho ${tripSeeds.map((x) => x.postFlipMinRho).join('/')} vs bar -${HSTAR}, rho at first trip ${tripSeeds.map((x) => x.rhoAtFirstTrip).join('/')})` : ''}`
    + `${noTrip.length ? `; NO-TRIP seeds ${noTrip.map((x) => `s${x.seed}`).join(',')}: postFlipMinRho ${noTrip.map((x) => x.postFlipMinRho).join('/')} vs bar -${HSTAR} — ${plateau.length === noTrip.length ? 'the cosine NEVER crossed the bar post-flip (5-of-10 sustained gate included)' : 'crossed but never sustained 5-of-10 (suppressed: ' + noTrip.map((x) => x.suppressed).join('/') + ')'}` : ''}`
    + `; ALIGN-VISIBILITY receipt: the post-flip cosine CROSSED the bar in ${crossedN}/${SEEDS} seeds and sat INSIDE the honest floor's range in ${insideFloorN}/${SEEDS} (per-seed honest floor min ${MECHDATA.perSeed.map((x) => x.honestFloorMin_thisSeed).join('/')}); w1 pre-flip minRho ${R1[ARM_CM1].w1PreFlip ? R1[ARM_CM1].w1PreFlip.minRho : 'n/a'} (honest-phase w1 sits in the floor — the flip is a relational REGIME CHANGE, not a level change)`
    + `; g1 (from-arrival) tripped in ${g1TrippedN}/${SEEDS} seeds${g1Lat ? ` (latency from ADMISSION ${g1Lat.mean}rd mean — the window fills during probation, so the relational sensor needs NO personal history; E38/E39 self-calibration saw g1 0 times)` : ''}, g1 minRho ${armsAgg[ARM_CM1].sensorTelemetry.g1MinRho ? armsAgg[ARM_CM1].sensorTelemetry.g1MinRho.mean : 'n/a'} mean`
    + `; honest floor (matrix): per-founder minRho min ${floorMin}, founder false trips ${ftTotal} in ${ftSeeds}/${SEEDS} seeds (rate ${armsAgg[ARM_CM1].sensorTelemetry.founderTripRatePer200r}/200r vs budget 1.0; E38 CUSUM 29.9, E39 ratio 9.375)`
    + `; damage delta vs A1 per seed [${dDelta.map((x) => (x >= 0 ? '+' : '') + r6(x)).join(', ')}] (trip seeds ${tripSeeds.map((x) => `s${x.seed}`).join(',') || 'n/a'})`
    + `; w1 decay events ${decaysW1.length} (${decaysW1.filter((e) => e.kind === 'rethrow').length} retrips; pre->post x${REPROB.frac}) | g1 decay events ${decaysG1.length} (D_g1 ${R4[ARM_CM1].g1Damage_paired.delta_B_minus_A1.mean} vs A1 — ${mean(dmgG1Of(ARM_CM1)) < mean(dmgG1Of(A1)) ? 'the relational sensor CONTAINS the flasher, a first in the arc' : 'no g1 containment'})`
    + `; co-tox screen: w1-g1 post-flip corr ${cts.w1g1PostFlipFull ? cts.w1g1PostFlipFull.mean : 'n/a'} mean (shared toxV) vs honest-honest trailing max ${cts.honestHonestTrailMax ? cts.honestHonestTrailMax.mean : 'n/a'} and honest-vs-g1 max ${cts.honestVsG1TrailMax ? cts.honestVsG1TrailMax.mean : 'n/a'} — the cascade axis (suspect-vs-flagged) priced for the next lane`;
}
let MECH_VHI;
if (!ALIASED) {
  const hiTripSeeds = agg[ARM_CMHI].sensor.w1Trips.filter((x) => x.nPostFlip > 0);
  const hiG1Seeds = agg[ARM_CMHI].sensor.g1Trips.filter((x) => x.nTrips > 0);
  const hiFt = armsAgg[ARM_CMHI].sensorTelemetry.founderTripTotal;
  MECH_VHI = `conservative sibling CoMovementGuard(h=${CO.hiH}): sleeper trips ${hiTripSeeds.length}/${SEEDS} seeds (latency ${hiTripSeeds.length ? stat(hiTripSeeds.map((x) => x.latency)).mean : 'n/a'}rd), g1 trips ${hiG1Seeds.length}/${SEEDS}, founder false trips ${hiFt} (rate ${armsAgg[ARM_CMHI].sensorTelemetry.founderTripRatePer200r}/200r) — the sensitivity trade measured against CM1(h=${HSTAR})`;
}

const VERDICT = {
  crowned: CROWN ? CROWN.crowned : 'NONE',
  verdict: CROWN
    ? `CROWNED ${CROWN.crowned} (damage ratio ${CROWN.damageRatio}, sleeper latency ${CROWN.latency ? CROWN.latency.mean : 'n/a'}rd, g1 latency-from-admission ${CROWN.g1Latency ? CROWN.g1Latency.mean : 'n/a'}rd)`
    : (!R1OK
      ? `NO-CROWN (honest negative — R1 floor FAILS): the relational ALIGN statistic's honest-noise floor is too wide (${armsAgg[ARM_CM1].sensorTelemetry.founderTripRatePer200r}/200r founder trips vs budget 1.0) — that IS the finding; mechanism computed from telemetry`
      : (!R4OK && R3OK
        ? `PARTIAL: the relational sensor SEES THE FLASHER, NOT THE SLEEPER — R3 g1-visibility ${R3[ARM_CM1].trippedSeeds}/${SEEDS} seeds while R2 sleeper detection ${R2[ARM_CM1].trippedSeeds}/${SEEDS} and R4 containment fails (ratio ${R4[ARM_CM1].damageRatio_B_over_A1}) — negative verdict, mechanism computed from telemetry`
        : `NO-CROWN: CM1 fails ${[R1OK ? null : 'R1', R2OK ? null : 'R2', R3OK ? null : 'R3', R4OK ? null : 'R4', R5OK ? null : 'R5'].filter(Boolean).join('+')} — negative verdict, mechanism computed from telemetry`)),
  crownDetail: CROWN,
  hiStatus: ALIASED ? 'aliased to CM1 (h* = 0.5)' : { R1: R1[ARM_CMHI].verdict, R2: R2[ARM_CMHI].verdict, R3: R3[ARM_CMHI].verdict, R4: R4[ARM_CMHI].verdict, R5: R5.perSensor[ARM_CMHI].verdict, note: 'conservative sibling receipted alongside; the crown rides on CM1 per the receipted rule' },
  mechanism: ALIASED ? { CM1: MECH } : { CM1: MECH, CMhi: MECH_VHI },
  secondaryScreen: {
    note: 'SECONDARY telemetry — attacker co-toxicity screen (receipted: gates NOTHING). w1 post-flip shares g1\'s toxV, so the would-be cascade detector (suspect vs flagged voices) has a ~1.0 signal; the null is honest-honest co-movement',
    arm_CM1: armsAgg[ARM_CM1].sensorTelemetry.coToxScreen,
  },
  structuralFindings: [
    `detection operating curve: ${CO.hSweep.map((h) => { const row = sweepTable.find((x) => x.h === h); return `h=${h}: w1 post-flip trips ${row.w1TripsPostFlip}, g1 trips ${row.g1Trips} (lat-from-adm ${row.g1LatencyFromAdmission}), founder trips ${row.gates.founderTrips} (${row.gates.founderRatePer200r}/200r), h2 trips ${row.gates.h2Trips}, delta ${row.delta}`; }).join('; ')} (probe seed 0; matrix coverage for h*=${HSTAR}${ALIASED ? '' : ` and h=${CO.hiH}`})`,
    `recovery receipt (R5e): ${B_ARMS.map((A) => { const r = R5.perSensor[A].recovery; return `${A}: ${r.vacuous ? 'no founder trips (vacuous)' : `${r.recoveredN}/${r.withFullHorizon} founder decay events recovered to >=95% of pre-trip share within 100 rounds${r.recoveredIn ? ` (mean ${r.recoveredIn.mean}rd; E37 baseline 23/25 mean 19.1r)` : ''}`}`; }).join('; ')} — the supervised reward stream (r = 1-|p-s|, pool-independent) keeps trust re-earning defense-proof`,
  ],
};

book('finding.R1', { rule: 'R1 HONEST-NOISE FLOOR (PRIMARY design constraint) — per-founder minRho distribution + false-trip projection vs budget 1.0/200r; priced (a) at pricing.dev (seed 100), (b) probe seed 0, (c) matrix CM1 arm; R1 PASSES iff matrix arm-wide founder rate <= 1.0; if the floor is too wide, that IS the finding', perArm: R1, pricingRecap: { W20Floor: pricing.W[20].founderFloor, W20Sep: pricing.W[20].separation, W20G1Sep: pricing.W[20].g1Separation, sweep: CO.hSweep } });
book('finding.R2', { rule: 'R2 DETECTION — sleeper trips post-flip; PASS iff tripped seeds >= half AND mean latency < 30r; pre-flip trips receipted', perArm: R2 });
book('finding.R3', { rule: 'R3 g1 VISIBILITY — the from-arrival toxic MUST be visible (the relational advantage over self-calibration); PASS iff g1 throws in >= 2/3 of seeds; latency from g1\'s own admission', perArm: R3 });
book('finding.R4', { rule: 'R4 COUNTERFACTUAL DAMAGE (composition) — D(CM1) < D(A1): paired one-sided sign test p < 0.05, delta +/- SE, damage ratio; g1 damage on the same footing (a relational win expected)', perArm: R4 });
book('finding.R5', { rule: 'R5 CANARIES — (a) honQ within 1 SE of A4, (b) h2 zero defense trips + admission arm-invariance, (c) g1 damage <= A1 + 1 SE, (d) FALSE-TRIP BUDGET explicit, (e) RECOVERY >= 95% within 100r (E37 baseline)', perSensor: R5.perSensor });
book('finding.coToxScreen', { rule: 'SECONDARY (telemetry only, gates nothing): attacker co-toxicity screen — w1-vs-g1 post-flip residual correlation (shared toxV) vs honest-honest / honest-vs-g1 trailing maxima (the would-be cascade detector\'s signal and null)', arm_CM1: armsAgg[ARM_CM1].sensorTelemetry.coToxScreen, ...(ALIASED ? {} : { arm_CMhi: armsAgg[ARM_CMHI].sensorTelemetry.coToxScreen }) });
book('finding.verdict', { ...VERDICT, r_ok: { R1: R1OK, R2: R2OK, R3: R3OK, R4: R4OK, R5: R5OK }, mechanismPerSeed: MECHDATA.perSeed });
book('finding.runtime', {
  seedsRun: SEEDS, probeBlock_s: +(probeMs / 1000).toFixed(1), matrixElapsed_s: elapsedMatrix,
  totalElapsed_s: +((Date.now() - t0) / 1000).toFixed(1),
  totalNote: 'total = matrix loop (seed 0 carried from probe, included as seed-0 row booking); probe booked separately',
  cut: cut ?? 'none — full plan within budget', vaultLiveJobs: vault.liveJobs,
});

const chain = sealChain(rows);
const tip = rows[rows.length - 1].row_hash;
const vfy = verifyChain(rows);
if (!vfy.ok) { console.error('CHAIN VERIFY FAILED', vfy); process.exit(1); }
console.log(`chain: ${rows.length} rows, tip ${tip} VERIFIED`);

mkdirSync('experiments/outputs', { recursive: true });
const summary = {
  task: 'E40', name: 'the co-movement sensor (pool-referenced ALIGN cosine composed with trust re-probation vs the E35 sleeper)',
  seeds: SEEDS, T, voices: V, kStarCarried: KSTAR, arms: ARMS, hStar: HSTAR, aliased: ALIASED, W: CO.W,
  runtime_s: { probeBlock: +(probeMs / 1000).toFixed(1), matrix: elapsedMatrix, total: +((Date.now() - t0) / 1000).toFixed(1) },
  config: {
    world: { FLIP_P, REROLL_P, N, TOX_Q, JOIN }, damageWindow: DW, pre: PRE, g1Window: G1_WIN,
    hedge: CFG, admission: ADM, comovement: CO, reprob: REPROB, roster: ALL_IDS,
    deviations: ['g1 ACTIVE in all attack arms (E36 deviation carried — same-arm regression/visibility baseline)', 'k* = 25 carried from E35 (no re-search)', 'probe block doubles as matrix seed 0 (no re-run)', 'CoMovementGuard = FlipGuard plumbing + E40 relational ALIGN cosine (NO per-sender baseline anywhere); TrustReprobation E37/E38/E39-verbatim (detector swap ONLY)', 'sweep {0.20, 0.35, 0.50} + W=20 set from design-time pricing (seed 100, disjoint; pricing.dev row)', 'fresh e40:* world draws (generator verbatim)'],
  },
  pricing,
  hpick: { sweepTable, picked: HSTAR, relaxed: pick.relaxed, aliased: ALIASED },
  arms: armsAgg,
  claims: { R1, R2, R3, R4, R5, verdict: VERDICT },
  perSeed: seedRows,
  chain: { rows: rows.length, tip, verified: vfy.ok },
};
writeFileSync('experiments/outputs/e40_summary.json', JSON.stringify(summary, null, 1));
writeFileSync('experiments/outputs/receipts_e40.jsonl', rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
// file re-verify (E35 discipline: the chain must verify FROM THE WRITTEN FILE)
const reread = readFileSync('experiments/outputs/receipts_e40.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const vfyFile = verifyChain(reread);
console.log(`file re-verify: ${vfyFile.ok ? 'OK' : 'FAILED'} (${reread.length} rows)`);
if (!vfyFile.ok) { console.error('FILE CHAIN VERIFY FAILED', vfyFile); process.exit(1); }

console.log(`R1 floor ${ARM_CM1}: ${R1[ARM_CM1].verdict} (founder trips ${R1[ARM_CM1].falseTrips.total} = ${R1[ARM_CM1].falseTrips.ratePer200r}/200r vs budget 1.0; matrix floor minRho ${R1[ARM_CM1].founderFloorMinMatrix ?? R1[ARM_CM1].founderFloorMin_matrix})`);
for (const B of B_ARMS) console.log(`R2 detect ${B}: ${R2[B].verdict} trips=${R2[B].trippedSeeds}/${SEEDS} latency=${R2[B].latency ? R2[B].latency.mean : 'n/a'}rd preFlipTrips=${R2[B].preFlipTrips_total}`);
for (const B of B_ARMS) console.log(`R3 g1 ${B}: ${R3[B].verdict} trips=${R3[B].trippedSeeds}/${SEEDS} latFromAdm=${R3[B].latencyFromAdmission ? R3[B].latencyFromAdmission.mean : 'n/a'}rd minRho=${R3[B].minRho ? R3[B].minRho.mean : 'n/a'}`);
for (const B of B_ARMS) console.log(`R4 damage ${B}: ${R4[B].verdict} ratio(B/A1)=${R4[B].damageRatio_B_over_A1} delta=${R4[B].pairedDelta_A1_minus_B.mean}±${R4[B].pairedDelta_A1_minus_B.se} p=${R4[B].signTest_oneSided.p} | g1 delta=${R4[B].g1Damage_paired.delta_B_minus_A1.mean}±${R4[B].g1Damage_paired.delta_B_minus_A1.se}`);
for (const B of B_ARMS) { const e = R5.perSensor[B]; console.log(`R5 canaries ${B}: ${e.verdict} honQ(${e.honQ.diff_vs_A4.pass_1SE ? 'pass' : 'FAIL'} ${e.honQ.diff_vs_A4.mean}±${e.honQ.diff_vs_A4.se}) h2(${e.h2.defenseTrips === 0 && e.h2.invariancePass ? 'pass' : 'FAIL'} trips=${e.h2.defenseTrips}) g1(${e.g1.pass ? 'pass' : 'FAIL'} ${e.g1.pairedDelta_B_minus_A1.mean}) ft(${e.falseTrips.pass ? 'pass' : 'FAIL'} ${e.falseTrips.ratePer200r}/200r) rec(${e.recovery.verdict})`); }
console.log(`CROWN: ${VERDICT.crowned}  (${VERDICT.verdict})`);
console.log(vault.liveJobs === 0 ? 'E40 DONE' : 'E40 PROBLEM (live jobs)');
