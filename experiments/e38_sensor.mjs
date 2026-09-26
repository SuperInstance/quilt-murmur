// E38 — THE SENSOR (CUSUM change-point detection composed with trust re-probation vs the E35 sleeper)
// ==================================================================================================
// Collides with E37's carried seed. E37 (receipt 0x167c9ff9c196a71c) proved the trust
// consequence WORKS — TrustReprobation halves the flipper (49.4% trust drops), false-tripped
// founders re-earn (23/25 to >=95% of pre-trip share within 100r, mean 19.1r) — but its
// detector (E36's B1 FlipGuard, trailing-30 devMean > 2x own probation devMean) MISSED the
// flip 4/6 seeds. Its closing receipt: "carried seed for the next lane: better flip DETECTION
// signal ..., not stronger consequences — DETECTION IS THE BOTTLENECK". E38 builds that sensor:
//
//   CUSUM change-point detection on each sender's OWN residual stream. For sender i at
//   round t: residual r_i(t) = |p_i(t) - pooled(t)| (the same deviation the admission bar
//   uses, but streamed). Baseline: mu_i = the sender's own probation devMean (its
//   honest-floor calibration, carried from admission; founders: its own first admitWindow
//   residuals — E37's FlipGuard first40 doctrine), sigma_i = the sd of the SAME window
//   (fallback: 0.1 flat if sd < 0.05). Standardized z_i(t) = (r_i(t) - mu_i) / sigma_i;
//   CUSUM S_i(t) = max(0, S_i(t-1) + z_i(t) - drift), drift = 0.5; S reset to 0 on trip.
//   TRIP when S_i(t) > h. Rationale: the sleeper's post-flip residual jumps in MEAN (E35:
//   ~0.25 post-flip vs probation 0.184-0.20) and is BIMODAL in stretches (toxic p=0.25 vs a
//   pool near truth), so z spikes to +2..+3.6 every truth-mismatched round; CUSUM accumulates
//   small consistent shifts and is the classic detector with a tunable false-alarm rate.
//   Honest voices' residuals fluctuate around their OWN mu with sigma scaling, so
//   accumulation should stay under h — but MEASURE that, don't assume it.
//
//   Consequence (E37 verbatim): on trip -> TrustReprobation (HedgeTrust weight x0.5 via
//   absorb, re-earns through the normal fixed-share + exp(eta*r) path) + influence
//   re-probation (epsNew for 40 guard rounds). The detector replaces FlipGuard's
//   trailing-mean bar; everything downstream is E37's proven machinery.
//
// THE QUESTION: can a change-point detector see the sleeper's flip (trip latency < 30
// rounds in most seeds), contain it (R1: D(C4) < D(A1), paired sign p < 0.05), and what
// does the h threshold buy/cost in false alarms (the sensor operating curve)? E36/E37's
// lesson is that the sign test starves at 6 seeds unless the detector trips in nearly every
// seed — a per-sender self-calibrated CUSUM is the strongest known cheap candidate.
//
// SETUP (E37 verbatim world, fresh e38:* draws): 12 honest founders (mixed acuity, a1 =
// 0.9 reference) + 1 honest late-joiner h2 (t=150, honest forever — the false-positive
// canary) + 1 flasher g1 (toxic from arrival, t=150 — the regression canary, ACTIVE in all
// attack arms so R2c has a same-arm baseline) + 1 sleeper w1 (t=150, honest phase = e24 h1
// generator verbatim, flips at admission + k* = 25 — E35's probe-optimal, carried; the GAN
// strategy search is CLOSED, k* is not re-searched). T=400, 8 seeds (probe rule may cut to
// 6). Paired arms, IDENTICAL worlds (same truth stream, honest votes, toxic series; arms
// select over shared values):
//   A1   v3.1-sleeper — full v3.1 + sleeper + active g1, NO defense (E36/E37 control)
//   C4   cusum(h*)    — v3.1 + CUSUM(h* = probe-picked) + trust re-probation + same attack
//                        [the candidate]
//   Chi  cusum(8)     — v3.1 + CUSUM(h=8) + trust re-probation + same attack [conservative
//                        sibling — measures the sensitivity trade; if h* = 8 the two arms
//                        coincide and Chi ALIASES C4 (receipted, no re-run)]
//   A4   v3.1-clean   — full v3.1, no attack, NO defense (collateral baseline)
//
// DAMAGE METHOD (E35/E36/E37 counterfactual, verbatim): D = mean over the post-flip window
// [t_flip, min(t_flip+150,400)) of |err(pool) - err(pool with that attacker zeroed)|, err =
// |pool - s|, counterfactual pools are reference-side only (MurmurBus.pool, log-odds), never
// written to the sheet. Sleeper window anchored at t_adm + 25 with t_adm measured per seed
// on a pass-1 honest-forever A1-wiring run (in-run assert: pass-1 == matrix admission). g1
// uses its own window [150, 300). Positive = hurts.
//
// DECISION RULES (receipted BEFORE the full run):
//   R1 CONTAINMENT — C4 must satisfy D(C4) < D(A1): paired one-sided sign test (zeros
//      excluded) p < 0.05; report paired delta +/- SE and damage ratio D(C4)/D(A1). C-hi's
//      numbers are receipted alongside (the sensitivity trade) but the crown rides on C4.
//   R2 CANARIES — C4 (and C-hi, reported), ALL must hold:
//      (a) honestFinalQ within 1 SE of A4: |mean(honQ(A4)-honQ(C))| <= SE of the seed-paired
//          difference (C arms MOVE trust by design — receipted as trustMoved per seed);
//      (b) h2 admitted in ALL seeds (8/8, or 6/6 if cut) with NO defense trips — the sensor
//          must not flag honest independent newcomers (throws == 0 AND guard rounds == 0);
//      (c) g1 damage <= A1 + 1 SE (SE of the seed-paired difference);
//      (d) FALSE-TRIP BUDGET: total honest-founder trips per 200 rounds <= 1.0 arm-wide
//          (rate = founder throw events / (seeds * T/200)); measured explicitly: trips,
//          per-founder histogram, recovery rounds.
//   R3 RECOVERY — false-tripped founders re-earn to >= 95% of pre-trip trust share within
//      100 rounds (E37 baseline: 23/25, mean 19.1r — must not regress). Events without a
//      full 100-round horizon (decayT > T-1-100) receipted but excluded. Vacuous pass if no
//      founder trips.
//   R4 SENSOR OPERATING CURVE — per h in the probe sweep {4,6,8}: trip latency after flip
//      (rounds, mean +/- sd over seeds where it tripped), per-seed trip/no-trip, false-trip
//      count on honest voices. Coverage: the picked h (C4) and h=8 (Chi) get the full
//      matrix; the unpicked sweep arms keep their probe-seed coverage. The receipt must
//      answer: does CUSUM see the flip (latency < 30 rounds in most seeds), and at what
//      false-alarm price?
//   CROWN — if C4 passes R1 + R2 + R3, crown it with its damage ratio and mean trip
//      latency; if it fails, receipt the negative verdict with the mechanism COMPUTED from
//      telemetry (per-seed S_i(t) trajectory summaries around t_flip — did the statistic
//      accumulate and plateau below h? did sigma_i miscalibration eat the signal?).
//
// PROBE h-PICK (receipted before any run): the probe is a 1-seed (seed 0) timed run of the
// full matrix + the h-sweep (pass-1 + A1 + A4 + C-h for h in {4,6,8}). For each h: delta_h
// = D_w1(A1, s0) - D_w1(C_h, s0); hard gates on seed 0: (i) ZERO CUSUM trips on h2;
// (ii) D_g1(C_h, s0) <= D_g1(A1, s0) + 1e-4 (single-seed proxy for R2c's +1 SE form; 1e-4
// ~ 5x E37's measured founder-decay leak, chosen before the run); (iii) founder-trip rate
// on seed 0 <= 1.0 per 200 rounds (<= 2 trips). PICK: argmax delta_h among h passing ALL
// gates; ties (|delta| <= 1e-9) -> LARGER h (more conservative). If no h passes all gates:
// argmax delta among h passing gate (i) alone (receipted relaxed='founder-only'); if still
// none: argmax delta (relaxed='none'). If h* = 8: C4 == Chi (alias, receipted).
//
// RUNTIME DISCIPLINE (receipted before the full run): probe = the timed seed-0 block
// (pass-1 + A1 + A4 + the 3-arm h-sweep = 6 runs); projected = t_probe * 8 + 2s IO (the
// probe block is >= any matrix seed's work: 5 runs when h* != 8, 4 when aliased — the
// projection is conservative); if projected > 170s, cut seeds 8 -> 6 and RECEIPT the cut
// (E36/E37 ran ~130-135s at 6 seeds). The probe doubles as matrix seed 0 (no re-run: A1/A4
// and the picked C arms' seed-0 results are carried into the matrix).
//
// COMPOSITION RECEIPT (stated up front): both mechanisms are EXPERIMENT-LOCAL classes over
// the murmur/ module APIs — ZERO changes to murmur/ (target: zero). Hooks used:
//   Admission: observe(), reattribute(), notePooled(), admitted(), admittedRound(),
//     probationary(), devMean(), firstSeen (public, read-only), admitWindow/epsNew/admitErr
//     (public config fields)
//   HedgeTrust: weights(), update(), absorb(), weight()  <- the trust-decay hook
//   MurmurBus.pool() (reference-side counterfactuals), receipts.sealChain/verifyChain.
// CusumGuard = FlipGuard's PLUMBING verbatim (rec/note/apply/summary skeleton, guard
// windows {from:t+1, until:t+40}, release events, epsNew throwback, guardRounds accounting,
// throw/rethrow event kinds drained by TrustReprobation) with the trip statistic swapped:
// EWMA/trailing-mean -> per-sender self-calibrated CUSUM (spec above). TrustReprobation is
// copied VERBATIM from e37_trustlane.mjs (unmodified — it reads only the detector's event
// log). S accumulates EVERY post-baseline round (the spec formula); trip EVENTS evaluate
// only when no guard window is open (E37 plumbing) — suppressed crossings are counted in
// telemetry; on a trip event S resets to 0 (spec).
//
// RNG DOCTRINE (binding, E35/E36/E37 verbatim): all randomness through MothVault
// (offline:true), one harvest, per-purpose stream keys 'e38:<purpose>:<seed>' via
// streamFor; NO Math.random. Paired worlds REQUIRE arm-identical world streams — arms
// never consume different draws. Fresh e38:* draws (the world GENERATOR is E37 verbatim;
// the stream-key prefix is per-task by doctrine).
//
// Run: node experiments/e38_sensor.mjs [seeds]   (E38_DEV=1 for a 1-seed dev run)

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
let SEEDS = Number(process.argv[2] || (process.env.E38_DEV ? 1 : 8));
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
const CUSUM = {
  drift: 0.5,            // spec: S = max(0, S + z - drift)
  hSweep: [4, 6, 8],     // probe sweep
  chiH: 8,               // conservative sibling (C-hi)
  sigmaFloor: 0.05,      // fallback: sigma < 0.05 -> flat
  sigmaFlat: 0.1,
  guardRounds: 40,       // epsNew re-probation window (E36/E37 verbatim)
};
const REPROB = { frac: 0.5, horizon: 100 };    // E37 TrustReprobation verbatim
const G1_WIN = { from: JOIN, to: JOIN + DW };  // g1's own window [150, 300)
const TOL = 1e-9;
const PROBE_G1_TOL = 1e-4;                     // receipted probe gate (ii) tolerance

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
const seOf = (a) => (a.length > 0 ? sd(a) / Math.sqrt(a.length) : 0);

// ---------------- world (E37 verbatim; stream keys e38:*) ----------------
function genWorld(seed, harvest, vault) {
  const wR = makeRng(harvest, vault, `e38:world:${seed}`);
  const qR = makeRng(harvest, vault, `e38:skill:${seed}`);
  const xR = makeRng(harvest, vault, `e38:tox:${seed}`);
  const shR = makeRng(harvest, vault, `e38:sleep:${seed}`);
  const nhR = makeRng(harvest, vault, `e38:h2:${seed}`);
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
  for (let i = 0; i < N; i++) vR.push(makeRng(harvest, vault, `e38:vote:${seed}:${i}`));
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
  return { id: `sensorlane-${V}`, title: `E38 sensor lane (${V} voice slots)`, cells };
}

// __DEFENSES_BEGIN (experiment-local; murmur/ untouched — composition receipt)
// CusumGuard — FlipGuard's plumbing (copied from e37_trustlane.mjs's FlipGuard:
// rec/note/apply/summary skeleton, guard windows, release events, epsNew
// throwback, guardRounds accounting, throw/rethrow kinds) with the trip
// statistic swapped for the E38 spec: per-sender self-calibrated CUSUM on the
// sender's own |p - pooled| residual stream.
//   baseline mu:  newcomer -> adm.devMean(id) (the quantity admitErr judged,
//                 carried from admission); founder -> mean of its OWN first
//                 admitWindow residuals (FlipGuard's first40 doctrine).
//   baseline sigma: sd of the SAME window from the detector's own recorded
//                 stream (Admission exposes devMean but not sd); for newcomers
//                 sliced to residuals strictly before the admission round (the
//                 same rounds devMean counted); fallback flat sigmaFlat if
//                 sd < sigmaFloor.
//   z_i(t) = (r_i(t) - mu_i)/sigma_i; S_i(t) = max(0, S_i(t-1) + z_i(t) - drift);
//   trip when S_i(t) > h (evaluated only when no guard window is open — E37
//   plumbing; suppressed crossings counted); S reset to 0 on a trip event.
class CusumGuard {
  constructor(adm, cfg) { // cfg: { h, drift, sigmaFloor, sigmaFlat, guardRounds }
    this.adm = adm; this.cfg = cfg;
    this.devs = new Map();      // id -> [{t, d}] — the sender's OWN |p - pooled| stream
    this.base = new Map();      // id -> { mu, sigma, src, n } — honest-floor calibration
    this.S = new Map();         // id -> current CUSUM statistic
    this.track = new Map();     // id -> { n, maxS, maxSat, lastS } — per-sender statistic telemetry
    this.w1Path = [];           // SLEEP's full {t, r, z, S} path (mechanism receipt)
    this.suppressed = new Map();// id -> crossings of h suppressed by an open guard window
    this.guarded = new Map();   // id -> { from, until } — epsNew throwback window
    this.events = [];
    this.guardRounds = new Map();
  }
  rec(id, t, d) {
    if (!this.devs.has(id)) this.devs.set(id, []);
    const a = this.devs.get(id);
    a.push({ t, d });
    if (!this.base.has(id)) {
      const r = this.adm.admittedRound(id);
      if (r === 1) { // founder: no probation exists — its OWN first admitWindow rounds are the reference
        if (a.length === this.adm.admitWindow) {
          const w = a.slice(0, this.adm.admitWindow).map((x) => x.d);
          const s = sd(w);
          const flat = s < this.cfg.sigmaFloor;
          this.base.set(id, { mu: mean(w), sigma: flat ? this.cfg.sigmaFlat : s, src: flat ? 'first40-flat' : 'first40', n: w.length });
        }
      } else if (r != null && this.adm.admitted(id)) { // newcomer: the quantity admitErr judged, verbatim from Admission
        const dm = this.adm.devMean(id);
        if (dm != null) {
          const w = a.filter((x) => x.t < r - 1).map((x) => x.d); // strictly before the admission round = devMean's rounds
          const s = sd(w);
          const flat = s < this.cfg.sigmaFloor;
          this.base.set(id, { mu: dm, sigma: flat ? this.cfg.sigmaFlat : s, src: flat ? 'probation-flat' : 'probation', n: w.length });
        }
      }
    }
  }
  note(t, murmurs, pool) { // post-pool: record devs + CUSUM update + trip check (effective next round)
    for (const m of murmurs) this.rec(m.from, t, Math.abs(+m.p - pool));
    for (const m of murmurs) {
      const id = m.from;
      const g = this.guarded.get(id);
      if (g) {
        if (t > g.until) { this.events.push({ t, id, kind: 'release' }); this.guarded.delete(id); }
        // statistic keeps streaming while guarded (spec formula); only the EVENT is gated
      }
      const b = this.base.get(id);
      if (!b || !this.adm.admitted(id)) continue;
      const r = Math.abs(+m.p - pool);
      const z = (r - b.mu) / b.sigma;
      const Sprev = this.S.get(id) ?? 0;
      const S = Math.max(0, Sprev + z - this.cfg.drift);
      this.S.set(id, S);
      const tr = this.track.get(id) ?? { n: 0, maxS: 0, maxSat: t, lastS: 0 };
      tr.n++; tr.lastS = S;
      if (S > tr.maxS) { tr.maxS = S; tr.maxSat = t; }
      this.track.set(id, tr);
      if (id === SLEEP) this.w1Path.push({ t, r: r6(r), z: r6(z), S: r6(S) });
      if (g) { // guard open: no trip event (E37 plumbing); count suppressed crossings
        if (S > this.cfg.h) this.suppressed.set(id, (this.suppressed.get(id) ?? 0) + 1);
        continue;
      }
      if (S > this.cfg.h) {
        this.S.set(id, 0); // reset on trip (receipted spec)
        const re = this.events.some((e) => e.id === id && (e.kind === 'throw' || e.kind === 'rethrow'));
        this.events.push({
          t, id, kind: re ? 'rethrow' : 'throw', S: r6(S), z: r6(z), r: r6(r),
          mu: r6(b.mu), sigma: r6(b.sigma), baseSrc: b.src,
          trail30: r6(mean(this.devs.get(id).slice(-30).map((x) => x.d))), refMean: r6(b.mu),
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
    for (const id of [...this.devs.keys()]) {
      const ev = this.events.filter((e) => e.id === id);
      const b = this.base.get(id);
      const tr = this.track.get(id) ?? null;
      per[id] = {
        throws: ev.filter((e) => e.kind === 'throw').length,
        rethrows: ev.filter((e) => e.kind === 'rethrow').length,
        guardRounds: this.guardRounds.get(id) ?? 0,
        mu: b ? r6(b.mu) : null, sigma: b ? r6(b.sigma) : null, baseSrc: b ? b.src : null, baseN: b ? b.n : null,
        nEval: tr ? tr.n : 0, maxS: tr ? r6(tr.maxS) : null, maxSat: tr ? tr.maxSat : null, lastS: tr ? r6(tr.lastS) : null,
        suppressedCrossings: this.suppressed.get(id) ?? 0,
      };
    }
    return { h: this.cfg.h, drift: this.cfg.drift, per, events: this.events.map((e) => ({ ...e })), w1Path: this.w1Path.map((x) => ({ ...x })) };
  }
}

// TrustReprobation — E37 VERBATIM (unmodified): drains the detector's event
// log; on every throw/rethrow, decay that sender's HedgeTrust weight to
// frac x its current value via absorb(), then let the NORMAL hedge update path
// re-earn it (fixed-share + exp(eta*r)). Recovery is measured per event against
// 0.95 x pre-trip share within `horizon` rounds (R3).
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
  return { loc: src.slice(a, b).split('\n').length - 1, classes: ['CusumGuard (FlipGuard plumbing + E38 CUSUM statistic)', 'TrustReprobation (E37 verbatim)'] };
}

// ---------------- arm specs ----------------
// attackers: [{ id, flip }] — flip = toxic start round (null = never flips).
// g1 is ACTIVE in all attack arms (E36 deviation, carried) — the regression
// canary needs a same-arm baseline. A4 carries no attackers.
const armName = (kind, h) => (kind === 'C4' ? `C4-cusum-h${h}` : 'Chi-cusum-h8');
function armSpecs(tAdm, hStar, aliased) {
  const flip = tAdm == null ? null : tAdm + KSTAR;
  const atk = [{ id: SLEEP, flip }, { id: INSTANT, flip: JOIN }];
  return {
    'A1-v3.1-sleeper': { name: 'A1-v3.1-sleeper', kind: 'A1', defenses: [], reprob: false, h: null, attackers: atk },
    [armName('C4', hStar)]: { name: armName('C4', hStar), kind: 'C4', defenses: ['cusum'], reprob: true, h: hStar, attackers: atk },
    ...(aliased ? {} : {
      [armName('Chi', hStar)]: { name: armName('Chi', hStar), kind: 'Chi', defenses: ['cusum'], reprob: true, h: CUSUM.chiH, attackers: atk },
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
  const cusumDef = spec.defenses.includes('cusum')
    ? new CusumGuard(adm, { h: spec.h, drift: CUSUM.drift, sigmaFloor: CUSUM.sigmaFloor, sigmaFlat: CUSUM.sigmaFlat, guardRounds: CUSUM.guardRounds })
    : null;
  const reprob = spec.reprob ? new TrustReprobation(cusumDef, trust, REPROB) : null;
  const defs = [cusumDef].filter(Boolean);
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
    if (reprob) reprob.sample(t); // R3 recovery sampling on post-round shares
    if (t >= JOIN) st.w1Curve.push(r6(trust.weight(SLEEP) ?? 0)); // R4 post-round trust path
  }

  // sensor trip record for the sleeper (latency anchored at the flip round)
  let w1Trip = null;
  const wApost = atkOf(SLEEP);
  if (cusumDef && wApost && wApost.flip != null) {
    const trips = cusumDef.events.filter((e) => e.id === SLEEP && (e.kind === 'throw' || e.kind === 'rethrow'));
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
    w1: {
      ...st.rec[SLEEP],
      probTraceN: st.probTrace.length,
      probTraceMean: st.probTrace.length ? mean(st.probTrace) : null,
      probTraceMax: st.probTrace.length ? Math.max(...st.probTrace) : null,
    },
    h2: st.rec[JOINER], g1: st.rec[INSTANT],
    defense: {
      cusum: cusumDef ? cusumDef.summary() : null,
      reprob: reprob ? reprob.summary() : null,
    },
    verify: st.verify,
    err: st.err,
  };
}

// ---------------- main ----------------
console.log(`── E38 sensor lane · CUSUM sweep ${CUSUM.hSweep.join('/')} · ${T} rounds · ${V} voice slots ──`);
const vault = new MothVault({ label: 'e38', offline: true });
const harvest = await vault.harvest(256);
console.log(`vault: ${harvest.mock ? 'MOCK (offline doctrine)' : 'LIVE ' + harvest.jobId} digest=${harvest.poolDigest.slice(0, 10)} bits=${harvest.bits.length}`);

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });
book('run.config', {
  task: 'E38', name: 'the sensor (CUSUM change-point detection composed with trust re-probation vs the E35 sleeper)',
  collides: 'E37 carried seed — E37 proved the trust consequence works (49.4% drops, 23/25 founder recovery) but its detector misses the flip 4/6 seeds: DETECTION IS THE BOTTLENECK; E38 builds the sensor',
  T, N, voices: V, seeds: SEEDS, kStarCarried: KSTAR,
  kStarNote: 'k* = 25 carried from E35 (probe-optimal on the train seed; GAN strategy search CLOSED in E35, not re-run)',
  world: { stateFlipP: FLIP_P, skillRerollP: REROLL_P, qRange: [0.5, 0.95], a1Acuity: 0.9, toxicFormula: { id: 'E24 verbatim', acuity: TOX_Q, note: 'toxV shared by w1 post-flip AND g1 (same toxic values across arms)' }, streamKeys: 'e38:* (fresh draws; generator E37 verbatim)' },
  attack: {
    joinRound: JOIN,
    sleeper: { id: SLEEP, honestPhase: 'e24 h1 generator verbatim (expert acuity, iid errors, own edges)', flip: 't_adm + 25; t_adm per seed from a pass-1 honest-forever A1-wiring run (in-run assert pass1 == matrix)' },
    flasher: { id: INSTANT, note: 'toxic FROM arrival t=150 — the regression canary; ACTIVE in all attack arms (E36 deviation, carried: R2c needs a same-arm g1 baseline)' },
    honestJoiner: { id: JOINER, note: 'honest forever, present in ALL arms — the false-positive canary' },
  },
  armsPlan: ['A1-v3.1-sleeper (control)', 'C4-cusum-h* (candidate; h* picked by the receipted probe rule)', 'Chi-cusum-h8 (conservative sibling; aliases C4 if h* = 8)', 'A4-v3.1-clean (collateral baseline)'],
  defenses: {
    cusumGuard: {
      ...CUSUM, reprob: REPROB,
      statistic: 'per sender i at round t: r_i(t) = |p_i(t) - pooled(t)|; mu_i = own probation devMean carried from admission (founders: mean of own first admitWindow residuals); sigma_i = sd of the SAME window from the detector\'s own stream (newcomers sliced strictly before the admission round = devMean\'s rounds; fallback flat 0.1 if sd < 0.05); z_i(t) = (r_i(t) - mu_i)/sigma_i; S_i(t) = max(0, S_i(t-1) + z_i(t) - drift); drift = 0.5; TRIP when S_i(t) > h; S reset to 0 on trip',
      plumbing: 'FlipGuard plumbing verbatim from e37_trustlane.mjs: guard window {from: t+1, until: t+40} on trip, release events, epsNew throwback each guarded round (skipping adm-probationary ids), guardRounds accounting, throw/rethrow kinds; S streams EVERY post-baseline round (spec formula), trip EVENTS gated by the guard window, suppressed crossings counted in telemetry',
      consequence: 'on trip -> BOTH layers: TrustReprobation (HedgeTrust weight x0.5 via absorb, post-pool pre-update, re-earns through the normal fixed-share + exp(eta*r) path; E37 class copied VERBATIM) + influence re-probation (epsNew for 40 guard rounds)',
      rationale: 'the sleeper\'s post-flip residual jumps in MEAN (E35: ~0.25 vs probation 0.184-0.20) and is bimodal in truth-stretches (toxic p=0.25 vs pool near truth) — z spikes +2..+3.6 on mismatched rounds; CUSUM accumulates small consistent shifts with a tunable false-alarm rate; honest voices fluctuate around their OWN mu with sigma scaling so accumulation should stay under h — MEASURED, not assumed',
    },
  },
  composition: {
    murmurChanges: 'NONE (target zero) — both mechanisms are experiment-local classes over public murmur/ APIs',
    apis: ['Admission.observe/reattribute/notePooled/admitted/admittedRound/probationary/devMean/firstSeen(read)/admitWindow/epsNew/admitErr', 'HedgeTrust.weights/update/absorb/weight', 'Provenance.inspect/penalize', 'MurmurBus.pool (reference-side counterfactuals)', 'receipts.sealChain/verifyChain'],
    layerNote: 'C arms deliberately MOVE trust (E37\'s TrustReprobation is the proven consequence); decay fires post-pool pre-update (same seam as adm.notePooled / the detector\'s note); re-trips allowed (persistent liar re-accumulates during its guard window and retrips at/after release)',
    timing: 'CUSUM updates post-pool every round from its baseline round; trip consequence effective next round (guard from t+1) — E36/E37 plumbing timing verbatim',
  },
  hedge: CFG, admission: ADM,
  founders: 'D1 genesis acclamation (newcomers w1/g1/h2 join t=150: probationary from firstSeen)',
  absentSenderReward: 'missing ids get HedgeTrust default 0.5 (unproven prior) while absent; roster = 15 slots in every arm (e33/e35/e36/e37 convention)',
  reward: 'r_i = 1 - |p_i - s_t| (supervised pool — pool-independent, so trust re-earning is not gated by the defense)',
  rng: 'MothVault offline:true, one harvest, per-purpose keys e38:<purpose>:<seed>[:<voice>] via streamFor; paired worlds REQUIRE arm-identical world streams (arms select over shared values; no arm-keyed draws); no Math.random',
  metrics: {
    D_w1: 'mean over [t_adm+25, min(t_adm+25+150,400)) of |pool - s_t| - |pool_cf - s_t| (E24/E35/E36/E37 counterfactual, sleeper zeroed, reference-side log-odds, never written to the sheet; positive = hurts)',
    D_g1: 'same method over g1\'s own window [150, 300), g1 zeroed',
    honestFinalQ: 'mean HedgeTrust weight of the 12 honest incumbents at t=T-1 (post final update+absorb)',
    tripLatency: 'first CUSUM throw event on w1 with t >= t_flip, minus t_flip (rounds)',
  },
  decisionRules: {
    R1_containment: 'C4 must satisfy D(C4) < D(A1): paired one-sided sign test (zeros excluded) p < 0.05; report paired delta +/- SE and damage ratio D(C4)/D(A1). C-hi receipted alongside (the sensitivity trade) but the crown rides on C4',
    R2a_honestFinalQ: '|mean(honQ(A4) - honQ(C))| <= 1 SE of the seed-paired difference; C arms move trust by design (trustMoved receipted per seed); incremental-vs-A1 lens reported alongside (E37 structural receipt: the fpTax-vs-A4 bar prices the ATTACK unless containment shrinks it)',
    R2b_h2Canary: 'h2 admitted in ALL seeds (8/8, or 6/6 if cut) with NO defense trips — the sensor must not flag honest independent newcomers (throws == 0 AND guard rounds == 0 across the arm)',
    R2c_g1Regression: 'mean D_g1(C) <= mean D_g1(A1) + 1 SE (SE of the seed-paired difference)',
    R2d_falseTripBudget: 'total honest-founder trips per 200 rounds <= 1.0 arm-wide (rate = founder throw events / (seeds * T/200)); measured explicitly: trips, per-founder histogram, recovery rounds',
    R3_recovery: 'false-tripped founders re-earn to >= 95% of pre-trip trust share within 100 rounds (E37 baseline: 23/25, mean 19.1r — must not regress); events without a full 100-round horizon receipted but excluded; vacuous pass if no founder trips',
    R4_sensorOperatingCurve: 'per h in the probe sweep {4,6,8}: trip latency after flip (rounds, mean +/- sd over seeds where it tripped), per-seed trip/no-trip, false-trip count on honest voices; coverage: picked h (C4) and h=8 (Chi) get the full matrix, unpicked sweep arms keep probe-seed coverage; the receipt must answer: does CUSUM see the flip (latency < 30 rounds in most seeds), and at what false-alarm price?',
    crown: 'if C4 passes R1 + R2 + R3, crown it with its damage ratio and mean trip latency; if it fails, receipt the negative verdict with the mechanism COMPUTED from telemetry (per-seed S_i(t) trajectory summaries around t_flip — did the statistic accumulate and plateau below h? did sigma_i miscalibration eat the signal?)',
  },
  probeRule: {
    hSweep: CUSUM.hSweep,
    gates: '(i) ZERO CUSUM trips on h2 on seed 0; (ii) D_g1(C_h, s0) <= D_g1(A1, s0) + 1e-4 (single-seed proxy for R2c +1 SE; 1e-4 ~ 5x E37\'s measured founder-decay leak, chosen before the run); (iii) founder-trip rate on seed 0 <= 1.0 per 200 rounds (<= 2 trips)',
    pick: 'argmax delta_h = D_w1(A1,s0) - D_w1(C_h,s0) among h passing ALL gates; ties |delta| <= 1e-9 -> LARGER h; fallback ladder: none pass all -> argmax delta among gate-(i) passers (relaxed=founder-only) -> argmax delta (relaxed=none); h* = 8 -> Chi aliases C4 (receipted, no re-run)',
    pickBefore: 'the pick row (sensor.hpick) is booked BEFORE any full-matrix run row; the probe block doubles as matrix seed 0 (no re-run)',
  },
  runtimeRules: 'probe = the timed seed-0 block (pass-1 + A1 + A4 + the 3-arm h-sweep = 6 runs); projected = t_probe * 8 + 2s IO (conservative: any matrix seed needs <= 5 runs); if projected > 170s cut seeds 8 -> 6 and RECEIPT the cut (E36/E37 ran ~130-135s at 6 seeds); NO script edits after the final run (stale-artifact doctrine)',
  defenseLoc: defenseLoc(),
  vault: { mock: harvest.mock, digest: harvest.poolDigest },
  engine: 'vendored quilt dist (QuiltEngine)', sheetVerifyTol: TOL,
});

// ---------------- phase 1: probe (seed 0) — full matrix + h-sweep ----------------
const world0 = genWorld(0, harvest, vault);
const eng0 = new QuiltEngine('e38-s0', {});
eng0.loadSheet(buildSheet());
const probeStart = Date.now();
const engP1 = new QuiltEngine('e38-s0-p1', {});
engP1.loadSheet(buildSheet());
const p1 = await runArm(0, world0, { name: 'pass1', kind: 'pass1', defenses: [], reprob: false, h: null, attackers: [{ id: SLEEP, flip: null }, { id: INSTANT, flip: JOIN }] }, engP1);
if (p1.w1.admitExpT === undefined) console.log('  seed 0: sleeper NOT admitted under honest behavior — attack cannot launch (receipted as neverLaunched)');
const tAdm0 = p1.w1.admitExpT;
const probe = { A1: null, A4: null, C: {} };
for (const spec of [
  { name: 'A1-v3.1-sleeper', kind: 'A1', defenses: [], reprob: false, h: null, attackers: armSpecs(tAdm0, 4, false)['A1-v3.1-sleeper'].attackers },
  { name: 'A4-v3.1-clean', kind: 'A4', defenses: [], reprob: false, h: null, attackers: [] },
  ...CUSUM.hSweep.map((h) => ({ name: `probe-h${h}`, kind: 'probe', defenses: ['cusum'], reprob: true, h, attackers: armSpecs(tAdm0, 4, false)['A1-v3.1-sleeper'].attackers })),
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
  e36e37Reference_s: '130.1s / 134.7s matrix at 6 seeds',
});
console.log(`probe(seed 0): ${+(probeMs / 1000).toFixed(1)}s -> projected(8 seeds)=${projected.toFixed(0)}s -> seeds=${SEEDS}${cut ? ' (CUT)' : ''}`);

// ---------------- phase 1b: the h pick (receipted rule) ----------------
const founderTripCount = (R) => Object.entries(R.defense.cusum.per)
  .filter(([id]) => HONEST.includes(id)).reduce((a, [, p]) => a + p.throws + p.rethrows, 0);
const h2TripCount = (R) => {
  const p = R.defense.cusum.per[JOINER];
  return p ? p.throws + p.rethrows : 0;
};
const sweepTable = CUSUM.hSweep.map((h) => {
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
const ALIASED = HSTAR === CUSUM.chiH;
const ARM_C4 = armName('C4', HSTAR);
const ARM_CHI = armName('Chi', HSTAR);
book('sensor.hpick', {
  rule: 'argmax delta_h among h passing all gates; ties -> larger h; fallback ladder receipted in run.config',
  sweepTable, picked: HSTAR, relaxed: pick.relaxed, tied: pick.tied,
  aliased: ALIASED, aliasNote: ALIASED ? 'C4 == Chi (h* = 8): the conservative sibling IS the candidate; one arm run, Chi aliases C4 (no re-run)' : 'C4 and Chi are distinct arms',
  probeD_w1: { A1: r6(probe.A1.dmgW1), h4: r6(probe.h4.dmgW1), h6: r6(probe.h6.dmgW1), h8: r6(probe.h8.dmgW1) },
});
console.log(`h-pick: h*=${HSTAR}${pick.relaxed ? ` (RELAXED: ${pick.relaxed})` : ''}${ALIASED ? ' — C4 == Chi (aliased)' : ''}`);

// ---------------- phase 2: full matrix ----------------
const ARMS = ALIASED ? ['A1-v3.1-sleeper', ARM_C4, 'A4-v3.1-clean'] : ['A1-v3.1-sleeper', ARM_C4, ARM_CHI, 'A4-v3.1-clean'];
const agg = {};
for (const A of ARMS) {
  agg[A] = {
    acc: [], pre: [], dmgW1: [], dmgG1: [], shareW1: [], shareG1: [], honQ: [],
    w1Adm: [], w1Dev: [], w1Indep: [], w1ProbMax: [], h2Adm: [], g1Adm: [],
    trustFlip: [], conv: [],
    sensor: { per: {}, w1Events: [], founderTrips: [], w1Trips: [] },
    decayEvents: [],
    w1Curves: {}, w1Paths: {},
    vfy: { checks: 0, pass: 0, maxDiff: 0 },
  };
}
const seedRows = [];
const t0 = Date.now();

// seed 0: carried from the probe (no re-run) + the picked C arms' seed-0 results
{
  const specs = armSpecs(tAdm0, HSTAR, ALIASED);
  const results = {
    'A1-v3.1-sleeper': probe.A1,
    'A4-v3.1-clean': probe.A4,
    [ARM_C4]: probe[`h${HSTAR}`],
    ...(ALIASED ? {} : { [ARM_CHI]: probe[`h${CUSUM.chiH}`] }),
  };
  seedRows.push(await buildSeedRow(0, results, specs, tAdm0, p1, true));
  book('run', seedRows[0]);
  console.log(`  seed 1/${SEEDS} done (carried from probe; t_adm=${tAdm0}, ${((Date.now() - t0) / 1000).toFixed(1)}s elapsed)`);
}

// seeds 1..SEEDS-1: fresh worlds, pass-1 anchor, full arm matrix
for (let seed = 1; seed < SEEDS; seed++) {
  const world = genWorld(seed, harvest, vault);
  const eng = new QuiltEngine(`e38-s${seed}`, {});
  eng.loadSheet(buildSheet());
  const engP1 = new QuiltEngine(`e38-s${seed}-p1`, {});
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
    if (R.defense.cusum) {
      G.sensor.per[seed] = R.defense.cusum.per;
      G.sensor.w1Events.push(...R.defense.cusum.events.filter((e) => e.id === SLEEP && (e.kind === 'throw' || e.kind === 'rethrow')).map((e) => ({ seed, ...e })));
      G.sensor.w1Trips.push({ seed, ...R.w1Trip });
      for (const id of HONEST) {
        const p = R.defense.cusum.per[id];
        if (p && (p.throws > 0 || p.rethrows > 0)) G.sensor.founderTrips.push({ seed, id, ...p });
      }
      G.w1Paths[seed] = R.defense.cusum.w1Path;
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
      defense: {
        cusum: R.defense.cusum ? {
          h: R.defense.cusum.h,
          per: Object.fromEntries(Object.entries(R.defense.cusum.per).filter(([id]) => !HONEST.includes(id))),
          founderMaxS: Object.fromEntries(HONEST.map((id) => [id, R.defense.cusum.per[id] ? R.defense.cusum.per[id].maxS : null])),
          founderTrips: R.defense.cusum.events.filter((e) => HONEST.includes(e.id) && (e.kind === 'throw' || e.kind === 'rethrow')),
          h2Trips: R.defense.cusum.events.filter((e) => e.id === JOINER && (e.kind === 'throw' || e.kind === 'rethrow')),
          g1Trips: R.defense.cusum.events.filter((e) => e.id === INSTANT && (e.kind === 'throw' || e.kind === 'rethrow')),
          w1Path: R.defense.cusum.w1Path,
        } : null,
        reprob: R.defense.reprob ? R.defense.reprob.events.map((e) => ({ id: e.id, tripT: e.tripT, decayT: e.decayT, kind: e.kind, pre: e.pre, post: e.post, recoveredIn: e.recoveredIn })) : null,
      },
      verify: `${R.verify.pass}/${R.verify.checks}`,
    };
  }
  row.honQSpread = { C4_vs_A1: r6(Math.abs(results[ARM_C4].honQFinal - results['A1-v3.1-sleeper'].honQFinal)) };
  return row;
}

// ---------------- aggregate ----------------
const armsAgg = {};
for (const A of ARMS) {
  const G = agg[A];
  const isAttack = A !== 'A4-v3.1-clean';
  const isSensor = A === ARM_C4 || A === ARM_CHI;
  const founderTripsAll = isSensor ? G.sensor.founderTrips : [];
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
      founderTrips: founderTripsAll,
      founderTripTotal: founderTripsAll.reduce((a, e) => a + (e.throws ?? 0) + (e.rethrows ?? 0), 0),
      founderTripRatePer200r: r6(founderTripsAll.reduce((a, e) => a + (e.throws ?? 0) + (e.rethrows ?? 0), 0) / (SEEDS * T / 200)),
      founderTripPerVoice: Object.fromEntries(HONEST.map((id) => [id, founderTripsAll.filter((e) => e.id === id).reduce((a, e) => a + (e.throws ?? 0) + (e.rethrows ?? 0), 0)])),
      h2TripTotal: Object.values(G.sensor.per).reduce((a, per) => a + ((per[JOINER]?.throws ?? 0) + (per[JOINER]?.rethrows ?? 0)), 0),
      g1TripTotal: Object.values(G.sensor.per).reduce((a, per) => a + ((per[INSTANT]?.throws ?? 0) + (per[INSTANT]?.rethrows ?? 0)), 0),
      founderMaxS: Object.fromEntries(HONEST.map((id) => [id, stat(Object.values(G.sensor.per).map((per) => per[id]?.maxS ?? 0))])),
    } : null,
    decayEvents: isSensor ? G.decayEvents : [],
    verify: { checks: G.vfy.checks, pass: G.vfy.pass, maxDiff: G.vfy.maxDiff.toExponential(2) },
  };
}

// ---------------- claims ----------------
const A1 = 'A1-v3.1-sleeper', A4 = 'A4-v3.1-clean';
const B_ARMS = [ARM_C4, ...(ALIASED ? [] : [ARM_CHI])];
const dmgW1Of = (A) => agg[A].dmgW1.map((d) => (d === null ? 0 : d));
const dmgG1Of = (A) => agg[A].dmgG1.map((d) => (d === null ? 0 : d));
const honQOf = (A) => agg[A].honQ;

// R1 CONTAINMENT per sensor arm
const R1 = {};
for (const B of B_ARMS) {
  const d = dmgW1Of(A1).map((x, i) => x - dmgW1Of(B)[i]); // >0 = sensor reduces damage
  const stst = signTestOneSided(d);
  const mD1 = mean(dmgW1Of(A1)), mDB = mean(dmgW1Of(B));
  const latTripped = agg[B].sensor.w1Trips.filter((x) => x.latency !== null).map((x) => x.latency);
  R1[B] = {
    damage_A1: armsAgg[A1].damageW1, damage_B: armsAgg[B].damageW1,
    pairedDelta_A1_minus_B: { mean: r6(mean(d)), se: r6(seOf(d)), sd: r6(sd(d)), n: d.length, perSeed: d.map((x) => r6(x)) },
    signTest_oneSided: stst,
    damageRatio_B_over_A1: r6(mDB / Math.max(1e-12, mD1)),
    tripLatency: latTripped.length ? stat(latTripped) : null,
    trippedSeeds: agg[B].sensor.w1Trips.filter((x) => x.nPostFlip > 0).length,
    verdict: (mean(d) > 0 && stst.p < 0.05) ? 'PASS' : 'FAIL',
  };
}

// R2 CANARIES per sensor arm
const R2 = { perSensor: {} };
for (const B of B_ARMS) {
  // (a) honestFinalQ vs A4 (live check: sensor arms move trust) + incremental vs A1
  const lossVsA4 = honQOf(A4).map((q, i) => q - honQOf(B)[i]);
  const incrVsA1 = honQOf(A1).map((q, i) => q - honQOf(B)[i]);
  const seA4 = seOf(lossVsA4), seIncr = seOf(incrVsA1);
  const honQPass = Math.abs(mean(lossVsA4)) <= seA4;
  // (b) h2 admitted everywhere + ZERO defense trips on h2
  const nativeH2 = armsAgg[B].h2Admission;
  const h2Trips = armsAgg[B].sensorTelemetry.h2TripTotal;
  const h2Pass = nativeH2.admAdmitted_n === SEEDS && h2Trips === 0;
  // (c) g1 regression canary
  const g1d = dmgG1Of(B).map((x, i) => x - dmgG1Of(A1)[i]); // >0 = g1 worse under sensor
  const g1Pass = mean(g1d) <= seOf(g1d);
  // (d) false-trip budget on honest founders
  const ft = armsAgg[B].sensorTelemetry.founderTripTotal;
  const ftRate = armsAgg[B].sensorTelemetry.founderTripRatePer200r;
  const ftPass = ftRate <= 1.0;
  R2.perSensor[B] = {
    honQ: {
      mean_B: armsAgg[B].honQFinal, mean_A4: armsAgg[A4].honQFinal, mean_A1: armsAgg[A1].honQFinal,
      diff_vs_A4: { mean: r6(mean(lossVsA4)), se: r6(seA4), pass_1SE: honQPass },
      incremental_vs_A1: { mean: r6(mean(incrVsA1)), se: r6(seIncr) },
      trustMoved_maxPerSeed: r6(Math.max(...honQOf(B).map((q, i) => Math.abs(q - honQOf(A1)[i])))),
    },
    h2: { admitted_n: nativeH2.admAdmitted_n, of: SEEDS, tAdmExp: nativeH2.tAdmExp, defenseTrips: h2Trips, pass: h2Pass },
    g1: { damage_B: armsAgg[B].damageG1, damage_A1: armsAgg[A1].damageG1, pairedDelta_B_minus_A1: { mean: r6(mean(g1d)), se: r6(seOf(g1d)) }, pass: g1Pass },
    falseTrips: { total: ft, ratePer200r: ftRate, budget: 1.0, perVoice: armsAgg[B].sensorTelemetry.founderTripPerVoice, pass: ftPass },
    verdict: honQPass && h2Pass && g1Pass && ftPass ? 'PASS' : 'FAIL',
  };
}

// R3 RECOVERY (E37 verbatim rule) — computed per receipted rule
function r3Of(A) {
  const evs = agg[A].decayEvents.filter((e) => HONEST.includes(e.id));
  const full = evs.filter((e) => e.decayT <= T - 1 - REPROB.horizon);
  const recovered = full.filter((e) => e.recoveredAt !== null);
  return {
    verdict: full.every((e) => e.recoveredAt !== null) ? 'PASS' : (full.length === 0 ? 'VACUOUS-PASS' : 'FAIL'),
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
    perEvent: evs.map((e) => ({ seed: e.seed, id: e.id, decayT: e.decayT, kind: e.kind, pre: e.pre, post: e.post, minShare: e.minShare, recoveredIn: e.recoveredIn, path: e.path })),
  };
}
const R3 = Object.fromEntries(B_ARMS.map((B) => [B, r3Of(B)]));

// R4 SENSOR OPERATING CURVE per h (probe coverage for all h; matrix coverage for picked h + chi)
function sensorRowFor(h) {
  const isPicked = h === HSTAR, isChi = h === CUSUM.chiH;
  const arm = isPicked ? ARM_C4 : (isChi && !ALIASED ? ARM_CHI : null);
  const rowsOut = [];
  // probe seed 0 (always available for this h)
  const R0 = probe[`h${h}`];
  rowsOut.push({ source: 'probe', seed: 0, flip: R0.w1Trip.flip, ...R0.w1Trip, founderTrips: founderTripCount(R0), h2Trips: h2TripCount(R0) });
  // matrix coverage
  if (arm) {
    for (const x of agg[arm].sensor.w1Trips.filter((x) => x.seed > 0)) {
      rowsOut.push({ source: 'matrix', seed: x.seed, flip: x.flip, ...x, founderTrips: null, h2Trips: null });
    }
  }
  const tripped = rowsOut.filter((x) => x.nPostFlip > 0);
  const lat = tripped.map((x) => x.latency);
  const fTrips = arm ? armsAgg[arm].sensorTelemetry.founderTripTotal : rowsOut.reduce((a, x) => a + (x.founderTrips ?? 0), 0);
  const h2TripsSum = arm ? armsAgg[arm].sensorTelemetry.h2TripTotal : rowsOut.reduce((a, x) => a + (x.h2Trips ?? 0), 0);
  return {
    h, coverage: arm ? `probe seed 0 + matrix arm ${arm} (seeds 0..${SEEDS - 1})` : 'probe seed 0 only (not carried to the matrix)',
    nSeeds: rowsOut.length,
    perSeed: rowsOut.map((x) => ({ seed: x.seed, source: x.source, trippedPostFlip: x.nPostFlip > 0, latency: x.latency, preFlipTrips: x.nPreFlip, postFlipTrips: x.nPostFlip, founderTrips: x.founderTrips, h2Trips: x.h2Trips })),
    latency: lat.length ? stat(lat) : null,
    trippedN: tripped.length, untrippedN: rowsOut.length - tripped.length,
    founderTripsTotal: fTrips, founderTripRatePer200r: r6(fTrips / ((arm ? SEEDS : 1) * T / 200)),
    h2TripsTotal: h2TripsSum,
  };
}
const R4 = {
  sweep: CUSUM.hSweep.map(sensorRowFor),
  headline: null, // computed after the matrix aggregates exist (below)
};
{
  const C4row = R4.sweep.find((x) => x.h === HSTAR);
  const lat = C4row.latency;
  R4.headline = {
    question: 'does CUSUM see the flip (latency < 30 rounds in most seeds), and at what false-alarm price?',
    seesFlip: C4row.trippedN >= Math.ceil(C4row.nSeeds / 2) && lat !== null && lat.mean < 30,
    latency: lat, trippedN: C4row.trippedN, of: C4row.nSeeds,
    falseAlarmPrice: { founderTripsMatrix: armsAgg[ARM_C4].sensorTelemetry.founderTripTotal, ratePer200r: armsAgg[ARM_C4].sensorTelemetry.founderTripRatePer200r, h2Trips: armsAgg[ARM_C4].sensorTelemetry.h2TripTotal },
  };
}

// R4 sleeper record (per arm) — trust path shape COMPUTED from the curves (E37 verbatim shape logic)
function w1Shape(decayEvs, curve) {
  if (!decayEvs.length) return 'no trips -> no decay events; trust path = E35/E37 shape (monotone earn through probation to flip, post-flip decline)';
  const parts = [];
  for (const ev of decayEvs) {
    const drop = ev.pre > 0 ? 1 - ev.post / ev.pre : 0;
    let peak = ev.post, peakAt = 0;
    for (let dt = 1; dt <= 60; dt++) {
      const idx = ev.decayT + dt - JOIN;
      if (idx < 0 || idx >= curve.length) break;
      if (curve[idx] > peak) { peak = curve[idx]; peakAt = dt; }
    }
    const slope = peakAt > 0 ? (peak - ev.post) / peakAt : 0;
    parts.push(`${ev.kind}@${ev.decayT}: ${ev.pre}->${ev.post} (-${(100 * drop).toFixed(1)}%), re-earn +${slope.toExponential(2)}/rd to peak ${r6(peak)} @+${peakAt}rd`);
  }
  return parts.join(' | ');
}
const R4sleeper = {};
for (const A of ARMS) {
  const AA = armsAgg[A];
  const decayW1 = (AA.decayEvents ?? []).filter((e) => e.id === SLEEP);
  const shapes = {};
  for (const [seed, curve] of Object.entries(agg[A].w1Curves)) {
    shapes[seed] = w1Shape(decayW1.filter((e) => e.seed === Number(seed)), curve);
  }
  const drops = decayW1.map((e) => (e.pre > 0 ? 1 - e.post / e.pre : 0));
  R4sleeper[A] = {
    admAdmission: AA.w1Admission,
    flipRound: 't_adm + 25 (per-seed, pass-1 anchored)',
    shareInWindow: AA.shareW1,
    attTrustAtFlip: AA.attTrustAtFlip,
    convictionRoundByTrust: AA.attConvRoundByTrust,
    sensorTrips: AA.sensorTelemetry ? AA.sensorTelemetry.w1TripsPerSeed : null,
    decayEvents: decayW1.map((e) => ({ seed: e.seed, tripT: e.tripT, decayT: e.decayT, kind: e.kind, pre: e.pre, post: e.post, recoveredIn: e.recoveredIn })),
    decayDropPct: drops.length ? stat(drops.map((d) => 100 * d)) : null,
    trustPathShapes: shapes,
  };
}

// ---------------- verdict — mechanism analysis COMPUTED from telemetry ----------------
const anyR1Pass = B_ARMS.some((B) => R1[B].verdict === 'PASS');
const C4_OK = R1[ARM_C4].verdict === 'PASS' && R2.perSensor[ARM_C4].verdict === 'PASS'
  && (R3[ARM_C4].verdict === 'PASS' || R3[ARM_C4].verdict === 'VACUOUS-PASS');
const CROWN = C4_OK
  ? {
      crowned: ARM_C4, damageRatio: R1[ARM_C4].damageRatio_B_over_A1,
      latency: R1[ARM_C4].tripLatency, rule: 'C4 passes R1 + R2 + R3 (receipted crown rule)',
    }
  : null;

// --- C4 mechanism (computed) — per-seed S_i(t) trajectory summaries around t_flip ---
const mech = { perSeed: [] };
{
  const arm = agg[ARM_C4];
  for (const tr of arm.sensor.w1Trips) {
    const seed = tr.seed, flip = tr.flip;
    const path = arm.w1Paths[seed] ?? [];
    const pre = path.filter((x) => x.t < flip);
    const post = path.filter((x) => x.t >= flip && x.t < flip + DW);
    const preS = pre.length ? pre[pre.length - 1].S : 0;
    const maxPostS = post.length ? Math.max(...post.map((x) => x.S)) : null;
    const meanZpost = post.length ? mean(post.map((x) => x.z)) : null;
    const meanRpost = post.length ? mean(post.map((x) => x.r)) : null;
    const per = arm.sensor.per[seed]?.[SLEEP] ?? {};
    mech.perSeed.push({
      seed, flip, tripped: tr.nPostFlip > 0, latency: tr.latency, nTrips: tr.nTrips,
      preFlipS: preS, maxPostFlipS: maxPostS, h: HSTAR,
      plateauBelowH: !tr.nPostFlip && maxPostS !== null && maxPostS <= HSTAR,
      meanZpost: meanZpost === null ? null : r6(meanZpost),
      driftRate: meanZpost === null ? null : r6(meanZpost - CUSUM.drift),
      meanRpost: meanRpost === null ? null : r6(meanRpost),
      mu: per.mu ?? null, sigma: per.sigma ?? null, baseSrc: per.baseSrc ?? null,
      sigmaGap: (meanRpost !== null && per.mu != null) ? r6(meanRpost - per.mu) : null,
      suppressed: per.suppressedCrossings ?? 0,
    });
  }
  const tripSeeds = mech.perSeed.filter((x) => x.tripped);
  const noTrip = mech.perSeed.filter((x) => !x.tripped);
  const plateau = noTrip.filter((x) => x.plateauBelowH);
  const sigmaWide = noTrip.filter((x) => x.sigma !== null && x.meanZpost !== null && x.meanZpost - CUSUM.drift <= 0);
  const dDelta = dmgW1Of(A1).map((x, i) => x - dmgW1Of(ARM_C4)[i]);
  const decaysW1 = agg[ARM_C4].decayEvents.filter((e) => e.id === SLEEP);
  const ftTotal = armsAgg[ARM_C4].sensorTelemetry.founderTripTotal;
  const ftSeeds = new Set(agg[ARM_C4].sensor.founderTrips.map((e) => e.seed)).size;
  const MECH_C4 = `CUSUM(h=${HSTAR}) trips on the sleeper post-flip in ${tripSeeds.length}/${SEEDS} seeds${tripSeeds.length ? ` (latency ${stat(tripSeeds.map((x) => x.latency)).mean}rd mean; per-seed preFlipS ${tripSeeds.map((x) => x.preFlipS).join('/')}, maxPostFlipS ${tripSeeds.map((x) => x.maxPostFlipS).join('/')})` : ''}`
    + `${noTrip.length ? `; NO-TRIP seeds ${noTrip.map((x) => `s${x.seed}`).join(',')}: maxPostFlipS ${noTrip.map((x) => x.maxPostFlipS).join('/')} vs h=${HSTAR} — ${plateau.length === noTrip.length ? `the statistic accumulated and PLATEAUED below h (mean z post-flip ${noTrip.map((x) => x.meanZpost).join('/')}, drift rate ${noTrip.map((x) => x.driftRate).join('/')}/rd — ${noTrip.every((x) => x.driftRate > 0) ? 'signal present but too slow to clear h inside the 150-round window' : 'no consistent net drift above the 0.5 threshold'})` : 'statistic suppressed or reset by pre-flip trips'}` : ''}`
    + `; sigma receipt: baseline (mu, sigma) per seed ${mech.perSeed.map((x) => `s${x.seed}(${x.mu}/${x.sigma}${x.baseSrc ? ',' + x.baseSrc : ''})`).join(' ')} — post-flip residual mean shift ${mech.perSeed.map((x) => x.sigmaGap).join('/')} in sigma units ${mech.perSeed.map((x) => (x.sigma > 0 ? r6(x.sigmaGap / x.sigma) : null)).join('/')}`
    + `${sigmaWide.length ? `; seeds where the post-flip DRIFT RATE <= 0 (z mean below the 0.5 threshold — sigma calibration ate the signal): ${sigmaWide.map((x) => `s${x.seed}`).join(',') || 'none'}` : ''}`
    + `; damage delta vs A1 per seed [${dDelta.map((x) => (x >= 0 ? '+' : '') + r6(x)).join(', ')}] (trip seeds ${tripSeeds.map((x) => `s${x.seed}`).join(',') || 'n/a'})`
    + `; w1 decay events ${decaysW1.length} (${decaysW1.filter((e) => e.kind === 'rethrow').length} retrips; pre->post x${REPROB.frac})`
    + `; founder false trips ${ftTotal} in ${ftSeeds}/${SEEDS} seeds (rate ${armsAgg[ARM_C4].sensorTelemetry.founderTripRatePer200r}/200r vs budget 1.0)`;
  var MECH = MECH_C4;
  if (!ALIASED) {
    const chiTripSeeds = agg[ARM_CHI].sensor.w1Trips.filter((x) => x.nPostFlip > 0);
    const chiFt = armsAgg[ARM_CHI].sensorTelemetry.founderTripTotal;
    var MECH_CHI = `conservative sibling CUSUM(h=8): trips ${chiTripSeeds.length}/${SEEDS} seeds (latency ${chiTripSeeds.length ? stat(chiTripSeeds.map((x) => x.latency)).mean : 'n/a'}rd), founder false trips ${chiFt} (rate ${armsAgg[ARM_CHI].sensorTelemetry.founderTripRatePer200r}/200r) — the sensitivity trade measured against C4(h=${HSTAR})`;
  }
}

const VERDICT = {
  crowned: CROWN ? CROWN.crowned : 'NONE',
  verdict: CROWN
    ? `CROWNED ${CROWN.crowned} (damage ratio ${CROWN.damageRatio}, mean trip latency ${CROWN.latency ? CROWN.latency.mean : 'n/a'}rd)`
    : `NO-CROWN: C4 fails ${[R1[ARM_C4].verdict === 'PASS' ? null : 'R1', R2.perSensor[ARM_C4].verdict === 'PASS' ? null : 'R2', (R3[ARM_C4].verdict === 'PASS' || R3[ARM_C4].verdict === 'VACUOUS-PASS') ? null : 'R3'].filter(Boolean).join('+')} — negative verdict, mechanism computed from telemetry`,
  crownDetail: CROWN,
  chiStatus: ALIASED ? 'aliased to C4 (h* = 8)' : { R1: R1[ARM_CHI].verdict, R2: R2.perSensor[ARM_CHI].verdict, R3: R3[ARM_CHI].verdict, note: 'conservative sibling receipted alongside; the crown rides on C4 per the receipted rule' },
  mechanism: ALIASED ? { C4: MECH } : { C4: MECH, Chi: MECH_CHI },
  structuralFindings: [
    `sensor operating curve: ${R4.sweep.map((x) => `h=${x.h} tripped ${x.trippedN}/${x.nSeeds} (latency ${x.latency ? x.latency.mean : 'n/a'}rd${x.latency ? `±${x.latency.sd}` : ''})`).join('; ')} — headline: ${R4.headline.seesFlip ? `CUSUM SEES the flip (${R4.headline.trippedN}/${R4.headline.of} seeds, mean latency ${R4.headline.latency.mean}rd < 30)` : `CUSUM does NOT reliably see the flip (${R4.headline.trippedN}/${R4.headline.of} seeds${R4.headline.latency ? `, mean latency ${R4.headline.latency.mean}rd` : ''})`} at false-alarm price ${R4.headline.falseAlarmPrice.founderTripsMatrix} founder trips (${R4.headline.falseAlarmPrice.ratePer200r}/200r) + ${R4.headline.falseAlarmPrice.h2Trips} h2 trips`,
    `recovery receipt (R3): ${B_ARMS.map((A) => `${A}: ${R3[A].vacuous ? 'no founder trips (vacuous)' : `${R3[A].recoveredN}/${R3[A].withFullHorizon} founder decay events recovered to >=95% of pre-trip share within 100 rounds${R3[A].recoveredIn ? ` (mean ${R3[A].recoveredIn.mean}rd; E37 baseline 23/25 mean 19.1r)` : ''}`}`).join('; ')} — the supervised reward stream (r = 1-|p-s|, pool-independent) keeps trust re-earning defense-proof`,
  ],
};

book('finding.R1', { rule: 'R1 CONTAINMENT — D(C4) < D(A1), paired one-sided sign test (zeros excluded) p<0.05; delta±SE + damage ratio; C-hi alongside', perArm: R1, anyPass: anyR1Pass });
book('finding.R2', { rule: 'R2 CANARIES — (a) honQ within 1 SE of A4, (b) h2 admitted all seeds with NO defense trips, (c) g1 not worsened vs A1 +1 SE, (d) founder false-trip budget <= 1.0 per 200 rounds arm-wide', perSensor: R2.perSensor });
book('finding.R3', { rule: 'R3 RECOVERY — false-tripped founders re-earn to >=95% of pre-trip share within 100 rounds (E37 baseline 23/25, mean 19.1r)', perArm: R3 });
book('finding.R4', { rule: 'R4 SENSOR OPERATING CURVE — per h: latency, per-seed trip/no-trip, false trips on honest voices', curve: R4, sleeper: R4sleeper });
book('finding.verdict', { ...VERDICT, c4_ok: C4_OK, mechanismPerSeed: mech.perSeed });
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
  task: 'E38', name: 'the sensor (CUSUM change-point detection composed with trust re-probation vs the E35 sleeper)',
  seeds: SEEDS, T, voices: V, kStarCarried: KSTAR, arms: ARMS, hStar: HSTAR, aliased: ALIASED,
  runtime_s: { probeBlock: +(probeMs / 1000).toFixed(1), matrix: elapsedMatrix, total: +((Date.now() - t0) / 1000).toFixed(1) },
  config: {
    world: { FLIP_P, REROLL_P, N, TOX_Q, JOIN }, damageWindow: DW, pre: PRE, g1Window: G1_WIN,
    hedge: CFG, admission: ADM, cusum: CUSUM, reprob: REPROB, roster: ALL_IDS,
    deviations: ['g1 ACTIVE in all attack arms (E36 deviation carried — same-arm regression-canary baseline)', 'k* = 25 carried from E35 (no re-search)', 'probe block doubles as matrix seed 0 (no re-run)', 'CusumGuard = FlipGuard plumbing + E38 CUSUM statistic; TrustReprobation E37-verbatim', 'fresh e38:* world draws (generator verbatim)'],
  },
  hpick: { sweepTable, picked: HSTAR, relaxed: pick.relaxed, aliased: ALIASED },
  arms: armsAgg,
  claims: { R1, R2, R3, R4, R4sleeper, verdict: VERDICT },
  perSeed: seedRows,
  chain: { rows: rows.length, tip, verified: vfy.ok },
};
writeFileSync('experiments/outputs/e38_summary.json', JSON.stringify(summary, null, 1));
writeFileSync('experiments/outputs/receipts_e38.jsonl', rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
// file re-verify (E35 discipline: the chain must verify FROM THE WRITTEN FILE)
const reread = readFileSync('experiments/outputs/receipts_e38.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const vfyFile = verifyChain(reread);
console.log(`file re-verify: ${vfyFile.ok ? 'OK' : 'FAILED'} (${reread.length} rows)`);
if (!vfyFile.ok) { console.error('FILE CHAIN VERIFY FAILED', vfyFile); process.exit(1); }

for (const B of B_ARMS) console.log(`R1 ${B}: ${R1[B].verdict} ratio(B/A1)=${R1[B].damageRatio_B_over_A1} delta=${R1[B].pairedDelta_A1_minus_B.mean}±${R1[B].pairedDelta_A1_minus_B.se} p=${R1[B].signTest_oneSided.p} latency=${R1[B].tripLatency ? R1[B].tripLatency.mean : 'n/a'}rd trips=${R1[B].trippedSeeds}/${SEEDS}`);
for (const B of B_ARMS) { const e = R2.perSensor[B]; console.log(`R2 ${B}: ${e.verdict} honQ(${e.honQ.diff_vs_A4.pass_1SE ? 'pass' : 'FAIL'} ${e.honQ.diff_vs_A4.mean}±${e.honQ.diff_vs_A4.se}) h2(${e.h2.pass ? 'pass' : 'FAIL'} ${e.h2.admitted_n}/${SEEDS} trips=${e.h2.defenseTrips}) g1(${e.g1.pass ? 'pass' : 'FAIL'} ${e.g1.pairedDelta_B_minus_A1.mean}) ft(${e.falseTrips.pass ? 'pass' : 'FAIL'} ${e.falseTrips.total}=${e.falseTrips.ratePer200r}/200r)`); }
for (const B of B_ARMS) console.log(`R3 ${B}: ${R3[B].verdict}${R3[B].vacuous ? ' (no founder trips)' : ` (${R3[B].recoveredN ?? 0}/${R3[B].withFullHorizon} recovered${R3[B].recoveredIn ? `, mean ${R3[B].recoveredIn.mean}rd` : ''})`}`);
console.log(`R4 curve: ${R4.sweep.map((x) => `h=${x.h}:${x.trippedN}/${x.nSeeds}@${x.latency ? x.latency.mean : 'n/a'}rd`).join(' ')} | seesFlip=${R4.headline.seesFlip}`);
console.log(`CROWN: ${VERDICT.crowned}  (${VERDICT.verdict})`);
console.log(vault.liveJobs === 0 ? 'E38 DONE' : 'E38 PROBLEM (live jobs)');
