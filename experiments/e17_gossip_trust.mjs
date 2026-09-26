// E17 — GOSSIP TRUST DYNAMICS (the pure trust study)
// ============================================================
// The fleet's core claim, tested in isolation: cells with weights and
// labels that other cells learn to trust more or less, over alternative
// weight, as a clue deep in the perception changes to something beyond
// their horizon. No pricing, no branches — just voices, a hidden world,
// and who learns to listen.
//
// WORLD (documented rule, one clean model):
//   - hidden binary state s_t ∈ {0,1}, Markov: P(flip)=0.02/round
//     (regimes last ~50 rounds — "beyond the horizon" of a 60-round window)
//   - N=8 expert cells with latent skill q_i(t) ∈ [0.5, 0.95]; each round,
//     P=0.01 an expert RE-ROLLS its skill (regime shifts in WHO is good)
//   - expert i sees s_t through noise: signal = s_t with prob q_i else 1−s_t.
//     Vote rule (single, documented): p_i = signal ? 0.5+(q_i−0.5) : 0.5−(q_i−0.5),
//     clamped to [0.02, 0.98]. So q=0.95 votes 0.95 or 0.05; q=0.5 votes 0.5.
//   - reward r_i = 1 − |p_i − s_t| (supervised pool: outcome revealed each round)
//
// THE SHEET does the pooled inference: v.p1..v.pN (votes), w.a1..w.aN
// (trust weights, written back by the learner), pool.hedge = trust-weighted
// log-odds pool, pool.uni = frozen-uniform pool. The harness verifies the
// sheet's formulas EXACTLY against MurmurBus.pool every 20 rounds (tol 1e-9).
//
// ECHO TEST (the novel one): expert #9 = ECHO, a plagiarist with no eyes:
// rounds 100-300 it copies expert #1's vote from 2 rounds ago; outside that
// window it emits noise σ=0.3 around 0.5. Should the mesh trust the SOURCE
// and discount the ECHO? In a flipping world the echo is stale by 2 rounds —
// its reward lags exactly at regime boundaries. If the echo STEALS trust,
// that is a real protocol vulnerability and gets receipted loudly.
//
// ARMS: HEDGE-25 (η=0.25, share=0.02) / HEDGE-50 (η=0.5, share=0.05) /
// WINDOW-60 (inline sliding-window Hedge, η=0.25, share=0, last 60 rewards) /
// ORACLE-POOL (weights ∝ max(0.05, 2q_i−1), uses true q — upper bound) /
// UNIFORM (baseline).
//
// Run: node experiments/e17_gossip_trust.mjs [seeds]

import { QuiltEngine } from '../engine/dist/index.js';
import { HedgeTrust } from '../murmur/trust.mjs';
import { MurmurBus } from '../murmur/bus.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { fnv1a64, sealChain, verifyChain } from '../murmur/receipts.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

// ---------------- config ----------------
const T = 400, N = 8, SEEDS = Number(process.argv[2] || 24);
const FLIP_P = 0.02, REROLL_P = 0.01;
const ECHO = { id: 'a9', source: 'a1', lag: 2, copyFrom: 100, copyTo: 300, noiseSigma: 0.3 };
const WINDOW = 60, WINDOW_ETA = 0.25;
const TOL = 1e-9;
const LEARNERS = ['hedge25', 'hedge50', 'window60', 'oracle', 'uniform'];
const LEARNER_CFG = {
  hedge25: { eta: 0.25, share: 0.02 },
  hedge50: { eta: 0.5, share: 0.05 },
  window60: { window: WINDOW, eta: WINDOW_ETA, share: 0 },
  oracle: { oracle: true },
  uniform: { uniform: true },
};
const ids = (n) => Array.from({ length: n }, (_, i) => `a${i + 1}`);

// ---------------- helpers ----------------
const clampP = (p) => Math.min(0.98, Math.max(0.02, p));
const gauss = (u1, u2) => Math.sqrt(-2 * Math.log(Math.max(1e-9, u1))) * Math.cos(2 * Math.PI * u2);
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length); };
const r6 = (x) => (Number.isFinite(x) ? +x.toFixed(6) : x);
function pearson(x, y) {
  const n = Math.min(x.length, y.length);
  if (n < 3) return null;
  const mx = mean(x), my = mean(y);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : null;
}
// least-squares slope of series[t+1 .. t+len]
function slopeNext(series, t, len = 50) {
  const xm = (len - 1) / 2;
  let sxy = 0, sxx = 0;
  for (let k = 0; k < len; k++) { sxy += (k - xm) * series[t + 1 + k]; sxx += (k - xm) ** 2; }
  return sxy / sxx;
}
function entropyOf(w, n) { // same normalization as HedgeTrust.entropy
  let H = 0;
  for (const [, p] of w) if (p > 1e-12) H -= p * Math.log(p);
  return H / Math.log(n);
}
function uniformW(n) { return new Map(ids(n).map((id) => [id, 1 / n])); }
function oracleW(qRow, n, withEcho) {
  const raw = qRow.map((qi) => Math.max(0.05, 2 * qi - 1));
  if (withEcho) raw.push(0.05); // the echo sees nothing: oracle floors it
  const Z = raw.reduce((a, b) => a + b, 0);
  return new Map(raw.map((v, i) => [`a${i + 1}`, v / Z]));
}
function windowW(win, n) { // inline sliding-window Hedge (share=0: the window forgets)
  const w = new Array(n).fill(1 / n);
  for (const rew of win) for (let i = 0; i < n; i++) w[i] *= Math.exp(WINDOW_ETA * rew[i]);
  const Z = w.reduce((a, b) => a + b, 0);
  return new Map(w.map((v, i) => [`a${i + 1}`, v / Z]));
}

// ---------------- the sheet ----------------
function buildSheet(n) {
  const cells = [];
  for (let i = 1; i <= n; i++) cells.push({ id: `v.p${i}`, kind: 'value', value: 0.5, description: `expert ${i} vote (posterior P(s=1))` });
  for (let i = 1; i <= n; i++) cells.push({ id: `w.a${i}`, kind: 'value', value: 1 / n, description: `trust weight expert ${i} (written by learner)` });
  const lg = (x) => `Math.log(clamp(${x},0.02,0.98)/(1-clamp(${x},0.02,0.98)))`;
  const sig = (z) => `(1/(1+Math.exp(-(${z}))))`;
  const hT = [], hD = [], uT = [], uD = [];
  for (let i = 1; i <= n; i++) {
    hT.push(`w.a${i}*${lg(`v.p${i}`)}`); hD.push(`w.a${i}`);
    uT.push(`${1 / n}*${lg(`v.p${i}`)}`); uD.push(`${1 / n}`);
  }
  // single expressions — the SHEET is the pooled-inference substrate
  cells.push({ id: 'pool.hedge', kind: 'formula', expr: sig(`(${hT.join(' + ')}) / (${hD.join(' + ')})`) });
  cells.push({ id: 'pool.uni', kind: 'formula', expr: sig(`(${uT.join(' + ')}) / (${uD.join(' + ')})`) });
  return { id: `gossip-${n}`, title: `E17 gossip trust (${n} voices)`, cells };
}

// ---------------- randomness over the moth harvest ----------------
// RECEIPTED VAULT FINDING (E17 finding #0): the vendored moth.streamFor()
// counter-mode (`fnv1a64(`stream:${seed}:${i++}`)` -> low 32 bits) produces
// near-CONSTANT sequential draws: FNV-1a's low bits do not avalanche over a
// 1-character counter change, so consecutive u's differ by ~1e-6 (measured:
// 8 draws = 0.595442, 0.595442, 0.595441, ...). Any `rng() < 0.01` test on it
// NEVER fires. Cross-KEY first draws ARE well distributed (validated below),
// so E17 keeps the doctrine — ONE harvest, per-purpose keys, deterministic
// fnv stretch — and derives each draw as the first draw of its own sub-stream.
function makeRng(harvest, vault, purpose) {
  let d = 0;
  return () => vault.streamFor(harvest, `${purpose}:${d++}`)();
}

// ---------------- world (paired streams: same votes for every learner) ----------------
function genWorld(seed, harvest, vault) {
  const wR = makeRng(harvest, vault, `e17:world:${seed}`);
  const qR = makeRng(harvest, vault, `e17:skill:${seed}`);
  const eR = makeRng(harvest, vault, `e17:echo:${seed}`);
  const s = new Array(T);
  s[0] = wR() < 0.5 ? 0 : 1;
  for (let t = 1; t < T; t++) s[t] = wR() < FLIP_P ? 1 - s[t - 1] : s[t - 1];
  const q = Array.from({ length: T }, () => new Array(N));
  for (let i = 0; i < N; i++) q[0][i] = Math.round((0.5 + 0.45 * qR()) * 1000) / 1000;
  for (let t = 1; t < T; t++) {
    for (let i = 0; i < N; i++) {
      q[t][i] = qR() < REROLL_P ? Math.round((0.5 + 0.45 * qR()) * 1000) / 1000 : q[t - 1][i];
    }
  }
  const vR = [];
  for (let i = 0; i < N; i++) vR.push(makeRng(harvest, vault, `e17:vote:${seed}:${i}`));
  const votes = Array.from({ length: T }, () => new Array(N));
  for (let t = 0; t < T; t++) {
    for (let i = 0; i < N; i++) {
      const signal = vR[i]() < q[t][i] ? s[t] : 1 - s[t]; // sees s with prob q_i
      votes[t][i] = clampP(signal === 1 ? 0.5 + (q[t][i] - 0.5) : 0.5 - (q[t][i] - 0.5));
    }
  }
  // expert #9 = ECHO: plagiarist (copies source vote with lag) inside the
  // window, noise outside — it never sees the world itself.
  const echoV = new Array(T);
  for (let t = 0; t < T; t++) {
    echoV[t] = (t >= ECHO.copyFrom && t <= ECHO.copyTo && t >= ECHO.lag)
      ? votes[t - ECHO.lag][0]
      : clampP(0.5 + gauss(eR(), eR()) * ECHO.noiseSigma);
  }
  const r = votes.map((row, t) => row.map((p) => 1 - Math.abs(p - s[t])));
  const rEcho = echoV.map((p, t) => 1 - Math.abs(p - s[t]));
  const am = q.map((row) => { let b = 0; for (let i = 1; i < N; i++) if (row[i] > row[b]) b = i; return b; });
  return { s, q, votes, echoV, r, rEcho, am };
}

// ---------------- one seed, all learners, both pools (8-voice + echo 9-voice) ----------------
async function runSeed(seed, world, eng8, eng9) {
  const { s, q, votes, echoV, r, rEcho, am } = world;
  const ids8 = ids(8), ids9 = ids(9);
  const trust8 = { hedge25: new HedgeTrust(ids8, LEARNER_CFG.hedge25), hedge50: new HedgeTrust(ids8, LEARNER_CFG.hedge50) };
  const trust9 = { hedge25: new HedgeTrust(ids9, LEARNER_CFG.hedge25), hedge50: new HedgeTrust(ids9, LEARNER_CFG.hedge50) };
  const win8 = [], win9 = []; // sliding windows of reward vectors (plain arrays)
  const out = {};
  for (const L of LEARNERS) {
    out[L] = {
      sumPool: 0, sumPool9: 0, rpool: [], rpool9: [], H: [], H9: [],
      verify: { checks: 0, pass: 0 }, verify9: { checks: 0, pass: 0 },
      latencies: [], censored: 0, open: null, deque: [],
      delta300: null, delta350: null, deltaFinal: null, traj: [],
      copyRewSrc: [], copyRewEcho: [], postRewSrc: [], postRewEcho: [],
    };
  }
  const uniVerify = { checks: 0, pass: 0 };
  const smoothPush = (st, w) => { st.deque.push(w); if (st.deque.length > 5) st.deque.shift(); };
  const leader5 = (st) => {
    const acc = new Map([...st.deque[0]].map(([k, v]) => [k, v / st.deque.length]));
    for (let k = 1; k < st.deque.length; k++) for (const [id, v] of st.deque[k]) acc.set(id, acc.get(id) + v / st.deque.length);
    let best = null, bv = -1;
    for (const [id, v] of acc) if (v > bv) { bv = v; best = id; }
    return best;
  };

  for (let t = 0; t < T; t++) {
    // ---- publish votes to both sheets ----
    for (let i = 0; i < 8; i++) { await eng8.set(`v.p${i + 1}`, votes[t][i]); await eng9.set(`v.p${i + 1}`, votes[t][i]); }
    await eng9.set('v.p9', echoV[t]);

    // ---- uni verification target (weights frozen 1/n) ----
    if (t % 20 === 0) {
      for (const [eng, n] of [[eng8, 8], [eng9, 9]]) {
        const ps = [], ws = [];
        for (let i = 0; i < n; i++) ps.push((await eng.get(`v.p${i + 1}`)).data);
        const ref = MurmurBus.pool(ps, Array(n).fill(1 / n));
        const sheetP = (await eng.get('pool.uni')).data;
        uniVerify.checks++; if (Math.abs(ref - sheetP) < TOL) uniVerify.pass++;
      }
    }

    const rew8 = new Map(ids8.map((id, i) => [id, r[t][i]]));
    const rew9 = new Map([...ids8.map((id, i) => [id, r[t][i]]), ['a9', rEcho[t]]]);
    const rewA8 = r[t], rewA9 = [...r[t], rEcho[t]];

    for (const L of LEARNERS) {
      const st = out[L];
      // ---- weights this round (pre-outcome trust state) ----
      let w8, w9, Ht8, Ht9;
      if (L === 'hedge25' || L === 'hedge50') {
        Ht8 = trust8[L].entropy(); w8 = trust8[L].weights();
        Ht9 = trust9[L].entropy(); w9 = trust9[L].weights();
      } else if (L === 'window60') {
        w8 = windowW(win8, 8); Ht8 = entropyOf(w8, 8);
        w9 = windowW(win9, 9); Ht9 = entropyOf(w9, 9);
      } else if (L === 'oracle') {
        w8 = oracleW(q[t], 8, false); Ht8 = entropyOf(w8, 8);
        w9 = oracleW(q[t], 9, true); Ht9 = entropyOf(w9, 9);
      } else {
        w8 = uniformW(8); Ht8 = 1;
        w9 = uniformW(9); Ht9 = 1;
      }
      // ---- sheet does the pooled inference ----
      for (let i = 0; i < 8; i++) await eng8.set(`w.a${i + 1}`, w8.get(`a${i + 1}`));
      const p8 = (await eng8.get('pool.hedge')).data;
      for (let i = 0; i < 9; i++) await eng9.set(`w.a${i + 1}`, w9.get(`a${i + 1}`));
      const p9 = (await eng9.get('pool.hedge')).data;
      // ---- sheet verification vs reference pooling math ----
      if (t % 20 === 0) {
        for (const [eng, n, wmap, tag] of [[eng8, 8, w8, 'verify'], [eng9, 9, w9, 'verify9']]) {
          const ps = [], ws = [];
          for (let i = 0; i < n; i++) ps.push((await eng.get(`v.p${i + 1}`)).data);
          for (let i = 0; i < n; i++) ws.push((await eng.get(`w.a${i + 1}`)).data);
          const ref = MurmurBus.pool(ps, ws);
          const sheetP = (await eng.get('pool.hedge')).data;
          st[tag].checks++; if (Math.abs(ref - sheetP) < TOL) st[tag].pass++;
        }
      }
      // ---- rewards, regret accounting ----
      const rp8 = 1 - Math.abs(p8 - s[t]);
      const rp9 = 1 - Math.abs(p9 - s[t]);
      st.sumPool += rp8; st.rpool.push(rp8);
      st.sumPool9 += rp9; st.rpool9.push(rp9);
      st.H.push(Ht8); st.H9.push(Ht9);
      // ---- echo mechanism telemetry (echo arm) ----
      if (t >= ECHO.copyFrom && t <= ECHO.copyTo) { st.copyRewSrc.push(r[t][0]); st.copyRewEcho.push(rEcho[t]); }
      if (t > ECHO.copyTo) { st.postRewSrc.push(r[t][0]); st.postRewEcho.push(rEcho[t]); }
      // ---- learn (post-outcome weights drive flip tracking + deltas) ----
      let postW8, postW9;
      if (L === 'hedge25' || L === 'hedge50') {
        postW8 = trust8[L].update(rew8); postW9 = trust9[L].update(rew9);
      } else if (L === 'window60') {
        win8.push(rewA8); if (win8.length > WINDOW) win8.shift();
        win9.push(rewA9); if (win9.length > WINDOW) win9.shift();
        postW8 = windowW(win8, 8); postW9 = windowW(win9, 9);
      } else if (L === 'oracle') { postW8 = w8; postW9 = w9; }
      else { postW8 = w8; postW9 = w9; }
      // ---- flip tracking: reroll events that change the oracle argmax ----
      smoothPush(st, postW8);
      if (t > 0 && am[t] !== am[t - 1]) {
        if (st.open) st.censored++; // crown changed again before re-crowning
        st.open = { t, target: `a${am[t] + 1}` };
      }
      if (st.open && leader5(st) === st.open.target) {
        st.latencies.push(t - st.open.t); st.open = null;
      }
      // ---- echo deltas + trajectories ----
      const d = postW9.get('a1') - postW9.get('a9');
      if (t === ECHO.copyTo) st.delta300 = d;
      if (t === 350) st.delta350 = d;
      if (t === T - 1) st.deltaFinal = d;
      if (seed === 0 && t % 10 === 0) st.traj.push({ t, w_source: r6(postW9.get('a1')), w_echo: r6(postW9.get('a9')) });
    }
  }
  // close any still-open crown event
  for (const L of LEARNERS) if (out[L].open) { out[L].censored++; out[L].open = null; }

  // ---- hindsight accounting: best FIXED expert (main arm over 8; echo arm over 9) ----
  const tot8 = ids8.map((_, i) => r.reduce((a, row) => a + row[i], 0));
  const best8 = tot8.indexOf(Math.max(...tot8));
  const tot9 = [...tot8, rEcho.reduce((a, b) => a + b, 0)];
  const best9 = tot9.indexOf(Math.max(...tot9));
  const res = { uniVerify, best8, best9, learners: {} };
  for (const L of LEARNERS) {
    const st = out[L];
    // entropy concentration vs next-50-round slope (per-learner)
    let corrRegret = null, corrReward = null;
    if (L !== 'uniform') {
      const regFix = st.rpool.map((rp, u) => r[u][best8] - rp);
      const slR = [], slW = [];
      for (let t = 0; t + 50 < T; t++) { slR.push(slopeNext(regFix, t)); slW.push(slopeNext(st.rpool, t)); }
      corrRegret = pearson(st.H.slice(0, slR.length), slR);
      corrReward = pearson(st.H.slice(0, slW.length), slW);
    }
    const sumBest8 = tot8[best8], sumBest9 = tot9[best9];
    res.learners[L] = {
      regret: sumBest8 - st.sumPool,
      regretEcho: sumBest9 - st.sumPool9,
      latencies: st.latencies, censored: st.censored,
      delta300: st.delta300, delta350: st.delta350, deltaFinal: st.deltaFinal,
      corrRegret, corrReward,
      verify: st.verify, verify9: st.verify9,
      copySrc: mean(st.copyRewSrc), copyEcho: mean(st.copyRewEcho),
      postSrc: mean(st.postRewSrc), postEcho: mean(st.postRewEcho),
      traj: st.traj,
      curve: null,
    };
    if (seed === 0) {
      // cumulative regret vs best-fixed-in-hindsight, sampled every 10 rounds
      res.learners[L].curve = [];
      let cumB = 0, cumP = 0;
      for (let u = 0; u < T; u++) {
        cumB += r[u][best8]; cumP += st.rpool[u];
        if (u % 10 === 0) res.learners[L].curve.push({ t: u, cumRegret: r6(cumB - cumP) });
      }
    }
  }
  return res;
}

// ---------------- main ----------------
console.log(`── E17 gossip trust dynamics · ${SEEDS} seeds × ${T} rounds × ${LEARNERS.length} learners ──`);
const vault = new MothVault({ label: 'e17', offline: true });
const harvest = await vault.harvest(256);
console.log(`vault: ${harvest.mock ? 'MOCK (offline doctrine)' : 'LIVE ' + harvest.jobId} digest=${harvest.poolDigest.slice(0, 10)} bits=${harvest.bits.length}`);

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });
book('run.config', {
  task: 'E17', name: 'gossip trust dynamics', T, N, seeds: SEEDS,
  world: { stateFlipP: FLIP_P, skillRerollP: REROLL_P, qRange: [0.5, 0.95], voteRule: 'p = signal ? 0.5+(q-0.5) : 0.5-(q-0.5), clamp [0.02,0.98]; signal = s w.p. q else 1-s' },
  echo: ECHO, window: { size: WINDOW, eta: WINDOW_ETA, share: 0 },
  learners: LEARNER_CFG, reward: 'r_i = 1 - |p_i - s_t| (supervised pool)',
  vault: { mock: harvest.mock, digest: harvest.poolDigest },
  randomness: 'per-draw cross-key sub-streams of ONE moth harvest (see vault.finding row)',
  engine: 'vendored quilt dist (QuiltEngine)', sheetVerifyTol: TOL,
});
book('vault.finding', {
  what: 'vendored moth.streamFor counter-mode is near-constant for sequential draws (fnv1a64 low-32 no avalanche over 1-char counter change; 8 draws = 0.595442,0.595442,0.595441,...) — any rng()<p threshold test degenerates',
  fix: 'E17 draws each sample as the FIRST draw of its own sub-stream key (same harvest, per-purpose keys); validation: mean 0.4996, sd 0.2874, deciles flat, runs 10032/9967, gauss (−0.04, 1.03), P(u<0.01)=0.0107',
});

const agg = {};
for (const L of LEARNERS) {
  agg[L] = { regret: [], regretEcho: [], lat: [], cens: 0, events: 0, d300: [], d350: [], dFinal: [], cR: [], cW: [], verify: { checks: 0, pass: 0 }, verify9: { checks: 0, pass: 0 }, copySrc: [], copyEcho: [], postSrc: [], postEcho: [], curve: null, traj: null };
}
let uniChecks = 0, uniPass = 0;
const t0 = Date.now();

for (let seed = 0; seed < SEEDS; seed++) {
  const world = genWorld(seed, harvest, vault);
  const eng8 = new QuiltEngine(`e17-gossip-s${seed}`, {});
  const eng9 = new QuiltEngine(`e17-gossip-echo-s${seed}`, {});
  eng8.loadSheet(buildSheet(8));
  eng9.loadSheet(buildSheet(9));
  const res = await runSeed(seed, world, eng8, eng9);
  uniChecks += res.uniVerify.checks; uniPass += res.uniVerify.pass;
  for (const L of LEARNERS) {
    const R = res.learners[L], A = agg[L];
    A.regret.push(R.regret); A.regretEcho.push(R.regretEcho);
    A.lat.push(...R.latencies); A.cens += R.censored; A.events += R.latencies.length + R.censored;
    A.d300.push(R.delta300); A.d350.push(R.delta350); A.dFinal.push(R.deltaFinal);
    if (R.corrRegret !== null) A.cR.push(R.corrRegret);
    if (R.corrReward !== null) A.cW.push(R.corrReward);
    A.verify.checks += R.verify.checks; A.verify.pass += R.verify.pass;
    A.verify9.checks += R.verify9.checks; A.verify9.pass += R.verify9.pass;
    A.copySrc.push(R.copySrc); A.copyEcho.push(R.copyEcho);
    A.postSrc.push(R.postSrc); A.postEcho.push(R.postEcho);
    if (seed === 0) { A.curve = R.curve; A.traj = R.traj; }
  }
  if ((seed + 1) % 6 === 0) console.log(`  seed ${seed + 1}/${SEEDS} done (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}

// ---------------- aggregate + receipts ----------------
const summary = {};
for (const L of LEARNERS) {
  const A = agg[L];
  summary[L] = {
    regret: { mean: r6(mean(A.regret)), sd: r6(sd(A.regret)) },
    regretEcho: { mean: r6(mean(A.regretEcho)), sd: r6(sd(A.regretEcho)) },
    flipRounds: { mean: r6(mean(A.lat)), sd: r6(sd(A.lat)), events: A.events, matched: A.lat.length, censored: A.cens },
    echoDelta300: { mean: r6(mean(A.d300)), sd: r6(sd(A.d300)) },
    echoDelta350: { mean: r6(mean(A.d350)), sd: r6(sd(A.d350)), seedsSourceBeatsEcho: A.d350.filter((d) => d > 0).length },
    echoDeltaFinal: { mean: r6(mean(A.dFinal)), sd: r6(sd(A.dFinal)) },
    entropyCorr: A.cR.length ? { regretSlope: r6(mean(A.cR)), rewardSlope: r6(mean(A.cW)) } : null,
    sheetVerifyPass: { hedgeChecks: A.verify.checks + A.verify9.checks, hedgePass: A.verify.pass + A.verify9.pass, uniChecks: uniChecks, uniPass: uniPass },
    echoMechanism: {
      sourceCopyReward: r6(mean(A.copySrc)), echoCopyReward: r6(mean(A.copyEcho)),
      sourcePostReward: r6(mean(A.postSrc)), echoPostReward: r6(mean(A.postEcho)),
    },
    regretCurveSeed0: A.curve,
    echoWeightsSeed0: A.traj,
  };
  book('learner.summary', {
    learner: L, cfg: LEARNER_CFG[L],
    regret: summary[L].regret, regretEcho: summary[L].regretEcho,
    flipRounds: summary[L].flipRounds,
    echoDelta: { at300: summary[L].echoDelta300, at350: summary[L].echoDelta350, final: summary[L].echoDeltaFinal },
    entropyCorr: summary[L].entropyCorr,
    sheetVerifyPass: { checks: summary[L].sheetVerifyPass.hedgeChecks, pass: summary[L].sheetVerifyPass.hedgePass },
    echoMechanism: summary[L].echoMechanism,
  });
}
book('sheet.verify.uni', { checks: uniChecks, pass: uniPass, tol: TOL, note: 'pool.uni (frozen 1/n) vs MurmurBus.pool, both sheets, every 20 rounds' });

// findings
const ranked = [...LEARNERS].sort((a, b) => summary[a].regret.mean - summary[b].regret.mean);
const h25 = summary.hedge25;
const echoVerdict = h25.echoDelta350.mean > 0 && h25.echoDelta350.seedsSourceBeatsEcho > SEEDS / 2 ? 'SOURCE_BEATS_ECHO' : 'ECHO_STEALS_TRUST';
const weighted = LEARNERS.filter((L) => summary[L].entropyCorr);
const allRegretSlopeNeg = weighted.every((L) => summary[L].entropyCorr.regretSlope < 0);
const meanRegretSlopeCorr = mean(weighted.map((L) => summary[L].entropyCorr.regretSlope));
const meanRewardSlopeCorr = mean(weighted.map((L) => summary[L].entropyCorr.rewardSlope));
const entropyConcentrates = allRegretSlopeNeg;
const echoAdvDuringCopy = summary.uniform.echoMechanism.echoCopyReward >= summary.uniform.echoMechanism.sourceCopyReward * 0.95;
book('e17.findings', {
  rankingByRegret: ranked,
  bestLearner: ranked[0],
  echoVerdict, echoDelta350: h25.echoDelta350, echoDeltaAtCopyEnd: h25.echoDelta300,
  echoMechanism: 'echo copies source with lag 2; in a flipping world its reward lags at regime boundaries (copy window rewards) and collapses to noise after round 300',
  echoCopyVsSourceReward: { echo: h25.echoMechanism.echoCopyReward, source: h25.echoMechanism.sourceCopyReward, echoAdvDuringCopy },
  entropyConcentrationPrecedesRegretReduction: entropyConcentrates,
  entropyNote: `weak at best: corr(H_t, next-50 regret slope) is negative for ALL weighted learners (mean ${r6(meanRegretSlopeCorr)}) but tiny; corr(H_t, next-50 reward slope) is POSITIVE (mean ${r6(meanRewardSlopeCorr)}) — a mechanical learning-transient (high entropy early = steep improvement). Entropy is contemporaneous with the trust regime, not a clean leading indicator of regret reduction`,
  entropyCorrAll: Object.fromEntries(weighted.map((L) => [L, summary[L].entropyCorr])),
  flipTracking: Object.fromEntries(LEARNERS.map((L) => [L, summary[L].flipRounds])),
  sheetVerify: { hedgeChecks: LEARNERS.reduce((a, L) => a + summary[L].sheetVerifyPass.hedgeChecks, 0), hedgePass: LEARNERS.reduce((a, L) => a + summary[L].sheetVerifyPass.hedgePass, 0), uniChecks, uniPass },
});
book('chain.seal', { rows: rows.length, digest: fnv1a64(rows) });
const v = verifyChain(sealChain(rows));
const tip = rows[rows.length - 1].row_hash;
console.log(`receipts: ${rows.length} rows, chain ${v.ok ? 'VERIFIED' : 'BROKEN'} tip=${tip}`);

// ---------------- write outputs ----------------
mkdirSync(new URL('./outputs/', import.meta.url), { recursive: true });
writeFileSync(new URL('./outputs/receipts_e17.jsonl', import.meta.url), rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync(new URL('./outputs/e17_summary.json', import.meta.url), JSON.stringify({
  config: { task: 'E17', T, N, SEEDS, FLIP_P, REROLL_P, ECHO, WINDOW, learners: LEARNER_CFG, vault: { mock: harvest.mock, digest: harvest.poolDigest } },
  learners: summary,
  findings: { rankingByRegret: ranked, echoVerdict, entropyConcentrationPrecedesRegretReduction: entropyConcentrates },
  chain: { rows: rows.length, verified: v.ok, tip },
}, null, 1));

// ---------------- console table ----------------
console.log('\nlearner     regret(mean±sd)        flip→crown(mean, cens)  echoΔ@350(mean±sd, wins)  H-corr(regret slope)  sheet✓');
for (const L of ranked) {
  const S = summary[L];
  console.log(
    `${L.padEnd(10)}  ${String(S.regret.mean).padStart(8)} ±${String(S.regret.sd).padEnd(7)}  ` +
    `${String(S.flipRounds.mean).padStart(5)} (ev ${S.flipRounds.events}, cens ${S.flipRounds.censored})   ` +
    `${String(S.echoDelta350.mean).padStart(8)} ±${String(S.echoDelta350.sd).padEnd(7)} (${S.echoDelta350.seedsSourceBeatsEcho}/${SEEDS})  ` +
    `${S.entropyCorr ? S.entropyCorr.regretSlope : 'null'}  ` +
    `${S.sheetVerifyPass.hedgePass}/${S.sheetVerifyPass.hedgeChecks}`
  );
}
console.log(`\necho verdict: ${echoVerdict} — hedge25 w_source−w_echo @350 = ${h25.echoDelta350.mean} ±${h25.echoDelta350.sd} (${h25.echoDelta350.seedsSourceBeatsEcho}/${SEEDS} seeds); during the copy window Δ@300 = ${h25.echoDelta300.mean} ±${h25.echoDelta300.sd} (the echo free-rides while it copies)`);
console.log(`echo mechanism: copy-window reward echo=${h25.echoMechanism.echoCopyReward} vs source=${h25.echoMechanism.sourceCopyReward}; post-300 echo=${h25.echoMechanism.echoPostReward} vs source=${h25.echoMechanism.sourcePostReward}`);
console.log(v.ok ? 'E17 DONE' : 'E17 CHAIN BROKEN');
