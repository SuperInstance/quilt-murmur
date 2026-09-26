// E37 — THE TRUST LANE (echo-structure admission bar + trust-layer re-probation vs the E35 sleeper)
// ==================================================================================================
// Collides with E36's carried seed. E36 (receipt 0xf6cd43aa98375565) priced three
// INFLUENCE-layer defenses against the E35 sleeper and ALL THREE failed to beat the
// undefended control (sign p >= 0.31). Its key structural receipt: influence-layer
// wrappers leave HedgeTrust bit-identical across attack arms — the fpTax lever lives
// in the TRUST layer, not the influence layer. B2's only real catch was the windowed
// INDEPENDENCE clause (the flipped sleeper's edges lagged-echoed g1's toxic stream).
// E37 designs ONE defense where E36 says the lever actually is — two composed
// mechanisms, both experiment-local over the murmur/ APIs (target: ZERO murmur changes):
//
//   (a) B4a STRUCTURE BAR AT ADMISSION — in addition to mean dev <= admitErr, the
//       candidate's probation EDGES must not be echo-dominated: over the candidate's
//       probation rounds, the fraction of its evidential weight that rides on senders
//       who are THEMSELVES recently admitted (age < admitWindow at the candidate's
//       edge time) or flagged (hard tag: echo/dup) must be <= 0.5. Source attribution
//       uses Admission's own direction doctrine (min-lag aligned edge: "a later
//       matcher would be j's copier, not j's source" — admission.mjs). Targets the
//       sleeper+flasher coupling E36 caught by accident (flipped sleeper lagged-echoes
//       g1) and the E21 sybil ride, WITHOUT touching honest independent newcomers.
//       A candidate failing the bar stays at epsNew influence permanently (E36-B3's
//       receipted wrapper-probation pattern: native admitAt cannot be reset without
//       Admission re-admitting within one round — cumulative devMean dilution).
//   (b) B4b TRUST-LAYER RE-PROBATION — E36's B1 flip detector (class copied VERBATIM,
//       unmodified) plus the trust consequence E36's wrappers lacked: on every
//       throw/rethrow, the sender's HedgeTrust weight is decayed to x0.5 via
//       HedgeTrust.absorb (post-pool, pre-update — so the decayed weight re-earns
//       through the NORMAL hedge update path; absorb renormalizes, i.e. the decayed
//       mass redistributes proportionally). Hypothesis: E36's B1 failed because trust
//       kept the flipper's earned weight; decayed-but-not-zeroed trust should contain
//       the flip while letting genuine regime-noise recover.
//
// THE QUESTION: does a defense placed at the trust layer finally beat the undefended
// control (E36's bar: sign p<0.05 or it is not a defense), what does it tax the honest
// population, and can it heal its own false trips (a defense that cannot recover its
// trust decay is not a defense either)?
//
// SETUP (E36 verbatim): 12 honest founders (mixed acuity, a1 = 0.9 reference) + 1
// honest late-joiner h2 (t=150, honest forever — the false-positive canary) + 1
// flasher g1 (toxic from arrival, t=150 — the regression canary, ACTIVE in all attack
// arms so R2c has a same-arm baseline) + 1 sleeper w1 (t=150, honest phase = e24 h1
// generator verbatim, flips at admission + k* = 25 — E35's probe-optimal, carried; the
// GAN strategy search is CLOSED, k* is not re-searched). T=400, 8 seeds. Paired arms,
// IDENTICAL worlds (same truth stream, honest votes, toxic series; arms select over
// shared values):
//   A1   v3.1-sleeper  — full v3.1 + sleeper + active g1, NO new defense (E36 control;
//                        numbers to beat: D = 0.003284 +/- 0.000466 at 6 seeds)
//   B4a  structbar     — v3.1 + structure bar only + same attack
//   B4b  reprob        — v3.1 + flip detector + trust decay + same attack
//   B4ab both          — v3.1 + structure bar + detector + trust decay + same attack
//   A4   v3.1-clean    — full v3.1, no attack, NO new defense (collateral baseline)
//
// DAMAGE METHOD (E35/E36 counterfactual, verbatim): D = mean over the post-flip
// window [t_flip, min(t_flip+150,400)) of |err(pool) - err(pool with that attacker
// zeroed)|, err = |pool - s|, counterfactual pools are reference-side only
// (MurmurBus.pool, log-odds), never written to the sheet. Sleeper window anchored at
// t_adm + 25 with t_adm measured per seed on a pass-1 honest-forever A1-wiring run
// (in-run assert: pass-1 == matrix admission). g1 uses its own window [150, 300).
// Positive = hurts.
//
// DECISION RULES (receipted BEFORE the full run):
//   R1 CONTAINMENT — each B arm must satisfy D_w1(B) < D_w1(A1): paired one-sided
//      sign test (zeros excluded) p < 0.05 AND paired mean delta > 0. Report paired
//      delta +/- SE and damage ratio D(B)/D(A1). (E36's bar: a defense that cannot
//      clear p<0.05 is not a defense.)
//   R2 CANARIES — per B arm, ALL must hold:
//      (a) honestFinalQ within 1 SE of A4: |mean(honQ(A4)-honQ(B))| <= SE of the
//          seed-paired difference. LIVE check now, not the E36 structural no-op:
//          B4b/B4ab move trust by design (E36's bit-identity receipt is expected to
//          break here — receipted as trustMoved), while B4a is influence-layer-only
//          and is ASSERTED bit-identical to A1 on trust (hard structural assert);
//      (b) h2 effectively admitted (native admission AND, in struct arms, structure-
//          bar pass) in ALL seeds, with mean effective round <= A1's mean h2 round
//          + 20. h2 is independent, so the structure bar must not touch it;
//      (c) g1 containment must not WORSEN vs A1: mean D_g1(B) <= mean D_g1(A1)
//          + 1 SE (SE of the seed-paired difference).
//   R3 RECOVERY (reprobation arms B4b/B4ab) — when the detector false-trips an honest
//      founder (E36 saw 5/6 seeds), the trust-decayed founder must recover to within
//      5% of its pre-trip trust share within 100 rounds. Measured per decay event:
//      post-round share >= 0.95 x pre-trip share at some round in (decayT, decayT
//      +100]. Events without a full 100-round horizon (decayT > T-1-100) are
//      receipted but excluded from the verdict. Vacuous pass if no founder trips.
//      B4a: N/A (no trust contact — nothing to heal; its blocks are admission
//      decisions, not trips). A defense that cannot heal its own false trips fails
//      R3 even if R1 passes.
//   R4 SLEEPER RECORD per arm — native admission? round? detector trips? decay
//      events (pre/post trust)? post-trip trust path: per-round HedgeTrust curve
//      from JOIN, shape receipt computed from data (decay drop %, re-earn slope,
//      retrips, final/pre-trip ratio).
//   CROWN — any arm passing R1 + R2 (all three canaries) + R3 (or N/A) is crowned
//      with its damage ratio; if several pass, crown the LOWEST D(B)/D(A1) and list
//      the rest as co-passing. If none pass: receipt the negative verdict + computed
//      mechanism analysis (E36 style — derived from telemetry, no static text).
//
// RUNTIME DISCIPLINE (receipted before the full run): probe = 1-seed timed run of
// the full 5-arm matrix (+ its pass-1); projected = t_probe * 8 + 2s IO; if projected
// > 170s, cut seeds 8 -> 6 and RECEIPT the cut (E36 ran 130s at 6 seeds). The probe
// doubles as matrix seed 0 (no re-run).
//
// COMPOSITION RECEIPT (stated up front): both mechanisms are EXPERIMENT-LOCAL
// classes over the murmur/ module APIs — ZERO changes to murmur/ (target: zero).
// Hooks used:
//   Admission: observe(), reattribute(), notePooled(), admitted(), admittedRound(),
//     probationary(), age(), devMean(), edges (public map, read-only for echo
//     forensics), firstSeen (public, read-only), maxLag/tol (public constants),
//     admitWindow/epsNew/admitErr/minEdgesIndep (public config fields)
//   HedgeTrust: weights(), update(), absorb()  <- THE TRUST-DECAY HOOK E36 LACKED,
//     weight() (recovery sampling + R4 curves)
//   Provenance: inspect(), penalize(), tagOf() (hard tags feed the structure bar)
//   MurmurBus.pool() (reference-side counterfactuals), receipts.sealChain/verifyChain.
// FlipGuard is copied VERBATIM from e36_countermove.mjs (unmodified); the trust
// consequence is a SEPARATE mechanism (TrustReprobation) that drains FlipGuard's
// event log — decay post-pool pre-update, re-earn through the normal update path.
// Interpretation receipt for (a): a candidate's only per-sender evidential weight is
// its probation EDGE stream (edges are the units admission's independence bar already
// counts), so "fraction of its weight riding on risky senders" = riskySourceEdges /
// probationEdges; an independent edge rides on nobody. Denominator = ALL probation
// edges (independent + dependent) — "echo-dominated" is a statement about the whole
// evidential mass. Source classification at the candidate's edge time; hard tags read
// at evaluation time (the tag state the mesh holds at admission).
//
// RNG DOCTRINE (binding, E35/E36 verbatim): all randomness through MothVault
// (offline:true), one harvest, per-purpose stream keys 'e37:<purpose>:<seed>' via
// streamFor; NO Math.random. Paired worlds REQUIRE arm-identical world streams —
// arms never consume different draws.
//
// Run: node experiments/e37_trustlane.mjs [seeds]   (E37_DEV=1 for a 1-seed dev run)

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
let SEEDS = Number(process.argv[2] || (process.env.E37_DEV ? 1 : 8));
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
const ARMS = ['A1-v3.1-sleeper', 'B4a-structbar', 'B4b-reprob', 'B4ab-both', 'A4-v3.1-clean'];
const STRUCT_ARMS = ['B4a-structbar', 'B4ab-both'];
const REPROB_ARMS = ['B4b-reprob', 'B4ab-both'];
const CFG = { eta: 0.25, share: 0.02 };
const ADM = {
  beta: 0.12, alpha: 0.25, novSpread: 0.15,
  coldStart: true, admitWindow: 40, epsNew: 0.15,
  minEdgesIndep: 2, admitErr: 0.5, capShare: 0.10,
};
const DEF = {
  b1: { lambda: 0.05, trail: 30, ratio: 2.0, floor: 0.15, guardRounds: 40 }, // E36 B1 verbatim
  struct: { maxEchoFraction: 0.5 },
  reprob: { frac: 0.5, horizon: 100 },
};
const G1_WIN = { from: JOIN, to: JOIN + DW };  // g1's own window [150, 300)
const TOL = 1e-9;

// ---------------- helpers ----------------
const clampP = (p) => Math.min(0.98, Math.max(0.02, p));
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length); };
const median = (a) => { const b = [...a].sort((x, y) => x - y); const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
const r6 = (x) => (Number.isFinite(x) ? +x.toFixed(6) : x);
const f3 = (x) => (Number.isFinite(x) ? x.toFixed(3) : 'n/a');
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

// ---------------- world (E36 verbatim; stream keys e37:*) ----------------
function genWorld(seed, harvest, vault) {
  const wR = makeRng(harvest, vault, `e37:world:${seed}`);
  const qR = makeRng(harvest, vault, `e37:skill:${seed}`);
  const xR = makeRng(harvest, vault, `e37:tox:${seed}`);
  const shR = makeRng(harvest, vault, `e37:sleep:${seed}`);
  const nhR = makeRng(harvest, vault, `e37:h2:${seed}`);
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
  for (let i = 0; i < N; i++) vR.push(makeRng(harvest, vault, `e37:vote:${seed}:${i}`));
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
  return { id: `trustlane-${V}`, title: `E37 trust lane (${V} voice slots)`, cells };
}

// __DEFENSES_BEGIN (experiment-local; murmur/ untouched — composition receipt)
// FlipGuard is E36's B1 wrapper copied VERBATIM (unmodified) — the detector both
// reprobation arms reuse. It acts at the influence layer only (epsNew throwback).
class FlipGuard {
  constructor(adm, cfg) {
    this.adm = adm; this.cfg = cfg;
    this.devs = new Map();      // id -> [{t, d}] — the sender's OWN |p - pooled| stream
    this.ewma = new Map();      // id -> EWMA_lambda(dev) — the receipted regime tracker
    this.ref = new Map();       // id -> { mean, src } — its OWN probation devMean
    this.guarded = new Map();   // id -> { from, until } — epsNew throwback window
    this.events = [];
    this.guardRounds = new Map();
  }
  rec(id, t, d) {
    if (!this.devs.has(id)) this.devs.set(id, []);
    const a = this.devs.get(id);
    a.push({ t, d });
    const prev = this.ewma.get(id);
    this.ewma.set(id, prev === undefined ? d : (1 - this.cfg.lambda) * prev + this.cfg.lambda * d);
    if (!this.ref.has(id)) {
      const r = this.adm.admittedRound(id);
      if (r === 1) { // founder: no probation exists — its OWN first admitWindow rounds are the reference
        if (a.length === this.adm.admitWindow) this.ref.set(id, { mean: mean(a.slice(0, this.adm.admitWindow).map((x) => x.d)), src: 'first40' });
      } else if (r != null && this.adm.admitted(id)) { // newcomer: the quantity admitErr judged, verbatim from Admission
        const dm = this.adm.devMean(id);
        if (dm != null) this.ref.set(id, { mean: dm, src: 'probation' });
      }
    }
  }
  note(t, murmurs, pool) { // post-pool: record devs + evaluate triggers (effective next round)
    for (const m of murmurs) this.rec(m.from, t, Math.abs(+m.p - pool));
    for (const m of murmurs) {
      const id = m.from;
      const g = this.guarded.get(id);
      if (g) {
        if (t > g.until) { this.events.push({ t, id, kind: 'release' }); this.guarded.delete(id); }
        continue;
      }
      const ref = this.ref.get(id);
      if (!ref || !this.adm.admitted(id)) continue;
      const a = this.devs.get(id);
      if (a.length < this.cfg.trail) continue;
      const trail = mean(a.slice(-this.cfg.trail).map((x) => x.d));
      if (trail > this.cfg.ratio * ref.mean && trail > this.cfg.floor) {
        this.guarded.set(id, { from: t + 1, until: t + this.cfg.guardRounds });
        const re = this.events.some((e) => e.id === id && (e.kind === 'throw' || e.kind === 'rethrow'));
        this.events.push({ t, id, kind: re ? 'rethrow' : 'throw', trail30: r6(trail), refMean: r6(ref.mean), refSrc: ref.src, ewma: r6(this.ewma.get(id)) });
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
      const ref = this.ref.get(id);
      per[id] = {
        throws: ev.filter((e) => e.kind === 'throw').length,
        rethrows: ev.filter((e) => e.kind === 'rethrow').length,
        guardRounds: this.guardRounds.get(id) ?? 0,
        refMean: ref ? r6(ref.mean) : null, refSrc: ref ? ref.src : null,
      };
    }
    return { per, events: this.events.map((e) => ({ ...e })) };
  }
}

// B4a — STRUCTURE BAR AT ADMISSION (new in E37). Evaluated ONCE, at the sender's
// native admission round, over its probation edges [firstSeen .. admitRound] (the
// edge created on the admission round itself is included: observe() pushes edges
// BEFORE running the admission check — same record Admission's own bars judge).
// Per-edge presumed source: the MIN-LAG aligned sender edge (admission.mjs's own
// direction doctrine — "a later matcher would be j's copier, not j's source").
// A source is RISKY iff it is itself recently admitted (age < admitWindow measured
// at the candidate's edge time) or hard-flagged (echo/dup tag at evaluation time).
// echoFraction = riskyEdges / ALL probation edges (independent edges ride on nobody).
// Fail -> the candidate stays at epsNew influence permanently (wrapper probation;
// native admitAt is NOT reset — E36's receipted re-admission-within-a-round finding).
class StructureBar {
  constructor(adm, prov, cfg) {
    this.adm = adm; this.prov = prov; this.cfg = cfg;
    this.state = new Map();   // id -> 'admitted' | 'blocked'
    this.events = [];
    this.blockRounds = new Map();
  }
  // presumed source(s) of candidate edge e: senders k with a value+jump-aligned
  // edge at e.t - L, smallest L wins (earlier = source, later = copier)
  sourcesOf(e) {
    let bestLag = Infinity, srcs = [];
    for (const [k, kEdges] of this.adm.edges) {
      if (k === e.id) continue;
      for (let L = 1; L <= this.adm.maxLag; L++) {
        if (kEdges.some((ke) => ke.t === e.t - L
          && Math.abs(ke.v - e.v) <= this.adm.tol
          && Math.abs(ke.jump - e.jump) <= this.adm.tol)) {
          if (L < bestLag) { bestLag = L; srcs = [k]; }
          else if (L === bestLag) srcs.push(k);
          break; // this k's smallest lag found
        }
      }
    }
    return { lag: bestLag, srcs };
  }
  evalBar(id) {
    const admRound = this.adm.admittedRound(id);
    const fs = this.adm.firstSeen.get(id);
    const edges = (this.adm.edges.get(id) ?? [])
      .filter((e) => e.t >= fs && e.t <= admRound)
      .map((e) => ({ ...e, id }));
    let risky = 0, dependent = 0;
    const per = [];
    for (const e of edges) {
      const { lag, srcs } = this.sourcesOf(e);
      if (srcs.length === 0) { per.push({ t: e.t, kind: 'indep' }); continue; }
      dependent++;
      const riskySrcs = srcs.filter((k) => {
        const kfs = this.adm.firstSeen.get(k);
        const ageAtEdge = e.t - kfs + 1;
        const tag = this.prov ? this.prov.tagOf(k).tag : 'clean';
        return ageAtEdge < this.adm.admitWindow || tag === 'echo' || tag === 'dup';
      });
      const safeSrcs = srcs.filter((k) => !riskySrcs.includes(k));
      if (riskySrcs.length > 0) risky++;
      per.push({ t: e.t, lag, srcs, riskySrcs, safeSrcs, risky: riskySrcs.length > 0 });
    }
    const n = edges.length;
    return {
      echoFraction: n > 0 ? risky / n : 0, n, dependent,
      independent: n - dependent, risky, founderSourced: dependent - risky, per,
    };
  }
  note() { /* recording-free: the bar is evaluated ONCE at admission (apply), Admission's own timing */ }
  apply(infl, adm, t) {
    for (const id of infl.keys()) {
      if (adm.admittedRound(id) === 1) { this.state.set(id, 'admitted'); continue; } // founders: no admission event
      let stt = this.state.get(id);
      if (!stt && adm.admitted(id)) {
        // Admission just admitted this sender (its own mean-dev + independence
        // bars passed) — the wrapper adds the STRUCTURE clause over the sender's
        // whole probation edge record.
        const ev = this.evalBar(id);
        stt = ev.echoFraction > this.cfg.maxEchoFraction ? 'blocked' : 'admitted';
        this.state.set(id, stt);
        this.events.push({
          t, id, kind: stt === 'blocked' ? 'struct-block' : 'struct-admit',
          echoFraction: r6(ev.echoFraction), bar: this.cfg.maxEchoFraction,
          nEdges: ev.n, dependent: ev.dependent, independent: ev.independent,
          risky: ev.risky, founderSourced: ev.founderSourced,
          per: stt === 'blocked' ? ev.per : undefined, // per-edge forensics only on blocks
        });
      }
      if (stt === 'blocked' && !adm.probationary(id)) { // adm says admitted; the bar says no — epsNew (B3 pattern)
        infl.set(id, infl.get(id) * adm.epsNew);
        this.blockRounds.set(id, (this.blockRounds.get(id) ?? 0) + 1);
      }
    }
    return infl;
  }
  summary() {
    const per = {};
    for (const id of ALL_IDS) {
      per[id] = { state: this.state.get(id) ?? 'undecided', blockRounds: this.blockRounds.get(id) ?? 0 };
    }
    return { per, events: this.events.map((e) => ({ ...e })) };
  }
}

// B4b — TRUST-LAYER RE-PROBATION (new in E37; the lever E36 said was missing).
// Drains FlipGuard's event log: on every throw/rethrow, decay that sender's
// HedgeTrust weight to frac x its current value via absorb(), then let the NORMAL
// hedge update path re-earn it (fixed-share + exp(eta*r)). Decay fires post-pool
// pre-update (same seam as adm.notePooled / FlipGuard.note). Recovery is measured
// per event against 0.95 x pre-trip share within `horizon` rounds (R3).
class TrustReprobation {
  constructor(fg, trust, cfg) {
    this.fg = fg; this.trust = trust; this.cfg = cfg;
    this.cursor = 0;   // next FlipGuard event index to drain
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
  return { loc: src.slice(a, b).split('\n').length - 1, classes: ['FlipGuard (E36 verbatim)', 'StructureBar', 'TrustReprobation'] };
}

// ---------------- arm specs ----------------
// attackers: [{ id, flip }] — flip = toxic start round (null = never flips).
// g1 is ACTIVE in all attack arms (E36 deviation, carried) — the regression
// canary needs a same-arm baseline. A4 carries no attackers.
function armSpecs(tAdm) {
  const flip = tAdm == null ? null : tAdm + KSTAR;
  const atk = [{ id: SLEEP, flip }, { id: INSTANT, flip: JOIN }];
  return {
    'A1-v3.1-sleeper': { name: 'A1-v3.1-sleeper', defenses: [], reprob: false, attackers: atk },
    'B4a-structbar': { name: 'B4a-structbar', defenses: ['struct'], reprob: false, attackers: atk },
    'B4b-reprob': { name: 'B4b-reprob', defenses: ['flip'], reprob: true, attackers: atk },
    'B4ab-both': { name: 'B4ab-both', defenses: ['struct', 'flip'], reprob: true, attackers: atk },
    'A4-v3.1-clean': { name: 'A4-v3.1-clean', defenses: [], reprob: false, attackers: [] },
  };
}

// ---------------- one seed, paired arms ----------------
async function runArm(seed, world, spec, eng) {
  const { s, votes, toxV, sleepH, h2V } = world;
  const A = spec.name;
  const trust = new HedgeTrust(ALL_IDS, CFG);
  const prov = new Provenance({});
  const adm = new Admission(ADM);
  const structDef = spec.defenses.includes('struct') ? new StructureBar(adm, prov, DEF.struct) : null;
  const flipDef = spec.defenses.includes('flip') ? new FlipGuard(adm, DEF.b1) : null;
  const reprob = spec.reprob ? new TrustReprobation(flipDef, trust, DEF.reprob) : null;
  const defs = [structDef, flipDef].filter(Boolean);
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
    for (const d of defs) d.apply(infl, adm, t); // influence-layer consequences (struct bar, flip guard)

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
    w1: {
      ...st.rec[SLEEP],
      probTraceN: st.probTrace.length,
      probTraceMean: st.probTrace.length ? mean(st.probTrace) : null,
      probTraceMax: st.probTrace.length ? Math.max(...st.probTrace) : null,
    },
    h2: st.rec[JOINER], g1: st.rec[INSTANT],
    defense: {
      struct: structDef ? structDef.summary() : null,
      flip: flipDef ? flipDef.summary() : null,
      reprob: reprob ? reprob.summary() : null,
    },
    verify: st.verify,
    err: st.err,
  };
}

// ---------------- main ----------------
console.log(`── E37 trust lane · ${SEEDS} seeds × ${T} rounds × ${ARMS.length} arms × ${V} voice slots ──`);
const vault = new MothVault({ label: 'e37', offline: true });
const harvest = await vault.harvest(256);
console.log(`vault: ${harvest.mock ? 'MOCK (offline doctrine)' : 'LIVE ' + harvest.jobId} digest=${harvest.poolDigest.slice(0, 10)} bits=${harvest.bits.length}`);

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });
book('run.config', {
  task: 'E37', name: 'the trust lane (echo-structure admission bar + trust-layer re-probation vs the E35 sleeper)',
  collides: 'E36 carried seed — E36\'s negative verdict + structural receipt (the fpTax lever lives in the TRUST layer) name this lane; E37 designs the defense there',
  T, N, voices: V, seeds: SEEDS, kStarCarried: KSTAR,
  kStarNote: 'k* = 25 carried from E35 (probe-optimal on the train seed; GAN strategy search CLOSED in E35, not re-run)',
  world: { stateFlipP: FLIP_P, skillRerollP: REROLL_P, qRange: [0.5, 0.95], a1Acuity: 0.9, toxicFormula: { id: 'E24 verbatim', acuity: TOX_Q, note: 'toxV shared by w1 post-flip AND g1 (same toxic values across arms)' } },
  attack: {
    joinRound: JOIN,
    sleeper: { id: SLEEP, honestPhase: 'e24 h1 generator verbatim (expert acuity, iid errors, own edges)', flip: 't_adm + 25; t_adm per seed from a pass-1 honest-forever A1-wiring run (in-run assert pass1 == matrix)' },
    flasher: { id: INSTANT, note: 'toxic FROM arrival t=150 — the regression canary; ACTIVE in all attack arms (E36 deviation, carried: R2c needs a same-arm g1 baseline)' },
    honestJoiner: { id: JOINER, note: 'honest forever, present in ALL arms — the false-positive canary' },
  },
  arms: ARMS,
  defenses: {
    B4a_structureBar: { ...DEF.struct, admitErr: ADM.admitErr, semantics: 'at the native admission round, over probation edges [firstSeen..admitRound]: echoFraction = riskySourceEdges / ALL probation edges <= 0.5; per-edge presumed source = MIN-LAG aligned sender edge (admission.mjs direction doctrine); risky source = age < admitWindow at the candidate\'s edge time OR hard tag (echo/dup) at evaluation; fail -> epsNew influence permanently (B3\'s receipted wrapper-probation pattern; native admitAt NOT reset — E36 re-admission-within-a-round finding). Interpretation receipt: the candidate\'s only per-sender evidential weight is its probation edge stream; independent edges ride on nobody; denominator = all probation edges' },
    B4b_trustReprobation: { ...DEF.b1, frac: DEF.reprob.frac, horizon: DEF.reprob.horizon, detector: 'FlipGuard copied VERBATIM from e36_countermove.mjs (EWMA 0.05, trailing-30 devMean > 2x own probation devMean & > 0.15 floor -> epsNew 40r)', trustConsequence: 'on EVERY throw/rethrow: sender\'s HedgeTrust weight x0.5 via absorb() (post-pool pre-update); re-earns through the normal hedge update path (fixed-share 0.02 + exp(eta*r)); absorb renormalizes -> decayed mass redistributes proportionally' },
  },
  composition: {
    murmurChanges: 'NONE (target zero) — both mechanisms are experiment-local classes over public murmur/ APIs',
    apis: ['Admission.observe/reattribute/notePooled/admitted/admittedRound/probationary/age/devMean/edges(read)/firstSeen(read)/maxLag/tol/admitWindow/epsNew/admitErr/minEdgesIndep', 'HedgeTrust.weights/update/absorb(weight)/weight — absorb IS the trust-decay hook E36 lacked', 'Provenance.inspect/penalize/tagOf', 'MurmurBus.pool (reference-side counterfactuals)', 'receipts.sealChain/verifyChain'],
    layerNote: 'B4a is influence-layer-only (asserted trust-bit-identical to A1 per seed, hard assert); B4b/B4ab deliberately MOVE trust (E36\'s structural receipt inverted by design — receipted as trustMoved per seed); decay fires post-pool pre-update (same seam as adm.notePooled / FlipGuard.note)',
    timing: 'structure bar evaluated ONCE at the native admission round (same timing as B3\'s evaluation — no seam with Admission\'s own check); FlipGuard re-trips allowed; wrapper probation = epsNew only, adm\'s aggregate capShare not duplicated (slack: one re-probationed sender ~3% share vs 10% cap)',
  },
  hedge: CFG, admission: ADM,
  founders: 'D1 genesis acclamation (newcomers w1/g1/h2 join t=150: probationary from firstSeen)',
  absentSenderReward: 'missing ids get HedgeTrust default 0.5 (unproven prior) while absent; roster = 15 slots in every arm (e33/e35/e36 convention)',
  reward: 'r_i = 1 - |p_i - s_t| (supervised pool — pool-independent, so trust re-earning is not gated by the defense)',
  rng: 'MothVault offline:true, one harvest, per-purpose keys e37:<purpose>:<seed>[:<voice>] via streamFor; paired worlds REQUIRE arm-identical world streams (arms select over shared values; no arm-keyed draws); no Math.random',
  metrics: {
    D_w1: 'mean over [t_adm+25, min(t_adm+25+150,400)) of |pool - s_t| - |pool_cf - s_t| (E24/E35/E36 counterfactual, sleeper zeroed, reference-side log-odds, never written to the sheet; positive = hurts)',
    D_g1: 'same method over g1\'s own window [150, 300), g1 zeroed',
    honestFinalQ: 'mean HedgeTrust weight of the 12 honest incumbents at t=T-1 (post final update+absorb)',
  },
  decisionRules: {
    R1_containment: 'each B arm must satisfy D_w1(B) < D_w1(A1): paired one-sided sign test (zeros excluded) p < 0.05 AND paired mean delta > 0; report paired delta +/- SE and damage ratio D(B)/D(A1). E36\'s bar: a defense that cannot clear p<0.05 is not a defense',
    R2a_honestFinalQ: '|mean(honQ(A4) - honQ(B))| <= 1 SE of the seed-paired difference; LIVE check now — B4b/B4ab move trust by design (trustMoved receipted per seed), B4a asserted trust-bit-identical to A1 (hard assert)',
    R2b_h2Canary: 'h2 EFFECTIVELY admitted (native + structure-bar pass in struct arms) in ALL seeds, mean effective round <= A1 mean h2 round + 20; h2 is independent so the structure bar must not touch it; guard rounds from any flip-guard false trip receipted alongside',
    R2c_g1Regression: 'mean D_g1(B) <= mean D_g1(A1) + 1 SE (SE of the seed-paired difference)',
    R3_recovery: 'reprobation arms (B4b, B4ab): every detector false-trip on an honest founder with a full 100-round horizon (decayT <= T-1-100) must recover to >= 95% of its pre-trip trust share within 100 rounds (post-round share sampling); vacuous pass if no founder trips; B4a N/A (no trust contact). A defense that cannot heal its own false trips fails R3 even if R1 passes',
    R4_sleeperRecord: 'per arm: native admission? round? detector trips? decay events (pre/post trust)? post-trip trust path = per-round HedgeTrust curve from JOIN; shape receipt COMPUTED from the curve (decay drop %, re-earn slope to the post-decay peak within 60 rounds, retrips, final/pre-trip ratio)',
    crown: 'any arm passing R1 + R2 (all three canaries) + R3 (or N/A) is crowned with its damage ratio D(B)/D(A1); several pass -> crown the LOWEST damage ratio, list the rest as co-passing; none pass -> negative verdict + COMPUTED mechanism analysis (E36 style: derived from telemetry, no static pre-drafted text)',
  },
  runtimeRules: 'probe = 1-seed timed run of the full 5-arm matrix (+ its pass-1); projected = t_probe * 8 + 2s IO; if projected > 170s cut seeds 8 -> 6 and RECEIPT the cut (E36 ran 130s at 6 seeds); probe doubles as matrix seed 0 (no re-run); NO script edits after the final run (stale-artifact doctrine)',
  vault: { mock: harvest.mock, digest: harvest.poolDigest },
  engine: 'vendored quilt dist (QuiltEngine)', sheetVerifyTol: TOL,
});

// ---- matrix (probe = seed 0, timed; doubles as matrix seed 0) ----
const agg = {};
for (const A of ARMS) {
  agg[A] = {
    acc: [], pre: [], dmgW1: [], dmgG1: [], shareW1: [], shareG1: [], honQ: [],
    w1Adm: [], w1Dev: [], w1Indep: [], w1ProbMax: [], h2Adm: [], g1Adm: [],
    trustFlip: [], conv: [],
    flip: { per: {}, w1Events: [], founderThrows: [] },
    struct: { events: [] },
    decayEvents: [],
    w1Curves: {},
    vfy: { checks: 0, pass: 0, maxDiff: 0 },
  };
}
const seedRows = [];
const t0 = Date.now();
let seed0Ms = null;
let cut = null;

for (let seed = 0; seed < SEEDS; seed++) {
  const seedStart = Date.now();
  const world = genWorld(seed, harvest, vault);
  // pass-1: honest-forever admission probe (A1 wiring incl. active g1) -> t_adm
  const engP1 = new QuiltEngine(`e37-s${seed}-p1`, {});
  engP1.loadSheet(buildSheet());
  const p1 = await runArm(seed, world, { name: 'pass1', defenses: [], reprob: false, attackers: [{ id: SLEEP, flip: null }, { id: INSTANT, flip: JOIN }] }, engP1);
  if (p1.w1.admitExpT === undefined) console.log(`  seed ${seed}: sleeper NOT admitted under honest behavior — attack cannot launch (receipted as neverLaunched)`);
  const tAdm = p1.w1.admitExpT;
  const specs = armSpecs(tAdm);
  const eng = new QuiltEngine(`e37-s${seed}`, {});
  eng.loadSheet(buildSheet());
  const row = { seed, seed_s: +((Date.now() - seedStart) / 1000).toFixed(1), pass1: { tAdmExp: tAdm, devMean: p1.w1.devMean, indep: p1.w1.indep, h2: p1.h2 } };
  const honQByArm = {};
  for (const A of ARMS) {
    const R = await runArm(seed, world, specs[A], eng);
    if (A !== 'A4-v3.1-clean' && R.w1.admitExpT !== tAdm) {
      throw new Error(`admission mismatch seed=${seed} arm=${A}: pass1 t_adm=${tAdm} vs matrix t_adm=${R.w1.admitExpT} (paired-worlds broken)`);
    }
    honQByArm[A] = R.honQFinal;
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
    if (R.defense.flip) {
      G.flip.per[seed] = R.defense.flip.per;
      G.flip.w1Events.push(...R.defense.flip.events.filter((e) => e.id === SLEEP).map((e) => ({ seed, ...e })));
      for (const [id, ev] of Object.entries(R.defense.flip.per)) if (id.startsWith('a') && ev.throws > 0) G.flip.founderThrows.push({ seed, id, ...ev });
    }
    if (R.defense.struct) for (const ev of R.defense.struct.events) G.struct.events.push({ seed, ...ev });
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
      defense: {
        struct: R.defense.struct ? R.defense.struct.events.map((e) => ({ id: e.id, kind: e.kind, t: e.t, echoFraction: e.echoFraction, nEdges: e.nEdges, dependent: e.dependent, independent: e.independent, risky: e.risky, founderSourced: e.founderSourced })) : null,
        flip: R.defense.flip ? Object.fromEntries(Object.entries(R.defense.flip.per).filter(([id]) => !id.startsWith('a'))) : null,
        reprob: R.defense.reprob ? R.defense.reprob.events.map((e) => ({ id: e.id, tripT: e.tripT, decayT: e.decayT, pre: e.pre, post: e.post, recoveredIn: e.recoveredIn })) : null,
      },
      verify: `${R.verify.pass}/${R.verify.checks}`,
    };
  }
  // structural asserts: B4a must leave trust bit-identical to A1 (influence-layer
  // only); B4b/B4ab are EXPECTED to move trust — receipted as trustMoved (E36's
  // bit-identity receipt inverted by design).
  const dStruct = Math.abs(honQByArm['B4a-structbar'] - honQByArm['A1-v3.1-sleeper']);
  if (dStruct > 1e-9) throw new Error(`struct-bar trust leak seed=${seed}: |honQ(B4a)-honQ(A1)|=${dStruct} (B4a must not touch the trust layer)`);
  row.structTrustInvariant = dStruct;
  row.trustMovedB4b = r6(Math.abs(honQByArm['B4b-reprob'] - honQByArm['A1-v3.1-sleeper']));
  row.trustMovedB4ab = r6(Math.abs(honQByArm['B4ab-both'] - honQByArm['A1-v3.1-sleeper']));
  seedRows.push(row);
  if (seed === 0) {
    seed0Ms = Date.now() - seedStart;
    book('probe.seed0', {
      seed: 0, timed: true, seed0_s: +(seed0Ms / 1000).toFixed(1), runsPerSeed: ARMS.length + 1,
      tAdmExp: tAdm, pass1DevMean: p1.w1.devMean, pass1Indep: p1.w1.indep,
      w1ProbTraceMax_A1: row['A1-v3.1-sleeper'].w1ProbMax,
      note: 'probe = 1-seed timed run of the full 5-arm matrix (+ pass-1); doubles as matrix seed 0 (no re-run)',
    });
    const projected = (seed0Ms / 1000) * 8 + 2;
    if (projected > 170 && SEEDS === 8) { SEEDS = 6; cut = 'seeds cut 8 -> 6 by the probe rule (projected > 170s); paired claims preserved'; }
    else if (projected > 170) { cut = `seeds already ${SEEDS} (< 8); projected ${projected.toFixed(0)}s still > 170s — proceeding at minimum receipted fallback`; }
    book('runtime.probe', {
      tProbe_seed0_s: +(seed0Ms / 1000).toFixed(1),
      projected_8seeds_s: +projected.toFixed(1),
      projectedFormula: 't_probe * 8 + 2s IO (receipted)',
      seedDecision: SEEDS, cut: cut ?? 'none — full plan within budget',
      e36Reference_s: '130.1s matrix at 6 seeds',
    });
    console.log(`probe(seed 0): ${+(seed0Ms / 1000).toFixed(1)}s -> projected(8 seeds)=${projected.toFixed(0)}s -> seeds=${SEEDS}${cut ? ' (CUT)' : ''}`);
  }
  book('run', row);
  const proj = (((Date.now() - t0) / 1000) / (seed + 1)) * SEEDS;
  console.log(`  seed ${seed + 1}/${SEEDS} done (t_adm=${tAdm}, ${((Date.now() - t0) / 1000).toFixed(1)}s elapsed, projected total ${proj.toFixed(0)}s)`);
}
const elapsedMatrix = +((Date.now() - t0) / 1000).toFixed(1);
console.log(`matrix elapsed ${elapsedMatrix}s`);

// ---------------- aggregate ----------------
const armsAgg = {};
for (const A of ARMS) {
  const G = agg[A];
  const isAttack = A !== 'A4-v3.1-clean';
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
    defenseTelemetry: {
      w1Flip: Object.fromEntries(Object.entries(G.flip.per).map(([s, per]) => [s, per[SLEEP] ?? null])),
      h2Flip: Object.fromEntries(Object.entries(G.flip.per).map(([s, per]) => [s, per[JOINER] ?? null])),
      g1Flip: Object.fromEntries(Object.entries(G.flip.per).map(([s, per]) => [s, per[INSTANT] ?? null])),
      founderThrows: G.flip.founderThrows,
      structEvents: G.struct.events,
      decayEvents: G.decayEvents,
    },
    verify: { checks: G.vfy.checks, pass: G.vfy.pass, maxDiff: G.vfy.maxDiff.toExponential(2) },
  };
}

// ---------------- claims ----------------
const A1 = 'A1-v3.1-sleeper', A4 = 'A4-v3.1-clean';
const B_ARMS = ['B4a-structbar', 'B4b-reprob', 'B4ab-both'];
const dmgW1Of = (A) => agg[A].dmgW1.map((d) => (d === null ? 0 : d));
const dmgG1Of = (A) => agg[A].dmgG1.map((d) => (d === null ? 0 : d));
const honQOf = (A) => agg[A].honQ;

// R1 CONTAINMENT per defense arm
const R1 = {};
for (const B of B_ARMS) {
  const d = dmgW1Of(A1).map((x, i) => x - dmgW1Of(B)[i]); // >0 = defense reduces damage
  const stst = signTestOneSided(d);
  const mD1 = mean(dmgW1Of(A1)), mDB = mean(dmgW1Of(B));
  R1[B] = {
    damage_A1: armsAgg[A1].damageW1, damage_B: armsAgg[B].damageW1,
    pairedDelta_A1_minus_B: { mean: r6(mean(d)), se: r6(seOf(d)), sd: r6(sd(d)), n: d.length, perSeed: d.map((x) => r6(x)) },
    signTest_oneSided: stst,
    damageRatio_B_over_A1: r6(mDB / Math.max(1e-12, mD1)),
    verdict: (mean(d) > 0 && stst.p < 0.05) ? 'PASS' : 'FAIL',
  };
}

// R2 CANARIES per defense arm
const R2 = { perDefense: {} };
const a1H2Mean = armsAgg[A1].h2Admission.tAdmExp ? armsAgg[A1].h2Admission.tAdmExp.mean : null;
for (const B of B_ARMS) {
  // (a) honestFinalQ vs A4 (live check for reprobation arms) + incremental vs A1
  const lossVsA4 = honQOf(A4).map((q, i) => q - honQOf(B)[i]);
  const incrVsA1 = honQOf(A1).map((q, i) => q - honQOf(B)[i]);
  const seA4 = seOf(lossVsA4), seIncr = seOf(incrVsA1);
  const honQPass = Math.abs(mean(lossVsA4)) <= seA4;
  // (b) h2 effective admission (native + structure bar where present)
  const nativeH2 = armsAgg[B].h2Admission;
  let h2Eff;
  if (STRUCT_ARMS.includes(B)) {
    const admEvs = agg[B].struct.events.filter((e) => e.id === JOINER && e.kind === 'struct-admit');
    const blkEvs = agg[B].struct.events.filter((e) => e.id === JOINER && e.kind === 'struct-block');
    h2Eff = { mode: 'structure-bar', n: admEvs.length, mean: admEvs.length ? r6(mean(admEvs.map((e) => e.t))) : null, rounds: admEvs.map((e) => e.t), blocks: blkEvs.map((e) => ({ seed: e.seed, echoFraction: e.echoFraction, nEdges: e.nEdges, risky: e.risky })) };
  } else {
    h2Eff = { mode: 'native', n: nativeH2.admAdmitted_n, mean: nativeH2.tAdmExp ? nativeH2.tAdmExp.mean : null, rounds: [], blocks: [] };
  }
  const h2Delay = (h2Eff.mean != null && a1H2Mean != null) ? r6(h2Eff.mean - a1H2Mean) : null;
  const h2GuardRounds = Object.values(agg[B].flip.per).map((per) => per[JOINER]?.guardRounds ?? 0).reduce((a, b) => a + b, 0);
  const h2Pass = h2Eff.n === SEEDS && h2Delay !== null && h2Delay <= 20;
  // (c) g1 regression canary
  const g1d = dmgG1Of(B).map((x, i) => x - dmgG1Of(A1)[i]); // >0 = g1 worse under defense
  const g1Pass = mean(g1d) <= seOf(g1d);
  R2.perDefense[B] = {
    honQ: {
      mean_B: armsAgg[B].honQFinal, mean_A4: armsAgg[A4].honQFinal, mean_A1: armsAgg[A1].honQFinal,
      diff_vs_A4: { mean: r6(mean(lossVsA4)), se: r6(seA4), pass_1SE: honQPass },
      incremental_vs_A1: { mean: r6(mean(incrVsA1)), se: r6(seIncr) },
      trustMoved_maxPerSeed: r6(Math.max(...honQOf(B).map((q, i) => Math.abs(q - honQOf(A1)[i])))),
    },
    h2: { effective: h2Eff, native: nativeH2, delayVsA1: h2Delay, bar: 20, guardRoundsTotal: h2GuardRounds, pass: h2Pass },
    g1: { damage_B: armsAgg[B].damageG1, damage_A1: armsAgg[A1].damageG1, pairedDelta_B_minus_A1: { mean: r6(mean(g1d)), se: r6(seOf(g1d)) }, pass: g1Pass },
    verdict: honQPass && h2Pass && g1Pass ? 'PASS' : 'FAIL',
  };
}

// R3 RECOVERY (reprobation arms) — computed per receipted rule
function r3Of(A) {
  if (!REPROB_ARMS.includes(A)) {
    return { verdict: 'N/A', note: 'no trust-decay mechanism — structure blocks are admission decisions (influence layer), nothing to heal; trust asserted bit-identical to A1' };
  }
  const evs = agg[A].decayEvents.filter((e) => HONEST.includes(e.id));
  const full = evs.filter((e) => e.decayT <= T - 1 - DEF.reprob.horizon);
  const recovered = full.filter((e) => e.recoveredAt !== null);
  const allDecays = agg[A].decayEvents;
  return {
    verdict: full.every((e) => e.recoveredAt !== null) ? 'PASS' : 'FAIL',
    vacuous: evs.length === 0,
    founderDecayEvents: evs.length,
    withFullHorizon: full.length,
    recoveredN: recovered.length,
    recoveredIn: recovered.length ? stat(recovered.map((e) => e.recoveredIn)) : null,
    unrecovered: full.filter((e) => e.recoveredAt === null).map((e) => ({ seed: e.seed, id: e.id, decayT: e.decayT, pre: e.pre, minShare: e.minShare })),
    partialHorizonEvents: evs.length - full.length,
    allDecayEvents: allDecays.length,
    allDecayedIds: [...new Set(allDecays.map((e) => e.id))],
    perEvent: evs.map((e) => ({ seed: e.seed, id: e.id, decayT: e.decayT, kind: e.kind, pre: e.pre, post: e.post, minShare: e.minShare, recoveredIn: e.recoveredIn, path: e.path })),
  };
}
const R3 = Object.fromEntries(B_ARMS.map((B) => [B, r3Of(B)]));

// R4 SLEEPER RECORD per arm — trust path shape COMPUTED from the curves
function w1Shape(decayEvs, curve) {
  if (!decayEvs.length) return 'no trips -> no decay events; trust path = E35/E36 shape (monotone earn through probation to flip, post-flip decline)';
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
const R4 = {};
for (const A of ARMS) {
  const AA = armsAgg[A];
  const decayW1 = agg[A].decayEvents.filter((e) => e.id === SLEEP);
  const shapes = {};
  for (const [seed, curve] of Object.entries(agg[A].w1Curves)) {
    shapes[seed] = w1Shape(decayW1.filter((e) => e.seed === Number(seed)), curve);
  }
  const drops = decayW1.map((e) => (e.pre > 0 ? 1 - e.post / e.pre : 0));
  const finalOverPreTrip = agg[A].w1Curves && decayW1.length
    ? Object.entries(agg[A].w1Curves).flatMap(([seed, c]) => {
      const evs = decayW1.filter((e) => e.seed === Number(seed));
      if (evs.length === 0) return []; // seeds without trips have no pre-trip anchor
      const last = evs[evs.length - 1];
      return last.pre > 0 ? [c[c.length - 1] / last.pre] : [];
    })
    : [];
  R4[A] = {
    admAdmission: AA.w1Admission,
    flipRound: 't_adm + 25 (per-seed, pass-1 anchored)',
    shareInWindow: AA.shareW1,
    attTrustAtFlip: AA.attTrustAtFlip,
    convictionRoundByTrust: AA.attConvRoundByTrust,
    detectorTrips: agg[A].flip.per && Object.keys(agg[A].flip.per).length
      ? Object.fromEntries(Object.entries(agg[A].flip.per).map(([s, per]) => [s, per[SLEEP] ?? null]))
      : null,
    decayEvents: decayW1.map((e) => ({ seed: e.seed, tripT: e.tripT, decayT: e.decayT, kind: e.kind, pre: e.pre, post: e.post, recoveredIn: e.recoveredIn })),
    decayDropPct: drops.length ? stat(drops.map((d) => 100 * d)) : null,
    finalOverPreTrip: finalOverPreTrip.length ? stat(finalOverPreTrip) : null,
    trustPathShapes: shapes,
  };
}

// ---------------- verdict — mechanism analysis COMPUTED from telemetry ----------------
const cnt = (arr, f) => arr.filter(f).length;
const anyR1Pass = B_ARMS.some((B) => R1[B].verdict === 'PASS');
const eligible = B_ARMS.filter((B) => R1[B].verdict === 'PASS' && R2.perDefense[B].verdict === 'PASS'
  && (R3[B].verdict === 'PASS' || R3[B].verdict === 'N/A'));
eligible.sort((a, b) => R1[a].damageRatio_B_over_A1 - R1[b].damageRatio_B_over_A1);
const CROWN = eligible.length
  ? { crowned: eligible[0], damageRatio: R1[eligible[0]].damageRatio_B_over_A1, coPassing: eligible.slice(1), rule: 'min D(B)/D(A1) among arms passing R1 + R2 + R3(or N/A)' }
  : null;

// --- B4a mechanism (computed) ---
{
  const sEvents = agg['B4a-structbar'].struct.events;
  const blocks = sEvents.filter((e) => e.kind === 'struct-block');
  const admits = sEvents.filter((e) => e.kind === 'struct-admit');
  const efr = (id) => {
    const xs = admits.filter((e) => e.id === id).map((e) => e.echoFraction);
    return xs.length ? `${Math.min(...xs).toFixed(3)}-${Math.max(...xs).toFixed(3)}` : 'n/a';
  };
  const sum = (f) => sEvents.reduce((a, e) => a + (f(e) || 0), 0);
  const nEdges = sum((e) => e.nEdges), nIndep = sum((e) => e.independent), nRisky = sum((e) => e.risky), nFounder = sum((e) => e.founderSourced);
  const b4aDelta = dmgW1Of(A1).map((x, i) => x - dmgW1Of('B4a-structbar')[i]);
  const b4aIdent = r6(Math.max(...b4aDelta.map(Math.abs)));
  var MECH_B4A = blocks.length
    ? `the bar BLOCKED ${blocks.length} admission event(s) in ${new Set(blocks.map((e) => e.seed)).size}/${SEEDS} seeds — ${blocks.map((e) => `seed ${e.seed} ${e.id} echoFraction ${e.echoFraction} (${e.risky}/${e.nEdges} probation edges risky-sourced, ${e.founderSourced} founder-sourced, ${e.independent} independent)`).join('; ')}; elsewhere echoFractions at admission: w1 ${efr(SLEEP)}, g1 ${efr(INSTANT)}, h2 ${efr(JOINER)} vs bar 0.5; over ${nEdges} probation edges judged: ${nIndep} independent, ${nFounder} founder-sourced (safe ground), ${nRisky} risky-sourced (fellow-newcomer/flagged); per-seed max |D(B4a)-D(A1)| = ${b4aIdent} — divergence is exactly where blocks land`
    : `the bar NEVER fired in ${SEEDS} seeds: every candidate passed with echoFraction under 0.5 (at admission: w1 ${efr(SLEEP)}, g1 ${efr(INSTANT)}, h2 ${efr(JOINER)}); over ${nEdges} probation edges judged: ${nIndep} independent, ${nFounder} founder-sourced (min-lag precedence puts honest probation edges on the ESTABLISHED crowd, not fellow newcomers), ${nRisky} risky-sourced — ${nRisky === 0 ? 'the E21 sybil-ride coupling this bar targets (a candidate riding on freshly-admitted or flagged ground) does not occur in a world whose only newcomers are three simultaneous honest/expert/toxic voices, and the honest-probation sleeper is by construction an independent earner' : 'risky ground exists but stays under the 0.5 bar'}; per-seed max |D(B4a)-D(A1)| = ${b4aIdent}${b4aIdent < 1e-9 ? ' — arm bit-identical to A1 (no block -> no influence divergence)' : ' — divergence from admission-round pool noise only'}`;
}

// --- B4b mechanism (computed) ---
{
  const w1Trips = Object.entries(agg['B4b-reprob'].flip.per).filter(([, per]) => per[SLEEP] && per[SLEEP].throws > 0);
  const tripSeeds = w1Trips.map(([s]) => Number(s));
  const noTrip = dmgW1Of('B4b-reprob').map((x, i) => x - dmgW1Of(A1)[i]).map((d, i) => ({ d, seed: i })).filter((x) => !tripSeeds.includes(x.seed));
  const trip = dmgW1Of('B4b-reprob').map((x, i) => x - dmgW1Of(A1)[i]).map((d, i) => ({ d, seed: i })).filter((x) => tripSeeds.includes(x.seed));
  const decaysW1 = agg['B4b-reprob'].decayEvents.filter((e) => e.id === SLEEP);
  const retrips = decaysW1.filter((e) => e.kind === 'rethrow').length;
  const ft = agg['B4b-reprob'].flip.founderThrows;
  const fDecays = agg['B4b-reprob'].decayEvents.filter((e) => HONEST.includes(e.id));
  const shareDelta = (armsAgg['B4b-reprob'].shareW1 && armsAgg[A1].shareW1) ? r6(armsAgg['B4b-reprob'].shareW1.mean - armsAgg[A1].shareW1.mean) : null;
  var MECH_B4B = `detector trips on the sleeper in ${w1Trips.length}/${SEEDS} seeds (first throw needs 30 post-flip rounds; E36-B1 baseline was 1/6) — decay events on w1: ${decaysW1.length} (${retrips} retrips; pre->post ${decaysW1.length ? `${Math.min(...decaysW1.map((e) => e.pre)).toFixed(4)}-${Math.max(...decaysW1.map((e) => e.pre)).toFixed(4)} -> x${DEF.reprob.frac}` : 'n/a'}); damage delta vs A1: trip seeds ${trip.length ? `[${trip.map((x) => `s${x.seed} ${x.d >= 0 ? '+' : ''}${r6(x.d)}`).join(', ')}]` : 'n/a'}, no-trip seeds ${noTrip.length ? `[${noTrip.map((x) => (x.d >= 0 ? '+' : '') + r6(x.d)).join(', ')}]` : 'n/a'} (no-trip seeds still diverge once a founder decays); founder false-trips: ${ft.length} throw event(s) in ${new Set(ft.map((e) => e.seed)).size}/${SEEDS} seeds -> ${fDecays.length} founder trust decays (the detector's E36 regime-noise signature, now with a trust price); flipper window share vs A1: ${shareDelta === null ? 'n/a' : (shareDelta >= 0 ? '+' : '') + shareDelta} (founder decays REDISTRIBUTE mass proportionally — a pre/post-flip founder decay can move the flipper's relative share either way)`
    ;
}

// --- B4ab mechanism (computed) ---
{
  const blocks = agg['B4ab-both'].struct.events.filter((e) => e.kind === 'struct-block');
  const w1Trips = Object.entries(agg['B4ab-both'].flip.per).filter(([, per]) => per[SLEEP] && per[SLEEP].throws > 0);
  const decaysW1 = agg['B4ab-both'].decayEvents.filter((e) => e.id === SLEEP);
  const fDecays = agg['B4ab-both'].decayEvents.filter((e) => HONEST.includes(e.id));
  var MECH_B4AB = `both mechanisms composed: structure bar blocks ${blocks.length} event(s) (${blocks.map((e) => `${e.id}@s${e.seed}:ef${e.echoFraction}`).join(', ') || 'none'}); detector trips on w1 in ${w1Trips.length}/${SEEDS} seeds -> ${decaysW1.length} decay event(s); founder trust decays ${fDecays.length}; per-seed max |honQ(B4ab)-honQ(A1)| = ${r6(Math.max(...honQOf('B4ab-both').map((q, i) => Math.abs(q - honQOf(A1)[i]))))} (trust layer verifiably moved)`;
}

const VERDICT = {
  crowned: CROWN ? CROWN.crowned : 'NONE',
  verdict: CROWN
    ? `CROWNED ${CROWN.crowned} (damage ratio ${CROWN.damageRatio})`
    : (anyR1Pass ? 'R1 pass exists but no arm clears R2+R3 — no crown' : 'NO-CROWN: no defense beats the undefended control (negative verdict)'),
  crownDetail: CROWN,
  mechanism: { B4a: MECH_B4A, B4b: MECH_B4B, B4ab: MECH_B4AB },
  structuralFindings: [
    `trust layer moved by design: per-seed max |honQ(B4b)-honQ(A1)| = ${r6(Math.max(...honQOf('B4b-reprob').map((q, i) => Math.abs(q - honQOf(A1)[i]))))}, max |honQ(B4ab)-honQ(A1)| = ${r6(Math.max(...honQOf('B4ab-both').map((q, i) => Math.abs(q - honQOf(A1)[i]))))}, while B4a held the E36 invariant exactly (hard assert < 1e-9, max observed ${r6(Math.max(...seedRows.map((r) => r.structTrustInvariant)))}) — E36's "influence-layer wrappers leave HedgeTrust bit-identical" receipt is the null hypothesis this lane was built to break, and B4a/B4b sit on opposite sides of it`,
    `recovery receipt (R3): ${REPROB_ARMS.map((A) => `${A}: ${R3[A].verdict === 'N/A' ? 'N/A' : `${R3[A].recoveredN}/${R3[A].withFullHorizon} founder decay events recovered to >=95% of pre-trip share within 100 rounds${R3[A].recoveredIn ? ` (mean ${R3[A].recoveredIn.mean} rd)` : ''}`}`).join('; ')} — the supervised reward stream (r = 1-|p-s|, pool-independent) is what makes trust re-earning defense-proof: influence consequences do not gate re-earning`,
  ],
};

book('finding.R1', { rule: 'R1 CONTAINMENT — D_w1(B) < D_w1(A1), paired one-sided sign test p<0.05 (E36\'s bar)', perArm: R1, anyPass: anyR1Pass });
book('finding.R2', { rule: 'R2 CANARIES — (a) honQ within 1 SE of A4 (LIVE: reprobation arms move trust), (b) h2 effectively admitted, delay <= +20 vs A1, (c) g1 not worsened vs A1 +1 SE', perArm: R2.perDefense, a1H2Mean });
book('finding.R3', { rule: 'R3 RECOVERY — trust-decayed founders recover to >=95% of pre-trip share within 100 rounds (reprobation arms)', perArm: R3 });
book('finding.R4', { rule: 'R4 SLEEPER RECORD per arm — admission, trips, decay events, computed trust-path shapes', perArm: R4 });
book('finding.verdict', { ...VERDICT, eligibleArms: eligible, crown: CROWN });
book('finding.runtime', {
  seedsRun: SEEDS, matrixElapsed_s: elapsedMatrix, totalElapsed_s: +((Date.now() - t0) / 1000).toFixed(1),
  totalNote: 'probe = seed 0 (inside the matrix loop), so matrix elapsed IS total wall since t0; pass-1 runs counted in seed 0',
  cut: cut ?? 'none — full plan within budget', vaultLiveJobs: vault.liveJobs,
});

const chain = sealChain(rows);
const tip = rows[rows.length - 1].row_hash;
const vfy = verifyChain(rows);
if (!vfy.ok) { console.error('CHAIN VERIFY FAILED', vfy); process.exit(1); }
console.log(`chain: ${rows.length} rows, tip ${tip} VERIFIED`);

mkdirSync('experiments/outputs', { recursive: true });
const summary = {
  task: 'E37', name: 'the trust lane (echo-structure admission bar + trust-layer re-probation vs the E35 sleeper)',
  seeds: SEEDS, T, voices: V, kStarCarried: KSTAR, arms: ARMS,
  runtime_s: { probeSeed0: +(seed0Ms / 1000).toFixed(1), matrix: elapsedMatrix, total: +((Date.now() - t0) / 1000).toFixed(1) },
  config: {
    world: { FLIP_P, REROLL_P, N, TOX_Q, JOIN }, damageWindow: DW, pre: PRE, g1Window: G1_WIN,
    hedge: CFG, admission: ADM, defenses: DEF, roster: ALL_IDS,
    deviations: ['g1 ACTIVE in all attack arms (E36 deviation carried — same-arm regression-canary baseline)', 'k* = 25 carried from E35 (no re-search)', 'probe doubles as matrix seed 0', 'FlipGuard copied VERBATIM from e36_countermove.mjs; trust consequence composed separately over HedgeTrust.absorb'],
  },
  arms: armsAgg,
  claims: { R1, R2, R3, R4, verdict: VERDICT },
  perSeed: seedRows,
  chain: { rows: rows.length, tip, verified: vfy.ok },
};
writeFileSync('experiments/outputs/e37_summary.json', JSON.stringify(summary, null, 1));
writeFileSync('experiments/outputs/receipts_e37.jsonl', rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
// file re-verify (E35 discipline: the chain must verify FROM THE WRITTEN FILE)
const reread = readFileSync('experiments/outputs/receipts_e37.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const vfyFile = verifyChain(reread);
console.log(`file re-verify: ${vfyFile.ok ? 'OK' : 'FAILED'} (${reread.length} rows)`);
if (!vfyFile.ok) { console.error('FILE CHAIN VERIFY FAILED', vfyFile); process.exit(1); }

for (const B of B_ARMS) console.log(`R1 ${B}: ${R1[B].verdict} ratio(B/A1)=${R1[B].damageRatio_B_over_A1} delta=${R1[B].pairedDelta_A1_minus_B.mean}±${R1[B].pairedDelta_A1_minus_B.se} p=${R1[B].signTest_oneSided.p}`);
for (const B of B_ARMS) { const e = R2.perDefense[B]; console.log(`R2 ${B}: ${e.verdict} honQ(${e.honQ.diff_vs_A4.pass_1SE ? 'pass' : 'FAIL'}) h2(${e.h2.pass ? 'pass' : 'FAIL'} eff=${e.h2.effective.n}/${SEEDS}@${e.h2.effective.mean} delay=${e.h2.delayVsA1}) g1(${e.g1.pass ? 'pass' : 'FAIL'} delta=${e.g1.pairedDelta_B_minus_A1.mean})`); }
for (const B of B_ARMS) console.log(`R3 ${B}: ${R3[B].verdict}${R3[B].withFullHorizon != null && R3[B].withFullHorizon !== undefined ? ` (${R3[B].recoveredN ?? 0}/${R3[B].withFullHorizon} recovered${R3[B].recoveredIn ? `, mean ${R3[B].recoveredIn.mean}rd` : ''})` : ''}`);
console.log(`CROWN: ${VERDICT.crowned}  (${VERDICT.verdict})`);
console.log(vault.liveJobs === 0 ? 'E37 DONE' : 'E37 PROBLEM (live jobs)');
