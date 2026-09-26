// E35 — THE SLEEPER CELL (probation-evasion attack + strategy transfer test)
// ==========================================================================
// Prior receipts collide here. E21 closed clean copying (fresh sybils riding
// the honest expert a1) and priced the honest newcomer (h1 admitted on
// schedule, sybils never — independence bar). E24 made copying costly (the
// copiers pointed at a TOXIC FOUNDER; admission caps carry the column). E33
// held the combined flood+founder attack but RECEIPTED THE ESCAPE HATCH:
// sybils "escape once admitted" — admission judges a newcomer by mean
// |p - pooled| DURING its 40-round probation (admitErr=0.5). A PATIENT
// adversary can behave honestly through probation and flip toxic AFTER
// admission. Nobody has tested that. This is also the fleet's GAN lane: a
// strategy-SEARCHING adversary (generator) vs the static defense
// (discriminator), with an honest train(probe)/held-out split on strategies.
//
// THE QUESTION (carried seed): does waiting through probation beat flashing?
// A sleeper that votes honestly until admission_round + k, then runs the E24
// toxic formula, buys (a) full post-admission influence (no epsNew cap) and
// (b) an honest-length trust track record — at the price of (c) a shorter
// damage window and (d) trust/fractional exposure after the flip. Is the
// admission layer's probation a REAL checkpoint or a purity ritual the
// attacker walks through?
//
// SETUP (E24/E33 wiring verbatim where possible): 12 honest founders (mixed
// acuity, a1 = 0.9 reference expert, same generator as e33) + 1 sleeper sybil
// w1 (empty history, joins t=150, honest phase = e24's h1 generator verbatim
// — expert-range acuity, iid errors — so |p - pooled| stays within admitErr,
// then the E24 toxic formula from t_flip = admission_round + k) + 1 honest
// late-joiner h2 (joins t=150, honest forever — E21/E24 honest-newmember
// control, present in ALL arms so the honest admission false-negative rate is
// measurable) + 1 instant toxic newcomer g1 (joins t=150 toxic — the E24
// yardstick). T=400 rounds, paired arms, IDENTICAL worlds (same truth stream,
// same honest votes, same toxic value series; arms differ ONLY in protocol
// layer / attack presence):
//   A1 v3.1-sleeper     — full v3.1 protocol + sleeper attack, flip at
//                         t_adm + k*   (the candidate defense under attack)
//   A2 v3-sleeper       — v3 semantics only (hard tags + spin-up window, NO
//                         admission, NO fractional) + the SAME sleeper attack
//                         (baseline: attack at full force, trust+tags defend)
//   A3 v3.1-instant     — full v3.1 + instant toxic newcomer g1 from t=150
//                         (E24 yardstick: does patience pay the attacker?)
//   A4 v3.1-clean       — full v3.1, no attack (collateral control)
//   A5 v3.1-sleeper-k2  — full v3.1 + sleeper with the runner-up delay k2
//                         (strategy sensitivity; extra arm, receipted)
//
// STRATEGY SEARCH (GAN lane, receipted): candidate strategies k in
// {0, 10, 25, 50, 100} rounds post-admission flip delay. On ONE probe seed
// (stream key 'probe' — disjoint from the matrix seeds 0..7 = held out): run
// all 5 strategies under A1 wiring, pick the damage-maximizing k* (ties ->
// smaller k); k2 = runner-up (ties -> smaller k). Then the full 8-seed paired
// matrix with k* fixed across A1/A2, k2 in A5; per-seed damage for k* and k2
// reported.
//
// DAMAGE METHOD (E24/E33 verbatim): D(A) = mean over the post-flip window
// [t_flip, min(t_flip + 150, 400)) of |err(pool) - err(pool with ALL of that
// arm's attackers zeroed)|, err = |pool - s|, counterfactual pools are
// reference-side only (MurmurBus.pool, same log-odds as the sheet), never
// written to the sheet. E24/e33 sign convention: positive D = attacker hurts.
// A1/A2/A5 attacker = {w1} (t_flip = t_adm + k); A3 attacker = {g1}
// (t_flip = 150); A4 has no attacker (D null).
//
// DECISION RULES (receipted BEFORE the final full run):
//   S1 CONTAINMENT — D(A1) < D(A2): paired one-sided sign test (zeros
//      excluded) p < 0.05 AND paired mean delta > 0; report paired delta +/- SE
//      and ratio D(A1)/D(A2).
//   S2 PATIENCE PRICING — compare D(A1) vs D(A3). If D(A1) > D(A3): verdict
//      HOLE — patience beats toxicity, admission has a probation-evasion
//      opening. If D(A1) <= D(A3): verdict HELD — waiting costs the attacker
//      more than flashing (trust decay / fractional attribution catch the
//      flip). Either verdict is publishable; report honestly.
//   S3 TRANSFER — transfer ratio = mean held-out damage of k* / probe damage
//      of k*. >= 0.8 => strategy generalizes (adaptive threat is REAL);
//      < 0.5 => attack overfits the probe, defense is overfit-resistant;
//      else INDETERMINATE. Report per-seed spread.
//   S4 NO COLLATERAL — |mean honestFinalQ(A1) - mean honestFinalQ(A4)| <= 1 SE
//      of the seed-paired difference. honestFinalQ := mean HedgeTrust weight
//      of the 12 honest incumbents at t=T-1 (post final update+absorb).
//   S5 ADMISSION RECORD — the sleeper's admission record receipted (admitted?
//      which round? probation error trace summary). If the sleeper is NOT
//      admitted under honest behavior that itself is a finding (admission too
//      strict for honest-looking newcomers = false-positive risk). Verdict:
//      OPEN if the sleeper is admitted in every seed (evasion surface
//      exists), TOO-STRICT if never admitted, MIXED otherwise; the honest
//      late-joiner h2's admission rate across v3.1 arm-seeds is the honest
//      false-negative rate, receipted alongside (and g1's record in A3 is the
//      instant-toxic admission check — any admission there is hole evidence).
//
// RUNTIME DISCIPLINE (receipted before the full run): probe = 1-seed timed
// run; projected = t_probe * (8 seeds * 4 arms + 5 strategy runs) + 2s IO
// (t_probe = per-run time measured on the probe phase); if projected > 170s
// per full matrix, cut seeds 8 -> 6 and RECEIPT the cut. E33 reference:
// ~6.75s per 400-round run at 16-17 voices. Dev mini-run (2 seeds) validates
// the pipeline (chain seal + file re-verify + sheet-verify) BEFORE the final
// run. After the final run: NO script edits (stale-artifact doctrine: script
// mtime < output mtimes).
//
// RNG DOCTRINE (binding): all randomness through MothVault (offline:true),
// one harvest, per-purpose stream keys 'e35:<purpose>:<seed>[:<voice>]' via
// streamFor; NO Math.random anywhere. Paired worlds REQUIRE arm-identical
// world streams — arms never consume different draws (pairing would break);
// arm-conditional behavior is selection over shared values, not new draws.
//
// Sheet: v.{id} posterior cells + w.{id} influence cells + pool.hedge +
// amp.w1 / amp.g1 / amp.h2 meters (15 voice slots; formulas IDENTICAL for
// every arm — absent senders' cells sit at p=0.5, w=0). Pool verified vs the
// reference mirror (MurmurBus.pool) every 20 rounds, tol 1e-9, assert 0
// mismatches.
//
// Run: node experiments/e35_sleeper.mjs [seeds]   (E35_DEV=1 for a 2-seed dev run)

import { QuiltEngine } from '../engine/dist/index.js';
import { HedgeTrust } from '../murmur/trust.mjs';
import { MurmurBus } from '../murmur/bus.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { Provenance } from '../murmur/provenance.mjs';
import { Admission } from '../murmur/admission.mjs';
import { sealChain, verifyChain } from '../murmur/receipts.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

// ---------------- config ----------------
const T = 400, N = 12;
let SEEDS = Number(process.argv[2] || (process.env.E35_DEV ? 2 : 8));
const FLIP_P = 0.02, REROLL_P = 0.01;
const JOIN = 150;                              // newcomers join here
const TOX_Q = 0.25;                            // E24 toxic formula: confidently wrong ~75%
const PRE = { from: 120, to: 150 };            // pre-attack baseline
const DW = 150;                                // damage window length (receipted)
const KS = [0, 10, 25, 50, 100];               // candidate flip delays (strategy search)
const PROBE_SEED = 'probe';                    // train seed; matrix seeds are held out
const SLEEP = 'w1', INSTANT = 'g1', JOINER = 'h2';
const HONEST = Array.from({ length: N }, (_, i) => `a${i + 1}`);
const ALL_IDS = [...HONEST, SLEEP, INSTANT, JOINER];
const V = ALL_IDS.length; // 15 voice slots
const ARMS = ['v3.1-sleeper', 'v3-sleeper', 'v3.1-instant', 'v3.1-clean', 'v3.1-sleeper-k2'];
const CFG = { eta: 0.25, share: 0.02 };
const ADM = {
  beta: 0.12, alpha: 0.25, novSpread: 0.15,
  coldStart: true, admitWindow: 40, epsNew: 0.15,
  minEdgesIndep: 2, admitErr: 0.5, capShare: 0.10,
};
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

// ---------------- world ----------------
// Ingredients only: the flip timing is applied per arm as a selection over
// these shared series (paired-worlds doctrine — no arm-keyed draws).
function genWorld(seed, harvest, vault) {
  const wR = makeRng(harvest, vault, `e35:world:${seed}`);
  const qR = makeRng(harvest, vault, `e35:skill:${seed}`);
  const xR = makeRng(harvest, vault, `e35:tox:${seed}`);
  const shR = makeRng(harvest, vault, `e35:sleep:${seed}`);
  const nhR = makeRng(harvest, vault, `e35:h2:${seed}`);
  const s = new Array(T);
  s[0] = wR() < 0.5 ? 0 : 1;
  for (let t = 1; t < T; t++) s[t] = wR() < FLIP_P ? 1 - s[t - 1] : s[t - 1];
  // mixed acuity honest founders; a1 is the high-acuity reference voice
  const q = Array.from({ length: T }, () => new Array(N));
  q[0][0] = 0.9;
  for (let i = 1; i < N; i++) q[0][i] = Math.round((0.5 + 0.45 * qR()) * 1000) / 1000;
  for (let t = 1; t < T; t++) {
    for (let i = 0; i < N; i++) {
      q[t][i] = qR() < REROLL_P ? Math.round((0.5 + 0.45 * qR()) * 1000) / 1000 : q[t - 1][i];
    }
  }
  const vR = [];
  for (let i = 0; i < N; i++) vR.push(makeRng(harvest, vault, `e35:vote:${seed}:${i}`));
  const votes = Array.from({ length: T }, () => new Array(N));
  for (let t = 0; t < T; t++) {
    for (let i = 0; i < N; i++) {
      const signal = vR[i]() < q[t][i] ? s[t] : 1 - s[t];
      votes[t][i] = clampP(signal === 1 ? 0.5 + (q[t][i] - 0.5) : 0.5 - (q[t][i] - 0.5));
    }
  }
  // the TOXIC series — E24 formula VERBATIM: stable acuity TOX_Q, never
  // rerolled — a consistent liar whose values point the wrong way ~75% of the
  // time (confidence |TOX_Q-0.5| = 0.25 from neutral). Shared by the sleeper
  // post-flip AND the instant toxic newcomer (same toxic values across arms).
  const toxV = new Array(T);
  for (let t = 0; t < T; t++) {
    const signal = xR() < TOX_Q ? s[t] : 1 - s[t];
    toxV[t] = clampP(signal === 1 ? 0.5 + (TOX_Q - 0.5) : 0.5 - (TOX_Q - 0.5));
  }
  // the SLEEPER's honest phase — e24's h1 generator VERBATIM (expert-range
  // acuity drawn once, iid per-round errors, REROLL_P acuity drift): an
  // honest-looking newcomer whose |p - pooled| matches honest voices, with
  // its OWN edges (no copying — the evasion requires passing the independence
  // bar honestly).
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
  // in-sheet meters: sleeper share; instant toxic share; honest joiner share
  cells.push({ id: 'amp.w1', kind: 'formula', expr: `w.${SLEEP} / (${hD.join(' + ')})` });
  cells.push({ id: 'amp.g1', kind: 'formula', expr: `w.${INSTANT} / (${hD.join(' + ')})` });
  cells.push({ id: 'amp.h2', kind: 'formula', expr: `w.${JOINER} / (${hD.join(' + ')})` });
  return { id: `sleeper-${V}`, title: `E35 sleeper cell (${V} voice slots)`, cells };
}

// ---------------- arm specs ----------------
// attacker: { id, val(t), flip } — flip = experiment round the toxic phase
// starts (null = never flips / not present). A2 is protocol 'v3'.
function armSpecs({ kStar, k2, tAdm }) {
  const flipStar = tAdm == null ? null : tAdm + kStar;
  const flip2 = tAdm == null ? null : tAdm + k2;
  return {
    'v3.1-sleeper': { name: 'v3.1-sleeper', protocol: 'v3.1', attacker: { id: SLEEP, flip: flipStar } },
    'v3-sleeper': { name: 'v3-sleeper', protocol: 'v3', attacker: { id: SLEEP, flip: flipStar } },
    'v3.1-instant': { name: 'v3.1-instant', protocol: 'v3.1', attacker: { id: INSTANT, flip: JOIN } },
    'v3.1-clean': { name: 'v3.1-clean', protocol: 'v3.1', attacker: null },
    'v3.1-sleeper-k2': { name: 'v3.1-sleeper-k2', protocol: 'v3.1', attacker: { id: SLEEP, flip: flip2 } },
  };
}

// ---------------- one seed, paired arms (or one strategy probe arm) --------
// spec: { name, protocol, attacker } — attacker.flip = toxic start round.
async function runArm(seed, world, spec, eng) {
  const { s, votes, toxV, sleepH, h2V } = world;
  const A = spec.name;
  const att = spec.attacker;
  const trust = new HedgeTrust(ALL_IDS, CFG);
  const prov = new Provenance({});
  const adm = spec.protocol === 'v3.1' ? new Admission(ADM) : null;

  // per-round value of a voice (absent -> 0.5; attacker flips at att.flip)
  const pOf = (id, t) => {
    if (HONEST.includes(id)) return votes[t][Number(id.slice(1)) - 1];
    if (id === SLEEP) {
      if (!att || att.id !== SLEEP) return 0.5;
      if (t < JOIN) return 0.5;
      if (att.flip != null && t >= att.flip) return toxV[t];
      return sleepH[t] ?? 0.5;
    }
    if (id === INSTANT) {
      if (!att || att.id !== INSTANT) return 0.5;
      return t >= JOIN ? toxV[t] : 0.5;
    }
    if (id === JOINER) return t >= JOIN ? (h2V[t] ?? 0.5) : 0.5;
    return 0.5;
  };
  const onBus = (id, t) => HONEST.includes(id)
    || (id === JOINER && t >= JOIN)
    || (att && att.id === id && t >= JOIN);

  const st = {
    sumErr: 0, err: [], dmg: [], winFrom: null, winTo: null, attShare: [], attShareWin: [],
    attEcho: [], attTagEnd: null, attTrustAtFlip: null, attTrustFinal: null, convRound: null,
    honW: {}, wAtt: {},
    w1: { admitExpT: null, admRound: null, devMean: null, indep: null, probTrace: [] },
    h2: { admitExpT: null, admRound: null, devMean: null, indep: null },
    g1: { admitExpT: null, admRound: null, devMean: null, indep: null },
    verify: { checks: 0, pass: 0, maxDiff: 0 },
  };

  for (let t = 0; t < T; t++) {
    const murmurs = [];
    for (let i = 0; i < N; i++) murmurs.push({ from: `a${i + 1}`, origin: null, p: votes[t][i] });
    if (t >= JOIN) {
      if (att && att.id === SLEEP) murmurs.push({ from: SLEEP, origin: null, p: pOf(SLEEP, t) });
      if (att && att.id === INSTANT) murmurs.push({ from: INSTANT, origin: null, p: pOf(INSTANT, t) });
      murmurs.push({ from: JOINER, origin: null, p: pOf(JOINER, t) });
    }
    prov.inspect(murmurs);
    if (adm) adm.observe(murmurs);

    // ---- rewards (supervised pool; absent senders get HedgeTrust default 0.5)
    const rew = new Map();
    for (let i = 0; i < N; i++) rew.set(`a${i + 1}`, 1 - Math.abs(votes[t][i] - s[t]));
    for (const m of murmurs) if (!HONEST.includes(m.from)) rew.set(m.from, 1 - Math.abs(m.p - s[t]));

    const raw = prov.penalize(trust.weights()); // v3 state penalty (all arms)
    const infl = adm ? adm.reattribute(raw, murmurs, prov) : prov.influence(raw, murmurs);

    // ---- the sheet does the pooled inference (identical formulas) ----
    for (const id of ALL_IDS) await eng.set(`v.${id}`, pOf(id, t));
    for (const id of ALL_IDS) await eng.set(`w.${id}`, infl.get(id) ?? 0);
    const pool = (await eng.get('pool.hedge')).data;
    if (adm) adm.notePooled(pool);

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

    // admission records (v3.1 arms): capture the FIRST round each newcomer
    // is admitted + the probation deviation trace for the attacker
    if (adm) {
      const cap = (id, rec) => {
        if (rec.admitExpT === null && onBus(id, t) && adm.admitted(id)) {
          rec.admitExpT = t;
          rec.admRound = adm.admittedRound(id);
          rec.devMean = adm.devMean(id);
          rec.indep = adm.indepCount(id);
        }
      };
      cap(SLEEP, st.w1);
      cap(INSTANT, st.g1);
      cap(JOINER, st.h2);
      if (att && att.id === SLEEP && t >= JOIN && t < (att.flip ?? T) && adm.probationary(SLEEP)) {
        st.w1.probTrace.push(Math.abs(pOf(SLEEP, t) - pool));
      }
    }

    // damage window: [flip, min(flip + DW, T)) — counterfactual reference-side
    if (att && att.flip != null && t >= att.flip && t < Math.min(att.flip + DW, T)) {
      if (st.winFrom === null) st.winFrom = t;
      st.winTo = t + 1;
      const ps = ALL_IDS.map((id) => pOf(id, t));
      const wFull = ALL_IDS.map((id) => infl.get(id) ?? 0);
      const wCf = wFull.map((w, i) => (ALL_IDS[i] === att.id ? 0 : w));
      const poolCf = MurmurBus.pool(ps, wCf);
      st.dmg.push(err - Math.abs(poolCf - s[t])); // positive = attacker hurts (E24 sign)
      st.attShareWin.push((infl.get(att.id) ?? 0) / ([...infl.values()].reduce((a, b) => a + b, 0) || 1));
      if (adm) st.attEcho.push(adm.echoScore(att.id));
    }
    if (att) st.attShare.push((infl.get(att.id) ?? 0) / ([...infl.values()].reduce((a, b) => a + b, 0) || 1));

    // attacker trust trajectory + conviction round (by TRUST vs honest median)
    if (att) {
      const ws = trust.weights();
      const honMed = median(HONEST.map((id) => ws.get(id) ?? 0));
      if (t === att.flip) st.attTrustAtFlip = r6(ws.get(att.id) ?? 0);
      if (st.convRound === null && honMed > 0 && (ws.get(att.id) ?? 0) < 0.25 * honMed) st.convRound = t;
      if ([0, 100, 149, 189, 239, 289, 339, 399].includes(t)) st.wAtt[t] = r6(ws.get(att.id) ?? 0);
      if ([0, 100, 149, 189, 239, 289, 339, 399].includes(t)) st.honW[t] = r6(mean(HONEST.map((id) => ws.get(id) ?? 0)));
    }

    // ---- learn ----
    trust.update(rew);
    trust.absorb(prov.penalize(trust.weights()));
  }
  st.attTagEnd = att ? prov.tag(att.id) : null;
  st.attTrustFinal = att ? r6(trust.weight(att.id)) : null;

  const errPre = st.err.slice(PRE.from, PRE.to);
  return {
    name: A,
    poolAcc: st.sumErr / T,
    errPre: mean(errPre),
    damage: st.dmg.length ? mean(st.dmg) : null,
    window: st.dmg.length ? { from: st.winFrom, to: st.winTo, len: st.winTo - st.winFrom } : null,
    errWin: st.dmg.length ? mean(st.err.slice(st.winFrom, st.winTo)) : null,
    attShareWin: st.attShareWin.length ? mean(st.attShareWin) : null,
    attShareMax: st.attShare.length ? Math.max(...st.attShare) : null,
    attEchoWin: st.attEcho.length ? mean(st.attEcho) : null,
    attTagEnd: st.attTagEnd,
    attTrustAtFlip: st.attTrustAtFlip,
    attTrustFinal: st.attTrustFinal,
    convRound: st.convRound,
    honQFinal: mean(HONEST.map((id) => trust.weight(id))),
    wAtt: st.wAtt, honW: st.honW,
    w1: { ...st.w1, probTrace: undefined, probTraceN: st.w1.probTrace.length, probTraceMean: st.w1.probTrace.length ? mean(st.w1.probTrace) : null, probTraceMax: st.w1.probTrace.length ? Math.max(...st.w1.probTrace) : null },
    h2: st.h2,
    g1: st.g1,
    verify: st.verify,
    err: st.err,
    attShare: st.attShare,
  };
}

// ---------------- probe (strategy search on the train seed) ----------------
console.log(`── E35 sleeper cell · probe + ${SEEDS} seeds × ${T} rounds × ${ARMS.length} arms × ${V} voice slots ──`);
const vault = new MothVault({ label: 'e35', offline: true });
const harvest = await vault.harvest(256);
console.log(`vault: ${harvest.mock ? 'MOCK (offline doctrine)' : 'LIVE ' + harvest.jobId} digest=${harvest.poolDigest.slice(0, 10)} bits=${harvest.bits.length}`);

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });
book('run.config', {
  task: 'E35', name: 'the sleeper cell (probation-evasion attack + strategy transfer test; murmur-protocol-v3.1)',
  T, N, voices: V, seeds: SEEDS, probeSeed: PROBE_SEED, strategies: KS,
  world: { stateFlipP: FLIP_P, skillRerollP: REROLL_P, qRange: [0.5, 0.95], a1Acuity: 0.9, toxicFormula: { id: 'E24 verbatim', acuity: TOX_Q, note: 'confidently wrong ~75% of rounds; shared toxic series toxV for w1 post-flip AND g1 (same toxic values across arms)' } },
  attack: {
    joinRound: JOIN, sleeper: { id: SLEEP, honestPhase: 'e24 h1 generator verbatim (expert acuity 0.7-0.95, iid errors, own edges — passes probation honestly)', flip: 't_adm + k, k in {0,10,25,50,100}; t_adm measured on a pass-1 honest-forever A1-wiring run per seed (probation data through t_adm-1 is flip-independent, so the admission record is identical)' },
    instant: { id: INSTANT, note: 'joins t=150 already toxic (E24 yardstick for S2)' },
    honestJoiner: { id: JOINER, note: 'joins t=150, honest forever, present in ALL arms (E21/E24 honest-newmember control; S5 honest false-negative rate)' },
  },
  arms: ARMS, hedge: CFG, admission: ADM,
  founders: 'D1 genesis acclamation (newcomers w1/g1/h2 join t=150: probationary from firstSeen)',
  absentSenderReward: 'missing ids get HedgeTrust default 0.5 (unproven prior) while absent; roster = 15 slots in every arm (e33 convention)',
  reward: 'r_i = 1 - |p_i - s_t| (supervised pool)',
  rng: 'MothVault offline:true, one harvest, per-purpose keys e35:<purpose>:<seed>[:<voice>] via streamFor; paired worlds REQUIRE arm-identical world streams (arms select over shared values; no arm-keyed draws); probe seed "probe" is disjoint from matrix seeds 0..7 (train/held-out split); no Math.random',
  metrics: {
    D: 'mean over [t_flip, min(t_flip+150,400)) of |pool - s_t| - |pool_cf - s_t| (E24/E33 counterfactual method, reference-side log-odds; positive = attacker hurts; never written to the sheet)',
    honestFinalQ: 'mean HedgeTrust weight of the 12 honest incumbents at t=T-1 (post final update+absorb)',
    t_adm: 'first experiment round t where Admission.admitted() is true (module round t+1; firstSeen=151 -> earliest 189)',
  },
  decisionRules: {
    S1_containment: 'D(A1) < D(A2): paired one-sided sign test (zeros excluded) p<0.05 AND paired mean delta>0; report paired delta +/- SE and ratio D(A1)/D(A2)',
    S2_patiencePricing: 'compare D(A1) vs D(A3): if D(A1) > D(A3) verdict HOLE (patience beats toxicity; probation-evasion opening); if D(A1) <= D(A3) verdict HELD (waiting costs more than flashing); either verdict publishable, reported honestly',
    S3_transfer: 'transfer ratio = mean held-out damage of k* / probe damage of k*; >=0.8 GENERALIZES (adaptive threat REAL); <0.5 PROBE-OVERFIT (defense overfit-resistant); else INDETERMINATE; per-seed spread reported',
    S4_noCollateral: '|mean honestFinalQ(A1) - mean honestFinalQ(A4)| <= 1 SE of the seed-paired difference; honestFinalQ = mean HedgeTrust weight of the 12 honest incumbents at t=T-1',
    S5_admissionRecord: 'receipt the sleeper admission record (admitted? round? probation error trace); never admitted under honest behavior = finding (admission too strict = honest-looking false-positive risk); verdict OPEN (admitted every seed) / TOO-STRICT (never) / MIXED; h2 admission rate across v3.1 arm-seeds = honest false-negative rate; g1 record in A3 = instant-toxic admission check (any admission = hole evidence)',
  },
  runtimeRules: 'probe = 1-seed timed run; projected = t_probe * (8 seeds * 4 arms + 5 strategy runs) + 2s IO with t_probe = per-run time from the probe phase; if projected > 170s per full matrix, cut seeds 8 -> 6 and RECEIPT the cut; E33 reference ~6.75s per 400-round run at 16-17 voices; dev mini-run (2 seeds) validates the pipeline BEFORE the final run; NO script edits after the final run (stale-artifact doctrine)',
  vault: { mock: harvest.mock, digest: harvest.poolDigest },
  engine: 'vendored quilt dist (QuiltEngine)', sheetVerifyTol: TOL,
});

// ---- probe phase: pass-1 (honest-forever admission probe) + 5 strategies ----
const probeT0 = Date.now();
const probeWorld = genWorld(PROBE_SEED, harvest, vault);
const probeEngP1 = new QuiltEngine(`e35-probe-p1`, {});
probeEngP1.loadSheet(buildSheet());
const probeP1 = await runArm(PROBE_SEED, probeWorld, { name: 'probe-pass1', protocol: 'v3.1', attacker: { id: SLEEP, flip: null } }, probeEngP1);
const tAdmProbe = probeP1.w1.admitExpT;
const probeEng = new QuiltEngine(`e35-probe`, {});
probeEng.loadSheet(buildSheet());
const probeRuns = {};
for (const k of KS) {
  const spec = { name: `probe-k${k}`, protocol: 'v3.1', attacker: { id: SLEEP, flip: tAdmProbe == null ? null : tAdmProbe + k } };
  probeRuns[k] = await runArm(PROBE_SEED, probeWorld, spec, probeEng);
}
const tProbeMs = Date.now() - probeT0;
const probeDmg = KS.map((k) => ({ k, D: probeRuns[k].damage, win: probeRuns[k].window }));
// damage-maximizing k*, ties -> smaller k; runner-up k2, ties -> smaller k
const ranked = [...probeDmg].sort((a, b) => (b.D - a.D) || (a.k - b.k));
const KSTAR = ranked[0].k, K2 = ranked[1].k;
book('probe.pass1', {
  seed: PROBE_SEED, tAdmExp: tAdmProbe, admRound: probeP1.w1.admRound,
  devMeanAtAdmission: probeP1.w1.devMean, indepAtAdmission: probeP1.w1.indep,
  probationTrace: { n: probeP1.w1.probTraceN, mean: probeP1.w1.probTraceMean, max: probeP1.w1.probTraceMax },
  h2: probeP1.h2, note: 'pass-1 = sleeper honest forever under A1 wiring; measures t_adm (flip-independent: admission uses probation data through t_adm-1, all honest-phase)',
});
book('probe.strategies', {
  seed: PROBE_SEED, tAdmExp: tAdmProbe,
  perK: probeDmg.map((d) => ({ k: d.k, D: d.D === null ? null : r6(d.D), window: d.win, tFlip: tAdmProbe == null ? null : tAdmProbe + d.k })),
  metric: 'D = counterfactual damage over [t_adm+k, min(t_adm+k+150,400)), A1 wiring',
});
book('probe.choice', {
  kStar: KSTAR, k2: K2, rule: 'damage-maximizing k on the probe seed, ties -> smaller k; runner-up k2',
  probeD_kStar: ranked[0].D === null ? null : r6(ranked[0].D), probeD_k2: ranked[1].D === null ? null : r6(ranked[1].D),
  split: 'probe seed "probe" = train; matrix seeds 0..7 = held out (S3 transfer)',
});

// ---- runtime discipline (receipted BEFORE the full run) ----
const tProbeRun = (tProbeMs / 1000) / (KS.length + 1); // per-run time: 5 strategies + 1 pass-1
const projectedFormula = tProbeRun * (8 * 4 + KS.length) + 2;   // receipted formula (8 seeds)
const projectedActual = tProbeRun * (SEEDS * (ARMS.length + 1) + KS.length) + 2; // pass-1 + 5 arms per seed
let cut = null;
if (projectedFormula > 170 && SEEDS === 8) { SEEDS = 6; cut = 'seeds cut 8 -> 6 by the probe rule (projected > 170s); paired claims preserved'; }
else if (projectedFormula > 170) { cut = `seeds already ${SEEDS} (< 8); projected ${projectedFormula.toFixed(0)}s still > 170s — proceeding at minimum receipted fallback`; }
book('runtime.probe', {
  tProbePhase_s: +(tProbeMs / 1000).toFixed(1), runsInProbe: KS.length + 1,
  tProbe_perRun_s: +tProbeRun.toFixed(3),
  projected_byReceiptedFormula_8seeds_s: +projectedFormula.toFixed(1),
  projected_actualPlan_s: +projectedActual.toFixed(1),
  projectionNote: 'formula uses t_probe * (8 seeds * 4 arms + 5 strategy runs) + 2s IO per the receipted rule; actualPlan additionally counts the per-seed pass-1 admission probe and the A5 sensitivity arm (transparent)',
  seedDecision: SEEDS, cut, e33Reference_s_perRun: 6.75,
});
console.log(`probe: t_adm=${tAdmProbe}, k*=${KSTAR} (D=${ranked[0].D === null ? 'n/a' : r6(ranked[0].D)}), k2=${K2} (D=${ranked[1].D === null ? 'n/a' : r6(ranked[1].D)}), t_probe/run=${tProbeRun.toFixed(2)}s, projected(formula)=${projectedFormula.toFixed(0)}s -> seeds=${SEEDS}${cut ? ' (CUT)' : ''}`);

// ---------------- full matrix ----------------
const agg = {};
for (const A of ARMS) {
  agg[A] = {
    acc: [], pre: [], dmg: [], winLen: [], errWin: [], attShareWin: [], attEcho: [],
    attTrustFlip: [], attTrustFin: [], conv: [], honQ: [], w1Adm: [], w1Dev: [], w1Indep: [],
    w1ProbMax: [], h2Adm: [], h2Dev: [], g1Adm: [], tagEnd: {}, vfy: { checks: 0, pass: 0, maxDiff: 0 },
  };
}
const seedRows = [];
const t0 = Date.now();
const seed0Curves = { t: [], err: {}, attShare: {} };

for (let seed = 0; seed < SEEDS; seed++) {
  const seedStart = Date.now();
  const world = genWorld(seed, harvest, vault);
  // pass-1: honest-forever admission probe (A1 wiring) -> t_adm for this seed
  const engP1 = new QuiltEngine(`e35-s${seed}-p1`, {});
  engP1.loadSheet(buildSheet());
  const p1 = await runArm(seed, world, { name: 'pass1', protocol: 'v3.1', attacker: { id: SLEEP, flip: null } }, engP1);
  if (p1.w1.admitExpT === null) {
    console.log(`  seed ${seed}: sleeper NOT admitted under honest behavior (t_adm=null) — attack cannot launch; receipting as neverLaunched`);
  }
  const tAdm = p1.w1.admitExpT;
  const specs = armSpecs({ kStar: KSTAR, k2: K2, tAdm });
  const eng = new QuiltEngine(`e35-s${seed}`, {});
  eng.loadSheet(buildSheet());
  const row = { seed, seed_s: +((Date.now() - seedStart) / 1000).toFixed(1), pass1: { tAdmExp: tAdm, devMean: p1.w1.devMean, indep: p1.w1.indep, h2: p1.h2 } };
  for (const A of ARMS) {
    const R = await runArm(seed, world, specs[A], eng);
    if (A === 'v3.1-sleeper' && R.w1.admitExpT !== tAdm) {
      throw new Error(`admission mismatch seed=${seed}: pass1 t_adm=${tAdm} vs matrix A1 t_adm=${R.w1.admitExpT} (paired-worlds broken)`);
    }
    const G = agg[A];
    G.acc.push(R.poolAcc); G.pre.push(R.errPre);
    G.dmg.push(R.damage);
    G.winLen.push(R.window ? R.window.len : 0);
    if (R.errWin !== null) G.errWin.push(R.errWin);
    if (R.attShareWin !== null) G.attShareWin.push(R.attShareWin);
    if (R.attEchoWin !== null) G.attEcho.push(R.attEchoWin);
    if (R.attTrustAtFlip !== null) G.attTrustFlip.push(R.attTrustAtFlip);
    if (R.attTrustFinal !== null) G.attTrustFin.push(R.attTrustFinal);
    G.conv.push(R.convRound === null ? T : R.convRound);
    G.honQ.push(R.honQFinal);
    G.tagEnd[R.attTagEnd ?? 'none'] = (G.tagEnd[R.attTagEnd ?? 'none'] ?? 0) + 1;
    if (R.w1.admitExpT !== null) { G.w1Adm.push(R.w1.admitExpT); G.w1Dev.push(R.w1.devMean); G.w1Indep.push(R.w1.indep); if (R.w1.probTraceMax !== null) G.w1ProbMax.push(R.w1.probTraceMax); }
    if (R.h2.admitExpT !== null) { G.h2Adm.push(R.h2.admitExpT); G.h2Dev.push(R.h2.devMean); }
    if (R.g1.admitExpT !== null) G.g1Adm.push(R.g1.admitExpT);
    G.vfy.checks += R.verify.checks; G.vfy.pass += R.verify.pass;
    if (R.verify.maxDiff > G.vfy.maxDiff) G.vfy.maxDiff = R.verify.maxDiff;
    row[A] = {
      dmg: R.damage === null ? null : r6(R.damage), window: R.window,
      errPre: r6(R.errPre), errWin: R.errWin === null ? null : r6(R.errWin),
      attShareWin: R.attShareWin === null ? null : r6(R.attShareWin),
      attEchoWin: R.attEchoWin === null ? null : r6(R.attEchoWin),
      attTagEnd: R.attTagEnd, attTrustAtFlip: R.attTrustAtFlip, attTrustFinal: R.attTrustFinal,
      convRound: R.convRound, honQ: r6(R.honQFinal),
      wAtt: R.wAtt, honW: R.honW,
      w1Adm: R.w1.admitExpT, w1DevMean: R.w1.devMean, w1ProbMax: R.w1.probTraceMax,
      h2Adm: R.h2.admitExpT, g1Adm: R.g1.admitExpT,
      verify: `${R.verify.pass}/${R.verify.checks}`,
    };
    if (seed === 0) {
      seed0Curves.t = R.err.map((_, i) => i).filter((i) => i % 4 === 0);
      seed0Curves.err[A] = R.err.filter((_, i) => i % 4 === 0).map((x) => r6(x));
      seed0Curves.attShare[A] = R.attShare.filter((_, i) => i % 4 === 0).map((x) => r6(x));
    }
  }
  seedRows.push(row);
  book('run', row);
  const proj = (((Date.now() - t0) / 1000) / (seed + 1)) * SEEDS;
  console.log(`  seed ${seed + 1}/${SEEDS} done (t_adm=${tAdm}, ${((Date.now() - t0) / 1000).toFixed(1)}s elapsed, projected matrix total ${proj.toFixed(0)}s)`);
}
const elapsedMatrix = ((Date.now() - t0) / 1000).toFixed(1);
const elapsedTotal = ((Date.now() - probeT0) / 1000).toFixed(1);
console.log(`matrix elapsed ${elapsedMatrix}s (probe+matrix ${elapsedTotal}s)`);

// ---------------- aggregate ----------------
const armsAgg = {};
for (const A of ARMS) {
  const G = agg[A];
  const hasAtt = A !== 'v3.1-clean';
  armsAgg[A] = {
    poolAcc: stat(G.acc), errPre: stat(G.pre),
    damage: hasAtt ? stat(G.dmg.map((d) => d ?? 0)) : null,
    damageNeverLaunched: G.dmg.filter((d) => d === null).length,
    windowLen: stat(G.winLen),
    errWin: G.errWin.length ? stat(G.errWin) : null,
    attShareWin: G.attShareWin.length ? stat(G.attShareWin) : null,
    attEchoWin: G.attEcho.length ? stat(G.attEcho) : null,
    attTagEndCounts: G.tagEnd,
    attTrustAtFlip: G.attTrustFlip.length ? stat(G.attTrustFlip) : null,
    attTrustFinal: G.attTrustFin.length ? stat(G.attTrustFin) : null,
    attConvRoundByTrust: hasAtt ? stat(G.conv) : null,
    honQFinal: stat(G.honQ),
    w1Admission: (A === 'v3.1-sleeper' || A === 'v3.1-sleeper-k2') ? {
      admitted_n: G.w1Adm.length, of: SEEDS, tAdmExp: G.w1Adm.length ? stat(G.w1Adm) : null,
      devMeanAtAdmission: G.w1Dev.length ? stat(G.w1Dev) : null,
      indepAtAdmission: G.w1Indep.length ? stat(G.w1Indep) : null,
      probationTraceMax: G.w1ProbMax.length ? stat(G.w1ProbMax) : null,
    } : null,
    h2Admission: A.startsWith('v3.1') ? {
      admitted_n: G.h2Adm.length, of: SEEDS, tAdmExp: G.h2Adm.length ? stat(G.h2Adm) : null,
      devMeanAtAdmission: G.h2Dev.length ? stat(G.h2Dev) : null,
      falseNegativeRate: r6((SEEDS - G.h2Adm.length) / SEEDS),
    } : null,
    g1Admission: A === 'v3.1-instant' ? { admitted_n: G.g1Adm.length, of: SEEDS, tAdmExp: G.g1Adm.length ? stat(G.g1Adm) : null } : null,
    verify: { checks: G.vfy.checks, pass: G.vfy.pass, maxDiff: G.vfy.maxDiff.toExponential(2) },
  };
}

// ---------------- claims ----------------
const dmgOf = (A) => agg[A].dmg.map((d) => (d === null ? 0 : d)); // neverLaunched -> 0 damage
// S1 CONTAINMENT: D(A1) < D(A2), paired
const dS1 = dmgOf('v3-sleeper').map((d, i) => d - dmgOf('v3.1-sleeper')[i]); // >0 = v3.1 helps
const stS1 = signTestOneSided(dS1);
const seS1 = seOf(dS1);
const ratioS1 = r6(armsAgg['v3.1-sleeper'].damage.mean / Math.max(1e-12, armsAgg['v3-sleeper'].damage.mean));
const S1 = {
  verdict: (mean(dS1) > 0 && stS1.p < 0.05) ? 'CONFIRMED' : (mean(dS1) > 0 ? 'PARTIAL' : 'REFUTED'),
  damage_v31sleeper: armsAgg['v3.1-sleeper'].damage,
  damage_v3sleeper: armsAgg['v3-sleeper'].damage,
  ratio_v31_over_v3: ratioS1,
  pairedDelta_v3_minus_v31: { mean: r6(mean(dS1)), se: r6(seS1), sd: r6(sd(dS1)), n: dS1.length, perSeed: dS1.map((x) => r6(x)) },
  signTest_oneSided: stS1,
  kStar: KSTAR, k2: K2,
  note: 'primary evidence = counterfactual damage suppression (E24/E33 method) of the SAME sleeper attack (flip at t_adm+k* in both arms; arms differ ONLY in protocol layer)',
};
// S2 PATIENCE PRICING: D(A1) vs D(A3)
const dS2 = dmgOf('v3.1-sleeper').map((d, i) => d - dmgOf('v3.1-instant')[i]); // >0 = patience beats flashing
const seS2 = seOf(dS2);
const S2 = {
  verdict: mean(dS2) > 0 ? 'HOLE' : 'HELD',
  reading: mean(dS2) > 0
    ? 'patience beats toxicity: the admitted sleeper extracts MORE damage than the instant toxic newcomer — admission has a probation-evasion opening'
    : 'waiting costs the attacker at least as much as flashing: trust decay / fractional attribution catch the flip',
  damage_v31sleeper: armsAgg['v3.1-sleeper'].damage,
  damage_v31instant: armsAgg['v3.1-instant'].damage,
  ratio_sleeper_over_instant: r6(armsAgg['v3.1-sleeper'].damage.mean / Math.max(1e-12, armsAgg['v3.1-instant'].damage.mean)),
  pairedDelta_sleeper_minus_instant: { mean: r6(mean(dS2)), se: r6(seS2), sd: r6(sd(dS2)), n: dS2.length, perSeed: dS2.map((x) => r6(x)) },
  windowNote: 'windows differ by construction (sleeper [t_adm+k*, +150) vs instant [150,+150)); D is a per-round mean over each arm\'s own window, so the comparison prices patience in damage density, not duration',
};
// S3 TRANSFER: held-out mean of k* / probe D(k*)
const heldMean = mean(dmgOf('v3.1-sleeper'));
const probeD = probeRuns[KSTAR].damage ?? 0;
const transferRatio = probeD > 1e-12 ? heldMean / probeD : null;
const S3 = {
  verdict: transferRatio === null ? 'INDETERMINATE (probe damage ~0)'
    : transferRatio >= 0.8 ? 'GENERALIZES (adaptive threat is REAL)'
    : transferRatio < 0.5 ? 'PROBE-OVERFIT (attack overfits the probe; defense overfit-resistant)'
    : 'INDETERMINATE',
  kStar: KSTAR, k2: K2,
  probeDamage_kStar: r6(probeD), probeDamage_k2: probeRuns[K2].damage === null ? null : r6(probeRuns[K2].damage),
  heldOutMean_kStar: r6(heldMean),
  heldOutPerSeed_kStar: dmgOf('v3.1-sleeper').map((x) => r6(x)),
  heldOutPerSeed_k2: dmgOf('v3.1-sleeper-k2').map((x) => r6(x)),
  heldOutSd_kStar: r6(sd(dmgOf('v3.1-sleeper'))),
  transferRatio: transferRatio === null ? null : r6(transferRatio),
  thresholds: '>=0.8 GENERALIZES; <0.5 PROBE-OVERFIT; else INDETERMINATE (receipted)',
  split: 'probe seed "probe" (train) vs matrix seeds 0..7 (held out); k*/k2 chosen on the probe only',
};
// S4 NO COLLATERAL: A1 vs A4 honestFinalQ
const honDiff = agg['v3.1-sleeper'].honQ.map((q, i) => q - agg['v3.1-clean'].honQ[i]);
const seHon = seOf(honDiff);
const S4 = {
  verdict: Math.abs(mean(honDiff)) <= seHon ? 'CONFIRMED' : 'REFUTED',
  honQ_v31sleeper: armsAgg['v3.1-sleeper'].honQFinal,
  honQ_v31clean: armsAgg['v3.1-clean'].honQFinal,
  pairedDiff_sleeper_minus_clean: { mean: r6(mean(honDiff)), se: r6(seHon), n: honDiff.length },
  note: 'honestFinalQ = mean HedgeTrust weight of the 12 honest incumbents at t=T-1 (post final update+absorb); the roster carries w1/g1/h2 in every arm (e33 convention), so the clean-arm baseline includes their 0.5-prior normalization mass',
};
// S5 ADMISSION RECORD
const w1n = armsAgg['v3.1-sleeper'].w1Admission.admitted_n;
const S5 = {
  verdict: w1n === SEEDS ? 'OPEN (sleeper admitted in every seed — probation-evasion surface exists)'
    : w1n === 0 ? 'TOO-STRICT (sleeper never admitted under honest behavior — admission rejects honest-looking newcomers; honest false-negative risk)'
    : 'MIXED',
  sleeper: armsAgg['v3.1-sleeper'].w1Admission,
  probationTraceNote: 'probTrace = |p_w1 - pool| over probation rounds in arm A1; devMeanAtAdmission = Admission.devMean (the quantity admitErr=0.5 judges)',
  honestJoiner_h2: {
    perArm: Object.fromEntries(ARMS.filter((A) => A.startsWith('v3.1')).map((A) => [A, armsAgg[A].h2Admission])),
    note: 'h2 = honest late-joiner control in ALL arms (E21/E24 wiring); falseNegativeRate = fraction of arm-seeds where h2 is NOT admitted by T',
  },
  instantToxic_g1: armsAgg['v3.1-instant'].g1Admission,
  holeEvidence: armsAgg['v3.1-instant'].g1Admission.admitted_n > 0
    ? 'g1 (toxic FROM ARRIVAL) admitted in some seeds — admitErr=0.5 does not stop an independent liar either'
    : 'g1 never admitted (its edges echo-align with honest voices / probation error bars it) — admission still gates the flasher',
};
book('finding.S1', { ...S1 });
book('finding.S2', { ...S2 });
book('finding.S3', { ...S3 });
book('finding.S4', { ...S4 });
book('finding.S5', { ...S5 });
book('finding.runtime', {
  seedsRun: SEEDS, matrixElapsed_s: Number(elapsedMatrix), totalElapsed_s: Number(elapsedTotal),
  cut: cut ?? 'none — full plan within budget',
  probeRow: rows.find((r) => r.kind === 'probe.choice') ?? null,
  vaultLiveJobs: vault.liveJobs,
});

const chain = sealChain(rows);
const tip = rows[rows.length - 1].row_hash;
const vfy = verifyChain(rows);
if (!vfy.ok) { console.error('CHAIN VERIFY FAILED', vfy); process.exit(1); }
console.log(`chain: ${rows.length} rows, tip ${tip} VERIFIED`);
for (const c of [['S1', S1], ['S2', S2], ['S3', S3], ['S4', S4], ['S5', S5]]) {
  console.log(`${c[0]}: ${c[1].verdict}  ${JSON.stringify(c[1]).slice(0, 240)}`);
}

mkdirSync('experiments/outputs', { recursive: true });
writeFileSync('experiments/outputs/e35_summary.json', JSON.stringify({
  task: 'E35', name: 'the sleeper cell (probation-evasion attack + strategy transfer test)',
  seeds: SEEDS, T, voices: V, probeSeed: PROBE_SEED, strategies: KS, kStar: KSTAR, k2: K2,
  arms: ARMS, runtime_s: { probePhase: +(tProbeMs / 1000).toFixed(1), matrix: Number(elapsedMatrix), total: Number(elapsedTotal) },
  config: {
    world: { FLIP_P, REROLL_P, N, TOX_Q, JOIN }, damageWindow: DW, pre: PRE,
    hedge: CFG, admission: ADM, roster: ALL_IDS,
  },
  probe: { pass1: probeP1.w1, perK: probeDmg.map((d) => ({ k: d.k, D: d.D === null ? null : r6(d.D), window: d.win })) },
  arms: armsAgg, claims: { S1, S2, S3, S4, S5 },
  perSeed: seedRows,
  curves: seed0Curves,
  chain: { rows: rows.length, tip, verified: vfy.ok },
}, null, 1));
writeFileSync('experiments/outputs/receipts_e35.jsonl', rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
console.log('wrote experiments/outputs/e35_summary.json + receipts_e35.jsonl');
console.log(vault.liveJobs === 0 ? 'E35 DONE' : 'E35 PROBLEM (live jobs)');
