// E16 — RESONANCE AS A LIE DETECTOR (the physics of agreement, tested)
// ============================================================
// The fleet's thesis: cells whisper "murmurs" ({topic, from, p, n, ttl});
// the mesh pools them by trust-weighted log-odds; MOTHquantum's contribution
// is a PHYSICS OF AGREEMENT — each cell is a Kuramoto oscillator whose phase
// encodes its belief (θ_i = π·p_i), coupled by pairwise agreement
// (a_ij = 1 − 2|p_i − p_j|), and the ORDER PARAMETER r = |mean(e^{iθ})| is a
// consensus meter a meta-cell can read. E16 tests whether r actually
// predicts consensus quality, and whether learned trust (Hedge) recovers
// true reliabilities. This is nexus-git-agent's "lying node" problem reborn
// as cells: one sharp sender turns adversary at round 60 and reports
// p = 1 − its truthful posterior (anti-correlated).
//
// WORLD: hidden continuous truth μ_t ∈ [0,1] random-walking (step N(0,0.06),
// clamped [0.01,0.99]). N=12 sender cells: 4 sharp (σ=0.06), 4 mid (σ=0.15),
// 3 dull (σ=0.30), 1 adversary (σ=0.10, lies from round 60). Cell i observes
// x = clamp(μ + N(0,σ_i)) and reports p_i = x (honest) — the belief is the
// sender's noisy estimate of μ itself, so pooled posteriors and μ are
// commensurable and error = |posterior − μ| is honest. Every 8th round the
// truth is revealed (feedback for trust learning).
//
// ARMS (same worlds/streams, paired noise — observations are generated once
// per seed and consumed identically by every arm):
//   majority  — vote sign(p_i − 0.5); consensus posterior = mean p over the
//               majority side (the agreeing fraction's mean belief)
//   uniform   — MurmurBus protocol: whisper {topic:'mu', from, p, n:1, ttl:2}
//               then pulse with trust=null (uniform 1/N weights)
//   trueSigma — MurmurBus.pool reference math, weights ∝ 1/σ_i² (oracle).
//               Honest caveat receipted up front: the oracle knows σ but not
//               LIES, so post-turn it is NOT an upper bound — the adversary
//               has the 2nd-sharpest σ and keeps that weight.
//   hedge     — MurmurBus with HedgeTrust(eta 0.3, share 0.02), updated on
//               reveal rounds with reward_i = 1 − |p_i − μ|; the pooled
//               belief is computed IN THE SHEET (QuiltEngine) as ONE formula
//               over 12 terms with trust value cells t.n1..t.n12 written
//               back by the harness; the bus pulse is the verification twin.
//
// EVERY round (all arms): the 12 reported beliefs are mapped to phases
// θ_i = π·p_i, coupled by agreementMatrix, Resonance.step(0.1, 1.2, 10) →
// r_t recorded. r is a property of the MESH's reports (identical across
// arms); each arm's corr(r_t, next-round error) is computed separately.
//
// QUESTIONS (each receipted with numbers):
//   Q1 mean error per arm ±sd — does σ-weighting beat uniform beat majority?
//   Q2 post-turn error split — does HEDGE adapt to the liar (err 60–90 vs
//      120–200; final weight on the adversary vs 1/12 baseline)?
//   Q3 corr(r_t, next-round error) per arm — is the order parameter a useful
//      error predictor? Honest null if not.
//   Q4 LIE DETECTOR: in the HEDGE arm, does r drop when the adversary's
//      murmur dominates? mean r where |p_adv − posterior| > 0.3 vs < 0.1.
//
// ENGINE PITFALLS HONORED (all previously receipted):
//   1. no cell id is a dotted-path-prefix of another (all ids are
//      two-segment: n{i}.p, n{i}.lg, t.n{i}, hedge.pool, env.truth)
//   2. runtime.get unwrapping — no program cells here; harness uses .data
//   3. formulas are single expressions (ternaries only)
//   4. two-segment ids everywhere
//
// Run: node experiments/e16_resonance_consensus.mjs [seeds]

import { QuiltEngine } from '../engine/dist/index.js';
import { HedgeTrust } from '../murmur/trust.mjs';
import { MurmurBus, sigmoid } from '../murmur/bus.mjs';
import { Resonance, agreementMatrix, corr } from '../murmur/resonance.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { fnv1a64, sealChain, verifyChain } from '../murmur/receipts.mjs';
import { writeFileSync } from 'node:fs';

// ---------------- config ----------------
const SEEDS = Number(process.argv[2] || 20);
const T = 200;            // rounds
const TURN = 60;          // adversary turns at this round (0-indexed: t >= TURN)
const REVEAL = 8;         // every 8th round the truth is revealed
const N = 12;             // sender cells
const WALK = 0.06;        // μ random-walk sd
const ETA = 0.3, SHARE = 0.02;
const DT = 0.1, K = 1.2, STEPS = 10;
const LO = 0.01, HI = 0.99;

const IDS = Array.from({ length: N }, (_, i) => `n${i + 1}`);
const ADV = 'n12', ADV_IDX = 11;
const SIGMA = new Map();
for (let i = 1; i <= 4; i++) SIGMA.set(`n${i}`, 0.06);   // sharp ×4
for (let i = 5; i <= 8; i++) SIGMA.set(`n${i}`, 0.15);   // mid ×4
for (let i = 9; i <= 11; i++) SIGMA.set(`n${i}`, 0.30);  // dull ×3
SIGMA.set(ADV, 0.10);                                    // adversary (sharp, lying)
const OMEGA_W = IDS.map((id) => 1 / SIGMA.get(id) ** 2); // oracle ∝ 1/σ²
const ARMS = ['majority', 'uniform', 'trueSigma', 'hedge'];
const BASELINE_W = 1 / N;

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const sd = (xs) => (xs.length ? Math.sqrt(xs.reduce((a, b) => a + (b - mean(xs)) ** 2, 0) / xs.length) : 0);
const gauss = (s) => Math.sqrt(-2 * Math.log(Math.max(1e-9, s()))) * Math.cos(2 * Math.PI * s());

// ---------------- the sheet (QuiltEngine; HEDGE arm substrate) ----------------
// Per sender: value cell n{i}.p (reported belief) + formula cell n{i}.lg
// (logit-clamped contribution). Trust lives in value cells t.n1..t.n12,
// written back by the Hedge learner outside the sheet — learning outside,
// inference inside. The pooled belief is ONE formula over 12 terms:
//   hedge.pool = sigmoid( Σ_i w_i·logit(p_i)·n_i / max(Σ_i w_i·n_i, ε) )
// with evidence mass n_i = 1 for every murmur this experiment.
// env.truth is SCORE-ONLY: written by the harness for error accounting,
// read by NO decision formula (asserted in preflight).
function buildSheet() {
  const cells = [
    { id: 'env.truth', kind: 'value', value: 0.5,
      description: 'SCORE-ONLY: hidden true mu, written by the harness for error accounting. NO decision formula reads this cell.' },
  ];
  for (let i = 1; i <= N; i++) {
    cells.push({ id: `n${i}.p`, kind: 'value', value: 0.5,
      description: `sender n${i} reported belief (murmur p, topic 'mu')` });
    cells.push({ id: `n${i}.lg`, kind: 'formula',
      expr: `Math.log(clamp(n${i}.p,0.02,0.98)/(1-clamp(n${i}.p,0.02,0.98)))` });
    cells.push({ id: `t.n${i}`, kind: 'value', value: 1 / N,
      description: `HedgeTrust weight of sender n${i} (written back by harness)` });
  }
  const num = IDS.map((_, i) => `t.n${i + 1}*n${i + 1}.lg`).join(' + ');
  const den = `max(${IDS.map((_, i) => `t.n${i + 1}`).join(' + ')},0.000000001)`;
  cells.push({ id: 'hedge.pool', kind: 'formula',
    expr: `(1/(1+Math.exp(-((${num})/${den}))))`,
    description: 'trust-weighted log-odds pool of the 12 murmurs (evidence mass n_i = 1)' });
  return { id: 'resonance-consensus', title: 'E16 Resonance Consensus', cells };
}

// ---------------- preflight: sheet math === reference math ----------------
async function preflight() {
  const engine = new QuiltEngine('e16-preflight', {});
  engine.loadSheet(buildSheet());
  const ps = [0.91, 0.84, 0.77, 0.66, 0.58, 0.52, 0.45, 0.33, 0.24, 0.15, 0.09, 0.97];
  for (let i = 0; i < N; i++) await engine.set(`n${i + 1}.p`, ps[i]);
  const diffs = [];
  for (const ws of [IDS.map(() => 1 / N), IDS.map((_, i) => 0.01 + i / 100)]) {
    for (let i = 0; i < N; i++) await engine.set(`t.n${i + 1}`, ws[i]);
    const sheet = (await engine.get('hedge.pool')).data;
    const ref = MurmurBus.pool(ps, ws);
    diffs.push(Math.abs(sheet - ref));
  }
  // bus protocol (whisper ttl:2 → pulse once) must equal static pool
  const bus = new MurmurBus({});
  for (let i = 0; i < N; i++) bus.whisper({ topic: 'mu', from: IDS[i], p: ps[i], n: 1, ttl: 2 });
  diffs.push(Math.abs(bus.pulse().get('mu').posterior - MurmurBus.pool(ps, IDS.map(() => 1 / N))));
  // score-only assertion: no formula may read env.truth
  const envTruthReaders = buildSheet().cells.filter((c) => c.kind === 'formula' && String(c.expr).includes('env.truth')).length;
  return { cells: buildSheet().cells.length, maxDiff: Math.max(...diffs), envTruthReaders, diffs: diffs.map((d) => d.toExponential(2)) };
}

// ---------------- majority arm ----------------
// Vote sign(p_i − 0.5); the majority side wins; the consensus posterior is
// the agreeing fraction's mean belief. (Ties on the vote → high side.)
function majorityPool(ps) {
  const high = ps.map((p) => p >= 0.5);
  const nHi = high.filter(Boolean).length;
  const sideHigh = nHi * 2 >= ps.length;
  const agree = ps.filter((_, i) => high[i] === sideHigh);
  return mean(agree);
}

// ---------------- resonance meter (shared across arms) ----------------
// θ_i = π·p_i; coupling a_ij = 1 − 2|p_i − p_j| (agreementMatrix on 1-D
// belief vectors); ω_i = π·(p_i(t) − p_i(t−1)) — natural frequency encodes
// how fast the sender's opinion is moving (0 on the first round).
function orderParameter(ps, prev) {
  const A = agreementMatrix(ps.map((p) => [p]), ps.map(() => 1));
  const omegas = prev ? ps.map((p, i) => Math.PI * (p - prev[i])) : ps.map(() => 0);
  const res = new Resonance(ps.map((p) => Math.PI * p), omegas, (i, j) => A[i][j]);
  return res.step(DT, K, STEPS);
}

// ---------------- one seed (all arms, paired noise) ----------------
async function runSeed(seed, streamFor) {
  // world: μ random-walk + per-cell observations, drawn ONCE for all arms
  const s = streamFor(`e16:world:${seed}`);
  const mu = new Array(T);
  const reports = [];
  let m = 0.5;
  for (let t = 0; t < T; t++) {
    mu[t] = m;
    reports.push(IDS.map((id) => clamp(m + gauss(s) * SIGMA.get(id), LO, HI)));
    m = clamp(m + gauss(s) * WALK, LO, HI);
  }
  // the adversary reports 1 − truthful posterior from round TURN on
  for (let t = TURN; t < T; t++) reports[t][ADV_IDX] = clamp(1 - reports[t][ADV_IDX], LO, HI);

  const trust = new HedgeTrust(IDS, { eta: ETA, share: SHARE });
  const busHedge = new MurmurBus({ trust });
  const busUnif = new MurmurBus({});
  const engine = new QuiltEngine(`e16-hedge-s${seed}`, {});
  engine.loadSheet(buildSheet());
  for (let i = 0; i < N; i++) await engine.set(`t.n${i + 1}`, trust.weight(IDS[i]));

  const err = {}; for (const a of ARMS) err[a] = new Array(T).fill(0);
  const curve = {}; for (const a of ARMS) curve[a] = [];
  const rArr = new Array(T).fill(0);
  const lieHi = [], lieLo = [];          // |p_adv − posterior| > 0.3 vs < 0.1
  const lieHiPost = [], lieLoPost = [];  // post-turn-only variant
  let poolMismatches = 0, maxPoolDiff = 0, prev = null;

  for (let t = 0; t < T; t++) {
    const ps = reports[t], truth = mu[t];

    // the order parameter (mesh property — identical for every arm)
    const r = orderParameter(ps, prev);
    rArr[t] = r; prev = ps;

    // arm i: MAJORITY (vote + mean of agreeing side)
    err.majority[t] = Math.abs(majorityPool(ps) - truth);

    // arm ii: UNIFORM (full murmur protocol: whisper → pulse, trust = null)
    for (let i = 0; i < N; i++) busUnif.whisper({ topic: 'mu', from: IDS[i], p: ps[i], n: 1, ttl: 2 });
    err.uniform[t] = Math.abs(busUnif.pulse().get('mu').posterior - truth);

    // arm iii: TRUE-σ (oracle reference pool, weights ∝ 1/σ²)
    err.trueSigma[t] = Math.abs(MurmurBus.pool(ps, OMEGA_W) - truth);

    // arm iv: HEDGE — the sheet is the inference substrate
    for (let i = 0; i < N; i++) await engine.set(`n${i + 1}.p`, ps[i]);
    for (let i = 0; i < N; i++) busHedge.whisper({ topic: 'mu', from: IDS[i], p: ps[i], n: 1, ttl: 2 });
    const busPost = busHedge.pulse().get('mu').posterior; // verification twin
    const sheetPost = (await engine.get('hedge.pool')).data; // the decision
    const d = Math.abs(busPost - sheetPost);
    maxPoolDiff = Math.max(maxPoolDiff, d);
    if (d > 1e-9) poolMismatches++;
    await engine.set('env.truth', truth); // SCORE-ONLY write (error accounting)
    err.hedge[t] = Math.abs(sheetPost - truth);

    // lie-detector buckets (hedge posterior vs adversary murmur)
    const dev = Math.abs(ps[ADV_IDX] - sheetPost);
    if (dev > 0.3) { lieHi.push(r); if (t >= TURN) lieHiPost.push(r); }
    else if (dev < 0.1) { lieLo.push(r); if (t >= TURN) lieLoPost.push(r); }

    // hedge learning on reveal rounds: reward_i = 1 − |p_i − μ| (true μ)
    if (t % REVEAL === 0) {
      const rewards = new Map();
      for (let i = 0; i < N; i++) rewards.set(IDS[i], clamp(1 - Math.abs(ps[i] - truth), 0, 1));
      trust.update(rewards);
      for (let i = 0; i < N; i++) await engine.set(`t.n${i + 1}`, trust.weight(IDS[i]));
    }

    if (seed === 0 && t % 4 === 0) {
      for (const a of ARMS) curve[a].push({ t, err: +err[a][t].toFixed(4), r: +r.toFixed(4) });
    }
  }

  const preTurnUpdates = Math.ceil(TURN / REVEAL); // reveals strictly before TURN
  return {
    seed, r: rArr, err, curve,
    poolMismatches, maxPoolDiff: +maxPoolDiff.toExponential(2),
    advWeightFinal: trust.weight(ADV),
    advWeightAtTurn: trust.history[preTurnUpdates - 1]?.get(ADV) ?? trust.weight(ADV),
    sharpFinal: mean(IDS.slice(0, 4).map((id) => trust.weight(id))),
    entropyFinal: trust.entropy(),
    lieHiMean: lieHi.length ? mean(lieHi) : null, lieHiN: lieHi.length,
    lieLoMean: lieLo.length ? mean(lieLo) : null, lieLoN: lieLo.length,
    lieHiPostMean: lieHiPost.length ? mean(lieHiPost) : null, lieHiPostN: lieHiPost.length,
    lieLoPostMean: lieLoPost.length ? mean(lieLoPost) : null, lieLoPostN: lieLoPost.length,
    trustFinal: trust.snapshot(),
  };
}

// ---------------- main ----------------
const t0 = Date.now();
console.log(`── E16 resonance consensus · ${SEEDS} seeds × 4 arms × ${T} rounds · liar turns at t=${TURN} ──`);
const vault = new MothVault({ label: 'e16', offline: true }); // ALWAYS offline — live budget reserved
const harvest = await vault.harvest(256);
console.log(`vault: ${harvest.mock ? 'MOCK' : 'LIVE ' + harvest.jobId} digest=${harvest.poolDigest.slice(0, 10)} bits=${harvest.bits.length}`);
const streamFor = (key) => vault.streamFor(harvest, key);

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });

book('vault', { label: 'e16', offline: true, mock: harvest.mock, bits: harvest.bits.length, poolDigest: harvest.poolDigest, note: 'live budget reserved; deterministic mock pool only' });

const pf = await preflight();
book('sheet.preflight', { ...pf, note: 'sheet hedge.pool === MurmurBus.pool reference math; bus whisper(ttl:2)→pulse === static pool; env.truth read by 0 decision formulas' });
console.log(`preflight: ${pf.cells} cells, maxDiff=${pf.maxDiff}, envTruthReaders=${pf.envTruthReaders}`);

book('run.config', {
  seeds: SEEDS, rounds: T, walkSd: WALK, mu0: 0.5, clamp: [LO, HI],
  senders: N, classes: { sharp: 4, mid: 4, dull: 3, adversary: 1 },
  sigma: Object.fromEntries(SIGMA), adversary: ADV, turnRound: TURN,
  adversaryReport: 'p = 1 − truthful posterior (anti-correlated) for t >= 60',
  revealEvery: REVEAL, revealReward: '1 − |p_reported − μ| on true μ',
  hedge: { eta: ETA, share: SHARE, ids: IDS.length },
  resonance: { theta: 'π·p_i', omega: 'π·(p_i(t) − p_i(t−1))', coupling: 'agreementMatrix, a_ij = 1 − 2|p_i − p_j|', dt: DT, K, steps: STEPS },
  arms: {
    majority: 'vote sign(p−0.5); posterior = mean p over majority side (agreeing fraction)',
    uniform: 'MurmurBus whisper{topic:mu,n:1,ttl:2} → pulse, trust=null (w=1/N)',
    trueSigma: 'MurmurBus.pool reference math, ws ∝ 1/σ_i² (oracle: knows σ, not lies — NOT a post-turn upper bound)',
    hedge: 'MurmurBus trust=HedgeTrust; pooled belief computed IN-SHEET (hedge.pool) with t.n1..t.n12 written back; bus pulse is verification twin',
  },
  murmurMass: 'n_i = 1 every murmur; ttl=2 → each murmur pooled exactly once',
  error: '|posterior − μ_t|',
});

const perSeed = [];
for (let seed = 0; seed < SEEDS; seed++) perSeed.push(await runSeed(seed, streamFor));
const maxMis = perSeed.reduce((a, s) => a + s.poolMismatches, 0);
const maxDiff = Math.max(...perSeed.map((s) => s.maxPoolDiff));

// ---------------- aggregate per arm ----------------
const agg = {};
for (const arm of ARMS) {
  const errs = perSeed.map((s) => s.err[arm]); // per-seed arrays of length T
  const perSeedMean = errs.map(mean);
  const seg = (a, b) => +mean(errs.map((e) => mean(e.slice(a, b)))).toFixed(4);
  const corrNext = perSeed.map((s) => corr(s.r.slice(0, -1), s.err[arm].slice(1))).filter((c) => c !== null);
  const corrSame = perSeed.map((s) => corr(s.r, s.err[arm])).filter((c) => c !== null);
  agg[arm] = {
    arm,
    meanErr: +mean(perSeedMean).toFixed(4),
    sdErr: +sd(perSeedMean).toFixed(4),
    postTurnErr: seg(TURN, T),
    err60_90: seg(TURN, 90),
    err120_200: seg(120, T),
    deltaErr60to120: +(seg(120, T) - seg(TURN, 90)).toFixed(4),
    corrRErr: corrNext.length ? +mean(corrNext).toFixed(4) : null,
    corrRErrSd: corrNext.length ? +sd(corrNext).toFixed(4) : null,
    corrRSameRound: corrSame.length ? +mean(corrSame).toFixed(4) : null,
    hedgeAdvWeight: null, lieDetectorDelta: null,
  };
}
// hedge-only extras
const advW = perSeed.map((s) => s.advWeightFinal);
agg.hedge.hedgeAdvWeight = +mean(advW).toFixed(4);
agg.hedge.hedgeAdvWeightSd = +sd(advW).toFixed(4);
agg.hedge.advWeightAtTurn = +mean(perSeed.map((s) => s.advWeightAtTurn)).toFixed(4);
agg.hedge.sharpWeightFinal = +mean(perSeed.map((s) => s.sharpFinal)).toFixed(4);
agg.hedge.trustEntropyFinal = +mean(perSeed.map((s) => s.entropyFinal)).toFixed(4);
const ld = perSeed.filter((s) => s.lieHiN > 0 && s.lieLoN > 0);
agg.hedge.lieDetectorDelta = ld.length ? +(mean(ld.map((s) => s.lieHiMean - s.lieLoMean))).toFixed(4) : null;
agg.hedge.lieDetectorHi = ld.length ? +mean(ld.map((s) => s.lieHiMean)).toFixed(4) : null;
agg.hedge.lieDetectorLo = ld.length ? +mean(ld.map((s) => s.lieLoMean)).toFixed(4) : null;
agg.hedge.lieDetectorSeeds = ld.length;
agg.hedge.lieDetectorNhi = +mean(perSeed.map((s) => s.lieHiN)).toFixed(1);
agg.hedge.lieDetectorNlo = +mean(perSeed.map((s) => s.lieLoN)).toFixed(1);
// post-turn-only variant — over seeds that have BOTH buckets non-empty post-turn
// (no NaN poisoning: buckets can legitimately be empty in a given seed)
const ldPost = perSeed.filter((s) => s.lieHiPostN > 0 && s.lieLoPostN > 0);
agg.hedge.lieDetectorHiPost = ldPost.length ? +mean(ldPost.map((s) => s.lieHiPostMean)).toFixed(4) : null;
agg.hedge.lieDetectorLoPost = ldPost.length ? +mean(ldPost.map((s) => s.lieLoPostMean)).toFixed(4) : null;
agg.hedge.lieDetectorPostSeeds = ldPost.length;
agg.hedge.lieDetectorPostNhi = +mean(perSeed.map((s) => s.lieHiPostN)).toFixed(1);
agg.hedge.lieDetectorPostNlo = +mean(perSeed.map((s) => s.lieLoPostN)).toFixed(1);
agg.hedge.poolMismatches = maxMis;
agg.hedge.maxSheetVsBusDiff = maxDiff;
const meanR = +mean(perSeed.flatMap((s) => s.r)).toFixed(4);

// ---------------- receipt rows: per-arm summaries ----------------
for (const arm of ARMS) {
  const a = agg[arm];
  book('arm.summary', {
    arm: a.arm, meanErr: a.meanErr, sdErr: a.sdErr, postTurnErr: a.postTurnErr,
    hedgeAdvWeight: a.hedgeAdvWeight, corrRErr: a.corrRErr, lieDetectorDelta: a.lieDetectorDelta,
    err60_90: a.err60_90, err120_200: a.err120_200, corrRSameRound: a.corrRSameRound,
    ...(arm === 'hedge' ? {
      hedgeAdvWeightSd: a.hedgeAdvWeightSd, advWeightAtTurn: a.advWeightAtTurn,
      sharpWeightFinal: a.sharpWeightFinal, trustEntropyFinal: a.trustEntropyFinal,
      lieDetectorHi: a.lieDetectorHi, lieDetectorLo: a.lieDetectorLo,
      lieDetectorSeeds: a.lieDetectorSeeds, lieDetectorNhi: a.lieDetectorNhi, lieDetectorNlo: a.lieDetectorNlo,
      lieDetectorHiPost: a.lieDetectorHiPost, lieDetectorLoPost: a.lieDetectorLoPost,
      lieDetectorPostSeeds: a.lieDetectorPostSeeds, lieDetectorPostNhi: a.lieDetectorPostNhi, lieDetectorPostNlo: a.lieDetectorPostNlo,
      poolMismatches: a.poolMismatches, maxSheetVsBusDiff: a.maxSheetVsBusDiff,
    } : {}),
  });
  const x = agg[arm];
  console.log(`${arm.padEnd(10)} err ${x.meanErr.toFixed(4)} ±${x.sdErr.toFixed(4)}  post60 ${x.postTurnErr.toFixed(4)} (60-90 ${x.err60_90.toFixed(4)} → 120-200 ${x.err120_200.toFixed(4)})  corr(r,err+1) ${x.corrRErr}  advW ${x.hedgeAdvWeight ?? '—'}  lieΔ ${x.lieDetectorDelta ?? '—'}`);
}

// ---------------- question rows ----------------
const rank = [...ARMS].sort((a, b) => agg[a].meanErr - agg[b].meanErr);
book('q1.answer', {
  question: 'mean error per arm — does σ-weighting beat uniform beat majority?',
  ranking: rank, meanErr: Object.fromEntries(rank.map((a) => [a, agg[a].meanErr])),
  sdErr: Object.fromEntries(ARMS.map((a) => [a, agg[a].sdErr])),
  verdict: `trueSigma ${agg.trueSigma.meanErr < agg.uniform.meanErr ? 'beats' : 'does NOT beat'} uniform; uniform ${agg.uniform.meanErr < agg.majority.meanErr ? 'beats' : 'does NOT beat'} majority`,
});
book('q2.answer', {
  question: 'does HEDGE adapt to the liar?',
  hedgeErr60_90: agg.hedge.err60_90, hedgeErr120_200: agg.hedge.err120_200,
  hedgeDeltaErr: agg.hedge.deltaErr60to120,
  uniformDeltaErrControl: agg.uniform.deltaErr60to120,
  advWeightAtTurn: agg.hedge.advWeightAtTurn, advWeightFinal: agg.hedge.hedgeAdvWeight,
  advWeightSd: agg.hedge.hedgeAdvWeightSd, baselineWeight: +BASELINE_W.toFixed(4),
  sharpWeightFinal: agg.hedge.sharpWeightFinal, trustEntropyFinal: agg.hedge.trustEntropyFinal,
  adapted: agg.hedge.hedgeAdvWeight < BASELINE_W && agg.hedge.err120_200 <= agg.hedge.err60_90 + 0.005,
});
const q3v = (c) => (c === null ? 'null' : Math.abs(c) > 0.2 ? 'useful' : Math.abs(c) > 0.1 ? 'weak' : 'null');
book('q3.answer', {
  question: 'corr(r_t, next-round error |posterior−μ|) per arm — is the order parameter a useful error predictor?',
  corrRErr: Object.fromEntries(ARMS.map((a) => [a, agg[a].corrRErr])),
  corrRErrSd: Object.fromEntries(ARMS.map((a) => [a, agg[a].corrRErrSd])),
  corrRSameRound: Object.fromEntries(ARMS.map((a) => [a, agg[a].corrRSameRound])),
  threshold: '|corr|>0.2 useful, 0.1–0.2 weak, else honest null',
  verdict: Object.fromEntries(ARMS.map((a) => [a, q3v(agg[a].corrRErr)])),
  meanR,
});
book('q4.answer', {
  question: 'LIE DETECTOR: does r drop when the adversary murmur dominates the HEDGE arm?',
  meanR_devGt03: agg.hedge.lieDetectorHi, meanR_devLt01: agg.hedge.lieDetectorLo,
  delta: agg.hedge.lieDetectorDelta, seeds: agg.hedge.lieDetectorSeeds,
  nHi: agg.hedge.lieDetectorNhi, nLo: agg.hedge.lieDetectorNlo,
  postTurnHi: agg.hedge.lieDetectorHiPost, postTurnLo: agg.hedge.lieDetectorLoPost,
  postTurnSeeds: agg.hedge.lieDetectorPostSeeds, postTurnNhi: agg.hedge.lieDetectorPostNhi, postTurnNlo: agg.hedge.lieDetectorPostNlo,
  detects: agg.hedge.lieDetectorDelta !== null && agg.hedge.lieDetectorDelta < 0,
});

// ---------------- findings ----------------
const F = [
  `Q1 ranking by mean error: ${rank.map((a) => `${a}=${agg[a].meanErr}`).join(' < ')} (sd ${rank.map((a) => agg[a].sdErr).join('/')}). ${agg.trueSigma.meanErr < agg.uniform.meanErr ? 'σ-weighting beats uniform' : 'σ-weighting does NOT beat uniform (honest)'}; ${agg.uniform.meanErr < agg.majority.meanErr ? 'uniform beats majority' : 'majority matches/beats uniform'} — majority is robust to the single liar (minority exclusion) but wastes the minority's information.`,
  `Q2 hedge adaptation: err 60–90 = ${agg.hedge.err60_90} → 120–200 = ${agg.hedge.err120_200} (Δ ${agg.hedge.deltaErr60to120}; uniform no-learning control Δ ${agg.uniform.deltaErr60to120}). Adversary final weight ${agg.hedge.hedgeAdvWeight} ±${agg.hedge.hedgeAdvWeightSd} vs 1/12 = ${BASELINE_W.toFixed(4)} baseline (was ${agg.hedge.advWeightAtTurn} at turn): Hedge ${agg.hedge.hedgeAdvWeight < BASELINE_W ? 'DEMOTED the liar below baseline' : 'FAILED to demote the liar (honest)'}; sharp honest cells now hold ${agg.hedge.sharpWeightFinal}.`,
  `Q3 r as error predictor: corr(r_t, err_{t+1}) per arm ${ARMS.map((a) => `${a}=${agg[a].corrRErr}`).join(', ')} → ${ARMS.map((a) => `${a}:${q3v(agg[a].corrRErr)}`).join(', ')}. Same-round corr(r_t, err_t) ${ARMS.map((a) => `${a}=${agg[a].corrRSameRound}`).join(', ')} — the order parameter reads THIS mesh's coherence, not tomorrow's noise.`,
  `Q4 lie detector: mean r when |p_adv − posterior| > 0.3 = ${agg.hedge.lieDetectorHi} vs < 0.1 = ${agg.hedge.lieDetectorLo} (Δ = ${agg.hedge.lieDetectorDelta}, n=${agg.hedge.lieDetectorNhi}/${agg.hedge.lieDetectorNlo} rounds/seed) — r ${agg.hedge.lieDetectorDelta < 0 ? 'DROPS when the liar dominates: the order parameter is a usable lie detector' : 'does NOT drop (honest null)'}. Post-turn-only variant (n=${agg.hedge.lieDetectorPostNhi}/${agg.hedge.lieDetectorPostNlo} rounds/seed, both buckets in ${agg.hedge.lieDetectorPostSeeds}/20 seeds): hi ${agg.hedge.lieDetectorHiPost} vs lo ${agg.hedge.lieDetectorLoPost}.`,
  `Sheet/engine: hedge.pool === MurmurBus reference math across ${T * SEEDS} rounds (max |diff| ${maxDiff.toExponential(2)}, mismatches ${maxMis}); env.truth read by 0 decision formulas (score-only, asserted in preflight).`,
];
book('findings', { findings: F });

book('chain.seal', { rows: rows.length, digest: fnv1a64(rows) });
const v = verifyChain(sealChain(rows));
const tip = rows[rows.length - 1].row_hash;
console.log(`receipts: ${rows.length} rows, chain ${v.ok ? 'VERIFIED' : 'BROKEN'} tip=${tip} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);

// ---------------- outputs ----------------
const summary = {
  experiment: 'E16 — resonance as a lie detector',
  config: rows.find((r) => r.kind === 'run.config'),
  preflight: pf,
  perArm: agg,
  questions: { q1: rows.find((r) => r.kind === 'q1.answer'), q2: rows.find((r) => r.kind === 'q2.answer'), q3: rows.find((r) => r.kind === 'q3.answer'), q4: rows.find((r) => r.kind === 'q4.answer') },
  findings: F,
  curvesSeed0: Object.fromEntries(ARMS.map((a) => [a, perSeed[0].curve[a]])),
  perSeedHedge: perSeed.map((s) => ({ seed: s.seed, advWeightFinal: +s.advWeightFinal.toFixed(5), advWeightAtTurn: +s.advWeightAtTurn.toFixed(5), sharpFinal: +s.sharpFinal.toFixed(5), entropyFinal: +s.entropyFinal.toFixed(4), lieHiMean: s.lieHiMean === null ? null : +s.lieHiMean.toFixed(4), lieLoMean: s.lieLoMean === null ? null : +s.lieLoMean.toFixed(4), lieHiN: s.lieHiN, lieLoN: s.lieLoN, lieHiPostN: s.lieHiPostN, lieLoPostN: s.lieLoPostN, trustFinal: s.trustFinal, maxSheetVsBusDiff: s.maxPoolDiff })),
  meanR,
  chain: { rows: rows.length, verified: v.ok, links: v.links, tip },
  runtimeMs: Date.now() - t0,
};
writeFileSync(new URL('./outputs/e16_summary.json', import.meta.url), JSON.stringify(summary, null, 1));
writeFileSync(new URL('./outputs/receipts_e16.jsonl', import.meta.url), rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
console.log(v.ok ? 'E16 DONE' : 'E16 CHAIN BROKEN');
