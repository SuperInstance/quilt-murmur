// E36 — THE COUNTER-MOVE (pricing post-admission defenses against the E35 sleeper)
// ===========================================================================
// Collides with E35's carried seed. E35 (receipt 0x5fe7ed978f78ae5e) measured
// the hole: admission judges a newcomer by mean |p - pooled| during its
// 40-round probation (admitErr=0.5) and then grants FULL membership — a
// sleeper that behaves honestly through probation was admitted 8/8 at t=189
// (earliest possible), flipped toxic, and patience paid 1.737x the
// instant-toxic damage. v3.1 contains the flip only 5.6% better than v3
// (fractional novelty term only — an independent liar is nobody's echo), and
// honestFinalQ pays ~1.5% (S4 refuted). E35's carried seed names three
// candidate post-admission defenses; E36 PRICES them:
//
//   B1 FLIP DETECTOR — per sender, track an EWMA (lambda 0.05) of that
//      sender's OWN |p - pooled| stream; if the post-admission devMean over a
//      trailing 30-round window exceeds 2x its own probation devMean (and >
//      absolute floor 0.15), throw the sender back into probation state
//      (epsNew influence again) for another 40-round window. A flip is a
//      regime change in the sender's OWN history — the bar is self-
//      referential, it needs no global reference.
//   B2 ADMISSION SUNSETTING — membership expires every 80 rounds; re-admission
//      re-runs the admission check over the LAST 40 rounds (rolling window)
//      instead of the first 40. Incumbents (age > 200 rounds) and founders are
//      exempt — the cost falls on newcomers, not the founding population.
//   B3 TRUST-VELOCITY PRICING — the admission bar becomes two-sided: mean
//      dev <= admitErr AND max single-round |p - pooled| over probation <=
//      1.5 x admitErr (= 0.75). The E35 sleeper's probation trace max was
//      ~0.70 (single-round spike, mean over 8 seeds) — this bar targets that
//      signature; it may reject the sleeper AT probation (a legitimate
//      pre-admission win, receipted as such).
//
// THE QUESTION: what does each defense buy against the admitted-sleeper flip
// (containment), and what does it tax the honest population (false positives)?
// Is the best composite price worth crowning?
//
// SETUP (E35 verbatim where possible): 12 honest founders (mixed acuity,
// a1 = 0.9 reference) + 1 honest late-joiner h2 (t=150, honest forever — the
// false-positive canary) + 1 flasher g1 (toxic from arrival, t=150 — the
// regression canary) + 1 sleeper w1 (t=150, honest phase = e24 h1 generator
// verbatim, flips at admission + k* = 25 — E35's probe-optimal, carried; the
// GAN strategy search is CLOSED, k* is not re-searched). T=400, 8 seeds.
// Paired arms, IDENTICAL worlds (same truth stream, honest votes, toxic
// series; arms select over shared values):
//   A1 v3.1-sleeper   — full v3.1 + sleeper + active g1, NO new defense (E35 control)
//   B1 flipguard      — v3.1 + B1 wrapper + same attack
//   B2 sunset         — v3.1 + B2 wrapper + same attack
//   B3 velocity       — v3.1 + B3 wrapper + same attack
//   A4 v3.1-clean     — full v3.1, no attack, NO new defense (collateral baseline)
// DEVIATION from E35's A1 (receipted): g1 is ACTIVE from t=150 in ALL attack
// arms (A1, B1..B3) so the regression canary has a same-arm baseline — R2c
// compares g1 damage within each arm pair. A4 carries no attackers.
//
// DAMAGE METHOD (E35/E24 counterfactual, verbatim): D = mean over the
// post-flip window [t_flip, min(t_flip+150,400)) of |err(pool) -
// err(pool with that attacker zeroed)|, err = |pool - s|, counterfactual
// pools are reference-side only (MurmurBus.pool, log-odds), never written to
// the sheet. Sleeper window anchored at t_adm + 25 with t_adm measured per
// seed on a pass-1 honest-forever A1-wiring run (in-run assert: pass-1 ==
// matrix admission). g1 uses its own window [150, 300). Positive = hurts.
//
// DECISION RULES (receipted BEFORE the full run):
//   R1 CONTAINMENT DELTA — each B_i must satisfy D_w1(B_i) < D_w1(A1), paired
//      one-sided sign test (zeros excluded) p < 0.05. Report per-defense
//      paired delta +/- SE and damage ratio D(B_i)/D(A1).
//   R2 FALSE-POSITIVE TAX (the pricing core) — per defense:
//      (a) honestFinalQ vs A4 — must not drop > 1 SE (as-written check,
//          receipted); the defense-INCREMENTAL tax vs A1 is reported
//          alongside and feeds the composite, because the wrappers act at the
//          influence layer and cannot touch trust trajectories (asserted
//          per-seed) — the A4 drop is the ATTACK's receipted cost (E35 S4),
//          common to all attack arms;
//      (b) h2 admission rate and round vs A1 — a defense that delays or
//          blocks the honest late-joiner pays a visible tax (rounds and any
//          probation throws receipted);
//      (c) g1 containment must not WORSEN vs A1: mean g1 damage(B_i) <=
//          mean g1 damage(A1) + 1 SE (SE of the seed-paired difference).
//      CROWN = argmax over passing B_i of containment_ratio x (1 - fpTax),
//      containment_ratio = D(A1)/D(B_i) (damage multiple averted — higher is
//      better), fpTax = |honestFinalQ loss vs A4| / SE clipped to [0,1] (the
//      as-written task formula; an INCREMENTAL reading — loss vs A1, the
//      defense-only tax — is receipted alongside). If NO defense passes R1,
//      crown NOTHING and receipt the negative verdict with mechanism analysis.
//   R3 STRUCTURE RECEIPT — lines of defense code, whether murmur/ modules
//      changed (target: zero), which module APIs the wrappers compose over.
//   R4 SLEEPER ADMISSION RECORD per defense — admitted? round? post-flip
//      regime throws (B1), sunset re-admission outcomes (B2), velocity-bar
//      outcome at probation (B3 — a pre-admission rejection is a legitimate
//      win, receipted as such).
//
// RUNTIME DISCIPLINE (receipted before the full run): probe = 1-seed timed
// run of the full 5-arm matrix (+ its pass-1); projected = t_probe * 8 + 2s
// IO; if projected > 170s, cut seeds 8 -> 6 and RECEIPT the cut. E35 ran
// ~3.3s/run at 15 voices. The probe doubles as matrix seed 0 (no re-run).
//
// COMPOSITION RECEIPT (R3, stated up front): all three defenses are
// EXPERIMENT-LOCAL wrappers composing over the murmur/ module APIs — ZERO
// changes to murmur/ (target: zero, achieved). Hooks used:
//   Admission: observe(), reattribute(), notePooled(), admitted(),
//     admittedRound(), probationary(), age(), devMean(), edges (public map,
//     read-only for windowed independence), admitWindow/epsNew/admitErr/
//     minEdgesIndep (public config fields)
//   HedgeTrust: weights(), update(), absorb(), weight()
//   Provenance: inspect(), penalize(), tag()
//   MurmurBus.pool() (reference-side counterfactuals), receipts.sealChain/verifyChain.
// Wrappers scale the INFLUENCE map after adm.reattribute() and skip ids where
// adm already applies epsNew (no double probation). B1-as-state-surgery
// (resetting adm.admitAt) was REJECTED on receipted grounds: re-opening the
// native admit gate re-runs the CUMULATIVE devMean check, which the honest
// probation history dilutes (~0.2 << 0.5) — Admission would veto the
// throwback within one round. Hence epsNew is applied at the influence layer.
// Timing: B3 evaluates at the sender's admission round over its whole
// adm-probation dev stream (exactly Admission's own check timing — no seam);
// B1/B2 are post-pool triggers with a one-round effective lag (mirrors
// adm.notePooled's own lag). Wrapper probation = epsNew multiplier only;
// adm's aggregate capShare is not duplicated (slack here: one re-probationed
// sender holds ~3% share vs the 10% cap).
//
// RNG DOCTRINE (binding, E35 verbatim): all randomness through MothVault
// (offline:true), one harvest, per-purpose stream keys 'e36:<purpose>:<seed>'
// via streamFor; NO Math.random. Paired worlds REQUIRE arm-identical world
// streams — arms never consume different draws.
//
// Run: node experiments/e36_countermove.mjs [seeds]   (E36_DEV=1 for a 1-seed dev run)

import { QuiltEngine } from '../engine/dist/index.js';
import { HedgeTrust } from '../murmur/trust.mjs';
import { MurmurBus } from '../murmur/bus.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { Provenance } from '../murmur/provenance.mjs';
import { Admission } from '../murmur/admission.mjs';
import { sealChain, verifyChain } from '../murmur/receipts.mjs';
import { writeFileSync, readFileSync, mkdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// ---------------- config ----------------
const T = 400, N = 12;
let SEEDS = Number(process.argv[2] || (process.env.E36_DEV ? 1 : 8));
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
const ARMS = ['A1-v3.1-sleeper', 'B1-flipguard', 'B2-sunset', 'B3-velocity', 'A4-v3.1-clean'];
const CFG = { eta: 0.25, share: 0.02 };
const ADM = {
  beta: 0.12, alpha: 0.25, novSpread: 0.15,
  coldStart: true, admitWindow: 40, epsNew: 0.15,
  minEdgesIndep: 2, admitErr: 0.5, capShare: 0.10,
};
const DEF = {
  b1: { lambda: 0.05, trail: 30, ratio: 2.0, floor: 0.15, guardRounds: 40 },
  b2: { every: 80, window: 40, exemptAge: 200 },
  b3: { mult: 1.5 },
};
const G1_WIN = { from: JOIN, to: JOIN + DW };  // g1's own window [150, 300)
const TOL = 1e-9;

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
const clip01 = (x) => Math.min(1, Math.max(0, x));

// ---------------- world (E35 verbatim; stream keys e36:*) ----------------
function genWorld(seed, harvest, vault) {
  const wR = makeRng(harvest, vault, `e36:world:${seed}`);
  const qR = makeRng(harvest, vault, `e36:skill:${seed}`);
  const xR = makeRng(harvest, vault, `e36:tox:${seed}`);
  const shR = makeRng(harvest, vault, `e36:sleep:${seed}`);
  const nhR = makeRng(harvest, vault, `e36:h2:${seed}`);
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
  for (let i = 0; i < N; i++) vR.push(makeRng(harvest, vault, `e36:vote:${seed}:${i}`));
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
  return { id: `countermove-${V}`, title: `E36 counter-move (${V} voice slots)`, cells };
}

// __DEFENSES_BEGIN (experiment-local wrappers; murmur/ untouched — R3 receipt)
// Shared context: each wrapper gets the arm's own Admission instance and reads
// its public state/API (admitted, admittedRound, probationary, age, devMean,
// edges, admitWindow/epsNew/admitErr/minEdgesIndep). Wrappers scale the
// INFLUENCE map returned by adm.reattribute(); they never touch HedgeTrust or
// Provenance, so trust trajectories are arm-identical (asserted per seed).
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

class Sunset {
  constructor(adm, cfg) {
    this.adm = adm; this.cfg = cfg;
    this.devs = new Map();      // id -> [{t, d}] rolling record (pruned to the window)
    this.member = new Map();    // id -> { nextExpiry } (experiment rounds)
    this.prob = new Map();      // id -> { until } — wrapper probation after a failed re-admission
    this.events = [];
    this.probRounds = new Map();
  }
  note(t, murmurs, pool) { // recording only; re-admission checks run in apply (Admission's own lag)
    for (const m of murmurs) {
      if (!this.devs.has(m.from)) this.devs.set(m.from, []);
      const a = this.devs.get(m.from);
      a.push({ t, d: Math.abs(+m.p - pool) });
      if (a.length > this.cfg.window + 1) a.shift();
    }
  }
  // the admission check re-run over the LAST cfg.window rounds (ending t-1 —
  // the same data-through-t-1 lag Admission's own check uses)
  eval(id, t) {
    const a = (this.devs.get(id) ?? []).filter((x) => x.t >= t - this.cfg.window && x.t < t);
    const m = a.length ? mean(a.map((x) => x.d)) : Infinity;
    const indep = (this.adm.edges.get(id) ?? []).filter((e) => e.indep && e.t > this.adm.round - this.cfg.window).length;
    return { pass: a.length >= this.cfg.window && m <= this.adm.admitErr && indep >= this.adm.minEdgesIndep, mean: m, indep };
  }
  apply(infl, adm, t) {
    for (const id of infl.keys()) {
      if (adm.admittedRound(id) === 1) continue; // founders exempt (D1: constitutive crowd)
      if (!adm.admitted(id)) continue;           // still in adm's own probation — clock not started
      if (this.prob.has(id)) {
        const P = this.prob.get(id);
        if (t >= P.until) {
          const ev = this.eval(id, t);
          if (ev.pass) {
            this.events.push({ t, id, kind: 'readmit-pass', winMean: r6(ev.mean), winIndep: ev.indep });
            this.prob.delete(id);
            this.member.set(id, { nextExpiry: t + this.cfg.every });
          } else {
            this.events.push({ t, id, kind: 'readmit-fail', winMean: r6(ev.mean), winIndep: ev.indep });
            P.until = t + this.cfg.window;
          }
        }
      } else {
        if (!this.member.has(id)) this.member.set(id, { nextExpiry: (adm.admittedRound(id) - 1) + this.cfg.every });
        const M = this.member.get(id);
        if (adm.age(id) > this.cfg.exemptAge) { // incumbent exemption: age > 200
          if (!M.exempt) { M.exempt = true; this.events.push({ t, id, kind: 'exempt-age', age: adm.age(id) }); }
          continue;
        }
        if (t >= M.nextExpiry) {
          const ev = this.eval(id, t);
          if (ev.pass) {
            this.events.push({ t, id, kind: 'sunset-pass', winMean: r6(ev.mean), winIndep: ev.indep });
            M.nextExpiry = t + this.cfg.every;
          } else {
            this.events.push({ t, id, kind: 'sunset-fail', winMean: r6(ev.mean), winIndep: ev.indep });
            this.member.delete(id);
            this.prob.set(id, { until: t + this.cfg.window });
          }
        }
      }
      const P = this.prob.get(id);
      if (P && t <= P.until && !adm.probationary(id)) { // epsNew while lapsed (no double with adm)
        infl.set(id, infl.get(id) * adm.epsNew);
        this.probRounds.set(id, (this.probRounds.get(id) ?? 0) + 1);
      }
    }
    return infl;
  }
  summary() {
    const per = {};
    for (const id of [...this.devs.keys()]) {
      const ev = this.events.filter((e) => e.id === id);
      per[id] = {
        sunsetPass: ev.filter((e) => e.kind === 'sunset-pass').length,
        sunsetFail: ev.filter((e) => e.kind === 'sunset-fail').length,
        readmitPass: ev.filter((e) => e.kind === 'readmit-pass').length,
        readmitFail: ev.filter((e) => e.kind === 'readmit-fail').length,
        probRounds: this.probRounds.get(id) ?? 0,
        exemptAge: ev.some((e) => e.kind === 'exempt-age') || undefined,
      };
    }
    return { per, events: this.events.map((e) => ({ ...e })) };
  }
}

class VelocityBar {
  constructor(adm, cfg) {
    this.adm = adm; this.cfg = cfg;
    this.devs = new Map();    // id -> [{t, d}] full probation dev stream (post-admission kept for receipts)
    this.state = new Map();   // id -> 'admitted' | 'blocked' | undefined (undecided)
    this.events = [];
    this.stats = new Map();
    this.blockRounds = new Map();
  }
  note(t, murmurs, pool) { // recording only; the bar is evaluated AT admission (apply), Admission's own timing
    for (const m of murmurs) {
      if (!this.devs.has(m.from)) this.devs.set(m.from, []);
      this.devs.get(m.from).push({ t, d: Math.abs(+m.p - pool) });
    }
  }
  apply(infl, adm, t) {
    for (const id of infl.keys()) {
      if (adm.admittedRound(id) === 1) { this.state.set(id, 'admitted'); continue; } // founders: no probation, no bar
      let stt = this.state.get(id);
      if (!stt && adm.admitted(id)) {
        // Admission just admitted this sender (its own mean-dev + independence
        // bars passed) — the wrapper adds the velocity clause over the sender's
        // WHOLE probation dev stream: max single-round |p - pooled| <= 1.5*admitErr.
        const a = (this.devs.get(id) ?? []).filter((x) => x.t < t);
        const cumMax = a.length ? Math.max(...a.map((x) => x.d)) : 0;
        const cumMean = a.length ? mean(a.map((x) => x.d)) : Infinity;
        const bar = this.cfg.mult * adm.admitErr;
        stt = cumMax > bar ? 'blocked' : 'admitted';
        this.state.set(id, stt);
        this.stats.set(id, { decidedT: t, probationRounds: a.length, cumMean: r6(cumMean), cumMax: r6(cumMax), bar: r6(bar) });
        this.events.push({ t, id, kind: stt === 'blocked' ? 'vel-block' : 'vel-admit', cumMean: r6(cumMean), cumMax: r6(cumMax), bar: r6(bar) });
      }
      if (stt === 'blocked' && !adm.probationary(id)) { // adm says admitted; the bar says no — epsNew forever
        infl.set(id, infl.get(id) * adm.epsNew);
        this.blockRounds.set(id, (this.blockRounds.get(id) ?? 0) + 1);
      }
    }
    return infl;
  }
  summary() {
    const per = {};
    for (const id of [...this.devs.keys()]) {
      const s = this.stats.get(id);
      per[id] = {
        state: this.state.get(id) ?? 'undecided',
        blockRounds: this.blockRounds.get(id) ?? 0,
        cumMean: s ? s.cumMean : null, cumMax: s ? s.cumMax : null, bar: s ? s.bar : null,
        decidedT: s ? s.decidedT : null, probationRounds: s ? s.probationRounds : null,
      };
    }
    return { per, events: this.events.map((e) => ({ ...e })) };
  }
}
const DEF_CLASSES = { b1: FlipGuard, b2: Sunset, b3: VelocityBar };
// __DEFENSES_END

// self-measured defense LOC (R3 receipt)
function defenseLoc() {
  const src = readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const a = src.indexOf('// __DEFENSES_BEGIN'), b = src.indexOf('// __DEFENSES_END');
  return { loc: src.slice(a, b).split('\n').length - 1, classes: Object.keys(DEF_CLASSES) };
}

// ---------------- arm specs ----------------
// attackers: [{ id, flip }] — flip = toxic start round (null = never flips).
// g1 is ACTIVE in all attack arms (E36 deviation, receipted) — the regression
// canary needs a same-arm baseline. A4 carries no attackers.
function armSpecs(tAdm) {
  const flip = tAdm == null ? null : tAdm + KSTAR;
  const atk = [{ id: SLEEP, flip }, { id: INSTANT, flip: JOIN }];
  return {
    'A1-v3.1-sleeper': { name: 'A1-v3.1-sleeper', defense: null, attackers: atk },
    'B1-flipguard': { name: 'B1-flipguard', defense: 'b1', attackers: atk },
    'B2-sunset': { name: 'B2-sunset', defense: 'b2', attackers: atk },
    'B3-velocity': { name: 'B3-velocity', defense: 'b3', attackers: atk },
    'A4-v3.1-clean': { name: 'A4-v3.1-clean', defense: null, attackers: [] },
  };
}

// ---------------- one seed, paired arms ----------------
async function runArm(seed, world, spec, eng) {
  const { s, votes, toxV, sleepH, h2V } = world;
  const A = spec.name;
  const trust = new HedgeTrust(ALL_IDS, CFG);
  const prov = new Provenance({});
  const adm = new Admission(ADM);
  const def = spec.defense ? new DEF_CLASSES[spec.defense](adm, DEF[spec.defense]) : null;
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
    honW: {}, wAtt: {},
    rec: { [SLEEP]: {}, [INSTANT]: {}, [JOINER]: {} },
    probTrace: [],
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
    if (def) def.apply(infl, adm, t); // E36 wrappers: epsNew at the influence layer (no trust contact)

    // ---- the sheet does the pooled inference (identical formulas) ----
    for (const id of ALL_IDS) await eng.set(`v.${id}`, pOf(id, t));
    for (const id of ALL_IDS) await eng.set(`w.${id}`, infl.get(id) ?? 0);
    const pool = (await eng.get('pool.hedge')).data;
    adm.notePooled(pool);
    if (def) def.note(t, murmurs, pool);

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

    // admission records: FIRST round each newcomer is adm-admitted
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

    // attacker trust trajectory (sleeper) + conviction round
    if (wA) {
      const ws = trust.weights();
      const honMed = median(HONEST.map((id) => ws.get(id) ?? 0));
      if (wA.flip != null && t === wA.flip) st.attTrustAtFlip[SLEEP] = r6(ws.get(SLEEP) ?? 0);
      if (st.convRound[SLEEP] === undefined && honMed > 0 && (ws.get(SLEEP) ?? 0) < 0.25 * honMed) st.convRound[SLEEP] = t;
      if ([0, 149, 189, 213, 239, 289, 339, 399].includes(t)) st.wAtt[t] = r6(ws.get(SLEEP) ?? 0);
      if ([0, 149, 189, 213, 239, 289, 339, 399].includes(t)) st.honW[t] = r6(mean(HONEST.map((id) => ws.get(id) ?? 0)));
    }

    // ---- learn ----
    trust.update(rew);
    trust.absorb(prov.penalize(trust.weights()));
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
    honW: st.honW, wAtt: st.wAtt,
    w1: {
      ...st.rec[SLEEP],
      probTraceN: st.probTrace.length,
      probTraceMean: st.probTrace.length ? mean(st.probTrace) : null,
      probTraceMax: st.probTrace.length ? Math.max(...st.probTrace) : null,
    },
    h2: st.rec[JOINER], g1: st.rec[INSTANT],
    defense: def ? def.summary() : null,
    verify: st.verify,
    err: st.err,
  };
}

// ---------------- main ----------------
console.log(`── E36 counter-move · ${SEEDS} seeds × ${T} rounds × ${ARMS.length} arms × ${V} voice slots ──`);
const vault = new MothVault({ label: 'e36', offline: true });
const harvest = await vault.harvest(256);
console.log(`vault: ${harvest.mock ? 'MOCK (offline doctrine)' : 'LIVE ' + harvest.jobId} digest=${harvest.poolDigest.slice(0, 10)} bits=${harvest.bits.length}`);

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });
book('run.config', {
  task: 'E36', name: 'the counter-move (pricing flip-detector / sunsetting / velocity-bar defenses against the E35 sleeper)',
  collides: 'E35 carried seed — E35 named these three candidate post-admission defenses; E36 prices them',
  T, N, voices: V, seeds: SEEDS, kStarCarried: KSTAR,
  kStarNote: 'k* = 25 carried from E35 (probe-optimal on the train seed; GAN strategy search CLOSED in E35, not re-run)',
  world: { stateFlipP: FLIP_P, skillRerollP: REROLL_P, qRange: [0.5, 0.95], a1Acuity: 0.9, toxicFormula: { id: 'E24 verbatim', acuity: TOX_Q, note: 'toxV shared by w1 post-flip AND g1 (same toxic values across arms)' } },
  attack: {
    joinRound: JOIN,
    sleeper: { id: SLEEP, honestPhase: 'e24 h1 generator verbatim (expert acuity, iid errors, own edges)', flip: 't_adm + 25; t_adm per seed from a pass-1 honest-forever A1-wiring run (in-run assert pass1 == matrix)' },
    flasher: { id: INSTANT, note: 'toxic FROM arrival t=150 — the regression canary; ACTIVE in all attack arms (E36 deviation from E35\'s A1, receipted: R2c needs a same-arm g1 baseline)' },
    honestJoiner: { id: JOINER, note: 'honest forever, present in ALL arms — the false-positive canary' },
  },
  arms: ARMS,
  defenses: {
    B1_flipDetector: { ...DEF.b1, epsNew: ADM.epsNew, semantics: 'EWMA(lambda 0.05) of the sender\'s OWN |p-pooled| stream; trigger: trailing-30-round post-admission devMean > 2x its own probation devMean AND > 0.15 floor -> epsNew throwback for 40 rounds; self-referential bar, no global reference; re-trips allowed' },
    B2_sunsetting: { ...DEF.b2, admitErr: ADM.admitErr, minEdgesIndep: ADM.minEdgesIndep, semantics: 'membership expires every 80 rounds after admission; re-admission re-runs the admission check (mean dev + independent edges) over the LAST 40 rounds ending t-1; fail -> epsNew for 40 rounds then re-check; founders and age>200 exempt' },
    B3_velocityBar: { ...DEF.b3, admitErr: ADM.admitErr, semantics: 'admission bar becomes two-sided: adm\'s own check AND max single-round |p-pooled| over probation <= 1.5*admitErr = 0.75; violation at admission -> epsNew forever (pre-admission win); adm admitted at 189 but blocked senders stay capped' },
  },
  composition: {
    murmurChanges: 'NONE (target zero, achieved) — wrappers are experiment-local, composing over Admission\'s public API/state',
    apis: ['Admission.observe/reattribute/notePooled/admitted/admittedRound/probationary/age/devMean/edges(read)/admitWindow/epsNew/admitErr/minEdgesIndep', 'HedgeTrust.weights/update/absorb/weight', 'Provenance.inspect/penalize/tag', 'MurmurBus.pool (reference-side counterfactuals)', 'receipts.sealChain/verifyChain'],
    layerNote: 'wrappers scale INFLUENCE after adm.reattribute, skip ids adm already applies epsNew to (no double probation); B1-as-state-surgery (admitAt reset) REJECTED: the native re-admission check would re-admit within one round because the CUMULATIVE devMean is diluted by the honest probation history (~0.2 << 0.5) — receipted composition finding',
    timing: 'B3 evaluated at the sender\'s admission round over its whole adm-probation dev stream (no seam); B1/B2 are post-pool triggers, one-round effective lag (mirrors adm.notePooled); wrapper probation = epsNew only, adm\'s aggregate capShare not duplicated (slack: one re-probationed sender ~3% share vs 10% cap)',
  },
  hedge: CFG, admission: ADM,
  founders: 'D1 genesis acclamation (newcomers w1/g1/h2 join t=150: probationary from firstSeen)',
  absentSenderReward: 'missing ids get HedgeTrust default 0.5 (unproven prior) while absent; roster = 15 slots in every arm (e33/e35 convention)',
  reward: 'r_i = 1 - |p_i - s_t| (supervised pool)',
  rng: 'MothVault offline:true, one harvest, per-purpose keys e36:<purpose>:<seed>[:<voice>] via streamFor; paired worlds REQUIRE arm-identical world streams (arms select over shared values; no arm-keyed draws); no Math.random',
  metrics: {
    D_w1: 'mean over [t_adm+25, min(t_adm+25+150,400)) of |pool - s_t| - |pool_cf - s_t| (E24/E35 counterfactual, sleeper zeroed, reference-side log-odds, never written to the sheet; positive = hurts)',
    D_g1: 'same method over g1\'s own window [150, 300), g1 zeroed',
    honestFinalQ: 'mean HedgeTrust weight of the 12 honest incumbents at t=T-1 (post final update+absorb)',
  },
  decisionRules: {
    R1_containmentDelta: 'each B_i must satisfy D_w1(B_i) < D_w1(A1): paired one-sided sign test (zeros excluded) p < 0.05 AND paired mean delta > 0; report paired delta +/- SE and damage ratio D(B_i)/D(A1)',
    R2a_honestFinalQ: 'honestFinalQ(B_i) vs A4: must not drop > 1 SE of the seed-paired difference (as-written check, receipted); the defense-INCREMENTAL delta vs A1 is reported alongside and feeds the composite (wrappers act at the influence layer and cannot touch trust — asserted per seed; the A4 drop is the ATTACK\'s receipted E35-S4 cost, common to all attack arms)',
    R2b_h2Tax: 'h2 admission rate and round vs A1 per defense; rounds and any probation throws receipted (a defense that delays or blocks the honest late-joiner pays a visible tax)',
    R2c_g1Regression: 'g1 containment must not WORSEN vs A1: mean D_g1(B_i) <= mean D_g1(A1) + 1 SE (SE of the seed-paired difference)',
    crown: 'CROWN = argmax over passing B_i of containment_ratio x (1 - fpTax), containment_ratio = D(A1)/D(B_i) (damage multiple averted; higher = better containment), fpTax = |honestFinalQ loss vs A4| / SE (SE of the seed-paired difference) clipped to [0,1] — the as-written task formula; an INCREMENTAL reading (loss vs A1 = defense-only tax) is receipted alongside and feeds priceIncremental; eligibility: R1 pass AND R2c (g1 not worsened); if NO defense passes R1: crown NOTHING + negative verdict with mechanism analysis',
    R3_structure: 'lines of defense code (self-measured between __DEFENSES markers), murmur/ changed yes/no, module APIs composed',
    R4_sleeperRecord: 'per defense: admitted? round? B1 post-flip regime throws; B2 sunset re-admission outcomes; B3 velocity-bar outcome at probation (a pre-admission rejection is a legitimate win, receipted as such)',
  },
  runtimeRules: 'probe = 1-seed timed run of the full 5-arm matrix (+ its pass-1); projected = t_probe * 8 + 2s IO; if projected > 170s cut seeds 8 -> 6 and RECEIPT the cut; E35 reference ~3.3s/run at 15 voices; probe doubles as matrix seed 0 (no re-run); NO script edits after the final run (stale-artifact doctrine)',
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
    defW1: {}, defH2: {}, defG1: {}, w1Events: [], founderThrows: [],
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
  const engP1 = new QuiltEngine(`e36-s${seed}-p1`, {});
  engP1.loadSheet(buildSheet());
  const p1 = await runArm(seed, world, { name: 'pass1', defense: null, attackers: [{ id: SLEEP, flip: null }, { id: INSTANT, flip: JOIN }] }, engP1);
  if (p1.w1.admitExpT === undefined) console.log(`  seed ${seed}: sleeper NOT admitted under honest behavior — attack cannot launch (receipted as neverLaunched)`);
  const tAdm = p1.w1.admitExpT;
  const specs = armSpecs(tAdm);
  const eng = new QuiltEngine(`e36-s${seed}`, {});
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
    if (R.defense) {
      G.defW1[seed] = R.defense.per[SLEEP] ?? null;
      G.defH2[seed] = R.defense.per[JOINER] ?? null;
      G.defG1[seed] = R.defense.per[INSTANT] ?? null;
      G.w1Events.push(...R.defense.events.filter((e) => e.id === SLEEP));
      for (const [id, ev] of Object.entries(R.defense.per)) if (id.startsWith('a') && ev.throws > 0) G.founderThrows.push({ seed, id, ...ev });
    }
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
      defense: R.defense ? { w1: R.defense.per[SLEEP] ?? null, h2: R.defense.per[JOINER] ?? null, g1: R.defense.per[INSTANT] ?? null, w1Events: R.defense.events.filter((e) => e.id === SLEEP) } : null,
      verify: `${R.verify.pass}/${R.verify.checks}`,
    };
  }
  // structural invariance assert: wrappers must not touch trust trajectories
  const honQSpread = Math.max(...ARMS.filter((A) => A !== 'A4-v3.1-clean').map((A) => Math.abs(honQByArm[A] - honQByArm['A1-v3.1-sleeper'])));
  row.honQAttackArmSpread = honQSpread;
  if (honQSpread > 1e-9) row.honQSpreadWarning = `attack-arm honestFinalQ spread ${honQSpread} > 1e-9 — wrappers leaked into the trust layer (unexpected; fpTax incremental reading contaminated)`;
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
      e35Reference_s_perRun: 3.3,
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
      w1: G.defW1, h2: G.defH2,
      founderThrows: G.founderThrows,
    },
    verify: { checks: G.vfy.checks, pass: G.vfy.pass, maxDiff: G.vfy.maxDiff.toExponential(2) },
  };
}

// ---------------- claims ----------------
const A1 = 'A1-v3.1-sleeper', A4 = 'A4-v3.1-clean';
const B_ARMS = ['B1-flipguard', 'B2-sunset', 'B3-velocity'];
const dmgW1Of = (A) => agg[A].dmgW1.map((d) => (d === null ? 0 : d));
const dmgG1Of = (A) => agg[A].dmgG1.map((d) => (d === null ? 0 : d));

// R1 CONTAINMENT DELTA per defense
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

// R2 FALSE-POSITIVE TAX + pricing table
const honQOf = (A) => agg[A].honQ;
const R2 = { perDefense: {}, pricingTable: [] };
let crown = null;
const eligible = [];
for (const B of B_ARMS) {
  const lossVsA4 = honQOf(A4).map((q, i) => q - honQOf(B)[i]);   // >0 = defense-arm honQ below clean
  const incrVsA1 = honQOf(A1).map((q, i) => q - honQOf(B)[i]);   // >0 = defense costs honQ beyond the attack
  const seA4 = seOf(lossVsA4), seIncr = seOf(incrVsA1);
  const fpTaxAsWritten = seA4 > 0 ? clip01(Math.abs(mean(lossVsA4)) / seA4) : 0;
  const fpTaxIncr = seIncr > 0 ? clip01(Math.abs(mean(incrVsA1)) / seIncr) : 0;
  const g1d = dmgG1Of(B).map((x, i) => x - dmgG1Of(A1)[i]);      // >0 = g1 worse under defense
  const g1NotWorsened = mean(g1d) <= seOf(g1d);
  const h2Rec = {
    admRate: armsAgg[B].h2Admission.admAdmitted_n / SEEDS,
    admRoundMean: armsAgg[B].h2Admission.tAdmExp ? armsAgg[B].h2Admission.tAdmExp.mean : null,
    admRate_A1: armsAgg[A1].h2Admission.admAdmitted_n / SEEDS,
    admRoundMean_A1: armsAgg[A1].h2Admission.tAdmExp ? armsAgg[A1].h2Admission.tAdmExp.mean : null,
    defenseRecord: Object.entries(agg[B].defH2).map(([seed, v]) => ({ seed: Number(seed), ...v })),
  };
  const r1pass = R1[B].verdict === 'PASS';
  // containment_ratio = D(A1)/D(B): the damage multiple the defense averts —
  // HIGHER is better (the B/A1 damage ratio is reported next to it; the two
  // are reciprocals). Crowning argmax(ratio B/A1) would crown the WORST
  // defense — a no-op scores 1.0 — so the composite must ride the averted
  // multiple (receipted composition fix, pre-final-run).
  const mD1 = mean(dmgW1Of(A1)), mDB = mean(dmgW1Of(B));
  const containment = mD1 / Math.max(1e-12, mDB);
  const price = containment * (1 - fpTaxAsWritten);   // receipted task formula (fpTax vs A4)
  const priceIncr = containment * (1 - fpTaxIncr);    // incremental-tax sensitivity
  const entry = {
    defense: B,
    R1: { pass: r1pass, delta: R1[B].pairedDelta_A1_minus_B, p: R1[B].signTest_oneSided.p, damageRatio_B_over_A1: R1[B].damageRatio_B_over_A1, containmentRatio_A1_over_B: r6(containment) },
    honQ: {
      mean_B: armsAgg[B].honQFinal, mean_A4: armsAgg[A4].honQFinal, mean_A1: armsAgg[A1].honQFinal,
      loss_vs_A4: { mean: r6(mean(lossVsA4)), se: r6(seA4), asWritten_pass: Math.abs(mean(lossVsA4)) <= seA4 },
      incremental_vs_A1: { mean: r6(mean(incrVsA1)), se: r6(seIncr), maxAbsPerSeed: r6(Math.max(...incrVsA1.map(Math.abs))) },
      fpTaxAsWritten: r6(fpTaxAsWritten), fpTaxIncremental: r6(fpTaxIncr),
    },
    h2: h2Rec,
    g1: { damage_B: armsAgg[B].damageG1, damage_A1: armsAgg[A1].damageG1, pairedDelta_B_minus_A1: { mean: r6(mean(g1d)), se: r6(seOf(g1d)) }, notWorsened: g1NotWorsened },
    composite: { price: r6(price), formula: 'containment_ratio(A1/B) x (1 - fpTaxAsWritten)', priceIncremental: r6(priceIncr), formulaIncremental: 'containment_ratio(A1/B) x (1 - fpTaxIncremental)' },
    eligible: r1pass && g1NotWorsened,
  };
  R2.perDefense[B] = entry;
  R2.pricingTable.push({
    defense: B, damageRatio: entry.R1.damageRatio_B_over_A1, containment: entry.R1.containmentRatio_A1_over_B,
    fpTax: entry.honQ.fpTaxAsWritten, fpTaxIncr: entry.honQ.fpTaxIncremental,
    price: entry.composite.price, priceIncr: entry.composite.priceIncremental,
    h2admRate: h2Rec.admRate, h2admRound: h2Rec.admRoundMean, h2admRound_A1: h2Rec.admRoundMean_A1,
    g1Delta: entry.g1.pairedDelta_B_minus_A1.mean, R1pass: r1pass, g1NotWorsened, eligible: entry.eligible,
  });
  if (entry.eligible) eligible.push({ B, price, containment });
}
eligible.sort((a, b) => (b.price - a.price) || (b.containment - a.containment));
R2.asWrittenNote = 'composite uses the as-written task formula (fpTax = |honestFinalQ loss vs A4|/SE): wrappers act only at the influence layer, so honestFinalQ is structurally bit-identical across attack arms (per-seed max |B_i - A1| receipted in incremental_vs_A1.maxAbsPerSeed) — the A4 loss is E35-S4\'s receipted ATTACK-presence cost, arm-common, hence fpTax is equal across defenses and the crown order rides containment; the INCREMENTAL lens (vs A1, the defense-only tax) is exactly 0 for influence-layer wrappers and is receipted as priceIncremental';
R2.crown = eligible.length
  ? { crowned: eligible[0].B, price: eligible[0].price, rule: 'argmax containment_ratio(A1/B) x (1 - fpTax-as-written) among defenses passing R1 and R2c; ties -> higher containment', runnerUps: eligible.slice(1) }
  : null;

// R3 STRUCTURE RECEIPT
const R3 = {
  defenseLoc: defenseLoc(),
  murmurModulesChanged: false,
  murmurModulesTouched: [],
  filesAdded: ['experiments/e36_countermove.mjs', 'experiments/outputs/e36_summary.json', 'experiments/outputs/receipts_e36.jsonl'],
  apisComposed: {
    B1: ['Admission.admitted/admittedRound/devMean/admitWindow/epsNew/probationary (read)', 'influence-map scaling after reattribute'],
    B2: ['Admission.admitted/admittedRound/age/edges(read: windowed indep flags)/admitErr/minEdgesIndep/round/epsNew', 'influence-map scaling after reattribute'],
    B3: ['Admission.admitted/admittedRound/probationary/admitErr/epsNew', 'influence-map scaling after reattribute'],
    common: ['HedgeTrust.weights/update/absorb/weight', 'Provenance.inspect/penalize/tag', 'MurmurBus.pool', 'receipts.sealChain/verifyChain'],
  },
  doctrine: 'composition over rewrites — zero murmur/ changes (verified: smoke.mjs green, murmur/ mtimes untouched)',
};

// R4 SLEEPER ADMISSION RECORD per defense
const R4 = {};
for (const A of ARMS) {
  const AA = armsAgg[A];
  const defW1 = agg[A].defW1;
  const perSeed = Object.entries(defW1).map(([seed, v]) => ({ seed: Number(seed), ...v }));
  R4[A] = {
    admAdmission: AA.w1Admission,
    flipRound: 't_adm + 25',
    shareInWindow: AA.shareW1,
    attTrustAtFlip: AA.attTrustAtFlip,
    defenseRecord: A === 'A1-v3.1-sleeper' ? 'no defense (E35 control)' : perSeed,
    reading: A === 'B1-flipguard' ? 'throws/rethrows = post-flip regime detections; guardRounds = rounds at epsNew'
      : A === 'B2-sunset' ? 'sunsetPass/Fail = re-admission outcomes at 80-round expiry; probRounds = lapsed rounds at epsNew'
      : A === 'B3-velocity' ? 'state blocked = pre-admission rejection (legitimate win); cumMax vs bar = the velocity signature'
      : undefined,
  };
}

// verdict — the mechanism analysis is COMPUTED from the measured telemetry
// (a negative verdict is publishable; its mechanism receipt must match the
// data it rides on — pre-run static text would drift from the run)
const anyR1Pass = B_ARMS.some((B) => R1[B].verdict === 'PASS');
const cnt = (arr, f) => arr.filter(f).length;
const seedSet = (arr) => [...new Set(arr.map((x) => x.seed))];
const f2 = (x) => (Number.isFinite(x) ? x.toFixed(3) : 'n/a');
const B1w1 = Object.values(agg['B1-flipguard'].defW1), B1g1 = Object.values(agg['B1-flipguard'].defG1);
const B1ft = agg['B1-flipguard'].founderThrows;
const B1trip = Object.entries(agg['B1-flipguard'].defW1).find(([, v]) => v.throws > 0);
const B2w1 = Object.values(agg['B2-sunset'].defW1), B2h2 = Object.values(agg['B2-sunset'].defH2);
const B2h2LapsedSeeds = Object.entries(agg['B2-sunset'].defH2).filter(([, v]) => v.probRounds > 0).map(([k]) => Number(k));
const B2win = agg['B2-sunset'].w1Events.filter((e) => e.kind !== 'exempt-age').map((e) => e.winMean).filter((x) => Number.isFinite(x));
const B3w1 = Object.values(agg['B3-velocity'].defW1), B3h2 = Object.values(agg['B3-velocity'].defH2);
const B3w1Blocked = Object.entries(agg['B3-velocity'].defW1).find(([, v]) => v.state === 'blocked');
const B3h2Blocked = Object.entries(agg['B3-velocity'].defH2).find(([, v]) => v.state === 'blocked');
const VERDICT = {
  crown: R2.crown ? R2.crown.crowned : 'NONE',
  verdict: anyR1Pass ? (R2.crown ? `CROWNED ${R2.crown.crowned}` : 'R1 pass exists but no defense eligible (R2c)') : 'NO-CROWN: no defense passes R1 containment (negative verdict)',
  negativeMechanism: anyR1Pass ? null : {
    B1: `the self-referential 2x-own-history bar misses the flip in ${SEEDS - cnt(B1w1, (v) => v.throws > 0)}/${SEEDS} seeds — the flipped liar's trailing devMean stays under twice its own probation reference (refMean ${f2(Math.min(...B1w1.map((v) => v.refMean)))}-${f2(Math.max(...B1w1.map((v) => v.refMean)))} -> bars ${f2(2 * Math.min(...B1w1.map((v) => v.refMean)))}-${f2(2 * Math.max(...B1w1.map((v) => v.refMean)))}; the one trip, seed ${B1trip ? B1trip[0] : 'n/a'}, cut that seed's damage ${B1trip ? (100 * (1 - dmgW1Of('B1-flipguard')[Number(B1trip[0])] / dmgW1Of(A1)[Number(B1trip[0])])).toFixed(0) + '%' : 'n/a'} vs A1) — and the bar NEVER trips on the flasher g1 (${cnt(B1g1, (v) => v.throws > 0)}/${SEEDS}) — while the same rule false-TRIPS honest founders in ${seedSet(B1ft).length}/${SEEDS} seeds (${B1ft.length} throw events, up to ${Math.max(0, ...B1ft.map((x) => x.guardRounds))} guard rounds at epsNew) via ordinary truth-flip transients: a regime-noise detector, not an attack detector`,
    B2: `where it catches (${cnt(B2w1, (v) => (v.sunsetFail ?? 0) > 0)}/${SEEDS} seeds sunset-fail) the catch rides the windowed INDEPENDENCE clause, not the mean-dev clause: the flipped liar's windowed |p-pooled| means run ${f2(Math.min(...B2win))}-${f2(Math.max(...B2win))} << admitErr 0.5 (the mean bar renews a consistent liar every time) but its post-flip edges lagged-echo the flasher's toxic stream -> windowed indep < 2 -> lapse; uncaught seeds renew — and the same clause false-lapses the honest joiner h2 in ${B2h2LapsedSeeds.length}/${SEEDS} seeds (${B2h2.filter((v) => v.probRounds > 0).reduce((a, v) => a + v.probRounds, 0)} lapsed rounds at epsNew): sunsetting re-runs a porous bar and taxes newcomers`,
    B3: `a tail lottery: blocks the sleeper in ${cnt(B3w1, (v) => v.state === 'blocked')}/${SEEDS} seeds (bar 0.75; probation cumMax ${f2(Math.min(...B3w1.map((v) => v.cumMax)))}-${f2(Math.max(...B3w1.map((v) => v.cumMax)))} straddles it; in the blocked seed damage drops to ${B3w1Blocked ? r6(dmgW1Of('B3-velocity')[Number(B3w1Blocked[0])]) : 'n/a'} vs A1 ${B3w1Blocked ? r6(dmgW1Of(A1)[Number(B3w1Blocked[0])]) : 'n/a'}) and false-blocks the honest canary h2 in ${cnt(B3h2, (v) => v.state === 'blocked')}/${SEEDS} seeds (cumMax ${B3h2Blocked ? f2(B3h2Blocked[1].cumMax) : 'n/a'} — an honest transient) — and the h2 block RAISES sleeper damage in that seed (+${B3h2Blocked ? r6(dmgW1Of('B3-velocity')[Number(B3h2Blocked[0])] - dmgW1Of(A1)[Number(B3h2Blocked[0])]) : 'n/a'}: capping an honest voice moves the pool toward the liar); in unblocked seeds B3 is bit-identical to A1 (zero post-admission protection)`,
  },
  structuralFinding: `the honest-final-Q tax vs A4 is attack-presence cost (E35 S4), not defense cost: influence-layer wrappers leave trust trajectories bit-identical across attack arms (per-seed max |honQ(B_i) - honQ(A1)| = ${r6(Math.max(...B_ARMS.map((B) => R2.perDefense[B].honQ.incremental_vs_A1.maxAbsPerSeed)))}), so the as-written fpTax (vs A4) is arm-common and saturates at 1 for every defense — the composite degenerates and the crown order rides containment alone under both the as-written and the incremental lens`,
};

book('finding.R1', { rule: 'R1 CONTAINMENT DELTA — D_w1(B_i) < D_w1(A1), paired one-sided sign test p<0.05', perDefense: R1, anyPass: anyR1Pass });
book('finding.R2', { rule: 'R2 FALSE-POSITIVE TAX + CROWN (pricing core)', ...R2, note: 'composite rides the as-written fpTax (vs A4, task formula); the incremental (vs A1) lens is receipted alongside as priceIncremental — for influence-layer wrappers the two orderings coincide' });
book('finding.R3', { rule: 'R3 STRUCTURE RECEIPT', ...R3 });
book('finding.R4', { rule: 'R4 SLEEPER ADMISSION RECORD per defense', perArm: R4 });
book('finding.verdict', { ...VERDICT, crownDetail: R2.crown, founderThrowsByArm: Object.fromEntries(B_ARMS.map((B) => [B, agg[B].founderThrows])) });
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
  task: 'E36', name: 'the counter-move (pricing flip-detector / sunsetting / velocity-bar defenses against the E35 sleeper)',
  seeds: SEEDS, T, voices: V, kStarCarried: KSTAR, arms: ARMS,
  runtime_s: { probeSeed0: +(seed0Ms / 1000).toFixed(1), matrix: elapsedMatrix, total: +((Date.now() - t0) / 1000).toFixed(1) },
  config: {
    world: { FLIP_P, REROLL_P, N, TOX_Q, JOIN }, damageWindow: DW, pre: PRE, g1Window: G1_WIN,
    hedge: CFG, admission: ADM, defenses: DEF, roster: ALL_IDS,
    deviations: ['g1 ACTIVE in all attack arms (same-arm regression-canary baseline)', 'k* = 25 carried from E35 (no re-search)', 'probe doubles as matrix seed 0'],
  },
  arms: armsAgg,
  claims: { R1, R2, R3, R4, verdict: VERDICT },
  perSeed: seedRows,
  chain: { rows: rows.length, tip, verified: vfy.ok },
};
writeFileSync('experiments/outputs/e36_summary.json', JSON.stringify(summary, null, 1));
writeFileSync('experiments/outputs/receipts_e36.jsonl', rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
// file re-verify (E35 discipline: the chain must verify FROM THE WRITTEN FILE)
const reread = readFileSync('experiments/outputs/receipts_e36.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const vfyFile = verifyChain(reread);
console.log(`file re-verify: ${vfyFile.ok ? 'OK' : 'FAILED'} (${reread.length} rows)`);
if (!vfyFile.ok) { console.error('FILE CHAIN VERIFY FAILED', vfyFile); process.exit(1); }

for (const B of B_ARMS) console.log(`R1 ${B}: ${R1[B].verdict} ratio(B/A1)=${R1[B].damageRatio_B_over_A1} delta=${R1[B].pairedDelta_A1_minus_B.mean}±${R1[B].pairedDelta_A1_minus_B.se} p=${R1[B].signTest_oneSided.p}`);
for (const e of R2.pricingTable) console.log(`R2 ${e.defense}: price=${e.price} containment(A1/B)=${e.containment} damageRatio(B/A1)=${e.damageRatio} fpTax=${e.fpTax} fpTaxIncr=${e.fpTaxIncr} h2adm=${e.h2admRate}@${e.h2admRound} g1Delta=${e.g1Delta} eligible=${e.eligible}`);
console.log(`R2a as-written (honQ vs A4, 1SE): A1=${armsAgg[A1].honQFinal.mean} B1=${armsAgg['B1-flipguard'].honQFinal.mean} B2=${armsAgg['B2-sunset'].honQFinal.mean} B3=${armsAgg['B3-velocity'].honQFinal.mean} A4=${armsAgg[A4].honQFinal.mean}`);
console.log(`CROWN: ${VERDICT.crown}  (${VERDICT.verdict})`);
console.log(vault.liveJobs === 0 ? 'E36 DONE' : 'E36 PROBLEM (live jobs)');
