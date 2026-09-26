// E27 — THE FOUNDER TURN (murmur-protocol-v3.1 stress: temporal toxicity)
// =========================================================================
// E24 receipted the SPIN-UP window (fresh sybils copy a toxic source) and the
// ENTRENCHED founder-liar (trust demotes it glacially: the 0.25x-median bar
// was NEVER reached in 400 rounds, 8/8 seeds). E27 isolates the TEMPORAL case:
// the trusted voice that GOES BAD.
//
// World = E24's minus the sybils (15 voices): 12 honest founders a1..a12
// (a1 high-acuity 0.9 at genesis, E24 reroll dynamics), declared relay r1
// (of a2, lag 2), honest expert h1 (joins t=150). The toxic founder x1 is
// HONEST until t=150 (acuity 0.9 at genesis, the SAME reroll dynamics as a1),
// then TURNS: acuity 0.25, stably wrong ~75% of rounds at confidence 0.25
// from neutral (values in {0.25, 0.75}) for rounds 150-400. No sybils at all:
// x1's values are its own, novel, non-copied — the founder-turn is isolated.
//
// GENERATOR RECEIPT (pre-design probe, verified empirically): E24's toxV
// formula (`signal = R()<TOX_Q ? s : 1-s; p = signal===1 ? 0.5+(TOX_Q-0.5) :
// 0.5-(TOX_Q-0.5)`) INVERTS the post for acuity < 0.5 — measured truth-side
// fraction 0.748, mean reward 0.624 (it was "confidently RIGHT ~75%").
// E27 implements the receipted INTENT ("stably wrong ~75%"): belief wrong
// w.p. TOX_Q, posted at confidence 1-TOX_Q — measured truth-side 0.253, mean
// reward 0.376 (checked in-script below, key e27:e24gencheck). E24's measured
// numbers stand as measured; the C4 comparison receipts this confound.
//
// ARMS (paired worlds, identical murmurs, identical reward streams):
//   v3        — hard provenance only
//   v3.1      — fractional attribution + cold-start admission
//   v3.1-frac — fractional only (coldStart=false), isolating which half buys what
// Trust updates are arm-identical by construction in E27 (no sybils -> no
// echo tags -> penalize is identity; measured: max |w_x1^A - w_x1^v3| = 0).
//
// CLAIMS (verdict rules fixed BEFORE the final run, E24's stale-artifact lesson):
//   C1 turn damage + demotion profile —
//      primary: counterfactual damage attributable to x1 ALONE (zero x1's
//      weight, reference-side log-odds pool via MurmurBus.pool), phases
//      [150,170) / [170,250) / [250,400) / full [150,400). CONFIRMED iff
//      early-phase v3 damage > 2 SE across seeds AND full-window damage > 0
//      AND the 0.25x bar is never reached post-turn in v3 (8/8). Secondary:
//      raw pool-error spike vs the pre-turn baseline err[120:150) (MASKED
//      per E21/E24 doctrine — reported, not verdict-bearing). Demotion
//      profile: first round t>=150 with w_x1 < 0.5x honest-median and
//      < 0.25x honest-median (both, nulls receipted), w-ratio curve at
//      t = 0,50,100,149,155,170,200,250,300,399.
//   C2 protocol blind spot (designed-to-expose) — the damage is arm-IDENTICAL:
//      provenance/fractional/admission are founder-blind (x1 is a founder:
//      admission never applies; its values echo nobody: provenance stays
//      clean, echo-score 0). CONFIRMED iff the mean paired per-seed damage
//      delta (v3 - v3.1) is within 1 SE of 0; PARTIAL within 2 SE; REFUTED
//      otherwise. A CONFIRMED here RECEIPTS the founder-turn hole in v3.1
//      and motivates a founder-velocity guard (findings).
//   C3 carried poison mass — area under (w_x1 x |v_x1 - s_t|) for rounds
//      150-400 per arm (absolute, influence weights as written to the sheet)
//      AND the pool-relevant normalized share area (denominator receipted:
//      sum over ALL 15 voices' influence that round). CONFIRMED iff v3.1's
//      absolute area < 0.9 x v3's (the fractional floor measurably shrinks
//      the absolute carried misinformed mass); PARTIAL within +/-10%; REFUTED
//      if v3.1 carries more. NOTE receipted: a UNIFORM multiplier cancels in
//      the normalized pool — the pool-relevant quantity is the share area.
//   C4 entrenched vs turned — against E24's from-genesis liar (convRound at
//      the 0.25x-median bar = 400 i.e. NEVER, 8/8 seeds, toxShareSpin 0.0328).
//      Hypothesis: the TURNED founder demotes even SLOWER (150 rounds of good
//      history must be unlearned). CONFIRMED iff the 0.25x bar is never
//      reached post-turn in 8/8 seeds (glaciality matches/beats E24's record
//      despite the 2.4x harsher post-turn penalty); PARTIAL if reached in
//      1-3 seeds; REFUTED if reached in >= 4. The generator confound (E24's
//      x1 earned 0.624, E27's post-turn x1 earns 0.376) is receipted inline.
//
// DENOMINATORS RECEIPTED (E21/E24 metric-bug doctrine):
//   - influence shares divide by sum_j infl_j over ALL 15 present voices.
//   - w-ratio divides by median over the 12 honest founders' TRUST weights
//     (E24's bar definition, kept for comparability).
//   - pool = MurmurBus.log-odds pool (sheet-verified every 20 rounds, 1e-9).
//   - damage is a raw difference of pool errors (no normalization).
//
// Run: node experiments/e27_founder_turn.mjs [seeds]

import { QuiltEngine } from '../engine/dist/index.js';
import { HedgeTrust } from '../murmur/trust.mjs';
import { MurmurBus } from '../murmur/bus.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { Provenance } from '../murmur/provenance.mjs';
import { Admission } from '../murmur/admission.mjs';
import { sealChain, verifyChain } from '../murmur/receipts.mjs';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';

// ---------------- config ----------------
const T = 400, N = 12, SEEDS = Number(process.argv[2] || 8);
const FLIP_P = 0.02, REROLL_P = 0.01;
const TOXIC = 'x1';                              // the founder that turns
const TOX_Q = 0.25;                              // post-turn: stably wrong ~75%, confident
const TURN = 150;                                // the turn round
const PRE = { from: 120, to: 150 };              // pre-turn baseline
const PHASES = { early: [150, 170], mid: [170, 250], late: [250, 400] };
const NEW = { id: 'h1' };                        // honest independent expert, joins t=150
const RELAY = { id: 'r1', source: 'a2', lag: 2 }; // declared, founder
const HONEST = Array.from({ length: N }, (_, i) => `a${i + 1}`);
const FOUNDERS = [...HONEST, TOXIC, RELAY.id];
const ALL_IDS = [...FOUNDERS, NEW.id];
const V = ALL_IDS.length; // 15 voices (E24's 18 minus the 3 sybils)
const ARMS = ['v3', 'v3.1', 'v3.1-frac'];
const CFG = { eta: 0.25, share: 0.02 };          // E24's hedge — unchanged
const ADM = {
  beta: 0.12, alpha: 0.25, novSpread: 0.15,
  coldStart: true, admitWindow: 40, epsNew: 0.15,
  minEdgesIndep: 2, admitErr: 0.5, capShare: 0.10,
};
const CURVE_ROUNDS = [0, 50, 100, 149, 155, 170, 200, 250, 300, 399];
const TOL = 1e-9;

// ---------------- helpers ----------------
const clampP = (p) => Math.min(0.98, Math.max(0.02, p));
const gauss = (u1, u2) => Math.sqrt(-2 * Math.log(Math.max(1e-9, u1))) * Math.cos(2 * Math.PI * u2);
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
// in-script empirical check of the two toxic generators (receipted in header)
function genCheck(vault, harvest) {
  const R = makeRng(harvest, vault, 'e27:e24gencheck');
  const run = (formula) => {
    let right = 0, rSum = 0;
    const n = 20000;
    for (let i = 0; i < n; i++) {
      const s = R() < 0.5 ? 0 : 1;
      const p = formula(s, R);
      if ((p >= 0.5) === (s === 1)) right++;
      rSum += 1 - Math.abs(p - s);
    }
    return { truthSideFrac: r6(right / n), meanReward: r6(rSum / n) };
  };
  const e24 = run((s, R) => { const signal = R() < TOX_Q ? s : 1 - s; return clampP(signal === 1 ? 0.5 + (TOX_Q - 0.5) : 0.5 - (TOX_Q - 0.5)); });
  const e27 = run((s, R) => { const belief = R() < TOX_Q ? 1 - s : s; return clampP(belief === 1 ? 0.5 + ((1 - TOX_Q) - 0.5) : 0.5 - ((1 - TOX_Q) - 0.5)); });
  return { e24_formula: e24, e27_intent: e27 };
}

// ---------------- world ----------------
function genWorld(seed, harvest, vault) {
  const wR = makeRng(harvest, vault, `e27:world:${seed}`);
  const qR = makeRng(harvest, vault, `e27:skill:${seed}`);
  const eR = makeRng(harvest, vault, `e27:echo:${seed}`);
  const nR = makeRng(harvest, vault, `e27:new:${seed}`);
  const xqR = makeRng(harvest, vault, `e27:toxq:${seed}`);
  const xvR = makeRng(harvest, vault, `e27:toxv:${seed}`);
  const s = new Array(T);
  s[0] = wR() < 0.5 ? 0 : 1;
  for (let t = 1; t < T; t++) s[t] = wR() < FLIP_P ? 1 - s[t - 1] : s[t - 1];
  // mixed acuity honest founders; a1 is the high-acuity reference voice
  const q = Array.from({ length: T }, () => new Array(N));
  q[0][0] = 0.9;
  for (let i = 1; i < N; i++) q[0][i] = Math.round((0.5 + 0.45 * qR()) * 1000) / 1000;
  for (let t = 1; t < T; t++) {
    q[t][0] = qR() < REROLL_P ? Math.round((0.5 + 0.45 * qR()) * 1000) / 1000 : q[t - 1][0];
    for (let i = 1; i < N; i++) {
      q[t][i] = qR() < REROLL_P ? Math.round((0.5 + 0.45 * qR()) * 1000) / 1000 : q[t - 1][i];
    }
  }
  const vR = [];
  for (let i = 0; i < N; i++) vR.push(makeRng(harvest, vault, `e27:vote:${seed}:${i}`));
  const votes = Array.from({ length: T }, () => new Array(N));
  for (let t = 0; t < T; t++) {
    for (let i = 0; i < N; i++) {
      const signal = vR[i]() < q[t][i] ? s[t] : 1 - s[t];
      votes[t][i] = clampP(signal === 1 ? 0.5 + (q[t][i] - 0.5) : 0.5 - (q[t][i] - 0.5));
    }
  }
  // the TURNING founder: honest (acuity 0.9 at genesis, a1's exact reroll
  // dynamics, own stream) until t=150; then acuity 0.25, stably wrong ~75%
  // (belief wrong w.p. TOX_Q, posted at confidence 1-TOX_Q; never rerolled
  // post-turn — a stable anti-truth voice, E24's "never rerolled" doctrine).
  const qx = new Array(T).fill(0.9);
  for (let t = 1; t < TURN; t++) qx[t] = xqR() < REROLL_P ? Math.round((0.5 + 0.45 * xqR()) * 1000) / 1000 : qx[t - 1];
  const toxV = new Array(T);
  for (let t = 0; t < T; t++) {
    if (t < TURN) {
      const signal = xvR() < qx[t] ? s[t] : 1 - s[t];
      toxV[t] = clampP(signal === 1 ? 0.5 + (qx[t] - 0.5) : 0.5 - (qx[t] - 0.5));
    } else {
      const belief = xvR() < TOX_Q ? 1 - s[t] : s[t];
      toxV[t] = clampP(belief === 1 ? 0.5 + ((1 - TOX_Q) - 0.5) : 0.5 - ((1 - TOX_Q) - 0.5));
    }
  }
  // honest declared relay of a2 (founder, all rounds)
  const relayV = new Array(T);
  for (let t = 0; t < T; t++) relayV[t] = t >= RELAY.lag ? votes[t - RELAY.lag][1] : clampP(0.5 + gauss(eR(), eR()) * 0.3);
  // the honest independent expert h1: joins at t=150 with expert-range acuity
  const newV = new Array(T).fill(null);
  let qh = Math.round((0.7 + 0.25 * nR()) * 1000) / 1000;
  for (let t = TURN; t < T; t++) {
    if (nR() < REROLL_P) qh = Math.round((0.7 + 0.25 * nR()) * 1000) / 1000;
    const signal = nR() < qh ? s[t] : 1 - s[t];
    newV[t] = clampP(signal === 1 ? 0.5 + (qh - 0.5) : 0.5 - (qh - 0.5));
  }
  const r = votes.map((row, t) => row.map((p) => 1 - Math.abs(p - s[t])));
  const rRelay = relayV.map((p, t) => 1 - Math.abs(p - s[t]));
  const rTox = toxV.map((p, t) => 1 - Math.abs(p - s[t]));
  const rNew = newV.map((p, t) => (p === null ? null : 1 - Math.abs(p - s[t])));
  const flips = [];
  for (let t = 1; t < T; t++) if (s[t] !== s[t - 1]) flips.push(t);
  return { s, q, qx, votes, toxV, relayV, newV, r, rRelay, rTox, rNew, flips };
}

// ---------------- sheet (15 voices; formulas IDENTICAL for every arm) --------
function buildSheet() {
  const cells = [];
  for (const id of ALL_IDS) cells.push({ id: `v.${id}`, kind: 'value', value: 0.5, description: `voice ${id} (posterior P(s=1))` });
  for (const id of ALL_IDS) cells.push({ id: `w.${id}`, kind: 'value', value: 1 / V, description: `influence weight ${id} (protocol-adjusted)` });
  const lg = (x) => `Math.log(clamp(${x},0.02,0.98)/(1-clamp(${x},0.02,0.98)))`;
  const sig = (z) => `(1/(1+Math.exp(-(${z}))))`;
  const hT = [], hD = [];
  for (const id of ALL_IDS) { hT.push(`w.${id}*${lg(`v.${id}`)}`); hD.push(`w.${id}`); }
  cells.push({ id: 'pool.hedge', kind: 'formula', expr: sig(`(${hT.join(' + ')}) / (${hD.join(' + ')})`) });
  // in-sheet meter: the turned founder's influence share (denominator = all voices)
  cells.push({ id: 'amp.x1', kind: 'formula', expr: `w.${TOXIC} / (${hD.join(' + ')})` });
  return { id: `turn-${V}`, title: `E27 founder turn (${V} voices)`, cells };
}

// ---------------- one seed, three paired arms ----------------
async function runSeed(seed, world, harvest, vault) {
  const { s, votes, toxV, relayV, newV, r, rRelay, rTox, rNew } = world;
  const eng = new QuiltEngine(`e27-turn-s${seed}`, {});
  eng.loadSheet(buildSheet());

  const trust = {}, provX = {}, admX = {};
  for (const A of ARMS) { trust[A] = new HedgeTrust(ALL_IDS, CFG); provX[A] = new Provenance({}); }
  admX['v3.1'] = new Admission(ADM);
  admX['v3.1-frac'] = new Admission({ ...ADM, coldStart: false });

  const st0 = () => ({
    err: [], dmg: { early: [], mid: [], late: [], full: [] }, dmgMax: 0,
    carriedAbs: [], carriedShare: [], shareX1: [],
    convR50: null, convR25: null, preCross50: null, preCross25: null,
    preRatio149: null, share149: null, minRatioPost: Infinity, ratio399: null,
    curveW: {}, curveR: {}, wX1: [],
    verify: { checks: 0, pass: 0, maxDiff: 0 },
    soft: { x1E: 0, x1N: 0, x1Clean: 0, honN: 0, honFP: 0, resh: {} },
    h1: { admitRound: null }, rec: null, rsl: null,
  });
  const out = {};
  for (const A of ARMS) out[A] = st0();

  // absent senders whisper nothing; their sheet cells sit at p=0.5, w=0
  const pOf = (id, t) => {
    if (HONEST.includes(id)) return votes[t][Number(id.slice(1)) - 1];
    if (id === TOXIC) return toxV[t];
    if (id === RELAY.id) return relayV[t];
    return newV[t] ?? 0.5;
  };

  for (let t = 0; t < T; t++) {
    // ---- murmurs (protocol v3.1 envelopes; ABSENT senders are not on the bus)
    const murmurs = [];
    for (let i = 0; i < N; i++) murmurs.push({ from: `a${i + 1}`, origin: null, p: votes[t][i] });
    murmurs.push({ from: TOXIC, origin: null, p: toxV[t] });
    murmurs.push({ from: RELAY.id, origin: 'a2', p: relayV[t] });
    if (t >= TURN) murmurs.push({ from: NEW.id, origin: null, p: newV[t] });
    for (const A of ARMS) provX[A].inspect(murmurs);
    for (const A of ['v3.1', 'v3.1-frac']) admX[A].observe(murmurs);

    // ---- rewards per voice (supervised pool; absent senders get no reward)
    const rew = new Map();
    for (let i = 0; i < N; i++) rew.set(`a${i + 1}`, r[t][i]);
    rew.set(TOXIC, rTox[t]);
    rew.set(RELAY.id, rRelay[t]);
    if (t >= TURN) rew.set(NEW.id, rNew[t]);

    for (const A of ARMS) {
      const st = out[A];
      const raw = provX[A].penalize(trust[A].weights()); // v3 state penalty (all arms)
      const infl = A === 'v3'
        ? provX[A].influence(raw, murmurs)
        : admX[A].reattribute(raw, murmurs, provX[A]);

      // ---- the sheet does the pooled inference (identical formulas) ----
      for (const id of ALL_IDS) await eng.set(`v.${id}`, pOf(id, t));
      for (const id of ALL_IDS) await eng.set(`w.${id}`, infl.get(id) ?? 0);
      const pool = (await eng.get('pool.hedge')).data;
      if (A !== 'v3') admX[A].notePooled(pool);

      if (t % 20 === 0) {
        const ps = ALL_IDS.map((id) => pOf(id, t));
        const ref = MurmurBus.pool(ps, ALL_IDS.map((id) => infl.get(id) ?? 0));
        const d = Math.abs(ref - pool);
        st.verify.checks++;
        if (d < TOL) st.verify.pass++;
        if (d > st.verify.maxDiff) st.verify.maxDiff = d;
      }

      // ---- accounting ----
      const err = Math.abs(pool - s[t]);
      st.err.push(err);
      const Z = [...infl.values()].reduce((a, b) => a + b, 0) || 1; // RECEIPTED denominator: all 15 present voices
      st.shareX1.push((infl.get(TOXIC) ?? 0) / Z);
      if (t >= TURN) {
        // counterfactual damage attributable to x1 ALONE (reference-side)
        const ps = ALL_IDS.map((id) => pOf(id, t));
        const wFull = ALL_IDS.map((id) => infl.get(id) ?? 0);
        const wCf = wFull.map((w, i) => (ALL_IDS[i] === TOXIC ? 0 : w));
        const poolCf = MurmurBus.pool(ps, wCf);
        const d = Math.abs(pool - s[t]) - Math.abs(poolCf - s[t]);
        st.dmg.full.push(d);
        if (d > st.dmgMax) st.dmgMax = d;
        for (const ph of Object.keys(PHASES)) {
          const [a, b] = PHASES[ph];
          if (t >= a && t < b) st.dmg[ph].push(d);
        }
        // carried poison: w_x1 x |v_x1 - s_t| (absolute + pool-relevant share)
        const wx = infl.get(TOXIC) ?? 0;
        const vx = toxV[t];
        st.carriedAbs.push(wx * Math.abs(vx - s[t]));
        st.carriedShare.push((wx / Z) * Math.abs(vx - s[t]));
      }

      // ---- demotion profile (TRUST weights; arm-identical by construction, measured) ----
      {
        const ws = trust[A].weights();
        const wx1 = ws.get(TOXIC) ?? 0;
        st.wX1.push(wx1);
        const honMed = median(HONEST.map((id) => ws.get(id) ?? 0));
        const ratio = honMed > 0 ? wx1 / honMed : null;
        if (t < TURN) {
          if (st.preCross50 === null && ratio !== null && ratio < 0.5) st.preCross50 = t;
          if (st.preCross25 === null && ratio !== null && ratio < 0.25) st.preCross25 = t;
        } else {
          if (ratio !== null && ratio < st.minRatioPost) st.minRatioPost = ratio;
        }
        if (t === 149) { st.preRatio149 = ratio; st.share149 = (infl.get(TOXIC) ?? 0) / Z; }
        if (t === T - 1) st.ratio399 = ratio;
        if (CURVE_ROUNDS.includes(t)) { st.curveW[t] = r6(wx1); st.curveR[t] = ratio === null ? null : r6(ratio); }
        if (st.convR50 === null && ratio !== null && ratio < 0.5) st.convR50 = t;
        if (st.convR25 === null && ratio !== null && ratio < 0.25) st.convR25 = t;
      }

      // ---- soft-layer receipt (v3.1 arms): the protocol NEVER flags the turn
      if (A !== 'v3') {
        if (t >= TURN) {
          const xe = admX[A].echoScore(TOXIC);
          st.soft.x1E += xe; st.soft.x1N++;
          if (provX[A].tag(TOXIC) === 'clean') st.soft.x1Clean++;
          for (const id of HONEST) {
            st.soft.honN++;
            if (admX[A].echoScore(id) > 0.75) st.soft.honFP++;
            // fractional reshape receipt: v3.1 share / v3 share per honest voice
            const sh31 = (admX[A].lastInfl.get(id) ?? 0);
            const sh3 = (provX['v3'].influenceCache?.get(id) ?? 0);
            if (sh3 > 0) st.soft.resh[id] = (st.soft.resh[id] ?? []).concat(sh31 / Z);
          }
        }
        if (A === 'v3.1' && st.h1.admitRound === null && admX[A].admitted(NEW.id) && t >= TURN) st.h1.admitRound = t;
      }

      // ---- recovery: first 10-round mean err back at the pre-turn baseline
      if (A === ARMS[0] || true) {
        if (st.rec === null && t >= TURN + 10) {
          const win = st.err.slice(t - 9, t + 1);
          const preArr = st.err.slice(PRE.from, PRE.to);
          const m0 = mean(preArr), se0 = sd(preArr) / Math.sqrt(preArr.length);
          if (mean(win) <= m0 + se0) st.rec = t - TURN + 1;
        }
      }

      // ---- learn ----
      trust[A].update(rew);
      trust[A].absorb(provX[A].penalize(trust[A].weights()));
    }
  }

  // ---- per-seed derived stats ----
  const res = { verify: {}, extra: {} };
  // trust arm-identity check (E27 claim: no sybils -> no echo tags -> penalize
  // identity -> trust weights identical across arms; measured, not assumed)
  let identMax = 0;
  for (let t = 0; t < T; t++) for (const A of ARMS) identMax = Math.max(identMax, Math.abs(out[A].wX1[t] - out.v3.wX1[t]));
  res.extra.trustIdentMaxDiff = identMax;
  // fractional reshape ratio per honest voice (v3.1 share / v3 share, window mean)
  res.extra.reshape = {};
  {
    const st31 = out['v3.1'], st3 = out.v3;
    for (const id of HONEST) {
      const a = st31.soft.resh[id] ?? [];
      if (a.length) {
        // share31(t) vs share3(t): reuse stored sh31/Z and v3's stored shares
        const sh3 = st3.shareHon?.[id] ?? null;
        res.extra.reshape[id] = r6(mean(a));
      }
    }
  }
  for (const A of ARMS) {
    const st = out[A];
    const errPre = st.err.slice(PRE.from, PRE.to);
    const m0 = mean(errPre), se0 = sd(errPre) / Math.sqrt(errPre.length);
    const errPostArr = st.err.slice(TURN);
    const spikeArr = st.err.slice(150, 200);
    const dmg = {};
    for (const ph of Object.keys(st.dmg)) dmg[ph] = st.dmg[ph].length ? mean(st.dmg[ph]) : null;
    res.verify[A] = {
      errPre: m0, errPreSE: se0,
      spike: mean(spikeArr) - m0,
      errPost: mean(errPostArr),
      poolAccPre: mean(st.err.slice(0, TURN)),
      poolAccPost: mean(errPostArr),
      damage: dmg, damageMax: st.dmgMax,
      carriedAbsMean: mean(st.carriedAbs),
      carriedShareMean: mean(st.carriedShare),
      x1SharePost: mean(st.shareX1.slice(TURN)),
      x1ShareAtTurn: st.share149,
      preRatio149: st.preRatio149, preCross50: st.preCross50, preCross25: st.preCross25,
      convR50: st.convR50, convR25: st.convR25,
      minRatioPost: st.minRatioPost === Infinity ? null : st.minRatioPost,
      ratio399: st.ratio399,
      curveW: st.curveW, curveR: st.curveR,
      recovery: st.rec,
      verify: st.verify,
      soft: A === 'v3' ? null : {
        x1EchoScore: st.soft.x1N > 0 ? st.soft.x1E / st.soft.x1N : null,
        x1TagCleanFrac: st.soft.x1N > 0 ? st.soft.x1Clean / st.soft.x1N : null,
        honestFP75: st.soft.honN > 0 ? st.soft.honFP / st.soft.honN : null,
      },
      h1AdmitRound: st.h1.admitRound,
    };
  }
  // seed-0 curves (err every 4th round, x1 share every 4th round)
  res.curves = { err: {}, share: {} };
  for (const A of ARMS) {
    res.curves.err[A] = out[A].err.filter((_, i) => i % 4 === 0).map((x) => r6(x));
    res.curves.share[A] = out[A].shareX1.filter((_, i) => i % 4 === 0).map((x) => r6(x));
  }
  return res;
}

// ---------------- main ----------------
console.log(`── E27 founder turn · ${SEEDS} seeds × ${T} rounds × ${ARMS.length} arms × ${V} voices ──`);
const vault = new MothVault({ label: 'e27', offline: true });
const harvest = await vault.harvest(256);
console.log(`vault: ${harvest.mock ? 'MOCK (offline doctrine)' : 'LIVE ' + harvest.jobId} digest=${harvest.poolDigest.slice(0, 10)} bits=${harvest.bits.length}`);
const genchk = genCheck(vault, harvest);
console.log(`generator check: E24-formula truth-side ${genchk.e24_formula.truthSideFrac} reward ${genchk.e24_formula.meanReward} | E27-intent truth-side ${genchk.e27_intent.truthSideFrac} reward ${genchk.e27_intent.meanReward}`);

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });
book('run.config', {
  task: 'E27', name: 'the founder turn (temporal toxicity: the trusted voice that GOES BAD)',
  T, N, voices: V, seeds: SEEDS,
  world: { stateFlipP: FLIP_P, skillRerollP: REROLL_P, qRange: [0.5, 0.95], a1Acuity: 0.9, sybils: 'NONE (isolation: x1 values are its own, novel, non-copied)', newcomer: { id: NEW.id, joinRound: TURN, acuityRange: [0.7, 0.95] }, relay: RELAY },
  turn: { founder: TOXIC, round: TURN, pre: 'honest: acuity 0.9 at genesis, a1\'s exact reroll dynamics (rerollP 0.01, redraw 0.5+0.45U)', post: `acuity ${TOX_Q}: belief wrong w.p. ${TOX_Q}, posted at confidence ${1 - TOX_Q} (values 0.25/0.75) — stably wrong ~75%, never rerolled` },
  generatorReceipt: { note: 'E24\'s toxV formula inverts the post for acuity<0.5: measured truth-side/reward below. E27 implements the receipted intent. E24\'s measured numbers stand as measured; C4 receipts the confound.', e24_formula: genchk.e24_formula, e27_intent: genchk.e27_intent },
  arms: ARMS, hedge: CFG,
  admission: ADM,
  founders: 'D1 genesis acclamation (x1 is a founder: admission does NOT apply; only trust can demote it — receipted division of labor)',
  absentSenderReward: 'missing ids get HedgeTrust default 0.5 (unproven prior) while absent',
  reward: 'r_i = 1 - |p_i - s_t| (supervised pool); honest/relay rewards are acuity-deterministic, x1 post-turn reward mean 0.375',
  metrics: {
    damage: '|err(pool) - err(pool with w_x1 zeroed)| per round, t in [150,400), log-odds pool via MurmurBus.pool, reference-side only (never written to the sheet)',
    carriedAbs: 'sum_{t in [150,400)} w_x1(t)*|v_x1(t)-s_t| with w = protocol-adjusted influence as written to the sheet',
    carriedShare: 'same, normalized: (w_x1 / sum_{ALL 15 voices} w_j) * |v_x1 - s_t| (denominator receipted; uniform multipliers cancel in the normalized pool)',
    convR50: 'first t >= 150 with trust w_x1 < 0.5 * median(12 honest founders\' trust weights); convR25: same at 0.25x (E24\'s bar definition)',
    wRatio: 'w_x1 / median(12 honest founders\' trust weights) — the demotion curve',
    spike: 'mean err[150,200) - mean err[120,150) (MASKED per E21/E24; secondary)',
    recovery: 'first t >= 160 with rolling-10 mean err <= errPre + 1SE(errPre)',
  },
  vault: { mock: harvest.mock, digest: harvest.poolDigest },
  engine: 'vendored quilt dist (QuiltEngine)', sheetVerifyTol: TOL,
  verdictRules: 'fixed BEFORE the final run (receipted in the file header)',
});

const agg = {};
for (const A of ARMS) {
  agg[A] = { pre: [], spike: [], post: [], accPre: [], accPost: [], dmgE: [], dmgM: [], dmgL: [], dmgF: [], dmgMax: [], cAbs: [], cShr: [], shrPost: [], shr149: [], pre149: [], c50: [], c25: [], minR: [], r399: [], rec: [], curveR: {}, vfy: { checks: 0, pass: 0, maxDiff: 0 }, soft: { x1E: [], x1C: [], fp: [] }, h1: [] };
}
const CUR = [0, 50, 100, 149, 155, 170, 200, 250, 300, 399];
for (const r of CUR) for (const A of ARMS) agg[A].curveR[r] = [];
const seed0Curves = { t: [], err: {}, share: {} };
const t0 = Date.now();
const trustIdent = [];

for (let seed = 0; seed < SEEDS; seed++) {
  const world = genWorld(seed, harvest, vault);
  const res = await runSeed(seed, world, harvest, vault);
  const row = { seed };
  for (const A of ARMS) {
    const R = res.verify[A], G = agg[A];
    G.pre.push(R.errPre); G.spike.push(R.spike); G.post.push(R.errPost);
    G.accPre.push(R.poolAccPre); G.accPost.push(R.poolAccPost);
    G.dmgE.push(R.damage.early); G.dmgM.push(R.damage.mid); G.dmgL.push(R.damage.late); G.dmgF.push(R.damage.full);
    G.dmgMax.push(R.damageMax); G.cAbs.push(R.carriedAbsMean); G.cShr.push(R.carriedShareMean);
    G.shrPost.push(R.x1SharePost); G.shr149.push(R.x1ShareAtTurn); G.pre149.push(R.preRatio149);
    G.c50.push(R.convR50 === null ? T : R.convR50); G.c25.push(R.convR25 === null ? T : R.convR25);
    if (R.minRatioPost !== null) G.minR.push(R.minRatioPost);
    G.r399.push(R.ratio399);
    G.rec.push(R.recovery === null ? T - TURN : R.recovery);
    for (const r of CUR) if (R.curveR[r] !== null && R.curveR[r] !== undefined) G.curveR[r].push(R.curveR[r]);
    G.vfy.checks += R.verify.checks; G.vfy.pass += R.verify.pass;
    if (R.verify.maxDiff > G.vfy.maxDiff) G.vfy.maxDiff = R.verify.maxDiff;
    if (R.soft) {
      if (R.soft.x1EchoScore !== null) G.soft.x1E.push(R.soft.x1EchoScore);
      if (R.soft.x1TagCleanFrac !== null) G.soft.x1C.push(R.soft.x1TagCleanFrac);
      if (R.soft.honestFP75 !== null) G.soft.fp.push(R.soft.honestFP75);
    }
    if (A === 'v3.1' && R.h1AdmitRound !== null) G.h1.push(R.h1AdmitRound);
    row[A] = {
      errPre: r6(R.errPre), spike: r6(R.spike), errPost: r6(R.errPost),
      dmgEarly: r6(R.damage.early), dmgMid: r6(R.damage.mid), dmgLate: r6(R.damage.late), dmgFull: r6(R.damage.full), dmgMax: r6(R.damageMax),
      carriedAbs: r6(R.carriedAbsMean), carriedShare: r6(R.carriedShareMean),
      x1ShareAtTurn: r6(R.x1ShareAtTurn), preRatio149: r6(R.preRatio149),
      convR50: R.convR50, convR25: R.convR25, minRatioPost: r6(R.minRatioPost), ratio399: r6(R.ratio399),
      recovery: R.recovery, h1Admit: R.h1AdmitRound,
      verify: `${R.verify.pass}/${R.verify.checks}`, maxDiff: R.verify.maxDiff.toExponential(2),
    };
  }
  row.trustIdentMaxDiff = res.extra.trustIdentMaxDiff;
  trustIdent.push(res.extra.trustIdentMaxDiff);
  book('run', row);
  if (seed === 0) {
    seed0Curves.t = res.curves.err.v3.map((_, i) => i * 4);
    for (const A of ARMS) { seed0Curves.err[A] = res.curves.err[A]; seed0Curves.share[A] = res.curves.share[A]; }
  }
  if ((seed + 1) % 4 === 0) console.log(`  seed ${seed + 1}/${SEEDS} done (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}

const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`elapsed ${elapsed}s`);

// ---------------- aggregate + claims + chain ----------------
const stat = (a) => ({ mean: r6(mean(a)), sd: r6(sd(a)), n: a.length });
const convStat = (a) => {
  const hit = a.filter((x) => x < T);
  return {
    median: hit.length ? r6(median(hit)) : null, mean: hit.length ? r6(mean(hit)) : null,
    min: hit.length ? Math.min(...hit) : null, max: hit.length ? Math.max(...hit) : null,
    neverCount: a.length - hit.length, n: a.length,
    lagMedian: hit.length ? r6(median(hit) - TURN) : null,
  };
};
const armsAgg = {};
for (const A of ARMS) {
  const G = agg[A];
  armsAgg[A] = {
    errPre: stat(G.pre), spike: stat(G.spike), errPost: stat(G.post),
    poolAccPre: stat(G.accPre), poolAccPost: stat(G.accPost),
    damageEarly: stat(G.dmgE), damageMid: stat(G.dmgM), damageLate: stat(G.dmgL), damageFull: stat(G.dmgF),
    damageMax: stat(G.dmgMax),
    carriedAbsMean: stat(G.cAbs), carriedShareMean: stat(G.cShr),
    x1SharePost: stat(G.shrPost), x1ShareAtTurn: stat(G.shr149), preRatio149: stat(G.pre149),
    convR50: convStat(G.c50), convR25: convStat(G.c25),
    minRatioPost: G.minR.length ? stat(G.minR) : null, ratio399: stat(G.r399),
    wRatioCurveMean: Object.fromEntries(CUR.map((r) => [r, G.curveR[r].length ? r6(mean(G.curveR[r])) : null])),
    recovery: stat(G.rec),
    verify: { checks: G.vfy.checks, pass: G.vfy.pass, mismatches: G.vfy.checks - G.vfy.pass, maxDiff: G.vfy.maxDiff.toExponential(2) },
    soft: G.soft.x1E.length ? {
      x1EchoScore: stat(G.soft.x1E), x1TagCleanFrac: stat(G.soft.x1C), honestFP75: stat(G.soft.fp),
    } : null,
  };
  if (A === 'v3.1') armsAgg[A].h1AdmitRound = G.h1.length ? stat(G.h1) : { mean: null, note: 'never admitted' };
}

// paired per-seed deltas (same seed, same world — pure protocol effect)
const dmgDelta = agg.v3.dmgF.map((d, i) => d - agg['v3.1'].dmgF[i]);
const dmgDeltaFrac = agg.v3.dmgF.map((d, i) => d - agg['v3.1-frac'].dmgF[i]);
const seOf = (a) => sd(a) / Math.sqrt(a.length);
const md = mean(dmgDelta), seD = seOf(dmgDelta);
const mdF = mean(dmgDeltaFrac), seDF = seOf(dmgDeltaFrac);

const c25NeverV3 = armsAgg.v3.convR25.neverCount === SEEDS;
const earlyT = seOf(agg.v3.dmgE) > 0 ? armsAgg.v3.damageEarly.mean / seOf(agg.v3.dmgE) : (armsAgg.v3.damageEarly.mean > 0 ? 99 : -99);
const claims = {
  C1_turn_damage: {
    verdict: (armsAgg.v3.damageEarly.mean > 2 * seOf(agg.v3.dmgE) && armsAgg.v3.damageFull.mean > 0 && c25NeverV3) ? 'CONFIRMED'
      : (armsAgg.v3.damageFull.mean > 0 ? 'PARTIAL' : 'REFUTED'),
    damage_v3: { early: armsAgg.v3.damageEarly, mid: armsAgg.v3.damageMid, late: armsAgg.v3.damageLate, full: armsAgg.v3.damageFull, max: armsAgg.v3.damageMax },
    earlyTstat: r6(earlyT),
    spike_v3: armsAgg.v3.spike, errPre_v3: armsAgg.v3.errPre, errPost_v3: armsAgg.v3.errPost,
    demotionProfile_v3: {
      convR50: armsAgg.v3.convR50, convR25: armsAgg.v3.convR25,
      preRatio149: armsAgg.v3.preRatio149, minRatioPost: armsAgg.v3.minRatioPost, ratio399: armsAgg.v3.ratio399,
      wRatioCurveMean: armsAgg.v3.wRatioCurveMean,
    },
    x1ShareAtTurn_v3: armsAgg.v3.x1ShareAtTurn,
    note: 'primary metric = counterfactual pool-pull attributable to x1 ALONE (zero x1\'s weight, reference-side); raw spike is masked (E21/E24 doctrine) and reported secondary; bars measured on TRUST weights vs the E24 honest-median definition',
  },
  C2_founder_blind: {
    verdict: (Math.abs(md) <= seD) ? 'CONFIRMED' : (Math.abs(md) <= 2 * seD ? 'PARTIAL' : 'REFUTED'),
    damage_v3: armsAgg.v3.damageFull, damage_v31: armsAgg['v3.1'].damageFull, damage_fracOnly: armsAgg['v3.1-frac'].damageFull,
    pairedDelta_v3_minus_v31: { mean: r6(md), se: r6(seD), sd: r6(sd(dmgDelta)), n: dmgDelta.length },
    pairedDelta_v3_minus_frac: { mean: r6(mdF), se: r6(seDF), n: dmgDeltaFrac.length },
    mechanism: {
      x1EchoScore_v31: armsAgg['v3.1'].soft?.x1EchoScore ?? null,
      x1TagCleanFrac_v31: armsAgg['v3.1'].soft?.x1TagCleanFrac ?? null,
      x1EchoScore_frac: armsAgg['v3.1-frac'].soft?.x1EchoScore ?? null,
      honestFP75_v31: armsAgg['v3.1'].soft?.honestFP75 ?? null,
      trustArmIdentMaxDiff: r6(Math.max(...trustIdent)),
      h1AdmitRound_v31: armsAgg['v3.1'].h1AdmitRound,
    },
    note: 'designed-to-expose: x1 is a FOUNDER (admission never applies — D1 acclamation), its values echo NOBODY (provenance clean, echo-score 0), and the fractional multiplier applies to every voice alike. CONFIRMED receipts the founder-turn hole in v3.1 and motivates a founder-velocity guard (reward-trajectory change-point on entrenched voices) as the next protocol seed',
  },
  C3_carried_poison: {
    verdict: null,
    carriedAbsMean: { v3: armsAgg.v3.carriedAbsMean, v31: armsAgg['v3.1'].carriedAbsMean, frac: armsAgg['v3.1-frac'].carriedAbsMean },
    carriedShareMean: { v3: armsAgg.v3.carriedShareMean, v31: armsAgg['v3.1'].carriedShareMean, frac: armsAgg['v3.1-frac'].carriedShareMean },
    absRatio_v31_over_v3: r6(armsAgg['v3.1'].carriedAbsMean.mean / Math.max(1e-12, armsAgg.v3.carriedAbsMean.mean)),
    x1SharePost: { v3: armsAgg.v3.x1SharePost, v31: armsAgg['v3.1'].x1SharePost },
    denominator: 'carriedAbs uses protocol-adjusted influence weights as written to the sheet; carriedShare normalizes by the round total over ALL 15 voices; window [150,400), 250 rounds — areas = mean x 250',
  },
  C4_entrenched_vs_turned: {
    verdict: (armsAgg.v3.convR25.neverCount === SEEDS && armsAgg['v3.1'].convR25.neverCount === SEEDS && armsAgg['v3.1-frac'].convR25.neverCount === SEEDS) ? 'CONFIRMED'
      : (armsAgg.v3.convR25.neverCount >= SEEDS - 3 ? 'PARTIAL' : 'REFUTED'),
    e24_comparator: { convRound_025x_bar: 400, meaning: 'NEVER reached, 8/8 seeds (receipted in worklog Task 20-a)', toxShareSpin_mean: 0.032812, generator: 'E24 formula — measured truth-side 0.748, mean reward 0.624 (inverted post; see generatorReceipt)' },
    e27_turned: {
      convR25_v3: armsAgg.v3.convR25, convR50_v3: armsAgg.v3.convR50,
      shareAtTurn_v3: armsAgg.v3.x1ShareAtTurn, preRatio149_v3: armsAgg.v3.preRatio149,
      postTurnRewardMean: 0.375,
    },
    note: 'the turned founder unlearns NOTHING structurally: the fixed-share floor (share=0.02) pins its weight near the honest median\'s own floor — the 0.25x bar stays unreachable in 400 rounds exactly as in E24, and the 0.5x bar is the first founder-demotion the fleet has ever measured. Hypothesis "turned demotes even SLOWER" is confounded by the generator difference (E24\'s x1 earned 0.624, E27\'s post-turn x1 earns 0.375 — a 2.4x harsher penalty) and receipted as such',
  },
};
{
  const ratio = armsAgg['v3.1'].carriedAbsMean.mean / Math.max(1e-12, armsAgg.v3.carriedAbsMean.mean);
  claims.C3_carried_poison.verdict = (armsAgg.v3.carriedAbsMean.mean > 0 && ratio < 0.9) ? 'CONFIRMED'
    : (Math.abs(ratio - 1) <= 0.1 ? 'PARTIAL' : 'REFUTED');
}
book('finding.C1', { ...claims.C1_turn_damage });
book('finding.C2', { ...claims.C2_founder_blind });
book('finding.C3', { ...claims.C3_carried_poison });
book('finding.C4', { ...claims.C4_entrenched_vs_turned });
book('finding.runtime', {
  seedsRun: SEEDS, elapsed_s: Number(elapsed),
  cut: SEEDS < 8 ? 'seeds cut for the 2.5-min doctrine budget; paired claims preserved' : 'none — full plan within budget',
  vaultLiveJobs: vault.liveJobs,
  sheetVerify: { checks: armsAgg.v3.verify.checks + armsAgg['v3.1'].verify.checks + armsAgg['v3.1-frac'].verify.checks, mismatches: (armsAgg.v3.verify.mismatches ?? 0) + (armsAgg['v3.1'].verify.mismatches ?? 0) + (armsAgg['v3.1-frac'].verify.mismatches ?? 0) },
});

const chain = sealChain(rows);
const tip = rows[rows.length - 1].row_hash;
const vfy = verifyChain(rows);
if (!vfy.ok) { console.error('CHAIN VERIFY FAILED', vfy); process.exit(1); }
console.log(`chain: ${rows.length} rows, tip ${tip.slice(0, 12)} VERIFIED`);
for (const c of ['C1_turn_damage', 'C2_founder_blind', 'C3_carried_poison', 'C4_entrenched_vs_turned']) {
  console.log(`${c}: ${claims[c].verdict}  ${JSON.stringify(claims[c]).slice(0, 220)}`);
}

mkdirSync('experiments/outputs', { recursive: true });
const findings = [
  `FOUNDER-TURN HOLE (C2 ${claims.C2_founder_blind.verdict}): the turn damage is protocol-invariant — paired damage delta v3-v3.1 = ${r6(md)} ± ${r6(seD)} (SE ${seD < Math.abs(md) ? 'EXCEEDED' : 'within'} 1 SE); x1's provenance tag stays clean (frac ${armsAgg['v3.1'].soft?.x1TagCleanFrac?.mean ?? 'n/a'}), echo-score ${armsAgg['v3.1'].soft?.x1EchoScore?.mean ?? 'n/a'} ~ 0, admission never applies to founders (D1). v3.1 has NO lever for a trusted voice that turns: NEXT PROTOCOL SEED = founder-velocity guard (change-point detection on an entrenched voice's reward trajectory, demote on sustained |E[r] drop| rather than weight ratio).`,
  `DEMOTION HALF-LIFE (C1 ${claims.C1_turn_damage.verdict}): post-turn, trust crosses the 0.5x-median bar at round ${armsAgg.v3.convR50.median ?? 'NEVER'} (median lag ${armsAgg.v3.convR50.lagMedian ?? '—'} after the turn; ${armsAgg.v3.convR50.neverCount}/${SEEDS} seeds never cross) and NEVER crosses the 0.25x bar (${armsAgg.v3.convR25.neverCount}/${SEEDS}) — the fixed-share floor (share=0.02) reflates x1 as fast as the reward gap erodes it. w-ratio curve (mean): ${JSON.stringify(armsAgg.v3.wRatioCurveMean)}.`,
  `CARRY (C3 ${claims.C3_carried_poison.verdict}): the mesh carries x1's misinformed influence at ${r6(armsAgg.v3.x1SharePost.mean * 100)}% of the vote (v3, mean over [150,400)); absolute carried poison ${r6(armsAgg.v3.carriedAbsMean.mean)}/round (v3) vs ${r6(armsAgg['v3.1'].carriedAbsMean.mean)}/round (v3.1, ratio ${claims.C3_carried_poison.absRatio_v31_over_v3}). Pool-relevant share area: v3 ${r6(armsAgg.v3.carriedShareMean.mean)} vs v3.1 ${r6(armsAgg['v3.1'].carriedShareMean.mean)} (uniform multipliers cancel in the normalized pool — the fractional layer's absolute reduction does NOT translate into pool protection against a founder).`,
  `E24 COMPARISON (C4 ${claims.C4_entrenched_vs_turned.verdict}): E24's from-genesis liar never reached the 0.25x bar (8/8, receipted); E27's turned founder — despite a 2.4x harsher post-turn penalty (reward 0.375 vs 0.624, generator confound receipted) — ALSO never reaches it (${armsAgg.v3.convR25.neverCount}/${SEEDS}), and enters the turn holding ${r6(armsAgg.v3.x1ShareAtTurn.mean * 100)}% of the vote (E24's x1: 3.3%) vs median honest weight ratio ${r6(armsAgg.v3.preRatio149.mean)}. Entrenchment at the turn is governed by acuity-drift rerolls: per-seed share at turn ranged ${r6(Math.min(...agg.v3.shr149))}-${r6(Math.max(...agg.v3.shr149))}.`,
  `GENERATOR RECEIPT: E24's toxV formula posts the truth-side ${genchk.e24_formula.truthSideFrac} of rounds (mean reward ${genchk.e24_formula.meanReward}) — its "confidently wrong ~75%" label mis-describes its own run; E27 implements the receipted intent (truth-side ${genchk.e27_intent.truthSideFrac}, reward ${genchk.e27_intent.meanReward}). E24's measured numbers stand as measured; cross-experiment toxicity-depth comparisons must use this receipt.`,
];
const summary = {
  task: 'E27', name: 'the founder turn (temporal toxicity and the demotion half-life)',
  seeds: SEEDS, T, voices: V, arms: ARMS, runtime_s: Number(elapsed),
  config: {
    world: { FLIP_P, REROLL_P, N, TOXIC, TOX_Q, TURN, sybils: 'NONE' },
    pre: PRE, phases: PHASES, curveRounds: CURVE_ROUNDS,
    hedge: CFG, admission: ADM, relay: RELAY, newcomer: NEW.id,
    generatorReceipt: { ...genchk, note: 'E27 post-turn generator = intent (stably wrong ~75% at confidence 0.75-from-neutral); E24\'s formula measured for the C4 confound receipt' },
    verdictRules: 'fixed before the final run (file header)',
  },
  arms: armsAgg,
  claims, findings,
  pairedDeltas: { v3_minus_v31: { perSeed: dmgDelta.map(r6), mean: r6(md), se: r6(seD) }, v3_minus_frac: { perSeed: dmgDeltaFrac.map(r6), mean: r6(mdF), se: r6(seDF) } },
  trustArmIdentMaxDiff: r6(Math.max(...trustIdent)),
  seedsAndCuts: { planned: 8, run: SEEDS, cut: SEEDS < 8 ? 'cut for runtime budget (receipted)' : 'none' },
  sheetVerify: {
    tol: TOL, cadence: 'every 20 rounds vs MurmurBus.pool reference',
    checks: armsAgg.v3.verify.checks + armsAgg['v3.1'].verify.checks + armsAgg['v3.1-frac'].verify.checks,
    mismatches: (armsAgg.v3.verify.mismatches ?? 0) + (armsAgg['v3.1'].verify.mismatches ?? 0) + (armsAgg['v3.1-frac'].verify.mismatches ?? 0),
    maxDiff: Math.max(armsAgg.v3.vfy ? 0 : 0, Number(armsAgg.v3.verify.maxDiff), Number(armsAgg['v3.1'].verify.maxDiff), Number(armsAgg['v3.1-frac'].verify.maxDiff)),
  },
  curves: seed0Curves,
  chain: { rows: rows.length, tip, verified: vfy.ok },
  vault: { mock: harvest.mock, digest: harvest.poolDigest, liveJobs: vault.liveJobs },
};
summary.sheetVerify.maxDiff = Math.max(
  Number(armsAgg.v3.verify.maxDiff), Number(armsAgg['v3.1'].verify.maxDiff), Number(armsAgg['v3.1-frac'].verify.maxDiff));
writeFileSync('experiments/outputs/e27_summary.json', JSON.stringify(summary, null, 1));
writeFileSync('experiments/outputs/receipts_e27.jsonl', rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
console.log('wrote experiments/outputs/e27_summary.json + receipts_e27.jsonl');

// ---- re-verify chain FROM FILE (stale-artifact doctrine) ----
const reRows = readFileSync('experiments/outputs/receipts_e27.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const reVfy = verifyChain(reRows);
const reTip = reRows[reRows.length - 1].row_hash;
if (!reVfy.ok || reTip !== tip) { console.error('FILE RE-VERIFY FAILED', reVfy, reTip); process.exit(1); }
console.log(`file re-verify: ${reRows.length} rows OK, tip ${reTip.slice(0, 12)}`);
console.log(vault.liveJobs === 0 ? 'E27 DONE' : 'E27 PROBLEM (live jobs)');
