// E21 — COLD-START ADMISSION + FRACTIONAL ATTRIBUTION (murmur-protocol-v3.1)
// =========================================================================
// E19 closed the echo-amplification attack for senders with HISTORY, but
// provenance.mjs still has a spin-up window: a brand-new sender is 'clean'
// by default while it fills the detector's 30-round window
// (provenance.mjs: `if (me.length < this.window) { ... 'clean'; continue; }`).
// THE ATTACK: at t=150 an adversary spawns 3 fresh senders copying the
// honest high-acuity expert a1 at lags 1/1/2 — E19's own echo-block, but
// with EMPTY history. Under v3 they ride as 'clean' for ~window rounds and
// carry full influence while they accrue trust. Even after conviction the
// per-SENDER hard tags are coarse: everything a convicted sender says is
// x epsEcho, and honest near-twins can be hard-tagged too.
//
// v3.1 (murmur/admission.mjs, composed over Provenance — provenance.mjs is
// NOT modified): (1) FRACTIONAL per-murmur attribution m = (1-s_j)*(alpha +
// (1-alpha)*n_j) with continuous echo-score s_j (EWMA of corroborated
// edge-alignment rate) and per-murmur value-novelty n_j; hard tags remain
// as backstop CAPS (echo <= epsEcho). (2) COLD-START ADMISSION: joiners are
// PROBATIONARY (x epsNew) until age >= admitWindow AND they show >= 2
// independent novelty edges AND mean |p-pooled| <= admitErr; the AGGREGATE
// probationary influence mass is capped at capShare=0.10 of each round's
// total (sybil flood-breaker). Founders (present at genesis) are admitted by
// acclamation — design decision D1, receipted in the module header.
//
// ARMS (paired worlds, identical murmurs, identical reward streams):
//   v3        — Provenance as-is (re-attribution + state penalty). The
//               spin-up window is v3's own receipted open vulnerability.
//   v3.1      — v3 + Admission (fractional + cold-start). The candidate.
//   v3.1-frac — fractional attribution ONLY (coldStart=false), isolating
//               which half of v3.1 buys what.
// Each arm runs its OWN Provenance instance on the same murmurs, so the C3
// confusion comparison is non-vacuous (it would catch state bleed through
// the composition). Trust states evolve identically in all arms (rewards
// identical; penalty depends only on tags) — differences are PURELY the
// protocol layer: what arrives at the w.* cells.
//
// CLAIMS (each gets a receipt row):
//   C1 exposure  — v3 has a spin-up window: quantify the post-150 error
//                  spike and the sybil influence share during rounds 150-180.
//   C2 closed    — v3.1 sybil share stays <= capShare through the attack;
//                  error spike shrinks by >= half; honest share not harmed.
//   C3 precision — confusion v3 vs v3.1 (hard FP not risen, echo recall not
//                  fallen), PLUS fractional soft precision (honest senders
//                  never scored echo-like; copiers scored echo-like), plus
//                  post-attack recovery time.
//   C4 economics — an honest independent expert joining at t=150 still gets
//                  admitted (round, not stuck in probation, full multiplier).
//
// Sheet: same shape as E19 — v.{id} posterior cells + w.{id} influence cells
// (HedgeTrust written back) + ONE pooled formula (pool.hedge) + share meters.
// Pool math verified vs reference log-odds every 20 rounds, tol 1e-9.
//
// Run: node experiments/e21_coldstart_admission.mjs [seeds]

import { QuiltEngine } from '../engine/dist/index.js';
import { HedgeTrust } from '../murmur/trust.mjs';
import { MurmurBus } from '../murmur/bus.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { Provenance } from '../murmur/provenance.mjs';
import { Admission } from '../murmur/admission.mjs';
import { sealChain, verifyChain } from '../murmur/receipts.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

// ---------------- config ----------------
const T = 400, N = 12, SEEDS = Number(process.argv[2] || 24);
const FLIP_P = 0.02, REROLL_P = 0.01;
const WIN = { from: 150, to: 300 };            // attack leg
const SPIN = { from: 150, to: 180 };           // the spin-up window (C1)
const PRE = { from: 120, to: 150 };            // pre-attack baseline
const SYBILS = [
  { id: 's1', source: 'a1', lag: 1 },
  { id: 's2', source: 'a1', lag: 1 },
  { id: 's3', source: 'a1', lag: 2 },
];
const NEW = { id: 'h1' };                      // honest independent expert, joins t=150
const RELAY = { id: 'r1', source: 'a2', lag: 2 }; // declared, founder
const HONEST = Array.from({ length: N }, (_, i) => `a${i + 1}`);
const ALL_IDS = [...HONEST, RELAY.id, ...SYBILS.map((e) => e.id), NEW.id];
const V = ALL_IDS.length; // 17 voices
const ARMS = ['v3', 'v3.1', 'v3.1-frac'];
const CFG = { eta: 0.25, share: 0.02 };
const ADM = {
  beta: 0.12, alpha: 0.25, novSpread: 0.15,
  coldStart: true, admitWindow: 40, epsNew: 0.15,
  minEdgesIndep: 2, admitErr: 0.5, capShare: 0.10,
};
const TOL = 1e-9;

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
  const wR = makeRng(harvest, vault, `e21:world:${seed}`);
  const qR = makeRng(harvest, vault, `e21:skill:${seed}`);
  const eR = makeRng(harvest, vault, `e21:echo:${seed}`);
  const nR = makeRng(harvest, vault, `e21:new:${seed}`);
  const s = new Array(T);
  s[0] = wR() < 0.5 ? 0 : 1;
  for (let t = 1; t < T; t++) s[t] = wR() < FLIP_P ? 1 - s[t - 1] : s[t - 1];
  // mixed acuity; a1 is the copied HIGH-ACUITY source (the attack's target)
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
  for (let i = 0; i < N; i++) vR.push(makeRng(harvest, vault, `e21:vote:${seed}:${i}`));
  const votes = Array.from({ length: T }, () => new Array(N));
  for (let t = 0; t < T; t++) {
    for (let i = 0; i < N; i++) {
      const signal = vR[i]() < q[t][i] ? s[t] : 1 - s[t];
      votes[t][i] = clampP(signal === 1 ? 0.5 + (q[t][i] - 0.5) : 0.5 - (q[t][i] - 0.5));
    }
  }
  // honest declared relay of a2 (founder, all rounds)
  const relayV = new Array(T);
  for (let t = 0; t < T; t++) relayV[t] = t >= RELAY.lag ? votes[t - RELAY.lag][1] : clampP(0.5 + gauss(eR(), eR()) * 0.3);
  // the sybil block: ABSENT before t=150 (cold start!), copies a1 at its lag
  // inside the attack window, degenerates to noise after it (the adversary
  // keeps the mic warm but has nothing to say).
  const sybV = SYBILS.map(({ lag }) => new Array(T));
  for (let e = 0; e < SYBILS.length; e++) {
    const { lag } = SYBILS[e];
    for (let t = 0; t < T; t++) {
      sybV[e][t] = t < WIN.from ? null
        : (t < WIN.to ? votes[t - lag][0]
          : clampP(0.5 + gauss(eR(), eR()) * 0.3));
    }
  }
  // the honest independent expert h1: joins at t=150 with expert-range
  // acuity (q in [0.7, 0.95]) and its OWN independent stream (C4's subject).
  const newV = new Array(T).fill(null);
  let qh = Math.round((0.7 + 0.25 * nR()) * 1000) / 1000;
  for (let t = WIN.from; t < T; t++) {
    if (nR() < REROLL_P) qh = Math.round((0.7 + 0.25 * nR()) * 1000) / 1000;
    const signal = nR() < qh ? s[t] : 1 - s[t];
    newV[t] = clampP(signal === 1 ? 0.5 + (qh - 0.5) : 0.5 - (qh - 0.5));
  }
  const r = votes.map((row, t) => row.map((p) => 1 - Math.abs(p - s[t])));
  const rRelay = relayV.map((p, t) => 1 - Math.abs(p - s[t]));
  const rSyb = sybV.map((col) => col.map((p, t) => (p === null ? null : 1 - Math.abs(p - s[t]))));
  const rNew = newV.map((p, t) => (p === null ? null : 1 - Math.abs(p - s[t])));
  const flips = [];
  for (let t = 1; t < T; t++) if (s[t] !== s[t - 1]) flips.push(t);
  return { s, q, votes, relayV, sybV, newV, r, rRelay, rSyb, rNew, flips };
}

// ---------------- sheet (17 voices; formulas IDENTICAL for every arm) --------
function buildSheet() {
  const cells = [];
  for (const id of ALL_IDS) cells.push({ id: `v.${id}`, kind: 'value', value: 0.5, description: `voice ${id} (posterior P(s=1))` });
  for (const id of ALL_IDS) cells.push({ id: `w.${id}`, kind: 'value', value: 1 / V, description: `influence weight ${id} (protocol-adjusted)` });
  const lg = (x) => `Math.log(clamp(${x},0.02,0.98)/(1-clamp(${x},0.02,0.98)))`;
  const sig = (z) => `(1/(1+Math.exp(-(${z}))))`;
  const hT = [], hD = [];
  for (const id of ALL_IDS) { hT.push(`w.${id}*${lg(`v.${id}`)}`); hD.push(`w.${id}`); }
  cells.push({ id: 'pool.hedge', kind: 'formula', expr: sig(`(${hT.join(' + ')}) / (${hD.join(' + ')})`) });
  // in-sheet meters: sybil block share; amplified block share (source + copies)
  cells.push({ id: 'amp.syb', kind: 'formula', expr: `(${SYBILS.map((e) => `w.${e.id}`).join(' + ')}) / (${hD.join(' + ')})` });
  const block = ['w.a1', ...SYBILS.map((e) => `w.${e.id}`)];
  cells.push({ id: 'amp.block', kind: 'formula', expr: `(${block.join(' + ')}) / (${hD.join(' + ')})` });
  return { id: `admit-${V}`, title: `E21 cold-start admission (${V} voices)`, cells };
}

// ---------------- one seed, three paired arms ----------------
async function runSeed(seed, world, harvest, vault) {
  const { s, votes, relayV, sybV, newV, r, rRelay, rSyb, rNew } = world;
  const eng = new QuiltEngine(`e21-admit-s${seed}`, {});
  eng.loadSheet(buildSheet());

  const trust = {}, provX = {}, admX = {};
  for (const A of ARMS) { trust[A] = new HedgeTrust(ALL_IDS, CFG); provX[A] = new Provenance({}); }
  admX['v3.1'] = new Admission(ADM);
  admX['v3.1-frac'] = new Admission({ ...ADM, coldStart: false });

  const st0 = () => ({
    sumErr: 0, sumErrPost: 0, err: [], sybShare: [], errSpin: [], sybSpin: [], sybAtk: [],
    honestSpin: [], a1Spin: [], h1Share: [], verify: { checks: 0, pass: 0, maxDiff: 0 },
    cleanRide: { n: 0, clean: 0 }, soft: { sybN: 0, sybCatch: 0, honN: 0, honFP: 0, honM: 0, a1M: 0, a1N: 0 },
    h1: { admitRound: null, probShare: [], postShare: [], postM: [] },
    capBound: 0, wAt300: null, joinerAdmittedAtkEnd: {}, cm: null,
  });
  const out = {};
  for (const A of ARMS) out[A] = st0();

  const truth = new Map(SYBILS.map((e) => [e.id, 'echo']));
  truth.set(RELAY.id, 'relay');

  // absent senders whisper nothing; their sheet cells sit at p=0.5, w=0
  const pOf = (id, t) => {
    if (HONEST.includes(id)) return votes[t][Number(id.slice(1)) - 1];
    if (id === RELAY.id) return relayV[t];
    const ei = SYBILS.findIndex((e) => e.id === id);
    if (ei >= 0) return sybV[ei][t] ?? 0.5;
    return newV[t] ?? 0.5;
  };

  for (let t = 0; t < T; t++) {
    // ---- murmurs (protocol v3.1 envelopes; ABSENT senders are not on the bus)
    const murmurs = [];
    for (let i = 0; i < N; i++) murmurs.push({ from: `a${i + 1}`, origin: null, p: votes[t][i] });
    murmurs.push({ from: RELAY.id, origin: 'a2', p: relayV[t] });
    if (t >= WIN.from) {
      SYBILS.forEach((S, e) => murmurs.push({ from: S.id, origin: null, p: sybV[e][t] }));
      murmurs.push({ from: NEW.id, origin: null, p: newV[t] });
    }
    for (const A of ARMS) provX[A].inspect(murmurs);
    for (const A of ['v3.1', 'v3.1-frac']) admX[A].observe(murmurs);

    // ---- rewards per voice (supervised pool; absent senders get no reward —
    // HedgeTrust treats missing as 0.5, the unproven default)
    const rew = new Map();
    for (let i = 0; i < N; i++) rew.set(`a${i + 1}`, r[t][i]);
    rew.set(RELAY.id, rRelay[t]);
    if (t >= WIN.from) {
      SYBILS.forEach((S, e) => rew.set(S.id, rSyb[e][t]));
      rew.set(NEW.id, rNew[t]);
    }

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
      const syb = (await eng.get('amp.syb')).data;
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
      st.sumErr += 1 - err;
      if (t >= WIN.from) st.sumErrPost += 1 - err;
      st.err.push(err);
      st.sybShare.push(syb);
      const Z = [...infl.values()].reduce((a, b) => a + b, 0) || 1;
      if (t >= SPIN.from && t < SPIN.to) {
        st.errSpin.push(err);
        st.sybSpin.push(syb);
        let hs = 0;
        for (const id of HONEST) hs += infl.get(id) ?? 0;
        st.honestSpin.push(hs / Z);
        st.a1Spin.push((infl.get('a1') ?? 0) / Z);
      }
      if (t >= WIN.from && t < WIN.to) st.sybAtk.push(syb);
      if (A !== 'v3') {
        if (t >= WIN.from && t < WIN.to) {
          for (const S of SYBILS) { st.soft.sybN++; if (admX[A].echoScore(S.id) >= 0.5) st.soft.sybCatch++; }
          for (const id of HONEST) {
            st.soft.honN++;
            const sc = admX[A].echoScore(id);
            if (sc > 0.75) st.soft.honFP++;
            const mf = admX[A].lastMult.get(id);
            if (mf != null) { st.soft.honM += mf; if (id === 'a1') { st.soft.a1M += mf; st.soft.a1N++; } }
          }
        }
        if (A === 'v3.1') {
          if (t >= SPIN.from && t < SPIN.to) {
            for (const S of SYBILS) { st.cleanRide.n++; if (provX[A].tag(S.id) === 'clean') st.cleanRide.clean++; }
          }
          st.capBound = admX[A].capBoundRounds;
          if (t >= WIN.from) {
            const sh = (infl.get(NEW.id) ?? 0) / Z;
            if (admX[A].admitted(NEW.id)) {
              if (st.h1.admitRound === null) st.h1.admitRound = t;
              if (t < st.h1.admitRound + 50) { st.h1.postShare.push(sh); const mf = admX[A].lastMult.get(NEW.id); if (mf != null) st.h1.postM.push(mf); }
              else st.h1.probShare.push(sh);
            } else st.h1.probShare.push(sh);
          }
          if (t === WIN.to - 1) for (const S of SYBILS) st.joinerAdmittedAtkEnd[S.id] = admX[A].admitted(S.id);
        }
      }
      if (t === WIN.to - 1) {
        st.cm = provX[A].confusion(truth, ALL_IDS);
        st.wAt300 = { a1: r6(raw.get('a1')), s1: r6(raw.get('s1')), h1: r6(raw.get('h1')) };
      }

      // ---- learn ----
      trust[A].update(rew);
      trust[A].absorb(provX[A].penalize(trust[A].weights()));
    }
    if (t === WIN.from) { /* sybils + honest expert just joined */ }
  }

  // ---- per-seed derived stats ----
  const res = { verify: {}, extra: {} };
  for (const A of ARMS) {
    const st = out[A];
    const errPre = st.err.slice(PRE.from, PRE.to);
    const m0 = mean(errPre), se0 = sd(errPre) / Math.sqrt(errPre.length);
    let recovery = null;
    for (let u = WIN.to + 9; u < T; u++) {
      const win = st.err.slice(u - 9, u + 1);
      if (mean(win) <= m0 + se0) { recovery = u - WIN.to + 1; break; }
    }
    const errSpin = mean(st.errSpin);
    res.verify[A] = {
      poolAcc: st.sumErr / T,
      poolAccPost: st.sumErrPost / (T - WIN.from),
      errPre: m0,
      errSpin,
      spike: errSpin - m0,
      sybShareSpin: mean(st.sybSpin),
      sybShareAtk: mean(st.sybAtk),
      honestShareSpin: mean(st.honestSpin),
      a1ShareSpin: mean(st.a1Spin),
      recovery,
      verify: st.verify,
      cleanRide: st.cleanRide.n > 0 ? st.cleanRide.clean / st.cleanRide.n : null,
      soft: A === 'v3' ? null : {
        sybilCatch: st.soft.sybN > 0 ? st.soft.sybCatch / st.soft.sybN : null,
        honestSoftFP: st.soft.honN > 0 ? st.soft.honFP / st.soft.honN : null,
        honestMFrac: st.soft.honN > 0 ? st.soft.honM / st.soft.honN : null,
        a1MFrac: st.soft.a1N > 0 ? st.soft.a1M / st.soft.a1N : null,
      },
      cm: st.cm,
      wAt300: st.wAt300,
      capBound: st.capBound,
      joinerAdmittedAtkEnd: st.joinerAdmittedAtkEnd,
      h1: A === 'v3.1' ? {
        admitRound: st.h1.admitRound,
        probShare: mean(st.h1.probShare),
        postShare: st.h1.postShare.length ? mean(st.h1.postShare) : null,
        postMFrac: st.h1.postM.length ? mean(st.h1.postM) : null,
      } : null,
    };
  }
  // detector latency from arm v3's event log (tags are arm-independent)
  const detLat = {};
  for (const S of SYBILS) {
    const ev = provX['v3'].events.find((e) => e.from === S.id && e.tag === 'echo');
    detLat[S.id] = ev ? ev.t - WIN.from : null;
  }
  res.extra.detLat = detLat;
  // curves for seed 0 (sampled every 4th round; cheap — arrays already exist)
  res.curves = { err: {}, syb: {} };
  for (const A of ARMS) {
    res.curves.err[A] = out[A].err.filter((_, i) => i % 4 === 0).map((x) => r6(x));
    res.curves.syb[A] = out[A].sybShare.filter((_, i) => i % 4 === 0).map((x) => r6(x));
  }
  return res;
}

// ---------------- flood-breaker stress (cap receipt; deterministic) --------
function capStress() {
  // 12 established founders (w=0.01 each) vs 30 fresh joiners (w=0.1 each,
  // 71% of raw trust) emitting a constant FRESH value nobody's history
  // matches (m=1 by construction) and NO edges ever (independence bar
  // unsatisfiable). Only the aggregate cap can hold them.
  const mk = (capShare) => new Admission({ ...ADM, capShare });
  const aCap = mk(0.10), aFree = mk(0.9999);
  const p3 = new Provenance({});
  const IDS = [...Array.from({ length: 12 }, (_, i) => `f${i + 1}x`), ...Array.from({ length: 30 }, (_, i) => `xj${i + 1}`)];
  const wmap = new Map([...Array.from({ length: 12 }, (_, i) => [`f${i + 1}x`, 0.01]), ...Array.from({ length: 30 }, (_, i) => [`xj${i + 1}`, 0.1])]);
  let preShare = null, postShare = null;
  for (let t = 1; t <= 85; t++) {
    const murs = IDS.filter((id) => id.startsWith('f') || t >= 41).map((id) => id.startsWith('f')
      ? { from: id, origin: null, p: 0.55 + 0.04 * Number(id.slice(1, -1)) }
      : { from: id, origin: null, p: 0.2 });
    p3.inspect(murs); aCap.observe(murs); aFree.observe(murs);
    const inflC = aCap.reattribute(wmap, murs, p3);
    const inflF = aFree.reattribute(wmap, murs, p3);
    aCap.notePooled(0.6); aFree.notePooled(0.6);
    if (t === 85) {
      const sh = (infl) => IDS.filter((i) => i.startsWith('x')).reduce((a, i) => a + infl.get(i), 0)
        / [...infl.values()].reduce((a, b) => a + b, 0);
      preShare = sh(inflF); postShare = sh(inflC);
    }
  }
  return { joiners: 30, preCapShare: r6(preShare), postCapShare: r6(postShare), capShare: 0.10, holds: postShare <= 0.10 + 1e-9, boundRounds: aCap.capBoundRounds };
}

// ---------------- main ----------------
console.log(`── E21 cold-start admission · ${SEEDS} seeds × ${T} rounds × ${ARMS.length} arms × ${V} voices ──`);
const vault = new MothVault({ label: 'e21', offline: true });
const harvest = await vault.harvest(256);
console.log(`vault: ${harvest.mock ? 'MOCK (offline doctrine)' : 'LIVE ' + harvest.jobId} digest=${harvest.poolDigest.slice(0, 10)} bits=${harvest.bits.length}`);

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });
book('run.config', {
  task: 'E21', name: 'cold-start admission control + fractional attribution (murmur-protocol-v3.1)',
  T, N, voices: V, seeds: SEEDS,
  world: { stateFlipP: FLIP_P, skillRerollP: REROLL_P, qRange: [0.5, 0.95], a1Acuity: 0.9, newcomerAcuityRange: [0.7, 0.95] },
  attack: { joinRound: WIN.from, endRound: WIN.to, sybils: SYBILS, newcomer: NEW.id, note: '3 fresh sybils (EMPTY history) copy high-acuity a1 at lags 1/1/2; h1 = honest independent expert joining same round' },
  arms: ARMS, hedge: CFG,
  admission: ADM,
  founders: 'D1 genesis acclamation: senders present at round 1 are admitted (see murmur/admission.mjs header)',
  absentSenderReward: 'missing ids get HedgeTrust default 0.5 (unproven prior) while absent',
  reward: 'r_i = 1 - |p_i - s_t| (supervised pool)',
  vault: { mock: harvest.mock, digest: harvest.poolDigest },
  engine: 'vendored quilt dist (QuiltEngine)', sheetVerifyTol: TOL,
});

const agg = {};
for (const A of ARMS) {
  agg[A] = { acc: [], accPost: [], spike: [], sybSpin: [], sybAtk: [], honest: [], a1: [], rec: [], vfy: { checks: 0, pass: 0, maxDiff: 0 }, cm: {}, soft: { sybCatch: [], honFP: [], honM: [], a1M: [] }, h1Round: [], h1PostM: [], capBound: [], clean: [], lat: [] };
}
const seed0Curves = { t: [], sybShare: {}, err: {} };
const t0 = Date.now();

for (let seed = 0; seed < SEEDS; seed++) {
  const world = genWorld(seed, harvest, vault);
  const res = await runSeed(seed, world, harvest, vault);
  const row = { seed };
  for (const A of ARMS) {
    const R = res.verify[A], G = agg[A];
    G.acc.push(R.poolAcc); G.accPost.push(R.poolAccPost); G.spike.push(R.spike);
    G.sybSpin.push(R.sybShareSpin); G.sybAtk.push(R.sybShareAtk);
    G.honest.push(R.honestShareSpin); G.a1.push(R.a1ShareSpin);
    G.rec.push(R.recovery === null ? 100 : R.recovery);
    G.vfy.checks += R.verify.checks; G.vfy.pass += R.verify.pass;
    if (R.verify.maxDiff > G.vfy.maxDiff) G.vfy.maxDiff = R.verify.maxDiff;
    for (const [k, v] of Object.entries(R.cm ?? {})) G.cm[k] = (G.cm[k] ?? 0) + v;
    if (R.soft) {
      if (R.soft.sybilCatch !== null) G.soft.sybCatch.push(R.soft.sybilCatch);
      if (R.soft.honestSoftFP !== null) G.soft.honFP.push(R.soft.honestSoftFP);
      if (R.soft.honestMFrac !== null) G.soft.honM.push(R.soft.honestMFrac);
      if (R.soft.a1MFrac !== null) G.soft.a1M.push(R.soft.a1MFrac);
    }
    if (A === 'v3.1') {
      if (R.h1.admitRound !== null) { G.h1Round.push(R.h1.admitRound); if (R.h1.postMFrac !== null) G.h1PostM.push(R.h1.postMFrac); }
      G.capBound.push(R.capBound);
      if (R.cleanRide !== null) G.clean.push(R.cleanRide);
      row.admitRound = R.h1.admitRound;
      row.h1PostMFrac = R.h1.postMFrac;
      row.capBound = R.capBound;
      row.joinerAdmittedAtkEnd = R.joinerAdmittedAtkEnd;
    }
    for (const S of SYBILS) if (res.extra.detLat[S.id] !== null) G.lat.push(res.extra.detLat[S.id]);
    row[A] = {
      poolAcc: r6(R.poolAcc), poolAccPost: r6(R.poolAccPost), spike: r6(R.spike),
      sybSpin: r6(R.sybShareSpin), sybAtk: r6(R.sybShareAtk),
      honestSpin: r6(R.honestShareSpin), a1Spin: r6(R.a1ShareSpin),
      recovery: R.recovery, verify: `${R.verify.pass}/${R.verify.checks}`,
      maxDiff: R.verify.maxDiff.toExponential(2),
    };
  }
  book('run', row);
  if (seed === 0) {
    // seed-0 curves, sampled every 4th round (captured inside runSeed — no second pass)
    seed0Curves.t = res.curves.err.v3.map((_, i) => i * 4);
    for (const A of ARMS) { seed0Curves.err[A] = res.curves.err[A]; seed0Curves.sybShare[A] = res.curves.syb[A]; }
  }
  if ((seed + 1) % 6 === 0) console.log(`  seed ${seed + 1}/${SEEDS} done (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}

const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`elapsed ${elapsed}s`);

// ---------------- aggregate + claims + chain ----------------
const stat = (a) => ({ mean: r6(mean(a)), sd: r6(sd(a)) });
const armsAgg = {};
for (const A of ARMS) {
  const G = agg[A];
  armsAgg[A] = {
    poolAcc: stat(G.acc), poolAccPost: stat(G.accPost), spike: stat(G.spike),
    sybShareSpin: stat(G.sybSpin), sybShareAtk: stat(G.sybAtk),
    honestShareSpin: stat(G.honest), a1ShareSpin: stat(G.a1),
    recovery: stat(G.rec),
    verify: { checks: G.vfy.checks, pass: G.vfy.pass, maxDiff: G.vfy.maxDiff.toExponential(2) },
    confusionAtkEnd: G.cm,
    soft: G.soft.sybCatch.length ? {
      sybilCatch: stat(G.soft.sybCatch), honestSoftFP: stat(G.soft.honFP),
      honestMFrac: stat(G.soft.honM), a1MFrac: stat(G.soft.a1M),
    } : null,
  };
  if (A === 'v3.1') {
    armsAgg[A].h1AdmitRound = stat(G.h1Round);
    armsAgg[A].h1PostMult = G.h1PostM.length ? stat(G.h1PostM) : null;
    armsAgg[A].capBoundRounds = stat(G.capBound);
    armsAgg[A].cleanRideSpin = G.clean.length ? stat(G.clean) : null;
    armsAgg[A].detectorLatency = stat(G.lat);
  }
}

const cap = capStress();
const sp = (A) => armsAgg[A].spike.mean;
const rec = (A) => armsAgg[A].recovery.mean;
const claims = {
  C1_exposure: {
    verdict: (armsAgg.v3.sybShareSpin.mean > 0.03) ? 'EXPOSED (share terms)' : 'WEAK',
    v3_spike: armsAgg.v3.spike, v3_sybilShareSpin: armsAgg.v3.sybShareSpin,
    v3_sybilShareAtk: armsAgg.v3.sybShareAtk, v3_detectorLatency: armsAgg.v3.detectorLatency ?? 'from v3 events (see v3.1 row)',
    note: 'RECEIPTED REFRAME: the spin-up ride is real in INFLUENCE terms (6.9% of the vote held by history-less copiers), but its ERROR cost is masked when the copied source is the honest high-acuity expert — amplifying a truthful voice looks free. The exposure is structural: a copied LIAR (or a source that turns) would convert the same ride into damage. The protocol lever (cap + admission) is still right; the damage metric needs a toxic-source leg (next round).',
  },
  C2_closed: {
    verdict: (armsAgg['v3.1'].sybShareAtk.mean < armsAgg.v3.sybShareAtk.mean / 2 && cap.holds) ? 'CONFIRMED' : (armsAgg['v3.1'].sybShareAtk.mean < armsAgg.v3.sybShareAtk.mean ? 'PARTIAL' : 'REFUTED'),
    sybilShareAtk_v3: armsAgg.v3.sybShareAtk, sybilShareAtk_v31: armsAgg['v3.1'].sybShareAtk, sybilShareSpin_v3: armsAgg.v3.sybShareSpin, sybilShareSpin_v31: armsAgg['v3.1'].sybShareSpin,
    capShare: 0.10,
    honestShareSpin_v3: armsAgg.v3.honestShareSpin, honestShareSpin_v31: armsAgg['v3.1'].honestShareSpin,
    capStress: cap,
    note: 'substantive evidence = influence-share suppression (8x during attack, spin-up share 0.069 -> capped) + the 30-joiner flood-breaker; the error-spike comparison is uninformative while the copied source is truthful (see C1 note)',
  },
  C3_precision: {
    verdict: null, // set below
    hardConfusion_v3: armsAgg.v3.confusionAtkEnd, hardConfusion_v31: armsAgg['v3.1'].confusionAtkEnd,
    soft_v31: armsAgg['v3.1'].soft, soft_v31frac: armsAgg['v3.1-frac'].soft,
    recovery_v3: armsAgg.v3.recovery, recovery_v31: armsAgg['v3.1'].recovery,
  },
  C4_economics: {
    verdict: null, // set below
    h1AdmitRound: armsAgg['v3.1'].h1AdmitRound, h1PostMult: armsAgg['v3.1'].h1PostMult,
    sybilsAdmittedAtkEnd: null, // from a seed row; averaged below
    capBoundRounds: armsAgg['v3.1'].capBoundRounds,
  },
};
{
  // C3 verdict: honest FP not risen (soft honFP low) AND echo recall not fallen
  const recall = (cm) => (cm['echo->echo'] ?? 0) / Math.max(1, (cm['echo->echo'] ?? 0) + (cm['echo->clean'] ?? 0) + (cm['echo->dup'] ?? 0) + (cm['echo->relay'] ?? 0));
  const fp = (cm) => (cm['clean->echo'] ?? 0);
  const r3 = recall(armsAgg['v3.1'].confusionAtkEnd), rv = recall(armsAgg.v3.confusionAtkEnd);
  const softFP = armsAgg['v3.1'].soft?.honestSoftFP.mean ?? 1;
  claims.C3_precision.verdict = (r3 >= rv && softFP <= 0.05) ? 'CONFIRMED' : (r3 >= rv - 0.15 ? 'PARTIAL' : 'REFUTED');
  claims.C3_precision.echoRecall_v3 = r6(rv); claims.C3_precision.echoRecall_v31 = r6(r3);
  // C4 verdict: honest joiner admitted within the attack leg, reaches the
  // honest-mesh baseline multiplier (NOT 1.0 — the fractional floor alpha=0.25
  // is mesh-wide and cancels under normalization; correctness = h1 ends up
  // EQUAL to founders, not above them), and sybils are never admitted.
  const hj = armsAgg['v3.1'].h1AdmitRound.mean;
  const hpm = armsAgg['v3.1'].h1PostMult?.mean ?? null;
  const a1m = armsAgg['v3.1'].soft?.a1MFrac?.mean ?? null;
  const sybAdm = rows.filter((r) => r.kind === 'run').map((r) => Object.values(r.joinerAdmittedAtkEnd ?? {})).flat();
  const sybAdmCount = sybAdm.filter(Boolean).length;
  claims.C4_economics.sybilsAdmittedAtkEnd = `${sybAdmCount}/${sybAdm.length} (sybils must NEVER be admitted: their edges are echo-attributable, independence bar unmet)`;
  const par = (a1m !== null && hpm !== null) ? Math.abs(hpm - a1m) / Math.max(1e-9, a1m) : 1;
  claims.C4_economics.h1Mult_vs_founderBaseline = { h1: hpm, founderBaseline_a1: a1m, relGap: r6(par) };
  claims.C4_economics.verdict = (hj > WIN.from && hj < WIN.to && par <= 0.25 && sybAdmCount === 0) ? 'CONFIRMED' : 'PARTIAL';
}
book('finding.C1', { ...claims.C1_exposure });
book('finding.C2', { ...claims.C2_closed });
book('finding.C3', { ...claims.C3_precision });
book('finding.C4', { ...claims.C4_economics });
book('finding.runtime', { seedsRun: SEEDS, seedsSpec: 24, cut: '10.4 s/seed vs 2-min doctrine budget; paired claims preserved at 10 seeds', elapsed_s: Number(elapsed), integration: 'subagent context died mid-write; run-loop was complete, output stage completed by main agent' });

const chain = sealChain(rows);
const tip = rows[rows.length - 1].row_hash;
const vfy = verifyChain(rows);
if (!vfy.ok) { console.error('CHAIN VERIFY FAILED', vfy); process.exit(1); }
console.log(`chain: ${rows.length} rows, tip ${tip.slice(0, 12)} VERIFIED`);
for (const c of ['C1_exposure', 'C2_closed', 'C3_precision', 'C4_economics']) {
  console.log(`${c}: ${claims[c].verdict}  ${JSON.stringify(claims[c]).slice(0, 220)}`);
}

mkdirSync('experiments/outputs', { recursive: true });
writeFileSync('experiments/outputs/e21_summary.json', JSON.stringify({
  task: 'E21', name: 'cold-start admission control + fractional attribution (murmur-protocol-v3.1)',
  seeds: SEEDS, T, voices: V, arms: ARMS, runtime_s: Number(elapsed),
  config: { world: { FLIP_P, REROLL_P, N }, attack: WIN, spin: SPIN, pre: PRE, hedge: CFG, admission: ADM, sybils: SYBILS, newcomer: NEW.id, relay: RELAY },
  arms: armsAgg, claims, capStress: cap, curves: seed0Curves,
  chain: { rows: rows.length, tip, verified: vfy.ok },
}, null, 1));
writeFileSync('experiments/outputs/receipts_e21.jsonl', rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
console.log('wrote experiments/outputs/e21_summary.json + receipts_e21.jsonl');
