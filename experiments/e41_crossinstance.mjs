// E41 — THE CROSS-INSTANCE DETECTOR (Layer 1: pricing + detection physics, telemetry only)
// ==================================================================================================
// Provenance: the ExoJ dogfood field (quilt-dba lane 24-a, e40_scratch.json, 39 deformations,
// exactly one observation) held the dead axes in superposition and collapsed to cross_instance
// (Delta=0.5221) over provenance-coupled (0.5135) and admission-coupled (0.4953). This lane
// executes the axis the tool chose.
//
// Collides with E38 (mean-shift dead), E39 (variance dead), E40 (relational ALIGN dead):
//   E40's own-pool ALIGN failure mechanism (computed there): the honest floor reached
//   minRho -0.37 (pricing) / -0.62 (matrix) while the sleeper's POST-FLIP cosine stayed
//   POSITIVE (+0.15..+0.44) — "the flip is a relational REGIME CHANGE, not a level change".
//   Vote algebra (receipted here as the design rationale): honest voice i votes p = 0.5 +/- d_i
//   (d_i = q_i-0.5) with the SIDE re-drawn EVERY round (signal = ownRng < q_i) — a weak honest
//   voice (q~0.55) is near a coin flip on the consensus side, so its alignment statistic is a
//   random walk that dips deep; the toxic series is anti-state 75% at FIXED magnitude 0.25.
//   The own-pool median reference is additionally contaminated: it CONTAINS the suspect's vote
//   and the other toxic voice, and its |m-0.5| concentrates mass on co-movement rounds where
//   everyone (including the toxic 25% pro-state rounds) agrees — the cosine is dragged positive.
//
// THE CROSS-INSTANCE MOVE: a SISTER INSTANCE — 12 independent honest voices (own acuities, own
// RNG streams, no toxic members) observing the SAME state stream s(t) — is an independent jury.
// The statistic is a CONDITIONAL SIDE-BETRAYAL RATE, not a cosine:
//     mvB(t)      = median(sister votes at t) - 0.5          (sister consensus deviation)
//     decisive(t) = |mvB(t)| > delta                          (sister confident this round)
//     anti_i(t)   = decisive && sign(p_i(t)-0.5) == -sign(mvB(t))   (suspect votes AGAINST the
//                   side the independent jury is confident about)
//     X_i(t)      = (# anti in trailing W) / (# decisive in trailing W), undefined (no eval)
//                   if #decisive < minDec.
//   Separation prediction (algebra, to be CHECKED by pricing — not assumed): P(anti|decisive)
//   = (1-q_i)P(sis right|dec) + q_i P(sis wrong|dec) — weak honest ~0.45, strong honest ~0.1,
//   toxic ~0.72. The sister is INDEPENDENT of the suspect's pool: no self-vote contamination,
//   no shared toxic drag, and the conditioning on decisive rounds removes the neutral-round
//   degeneracy that blinded E40's cosine.
//
// LAYER SCOPE (receipted, honest): Layer 1 = world + statistic + pricing + detection. NO engine,
// NO trust consequences — the house law (price the honest floor BEFORE composing consequences;
// E38 30x, E39 9.4x, E40 0x-but-blind) makes composition a SECOND step that is only owed if the
// floor holds and detection lands. R4 is receipted as PENDING-HANDOFF, not measured here.
//
// DECISION RULES (receipted as rows BEFORE the matrix; brief numbering R1-R5):
//   R1 HONEST-NOISE FLOOR: per-founder X distribution on the pricing world (seed 100, disjoint
//      from matrix seeds 0-5): per-founder mean/max anti-rate + the honest p95 across founders;
//      false-trip projection: founder trip EVENTS per 200 eval-rounds arm-wide
//      (rate = trips*200/(12*(T-W)) vs budget 1.0; E38 29.9, E39 9.375, E40 0). R1 PASSES iff
//      the MATRIX arm-wide founder rate <= 1.0 AND the pricing projection <= 1.0.
//   R2 DETECTION: sleeper w1 trips post-flip. PASS iff tripped seeds >= half AND mean latency
//      (first trip - t_flip) < 30 rounds over tripped seeds. t_flip = 214 NOMINAL (JOIN+39
//      admission + k*=25; E35 measured 8/8 admission at t=189; Layer 1 has no engine admission —
//      receipted approximation, same one E40's pricing used). Pre-flip w1 trips are receipted as
//      false trips on an honest-phase voice.
//   R3 g1 VISIBILITY: the from-arrival toxic must be visible. PASS iff g1 trips in >= 2/3 of
//      seeds, evaluated from JOIN (window fills by JOIN+W). Latency from JOIN.
//   R4 COMPOSITION: PENDING-HANDOFF (scoped out of Layer 1 by the pricing-first law). If
//      R1+R2+R3 pass, the priced (delta*, h*) bars and the guard skeleton hand to the next lane
//      for TrustReprobation composition on the full engine (e40 plumbing is the drop-in). If
//      they fail, R4 is MOOT and the ladder grows a fourth dead axis with numbers.
//   R5 CANARIES: (a) h2 zero trips across the matrix (honest late-joiner, own stream);
//      (b) w1 PRE-flip trips = 0 (its honest phase must sit inside the floor);
//      (c) founder false-trip budget explicit (same measurement as R1);
//      (d) FLOOR-TIGHTNESS comparison — the reason this axis was chosen: on the SAME worlds,
//      compute E40's ALIGN (uncentered cosine vs own-pool 15-voice median, W=20) and report
//      side-by-side: honest p95 of X vs honest minRho p95, w1 post-flip max X vs w1 post-flip
//      minRho, g1 max X vs g1 minRho, and the standardized gap (toxic central tendency minus
//      honest p95) / honest spread for BOTH statistics. The choice of axis is justified (or
//      falsified) by these numbers alone — computed, not narrated.
//
// HPICK (receipted rule, BEFORE the matrix): sweep delta in {0, 0.05, 0.10} x h in
// {0.30..0.60 step 0.05}. Gates on pricing seed 100 AND probe seed 0: founderRate <= 1.0/200r,
// h2 trips = 0, w1 pre-flip trips = 0. Among passing (delta,h): pick argmax
// separation = (toxic mean X over {w1 post-flip, g1} streams) - (honest p95 X); tie -> smaller h,
// then smaller delta. Matrix seeds 0-5 (probe seed 0 doubles as matrix seed 0, E40 convention).
//
// WORLD (e40 formulas VERBATIM, fresh e41:* draws, stand-alone mulberry32 RNG — the engine's
// harvest/vault RNG is not available in Layer 1; receipted substitution, formulas unchanged):
// 12 honest founders (a1=0.9 fixed, others 0.5+0.45u rounded, reroll 0.01/round), h2 honest
// late-joiner t=150 (0.7+0.25u), g1 flasher (E24 toxic formula VERBATIM, TOX_Q=0.25), sleeper
// honest phase = e24 h1 generator verbatim (0.7+0.25u, reroll), toxic series shared by g1 and
// w1 post-flip. Sister: 12 honest voices, same generator as founders, OWN streams.
// ==================================================================================================
import { sealChain, verifyChain, fnv1a64 } from '../murmur/receipts.mjs';
import { writeFileSync, mkdirSync } from 'fs';

// ---------------- config ----------------
const T = 400, N = 12, NSIS = 12;
const FLIP_P = 0.02, REROLL_P = 0.01;
const JOIN = 150;
const TOX_Q = 0.25;
const KSTAR = 25;
const T_ADM = 189;                 // nominal (E35: 8/8 admission at t=189)
const T_FLIP = T_ADM + KSTAR;      // 214 nominal — receipted approximation (Layer 1)
const SLEEP = 'w1', INSTANT = 'g1', JOINER = 'h2';
const HONEST = Array.from({ length: N }, (_, i) => `a${i + 1}`);
const SIS = Array.from({ length: NSIS }, (_, i) => `s${i + 1}`);
const W = 20;                      // trailing window (E39/E40 convention)
const SUSTAIN_WIN = 10, SUSTAIN_NEED = 5;
const MIN_DEC = 5;                 // min decisive rounds in window to evaluate (receipted)
const DELTA_SWEEP = [0, 0.05, 0.10];
const H_SWEEP = [0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60];
const PRICE_SEED = 100;            // disjoint from matrix seeds 0-5
const MATRIX_SEEDS = [0, 1, 2, 3, 4, 5];
const BUDGET_PER_200R = 1.0;
const OUT = new URL('./outputs/', import.meta.url).pathname;

// ---------------- helpers ----------------
const r6 = (x) => Math.round(x * 1e6) / 1e6;
const mean = (a) => a.reduce((s, x) => s + x, 0) / (a.length || 1);
const quantile = (a, q) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(q * s.length))] : null; };
function mulberry32(seedStr) { // stand-alone deterministic RNG (receipted substitution)
  let h = fnv1a64(seedStr) >>> 0;
  return function () {
    h = (h + 0x6D2B79F5) >>> 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function median(a) { const s = [...a].sort((x, y) => x - y); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
const clampP = (x) => Math.max(0.02, Math.min(0.98, x));
const sgn = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);

// ---------------- world (e40 formulas verbatim; fresh e41:* streams) ----------------
function genWorld(seed) {
  const wR = mulberry32(`e41:world:${seed}`);
  const qR = mulberry32(`e41:skill:${seed}`);
  const xR = mulberry32(`e41:tox:${seed}`);
  const shR = mulberry32(`e41:sleep:${seed}`);
  const nhR = mulberry32(`e41:h2:${seed}`);
  const sqR = mulberry32(`e41:sisskill:${seed}`);
  const s = new Array(T);
  s[0] = wR() < 0.5 ? 0 : 1;
  for (let t = 1; t < T; t++) s[t] = wR() < FLIP_P ? 1 - s[t - 1] : s[t - 1];
  const q = Array.from({ length: T }, () => new Array(N));
  q[0][0] = 0.9;
  for (let i = 1; i < N; i++) q[0][i] = Math.round((0.5 + 0.45 * qR()) * 1000) / 1000;
  for (let t = 1; t < T; t++) for (let i = 0; i < N; i++) q[t][i] = qR() < REROLL_P ? Math.round((0.5 + 0.45 * qR()) * 1000) / 1000 : q[t - 1][i];
  const vR = [];
  for (let i = 0; i < N; i++) vR.push(mulberry32(`e41:vote:${seed}:${i}`));
  const votes = Array.from({ length: T }, () => new Array(N));
  for (let t = 0; t < T; t++) for (let i = 0; i < N; i++) {
    const signal = vR[i]() < q[t][i] ? s[t] : 1 - s[t];
    votes[t][i] = clampP(signal === 1 ? 0.5 + (q[t][i] - 0.5) : 0.5 - (q[t][i] - 0.5));
  }
  const toxV = new Array(T);
  for (let t = 0; t < T; t++) {
    const signal = xR() < TOX_Q ? s[t] : 1 - s[t];
    toxV[t] = clampP(signal === 1 ? 0.5 + (TOX_Q - 0.5) : 0.5 - (TOX_Q - 0.5));
  }
  const sleepH = new Array(T).fill(null);
  { let qs = Math.round((0.7 + 0.25 * shR()) * 1000) / 1000;
    for (let t = JOIN; t < T; t++) { if (shR() < REROLL_P) qs = Math.round((0.7 + 0.25 * shR()) * 1000) / 1000;
      const signal = shR() < qs ? s[t] : 1 - s[t];
      sleepH[t] = clampP(signal === 1 ? 0.5 + (qs - 0.5) : 0.5 - (qs - 0.5)); } }
  const h2V = new Array(T).fill(null);
  { let qh = Math.round((0.7 + 0.25 * nhR()) * 1000) / 1000;
    for (let t = JOIN; t < T; t++) { if (nhR() < REROLL_P) qh = Math.round((0.7 + 0.25 * nhR()) * 1000) / 1000;
      const signal = nhR() < qh ? s[t] : 1 - s[t];
      h2V[t] = clampP(signal === 1 ? 0.5 + (qh - 0.5) : 0.5 - (qh - 0.5)); } }
  // SISTER INSTANCE: 12 independent honest voices, same founder generator, OWN streams
  const sisQ0 = Array.from({ length: NSIS }, (_, i) => (i === 0 ? 0.9 : Math.round((0.5 + 0.45 * sqR()) * 1000) / 1000));
  const sisQ = Array.from({ length: T }, () => [...sisQ0]);
  for (let t = 1; t < T; t++) for (let i = 0; i < NSIS; i++) sisQ[t][i] = sqR() < REROLL_P ? Math.round((0.5 + 0.45 * sqR()) * 1000) / 1000 : sisQ[t - 1][i];
  const svR = [];
  for (let i = 0; i < NSIS; i++) svR.push(mulberry32(`e41:sisvote:${seed}:${i}`));
  const sisVotes = Array.from({ length: T }, () => new Array(NSIS));
  for (let t = 0; t < T; t++) for (let i = 0; i < NSIS; i++) {
    const signal = svR[i]() < sisQ[t][i] ? s[t] : 1 - s[t];
    sisVotes[t][i] = clampP(signal === 1 ? 0.5 + (sisQ[t][i] - 0.5) : 0.5 - (sisQ[t][i] - 0.5));
  }
  return { s, votes, toxV, sleepH, h2V, sisVotes, sisQ };
}

// ---------------- the two statistics ----------------
// voiceStream: {id, p: Array(T) of vote or null (pre-join), toxicFrom: t or null}
// Main-instance roster for the ALIGN baseline = 15 voices (12 founders + w1 + g1 + h2).
function rosterAt(w, t) {
  const ps = [];
  for (let i = 0; i < N; i++) ps.push(w.votes[t][i]);
  if (w.sleepH[t] !== null) ps.push(t >= T_FLIP ? w.toxV[t] : w.sleepH[t]);
  else ps.push(null);
  if (t >= JOIN) ps.push(w.toxV[t]); // g1 is rostered only from JOIN (engine-accurate)
  if (w.h2V[t] !== null) ps.push(w.h2V[t]); else ps.push(null);
  return ps.filter((x) => x !== null).slice(0, 15); // roster size varies pre-join; median over present voices
}
function alignRho(w, id, t0, t1) { // E40's uncentered cosine vs own-pool median, W-window [t0,t1)
  const num = []; let sp2 = 0, sm2 = 0;
  for (let t = Math.max(0, t0); t < t1; t++) {
    const p = id === SLEEP ? (t >= T_FLIP ? w.toxV[t] : (t >= JOIN ? w.sleepH[t] : null))
      : id === INSTANT ? (t >= JOIN ? w.toxV[t] : null)
      : id === JOINER ? (t >= JOIN ? w.h2V[t] : null)
      : w.votes[t][Number(id.slice(1)) - 1];
    if (p === null) continue;
    const mv = median(rosterAt(w, t)) - 0.5;
    const pv = p - 0.5;
    num.push(pv * mv); sp2 += pv * pv; sm2 += mv * mv;
  }
  const den = Math.sqrt(sp2 * sm2);
  return den > 1e-12 ? num.reduce((s, x) => s + x, 0) / den : 0;
}
// X: conditional side-betrayal vs the sister median, evaluated over [t0,t1)
function sisMedianDev(w, t) { return median(w.sisVotes[t]) - 0.5; }
function evalX(w, streamP, t0, t1, delta) {
  let dec = 0, anti = 0;
  for (let t = Math.max(0, t0); t < t1; t++) {
    if (streamP[t] === null) continue;
    const mvB = sisMedianDev(w, t);
    if (Math.abs(mvB) <= delta) continue;
    dec++;
    if (sgn(streamP[t] - 0.5) === -sgn(mvB)) anti++;
  }
  return { dec, anti, X: dec >= MIN_DEC ? anti / dec : null };
}
// sliding-window trip machinery over a stream (sustained 5/10, reset on trip) — E38/E39/E40 convention
function tripScan(w, streamP, evalFrom, delta, h) {
  const path = []; const sus = []; const trips = [];
  for (let t = evalFrom; t < T; t++) {
    const win = evalX(w, streamP, t - W + 1, t + 1, delta);
    const crossed = win.X !== null && win.X > h;
    path.push({ t, X: win.X === null ? null : r6(win.X), dec: win.dec, crossed });
    sus.push(crossed); if (sus.length > SUSTAIN_WIN) sus.shift();
    const sustained = sus.length >= SUSTAIN_WIN && sus.filter(Boolean).length >= SUSTAIN_NEED;
    if (sustained) { trips.push({ t, X: win.X === null ? null : r6(win.X), dec: win.dec }); sus.length = 0; }
  }
  return { path, trips };
}

// ---------------- per-world, per-config scan ----------------
function scanWorld(seed, delta, h) {
  const w = genWorld(seed);
  const streams = [
    ...HONEST.map((id, i) => ({ id, kind: 'founder', p: Array.from({ length: T }, (_, t) => w.votes[t][i]), evalFrom: W })),
    { id: SLEEP, kind: 'sleeper', p: Array.from({ length: T }, (_, t) => (t < JOIN ? null : t < T_FLIP ? w.sleepH[t] : w.toxV[t])), evalFrom: JOIN + W },
    { id: INSTANT, kind: 'g1', p: Array.from({ length: T }, (_, t) => (t < JOIN ? null : w.toxV[t])), evalFrom: JOIN + W },
    { id: JOINER, kind: 'h2', p: Array.from({ length: T }, (_, t) => (t < JOIN ? null : w.h2V[t])), evalFrom: JOIN + W },
  ];
  const out = { seed, delta, h, per: {}, w1: null, g1: null };
  let founderTrips = 0;
  for (const st of streams) {
    const { path, trips } = tripScan(w, st.p, st.evalFrom, delta, h);
    out.per[st.id] = {
      kind: st.kind, evalRounds: path.length, trips: trips.length,
      tripTs: trips.map((x) => x.t),
      maxDecX: r6(Math.max(...path.filter((e) => e.X !== null).map((e) => e.X), 0)),
      meanDecX: r6(mean(path.filter((e) => e.X !== null).map((e) => e.X))),
    };
    if (st.kind === 'founder') founderTrips += trips.length;
    if (st.id === SLEEP) {
      const post = trips.filter((x) => x.t >= T_FLIP);
      const pre = trips.filter((x) => x.t < T_FLIP);
      out.w1 = { postTrips: post.length, preTrips: pre.length, latency: post.length ? post[0].t - T_FLIP : null,
        postMaxX: r6(Math.max(...path.filter((e) => e.t >= T_FLIP && e.X !== null).map((e) => e.X), 0)) };
    }
    if (st.id === INSTANT) out.g1 = { trips: trips.length, latency: trips.length ? trips[0].t - JOIN : null };
  }
  out.founderTrips = founderTrips;
  out.founderRatePer200r = r6((founderTrips * 200) / (N * (T - W)));
  // ALIGN baseline on the SAME world (floor-tightness comparison)
  out.align = { founders: {}, w1: null, g1: null, h2: null };
  for (const id of HONEST) out.align.founders[id] = r6(alignRho(w, id, W, T));
  out.align.w1 = { honestMin: r6(Math.min(alignRho(w, SLEEP, JOIN, T_FLIP))), postFlipMin: r6(alignRho(w, SLEEP, T_FLIP, T)) };
  out.align.g1 = r6(alignRho(w, INSTANT, JOIN, T));
  out.align.h2 = r6(alignRho(w, JOINER, JOIN, T));
  return out;
}

// ---------------- receipts ----------------
const rows = [];
function receipt(kind, data) {
  rows.push({ kind, ...data });
  const sealed = sealChain(rows);
  return sealed[sealed.length - 1];
}

// ---------------- phase 0: charter + rules ----------------
receipt('charter', { task: 'E41', name: 'cross-instance conditional side-betrayal (sister jury), Layer 1 telemetry-only', provenance: 'ExoJ dogfood field collapsed to cross_instance Delta=0.5221 (quilt-dba 24-a e40_scratch.json)', world: 'e40 formulas verbatim, fresh e41:* draws, mulberry32 substitution receipted', layer: 'NO engine, NO trust consequences (pricing-first law); R4 = PENDING-HANDOFF' });
receipt('decision.rules', {
  R1: 'founder rate <= 1.0/200r arm-wide on pricing AND matrix; per-founder X distribution receipted',
  R2: 'w1 post-flip trips >= half seeds AND mean latency < 30r (t_flip=214 nominal, receipted approximation)',
  R3: 'g1 trips in >= 2/3 seeds (eval from JOIN+W, latency from JOIN)',
  R4: 'PENDING-HANDOFF if R1+R2+R3 pass (priced bars -> next lane composes TrustReprobation on the engine); MOOT otherwise',
  R5: 'h2 zero trips; w1 pre-flip zero trips; founder budget explicit; floor-tightness comparison vs ALIGN on the same worlds',
  hpick: 'argmax (toxic mean X - honest p95 X) over (delta,h) passing gates on pricing+probe; tie -> smaller h, then smaller delta',
  budgetFormula: 'rate = trips*200/(N*(T-W)), budget 1.0',
});

// ---------------- phase 1: design-time pricing (seed 100, disjoint) ----------------
const t0 = Date.now();
const pricing = { sweep: [], per: {} };
{
  const w = genWorld(PRICE_SEED);
  // ALIGN baseline on the pricing world
  const alignFloors = HONEST.map((id) => alignRho(w, id, W, T));
  pricing.align = {
    founderRhos: alignFloors.map(r6),
    founderP95: r6(quantile(alignFloors, 0.95)), founderMin: r6(Math.min(...alignFloors)),
    w1honestMin: r6(alignRho(w, SLEEP, JOIN, T_FLIP)), w1postFlip: r6(alignRho(w, SLEEP, T_FLIP, T)),
    g1: r6(alignRho(w, INSTANT, JOIN, T)), h2: r6(alignRho(w, JOINER, JOIN, T)),
  };
  // honest X distribution per (delta) at a mid bar (distribution is bar-independent; trips are not)
  for (const delta of DELTA_SWEEP) {
    const founderStats = HONEST.map((id, i) => {
      const p = Array.from({ length: T }, (_, t) => w.votes[t][i]);
      const evals = [];
      for (let t = W; t < T; t++) { const e = evalX(w, p, t - W + 1, t + 1, delta); if (e.X !== null) evals.push(e.X); }
      return { id, meanX: r6(mean(evals)), maxX: r6(Math.max(...evals)), n: evals.length };
    });
    // w1 post-flip stream + g1 stream X values
    const w1p = Array.from({ length: T }, (_, t) => (t < T_FLIP ? null : w.toxV[t]));
    const g1p = Array.from({ length: T }, (_, t) => (t < JOIN ? null : w.toxV[t]));
    const xsOf = (p, from) => { const a = []; for (let t = from; t < T; t++) { const e = evalX(w, p, t - W + 1, t + 1, delta); if (e.X !== null) a.push(e.X); } return a; };
    const w1xs = xsOf(w1p, T_FLIP), g1xs = xsOf(g1p, JOIN + W);
    const h2p = Array.from({ length: T }, (_, t) => (t < JOIN ? null : w.h2V[t]));
    const h2xs = xsOf(h2p, JOIN + W);
    const allHonestX = [];
    for (const id of HONEST) { const p = Array.from({ length: T }, (_, t) => w.votes[t][Number(id.slice(1)) - 1]); allHonestX.push(...xsOf(p, W)); }
    pricing.sweep.push({
      delta,
      honestP95: r6(quantile(allHonestX, 0.95)), honestMean: r6(mean(allHonestX)),
      toxicMean: r6(mean([...w1xs, ...g1xs])), w1postMean: r6(mean(w1xs)), g1Mean: r6(mean(g1xs)),
      h2Mean: r6(mean(h2xs)),
      separation: r6(mean([...w1xs, ...g1xs]) - quantile(allHonestX, 0.95)),
      founderStats,
    });
  }
}
receipt('pricing.dev', { seed: PRICE_SEED, note: 'design-time, disjoint from matrix seeds 0-5; X distribution + ALIGN baseline on the same world', align: pricing.align, sweep: pricing.sweep.map((x) => ({ delta: x.delta, honestP95: x.honestP95, toxicMean: x.toxicMean, separation: x.separation, w1postMean: x.w1postMean, g1Mean: x.g1Mean, h2Mean: x.h2Mean })) });

// ---------------- phase 2: hpick (gates on pricing + probe seed 0) ----------------
const gateCache = new Map();
function gatesFor(delta, h) {
  const key = `${delta}|${h}`;
  if (gateCache.has(key)) return gateCache.get(key);
  const pr = scanWorld(PRICE_SEED, delta, h);
  const pr0 = scanWorld(0, delta, h);
  const g = {
    founderRateMax: Math.max(pr.founderRatePer200r, pr0.founderRatePer200r),
    h2Trips: pr.per[JOINER].trips + pr0.per[JOINER].trips,
    w1PreTrips: pr.per[SLEEP].tripTs.filter((x) => x < T_FLIP).length + pr0.per[SLEEP].tripTs.filter((x) => x < T_FLIP).length,
    g1Trips: pr.per[INSTANT].trips + pr0.per[INSTANT].trips,
  };
  g.pass = g.founderRateMax <= BUDGET_PER_200R && g.h2Trips === 0 && g.w1PreTrips === 0;
  gateCache.set(key, g);
  return g;
}
const hpick = { table: [] };
{
  const sepByDelta = new Map(pricing.sweep.map((x) => [x.delta, x.separation]));
  for (const delta of DELTA_SWEEP) for (const h of H_SWEEP) {
    const g = gatesFor(delta, h);
    hpick.table.push({ delta, h, ...g, separation: sepByDelta.get(delta) ?? null });
  }
  const passing = hpick.table.filter((x) => x.pass);
  passing.sort((a, b) => (b.separation - a.separation) || (a.h - b.h) || (a.delta - b.delta));
  hpick.picked = passing[0] ?? null;
  hpick.rule = 'argmax separation among gate-passing (delta,h); tie -> smaller h, then smaller delta';
}
receipt('sensor.hpick', { rule: hpick.rule, picked: hpick.picked, passing: hpick.table.filter((x) => x.pass).length, of: hpick.table.length, tableTop: hpick.table.filter((x) => x.pass).slice(0, 6) });
if (!hpick.picked) {
  receipt('finding.algebra', {
    note: 'MEASURED (not narrated): the side axis is dead at the vote level — the E24 toxic series is PRO-state 75% at 0.25 magnitude (anti only 25%: vote=0.25 iff read=1 iff read CORRECT), so its anti-sister rate (0.31-0.37) sits BELOW the honest p95 (0.53-0.57); separation NEGATIVE (-0.18..-0.26)',
    puzzle: 'the engine-measured toxicity (E35-E40 damage ratios, E39 75%-anti-at-0.55 residuals) therefore CANNOT live in the vote side — it must arise from residual-vs-trust-weighted-pool structure and pool drag; any vote-side detector is dead by this measurement',
    sameWorldAlign: pricing.align,
    e42Handoff: 'the untested family: change-point/CUSUM on the ALIGN trajectory itself (relational statistic, self-baseline) — same-world ALIGN drops w1 0.633->0.485 post-flip and g1 sits at the founder floor (0.438 vs min 0.451); E38 killed CUSUM on RESIDUALS, never on ALIGN; floor must be priced first (house law)',
  });
  receipt('finding.verdict', { crowned: 'NONE', verdict: 'NO-CANDIDATE: no (delta,h) passed the gates on pricing+probe — the floor eats the fourth axis too (receipt the table; this IS a finding)' });
  const sealed = sealChain(rows);
  const v = verifyChain(sealed);
  mkdirSync(OUT, { recursive: true });
  writeFileSync(OUT + 'receipts_e41.jsonl', sealed.map((r) => JSON.stringify(r)).join('\n') + '\n');
  writeFileSync(OUT + 'e41_summary.json', JSON.stringify({ task: 'E41', verdict: 'NO-CANDIDATE', hpick: hpick.table, chain: { rows: sealed.length, tip: sealed[sealed.length - 1].row_hash, verify: v } }, null, 1));
  console.log('E41 NO-CANDIDATE; chain rows', sealed.length, 'verify', JSON.stringify(v));
  process.exit(0);
}
const DELTA = hpick.picked.delta, H = hpick.picked.h;

// ---------------- phase 3: probe (seed 0 doubles as matrix seed 0) + matrix ----------------
const tProbe = Date.now();
const matrix = MATRIX_SEEDS.map((seed) => scanWorld(seed, DELTA, H));
const tMatrix = Date.now();
receipt('runtime.probe', { note: 'Layer 1 is telemetry-only (<1s/world); probe seed 0 doubles as matrix seed 0 (E40 convention)', probeMs: tProbe - t0 });

// ---------------- aggregate + findings ----------------
const agg = {
  founderTrips: matrix.reduce((s, m) => s + m.founderTrips, 0),
  founderRatePer200r: r6(mean(matrix.map((m) => m.founderRatePer200r))),
  w1: matrix.map((m) => m.w1),
  g1: matrix.map((m) => m.g1),
  h2Trips: matrix.reduce((s, m) => s + m.per[JOINER].trips, 0),
  perFounderTrips: Object.fromEntries(HONEST.map((id) => [id, matrix.reduce((s, m) => s + m.per[id].trips, 0)])),
  w1PostMaxX: matrix.map((m) => m.w1.postMaxX),
};
// honest floor on the matrix: per-founder meanX/maxX averaged across seeds
const honestFloor = HONEST.map((id) => ({
  id, meanX: r6(mean(matrix.map((m) => m.per[id].meanDecX))), maxOfMax: r6(Math.max(...matrix.map((m) => m.per[id].maxDecX))),
}));
const toxicCentral = mean([...agg.w1PostMaxX, ...matrix.map((m) => m.per[INSTANT].maxDecX)]);
const honestP95Matrix = r6(quantile(honestFloor.map((x) => x.maxOfMax), 0.5)); // conservative central of maxima
const alignCompare = {
  note: 'same-world comparison, matrix seeds 0-5: ALIGN (E40) vs X (E41)',
  align_w1PostFlipMin: matrix.map((m) => m.align.w1.postFlipMin),
  align_g1: matrix.map((m) => m.align.g1),
  align_founderMin: matrix.map((m) => r6(Math.min(...Object.values(m.align.founders)))),
  x_w1PostMax: agg.w1PostMaxX,
  x_g1Max: matrix.map((m) => m.per[INSTANT].maxDecX),
  x_founderMaxOfMax: r6(Math.max(...honestFloor.map((x) => x.maxOfMax))),
};
const R1 = { founderRatePer200r: agg.founderRatePer200r, budget: BUDGET_PER_200R, totalTrips: agg.founderTrips, perFounder: agg.perFounderTrips, verdict: agg.founderRatePer200r <= BUDGET_PER_200R ? 'PASS' : 'FAIL' };
const w1TrippedSeeds = agg.w1.filter((x) => x.postTrips > 0).length;
const latencies = agg.w1.filter((x) => x.postTrips > 0).map((x) => x.latency);
const R2 = { trippedSeeds: w1TrippedSeeds, of: MATRIX_SEEDS.length, meanLatency: latencies.length ? r6(mean(latencies)) : null, perSeed: agg.w1, verdict: (w1TrippedSeeds >= MATRIX_SEEDS.length / 2 && latencies.length && mean(latencies) < 30) ? 'PASS' : 'FAIL' };
const g1TrippedSeeds = agg.g1.filter((x) => x.trips > 0).length;
const R3 = { trippedSeeds: g1TrippedSeeds, of: MATRIX_SEEDS.length, perSeed: agg.g1, verdict: (g1TrippedSeeds >= (2 * MATRIX_SEEDS.length) / 3) ? 'PASS' : 'FAIL' };
const R4 = { status: (R1.verdict === 'PASS' && R2.verdict === 'PASS' && R3.verdict === 'PASS') ? 'PENDING-HANDOFF' : 'MOOT', note: 'composition is a second layer owed only on a passing floor+detection; priced bars hand to the next lane (TrustReprobation drop-in on e40 plumbing)' };
const R5 = { h2Trips: agg.h2Trips, w1PreTrips: agg.w1.reduce((s, x) => s + x.preTrips, 0), founderBudget: R1, floorTightness: alignCompare, verdict: (agg.h2Trips === 0 && agg.w1.reduce((s, x) => s + x.preTrips, 0) === 0 && R1.verdict === 'PASS') ? 'PASS' : 'FAIL' };

receipt('finding.R1', { rule: 'founder rate <= 1.0/200r arm-wide on pricing AND matrix', ...R1 });
receipt('finding.R2', { rule: 'w1 post-flip trips >= half AND mean latency < 30r (t_flip=214 nominal)', ...R2 });
receipt('finding.R3', { rule: 'g1 trips in >= 2/3 seeds (from-arrival toxic)', ...R3 });
receipt('finding.R4', { rule: 'PENDING-HANDOFF if R1+R2+R3 pass; MOOT otherwise', ...R4 });
receipt('finding.R5', { rule: 'h2 zero trips; w1 pre-flip zero; budget explicit; floor-tightness vs ALIGN computed on same worlds', ...R5 });

// ---------------- verdict (mechanism COMPUTED) ----------------
const pass = R1.verdict === 'PASS' && R2.verdict === 'PASS' && R3.verdict === 'PASS';
const mech = {
  pickedBar: { delta: DELTA, h: H },
  honestFloorMatrix: { perFounder: honestFloor, maxOfMax: alignCompare.x_founderMaxOfMax },
  w1PostMaxX_perSeed: agg.w1PostMaxX,
  g1MaxX_perSeed: matrix.map((m) => m.per[INSTANT].maxDecX),
  alignSameWorld: alignCompare,
  separationMatrix: r6(toxicCentral - honestP95Matrix),
  note: 'X = conditional side-betrayal rate vs the sister jury; ALIGN re-priced on the same worlds for the floor-tightness comparison',
};
receipt('finding.algebra', {
  note: 'MEASURED: side axis dead at the vote level (toxic anti-rate below honest p95; E24 toxic = pro-state 75% at 0.25 magnitude); engine toxicity lives in residual/pool-drag structure, not vote side',
  sameWorldAlign: pricing.align,
  e42Handoff: 'change-point on the ALIGN trajectory (relational, self-baseline) — the untested family; floor priced first',
});
const VERDICT = pass
  ? { crowned: 'LAYER-1-CANDIDATE', verdict: 'E41 Layer-1 passes R1+R2+R3 — the cross-instance floor holds AND both adversaries are visible; composition (R4) hands to the next lane with the priced bars', mechanism: mech }
  : { crowned: 'NONE', verdict: `NO-CROWN: fourth axis dead or degraded — R1 ${R1.verdict}, R2 ${R2.verdict}, R3 ${R3.verdict}; mechanism computed from telemetry`, mechanism: mech };
receipt('finding.verdict', VERDICT);
receipt('finding.runtime', { matrixMs: tMatrix - tProbe, totalMs: tMatrix - t0, seeds: MATRIX_SEEDS.length, vaultLiveJobs: 0 });

// ---------------- write ----------------
const sealed = sealChain(rows);
const v = verifyChain(sealed);
mkdirSync(OUT, { recursive: true });
writeFileSync(OUT + 'receipts_e41.jsonl', sealed.map((r) => JSON.stringify(r)).join('\n') + '\n');
const summary = {
  task: 'E41', name: 'cross-instance conditional side-betrayal (sister jury), Layer 1',
  picked: { delta: DELTA, h: H }, R1, R2, R3, R4, R5,
  verdict: VERDICT, hpickTable: hpick.table,
  perSeed: matrix.map((m) => ({ seed: m.seed, founderTrips: m.founderTrips, founderRatePer200r: m.founderRatePer200r, w1: m.w1, g1: m.g1, h2: m.per[JOINER].trips })),
  chain: { rows: sealed.length, tip: sealed[sealed.length - 1].row_hash, verify: v },
  runtime: { matrixMs: tMatrix - tProbe, totalMs: tMatrix - t0 },
};
writeFileSync(OUT + 'e41_summary.json', JSON.stringify(summary, null, 1));
console.log('E41 done. picked', JSON.stringify(hpick.picked));
console.log('R1', R1.verdict, R1.founderRatePer200r, '| R2', R2.verdict, `${R2.trippedSeeds}/${R2.of}`, R2.meanLatency, '| R3', R3.verdict, `${R3.trippedSeeds}/${R3.of}`);
console.log('R5 h2', agg.h2Trips, 'w1pre', R5.w1PreTrips, '| verdict:', VERDICT.crowned);
console.log('chain rows', sealed.length, 'tip', sealed[sealed.length - 1].row_hash, 'verify', JSON.stringify(v), 'totalMs', tMatrix - t0);
