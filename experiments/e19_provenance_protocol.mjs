// E19 — THE PROVENANCE PROTOCOL (murmur-protocol-v3 under fire)
// ============================================================
// E17's receipted open wound: outcome-trust never SAW the echo — it ranked a
// plagiarist slightly below its source only by accident of lag. E19 tests the
// protocol lever the fleet said must come next: provenance-carrying murmurs.
//
// THE ATTACK (sharper than E17's single echo): an echo BLOCK. Three
// plagiarists copy source a1 at lags 2/3/5 during rounds 100–300. Each copy
// is outcome-legible (rewards near the source's), so plain hedge trust feeds
// the whole block — one observer's opinion acquires 4× independent-looking
// influence, and at every regime flip the pool is dragged toward STALE
// content exactly when diversity matters most. Plus one legitimate relay r1
// that honestly re-broadcasts a2 (origin declared, always on) — under v3 it
// is range extension; under no protocol it is indistinguishable from an echo.
//
// ARMS (paired worlds, same murmurs):
//   hedge          — E17-style outcome trust, raw weights. (vulnerable)
//   hedge+prov     — v3: provenance re-attribution only (echo ×0.15,
//                    dup ×0.5, relay → 0.2 × trust(origin)). Trust state pure.
//   hedge+prov+pen — v3 + state penalty: each confirmed-plagiarist round
//                    multiplies its trust weight by (1−0.15), floor 0.02.
//
// THE DETECTOR (bus-side, content-only, no oracle): rolling 30-round window,
// lags 1..6, tol 0.03; confirm at match-rate ≥ 0.8 with a STABLE best (k, L)
// pair → 'echo'; flat content (sd ≤ 0.02) → 'dup' (the honest near-0.5
// collision case — gentle discount, no penalty); declared origin verified →
// 'relay'. Tags are reviewed every round and unstick when copying stops.
//
// CLAIMS (each gets a receipt row):
//   C1 amplification — plain hedge: echo-block share of pooled influence
//      inflates past its fair 4/13; v3 collapses it to ≈ the source alone.
//   C2 theft — plain hedge: w_echo/w_source → ~1 (crown-adjacent); v3+pen:
//      collapses toward the floor.
//   C3 boundary price — at state flips (±3 rounds) the amplified stale block
//      costs accuracy; v3 recovers it.
//   C4 relay economics — r1 correctly tagged 'relay', influence rides its
//      origin's trust, and the pool is not double-counting a2.
//   C5 detector honesty — confusion matrix vs ground truth; FP on honest
//      senders bounded (worst case a 'dup', never a penalized 'echo').
//   C6 the sheet is untouched — pool formulas identical across arms; only
//      the weights arriving at w.* differ (protocol = convention).
//
// Run: node experiments/e19_provenance_protocol.mjs [seeds]

import { QuiltEngine } from '../engine/dist/index.js';
import { HedgeTrust } from '../murmur/trust.mjs';
import { MurmurBus } from '../murmur/bus.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { Provenance } from '../murmur/provenance.mjs';
import { fnv1a64 } from '../murmur/receipts.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

// ---------------- config ----------------
const T = 400, N = 8, SEEDS = Number(process.argv[2] || 24);
const FLIP_P = 0.02, REROLL_P = 0.01;
const WIN = { from: 100, to: 300 };
const ECHOES = [
  { id: 'e1', source: 'a1', lag: 1 },
  { id: 'e2', source: 'a1', lag: 1 },
  { id: 'e3', source: 'a1', lag: 2 },
];
const RELAY = { id: 'r1', source: 'a2', lag: 2 }; // origin declared, always on
const ALL_IDS = [...Array.from({ length: N }, (_, i) => `a${i + 1}`), ...ECHOES.map((e) => e.id), RELAY.id];
const V = ALL_IDS.length; // 13 voices
const ARMS = ['hedge', 'hedge+prov', 'hedge+prov+pen'];
const CFG = { eta: 0.25, share: 0.02 };
const TOL = 1e-9;
const BOUND = 3; // flip ±BOUND rounds = boundary set

// ---------------- helpers ----------------
const clampP = (p) => Math.min(0.98, Math.max(0.02, p));
const gauss = (u1, u2) => Math.sqrt(-2 * Math.log(Math.max(1e-9, u1))) * Math.cos(2 * Math.PI * u2);
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length); };
const r6 = (x) => (Number.isFinite(x) ? +x.toFixed(6) : x);
// RECEIPTED VAULT DOCTRINE (E17 finding #0): one harvest, per-purpose keys,
// every draw is the FIRST draw of its own cross-key sub-stream.
function makeRng(harvest, vault, purpose) {
  let d = 0;
  return () => vault.streamFor(harvest, `${purpose}:${d++}`)();
}

// ---------------- world ----------------
function genWorld(seed, harvest, vault) {
  const wR = makeRng(harvest, vault, `e19:world:${seed}`);
  const qR = makeRng(harvest, vault, `e19:skill:${seed}`);
  const eR = makeRng(harvest, vault, `e19:echo:${seed}`);
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
  for (let i = 0; i < N; i++) vR.push(makeRng(harvest, vault, `e19:vote:${seed}:${i}`));
  const votes = Array.from({ length: T }, () => new Array(N));
  for (let t = 0; t < T; t++) {
    for (let i = 0; i < N; i++) {
      const signal = vR[i]() < q[t][i] ? s[t] : 1 - s[t];
      votes[t][i] = clampP(signal === 1 ? 0.5 + (q[t][i] - 0.5) : 0.5 - (q[t][i] - 0.5));
    }
  }
  // echo block: copies of a1's vote inside the window, noise outside.
  const echoV = ECHOES.map(({ lag }) => new Array(T));
  for (let e = 0; e < ECHOES.length; e++) {
    const { lag } = ECHOES[e];
    for (let t = 0; t < T; t++) {
      echoV[e][t] = (t >= WIN.from && t <= WIN.to && t >= lag)
        ? votes[t - lag][0]
        : clampP(0.5 + gauss(eR(), eR()) * 0.3);
    }
  }
  // the honest relay: re-broadcasts a2 with lag, origin declared, all rounds.
  const relayV = new Array(T);
  for (let t = 0; t < T; t++) {
    relayV[t] = t >= RELAY.lag ? votes[t - RELAY.lag][1] : clampP(0.5 + gauss(eR(), eR()) * 0.3);
  }
  const r = votes.map((row, t) => row.map((p) => 1 - Math.abs(p - s[t])));
  const rEcho = echoV.map((col) => col.map((p, t) => 1 - Math.abs(p - s[t])));
  const rRelay = relayV.map((p, t) => 1 - Math.abs(p - s[t]));
  const flips = [];
  for (let t = 1; t < T; t++) if (s[t] !== s[t - 1]) flips.push(t);
  return { s, q, votes, echoV, relayV, r, rEcho, rRelay, flips };
}

// ---------------- sheet (13 voices; formulas IDENTICAL for every arm) --------
function buildSheet() {
  const cells = [];
  for (const id of ALL_IDS) cells.push({ id: `v.${id}`, kind: 'value', value: 0.5, description: `voice ${id} (posterior P(s=1))` });
  for (const id of ALL_IDS) cells.push({ id: `w.${id}`, kind: 'value', value: 1 / V, description: `influence weight ${id} (protocol-adjusted)` });
  const lg = (x) => `Math.log(clamp(${x},0.02,0.98)/(1-clamp(${x},0.02,0.98)))`;
  const sig = (z) => `(1/(1+Math.exp(-(${z}))))`;
  const hT = [], hD = [];
  for (const id of ALL_IDS) { hT.push(`w.${id}*${lg(`v.${id}`)}`); hD.push(`w.${id}`); }
  cells.push({ id: 'pool.hedge', kind: 'formula', expr: sig(`(${hT.join(' + ')}) / (${hD.join(' + ')})`) });
  // in-sheet amplification meter: echo block (source + 3 copies) influence share
  const block = ['w.a1', 'w.e1', 'w.e2', 'w.e3'];
  cells.push({ id: 'amp.block', kind: 'formula', expr: `(${block.join(' + ')}) / (${hD.join(' + ')})` });
  return { id: `prov-${V}`, title: `E19 provenance protocol (${V} voices)`, cells };
}

// ---------------- one seed, three paired arms ----------------
async function runSeed(seed, world) {
  const { s, votes, echoV, relayV, r, rEcho, rRelay, flips } = world;
  const eng = new QuiltEngine(`e19-prov-s${seed}`, {});
  eng.loadSheet(buildSheet());

  const trust = {}; // per-arm HedgeTrust
  for (const A of ARMS) trust[A] = new HedgeTrust(ALL_IDS, CFG);
  const prov = new Provenance({}); // content-only: shared by all arms

  const out = {};
  for (const A of ARMS) {
    out[A] = { sumPool: 0, boundary: [], blockWin: [], blockWin2: [], theft: [], theft300: null, ampFactor: [], verify: { checks: 0, pass: 0 },
      wAt: {}, detLat: {}, effVoices: [] };
  }
  const boundarySet = new Set(flips.flatMap((t) => [t - 1, t, t + 1, t + 2, t + 3].filter((u) => u >= 0 && u < T)));

  for (let t = 0; t < T; t++) {
    // ---- murmurs (protocol v3 envelopes) ----
    const murmurs = [];
    for (let i = 0; i < N; i++) murmurs.push({ from: `a${i + 1}`, origin: null, p: votes[t][i] });
    ECHOES.forEach((E, e) => murmurs.push({ from: E.id, origin: null, p: echoV[e][t] })); // plagiarists claim self
    murmurs.push({ from: RELAY.id, origin: 'a2', p: relayV[t] }); // honest relay declares
    prov.inspect(murmurs);

    // ---- rewards per voice (supervised pool) ----
    const rew = new Map();
    for (let i = 0; i < N; i++) rew.set(`a${i + 1}`, r[t][i]);
    ECHOES.forEach((E, e) => rew.set(E.id, rEcho[e][t]));
    rew.set(RELAY.id, rRelay[t]);

    for (const A of ARMS) {
      const st = out[A];
      // raw trust weights this round
      let raw = trust[A].weights();
      // state penalty (pen arm): confirmed plagiarists decayed since last round
      if (A === 'hedge+prov+pen') raw = prov.penalize(raw);
      // protocol layer -> influence weights
      const infl = A === 'hedge' ? raw : prov.influence(raw, murmurs);

      // ---- the sheet does the pooled inference (identical formulas) ----
      for (const id of ALL_IDS) await eng.set(`v.${id}`, murmurs.find((m) => m.from === id).p);
      for (const id of ALL_IDS) await eng.set(`w.${id}`, infl.get(id));
      const pool = (await eng.get('pool.hedge')).data;
      const amp = (await eng.get('amp.block')).data;

      if (t % 20 === 0) {
        const ps = ALL_IDS.map((id) => murmurs.find((m) => m.from === id).p);
        const ref = MurmurBus.pool(ps, ALL_IDS.map((id) => infl.get(id)));
        st.verify.checks++;
        if (Math.abs(ref - pool) < TOL) st.verify.pass++;
      }

      // ---- accounting ----
      const acc = 1 - Math.abs(pool - s[t]);
      st.sumPool += acc;
      if (boundarySet.has(t)) st.boundary.push(acc);
      const inWin = t >= WIN.from && t <= WIN.to;
      if (inWin) {
        st.blockWin.push(amp);
        if (t >= WIN.from + (WIN.to - WIN.from) / 2) st.blockWin2.push(amp);
      }
      // effective #independent voices (inverse participation ratio of influence)
      const Z = [...infl.values()].reduce((a, b) => a + b, 0) || 1;
      st.effVoices.push(1 / [...infl.values()].reduce((a, b) => a + (b / Z) ** 2, 0));
      // theft ratio: worst echo trust / source trust (raw trust state)
      const wS = raw.get('a1');
      const wE = Math.max(raw.get('e1'), raw.get('e2'), raw.get('e3'));
      st.theft.push(wE / Math.max(1e-9, wS));
      if (t === WIN.to) st.theft300 = wE / Math.max(1e-9, wS);
      // amplification factor: one observer's pooled VOICE mass vs its own —
      // measured on INFLUENCE weights (what the pool actually consumes)
      const ampF = (infl.get('a1') + infl.get('e1') + infl.get('e2') + infl.get('e3')) / Math.max(1e-9, infl.get('a1'));
      if (inWin) st.ampFactor.push(ampF);
      if (t === WIN.to) st.wAt.t300 = { a1: r6(raw.get('a1')), e1: r6(raw.get('e1')), e2: r6(raw.get('e2')), e3: r6(raw.get('e3')), r1: r6(raw.get('r1')) };
      if (t === T - 1) st.wAt.final = { a1: r6(raw.get('a1')), e1: r6(raw.get('e1')), e2: r6(raw.get('e2')), e3: r6(raw.get('e3')), r1: r6(raw.get('r1')) };

      // ---- learn ----
      trust[A].update(rew);
      if (A === 'hedge+prov+pen') trust[A].absorb(prov.penalize(trust[A].weights()));
    }
    if (seed === 0 && t === WIN.from + 40) {
      for (const A of ARMS) out[A].detLat.midWinTags = Object.fromEntries(ALL_IDS.map((id) => [id, prov.tag(id)]));
    }
  }
  // detection latency from the shared detector's event log
  const detLat = {};
  for (const E of ECHOES) {
    const ev = prov.events.find((e) => e.from === E.id && e.tag === 'echo');
    detLat[E.id] = ev ? ev.t - WIN.from : null;
  }
  detLat.r1 = prov.events.find((e) => e.from === RELAY.id && e.tag === 'relay')?.t ?? null;

  // ---- hindsight best fixed voice (of 13) ----
  const tot = ALL_IDS.map((id) => {
    if (id.startsWith('a')) return r.reduce((a, row) => a + row[Number(id.slice(1)) - 1], 0);
    const ei = ECHOES.findIndex((E) => E.id === id);
    if (ei >= 0) return rEcho[ei].reduce((a, b) => a + b, 0);
    return rRelay.reduce((a, b) => a + b, 0);
  });
  const best = tot.indexOf(Math.max(...tot));

  const truth = new Map(ECHOES.map((E) => [E.id, 'echo']));
  truth.set(RELAY.id, 'relay');
  const cm = prov.confusion(truth, ALL_IDS);

  const res = { verify: {}, learners: {} };
  for (const A of ARMS) {
    const st = out[A];
    res.learners[A] = {
      poolAcc: st.sumPool / T,
      regret: tot[best] - st.sumPool,
      boundaryAcc: mean(st.boundary),
      blockShareWin: mean(st.blockWin),
      blockShareWin2: mean(st.blockWin2),
      ampFactorWin: mean(st.ampFactor),
      effVoices: mean(st.effVoices),
      theftFinal: st.theft[st.theft.length - 1],
      theftAt300: st.theft300,
      wAt: st.wAt,
      detLat: { ...detLat, midWinTags: st.detLat.midWinTags },
      verify: st.verify,
    };
  }
  res.detector = { cm, events: prov.events.length, floor: CFG };
  return res;
}

// ---------------- main ----------------
console.log(`── E19 provenance protocol · ${SEEDS} seeds × ${T} rounds × ${ARMS.length} arms × ${V} voices ──`);
const vault = new MothVault({ label: 'e19', offline: true });
const harvest = await vault.harvest(256);
console.log(`vault: ${harvest.mock ? 'MOCK (offline doctrine)' : 'LIVE ' + harvest.jobId} digest=${harvest.poolDigest.slice(0, 10)} bits=${harvest.bits.length}`);

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });
book('run.config', {
  task: 'E19', name: 'the provenance protocol (murmur-protocol-v3 under fire)',
  T, N, voices: V, seeds: SEEDS,
  world: { stateFlipP: FLIP_P, skillRerollP: REROLL_P, qRange: [0.5, 0.95] },
  attack: { window: WIN, echoes: ECHOES, relay: RELAY, note: 'echo block copies a1 at lags 2/3/5 (undeclared origin = plagiarism); r1 re-broadcasts a2 with declared origin (honest relay)' },
  protocol: { envelope: '{topic, from, origin, p, n, ttl}', detector: { maxLag: 6, tol: 0.03, window: 30, confirm: 0.8, dupSigma: 0.02 }, discounts: { echo: 0.15, dup: 0.5, relay: 0.2, penalty: 0.15, floor: 0.02 } },
  arms: ARMS, hedge: CFG, reward: 'r_i = 1 - |p_i - s_t| (supervised pool)',
  vault: { mock: harvest.mock, digest: harvest.poolDigest },
  engine: 'vendored quilt dist (QuiltEngine)', sheetVerifyTol: TOL,
});

const agg = {};
for (const A of ARMS) {
  agg[A] = { acc: [], reg: [], bnd: [], blk: [], blk2: [], amp: [], eff: [], theft: [], theft300: [], vfy: { checks: 0, pass: 0 }, w300: [], wFinal: [], det: [] };
}
let cmAgg = {}, detEvents = [];
const t0 = Date.now();

for (let seed = 0; seed < SEEDS; seed++) {
  const world = genWorld(seed, harvest, vault);
  const res = await runSeed(seed, world);
  for (const A of ARMS) {
    const R = res.learners[A], G = agg[A];
    G.acc.push(R.poolAcc); G.reg.push(R.regret); G.bnd.push(R.boundaryAcc);
    G.blk.push(R.blockShareWin); G.blk2.push(R.blockShareWin2); G.amp.push(R.ampFactorWin);
    G.eff.push(R.effVoices); G.theft.push(R.theftFinal); G.theft300.push(R.theftAt300);
    G.vfy.checks += R.verify.checks; G.vfy.pass += R.verify.pass;
    if (R.wAt.t300) G.w300.push(R.wAt);
    if (R.wAt.final) G.wFinal.push(R.wAt);
    G.det.push(R.detLat);
  }
  for (const [k, v] of Object.entries(res.detector.cm)) cmAgg[k] = (cmAgg[k] ?? 0) + v;
  detEvents.push(res.learners['hedge+prov'].detLat);
  if ((seed + 1) % 6 === 0) console.log(`  seed ${seed + 1}/${SEEDS} done (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}

// ---------------- aggregate + receipts ----------------
const fairShare = 4 / V;
const summary = {};
for (const A of ARMS) {
  const G = agg[A];
  const w300e = mean(G.w300.map((w) => Math.max(w.t300.e1, w.t300.e2, w.t300.e3)));
  summary[A] = {
    poolAcc: { mean: r6(mean(G.acc)), sd: r6(sd(G.acc)) },
    regret: { mean: r6(mean(G.reg)), sd: r6(sd(G.reg)) },
    boundaryAcc: { mean: r6(mean(G.bnd)), sd: r6(sd(G.bnd)) },
    blockShareWin: { mean: r6(mean(G.blk)), sd: r6(sd(G.blk)), fairShare: r6(fairShare) },
    blockShareWin2: { mean: r6(mean(G.blk2)), sd: r6(sd(G.blk2)) },
    ampFactorWin: { mean: r6(mean(G.amp)), sd: r6(sd(G.amp)), unamplified: 1.0 },
    effVoices: { mean: r6(mean(G.eff)), maxPossible: V },
    theftAt300: { mean: r6(mean(G.theft300)), sd: r6(sd(G.theft300)) },
    theftRatioFinal: { mean: r6(mean(G.theft)), sd: r6(sd(G.theft)) },
    wEchoMaxAt300: r6(w300e),
    wSourceAt300: r6(mean(G.w300.map((w) => w.t300.a1))),
    wEchoMaxFinal: r6(mean(G.wFinal.map((w) => Math.max(w.final.e1, w.final.e2, w.final.e3)))),
    wSourceFinal: r6(mean(G.wFinal.map((w) => w.final.a1))),
    sheetVerify: G.vfy,
  };
}
// detector receipts
const detLatE = ECHOES.map((E) => mean(detEvents.map((d) => d[E.id]).filter((x) => x !== null && x !== undefined)));
const relayTagged = detEvents.filter((d) => d.r1 !== null && d.r1 !== undefined).length;
book('detector.receipt', {
  confusion: cmAgg,
  truth: { e1: 'echo', e2: 'echo', e3: 'echo', r1: 'relay', 'a1..a8': 'clean' },
  detectionLatencyRoundsAfterWindowStart: { e1: r6(detLatE[0]), e2: r6(detLatE[1]), e3: r6(detLatE[2]), expected: '~window+1 = 31' },
  relayConfirmedSeeds: `${relayTagged}/${SEEDS}`,
  honestEchoFalsePositives: (cmAgg['clean->echo'] ?? 0) + (cmAgg['relay->echo'] ?? 0),
});
book('C1.amplification', {
  claim: 'one observer (a1 + 3 near-sync copies) speaks with ~4x its own mass under plain hedge; v3 collapses the factor toward 1',
  ampFactorWin: { hedge: summary['hedge'].ampFactorWin, prov: summary['hedge+prov'].ampFactorWin, pen: summary['hedge+prov+pen'].ampFactorWin },
  blockShareWin2: { hedge: summary['hedge'].blockShareWin2, prov: summary['hedge+prov'].blockShareWin2, pen: summary['hedge+prov+pen'].blockShareWin2 },
  verdict: null,
});
book('C2.theft', {
  claim: 'at window end (t=300) plain hedge lets echoes reach ~0.9 of source trust; the v3 penalty holds them near the floor',
  theftAt300: { hedge: summary['hedge'].theftAt300, prov: summary['hedge+prov'].theftAt300, pen: summary['hedge+prov+pen'].theftAt300 },
  wAt300: Object.fromEntries(ARMS.map((A) => [A, { src: summary[A].wSourceAt300, echo: summary[A].wEchoMaxAt300 }])),
  postScript: 'post-window (t=399) echoes reform and trust re-mixes — theftRatioFinal reported for completeness',
  theftRatioFinal: { hedge: summary['hedge'].theftRatioFinal, prov: summary['hedge+prov'].theftRatioFinal, pen: summary['hedge+prov+pen'].theftRatioFinal },
  verdict: null,
});
book('C3.boundaryPrice', {
  claim: 'stale amplified content costs accuracy at regime flips; v3 recovers it',
  boundaryAcc: { hedge: summary['hedge'].boundaryAcc, prov: summary['hedge+prov'].boundaryAcc, pen: summary['hedge+prov+pen'].boundaryAcc },
  verdict: null,
});
book('C4.relayEconomics', {
  claim: "honest relay r1 rides its origin's trust (influence = eps_relay × w_a2), correctly tagged",
  prov_r1Influence_vs_a2: r6(0.2), relayConfirmedSeeds: `${relayTagged}/${SEEDS}`,
  verdict: null,
});
book('C5.detectorHonesty', {
  claim: 'FP on honest senders bounded: worst case dup (gentle), never penalized echo',
  confusion: cmAgg,
  verdict: null,
});
book('C6.sheetUntouched', {
  claim: 'identical pool formulas across arms; only arriving weights differ',
  sheetVerify: Object.fromEntries(ARMS.map((A) => [A, summary[A].sheetVerify])),
  verdict: null,
});

// verdicts (computed, not asserted)
{
  const S = summary;
  const c1 = S['hedge'].ampFactorWin.mean > 1.8
    && S['hedge+prov'].ampFactorWin.mean < S['hedge'].ampFactorWin.mean - 0.8 ? 'CONFIRMED'
    : (S['hedge+prov'].ampFactorWin.mean < S['hedge'].ampFactorWin.mean - 0.2 ? 'PARTIAL' : 'REFUTED');
  const theftHedge = S['hedge'].theftAt300.mean;
  const theftPen = S['hedge+prov+pen'].theftAt300.mean;
  const c2 = theftPen < theftHedge - 0.3 ? 'CONFIRMED' : (theftPen < theftHedge ? 'PARTIAL' : 'REFUTED');
  const c3 = S['hedge+prov+pen'].boundaryAcc.mean > S['hedge'].boundaryAcc.mean ? 'CONFIRMED' : 'REFUTED';
  const c4 = relayTagged >= Math.floor(SEEDS * 0.9) ? 'CONFIRMED' : 'PARTIAL';
  const c5 = (cmAgg['clean->echo'] ?? 0) + (cmAgg['relay->echo'] ?? 0) === 0 ? 'CONFIRMED' : 'PARTIAL';
  const vfyAll = ARMS.every((A) => summary[A].sheetVerify.pass === summary[A].sheetVerify.checks && summary[A].sheetVerify.checks > 0);
  const c6 = vfyAll ? 'CONFIRMED' : 'PARTIAL';
  for (const [k, v] of [['C1.amplification', c1], ['C2.theft', c2], ['C3.boundaryPrice', c3], ['C4.relayEconomics', c4], ['C5.detectorHonesty', c5], ['C6.sheetUntouched', c6]]) {
    rows.find((r) => r.kind === k).verdict = v;
  }
}

book('run.summary', { arms: summary });
book('headline', {
  finding: null, // filled below after print
});

mkdirSync('experiments/outputs', { recursive: true });
writeFileSync('experiments/outputs/e19_receipts.json', JSON.stringify({ rows, summary }, null, 2));

console.log('\n══ E19 PROVENANCE PROTOCOL ══');
for (const A of ARMS) {
  const S = summary[A];
  console.log(`${A.padEnd(15)} acc=${S.poolAcc.mean.toFixed(4)} boundary=${S.boundaryAcc.mean.toFixed(4)} amp×=${S.ampFactorWin.mean.toFixed(2)} theft300=${S.theftAt300.mean.toFixed(3)} blk2=${S.blockShareWin2.mean.toFixed(3)} effV=${S.effVoices.mean.toFixed(1)}/${V} verify=${S.sheetVerify.pass}/${S.sheetVerify.checks}`);
}
console.log(`detector: ${JSON.stringify(cmAgg)} lat≈${r6(mean(detLatE))}r relay ${relayTagged}/${SEEDS}`);
console.log(`verdicts: ${rows.filter((r) => r.kind.startsWith('C')).map((r) => `${r.kind.split('.')[0]}=${r.verdict}`).join(' ')}`);
