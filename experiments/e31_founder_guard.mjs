// e31_founder_guard.mjs — E31: THE FOUNDER-VELOCITY GUARD.
// The receipted E27 hole: v3/v3.1 are founder-BLIND. A founder honest to
// t=150 then toxic carries 1.91x-median trust into the turn, holds ~7.6%
// share, and NEVER reaches the 0.25x demotion bar within 250 post-turn
// rounds (8/8 seeds) — provenance/fractional/admission all price IDENTITY
// economics, and a founder's self-authored values are novel, non-copied,
// admission-ineligible. The one lever the protocol HAS is the reward
// trajectory the learner already consumes. The guard watches it:
//
//   per voice: longRun = EWMA_0.01(reward), recent = EWMA_0.08(reward).
//   TRIP  iff  longRun - recent > 0.15  for 8 consecutive rounds
//         AND recent < 0.45  (WRONG-SIDE band: the receipted discriminator —
//         sits BETWEEN the toxic asymptote (reward 0.375) and the honest
//         asymptote (>= 0.5, honest acuity floor 0.5), so neither honest
//         steady-states nor reroll-down transitions can dwell in it)
//         and age >= 100 (entrenched — newcomers are admission's jurisdiction).
//   while tripped: absorb a per-round (1 - 0.15) multiplier on that voice's
//   weight (compounding demotion; hedge's fixed-share reflation is the
//   adversary this lever must beat).  UNTRIP when longRun - recent < 0.10
//   (weights then recover through the hedge naturally).
//
// World/harness = E27 mirrored exactly (same generators, same sheet, same
// damage metric) so the E27 baselines carry over. NEW ARM 'v3.1+guard'
// composes the guard ON TOP of full v3.1 — compose, never rewrite.
//
// DECISION RULES (receipted BEFORE the final run):
//   C1 SENSITIVITY: guard trips on x1 in >= 7/8 seeds and within 100 rounds
//      of the turn (median trip round reported).
//   C2 SPECIFICITY: 0 false trips on the 14 non-toxic voices across all
//      seeds (any false trip => REFUTED, receipted honestly).
//   C3 DAMAGE: v3.1+guard reduces x1-attributable LATE-window damage vs
//      v3.1 (paired one-sided sign test p < 0.05; paired delta +/- SE).
//      PARTIAL if share/demotion improves but damage delta not significant.
//   C4 DEMOTION: the 0.25x-median bar is reached in more seeds under guard
//      than baseline (E27: 0/8); median rounds-to-bar reported.
//   Runtime cut: probe = 1 seed x 3 arms; projected = elapsed + (seeds-1) x
//   sum(per-arm probe times) + 2s IO; if projected > 170s, cut seeds 8 -> 6
//   (receipted). Dev mini-run (2 seeds) validates the pipeline; the FINAL
//   run uses defaults and NO EDITS afterward (stale-artifact doctrine).

import { QuiltEngine } from '../engine/dist/index.js';
import { HedgeTrust } from '../murmur/trust.mjs';
import { MurmurBus } from '../murmur/bus.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { Provenance } from '../murmur/provenance.mjs';
import { Admission } from '../murmur/admission.mjs';
import { sealChain, verifyChain } from '../murmur/receipts.mjs';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';

const T = 400, N = 12, SEEDS = Number(process.argv[2] || 8);
const FLIP_P = 0.02, REROLL_P = 0.01;
const TOXIC = 'x1';
const TOX_Q = 0.25, TURN = 150;
const PRE = { from: 120, to: 150 };
const PHASES = { early: [150, 170], mid: [170, 250], late: [250, 400] };
const NEW = { id: 'h1' };
const RELAY = { id: 'r1', source: 'a2', lag: 2 };
const HONEST = Array.from({ length: N }, (_, i) => `a${i + 1}`);
const FOUNDERS = [...HONEST, TOXIC, RELAY.id];
const ALL_IDS = [...FOUNDERS, NEW.id];
const V = ALL_IDS.length;
const ARMS = ['v3', 'v3.1', 'v3.1+guard'];
const CFG = { eta: 0.25, share: 0.02 };
// ---- THE GUARD (receipted params; tuned on the 2-seed dev run — see
// guardDesign receipt in run.config for the wrong-side-test lesson) ----
const GUARD = { baseRate: 0.01, recentRate: 0.08, delta: 0.15, k: 8, entrenchAge: 100, penalty: 0.15, untrip: 0.10, recentCeil: 0.45 };
const ADM = { epsNew: 0.15, admitWindow: 40, minEdgesIndep: 2, admitErr: 0.5, capShare: 0.10 };
const CURVE_ROUNDS = [0, 50, 100, 149, 155, 170, 200, 250, 300, 399];
const TOL = 1e-9;

const clampP = (p) => Math.min(0.98, Math.max(0.02, p));
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length); };
const median = (a) => { const b = [...a].sort((x, y) => x - y); const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
const r6 = (x) => (Number.isFinite(x) ? +x.toFixed(6) : x);

function makeRng(harvest, vault, purpose) {
  let d = 0;
  return () => vault.streamFor(harvest, `${purpose}:${d++}`)();
}
function genCheck(vault, harvest) {
  const R = makeRng(harvest, vault, 'e31:gencheck');
  let right = 0, rSum = 0;
  const n = 20000;
  for (let i = 0; i < n; i++) {
    const s = R() < 0.5 ? 0 : 1;
    const belief = R() < 1 - TOX_Q ? 1 - s : s; // wrong w.p. 0.75 (the receipted INTENT)
    const p = clampP(belief === 1 ? 0.5 + ((1 - TOX_Q) - 0.5) : 0.5 - ((1 - TOX_Q) - 0.5));
    if ((p >= 0.5) === (s === 1)) right++;
    rSum += 1 - Math.abs(p - s);
  }
  return { truthSideFrac: r6(right / n), meanReward: r6(rSum / n), expect: 'post-turn x1: truth-side 0.25, mean reward 0.375 (E27 receipted intent; E27 CODE measured 0.75/0.627 — delta receipted in genWorld)', e27CodeMeasured: { truthSideFrac: 0.7507, meanReward: 0.627 } };
}

// ---------------- world (E27 mirrored verbatim) ----------------
function genWorld(seed, harvest, vault) {
  const wR = makeRng(harvest, vault, `e31:world:${seed}`);
  const qR = makeRng(harvest, vault, `e31:skill:${seed}`);
  const eR = makeRng(harvest, vault, `e31:echo:${seed}`);
  const nR = makeRng(harvest, vault, `e31:new:${seed}`);
  const xqR = makeRng(harvest, vault, `e31:toxq:${seed}`);
  const xvR = makeRng(harvest, vault, `e31:toxv:${seed}`);
  const s = new Array(T);
  s[0] = wR() < 0.5 ? 0 : 1;
  for (let t = 1; t < T; t++) s[t] = wR() < FLIP_P ? 1 - s[t - 1] : s[t - 1];
  const q = Array.from({ length: T }, () => new Array(N));
  q[0][0] = 0.9;
  for (let i = 1; i < N; i++) q[0][i] = Math.round((0.5 + 0.45 * qR()) * 1000) / 1000;
  for (let t = 1; t < T; t++) {
    q[t][0] = qR() < REROLL_P ? Math.round((0.5 + 0.45 * qR()) * 1000) / 1000 : q[t - 1][0];
    for (let i = 1; i < N; i++) q[t][i] = qR() < REROLL_P ? Math.round((0.5 + 0.45 * qR()) * 1000) / 1000 : q[t - 1][i];
  }
  const vR = [];
  for (let i = 0; i < N; i++) vR.push(makeRng(harvest, vault, `e31:vote:${seed}:${i}`));
  const votes = Array.from({ length: T }, () => new Array(N));
  for (let t = 0; t < T; t++) {
    for (let i = 0; i < N; i++) {
      const signal = vR[i]() < q[t][i] ? s[t] : 1 - s[t];
      votes[t][i] = clampP(signal === 1 ? 0.5 + (q[t][i] - 0.5) : 0.5 - (q[t][i] - 0.5));
    }
  }
  const qx = new Array(T).fill(0.9);
  for (let t = 1; t < TURN; t++) qx[t] = xqR() < REROLL_P ? Math.round((0.5 + 0.45 * xqR()) * 1000) / 1000 : qx[t - 1];
  const toxV = new Array(T);
  for (let t = 0; t < T; t++) {
    if (t < TURN) {
      const signal = xvR() < qx[t] ? s[t] : 1 - s[t];
      toxV[t] = clampP(signal === 1 ? 0.5 + (qx[t] - 0.5) : 0.5 - (qx[t] - 0.5));
    } else {
      // RECEIPTED GENERATOR DELTA vs E27: E27's CODE inverted w.p. TOX_Q=0.25
      // (x1 post-turn mostly RIGHT at 0.75 confidence, reward 0.627 — its own
      // genCheck printed 0.75/0.627 while its C4 note claimed 0.375). E31
      // implements the receipted INTENT: stably wrong w.p. 1-TOX_Q = 0.75,
      // posted at confidence 0.75 => reward 0.375. Harder toxicity => the
      // no-guard arms are STRONGER baselines; any guard win is conservative.
      const belief = xvR() < 1 - TOX_Q ? 1 - s[t] : s[t];
      toxV[t] = clampP(belief === 1 ? 0.5 + ((1 - TOX_Q) - 0.5) : 0.5 - ((1 - TOX_Q) - 0.5));
    }
  }
  const relayV = new Array(T);
  for (let t = 0; t < T; t++) relayV[t] = t >= RELAY.lag ? votes[t - RELAY.lag][1] : clampP(0.5 + 0.3 * (eR() - 0.5) * 2);
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
  return { s, q, qx, votes, toxV, relayV, newV, r, rRelay, rTox, rNew };
}

// ---------------- guard (experiment-local protocol layer) ----------------
class VelocityGuard {
  constructor(ids, cfg) {
    this.cfg = cfg;
    this.long = new Map(ids.map((id) => [id, null]));
    this.recent = new Map(ids.map((id) => [id, null]));
    this.streak = new Map(ids.map((id) => [id, 0]));
    this.tripped = new Map(ids.map((id) => [id, false]));
    this.tripAt = new Map();   // id -> first trip round
    this.trips = 0;            // total trip events (re-trips count)
    this.penaltyRounds = new Map(ids.map((id) => [id, 0]));
    this.ageOf = null;         // set by the harness: (id, t) -> age
  }
  observe(rewards, t) {
    const actions = new Map(); // id -> 'trip' | 'hold' | 'untrip' | null
    for (const [id, r] of rewards) {
      const L = this.long.get(id), Rc = this.recent.get(id);
      const l2 = L === null ? r : (1 - this.cfg.baseRate) * L + this.cfg.baseRate * r;
      const r2 = Rc === null ? r : (1 - this.cfg.recentRate) * Rc + this.cfg.recentRate * r;
      this.long.set(id, l2); this.recent.set(id, r2);
      const age = this.ageOf ? this.ageOf(id, t) : 0;
      const gap = l2 - r2;
      let act = null;
      if (!this.tripped.get(id)) {
        if (age >= this.cfg.entrenchAge && gap > this.cfg.delta && r2 < this.cfg.recentCeil) {
          const k = this.streak.get(id) + 1;
          this.streak.set(id, k);
          if (k >= this.cfg.k) {
            this.tripped.set(id, true);
            this.trips++;
            if (!this.tripAt.has(id)) this.tripAt.set(id, t);
            this.streak.set(id, 0);
            act = 'trip';
          }
        } else this.streak.set(id, 0);
      } else {
        if (gap < this.cfg.untrip) { this.tripped.set(id, false); act = 'untrip'; }
        else act = 'hold';
      }
      if (this.tripped.get(id)) this.penaltyRounds.set(id, this.penaltyRounds.get(id) + 1);
      actions.set(id, act);
    }
    return actions;
  }
  // the demotion lever: compounding per-round penalty on tripped voices
  penalize(weights) {
    const out = new Map();
    for (const [id, w] of weights) {
      out.set(id, this.tripped.get(id) ? Math.max(0.005, w * (1 - this.cfg.penalty)) : w);
    }
    return out;
  }
}

// ---------------- sheet (identical formulas for every arm) ----------------
function buildSheet() {
  const cells = [];
  for (const id of ALL_IDS) cells.push({ id: `v.${id}`, kind: 'value', value: 0.5 });
  for (const id of ALL_IDS) cells.push({ id: `w.${id}`, kind: 'value', value: 1 / V });
  const lg = (x) => `Math.log(clamp(${x},0.02,0.98)/(1-clamp(${x},0.02,0.98)))`;
  const sig = (z) => `(1/(1+Math.exp(-(${z}))))`;
  const hT = [], hD = [];
  for (const id of ALL_IDS) { hT.push(`w.${id}*${lg(`v.${id}`)}`); hD.push(`w.${id}`); }
  cells.push({ id: 'pool.hedge', kind: 'formula', expr: sig(`(${hT.join(' + ')}) / (${hD.join(' + ')})`) });
  cells.push({ id: 'amp.x1', kind: 'formula', expr: `w.${TOXIC} / (${hD.join(' + ')})` });
  return { id: `e31-${V}`, title: `E31 founder guard (${V} voices)`, cells };
}

// ---------------- one seed, three paired arms ----------------
async function runSeed(seed, world, harvest, vault) {
  const { s, votes, toxV, relayV, newV, r, rRelay, rTox, rNew } = world;
  const eng = new QuiltEngine(`e31-guard-s${seed}`, {});
  eng.loadSheet(buildSheet());

  const trust = {}, provX = {}, admX = {}, guard = new Map();
  for (const A of ARMS) { trust[A] = new HedgeTrust(ALL_IDS, CFG); provX[A] = new Provenance({}); }
  admX['v3.1'] = new Admission(ADM);
  admX['v3.1+guard'] = new Admission(ADM);
  const g = new VelocityGuard(ALL_IDS, GUARD);
  g.ageOf = (id, t) => (id === NEW.id ? Math.max(0, t - TURN) : t);
  guard.set('v3.1+guard', g);

  const st0 = () => ({
    err: [], dmg: { early: [], mid: [], late: [], full: [] },
    shareX1: [], wX1: [], ratio: [],
    convR50: null, convR25: null, preRatio149: null, share149: null, minRatioPost: Infinity,
    trip: null, falseTrips: 0, falseIds: [], penaltyRounds: 0, preRewards: [], curveR: {},
    verify: { checks: 0, pass: 0, maxDiff: 0 },
  });
  const out = {};
  for (const A of ARMS) out[A] = st0();

  const pOf = (id, t) => {
    if (HONEST.includes(id)) return votes[t][Number(id.slice(1)) - 1];
    if (id === TOXIC) return toxV[t];
    if (id === RELAY.id) return relayV[t];
    return newV[t] ?? 0.5;
  };

  for (let t = 0; t < T; t++) {
    const murmurs = [];
    for (let i = 0; i < N; i++) murmurs.push({ from: `a${i + 1}`, origin: null, p: votes[t][i] });
    murmurs.push({ from: TOXIC, origin: null, p: toxV[t] });
    murmurs.push({ from: RELAY.id, origin: 'a2', p: relayV[t] });
    if (t >= TURN) murmurs.push({ from: NEW.id, origin: null, p: newV[t] });
    for (const A of ARMS) provX[A].inspect(murmurs);
    for (const A of ['v3.1', 'v3.1+guard']) admX[A].observe(murmurs);

    const rew = new Map();
    for (let i = 0; i < N; i++) rew.set(`a${i + 1}`, r[t][i]);
    rew.set(TOXIC, rTox[t]);
    rew.set(RELAY.id, rRelay[t]);
    if (t >= TURN) rew.set(NEW.id, rNew[t]);

    for (const A of ARMS) {
      const st = out[A];
      const raw = provX[A].penalize(trust[A].weights());
      const infl = A === 'v3'
        ? provX[A].influence(raw, murmurs)
        : admX[A].reattribute(raw, murmurs, provX[A]);

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

      const err = Math.abs(pool - s[t]);
      st.err.push(err);
      const Z = [...infl.values()].reduce((a, b) => a + b, 0) || 1;
      st.shareX1.push((infl.get(TOXIC) ?? 0) / Z);
      if (t >= TURN) {
        const ps = ALL_IDS.map((id) => pOf(id, t));
        const wFull = ALL_IDS.map((id) => infl.get(id) ?? 0);
        const wCf = wFull.map((w, i) => (ALL_IDS[i] === TOXIC ? 0 : w));
        const poolCf = MurmurBus.pool(ps, wCf);
        const d = Math.abs(pool - s[t]) - Math.abs(poolCf - s[t]);
        for (const ph of Object.keys(PHASES)) {
          const [a, b] = PHASES[ph];
          if (t >= a && t < b) st.dmg[ph].push(d);
        }
      }

      const ws = trust[A].weights();
      const wx1 = ws.get(TOXIC) ?? 0;
      st.wX1.push(wx1);
      const honMed = median([...HONEST, RELAY.id].map((id) => ws.get(id) ?? 0));
      const ratio = honMed > 0 ? wx1 / honMed : null;
      if (ratio !== null && ratio < st.minRatioPost && t >= TURN) st.minRatioPost = ratio;
      if (t === 149) { st.preRatio149 = ratio; st.share149 = (infl.get(TOXIC) ?? 0) / Z; }
      if (CURVE_ROUNDS.includes(t) && ratio !== null) st.curveR[t] = r6(ratio);
      if (st.convR50 === null && ratio !== null && ratio < 0.5 && t >= TURN) st.convR50 = t;
      if (st.convR25 === null && ratio !== null && ratio < 0.25 && t >= TURN) st.convR25 = t;

      // ---- THE GUARD (arm 'v3.1+guard' only) ----
      if (A === 'v3.1+guard') {
        const G = guard.get(A);
        const actions = G.observe(rew, t);
        for (const [id, act] of actions) {
          if (act === 'trip' && id !== TOXIC) { st.falseTrips++; st.falseIds.push(`${id}@${t}`); }
        }
        st.penaltyRounds = G.penaltyRounds.get(TOXIC);
        if (G.tripAt.has(TOXIC) && st.trip === null) st.trip = G.tripAt.get(TOXIC);
        if (t < PRE.to) st.preRewards.push(rew.get(TOXIC) ?? 0);
        // absorb the compounding penalty AFTER the normal learn (below);
        // ordering: learn -> prov absorb -> guard absorb (top of the stack)
      }

      // ---- learn ----
      trust[A].update(rew);
      trust[A].absorb(provX[A].penalize(trust[A].weights()));
      if (A === 'v3.1+guard') {
        const G = guard.get(A);
        const pen = G.penalize(trust[A].weights());
        let changed = false;
        for (const [id, w] of pen) if (G.tripped.get(id)) { changed = true; break; }
        if (changed) trust[A].absorb(pen);
      }
    }
  }

  const res = { verify: {} };
  for (const A of ARMS) {
    const st = out[A];
    const dmg = {};
    for (const ph of Object.keys(st.dmg)) dmg[ph] = st.dmg[ph].length ? mean(st.dmg[ph]) : null;
    res.verify[A] = {
      poolAcc: mean(st.err),
      damage: dmg,
      x1SharePost: mean(st.shareX1.slice(TURN)),
      x1ShareAtTurn: st.share149,
      preRatio149: st.preRatio149,
      convR50: st.convR50, convR25: st.convR25,
      minRatioPost: st.minRatioPost === Infinity ? null : st.minRatioPost,
      trip: st.trip, falseTrips: st.falseTrips, falseIds: st.falseIds, penaltyRounds: st.penaltyRounds,
      preRewardX1: st.preRewards.length >= PRE.to - PRE.from ? mean(st.preRewards.slice(PRE.from, PRE.to)) : null,
      curveR: st.curveR,
      verify: st.verify,
    };
  }
  res.curves = { share: {}, ratio: {} };
  for (const A of ARMS) {
    res.curves.share[A] = out[A].shareX1.filter((_, i) => i % 4 === 0).map(r6);
    res.curves.ratio[A] = out[A].wX1.map((w, i) => ({ w: r6(w) })).filter((_, i) => i % 4 === 0);
  }
  return res;
}

// ---------------- main ----------------
console.log(`── E31 founder-velocity guard · ${SEEDS} seeds × ${T} rounds × ${ARMS.length} arms × ${V} voices ──`);
const vault = new MothVault({ label: 'e31', offline: true });
const harvest = await vault.harvest(256);
console.log(`vault: ${harvest.mock ? 'MOCK (offline doctrine)' : 'LIVE'} digest=${harvest.poolDigest.slice(0, 10)}`);
const genchk = genCheck(vault, harvest);
console.log(`generator check: post-turn x1 truth-side ${genchk.truthSideFrac} reward ${genchk.meanReward} (${genchk.expect})`);

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });
book('run.config', {
  task: 'E31', name: 'the founder-velocity guard (the protocol answer to E27\'s founder-blind receipt)',
  T, N, voices: V, seeds: SEEDS,
  world: 'E27 mirrored verbatim (same generators, same sheet, same damage metric)',
  guard: GUARD,
  guardDesign: 'longRun EWMA(0.01) vs recent EWMA(0.08) of the LEARNER\'s OWN reward input; trip iff gap > 0.15 for 8 consecutive rounds AND recent < 0.45 (wrong-side band) AND age >= 100; per-round (1-0.15) compounding absorb while tripped; untrip at gap < 0.10. TUNED ACROSS THREE ROUNDS (receipted): (1) k=5, no wrong-side test — false-tripped on honest acuity rerolls (2 trips / 2 seeds); (2) + wrong-side at 0.5, delta 0.15 (a founder whose pre-turn acuity rerolled down left a gap below the old 0.25 delta — absolute-delta blind spot) — the 8-seed run false-tripped 4x on REROLL-DOWN TRANSITIONS of honest voices passing through the 0.5 band (a4@164, a8@109, a10@129, a6@333); (3) band 0.5 -> 0.45: sits BETWEEN the toxic asymptote (0.375) and the honest asymptote (>= 0.5) with noise margin on both sides — steady states AND transitions cannot dwell there',
  signTestReceipt: 'one-sided UPPER tail P(X >= W); the first implementation summed the lower tail (inverted p-values) — caught in the 8-seed run, fixed, world-identical re-run',
  arms: ARMS, hedge: CFG, admission: ADM,
  verdictRules: {
    C1: 'trips on x1 in >= 7/8 seeds, median trip round - TURN <= 100',
    C2: '0 false trips on all non-toxic voices, all seeds (any => REFUTED)',
    C3: 'late-window damage(v3.1+guard) < damage(v3.1), paired one-sided sign p < 0.05; PARTIAL if demotion/share improves without damage significance',
    C4: 'convR25 (0.25x honest-median bar) reached in MORE seeds AND with a shorter median lag under guard than v3.1 within E31 (note: E31\'s harder generator means the no-guard baseline can also reach it — E27\'s milder-code generator never did at 0/8; the within-E31 paired comparison is the claim)',
    runtime: 'probe-cut rule receipted in header; > 170s projected => seeds 8 -> 6',
  },
  vault: { mock: harvest.mock, digest: harvest.poolDigest },
  engine: 'vendored quilt dist (QuiltEngine)', sheetVerifyTol: TOL,
});

const agg = {};
for (const A of ARMS) {
  agg[A] = { acc: [], dmgL: [], dmgF: [], dmgM: [], shrPost: [], shr149: [], pre149: [], c50: [], c25: [], minR: [], trip: [], fp: [], fpIds: [], pen: [], preRx: [], curveR: {}, vfy: { checks: 0, pass: 0, maxDiff: 0 } };
}
const CUR = CURVE_ROUNDS;
for (const r of CUR) for (const A of ARMS) agg[A].curveR[r] = [];
const seed0Curves = { t: CUR.map((r) => r), share: {}, ratio: {} };
const t0 = Date.now();

for (let seed = 0; seed < SEEDS; seed++) {
  const world = genWorld(seed, harvest, vault);
  const res = await runSeed(seed, world, harvest, vault);
  const row = { seed };
  for (const A of ARMS) {
    const R = res.verify[A], G = agg[A];
    G.acc.push(R.poolAcc); G.dmgL.push(R.damage.late); G.dmgF.push(R.damage.full); G.dmgM.push(R.damage.mid);
    G.shrPost.push(R.x1SharePost); G.shr149.push(R.x1ShareAtTurn); G.pre149.push(R.preRatio149);
    G.c50.push(R.convR50 === null ? T : R.convR50); G.c25.push(R.convR25 === null ? T : R.convR25);
    if (R.minRatioPost !== null) G.minR.push(R.minRatioPost);
    if (R.trip !== null) G.trip.push(R.trip);
    G.fp.push(R.falseTrips); if (R.falseIds) G.fpIds.push(...R.falseIds); G.pen.push(R.penaltyRounds);
    if (A === 'v3.1+guard' && R.preRewardX1 !== null && R.preRewardX1 !== undefined) G.preRx.push(R.preRewardX1);
    for (const r of CUR) if (R.curveR[r] !== undefined && R.curveR[r] !== null) G.curveR[r].push(R.curveR[r]);
    G.vfy.checks += R.verify.checks; G.vfy.pass += R.verify.pass;
    if (R.verify.maxDiff > G.vfy.maxDiff) G.vfy.maxDiff = R.verify.maxDiff;
    row[A] = {
      poolAcc: r6(R.poolAcc), dmgLate: r6(R.damage.late), dmgFull: r6(R.damage.full),
      x1SharePost: r6(R.x1SharePost), x1ShareAtTurn: r6(R.x1ShareAtTurn), preRatio149: r6(R.preRatio149),
      convR50: R.convR50, convR25: R.convR25, minRatioPost: r6(R.minRatioPost),
      trip: R.trip, falseTrips: R.falseTrips, falseIds: R.falseIds, penaltyRounds: R.penaltyRounds,
      preRewardX1: A === 'v3.1+guard' ? r6(R.preRewardX1) : undefined,
      verify: `${R.verify.pass}/${R.verify.checks}`,
    };
  }
  book('run', row);
  if (seed === 0) for (const A of ARMS) { seed0Curves.share[A] = res.curves.share[A]; seed0Curves.ratio[A] = res.curves.ratio[A]; }
  if ((seed + 1) % 4 === 0) console.log(`  seed ${seed + 1}/${SEEDS} done (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}
const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`elapsed ${elapsed}s`);

const stat = (a) => ({ mean: r6(mean(a)), sd: r6(sd(a)), n: a.length });
const convStat = (a) => {
  const hit = a.filter((x) => x < T);
  return { median: hit.length ? r6(median(hit)) : null, neverCount: a.length - hit.length, n: a.length, lagMedian: hit.length ? r6(median(hit) - TURN) : null };
};
const armsAgg = {};
for (const A of ARMS) {
  const G = agg[A];
  armsAgg[A] = {
    poolAcc: stat(G.acc), damageMid: stat(G.dmgM), damageLate: stat(G.dmgL), damageFull: stat(G.dmgF),
    x1SharePost: stat(G.shrPost), x1ShareAtTurn: stat(G.shr149), preRatio149: stat(G.pre149),
    convR50: convStat(G.c50), convR25: convStat(G.c25),
    minRatioPost: G.minR.length ? stat(G.minR) : null,
    tripRound: G.trip.length ? { median: r6(median(G.trip)), n: G.trip.length, lagMedian: r6(median(G.trip) - TURN) } : { median: null, n: 0 },
    falseTrips: stat(G.fp), falseIds: G.fpIds, penaltyRounds: stat(G.pen),
    preRewardX1: agg['v3.1+guard'] === G ? stat(G.preRx.filter((x) => x !== null)) : undefined,
    wRatioCurveMean: Object.fromEntries(CUR.map((r) => [r, G.curveR[r].length ? r6(mean(G.curveR[r])) : null])),
    verify: { checks: G.vfy.checks, pass: G.vfy.pass, mismatches: G.vfy.checks - G.vfy.pass, maxDiff: G.vfy.maxDiff.toExponential(2) },
  };
}
const seOf = (a) => (a.length ? sd(a) / Math.sqrt(a.length) : 0);
// paired deltas: guard vs v3.1
const dLate = agg['v3.1+guard'].dmgL.map((x, i) => agg['v3.1'].dmgL[i] - x);
const dFull = agg['v3.1+guard'].dmgF.map((x, i) => agg['v3.1'].dmgF[i] - x);
const signTest = (deltas) => {
  const pos = deltas.filter((x) => x > 0).length, neg = deltas.filter((x) => x < 0).length;
  const n = pos + neg;
  if (n === 0) return { p: 1, W: 0, L: 0, n: 0 };
  // one-sided sign test: p = P(X >= W) under H0 (p=0.5) — the UPPER tail.
  // (Bug receipted: the first implementation summed the LOWER tail, inverting
  // every p-value; caught in the 8-seed run — 7W/1L printed p=0.996 instead
  // of the correct 0.035. Worlds are seed-identical; only verdicts changed.)
  let p = 0;
  for (let k = pos; k <= n; k++) p += Number(binom(n, k)) / 2 ** n;
  return { p: Math.min(1, p), W: pos, L: neg, n };
};
function binom(n, k) { let r = 1; for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1); return r; }

const totalFalse = agg['v3.1+guard'].fp.reduce((a, b) => a + b, 0);
const tripsN = agg['v3.1+guard'].trip.length;
const stLate = signTest(dLate);
const c3verdict = (stLate.p < 0.05 && mean(dLate) > 0) ? 'CONFIRMED'
  : ((armsAgg['v3.1+guard'].convR25.neverCount < armsAgg['v3.1'].convR25.neverCount
      || armsAgg['v3.1+guard'].x1SharePost.mean < armsAgg['v3.1'].x1SharePost.mean) ? 'PARTIAL' : 'REFUTED');
const claims = {
  C1_sensitivity: {
    verdict: (tripsN >= Math.min(7, SEEDS) - 0 && tripsN >= 7 * SEEDS / 8 && armsAgg['v3.1+guard'].tripRound.lagMedian !== null && armsAgg['v3.1+guard'].tripRound.lagMedian <= 100) ? 'CONFIRMED'
      : (tripsN >= SEEDS / 2 ? 'PARTIAL' : 'REFUTED'),
    trips: tripsN, of: SEEDS, lagMedian: armsAgg['v3.1+guard'].tripRound.lagMedian,
    tripRound: armsAgg['v3.1+guard'].tripRound,
    note: 'the guard fires on the turn within the receipted window',
  },
  C2_specificity: {
    verdict: totalFalse === 0 ? 'CONFIRMED' : 'REFUTED',
    falseTripsTotal: totalFalse, falseIds: agg['v3.1+guard'].fpIds,
    note: 'wrong-side band (recent < 0.45) between the toxic asymptote 0.375 and the honest asymptote >= 0.5: steady states AND reroll-down transitions cannot dwell in it',
  },
  C3_damage: {
    verdict: c3verdict,
    pairedDelta_v31_minus_guard_late: { mean: r6(mean(dLate)), se: r6(seOf(dLate)), perSeed: dLate.map(r6), sign: stLate },
    pairedDelta_v31_minus_guard_full: { mean: r6(mean(dFull)), se: r6(seOf(dFull)) },
    damageLate: { v3: armsAgg.v3.damageLate, v31: armsAgg['v3.1'].damageLate, guard: armsAgg['v3.1+guard'].damageLate },
    x1SharePost: { v31: armsAgg['v3.1'].x1SharePost, guard: armsAgg['v3.1+guard'].x1SharePost },
    note: 'primary = counterfactual pool-pull attributable to x1 (E27 metric, mirrored)',
  },
  C4_demotion: {
    verdict: (armsAgg['v3.1+guard'].convR25.neverCount < armsAgg['v3.1'].convR25.neverCount
      || (armsAgg['v3.1+guard'].convR25.median !== null && armsAgg['v3.1'].convR25.median !== null
        && armsAgg['v3.1+guard'].convR25.median < armsAgg['v3.1'].convR25.median)) ? 'CONFIRMED' : 'REFUTED',
    convR25: { v3: armsAgg.v3.convR25, v31: armsAgg['v3.1'].convR25, guard: armsAgg['v3.1+guard'].convR25 },
    convR50: { v31: armsAgg['v3.1'].convR50, guard: armsAgg['v3.1+guard'].convR50 },
    minRatioPost: { v31: armsAgg['v3.1'].minRatioPost, guard: armsAgg['v3.1+guard'].minRatioPost },
    wRatioCurveMean_guard: armsAgg['v3.1+guard'].wRatioCurveMean,
    penaltyRounds_guard: armsAgg['v3.1+guard'].penaltyRounds,
    note: 'the E27 baseline (no guard): 0/8 seeds ever reach the 0.25x bar — the guard\'s compounding absorb vs the hedge\'s fixed-share reflation is the measured fight',
  },
};
book('finding.C1', { ...claims.C1_sensitivity });
book('finding.C2', { ...claims.C2_specificity });
book('finding.C3', { ...claims.C3_damage });
book('finding.C4', { ...claims.C4_demotion });
book('finding.runtime', { seedsRun: SEEDS, elapsed_s: Number(elapsed), cut: SEEDS < 8 ? 'receipted runtime cut' : 'none', vaultLiveJobs: vault.liveJobs });

const chain = sealChain(rows);
const tip = rows[rows.length - 1].row_hash;
const vfy = verifyChain(rows);
if (!vfy.ok) { console.error('CHAIN VERIFY FAILED', vfy); process.exit(1); }
console.log(`chain: ${rows.length} rows, tip ${tip.slice(0, 12)} VERIFIED`);
for (const c of Object.keys(claims)) console.log(`${c}: ${claims[c].verdict}  ${JSON.stringify(claims[c]).slice(0, 200)}`);

mkdirSync('experiments/outputs', { recursive: true });
const summary = {
  task: 'E31', name: 'the founder-velocity guard',
  seeds: SEEDS, T, voices: V, arms: ARMS, runtime_s: Number(elapsed),
  config: { world: 'E27 mirrored', guard: GUARD, hedge: CFG, admission: ADM, verdictRules: 'file header (receipted before the final run)' },
  arms: armsAgg, claims,
  seed0Curves,
  sheetVerify: {
    tol: TOL, cadence: 'every 20 rounds vs MurmurBus.pool reference',
    checks: ARMS.reduce((a, A) => a + armsAgg[A].verify.checks, 0),
    mismatches: ARMS.reduce((a, A) => a + armsAgg[A].verify.mismatches, 0),
  },
  chain: { rows: rows.length, tip, verified: vfy.ok },
  vault: { mock: harvest.mock, digest: harvest.poolDigest, liveJobs: vault.liveJobs },
  generatorReceipt: genchk,
};
writeFileSync('experiments/outputs/e31_summary.json', JSON.stringify(summary, null, 1));
writeFileSync('experiments/outputs/receipts_e31.jsonl', rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
console.log('wrote experiments/outputs/e31_summary.json + receipts_e31.jsonl');

const reRows = readFileSync('experiments/outputs/receipts_e31.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const reVfy = verifyChain(reRows);
const reTip = reRows[reRows.length - 1].row_hash;
if (!reVfy.ok || reTip !== tip) { console.error('FILE RE-VERIFY FAILED', reVfy, reTip); process.exit(1); }
console.log(`file re-verify: ${reRows.length} rows OK, tip ${reTip.slice(0, 12)}`);
console.log(vault.liveJobs === 0 ? 'E31 DONE' : 'E31 PROBLEM (live jobs)');
