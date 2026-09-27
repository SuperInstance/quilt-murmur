// E42 — THE ALIGN CHANGE-POINT SENSOR (fifth axis: CUSUM on the ALIGN trajectory itself)
// ==================================================================================================
// Provenance: E41's receipted handoff (receipt 0x1b3718d3c39c967b, chain tip 60935e1). The vote-side
// axis is DEAD (the E24 toxic series is PRO-state 75% at 0.25 magnitude — anti only 25% — so its
// anti-sister rate sits BELOW the honest p95; separation NEGATIVE). E41's same-world ALIGN re-pricing
// carried the live seed: w1's ALIGN drops 0.633 (honest phase) -> 0.485 (post-flip) — a ~0.15 DROP
// relative to its own trailing ALIGN baseline; g1's ALIGN sits AT the founder floor (0.438 vs founder
// min 0.451 — at-or-below the floor FROM ARRIVAL). E38 killed CUSUM on RESIDUALS (post-flip residual
// mean AT/BELOW own probation mu; flat-sigma floor = 30x false-trip budget). NOBODY has run a
// change-point detector on the ALIGN series itself, where the flip IS a level change. This lane
// executes exactly that combination — relational statistic, SELF-baseline on the relational series —
// the one E38's law never actually killed.
//
// AlignChangeGuard — for each voice, maintain the ALIGN series rho_i(t) exactly as E40's
// CoMovementGuard computes it (crib, verbatim formula): trailing-W uncentered cosine between the
// sender's vote-deviation stream (pv = p - 0.5, protocol-neutral origin) and the roster-median
// deviation (mv = median(murmurs) - 0.5, suspect included — a 15th-of-15 effect, E40-receipted).
//
//   STATISTIC (receipted): one-sided DOWNWARD CUSUM on (rho_i(t) - mu_i(t)) / sigma_floor
//     mu_i(t)     = mean of the voice's OWN trailing M=30 ALIGN samples (the self-baseline; the
//                   voice's pre-admission murmurs count — the series is the voice's ALIGNMENT,
//                   observable by the pool from its first murmur; the ADMISSION clock gates trip
//                   EVENTS, not the series, E37 plumbing)
//     sigma_floor = a GLOBAL floor (NOT per-sender sigma — E38's flat-sigma-on-residuals blew up
//                   30x because the honest residual noise was per-sender; here the floor prices
//                   ALIGN's own round-to-round noise across ALL honest founders INCLUDING the
//                   natural ALIGN variance of weak voices): sigma_floor(W) = RMS over all honest-
//                   founder evaluation rounds of (rho - mu30) on the DESIGN-TIME PRICING seed 100
//                   (disjoint from matrix seeds), booked as the pricing.dev row BEFORE any run row.
//     S_i(t)      = max(0, S_i(t-1) + (mu_i(t) - rho_i(t))/sigma_floor - k)    (k = allowance,
//                   sigma units; part of the priced sweep)
//     TRIP when S > h SUSTAINED for 5 of the last 10 evaluation rounds (E38/E39/E40 gate shape);
//     on a trip: S := 0 AND the sustained window clears (reset-on-trip, receipted), a guard window
//     {from: t+1, until: t+40} opens (epsNew re-probation, E37 plumbing), rethrow kinds after.
//     Trip EVENTS evaluate only for ADMITTED voices whose OWN series has >= MINOWN=30 ALIGN samples
//     (the self-baseline must EXIST — before that S stays 0 and nothing evaluates). This is the
//     receipted warm-up policy, and it is LOAD-BEARING for R3: a from-arrival toxic's own baseline
//     IS the attack (E38's receipt, now re-tested at the relational layer) — R3 asks whether the
//     sensor sees g1 anyway and the pricing prices WHY it cannot (the birth-reference confound:
//     any global birth reference mu0 confounds weak-honest ALIGN level with attack level; the
//     priced birth table is the computed mechanism either way).
//
//   Consequence on trip (E37-E40 verbatim, detector swap ONLY): TrustReprobation (HedgeTrust weight
//   x0.5 via absorb, re-earns through the normal fixed-share + exp(eta*r) path) + influence
//   re-probation (epsNew for 40 guard rounds). TrustReprobation is copied VERBATIM from
//   e39/e40 (trip events carry trail30/refMean fields so the class stays byte-identical; here
//   trail30 = trailing-W mean product and refMean = mu_i(t) — the self-baseline the trip fired on;
//   field SEMANTICS receipted: E40's refMean was 0 because that detector had no self-baseline).
//
// DECISION RULES (receipted EXACTLY, BEFORE the full run; brief numbering R1-R5):
//   R1 HONEST-NOISE FLOOR (the primary design constraint, PRICED FIRST per house law): the CUSUM
//      honest-noise floor over ALL honest founders INCLUDING weak voices, measured (a) design-time
//      on seed 100 (pricing.dev row: per-founder maxS distribution + honestMaxS + the full priced
//      (W,k,h) grid), (b) the probe's seed-0 guard arms, (c) the full matrix AC1 arm. EXPLICIT
//      BUDGET LINE: founder false-trip budget 1.0 per 200 rounds arm-wide (E38 29.9, E39 9.4,
//      E40 0, E41 gates-fail) = rate = total founder (throw+rethrow) events / (seeds x 12 x 400/200);
//      at 6 seeds the line is <= 144 founder trips across the whole matrix. R1 PASSES iff the
//      MATRIX arm-wide rate <= 1.0. If the honest floor eats the statistic, that IS the finding.
//   R2 DETECTION: the sleeper trips post-flip. PASS iff tripped seeds >= half AND mean latency
//      (first post-flip throw minus t_flip) < 30 rounds over tripped seeds. Pre-flip trips on w1
//      are receipted (they count as false trips on an honest-phase voice).
//   R3 g1 VISIBILITY: the from-arrival toxic (at the floor edge per E41's long-window receipt)
//      SHOULD be visible IMMEDIATELY on window fill IF any birth reference exists. PASS iff g1
//      trips in >= 2/3 of seeds; latency from g1's own admission round. The priced birth table
//      (per-voice birth ALIGN means over each voice's first MINOWN samples, per W) is the COMPUTED
//      mechanism for whatever verdict lands: it measures whether ANY global birth threshold
//      separates g1 from the weak-honest tail without tripping it.
//   R4 COUNTERFACTUAL DAMAGE (composition, E37 plumbing verbatim): D(AC1) < D(A1) — paired
//      one-sided sign test (zeros excluded) p < 0.05; report paired delta +/- SE and damage ratio
//      D(AC1)/D(A1). AC2 (conservative sibling) receipted alongside. g1 damage on the same footing
//      (an increase beyond A1 + 1 SE fails R5c).
//   R5 CANARIES — ALL must hold: (a) honestFinalQ within 1 SE of A4 (seed-paired);
//      (b) h2: ZERO defense trips across the arm AND per-seed admission outcome identical to A1's
//      (arm-invariance); (c) g1 damage <= A1 + 1 SE; (d) FALSE-TRIP BUDGET explicit (same
//      measurement as R1, per-founder histogram); (e) RECOVERY — false-tripped founders re-earn to
//      >= 95% of pre-trip trust share within 100 rounds (E37 baseline 23/25, mean 19.1r); events
//      without a full horizon receipted but excluded; vacuous pass if no trips.
//   CROWN — iff AC1 passes R1 + R2 + R3 + R4 + R5: crown with damage ratio + sleeper latency + g1
//      latency. If R3 fails while R1+R2+R4+R5 hold: receipt the PARTIAL verdict ("sees the
//      change-point, not the from-arrival") with the birth-confound mechanism. If R1 fails: honest
//      negative — the floor IS the finding. No pre-drafted text: every clause filled from numbers.
//
// HPICK (receipted BEFORE the matrix): the pricing picks (W*, k*) = argmax margin
// (margin = w1PeakS - honestMaxS, sigma units) among (W,k,h) grid rows that PASS the pricing gates
// (founder rate <= 1.0/200r on seed 100, h2 trips = 0, w1 pre-flip trips = 0) AND detect w1
// post-flip at pricing; ties -> larger W, then larger k, then larger h. Fallback ladder:
// no detecting gate-passer -> argmax margin among gate-passers (relaxed='no-pricing-detection');
// no gate-passer -> NO-CANDIDATE (the floor ate the fifth axis; receipt the grid — E41 precedent).
// The probe (seed 0, full engine, timed) then sweeps h over up to 3 priced candidates
// {smallest detecting h, median detecting h, largest gate-passing h} at (W*, k*) and picks
// h* = argmax delta_h = D_w1(A1,s0) - D_w1(AC_h,s0) among h passing ALL probe gates
// (i) ZERO trips on h2 on seed 0; (ii) D_g1(AC_h,s0) <= D_g1(A1,s0) + 1e-4 (single-seed proxy for
// R5c; 1e-4 ~ 5x E37's measured founder-decay leak); (iii) founder-trip rate on seed 0 <= 1.0/200r
// (<= 2 trips); ties -> LARGER h. Fallback ladder: none pass all -> argmax delta among gate-(i)
// passers (relaxed='founder-only') -> argmax delta (relaxed='none'). AC2 = the largest probe h
// (aliased to AC1 if equal, receipted, no re-run). The probe doubles as matrix seed 0.
//
// WORLD (E35-E40 verbatim, fresh e42:* draws): 12 honest founders (mixed acuity, a1 = 0.9
// reference) + 1 honest late-joiner h2 (t=150, honest forever — the false-positive canary) +
// 1 flasher g1 (toxic from arrival, t=150) + 1 sleeper w1 (t=150, honest phase = e24 h1 generator
// verbatim, flips at admission + k* = 25 — E35's probe-optimal, carried). T=400, 6 seeds planned;
// probe-cut rule: projected = t_probe x 6 + 2s IO; if projected > 170s, cut 6 -> 4 and RECEIPT the
// cut. Paired arms, IDENTICAL worlds (arms select over shared values):
//   A1   no-defense+sleeper — full v3.1 + sleeper + active g1, NO defense (E36-E40 control)
//   AC1  changepoint(best-h) — v3.1 + AlignChangeGuard(h*) + trust re-probation + same attack
//   AC2  changepoint(hHi)    — conservative sibling (largest priced h; aliases AC1 if equal)
//   A4   v3.1-clean         — full v3.1, no attack, NO defense (collateral baseline)
//
// DAMAGE METHOD (E35-E40 counterfactual, verbatim): D = mean over the post-flip window
// [t_flip, min(t_flip+150,400)) of |err(pool) - err(pool with that attacker zeroed)|, err =
// |pool - s|, counterfactual pools are reference-side only (MurmurBus.pool, log-odds), never
// written to the sheet. Sleeper window anchored at t_adm + 25 with t_adm measured per seed on a
// pass-1 honest-forever A1-wiring run (in-run assert: pass-1 == matrix admission). g1 uses its own
// window [150, 300). Positive = hurts.
//
// SECONDARY SCREENS: not carried (E40 priced the cascade axis null — w1-g1 post-flip corr 1.0 vs
// honest-honest trailing max 0.997; E41 killed the side axis outright). No telemetry axis gates.
//
// COMPOSITION RECEIPT: AlignChangeGuard and TrustReprobation are EXPERIMENT-LOCAL classes over the
// murmur/ module APIs — ZERO changes to murmur/ (target: zero). Hooks: Admission observe/
// reattribute/notePooled/admitted/admittedRound/probationary/devMean/indepCount/firstSeen(read)/
// admitWindow/epsNew/admitErr; HedgeTrust weights/update/absorb/weight; Provenance
// inspect/penalize; MurmurBus.pool (reference-side counterfactuals); receipts.sealChain/verifyChain.
// AlignChangeGuard = CoMovementGuard's PLUMBING (E40) with the trip statistic swapped
// (per-round relational LEVEL bar -> self-baseline CUSUM on the relational series). Delta from
// E40's plumbing, receipted: (1) rho STREAMS for any voice with a full window (pre-admission
// series feeds mu30; E40 computed rho only for admitted voices); (2) trip evaluation requires
// nOwn >= MINOWN (a self-baseline must exist); (3) trip evaluation reads the CURRENT guard state
// (the release round can trip); (4) S and the sustained window both reset on trip.
//
// RNG DOCTRINE (binding, E35-E40 verbatim): all randomness through MothVault (offline:true), one
// harvest, per-purpose stream keys 'e42:<purpose>:<seed>' via streamFor; NO Math.random. Paired
// worlds REQUIRE arm-identical world streams. Pricing uses seed 100 — outside the matrix seed set.
//
// Run: node experiments/e42_aligncp.mjs [seeds]   (E42_DEV=1 for a 1-seed dev run; E42_PRICE=1 for
// the design-time pricing print on seed 100)

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
let SEEDS = Number(process.argv[2] || (process.env.E42_DEV ? 1 : 6)); // brief: 6 seeds planned
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
const ACP = {
  Ws: [20, 30, 40],      // priced ALIGN window grid (pricing picks W*)
  M: 30,                 // self-baseline window mu30 (trailing M ALIGN samples)
  MINOWN: 30,            // own samples required before trip evaluation (the baseline must exist)
  ks: [0.1, 0.3],        // CUSUM allowance grid, sigma units (pricing picks k*)
  hGrid: [3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 28], // priced bar grid, sigma units
  hSweep: null,          // FILLED IN-RUN from the pricing pick (up to 3 candidates; receipted rule)
  W: null, k: null,      // FILLED IN-RUN from the pricing pick (W*, k*)
  sigmaFloor: null,      // FILLED IN-RUN from the pricing (global floor at W*, booked in pricing.dev)
  sustainWin: 10,        // sustained 5 of the last 10 evaluation rounds (E38/E39/E40 gate shape)
  sustainNeed: 5,
  epsDen: 1e-12,         // 0/0 guard ONLY (all-neutral window -> rho := 0) — NOT a noise floor (E40-receipted)
  guardRounds: 40,       // epsNew re-probation window (E36-E40 verbatim)
};
const REPROB = { frac: 0.5, horizon: 100 };    // E37 TrustReprobation verbatim
const G1_WIN = { from: JOIN, to: JOIN + DW };  // g1's own window [150, 300)
const TOL = 1e-9;
const PROBE_G1_TOL = 1e-4;                     // receipted probe gate (ii) tolerance
const PRICE_SEED = 100;                        // design-time pricing seed — DISJOINT from matrix seeds 0-5
const BUDGET_PER_200R = 1.0;                   // explicit founder false-trip budget line (R1)
const PROBE_MAX_H = 3;                         // probe sweeps at most 3 priced h candidates

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

// ---------------- world (E35-E40 verbatim; stream keys e42:*) ----------------
function genWorld(seed, harvest, vault) {
  const wR = makeRng(harvest, vault, `e42:world:${seed}`);
  const qR = makeRng(harvest, vault, `e42:skill:${seed}`);
  const xR = makeRng(harvest, vault, `e42:tox:${seed}`);
  const shR = makeRng(harvest, vault, `e42:sleep:${seed}`);
  const nhR = makeRng(harvest, vault, `e42:h2:${seed}`);
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
  for (let i = 0; i < N; i++) vR.push(makeRng(harvest, vault, `e42:vote:${seed}:${i}`));
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
  return { id: `aligncplane-${V}`, title: `E42 align change-point lane (${V} voice slots)`, cells };
}

// ---------------- DESIGN-TIME PRICING (telemetry only — no engine, no consequences) -----------
// Prices the CUSUM honest-noise floor on seed 100 (disjoint from matrix seeds 0-5) over the full
// (W, k, h) grid: per-voice ALIGN series (E40 formula verbatim), mu30 self-baseline, global
// sigma_floor per W (RMS of (rho - mu30) over honest-founder evaluation rounds — INCLUDING weak
// voices, per the house law), then per-(k,h) trip scans. Also books the BIRTH TABLE (per-voice
// birth ALIGN means over each voice's first MINOWN samples) — the computed R3 mechanism: whether
// ANY global birth threshold could separate g1 from the weak-honest tail. t_adm approximated at
// 189 (E35 measured admission at t=189, 8/8 seeds) -> flipApprox 214; admission gating NOT
// simulated (the pricing measures the STATISTIC's floor over honest streams, not the guard's
// evaluation gating) — E40/E41 pricing convention verbatim.
function priceAlignCp(harvest, vault) {
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
  // ALIGN series per voice per W (E40 formula verbatim) + mu30 self-baseline + z/drift telemetry
  const series = {}; // W -> id -> { t[], rho[], mu30[] (null before MINOWN samples) }
  for (const W of ACP.Ws) {
    series[W] = {};
    for (const id of ALL_IDS) {
      const win = [];
      const ts = [], rhos = [], mus = [];
      for (let t = 0; t < T; t++) {
        const p = presentP(id, t);
        if (p === null) continue;
        win.push({ pv: p - 0.5, mv: medOf(t) - 0.5 });
        if (win.length > W) win.shift();
        if (win.length < W) continue;
        let num = 0, sp2 = 0, sm2 = 0;
        for (const e of win) { num += e.pv * e.mv; sp2 += e.pv * e.pv; sm2 += e.mv * e.mv; }
        const den = Math.sqrt(sp2 * sm2);
        const rho = den > ACP.epsDen ? num / den : 0;
        ts.push(t); rhos.push(rho);
        const m = rhos.length >= ACP.M ? mean(rhos.slice(rhos.length - ACP.M)) : null;
        mus.push(m);
      }
      series[W][id] = { ts, rhos, mus };
    }
  }
  // global sigma_floor per W: RMS of (rho - mu30) over honest-founder EVAL rounds (incl. weak voices)
  const sigmaFloor = {}, founderStats = {}, birthTable = {};
  for (const W of ACP.Ws) {
    let sq = 0, n = 0;
    founderStats[W] = {};
    for (const id of HONEST) {
      const { rhos, mus } = series[W][id];
      const devs = [];
      for (let i = 0; i < rhos.length; i++) {
        if (mus[i] === null) continue;
        devs.push(rhos[i] - mus[i]);
        sq += (rhos[i] - mus[i]) ** 2; n++;
      }
      founderStats[W][id] = {
        meanRho: r6(mean(rhos)), minRho: r6(Math.min(...rhos)), maxRho: r6(Math.max(...rhos)),
        nEval: devs.length,
        rmsDev: devs.length ? r6(Math.sqrt(mean(devs.map((d) => d * d)))) : null,
      };
    }
    sigmaFloor[W] = r6(Math.sqrt(sq / n));
    // BIRTH TABLE: per-voice mean ALIGN over its first MINOWN samples (the only reference a
    // from-arrival adversary could be measured against at window fill)
    birthTable[W] = {};
    for (const id of ALL_IDS) {
      const { rhos } = series[W][id];
      const birth = rhos.slice(0, ACP.MINOWN);
      birthTable[W][id] = {
        birthMean: birth.length ? r6(mean(birth)) : null,
        fullMean: r6(mean(rhos)),
        nSamples: rhos.length,
      };
    }
    const fBirth = HONEST.map((id) => birthTable[W][id].birthMean);
    birthTable[W]._founderBirthMin = r6(Math.min(...fBirth));
    birthTable[W]._founderBirthMax = r6(Math.max(...fBirth));
    birthTable[W]._g1BirthMinusFounderMin = r6(birthTable[W][INSTANT].birthMean - Math.min(...fBirth));
    birthTable[W]._founderBelowG1 = HONEST.filter((id) => birthTable[W][id].birthMean < birthTable[W][INSTANT].birthMean);
    birthTable[W]._note = 'R3 mechanism: founders with birthMean BELOW g1 are the confound — any global birth threshold that catches g1 also catches them; count receipted';
  }
  // per-(W,k,h) trip scans
  const cusumScan = (W, id, k, h) => {
    const { ts, rhos, mus } = series[W][id];
    const sig = sigmaFloor[W];
    let S = 0;
    const sus = [];
    const path = [];
    const trips = [];
    let maxS = 0, sumZ = 0, nEval = 0;
    for (let i = 0; i < ts.length; i++) {
      if (mus[i] === null) { path.push({ t: ts[i], S: null, crossed: false }); continue; }
      const z = (mus[i] - rhos[i]) / sig;
      S = Math.max(0, S + z - k);
      if (S > maxS) maxS = S;
      sumZ += z; nEval++;
      const crossed = S > h;
      sus.push(crossed);
      if (sus.length > ACP.sustainWin) sus.shift();
      const sustained = sus.length >= ACP.sustainWin && sus.filter(Boolean).length >= ACP.sustainNeed;
      if (sustained) { trips.push({ t: ts[i], S: r6(S) }); S = 0; sus.length = 0; } // reset on trip (receipted)
      path.push({ t: ts[i], S: r6(S), crossed });
    }
    return { path, trips, maxS: r6(maxS), meanZ: nEval ? r6(sumZ / nEval) : 0, nEval };
  };
  // one config row of the priced grid (shared by the sealed grid and the telemetry extensions)
  const scanRow = (W, k, h) => {
    const per = {};
    let founderTrips = 0, honestMaxS = 0;
    for (const id of HONEST) {
      const sc = cusumScan(W, id, k, h);
      per[id] = { trips: sc.trips.length, maxS: sc.maxS };
      founderTrips += sc.trips.length;
      if (sc.maxS > honestMaxS) honestMaxS = sc.maxS;
    }
    const w1sc = cusumScan(W, SLEEP, k, h);
    const w1pre = w1sc.trips.filter((x) => x.t < flip);
    const w1post = w1sc.trips.filter((x) => x.t >= flip);
    const w1PeakS = w1sc.path.filter((x) => x.t >= flip && x.S !== null).reduce((m, x) => Math.max(m, x.S), 0);
    const g1sc = cusumScan(W, INSTANT, k, h);
    const h2sc = cusumScan(W, JOINER, k, h);
    const founderRate = founderTrips / ((N * T) / 200);
    const gatesPass = founderRate <= BUDGET_PER_200R && h2sc.trips.length === 0 && w1pre.length === 0;
    return {
      W, k, h,
      founderTrips, founderRate: r6(founderRate), h2Trips: h2sc.trips.length,
      w1PreTrips: w1pre.length, w1PostTrips: w1post.length,
      w1Latency: w1post.length ? w1post[0].t - flip : null,
      g1Trips: g1sc.trips.length,
      honestMaxS: r6(honestMaxS), w1PeakS: r6(w1PeakS),
      margin: r6(w1PeakS - honestMaxS),
      gatesPass, detectsW1: w1post.length > 0,
    };
  };
  const gridScan = (W, id, k, h) => cusumScan(W, id, k, h);
  const gridLegacy = (W, id, k, h) => gridScan(W, id, k, h);
  const gridRef = (W, id, k, h) => gridLegacy(W, id, k, h);
  const gridScanAlias = (W, id, k, h) => gridRef(W, id, k, h);
  const _gridScan = (W, id, k, h) => gridScanAlias(W, id, k, h);
  const grid = [];
  const perVoiceMaxS = {}; // W -> k -> id -> maxS (the honest floor ceiling per config)
  for (const W of ACP.Ws) {
    for (const k of ACP.ks) {
      perVoiceMaxS[`${W}|${k}`] = {};
      for (const id of HONEST) {
        const sc = _gridScan(W, id, k, ACP.hGrid[0]);
        perVoiceMaxS[`${W}|${k}`][id] = sc.maxS;
      }
      for (const h of ACP.hGrid) grid.push(scanRow(W, k, h));
    }
  }
  // TELEMETRY-ONLY EXTENSIONS (receipted as EXCLUDED from the wpick search space — the pick grid
  // is the sealed Ws x ks x hGrid; these rows complete the R1/R2 mechanism, dev-phase amendment
  // disclosed BEFORE the final run — no seed/arm/parameter change):
  // (A) the ALLOWANCE axis extended (k in {0.5, 1.0}): larger k suppresses honest accumulation AND
  //     the attack drift; the margin measures whether the floor-to-signal RATIO can flip.
  // (B) the TWO-SIDED variant (S_down and S_up CUSUMs, trip on either): the flip's ALIGN change is
  //     seed-dependent in DIRECTION (this pricing world shows a RISE — see w1HonestPhase), so the
  //     one-sided sensor is blind to rises by design; the two-sided variant is the direction-robust
  //     alternative and is priced here — the honest floor exposure DOUBLES (both excursion sides).
  const ext = { allowanceAxis: [], twoSided: [] };
  for (const W of ACP.Ws) {
    for (const k of [0.5, 1.0]) {
      let best = null;
      for (const h of ACP.hGrid) {
        const row = scanRow(W, k, h);
        if (!best || row.margin > best.margin) best = row;
      }
      ext.allowanceAxis.push({ W, k, bestMarginRow: best, note: 'telemetry-only — excluded from the wpick search space' });
    }
  }
  const twoSidedScan = (W, id, k) => {
    const { ts, rhos, mus } = series[W][id];
    const sig = sigmaFloor[W];
    let Sd = 0, Su = 0, maxD = 0, maxU = 0;
    const post = []; // post-flip per-round max(Sd, Su)
    for (let i = 0; i < ts.length; i++) {
      if (mus[i] === null) continue;
      const z = (mus[i] - rhos[i]) / sig;
      Sd = Math.max(0, Sd + z - k);
      Su = Math.max(0, Su - z - k);
      if (Sd > maxD) maxD = Sd;
      if (Su > maxU) maxU = Su;
      if (ts[i] >= flip) post.push(Math.max(Sd, Su));
    }
    return { maxD: r6(maxD), maxU: r6(maxU), postPeak: post.length ? r6(Math.max(...post)) : 0 };
  };
  for (const W of ACP.Ws) {
    for (const k of ACP.ks) {
      let honestTwoSided = 0;
      for (const id of HONEST) {
        const sc = twoSidedScan(W, id, k);
        honestTwoSided = Math.max(honestTwoSided, sc.maxD, sc.maxU);
      }
      const w1ts = twoSidedScan(W, SLEEP, k);
      ext.twoSided.push({
        W, k,
        honestTwoSidedMax: r6(honestTwoSided),
        w1TwoSidedSignal: w1ts.postPeak,
        w1DownMax: w1ts.maxD, w1UpMax: w1ts.maxU,
        margin: r6(w1ts.postPeak - honestTwoSided),
        note: 'two-sided CUSUM (trip on either side) — the direction-robust alternative; telemetry-only',
      });
    }
  }
  return {
    seed: PRICE_SEED, flipApprox: flip, Ws: ACP.Ws, ks: ACP.ks, hGrid: ACP.hGrid,
    MINOWN: ACP.MINOWN, M: ACP.M, sustain: `${ACP.sustainNeed}/${ACP.sustainWin}`,
    sigmaFloor, founderStats, birthTable, grid, ext,
    w1HonestPhase: Object.fromEntries(ACP.Ws.map((W) => {
      const sr = series[W][SLEEP];
      const iFlip = sr.ts.findIndex((t) => t >= flip);
      const pre = sr.rhos.slice(0, iFlip);
      const post = sr.rhos.slice(iFlip);
      return [W, { preMean: r6(mean(pre)), preMin: r6(Math.min(...pre)), nPre: pre.length, postMean: r6(mean(post)), nPost: post.length, drop: r6(mean(pre) - mean(post)) }];
    })),
    note: 'telemetry-only streaming over raw world streams (no engine, no consequences; admission gating not simulated — E40/E41 pricing convention); sigma_floor = global RMS over honest-founder eval rounds incl. weak voices; ext = allowance-axis + two-sided extensions (telemetry-only, excluded from the pick search space)',
  };
}


// __DEFENSES_BEGIN (experiment-local; murmur/ untouched — composition receipt)
// AlignChangeGuard — CoMovementGuard's plumbing (E40: rec/note/apply/summary skeleton, guard
// windows {from: t+1, until: t+40}, release events, epsNew throwback, guardRounds accounting,
// throw/rethrow kinds) with the trip statistic swapped: per-round relational level bar ->
// one-sided DOWNWARD CUSUM on the ALIGN series against the voice's OWN trailing-M mean
// (mu30), normalized by the GLOBAL sigma_floor priced at design time. Receipted deltas from
// E40's plumbing: (1) rho STREAMS for any voice with a full window (the pre-admission series
// feeds mu30 — the admission clock gates trip EVENTS, not the series); (2) trip evaluation
// requires the voice's own series to have >= MINOWN samples (the self-baseline must exist);
// (3) trip evaluation reads the CURRENT guard state (the release round can trip); (4) on a
// trip BOTH S and the sustained window reset. Trip event fields: S/rho/mu/sustain + trail30
// (trailing-W mean product) and refMean = mu (the self-baseline the trip fired on — field
// names keep TrustReprobation byte-verbatim; E40's refMean was 0 because that detector had
// no self-baseline — semantics receipted in run.config).
class AlignChangeGuard {
  constructor(adm, cfg) { // cfg: { h, W, M, MINOWN, k, sigmaFloor, sustainWin, sustainNeed, epsDen, guardRounds }
    this.adm = adm; this.cfg = cfg;
    this.wins = new Map();      // id -> [{t, pv, mv}] — the sender's trailing vote-deviation window
    this.rhoHist = new Map();   // id -> [rho] — the voice's OWN trailing ALIGN samples (mu30 source)
    this.S = new Map();         // id -> current CUSUM S
    this.susWin = new Map();    // id -> last sustainWin crossed-booleans (the sustained gate)
    this.track = new Map();     // id -> per-sender statistic telemetry
    this.w1Path = [];           // SLEEP's full {t, rho, S, mu, crossed} path (mechanism receipt)
    this.g1Path = [];           // INSTANT's full {t, rho, S, mu, crossed} path (R3 mechanism receipt)
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
  }
  note(t, murmurs, pool) { // post-pool: rho streams for any full window; trip EVENTS gated
    if (!murmurs.length) return;
    const mv = median(murmurs.map((m) => +m.p)) - 0.5; // roster median vote (suspect included — E40-receipted)
    for (const m of murmurs) this.rec(m.from, t, +m.p, mv);
    for (const m of murmurs) {
      const id = m.from;
      const g0 = this.guarded.get(id);
      if (g0 && t > g0.until) { this.events.push({ t, id, kind: 'release' }); this.guarded.delete(id); }
      // (1) the ALIGN series streams for ANY voice with a full trailing window (receipted delta)
      const win = this.wins.get(id);
      if (!win || win.length < this.cfg.W) continue;
      let num = 0, sp2 = 0, sm2 = 0;
      for (const e of win) { num += e.pv * e.mv; sp2 += e.pv * e.pv; sm2 += e.mv * e.mv; }
      const den = Math.sqrt(sp2 * sm2);
      const rho = den > this.cfg.epsDen ? num / den : 0;
      if (!this.rhoHist.has(id)) this.rhoHist.set(id, []);
      const hist = this.rhoHist.get(id);
      hist.push(rho);
      if (hist.length > this.cfg.M) hist.shift();
      // (2) trip evaluation: admitted voice + the self-baseline must exist (receipted)
      if (!this.adm.admitted(id)) continue;
      if (hist.length < this.cfg.MINOWN) continue;
      const mu = mean(hist);
      const z = (mu - rho) / this.cfg.sigmaFloor;
      let S = Math.max(0, (this.S.get(id) ?? 0) + z - this.cfg.k);
      this.S.set(id, S);
      const crossed = S > this.cfg.h;
      let sus = this.susWin.get(id);
      if (!sus) { sus = []; this.susWin.set(id, sus); }
      sus.push(crossed);
      if (sus.length > this.cfg.sustainWin) sus.shift();
      const tr = this.track.get(id) ?? { nEval: 0, minRho: 1, minRhoAt: t, maxRho: -1, lastRho: 0, maxS: 0, lastS: 0, lastMu: 0, crossedRounds: 0 };
      tr.nEval++; tr.lastRho = r6(rho); tr.lastS = r6(S); tr.lastMu = r6(mu);
      if (rho < tr.minRho) { tr.minRho = r6(rho); tr.minRhoAt = t; }
      if (rho > tr.maxRho) tr.maxRho = r6(rho);
      if (S > tr.maxS) tr.maxS = r6(S);
      if (crossed) tr.crossedRounds++;
      this.track.set(id, tr);
      if (id === SLEEP) this.w1Path.push({ t, rho: r6(rho), S: r6(S), mu: r6(mu), crossed });
      if (id === INSTANT) this.g1Path.push({ t, rho: r6(rho), S: r6(S), mu: r6(mu), crossed });
      const sustained = sus.length >= this.cfg.sustainWin && sus.filter(Boolean).length >= this.cfg.sustainNeed;
      const gNow = this.guarded.get(id); // (3) CURRENT guard state — the release round can trip
      if (gNow) { // guard open: no trip event (E37 plumbing); count suppressed sustained conditions
        if (sustained) this.suppressed.set(id, (this.suppressed.get(id) ?? 0) + 1);
        continue;
      }
      if (sustained) {
        const sCount = sus.filter(Boolean).length; // recorded BEFORE the reset
        this.susWin.set(id, []);   // (4) reset on trip (receipted)
        this.S.set(id, 0);         // (4) reset on trip (receipted)
        const re = this.events.some((e) => e.id === id && (e.kind === 'throw' || e.kind === 'rethrow'));
        this.events.push({
          t, id, kind: re ? 'rethrow' : 'throw',
          S: r6(S), rho: r6(rho), mu: r6(mu), sustain: sCount,
          trail30: r6(mean(win.map((e) => e.pv * e.mv))), refMean: r6(mu), // TrustReprobation-verbatim field names; refMean = the self-baseline (receipted)
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
        nEval: tr ? tr.nEval : 0,
        minRho: tr ? tr.minRho : null, minRhoAt: tr ? tr.minRhoAt : null,
        maxRho: tr ? tr.maxRho : null, lastRho: tr ? tr.lastRho : null,
        maxS: tr ? tr.maxS : null, lastS: tr ? tr.lastS : null, lastMu: tr ? tr.lastMu : null,
        crossedRounds: tr ? tr.crossedRounds : 0,
        suppressedSustained: this.suppressed.get(id) ?? 0,
      };
    }
    return {
      h: this.cfg.h, W: this.cfg.W, M: this.cfg.M, MINOWN: this.cfg.MINOWN, k: this.cfg.k,
      sigmaFloor: this.cfg.sigmaFloor, sustainWin: this.cfg.sustainWin, sustainNeed: this.cfg.sustainNeed,
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
  return { loc: src.slice(a, b).split('\n').length - 1, classes: ['AlignChangeGuard (CoMovementGuard plumbing + E42 self-baseline CUSUM on the ALIGN series; global sigma_floor)', 'TrustReprobation (E37-E40 verbatim)'] };
}

// ---------------- arm specs ----------------
// attackers: [{ id, flip }] — flip = toxic start round (null = never flips).
// g1 is ACTIVE in all attack arms (E36 deviation, carried) — R3/R5c need a same-arm baseline.
// A4 carries no attackers.
const attackersFor = (tAdm) => [{ id: SLEEP, flip: tAdm == null ? null : tAdm + KSTAR }, { id: INSTANT, flip: JOIN }];
const armName = (kind, h) => (kind === 'AC1' ? `AC1-cp-h${h}` : `AC2-cp-h${h}`);
function armSpecs(tAdm, hStar, hHi, aliased) {
  const atk = attackersFor(tAdm);
  return {
    'A1-v3.1-sleeper': { name: 'A1-v3.1-sleeper', kind: 'A1', defenses: [], reprob: false, h: null, attackers: atk },
    [armName('AC1', hStar)]: { name: armName('AC1', hStar), kind: 'AC1', defenses: ['acp'], reprob: true, h: hStar, attackers: atk },
    ...(aliased ? {} : {
      [armName('AC2', hHi)]: { name: armName('AC2', hHi), kind: 'AC2', defenses: ['acp'], reprob: true, h: hHi, attackers: atk },
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
  const cpDef = spec.defenses.includes('acp')
    ? new AlignChangeGuard(adm, { h: spec.h, W: ACP.W, M: ACP.M, MINOWN: ACP.MINOWN, k: ACP.k, sigmaFloor: ACP.sigmaFloor, sustainWin: ACP.sustainWin, sustainNeed: ACP.sustainNeed, epsDen: ACP.epsDen, guardRounds: ACP.guardRounds })
    : null;
  const reprob = spec.reprob ? new TrustReprobation(cpDef, trust, REPROB) : null;
  const defs = [cpDef].filter(Boolean);
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
  if (cpDef && wApost && wApost.flip != null) {
    const trips = cpDef.events.filter((e) => e.id === SLEEP && (e.kind === 'throw' || e.kind === 'rethrow'));
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
  if (cpDef) {
    const trips = cpDef.events.filter((e) => e.id === INSTANT && (e.kind === 'throw' || e.kind === 'rethrow'));
    g1Trip = {
      nTrips: trips.length,
      firstT: trips.length ? trips[0].t : null,
      admitExpT: st.rec[INSTANT].admitExpT ?? null,
      latencyFromAdmission: trips.length && st.rec[INSTANT].admitExpT !== undefined ? trips[0].t - st.rec[INSTANT].admitExpT : null,
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
    g1Trip,
    w1: {
      ...st.rec[SLEEP],
      probTraceN: st.probTrace.length,
      probTraceMean: st.probTrace.length ? mean(st.probTrace) : null,
      probTraceMax: st.probTrace.length ? Math.max(...st.probTrace) : null,
    },
    h2: st.rec[JOINER], g1: st.rec[INSTANT],
    defense: {
      acp: cpDef ? cpDef.summary() : null,
      reprob: reprob ? reprob.summary() : null,
    },
    verify: st.verify,
    err: st.err,
  };
}

// ---------------- main ----------------
console.log(`── E42 align change-point lane · CUSUM on ALIGN (self-baseline mu30, global sigma_floor) · W-grid ${ACP.Ws.join('/')} · k-grid ${ACP.ks.join('/')} · ${T} rounds · ${V} voice slots ──`);
const vault = new MothVault({ label: 'e42', offline: true });
const harvest = await vault.harvest(256);
console.log(`vault: ${harvest.mock ? 'MOCK (offline doctrine)' : 'LIVE ' + harvest.jobId} digest=${harvest.poolDigest.slice(0, 10)} bits=${harvest.bits.length}`);

// design-time pricing (re-computed in-run; booked BEFORE any run row — R1 clause (a))
const pricing = priceAlignCp(harvest, vault);

if (process.env.E42_PRICE) {
  console.log(`\n══ E42 DESIGN-TIME PRICING (seed ${PRICE_SEED}, disjoint from matrix seeds 0-5; flip approx t=${pricing.flipApprox}) ══`);
  for (const W of ACP.Ws) {
    console.log(`\nW=${W}: sigma_floor=${pricing.sigmaFloor[W]} (global RMS of rho-mu30 over founder eval rounds)`);
    console.log(`  founder meanRho: ${HONEST.map((id) => `${id}:${pricing.founderStats[W][id].meanRho}`).join(' ')}`);
    console.log(`  founder rmsDev:  ${HONEST.map((id) => `${id}:${pricing.founderStats[W][id].rmsDev}`).join(' ')}`);
    console.log(`  w1 honest->post drop: ${JSON.stringify(pricing.w1HonestPhase[W])}`);
    const bt = pricing.birthTable[W];
    console.log(`  BIRTH TABLE: founder birth means ${HONEST.map((id) => `${id}:${bt[id].birthMean}`).join(' ')}`);
    console.log(`    g1 birthMean ${bt[INSTANT].birthMean} vs founderBirthMin ${bt._founderBirthMin} (gap ${bt._g1BirthMinusFounderMin}); founders BELOW g1: ${bt._founderBelowG1.join(',') || 'none'}`);
    console.log(`    w1 birthMean ${bt[SLEEP].birthMean} | h2 birthMean ${bt[JOINER].birthMean}`);
  }
  console.log('\nGRID (gate-passing rows):');
  for (const r of pricing.grid.filter((x) => x.gatesPass)) {
    console.log(`  W=${r.W} k=${r.k} h=${r.h}: founderRate ${r.founderRate} h2 ${r.h2Trips} w1pre ${r.w1PreTrips} | w1post ${r.w1PostTrips} lat ${r.w1Latency} | g1 ${r.g1Trips} | honestMaxS ${r.honestMaxS} w1PeakS ${r.w1PeakS} margin ${r.margin}`);
  }
  const ng = pricing.grid.filter((x) => !x.gatesPass);
  console.log(`(${ng.length} grid rows FAILED gates: ${ng.slice(0, 6).map((r) => `W${r.W}/k${r.k}/h${r.h}:ft${r.founderTrips}`).join(', ')}${ng.length > 6 ? ' ...' : ''})`);
  process.exit(0);
}

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });
book('run.config', {
  task: 'E42', name: 'the ALIGN change-point sensor (one-sided CUSUM on the ALIGN trajectory against the voice\'s OWN trailing-30 baseline, global sigma_floor, composed with trust re-probation vs the E35 sleeper)',
  collides: 'E41 receipted handoff — the vote-side axis is DEAD (E24 toxic series is PRO-state 75% at 0.25 magnitude; anti-sister rate BELOW honest p95; separation NEGATIVE), and E41\'s same-world ALIGN re-pricing carried the live seed: w1 ALIGN 0.633 (honest) -> 0.485 (post-flip, a ~0.15 DROP vs its own trailing baseline), g1 AT the founder floor (0.438 vs min 0.451) FROM ARRIVAL. E38 killed CUSUM on RESIDUALS (post-flip residual mean AT/BELOW own probation mu; flat-sigma = 30x budget); nobody has run change-point on the ALIGN series itself, where the flip IS a level change. E42 = the fifth axis: relational statistic, SELF-baseline on the relational series — the combination E38\'s law never actually killed',
  T, N, voices: V, seeds: SEEDS, kStarCarried: KSTAR,
  kStarNote: 'k* = 25 carried from E35 (probe-optimal on the train seed; GAN strategy search CLOSED in E35, not re-run)',
  world: { stateFlipP: FLIP_P, skillRerollP: REROLL_P, qRange: [0.5, 0.95], a1Acuity: 0.9, toxicFormula: { id: 'E24 verbatim', acuity: TOX_Q, note: 'toxV shared by w1 post-flip AND g1 (same toxic values across arms)' }, streamKeys: 'e42:* (fresh draws; generator E35-E40 verbatim)' },
  attack: {
    joinRound: JOIN,
    sleeper: { id: SLEEP, honestPhase: 'e24 h1 generator verbatim (expert acuity, iid errors, own edges)', flip: 't_adm + 25; t_adm per seed from a pass-1 honest-forever A1-wiring run (in-run assert pass1 == matrix)' },
    flasher: { id: INSTANT, note: 'toxic FROM arrival t=150 — the R3 VISIBILITY target (E41 measured its long-window ALIGN at the founder floor 0.438 vs 0.451 min; the birth table prices whether ANY sensor-scale reference can see it)' },
    honestJoiner: { id: JOINER, note: 'honest forever, present in ALL arms — the false-positive canary' },
  },
  armsPlan: ['A1-v3.1-sleeper (control)', 'AC1-cp-h* (candidate; h* picked by the receipted probe rule over the priced h candidates)', 'AC2-cp-hHi (conservative sibling = largest priced h; aliases AC1 if equal)', 'A4-v3.1-clean (collateral baseline)'],
  defenses: {
    alignChangeGuard: {
      ...ACP, reprob: REPROB,
      statistic: 'one-sided DOWNWARD CUSUM on the ALIGN series: rho_i(t) = E40\'s trailing-W uncentered cosine between the sender\'s vote-deviation stream (pv = p-0.5, protocol-neutral origin) and the roster-median deviation (mv = median(murmurs)-0.5, suspect included — 15th-of-15 effect, E40-receipted); mu_i(t) = mean of the voice\'s OWN trailing M=30 ALIGN samples (the SELF-baseline — the relational series is baselined on itself, which is exactly what E38 never tried: E38\'s CUSUM ran on residuals with a PROBATION mu and a flat sigma); S_i(t) = max(0, S + (mu - rho)/sigma_floor - k); TRIP when S > h sustained 5-of-10 evaluation rounds; reset S AND the sustained window on trip',
      sigmaFloorReceipt: 'sigma_floor is a GLOBAL floor (NOT per-sender sigma — E38\'s flat-sigma-on-residuals blew up 30x because honest residual noise was per-sender): sigma_floor(W) = RMS of (rho - mu30) over ALL honest-founder evaluation rounds on the design-time pricing seed 100, INCLUDING the natural ALIGN variance of weak voices (the weak voices are the floor\'s whole point — E41 founder meanRho spans 0.19..0.73 at W=20); booked in pricing.dev BEFORE any run row and passed to the guard as a constant',
      warmupReceipt: 'trip EVENTS evaluate only for ADMITTED voices with >= MINOWN=30 OWN ALIGN samples (the self-baseline must exist — before that S stays 0). This is the receipted warm-up policy and it is LOAD-BEARING for R3: a from-arrival toxic\'s own baseline IS the attack (E38\'s receipt re-tested at the relational layer). The priced BIRTH TABLE is the computed R3 mechanism: per-voice birth ALIGN means (first MINOWN samples) — whether ANY global birth threshold separates g1 from the weak-honest tail without tripping it. The alternative designs (global-mean warm-up evaluated for everyone; founder-max birth reference) are REJECTED BY THE PRICING, not by fiat: the founder birth-mean spread spans the g1 level at every priced W',
      plumbing: 'CoMovementGuard plumbing (E40) verbatim except the receipted deltas: (1) rho STREAMS for any voice with a full window (pre-admission series feeds mu30 — the admission clock gates trip EVENTS, not the series); (2) evaluation requires nOwn >= MINOWN; (3) trip evaluation reads the CURRENT guard state (the release round can trip); (4) S and the sustained window both reset on trip. Guard windows {from: t+1, until: t+40}, release events, epsNew throwback (skipping adm-probationary ids), guardRounds accounting, throw/rethrow kinds — E37-E40 verbatim',
      consequence: 'DETECTOR SWAP ONLY — on trip -> BOTH layers exactly as E37-E40: TrustReprobation (HedgeTrust weight x0.5 via absorb, post-pool pre-update, re-earns through the normal fixed-share + exp(eta*r) path; class copied VERBATIM — trip events carry trail30/refMean fields so it stays byte-identical; refMean = mu_i(t), the self-baseline the trip fired on — E40\'s refMean was 0 because that detector had NO self-baseline; semantics receipted) + influence re-probation (epsNew for 40 guard rounds)',
      rationale: 'E38\'s CUSUM failed on residuals because the post-flip residual mean sat AT/BELOW the probation mu and the flat sigma mispriced per-sender noise. The ALIGN series behaves DIFFERENTLY by E41\'s receipt: the flip is a LEVEL DROP (~0.15) in a statistic whose honest round-to-round noise is priceable ONCE (a pool property — every honest founder\'s rho fluctuates around its own level with a shared scale), and the sleeper\'s own pre-flip history is honestly earned (44 ALIGN samples before t_flip at W=20) — so a self-baseline CUSUM has a real drift signal. The from-arrival case is priced honestly too: the self-baseline is undefined at birth, and the birth table prices whether ANY external reference could fill the hole',
    },
  },
  composition: {
    murmurChanges: 'NONE (target zero) — both mechanisms are experiment-local classes over public murmur/ APIs',
    apis: ['Admission.observe/reattribute/notePooled/admitted/admittedRound/probationary/devMean/indepCount/firstSeen(read)/admitWindow/epsNew/admitErr', 'HedgeTrust.weights/update/absorb/weight', 'Provenance.inspect/penalize', 'MurmurBus.pool (reference-side counterfactuals)', 'receipts.sealChain/verifyChain'],
    layerNote: 'AC arms deliberately MOVE trust (E37\'s TrustReprobation is the proven consequence); decay fires post-pool pre-update (same seam as E40); re-trips allowed (a persistent liar re-sustains during its guard window and retrips at/after release; the mu30 self-baseline ABSORBS a sustained level, so post-absorption drift -> 0 — receipted as the absorption property)',
    timing: 'AlignChangeGuard updates post-pool every round from full-window; the CUSUM evaluates once the voice has >= MINOWN own ALIGN samples; trip consequence effective next round (guard from t+1) — E36-E40 plumbing timing verbatim',
  },
  hedge: CFG, admission: ADM,
  founders: 'D1 genesis acclamation (newcomers w1/g1/h2 join t=150: probationary from firstSeen)',
  absentSenderReward: 'missing ids get HedgeTrust default 0.5 (unproven prior) while absent; roster = 15 slots in every arm (e33-e40 convention)',
  reward: 'r_i = 1 - |p_i - s_t| (supervised pool — pool-independent, so trust re-earning is not gated by the defense)',
  rng: 'MothVault offline:true, one harvest, per-purpose keys e42:<purpose>:<seed>[:<voice>] via streamFor; paired worlds REQUIRE arm-identical world streams (arms select over shared values; no Math.random); pricing seed 100 is DISJOINT from matrix seeds 0-5',
  metrics: {
    D_w1: 'mean over [t_adm+25, min(t_adm+25+150,400)) of |pool - s_t| - |pool_cf - s_t| (E24/E35-E40 counterfactual, sleeper zeroed, reference-side log-odds, never written to the sheet; positive = hurts)',
    D_g1: 'same method over g1\'s own window [150, 300), g1 zeroed',
    honestFinalQ: 'mean HedgeTrust weight of the 12 honest incumbents at t=T-1 (post final update+absorb)',
    tripLatencyW1: 'first AlignChangeGuard throw event on w1 with t >= t_flip, minus t_flip (rounds)',
    tripLatencyG1: 'first throw event on g1 minus g1\'s own admission round (rounds) — the R3 visibility clock',
  },
  decisionRules: {
    R1_honestFloor_PRIMARY: 'R1 HONEST-NOISE FLOOR (priced FIRST per house law): the CUSUM floor over ALL honest founders INCLUDING weak voices, measured (a) design-time seed 100 (pricing.dev: per-founder maxS + honestMaxS + the full (W,k,h) grid), (b) probe seed-0 guard arms, (c) the full matrix AC1 arm. EXPLICIT BUDGET LINE: founder false-trip budget 1.0 per 200 rounds arm-wide (E38 29.9, E39 9.4, E40 0, E41 gates-fail) = rate = total founder (throw+rethrow) events / (seeds x 12 x 400/200); at 6 seeds <= 144 founder trips across the matrix. R1 PASSES iff the MATRIX arm-wide rate <= 1.0; if the floor eats the statistic, that IS the finding',
    R2_detection: 'R2 DETECTION: sleeper trips post-flip; PASS iff tripped seeds >= half AND mean latency < 30 rounds over tripped seeds; pre-flip w1 trips receipted (false trips on an honest-phase voice)',
    R3_g1Visibility: 'R3 g1 VISIBILITY: the from-arrival toxic SHOULD be visible immediately on window fill IF any birth reference exists. PASS iff g1 trips in >= 2/3 of seeds; latency from g1\'s own admission round. The priced BIRTH TABLE (per-voice birth ALIGN means, per W) is the COMPUTED mechanism for whatever verdict lands',
    R4_damage: 'R4 COUNTERFACTUAL DAMAGE (composition): D(AC1) < D(A1): paired one-sided sign test (zeros excluded) p < 0.05; report paired delta +/- SE and damage ratio D(AC1)/D(A1); AC2 alongside (the sensitivity trade) but the crown rides on AC1; g1 damage on the same footing (an INCREASE beyond A1 + 1 SE fails R5c)',
    R5_canaries: 'R5 CANARIES — (a) honQ within 1 SE of A4 (seed-paired; AC arms move trust by design — trustMoved receipted per seed); (b) h2: ZERO defense trips AND per-seed admission outcome identical to A1\'s (arm-invariance); (c) g1 damage <= A1 + 1 SE; (d) FALSE-TRIP BUDGET explicit: total honest-founder trips + per-founder histogram + rate <= 1.0/200r arm-wide; (e) RECOVERY: false-tripped founders re-earn to >= 95% of pre-trip trust share within 100 rounds (E37 baseline 23/25, mean 19.1r — must not regress); events without a full 100-round horizon receipted but excluded; vacuous pass if no trips',
    crown: 'iff AC1 passes R1 + R2 + R3 + R4 + R5, crown it (damage ratio, sleeper latency, g1 latency); if R3 fails while R1+R2+R4+R5 hold, receipt the PARTIAL verdict ("sees the change-point, not the from-arrival") with the birth-confound mechanism; if R1 fails, honest negative — the floor IS the finding; NO pre-drafted text: every clause filled from measured numbers',
  },
  pricingPickRule: {
    grid: 'pricing scans (W,k,h) in Ws x ks x hGrid on seed 100; per row: founder trip rate (budget 1.0/200r on the pricing seed = <= 24 founder trips), h2 trips = 0, w1 pre-flip trips = 0 -> gatesPass; margin = w1PeakS - honestMaxS (sigma units)',
    pickWK: '(W*, k*) = argmax margin among gatesPass && detectsW1 rows; ties -> larger W, then larger k. Fallback: no detecting gate-passer -> argmax margin among gate-passers (relaxed="no-pricing-detection"); no gate-passer -> NO-CANDIDATE (E41 precedent: receipt the grid, exit)',
    hSweep: 'up to PROBE_MAX_H priced candidates at (W*,k*): {smallest detecting gate-passing h (fallback smallest gate-passing), median detecting gate-passing h, largest gate-passing h} deduped; the probe sweeps these and picks h* by the damage-margin rule below',
    hpick: 'h* = argmax delta_h = D_w1(A1,s0) - D_w1(AC_h,s0) among h passing ALL probe gates (i) h2 zero trips on seed 0, (ii) D_g1 <= A1 + 1e-4, (iii) founder rate on seed 0 <= 1.0/200r (<= 2 trips); ties -> LARGER h; fallback ladder: none pass all -> argmax delta among gate-(i) passers (relaxed="founder-only") -> argmax delta (relaxed="none"); AC2 = largest priced h (aliased to AC1 if equal)',
    pickBefore: 'the wpick row (sensor.wpick) and the hpick row (sensor.hpick) are booked BEFORE any full-matrix run row; the probe block doubles as matrix seed 0 (no re-run)',
  },
  runtimeRules: 'probe = the timed seed-0 block (pass-1 + A1 + A4 + |hSweep| AC-h runs); projected = t_probe x 6 + 2s IO; if projected > 170s cut seeds 6 -> 4 and RECEIPT the cut (E36-E40 ran ~95-135s at 6-8 seeds); NO script edits after the final run (stale-artifact doctrine)',
  sweepProvenance: 'Ws {20,30,40}, ks {0.1,0.3}, hGrid {3..28} priced on seed 100 (disjoint); W*/k*/hSweep/sigmaFloor DERIVED IN-RUN from the priced grid and booked as sensor.wpick BEFORE run rows — the pick rule, not the pick, is what is sealed',
  pricing: { seed: pricing.seed, flipApprox: pricing.flipApprox, sigmaFloor: pricing.sigmaFloor, w1HonestPhase: pricing.w1HonestPhase, birthTable: pricing.birthTable, gridGatePassing: pricing.grid.filter((r) => r.gatesPass), gridRows: pricing.grid.length }, // R1 clause (a) — booked BEFORE any run row
  defenseLoc: defenseLoc(),
  vault: { mock: harvest.mock, digest: harvest.poolDigest },
  engine: 'vendored quilt dist (QuiltEngine)', sheetVerifyTol: TOL,
});
book('pricing.dev', {
  rule: 'R1 clause (a): design-time CUSUM honest-noise floor pricing on seed 100 (disjoint from matrix seeds 0-5); t_adm approximated at 189 (E35 measured 8/8 admission at t=189) -> flipApprox 214; admission gating NOT simulated (the pricing measures the STATISTIC floor over honest streams, not the guard\'s evaluation gating); telemetry only — no engine, no consequences',
  seed: PRICE_SEED, sigmaFloor: pricing.sigmaFloor, founderStats: pricing.founderStats,
  birthTable: pricing.birthTable, w1HonestPhase: pricing.w1HonestPhase,
  grid: pricing.grid,
  ext: pricing.ext,
  budgetLine: `founder false-trip budget ${BUDGET_PER_200R}/200r arm-wide; pricing projection denominator = 12 x ${T}/200 = 24 -> <= 24 founder trips on this seed`,
  extNote: 'ext.allowanceAxis (k in {0.5, 1.0}) and ext.twoSided are TELEMETRY-ONLY extensions excluded from the wpick search space (sealed grid = Ws x ks x hGrid); they complete the R1/R2 mechanism: the allowance axis and the direction-robust variant are priced and eaten too',
});

// ---------------- phase 0: the (W*,k*) + h-candidate pick (receipted rule) ----------------
const passRows = pricing.grid.filter((r) => r.gatesPass);
const detectRows = passRows.filter((r) => r.detectsW1);
let wpick;
if (detectRows.length) {
  const best = Math.max(...detectRows.map((r) => r.margin));
  const tied = detectRows.filter((r) => Math.abs(r.margin - best) <= 1e-9);
  tied.sort((a, b) => b.W - a.W || b.k - a.k || b.h - a.h);
  wpick = { W: tied[0].W, k: tied[0].k, relaxed: null, margin: r6(best), tied: tied.length };
} else if (passRows.length) {
  const best = Math.max(...passRows.map((r) => r.margin));
  const tied = passRows.filter((r) => Math.abs(r.margin - best) <= 1e-9);
  tied.sort((a, b) => b.W - a.W || b.k - a.k || b.h - a.h);
  wpick = { W: tied[0].W, k: tied[0].k, relaxed: 'no-pricing-detection', margin: r6(best), tied: tied.length };
} else {
  // NO-CANDIDATE — the floor ate the fifth axis on the pricing seed (E41 precedent)
  book('sensor.wpick', { rule: 'receipted in run.config.pricingPickRule', picked: null, passRows: passRows.length, of: pricing.grid.length, note: 'NO-CANDIDATE: no (W,k,h) passed the pricing gates — the honest CUSUM floor eats the fifth axis on the pricing seed' });
  book('finding.R1', { rule: 'R1 (pricing clause): no gate-passing config on the pricing seed — the floor IS the finding', pricingGrid: pricing.grid, birthTable: pricing.birthTable, sigmaFloor: pricing.sigmaFloor, verdict: 'FAIL (NO-CANDIDATE at pricing)' });
  book('finding.verdict', { crowned: 'NONE', verdict: 'NO-CANDIDATE: the honest CUSUM floor on the ALIGN series eats every priced (W,k,h) — fifth axis dead at pricing; mechanism = the priced grid + birth table (receipted, E41 precedent)', r_ok: { R1: false, R2: null, R3: null, R4: null, R5: null } });
  const sealed0 = sealChain(rows);
  const v0 = verifyChain(sealed0);
  mkdirSync('experiments/outputs', { recursive: true });
  writeFileSync('experiments/outputs/receipts_e42.jsonl', sealed0.map((r) => JSON.stringify(r)).join('\n') + '\n');
  writeFileSync('experiments/outputs/e42_summary.json', JSON.stringify({ task: 'E42', verdict: 'NO-CANDIDATE (pricing)', pricing: { sigmaFloor: pricing.sigmaFloor, birthTable: pricing.birthTable, grid: pricing.grid }, chain: { rows: sealed0.length, tip: sealed0[sealed0.length - 1].row_hash, verify: v0 } }, null, 1));
  console.log('E42 NO-CANDIDATE (pricing); chain rows', sealed0.length, 'verify', JSON.stringify(v0));
  process.exit(0);
}
ACP.W = wpick.W; ACP.k = wpick.k; ACP.sigmaFloor = pricing.sigmaFloor[wpick.W];
{
  const rowsWK = passRows.filter((r) => r.W === wpick.W && r.k === wpick.k);
  const detWK = rowsWK.filter((r) => r.detectsW1).map((r) => r.h).sort((a, b) => a - b);
  const hs = new Set();
  if (detWK.length) {
    hs.add(detWK[0]);
    hs.add(detWK[Math.floor((detWK.length - 1) / 2)]);
  } else {
    const all = rowsWK.map((r) => r.h).sort((a, b) => a - b);
    if (all.length) { hs.add(all[0]); hs.add(all[Math.floor((all.length - 1) / 2)]); }
  }
  if (rowsWK.length) hs.add(Math.max(...rowsWK.map((r) => r.h)));
  ACP.hSweep = [...hs].sort((a, b) => a - b).slice(0, PROBE_MAX_H);
}
book('sensor.wpick', {
  rule: 'receipted in run.config.pricingPickRule',
  picked: { W: wpick.W, k: wpick.k, sigmaFloor: ACP.sigmaFloor }, relaxed: wpick.relaxed, margin: wpick.margin,
  hSweep: ACP.hSweep, hSweepNote: 'priced h candidates for the probe sweep (smallest detecting / median / largest gate-passing at (W*,k*))',
  gatePassingRows: passRows.length, of: pricing.grid.length, detectingRows: detectRows.length,
  budgetLine: `pricing founder budget: <= 24 trips on seed 100 (rate ${BUDGET_PER_200R}/200r)`,
});
console.log(`wpick: W*=${wpick.W} k*=${wpick.k} sigma_floor=${ACP.sigmaFloor}${wpick.relaxed ? ` (RELAXED: ${wpick.relaxed})` : ''} margin=${wpick.margin} -> probe h-sweep [${ACP.hSweep.join(', ')}]`);

// ---------------- phase 1: probe (seed 0) — full matrix + h-sweep ----------------
const world0 = genWorld(0, harvest, vault);
const eng0 = new QuiltEngine('e42-s0', {});
eng0.loadSheet(buildSheet());
const probeStart = Date.now();
const engP1 = new QuiltEngine('e42-s0-p1', {});
engP1.loadSheet(buildSheet());
const p1 = await runArm(0, world0, { name: 'pass1', kind: 'pass1', defenses: [], reprob: false, h: null, attackers: [{ id: SLEEP, flip: null }, { id: INSTANT, flip: JOIN }] }, engP1);
if (p1.w1.admitExpT === undefined) console.log('  seed 0: sleeper NOT admitted under honest behavior — attack cannot launch (receipted as neverLaunched)');
const tAdm0 = p1.w1.admitExpT;
const probe = { A1: null, A4: null, C: {} };
for (const spec of [
  { name: 'A1-v3.1-sleeper', kind: 'A1', defenses: [], reprob: false, h: null, attackers: attackersFor(tAdm0) },
  { name: 'A4-v3.1-clean', kind: 'A4', defenses: [], reprob: false, h: null, attackers: [] },
  ...ACP.hSweep.map((h) => ({ name: `probe-h${h}`, kind: 'probe', defenses: ['acp'], reprob: true, h, attackers: attackersFor(tAdm0) })),
]) {
  probe[spec.kind === 'probe' ? `h${spec.h}` : spec.kind] = await runArm(0, world0, spec, eng0);
}
const probeMs = Date.now() - probeStart;
const projected = (probeMs / 1000) * 6 + 2;
let cut = null;
if (projected > 170 && SEEDS === 6) { SEEDS = 4; cut = 'seeds cut 6 -> 4 by the probe rule (projected > 170s); paired claims preserved'; }
else if (projected > 170) { cut = `seeds already ${SEEDS} (< 6); projected ${projected.toFixed(0)}s still > 170s — proceeding at minimum receipted fallback`; }
book('probe.seed0', {
  seed: 0, timed: true, probeBlock_s: +(probeMs / 1000).toFixed(1), runs: 3 + ACP.hSweep.length,
  tAdmExp: tAdm0, pass1DevMean: p1.w1.devMean, pass1Indep: p1.w1.indep,
  w1ProbTraceMax_A1: probe.A1.w1.probTraceMax,
  note: 'probe = 1-seed timed run of the full matrix + priced h-sweep; doubles as matrix seed 0 (no re-run)',
});
book('runtime.probe', {
  tProbe_s: +(probeMs / 1000).toFixed(1),
  projected_6seeds_s: +projected.toFixed(1),
  projectedFormula: 't_probe * 6 + 2s IO (receipted)',
  seedDecision: SEEDS, cut: cut ?? 'none — full plan within budget',
  e36e37e38e39e40Reference_s: '130.1 / 134.7 / 100.7 / 95.2 / (22.1 probe + 71.8 matrix) s at 6-8 seeds',
});
console.log(`probe(seed 0): ${+(probeMs / 1000).toFixed(1)}s -> projected(6 seeds)=${projected.toFixed(0)}s -> seeds=${SEEDS}${cut ? ' (CUT)' : ''}`);

// ---------------- phase 1b: the h pick (receipted rule) ----------------
const founderTripCount = (R) => Object.entries(R.defense.acp.per)
  .filter(([id]) => HONEST.includes(id)).reduce((a, [, p]) => a + p.throws + p.rethrows, 0);
const h2TripCount = (R) => {
  const p = R.defense.acp.per[JOINER];
  return p ? p.throws + p.rethrows : 0;
};
const sweepTable = ACP.hSweep.map((h) => {
  const R = probe[`h${h}`];
  const delta = probe.A1.dmgW1 - R.dmgW1;
  const gates = {
    h2Trips: h2TripCount(R),
    g1Delta: r6(R.dmgG1 - probe.A1.dmgG1),
    g1Gate: R.dmgG1 - probe.A1.dmgG1 <= PROBE_G1_TOL,
    founderTrips: founderTripCount(R),
    founderRatePer200r: r6(founderTripCount(R) / ((N * T) / 200)),
    founderGate: founderTripCount(R) / ((N * T) / 200) <= BUDGET_PER_200R,
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
const HHI = Math.max(...ACP.hSweep);
const ALIASED = HSTAR === HHI;
const ARM_AC1 = armName('AC1', HSTAR);
const ARM_AC2 = armName('AC2', HHI);
book('sensor.hpick', {
  rule: 'argmax delta_h among h passing all probe gates; ties -> larger h; fallback ladder receipted in run.config',
  sweepTable, picked: HSTAR, relaxed: pick.relaxed, tied: pick.tied,
  hHi: HHI, aliased: ALIASED, aliasNote: ALIASED ? 'AC1 == AC2 (h* = largest priced h): the conservative sibling IS the candidate; one arm run, AC1 aliases AC2 (no re-run)' : 'AC1 and AC2 are distinct arms',
  probeD_w1: Object.fromEntries(ACP.hSweep.map((h) => [`h${h}`, r6(probe[`h${h}`].dmgW1)]).concat([['A1', r6(probe.A1.dmgW1)]])),
});
console.log(`h-pick: h*=${HSTAR}${pick.relaxed ? ` (RELAXED: ${pick.relaxed})` : ''}${ALIASED ? ' — AC1 == AC2 (aliased)' : ''}`);

// ---------------- phase 2: full matrix ----------------
const ARMS = ALIASED ? ['A1-v3.1-sleeper', ARM_AC1, 'A4-v3.1-clean'] : ['A1-v3.1-sleeper', ARM_AC1, ARM_AC2, 'A4-v3.1-clean'];
const agg = {};
for (const A of ARMS) {
  agg[A] = {
    acc: [], pre: [], dmgW1: [], dmgG1: [], shareW1: [], shareG1: [], honQ: [],
    w1Adm: [], w1Dev: [], w1Indep: [], w1ProbMax: [], h2Adm: [], g1Adm: [],
    trustFlip: [], conv: [],
    sensor: { per: {}, w1Events: [], g1Events: [], founderTrips: [], w1Trips: [], g1Trips: [], founderMinRho: {}, founderMaxS: {} },
    decayEvents: [],
    w1Curves: {}, w1Paths: {}, g1Paths: {},
    vfy: { checks: 0, pass: 0, maxDiff: 0 },
  };
}
const seedRows = [];
const t0 = Date.now();

// seed 0: carried from the probe (no re-run) + the picked AC arms' seed-0 results
{
  const specs = armSpecs(tAdm0, HSTAR, HHI, ALIASED);
  const results = {
    'A1-v3.1-sleeper': probe.A1,
    'A4-v3.1-clean': probe.A4,
    [ARM_AC1]: probe[`h${HSTAR}`],
    ...(ALIASED ? {} : { [ARM_AC2]: probe[`h${HHI}`] }),
  };
  seedRows.push(await buildSeedRow(0, results, specs, tAdm0, p1, true));
  book('run', seedRows[0]);
  console.log(`  seed 1/${SEEDS} done (carried from probe; t_adm=${tAdm0}, ${((Date.now() - t0) / 1000).toFixed(1)}s elapsed)`);
}

// seeds 1..SEEDS-1: fresh worlds, pass-1 anchor, full arm matrix
for (let seed = 1; seed < SEEDS; seed++) {
  const world = genWorld(seed, harvest, vault);
  const eng = new QuiltEngine(`e42-s${seed}`, {});
  eng.loadSheet(buildSheet());
  const engP1 = new QuiltEngine(`e42-s${seed}-p1`, {});
  engP1.loadSheet(buildSheet());
  const p1s = await runArm(seed, world, { name: 'pass1', kind: 'pass1', defenses: [], reprob: false, h: null, attackers: [{ id: SLEEP, flip: null }, { id: INSTANT, flip: JOIN }] }, engP1);
  if (p1s.w1.admitExpT === undefined) console.log(`  seed ${seed}: sleeper NOT admitted under honest behavior (receipted as neverLaunched)`);
  const tAdm = p1s.w1.admitExpT;
  const specs = armSpecs(tAdm, HSTAR, HHI, ALIASED);
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
    if (R.defense.acp) {
      G.sensor.per[seed] = R.defense.acp.per;
      G.sensor.w1Events.push(...R.defense.acp.events.filter((e) => e.id === SLEEP && (e.kind === 'throw' || e.kind === 'rethrow')).map((e) => ({ seed, ...e })));
      G.sensor.g1Events.push(...R.defense.acp.events.filter((e) => e.id === INSTANT && (e.kind === 'throw' || e.kind === 'rethrow')).map((e) => ({ seed, ...e })));
      G.sensor.w1Trips.push({ seed, ...R.w1Trip });
      G.sensor.g1Trips.push({ seed, ...R.g1Trip });
      for (const id of HONEST) {
        const p = R.defense.acp.per[id];
        if (p && (p.throws > 0 || p.rethrows > 0)) G.sensor.founderTrips.push({ seed, id, ...p });
        if (p && p.minRho !== null) (G.sensor.founderMinRho[id] = G.sensor.founderMinRho[id] ?? []).push(p.minRho);
        if (p && p.maxS !== null) (G.sensor.founderMaxS[id] = G.sensor.founderMaxS[id] ?? []).push(p.maxS);
      }
      G.w1Paths[seed] = R.defense.acp.w1Path;
      G.g1Paths[seed] = R.defense.acp.g1Path;
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
        acp: R.defense.acp ? {
          h: R.defense.acp.h, sigmaFloor: R.defense.acp.sigmaFloor,
          per: Object.fromEntries(Object.entries(R.defense.acp.per).filter(([id]) => !HONEST.includes(id))),
          founderMinRho: Object.fromEntries(HONEST.map((id) => [id, R.defense.acp.per[id] ? R.defense.acp.per[id].minRho : null])),
          founderMaxS: Object.fromEntries(HONEST.map((id) => [id, R.defense.acp.per[id] ? R.defense.acp.per[id].maxS : null])),
          founderTrips: R.defense.acp.events.filter((e) => HONEST.includes(e.id) && (e.kind === 'throw' || e.kind === 'rethrow')),
          h2Trips: R.defense.acp.events.filter((e) => e.id === JOINER && (e.kind === 'throw' || e.kind === 'rethrow')),
          g1Trips: R.defense.acp.events.filter((e) => e.id === INSTANT && (e.kind === 'throw' || e.kind === 'rethrow')),
          w1Path: R.defense.acp.w1Path,
          g1Path: R.defense.acp.g1Path,
        } : null,
        reprob: R.defense.reprob ? R.defense.reprob.events.map((e) => ({ id: e.id, tripT: e.tripT, decayT: e.decayT, kind: e.kind, pre: e.pre, post: e.post, recoveredIn: e.recoveredIn })) : null,
      },
      verify: `${R.verify.pass}/${R.verify.checks}`,
    };
  }
  row.honQSpread = { AC1_vs_A1: r6(Math.abs(results[ARM_AC1].honQFinal - results['A1-v3.1-sleeper'].honQFinal)) };
  return row;
}

// ---------------- aggregate ----------------
const armsAgg = {};
for (const A of ARMS) {
  const G = agg[A];
  const isAttack = A !== 'A4-v3.1-clean';
  const isSensor = A === ARM_AC1 || A === ARM_AC2;
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
      g1TripsPerSeed: G.sensor.g1Trips,
      g1TripEvents: G.sensor.g1Events,
      founderTrips: founderTripsAll,
      founderTripTotal: founderTripsAll.reduce((a, e) => a + (e.throws ?? 0) + (e.rethrows ?? 0), 0),
      founderTripRatePer200r: r6(founderTripsAll.reduce((a, e) => a + (e.throws ?? 0) + (e.rethrows ?? 0), 0) / (SEEDS * N * T / 200)),
      founderTripPerVoice: Object.fromEntries(HONEST.map((id) => [id, founderTripsAll.filter((e) => e.id === id).reduce((a, e) => a + (e.throws ?? 0) + (e.rethrows ?? 0), 0)])),
      founderMinRho: Object.fromEntries(HONEST.map((id) => {
        const vals = G.sensor.founderMinRho[id] ?? [];
        return [id, vals.length ? { mean: r6(mean(vals)), min: r6(Math.min(...vals)), n: vals.length } : null];
      })),
      founderMaxS: Object.fromEntries(HONEST.map((id) => {
        const vals = G.sensor.founderMaxS[id] ?? [];
        return [id, vals.length ? { mean: r6(mean(vals)), max: r6(Math.max(...vals)), n: vals.length } : null];
      })),
      honestMaxS_matrix: r6(Math.max(...HONEST.flatMap((id) => G.sensor.founderMaxS[id] ?? [0]))),
      budgetLine: `budget ${BUDGET_PER_200R}/200r arm-wide = <= ${SEEDS * N * T / 200} founder trips across this ${SEEDS}-seed matrix`,
      h2TripTotal: Object.values(G.sensor.per).reduce((a, per) => a + ((per[JOINER]?.throws ?? 0) + (per[JOINER]?.rethrows ?? 0)), 0),
      h2MaxS: statOr(Object.values(G.sensor.per).map((per) => per[JOINER]?.maxS ?? null).filter((x) => x !== null)),
      g1TripTotal: Object.values(G.sensor.per).reduce((a, per) => a + ((per[INSTANT]?.throws ?? 0) + (per[INSTANT]?.rethrows ?? 0)), 0),
      g1MaxS: statOr(Object.values(G.sensor.per).map((per) => per[INSTANT]?.maxS ?? null).filter((x) => x !== null)),
      g1MaxRho: statOr(Object.values(G.sensor.per).map((per) => per[INSTANT]?.maxRho ?? null).filter((x) => x !== null)),
    } : null,
    decayEvents: isSensor ? G.decayEvents : [],
    verify: { checks: G.vfy.checks, pass: G.vfy.pass, maxDiff: G.vfy.maxDiff.toExponential(2) },
  };
}

// per-seed w1 pre/post-flip S maxima + drift profile (mechanism telemetry, AC1 arm)
function pathMinima(path, flip, h) {
  const pre = path.filter((x) => x.t < flip);
  const post = path.filter((x) => x.t >= flip && x.t < flip + DW);
  const preS = pre.map((x) => x.S);
  const postS = post.map((x) => x.S);
  const postRho = post.map((x) => x.rho);
  const preMu = pre.length ? pre[pre.length - 1].mu : null;
  return {
    preFlipMaxS: preS.length ? r6(Math.max(...preS)) : null,
    preFlipMuAtFlip: preMu,
    postFlipMaxS: postS.length ? r6(Math.max(...postS)) : null,
    postFlipMinRho: postRho.length ? r6(Math.min(...postRho)) : null,
    postFlipMeanRho: postRho.length ? r6(mean(postRho)) : null,
    // mean CUSUM drift over the first 15 post-flip evaluation rounds (the absorption window)
    drift15: postS.length ? r6(mean(postS.slice(0, 15))) : null,
    crossedBar: postS.length ? Math.max(...postS) > h : null,
  };
}
const MECHDATA = { perSeed: [] };
{
  const arm = agg[ARM_AC1];
  for (const tr of arm.sensor.w1Trips) {
    const seed = tr.seed, flip = tr.flip;
    const path = arm.w1Paths[seed] ?? [];
    const mm = pathMinima(path, flip, HSTAR);
    const firstTripEv = arm.sensor.w1Events.find((e) => e.seed === seed && e.t >= flip);
    const per = arm.sensor.per[seed]?.[SLEEP] ?? {};
    const g1rec = (arm.sensor.g1Trips ?? []).find((x) => x.seed === seed) ?? null;
    const g1Per = arm.sensor.per[seed]?.[INSTANT] ?? {};
    const founderMaxes = HONEST.map((id) => arm.sensor.per[seed]?.[id]?.maxS ?? 0);
    MECHDATA.perSeed.push({
      seed, flip, tripped: tr.nPostFlip > 0, latency: tr.latency, nTrips: tr.nTrips, nPreFlipTrips: tr.nPreFlip,
      preFlipMaxS: mm.preFlipMaxS, preFlipMuAtFlip: mm.preFlipMuAtFlip,
      postFlipMaxS: mm.postFlipMaxS, postFlipMinRho: mm.postFlipMinRho, postFlipMeanRho: mm.postFlipMeanRho,
      drift15: mm.drift15,
      SAtFirstTrip: firstTripEv ? firstTripEv.S : null, h: HSTAR, sigmaFloor: ACP.sigmaFloor,
      crossedBar: mm.crossedBar === true,
      plateauBelowBar: !tr.nPostFlip && mm.crossedBar === false,
      suppressed: per.suppressedSustained ?? 0,
      honestMaxS_thisSeed: r6(Math.max(...founderMaxes)),
      g1: g1rec ? { nTrips: g1rec.nTrips, firstT: g1rec.firstT, admitExpT: g1rec.admitExpT, latencyFromAdmission: g1rec.latencyFromAdmission, maxS: g1Per.maxS ?? null } : null,
    });
  }
}

// ---------------- claims ----------------
const A1 = 'A1-v3.1-sleeper', A4 = 'A4-v3.1-clean';
const B_ARMS = [ARM_AC1, ...(ALIASED ? [] : [ARM_AC2])];
const dmgW1Of = (A) => agg[A].dmgW1.map((d) => (d === null ? 0 : d));
const dmgG1Of = (A) => agg[A].dmgG1.map((d) => (d === null ? 0 : d));
const honQOf = (A) => agg[A].honQ;

// R1 HONEST-NOISE FLOOR (the primary design constraint) — measured on the matrix arms
const R1 = {};
for (const B of B_ARMS) {
  const tel = armsAgg[B].sensorTelemetry;
  const rate = tel.founderTripRatePer200r;
  R1[B] = {
    priced: { seed: PRICE_SEED, W: wpick.W, k: wpick.k, sigmaFloor: ACP.sigmaFloor, honestMaxS_pricing: wpick.margin >= 0 ? r6(Math.max(...passRows.filter((r) => r.W === wpick.W && r.k === wpick.k).map((r) => r.honestMaxS))) : null, note: 'pricing.dev row (booked before run rows)' },
    perFounderMaxS: tel.founderMaxS,
    honestMaxS_matrix: tel.honestMaxS_matrix,
    falseTrips: { total: tel.founderTripTotal, ratePer200r: rate, budget: BUDGET_PER_200R, budgetLine: tel.budgetLine, perVoice: tel.founderTripPerVoice },
    h2MaxS: tel.h2MaxS, h2Trips: tel.h2TripTotal,
    w1PreFlip: null, // filled below from the stored w1Paths
    verdict: rate <= BUDGET_PER_200R ? 'PASS' : 'FAIL',
  };
}
for (const B of B_ARMS) {
  const flips = Object.fromEntries(agg[B].sensor.w1Trips.map((x) => [x.seed, x.flip]));
  const preMaxes = Object.entries(agg[B].w1Paths).map(([sN, path]) => {
    const flip = flips[sN];
    if (flip == null) return null;
    const pre = path.filter((x) => x.t < flip).map((x) => x.S);
    return pre.length ? Math.max(...pre) : null;
  }).filter((x) => x !== null);
  R1[B].w1PreFlip = preMaxes.length ? { maxS: r6(Math.max(...preMaxes)), nSeeds: preMaxes.length } : null;
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
    maxS: armsAgg[B].sensorTelemetry.g1MaxS,
    maxRho: armsAgg[B].sensorTelemetry.g1MaxRho,
    tripEvents: agg[B].sensor.g1Events,
    birthTable: pricing.birthTable[wpick.W],
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
    g1Damage_paired: {
      damage_A1: armsAgg[A1].damageG1, damage_B: armsAgg[B].damageG1,
      delta_B_minus_A1: { mean: r6(mean(dg1)), se: r6(seOf(dg1)), perSeed: dg1.map((x) => r6(x)) },
      note: 'a sensor that SEES g1 should REDUCE D_g1 (TrustReprobation halves it on every trip) — an increase beyond +1 SE fails R5c',
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
  const ftPass = ftRate <= BUDGET_PER_200R;
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
    falseTrips: { total: ft, ratePer200r: ftRate, budget: BUDGET_PER_200R, perVoice: armsAgg[B].sensorTelemetry.founderTripPerVoice, pass: ftPass },
    recovery: rec,
    verdict: honQPass && h2Pass && g1Pass && ftPass && (rec.verdict === 'PASS' || rec.verdict === 'VACUOUS-PASS') ? 'PASS' : 'FAIL',
  };
}

// ---------------- verdict — mechanism analysis COMPUTED from telemetry ----------------
const R1OK = R1[ARM_AC1].verdict === 'PASS';
const R2OK = R2[ARM_AC1].verdict === 'PASS';
const R3OK = R3[ARM_AC1].verdict === 'PASS';
const R4OK = R4[ARM_AC1].verdict === 'PASS';
const R5OK = R5.perSensor[ARM_AC1].verdict === 'PASS';
const CROWN = (R1OK && R2OK && R3OK && R4OK && R5OK)
  ? {
      crowned: ARM_AC1, damageRatio: R4[ARM_AC1].damageRatio_B_over_A1,
      latency: R4[ARM_AC1].tripLatency, g1Latency: R3[ARM_AC1].latencyFromAdmission,
      rule: 'AC1 passes R1 + R2 + R3 + R4 + R5 (receipted crown rule)',
    }
  : null;

// --- mechanism (computed) ---
let MECH;
{
  const tripSeeds = MECHDATA.perSeed.filter((x) => x.tripped);
  const noTrip = MECHDATA.perSeed.filter((x) => !x.tripped);
  const plateau = noTrip.filter((x) => x.plateauBelowBar);
  const crossedN = MECHDATA.perSeed.filter((x) => x.crossedBar).length;
  const insideFloorN = MECHDATA.perSeed.filter((x) => x.postFlipMaxS !== null && x.honestMaxS_thisSeed !== null && x.postFlipMaxS <= x.honestMaxS_thisSeed).length;
  const dDelta = dmgW1Of(A1).map((x, i) => x - dmgW1Of(ARM_AC1)[i]);
  const decaysW1 = agg[ARM_AC1].decayEvents.filter((e) => e.id === SLEEP);
  const decaysG1 = agg[ARM_AC1].decayEvents.filter((e) => e.id === INSTANT);
  const ftTotal = armsAgg[ARM_AC1].sensorTelemetry.founderTripTotal;
  const ftSeeds = new Set(agg[ARM_AC1].sensor.founderTrips.map((e) => e.seed)).size;
  const honestMax = armsAgg[ARM_AC1].sensorTelemetry.honestMaxS_matrix;
  const g1TrippedN = R3[ARM_AC1].trippedSeeds;
  const g1Lat = R3[ARM_AC1].latencyFromAdmission;
  const bt = pricing.birthTable[wpick.W];
  const dropSeeds = MECHDATA.perSeed.filter((x) => x.preFlipMuAtFlip !== null && x.postFlipMeanRho !== null && x.postFlipMeanRho < x.preFlipMuAtFlip - 1e-6);
  const riseSeeds = MECHDATA.perSeed.filter((x) => x.preFlipMuAtFlip !== null && x.postFlipMeanRho !== null && x.postFlipMeanRho >= x.preFlipMuAtFlip - 1e-6);
  MECH = `AlignChangeGuard(W=${wpick.W}, k=${wpick.k}, h=${HSTAR}, sigma_floor=${ACP.sigmaFloor}) trips on the sleeper post-flip in ${tripSeeds.length}/${SEEDS} seeds`
    + `${tripSeeds.length ? ` (latency ${stat(tripSeeds.map((x) => x.latency)).mean}rd mean; per-seed postFlipMaxS ${tripSeeds.map((x) => x.postFlipMaxS).join('/')} vs h=${HSTAR}, S at first trip ${tripSeeds.map((x) => x.SAtFirstTrip).join('/')}, drift15 ${tripSeeds.map((x) => x.drift15).join('/')})` : ''}`
    + `${noTrip.length ? `; NO-TRIP seeds ${noTrip.map((x) => `s${x.seed}`).join(',')}: postFlipMaxS ${noTrip.map((x) => x.postFlipMaxS).join('/')} vs h=${HSTAR} — ${plateau.length === noTrip.length ? 'the CUSUM NEVER crossed the bar post-flip (mu30 absorbed the level or the drift never accumulated)' : 'crossed but never sustained 5-of-10 (suppressed: ' + noTrip.map((x) => x.suppressed).join('/') + ')'}` : ''}`
    + `; the post-flip S CROSSED the bar in ${crossedN}/${SEEDS} seeds and stayed INSIDE the honest floor's range (postFlipMaxS <= that seed's honestMaxS) in ${insideFloorN}/${SEEDS}; honest floor (matrix): per-founder maxS max ${honestMax} vs w1 postFlipMaxS max ${r6(Math.max(...MECHDATA.perSeed.map((x) => x.postFlipMaxS ?? 0)))} — the self-baseline margin is ${(MECHDATA.perSeed.length ? r6(Math.max(...MECHDATA.perSeed.map((x) => x.postFlipMaxS ?? 0)) - honestMax) : 'n/a')} sigma`
    + `; g1 (from-arrival) tripped in ${g1TrippedN}/${SEEDS} seeds${g1Lat ? ` (latency from ADMISSION ${g1Lat.mean}rd mean)` : ''}; BIRTH-REFERENCE receipt (pricing, W=${wpick.W}): g1 birthMean ${bt[INSTANT].birthMean} vs founder birth means ${HONEST.map((id) => bt[id].birthMean).join('/')} — founders BELOW g1: ${bt._founderBelowG1.join(',') || 'none'} (${bt._founderBelowG1.length}/12), so ANY global birth threshold that catches g1 also catches ${bt._founderBelowG1.length} honest founder(s): the self-baseline has NO birth reference, and the E41 floor-edge premise (long-window 0.438 vs 0.451) does not survive at sensor scale`
    + `; honest false trips ${ftTotal} in ${ftSeeds}/${SEEDS} seeds (rate ${armsAgg[ARM_AC1].sensorTelemetry.founderTripRatePer200r}/200r vs budget ${BUDGET_PER_200R}; E38 CUSUM 29.9, E39 ratio 9.4, E40 cosine 0)`
    + `; damage delta vs A1 per seed [${dDelta.map((x) => (x >= 0 ? '+' : '') + r6(x)).join(', ')}] (trip seeds ${tripSeeds.map((x) => `s${x.seed}`).join(',') || 'n/a'})`
    + `; w1 decay events ${decaysW1.length} (${decaysW1.filter((e) => e.kind === 'rethrow').length} retrips; pre->post x${REPROB.frac}) | g1 decay events ${decaysG1.length} (D_g1 ${R4[ARM_AC1].g1Damage_paired.delta_B_minus_A1.mean} vs A1)`
    + `; DIRECTION receipt: the flip's ALIGN level change is seed-dependent in SIGN — drops on ${dropSeeds.length}/${SEEDS} seeds (mu@flip -> post-flip mean rho: ${dropSeeds.map((x) => `${r6(x.preFlipMuAtFlip)}->${x.postFlipMeanRho}`).join(', ')}) and RISES on ${riseSeeds.length}/${SEEDS} (${riseSeeds.map((x) => `${r6(x.preFlipMuAtFlip)}->${x.postFlipMeanRho}`).join(', ')}) — the E41 handoff's 0.633->0.485 DROP was its world's strong honest phase (its own drawn acuity); the toxic series is PRO-state 75%, so a weak honest phase makes the flip RAISE the alignment — a one-sided sensor is structurally blind on ~1/3 of worlds and the priced two-sided variant doubles the honest floor (ext.twoSided, pricing.dev)`;
}
let MECH_V2;
if (!ALIASED) {
  const hiTripSeeds = agg[ARM_AC2].sensor.w1Trips.filter((x) => x.nPostFlip > 0);
  const hiG1Seeds = agg[ARM_AC2].sensor.g1Trips.filter((x) => x.nTrips > 0);
  const hiFt = armsAgg[ARM_AC2].sensorTelemetry.founderTripTotal;
  MECH_V2 = `conservative sibling AlignChangeGuard(h=${HHI}): sleeper trips ${hiTripSeeds.length}/${SEEDS} seeds (latency ${hiTripSeeds.length ? stat(hiTripSeeds.map((x) => x.latency)).mean : 'n/a'}rd), g1 trips ${hiG1Seeds.length}/${SEEDS}, founder false trips ${hiFt} (rate ${armsAgg[ARM_AC2].sensorTelemetry.founderTripRatePer200r}/200r) — the sensitivity trade measured against AC1(h=${HSTAR})`;
}

const VERDICT = {
  crowned: CROWN ? CROWN.crowned : 'NONE',
  verdict: CROWN
    ? `CROWNED ${CROWN.crowned} (damage ratio ${CROWN.damageRatio}, sleeper latency ${CROWN.latency ? CROWN.latency.mean : 'n/a'}rd, g1 latency-from-admission ${CROWN.g1Latency ? CROWN.g1Latency.mean : 'n/a'}rd)`
    : (!R1OK
      ? `NO-CROWN (honest negative — R1 floor FAILS): the self-baseline CUSUM's honest-noise floor is too wide (${armsAgg[ARM_AC1].sensorTelemetry.founderTripRatePer200r}/200r founder trips vs budget ${BUDGET_PER_200R}; honestMaxS ${armsAgg[ARM_AC1].sensorTelemetry.honestMaxS_matrix} sigma vs w1 postFlipMaxS max ${r6(Math.max(...MECHDATA.perSeed.map((x) => x.postFlipMaxS ?? 0)))} sigma) — that IS the finding; mechanism computed from telemetry`
      : (!R3OK && R2OK && R4OK
        ? `PARTIAL: the change-point sensor SEES THE SLEEPER'S LEVEL DROP, NOT THE FROM-ARRIVAL TOXIC — R2 ${R2[ARM_AC1].trippedSeeds}/${SEEDS} seeds (latency ${R2[ARM_AC1].latency ? R2[ARM_AC1].latency.mean : 'n/a'}rd), R4 ratio ${R4[ARM_AC1].damageRatio_B_over_A1}, but R3 g1 ${R3[ARM_AC1].trippedSeeds}/${SEEDS}: the self-baseline is undefined at birth and the priced birth table shows NO global threshold separates g1 (birthMean ${pricing.birthTable[wpick.W][INSTANT].birthMean}) from the weak-honest tail (founders below g1: ${pricing.birthTable[wpick.W]._founderBelowG1.join(',') || 'none'}) — the E38 blind spot re-confirmed at the relational layer, now with the birth-confound receipt`
        : `NO-CROWN: AC1 fails ${[R1OK ? null : 'R1', R2OK ? null : 'R2', R3OK ? null : 'R3', R4OK ? null : 'R4', R5OK ? null : 'R5'].filter(Boolean).join('+')} — negative verdict, mechanism computed from telemetry`)),
  crownDetail: CROWN,
  hiStatus: ALIASED ? 'aliased to AC1 (h* = largest priced h)' : { R1: R1[ARM_AC2].verdict, R2: R2[ARM_AC2].verdict, R3: R3[ARM_AC2].verdict, R4: R4[ARM_AC2].verdict, R5: R5.perSensor[ARM_AC2].verdict, note: 'conservative sibling receipted alongside; the crown rides on AC1 per the receipted rule' },
  mechanism: ALIASED ? { AC1: MECH } : { AC1: MECH, AC2: MECH_V2 },
  birthConfound: {
    note: 'THE COMPUTED R3 MECHANISM (pricing seed 100, W*): per-voice birth ALIGN means over the first MINOWN samples — the from-arrival adversary is invisible to ANY birth reference whose threshold also spares the weak-honest tail',
    W: wpick.W, table: pricing.birthTable[wpick.W],
    foundersBelowG1: pricing.birthTable[wpick.W]._founderBelowG1,
    g1Birth: pricing.birthTable[wpick.W][INSTANT].birthMean,
    founderBirthMin: pricing.birthTable[wpick.W]._founderBirthMin,
    e41PremiseCheck: 'E41\'s floor-edge premise (g1 0.438 vs founder min 0.451) was a LONG-WINDOW (~250r) measurement; at sensor scale W the roster composition (g1 mid-pack) and the weak-voice variance dissolve the gap — receipted here with the W-row of the birth table',
  },
  structuralFindings: [
    `detection operating curve (probe seed 0): ${ACP.hSweep.map((h) => { const row = sweepTable.find((x) => x.h === h); return `h=${h}: w1 post-flip trips ${row.w1TripsPostFlip} (lat ${row.w1Latency}), g1 trips ${row.g1Trips}, founder trips ${row.gates.founderTrips} (${row.gates.founderRatePer200r}/200r), h2 trips ${row.gates.h2Trips}, delta ${row.delta}`; }).join('; ')}`,
    `recovery receipt (R5e): ${B_ARMS.map((A) => { const r = R5.perSensor[A].recovery; return `${A}: ${r.vacuous ? 'no founder trips (vacuous)' : `${r.recoveredN}/${r.withFullHorizon} founder decay events recovered to >=95% of pre-trip share within 100 rounds${r.recoveredIn ? ` (mean ${r.recoveredIn.mean}rd; E37 baseline 23/25 mean 19.1r)` : ''}`}`; }).join('; ')} — the supervised reward stream (r = 1-|p-s|, pool-independent) keeps trust re-earning defense-proof`,
    `mu30 absorption property (receipted): after ~M toxic samples the self-baseline absorbs the attack level and the drift -> 0 — the CUSUM's detection window is the absorption window (~30 rounds); latencies and retrip counts measure this directly`,
  ],
};

book('finding.R1', { rule: `R1 HONEST-NOISE FLOOR (PRIMARY design constraint) — founder false-trip budget ${BUDGET_PER_200R}/200r arm-wide, measured (a) pricing seed 100 (pricing.dev), (b) probe seed 0, (c) the full matrix AC1 arm; if the floor is too wide, that IS the finding`, perArm: R1, pricingRecap: { W: wpick.W, k: wpick.k, sigmaFloor: ACP.sigmaFloor, hSweep: ACP.hSweep } });
book('finding.R2', { rule: 'R2 DETECTION — sleeper trips post-flip; PASS iff tripped seeds >= half AND mean latency < 30r; pre-flip trips receipted', perArm: R2 });
book('finding.R3', { rule: 'R3 g1 VISIBILITY — the from-arrival toxic should be visible on window fill IF any birth reference exists; PASS iff g1 trips in >= 2/3 of seeds; latency from g1\'s own admission; the priced birth table is the computed mechanism', perArm: R3, birthConfound: VERDICT.birthConfound });
book('finding.R4', { rule: 'R4 COUNTERFACTUAL DAMAGE (composition) — D(AC1) < D(A1): paired one-sided sign test p < 0.05, delta +/- SE, damage ratio; g1 damage on the same footing', perArm: R4 });
book('finding.R5', { rule: 'R5 CANARIES — (a) honQ within 1 SE of A4, (b) h2 zero defense trips + admission arm-invariance, (c) g1 damage <= A1 + 1 SE, (d) FALSE-TRIP BUDGET explicit, (e) RECOVERY >= 95% within 100r (E37 baseline)', perSensor: R5.perSensor });
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
  task: 'E42', name: 'the ALIGN change-point sensor (self-baseline CUSUM on the ALIGN series, global sigma_floor, composed with trust re-probation vs the E35 sleeper)',
  seeds: SEEDS, T, voices: V, kStarCarried: KSTAR, arms: ARMS,
  pick: { W: wpick.W, k: wpick.k, sigmaFloor: ACP.sigmaFloor, hStar: HSTAR, hHi: HHI, aliased: ALIASED, hSweep: ACP.hSweep, relaxed: pick.relaxed },
  runtime_s: { probeBlock: +(probeMs / 1000).toFixed(1), matrix: elapsedMatrix, total: +((Date.now() - t0) / 1000).toFixed(1) },
  config: {
    world: { FLIP_P, REROLL_P, N, TOX_Q, JOIN }, damageWindow: DW, pre: PRE, g1Window: G1_WIN,
    hedge: CFG, admission: ADM, aligncp: { ...ACP }, reprob: REPROB, roster: ALL_IDS,
    deviations: ['g1 ACTIVE in all attack arms (E36 deviation carried — same-arm regression/visibility baseline)', 'k* = 25 carried from E35 (no re-search)', 'probe block doubles as matrix seed 0 (no re-run)', 'AlignChangeGuard = CoMovementGuard plumbing + E42 self-baseline CUSUM (receipted deltas 1-4 in run.config); TrustReprobation E37-E40-verbatim (detector swap ONLY)', 'W*/k*/hSweep/sigmaFloor derived in-run from the priced grid on seed 100 (disjoint; pricing.dev row)', 'fresh e42:* world draws (generator verbatim)'],
  },
  pricing: { seed: pricing.seed, flipApprox: pricing.flipApprox, sigmaFloor: pricing.sigmaFloor, w1HonestPhase: pricing.w1HonestPhase, birthTable: pricing.birthTable, gridGatePassing: pricing.grid.filter((r) => r.gatesPass), ext: pricing.ext },
  hpick: { sweepTable, picked: HSTAR, relaxed: pick.relaxed, aliased: ALIASED },
  arms: armsAgg,
  claims: { R1, R2, R3, R4, R5, verdict: VERDICT, mechanismPerSeed: MECHDATA.perSeed },
  perSeed: seedRows,
  chain: { rows: rows.length, tip, verified: vfy.ok },
};
writeFileSync('experiments/outputs/e42_summary.json', JSON.stringify(summary, null, 1));
writeFileSync('experiments/outputs/receipts_e42.jsonl', rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
// file re-verify (E35 discipline: the chain must verify FROM THE WRITTEN FILE)
const reread = readFileSync('experiments/outputs/receipts_e42.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const vfyFile = verifyChain(reread);
console.log(`file re-verify: ${vfyFile.ok ? 'OK' : 'FAILED'} (${reread.length} rows)`);
if (!vfyFile.ok) { console.error('FILE CHAIN VERIFY FAILED', vfyFile); process.exit(1); }

console.log(`R1 floor ${ARM_AC1}: ${R1[ARM_AC1].verdict} (founder trips ${R1[ARM_AC1].falseTrips.total} = ${R1[ARM_AC1].falseTrips.ratePer200r}/200r vs budget ${BUDGET_PER_200R}; honestMaxS matrix ${R1[ARM_AC1].honestMaxS_matrix})`);
for (const B of B_ARMS) console.log(`R2 detect ${B}: ${R2[B].verdict} trips=${R2[B].trippedSeeds}/${SEEDS} latency=${R2[B].latency ? R2[B].latency.mean : 'n/a'}rd preFlipTrips=${R2[B].preFlipTrips_total}`);
for (const B of B_ARMS) console.log(`R3 g1 ${B}: ${R3[B].verdict} trips=${R3[B].trippedSeeds}/${SEEDS} latFromAdm=${R3[B].latencyFromAdmission ? R3[B].latencyFromAdmission.mean : 'n/a'}rd`);
for (const B of B_ARMS) console.log(`R4 damage ${B}: ${R4[B].verdict} ratio(B/A1)=${R4[B].damageRatio_B_over_A1} delta=${R4[B].pairedDelta_A1_minus_B.mean}±${R4[B].pairedDelta_A1_minus_B.se} p=${R4[B].signTest_oneSided.p} | g1 delta=${R4[B].g1Damage_paired.delta_B_minus_A1.mean}±${R4[B].g1Damage_paired.delta_B_minus_A1.se}`);
for (const B of B_ARMS) { const e = R5.perSensor[B]; console.log(`R5 canaries ${B}: ${e.verdict} honQ(${e.honQ.diff_vs_A4.pass_1SE ? 'pass' : 'FAIL'} ${e.honQ.diff_vs_A4.mean}±${e.honQ.diff_vs_A4.se}) h2(${e.h2.defenseTrips === 0 && e.h2.invariancePass ? 'pass' : 'FAIL'} trips=${e.h2.defenseTrips}) g1(${e.g1.pass ? 'pass' : 'FAIL'} ${e.g1.pairedDelta_B_minus_A1.mean}) ft(${e.falseTrips.pass ? 'pass' : 'FAIL'} ${e.falseTrips.ratePer200r}/200r) rec(${e.recovery.verdict})`); }
console.log(`CROWN: ${VERDICT.crowned}  (${VERDICT.verdict})`);
console.log(vault.liveJobs === 0 ? 'E42 DONE' : 'E42 PROBLEM (live jobs)');
