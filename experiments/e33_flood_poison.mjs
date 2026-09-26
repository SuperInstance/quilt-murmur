// E33 — FLOOD COPYING A TOXIC FOUNDER (combined attack at cap scale)
// ==================================================================
// Prior receipts collide here. E21 closed clean copying (3 fresh sybils
// riding the honest high-acuity expert a1: influence-real, error-masked).
// E24 made it costly (the copiers pointed at a TOXIC FOUNDER x1: the spin-up
// ride converts to pooled error; fractional attribution is CORROBORATION-
// STARVED against poison, so admission caps — epsNew x capShare — carry that
// column). The COMBINATION — a sybil flood that copies a toxic founder, at
// cap scale — has never been run, and the INTERACTION between the two attack
// halves (sub- vs super-additivity) has never been measured.
//
// THE QUESTION (carried seed): does the admission cap (capShare 0.10) hold
// when the flood is COPYING A TOXIC FOUNDER — the newcomers' echoed source is
// itself poison? And does the combined attack extract MORE than its parts
// (super-additive: fresh clean weight amplifies entrenched poison) or LESS
// (sub-additive: cap/fractional forces the flood to compete with its own
// source for the same exploited trust)?
//
// SETUP: 12 honest founders (mixed acuity, a1 = 0.9 reference) + toxic
// founder x1 (acuity 0.25, E24 formula verbatim, toxic from genesis) + 3
// sybils (empty history, join t=150, copy-lag 1/1/2). 400 rounds, 8 seeds,
// 4 paired arms (identical worlds — same truth stream, same honest votes,
// same toxic values, same reward streams; arms differ ONLY in which voices
// are on the bus and which protocol layer runs):
//   v3-combined      — founder + flood copying x1, Provenance only (v3
//                      semantics: hard tags + spin-up window; NO admission,
//                      NO fractional) — the attack's full force.
//   v3.1-combined    — full protocol over the same attack (the candidate).
//   v3.1-founder-only— toxic founder, NO sybils (founder half isolated).
//   v3.1-flood-only  — sybils copying honest a1, NO founder (flood half
//                      isolated; in a founderless world the flood's best
//                      target is the honest expert — E21's attack verbatim).
//
// DECISION RULES (receipted BEFORE the full run):
//   C1 CAP INVARIANT — under v3.1-combined, per-seed max sybil aggregate
//      share over t >= WIN.from + admitWindow (=190, admission windows
//      closed) must be <= capShare + 0.02 slack (=0.12). ANY sybil admission
//      in any v3.1 arm is receipted as an admission-bug candidate; a share
//      violation with zero admissions is a cap-bug candidate. Full-trajectory
//      max share + its round reported alongside.
//   C2 COMBINED DEFENSE — D(v3.1-combined) < D(v3-combined): paired
//      one-sided sign test (zeros excluded) p < 0.05 AND paired mean delta
//      > 0; report paired delta +/- SE and ratio. D(A) = mean over the
//      copying window [150,300) of |err(pool) - err(pool with ALL of arm A's
//      attackers zeroed)| (E24 counterfactual method, reference-side
//      log-odds; never written to the sheet).
//   C3 INTERACTION — I_cross = D(v3.1-combined) - D(v3.1-founder-only)
//      - D(v3.1-flood-only), per-seed paired; I +/- SE = mean(I_i) +/-
//      sd(I_i)/sqrt(n); classify SUB-ADDITIVE (I < -SE) / SUPER-ADDITIVE
//      (I > SE) / INDETERMINATE (|I| <= SE). Secondary CLEAN factorial
//      inside each combined arm (all three counterfactuals from the SAME
//      pool, copy target held fixed): I_within = D(both) - D(x1 only)
//      - D(syb only), computed under v3.1-combined AND v3-combined as the
//      mechanism diagnostic. Strategic receipt: capBind rounds (rounds where
//      the cap actually redistributed mass) — if 0, sub-additivity is NOT
//      cap-enforced competition; candidate mechanism is the receipted
//      direction-blind novelty coupling (copiers park the source's values in
//      their own histories, collapsing the source's novelty to the alpha
//      floor). Caveat receipted: D(flood-only) copies a1 (honest) and is
//      typically NEGATIVE (helping), so I_cross inherits a positive offset —
//      I_cross <= 0 despite the offset is strong evidence of sub-additivity.
//   C4 NO COLLATERAL — |mean(honestFinalQ_v3.1-combined) -
//      mean(honestFinalQ_v3.1-founder-only)| <= 1 SE of the seed-paired
//      difference. honestFinalQ := mean HedgeTrust weight of the 12 honest
//      incumbents at t=T-1 (post final update+absorb). Directional note:
//      comb - found > -SE (the cap must not make honest voices WORSE).
//
// RUNTIME RULES (receipted before the full run): probe = 1-seed timed run;
// projected = t_probe * seeds + 2s IO; if projected > 170s, cut seeds 8 -> 6
// and RECEIPT the cut. Dev mini-run (2 seeds) validates the full pipeline
// (chain seal + file re-verify + sheet-verify) BEFORE the final run. After
// the final run: NO script edits (stale-artifact doctrine: script mtime <
// output mtimes).
//
// RNG DOCTRINE (binding): all randomness through MothVault (offline:true),
// one harvest, per-purpose stream keys 'e33:<purpose>:seed:<seed>[:<voice>]'
// via streamFor; NO Math.random anywhere. Paired worlds REQUIRE arm-identical
// world streams — arms never consume different draws (pairing would break);
// arm-conditional behavior is selection over shared values, not new draws.
//
// Sheet: v.{id} posterior cells + w.{id} influence cells + pool.hedge +
// amp.syb / amp.founder meters (16 voice ids; formulas IDENTICAL for every
// arm — absent senders' cells sit at p=0.5, w=0). Pool verified vs the
// reference mirror (MurmurBus.pool) every 20 rounds, tol 1e-9, assert 0
// mismatches. Counterfactual pools are reference-side only.
//
// Run: node experiments/e33_flood_poison.mjs [seeds]

import { QuiltEngine } from '../engine/dist/index.js';
import { HedgeTrust } from '../murmur/trust.mjs';
import { MurmurBus } from '../murmur/bus.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { Provenance } from '../murmur/provenance.mjs';
import { Admission } from '../murmur/admission.mjs';
import { sealChain, verifyChain } from '../murmur/receipts.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

// ---------------- config ----------------
const T = 400, N = 12, SEEDS = Number(process.argv[2] || 8);
const FLIP_P = 0.02, REROLL_P = 0.01;
const TOXIC = 'x1';                            // the toxic founder (E24 formula)
const TOX_Q = 0.25;                            // confidently wrong ~75% of rounds
const WIN = { from: 150, to: 300 };            // copying window (attack leg)
const POST = WIN.from + 40;                    // t>=190: admission windows closed (C1 domain)
const PRE = { from: 120, to: 150 };            // pre-attack baseline
const FLOOD = [
  { id: 's1', lag: 1 },
  { id: 's2', lag: 1 },
  { id: 's3', lag: 2 },
];
const HONEST = Array.from({ length: N }, (_, i) => `a${i + 1}`);
const ALL_IDS = [...HONEST, TOXIC, ...FLOOD.map((e) => e.id)];
const V = ALL_IDS.length; // 16 voice slots
const SYB_IDS = FLOOD.map((e) => e.id);
const POISON = [TOXIC, ...SYB_IDS];
const ARMS = ['v3-combined', 'v3.1-combined', 'v3.1-founder-only', 'v3.1-flood-only'];
const CFG = { eta: 0.25, share: 0.02 };
const ADM = {
  beta: 0.12, alpha: 0.25, novSpread: 0.15,
  coldStart: true, admitWindow: 40, epsNew: 0.15,
  minEdgesIndep: 2, admitErr: 0.5, capShare: 0.10,
};
const CAP_SLACK = 0.02;
const TOL = 1e-9;
const hasFlood = (A) => !A.endsWith('founder-only');
const hasFounder = (A) => !A.endsWith('flood-only');
const attackersOf = (A) => [...(hasFounder(A) ? [TOXIC] : []), ...(hasFlood(A) ? SYB_IDS : [])];

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

// ---------------- world ----------------
function genWorld(seed, harvest, vault) {
  const wR = makeRng(harvest, vault, `e33:world:${seed}`);
  const qR = makeRng(harvest, vault, `e33:skill:${seed}`);
  const xR = makeRng(harvest, vault, `e33:tox:${seed}`);
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
  for (let i = 0; i < N; i++) vR.push(makeRng(harvest, vault, `e33:vote:${seed}:${i}`));
  const votes = Array.from({ length: T }, () => new Array(N));
  for (let t = 0; t < T; t++) {
    for (let i = 0; i < N; i++) {
      const signal = vR[i]() < q[t][i] ? s[t] : 1 - s[t];
      votes[t][i] = clampP(signal === 1 ? 0.5 + (q[t][i] - 0.5) : 0.5 - (q[t][i] - 0.5));
    }
  }
  // the TOXIC founder — E24 formula VERBATIM: stable acuity TOX_Q, present
  // from genesis, never rerolled — a consistent liar whose values point the
  // wrong way ~75% of the time (confidence |TOX_Q-0.5| = 0.25 from neutral).
  const toxV = new Array(T);
  for (let t = 0; t < T; t++) {
    const signal = xR() < TOX_Q ? s[t] : 1 - s[t];
    toxV[t] = clampP(signal === 1 ? 0.5 + (TOX_Q - 0.5) : 0.5 - (TOX_Q - 0.5));
  }
  // the sybil block, TWO copy targets (arm-selected, same lags 1/1/2):
  //   sybX — copies the TOXIC founder (combined arms; E24 construction)
  //   sybA — copies honest high-acuity a1 (flood-only arm; E21 construction)
  // ABSENT before t=150 (cold start!), copying inside [150,300), degenerate
  // noise after (the adversary keeps the mic warm but has nothing to say).
  const sybX = FLOOD.map(() => new Array(T));
  const sybA = FLOOD.map(() => new Array(T));
  for (let e = 0; e < FLOOD.length; e++) {
    const { lag } = FLOOD[e];
    const nxR = makeRng(harvest, vault, `e33:sybx:${seed}:${e}`);
    const naR = makeRng(harvest, vault, `e33:syba:${seed}:${e}`);
    for (let t = 0; t < T; t++) {
      if (t < WIN.from) { sybX[e][t] = null; sybA[e][t] = null; }
      else if (t < WIN.to) {
        sybX[e][t] = toxV[t - lag];
        sybA[e][t] = votes[t - lag][0];
      } else {
        sybX[e][t] = clampP(0.5 + gauss(nxR(), nxR()) * 0.3);
        sybA[e][t] = clampP(0.5 + gauss(naR(), naR()) * 0.3);
      }
    }
  }
  const r = votes.map((row, t) => row.map((p) => 1 - Math.abs(p - s[t])));
  const rTox = toxV.map((p, t) => 1 - Math.abs(p - s[t]));
  const rSybX = sybX.map((col) => col.map((p, t) => (p === null ? null : 1 - Math.abs(p - s[t]))));
  const rSybA = sybA.map((col) => col.map((p, t) => (p === null ? null : 1 - Math.abs(p - s[t]))));
  return { s, q, votes, toxV, sybX, sybA, r, rTox, rSybX, rSybA };
}

// ---------------- sheet (16 voice slots; formulas IDENTICAL for every arm) --
function buildSheet() {
  const cells = [];
  for (const id of ALL_IDS) cells.push({ id: `v.${id}`, kind: 'value', value: 0.5, description: `voice ${id} (posterior P(s=1))` });
  for (const id of ALL_IDS) cells.push({ id: `w.${id}`, kind: 'value', value: 1 / V, description: `influence weight ${id} (protocol-adjusted)` });
  const lg = (x) => `Math.log(clamp(${x},0.02,0.98)/(1-clamp(${x},0.02,0.98)))`;
  const sig = (z) => `(1/(1+Math.exp(-(${z}))))`;
  const hT = [], hD = [];
  for (const id of ALL_IDS) { hT.push(`w.${id}*${lg(`v.${id}`)}`); hD.push(`w.${id}`); }
  cells.push({ id: 'pool.hedge', kind: 'formula', expr: sig(`(${hT.join(' + ')}) / (${hD.join(' + ')})`) });
  // in-sheet meters: sybil flood aggregate share; toxic founder share
  cells.push({ id: 'amp.syb', kind: 'formula', expr: `(${SYB_IDS.map((e) => `w.${e}`).join(' + ')}) / (${hD.join(' + ')})` });
  cells.push({ id: 'amp.founder', kind: 'formula', expr: `w.${TOXIC} / (${hD.join(' + ')})` });
  return { id: `flood-${V}`, title: `E33 flood copying a toxic founder (${V} voice slots)`, cells };
}

// ---------------- one seed, four paired arms ----------------
async function runSeed(seed, world, harvest, vault) {
  const { s, votes, toxV, sybX, sybA, r, rTox, rSybX, rSybA } = world;
  const eng = new QuiltEngine(`e33-fp-s${seed}`, {});
  eng.loadSheet(buildSheet());

  const trust = {}, provX = {}, admX = {};
  for (const A of ARMS) { trust[A] = new HedgeTrust(ALL_IDS, CFG); provX[A] = new Provenance({}); }
  for (const A of ARMS) if (A.startsWith('v3.1')) admX[A] = new Admission(ADM);

  const st0 = () => ({
    sumErr: 0, sumErrPost: 0, err: [], sybShare: [], fndShare: [],
    dmgAll: [], dmgX1: [], dmgSyb: [], attErrShare: [], x1ErrShare: [], sybErrShare: [],
    sybMax: { v: 0, t: null }, sybMaxPost: { v: 0, t: null },
    fndMax: { v: 0, t: null },
    verify: { checks: 0, pass: 0, maxDiff: 0 },
    soft: { sybN: 0, sybCatch: 0, honN: 0, honFP: 0, honM: 0, x1E: 0, x1N: 0, sybM: 0, sybMN: 0 },
    convRound: null, wX1: {}, wX1r: {}, honW: {},
    capBoundRounds: 0, sybAdmitT: {}, cm: null,
  });
  const out = {};
  for (const A of ARMS) out[A] = st0();

  // per-arm ground truth for the confusion table (present ids only)
  const truthOf = (A) => {
    const m = new Map();
    for (const id of HONEST) m.set(id, 'clean');
    if (hasFounder(A)) m.set(TOXIC, 'clean'); // independent liar: provenance must NOT flag it
    if (hasFlood(A)) for (const e of SYB_IDS) m.set(e, 'echo');
    return m;
  };
  const presentIds = (A) => [...HONEST, ...(hasFounder(A) ? [TOXIC] : []), ...(hasFlood(A) ? SYB_IDS : [])];

  // posterior value of a voice slot in arm A at round t (absent -> 0.5)
  const pOf = (id, t, A) => {
    if (HONEST.includes(id)) return votes[t][Number(id.slice(1)) - 1];
    if (id === TOXIC) return hasFounder(A) ? toxV[t] : 0.5;
    const ei = SYB_IDS.indexOf(id);
    if (ei < 0) return 0.5;
    if (!hasFlood(A)) return 0.5;
    const src = A.endsWith('flood-only') ? sybA : sybX;
    return src[ei][t] ?? 0.5;
  };

  for (let t = 0; t < T; t++) {
    // ---- murmurs per arm (protocol v3.1 envelopes; ABSENT senders are not on the bus)
    const murmurs = {};
    for (const A of ARMS) {
      const ms = [];
      for (let i = 0; i < N; i++) ms.push({ from: `a${i + 1}`, origin: null, p: votes[t][i] });
      if (hasFounder(A)) ms.push({ from: TOXIC, origin: null, p: toxV[t] });
      if (hasFlood(A) && t >= WIN.from) {
        const src = A.endsWith('flood-only') ? sybA : sybX;
        FLOOD.forEach((S, e) => ms.push({ from: S.id, origin: null, p: src[e][t] }));
      }
      murmurs[A] = ms;
    }
    for (const A of ARMS) provX[A].inspect(murmurs[A]);
    for (const A of ARMS) if (admX[A]) admX[A].observe(murmurs[A]);

    // ---- rewards per voice (supervised pool; absent senders get no reward)
    const rew = {};
    for (const A of ARMS) {
      const rw = new Map();
      for (let i = 0; i < N; i++) rw.set(`a${i + 1}`, r[t][i]);
      if (hasFounder(A)) rw.set(TOXIC, rTox[t]);
      if (hasFlood(A) && t >= WIN.from) {
        const rs = A.endsWith('flood-only') ? rSybA : rSybX;
        FLOOD.forEach((S, e) => rw.set(S.id, rs[e][t]));
      }
      rew[A] = rw;
    }

    for (const A of ARMS) {
      const st = out[A];
      const raw = provX[A].penalize(trust[A].weights()); // v3 state penalty (all arms)
      const infl = admX[A]
        ? admX[A].reattribute(raw, murmurs[A], provX[A])
        : provX[A].influence(raw, murmurs[A]);

      // ---- the sheet does the pooled inference (identical formulas) ----
      for (const id of ALL_IDS) await eng.set(`v.${id}`, pOf(id, t, A));
      for (const id of ALL_IDS) await eng.set(`w.${id}`, infl.get(id) ?? 0);
      const pool = (await eng.get('pool.hedge')).data;
      const syb = (await eng.get('amp.syb')).data;
      const fnd = (await eng.get('amp.founder')).data;
      if (admX[A]) admX[A].notePooled(pool);

      if (t % 20 === 0) {
        const ps = ALL_IDS.map((id) => pOf(id, t, A));
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
      if (t >= WIN.from) st.sumErrPost += 1 - err;
      st.err.push(err);
      st.sybShare.push(syb);
      st.fndShare.push(fnd);
      if (t >= WIN.from) {
        if (syb > st.sybMax.v) st.sybMax = { v: syb, t };
        if (t >= POST && syb > st.sybMaxPost.v) st.sybMaxPost = { v: syb, t };
      }
      if (hasFounder(A) && fnd > st.fndMax.v) st.fndMax = { v: fnd, t };

      const Z = [...infl.values()].reduce((a, b) => a + b, 0) || 1;
      if (t >= WIN.from && t < WIN.to) {
        // influence-weighted error decomposition (denominator receipted:
        // sum over ALL voices with w>0 — copiers ride their own values)
        let denom = 0, attWE = 0, x1WE = 0, sybWE = 0;
        for (const id of ALL_IDS) {
          const w = infl.get(id) ?? 0;
          if (w <= 0) continue;
          const we = w * Math.abs(pOf(id, t, A) - s[t]);
          denom += we;
          if (hasFounder(A) && id === TOXIC) x1WE += we;
          if (hasFlood(A) && SYB_IDS.includes(id)) sybWE += we;
          if (attackersOf(A).includes(id)) attWE += we;
        }
        if (denom > 1e-12) {
          st.attErrShare.push(attWE / denom);
          if (hasFounder(A)) st.x1ErrShare.push(x1WE / denom);
          if (hasFlood(A)) st.sybErrShare.push(sybWE / denom);
        }
        // counterfactual damage (reference-side only; same log-odds formula
        // as the sheet): zero the attacker subsets, re-pool, diff the errors
        const ps = ALL_IDS.map((id) => pOf(id, t, A));
        const wFull = ALL_IDS.map((id) => infl.get(id) ?? 0);
        const attSet = new Set(attackersOf(A));
        const wCfAll = wFull.map((w, i) => (attSet.has(ALL_IDS[i]) ? 0 : w));
        const wCfX1 = wFull.map((w, i) => (ALL_IDS[i] === TOXIC ? 0 : w));
        const wCfSyb = wFull.map((w, i) => (SYB_IDS.includes(ALL_IDS[i]) ? 0 : w));
        const poolCfAll = MurmurBus.pool(ps, wCfAll);
        st.dmgAll.push(err - Math.abs(poolCfAll - s[t]));
        if (hasFounder(A) && hasFlood(A)) { // clean factorial (both subsets live)
          const poolCfX1 = MurmurBus.pool(ps, wCfX1);
          const poolCfSyb = MurmurBus.pool(ps, wCfSyb);
          st.dmgX1.push(err - Math.abs(poolCfX1 - s[t]));
          st.dmgSyb.push(err - Math.abs(poolCfSyb - s[t]));
        }
      }

      // ---- soft-layer + admission accounting (v3.1 arms) ----
      if (admX[A]) {
        st.capBoundRounds = admX[A].capBoundRounds;
        if (t >= WIN.from && t < WIN.to) {
          for (const e of SYB_IDS) { st.soft.sybN++; if (admX[A].echoScore(e) >= 0.5) st.soft.sybCatch++; }
          for (const id of HONEST) {
            st.soft.honN++;
            const sc = admX[A].echoScore(id);
            if (sc > 0.75) st.soft.honFP++;
            const mf = admX[A].lastMult.get(id);
            if (mf != null) st.soft.honM += mf;
          }
          for (const e of SYB_IDS) {
            const mf = admX[A].lastMult.get(e);
            if (mf != null) { st.soft.sybM += mf; st.soft.sybMN++; }
          }
          if (hasFounder(A)) { const xe = admX[A].echoScore(TOXIC); st.soft.x1E += xe; st.soft.x1N++; }
        }
        if (t >= WIN.from && hasFlood(A)) {
          for (const e of SYB_IDS) {
            if (st.sybAdmitT[e] == null && admX[A].admitted(e)) st.sybAdmitT[e] = t;
          }
        }
      }

      // ---- toxic conviction (by TRUST; measured in every x1-bearing arm) ----
      if (hasFounder(A)) {
        const ws = trust[A].weights();
        const honMed = median(HONEST.map((id) => ws.get(id) ?? 0));
        if (st.convRound === null && honMed > 0 && (ws.get(TOXIC) ?? 0) < 0.25 * honMed) st.convRound = t;
        if ([0, 50, 100, 149, 200, 300, 399].includes(t)) {
          st.wX1[t] = r6(ws.get(TOXIC) ?? 0);
          st.wX1r[t] = honMed > 0 ? r6((ws.get(TOXIC) ?? 0) / honMed) : null;
          st.honW[t] = r6(mean(HONEST.map((id) => ws.get(id) ?? 0)));
        }
      }

      if (t === WIN.to - 1) st.cm = provX[A].confusion(truthOf(A), presentIds(A));

      // ---- learn ----
      trust[A].update(rew[A]);
      trust[A].absorb(provX[A].penalize(trust[A].weights()));
    }
  }

  // ---- per-seed derived stats ----
  const res = { verify: {}, extra: {} };
  for (const A of ARMS) {
    const st = out[A];
    const errPre = st.err.slice(PRE.from, PRE.to);
    const m0 = mean(errPre);
    res.verify[A] = {
      poolAcc: st.sumErr / T,
      poolAccPost: st.sumErrPost / (T - WIN.from),
      errPre: m0,
      errAtk: mean(st.err.slice(WIN.from, WIN.to)),
      spike: mean(st.err.slice(WIN.from, WIN.to)) - m0,
      damage: mean(st.dmgAll),                       // D(A): all of A's attackers
      damageX1: st.dmgX1.length ? mean(st.dmgX1) : null,
      damageSyb: st.dmgSyb.length ? mean(st.dmgSyb) : null,
      attErrShare: st.attErrShare.length ? mean(st.attErrShare) : null,
      x1ErrShare: st.x1ErrShare.length ? mean(st.x1ErrShare) : null,
      sybErrShare: st.sybErrShare.length ? mean(st.sybErrShare) : null,
      sybMax: st.sybMax, sybMaxPost: st.sybMaxPost, fndMax: st.fndMax,
      fndShareAtk: mean(st.fndShare.slice(WIN.from, WIN.to)),
      fndShareFinal: st.fndShare[T - 1],
      convRound: st.convRound,
      honQFinal: mean(HONEST.map((id) => trust[A].weight(id))),
      x1QFinal: hasFounder(A) ? trust[A].weight(TOXIC) : null,
      wX1: st.wX1, wX1r: st.wX1r, honW: st.honW,
      verify: st.verify,
      capBoundRounds: admX[A] ? st.capBoundRounds : null,
      sybAdmitT: admX[A] && hasFlood(A) ? st.sybAdmitT : null,
      soft: admX[A] ? {
        sybilCatch: st.soft.sybN > 0 ? st.soft.sybCatch / st.soft.sybN : null,
        honestSoftFP: st.soft.honN > 0 ? st.soft.honFP / st.soft.honN : null,
        honestMFrac: st.soft.honN > 0 ? st.soft.honM / st.soft.honN : null,
        x1EchoScore: (hasFounder(A) && st.soft.x1N > 0) ? st.soft.x1E / st.soft.x1N : null,
        sybMFrac: st.soft.sybMN > 0 ? st.soft.sybM / st.soft.sybMN : null,
      } : null,
      cm: st.cm,
    };
  }
  // detector latency for the flood from arm v3-combined's event log
  const detLat = {};
  for (const e of SYB_IDS) {
    const ev = provX['v3-combined'].events.find((x) => x.from === e && x.tag === 'echo');
    detLat[e] = ev ? ev.t - WIN.from : null;
  }
  res.extra.detLat = detLat;
  // curves for seed 0 (sampled every 4th round; cheap — arrays already exist)
  res.curves = { err: {}, syb: {}, fnd: {} };
  for (const A of ARMS) {
    res.curves.err[A] = out[A].err.filter((_, i) => i % 4 === 0).map((x) => r6(x));
    res.curves.syb[A] = out[A].sybShare.filter((_, i) => i % 4 === 0).map((x) => r6(x));
    res.curves.fnd[A] = out[A].fndShare.filter((_, i) => i % 4 === 0).map((x) => r6(x));
  }
  return res;
}

// ---------------- main ----------------
console.log(`── E33 flood copying a toxic founder · ${SEEDS} seeds × ${T} rounds × ${ARMS.length} arms × ${V} voice slots ──`);
const vault = new MothVault({ label: 'e33', offline: true });
const harvest = await vault.harvest(256);
console.log(`vault: ${harvest.mock ? 'MOCK (offline doctrine)' : 'LIVE ' + harvest.jobId} digest=${harvest.poolDigest.slice(0, 10)} bits=${harvest.bits.length}`);

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });
book('run.config', {
  task: 'E33', name: 'flood copying a toxic founder (combined attack at cap scale; murmur-protocol-v3.1)',
  T, N, voices: V, seeds: SEEDS,
  world: { stateFlipP: FLIP_P, skillRerollP: REROLL_P, qRange: [0.5, 0.95], a1Acuity: 0.9, toxicFounder: { id: TOXIC, acuity: TOX_Q, formula: 'E24 verbatim', note: 'confidently wrong ~75% of rounds; present from genesis; demoted only by TRUST' } },
  attack: { joinRound: WIN.from, endRound: WIN.to, sybils: FLOOD, copyTargets: { combined: 'x1 (toxic founder)', founderOnly: 'n/a', floodOnly: 'a1 (honest high-acuity)' }, poisonBlock: POISON, note: '3 fresh sybils (EMPTY history) join t=150 with copy-lags 1/1/2; copy x1 in the combined arms, a1 in the flood-only arm; degenerate to noise after t=300 (E24/E21 convention)' },
  arms: ARMS, hedge: CFG, admission: ADM, capSlack: CAP_SLACK,
  founders: 'D1 genesis acclamation (x1 is a founder: admission never gates it; only trust does — receipted division of labor)',
  absentSenderReward: 'missing ids get HedgeTrust default 0.5 (unproven prior) while absent',
  reward: 'r_i = 1 - |p_i - s_t| (supervised pool)',
  rng: 'MothVault offline:true, one harvest, per-purpose keys e33:<purpose>:seed:<seed>[:<voice>] via streamFor; paired worlds REQUIRE arm-identical world streams (arms select over shared values; no arm-keyed draws); no Math.random',
  metrics: {
    D: 'mean over copying window [150,300) of |err(pool) - err(pool with ALL of arm A attackers zeroed)| (E24 counterfactual method, reference-side log-odds)',
    dmgX1_dmgSyb: 'combined arms only: single-subset counterfactuals from the SAME pool (clean factorial)',
    I_cross: 'D(v3.1-combined) - D(v3.1-founder-only) - D(v3.1-flood-only), per-seed paired',
    I_within: 'D(both) - D(x1 only) - D(syb only) inside a combined arm (copy target fixed)',
    sybilShare: 'amp.syb sheet meter = sum w_s / sum_all w (protocol-adjusted influence share)',
    founderShare: 'amp.founder sheet meter = w_x1 / sum_all w',
    honestFinalQ: 'mean HedgeTrust weight of the 12 honest incumbents at t=T-1 (post final absorb)',
    attackerErrShare: 'sum_{j in attackers} w_j*|v_j - s_t| / sum_{ALL j with w>0} (denominator receipted)',
  },
  decisionRules: {
    C1_capInvariant: 'v3.1-combined: per-seed max sybil aggregate share over t>=WIN.from+admitWindow (=190, admission windows closed) <= capShare+0.02 (=0.12); ANY sybil admission in any v3.1 arm = admission-bug candidate; share violation with zero admissions = cap-bug candidate; full-trajectory max + round reported',
    C2_combinedDefense: 'D(v3.1-combined) < D(v3-combined): paired one-sided sign test (zeros excluded) p<0.05 AND paired mean delta>0; report delta+/-SE and ratio',
    C3_interaction: 'I_cross per-seed paired; SUB-ADDITIVE if I<-SE, SUPER-ADDITIVE if I>SE, else INDETERMINATE; I_within (both combined arms) = mechanism diagnostic; capBind rounds receipted (0 => sub-additivity is NOT cap-enforced; candidate = direction-blind novelty coupling dragging the source to the alpha floor); caveat: flood-only copies honest a1 so D(flood-only) is typically NEGATIVE (helping) — I_cross inherits a positive offset, so I_cross<=0 despite the offset is strong evidence of sub-additivity',
    C4_noCollateral: '|mean(honQ v3.1-combined) - mean(honQ v3.1-founder-only)| <= 1 SE of the seed-paired difference; directional note comb-found > -SE (cap must not make honest voices worse)',
  },
  runtimeRules: 'probe = 1-seed timed run; projected = t_probe * seeds + 2s IO; if projected > 170s cut seeds 8 -> 6 and RECEIPT the cut; dev mini-run (2 seeds) validates pipeline (chain seal + file re-verify + sheet-verify) BEFORE the final run; NO script edits after the final run (stale-artifact doctrine)',
  vault: { mock: harvest.mock, digest: harvest.poolDigest },
  engine: 'vendored quilt dist (QuiltEngine)', sheetVerifyTol: TOL,
});
if (process.env.E33_PROBE) {
  try { book('probe', JSON.parse(process.env.E33_PROBE)); } catch { /* malformed probe env: ignore */ }
}

const agg = {};
for (const A of ARMS) {
  agg[A] = {
    acc: [], accPost: [], pre: [], atk: [], spike: [], dmg: [], dmgX1: [], dmgSyb: [],
    attErr: [], x1Err: [], sybErr: [], sybMax: [], sybMaxT: [], sybMaxPost: [], sybMaxPostT: [],
    fndMax: [], fndMaxT: [], fndAtk: [], fndFin: [], conv: [], honQ: [], x1Q: [],
    vfy: { checks: 0, pass: 0, maxDiff: 0 }, cm: {},
    soft: { sybCatch: [], honFP: [], honM: [], x1E: [], sybM: [] },
    capBound: [], lat: [], sybAdm: [], sybAdmT: [],
  };
}
const seed0Curves = { t: [], sybShare: {}, fndShare: {}, err: {} };
const t0 = Date.now();

for (let seed = 0; seed < SEEDS; seed++) {
  const seedStart = Date.now();
  const world = genWorld(seed, harvest, vault);
  const res = await runSeed(seed, world, harvest, vault);
  const row = { seed, seed_s: +((Date.now() - seedStart) / 1000).toFixed(1) };
  for (const A of ARMS) {
    const R = res.verify[A], G = agg[A];
    G.acc.push(R.poolAcc); G.accPost.push(R.poolAccPost); G.pre.push(R.errPre);
    G.atk.push(R.errAtk); G.spike.push(R.spike);
    G.dmg.push(R.damage);
    if (R.damageX1 !== null) G.dmgX1.push(R.damageX1);
    if (R.damageSyb !== null) G.dmgSyb.push(R.damageSyb);
    if (R.attErrShare !== null) G.attErr.push(R.attErrShare);
    if (R.x1ErrShare !== null) G.x1Err.push(R.x1ErrShare);
    if (R.sybErrShare !== null) G.sybErr.push(R.sybErrShare);
    G.sybMax.push(R.sybMax.v); G.sybMaxT.push(R.sybMax.t);
    G.sybMaxPost.push(R.sybMaxPost.v); G.sybMaxPostT.push(R.sybMaxPost.t);
    if (hasFounder(A)) { G.fndMax.push(R.fndMax.v); G.fndMaxT.push(R.fndMax.t); G.fndAtk.push(R.fndShareAtk); G.fndFin.push(R.fndShareFinal); G.conv.push(R.convRound === null ? T : R.convRound); G.x1Q.push(R.x1QFinal); }
    G.honQ.push(R.honQFinal);
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
    if (R.capBoundRounds !== null) G.capBound.push(R.capBoundRounds);
    if (R.sybAdmitT) for (const [e, tt] of Object.entries(R.sybAdmitT)) { if (tt != null) { G.sybAdm.push(e); G.sybAdmT.push(tt); } }
    for (const e of SYB_IDS) if (res.extra.detLat[e] !== null) G.lat.push(res.extra.detLat[e]);
    row[A] = {
      poolAcc: r6(R.poolAcc), errAtk: r6(R.errAtk),
      dmg: r6(R.damage), dmgX1: R.damageX1 === null ? null : r6(R.damageX1), dmgSyb: R.damageSyb === null ? null : r6(R.damageSyb),
      sybMax: r6(R.sybMax.v), sybMaxT: R.sybMax.t, sybMaxPost: r6(R.sybMaxPost.v), sybMaxPostT: R.sybMaxPost.t,
      fndMax: r6(R.fndMax.v), convRound: R.convRound, honQ: r6(R.honQFinal),
      capBound: R.capBoundRounds, admitted: R.sybAdmitT ? SYB_IDS.filter((e) => R.sybAdmitT[e] != null) : null,
      verify: `${R.verify.pass}/${R.verify.checks}`, maxDiff: R.verify.maxDiff.toExponential(2),
    };
  }
  book('run', row);
  if (seed === 0) {
    seed0Curves.t = res.curves.err['v3-combined'].map((_, i) => i * 4);
    for (const A of ARMS) { seed0Curves.err[A] = res.curves.err[A]; seed0Curves.sybShare[A] = res.curves.syb[A]; seed0Curves.fndShare[A] = res.curves.fnd[A]; }
  }
  const proj = (((Date.now() - t0) / 1000) / (seed + 1)) * SEEDS;
  console.log(`  seed ${seed + 1}/${SEEDS} done (${((Date.now() - t0) / 1000).toFixed(1)}s elapsed, projected total ${proj.toFixed(0)}s)`);
}

const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`elapsed ${elapsed}s`);

// ---------------- aggregate + claims + chain ----------------
const stat = (a) => ({ mean: r6(mean(a)), sd: r6(sd(a)) });
const seOf = (a) => (a.length > 0 ? sd(a) / Math.sqrt(a.length) : 0);
const maxWith = (vals, ts) => {
  let bi = 0;
  for (let i = 1; i < vals.length; i++) if (vals[i] > vals[bi]) bi = i;
  return { v: r6(vals[bi]), seed: bi, t: ts[bi] };
};
const armsAgg = {};
for (const A of ARMS) {
  const G = agg[A];
  armsAgg[A] = {
    poolAcc: stat(G.acc), poolAccPost: stat(G.accPost), errPre: stat(G.pre), errAtk: stat(G.atk), spike: stat(G.spike),
    damage: stat(G.dmg),
    damageX1: G.dmgX1.length ? stat(G.dmgX1) : null,
    damageSyb: G.dmgSyb.length ? stat(G.dmgSyb) : null,
    attErrShare: G.attErr.length ? stat(G.attErr) : null,
    x1ErrShare: G.x1Err.length ? stat(G.x1Err) : null,
    sybErrShare: G.sybErr.length ? stat(G.sybErr) : null,
    sybShareMax: { perSeed: stat(G.sybMax), globalMax: maxWith(G.sybMax, G.sybMaxT) },
    sybShareMaxPostWindow: { perSeed: stat(G.sybMaxPost), globalMax: maxWith(G.sybMaxPost, G.sybMaxPostT) },
    fndShareMax: hasFounder(A) ? { perSeed: stat(G.fndMax), globalMax: maxWith(G.fndMax, G.fndMaxT) } : null,
    fndShareAtk: hasFounder(A) ? stat(G.fndAtk) : null,
    fndShareFinal: hasFounder(A) ? stat(G.fndFin) : null,
    toxicConvRound: hasFounder(A) ? stat(G.conv) : null,
    honQFinal: stat(G.honQ),
    x1QFinal: hasFounder(A) ? stat(G.x1Q) : null,
    verify: { checks: G.vfy.checks, pass: G.vfy.pass, maxDiff: G.vfy.maxDiff.toExponential(2) },
    confusionAtkEnd: G.cm,
    soft: G.soft.sybCatch.length ? {
      sybilCatch: stat(G.soft.sybCatch), honestSoftFP: stat(G.soft.honFP),
      honestMFrac: stat(G.soft.honM), x1EchoScore: G.soft.x1E.length ? stat(G.soft.x1E) : null,
      sybMFrac: stat(G.soft.sybM),
    } : null,
  };
  if (A.startsWith('v3.1')) {
    armsAgg[A].capBoundRounds = G.capBound.length ? stat(G.capBound) : { mean: 0, sd: 0 };
    armsAgg[A].detectorLatency = G.lat.length ? stat(G.lat) : null;
    armsAgg[A].sybilsAdmitted = { count: G.sybAdm.length, of: SEEDS * SYB_IDS.length, rounds: G.sybAdmT };
  }
}

// paired per-seed deltas (same seed, same world — pure protocol/attack effect)
const dmg = (A) => agg[A].dmg;
const dC2 = dmg('v3-combined').map((d, i) => d - dmg('v3.1-combined')[i]); // >0 = protocol helps
const st2 = signTestOneSided(dC2);
const se2 = seOf(dC2);
const dIx = dmg('v3.1-combined').map((d, i) => d - dmg('v3.1-founder-only')[i] - dmg('v3.1-flood-only')[i]);
const seIx = seOf(dIx);
const IxMean = mean(dIx);
const dW31 = dmg('v3.1-combined').map((d, i) => d - agg['v3.1-combined'].dmgX1[i] - agg['v3.1-combined'].dmgSyb[i]);
const seW31 = seOf(dW31);
const dW3 = dmg('v3-combined').map((d, i) => d - agg['v3-combined'].dmgX1[i] - agg['v3-combined'].dmgSyb[i]);
const seW3 = seOf(dW3);
const honQDiff = agg['v3.1-combined'].honQ.map((q, i) => q - agg['v3.1-founder-only'].honQ[i]);
const seQ = seOf(honQDiff);

const C1max = armsAgg['v3.1-combined'].sybShareMaxPostWindow;
const anyAdmitted = ARMS.filter((A) => A.startsWith('v3.1')).reduce((a, A) => a + armsAgg[A].sybilsAdmitted.count, 0);
const shareBarHeld = C1max.globalMax.v <= ADM.capShare + CAP_SLACK;
const floodBarHeld = armsAgg['v3.1-flood-only'].sybShareMaxPostWindow.globalMax.v <= ADM.capShare + CAP_SLACK;
const claims = {
  C1_capInvariant: {
    verdict: (shareBarHeld && anyAdmitted === 0) ? 'CONFIRMED'
      : (!shareBarHeld && anyAdmitted > 0) ? 'VIOLATED (share>cap+slack via admission; admission bug candidate)'
      : (!shareBarHeld) ? 'VIOLATED (share>cap+slack with zero admissions; cap bug candidate)'
      : 'VIOLATED (admission bug candidate: sybils admitted -> cap exited; combined share bar held but only via trust-floor economics)',
    capShare: ADM.capShare, slack: CAP_SLACK, bar: ADM.capShare + CAP_SLACK,
    domain: `t >= ${POST} (admission windows closed)`,
    shareBarHeld_v31combined: shareBarHeld,
    shareBarHeld_v31floodOnly: floodBarHeld,
    sybShareMaxPostWindow: C1max,
    sybShareMax_fullTrajectory: armsAgg['v3.1-combined'].sybShareMax,
    sybShareMax_floodOnlyPostWindow: armsAgg['v3.1-flood-only'].sybShareMaxPostWindow,
    sybShareMax_v3_fullTrajectory: armsAgg['v3-combined'].sybShareMax,
    sybilsAdmitted_total: anyAdmitted,
    capBoundRounds_v31combined: armsAgg['v3.1-combined'].capBoundRounds,
    note: 'a violation is receipted as an admission bug candidate (sybils admitted -> cap no longer applies) or a cap bug candidate (never admitted yet over the bar). capBoundRounds>0 means the flood-breaker actually redistributed mass; 0 means the invariant held with slack via epsNew + trust + the independence bar alone',
  },
  C2_combinedDefense: {
    verdict: (mean(dC2) > 0 && st2.p < 0.05) ? 'CONFIRMED' : (mean(dC2) > 0 ? 'PARTIAL' : 'REFUTED'),
    damage_v3combined: armsAgg['v3-combined'].damage,
    damage_v31combined: armsAgg['v3.1-combined'].damage,
    ratio_v31_over_v3: r6(armsAgg['v3.1-combined'].damage.mean / Math.max(1e-12, armsAgg['v3-combined'].damage.mean)),
    pairedDelta_v3_minus_v31: { mean: r6(mean(dC2)), se: r6(se2), sd: r6(sd(dC2)), n: dC2.length },
    signTest_oneSided: st2,
    attErrShare_v3: armsAgg['v3-combined'].attErrShare, attErrShare_v31: armsAgg['v3.1-combined'].attErrShare,
    sybShareMax_v3: armsAgg['v3-combined'].sybShareMax, sybShareMax_v31: armsAgg['v3.1-combined'].sybShareMax,
    note: 'primary evidence = counterfactual damage suppression (E24 method) under the FULL combined attack (founder + flood copying it)',
  },
  C3_interaction: {
    verdict: (IxMean < -seIx) ? 'SUB-ADDITIVE' : (IxMean > seIx ? 'SUPER-ADDITIVE' : 'INDETERMINATE (|I| <= 1 SE)'),
    perArmDamageMeans: {
      v31combined: r6(armsAgg['v3.1-combined'].damage.mean),
      v31founderOnly: r6(armsAgg['v3.1-founder-only'].damage.mean),
      v31floodOnly: r6(armsAgg['v3.1-flood-only'].damage.mean),
    },
    I_cross: { mean: r6(IxMean), se: r6(seIx), sd: r6(sd(dIx)), n: dIx.length, perSeed: dIx.map((x) => r6(x)) },
    I_within_v31combined: { mean: r6(mean(dW31)), se: r6(seW31), n: dW31.length, note: 'clean factorial inside the arm: D(both) - D(x1 only) - D(syb only), copy target fixed' },
    I_within_v3combined: { mean: r6(mean(dW3)), se: r6(seW3), n: dW3.length },
    capBindRounds_v31combined: armsAgg['v3.1-combined'].capBoundRounds,
    capBindRounds_v31floodOnly: armsAgg['v3.1-flood-only'].capBoundRounds,
    founderEchoScore_v31combined: armsAgg['v3.1-combined'].soft ? armsAgg['v3.1-combined'].soft.x1EchoScore : null,
    founderShareAtk_v31combined: armsAgg['v3.1-combined'].fndShareAtk,
    founderShareAtk_v31founderOnly: armsAgg['v3.1-founder-only'].fndShareAtk,
    note: 'strategic question receipted: does the cap force sybils to compete with the founder for the same exploited trust, making the attack sub-additive? I_cross carries the flood-only caveat (its copiers ride honest a1 and typically HELP, biasing I_cross positive); I_within holds the copy target fixed and isolates the mechanism; capBindRounds says whether the CAP was even active. If I_within_v31 < I_within_v3, the fractional novelty coupling (copiers collapse their source\'s novelty to the alpha floor) is the sub-additivity mechanism, not the cap',
  },
  C4_noCollateral: {
    verdict: (Math.abs(mean(honQDiff)) <= seQ) ? 'CONFIRMED' : 'REFUTED',
    honQ_v31combined: armsAgg['v3.1-combined'].honQFinal,
    honQ_v31founderOnly: armsAgg['v3.1-founder-only'].honQFinal,
    pairedDiff_comb_minus_found: { mean: r6(mean(honQDiff)), se: r6(seQ), n: honQDiff.length },
    directionalNotWorse: (mean(honQDiff) > -seQ) ? 'OK (comb - found > -1 SE)' : 'WORSE (comb - found < -1 SE)',
    note: 'honestFinalQ = mean HedgeTrust weight of the 12 honest incumbents at t=T-1; the cap must not make honest voices worse when the flood copies poison',
  },
};
book('finding.C1', { ...claims.C1_capInvariant });
book('finding.C2', { ...claims.C2_combinedDefense });
book('finding.C3', { ...claims.C3_interaction });
book('finding.C4', { ...claims.C4_noCollateral });
book('finding.runtime', {
  seedsRun: SEEDS, elapsed_s: Number(elapsed),
  cut: SEEDS < 8 ? 'seeds cut 8 -> 6 by the probe rule (projected > 170s); paired claims preserved' : 'none — full plan within budget',
  probeRow: rows.find((r) => r.kind === 'probe') ?? null,
  vaultLiveJobs: vault.liveJobs,
});

const chain = sealChain(rows);
const tip = rows[rows.length - 1].row_hash;
const vfy = verifyChain(rows);
if (!vfy.ok) { console.error('CHAIN VERIFY FAILED', vfy); process.exit(1); }
console.log(`chain: ${rows.length} rows, tip ${tip.slice(0, 16)} VERIFIED`);
for (const c of ['C1_capInvariant', 'C2_combinedDefense', 'C3_interaction', 'C4_noCollateral']) {
  console.log(`${c}: ${claims[c].verdict}  ${JSON.stringify(claims[c]).slice(0, 240)}`);
}

mkdirSync('experiments/outputs', { recursive: true });
writeFileSync('experiments/outputs/e33_summary.json', JSON.stringify({
  task: 'E33', name: 'flood copying a toxic founder (combined attack at cap scale)',
  seeds: SEEDS, T, voices: V, arms: ARMS, runtime_s: Number(elapsed),
  config: {
    world: { FLIP_P, REROLL_P, N, TOXIC, TOX_Q }, attack: WIN, postWindow: POST, pre: PRE,
    hedge: CFG, admission: ADM, capSlack: CAP_SLACK, sybils: FLOOD, poisonBlock: POISON,
  },
  arms: armsAgg, claims,
  paired: {
    C2_delta_v3_minus_v31: { mean: r6(mean(dC2)), se: r6(se2), signTest: st2 },
    C3_I_cross: { mean: r6(IxMean), se: r6(seIx) },
    C3_I_within_v31: { mean: r6(mean(dW31)), se: r6(seW31) },
    C3_I_within_v3: { mean: r6(mean(dW3)), se: r6(seW3) },
    C4_honQ_diff_comb_minus_found: { mean: r6(mean(honQDiff)), se: r6(seQ) },
  },
  curves: seed0Curves,
  chain: { rows: rows.length, tip, verified: vfy.ok },
}, null, 1));
writeFileSync('experiments/outputs/receipts_e33.jsonl', rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
console.log('wrote experiments/outputs/e33_summary.json + receipts_e33.jsonl');
console.log(vault.liveJobs === 0 ? 'E33 DONE' : 'E33 PROBLEM (live jobs)');
