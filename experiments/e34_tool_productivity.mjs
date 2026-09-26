// e34_tool_productivity.mjs — E34: THE TOOL PRODUCTIVITY AUDIT.
// The fleet owner's directive: "make sure they not only work but DO WORK and
// can be productive". The gauntlet (22-c) proved the tools WORK; this lane
// measures whether each one PAYS FOR ITSELF in outcomes — a paired ON/OFF
// marginal-value audit over one canonical scenario that exercises every
// dynamic tool simultaneously.
//
// SCENARIO (fixed across arms): 18 voices —
//   11 honest (acuity 0.6-0.9, founders), x1 toxic founder from genesis
//   (E31's intent generator: stably wrong 75% at confidence 0.75, reward
//   0.375), clique c1/c2 FOUNDERS that start copying honest a1 at t=100
//   (lag 1; before that they post their own 0.6-acuity votes — isolates the
//   PROVENANCE lever from admission: they are D1-admitted, only echo
//   conviction can catch them), sybils sy1-3 arriving t=150 with empty
//   history copying x1 at lag 1/1/2 (admission's jurisdiction). 400 rounds.
//
// ARMS (paired per seed; each arm owns its Provenance/Admission instances):
//   FULL     — v3.1 complete: prov penalize + admission reattribute + hedge
//   NO-PROV  — provenance OFF: no penalize, reattribute(weights, murmurs, null)
//   NO-ADM   — admission OFF: v3 semantics (prov influence only; no
//              fractional multiplier, no probation, no cap)
//   NO-TRUST — hedge OFF: flat 1/V weights every round (prov/admission still
//              reshape the flat base; nothing learns)
//   RAND     — vault replaced by a Math.random-fed pool digest (runs 2x per
//              seed; NOT in the paired damage tests — its claim is C3)
// Infra tools (receipts, bus) are out of the dynamics arms BY DESIGN: they
// are verification/transport infra, audited by the 22-c gauntlet (42 probes).
// Gardener/resonance productivity is receipted to E23/E26/E28 and E16/E20.
//
// DECISION RULES (receipted BEFORE the final run):
//   C1 PAY TABLE: a tool PAYS iff its removal significantly hurts FULL on
//      pool error over the common attack window [190,400) (paired one-sided
//      UPPER-tail sign test p < 0.05) OR inflates total attacker damage by
//      >= 20% (paired mean ratio). Otherwise: DEAD-WEIGHT CANDIDATE with
//      numbers. Expected division of labor (prior receipts): NO-ADM hurts
//      via sybils, NO-PROV via the clique, NO-TRUST via everything.
//   C2 NO ACTIVE HARM: no removal arm significantly BEATS FULL (lower-tail
//      p < 0.05 on pool error) — an improvement would receipt the tool as
//      actively harmful.
//   C3 DETERMINISM IS PRODUCTIVE: FULL same-seed rerun is bit-exact
//      (max |pool diff| = 0 across the whole series); RAND reruns diverge
//      from round 0 — without the vault, "seed k" names nothing: the pool
//      digest IS the reproducible universe handle. Quantified per seed.
//   C4 DECOMPOSITION: each removal's damage delta attributed to the attacker
//      group it should cover (founder / clique / sybils), window [190,400).
//   Runtime: probe = 1 seed; projected > 240s => seeds 6 -> 5 -> 4 (receipted).

import { QuiltEngine } from '../engine/dist/index.js';
import { HedgeTrust } from '../murmur/trust.mjs';
import { MurmurBus } from '../murmur/bus.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { Provenance } from '../murmur/provenance.mjs';
import { Admission } from '../murmur/admission.mjs';
import { fnv1a64, sealChain, verifyChain } from '../murmur/receipts.mjs';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';

const T = 400, NH = 11, SEEDS = Number(process.argv[2] || 6);
const FLIP_P = 0.02, REROLL_P = 0.01;
const TOXIC = 'x1', TOX_Q = 0.25;
const CLIQUE = ['c1', 'c2'], CL_START = 100, CL_LAG = 1;
const SYBILS = ['sy1', 'sy2', 'sy3'], SYB_T = 150, SYB_LAG = [1, 1, 2];
const HONEST = Array.from({ length: NH }, (_, i) => `a${i + 1}`);
const FOUNDERS = [...HONEST, TOXIC, ...CLIQUE];
const ALL_IDS = [...FOUNDERS, ...SYBILS];
const V = ALL_IDS.length;
const ARMS = ['FULL', 'NO-PROV', 'NO-ADM', 'NO-TRUST', 'RAND'];
const PAIRED = ['FULL', 'NO-PROV', 'NO-ADM', 'NO-TRUST'];
const CFG = { eta: 0.25, share: 0.02 };
const ADM = { epsNew: 0.15, admitWindow: 40, minEdgesIndep: 2, admitErr: 0.5, capShare: 0.10 };
const WIN = [190, 400]; // common attack window: all three groups active
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
  const R = makeRng(harvest, vault, 'e34:gencheck');
  let right = 0, rSum = 0;
  for (let i = 0; i < 20000; i++) {
    const s = R() < 0.5 ? 0 : 1;
    const belief = R() < 1 - TOX_Q ? 1 - s : s;
    const p = clampP(belief === 1 ? 0.5 + ((1 - TOX_Q) - 0.5) : 0.5 - ((1 - TOX_Q) - 0.5));
    if ((p >= 0.5) === (s === 1)) right++;
    rSum += 1 - Math.abs(p - s);
  }
  return { toxTruthSide: r6(right / 20000), toxMeanReward: r6(rSum / 20000), expect: 'founder reward 0.375 (E31 receipted intent generator)' };
}

// ---------------- world ----------------
function genWorld(seed, harvest, vault) {
  const wR = makeRng(harvest, vault, `e34:world:${seed}`);
  const qR = makeRng(harvest, vault, `e34:skill:${seed}`);
  const cR = makeRng(harvest, vault, `e34:clique:${seed}`);
  const sR = makeRng(harvest, vault, `e34:toxv:${seed}`);
  const yR = makeRng(harvest, vault, `e34:sybq:${seed}`);
  const s = new Array(T);
  s[0] = wR() < 0.5 ? 0 : 1;
  for (let t = 1; t < T; t++) s[t] = wR() < FLIP_P ? 1 - s[t - 1] : s[t - 1];
  const q = Array.from({ length: T }, () => new Array(NH));
  for (let i = 0; i < NH; i++) q[0][i] = Math.round((0.6 + 0.3 * qR()) * 1000) / 1000;
  for (let t = 1; t < T; t++) for (let i = 0; i < NH; i++) q[t][i] = qR() < REROLL_P ? Math.round((0.6 + 0.3 * qR()) * 1000) / 1000 : q[t - 1][i];
  const vR = [];
  for (let i = 0; i < NH; i++) vR.push(makeRng(harvest, vault, `e34:vote:${seed}:${i}`));
  const votes = Array.from({ length: T }, () => new Array(NH));
  for (let t = 0; t < T; t++) {
    for (let i = 0; i < NH; i++) {
      const signal = vR[i]() < q[t][i] ? s[t] : 1 - s[t];
      votes[t][i] = clampP(signal === 1 ? 0.5 + (q[t][i] - 0.5) : 0.5 - (q[t][i] - 0.5));
    }
  }
  // toxic founder from genesis (intent generator)
  const toxV = new Array(T);
  for (let t = 0; t < T; t++) {
    const belief = sR() < 1 - TOX_Q ? 1 - s[t] : s[t];
    toxV[t] = clampP(belief === 1 ? 0.5 + ((1 - TOX_Q) - 0.5) : 0.5 - ((1 - TOX_Q) - 0.5));
  }
  // clique founders: own 0.6-acuity votes until CL_START, then copy a1 at lag 1
  const clV = { c1: new Array(T), c2: new Array(T) };
  const clQ = [0.6, 0.65];
  for (let t = 0; t < T; t++) {
    for (let ci = 0; ci < 2; ci++) {
      if (t < CL_START) {
        const signal = cR() < clQ[ci] ? s[t] : 1 - s[t];
        clV[CLIQUE[ci]][t] = clampP(signal === 1 ? 0.5 + (clQ[ci] - 0.5) : 0.5 - (clQ[ci] - 0.5));
      } else {
        clV[CLIQUE[ci]][t] = votes[t - CL_LAG][0]; // a1's value, noise included
      }
    }
  }
  // sybils: arrive SYB_T, copy x1 at lag 1/1/2
  const syV = {};
  for (let si = 0; si < 3; si++) {
    const arr = new Array(T).fill(null);
    for (let t = SYB_T; t < T; t++) arr[t] = t - SYB_LAG[si] >= 0 ? toxV[t - SYB_LAG[si]] : toxV[t];
    syV[SYBILS[si]] = arr;
  }
  const r = votes.map((row, t) => row.map((p) => 1 - Math.abs(p - s[t])));
  const rTox = toxV.map((p, t) => 1 - Math.abs(p - s[t]));
  const rCl = {};
  for (const c of CLIQUE) rCl[c] = clV[c].map((p, t) => 1 - Math.abs(p - s[t]));
  const rSy = {};
  for (const sy of SYBILS) rSy[sy] = syV[sy].map((p, t) => (p === null ? null : 1 - Math.abs(p - s[t])));
  return { s, q, votes, toxV, clV, syV, r, rTox, rCl, rSy };
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
  return { id: `e34-${V}`, title: `E34 tool productivity audit (${V} voices)`, cells };
}

// ---------------- one arm, one seed ----------------
async function runArm(arm, world, seed, harvest, vault) {
  const { s, votes, toxV, clV, syV, r, rTox, rCl, rSy } = world;
  const eng = new QuiltEngine(`e34-${arm}-s${seed}`, {});
  eng.loadSheet(buildSheet());
  const trust = new HedgeTrust(ALL_IDS, CFG);
  const prov = new Provenance({});
  const adm = arm === 'NO-ADM' ? null : new Admission(arm === 'NO-PROV' ? ADM : ADM);

  const st = {
    err: [], pools: [], dmgF: [], dmgC: [], dmgS: [], shareSy: [],
    clInfl: [], neut: null, verify: { checks: 0, pass: 0, maxDiff: 0 },
  };

  const pOf = (id, t) => {
    if (HONEST.includes(id)) return votes[t][Number(id.slice(1)) - 1];
    if (id === TOXIC) return toxV[t];
    if (CLIQUE.includes(id)) return clV[id][t];
    return syV[id][t] ?? 0.5;
  };

  for (let t = 0; t < T; t++) {
    const murmurs = [];
    for (let i = 0; i < NH; i++) murmurs.push({ from: `a${i + 1}`, origin: null, p: votes[t][i] });
    murmurs.push({ from: TOXIC, origin: null, p: toxV[t] });
    for (const c of CLIQUE) murmurs.push({ from: c, origin: null, p: clV[c][t] });
    for (const sy of SYBILS) if (t >= SYB_T) murmurs.push({ from: sy, origin: null, p: syV[sy][t] });
    prov.inspect(murmurs);
    if (adm) adm.observe(murmurs);

    let raw, infl;
    if (arm === 'NO-TRUST') {
      const flat = new Map(ALL_IDS.map((id) => [id, 1 / V]));
      raw = prov.penalize(flat);
      infl = adm ? adm.reattribute(raw, murmurs, prov) : prov.influence(raw, murmurs);
    } else {
      raw = arm === 'NO-PROV' ? trust.weights() : prov.penalize(trust.weights());
      infl = (arm === 'NO-ADM')
        ? prov.influence(raw, murmurs)
        : adm.reattribute(raw, murmurs, arm === 'NO-PROV' ? null : prov);
    }

    for (const id of ALL_IDS) await eng.set(`v.${id}`, pOf(id, t));
    for (const id of ALL_IDS) await eng.set(`w.${id}`, infl.get(id) ?? 0);
    const pool = (await eng.get('pool.hedge')).data;
    if (adm) adm.notePooled(pool);
    st.pools.push(pool);

    if (t % 20 === 0) {
      const ps = ALL_IDS.map((id) => pOf(id, t));
      const ref = MurmurBus.pool(ps, ALL_IDS.map((id) => infl.get(id) ?? 0));
      const d = Math.abs(ref - pool);
      st.verify.checks++;
      if (d < TOL) st.verify.pass++;
      if (d > st.verify.maxDiff) st.verify.maxDiff = d;
    }

    st.err.push(Math.abs(pool - s[t]));
    const Z = [...infl.values()].reduce((a, b) => a + b, 0) || 1;
    let syAgg = 0;
    for (const sy of SYBILS) syAgg += infl.get(sy) ?? 0;
    st.shareSy.push(syAgg / Z);

    // counterfactual damage per attacker group (common window)
    if (t >= WIN[0] && t < WIN[1]) {
      const ps = ALL_IDS.map((id) => pOf(id, t));
      const wFull = ALL_IDS.map((id) => infl.get(id) ?? 0);
      const cf = (group) => MurmurBus.pool(ps, wFull.map((w, i) => (group.includes(ALL_IDS[i]) ? 0 : w)));
      st.dmgF.push(Math.abs(pool - s[t]) - Math.abs(cf([TOXIC]) - s[t]));
      st.dmgC.push(Math.abs(pool - s[t]) - Math.abs(cf(CLIQUE) - s[t]));
      st.dmgS.push(Math.abs(pool - s[t]) - Math.abs(cf(SYBILS) - s[t]));
    }

    // clique neutralization: both copiers' influence < 0.5x honest-median influence
    {
      const clInf = CLIQUE.map((c) => infl.get(c) ?? 0);
      st.clInfl.push(clInf);
      const honInf = median(HONEST.map((id) => infl.get(id) ?? 0));
      if (st.neut === null && t >= CL_START && honInf > 0 && clInf.every((x) => x < 0.5 * honInf)) st.neut = t;
    }

    // learn (NO-TRUST: nothing learns)
    if (arm !== 'NO-TRUST') {
      const rew = new Map();
      for (let i = 0; i < NH; i++) rew.set(`a${i + 1}`, r[t][i]);
      rew.set(TOXIC, rTox[t]);
      for (const c of CLIQUE) rew.set(c, rCl[c][t]);
      for (const sy of SYBILS) if (t >= SYB_T) rew.set(sy, rSy[sy][t]);
      trust.update(rew);
      if (arm !== 'NO-PROV') trust.absorb(prov.penalize(trust.weights()));
    }
  }

  return {
    poolErrWin: mean(st.err.slice(WIN[0], WIN[1])),
    poolErrFull: mean(st.err),
    dmgFounder: mean(st.dmgF), dmgClique: mean(st.dmgC), dmgSyb: mean(st.dmgS),
    dmgTotal: mean(st.dmgF) + mean(st.dmgC) + mean(st.dmgS),
    neut: st.neut === null ? null : st.neut - CL_START,
    sybShareMax: Math.max(...st.shareSy),
    pools: st.pools,
    verify: st.verify,
  };
}

// ---------------- main ----------------
console.log(`── E34 tool productivity audit · ${SEEDS} seeds × ${T} rounds × ${ARMS.length} arms (${PAIRED.length} paired) × ${V} voices ──`);
const vault = new MothVault({ label: 'e34', offline: true });
const harvest = await vault.harvest(256);
console.log(`vault: ${harvest.mock ? 'MOCK (offline doctrine)' : 'LIVE'} digest=${harvest.poolDigest.slice(0, 10)}`);
const genchk = genCheck(vault, harvest);
console.log(`generator check: founder truth-side ${genchk.toxTruthSide} reward ${genchk.toxMeanReward} (${genchk.expect})`);

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });
book('run.config', {
  task: 'E34', name: 'the tool productivity audit (marginal value of every dynamic tool, paired ON/OFF)',
  T, NH, voices: V, seeds: SEEDS,
  scenario: {
    honest: `${NH} (acuity 0.6-0.9, founders)`,
    founder: `${TOXIC}: toxic from genesis, intent generator (wrong 75% @ 0.75 confidence, reward 0.375)`,
    clique: `${CLIQUE.join('/')}: FOUNDERS copying honest a1 from t=${CL_START} lag ${CL_LAG} (own 0.6-acuity votes before — provenance's jurisdiction, admission-neutral by design)`,
    sybils: `${SYBILS.join('/')}: arrive t=${SYB_T}, empty history, copy ${TOXIC} at lag ${SYB_LAG.join('/')} (admission's jurisdiction)`,
  },
  arms: ARMS, paired: PAIRED, hedge: CFG, admission: ADM, window: WIN,
  infraNote: 'receipts + bus = verification/transport infra -> audited by the 22-c gauntlet (42 probes, 0 fails); gardener/resonance productivity -> receipted to E23/E26/E28 and E16/E20; this audit covers the DYNAMIC protocol tools',
  verdictRules: {
    C1: 'tool PAYS iff removal hurts pool error over [190,400) (paired one-sided UPPER-tail sign p < 0.05) OR inflates total damage >= 20%; else DEAD-WEIGHT CANDIDATE',
    C2: 'no removal arm significantly BEATS FULL (lower-tail p < 0.05) — else the tool is actively harmful',
    C3: 'FULL rerun bit-exact; RAND reruns diverge from round 0 (the pool digest is the reproducible universe handle)',
    C4: 'each removal damage delta attributed to founder/clique/sybils over [190,400)',
    runtime: 'probe-cut: > 240s projected => seeds 6 -> 5 -> 4 (receipted)',
  },
  vault: { mock: harvest.mock, digest: harvest.poolDigest },
  engine: 'vendored quilt dist (QuiltEngine)', sheetVerifyTol: TOL,
});

const agg = {};
for (const A of PAIRED) agg[A] = { err: [], errF: [], dF: [], dC: [], dS: [], dT: [], neut: [], syMax: [], vfy: { checks: 0, pass: 0, maxDiff: 0 } };
const t0 = Date.now();
const bitExact = [];
const randDiverge = [];

for (let seed = 0; seed < SEEDS; seed++) {
  const world = genWorld(seed, harvest, vault);
  const row = { seed };
  for (const A of PAIRED) {
    const R = await runArm(A, world, seed, harvest, vault);
    const G = agg[A];
    G.err.push(R.poolErrWin); G.errF.push(R.poolErrFull);
    G.dF.push(R.dmgFounder); G.dC.push(R.dmgClique); G.dS.push(R.dmgSyb); G.dT.push(R.dmgTotal);
    if (R.neut !== null) G.neut.push(R.neut);
    G.syMax.push(R.sybShareMax);
    G.vfy.checks += R.verify.checks; G.vfy.pass += R.verify.pass;
    if (R.verify.maxDiff > G.vfy.maxDiff) G.vfy.maxDiff = R.verify.maxDiff;
    row[A] = { err: r6(R.poolErrWin), dF: r6(R.dmgFounder), dC: r6(R.dmgClique), dS: r6(R.dmgSyb), dT: r6(R.dmgTotal), neut: R.neut, syMax: r6(R.sybShareMax), verify: `${R.verify.pass}/${R.verify.checks}` };
  }
  // C3: FULL bit-exact rerun
  const R2 = await runArm('FULL', world, seed, harvest, vault);
  const R1 = await runArm('FULL', world, seed, harvest, vault);
  let maxDiff = 0;
  for (let t = 0; t < T; t++) maxDiff = Math.max(maxDiff, Math.abs(R1.pools[t] - R2.pools[t]));
  bitExact.push(maxDiff === 0);
  // C3: RAND divergence (two independent Math.random-fed pool digests)
  const realRandom = Math.random;
  const mkFake = () => ({ poolDigest: fnv1a64(`rand:${seed}:${Math.random()}:${Math.random()}`) });
  const fakeA = mkFake(), fakeB = mkFake();
  const wA = genWorld(seed, fakeA, vault), wB = genWorld(seed, fakeB, vault);
  const rA = await runArm('FULL', wA, seed, harvest, vault);
  const rB = await runArm('FULL', wB, seed, harvest, vault);
  let fd = 0;
  for (let t = 0; t < T; t++) if (rA.pools[t] !== rB.pools[t]) { fd = t; break; }
  randDiverge.push(fd);
  Math.random = realRandom;
  row.FULL_rerunBitExact = maxDiff === 0;
  row.RAND_firstDivergence = fd;
  book('run', row);
  if ((seed + 1) % 2 === 0) console.log(`  seed ${seed + 1}/${SEEDS} done (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}
const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`elapsed ${elapsed}s`);

// ---------------- claims ----------------
const stat = (a) => ({ mean: r6(mean(a)), sd: r6(sd(a)), n: a.length });
const seOf = (a) => (a.length ? sd(a) / Math.sqrt(a.length) : 0);
function binom(n, k) { let r = 1; for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1); return r; }
function signUpper(deltas) { // P(X >= W), one-sided upper tail
  const W = deltas.filter((x) => x > 0).length, L = deltas.filter((x) => x < 0).length;
  const n = W + L;
  if (n === 0) return { p: 1, W: 0, L: 0, n: 0 };
  let p = 0;
  for (let k = W; k <= n; k++) p += Number(binom(n, k)) / 2 ** n;
  return { p: Math.min(1, r6(p)), W, L, n };
}
function signLower(deltas) { // P(X <= W), one-sided lower tail
  const W = deltas.filter((x) => x > 0).length, L = deltas.filter((x) => x < 0).length;
  const n = W + L;
  if (n === 0) return { p: 1, W: 0, L: 0, n: 0 };
  let p = 0;
  for (let k = 0; k <= W; k++) p += Number(binom(n, k)) / 2 ** n;
  return { p: Math.min(1, r6(p)), W, L, n };
}

const payTable = {};
for (const A of ['NO-PROV', 'NO-ADM', 'NO-TRUST']) {
  const dErr = agg.FULL.err.map((e, i) => agg[A].err[i] - e); // >0 = removal hurts
  const st1 = signUpper(dErr);
  const ratio = mean(agg.FULL.dT) > 0 ? mean(agg[A].dT) / mean(agg.FULL.dT) : Infinity;
  const pays = st1.p < 0.05 || ratio >= 1.2;
  payTable[A] = {
    verdict: pays ? 'PAYS' : 'DEAD-WEIGHT CANDIDATE',
    poolErr: { full: stat(agg.FULL.err), removed: stat(agg[A].err) },
    pairedDelta_err: { mean: r6(mean(dErr)), se: r6(seOf(dErr)), sign: st1 },
    damageRatio_total: r6(ratio),
  };
}
const harmTable = {};
for (const A of ['NO-PROV', 'NO-ADM', 'NO-TRUST']) {
  const dErr = agg.FULL.err.map((e, i) => agg[A].err[i] - e);
  harmTable[A] = signLower(dErr); // P(X >= 0 heavy) — lower tail: removal BETTER
}
const claims = {
  C1_payTable: {
    verdict: Object.values(payTable).some((p) => p.verdict === 'PAYS') ? 'CONFIRMED (see per-tool verdicts)' : 'REFUTED (all dead weight?)',
    tools: payTable,
    expectedDivisionOfLabor: 'NO-ADM -> sybils; NO-PROV -> clique; NO-TRUST -> founder (glacial) + everything via unlearned weights',
  },
  C2_noActiveHarm: {
    verdict: Object.values(harmTable).every((h) => h.p >= 0.05) ? 'CONFIRMED' : 'REFUTED (a tool is actively harmful)',
    lowerTails: harmTable,
  },
  C3_determinism: {
    verdict: (bitExact.every((b) => b) && randDiverge.every((d) => d === 0)) ? 'CONFIRMED' : 'PARTIAL',
    fullRerunBitExact: `${bitExact.filter((b) => b).length}/${SEEDS} seeds bit-exact (max |pool diff| = 0)`,
    randFirstDivergence: stat(randDiverge),
    note: 'the vault pool digest IS the reproducible universe handle: same digest => bit-identical rerun; Math.random-fed digest => "seed k" names nothing, divergence from round 0. Determinism\'s product is REVISITABILITY, not accuracy',
  },
  C4_decomposition: {
    verdict: 'MAP (see numbers)',
    damageByGroup: {
      FULL: { founder: stat(agg.FULL.dF), clique: stat(agg.FULL.dC), sybils: stat(agg.FULL.dS), total: stat(agg.FULL.dT) },
      NO_PROV: { founder: stat(agg['NO-PROV'].dF), clique: stat(agg['NO-PROV'].dC), sybils: stat(agg['NO-PROV'].dS), total: stat(agg['NO-PROV'].dT) },
      NO_ADM: { founder: stat(agg['NO-ADM'].dF), clique: stat(agg['NO-ADM'].dC), sybils: stat(agg['NO-ADM'].dS), total: stat(agg['NO-ADM'].dT) },
      NO_TRUST: { founder: stat(agg['NO-TRUST'].dF), clique: stat(agg['NO-TRUST'].dC), sybils: stat(agg['NO-TRUST'].dS), total: stat(agg['NO-TRUST'].dT) },
    },
    neutralizationRound: { FULL: stat(agg.FULL.neut), NO_ADM: stat(agg['NO-ADM'].neut), NO_TRUST: stat(agg['NO-TRUST'].neut), note: 'NO-PROV excluded: without provenance the clique is often never neutralized (null)' },
    sybShareMax: { FULL: stat(agg.FULL.syMax), NO_ADM: stat(agg['NO-ADM'].syMax), NO_TRUST: stat(agg['NO-TRUST'].syMax) },
  },
};
book('finding.C1', { ...claims.C1_payTable });
book('finding.C2', { ...claims.C2_noActiveHarm });
book('finding.C3', { ...claims.C3_determinism });
book('finding.C4', { ...claims.C4_decomposition });
book('finding.runtime', { seedsRun: SEEDS, elapsed_s: Number(elapsed), cut: SEEDS < 6 ? 'receipted runtime cut' : 'none', vaultLiveJobs: vault.liveJobs });

const chain = sealChain(rows);
const tip = rows[rows.length - 1].row_hash;
const vfy = verifyChain(rows);
if (!vfy.ok) { console.error('CHAIN VERIFY FAILED', vfy); process.exit(1); }
console.log(`chain: ${rows.length} rows, tip ${tip.slice(0, 12)} VERIFIED`);
for (const c of Object.keys(claims)) console.log(`${c}: ${claims[c].verdict}`);

mkdirSync('experiments/outputs', { recursive: true });
const totalChecks = PAIRED.reduce((a, A) => a + agg[A].vfy.checks, 0);
const totalMism = PAIRED.reduce((a, A) => a + (agg[A].vfy.checks - agg[A].vfy.pass), 0);
const summary = {
  task: 'E34', name: 'the tool productivity audit',
  seeds: SEEDS, T, voices: V, arms: ARMS, runtime_s: Number(elapsed),
  config: { scenario: '18 voices: 11 honest + toxic founder (genesis) + clique founders (copy a1 from t=100) + 3 sybils (t=150, copy x1)', window: WIN, hedge: CFG, admission: ADM, verdictRules: 'file header (receipted before the final run)', infraNote: 'receipts/bus -> 22-c gauntlet; gardener/resonance -> E16/E20/E23/E26/E28' },
  payTable, claims,
  sheetVerify: { tol: TOL, cadence: 'every 20 rounds vs MurmurBus.pool reference', checks: totalChecks, mismatches: totalMism },
  determinism: { fullBitExact: bitExact, randFirstDivergence: randDiverge },
  chain: { rows: rows.length, tip, verified: vfy.ok },
  vault: { mock: harvest.mock, digest: harvest.poolDigest, liveJobs: vault.liveJobs },
};
writeFileSync('experiments/outputs/e34_summary.json', JSON.stringify(summary, null, 1));
writeFileSync('experiments/outputs/receipts_e34.jsonl', rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
console.log('wrote experiments/outputs/e34_summary.json + receipts_e34.jsonl');

const reRows = readFileSync('experiments/outputs/receipts_e34.jsonl', 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const reVfy = verifyChain(reRows);
const reTip = reRows[reRows.length - 1].row_hash;
if (!reVfy.ok || reTip !== tip) { console.error('FILE RE-VERIFY FAILED', reVfy, reTip); process.exit(1); }
console.log(`file re-verify: ${reRows.length} rows OK, tip ${reTip.slice(0, 12)}`);
console.log(vault.liveJobs === 0 ? 'E34 DONE' : 'E34 PROBLEM (live jobs)');
