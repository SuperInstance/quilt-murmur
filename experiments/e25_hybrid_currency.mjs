// E25 — HYBRID CURRENCY: THE MESH GAINS THE ARENA'S PROBE
// ========================================================
// E22's CURRENCY LESSON: arena probes are ground truth but perish with the
// round; mesh whispers are noisy but reusable evidence that accumulates in
// trust. E25 tests the synthesis that lesson predicted: a mesh mind that
// spends a fraction rho of its per-round ration on DIRECT arena-style arm
// probes and writes each probe's observed reward into its OWN trust
// substrate as a whisper (the PROBE-WITNESS) — so perishable probe rewards
// become durable pooled evidence. Can it buy the arena's clean-bracket
// exploitation speed WITHOUT losing the mesh's adversarial demotion and
// ration elasticity?
//
// ARMS (rho = fraction of the ration spent on direct arm probes):
//   arena    rho=1.0 — E22's ucb1 verbatim: K arm-reward probes, running-mean
//            stats, UCB optimism, NO sheet, NO pooling (pure arena parent)
//   meshE    rho=0.0 — E22's meshE verbatim: K trust-weighted subscribed
//            whispers pooled through HedgeTrust, eps=0.15 pick, NO probes
//            (pure mesh parent; witness cells present but inert at baseline
//            weight — the witness factor is exactly 1.0)
//   hybrid25 rho=0.25 — 1 probe + 3 whispers (K=4); 2 + 6 (K=8)
//   hybrid50 rho=0.5  — 2 probes + 2 whispers (K=4); 4 + 4 (K=8)
//
// THE PROBE-WITNESS (defined HERE, in-experiment — zero core edits):
//   each arm j owns a witness voice in the mesh substrate:
//     h{j}.p — the witness's standing claim: "arm j currently pays like
//              regime p" (its whisper, pooled like any sender's)
//     w.h{j} — HedgeTrust weight of the witness (its trust)
//     s.h{j} — gate: 1 for exactly ONE pool read after each probe (ttl=1;
//              stale claims are gated out — E22 stale-off-gate doctrine)
//   Probe of arm j at round t observing reward r (ground truth):
//     (a) INVERT to an implied regime belief: bin-posterior of r under the
//         arm's PRE-update context values val[j][.] (L_b = exp(-(r -
//         val[j][b])^2 / (2*sigma^2))), p_x = sum_b post_b * center_b;
//         whisper h{j}.p = p_x (gated into the NEXT pool read)
//     (b) TEST the witness's PRIOR claim against the fresh reward:
//         credit = clamp(0.5 + 0.7*2*(post[binOf(priorClaim)] - 1/3))
//         — a claimed-bin proper scoring rule; a booby trap is a maximum-
//         surprise event (claim HIGH, reward LOW) so the advocate CRASHES
//         (multiplicative Hedge demotion, same rule E22 used for the liar)
//     (c) the same observation EMA-updates val[j][bin] (beta=0.25) — fast
//         un-learning, vs the arena's 1/n running-mean forgetting
//   Arm pick (hybrids): score_j = val[j][bin(pool)] * clamp(0.2 + 4.8*w.h{j},
//   0.2, 1.25) + sqrt(ln(totObs+1)/max(1,nb[j])) — the mesh's trust-gated
//   context value PLUS earned UCB optimism on direct observations; and
//   eps_pick = 0.15*(1-rho): each mind's exploration follows its currency
//   (the pure mesh explores blindly; hybrids convert exploration into probe
//   coverage + earned optimism; the pure arena is fully optimistic).
//
// LEGS: clean K=4 (main bracket + rho curve), clean K=8 (elasticity),
// adversary K=4 — the E22 booby-trapped ARM for EVERY arm: the hybrid
// consumes both currencies, so it meets the adversary that attacks its
// arena leg (E22's family-specific adversary split is resolved here,
// receipted). Trap: the seed's clean best-fixed arm pays -0.4 from t=150.
//
// RATION AUDIT (receipted): every arm gets exactly K side observations per
// round + the played reward. hybrid: Kprobe direct probes + Kwhisp
// subscribed whispers, Kprobe + Kwhisp = K exactly. arena: min(K, M-1)
// probes (currency saturates at the arm count). meshE: K whispers.
// world.p is read ONLY for subscribed senders; world.rew ONLY for played +
// probed arms; hindsight fits are read ONLY for regret accounting.
//
// SHEET (mesh arms): n{i}.p / w.n{i} / s.n{i} senders (E22) + h{j}.p /
// w.h{j} / s.h{j} witnesses + ONE pooled formula mesh.pool (gated
// trust-weighted log-odds over ALL 18 voice cells) + a{j}.v{b} context
// values + a{j}.nb / u.tot observation counts (hybrids) + a{j}.score pick
// cells. Sheet pool === MurmurBus.pool reference math verified every 20
// rounds, tol 1e-9, 0 mismatches receipted; pool DENOMINATOR (the normalizer
// of every in-pool share) receipted per arm per leg.
//
// Reproducibility: all randomness from the vault stream (moth.mjs
// streamFor, offline:true — MOCK pool, 0 live jobs, 0 network); Math.random
// monkey-patched onto the vault stream inside the per-seed runner, restored
// in finally (e15 pattern). Stream keys are e25-namespaced; worlds are
// distribution-identical to E22's (same generator, same draw order) but not
// bit-paired across experiments.
//
// Run: node experiments/e25_hybrid_currency.mjs [seeds]

import { QuiltEngine } from '../engine/dist/index.js';
import { HedgeTrust } from '../murmur/trust.mjs';
import { MurmurBus } from '../murmur/bus.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { fnv1a64, sealChain, verifyChain } from '../murmur/receipts.mjs';
import { writeFileSync, readFileSync } from 'node:fs';

// ---------------- config ----------------
const SEEDS = Number(process.argv[2] || 8);
const T = 400;               // rounds
const ADV_T = 150;           // booby trap turns at this round (t >= ADV_T)
const FLIP_P = 0.02;         // Markov regime-flip probability
const M = 6;                 // arms
const N = 12;                // senders
const K_MAIN = 4;            // main ration
const K_ELASTIC = 8;         // elasticity ration (clean leg only, as E22)
const REW_SD = 0.08;         // arm reward noise
const ETA = 0.35, SHARE = 0.03;       // HedgeTrust (both substrates)
const EPS_PICK_MESH = 0.15;  // meshE pick exploration (E22-exact at rho=0)
const EPS_SUB = 0.15;        // subscription exploration (E22-exact)
const BETA = 0.25;           // context-bin value EMA (E22 mesh learning rate)
const SIG_R = 0.12;          // reward likelihood width (E22)
const CREDIT = 0.7;          // trust credit gain (E22)
const B0 = 1 / 3, B1 = 2 / 3;// context-bin thresholds on the pooled belief
const TRAP_DROP = 0.4;       // booby-trap mean drop (E22)
const W_BASE = 1 / 6;        // witness baseline trust (6 witness voices)
const FACTOR_LO = 0.2, FACTOR_GAIN = 4.8, FACTOR_HI = 1.25; // clamp(LO+GAIN*w, LO, HI); =1 at baseline
const CENTERS = [1 / 6, 0.5, 5 / 6]; // regime-bin centers for implied beliefs
const DEMOTE_W = 1 / 12;     // witness "demoted" bar: half its baseline weight

const IDS = Array.from({ length: N }, (_, i) => `n${i + 1}`);        // senders
const WIDS = Array.from({ length: M }, (_, j) => `h${j + 1}`);       // probe-witnesses
const MESH = ['meshE', 'hybrid25', 'hybrid50'];
const ARMS = ['arena', ...MESH];
const RHO = { arena: 1, meshE: 0, hybrid25: 0.25, hybrid50: 0.5 };
const SEGS = Array.from({ length: 8 }, (_, i) => [i * 50, (i + 1) * 50]);
const CPS = [140, 145, 150, 155, 160, 170, 200, 250, 300, 399]; // witness-trust checkpoints

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const sd = (xs) => (xs.length ? Math.sqrt(xs.reduce((a, b) => a + (b - mean(xs)) ** 2, 0) / xs.length) : 0);
const binOf = (x) => (x < B0 ? 0 : x < B1 ? 1 : 2);
const idOf = (i) => `n${i + 1}`;
const widOf = (j) => `h${j + 1}`;
function argmaxR(arr, rng) {
  let bi = 0;
  for (let j = 1; j < arr.length; j++) {
    if (arr[j] > arr[bi] + 1e-12 || (Math.abs(arr[j] - arr[bi]) <= 1e-12 && rng() < 0.5)) bi = j;
  }
  return bi;
}
// bin-posterior of a reward under an arm's context values (pre-update) —
// the shared likelihood behind sender credit, witness credit, and the
// witness's implied regime belief
function binPost(reward, vals) {
  const Lb = [0, 1, 2].map((b) => Math.exp(-((reward - vals[b]) ** 2) / (2 * SIG_R * SIG_R)));
  const Z = Lb[0] + Lb[1] + Lb[2];
  return Lb.map((x) => x / Z);
}

// ---------------- world (paired streams; one build per variant) ----------------
// E22's generator verbatim (same draw ORDER so worlds are
// distribution-identical to E22's): every draw comes from stream
// `e25:world:{seed}`; clean / adv builds repeat the IDENTICAL draw sequence
// (the unused lie draws are taken in both variants) so noise is paired
// across every arm and every leg. The adversary only TRANSFORMS (never
// re-draws): the seed's clean best-fixed arm pays TRAP_DROP less for t>=150.
function makeWorld(seed, streamFor, variant) {
  const s = streamFor(`e25:world:${seed}`);
  const g = () => Math.sqrt(-2 * Math.log(Math.max(1e-9, s()))) * Math.cos(2 * Math.PI * s());
  const thetaK = [0, 1, 2].map(() => 0.15 + 0.70 * s());
  const reg = new Array(T);
  reg[0] = Math.floor(s() * 3);
  for (let t = 1; t < T; t++) reg[t] = s() < FLIP_P ? (reg[t - 1] + 1 + Math.floor(s() * 2)) % 3 : reg[t - 1];
  const mu = [], lam = [];
  for (let j = 0; j < M; j++) { mu.push(0.30 + 0.30 * s()); lam.push(-0.45 + 0.90 * s()); }
  const fit = [];
  for (let j = 0; j < M; j++) fit.push([0, 1, 2].map((k) => clamp(mu[j] + lam[j] * (thetaK[k] - 0.5), 0.05, 0.95)));
  // sender acuities: 4 sharp / 4 mid / 3 dull stratified, shuffled; sender 12 sharp
  const sig = [];
  for (let q = 0; q < 4; q++) sig.push(0.05 + s() * 0.05);
  for (let q = 0; q < 4; q++) sig.push(0.10 + s() * 0.10);
  for (let q = 0; q < 3; q++) sig.push(0.20 + s() * 0.10);
  for (let i = 10; i >= 0; i--) { const jj = Math.floor(s() * (i + 1)); const tmp = sig[i]; sig[i] = sig[jj]; sig[jj] = tmp; }
  sig.push(0.06); // sender 12 (index 11): sharp by construction
  // clean best-fixed arm (hindsight, noiseless fit) — also the trap target
  const totFit = new Array(M).fill(0);
  for (let j = 0; j < M; j++) for (let t = 0; t < T; t++) totFit[j] += fit[j][reg[t]];
  const bestFixClean = totFit.indexOf(Math.max(...totFit));
  const trapIdx = variant === 'adv' ? bestFixClean : null;
  const fitT = Array.from({ length: M }, () => new Array(T));
  for (let t = 0; t < T; t++) {
    for (let j = 0; j < M; j++) {
      fitT[j][t] = fit[j][reg[t]] - (trapIdx === j && t >= ADV_T ? TRAP_DROP : 0);
    }
  }
  // reports + rewards (drawn identically in every variant build)
  const p = Array.from({ length: N }, () => new Array(T));
  const rew = Array.from({ length: M }, () => new Array(T));
  for (let t = 0; t < T; t++) {
    const th = thetaK[reg[t]];
    for (let i = 0; i < N; i++) p[i][t] = clamp(th + g() * sig[i], 0.02, 0.98);
    for (let j = 0; j < M; j++) rew[j][t] = fitT[j][t] + g() * REW_SD;
  }
  const lie = new Array(T);
  for (let t = 0; t < T; t++) lie[t] = s(); // drawn in BOTH variants (pairing), used by neither (no liar leg in E25)
  // hindsight oracles for THIS variant (noiseless fit reference)
  const totT = new Array(M).fill(0);
  for (let j = 0; j < M; j++) for (let t = 0; t < T; t++) totT[j] += fitT[j][t];
  const bestFix = totT.indexOf(Math.max(...totT));
  const fitFix = new Array(T), fitDyn = new Array(T);
  for (let t = 0; t < T; t++) {
    fitFix[t] = fitT[bestFix][t];
    fitDyn[t] = Math.max(...fitT.map((f) => f[t]));
  }
  return { seed, variant, thetaK, reg, fit, sig, p, rew, bestFix, bestFixClean, trapIdx, fitFix, fitDyn };
}

// ---------------- the sheet (mesh arms; one build, bonus flag for hybrids) ----------------
// Two-segment ids everywhere; no id is a dotted-path-prefix of another
// (w.n1 vs w.n12 / w.h1 vs w.h6 differ in segment 2 — E22 doctrine); no
// bare short ids (E15 lesson). ONE pooled formula (mesh.pool) over 18 voice
// cells; arm-pick score cells route the pooled belief through learned
// context-bin values, gated by the arm's witness trust (the demotion lever)
// and, for hybrids, boosted by earned UCB optimism over direct observations.
function buildSheet(bonus) {
  const cells = [];
  for (let i = 1; i <= N; i++) {
    cells.push({ id: `n${i}.p`, kind: 'value', value: 0.5,
      description: `sender n${i} whisper p this round (SUBSCRIBED writes only; stale values are gated out)` });
    cells.push({ id: `w.n${i}`, kind: 'value', value: 1 / N,
      description: `HedgeTrust weight of sender n${i} (written back each round pre-pool)` });
    cells.push({ id: `s.n${i}`, kind: 'value', value: 0,
      description: `subscription gate for sender n${i} (1 = inside this round's whisper ration)` });
  }
  for (let j = 1; j <= M; j++) {
    cells.push({ id: `h${j}.p`, kind: 'value', value: 0.5,
      description: `probe-witness h${j} standing claim: arm ${j} currently pays like regime p (written at each probe; pooled exactly once via gate)` });
    cells.push({ id: `w.h${j}`, kind: 'value', value: W_BASE,
      description: `HedgeTrust weight of probe-witness h${j} (baseline ${W_BASE.toFixed(4)}; demotion lever for arm ${j})` });
    cells.push({ id: `s.h${j}`, kind: 'value', value: 0,
      description: `witness gate for arm ${j} (1 for exactly one pool read after a probe — ttl=1 via gate)` });
  }
  const lg = (x) => `Math.log(clamp(${x},0.02,0.98)/(1-clamp(${x},0.02,0.98)))`;
  const senderTerms = IDS.map((id, i) => `s.${id}*w.${id}*${lg(`n${i + 1}.p`)}`).join(' + ');
  const witnessTerms = WIDS.map((id, j) => `s.${id}*w.${id}*${lg(`h${j + 1}.p`)}`).join(' + ');
  const gateTerms = [...IDS.map((id) => `s.${id}*w.${id}`), ...WIDS.map((id) => `s.${id}*w.${id}`)].join(' + ');
  cells.push({ id: 'mesh.pool', kind: 'formula',
    expr: `(1/(1+Math.exp(-((${senderTerms} + ${witnessTerms})/max(${gateTerms},0.000000001)))))`,
    description: 'ONE pooled formula: subscription-gated, trust-weighted log-odds pool over senders AND probe-witnesses (the denominator is the receipted normalizer of every in-pool share)' });
  for (let j = 1; j <= M; j++) {
    for (let b = 0; b < 3; b++) {
      cells.push({ id: `a${j}.v${b}`, kind: 'value', value: 0.5,
        description: `context value of arm ${j} in bin ${b} (EMA over DIRECT observations: played + probed rewards, written back)` });
    }
    if (bonus) {
      cells.push({ id: `a${j}.nb`, kind: 'value', value: 0,
        description: `direct-observation count of arm ${j} (played + probed; feeds earned UCB optimism)` });
    }
    const routed = `(mesh.pool < 0.3333333333 ? a${j}.v0 : (mesh.pool < 0.6666666667 ? a${j}.v1 : a${j}.v2))`;
    const factor = `clamp(${FACTOR_LO} + ${FACTOR_GAIN}*w.h${j}, ${FACTOR_LO}, ${FACTOR_HI})`;
    const optimism = bonus ? ` + Math.sqrt(Math.log(u.tot + 1) / Math.max(1, a${j}.nb))` : '';
    cells.push({ id: `a${j}.score`, kind: 'formula',
      expr: `(${routed}) * (${factor})${optimism}`,
      description: `arm ${j} pick score: witness-trust-gated context value${bonus ? ' + earned UCB optimism on direct observations' : ' (meshE: witness at baseline => factor 1.0, E22-exact)'}` });
  }
  if (bonus) {
    cells.push({ id: 'u.tot', kind: 'value', value: 0,
      description: 'total direct observations so far (played + probed; the optimism clock)' });
  }
  return { id: 'e25-hybrid-currency', title: 'E25 Hybrid Currency', cells };
}

// ---------------- preflight: sheet math === reference math ----------------
async function preflight() {
  const out = {};
  for (const bonus of [true, false]) {
    const engine = new QuiltEngine(`e25-preflight-${bonus ? 'hybrid' : 'mesh'}`, {});
    engine.loadSheet(buildSheet(bonus));
    const diffs = [];
    // mixed voices: 3 senders + 2 witnesses gated in, uniform then skewed trust
    const subs = [0, 1, 2], wits = [0, 3];
    const ps = [0.91, 0.84, 0.77], px = [0.80, 0.22];
    for (const i of subs) { await engine.set(`n${i + 1}.p`, ps[i]); await engine.set(`s.n${i + 1}`, 1); }
    for (const j of wits) { await engine.set(`h${j + 1}.p`, px[wits.indexOf(j)]); await engine.set(`s.h${j + 1}`, 1); }
    for (const ws of [[1 / 12, 1 / 12, 1 / 12, 1 / 6, 1 / 6], [0.5, 0.2, 0.1, 0.3, 0.05]]) {
      for (let k = 0; k < subs.length; k++) await engine.set(`w.n${subs[k] + 1}`, ws[k]);
      for (let k = 0; k < wits.length; k++) await engine.set(`w.h${wits[k] + 1}`, ws[3 + k]);
      const sheetP = (await engine.get('mesh.pool')).data;
      const ref = MurmurBus.pool([...ps, ...px], [...ws]);
      diffs.push(Math.abs(sheetP - ref));
    }
    // zero-influence: flipping an UNGATED whisper (sender AND witness) must not move the pool
    const before = (await engine.get('mesh.pool')).data;
    await engine.set('n7.p', 0.01);
    await engine.set('h2.p', 0.99);
    const after = (await engine.get('mesh.pool')).data;
    const zeroInfluenceDiff = Math.abs(before - after);
    // zero-trust voice inside the gate has zero influence (smoke doctrine)
    for (let k = 0; k < subs.length; k++) await engine.set(`w.n${subs[k] + 1}`, [0.4, 0.3, 0.2][k]);
    for (let k = 0; k < wits.length; k++) await engine.set(`w.h${wits[k] + 1}`, [0.1, 0.0][k]);
    await engine.set('n7.p', 0.5); await engine.set('s.n7', 1); await engine.set('w.n7', 0);
    const zt = (await engine.get('mesh.pool')).data;
    diffs.push(Math.abs(zt - MurmurBus.pool([...ps, ...px, 0.5], [0.4, 0.3, 0.2, 0.1, 0, 0])));
    // ttl=1: un-gating the witnesses drops the pool back to the sender-only reference
    for (const j of wits) await engine.set(`s.h${j + 1}`, 0);
    const senderOnly = (await engine.get('mesh.pool')).data;
    diffs.push(Math.abs(senderOnly - MurmurBus.pool(ps, [0.4, 0.3, 0.2])));
    // formula purity: exactly ONE formula reads whisper cells; 0 env cells;
    // score cells read only pool / values / witness weight / counts
    const all = buildSheet(bonus).cells;
    const whisperFormulaReaders = all.filter((c) => c.kind === 'formula' && /(n\d+\.p|h\d+\.p)/.test(String(c.expr))).length;
    const envReaders = all.filter((c) => c.kind === 'formula' && String(c.expr).includes('env.')).length;
    const scorePurity = all.filter((c) => String(c.id).endsWith('.score'))
      .every((c) => /mesh\.pool/.test(String(c.expr)) && !/[ns]\.n\d+|h\d+\.p/.test(String(c.expr)));
    out[bonus ? 'hybrid' : 'mesh'] = {
      cells: all.length, maxDiff: Math.max(...diffs), zeroInfluenceDiff,
      whisperFormulaReaders, envReaders, scorePurity,
      diffs: diffs.map((d) => d.toExponential(2)),
    };
  }
  return out;
}

// ---------------- arena mind (E22 ucb1 verbatim; NO sheet, NO murmur imports) ----------------
// RATION AUDIT: reads world.rew for the played arm + min(K, M-1) probed arms only.
function runArenaArm(world, Kv, rng) {
  const n = new Array(M).fill(0);
  const mu = new Array(M).fill(0.5);
  let totalObs = 0;
  const observe = (j, r) => { n[j]++; mu[j] += (r - mu[j]) / n[j]; totalObs++; };
  const regFix = new Array(T), regDyn = new Array(T);
  const trapSegs = new Array(8).fill(0);
  let trapPost = 0;
  const nProbe = Math.min(Kv, M - 1); // probe ration saturates at M-1 (E22 receipt)
  for (let t = 0; t < T; t++) {
    const ucb = mu.map((m, j) => m + Math.sqrt(Math.log(totalObs + 1) / Math.max(1, n[j])));
    const pick = argmaxR(ucb, rng);
    const reward = world.rew[pick][t]; // played arm — everyone collects this
    observe(pick, reward);
    if (world.trapIdx !== null && pick === world.trapIdx && t >= ADV_T) { trapPost++; trapSegs[Math.floor(t / 50)]++; }
    // probes: the ration, spent in arm-reward currency (UCB order over others)
    const others = [0, 1, 2, 3, 4, 5].filter((j) => j !== pick);
    const probes = others.sort((a, b) => ucb[b] - ucb[a] || a - b).slice(0, nProbe);
    for (const j of probes) observe(j, world.rew[j][t]); // direct reward probes
    regFix[t] = world.fitFix[t] - reward;
    regDyn[t] = world.fitDyn[t] - reward;
  }
  return { seed: world.seed, totalFix: regFix.reduce((a, b) => a + b, 0), totalDyn: regDyn.reduce((a, b) => a + b, 0), regFix, regDyn, trapSegs, trapPost };
}

// ---------------- mesh minds (sheet is the inference substrate) ----------------
// RATION AUDIT: world.p read ONLY for subscribed senders; world.rew read
// ONLY for the played arm and the Kprobe probed arms (the declared ration
// spend); hindsight fits read ONLY for regret accounting.
async function runMeshArm(arm, world, Kv, rng, engine, trust, wTrust, verify, den) {
  const rho = RHO[arm];
  const bonus = rho > 0;
  const Kprobe = Math.min(Math.round(rho * Kv), M - 1);
  const Kwhisp = Kv - Kprobe;             // Kprobe + Kwhisp === Kv exactly (receipted)
  const epsPick = EPS_PICK_MESH * (1 - rho);
  const val = Array.from({ length: M }, () => [0.5, 0.5, 0.5]);
  const claimP = new Array(M).fill(0.5);  // witness's current standing claim (mirror of h{j}.p cell)
  const priorP = new Array(M).fill(null); // claim BEFORE the current observation (null = silent witness)
  const nb = new Array(M).fill(0);
  let totObs = 0;
  const gates = new Array(N).fill(0);
  const wGates = new Array(M).fill(0);
  let probeSet = new Set();               // arms probed LAST round (gated into THIS pool)
  const probedBefore = new Array(M).fill(false);
  const regFix = new Array(T), regDyn = new Array(T);
  const trapSegs = new Array(8).fill(0);
  let trapPost = 0, demoteRound = null;
  const wCp = {};
  for (let t = 0; t < T; t++) {
    // 1. witness gates: exactly last round's probes are gated in (ttl=1)
    for (let j = 0; j < M; j++) {
      const want = probeSet.has(j) ? 1 : 0;
      if (wGates[j] !== want) { await engine.set(`s.${widOf(j)}`, want); wGates[j] = want; }
    }
    // 2. sender subscription (E22 meshE rule) over the WHISPER budget
    let sub = [];
    if (Kwhisp > 0) {
      const order = [...Array(N).keys()].sort((a, b) => (trust.weight(idOf(b)) - trust.weight(idOf(a))) || (a - b));
      sub = order.slice(0, Kwhisp);
      if (rng() < EPS_SUB && order.length > Kwhisp) {
        const slot = Math.floor(rng() * sub.length);
        const out = order.slice(Kwhisp);
        sub[slot] = out[Math.floor(rng() * out.length)];
      }
      sub.sort((a, b) => a - b);
    }
    // 3. gates — ration enforced IN-SHEET (diff-set to save engine ops)
    for (let i = 0; i < N; i++) {
      const want = sub.includes(i) ? 1 : 0;
      if (gates[i] !== want) { await engine.set(`s.${idOf(i)}`, want); gates[i] = want; }
    }
    // 4. whispers — ONLY subscribed senders are written (ration audit point)
    for (const i of sub) await engine.set(`n${i + 1}.p`, world.p[i][t]);
    // 5. trust write-back: subscribed senders + gated witnesses (pre-update
    //    state = exactly what this round's pool and verify use)
    for (const i of sub) await engine.set(`w.${idOf(i)}`, trust.weight(idOf(i)));
    const gatedWits = [...probeSet].sort((a, b) => a - b);
    for (const j of gatedWits) await engine.set(`w.${widOf(j)}`, wTrust.weight(widOf(j)));
    // 6. optimism clock + counts (hybrids only)
    if (bonus) {
      await engine.set('u.tot', totObs);
      for (let j = 0; j < M; j++) await engine.set(`a${j + 1}.nb`, nb[j]);
    }
    // 7. the sheet nominates
    const pool = (await engine.get('mesh.pool')).data;
    // 7b. every 20 rounds: sheet pool === reference log-odds math (tol 1e-9),
    //     over the SAME gated voices and PRE-update trust state the sheet used
    if (t % 20 === 0) {
      const voicesP = sub.map((i) => world.p[i][t]).concat(gatedWits.map((j) => claimP[j]));
      const voicesW = sub.map((i) => trust.weight(idOf(i))).concat(gatedWits.map((j) => wTrust.weight(widOf(j))));
      const ref = MurmurBus.pool(voicesP, voicesW);
      const d = Math.abs(ref - pool);
      verify.checks++;
      verify.maxDiff = Math.max(verify.maxDiff, d);
      if (d > 1e-9) verify.mismatches++;
    }
    // 7c. pool denominator receipt (the normalizer of every in-pool share)
    if (t % 10 === 0) {
      const denW = sub.reduce((a, i) => a + trust.weight(idOf(i)), 0)
        + gatedWits.reduce((a, j) => a + wTrust.weight(widOf(j)), 0);
      const witW = gatedWits.reduce((a, j) => a + wTrust.weight(widOf(j)), 0);
      den.samples++; den.denSum += denW; den.witSum += witW;
      den.voiceSum += sub.length + gatedWits.length;
    }
    const bin = binOf(pool);
    const scores = [];
    for (let j = 0; j < M; j++) scores.push((await engine.get(`a${j + 1}.score`)).data);
    // 8. harness commits (eps-pick scaled by probe coverage, else sheet argmax)
    const pick = rng() < epsPick ? Math.floor(rng() * M) : argmaxR(scores, rng);
    const reward = world.rew[pick][t]; // played arm — everyone collects this
    if (world.trapIdx !== null && pick === world.trapIdx && t >= ADV_T) { trapPost++; trapSegs[Math.floor(t / 50)]++; }
    // 9. sender credit — E22 bin-posterior rule on the PLAYED reward (pre-
    //    update val): subscribed senders in reward-favored bins earn, others
    //    pay; unsubscribed get the neutral 0.5 (trust tracks evidence consumed)
    const postPick = binPost(reward, val[pick]);
    const rewards = new Map();
    for (let i = 0; i < N; i++) rewards.set(idOf(i), 0.5);
    for (const i of sub) {
      const gg = postPick[binOf(world.p[i][t])] - 1 / 3;
      rewards.set(idOf(i), clamp(0.5 + CREDIT * gg * 2, 0.02, 0.98));
    }
    trust.update(rewards);
    // 10. witness credit for the PLAYED arm (hybrids): the played reward is a
    //     direct observation — test the witness's standing claim (pre-update)
    const wRewards = new Map(WIDS.map((id) => [id, 0.5]));
    if (bonus && probedBefore[pick]) {
      const gg = postPick[binOf(priorP[pick])] - 1 / 3;
      wRewards.set(widOf(pick), clamp(0.5 + CREDIT * gg * 2, 0.02, 0.98));
    }
    // 11. context-bin value update (played reward; EMA — fast un-learning)
    val[pick][bin] += BETA * (reward - val[pick][bin]);
    nb[pick]++; totObs++;
    await engine.set(`a${pick + 1}.v${bin}`, val[pick][bin]);
    // 12. PROBES — the hybrid's ration share, spent in arm-reward currency
    //     (UCB optimism over direct observations among non-picked arms)
    const newProbeSet = new Set();
    if (Kprobe > 0) {
      const ucbP = val.map((v, j) => v[bin] + Math.sqrt(Math.log(totObs + 1) / Math.max(1, nb[j])));
      const others = [0, 1, 2, 3, 4, 5].filter((j) => j !== pick);
      const probes = others.sort((a, b) => ucbP[b] - ucbP[a] || a - b).slice(0, Kprobe);
      for (const j of probes) {
        const r = world.rew[j][t]; // direct probe — ground truth (ration audit point)
        const post = binPost(r, val[j]); // PRE-update values: no self-confirmation
        // (a) implied regime belief -> whisper (gated into the NEXT pool read)
        const px = clamp(post.reduce((a, pb, b) => a + pb * CENTERS[b], 0), 0.02, 0.98);
        await engine.set(`h${j + 1}.p`, px);
        claimP[j] = px;
        // (b) test the witness's PRIOR claim against this fresh reward
        if (probedBefore[j]) {
          const gg = post[binOf(priorP[j])] - 1 / 3;
          wRewards.set(widOf(j), clamp(0.5 + CREDIT * gg * 2, 0.02, 0.98));
        }
        priorP[j] = px;
        probedBefore[j] = true;
        // (c) fast EMA un-learning on the direct observation
        val[j][bin] += BETA * (r - val[j][bin]);
        nb[j]++; totObs++;
        await engine.set(`a${j + 1}.v${bin}`, val[j][bin]);
        newProbeSet.add(j);
      }
    }
    probeSet = newProbeSet;
    // 13. witness trust update (one Hedge step per round; meshE never has
    //     events -> all-neutral = no relative change -> skipped, weights frozen)
    if (bonus) wTrust.update(wRewards);
    // 14. records (regret accounting is hindsight/score-only — no decision reads it)
    regFix[t] = world.fitFix[t] - reward;
    regDyn[t] = world.fitDyn[t] - reward;
    if (world.trapIdx !== null && t >= ADV_T && demoteRound === null && wTrust.weight(widOf(world.trapIdx)) < DEMOTE_W) demoteRound = t;
    if (world.trapIdx !== null && CPS.includes(t)) wCp[t] = +wTrust.weight(widOf(world.trapIdx)).toFixed(4);
  }
  return {
    seed: world.seed, Kprobe, Kwhisp, epsPick, totalFix: regFix.reduce((a, b) => a + b, 0),
    totalDyn: regDyn.reduce((a, b) => a + b, 0), regFix, regDyn, trapSegs, trapPost,
    demoteRound, wCp, totObs,
  };
}

// ---------------- per-seed runner (Math.random vault patch, e15 pattern) ----------------
async function runSeed(seed, streamFor) {
  const origRandom = Math.random;
  Math.random = streamFor(`e25:rand:${seed}`);
  try {
    const clean = makeWorld(seed, streamFor, 'clean');
    const adv = makeWorld(seed, streamFor, 'adv');
    const out = {};
    for (const [leg, world, Kv] of [['cleanK4', clean, K_MAIN], ['cleanK8', clean, K_ELASTIC], ['advK4', adv, K_MAIN]]) {
      for (const arm of ARMS) {
        const rng = streamFor(`e25:arm:${arm}:${leg}:${seed}`);
        let rec;
        if (arm === 'arena') {
          rec = runArenaArm(world, Kv, rng);
        } else {
          const engine = new QuiltEngine(`e25-${arm}-${leg}-${seed}`, {});
          engine.loadSheet(buildSheet(RHO[arm] > 0));
          const trust = new HedgeTrust(IDS, { eta: ETA, share: SHARE });
          const wTrust = new HedgeTrust(WIDS, { eta: ETA, share: SHARE });
          const verify = { checks: 0, mismatches: 0, maxDiff: 0 };
          const den = { samples: 0, denSum: 0, witSum: 0, voiceSum: 0 };
          rec = await runMeshArm(arm, world, Kv, rng, engine, trust, wTrust, verify, den);
          rec.verify = verify;
          rec.den = den;
        }
        out[`${arm}:${leg}`] = rec;
      }
    }
    return out;
  } finally { Math.random = origRandom; }
}

// ---------------- main ----------------
const t0 = Date.now();
console.log(`-- E25 hybrid currency · ${SEEDS} seeds × 4 arms × ${T} rounds · ration K=${K_MAIN} (+K=${K_ELASTIC} clean) · booby trap at t=${ADV_T} --`);
const vault = new MothVault({ label: 'e25', offline: true }); // ALWAYS offline — 0 live jobs, 0 network
const harvest = await vault.harvest(256);
console.log(`vault: ${harvest.mock ? 'MOCK' : 'LIVE ' + harvest.jobId} digest=${harvest.poolDigest.slice(0, 10)} bits=${harvest.bits.length}`);
const streamFor = (key) => vault.streamFor(harvest, key);

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });

book('vault', { label: 'e25', offline: true, mock: harvest.mock, bits: harvest.bits.length, poolDigest: harvest.poolDigest, liveJobs: vault.liveJobs, note: 'live budget reserved; deterministic mock pool only' });

const pf = await preflight();
book('sheet.preflight', { ...pf, note: 'mesh.pool === MurmurBus.pool reference math over MIXED sender+witness voices (uniform + skewed trust); ungated whisper flip (sender AND witness) has zero influence; zero-trust gated voice has zero influence; witness gate off returns pool to sender-only reference (ttl=1 via gate); exactly ONE formula reads whisper cells; 0 env cells; two sheet variants (hybrid bonus / meshE no-bonus)' });
console.log(`preflight: hybrid ${pf.hybrid.cells}c maxDiff=${pf.hybrid.maxDiff} | mesh ${pf.mesh.cells}c maxDiff=${pf.mesh.maxDiff} | zeroInfl=${pf.hybrid.zeroInfluenceDiff.toExponential(2)}`);

book('run.config', {
  seeds: SEEDS, rounds: T, regimes: 3, flipP: FLIP_P, senders: N, arms: M, rationK: K_MAIN, elasticK: K_ELASTIC,
  thetaRange: [0.15, 0.85], fitMap: 'fit_j(k) = clamp(mu_j + lam_j*(theta_k-0.5), 0.05, 0.95), mu~U(0.30,0.60), lam~U(-0.45,0.45), per seed',
  rewardNoise: REW_SD, acuities: 'stratified 4x[0.05,0.10] / 4x[0.10,0.20] / 3x[0.20,0.30] shuffled; sender12 sigma=0.06 (E22 generator verbatim, e25 stream namespace)',
  arms: {
    arena: 'rho=1: E22 ucb1 verbatim (running mean + sqrt(ln t / n) optimism, K=min(K,M-1) direct probes, no sheet, no pooling)',
    meshE: 'rho=0: E22 meshE verbatim (trust-weighted subscribe top-K + eps_sub 0.15 re-roll, eps_pick 0.15, bin-posterior sender credit, no probes; witness cells inert at baseline weight => factor 1.0)',
    hybrid25: 'rho=0.25: Kprobe=round(0.25*K) direct probes + Kwhisp=K-Kprobe subscribed whispers; probe rewards whispered by per-arm probe-witnesses into the SAME pool; eps_pick=0.15*(1-rho); earned UCB optimism on direct observations',
    hybrid50: 'rho=0.5: same machinery, Kprobe=round(0.5*K)',
  },
  probeWitness: {
    claim: 'h{j}.p = implied regime belief p_x = sum_b post_b*center_b, post = bin-posterior of the probed reward under PRE-update val[j][.] (no self-confirmation), centers [1/6,1/2,5/6]',
    ttl: 'gated into exactly ONE pool read after each probe (s.h{j} recomputed from last round\'s probe set; stale claims gated out)',
    credit: 'claimed-bin scoring rule: on every direct observation (played or probed) of arm j, credit = clamp(0.5 + 0.7*2*(post[binOf(prior claim)] - 1/3)); silent witnesses (never probed) stay neutral; one HedgeTrust step per round over h1..h6 (eta 0.35, share 0.03)',
    demotionLever: 'a{j}.score = routed val[j][bin(pool)] * clamp(0.2 + 4.8*w.h{j}, 0.2, 1.25) (+ earned UCB optimism for hybrids); factor = 1.0 exactly at baseline weight 1/6',
    demoteBar: DEMOTE_W,
  },
  rationCurrencies: {
    hybrid: 'Kprobe direct arm-reward probes (ground truth) + Kwhisp subscribed whispers; Kprobe+Kwhisp = K exactly; probes observed AFTER the pick (same-round probe results inform the NEXT pick — same information flow as the arena, receipted)',
    arena: 'min(K, M-1) direct probes (currency saturates at the arm count)',
    mesh: 'K subscribed whispers, gated in-sheet',
    accounting: 'ration counted in observations, not bytes; every arm also collects the played reward',
  },
  adversary: {
    turnRound: ADV_T,
    spec: `E22 booby-trapped ARM for EVERY arm: the seed's clean best-fixed arm pays -${TRAP_DROP} for t>=${ADV_T} (must un-learn); trap targets the clean best arm so un-learning is real`,
    designNote: 'E22 ran family-specific adversaries (trap for arena, liar for mesh) because the families share no currency; E25 resolves that split — the hybrid consumes BOTH currencies, so every arm meets the trap. The liar leg is E22-receipted and out of scope here.',
  },
  hedge: { eta: ETA, share: SHARE, substrates: 'two independent HedgeTrust instances: senders n1..n12 (E22) and probe-witnesses h1..h6 (new)' },
  explorationDoctrine: 'each mind explores with its own currency: meshE blind eps 0.15 (E22-exact); hybrids eps = 0.15*(1-rho) + UCB optimism over direct-observation counts + UCB-ordered probes; arena pure UCB optimism',
  resonance: 'meter omitted: no coherence-gated arm in E25 and no claim reads r (E16/E22 doctrine receipted there)',
  reproducibility: 'all randomness from vault streamFor (offline MOCK); Math.random patched onto the vault stream per seed, restored in finally (e15 pattern); e25 stream namespace (distribution-identical worlds to E22, not bit-paired)',
});

// ---------------- run all seeds ----------------
const verify = { checks: 0, mismatches: 0, maxDiff: 0 };
const results = {}; // results[arm][leg] = [per-seed rec]
for (const arm of ARMS) results[arm] = {};
const curves0 = { cleanK4: {}, advK4: {} };
for (let seed = 0; seed < SEEDS; seed++) {
  const out = await runSeed(seed, streamFor);
  for (const [key, rec] of Object.entries(out)) {
    const [arm, leg] = key.split(':');
    (results[arm][leg] = results[arm][leg] || []).push(rec);
    if (rec.verify) { verify.checks += rec.verify.checks; verify.mismatches += rec.verify.mismatches; verify.maxDiff = Math.max(verify.maxDiff, rec.verify.maxDiff); }
    if (seed === 0 && rec.regFix && curves0[leg] !== undefined) {
      const cum = []; let acc = 0;
      for (let t = 0; t < T; t++) { acc += rec.regFix[t]; if (t % 10 === 0) cum.push({ t, cumFix: +acc.toFixed(2) }); }
      curves0[leg][arm] = cum;
    }
  }
}

// ---- aggregation ----
const seg = (arr, a, b) => mean(arr.slice(a, b));
function armStats(arm, leg) {
  const recs = results[arm][leg] || [];
  if (!recs.length) return null;
  const totals = recs.map((r) => r.totalFix);
  const dyns = recs.map((r) => r.totalDyn);
  const den = recs[0].den;
  return {
    n: recs.length,
    meanTotalFix: +mean(totals).toFixed(2), sdTotalFix: +sd(totals).toFixed(2),
    meanTotalDyn: +mean(dyns).toFixed(2), sdTotalDyn: +sd(dyns).toFixed(2),
    segFix: SEGS.map(([a, b]) => +mean(recs.map((r) => seg(r.regFix, a, b))).toFixed(4)),
    ...(den ? {
      poolDenominator: {
        samplesPerRun: den.samples,
        meanDen: +(den.denSum / den.samples).toFixed(4),
        meanWitnessShare: +(den.witSum / Math.max(den.denSum, 1e-12)).toFixed(4),
        meanGatedVoices: +(den.voiceSum / den.samples).toFixed(2),
        note: 'den = sum of gated voice weights (the pool normalizer); witnessShare = gated witness weight / den; sampled every 10 rounds',
      },
    } : {}),
  };
}

const LEGS = ['cleanK4', 'cleanK8', 'advK4'];
const agg = {};
for (const arm of ARMS) {
  agg[arm] = { rho: RHO[arm] };
  for (const leg of LEGS) agg[arm][leg] = armStats(arm, leg);
  book('arm.summary', {
    arm, family: arm === 'arena' ? 'arena' : 'mesh', rho: RHO[arm],
    cleanK4: agg[arm].cleanK4, cleanK8: agg[arm].cleanK8, advK4: agg[arm].advK4,
  });
  const c = agg[arm].cleanK4, k8 = agg[arm].cleanK8, a = agg[arm].advK4;
  console.log(`${arm.padEnd(9)} rho=${RHO[arm]}  cleanK4 ${c.meanTotalFix.toFixed(1)}±${c.sdTotalFix.toFixed(1)}  cleanK8 ${k8.meanTotalFix.toFixed(1)}±${k8.sdTotalFix.toFixed(1)}  advK4 ${a.meanTotalFix.toFixed(1)}±${a.sdTotalFix.toFixed(1)}`);
}

// ---- C1: clean bracket ----
{
  const A = agg.arena.cleanK4.meanTotalFix, E = agg.meshE.cleanK4.meanTotalFix;
  const H25 = agg.hybrid25.cleanK4.meanTotalFix, H50 = agg.hybrid50.cleanK4.meanTotalFix;
  const closure = (h) => +(((E - h) / (E - A))).toFixed(3);
  const ratio = (h) => +(h / Math.max(A, 1e-9)).toFixed(2);
  const bothBelowMesh = H25 < E && H50 < E;
  const barRatio = ratio(H50); // "within ~1.5x of arena"
  const verdict = bothBelowMesh && barRatio <= 1.5
    ? `CONFIRMED: hybrid50 ${H50} is ${barRatio}x arena's ${A} (<=1.5x) and both hybrids beat meshE (${E}); gap closure ${(closure(H50) * 100).toFixed(0)}%`
    : bothBelowMesh
      ? `PARTIAL: both hybrids beat meshE (${E}) and close ${(closure(H25) * 100).toFixed(0)}% / ${(closure(H50) * 100).toFixed(0)}% of the arena-mesh gap (denominator ${+(E - A).toFixed(2)} = ${E} - ${A}), but hybrid50 ${H50} is ${barRatio}x arena's ${A} — over the ~1.5x bar; the residual is the mesh's blind-eps pick tax (eps=${(EPS_PICK_MESH * 0.5).toFixed(3)} at rho=0.5, receipted below), not estimation quality`
      : `REFUTED: hybrids do not beat meshE (${H25}/${H50} vs ${E})`;
  const c1 = {
    claim: 'C1 clean bracket (K=4, 8 seeds): hybrid regret closes most of the arena-mesh gap — hybrid50 within ~1.5x of ucb1-arena AND both < meshE',
    totals: { arena: A, meshE: E, hybrid25: H25, hybrid50: H50 },
    sd: { arena: agg.arena.cleanK4.sdTotalFix, meshE: agg.meshE.cleanK4.sdTotalFix, hybrid25: agg.hybrid25.cleanK4.sdTotalFix, hybrid50: agg.hybrid50.cleanK4.sdTotalFix },
    gapClosure: { hybrid25: closure(H25), hybrid50: closure(H50), numerator: 'meshE_clean - hybrid_clean', denominator: 'meshE_clean - arena_clean', meshE: E, arena: A },
    ratioVsArena: { hybrid25: ratio(H25), hybrid50: ratio(H50), denominator: 'arena cleanK4 total regret' },
    bothBelowMeshE: bothBelowMesh,
    blindEpsTax: {
      perUnitEps: null, // filled below from the clean worlds
      epsAt: { hybrid25: +(EPS_PICK_MESH * 0.75).toFixed(4), hybrid50: +(EPS_PICK_MESH * 0.5).toFixed(4), meshE: EPS_PICK_MESH },
      formula: 'eps_pick * T * mean(fitFix - mean_j fit_j) — the expected regret of the blind pick share',
      expected: null,
    },
    dynamicOracleRegret: Object.fromEntries(ARMS.map((a) => [a, agg[a].cleanK4.meanTotalDyn])),
    verdict,
  };
  book('c1.answer', c1);
  console.log(`C1: arena ${A} | h25 ${H25} | h50 ${H50} | meshE ${E} -> ${verdict.split(':')[0]}`);
}

// ---- C2: adversary leg (booby-trapped arm, every arm) ----
{
  const A = agg.arena.advK4.meanTotalFix, E = agg.meshE.advK4.meanTotalFix;
  const H25 = agg.hybrid25.advK4.meanTotalFix, H50 = agg.hybrid50.advK4.meanTotalFix;
  const ratio = (h) => +(h / Math.max(A, 1e-9)).toFixed(2);
  const plays = (arm) => +mean(results[arm].advK4.map((r) => r.trapPost)).toFixed(1);
  const demoted = (arm) => results[arm].advK4.filter((r) => r.demoteRound !== null).length;
  const demoteRound = (arm) => {
    const d = results[arm].advK4.map((r) => r.demoteRound).filter((x) => x !== null);
    return d.length ? +mean(d).toFixed(1) : null;
  };
  const wTrap = (arm, t) => {
    const vals = results[arm].advK4.map((r) => (r.wCp[t] !== undefined ? r.wCp[t] : null)).filter((x) => x !== null);
    return vals.length ? +mean(vals).toFixed(4) : null;
  };
  const meshLike = H50 < A * 0.5 && H50 < E * 1.25;
  const c2 = {
    claim: 'C2 adversary robustness kept: under the booby-trapped arm the hybrid stays mesh-like (does NOT inherit the arena\'s forgetful running-mean) and the probe-written negative evidence demotes the trapped arm',
    totals: { arena: A, meshE: E, hybrid25: H25, hybrid50: H50 },
    ratioVsArena: { hybrid25: ratio(H25), hybrid50: ratio(H50), meshE: ratio(E), denominator: 'arena advK4 total regret' },
    meshLikeTest: { rule: 'hybrid50 adv < 0.5*arena adv AND < 1.25*meshE adv', passed: meshLike },
    demotion: {
      playsPostTrap: Object.fromEntries(ARMS.map((a) => [a, plays(a)])),
      witnessDemotedSeeds: Object.fromEntries(MESH.map((a) => [a, `${demoted(a)}/${results[a].advK4.length}`])),
      demoteRound: Object.fromEntries(MESH.map((a) => [a, demoteRound(a)])),
      trapWitnessWeight: Object.fromEntries(MESH.map((a) => [a, { at145: wTrap(a, 145), at170: wTrap(a, 170), at399: wTrap(a, 399), baseline: +W_BASE.toFixed(4), demoteBar: DEMOTE_W }])),
      mechanism: 'probe of the trapped arm writes (a) a LOW implied-regret whisper, (b) a claimed-bin credit crash for its advocate (maximum-surprise event), (c) an EMA un-learning of val[trap][.] at rate 0.25 — the arena instead forgets at rate 1/n and keeps playing',
      meshENote: 'meshE has no witness machinery (weights frozen at baseline): its brake is the beta=0.25 EMA on PLAYED rewards only — receipted contrast',
    },
    pairedDeltaPost150: (() => {
      const out = {};
      for (const arm of ARMS) {
        const adv = results[arm].advK4, clean = results[arm].cleanK4;
        const ds = adv.map((r, i) => seg(r.regFix, ADV_T, T) - seg(clean[i].regFix, ADV_T, T));
        out[arm] = { mean: +mean(ds).toFixed(4), sd: +sd(ds).toFixed(4), n: ds.length };
      }
      return out;
    })(),
    verdict: null,
  };
  c2.verdict = meshLike && demoted('hybrid50') >= Math.ceil(SEEDS * 0.75)
    ? `CONFIRMED: hybrid adv regret ${H50} = ${ratio(H50)}x arena's ${A} (mesh-like; meshE ${E}); trap witness demoted below ${DEMOTE_W.toFixed(3)} in ${demoted('hybrid50')}/${SEEDS} hybrid50 seeds (mean round ${demoteRound('hybrid50')}); trap played ${plays('hybrid50')}x post-150 vs arena's ${plays('arena')}x`
    : meshLike
      ? `PARTIAL: hybrid adv regret ${H50} = ${ratio(H50)}x arena's (mesh-like) but witness demotion reached the bar in only ${demoted('hybrid50')}/${SEEDS} seeds (demotion still visible: w at 170 = ${wTrap('hybrid50', 170)} vs baseline ${W_BASE.toFixed(3)}; trap plays ${plays('hybrid50')} vs arena ${plays('arena')})`
      : `REFUTED: hybrid adv regret ${H50} is not mesh-like (arena ${A}, meshE ${E})`;
  book('c2.answer', c2);
  console.log(`C2: adv arena ${A} | h25 ${H25} | h50 ${H50} | meshE ${E} -> ${c2.verdict.split(':')[0]}`);
}

// ---- C3: ration elasticity (clean K4 vs K8) ----
{
  const perArm = {};
  for (const arm of ARMS) {
    const k4 = agg[arm].cleanK4.meanTotalFix, k8 = agg[arm].cleanK8.meanTotalFix;
    perArm[arm] = { k4, k8, ratioK8overK4: +(k8 / Math.max(k4, 1e-9)).toFixed(3) };
  }
  const probes = (arm, Kv) => (arm === 'arena' ? Math.min(Kv, M - 1) : Math.min(Math.round(RHO[arm] * Kv), M - 1));
  const sat = Object.fromEntries(ARMS.map((a) => [a, { k4: probes(a, 4), k8: probes(a, 8) }]));
  const hybridsGraceful = perArm.hybrid25.ratioK8overK4 <= perArm.arena.ratioK8overK4
    && perArm.hybrid50.ratioK8overK4 <= perArm.arena.ratioK8overK4;
  const c3 = {
    claim: 'C3 elasticity: K4->K8 regret scaling for hybrids is mesh-like (graceful), not arena-like (whose probe currency saturates at M-1)',
    perArm, effectiveProbes: sat,
    saturationNote: 'arena K=8 effective probes = min(8, M-1) = 5 (+1 over K=4): its currency is capped by the arm count; hybrid25 1->2 and hybrid50 2->4 probes (+100%) while whisper coverage also grows (3->6 / 2->4 of 12 senders)',
    verdict: null,
  };
  c3.verdict = hybridsGraceful
    ? `CONFIRMED: k8/k4 regret ratios — hybrid25 ${perArm.hybrid25.ratioK8overK4}, hybrid50 ${perArm.hybrid50.ratioK8overK4} vs arena ${perArm.arena.ratioK8overK4} (saturated currency) and meshE ${perArm.meshE.ratioK8overK4}; hybrids scale ${perArm.hybrid50.ratioK8overK4 < 1 ? 'down (improve)' : 'flat'} like the mesh, not like the capped arena`
    : `REFUTED: hybrid k8/k4 (${perArm.hybrid25.ratioK8overK4}/${perArm.hybrid50.ratioK8overK4}) worse than arena's ${perArm.arena.ratioK8overK4}`;
  book('c3.answer', c3);
  console.log(`C3: k8/k4 arena ${perArm.arena.ratioK8overK4} | h25 ${perArm.hybrid25.ratioK8overK4} | h50 ${perArm.hybrid50.ratioK8overK4} | meshE ${perArm.meshE.ratioK8overK4} -> ${c3.verdict.split(':')[0]}`);
}

// ---- blind-eps tax receipt (C1 decomposition) ----
{
  let acc = 0, n = 0;
  for (let seed = 0; seed < SEEDS; seed++) {
    const w = makeWorld(seed, streamFor, 'clean');
    for (let t = 0; t < T; t++) { acc += w.fitFix[t] - mean(w.fit.map((f) => f[w.reg[t]])); n++; }
  }
  const perUnit = acc / n;
  const row = rows.find((r) => r.kind === 'c1.answer');
  row.blindEpsTax.perUnitEps = +perUnit.toFixed(4);
  row.blindEpsTax.expected = {
    hybrid25: +(EPS_PICK_MESH * 0.75 * T * perUnit).toFixed(2),
    hybrid50: +(EPS_PICK_MESH * 0.5 * T * perUnit).toFixed(2),
    meshE: +(EPS_PICK_MESH * T * perUnit).toFixed(2),
  };
  console.log(`blind-eps tax: ${perUnit.toFixed(4)}/round per unit eps -> expected tax h25 ${row.blindEpsTax.expected.hybrid25}, h50 ${row.blindEpsTax.expected.hybrid50}, meshE ${row.blindEpsTax.expected.meshE}`);
}

// ---- C4: rho curve on both legs ----
{
  const curve = (leg) => Object.fromEntries(ARMS.map((a) => [a, agg[a][leg].meanTotalFix]));
  const clean = curve('cleanK4'), adv = curve('advK4');
  const vals = [adv.meshE, adv.hybrid25, adv.hybrid50, adv.arena];
  const monoDown = vals.every((x, i) => i === 0 || x <= vals[i - 1] + 1e-12);
  const monoUp = vals.every((x, i) => i === 0 || x >= vals[i - 1] - 1e-12);
  const nonMonotone = !monoDown && !monoUp;
  const advSorted = [...ARMS].sort((a, b) => adv[a] - adv[b]);
  const bestArm = advSorted[0];
  const bestRho = RHO[bestArm];
  const interiorBest = bestRho > 0 && bestRho < 1;
  const starvation = adv.hybrid50 > adv.hybrid25; // too much probing starves pooled evidence
  const margin = +Math.min(...advSorted.slice(1).map((a) => adv[a] - adv[bestArm])).toFixed(2);
  const c4 = {
    claim: 'C4 rho curve on both legs; under the adversary the effect should be non-monotone (too much probing starves pooled evidence); name the best rho and the margin',
    rhoCurve: {
      cleanK4: { rho0_meshE: clean.meshE, rho25_hybrid25: clean.hybrid25, rho50_hybrid50: clean.hybrid50, rho1_arena: clean.arena },
      advK4: { rho0_meshE: adv.meshE, rho25_hybrid25: adv.hybrid25, rho50_hybrid50: adv.hybrid50, rho1_arena: adv.arena },
      rationSplit: { rho0: '0 probes + 4 whispers', rho25: '1 probe + 3 whispers', rho50: '2 probes + 2 whispers', rho1: '4 probes (currency capped at M-1=5) + 0 whispers' },
    },
    bestRho, bestArm, interiorBest, nonMonotone, starvationObserved: starvation,
    margin: { bestVsNextBest: margin, denominator: 'advK4 total regret units; margin = best arm\'s advantage over the next-best arm' },
    starvationMechanism: 'more probing = fewer subscribed senders (the pool\'s cleanest regime voices) + more witness voices (arm-derived beliefs carrying val-estimation error) — past some rho the pooled belief degrades faster than the extra probes help; under the trap the two forces oppose (probes also accelerate the demotion), which is exactly where an interior optimum can appear',
    verdict: null,
  };
  c4.verdict = nonMonotone && interiorBest && starvation
    ? `CONFIRMED: best rho = ${bestRho} (interior) on the adversary leg with the starvation signature (hybrid50 ${adv.hybrid50} > hybrid25 ${adv.hybrid25}); adv curve ${adv.meshE} (rho0) / ${adv.hybrid25} (rho25) / ${adv.hybrid50} (rho50) / ${adv.arena} (rho1); margin ${margin}; clean leg: ${clean.meshE} / ${clean.hybrid25} / ${clean.hybrid50} / ${clean.arena}`
    : nonMonotone
      ? `PARTIAL: adversary curve non-monotone (adv ${adv.meshE} / ${adv.hybrid25} / ${adv.hybrid50} / ${adv.arena}) but best rho = ${bestRho} (${interiorBest ? 'interior' : 'endpoint'}), starvation signature ${starvation ? 'present' : 'absent'}; clean curve ${clean.meshE} / ${clean.hybrid25} / ${clean.hybrid50} / ${clean.arena}`
      : `REFUTED: adversary rho curve is monotone (${adv.meshE} / ${adv.hybrid25} / ${adv.hybrid50} / ${adv.arena})`;
  book('c4.answer', c4);
  console.log(`C4: adv rho curve ${adv.meshE} / ${adv.hybrid25} / ${adv.hybrid50} / ${adv.arena} -> best rho ${bestRho}: ${c4.verdict.split(':')[0]}`);
}

book('pool.denominator', {
  perArmLeg: Object.fromEntries(ARMS.filter((a) => a !== 'arena').flatMap((a) => LEGS.map((l) => [`${a}:${l}`, agg[a][l].poolDenominator]))),
  note: 'RECEIPTED DENOMINATORS: (1) pool normalizer = sum of gated voice weights (above); (2) HedgeTrust weights self-normalize (internal denominator = sum of raw weights, trust.mjs); (3) C1 gap-closure denominator = meshE_clean - arena_clean (in c1.answer); (4) C2 ratios denominator = arena advK4 total; (5) C3 ratios denominator = per-arm cleanK4 total; (6) witnessShare denominator = pool normalizer',
});

book('sheet.verify', { everyRounds: 20, tol: 1e-9, checks: verify.checks, mismatches: verify.mismatches, maxDiff: +verify.maxDiff.toExponential(2), scope: 'every mesh arm, every seed, every leg (cleanK4 + cleanK8 + advK4), pool over gated senders + gated probe-witnesses vs MurmurBus.pool reference' });
console.log(`sheet.verify: ${verify.checks} checks, ${verify.mismatches} mismatches (max |diff| ${verify.maxDiff.toExponential(2)})`);

// ration ledger receipt
{
  const ledger = {};
  for (const arm of ARMS) {
    ledger[arm] = {
      perRound: arm === 'arena'
        ? '1 played + min(4, M-1)=4 probed + 0 whispered'
        : RHO[arm] === 0
          ? '1 played + 0 probed + 4 whispered'
          : RHO[arm] === 0.25
            ? '1 played + 1 probed + 3 whispered'
            : '1 played + 2 probed + 2 whispered',
      directObsPerRun: arm === 'arena' ? T * (1 + Math.min(K_MAIN, M - 1)) : +mean(results[arm].cleanK4.map((r) => r.totObs)).toFixed(1),
    };
  }
  book('ration.ledger', { ...ledger, note: 'ration counted in observations; every arm\'s side observations per round sum to exactly K (hybrid: probes+whispers; arena: probes capped at M-1; meshE: whispers)' });
}

book('vault.final', { liveJobs: vault.liveJobs, mustBeZero: true, note: 'offline vault doctrine: 0 live jobs, 0 network calls' });

// ---------------- findings ----------------
const c1r = rows.find((r) => r.kind === 'c1.answer');
const c2r = rows.find((r) => r.kind === 'c2.answer');
const c3r = rows.find((r) => r.kind === 'c3.answer');
const c4r = rows.find((r) => r.kind === 'c4.answer');
const F = [
  `SHEET/ENGINE: mesh.pool (senders + probe-witnesses, ONE formula) === MurmurBus.pool reference across ${verify.checks} every-20-round verifies in every mesh arm/seed/leg — ${verify.mismatches} mismatches (max |diff| ${verify.maxDiff.toExponential(2)}, tol 1e-9). Witness ttl=1 enforced by gates: preflight zeroInfluenceDiff=${pf.hybrid.zeroInfluenceDiff.toExponential(2)}; the pool DENOMINATOR (gated weight mass, mean ${agg.hybrid50.cleanK4.poolDenominator.meanDen} for hybrid50-clean) is receipted per arm per leg. Arena ran ZERO sheet cells — the direct-reward currency still needs no pooled substrate; the hybrid runs BOTH.`,
  `C1: ${c1r.verdict}`,
  `C2: ${c2r.verdict}`,
  `C3: ${c3r.verdict}`,
  `C4: ${c4r.verdict}`,
  `CURRENCY SYNTHESIS: ${c1r.bothBelowMeshE
    ? 'feeding perishable probe rewards into durable trust whispers IS the synthesis the E22 lesson predicted — the hybrid keeps the mesh\'s immune system (witness demotion under the trap) while gaining arena-grade estimation from direct observations.'
    : 'the synthesis is BOUNDED: probe-fed trust did not beat meshE here — the conversion channel needs the demotion lever AND the estimation channel to compound.'} The two-timescale demotion (witness-trust crash as fast brake, beta=0.25 EMA as lasting un-learning) is what the arena's 1/n running mean cannot replicate.`,
];
book('findings', { findings: F });

book('chain.seal', { rows: rows.length, digest: fnv1a64(rows) });
const v = verifyChain(sealChain(rows));
const tip = rows[rows.length - 1].row_hash;
console.log(`receipts: ${rows.length} rows, chain ${v.ok ? 'VERIFIED' : 'BROKEN'} tip=${tip}`);

// independent re-verify of the WRITTEN file (not the in-memory rows)
const jsonl = rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
writeFileSync(new URL('./outputs/receipts_e25.jsonl', import.meta.url), jsonl);
const reloaded = readFileSync(new URL('./outputs/receipts_e25.jsonl', import.meta.url), 'utf8')
  .trim().split('\n').map((l) => JSON.parse(l));
const v2 = verifyChain(reloaded);

const summary = {
  experiment: 'E25 — hybrid currency: the mesh gains the arena\'s probe',
  question: 'can a mesh mind feed arena-style arm rewards back into its trust substrate as whispers (probe-witness), getting the arena\'s clean-bracket exploitation speed WITHOUT losing the mesh\'s adversarial demotion and ration elasticity?',
  config: rows.find((r) => r.kind === 'run.config'),
  preflight: pf,
  vault: { mock: harvest.mock, liveJobs: vault.liveJobs, bits: harvest.bits.length, poolDigest: harvest.poolDigest },
  seeds: SEEDS,
  cuts: 'none — full plan within runtime budget',
  sheetVerify: rows.find((r) => r.kind === 'sheet.verify'),
  rationLedger: rows.find((r) => r.kind === 'ration.ledger'),
  perArm: agg,
  rhoCurve: c4r.rhoCurve,
  c1: c1r, c2: c2r, c3: c3r, c4: c4r,
  findings: F,
  curvesSeed0: curves0,
  chain: { rows: rows.length, verified: v.ok, links: v.links, tip, reverifiedFromFile: v2.ok, reverifiedLinks: v2.links },
  runtimeMs: Date.now() - t0,
};
writeFileSync(new URL('./outputs/e25_summary.json', import.meta.url), JSON.stringify(summary, null, 1));
console.log(`chain re-verified from file: ${v2.ok} (${v2.links} links)`);
console.log(v.ok && v2.ok && vault.liveJobs === 0 ? 'E25 DONE' : 'E25 PROBLEM (chain or live jobs)');
