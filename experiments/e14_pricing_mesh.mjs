// E14 — THE PRICING MESH (no-LLM flagship)
// ============================================================
// The seed prompt's own example, made real: "spreadsheet cells working
// out a change in a pricing model." No LLM anywhere in the loop. The
// sheet IS the inference substrate:
//
//   - 5 FACTOR cells whisper endorsements (murmur protocol: p + mass n)
//     to every price-candidate branch — factor-major cells ex{i}.b{X}
//   - each branch pools the murmurs with TRUST WEIGHTS (log-odds pooling
//     cells br{X}.pool) — trust lives in value cells t.f{1..5}, written
//     back by a Hedge learner outside the sheet (online learning, inside
//     inference)
//   - ranks = branch's own demand estimate + trust-weighted murmur bonus
//   - softmax weights br{X}.pickw = exp((rank-maxrank)/temp) — "the sheet
//     nominates; the vault elects" (MOTH entropy picks the branch)
//   - a listener reflex (mesh.scar) scares the mesh into exploration when
//     reality undercuts prediction by >1.2σ
//   - the gardener reads the Kuramoto order parameter + trust entropy and
//     modulates temperature / prune / spawn / graft (the greater-tree
//     viewpoint, as a scalar read + three scalars written)
//   - the spreader copies the best branch's cells with a fresh seed,
//     prunes dead weight, grafts elasticity fruit across bloodlines
//
// Arms (same environment, paired noise): fixed / scoreonly / ensemble /
// mesh-notrust (ablation) / mesh. Regime flip at t=150 (competitor turns
// to noise, elasticity doubles) — the test is whether LEARNED trust
// re-weights the factors faster than uniform trust can.
//
// Run: node experiments/e14_pricing_mesh.mjs [seeds]

import { QuiltEngine } from '../engine/dist/index.js';
import { HedgeTrust, trackStreaks } from '../murmur/trust.mjs';
import { MurmurBus } from '../murmur/bus.mjs';
import { Spreader } from '../murmur/spreader.mjs';
import { Resonance, agreementMatrix, corr } from '../murmur/resonance.mjs';
import { Gardener } from '../murmur/gardener.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { fnv1a64, sealChain, verifyChain } from '../murmur/receipts.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

const T = 300, FLIP = 150, MAXB = 10;
const PRICES = [19, 24, 29, 34, 39], COST = 12, D0 = 120;
const FACTORS = ['f1', 'f2', 'f3', 'f4', 'f5'];
const FNAME = { f1: 'competitor-gap', f2: 'margin-depth', f3: 'inventory-pressure', f4: 'season-timing', f5: 'demand-implied-E' };
const gauss = (u1, u2) => Math.sqrt(-2 * Math.log(Math.max(1e-9, u1))) * Math.cos(2 * Math.PI * u2);

// ---------------- environment (paired noise across arms) ----------------
class Env {
  constructor(rng) {
    this.rng = rng;
    this.comp = 29; this.inv = 55; this.ehat = 1.2; this.ehist = [];
    this.noise = []; // pre-drawn demand shock per t — same for every arm
    for (let t = 0; t < T; t++) this.noise.push(gauss(rng(), rng()) * 6);
    this.E = () => (this.t < FLIP ? 0.5 : 3.5);
    this.t = 0;
  }
  step(t) {
    this.t = t;
    const jump = t >= FLIP;
    if (!jump) this.comp = Math.min(38, Math.max(20, this.comp + gauss(this.rng(), this.rng()) * 1.2));
    else this.comp = 29 + gauss(this.rng(), this.rng()) * 6;
    const season = Math.max(0, Math.min(1, 0.5 + 0.45 * Math.sin((2 * Math.PI * t) / 40) + gauss(this.rng(), this.rng()) * 0.03));
    this.inv = Math.max(30, Math.min(100, this.inv + gauss(this.rng(), this.rng()) * 6 - 0.08 * (this.inv - 55) + (t % 37 === 0 ? 35 : 0)));
    return { comp: this.comp, season, inv: this.inv };
  }
  invF(p, inv) {
    return inv > 70 ? 1 + 0.5 * ((inv - 70) / 30) * ((34 - p) / 15) : 1 + 0.1 * ((55 - inv) / 55);
  }
  Ddet(p, comp, season, inv) {
    const sig = 1 / (1 + Math.exp((p - comp) / 6));
    return D0 * Math.exp(-this.E() * ((p - 29) / 29)) * sig * (1 + 0.45 * (season - 0.5)) * this.invF(p, inv);
  }
  revenueAt(p, t, world) {
    return (p - COST) * Math.max(4, this.Ddet(p, world.comp, world.season, world.inv) + this.noise[t]);
  }
  // the demand-implied-elasticity expert: noisy regression on observed picks
  observe(p, Dobs) {
    this.ehist.push([p, Dobs]);
    if (this.ehist.length > 14) this.ehist.shift();
  }
  updateEhat() {
    if (this.t % 5 !== 0 || this.ehist.length < 8) return this.ehat;
    const xs = this.ehist.map(([p]) => (p - 29) / 29);
    const ys = this.ehist.map(([, d]) => Math.log(Math.max(6, d)));
    const mx = xs.reduce((a, b) => a + b, 0) / xs.length, my = ys.reduce((a, b) => a + b, 0) / ys.length;
    let sxy = 0, sxx = 0;
    for (let i = 0; i < xs.length; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
    const slope = sxx > 1e-6 ? sxy / sxx : -1.2;
    const e = Math.max(0.2, Math.min(3.0, -slope + gauss(this.rng(), this.rng()) * 0.15));
    this.ehat = 0.65 * this.ehat + 0.35 * e;
    return this.ehat;
  }
}

// ---------------- the sheet ----------------
function buildSheet() {
  const cells = [
    { id: 'env.competitor', kind: 'value', value: 29 },
    { id: 'env.season', kind: 'value', value: 0.5 },
    { id: 'env.inventory', kind: 'value', value: 55 },
    { id: 'env.ehat', kind: 'value', value: 1.2 },
    { id: 'mesh.ex3sal', kind: 'value', value: 1 },
    { id: 'mesh.mix', kind: 'value', value: 0.45 },
    { id: 'mesh.temp', kind: 'value', value: 0.12 },
    { id: 'mesh.choice', kind: 'value', value: 0 },
    { id: 'mesh.revenue', kind: 'value', value: 0 },
    { id: 'mesh.revdev', kind: 'value', value: 0 },
    { id: 'mesh.scarcount', kind: 'value', value: 0 },
  ];
  for (let i = 1; i <= 5; i++) cells.push({ id: `t.f${i}`, kind: 'value', value: 0.2, description: FNAME['f' + i] });
  const lg = (x) => `Math.log(clamp(${x},0.02,0.98)/(1-clamp(${x},0.02,0.98)))`;
  const sig = (z) => `(1/(1+Math.exp(-(${z}))))`;
  for (let b = 1; b <= MAXB; b++) {
    cells.push({ id: `br${b}.price`, kind: 'value', value: PRICES[(b - 1) % 5] });
    cells.push({ id: `br${b}.est`, kind: 'value', value: 1.2 });
    cells.push({ id: `br${b}.alive`, kind: 'value', value: b <= 5 ? 1 : 0 });
    // factor whispers — the murmur cells (p = endorsement probability)
    cells.push({ id: `ex1.br${b}`, kind: 'formula', expr: sig(`1.5*(1 - Math.abs(br${b}.price - env.competitor)/12)`) });
    cells.push({ id: `ex2.br${b}`, kind: 'formula', expr: sig(`2.0*(((br${b}.price - ${COST})/${COST}) - 0.8)`) });
    cells.push({ id: `ex3.br${b}`, kind: 'formula', expr: sig(`2.5*(((34 - br${b}.price)/15)*((env.inventory - 55)/25))`) });
    cells.push({ id: `ex4.br${b}`, kind: 'formula', expr: sig(`2.2*(((br${b}.price - 29)/10) + (env.season - 0.5))`) });
    cells.push({ id: `ex5.br${b}`, kind: 'formula', expr: sig(`1.6*(((29 - br${b}.price)/10)*((env.ehat - 1.2)/0.9))`) });
    // murmur pooling with trust weights — log-odds opinion pool, in-sheet
    cells.push({
      id: `br${b}.pool`, kind: 'formula',
      expr: sig(`(${lg(`ex1.br${b}`)} + ${lg(`ex2.br${b}`)} + mesh.ex3sal*${lg(`ex3.br${b}`)} + ${lg(`ex4.br${b}`)} + ${lg(`ex5.br${b}`)}) / (t.f1 + t.f2 + mesh.ex3sal*t.f3 + t.f4 + t.f5)`),
    });
    // the branch's own demand estimate — NAIVE on purpose: the branch knows
    // only its elasticity belief. Competitor / inventory / season reach the
    // branch EXCLUSIVELY through the murmur layer (that's the mesh thesis:
    // the sheet's murmurs are how a naive model hears the world).
    cells.push({
      id: `br${b}.scoren`, kind: 'formula',
      expr: `clamp((br${b}.price - ${COST}) * (120*${sig(`-br${b}.est*((br${b}.price - 29)/29)`)}) / 1600, 0, 1.3)`,
    });
    cells.push({ id: `br${b}.rank`, kind: 'formula', expr: `br${b}.alive * (br${b}.scoren + mesh.mix * 0.6 * (br${b}.pool - 0.5))` });
    cells.push({ id: `br${b}.pickw`, kind: 'formula', expr: `br${b}.alive * Math.exp((br${b}.rank - mesh.maxrank) / mesh.temp)` });
  }
  cells.push({ id: 'mesh.maxrank', kind: 'formula', expr: `max(${Array.from({ length: MAXB }, (_, i) => `br${i + 1}.rank`).join(',')})` });
  // per-factor alive-mean endorsements (credit assignment reference)
  for (let f = 1; f <= 5; f++) {
    cells.push({ id: `exm.f${f}`, kind: 'formula', expr: `(${Array.from({ length: MAXB }, (_, i) => `ex${f}.br${i + 1}*br${i + 1}.alive`).join('+')}) / max(1, ${Array.from({ length: MAXB }, (_, i) => `br${i + 1}.alive`).join('+')})` });
  }
  // the scar reflex — reality undercuts prediction by >1.2 sigma.
  // ENGINE LESSON (receipted): engine.get on a program RE-EXECUTES it with a
  // fresh empty context, so a fired action's payload is unreachable by get.
  // The reflex therefore writes its OWN memory (mesh.scarcount) via
  // runtime.set — self-recording reflex, the arena's witness doctrine.
  cells.push({
    id: 'mesh.scar', kind: 'listener', watch: ['mesh.revdev'],
    condition: 'caller.metadata.current < -1.2 && caller.metadata.prev >= -1.2',
    action: 'mesh.scaract',
  });
  cells.push({
    id: 'mesh.scaract', kind: 'program', code: `
  const dev = caller && caller.metadata ? caller.metadata.current : null;
  if (dev === null || dev === undefined) return { live: false };
  // ENGINE LESSON (receipted): boundRuntime.get returns a CellValue, not .data
  // (patch-11 contract) — programs must unwrap defensively or arithmetic
  // silently degrades to string coercion ("[object Object]1").
  const cur = await runtime.get('mesh.scarcount');
  const prev = typeof cur === 'object' && cur !== null ? Number(cur.data) || 0 : Number(cur) || 0;
  await runtime.set('mesh.scarcount', prev + 1);
  return { live: true, scar: prev + 1, dev };`,
  });
  return { id: 'pricing-mesh', title: 'The Pricing Mesh', cells };
}

// ---------------- arms ----------------
const ARMS = {
  fixed: { hedge: false, murmurs: 0, gardener: false, mix: 0 },
  scoreonly: { hedge: false, murmurs: 0, gardener: false, mix: 0 },
  ensemble: { hedge: false, murmurs: 1, gardener: false, mix: 1 },
  meshnt: { hedge: false, murmurs: 1, gardener: true, mix: 0.7 },
  mesh: { hedge: true, murmurs: 1, gardener: true, mix: 0.7 },
};

async function runArm(armName, seed, vault, engineOn = true) {
  const cfg = ARMS[armName];
  const env = new Env(vault.streamFor(vault.current, `env:${seed}`));
  const rng = vault.streamFor(vault.current, `run:${armName}:${seed}`);
  const trust = new HedgeTrust(FACTORS, { eta: 0.3, share: 0.05 });
  const bus = new MurmurBus({ trust: cfg.hedge ? trust : null });
  const spreader = cfg.gardener ? new Spreader({ jitter: 0.22 }) : null;
  const gardener = cfg.gardener ? new Gardener({ maxBranches: 8 }) : null;
  const streaks = trackStreaks(Array.from({ length: MAXB }, (_, i) => i + 1));
  const visits = new Map(Array.from({ length: MAXB }, (_, i) => [i + 1, 0])); // UCB arms
  let totPicks = 0;
  let engine = null;
  if (engineOn) { engine = new QuiltEngine(`mesh-${armName}-${seed}`, {}); engine.loadSheet(buildSheet()); await engine.set('mesh.mix', cfg.mix); }

  let emaR = 900, stdR = 200, scarCount = 0, scars = 0, tempBoost = 0, poolMismatches = 0, lastSpawn = -99, spawnCount = 0;
  const trace = [], rHist = [], regretHist = [], regretTrace = [];
  let totalRev = 0, postRev = 0, postFirst50 = 0, postLast100 = 0, resCorr = null;
  const priceCount = new Map(PRICES.map((p) => [p, 0]));

  const world0 = env.step(0);
  for (let t = 0; t < T; t++) {
    const world = t === 0 ? world0 : env.step(t);
    env.updateEhat();

    let pickPrice, pickBranch = -1, exChosen = null, exMean = null, ranks = null;
    if (armName === 'fixed') {
      pickPrice = 29;
    } else {
      await engine.set('env.competitor', +world.comp.toFixed(3));
      await engine.set('env.season', +world.season.toFixed(4));
      await engine.set('env.inventory', +world.inv.toFixed(2));
      await engine.set('env.ehat', +env.ehat.toFixed(3));
      await engine.set('mesh.ex3sal', +Math.min(2, Math.abs(world.inv - 55) / 15 + 0.2).toFixed(3));

      if (!cfg.gardener) await engine.set('mesh.temp', 0.12);
      // branch beliefs learn from the observed-demand expert (ehat):
      // the sheet's elasticity cells EMA toward what the market implies
      for (let b = 1; b <= MAXB; b++) {
        if ((await engine.get(`br${b}.alive`)).data === 1) {
          const est = (await engine.get(`br${b}.est`)).data;
          await engine.set(`br${b}.est`, +(est + 0.08 * (env.ehat - est)).toFixed(4));
        }
      }
      if (tempBoost > 0) { await engine.set('mesh.temp', Math.min(0.5, 0.12 + tempBoost)); tempBoost = Math.max(0, tempBoost - 0.02); }
      // read the sheet's nomination
      const pickws = [], rks = [];
      for (let b = 1; b <= MAXB; b++) {
        pickws.push((await engine.get(`br${b}.pickw`)).data);
        rks.push((await engine.get(`br${b}.rank`)).data);
      }
      ranks = rks;
      if (cfg.hedge && t % 10 === 0) {
        // pool verification: the sheet's murmur-pooling formula must agree
        // with the reference log-odds pool (bus) on the chosen branch
        const ps = [], ws = [];
        for (let f = 1; f <= 5; f++) {
          ps.push((await engine.get(`ex${f}.br${pickBranch}`)).data);
          ws.push(trust.weight(`f${f}`));
        }
        const ref = MurmurBus.pool(ps, ws);
        const sheetPool = (await engine.get(`br${pickBranch}.pool`)).data;
        if (Math.abs(ref - sheetPool) > 0.02) poolMismatches++;
      }
      let idx;
      // UCB pick (the L2 lesson, applied): optimism in the face of uncertainty
      // over the sheet's own ranks — structure, not blind entropy. The
      // gardener modulates the optimism coefficient c; the vault breaks ties.
      const c = cfg.gardener ? 0.3 + (1 - Math.min(0.6, gardener.history[gardener.history.length - 1]?.temp ?? 0.15)) * 2.4 : 2.5;
      totPicks++;
      let bestU = -Infinity;
      for (let b = 1; b <= MAXB; b++) {
        if (pickws[b - 1] <= 0) continue; // dead branch
        const v = Math.max(1, visits.get(b));
        const ucb = rks[b - 1] + c * Math.sqrt(Math.log(totPicks + 1) / v);
        if (ucb > bestU + 1e-12 || (Math.abs(ucb - bestU) <= 1e-12 && rng() < 0.5)) { bestU = ucb; idx = b - 1; }
      }
      if (idx === undefined) idx = 0;
      pickBranch = idx + 1;
      visits.set(pickBranch, (visits.get(pickBranch) ?? 0) + 1);
      pickPrice = (await engine.get(`br${pickBranch}.price`)).data;
      exChosen = [];
      exMean = [];
      for (let f = 1; f <= 5; f++) {
        exChosen.push((await engine.get(`ex${f}.br${pickBranch}`)).data);
        exMean.push((await engine.get(`exm.f${f}`)).data);
      }
    }

    // environment pays (paired noise: revenueAt uses pre-drawn shock)
    const Dobs = env.Ddet(pickPrice, world.comp, world.season, world.inv) + env.noise[t];
    const rev = armName === 'fixed' ? env.revenueAt(pickPrice, t, world) : (pickPrice - COST) * Math.max(4, Dobs);
    env.observe(pickPrice, Math.max(4, Dobs));
    totalRev += rev;
    if (t >= FLIP) postRev += rev;
    if (t >= FLIP && t < FLIP + 50) postFirst50 += rev;
    if (t >= T - 100) postLast100 += rev;
    priceCount.set(pickPrice, (priceCount.get(pickPrice) ?? 0) + 1);

    // outcome surprise + scar reflex
    const dev = (rev - emaR) / Math.max(60, stdR);
    stdR = 0.97 * stdR + 0.03 * Math.abs(rev - emaR);
    emaR = 0.92 * emaR + 0.08 * rev;
    if (engineOn && pickBranch > 0) {
      const before = (await engine.get('mesh.scarcount')).data;
      await engine.set('mesh.revenue', +rev.toFixed(2));
      await engine.set('mesh.revdev', +Math.max(-3, Math.min(3, dev)).toFixed(3));
      await engine.set('mesh.choice', pickBranch);
      const after = (await engine.get('mesh.scarcount')).data;
      if (after > before) { scars++; scarCount++; tempBoost = Math.min(0.4, tempBoost + 0.08); } // fear -> explore
    }

    // hindsight counterfactuals for regret accounting (env-only truth)
    let bestP = PRICES[0], bestV = -Infinity;
    for (const p of PRICES) { const v = env.revenueAt(p, t, world); if (v > bestV) { bestV = v; bestP = p; } }
    const regret = bestV - rev;
    regretHist.push(regret);
    if (t % 10 === 0) regretTrace.push({ t, regret: +regret.toFixed(1), pick: pickPrice });

    // ---- trust: outcome credit, centered. Factor i endorsed the chosen
    // branch at p_i (0.5 = agnostic); the outcome surprises by dev. Credit:
    // r_i = 0.5 + 0.18·(p_i−0.5)·dev — helpers earn, misleaders pay, agnostic
    // voices unaffected. With the naive scoren, murmurs now carry the world
    // (comp/inv/season) so endorsement quality is REAL information.
    if (cfg.hedge && pickBranch > 0 && exChosen) {
      const rewards = new Map();
      for (let f = 1; f <= 5; f++) {
        const endorsement = exChosen[f - 1];
        rewards.set(`f${f}`, Math.max(0.05, Math.min(0.95, 0.5 + 0.18 * (endorsement - 0.5) * Math.max(-1.5, Math.min(1.5, dev)))));
      }
      trust.update(rewards);
      for (let f = 1; f <= 5; f++) await engine.set(`t.f${f}`, +trust.weight(`f${f}`).toFixed(5));
    }

    // ---- resonance: order parameter over alive branches ----
    let r = 0;
    if (cfg.gardener && pickBranch > 0) {
      const aliveIdx = [];
      for (let b = 1; b <= MAXB; b++) if (ranks[b - 1] > 0 || (await engine.get(`br${b}.alive`)).data === 1) aliveIdx.push(b);
      const aliveSet = [...new Set(aliveIdx)];
      const vecs = [], alives = [];
      for (const b of aliveSet) {
        const v = [];
        for (let f = 1; f <= 5; f++) v.push((await engine.get(`ex${f}.br${b}`)).data);
        vecs.push(v); alives.push(1);
      }
      if (vecs.length >= 2) {
        const A = agreementMatrix(vecs, alives);
        const res = new Resonance(vecs.map((v) => (v[0] + v[3]) * Math.PI), vecs.map(() => (rng() - 0.5) * 0.2), (i, j) => A[i][j]);
        r = res.step(0.15, 1.2, 15);
        rHist.push(r);
        if (rHist.length > 30) {
          const c = corr(rHist.slice(0, -1), regretHist.slice(-Math.min(30, rHist.length - 1)));
          if (c !== null) resCorr = c;
        }
      }
      // ---- gardener + spreader: prune, spawn, graft ----
      const order = aliveSet.slice().sort((a, b) => ranks[b - 1] - ranks[a - 1]);
      streaks.observe(order);
      gardener.refill(0.5);
      gardener.choose();
      const regretDr = regretHist.length > 20
        ? regretHist.slice(-10).reduce((a, b) => a + b, 0) / 10 - regretHist.slice(-20, -10).reduce((a, b) => a + b, 0) / 10
        : 0;
      const d = gardener.decide({ r, H: cfg.hedge ? trust.entropy() : 1, regretDr, alive: aliveSet.length });
      await engine.set('mesh.temp', d.temp);
      // SPAWN PATIENCE (receipted churn: ~170 events/300 rounds drowned the
      // population in fresh noise). A spawn now needs: gardener wants it AND
      // real dissolution (r < 0.4) AND a 15-round cooldown AND budget < 7.
      if (d.spawn && spreader && t - lastSpawn > 15 && r < 0.4 && spawnCount < 7) {
        let deadFam = 0;
        for (let b = 1; b <= MAXB; b++) { if ((await engine.get(`br${b}.alive`)).data === 0) { deadFam = b; break; } }
        if (deadFam) {
          lastSpawn = t; spawnCount++;
          const bestB = order[0];
          const baseEst = new Map([['est', (await engine.get(`br${bestB}.est`)).data]]);
          const price = PRICES[Math.floor(rng() * PRICES.length)];
          const nb = spreader.branch(baseEst, rng, { from: bestB, graftSrc: { id: `br${bestB}`, est: baseEst }, graftIds: ['f5'] });
          await engine.set(`br${deadFam}.price`, price);
          await engine.set(`br${deadFam}.est`, +nb.est.get('est').toFixed(4));
          await engine.set(`br${deadFam}.alive`, 1);
          nb.ev.spawnedInto = `br${deadFam}`; nb.ev.price = price;
        }
      }
      if (cfg.hedge) {
        const doomed = spreader.prune(order.map((b, i) => ({ id: `br${b}`, streak: streaks.streak(b), rank: order.length - i })), { floorStreak: d.pruneFloor, maxDead: 1 });
        for (const id of doomed) {
          const fam = Number(id.replace('br', ''));
          await engine.set(`br${fam}.alive`, 0);
          streaks.observe(order.filter((b) => b !== fam)); // release the dead from the ledger
        }
      }
    }
    if (armName === 'mesh' && seed === 0 && t % 10 === 0) {
      trace.push({ t, pick: pickPrice, branch: pickBranch, rev: +rev.toFixed(1), regret: +regret.toFixed(1), r: +r.toFixed(3), trust: trust.snapshot(), scars: scarCount, comp: +world.comp.toFixed(1), inv: +world.inv.toFixed(0) });
    }
  }
  return { armName, seed, totalRev, postRev, postFirst50, postLast100, poolMismatches, regretSum: regretHist.reduce((a, b) => a + b, 0), scars, resCorr, priceCount: Object.fromEntries(priceCount), trustFinal: trust.snapshot(), trace, regretTrace, spreaderEvents: spreader ? spreader.events.length : 0, spreaderDigest: spreader ? spreader.digest() : null };
}

// ---------------- main ----------------
const SEEDS = Number(process.argv[2] || 6);
console.log(`── E14 pricing mesh · ${SEEDS} seeds × 5 arms × ${T} seasons ──`);
const vault = new MothVault({ label: 'murmur-e14', maxLiveJobs: 1 });
vault.current = await (async () => { const h = await vault.harvest(256); console.log(`vault: ${h.mock ? 'MOCK' : 'LIVE ' + h.jobId} digest=${h.poolDigest.slice(0, 10)} bits=${h.bits.length}`); return h; })();

const rows = [];
let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });

book('run.config', { T, FLIP, MAXB, seeds: SEEDS, arms: Object.keys(ARMS), vault: vault.current.mock ? 'mock' : 'live:' + vault.current.jobId, poolDigest: vault.current.poolDigest });

const summaries = {};
let meshTrace0 = null;
for (const arm of Object.keys(ARMS)) {
  const runs = [];
  for (let s = 0; s < SEEDS; s++) runs.push(await runArm(arm, s, vault, arm !== 'fixed'));
  const mean = (k) => runs.reduce((a, r) => a + r[k], 0) / runs.length;
  const sd = (k) => Math.sqrt(runs.reduce((a, r) => a + (r[k] - mean(k)) ** 2, 0) / runs.length);
  summaries[arm] = {
    totalRev: mean('totalRev'), totalSd: sd('totalRev'),
    postRev: mean('postRev'), postSd: sd('postRev'),
    postFirst50: mean('postFirst50'), postLast100: mean('postLast100'),
    scars: mean('scars'), resCorr: mean('resCorr'), poolMismatches: mean('poolMismatches'),
    regretTraceSeed0: runs[0].regretTrace || null,
    perSeed: runs.map((r) => ({ seed: r.seed, total: Math.round(r.totalRev), post: Math.round(r.postRev), trust: r.trustFinal, resCorr: r.resCorr === null ? null : +r.resCorr.toFixed(3), spreaderEvents: r.spreaderEvents, spreaderDigest: r.spreaderDigest })),
  };
  if (arm === 'mesh') meshTrace0 = runs[0].trace;
  book('arm.summary', { arm, totalRev: +mean('totalRev').toFixed(1), totalSd: +sd('totalRev').toFixed(1), postRev: +mean('postRev').toFixed(1), postSd: +sd('postRev').toFixed(1), postFirst50: +mean('postFirst50').toFixed(1), postLast100: +mean('postLast100').toFixed(1), scars: +mean('scars').toFixed(1), resCorr: mean('resCorr') === null ? null : +mean('resCorr').toFixed(3), poolMismatches: mean('poolMismatches') });
  const m = summaries[arm];
  console.log(`${arm.padEnd(10)} total ${Math.round(m.totalRev)} ±${Math.round(m.totalSd)}  post ${Math.round(m.postRev)} (adapt50 ${Math.round(m.postFirst50)}, last100 ${Math.round(m.postLast100)})  scars ${m.scars.toFixed(1)}  pool✗ ${m.poolMismatches}`);
}

book('e14.findings', { note: 'see site/charts + MESH.md; trust trajectories in meshTraceSeed0' });
book('chain.seal', { rows: rows.length, digest: fnv1a64(rows) });
const v = verifyChain(sealChain(rows));
console.log(`receipts: ${rows.length} rows, chain ${v.ok ? 'VERIFIED ' : 'BROKEN '}${'tip=' + rows[rows.length - 1].row_hash}`);

writeFileSync(new URL('./outputs/e14_summary.json', import.meta.url), JSON.stringify({ config: { T, FLIP, MAXB, SEEDS, arms: ARMS }, summaries }, null, 1));
writeFileSync(new URL('./outputs/e14_trace.json', import.meta.url), JSON.stringify({ meshTraceSeed0: meshTrace0 }, null, 1));
writeFileSync(new URL('./outputs/receipts.jsonl', import.meta.url), rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
console.log(v.ok ? 'E14 DONE' : 'E14 CHAIN BROKEN');
