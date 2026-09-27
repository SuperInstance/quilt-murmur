// E43 — PROVENANCE-STRUCTURAL COUPLING (sixth axis: the journaled edge graph itself)
// ==================================================================================================
// Provenance: E42's receipted handoff (receipt chain tip 0xf38fe005bcea56fa, commit c5dcc30) names
// the two LIVE unpriced detector families after the five-axis ladder closed (mean E38, variance
// E39, relational cosine E40, side-betrayal E41, ALIGN change-point E42 — all dead, all priced
// first): (1) provenance-structural coupling — THIS LANE, the field's #2 pick; (2) adversarial
// economics (GAN framing).
//
// PREMISE (formalized): per-voice OUTPUT statistics failed to separate the E24-style toxic sleeper
// from honest founders — E41 proved the toxic series is distribution-identical to an honest q=0.75
// voice at the vote level (marginal, state-correlation, and flip-rate 2q(1-q) all identical), and
// E42 proved the flip's relational ALIGN change is seed-dependent in SIGN. Maybe the SIGNATURE
// lives in PROVENANCE STRUCTURE: not WHAT the voice says but HOW ITS EDGES COUPLE to the field's
// journaled graph — when it entered, whose edges its own edges echo (the forensic parent set),
// the breadth of that parent set, the growth rate of its degree. The field's own Admission module
// journals EVERY novelty edge {t, v, prev, jump, indep} with independence fixed FORENSICALLY at
// creation (edge-precedence: did ANY other sender have a value+jump-aligned edge at t-L, L>=1?)
// — a provenance graph the pool can read WITHOUT oracle access. E43 computes the structural
// statistics FROM THAT JOURNAL and prices them under the house law.
//
// THE STRUCTURAL HYPOTHESIS, stated so it can die: an adversarial series must leave a DIFFERENT
// echo-coupling footprint than an honest voice — its edges are value-collisions with whatever
// incumbent band its values land on (the "phantom twin"), while honest founders' edges originate
// in their own state reads and collide only with accidental near-twins (|q_i - q_j| <= tol).
// Statistics (all computed from adm's journal — the field's own forensic record, no oracle):
//   DEP — dep-share: trailing fraction of a voice's edges whose PARENT set is nonempty
//         (dependent = echoed at least one earlier edge at lag 1..6 within tol).
//   PAR — parent breadth: distinct parent senders over the trailing window (parent-degree
//         profile; copiers concentrate on one parent, coincidences stay diffuse — priced, not assumed).
//   CAD — cadence: edges per round over the trailing window (degree growth-rate). A-priori
//         half-dead by E41's receipt (the honest rate 2q(1-q) spans [0.095, 0.5] and contains the
//         toxic's 0.375 exactly) — priced anyway, because the LAW prices before it kills.
// PARENTS are recomputed OFFLINE from the journal with the field's own matching rule and
// SELF-CHECKED against the journaled indep flags over EVERY edge (replay receipt: recomputed-
// empty-parents <=> indep, mismatches must be 0) — the parent graph is provably the field's own.
//
// ProvenanceStructGuard — for the carry-forward path (ONLY if a statistic passes pricing):
// CoMovementGuard plumbing (E40) with the trip statistic swapped: trailing-window structural
// level > bar SUSTAINED 5-of-10 evaluation rounds (E38/E39/E40 gate shape), evaluation gated on
// (a) the voice being ADMITTED (E42's MINOWN analog: the structural series of a probationary
// voice is the admission module's own territory) and (b) >= Emin edges in the window (the
// structural blind spot is itself priced: founder-rounds below Emin are unevaluable and the
// coverage is receipted). Reset-on-trip; guard window {from: t+1, until: t+40} (epsNew
// re-probation, E37 plumbing); rethrow kinds after. Consequence on trip: TrustReprobation
// (E37-E40 VERBATIM — HedgeTrust weight x0.5 via absorb, re-earns through the normal path)
// + influence re-probation. Trip events carry trail30/refMean as null (field names kept so
// TrustReprobation stays byte-identical; the structural statistic has no trail/ref semantics —
// receipted) plus val/parents (the structural measurement the trip fired on).
//
// DECISION RULES (receipted EXACTLY, BEFORE the full run; R1-R5 numbering per house law):
//   R1 HONEST-NOISE FLOOR (PRIMARY, PRICED FIRST on DISJOINT seed 100): per grid row
//      (stat, Tw, Emin, bar): founder false-trip rate <= 1.0/200r arm-wide (<= 24 founder trips
//      on the pricing seed; E38 29.9, E39 9.4, E40 0, E41 gates-fail, E42 0.458-under-wide-bar),
//      h2 trips = 0, w1 PRE-flip trips = 0. If NO row passes, E43 dies at pricing — the SIXTH
//      dead axis, receipted with the pricing numbers (E41 precedent: that is a crown-jewel null,
//      and no engine composition is built on a dead statistic).
//   R2 DETECTION (if carried): sleeper trips post-flip in >= half the seeds, mean latency < 30r.
//   R3 g1 VISIBILITY: the from-arrival toxic trips in >= 2/3 of seeds, latency from ITS OWN
//      admission round (the structural series only exists once the voice murmurs — pre-admission
//      blindness is receipted as admission's territory, E37).
//   R4 COUNTERFACTUAL DAMAGE: D(AC1) < D(A1), paired one-sided sign test p < 0.05; damage ratio
//      reported; g1 damage on the same footing (an increase beyond +1 SE fails R5c).
//   R5 CANARIES: (a) honQ within 1 SE of A4; (b) h2 zero defense trips + per-seed admission
//      arm-invariance; (c) g1 damage <= A1 + 1 SE; (d) false-trip budget explicit; (e) recovery
//      >= 95% of pre-trip share within 100r (E37 baseline 23/25, mean 19.1r).
//   CROWN iff R1+R2+R3+R4+R5 all pass on AC1. No pre-drafted text: every clause filled from
//   measured numbers.
//
// PICK RULES (receipted BEFORE the matrix): grid = {DEP,PAR,CAD} x Tw {40,80} x Emin {3,5} x
// per-stat bars (DEP {0.3,0.5,0.7}, PAR {2,3,4}, CAD {0.25,0.35,0.45}) = 36 rows, priced on seed
// 100 (disjoint from matrix seeds 0-5). (stat*,Tw*,Emin*) = argmax margin (= w1 post-flip peak
// statistic - max over honest founders' peak statistic) among gate-passing DETECTING rows; ties
// -> larger Tw, then larger Emin, then LARGER bar. barSweep = up to 3 bars at the pick:
// {smallest detecting gate-passing bar, median detecting bar, largest gate-passing bar} deduped.
// Fallback ladder: no detecting gate-passer -> argmax margin among gate-passers
// (relaxed='no-pricing-detection'); no gate-passer -> NO-CANDIDATE (sixth axis dead at pricing).
// The probe (seed 0, full engine, timed) sweeps the barSweep and picks bar* = argmax
// delta_b = D_w1(A1,s0) - D_w1(AC_b,s0) among bars passing ALL probe gates: (i) h2 zero trips on
// seed 0; (ii) D_g1 <= A1 + 1e-4; (iii) founder rate on seed 0 <= 1.0/200r; ties -> LARGER bar.
// Fallback: none pass all -> argmax delta among gate-(i) passers (relaxed='founder-only') ->
// argmax delta (relaxed='none'). AC2 = the largest swept bar (aliases AC1 if equal). The probe
// doubles as matrix seed 0 (no re-run).
//
// PRICING WORLD (standalone, telemetry-only — the real A1 wiring MINUS the engine sheet): the
// full per-round loop (Provenance.inspect -> Admission.observe -> rewards -> HedgeTrust.update ->
// prov.penalize -> adm.reattribute -> MurmurBus.pool -> adm.notePooled -> trust.absorb) runs
// WITHOUT the QuiltEngine: MurmurBus.pool IS the sheet's pool.hedge formula (E42's in-run verify
// checks agreed within 1e-9 — receipted). Two passes: pass-1 runs w1 honest FOREVER to measure
// t_adm EXACTLY (E42's pricing approximated 189; the structural premise is admission-anchored so
// E43 prices with the measured value), then the priced world flips w1 at t_adm + 25 (KSTAR
// carried from E35's probe-optimal; GAN strategy search CLOSED in E35, not re-run). The journal
// of the PRICED world is the pricing substrate. Admission gating IS simulated here (edges, echo,
// admitAt all real) — E43's statistics are journal-derived, so the journal must be the field's
// own, not an approximation.
//
// WORLD (E35-E42 verbatim, fresh e43:* draws): 12 honest founders (mixed acuity, a1 = 0.9) + h2
// honest late-joiner (t=150, honest forever — false-positive canary) + g1 flasher (toxic from
// arrival, t=150) + w1 sleeper (t=150, honest phase = e24 h1 generator verbatim, flips at
// t_adm+25). T=400, 6 seeds planned; probe-cut rule: projected > 170s -> cut 6 -> 4, RECEIPTED.
// Paired arms with IDENTICAL worlds. Damage method (E35-E40 verbatim): D = mean over the
// post-flip window of |err(pool) - err(pool with that attacker zeroed)|, reference-side only.
//
// RNG DOCTRINE (binding, E35-E42 verbatim): MothVault offline:true, one harvest, per-purpose
// stream keys 'e43:<purpose>:<seed>' via streamFor; NO Math.random. Pricing seed 100 DISJOINT.
//
// Run: node experiments/e43_provenance.mjs [seeds]   (E43_DEV=1 -> 1 seed; E43_PRICE=1 -> pricing print + exit)

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
let SEEDS = Number(process.argv[2] || (process.env.E43_DEV ? 1 : 6));
const FLIP_P = 0.02, REROLL_P = 0.01;
const JOIN = 150;
const TOX_Q = 0.25;                            // E24 toxic formula (verbatim)
const PRE = { from: 120, to: 150 };
const DW = 150;
const KSTAR = 25;                              // carried from E35's probe (probe-optimal)
const SLEEP = 'w1', INSTANT = 'g1', JOINER = 'h2';
const HONEST = Array.from({ length: N }, (_, i) => `a${i + 1}`);
const ALL_IDS = [...HONEST, SLEEP, INSTANT, JOINER];
const V = ALL_IDS.length;
const CFG = { eta: 0.25, share: 0.02 };
const ADM = {
  beta: 0.12, alpha: 0.25, novSpread: 0.15,
  coldStart: true, admitWindow: 40, epsNew: 0.15,
  minEdgesIndep: 2, admitErr: 0.5, capShare: 0.10,
};
const PST = {
  stats: ['DEP', 'PAR', 'CAD'],
  Tws: [40, 80],          // trailing round-windows over the journal
  Emins: [3, 5],          // edges-in-window required for the statistic to be DEFINED (evaluable)
  bars: { DEP: [0.3, 0.5, 0.7], PAR: [2, 3, 4], CAD: [0.25, 0.35, 0.45] },
  sustainWin: 10,         // sustained 5-of-10 evaluation rounds (E38/E39/E40 gate shape)
  sustainNeed: 5,
  guardRounds: 40,        // epsNew re-probation window (E36-E42 verbatim)
  stat: null, Tw: null, Emin: null, barSweep: null, // FILLED IN-RUN from the pricing pick
};
const REPROB = { frac: 0.5, horizon: 100 };    // E37-E42 TrustReprobation verbatim
const TOL = 1e-9;
const PROBE_G1_TOL = 1e-4;                     // receipted probe gate (ii) tolerance
const PRICE_SEED = 100;                        // design-time pricing seed — DISJOINT from matrix seeds 0-5
const BUDGET_PER_200R = 1.0;                   // explicit founder false-trip budget line (R1)
const PROBE_MAX_B = 3;                         // probe sweeps at most 3 priced bar candidates

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

// ---------------- world (E35-E42 verbatim; stream keys e43:*) ----------------
function genWorld(seed, harvest, vault) {
  const wR = makeRng(harvest, vault, `e43:world:${seed}`);
  const qR = makeRng(harvest, vault, `e43:skill:${seed}`);
  const xR = makeRng(harvest, vault, `e43:tox:${seed}`);
  const shR = makeRng(harvest, vault, `e43:sleep:${seed}`);
  const nhR = makeRng(harvest, vault, `e43:h2:${seed}`);
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
  for (let i = 0; i < N; i++) vR.push(makeRng(harvest, vault, `e43:vote:${seed}:${i}`));
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
  return { s, votes, toxV, sleepH, h2V, q };
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
  return { id: `provstructplane-${V}`, title: `E43 provenance-structural lane (${V} voice slots)`, cells };
}

// ---------------- PARENT SCAN — the field's own forensic rule, recomputed ----------------
// For edge e = {t, v, jump} of sender self: PARENTS(e) = every other sender k with an edge
// ke at EXACTLY t-L (L in 1..maxLag), |ke.v - e.v| <= tol AND |ke.jump - e.jump| <= tol.
// This is Admission.isIndependent's exact semantics (admission.mjs), inverted: indep === true
// <=> PARENTS(e) is empty. Parents only involve EARLIER rounds (L >= 1), so scanning the final
// journal reproduces the online verdict EXACTLY — the replay receipt asserts this over every
// edge (mismatches must be 0). Reads adm.edges / adm.maxLag / adm.tol (public journal fields —
// telemetry-only composition, zero murmur/ changes).
function matchParents(adm, e, selfId) {
  const parents = [];
  let minLag = null;
  for (const [k, list] of adm.edges) {
    if (k === selfId || list.length === 0) continue;
    // list is append-ordered by t, unique t per sender (<=1 edge/sender/round): binary search
    for (let L = 1; L <= adm.maxLag; L++) {
      const tt = e.t - L;
      let lo = 0, hi = list.length - 1, found = null;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (list[mid].t === tt) { found = list[mid]; break; }
        if (list[mid].t < tt) lo = mid + 1; else hi = mid - 1;
      }
      if (found && Math.abs(found.v - e.v) <= adm.tol && Math.abs(found.jump - e.jump) <= adm.tol) {
        if (!parents.includes(k)) parents.push(k);
        if (minLag === null || L < minLag) minLag = L;
        break; // nearest lag for THIS parent
      }
    }
  }
  return { parents, minLag };
}
// journal replay: recompute parents for EVERY edge; assert (parents empty) === indep; return
// per-voice structural profile (the mechanism receipt) + the mismatch count (must be 0) +
// pmap: Map(edge object -> {parents, minLag}) — parents are config-INDEPENDENT (they depend only
// on earlier rounds, all journaled by the time an edge exists), so they are computed ONCE here
// and reused by every grid scan and by the guard's cache (exactness: a parent of e must sit at
// t = e.t - L < e.t, so the full parent set exists the moment e does).
function replayJournal(adm) {
  const per = {};
  const pmap = new Map();
  let mismatches = 0, nEdges = 0;
  for (const [id, list] of adm.edges) {
    let dep = 0;
    const parentSet = new Set();
    let lagSum = 0, lagN = 0;
    for (const e of list) {
      const hit = matchParents(adm, e, id);
      pmap.set(e, hit);
      nEdges++;
      if (hit.parents.length > 0) { dep++; for (const p of hit.parents) parentSet.add(p); lagSum += hit.minLag; lagN++; }
      if (hit.parents.length === 0 !== e.indep) mismatches++;
    }
    per[id] = {
      nEdges: list.length,
      depRate: list.length ? r6(dep / list.length) : null,
      distinctParents: parentSet.size,
      parentsList: [...parentSet],
      meanMinLag: lagN ? r6(lagSum / lagN) : null,
    };
  }
  return { per, mismatches, nEdges, pmap };
}

// ---------------- STRUCTURAL STATISTIC SERIES over the journal ----------------
// For voice i and round r (0-indexed world round; journal t = r+1): window = edges with
// journal t in (r+1-Tw, r+1]. Value per stat, DEFINED iff edges-in-window >= Emin:
//   DEP: depCount / edges          PAR: distinctParents (0 if no dep edges)
//   CAD: edges / Tw
// Returns Map id -> { ts: [r], val: [number|null] } (evaluation rounds only where defined is
// false -> val null, not pushed to the sustained window — E42's evaluation-round convention).
function statSeries(adm, pmap, statKind, Tw, Emin) {
  const out = new Map();
  for (const [id, list] of adm.edges) {
    const ts = [], vals = [];
    let lo = 0; // sliding window lower index over the edge list
    for (let r = 0; r < T; r++) {
      const tHi = r + 1, tLo = tHi - Tw; // window: journal t in (tLo, tHi]
      while (lo < list.length && list[lo].t <= tLo) lo++;
      let hi = lo;
      while (hi < list.length && list[hi].t <= tHi) hi++;
      const n = hi - lo;
      if (n < Emin) continue; // UNDEFINED this round (the priced structural blind spot)
      let depN = 0;
      const pset = new Set();
      for (let i = lo; i < hi; i++) {
        const { parents } = pmap.get(list[i]);
        if (parents.length > 0) { depN++; for (const p of parents) pset.add(p); }
      }
      const val = statKind === 'DEP' ? depN / n : statKind === 'PAR' ? pset.size : n / Tw;
      ts.push(r); vals.push(val);
    }
    out.set(id, { ts, vals });
  }
  return out;
}
// trip scan over one voice's series (E42's sustained/reset convention, level-bar form):
// crossed = val > bar on evaluation rounds; sustained = 5 of the last 10 evaluation rounds;
// reset-on-trip clears the sustained window; NO guard-window simulation at pricing (E42
// convention: the pricing is the CONSERVATIVE floor estimate; suppression measured in-probe).
function scanTrips(ser, bar, flip) {
  const trips = [];
  const sus = [];
  let peak = 0, peakPre = 0, peakPost = 0, nEval = 0, nUneval = 0;
  const { ts, vals } = ser;
  for (let i = 0; i < ts.length; i++) {
    const v = vals[i];
    nEval++;
    if (v > peak) peak = v;
    if (ts[i] < flip) { if (v > peakPre) peakPre = v; } else { if (v > peakPost) peakPost = v; }
    const crossed = v > bar;
    sus.push(crossed);
    if (sus.length > PST.sustainWin) sus.shift();
    const sustained = sus.length >= PST.sustainWin && sus.filter(Boolean).length >= PST.sustainNeed;
    if (sustained) { trips.push({ t: ts[i], val: r6(v) }); sus.length = 0; }
  }
  // unevaluable rounds: world rounds where the voice was present but undefined.
  // presence: founders all T rounds; joiners from JOIN.
  return { trips, peak: r6(peak), peakPre: r6(peakPre), peakPost: r6(peakPost), nEval };
}

// ---------------- STANDALONE WORLD LOOP (the real A1 wiring minus the engine sheet) ----------
// Per round: prov.inspect -> adm.observe -> rewards -> prov.penalize -> adm.reattribute ->
// pool = MurmurBus.pool (THE sheet formula, verify-agreed within 1e-9 in E40/E41/E42) ->
// adm.notePooled -> trust.update -> trust.absorb(prov.penalize). No defenses, no engine.
// flipAt: null -> w1 honest FOREVER (pass-1, measures t_adm); number -> w1 toxic from flipAt.
function runStandalone(world, flipAt) {
  const { s, votes, toxV, sleepH, h2V } = world;
  const trust = new HedgeTrust(ALL_IDS, CFG);
  const prov = new Provenance({});
  const adm = new Admission(ADM);
  const atkOf = (id) => (id === SLEEP ? { id: SLEEP, flip: flipAt } : id === INSTANT ? { id: INSTANT, flip: JOIN } : null);
  const pOf = (id, t) => {
    if (HONEST.includes(id)) return votes[t][Number(id.slice(1)) - 1];
    if (id === SLEEP) {
      const a = atkOf(id);
      if (t < JOIN) return 0.5;
      if (a.flip != null && t >= a.flip) return toxV[t];
      return sleepH[t] ?? 0.5;
    }
    if (id === INSTANT) return t >= JOIN ? toxV[t] : 0.5;
    if (id === JOINER) return t >= JOIN ? (h2V[t] ?? 0.5) : 0.5;
    return 0.5;
  };
  let w1Admit;
  for (let t = 0; t < T; t++) {
    const murmurs = [];
    for (let i = 0; i < N; i++) murmurs.push({ from: `a${i + 1}`, origin: null, p: votes[t][i] });
    if (t >= JOIN) {
      murmurs.push({ from: SLEEP, origin: null, p: pOf(SLEEP, t) });
      murmurs.push({ from: INSTANT, origin: null, p: pOf(INSTANT, t) });
      murmurs.push({ from: JOINER, origin: null, p: pOf(JOINER, t) });
    }
    prov.inspect(murmurs);
    adm.observe(murmurs);
    const rew = new Map();
    for (let i = 0; i < N; i++) rew.set(`a${i + 1}`, 1 - Math.abs(votes[t][i] - s[t]));
    for (const m of murmurs) if (!HONEST.includes(m.from)) rew.set(m.from, 1 - Math.abs(m.p - s[t]));
    const raw = prov.penalize(trust.weights());
    const infl = adm.reattribute(raw, murmurs, prov);
    const ps = ALL_IDS.map((id) => pOf(id, t));
    const ws = ALL_IDS.map((id) => infl.get(id) ?? 0);
    const pool = MurmurBus.pool(ps, ws);
    adm.notePooled(pool);
    if (w1Admit === undefined && t >= JOIN && adm.admitted(SLEEP)) w1Admit = t;
    trust.update(rew);
    trust.absorb(prov.penalize(trust.weights()));
  }
  return { adm, trust, w1Admit };
}

// ---------------- DESIGN-TIME PRICING (seed 100, disjoint; booked BEFORE any run row) ---------
function priceProvenanceStruct(harvest, vault) {
  const world = genWorld(PRICE_SEED, harvest, vault);
  // pass-1: honest-forever w1 -> EXACT t_adm (the structural premise is admission-anchored)
  const p1 = runStandalone(world, null);
  const tAdm = p1.w1Admit;
  const flip = tAdm == null ? JOIN + KSTAR : tAdm + KSTAR; // fallback approx if never admitted (receipted)
  const neverLaunched = tAdm == null;
  // priced world: w1 flips at t_adm + 25
  const priced = runStandalone(world, flip);
  const adm = priced.adm;
  // roster collision structure (the mechanism receipt): founder q lattices, twin pairs,
  // the phantom-twin band (founders whose q collides with the toxic's {0.25, 0.75} values)
  const q0 = Array.from({ length: N }, (_, i) => world.q[0][i]);
  const tol = adm.tol;
  const twinPairs = [];
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) if (Math.abs(q0[i] - q0[j]) <= tol) twinPairs.push([HONEST[i], HONEST[j]]);
  const phantomBand = HONEST.filter((id, i) => Math.abs(q0[i] - 0.75) <= tol); // toxic values {0.25,0.75}: collide iff |q - 0.75| <= tol
  const a1Band = HONEST.filter((id, i) => id !== 'a1' && Math.abs(q0[i] - 0.9) <= tol);
  // journal replay (the field's own forensic record, self-checked)
  const replay = replayJournal(adm);
  if (replay.mismatches !== 0) {
    console.error(`JOURNAL REPLAY FAILED: ${replay.mismatches} parent/indep mismatches over ${replay.nEdges} edges`);
    process.exit(1);
  }
  // grid scan (parent lookups come from replay.pmap — computed once, config-independent)
  const grid = [];
  for (const statKind of PST.stats) {
    for (const Tw of PST.Tws) {
      for (const Emin of PST.Emins) {
        const series = statSeries(adm, replay.pmap, statKind, Tw, Emin);
        // per-founder eval coverage (the priced structural blind spot)
        let evalRounds = 0, presentRounds = 0;
        const founderPeaks = {};
        for (const id of HONEST) {
          const ser = series.get(id) ?? { ts: [], vals: [] };
          evalRounds += ser.ts.length;
          presentRounds += T;
          founderPeaks[id] = ser.vals.length ? r6(Math.max(...ser.vals)) : 0;
        }
        const honestMax = r6(Math.max(...Object.values(founderPeaks)));
        const cov = presentRounds ? r6(evalRounds / presentRounds) : 0;
        for (const bar of PST.bars[statKind]) {
          let founderTrips = 0;
          for (const id of HONEST) founderTrips += scanTrips(series.get(id) ?? { ts: [], vals: [] }, bar, flip).trips.length;
          const h2sc = scanTrips(series.get(JOINER) ?? { ts: [], vals: [] }, bar, flip);
          const w1sc = scanTrips(series.get(SLEEP) ?? { ts: [], vals: [] }, bar, flip);
          const g1sc = scanTrips(series.get(INSTANT) ?? { ts: [], vals: [] }, bar, flip);
          const w1pre = w1sc.trips.filter((x) => x.t < flip);
          const w1post = w1sc.trips.filter((x) => x.t >= flip);
          const founderRate = founderTrips / ((N * T) / 200);
          const gatesPass = founderRate <= BUDGET_PER_200R && h2sc.trips.length === 0 && w1pre.length === 0;
          grid.push({
            stat: statKind, Tw, Emin, bar,
            founderTrips, founderRate: r6(founderRate), h2Trips: h2sc.trips.length,
            w1PreTrips: w1pre.length, w1PostTrips: w1post.length,
            w1PeakPre: w1sc.peakPre, w1PeakPost: w1sc.peakPost,
            g1Trips: g1sc.trips.length, g1Peak: g1sc.peak,
            honestMax, margin: r6(w1sc.peakPost - honestMax),
            founderCov: cov,
            gatesPass, detectsW1: w1post.length > 0,
          });
        }
      }
    }
  }
  return {
    seed: PRICE_SEED, tAdm, flip, neverLaunched, tol,
    roster: { q0, twinPairs, phantomBand, a1Band },
    replay: { nEdges: replay.nEdges, mismatches: replay.mismatches, per: replay.per },
    grid,
  };
}

// __DEFENSES_BEGIN (experiment-local; murmur/ untouched — composition receipt)
// ProvenanceStructGuard — CoMovementGuard plumbing (E40: guard windows {from: t+1, until: t+40},
// release events, epsNew throwback skipping adm-probationary ids, guardRounds accounting,
// throw/rethrow kinds, reset-on-trip) with the trip statistic swapped: a trailing-window
// STRUCTURAL level (DEP dep-share / PAR parent breadth / CAD cadence) computed from the field's
// OWN journaled edge graph (adm.edges — the forensic record Admission already keeps), bar-crossed
// sustained 5-of-10 EVALUATION rounds. Evaluation gated on (a) the voice being ADMITTED (E42's
// MINOWN analog — the probationary series is admission's own territory) and (b) >= Emin edges in
// the window (the structural statistic must be DEFINED; unevaluable rounds are counted and
// receipted). Parents via matchParents (the field's exact rule, replay-verified at pricing).
class ProvenanceStructGuard {
  constructor(adm, cfg) { // cfg: { stat, Tw, Emin, bar, sustainWin, sustainNeed, guardRounds }
    this.adm = adm; this.cfg = cfg;
    this.susWin = new Map();    // id -> last sustainWin crossed-booleans
    this.track = new Map();     // id -> per-sender statistic telemetry
    this.paths = new Map();     // id -> [{t, val, crossed}] for tracked voices (w1/g1)
    this.suppressed = new Map();// id -> sustained conditions suppressed by an open guard window
    this.guarded = new Map();   // id -> { from, until }
    this.guardRounds = new Map();
    this.events = [];
    this.uneval = new Map();    // id -> unevaluable murmuring rounds (edges < Emin)
    this.pcache = new Map();    // edge object -> {parents, minLag} (exact: parents of e sit at t < e.t, all journaled once e exists)
  }
  parentHit(e, id) {
    let hit = this.pcache.get(e);
    if (!hit) { hit = matchParents(this.adm, e, id); this.pcache.set(e, hit); }
    return hit;
  }
  statOf(id, round) { // trailing-window structural statistic from the live journal (or null)
    const list = this.adm.edges.get(id) ?? [];
    const tHi = round, tLo = tHi - this.cfg.Tw;
    let n = 0, depN = 0;
    const pset = new Set();
    for (let i = list.length - 1; i >= 0; i--) {
      const e = list[i];
      if (e.t <= tLo) break;
      n++;
      const { parents } = this.parentHit(e, id);
      if (parents.length > 0) { depN++; for (const p of parents) pset.add(p); }
    }
    if (n < this.cfg.Emin) return { val: null, n, depN, parents: pset.size };
    const val = this.cfg.stat === 'DEP' ? depN / n : this.cfg.stat === 'PAR' ? pset.size : n / this.cfg.Tw;
    return { val, n, depN, parents: pset.size };
  }
  note(t, murmurs) { // post-pool: evaluate the structural series for this round's murmuring voices
    if (!murmurs.length) return;
    const round = this.adm.round; // observe() already ran this round (journal current)
    for (const m of murmurs) {
      const id = m.from;
      const g0 = this.guarded.get(id);
      if (g0 && round > g0.until) { this.events.push({ t, id, kind: 'release' }); this.guarded.delete(id); }
      // E42's MINOWN analog (receipted): trip evaluation ONLY for ADMITTED voices — the
      // probationary structural series is admission's own territory (E37). DEFECT RECEIPT: the
      // first full run tripped a PROBATIONARY g1 (seed 5: firstT 258 < admitExpT 319, a
      // negative latency-from-admission that is impossible under the receipted rule) — the gate
      // was missing from note(); fixed and re-run; probationary rounds are neither evaluated nor
      // counted as unevaluable (uneval = defined-ness failures for ADMITTED voices only).
      if (!this.adm.admitted(id)) continue;
      const { val, n, parents } = this.statOf(id, round);
      if (val === null) { this.uneval.set(id, (this.uneval.get(id) ?? 0) + 1); continue; }
      const crossed = val > this.cfg.bar;
      let sus = this.susWin.get(id);
      if (!sus) { sus = []; this.susWin.set(id, sus); }
      sus.push(crossed);
      if (sus.length > this.cfg.sustainWin) sus.shift();
      const tr = this.track.get(id) ?? { nEval: 0, maxVal: 0, lastVal: 0, lastN: 0, crossedRounds: 0 };
      tr.nEval++; tr.lastVal = r6(val); tr.lastN = n;
      if (val > tr.maxVal) tr.maxVal = r6(val);
      if (crossed) tr.crossedRounds++;
      this.track.set(id, tr);
      if (id === SLEEP || id === INSTANT) {
        if (!this.paths.has(id)) this.paths.set(id, []);
        this.paths.get(id).push({ t, val: r6(val), crossed });
      }
      const sustained = sus.length >= this.cfg.sustainWin && sus.filter(Boolean).length >= this.cfg.sustainNeed;
      const gNow = this.guarded.get(id); // CURRENT guard state — the release round can trip (E42 delta #3)
      if (gNow) {
        if (sustained) this.suppressed.set(id, (this.suppressed.get(id) ?? 0) + 1);
        continue;
      }
      if (sustained) {
        const sCount = sus.filter(Boolean).length; // recorded BEFORE the reset
        this.susWin.set(id, []);   // reset on trip (receipted)
        const re = this.events.some((e) => e.id === id && (e.kind === 'throw' || e.kind === 'rethrow'));
        this.events.push({
          t, id, kind: re ? 'rethrow' : 'throw',
          val: r6(val), parents, windowEdges: n, sustain: sCount,
          trail30: null, refMean: null, // TrustReprobation-verbatim field names; structural statistic has no trail/ref semantics (receipted)
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
    for (const id of [...this.track.keys()]) {
      const ev = this.events.filter((e) => e.id === id);
      const tr = this.track.get(id);
      per[id] = {
        throws: ev.filter((e) => e.kind === 'throw').length,
        rethrows: ev.filter((e) => e.kind === 'rethrow').length,
        guardRounds: this.guardRounds.get(id) ?? 0,
        nEval: tr.nEval, unevaluable: this.uneval.get(id) ?? 0,
        maxVal: tr.maxVal, lastVal: tr.lastVal, lastN: tr.lastN, crossedRounds: tr.crossedRounds,
        suppressedSustained: this.suppressed.get(id) ?? 0,
      };
    }
    return {
      stat: this.cfg.stat, Tw: this.cfg.Tw, Emin: this.cfg.Emin, bar: this.cfg.bar,
      sustainWin: this.cfg.sustainWin, sustainNeed: this.cfg.sustainNeed, guardRounds: this.cfg.guardRounds,
      per, events: this.events.map((e) => ({ ...e })),
      paths: Object.fromEntries([...this.paths.entries()].map(([id, p]) => [id, p])),
    };
  }
}

// TrustReprobation — E37/E38/E39/E40/E41/E42 VERBATIM (unmodified): drains the detector's event
// log; on every throw/rethrow, decay that sender's HedgeTrust weight to frac x its current value
// via absorb(), then let the NORMAL hedge update path re-earn it (fixed-share + exp(eta*r)).
// Recovery is measured per event against 0.95 x pre-trip share within `horizon` rounds (R5e).
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
  return { loc: src.slice(a, b).split('\n').length - 1, classes: ['ProvenanceStructGuard (CoMovementGuard plumbing + trailing-window structural level over the journaled edge graph; matchParents = the field\'s own forensic rule)', 'TrustReprobation (E37-E42 verbatim)'] };
}

// ---------------- arm specs ----------------
// attackers: [{ id, flip }] — flip = toxic start round (null = never flips).
// g1 is ACTIVE in all attack arms (E36 deviation, carried) — R3/R5c need a same-arm baseline.
// A4 carries no attackers.
const attackersFor = (tAdm) => [{ id: SLEEP, flip: tAdm == null ? null : tAdm + KSTAR }, { id: INSTANT, flip: JOIN }];
const armName = (kind, bar) => (kind === 'AC1' ? `AC1-ps-bar${bar}` : `AC2-ps-bar${bar}`);
function armSpecs(tAdm, bStar, bHi, aliased) {
  const atk = attackersFor(tAdm);
  return {
    'A1-v3.1-sleeper': { name: 'A1-v3.1-sleeper', kind: 'A1', defenses: [], reprob: false, bar: null, attackers: atk },
    [armName('AC1', bStar)]: { name: armName('AC1', bStar), kind: 'AC1', defenses: ['pst'], reprob: true, bar: bStar, attackers: atk },
    ...(aliased ? {} : {
      [armName('AC2', bHi)]: { name: armName('AC2', bHi), kind: 'AC2', defenses: ['pst'], reprob: true, bar: bHi, attackers: atk },
    }),
    'A4-v3.1-clean': { name: 'A4-v3.1-clean', kind: 'A4', defenses: [], reprob: false, attackers: [] },
  };
}

// ---------------- one seed, paired arms (engine) ----------------
async function runArm(seed, world, spec, eng) {
  const { s, votes, toxV, sleepH, h2V } = world;
  const A = spec.name;
  const trust = new HedgeTrust(ALL_IDS, CFG);
  const prov = new Provenance({});
  const adm = new Admission(ADM);
  const psDef = spec.defenses.includes('pst')
    ? new ProvenanceStructGuard(adm, { stat: PST.stat, Tw: PST.Tw, Emin: PST.Emin, bar: spec.bar, sustainWin: PST.sustainWin, sustainNeed: PST.sustainNeed, guardRounds: PST.guardRounds })
    : null;
  const reprob = spec.reprob ? new TrustReprobation(psDef, trust, REPROB) : null;
  const defs = [psDef].filter(Boolean);
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
  if (psDef && wApost && wApost.flip != null) {
    const trips = psDef.events.filter((e) => e.id === SLEEP && (e.kind === 'throw' || e.kind === 'rethrow'));
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
  if (psDef) {
    const trips = psDef.events.filter((e) => e.id === INSTANT && (e.kind === 'throw' || e.kind === 'rethrow'));
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
      pst: psDef ? psDef.summary() : null,
      reprob: reprob ? reprob.summary() : null,
    },
    verify: st.verify,
    err: st.err,
  };
}

// ---------------- main ----------------
console.log(`── E43 provenance-structural coupling · the journaled edge graph itself (DEP/PAR/CAD) · Tw-grid ${PST.Tws.join('/')} · Emin-grid ${PST.Emins.join('/')} · ${T} rounds · ${V} voice slots ──`);
const vault = new MothVault({ label: 'e43', offline: true });
const harvest = await vault.harvest(256);
console.log(`vault: ${harvest.mock ? 'MOCK (offline doctrine)' : 'LIVE ' + harvest.jobId} digest=${harvest.poolDigest.slice(0, 10)} bits=${harvest.bits.length}`);

// design-time pricing (re-computed in-run; booked BEFORE any run row — R1 clause (a))
const pricing = priceProvenanceStruct(harvest, vault);

if (process.env.E43_PRICE) {
  console.log(`\n══ E43 DESIGN-TIME PRICING (seed ${PRICE_SEED}, disjoint from matrix seeds 0-5; t_adm=${pricing.tAdm} measured in-loop pass-1 -> flip ${pricing.flip}${pricing.neverLaunched ? ' [neverLaunched fallback]' : ''}) ══`);
  console.log(`journal replay: ${pricing.replay.nEdges} edges, parent/indep mismatches ${pricing.replay.mismatches} (must be 0)`);
  console.log(`roster collision structure: founder q = ${pricing.roster.q0.join('/')}`);
  console.log(`  near-twin pairs (|dq|<=${pricing.tol}): ${pricing.roster.twinPairs.map((p) => p.join('~')).join(', ') || 'none'}`);
  console.log(`  phantom-twin band (|q-0.75|<=${pricing.tol}, collides with the toxic's {0.25,0.75}): ${pricing.roster.phantomBand.join(',') || 'none'}`);
  console.log(`  a1 collision band (|q-0.9|<=${pricing.tol}): ${pricing.roster.a1Band.join(',') || 'none'}`);
  console.log(`per-voice journal profile (edges / depRate / distinctParents / meanMinLag):`);
  for (const id of ALL_IDS) {
    const p = pricing.replay.per[id] ?? { nEdges: 0, depRate: null, distinctParents: 0, meanMinLag: null };
    console.log(`  ${id.padEnd(4)} ${String(p.nEdges).padStart(4)}  ${p.depRate ?? '—'}  ${p.distinctParents}  ${p.meanMinLag ?? '—'}`);
  }
  console.log('\nGRID (all rows; budget = founder rate <= 1.0/200r, h2 = 0, w1 pre-flip = 0):');
  for (const r of pricing.grid) {
    console.log(`  ${r.stat}/Tw${r.Tw}/E${r.Emin}/bar${r.bar}: ft ${r.founderTrips} (${r.founderRate}/200r) h2 ${r.h2Trips} w1pre ${r.w1PreTrips} | w1post ${r.w1PostTrips} peak ${r.w1PeakPost} | g1 ${r.g1Trips} peak ${r.g1Peak} | honestMax ${r.honestMax} margin ${r.margin} cov ${r.founderCov} ${r.gatesPass ? 'GATE-PASS' : ''}${r.detectsW1 ? ' DETECTS' : ''}`);
  }
  const pass = pricing.grid.filter((r) => r.gatesPass && r.detectsW1);
  console.log(`\nGRID VERDICT: gate-passing AND detecting rows: ${pass.length} / ${pricing.grid.length}`);
  process.exit(0);
}

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });
book('run.config', {
  task: 'E43', name: 'provenance-structural coupling — structural statistics (DEP dep-share / PAR parent breadth / CAD cadence) computed from the field\'s OWN journaled forensic edge graph, priced first, composed with trust re-probation vs the E35 sleeper',
  collides: 'E42 receipted handoff — five detector axes closed (mean/variance/relational-cosine/side-betrayal/ALIGN-change-point); live families: (1) provenance-structural coupling (THIS LANE), (2) adversarial economics. E41 proved the toxic series is distribution-identical to an honest q=0.75 voice at the vote level; E42 proved the ALIGN change is seed-dependent in sign; the untested claim is that the SIGNATURE lives in the edge-coupling structure (who my edges echo, how broadly, how fast my degree grows), not in any output series',
  T, N, voices: V, seeds: SEEDS, kStarCarried: KSTAR,
  world: { stateFlipP: FLIP_P, skillRerollP: REROLL_P, qRange: [0.5, 0.95], a1Acuity: 0.9, toxicFormula: { id: 'E24 verbatim', acuity: TOX_Q, note: 'toxV shared by w1 post-flip AND g1 (same toxic values across arms)' }, streamKeys: 'e43:* (fresh draws; generator E35-E42 verbatim)' },
  attack: {
    joinRound: JOIN,
    sleeper: { id: SLEEP, honestPhase: 'e24 h1 generator verbatim (expert acuity, iid errors, own edges)', flip: 't_adm + 25; t_adm per seed from a pass-1 honest-forever A1-wiring run (in-run assert pass1 == matrix)' },
    flasher: { id: INSTANT, note: 'toxic FROM arrival t=150 — the R3 VISIBILITY target' },
    honestJoiner: { id: JOINER, note: 'honest forever, present in ALL arms — the false-positive canary' },
  },
  armsPlan: ['A1-v3.1-sleeper (control)', 'AC1-ps-bar* (candidate; bar picked by the receipted probe rule over the priced barSweep)', 'AC2-ps-barHi (conservative sibling = largest priced bar; aliases AC1 if equal)', 'A4-v3.1-clean (collateral baseline)'],
  statistics: {
    substrate: 'Admission\'s OWN forensic edge journal: edges Map sender -> [{t, v, prev, jump, indep}] (ALL history; independence fixed at creation by edge-precedence — did ANY other sender have a value+jump-aligned edge at t-L, L in 1..maxLag, within tol). Read via public fields (edges/maxLag/tol) — telemetry-only composition, ZERO murmur/ changes',
    parents: 'PARENTS(e) recomputed with the field\'s exact rule (matchParents) and SELF-CHECKED against the journaled indep flags over EVERY edge at pricing (replay receipt: mismatches must be 0) — the parent graph is provably the field\'s own, no oracle',
    DEP: 'dep-share — trailing fraction of the voice\'s edges with a nonempty parent set (echo-coupled edge share)',
    PAR: 'parent breadth — distinct parent senders over the trailing window (parent-degree profile)',
    CAD: 'cadence — edges per round over the trailing window (degree growth-rate; a-priori half-dead by E41: honest rate 2q(1-q) spans [0.095,0.5] and contains the toxic\'s 0.375 exactly — priced anyway)',
    blindness: 'a round is UNEVALUABLE for a voice iff its trailing window holds < Emin edges (the statistic is undefined); evaluation coverage per founder is priced per grid row (founderCov) — the structural analog of E42\'s MINOWN warm-up, plus the weak-voice blind spot (a voice with NO edges is never evaluable: q<=0.575 founders form no edges at all since |2q-1| <= edgeTheta)',
  },
  defenses: {
    provenanceStructGuard: {
      ...PST, reprob: REPROB,
      statistic: 'trailing-window structural level > bar SUSTAINED 5-of-10 EVALUATION rounds (E38/E39/E40 gate shape); evaluation gated on ADMITTED (E42\'s MINOWN analog) AND >= Emin window edges; reset-on-trip; guard window {from: t+1, until: t+40}',
      defectReceipt: 'first full run found the ADMITTED gate missing from note() (probationary g1 tripped on seed 5 at t=258 with admitExpT=319 — a negative latency-from-admission impossible under the receipted rule); fixed (gate added) and re-run; pricing trip scans remain UNGATED by design (E42 convention: the pricing is the CONSERVATIVE floor estimate — admission gating not simulated in the scans; founders are admitted from round 1 so the founder floor is unaffected)',
      consequence: 'DETECTOR SWAP ONLY — on trip -> BOTH layers exactly as E37-E42: TrustReprobation (HedgeTrust weight x0.5 via absorb, post-pool pre-update, re-earns through the normal fixed-share + exp(eta*r) path; class copied VERBATIM — trip events carry trail30/refMean as null so it stays byte-identical; the structural statistic has no trail/ref semantics, receipted) + influence re-probation (epsNew for 40 guard rounds)',
      plumbing: 'CoMovementGuard plumbing (E40) verbatim except the receipted statistic swap; trip events carry val/parents/windowEdges (the structural measurement the trip fired on)',
    },
  },
  composition: {
    murmurChanges: 'NONE (target zero) — both mechanisms are experiment-local classes over public murmur/ APIs',
    apis: ['Admission.observe/reattribute/notePooled/admitted/admittedRound/probationary/devMean/indepCount/firstSeen(read)/edges(read)/maxLag(read)/tol(read)/admitWindow/epsNew/admitErr', 'HedgeTrust.weights/update/absorb/weight', 'Provenance.inspect/penalize', 'MurmurBus.pool (reference-side counterfactuals + the standalone pricing pool — the sheet formula, E42-verify receipted)', 'receipts.sealChain/verifyChain'],
    timing: 'ProvenanceStructGuard evaluates post-pool every round from the CURRENT journal (observe already ran); trip consequence effective next round (guard from t+1) — E36-E42 plumbing timing verbatim',
  },
  hedge: CFG, admission: ADM,
  founders: 'D1 genesis acclamation (newcomers w1/g1/h2 join t=150: probationary from firstSeen)',
  absentSenderReward: 'missing ids get HedgeTrust default 0.5 (unproven prior) while absent; roster = 15 slots in every arm (e33-e42 convention)',
  reward: 'r_i = 1 - |p_i - s_t| (supervised pool — pool-independent, so trust re-earning is not gated by the defense)',
  rng: 'MothVault offline:true, one harvest, per-purpose keys e43:<purpose>:<seed>[:<voice>] via streamFor; paired worlds REQUIRE arm-identical world streams (arms select over shared values; no Math.random); pricing seed 100 is DISJOINT from matrix seeds 0-5',
  metrics: {
    D_w1: 'mean over [t_adm+25, min(t_adm+25+150,400)) of |pool - s_t| - |pool_cf - s_t| (E24/E35-E42 counterfactual, sleeper zeroed, reference-side log-odds, never written to the sheet; positive = hurts)',
    D_g1: 'same method over g1\'s own window [150, 300), g1 zeroed',
    honestFinalQ: 'mean HedgeTrust weight of the 12 honest incumbents at t=T-1 (post final update+absorb)',
    tripLatencyW1: 'first ProvenanceStructGuard throw event on w1 with t >= t_flip, minus t_flip (rounds)',
    tripLatencyG1: 'first throw event on g1 minus g1\'s own admission round (rounds) — the R3 visibility clock',
  },
  decisionRules: {
    R1_honestFloor_PRIMARY: 'R1 HONEST-NOISE FLOOR (priced FIRST per house law): per grid row (stat,Tw,Emin,bar) on seed 100: founder false-trip rate <= 1.0/200r arm-wide (<= 24 founder trips; E38 29.9, E39 9.4, E40 0, E41 gates-fail, E42 0.458-under-wide-bar), h2 trips = 0, w1 PRE-flip trips = 0; if NO row passes, E43 dies at pricing — the SIXTH dead axis, receipted with the pricing numbers (E41 precedent: crown-jewel null, no engine composition on a dead statistic)',
    R2_detection: 'R2 DETECTION: sleeper trips post-flip; PASS iff tripped seeds >= half AND mean latency < 30 rounds over tripped seeds; pre-flip w1 trips receipted (false trips on an honest-phase voice)',
    R3_g1Visibility: 'R3 g1 VISIBILITY: PASS iff g1 trips in >= 2/3 of seeds; latency from g1\'s own admission round; pre-admission structural blindness is admission\'s territory (E37) and receipted',
    R4_damage: 'R4 COUNTERFACTUAL DAMAGE (composition): D(AC1) < D(A1): paired one-sided sign test (zeros excluded) p < 0.05; report paired delta +/- SE and damage ratio D(AC1)/D(A1); AC2 alongside (the sensitivity trade) but the crown rides on AC1; g1 damage on the same footing (an INCREASE beyond A1 + 1 SE fails R5c)',
    R5_canaries: 'R5 CANARIES — (a) honQ within 1 SE of A4 (seed-paired; AC arms move trust by design); (b) h2: ZERO defense trips AND per-seed admission outcome identical to A1\'s (arm-invariance); (c) g1 damage <= A1 + 1 SE; (d) FALSE-TRIP BUDGET explicit: total honest-founder trips + per-founder histogram + rate <= 1.0/200r arm-wide; (e) RECOVERY: false-tripped founders re-earn to >= 95% of pre-trip trust share within 100 rounds (E37 baseline 23/25, mean 19.1r); vacuous pass if no trips',
    crown: 'iff AC1 passes R1 + R2 + R3 + R4 + R5, crown it (damage ratio, sleeper latency, g1 latency); if R3 fails while R1+R2+R4+R5 hold, receipt the PARTIAL verdict ("sees the flip, not the from-arrival"); if R1 fails at pricing, honest negative — the floor IS the finding; NO pre-drafted text: every clause filled from measured numbers',
  },
  pickRules: {
    grid: 'pricing scans {DEP,PAR,CAD} x Tw {40,80} x Emin {3,5} x per-stat bars (DEP {0.3,0.5,0.7}, PAR {2,3,4}, CAD {0.25,0.35,0.45}) = 36 rows on seed 100; per row: founder trip rate (budget 1.0/200r on the pricing seed = <= 24 founder trips), h2 trips = 0, w1 pre-flip trips = 0 -> gatesPass; margin = w1PeakPost - honestMax (stat units)',
    pick: '(stat*,Tw*,Emin*) = argmax margin among gatesPass && detectsW1 rows; ties -> larger Tw, then larger Emin, then LARGER bar. Fallback: no detecting gate-passer -> argmax margin among gate-passers (relaxed="no-pricing-detection"); no gate-passer -> NO-CANDIDATE (E41 precedent: receipt the grid, exit)',
    barSweep: 'up to PROBE_MAX_B priced candidates at the pick: {smallest detecting gate-passing bar, median detecting gate-passing bar, largest gate-passing bar} deduped; the probe sweeps these and picks bar* by the damage-margin rule below',
    bpick: 'bar* = argmax delta_b = D_w1(A1,s0) - D_w1(AC_b,s0) among bars passing ALL probe gates (i) h2 zero trips on seed 0, (ii) D_g1 <= A1 + 1e-4, (iii) founder rate on seed 0 <= 1.0/200r; ties -> LARGER bar; fallback ladder: none pass all -> argmax delta among gate-(i) passers (relaxed="founder-only") -> argmax delta (relaxed="none"); AC2 = largest priced bar (aliased to AC1 if equal)',
    pickBefore: 'the spick row (sensor.spick) and the bpick row (sensor.bpick) are booked BEFORE any full-matrix run row; the probe block doubles as matrix seed 0 (no re-run)',
  },
  pricingWorld: 'STANDALONE (telemetry-only): the real A1 wiring minus the engine sheet — Provenance/Admission/HedgeTrust run per-round for real (edges, echo, admitAt, cap all real); pool = MurmurBus.pool (THE sheet formula, E42 in-run verify agreed within 1e-9); pass-1 honest-forever w1 measures t_adm EXACTLY (E42 approximated 189 — the structural premise is admission-anchored so E43 prices the measured value), then the priced world flips w1 at t_adm+25',
  runtimeRules: 'probe = the timed seed-0 block (pass-1 + A1 + A4 + |barSweep| AC-bar runs); projected = t_probe x 6 + 2s IO; if projected > 170s cut seeds 6 -> 4 and RECEIPT the cut; NO script edits after the final run (stale-artifact doctrine)',
  sweepProvenance: 'grid priced on seed 100 (disjoint); stat*/Tw*/Emin*/barSweep DERIVED IN-RUN from the priced grid and booked as sensor.spick BEFORE run rows — the pick rule, not the pick, is what is sealed',
  pricing: { seed: pricing.seed, tAdm: pricing.tAdm, flip: pricing.flip, neverLaunched: pricing.neverLaunched, roster: pricing.roster, replayMismatchCheck: `${pricing.replay.mismatches} mismatches over ${pricing.replay.nEdges} edges`, gridRows: pricing.grid.length }, // R1 clause (a) — booked BEFORE any run row
  defenseLoc: defenseLoc(),
  vault: { mock: harvest.mock, digest: harvest.poolDigest },
  engine: 'vendored quilt dist (QuiltEngine)', sheetVerifyTol: TOL,
});
book('pricing.dev', {
  rule: 'R1 clause (a): design-time provenance-structural floor pricing on seed 100 (disjoint from matrix seeds 0-5); t_adm measured in-loop (pass-1 honest-forever) -> flip exact; the journal IS the field\'s own (admission simulated for real); telemetry only — no engine, no consequences',
  seed: PRICE_SEED, tAdm: pricing.tAdm, flip: pricing.flip, neverLaunched: pricing.neverLaunched,
  roster: pricing.roster,
  replay: { nEdges: pricing.replay.nEdges, mismatches: pricing.replay.mismatches, per: pricing.replay.per },
  grid: pricing.grid,
  budgetLine: `founder false-trip budget ${BUDGET_PER_200R}/200r arm-wide; pricing projection denominator = 12 x ${T}/200 = 24 -> <= 24 founder trips on this seed`,
});

// ---------------- phase 0: the (stat*,Tw*,Emin*) + bar-candidate pick (receipted rule) ----------------
const passRows = pricing.grid.filter((r) => r.gatesPass);
const detectRows = passRows.filter((r) => r.detectsW1);
let spick;
if (detectRows.length) {
  const best = Math.max(...detectRows.map((r) => r.margin));
  const tied = detectRows.filter((r) => Math.abs(r.margin - best) <= 1e-9);
  tied.sort((a, b) => b.Tw - a.Tw || b.Emin - a.Emin || b.bar - a.bar);
  spick = { stat: tied[0].stat, Tw: tied[0].Tw, Emin: tied[0].Emin, relaxed: null, margin: r6(best), tied: tied.length };
} else if (passRows.length) {
  const best = Math.max(...passRows.map((r) => r.margin));
  const tied = passRows.filter((r) => Math.abs(r.margin - best) <= 1e-9);
  tied.sort((a, b) => b.Tw - a.Tw || b.Emin - a.Emin || b.bar - a.bar);
  spick = { stat: tied[0].stat, Tw: tied[0].Tw, Emin: tied[0].Emin, relaxed: 'no-pricing-detection', margin: r6(best), tied: tied.length };
} else {
  // NO-CANDIDATE — the floor ate the sixth axis on the pricing seed (E41 precedent)
  book('sensor.spick', { rule: 'receipted in run.config.pickRules', picked: null, passRows: passRows.length, of: pricing.grid.length, note: 'NO-CANDIDATE: no (stat,Tw,Emin,bar) passed the pricing gates — the honest provenance-structural floor eats the sixth axis on the pricing seed' });
  book('finding.R1', { rule: 'R1 (pricing clause): no gate-passing config on the pricing seed — the floor IS the finding', pricingGrid: pricing.grid, roster: pricing.roster, replayPer: pricing.replay.per, verdict: 'FAIL (NO-CANDIDATE at pricing)' });
  book('finding.verdict', {
    crowned: 'NONE', verdict: 'NO-CANDIDATE: the honest provenance-structural floor eats every priced (stat,Tw,Emin,bar) — SIXTH AXIS DEAD AT PRICING; mechanism = the priced grid + roster collision structure + journal replay (receipted, E41 precedent)', r_ok: { R1: false, R2: null, R3: null, R4: null, R5: null },
    fate: 'sixth dead axis: mean E38, variance E39, relational cosine E40, side-betrayal E41, ALIGN change-point E42, provenance-structural E43 — the detector ladder now closes EXCEPT adversarial-economics (GAN framing), the last live family',
  });
  const sealed0 = sealChain(rows);
  const v0 = verifyChain(sealed0);
  mkdirSync('experiments/outputs', { recursive: true });
  writeFileSync('experiments/outputs/receipts_e43.jsonl', sealed0.map((r) => JSON.stringify(r)).join('\n') + '\n');
  writeFileSync('experiments/outputs/e43_summary.json', JSON.stringify({ task: 'E43', verdict: 'NO-CANDIDATE (pricing)', pricing: { seed: pricing.seed, tAdm: pricing.tAdm, flip: pricing.flip, roster: pricing.roster, replay: { nEdges: pricing.replay.nEdges, mismatches: pricing.replay.mismatches, per: pricing.replay.per }, grid: pricing.grid }, chain: { rows: sealed0.length, tip: sealed0[sealed0.length - 1].row_hash, verify: v0 } }, null, 1));
  console.log('E43 NO-CANDIDATE (pricing); chain rows', sealed0.length, 'verify', JSON.stringify(v0));
  process.exit(0);
}
PST.stat = spick.stat; PST.Tw = spick.Tw; PST.Emin = spick.Emin;
{
  const rowsS = passRows.filter((r) => r.stat === spick.stat && r.Tw === spick.Tw && r.Emin === spick.Emin);
  const detS = rowsS.filter((r) => r.detectsW1).map((r) => r.bar).sort((a, b) => a - b);
  const bs = new Set();
  if (detS.length) {
    bs.add(detS[0]);
    bs.add(detS[Math.floor((detS.length - 1) / 2)]);
  } else {
    const all = rowsS.map((r) => r.bar).sort((a, b) => a - b);
    if (all.length) { bs.add(all[0]); bs.add(all[Math.floor((all.length - 1) / 2)]); }
  }
  if (rowsS.length) bs.add(Math.max(...rowsS.map((r) => r.bar)));
  PST.barSweep = [...bs].sort((a, b) => a - b).slice(0, PROBE_MAX_B);
}
book('sensor.spick', {
  rule: 'receipted in run.config.pickRules',
  picked: { stat: spick.stat, Tw: spick.Tw, Emin: spick.Emin }, relaxed: spick.relaxed, margin: spick.margin,
  barSweep: PST.barSweep, barSweepNote: 'priced bar candidates for the probe sweep (smallest detecting / median / largest gate-passing at the pick)',
  gatePassingRows: passRows.length, of: pricing.grid.length, detectingRows: detectRows.length,
  budgetLine: `pricing founder budget: <= 24 trips on seed 100 (rate ${BUDGET_PER_200R}/200r)`,
});
console.log(`spick: stat*=${spick.stat} Tw*=${spick.Tw} Emin*=${spick.Emin}${spick.relaxed ? ` (RELAXED: ${spick.relaxed})` : ''} margin=${spick.margin} -> probe bar-sweep [${PST.barSweep.join(', ')}]`);

// ---------------- phase 1: probe (seed 0) — full matrix + bar-sweep ----------------
const world0 = genWorld(0, harvest, vault);
const eng0 = new QuiltEngine('e43-s0', {});
eng0.loadSheet(buildSheet());
const probeStart = Date.now();
const engP1 = new QuiltEngine('e43-s0-p1', {});
engP1.loadSheet(buildSheet());
const p1 = await runArm(0, world0, { name: 'pass1', kind: 'pass1', defenses: [], reprob: false, bar: null, attackers: [{ id: SLEEP, flip: null }, { id: INSTANT, flip: JOIN }] }, engP1);
if (p1.w1.admitExpT === undefined) console.log('  seed 0: sleeper NOT admitted under honest behavior — attack cannot launch (receipted as neverLaunched)');
const tAdm0 = p1.w1.admitExpT;
const probe = { A1: null, A4: null, B: {} };
for (const spec of [
  { name: 'A1-v3.1-sleeper', kind: 'A1', defenses: [], reprob: false, bar: null, attackers: attackersFor(tAdm0) },
  { name: 'A4-v3.1-clean', kind: 'A4', defenses: [], reprob: false, bar: null, attackers: [] },
  ...PST.barSweep.map((b) => ({ name: `probe-bar${b}`, kind: 'probe', defenses: ['pst'], reprob: true, bar: b, attackers: attackersFor(tAdm0) })),
]) {
  probe[spec.kind === 'probe' ? `bar${spec.bar}` : spec.kind] = await runArm(0, world0, spec, eng0);
}
const probeMs = Date.now() - probeStart;
const projected = (probeMs / 1000) * 6 + 2;
let cut = null;
if (projected > 170 && SEEDS === 6) { SEEDS = 4; cut = 'seeds cut 6 -> 4 by the probe rule (projected > 170s); paired claims preserved'; }
else if (projected > 170) { cut = `seeds already ${SEEDS} (< 6); projected ${projected.toFixed(0)}s still > 170s — proceeding at minimum receipted fallback`; }
book('probe.seed0', {
  seed: 0, timed: true, probeBlock_s: +(probeMs / 1000).toFixed(1), runs: 3 + PST.barSweep.length,
  tAdmExp: tAdm0, pass1DevMean: p1.w1.devMean, pass1Indep: p1.w1.indep,
  w1ProbTraceMax_A1: probe.A1.w1.probTraceMax,
  note: 'probe = 1-seed timed run of the full matrix + priced bar-sweep; doubles as matrix seed 0 (no re-run)',
});
book('runtime.probe', {
  tProbe_s: +(probeMs / 1000).toFixed(1),
  projected_6seeds_s: +projected.toFixed(1),
  projectedFormula: 't_probe * 6 + 2s IO (receipted)',
  seedDecision: SEEDS, cut: cut ?? 'none — full plan within budget',
  reference_s: 'E36/E37/E38/E39/E40/E42 ran ~95-135s at 6 seeds; E40 probe 22.1s + matrix 71.8s',
});
console.log(`probe(seed 0): ${+(probeMs / 1000).toFixed(1)}s -> projected(6 seeds)=${projected.toFixed(0)}s -> seeds=${SEEDS}${cut ? ' (CUT)' : ''}`);

// ---------------- phase 1b: the bar pick (receipted rule) ----------------
const founderTripCount = (R) => Object.entries(R.defense.pst.per)
  .filter(([id]) => HONEST.includes(id)).reduce((a, [, p]) => a + p.throws + p.rethrows, 0);
const h2TripCount = (R) => {
  const p = R.defense.pst.per[JOINER];
  return p ? p.throws + p.rethrows : 0;
};
const sweepTable = PST.barSweep.map((b) => {
  const R = probe[`bar${b}`];
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
    bar: b, delta: r6(delta), gates, allGates: gates.h2Trips === 0 && gates.g1Gate && gates.founderGate,
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
  pick = { bar: Math.max(...tied.map((x) => x.bar)), relaxed: null, tied: tied.map((x) => x.bar) };
} else if (eligibleH2.length) {
  const best = Math.max(...eligibleH2.map((x) => x.delta));
  const tied = eligibleH2.filter((x) => Math.abs(x.delta - best) <= 1e-9);
  pick = { bar: Math.max(...tied.map((x) => x.bar)), relaxed: 'founder-only', tied: tied.map((x) => x.bar) };
} else {
  const best = Math.max(...sweepTable.map((x) => x.delta));
  const tied = sweepTable.filter((x) => Math.abs(x.delta - best) <= 1e-9);
  pick = { bar: Math.max(...tied.map((x) => x.bar)), relaxed: 'none', tied: tied.map((x) => x.bar) };
}
const BSTAR = pick.bar;
const BHI = Math.max(...PST.barSweep);
const ALIASED = BSTAR === BHI;
const ARM_AC1 = armName('AC1', BSTAR);
const ARM_AC2 = armName('AC2', BHI);
book('sensor.bpick', {
  rule: 'argmax delta_b among bars passing all probe gates; ties -> larger bar; fallback ladder receipted in run.config',
  sweepTable, picked: BSTAR, relaxed: pick.relaxed, tied: pick.tied,
  barHi: BHI, aliased: ALIASED, aliasNote: ALIASED ? 'AC1 == AC2 (bar* = largest priced bar): the conservative sibling IS the candidate; one arm run, AC1 aliases AC2 (no re-run)' : 'AC1 and AC2 are distinct arms',
  probeD_w1: Object.fromEntries(PST.barSweep.map((b) => [`bar${b}`, r6(probe[`bar${b}`].dmgW1)]).concat([['A1', r6(probe.A1.dmgW1)]])),
});
console.log(`bar-pick: bar*=${BSTAR}${pick.relaxed ? ` (RELAXED: ${pick.relaxed})` : ''}${ALIASED ? ' — AC1 == AC2 (aliased)' : ''}`);

// ---------------- phase 2: full matrix ----------------
const ARMS = ALIASED ? ['A1-v3.1-sleeper', ARM_AC1, 'A4-v3.1-clean'] : ['A1-v3.1-sleeper', ARM_AC1, ARM_AC2, 'A4-v3.1-clean'];
const agg = {};
for (const A of ARMS) {
  agg[A] = {
    acc: [], pre: [], dmgW1: [], dmgG1: [], shareW1: [], shareG1: [], honQ: [],
    w1Adm: [], w1Dev: [], w1Indep: [], w1ProbMax: [], h2Adm: [], g1Adm: [],
    trustFlip: [], conv: [],
    sensor: { per: {}, w1Events: [], g1Events: [], founderTrips: [], w1Trips: [], g1Trips: [], founderMaxVal: {} },
    decayEvents: [],
    w1Curves: {}, w1Paths: {}, g1Paths: {},
    vfy: { checks: 0, pass: 0, maxDiff: 0 },
  };
}
const seedRows = [];
const t0 = Date.now();

// seed 0: carried from the probe (no re-run) + the picked AC arms' seed-0 results
{
  const specs = armSpecs(tAdm0, BSTAR, BHI, ALIASED);
  const results = {
    'A1-v3.1-sleeper': probe.A1,
    'A4-v3.1-clean': probe.A4,
    [ARM_AC1]: probe[`bar${BSTAR}`],
    ...(ALIASED ? {} : { [ARM_AC2]: probe[`bar${BHI}`] }),
  };
  seedRows.push(await buildSeedRow(0, results, specs, tAdm0, p1, true));
  book('run', seedRows[0]);
  console.log(`  seed 1/${SEEDS} done (carried from probe; t_adm=${tAdm0}, ${((Date.now() - t0) / 1000).toFixed(1)}s elapsed)`);
}

// seeds 1..SEEDS-1: fresh worlds, pass-1 anchor, full arm matrix
for (let seed = 1; seed < SEEDS; seed++) {
  const world = genWorld(seed, harvest, vault);
  const eng = new QuiltEngine(`e43-s${seed}`, {});
  eng.loadSheet(buildSheet());
  const engP1 = new QuiltEngine(`e43-s${seed}-p1`, {});
  engP1.loadSheet(buildSheet());
  const p1s = await runArm(seed, world, { name: 'pass1', kind: 'pass1', defenses: [], reprob: false, bar: null, attackers: [{ id: SLEEP, flip: null }, { id: INSTANT, flip: JOIN }] }, engP1);
  if (p1s.w1.admitExpT === undefined) console.log(`  seed ${seed}: sleeper NOT admitted under honest behavior (receipted as neverLaunched)`);
  const tAdm = p1s.w1.admitExpT;
  const specs = armSpecs(tAdm, BSTAR, BHI, ALIASED);
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
    if (R.defense.pst) {
      G.sensor.per[seed] = R.defense.pst.per;
      G.sensor.w1Events.push(...R.defense.pst.events.filter((e) => e.id === SLEEP && (e.kind === 'throw' || e.kind === 'rethrow')).map((e) => ({ seed, ...e })));
      G.sensor.g1Events.push(...R.defense.pst.events.filter((e) => e.id === INSTANT && (e.kind === 'throw' || e.kind === 'rethrow')).map((e) => ({ seed, ...e })));
      G.sensor.w1Trips.push({ seed, ...R.w1Trip });
      G.sensor.g1Trips.push({ seed, ...R.g1Trip });
      for (const id of HONEST) {
        const p = R.defense.pst.per[id];
        if (p && (p.throws > 0 || p.rethrows > 0)) G.sensor.founderTrips.push({ seed, id, ...p });
        if (p && p.maxVal !== undefined) (G.sensor.founderMaxVal[id] = G.sensor.founderMaxVal[id] ?? []).push(p.maxVal);
      }
      G.w1Paths[seed] = R.defense.pst.paths[SLEEP] ?? [];
      G.g1Paths[seed] = R.defense.pst.paths[INSTANT] ?? [];
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
        pst: R.defense.pst ? {
          stat: R.defense.pst.stat, Tw: R.defense.pst.Tw, Emin: R.defense.pst.Emin, bar: R.defense.pst.bar,
          per: Object.fromEntries(Object.entries(R.defense.pst.per).filter(([id]) => !HONEST.includes(id))),
          founderMaxVal: Object.fromEntries(HONEST.map((id) => [id, R.defense.pst.per[id] ? R.defense.pst.per[id].maxVal : null])),
          founderUneval: Object.fromEntries(HONEST.map((id) => [id, R.defense.pst.per[id] ? R.defense.pst.per[id].unevaluable : null])),
          founderTrips: R.defense.pst.events.filter((e) => HONEST.includes(e.id) && (e.kind === 'throw' || e.kind === 'rethrow')),
          h2Trips: R.defense.pst.events.filter((e) => e.id === JOINER && (e.kind === 'throw' || e.kind === 'rethrow')),
          g1Trips: R.defense.pst.events.filter((e) => e.id === INSTANT && (e.kind === 'throw' || e.kind === 'rethrow')),
          w1Path: R.defense.pst.paths[SLEEP] ?? [],
          g1Path: R.defense.pst.paths[INSTANT] ?? [],
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
      founderMaxVal: Object.fromEntries(HONEST.map((id) => {
        const vals = G.sensor.founderMaxVal[id] ?? [];
        return [id, vals.length ? { mean: r6(mean(vals)), max: r6(Math.max(...vals)), n: vals.length } : null];
      })),
      honestMaxVal_matrix: r6(Math.max(0, ...HONEST.flatMap((id) => (G.sensor.founderMaxVal[id] ?? []).map((v) => (typeof v === 'object' ? v.max : v))))),
      budgetLine: `budget ${BUDGET_PER_200R}/200r arm-wide = <= ${SEEDS * N * T / 200} founder trips across this ${SEEDS}-seed matrix`,
      h2TripTotal: Object.values(G.sensor.per).reduce((a, per) => a + ((per[JOINER]?.throws ?? 0) + (per[JOINER]?.rethrows ?? 0)), 0),
      h2MaxVal: statOr(Object.values(G.sensor.per).map((per) => per[JOINER]?.maxVal ?? null).filter((x) => x !== null)),
      g1TripTotal: Object.values(G.sensor.per).reduce((a, per) => a + ((per[INSTANT]?.throws ?? 0) + (per[INSTANT]?.rethrows ?? 0)), 0),
      g1MaxVal: statOr(Object.values(G.sensor.per).map((per) => per[INSTANT]?.maxVal ?? null).filter((x) => x !== null)),
    } : null,
    decayEvents: isSensor ? G.decayEvents : [],
    verify: { checks: G.vfy.checks, pass: G.vfy.pass, maxDiff: G.vfy.maxDiff.toExponential(2) },
  };
}

// per-seed w1 pre/post-flip structural maxima (mechanism telemetry, AC1 arm)
function pathMinima(path, flip, bar) {
  const pre = path.filter((x) => x.t < flip);
  const post = path.filter((x) => x.t >= flip && x.t < flip + DW);
  const preV = pre.map((x) => x.val);
  const postV = post.map((x) => x.val);
  return {
    preFlipMaxVal: preV.length ? r6(Math.max(...preV)) : null,
    postFlipMaxVal: postV.length ? r6(Math.max(...postV)) : null,
    postFlipMeanVal: postV.length ? r6(mean(postV)) : null,
    crossedBar: postV.length ? Math.max(...postV) > bar : null,
  };
}
const MECHDATA = { perSeed: [] };
{
  const arm = agg[ARM_AC1];
  for (const tr of arm.sensor.w1Trips) {
    const seed = tr.seed, flip = tr.flip;
    const path = arm.w1Paths[seed] ?? [];
    const mm = pathMinima(path, flip, BSTAR);
    const firstTripEv = arm.sensor.w1Events.find((e) => e.seed === seed && e.t >= flip);
    const per = arm.sensor.per[seed]?.[SLEEP] ?? {};
    const g1rec = (arm.sensor.g1Trips ?? []).find((x) => x.seed === seed) ?? null;
    const g1Per = arm.sensor.per[seed]?.[INSTANT] ?? {};
    const founderMaxes = HONEST.map((id) => arm.sensor.per[seed]?.[id]?.maxVal ?? 0);
    MECHDATA.perSeed.push({
      seed, flip, tripped: tr.nPostFlip > 0, latency: tr.latency, nTrips: tr.nTrips, nPreFlipTrips: tr.nPreFlip,
      preFlipMaxVal: mm.preFlipMaxVal, postFlipMaxVal: mm.postFlipMaxVal, postFlipMeanVal: mm.postFlipMeanVal,
      valAtFirstTrip: firstTripEv ? firstTripEv.val : null, parentsAtFirstTrip: firstTripEv ? firstTripEv.parents : null,
      bar: BSTAR, suppressed: per.suppressedSustained ?? 0,
      honestMaxVal_thisSeed: r6(Math.max(...founderMaxes)),
      g1: g1rec ? { nTrips: g1rec.nTrips, firstT: g1rec.firstT, admitExpT: g1rec.admitExpT, latencyFromAdmission: g1rec.latencyFromAdmission, maxVal: g1Per.maxVal ?? null } : null,
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
    priced: { seed: PRICE_SEED, stat: spick.stat, Tw: spick.Tw, Emin: spick.Emin, note: 'pricing.dev row (booked before run rows)' },
    perFounderMaxVal: tel.founderMaxVal,
    honestMaxVal_matrix: tel.honestMaxVal_matrix,
    falseTrips: { total: tel.founderTripTotal, ratePer200r: rate, budget: BUDGET_PER_200R, budgetLine: tel.budgetLine, perVoice: tel.founderTripPerVoice },
    h2MaxVal: tel.h2MaxVal, h2Trips: tel.h2TripTotal,
    w1PreFlip: null, // filled below from the stored w1Paths
    verdict: rate <= BUDGET_PER_200R ? 'PASS' : 'FAIL',
  };
}
for (const B of B_ARMS) {
  const flips = Object.fromEntries(agg[B].sensor.w1Trips.map((x) => [x.seed, x.flip]));
  const preMaxes = Object.entries(agg[B].w1Paths).map(([sN, path]) => {
    const flip = flips[sN];
    if (flip == null) return null;
    const pre = path.filter((x) => x.t < flip).map((x) => x.val);
    return pre.length ? Math.max(...pre) : null;
  }).filter((x) => x !== null);
  R1[B].w1PreFlip = preMaxes.length ? { maxVal: r6(Math.max(...preMaxes)), nSeeds: preMaxes.length } : null;
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
    maxVal: armsAgg[B].sensorTelemetry.g1MaxVal,
    tripEvents: agg[B].sensor.g1Events,
    verdict: tripped.length >= (2 * SEEDS) / 3 ? 'PASS' : 'FAIL',
  };
}

// R4 COUNTERFACTUAL DAMAGE per sensor arm (E39/E40/E42 machinery verbatim)
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
  const honestMax = armsAgg[ARM_AC1].sensorTelemetry.honestMaxVal_matrix;
  const g1TrippedN = R3[ARM_AC1].trippedSeeds;
  const g1Lat = R3[ARM_AC1].latencyFromAdmission;
  const ftTotal = armsAgg[ARM_AC1].sensorTelemetry.founderTripTotal;
  const ftSeeds = new Set(agg[ARM_AC1].sensor.founderTrips.map((e) => e.seed)).size;
  const dDelta = dmgW1Of(A1).map((x, i) => x - dmgW1Of(ARM_AC1)[i]);
  const decaysW1 = agg[ARM_AC1].decayEvents.filter((e) => e.id === SLEEP);
  const decaysG1 = agg[ARM_AC1].decayEvents.filter((e) => e.id === INSTANT);
  MECH = `ProvenanceStructGuard(${spick.stat}, Tw=${spick.Tw}, Emin=${spick.Emin}, bar=${BSTAR}) trips on the sleeper post-flip in ${tripSeeds.length}/${SEEDS} seeds`
    + `${tripSeeds.length ? ` (latency ${stat(tripSeeds.map((x) => x.latency)).mean}rd mean; per-seed postFlipMaxVal ${tripSeeds.map((x) => x.postFlipMaxVal).join('/')} vs bar=${BSTAR}, val at first trip ${tripSeeds.map((x) => x.valAtFirstTrip).join('/')}, parents at first trip ${tripSeeds.map((x) => x.parentsAtFirstTrip).join('/')})` : ''}`
    + `${noTrip.length ? `; NO-TRIP seeds ${noTrip.map((x) => `s${x.seed}`).join(',')}: postFlipMaxVal ${noTrip.map((x) => x.postFlipMaxVal).join('/')} vs bar=${BSTAR}` : ''}`
    + `; honest floor (matrix): per-founder maxVal max ${honestMax} vs w1 postFlipMaxVal max ${r6(Math.max(...MECHDATA.perSeed.map((x) => x.postFlipMaxVal ?? 0)))} — the structural margin is ${(MECHDATA.perSeed.length ? r6(Math.max(...MECHDATA.perSeed.map((x) => x.postFlipMaxVal ?? 0)) - honestMax) : 'n/a')} stat units`
    + `; g1 (from-arrival) tripped in ${g1TrippedN}/${SEEDS} seeds${g1Lat ? ` (latency from ADMISSION ${g1Lat.mean}rd mean)` : ''}`
    + `; honest false trips ${ftTotal} in ${ftSeeds}/${SEEDS} seeds (rate ${armsAgg[ARM_AC1].sensorTelemetry.founderTripRatePer200r}/200r vs budget ${BUDGET_PER_200R}; E38 CUSUM 29.9, E39 ratio 9.4, E40 cosine 0, E42 0.458)`
    + `; damage delta vs A1 per seed [${dDelta.map((x) => (x >= 0 ? '+' : '') + r6(x)).join(', ')}] (trip seeds ${tripSeeds.map((x) => `s${x.seed}`).join(',') || 'n/a'})`
    + `; w1 decay events ${decaysW1.length} (${decaysW1.filter((e) => e.kind === 'rethrow').length} retrips; pre->post x${REPROB.frac}) | g1 decay events ${decaysG1.length} (D_g1 ${R4[ARM_AC1].g1Damage_paired.delta_B_minus_A1.mean} vs A1)`;
}
let MECH_V2;
if (!ALIASED) {
  const hiTripSeeds = agg[ARM_AC2].sensor.w1Trips.filter((x) => x.nPostFlip > 0);
  const hiG1Seeds = agg[ARM_AC2].sensor.g1Trips.filter((x) => x.nTrips > 0);
  const hiFt = armsAgg[ARM_AC2].sensorTelemetry.founderTripTotal;
  MECH_V2 = `conservative sibling ProvenanceStructGuard(bar=${BHI}): sleeper trips ${hiTripSeeds.length}/${SEEDS} seeds (latency ${hiTripSeeds.length ? stat(hiTripSeeds.map((x) => x.latency)).mean : 'n/a'}rd), g1 trips ${hiG1Seeds.length}/${SEEDS}, founder false trips ${hiFt} (rate ${armsAgg[ARM_AC2].sensorTelemetry.founderTripRatePer200r}/200r) — the sensitivity trade measured against AC1(bar=${BSTAR})`;
}

const VERDICT = {
  crowned: CROWN ? CROWN.crowned : 'NONE',
  verdict: CROWN
    ? `CROWNED ${CROWN.crowned} (damage ratio ${CROWN.damageRatio}, sleeper latency ${CROWN.latency ? CROWN.latency.mean : 'n/a'}rd, g1 latency-from-admission ${CROWN.g1Latency ? CROWN.g1Latency.mean : 'n/a'}rd)`
    : (!R1OK
      ? `NO-CROWN (honest negative — R1 floor FAILS): the structural sensor's honest-noise floor is too wide (${armsAgg[ARM_AC1].sensorTelemetry.founderTripRatePer200r}/200r founder trips vs budget ${BUDGET_PER_200R}; honestMaxVal ${armsAgg[ARM_AC1].sensorTelemetry.honestMaxVal_matrix} vs w1 postFlipMaxVal max ${r6(Math.max(...MECHDATA.perSeed.map((x) => x.postFlipMaxVal ?? 0)))}) — that IS the finding; mechanism computed from telemetry`
      : (!R3OK && R2OK && R4OK
        ? `PARTIAL: the structural sensor SEES THE SLEEPER'S FLIP, NOT THE FROM-ARRIVAL TOXIC — R2 ${R2[ARM_AC1].trippedSeeds}/${SEEDS} seeds (latency ${R2[ARM_AC1].latency ? R2[ARM_AC1].latency.mean : 'n/a'}rd), R4 ratio ${R4[ARM_AC1].damageRatio_B_over_A1}, but R3 g1 ${R3[ARM_AC1].trippedSeeds}/${SEEDS}`
        : `NO-CROWN: AC1 fails ${[R1OK ? null : 'R1', R2OK ? null : 'R2', R3OK ? null : 'R3', R4OK ? null : 'R4', R5OK ? null : 'R5'].filter(Boolean).join('+')} — negative verdict, mechanism computed from telemetry`)),
  crownDetail: CROWN,
  hiStatus: ALIASED ? 'aliased to AC1 (bar* = largest priced bar)' : { R1: R1[ARM_AC2].verdict, R2: R2[ARM_AC2].verdict, R3: R3[ARM_AC2].verdict, R4: R4[ARM_AC2].verdict, R5: R5.perSensor[ARM_AC2].verdict, note: 'conservative sibling receipted alongside; the crown rides on AC1 per the receipted rule' },
  mechanism: ALIASED ? { AC1: MECH } : { AC1: MECH, AC2: MECH_V2 },
  structuralFindings: [
    `detection operating curve (probe seed 0): ${PST.barSweep.map((b) => { const row = sweepTable.find((x) => x.bar === b); return `bar=${b}: w1 post-flip trips ${row.w1TripsPostFlip} (lat ${row.w1Latency}), g1 trips ${row.g1Trips}, founder trips ${row.gates.founderTrips} (${row.gates.founderRatePer200r}/200r), h2 trips ${row.gates.h2Trips}, delta ${row.delta}`; }).join('; ')}`,
    `recovery receipt (R5e): ${B_ARMS.map((A) => { const r = R5.perSensor[A].recovery; return `${A}: ${r.vacuous ? 'no founder trips (vacuous)' : `${r.recoveredN}/${r.withFullHorizon} founder decay events recovered to >=95% of pre-trip share within 100 rounds${r.recoveredIn ? ` (mean ${r.recoveredIn.mean}rd; E37 baseline 23/25 mean 19.1r)` : ''}`}`; }).join('; ')} — the supervised reward stream (r = 1-|p-s|, pool-independent) keeps trust re-earning defense-proof`,
    `roster collision structure (pricing seed 100): founder q = ${pricing.roster.q0.join('/')}; near-twin pairs ${pricing.roster.twinPairs.length}; phantom-twin band (collides with the toxic's {0.25,0.75} values): ${pricing.roster.phantomBand.join(',') || 'EMPTY'} — the structural premise stands or falls on whether the honest roster already populates the toxic's collision band`,
  ],
};

book('finding.R1', { rule: `R1 HONEST-NOISE FLOOR (PRIMARY design constraint) — founder false-trip budget ${BUDGET_PER_200R}/200r arm-wide, measured (a) pricing seed 100 (pricing.dev), (b) probe seed 0, (c) the full matrix AC1 arm; if the floor is too wide, that IS the finding`, perArm: R1, pricingRecap: { stat: spick.stat, Tw: spick.Tw, Emin: spick.Emin, barSweep: PST.barSweep } });
book('finding.R2', { rule: 'R2 DETECTION — sleeper trips post-flip; PASS iff tripped seeds >= half AND mean latency < 30r; pre-flip trips receipted', perArm: R2 });
book('finding.R3', { rule: 'R3 g1 VISIBILITY — PASS iff g1 trips in >= 2/3 of seeds; latency from g1\'s own admission; pre-admission structural blindness is admission\'s territory (E37), receipted', perArm: R3 });
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
  task: 'E43', name: 'provenance-structural coupling (DEP/PAR/CAD over the field\'s own journaled forensic edge graph, composed with trust re-probation vs the E35 sleeper)',
  seeds: SEEDS, T, voices: V, kStarCarried: KSTAR, arms: ARMS,
  pick: { stat: spick.stat, Tw: spick.Tw, Emin: spick.Emin, barStar: BSTAR, barHi: BHI, aliased: ALIASED, barSweep: PST.barSweep, relaxed: spick.relaxed },
  runtime_s: { probeBlock: +(probeMs / 1000).toFixed(1), matrix: elapsedMatrix, total: +((Date.now() - t0) / 1000).toFixed(1) },
  config: {
    world: { FLIP_P, REROLL_P, N, TOX_Q, JOIN }, damageWindow: DW, pre: PRE,
    hedge: CFG, admission: ADM, pst: { ...PST }, reprob: REPROB, roster: ALL_IDS,
    deviations: ['g1 ACTIVE in all attack arms (E36 deviation carried — same-arm regression/visibility baseline)', 'k* = 25 carried from E35 (no re-search)', 'probe block doubles as matrix seed 0 (no re-run)', 'ProvenanceStructGuard = CoMovementGuard plumbing + trailing-window structural level over the journaled edge graph (composition receipt in run.config); TrustReprobation E37-E42-verbatim (detector swap ONLY)', 'stat*/Tw*/Emin*/barSweep derived in-run from the priced grid on seed 100 (disjoint; pricing.dev row)', 'fresh e43:* world draws (generator verbatim)', 'pricing runs the STANDALONE world loop (the real A1 wiring minus the engine sheet; pool = MurmurBus.pool = the sheet formula) with t_adm measured in-loop pass-1 — the journal priced is the field\'s own'],
  },
  pricing: { seed: pricing.seed, tAdm: pricing.tAdm, flip: pricing.flip, neverLaunched: pricing.neverLaunched, roster: pricing.roster, replay: { nEdges: pricing.replay.nEdges, mismatches: pricing.replay.mismatches, per: pricing.replay.per }, gridGatePassing: pricing.grid.filter((r) => r.gatesPass) },
  bpick: { sweepTable, picked: BSTAR, relaxed: pick.relaxed, aliased: ALIASED },
  arms: armsAgg,
  claims: { R1, R2, R3, R4, R5, verdict: VERDICT, mechanismPerSeed: MECHDATA.perSeed },
  perSeed: seedRows,
  chain: { rows: rows.length, tip, verified: vfy.ok },
};
writeFileSync('experiments/outputs/e43_summary.json', JSON.stringify(summary, null, 1));
writeFileSync('experiments/outputs/receipts_e43.jsonl', rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
// file re-verify (E35 discipline: the chain must verify FROM THE WRITTEN FILE)
const reread = readFileSync('experiments/outputs/receipts_e43.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const vfyFile = verifyChain(reread);
console.log(`file re-verify: ${vfyFile.ok ? 'OK' : 'FAILED'} (${reread.length} rows)`);
if (!vfyFile.ok) { console.error('FILE CHAIN VERIFY FAILED', vfyFile); process.exit(1); }

console.log(`R1 floor ${ARM_AC1}: ${R1[ARM_AC1].verdict} (founder trips ${R1[ARM_AC1].falseTrips.total} = ${R1[ARM_AC1].falseTrips.ratePer200r}/200r vs budget ${BUDGET_PER_200R}; honestMaxVal matrix ${R1[ARM_AC1].honestMaxVal_matrix})`);
for (const B of B_ARMS) console.log(`R2 detect ${B}: ${R2[B].verdict} trips=${R2[B].trippedSeeds}/${SEEDS} latency=${R2[B].latency ? R2[B].latency.mean : 'n/a'}rd preFlipTrips=${R2[B].preFlipTrips_total}`);
for (const B of B_ARMS) console.log(`R3 g1 ${B}: ${R3[B].verdict} trips=${R3[B].trippedSeeds}/${SEEDS} latFromAdm=${R3[B].latencyFromAdmission ? R3[B].latencyFromAdmission.mean : 'n/a'}rd`);
for (const B of B_ARMS) console.log(`R4 damage ${B}: ${R4[B].verdict} ratio(B/A1)=${R4[B].damageRatio_B_over_A1} delta=${R4[B].pairedDelta_A1_minus_B.mean}±${R4[B].pairedDelta_A1_minus_B.se} p=${R4[B].signTest_oneSided.p} | g1 delta=${R4[B].g1Damage_paired.delta_B_minus_A1.mean}±${R4[B].g1Damage_paired.delta_B_minus_A1.se}`);
for (const B of B_ARMS) { const e = R5.perSensor[B]; console.log(`R5 canaries ${B}: ${e.verdict} honQ(${e.honQ.diff_vs_A4.pass_1SE ? 'pass' : 'FAIL'} ${e.honQ.diff_vs_A4.mean}±${e.honQ.diff_vs_A4.se}) h2(${e.h2.defenseTrips === 0 && e.h2.invariancePass ? 'pass' : 'FAIL'} trips=${e.h2.defenseTrips}) g1(${e.g1.pass ? 'pass' : 'FAIL'} ${e.g1.pairedDelta_B_minus_A1.mean}) ft(${e.falseTrips.pass ? 'pass' : 'FAIL'} ${e.falseTrips.ratePer200r}/200r) rec(${e.recovery.verdict})`); }
console.log(`CROWN: ${VERDICT.crowned}  (${VERDICT.verdict})`);
console.log(vault.liveJobs === 0 ? 'E43 DONE' : 'E43 PROBLEM (live jobs)');
