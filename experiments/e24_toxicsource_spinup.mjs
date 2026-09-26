// E24 — TOXIC-SOURCE SPIN-UP (murmur-protocol-v3.1 stress test)
// ============================================================
// E21's C1 reframe (receipted): v3's spin-up ride is real in INFLUENCE terms
// (history-less copiers held 6.9% of the vote through the window) but its
// ERROR cost was masked — the sybils copied the honest high-acuity expert a1,
// and amplifying a truthful voice looks free. The exposure is structural:
// a copied LIAR converts the same ride into pooled error.
//
// E24 makes it costly: the 3 fresh sybils (empty history, join t=150) copy
// x1 — a TOXIC FOUNDER (acuity 0.25: confidently wrong ~75% of rounds,
// present from genesis, already demoted toward floor by trust when the
// attack starts). The attack is now: fresh clean weight x toxic copied
// values. The poison block = {x1, s1, s2, s3}.
//
// ARMS (paired worlds, identical murmurs, identical reward streams):
//   v3        — hard provenance only (spin-up window open, receipted in E21)
//   v3.1      — fractional attribution + cold-start admission (the candidate)
//   v3.1-frac — fractional only (coldStart=false), isolating which half buys what
// Trust demotes x1 itself in EVERY arm (an independent liar is trust's job,
// not provenance's) — protocol differences are purely what reaches w.* cells.
//
// CLAIMS:
//   C1 costly    — under v3 the spin-up window converts influence into ERROR:
//                  pool-error spike (errSpin - errPre), the poison block's
//                  share of influence-weighted error, and the DAMAGE delta
//                  |err(pool) - err(pool sans poison block)| attributable to
//                  the block during rounds 150-180.
//   C2 closed    — v3.1: error spike <= half of v3's; sybil influence share
//                  <= capShare through the window; flood-breaker cap holds.
//   C3 precision — hard confusion unchanged across arms; soft layer catches
//                  the copiers while NEVER flagging the independent liar x1
//                  (division of labor receipted: x1's echo-score stays low;
//                  its conviction is by trust, arm-identical).
//   C4 economics — the honest independent expert h1 (joins t=150) is still
//                  admitted on schedule; sybils are never admitted.
//
// DENOMINATORS RECEIPTED (E21 metric-bug lesson): influence-weighted error
// shares divide by sum_j w_j*|v_j - s_t| over ALL voices with w>0 that round.
//
// Sheet: v.{id} posterior cells + w.{id} influence cells + pool.hedge +
// amp.syb / amp.poison meters (18 voices). Pool verified vs MurmurBus.pool
// every 20 rounds, tol 1e-9. Counterfactual pools (poison block / sybils
// zeroed) are reference-side only — never written to the sheet.
//
// Run: node experiments/e24_toxicsource_spinup.mjs [seeds]

import { QuiltEngine } from '../engine/dist/index.js';
import { HedgeTrust } from '../murmur/trust.mjs';
import { MurmurBus } from '../murmur/bus.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { Provenance } from '../murmur/provenance.mjs';
import { Admission } from '../murmur/admission.mjs';
import { sealChain, verifyChain } from '../murmur/receipts.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

// ---------------- config ----------------
const T = 400, N = 12, SEEDS = Number(process.argv[2] || 10);
const FLIP_P = 0.02, REROLL_P = 0.01;
const TOXIC = 'x1';                            // the poisoned source (founder)
const TOX_Q = 0.25;                            // confidently wrong ~75% of rounds
const WIN = { from: 150, to: 300 };            // attack leg
const SPIN = { from: 150, to: 180 };           // the spin-up window (C1)
const PRE = { from: 120, to: 150 };            // pre-attack baseline
const SYBILS = [
  { id: 's1', source: TOXIC, lag: 1 },
  { id: 's2', source: TOXIC, lag: 1 },
  { id: 's3', source: TOXIC, lag: 2 },
];
const NEW = { id: 'h1' };                      // honest independent expert, joins t=150
const RELAY = { id: 'r1', source: 'a2', lag: 2 }; // declared, founder
const HONEST = Array.from({ length: N }, (_, i) => `a${i + 1}`);
const FOUNDERS = [...HONEST, TOXIC, RELAY.id];
const ALL_IDS = [...FOUNDERS, ...SYBILS.map((e) => e.id), NEW.id];
const V = ALL_IDS.length; // 18 voices
const POISON = [TOXIC, ...SYBILS.map((e) => e.id)];
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
const median = (a) => { const b = [...a].sort((x, y) => x - y); const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
const r6 = (x) => (Number.isFinite(x) ? +x.toFixed(6) : x);
// RECEIPTED VAULT DOCTRINE (E17 finding #0): one harvest, per-purpose keys,
// every draw is the FIRST draw of its own cross-key sub-stream.
function makeRng(harvest, vault, purpose) {
  let d = 0;
  return () => vault.streamFor(harvest, `${purpose}:${d++}`)();
}

// ---------------- world ----------------
function genWorld(seed, harvest, vault) {
  const wR = makeRng(harvest, vault, `e24:world:${seed}`);
  const qR = makeRng(harvest, vault, `e24:skill:${seed}`);
  const eR = makeRng(harvest, vault, `e24:echo:${seed}`);
  const nR = makeRng(harvest, vault, `e24:new:${seed}`);
  const xR = makeRng(harvest, vault, `e24:tox:${seed}`);
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
  for (let i = 0; i < N; i++) vR.push(makeRng(harvest, vault, `e24:vote:${seed}:${i}`));
  const votes = Array.from({ length: T }, () => new Array(N));
  for (let t = 0; t < T; t++) {
    for (let i = 0; i < N; i++) {
      const signal = vR[i]() < q[t][i] ? s[t] : 1 - s[t];
      votes[t][i] = clampP(signal === 1 ? 0.5 + (q[t][i] - 0.5) : 0.5 - (q[t][i] - 0.5));
    }
  }
  // the TOXIC founder: stable acuity TOX_Q, present from genesis, never
  // rerolled — a consistent liar whose values point the wrong way ~75% of
  // the time (confidence |TOX_Q-0.5| = 0.25 from neutral).
  const toxV = new Array(T);
  for (let t = 0; t < T; t++) {
    const signal = xR() < TOX_Q ? s[t] : 1 - s[t];
    toxV[t] = clampP(signal === 1 ? 0.5 + (TOX_Q - 0.5) : 0.5 - (TOX_Q - 0.5));
  }
  // honest declared relay of a2 (founder, all rounds)
  const relayV = new Array(T);
  for (let t = 0; t < T; t++) relayV[t] = t >= RELAY.lag ? votes[t - RELAY.lag][1] : clampP(0.5 + gauss(eR(), eR()) * 0.3);
  // the sybil block: ABSENT before t=150 (cold start!), copies the TOXIC
  // founder at its lag inside the attack window, degenerates to noise after.
  const sybV = SYBILS.map(({ lag }) => new Array(T));
  for (let e = 0; e < SYBILS.length; e++) {
    const { lag } = SYBILS[e];
    for (let t = 0; t < T; t++) {
      sybV[e][t] = t < WIN.from ? null
        : (t < WIN.to ? toxV[t - lag]
          : clampP(0.5 + gauss(eR(), eR()) * 0.3));
    }
  }
  // the honest independent expert h1: joins at t=150 with expert-range acuity
  const newV = new Array(T).fill(null);
  let qh = Math.round((0.7 + 0.25 * nR()) * 1000) / 1000;
  for (let t = WIN.from; t < T; t++) {
    if (nR() < REROLL_P) qh = Math.round((0.7 + 0.25 * nR()) * 1000) / 1000;
    const signal = nR() < qh ? s[t] : 1 - s[t];
    newV[t] = clampP(signal === 1 ? 0.5 + (qh - 0.5) : 0.5 - (qh - 0.5));
  }
  const r = votes.map((row, t) => row.map((p) => 1 - Math.abs(p - s[t])));
  const rRelay = relayV.map((p, t) => 1 - Math.abs(p - s[t]));
  const rTox = toxV.map((p, t) => 1 - Math.abs(p - s[t]));
  const rSyb = sybV.map((col) => col.map((p, t) => (p === null ? null : 1 - Math.abs(p - s[t]))));
  const rNew = newV.map((p, t) => (p === null ? null : 1 - Math.abs(p - s[t])));
  const flips = [];
  for (let t = 1; t < T; t++) if (s[t] !== s[t - 1]) flips.push(t);
  return { s, q, votes, toxV, relayV, sybV, newV, r, rRelay, rTox, rSyb, rNew, flips };
}

// ---------------- sheet (18 voices; formulas IDENTICAL for every arm) --------
function buildSheet() {
  const cells = [];
  for (const id of ALL_IDS) cells.push({ id: `v.${id}`, kind: 'value', value: 0.5, description: `voice ${id} (posterior P(s=1))` });
  for (const id of ALL_IDS) cells.push({ id: `w.${id}`, kind: 'value', value: 1 / V, description: `influence weight ${id} (protocol-adjusted)` });
  const lg = (x) => `Math.log(clamp(${x},0.02,0.98)/(1-clamp(${x},0.02,0.98)))`;
  const sig = (z) => `(1/(1+Math.exp(-(${z}))))`;
  const hT = [], hD = [];
  for (const id of ALL_IDS) { hT.push(`w.${id}*${lg(`v.${id}`)}`); hD.push(`w.${id}`); }
  cells.push({ id: 'pool.hedge', kind: 'formula', expr: sig(`(${hT.join(' + ')}) / (${hD.join(' + ')})`) });
  // in-sheet meters: sybil block share; full poison block share (source + copies)
  cells.push({ id: 'amp.syb', kind: 'formula', expr: `(${SYBILS.map((e) => `w.${e.id}`).join(' + ')}) / (${hD.join(' + ')})` });
  cells.push({ id: 'amp.poison', kind: 'formula', expr: `(${POISON.map((id) => `w.${id}`).join(' + ')}) / (${hD.join(' + ')})` });
  return { id: `tox-${V}`, title: `E24 toxic-source spin-up (${V} voices)`, cells };
}

// ---------------- one seed, three paired arms ----------------
async function runSeed(seed, world, harvest, vault) {
  const { s, votes, toxV, relayV, sybV, newV, r, rRelay, rTox, rSyb, rNew } = world;
  const eng = new QuiltEngine(`e24-tox-s${seed}`, {});
  eng.loadSheet(buildSheet());

  const trust = {}, provX = {}, admX = {};
  for (const A of ARMS) { trust[A] = new HedgeTrust(ALL_IDS, CFG); provX[A] = new Provenance({}); }
  admX['v3.1'] = new Admission(ADM);
  admX['v3.1-frac'] = new Admission({ ...ADM, coldStart: false });

  const st0 = () => ({
    sumErr: 0, sumErrPost: 0, err: [], sybShare: [], errSpin: [], sybSpin: [], toxSpin: [], sybAtk: [],
    poisErrSpin: [], sybErrSpin: [], dmgSpin: [], dmgSybSpin: [], pullSpin: [],
    convRound: null, wX1: {}, wX1r: {}, verify: { checks: 0, pass: 0, maxDiff: 0 },
    soft: { sybN: 0, sybCatch: 0, honN: 0, honFP: 0, honM: 0, x1E: 0, x1N: 0, sybM: 0, sybMN: 0 },
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
    if (id === TOXIC) return toxV[t];
    if (id === RELAY.id) return relayV[t];
    const ei = SYBILS.findIndex((e) => e.id === id);
    if (ei >= 0) return sybV[ei][t] ?? 0.5;
    return newV[t] ?? 0.5;
  };

  for (let t = 0; t < T; t++) {
    // ---- murmurs (protocol v3.1 envelopes; ABSENT senders are not on the bus)
    const murmurs = [];
    for (let i = 0; i < N; i++) murmurs.push({ from: `a${i + 1}`, origin: null, p: votes[t][i] });
    murmurs.push({ from: TOXIC, origin: null, p: toxV[t] });
    murmurs.push({ from: RELAY.id, origin: 'a2', p: relayV[t] });
    if (t >= WIN.from) {
      SYBILS.forEach((S, e) => murmurs.push({ from: S.id, origin: null, p: sybV[e][t] }));
      murmurs.push({ from: NEW.id, origin: null, p: newV[t] });
    }
    for (const A of ARMS) provX[A].inspect(murmurs);
    for (const A of ['v3.1', 'v3.1-frac']) admX[A].observe(murmurs);

    // ---- rewards per voice (supervised pool; absent senders get no reward)
    const rew = new Map();
    for (let i = 0; i < N; i++) rew.set(`a${i + 1}`, r[t][i]);
    rew.set(TOXIC, rTox[t]);
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
        st.toxSpin.push((infl.get(TOXIC) ?? 0) / Z);
        // influence-weighted error decomposition (denominator receipted:
        // sum over ALL voices with w>0 — copiers ride their own values)
        let denom = 0, poisonWErr = 0, sybWErr = 0;
        for (const id of ALL_IDS) {
          const w = infl.get(id) ?? 0;
          if (w <= 0) continue;
          const we = w * Math.abs(pOf(id, t) - s[t]);
          denom += we;
          if (POISON.includes(id)) poisonWErr += we;
          if (SYBILS.some((e) => e.id === id)) sybWErr += we;
        }
        if (denom > 1e-12) { st.poisErrSpin.push(poisonWErr / denom); st.sybErrSpin.push(sybWErr / denom); }
        // counterfactual damage: pool error attributable to the poison block
        // (reference-side only; same log-odds formula as the sheet)
        const ps = ALL_IDS.map((id) => pOf(id, t));
        const wFull = ALL_IDS.map((id) => infl.get(id) ?? 0);
        const wCfP = wFull.map((w, i) => (POISON.includes(ALL_IDS[i]) ? 0 : w));
        const wCfS = wFull.map((w, i) => (SYBILS.some((e) => e.id === ALL_IDS[i]) ? 0 : w));
        const poolCfP = MurmurBus.pool(ps, wCfP);
        const poolCfS = MurmurBus.pool(ps, wCfS);
        st.dmgSpin.push(Math.abs(pool - s[t]) - Math.abs(poolCfP - s[t]));
        st.dmgSybSpin.push(Math.abs(pool - s[t]) - Math.abs(poolCfS - s[t]));
        st.pullSpin.push(pool - poolCfP);
      }
      if (t >= WIN.from && t < WIN.to) st.sybAtk.push(syb);

      // ---- toxic conviction (by TRUST, arm-identical by construction — measured)
      const ws = trust[A].weights();
      const honMed = median(HONEST.map((id) => ws.get(id) ?? 0));
      if (st.convRound === null && honMed > 0 && (ws.get(TOXIC) ?? 0) < 0.25 * honMed) st.convRound = t;
      if ([0, 50, 100, 149, 200, 300, 399].includes(t)) {
        st.wX1[t] = r6(ws.get(TOXIC) ?? 0);
        st.wX1r[t] = honMed > 0 ? r6((ws.get(TOXIC) ?? 0) / honMed) : null; // demotion ratio vs honest median
      }

      if (A !== 'v3') {
        if (t >= WIN.from && t < WIN.to) {
          for (const S of SYBILS) { st.soft.sybN++; if (admX[A].echoScore(S.id) >= 0.5) st.soft.sybCatch++; }
          for (const id of HONEST) {
            st.soft.honN++;
            const sc = admX[A].echoScore(id);
            if (sc > 0.75) st.soft.honFP++;
            const mf = admX[A].lastMult.get(id);
            if (mf != null) st.soft.honM += mf;
          }
          for (const S of SYBILS) {
            const mf = admX[A].lastMult.get(S.id);
            if (mf != null) { st.soft.sybM += mf; st.soft.sybMN++; }
          }
          const xe = admX[A].echoScore(TOXIC);
          st.soft.x1E += xe; st.soft.x1N++;
        }
        if (A === 'v3.1') {
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
        st.wAt300 = { x1: r6(raw.get(TOXIC)), s1: r6(raw.get('s1')), h1: r6(raw.get('h1')) };
      }

      // ---- learn ----
      trust[A].update(rew);
      trust[A].absorb(provX[A].penalize(trust[A].weights()));
    }
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
    res.verify[A] = {
      poolAcc: st.sumErr / T,
      poolAccPost: st.sumErrPost / (T - WIN.from),
      errPre: m0,
      errSpin: mean(st.errSpin),
      spike: mean(st.errSpin) - m0,
      sybShareSpin: mean(st.sybSpin),
      toxShareSpin: mean(st.toxSpin),
      sybShareAtk: mean(st.sybAtk),
      poisonErrShareSpin: st.poisErrSpin.length ? mean(st.poisErrSpin) : null,
      sybErrShareSpin: st.sybErrSpin.length ? mean(st.sybErrSpin) : null,
      damageSpin: mean(st.dmgSpin),
      damageSybSpin: mean(st.dmgSybSpin),
      pullSpin: mean(st.pullSpin),
      recovery,
      convRound: st.convRound,
      wX1: st.wX1,
      wX1r: st.wX1r,
      verify: st.verify,
      soft: A === 'v3' ? null : {
        sybilCatch: st.soft.sybN > 0 ? st.soft.sybCatch / st.soft.sybN : null,
        honestSoftFP: st.soft.honN > 0 ? st.soft.honFP / st.soft.honN : null,
        honestMFrac: st.soft.honN > 0 ? st.soft.honM / st.soft.honN : null,
        x1EchoScore: st.soft.x1N > 0 ? st.soft.x1E / st.soft.x1N : null,
        sybMFrac: st.soft.sybMN > 0 ? st.soft.sybM / st.soft.sybMN : null,
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
  res.curves = { err: {}, syb: {}, dmg: {} };
  for (const A of ARMS) {
    res.curves.err[A] = out[A].err.filter((_, i) => i % 4 === 0).map((x) => r6(x));
    res.curves.syb[A] = out[A].sybShare.filter((_, i) => i % 4 === 0).map((x) => r6(x));
  }
  return res;
}

// ---------------- flood-breaker stress (cap receipt; deterministic) --------
function capStress() {
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
console.log(`── E24 toxic-source spin-up · ${SEEDS} seeds × ${T} rounds × ${ARMS.length} arms × ${V} voices ──`);
const vault = new MothVault({ label: 'e24', offline: true });
const harvest = await vault.harvest(256);
console.log(`vault: ${harvest.mock ? 'MOCK (offline doctrine)' : 'LIVE ' + harvest.jobId} digest=${harvest.poolDigest.slice(0, 10)} bits=${harvest.bits.length}`);

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });
book('run.config', {
  task: 'E24', name: 'toxic-source spin-up (murmur-protocol-v3.1 stress: the copied source is a LIAR)',
  T, N, voices: V, seeds: SEEDS,
  world: { stateFlipP: FLIP_P, skillRerollP: REROLL_P, qRange: [0.5, 0.95], a1Acuity: 0.9, toxicFounder: { id: TOXIC, acuity: TOX_Q, note: 'confidently wrong ~75% of rounds; present from genesis; demoted by TRUST in every arm (provenance never flags independent liars)' }, newcomerAcuityRange: [0.7, 0.95] },
  attack: { joinRound: WIN.from, endRound: WIN.to, sybils: SYBILS, poisonBlock: POISON, newcomer: NEW.id, note: '3 fresh sybils (EMPTY history) copy the TOXIC founder x1 at lags 1/1/2 — E21 C1 receipted structural exposure, now made costly' },
  arms: ARMS, hedge: CFG,
  admission: ADM,
  founders: 'D1 genesis acclamation (x1 is a founder: admission does NOT stop it; only trust does — receipted division of labor)',
  absentSenderReward: 'missing ids get HedgeTrust default 0.5 (unproven prior) while absent',
  reward: 'r_i = 1 - |p_i - s_t| (supervised pool)',
  metrics: {
    poisonErrShare: 'sum_{j in POISON} w_j*|v_j - s_t| / sum_{ALL j with w>0} w_j*|v_j - s_t| (denominator receipted)',
    damage: '|err(pool) - err(pool with poison-block weights zeroed)| (log-odds pool, reference-side)',
    damageSyb: 'same with sybils-only zeroed (copiers\' marginal damage)',
    convRound: 'first t where trust weight of x1 < 0.25 * median honest founder weight',
  },
  vault: { mock: harvest.mock, digest: harvest.poolDigest },
  engine: 'vendored quilt dist (QuiltEngine)', sheetVerifyTol: TOL,
});

const agg = {};
for (const A of ARMS) {
  agg[A] = { acc: [], accPost: [], spike: [], pre: [], sybSpin: [], toxSpin: [], sybAtk: [], poisErr: [], sybErr: [], dmg: [], dmgSyb: [], rec: [], conv: [], vfy: { checks: 0, pass: 0, maxDiff: 0 }, cm: {}, soft: { sybCatch: [], honFP: [], honM: [], x1E: [], sybM: [] }, h1Round: [], h1PostM: [], capBound: [], lat: [] };
}
const seed0Curves = { t: [], sybShare: {}, err: {} };
const t0 = Date.now();

for (let seed = 0; seed < SEEDS; seed++) {
  const world = genWorld(seed, harvest, vault);
  const res = await runSeed(seed, world, harvest, vault);
  const row = { seed };
  for (const A of ARMS) {
    const R = res.verify[A], G = agg[A];
    G.acc.push(R.poolAcc); G.accPost.push(R.poolAccPost); G.spike.push(R.spike); G.pre.push(R.errPre);
    G.sybSpin.push(R.sybShareSpin); G.toxSpin.push(R.toxShareSpin); G.sybAtk.push(R.sybShareAtk);
    if (R.poisonErrShareSpin !== null) G.poisErr.push(R.poisonErrShareSpin);
    if (R.sybErrShareSpin !== null) G.sybErr.push(R.sybErrShareSpin);
    G.dmg.push(R.damageSpin); G.dmgSyb.push(R.damageSybSpin);
    G.rec.push(R.recovery === null ? 100 : R.recovery);
    G.conv.push(R.convRound === null ? T : R.convRound);
    G.vfy.checks += R.verify.checks; G.vfy.pass += R.verify.pass;
    if (R.verify.maxDiff > G.vfy.maxDiff) G.vfy.maxDiff = R.verify.maxDiff;
    for (const [k, v] of Object.entries(R.cm ?? {})) G.cm[k] = (G.cm[k] ?? 0) + v;
    if (R.soft) {
      if (R.soft.sybilCatch !== null) G.soft.sybCatch.push(R.soft.sybilCatch);
      if (R.soft.honestSoftFP !== null) G.soft.honFP.push(R.soft.honestSoftFP);
      if (R.soft.honestMFrac !== null) G.soft.honM.push(R.soft.honestMFrac);
      if (R.soft.x1EchoScore !== null) G.soft.x1E.push(R.soft.x1EchoScore);
      if (R.soft.sybMFrac !== null) G.soft.sybM.push(R.soft.sybMFrac);
    }
    if (A === 'v3.1') {
      if (R.h1.admitRound !== null) { G.h1Round.push(R.h1.admitRound); if (R.h1.postMFrac !== null) G.h1PostM.push(R.h1.postMFrac); }
      G.capBound.push(R.capBound);
      row.admitRound = R.h1.admitRound;
      row.h1PostMFrac = R.h1.postMFrac;
      row.capBound = R.capBound;
      row.joinerAdmittedAtkEnd = R.joinerAdmittedAtkEnd;
    }
    for (const S of SYBILS) if (res.extra.detLat[S.id] !== null) G.lat.push(res.extra.detLat[S.id]);
    row[A] = {
      poolAcc: r6(R.poolAcc), poolAccPost: r6(R.poolAccPost), spike: r6(R.spike),
      sybSpin: r6(R.sybShareSpin), toxSpin: r6(R.toxShareSpin), sybAtk: r6(R.sybShareAtk),
      poisErr: R.poisonErrShareSpin === null ? null : r6(R.poisonErrShareSpin),
      dmg: r6(R.damageSpin), dmgSyb: r6(R.damageSybSpin),
      convRound: R.convRound, recovery: R.recovery,
      verify: `${R.verify.pass}/${R.verify.checks}`,
      maxDiff: R.verify.maxDiff.toExponential(2),
    };
  }
  book('run', row);
  if (seed === 0) {
    seed0Curves.t = res.curves.err.v3.map((_, i) => i * 4);
    for (const A of ARMS) { seed0Curves.err[A] = res.curves.err[A]; seed0Curves.sybShare[A] = res.curves.syb[A]; }
  }
  if ((seed + 1) % 5 === 0) console.log(`  seed ${seed + 1}/${SEEDS} done (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}

const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`elapsed ${elapsed}s`);

// ---------------- aggregate + claims + chain ----------------
const stat = (a) => ({ mean: r6(mean(a)), sd: r6(sd(a)) });
const armsAgg = {};
for (const A of ARMS) {
  const G = agg[A];
  armsAgg[A] = {
    poolAcc: stat(G.acc), poolAccPost: stat(G.accPost), spike: stat(G.spike), errPre: stat(G.pre),
    sybShareSpin: stat(G.sybSpin), toxShareSpin: stat(G.toxSpin), sybShareAtk: stat(G.sybAtk),
    poisonErrShareSpin: G.poisErr.length ? stat(G.poisErr) : null,
    sybErrShareSpin: G.sybErr.length ? stat(G.sybErr) : null,
    damageSpin: stat(G.dmg), damageSybSpin: stat(G.dmgSyb),
    recovery: stat(G.rec), toxicConvRound: stat(G.conv),
    verify: { checks: G.vfy.checks, pass: G.vfy.pass, maxDiff: G.vfy.maxDiff.toExponential(2) },
    confusionAtkEnd: G.cm,
    soft: G.soft.sybCatch.length ? {
      sybilCatch: stat(G.soft.sybCatch), honestSoftFP: stat(G.soft.honFP),
      honestMFrac: stat(G.soft.honM), x1EchoScore: stat(G.soft.x1E), sybMFrac: stat(G.soft.sybM),
    } : null,
  };
  if (A === 'v3.1') {
    armsAgg[A].h1AdmitRound = stat(G.h1Round);
    armsAgg[A].h1PostMult = G.h1PostM.length ? stat(G.h1PostM) : null;
    armsAgg[A].capBoundRounds = stat(G.capBound);
    armsAgg[A].detectorLatency = stat(G.lat);
  }
}

const cap = capStress();
const sp = (A) => armsAgg[A].spike.mean;
// paired per-seed damage deltas (same seed, same world — pure protocol effect)
const dmgDelta = agg.v3.dmg.map((d, i) => d - agg['v3.1'].dmg[i]);
const dmgSybDelta = agg.v3.dmgSyb.map((d, i) => d - agg['v3.1'].dmgSyb[i]);
const claims = {
  C1_costly: {
    verdict: (armsAgg.v3.damageSybSpin.mean > 0 && (armsAgg.v3.poisonErrShareSpin?.mean ?? 0) >= 0.10 && armsAgg.v3.sybShareSpin.mean >= 0.03)
      ? 'EXPOSED (error terms)' : 'WEAK',
    v3_spike: armsAgg.v3.spike, v3_sybilShareSpin: armsAgg.v3.sybShareSpin,
    v3_toxShareSpin: armsAgg.v3.toxShareSpin,
    v3_poisonErrShareSpin: armsAgg.v3.poisonErrShareSpin,
    v3_sybErrShareSpin: armsAgg.v3.sybErrShareSpin,
    v3_damageSpin: armsAgg.v3.damageSpin, v3_damageSybSpin: armsAgg.v3.damageSybSpin,
    pairedDamageDelta_v3_minus_v31: { mean: r6(mean(dmgDelta)), sd: r6(sd(dmgDelta)), n: dmgDelta.length },
    v3_detectorLatency: armsAgg['v3.1'].detectorLatency ?? 'from v3 events (see v3.1 row)',
    note: 'E21 C1 said the spin-up ride was influence-real but error-masked under a truthful source; E24 points the copiers at the toxic founder x1 — the SAME ride now buys pooled error. Raw errSpin is masked by h1\'s good arrival (spike can go NEGATIVE — receipted in E21), so the primary damage metric is the counterfactual pool-pull: damageSybSpin isolates the copiers\' marginal contribution (x1 alone is already trust-floored).',
  },
  C2_closed: {
    verdict: (armsAgg['v3.1'].damageSpin.mean < armsAgg.v3.damageSpin.mean / 2 && armsAgg['v3.1'].sybShareSpin.mean <= ADM.capShare && cap.holds) ? 'CONFIRMED'
      : (armsAgg['v3.1'].damageSpin.mean < armsAgg.v3.damageSpin.mean ? 'PARTIAL' : 'REFUTED'),
    damage_v3: armsAgg.v3.damageSpin, damage_v31: armsAgg['v3.1'].damageSpin, damage_fracOnly: armsAgg['v3.1-frac'].damageSpin,
    pairedDamageSybDelta_v3_minus_v31: { mean: r6(mean(dmgSybDelta)), sd: r6(sd(dmgSybDelta)), n: dmgSybDelta.length },
    sybilShareSpin_v3: armsAgg.v3.sybShareSpin, sybilShareSpin_v31: armsAgg['v3.1'].sybShareSpin, sybilShareSpin_fracOnly: armsAgg['v3.1-frac'].sybShareSpin,
    sybilShareAtk_v3: armsAgg.v3.sybShareAtk, sybilShareAtk_v31: armsAgg['v3.1'].sybShareAtk,
    capShare: ADM.capShare,
    capStress: cap,
    note: 'primary evidence = counterfactual damage suppression (the toxic conversion E21 could not measure) + influence-share suppression + the 30-joiner flood-breaker; the frac-only arm is the load-bearing test: with a toxic source the fractional layer is CORROBORATION-STARVED (x1\'s values match nobody else\'s history, so soft echo-scores rise slowly) — admission caps, not fractional floors, do the work here',
  },
  C3_precision: {
    verdict: null,
    hardConfusion_v3: armsAgg.v3.confusionAtkEnd, hardConfusion_v31: armsAgg['v3.1'].confusionAtkEnd,
    soft_v31: armsAgg['v3.1'].soft, soft_v31frac: armsAgg['v3.1-frac'].soft,
    toxicConvRound_v3: armsAgg.v3.toxicConvRound, toxicConvRound_v31: armsAgg['v3.1'].toxicConvRound,
    recovery_v3: armsAgg.v3.recovery, recovery_v31: armsAgg['v3.1'].recovery,
    note: 'division of labor receipted: the soft/fractional layer must catch COPIERS (sybilCatch) while never flagging the independent liar x1 (x1EchoScore stays low) — convicting x1 is trust\'s job and must be arm-identical',
  },
  C4_economics: {
    verdict: null,
    h1AdmitRound: armsAgg['v3.1'].h1AdmitRound, h1PostMult: armsAgg['v3.1'].h1PostMult,
    sybilsAdmittedAtkEnd: null,
    capBoundRounds: armsAgg['v3.1'].capBoundRounds,
  },
};
{
  const recall = (cm) => (cm['echo->echo'] ?? 0) / Math.max(1, (cm['echo->echo'] ?? 0) + (cm['echo->clean'] ?? 0) + (cm['echo->dup'] ?? 0) + (cm['echo->relay'] ?? 0));
  const fp = (cm) => (cm['clean->echo'] ?? 0);
  const r3 = recall(armsAgg['v3.1'].confusionAtkEnd), rv = recall(armsAgg.v3.confusionAtkEnd);
  const softFP = armsAgg['v3.1'].soft?.honestSoftFP.mean ?? 1;
  const catchRate = armsAgg['v3.1'].soft?.sybilCatch.mean ?? 0;
  const x1E = armsAgg['v3.1'].soft?.x1EchoScore.mean ?? 1;
  claims.C3_precision.echoRecall_v3 = r6(rv); claims.C3_precision.echoRecall_v31 = r6(r3);
  claims.C3_precision.verdict = (r3 >= rv && softFP <= 0.05 && catchRate >= 0.5 && x1E <= 0.35) ? 'CONFIRMED' : (r3 >= rv - 0.15 ? 'PARTIAL' : 'REFUTED');
  const hj = armsAgg['v3.1'].h1AdmitRound.mean;
  const hpm = armsAgg['v3.1'].h1PostMult?.mean ?? null;
  const honm = armsAgg['v3.1'].soft?.honestMFrac?.mean ?? null;
  const sybAdm = rows.filter((r) => r.kind === 'run').map((r) => Object.values(r.joinerAdmittedAtkEnd ?? {})).flat();
  const sybAdmCount = sybAdm.filter(Boolean).length;
  claims.C4_economics.sybilsAdmittedAtkEnd = `${sybAdmCount}/${sybAdm.length} (sybils must NEVER be admitted: their edges are echo-attributable to x1, independence bar unmet)`;
  const par = (honm !== null && hpm !== null) ? Math.abs(hpm - honm) / Math.max(1e-9, honm) : 1;
  claims.C4_economics.h1Mult_vs_founderBaseline = { h1: hpm, founderBaseline_honest: honm, relGap: r6(par) };
  claims.C4_economics.verdict = (hj > WIN.from && hj < WIN.to && par <= 0.25 && sybAdmCount === 0) ? 'CONFIRMED' : 'PARTIAL';
}
book('finding.C1', { ...claims.C1_costly });
book('finding.C2', { ...claims.C2_closed });
book('finding.C3', { ...claims.C3_precision });
book('finding.C4', { ...claims.C4_economics });
book('finding.runtime', { seedsRun: SEEDS, elapsed_s: Number(elapsed), cut: SEEDS < 12 ? 'seeds cut for the 2.5-min doctrine budget; paired claims preserved' : 'none — full plan within budget', vaultLiveJobs: vault.liveJobs });

const chain = sealChain(rows);
const tip = rows[rows.length - 1].row_hash;
const vfy = verifyChain(rows);
if (!vfy.ok) { console.error('CHAIN VERIFY FAILED', vfy); process.exit(1); }
console.log(`chain: ${rows.length} rows, tip ${tip.slice(0, 12)} VERIFIED`);
for (const c of ['C1_costly', 'C2_closed', 'C3_precision', 'C4_economics']) {
  console.log(`${c}: ${claims[c].verdict}  ${JSON.stringify(claims[c]).slice(0, 200)}`);
}

mkdirSync('experiments/outputs', { recursive: true });
writeFileSync('experiments/outputs/e24_summary.json', JSON.stringify({
  task: 'E24', name: 'toxic-source spin-up (murmur-protocol-v3.1 stress)',
  seeds: SEEDS, T, voices: V, arms: ARMS, runtime_s: Number(elapsed),
  config: { world: { FLIP_P, REROLL_P, N, TOXIC, TOX_Q }, attack: WIN, spin: SPIN, pre: PRE, hedge: CFG, admission: ADM, sybils: SYBILS, poisonBlock: POISON, newcomer: NEW.id, relay: RELAY },
  arms: armsAgg, claims, capStress: cap, curves: seed0Curves,
  chain: { rows: rows.length, tip, verified: vfy.ok },
}, null, 1));
writeFileSync('experiments/outputs/receipts_e24.jsonl', rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
console.log('wrote experiments/outputs/e24_summary.json + receipts_e24.jsonl');
console.log(vault.liveJobs === 0 ? 'E24 DONE' : 'E24 PROBLEM (live jobs)');
