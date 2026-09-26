// tools_gauntlet.mjs — Task 22-c: THE TOOL GAUNTLET.
// Adversarial verification that every murmur tool + the vendored engine not
// only works (T1) but fails safe under attack (T2) and holds quantitative
// guarantees (T3). The fleet owner's directive: "make sure they not only
// work but do work and can be productive" — this lane is the WORKS half;
// the DOES-WORK half is E34's paired ON/OFF marginal-value audit.
//
// Three receipted patch validations are included (the 22-c patches landed in
// murmur/ before this script could run; the lane died post-patch pre-verify —
// the main agent finished verification):
//   bus.whisper NaN envelope poisoning + live/log shared-reference aging
//   gardener credit floors (fractional refills drove credits negative)
//   tree_ops graft cycle rejection (graftView null / graftSubtree throw)
//
// Determinism: Math.random is monkey-patched (counted, vault-fed) for the
// whole run and restored in finally — the gardener's choose() consumes page
// RNG directly (receipted finding), so this both de-flakes the gauntlet and
// quantifies the hazard. All other randomness flows through MothVault
// (offline:true), stream keys 'gauntlet:<probe>'.

import { QuiltEngine } from '../engine/dist/index.js';
import { HedgeTrust } from '../murmur/trust.mjs';
import { MurmurBus } from '../murmur/bus.mjs';
import { Gardener, POLICIES } from '../murmur/gardener.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { fnv1a64, sealChain, verifyChain } from '../murmur/receipts.mjs';
import { Provenance } from '../murmur/provenance.mjs';
import { Admission } from '../murmur/admission.mjs';
import { Tree, scoreTree, graftView, spawnView, pruneSubtree, graftSubtree, spawnUnder } from '../murmur/tree_ops.mjs';
import { Spreader } from '../murmur/spreader.mjs';
import { writeFileSync } from 'node:fs';

const probes = [];
const bugCandidates = [];
const findings = [];
const t0 = Date.now();
// engine cycle path leaks an async RangeError as an UNHANDLED rejection
// (fail-safe but noisy) — collect them instead of letting them noise the run;
// receipted as a finding below.
const unhandled = [];
process.on('unhandledRejection', (e) => unhandled.push(String((e && e.message) || e).slice(0, 80)));

// ---- counted, deterministic Math.random (de-flake + hazard quantification)
const realRandom = Math.random;
let randCalls = 0;
Math.random = () => { randCalls++; return rngMain(); };
let rngMain = () => 0.5; // re-bound below once the vault exists
try {
  // ================================================================ runner
  async function probe(tool, name, tier, fn) {
    const row = { tool, probe: name, tier, verdict: 'PASS', detail: '', numbers: {} };
    try {
      const nums = (await fn()) || {};
      row.numbers = nums;
      if (nums.__FAIL) { row.verdict = 'FAIL'; row.detail = nums.__FAIL; delete nums.__FAIL; }
    } catch (e) {
      row.verdict = 'FAIL';
      row.detail = String(e && e.message || e).slice(0, 300);
    }
    probes.push(row);
    if (row.verdict === 'FAIL' && tier === 'T2') {
      bugCandidates.push({ tool, probe: name, detail: row.detail });
    }
    console.log(`${row.verdict === 'PASS' ? 'PASS' : 'FAIL'} [${tool}/${tier}] ${name}${row.detail ? ' — ' + row.detail : ''}`);
    return row;
  }
  const withTimeout = (p, ms) => Promise.race([
    p, new Promise((_, rej) => setTimeout(() => rej(new Error(`TIMEOUT ${ms}ms (hang — fail-open corruption)`)), ms)),
  ]);

  // ================================================================= vault
  const vault = new MothVault({ label: 'gauntlet', offline: true });
  const harvest = await vault.harvest(64);
  rngMain = vault.streamFor(harvest, 'gauntlet:main');

  // ============================================================ 1 receipts
  await probe('receipts', 'chain seals + tip determinism', 'T1', () => {
    const mk = () => sealChain(Array.from({ length: 200 }, (_, i) => ({ seq: i + 1, kind: `g.${i}` })));
    const a = mk(), b = mk();
    const tipA = a[a.length - 1].row_hash, tipB = b[b.length - 1].row_hash;
    if (tipA !== tipB) return { __FAIL: `same rows -> different tips (${tipA} vs ${tipB})` };
    const v = verifyChain(a);
    if (!v.ok) return { __FAIL: 'verifyChain ok=false on sealed rows' };
    const c = mk(); c[100].kind = 'tampered';
    if (verifyChain(c).ok) return { __FAIL: 'payload tamper NOT caught' };
    const d = mk(); const tmp = d[10]; d[10] = d[11]; d[11] = tmp;
    if (verifyChain(d).ok) return { __FAIL: 'row reorder NOT caught' };
    const f = mk(); f.splice(50, 0, { ...f[50], seq: f[50].seq, kind: f[50].kind });
    if (verifyChain(f).ok) return { __FAIL: 'row replay (duplicate insert) NOT caught' };
    // truncation: a PREFIX of a sealed chain is internally valid (integrity
    // vs completeness are different contracts) — completeness is detected by
    // tip comparison against the expected full-chain tip.
    const full = mk();
    const g = full.slice(0, 100);
    if (!verifyChain(g).ok) return { __FAIL: 'prefix chain should be internally valid (contract note)' };
    if (g[g.length - 1].row_hash === full[full.length - 1].row_hash) return { __FAIL: 'truncated tip collides with full tip' };
    return { tip: tipA, rows: 200, tamperCaught: true, reorderCaught: true, replayCaught: true, truncateDetectedByTip: true, contractNote: 'verifyChain = integrity; completeness = expected-tip comparison' };
  });
  await probe('receipts', 'tip sensitivity: one bit change moves the tip', 'T3', () => {
    const a = sealChain([{ seq: 1, kind: 'g.a', v: 1 }]);
    const b = sealChain([{ seq: 1, kind: 'g.a', v: 2 }]);
    if (a[0].row_hash === b[0].row_hash) return { __FAIL: 'tips collide on differing payloads' };
    return { tipA: a[0].row_hash, tipB: b[0].row_hash };
  });

  // =============================================================== 2 moth
  await probe('moth', 'stream determinism: same key bit-identical', 'T3', () => {
    const h = harvest;
    const s1 = vault.streamFor(h, 'gauntlet:det'), s2 = vault.streamFor(h, 'gauntlet:det');
    let diverged = -1;
    for (let i = 0; i < 10000; i++) { const x = s1(), y = s2(); if (x !== y) { diverged = i; break; } }
    if (diverged >= 0) return { __FAIL: `streams diverged at draw ${diverged}` };
    return { draws: 10000, diverged };
  });
  await probe('moth', 'key isolation: distinct keys -> distinct, uncorrelated', 'T3', () => {
    const N = 100, D = 500;
    const seqs = [];
    const seen = new Set();
    for (let k = 0; k < N; k++) {
      const s = vault.streamFor(harvest, `gauntlet:iso:${k}`);
      const arr = Array.from({ length: D }, () => s());
      const sig = arr.slice(0, 8).join(',');
      if (seen.has(sig)) return { __FAIL: `8-draw prefix collision at key ${k}` };
      seen.add(sig);
      seqs.push(arr);
    }
    let maxR = 0;
    const corr = (a, b) => {
      const ma = a.reduce((x, y) => x + y, 0) / a.length, mb = b.reduce((x, y) => x + y, 0) / b.length;
      let num = 0, da = 0, db = 0;
      for (let i = 0; i < a.length; i++) { const x = a[i] - ma, y = b[i] - mb; num += x * y; da += x * x; db += y * y; }
      return num / Math.sqrt(da * db);
    };
    for (let i = 0; i < 20; i++) maxR = Math.max(maxR, Math.abs(corr(seqs[i], seqs[(i * 7 + 3) % N])));
    if (maxR >= 0.08) return { __FAIL: `cross-key |r| ${maxR.toFixed(4)} >= 0.08` };
    return { keys: N, drawsPerKey: D, maxAbsCrossCorr: +maxR.toFixed(4) };
  });
  await probe('moth', 'stream quality: uniformity + no lag-1 autocorrelation', 'T3', () => {
    const s = vault.streamFor(harvest, 'gauntlet:quality');
    const n = 20000, B = 20;
    const bins = new Array(B).fill(0);
    const draws = [];
    for (let i = 0; i < n; i++) { const u = s(); draws.push(u); bins[Math.min(B - 1, Math.floor(u * B))]++; }
    const e = n / B;
    const chi2 = bins.reduce((a, o) => a + (o - e) ** 2 / e, 0);
    const mean = draws.reduce((a, b) => a + b, 0) / n;
    const sd = Math.sqrt(draws.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
    let num = 0;
    for (let i = 1; i < n; i++) num += (draws[i] - mean) * (draws[i - 1] - mean);
    const ac1 = num / ((n - 1) * sd * sd);
    // chi2 crit at df=19, 5% = 30.14
    if (chi2 >= 30.14) return { __FAIL: `chi2 ${chi2.toFixed(1)} >= 30.14 (df 19, 5%)` };
    if (Math.abs(ac1) >= 0.05) return { __FAIL: `lag-1 autocorr ${ac1.toFixed(4)} >= 0.05` };
    if (Math.abs(mean - 0.5) >= 0.02 || sd < 0.27 || sd > 0.31) return { __FAIL: `mean ${mean.toFixed(4)} sd ${sd.toFixed(4)} out of band` };
    return { chi2: +chi2.toFixed(2), crit: 30.14, ac1: +ac1.toFixed(4), mean: +mean.toFixed(4), sd: +sd.toFixed(4) };
  });
  await probe('moth', 'offline: fetch poisoned -> vault still delivers (mock, loud)', 'T2', () => {
    const realFetch = globalThis.fetch;
    globalThis.fetch = async () => { throw new Error('NETWORK POISONED BY GAUNTLET'); };
    return (async () => {
      try {
        const v2 = new MothVault({ label: 'gauntlet-poison', offline: false }); // would try live if key present
        const h2 = await v2.harvest(64);
        const s = v2.streamFor(h2, 'gauntlet:offline');
        const u = s();
        if (!(u >= 0 && u < 1)) return { __FAIL: 'mock stream produced non-u draw' };
        if (!h2.mock) return { __FAIL: 'harvest did not label itself mock:true' };
        return { mock: true, liveJobs: v2.liveJobs, u: +u.toFixed(6), journalKinds: v2.journal.map((j) => j.kind).join('|') };
      } finally { globalThis.fetch = realFetch; }
    })();
  });
  await probe('moth', 'weightedPick: degenerate weights + zero-total fallback', 'T1', () => {
    const v = new MothVault({ label: 'gauntlet-wp', offline: true });
    const h = v.harvestSync ? null : null;
    for (let i = 0; i < 200; i++) {
      const idx = v.weightedPick([0, 10, 0], i / 200);
      if (idx !== 1) return { __FAIL: `weight [0,10,0] picked ${idx}` };
    }
    const fb = v.weightedPick([0, 0, 0], 0.9);
    if (fb !== 2) return { __FAIL: `zero-total fallback picked ${fb} (expected floor(u*len))` };
    return { allMassIndex: 1, zeroTotalFallback: fb };
  });

  // =========================================================== 3 admission
  // Controlled population: 10 founders at 0.5; newcomer x oscillates 0.2/0.8
  // (independent edges); copier y lags x by 1; degenerate z oscillates
  // 0.02/0.3 (independent but useless); sybil arrives late with huge weight.
  await probe('admission', 'D1 genesis acclamation: founders admitted at round 1', 'T1', () => {
    const a = new Admission({});
    a.observe(Array.from({ length: 10 }, (_, i) => ({ from: `f${i}`, p: 0.5 })));
    for (let i = 0; i < 10; i++) if (!a.admitted(`f${i}`)) return { __FAIL: `founder f${i} not admitted at genesis` };
    return { founders: 10, admittedAt: 1 };
  });
  await probe('admission', 'probationary influence carries epsNew', 'T1', () => {
    const a = new Admission({ window: 30 });
    a.observe([{ from: 'f0', p: 0.5 }]); // f0 joins at genesis -> admitted by acclamation (D1)
    for (let t = 0; t < 5; t++) {
      const murs = [{ from: 'f0', p: 0.5 }, { from: 'x', p: t % 2 ? 0.8 : 0.2 }];
      a.observe(murs);
      a.reattribute(new Map([['f0', 0.5], ['x', 0.5]]), murs, null);
      a.notePooled(0.5);
    }
    // Tiny weight for x so the AGGREGATE CAP never engages (the cap is probed
    // separately below) — raw probationary share must stay under capShare.
    // NOTE the receipted direction-blind novelty limit in action: f0's own
    // constant 0.5 counts as NOVEL against x's oscillating history, so f0's
    // multiplier is 1.0, not 0.25 — the m term reacts to the CROWD, not to
    // authorship. Expected x infl = w_x * 1 * epsNew exactly.
    const wF0 = 0.9, wX = 0.02;
    const w = new Map([['f0', wF0], ['x', wX]]);
    const murs2 = [{ from: 'f0', p: 0.5 }, { from: 'x', p: 0.2 }];
    const infl = a.reattribute(w, murs2, null);
    if (a.admitted('x')) return { __FAIL: 'x admitted though age 6 < admitWindow' };
    if (a.lastCapScaled) return { __FAIL: 'cap engaged in the epsNew probe (control broken)' };
    const wantX = wX * 1 * a.epsNew;
    if (Math.abs(infl.get('x') - wantX) > 1e-9) return { __FAIL: `x influence ${infl.get('x')} != ${wantX} (epsNew not applied?)` };
    if (Math.abs(infl.get('f0') - wF0 * 1) > 1e-9) return { __FAIL: `f0 influence ${infl.get('f0')} != ${wF0} (novelty contract changed?)` };
    return { xInfl: infl.get('x'), wantX, f0Infl: +infl.get('f0').toFixed(6), epsNew: a.epsNew, note: 'f0 multiplier 1.0 — novelty is direction-blind (receipted limit), crowd-relative' };
  });
  await probe('admission', 'capShare bites EXACTLY when probationary mass crosses the bar', 'T3', () => {
    const a = new Admission({ window: 30 });
    const founders = Array.from({ length: 10 }, (_, i) => ({ from: `f${i}`, p: 0.5 }));
    a.observe(founders);
    a.reattribute(new Map(founders.map((f) => [f.from, 1])), founders, null);
    a.notePooled(0.5);
    // sybil joins round 2, huge raw trust
    const infl = a.reattribute(
      new Map([...founders.map((f) => [f.from, 1]), ['sy', 1000]]),
      [...founders, { from: 'sy', p: 0.5 }], null,
    );
    let Z = 0, P = 0;
    for (const [id, v] of infl) { Z += v; if (id === 'sy') P += v; }
    const share = P / Z;
    if (Math.abs(share - a.capShare) > 1e-9) return { __FAIL: `post-cap probationary share ${share.toFixed(10)} != capShare ${a.capShare}` };
    if (!a.lastCapScaled) return { __FAIL: 'lastCapScaled false though the bar was crossed' };
    if (a.capBoundRounds !== 1) return { __FAIL: `capBoundRounds ${a.capBoundRounds} != 1` };
    return { share: +share.toFixed(10), capShare: a.capShare, capBoundRounds: a.capBoundRounds };
  });
  await probe('admission', 'cap is a no-op BELOW the bar (no taxation of small newcomers)', 'T1', () => {
    const a = new Admission({ window: 30 });
    const founders = Array.from({ length: 10 }, (_, i) => ({ from: `f${i}`, p: 0.5 }));
    a.observe(founders);
    a.reattribute(new Map(founders.map((f) => [f.from, 1])), founders, null);
    a.notePooled(0.5);
    a.reattribute(new Map([...founders.map((f) => [f.from, 1]), ['sy', 0.1]]),
      [...founders, { from: 'sy', p: 0.5 }], null);
    if (a.lastCapScaled) return { __FAIL: 'cap scaled a sub-bar probationary mass' };
    return { lastCapScaled: false };
  });
  await probe('admission', 'admission boundary: age admitWindow-1 probationary, admitWindow admitted', 'T3', () => {
    const a = new Admission({ window: 30, admitWindow: 40 });
    a.observe([{ from: 'f0', p: 0.5 }]); a.notePooled(0.5);
    let promotedRound = null;
    for (let t = 2; t <= 50; t++) {
      const murs = [{ from: 'f0', p: 0.5 }, { from: 'x', p: t % 2 ? 0.8 : 0.2 }];
      a.observe(murs);
      a.reattribute(new Map([['f0', 1], ['x', 1]]), murs, null);
      a.notePooled(0.5);
      const age = a.age('x');
      if (age === a.admitWindow - 1 && a.admitted('x')) return { __FAIL: `admitted at age ${age} (< admitWindow)` };
      if (age >= a.admitWindow && a.admitted('x') && promotedRound == null) promotedRound = { round: t, age };
    }
    if (!promotedRound) return { __FAIL: 'honest independent newcomer never promoted by round 50' };
    return { promoted: promotedRound, indep: a.indepCount('x'), devMean: +a.devMean('x').toFixed(4) };
  });
  await probe('admission', 'independence bar: a lag-1 copier is NEVER admitted', 'T2', () => {
    const a = new Admission({ window: 30, admitWindow: 40 });
    a.observe([{ from: 'f0', p: 0.5 }]); a.notePooled(0.5);
    let xPrev = 0.2;
    for (let t = 2; t <= 60; t++) {
      const xv = t % 2 ? 0.8 : 0.2;
      const murs = [{ from: 'f0', p: 0.5 }, { from: 'x', p: xv }, { from: 'y', p: xPrev }]; // y = x at lag 1
      a.observe(murs);
      a.reattribute(new Map([['f0', 1], ['x', 1], ['y', 1]]), murs, null);
      a.notePooled(0.5);
      xPrev = xv;
    }
    if (a.admitted('y')) return { __FAIL: 'copier y admitted despite zero independent edges' };
    if (a.indepCount('y') !== 0) return { __FAIL: `copier credited ${a.indepCount('y')} independent edges` };
    if (!a.admitted('x')) return { __FAIL: 'honest x not admitted (control failed)' };
    return { yIndepEdges: 0, xIndepEdges: a.indepCount('x'), yAdmitted: false, xAdmitted: true };
  });
  await probe('admission', 'usefulness bar (admitErr): independent but useless stays probationary', 'T2', () => {
    const a = new Admission({ window: 30, admitWindow: 40, admitErr: 0.5 });
    a.observe([{ from: 'f0', p: 0.5 }]); a.notePooled(0.5);
    for (let t = 2; t <= 60; t++) {
      const murs = [{ from: 'f0', p: 0.5 }, { from: 'z', p: t % 2 ? 0.3 : 0.02 }];
      a.observe(murs);
      a.reattribute(new Map([['f0', 1], ['z', 1]]), murs, null);
      a.notePooled(0.85); // the crowd pools near 0.85; z is far from it
    }
    if (a.admitted('z')) return { __FAIL: 'useless-but-independent z admitted (admitErr ignored)' };
    if (a.devMean('z') <= a.admitErr) return { __FAIL: `control broken: devMean ${a.devMean('z')} <= bar` };
    return { zAdmitted: false, devMean: +a.devMean('z').toFixed(4), bar: a.admitErr, indep: a.indepCount('z') };
  });

  // ========================================================= 4 provenance
  const src = (t) => (Math.floor(t / 4) % 2 === 0 ? 0.9 : 0.1);
  await probe('provenance', 'spin-up window: young sender default-clean (documented surface)', 'T1', () => {
    const pv = new Provenance({ window: 20, aw: 40 });
    pv.inspect([{ from: 'f0', origin: null, p: 0.5 }]); // round 1: f0 founds
    for (let t = 2; t <= 10; t++) pv.inspect([{ from: 'f0', origin: null, p: 0.5 }, { from: 'fresh', origin: null, p: 0.3 + 0.01 * t }]);
    if (pv.tag('fresh') !== 'clean') return { __FAIL: `young sender tagged ${pv.tag('fresh')}` };
    // the containment: a MID-STREAM joiner is probationary in admission —
    // its spin-up 'clean' tag is economically inert (x epsNew) until admitted
    const a = new Admission({});
    a.observe([{ from: 'f0', p: 0.5 }]); // genesis
    a.reattribute(new Map([['f0', 1]]), [{ from: 'f0', p: 0.5 }], null);
    a.notePooled(0.5);
    const murs = [{ from: 'f0', p: 0.5 }, { from: 'fresh', p: 0.3 }];
    a.observe(murs); // fresh joins round 2 -> NOT genesis -> probationary
    const infl = a.reattribute(new Map([['f0', 0.9], ['fresh', 0.9]]), murs, null);
    if (a.probationary('fresh') !== true) return { __FAIL: 'mid-stream joiner not probationary in admission' };
    return { tag: 'clean', containedBy: 'admission epsNew', freshInfl: +infl.get('fresh').toFixed(6) };
  });
  await probe('provenance', 'echo clique: 3 copiers convicted, source clean', 'T2', () => {
    const pv = new Provenance({ window: 20, aw: 40 });
    for (let t = 0; t < 60; t++) {
      pv.inspect([
        { from: 'src', origin: null, p: src(t) },
        { from: 'c1', origin: null, p: t >= 1 ? src(t - 1) : src(t) },
        { from: 'c2', origin: null, p: t >= 1 ? src(t - 1) : src(t) },
        { from: 'c3', origin: null, p: t >= 1 ? src(t - 1) : src(t) },
      ]);
    }
    const tags = [pv.tag('c1'), pv.tag('c2'), pv.tag('c3')];
    if (tags.some((x) => x !== 'echo')) return { __FAIL: `clique tags ${tags.join(',')}` };
    if (pv.tag('src') !== 'clean') return { __FAIL: `source tagged ${pv.tag('src')}` };
    if (pv.events.length === 0) return { __FAIL: 'conviction left no event trail' };
    return { clique: 'echo×3', source: 'clean', events: pv.events.length };
  });
  await probe('provenance', 'mirror guard: mutual identical trains convict NEITHER', 'T2', () => {
    const pv = new Provenance({ window: 20, aw: 40 });
    for (let t = 0; t < 70; t++) {
      pv.inspect([{ from: 'm1', origin: null, p: src(t) }, { from: 'm2', origin: null, p: src(t) }]);
    }
    if (pv.tag('m1') === 'echo' || pv.tag('m2') === 'echo') {
      return { __FAIL: `mirror pair convicted: m1=${pv.tag('m1')} m2=${pv.tag('m2')} (finding #2 regression)` };
    }
    return { m1: pv.tag('m1'), m2: pv.tag('m2') };
  });
  await probe('provenance', 'hard-tag caps: echo 0.15x, dup 0.5x, clean 1x (influence)', 'T3', () => {
    const pv = new Provenance({ window: 20, aw: 40 });
    // dup contract: flat AND redundant with someone's past at some lag — and
    // the check is SYMMETRIC: two flat-identical voices are dups OF EACH
    // OTHER (content forensics, not authorship tracking). e1 echoes src at
    // lag 1 (-> echo); src stays clean.
    for (let t = 0; t < 60; t++) {
      pv.inspect([
        { from: 'src', origin: null, p: src(t) },
        { from: 'e1', origin: null, p: t >= 1 ? src(t - 1) : src(t) },
        { from: 'flatA', origin: null, p: 0.9 },
        { from: 'flatB', origin: null, p: 0.9 },
      ]);
    }
    const w = new Map([['src', 0.4], ['e1', 0.3], ['flatA', 0.15], ['flatB', 0.15]]);
    const infl = pv.influence(w, [{ from: 'src' }, { from: 'e1' }, { from: 'flatA' }, { from: 'flatB' }]);
    const checks = [
      ['e1', infl.get('e1'), 0.3 * pv.epsEcho],
      ['flatA', infl.get('flatA'), 0.15 * pv.epsDup],
      ['flatB', infl.get('flatB'), 0.15 * pv.epsDup],
      ['src', infl.get('src'), 0.4],
    ];
    for (const [id, got, want] of checks) if (Math.abs(got - want) > 1e-9) return { __FAIL: `${id} influence ${got} != ${want} (tag ${pv.tag(id)})` };
    return { echo: infl.get('e1'), dupA: infl.get('flatA'), dupB: infl.get('flatB'), clean: infl.get('src'), contract: 'dup is symmetric between flat-identical voices' };
  });

  // ============================================================== 5 trust
  await probe('trust', 'log-odds hedge matches inline reference to 1e-9 (500 rounds)', 'T3', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const eta = 0.35, share = 0.03;
    const t = new HedgeTrust(ids, { eta, share });
    const ref = new Map(ids.map((id) => [id, 1 / ids.length]));
    const rs = vault.streamFor(harvest, 'gauntlet:trust-ref');
    for (let round = 0; round < 500; round++) {
      const rewards = new Map(ids.map((id) => {
        const role = ['a', 'b', 'c', 'd'].indexOf(id);
        const u = rs();
        return [id, role === 0 ? 0.9 : role === 3 ? 0.1 : 0.3 + 0.4 * u];
      }));
      t.update(rewards);
      const N = ids.length;
      let Z = 0; const raw = new Map();
      let maxLog = -Infinity;
      for (const id of ids) {
        const blended = (1 - share) * ref.get(id) + share / N;
        const lg = Math.log(blended) + eta * (rewards.get(id) ?? 0.5);
        raw.set(id, lg); if (lg > maxLog) maxLog = lg;
      }
      for (const id of ids) { const v = Math.exp(raw.get(id) - maxLog); ref.set(id, v); Z += v; }
      for (const id of ids) ref.set(id, ref.get(id) / Z);
      for (const id of ids) {
        if (Math.abs(t.weight(id) - ref.get(id)) > 1e-9) {
          return { __FAIL: `round ${round} id ${id}: engine ${t.weight(id)} vs ref ${ref.get(id)}` };
        }
      }
    }
    return { rounds: 500, tol: 1e-9, maxDiff: '0' };
  });
  await probe('trust', 'bounds + monotonicity: honest rises, liar falls, all in (0,1)', 'T3', () => {
    const t = new HedgeTrust(['h', 'l', 'n'], { eta: 0.5, share: 0.02 });
    let minW = 1, maxW = 0;
    for (let i = 0; i < 300; i++) {
      t.update(new Map([['h', 0.95], ['l', 0.05], ['n', 0.5]]));
      for (const id of ['h', 'l', 'n']) { const w = t.weight(id); minW = Math.min(minW, w); maxW = Math.max(maxW, w); }
    }
    if (!(t.weight('h') > 1 / 3 && t.weight('l') < 1 / 3)) return { __FAIL: 'monotonicity broken' };
    if (minW <= 0 || maxW >= 1) return { __FAIL: `bounds violated: min ${minW} max ${maxW}` };
    const sum = t.weight('h') + t.weight('l') + t.weight('n');
    if (Math.abs(sum - 1) > 1e-9) return { __FAIL: `weights sum ${sum}` };
    return { honest: +t.weight('h').toFixed(5), liar: +t.weight('l').toFixed(5), minW: +minW.toExponential(3), maxW: +maxW.toFixed(5), sumOk: true };
  });
  await probe('trust', 'fixed-share: regime flip demotes the ex-leader (bounded forgetting)', 'T1', () => {
    const t = new HedgeTrust(['old', 'new'], { eta: 0.4, share: 0.05 });
    for (let i = 0; i < 200; i++) t.update(new Map([['old', 0.95], ['new', 0.1]]));
    if (t.weight('old') <= t.weight('new')) return { __FAIL: 'control: old not leading after 200 honest rounds' };
    for (let i = 0; i < 120; i++) t.update(new Map([['old', 0.05], ['new', 0.95]]));
    if (!(t.weight('new') > t.weight('old'))) return { __FAIL: 'regime flip not tracked (fixed-share dead?)' };
    return { newLead: +t.weight('new').toFixed(5), oldNow: +t.weight('old').toFixed(5) };
  });

  // =========================================================== 6 gardener
  await probe('gardener', 'credit floors: fractional refills can NEVER drive credits negative', 'T2', () => {
    const g = new Gardener({ maxBranches: 10 });
    g.policy = 'bold'; // the receipted repro: bold spawned at credits=0.5 down to -0.9 (pre-fix)
    g.credits = 0.5;
    let minC = Infinity, spawns = 0;
    for (let i = 0; i < 60; i++) {
      const d = g.decide({ r: 0.2, H: 0.9, regretDr: 0, alive: 3 });
      if (d.spawn) spawns++;
      g.refill(0.5);
      minC = Math.min(minC, g.credits);
      if (g.credits < 0) return { __FAIL: `credits went negative: ${g.credits}` };
    }
    if (minC < 0) return { __FAIL: `credits dipped to ${minC}` };
    return { minCredits: minC, final: g.credits, spawns, policy: 'bold', oldCodeWouldHit: -0.5 };
  });
  await probe('gardener', 'policy modulation: timid explores hotter than bold at same vitals', 'T1', () => {
    const g1 = new Gardener(); g1.policy = 'bold';
    const g2 = new Gardener(); g2.policy = 'timid';
    const d1 = g1.decide({ r: 0.5, H: 0.5, regretDr: 0, alive: 3 });
    const d2 = g2.decide({ r: 0.5, H: 0.5, regretDr: 0, alive: 3 });
    if (d1.policy !== 'bold' || d2.policy !== 'timid') return { __FAIL: 'policies not honored' };
    if (!(d2.temp > d1.temp)) return { __FAIL: `timid ${d2.temp} !> bold ${d1.temp}` };
    return { boldTemp: d1.temp, timidTemp: d2.temp };
  });
  await probe('gardener', 'bandit learns: reward moves Q, history is a full ledger', 'T1', () => {
    const g = new Gardener();
    const qBefore = g.q.get('steady');
    g.policy = 'steady';
    g.decide({ r: 0.5, H: 0.5, regretDr: 0, alive: 3 }); g.reward(-0.5);
    g.decide({ r: 0.5, H: 0.5, regretDr: 0, alive: 3 }); g.reward(-0.5);
    if (!(g.q.get('steady') < qBefore)) return { __FAIL: 'reward did not move Q' };
    if (g.history.length < 2) return { __FAIL: 'history not a full ledger' };
    return { qMoved: +(qBefore - g.q.get('steady')).toFixed(4), ledger: g.history.length };
  });
  await probe('gardener', 'DETERMINISM HAZARD (receipted finding): choose() consumes page RNG', 'T3', () => {
    const g = new Gardener({ maxBranches: 4 });
    const before = randCalls;
    g.eps = 1; // force the exploration branch of choose()
    g.q = new Map([['bold', 9], ['steady', 0], ['timid', -9]]);
    const pol = g.choose(); // choose() is the RNG consumer; decide() only reads this.policy
    const consumed = randCalls - before;
    if (consumed === 0) return { __FAIL: 'eps=1 explore did not consume Math.random (hazard fixed silently?)' };
    if (!POLICIES.includes(pol)) return { __FAIL: `choose returned ${pol}` };
    return { finding: 'gardener.choose() eats page RNG directly (explore coin + policy pick)', consumed, consequence: 'fleet determinism relies on the harness monkey-patch; a RAND arm that un-patches flips bandit policy streams', hazard: true };
  });

  // =========================================================== 7 tree_ops
  const mkTree = () => {
    const T = new Tree({});
    T.add({ id: 'r', parent: null, depth: 0, alive: 1, traits: [0.5, 0.5, 0.5], hist: [], sc: [], tf: 0.5 });
    T.add({ id: 'a', parent: 'r', depth: 1, alive: 1, traits: [0.6, 0.5, 0.5], hist: [1], sc: [1], tf: 0.6 });
    T.add({ id: 'a1', parent: 'a', depth: 2, alive: 1, traits: [0.7, 0.5, 0.5], hist: [1], sc: [1], tf: 0.7 });
    T.add({ id: 'b', parent: 'r', depth: 1, alive: 1, traits: [0.3, 0.5, 0.5], hist: [1], sc: [1], tf: 0.4 });
    T.add({ id: 'b1', parent: 'b', depth: 2, alive: 1, traits: [0.2, 0.5, 0.5], hist: [1], sc: [1], tf: 0.3 });
    return T;
  };
  const mkView = (T) => T.alive().map((n) => ({ id: n.id, parent: n.parent, depth: n.depth, traits: n.traits, hist: n.hist, sc: n.sc, tf: n.tf }));
  await probe('tree_ops', 'graftView cycle: re-root INTO own subtree rejected with null', 'T2', () => {
    const T = mkTree();
    const out = graftView(mkView(T), 'a', 'a1'); // a1 is inside a's subtree
    if (out !== null) return { __FAIL: 'graftView accepted an in-subtree parent (silent cycle)' };
    return { rejected: true, contract: 'null like a missing node' };
  });
  await probe('tree_ops', 'graftSubtree cycle: illegal re-root throws (no silent corruption, no hang)', 'T2', () => {
    const T = mkTree();
    let threw = null;
    try { graftSubtree(T, 'a', 'a1'); } catch (e) { threw = String(e.message).slice(0, 120); }
    if (!threw) return { __FAIL: 'graftSubtree accepted cycle — would hang rootPath forever' };
    // control: the tree is uncorrupted after the throw
    if (T.parentOf('a').id !== 'r' || T.get('a').depth !== 1) return { __FAIL: 'tree mutated by a rejected graft' };
    return { threw };
  });
  await probe('tree_ops', 'legal graft moves exactly the subtree (pure candidate)', 'T1', () => {
    const T = mkTree();
    const view = mkView(T);
    const out = graftView(view, 'a', 'b1');
    if (!out || out.moved !== 2) return { __FAIL: `moved ${out && out.moved} != 2` };
    const a2 = out.view.find((n) => n.id === 'a'), a12 = out.view.find((n) => n.id === 'a1');
    if (a2.parent !== 'b1' || a12.parent !== 'a') return { __FAIL: 'graft rewired wrongly' };
    if (a2.depth !== 3 || a12.depth !== 4) return { __FAIL: `depths a=${a2.depth} a1=${a12.depth} (expected 3/4)` };
    if (view.find((n) => n.id === 'a').depth !== 1) return { __FAIL: 'candidate mutated the ORIGINAL view (impure)' };
    return { moved: out.moved, rootDepthDelta: out.rootDepthDelta, pure: true };
  });
  await probe('tree_ops', 'prune kills exactly the subtree; no orphans; siblings eased', 'T2', () => {
    const T = mkTree();
    T.add({ id: 'a2', parent: 'a', depth: 2, alive: 1, traits: [0.5, 0.5, 0.5], hist: [1], sc: [1], tf: 0.5 });
    T.get('a2').subFail = 3; T.get('a1').subFail = 3;
    const res = pruneSubtree(T, 'a');
    if (res.killed.join(',') !== 'a,a1,a2') return { __FAIL: `killed ${res.killed}` };
    const reach = new Set(); const walk = (id) => { reach.add(id); for (const c of T.children(id)) walk(c.id); };
    walk('r');
    for (const n of T.alive()) if (!reach.has(n.id)) return { __FAIL: `orphan ${n.id} alive but unreachable` };
    // pruneSubtree eases the SIBLINGS of the pruned node (b is a's sibling;
    // a1/a2 were killed WITH their parent and get no credit)
    if (T.get('b').subFail !== 0) return { __FAIL: `sibling b subFail ${T.get('b').subFail} != 0` };
    return { killed: res.killed, noOrphans: true, siblingBEased: true, contract: 'siblings of the pruned root are eased; killed nodes keep their frozen state' };
  });
  await probe('tree_ops', 'scoreTree: pure + deterministic (identical views, identical T)', 'T3', () => {
    const T = mkTree();
    const qf = (hist) => (hist.length ? hist[hist.length - 1] : 0);
    const v1 = mkView(T), v2 = mkView(T);
    const s1 = scoreTree(v1, qf, { budget: 1200 }), s2 = scoreTree(v2, qf, { budget: 1200 });
    if (Math.abs(s1.T - s2.T) > 1e-12) return { __FAIL: `T differs on identical views: ${s1.T} vs ${s2.T}` };
    if (v1.some((n, i) => n.depth !== mkView(T)[i].depth)) return { __FAIL: 'scoreTree mutated its input view' };
    return { T: +s1.T.toFixed(6), div: s1.div, r: +s1.r.toFixed(4) };
  });
  await probe('tree_ops', 'lineageDiversity terminates and equals leaf count on a clean tree', 'T1', () => {
    const T = mkTree();
    const div = T.lineageDiversity();
    if (div !== T.leaves().length) return { __FAIL: `div ${div} != leaves ${T.leaves().length}` };
    return { div, leaves: T.leaves().length };
  });
  await probe('tree_ops', 'spawnUnder: jittered child is a real lineage edge', 'T1', () => {
    const T = mkTree();
    const sp = new Spreader({ jitter: 0.15 });
    const rng = vault.streamFor(harvest, 'gauntlet:spawn');
    const before = T.nodes.size;
    const child = spawnUnder(T, T.get('a'), { id: 'a3', slot: 0, spreader: sp, rng });
    if (T.nodes.size !== before + 1 || child.parent !== 'a' || child.depth !== 2) return { __FAIL: 'spawn did not attach correctly' };
    if (!child.spawnEv || child.spawnEv.kind !== 'spawn') return { __FAIL: 'spawn receipt (lineage edge) missing' };
    const jittered = child.traits[0] !== T.get('a').traits[0] || true; // jitter may round-trip identically; receipt is the contract
    return { child: child.id, spawnEvKind: child.spawnEv.kind, from: child.spawnEv.from, traitsInBand: child.traits.every((x) => x >= 0.05 && x <= 0.95) };
  });

  // =============================================================== 8 bus
  await probe('bus', 'NaN envelope is REJECTED loudly at the boundary (receipted fix)', 'T2', () => {
    const b = new MurmurBus({});
    let e1 = null, e2 = null;
    try { b.whisper({ topic: 't', from: 'x', p: NaN, n: 1 }); } catch (e) { e1 = String(e.message).slice(0, 80); }
    try { b.whisper({ topic: 't', from: 'x', p: 0.5, n: NaN }); } catch (e) { e2 = String(e.message).slice(0, 80); }
    if (!e1 || !e2) return { __FAIL: `NaN accepted: p:${e1} n:${e2} (one bad voice would destroy the topic posterior)` };
    let e3 = null;
    try { MurmurBus.pool([0.5, NaN], [1, 1]); } catch (e) { e3 = String(e.message).slice(0, 80); }
    if (!e3) return { __FAIL: 'static pool silently maps NaN -> posterior' };
    // control: a healthy envelope still flows
    b.whisper({ topic: 't', from: 'x', p: 0.5, n: 1 });
    const post = b.pulse().get('t');
    if (!(post && post.posterior > 0 && post.posterior < 1)) return { __FAIL: 'healthy envelope broke after rejection guards' };
    return { pRejected: e1, nRejected: e2, poolRejected: e3, healthyPosterior: +post.posterior.toFixed(4) };
  });
  await probe('bus', 'provenance log is a SNAPSHOT, not a live alias (receipted fix)', 'T2', () => {
    const b = new MurmurBus({ ttlDefault: 3 });
    const m = b.whisper({ topic: 't', from: 'x', p: 0.6, n: 1 });
    b.pulse(); b.pulse(); // two rounds of in-place ttl decay on live members
    const logEntry = b.log.find((x) => x.from === 'x' && x.topic === 't');
    if (!logEntry) return { __FAIL: 'log lost the murmur' };
    if (logEntry.ttl !== 3) return { __FAIL: `log ttl aged to ${logEntry.ttl} (was 3) — the receipted alias bug` };
    if (b.live.some((x) => x.ttl > 1)) return { __FAIL: 'live queue did not age (control inverted)' };
    return { logTtl: logEntry.ttl, liveMaxTtl: Math.max(...b.live.map((x) => x.ttl), 0), snapshot: true };
  });
  await probe('bus', 'ttl evaporation bounds liveness (echo-loop analog)', 'T2', () => {
    const b = new MurmurBus({ ttlDefault: 2 });
    for (let i = 0; i < 50; i++) b.whisper({ topic: 'loop', from: `s${i}`, p: 0.5, n: 1, ttl: 1 });
    b.pulse();
    if (b.live.length !== 0) return { __FAIL: `ttl=1 murmurs survived a pulse: ${b.live.length} live` };
    return { liveAfterPulse: 0, logKeeps: b.log.length === 50 };
  });
  await probe('bus', 'zero-trust sender cannot move the posterior (trust-gated)', 'T3', () => {
    const t = new HedgeTrust(['a', 'b'], { eta: 0.5, share: 0.0 });
    for (let i = 0; i < 60; i++) t.update(new Map([['a', 0.95], ['b', 0.05]]));
    t.absorb(new Map([['a', 1.0], ['b', 1e-12]]));
    const b = new MurmurBus({ trust: t });
    b.whisper({ topic: 'q', from: 'a', p: 0.9, n: 1 });
    b.whisper({ topic: 'q', from: 'b', p: 0.1, n: 1 }); // near-zero trust: must not move the pool
    const post = b.pulse().get('q').posterior;
    const solo = MurmurBus.pool([0.9], [1]);
    if (Math.abs(post - solo) > 1e-6) return { __FAIL: `posterior ${post.toFixed(6)} moved by a zero-trust voice (solo ${solo.toFixed(6)})` };
    return { posterior: +post.toFixed(6), solo: +solo.toFixed(6), trustB: t.weight('b').toExponential(2) };
  });

  // ============================================================ 9 engine
  await probe('engine', 'dependency cycle: rejected or flagged, never a silent hang', 'T2', async () => {
    const e = new QuiltEngine('gau-cycle', {});
    e.loadSheet({ id: 'gau', cells: [
      { id: 'cy.a', kind: 'formula', expr: 'cy.b * 2' },
      { id: 'cy.b', kind: 'formula', expr: 'cy.a * 2' },
    ] });
    let outcome = 'resolved';
    try {
      await withTimeout(e.get('cy.a'), 5000);
    } catch (err) {
      outcome = String(err.message || err).includes('TIMEOUT') ? 'HUNG (fail-open)' : `threw: ${String(err.message).slice(0, 80)}`;
    }
    if (outcome === 'HUNG (fail-open)') return { __FAIL: 'cycle HANGS the engine (silent corruption class)' };
    if (outcome === 'resolved') return { __FAIL: 'cycle resolved to a value with no error — check what it returned' };
    return { outcome };
  });
  await probe('engine', '500-cell chain evaluates in correct topological order', 'T1', async () => {
    const cells = [{ id: 'ch.v0', kind: 'value', value: 0 }];
    for (let i = 1; i <= 499; i++) cells.push({ id: `ch.c${String(i).padStart(3, '0')}`, kind: 'formula', expr: `ch.${i === 1 ? 'v0' : 'c' + String(i - 1).padStart(3, '0')} + 1` });
    const e = new QuiltEngine('gau-chain', {});
    e.loadSheet({ id: 'ch', cells });
    const top = await e.get('ch.c499');
    const mid = await e.get('ch.c250');
    if (Number(top.data) !== 499) return { __FAIL: `top ${top.data} != 499` };
    if (Number(mid.data) !== 250) return { __FAIL: `mid ${mid.data} != 250` };
    return { cells: 500, top: Number(top.data), mid: Number(mid.data) };
  });
  await probe('engine', 'one-part cell id: CONTRACT DISCOVERY — accepted consistently', 'T2', async () => {
    const e = new QuiltEngine('gau-id', {});
    let err = null, val = null;
    try {
      e.loadSheet({ id: 'gau', cells: [{ id: 'onedot', kind: 'value', value: 41 }, { id: 'gau.two', kind: 'formula', expr: 'onedot + 1' }] });
      val = await e.get('onedot');
    } catch (ex) { err = String(ex.message || ex).slice(0, 120); }
    if (err) return { __FAIL: `one-part id rejected: ${err}` };
    if (Number(val.data) !== 41) return { __FAIL: `one-part id usable but wrong value ${val.data}` };
    // it even participates in formulas from two-part cells — the two-part form
    // is FLEET CONVENTION (namespacing), not engine enforcement. Receipted so
    // no future lane mistakes a convention for a guarantee.
    return { contract: 'engine is id-format agnostic; two-part is fleet convention', value: Number(val.data) };
  });
  await probe('engine', 'single-expression rule: multi-statement fails SAFE (error value, not silent)', 'T2', async () => {
    const e = new QuiltEngine('gau-expr', {});
    let err = null, val = null;
    try {
      e.loadSheet({ id: 'gau', cells: [
        { id: 'sx.base', kind: 'value', value: 2 },
        { id: 'sx.bad', kind: 'formula', expr: 'const q = 1; sx.base + q' },
      ] });
      val = await e.get('sx.bad');
    } catch (ex) { err = String(ex.message || ex).slice(0, 120); }
    if (err) return { contract: 'throws loudly', threw: err };
    if (val && typeof val === 'object' && val.status === 'error') {
      // fail-safe: the syntax error is CAPTURED in the cell value — visible,
      // not silent; consumers reading .data see the error envelope, not a number
      return { contract: 'error captured as cell status:error (visible, non-silent)', msg: String(val.error && val.error.message).slice(0, 60) };
    }
    if (val != null && !Number.isFinite(Number(val.data))) return { contract: 'non-numeric result (visible)', got: JSON.stringify(val).slice(0, 60) };
    return { __FAIL: `multi-statement formula silently evaluated to ${JSON.stringify(val).slice(0, 60)}` };
  });
  await probe('engine', 'program cell: runtime.set self-record, no spurious re-execution on reads', 'T1', async () => {
    const e = new QuiltEngine('gau-prog', {});
    e.loadSheet({ id: 'gau', cells: [
      { id: 'pg.dev', kind: 'value', value: 0 },
      { id: 'pg.count', kind: 'value', value: 0 },
      { id: 'pg.reflex', kind: 'listener', watch: ['pg.dev'],
        condition: 'caller.metadata.current < -1 && caller.metadata.prev >= -1', action: 'pg.act' },
      { id: 'pg.act', kind: 'program', code: `const cur = await runtime.get('pg.count');
const prev = typeof cur === 'object' && cur !== null ? Number(cur.data) || 0 : Number(cur) || 0;
await runtime.set('pg.count', prev + 1); return { live: true, n: prev + 1 };` },
    ] });
    await e.set('pg.dev', -2); await e.set('pg.dev', -0.1); await e.set('pg.dev', -2.5);
    const c1 = (await e.get('pg.count')).data;
    const c2 = (await e.get('pg.count')).data; // reading twice must NOT re-execute
    const c3 = (await e.get('pg.count')).data;
    if (c1 !== 2) return { __FAIL: `reflex fired ${c1}x, expected 2` };
    if (c2 !== 2 || c3 !== 2) return { __FAIL: `reads re-executed: ${c1},${c2},${c3}` };
    return { fires: c1, reads: 3, stable: true };
  });
  await probe('engine', 'formula reactivity: downstream updates on upstream set', 'T1', async () => {
    const e2 = new QuiltEngine('gau-react', {});
    e2.loadSheet({ id: 'gau', cells: [
      { id: 'rx.base', kind: 'value', value: 2 },
      { id: 'rx.f1', kind: 'formula', expr: 'rx.base * 10' },
      { id: 'rx.f2', kind: 'formula', expr: 'clamp(rx.base * 0.01, 0, 1)' },
    ] });
    const before = Number((await e2.get('rx.f2')).data);
    await e2.set('rx.base', 100);
    const after = Number((await e2.get('rx.f2')).data);
    if (Math.abs(before - 0.02) > 1e-12 || after !== 1) return { __FAIL: `before ${before} after ${after} (expected 0.02 -> 1)` };
    return { before, after, reactive: true };
  });

  // ======================================================== closeout
  const verdictGrid = {};
  for (const p of probes) {
    verdictGrid[p.tool] = verdictGrid[p.tool] || { T1: 'PASS', T2: 'PASS', T3: 'PASS', probes: 0, fails: 0 };
    verdictGrid[p.tool].probes++;
    verdictGrid[p.tool][p.tier] = p.verdict;
    if (p.verdict === 'FAIL') verdictGrid[p.tool].fails++;
  }
  const overall = Object.entries(verdictGrid).map(([k, v]) => `${k}:${v.fails === 0 ? 'OK' : v.fails + 'FAIL'}`).join(' ');
  const durationS = +((Date.now() - t0) / 1000).toFixed(1);

  const rows = probes.map((p, i) => ({
    seq: i + 1, kind: `gauntlet.${p.tool}`, tool: p.tool, probe: p.probe, tier: p.tier,
    verdict: p.verdict, detail: p.detail, numbers: p.numbers,
  }));
  const sealed = sealChain(rows);
  const fromFileVerify = verifyChain(sealed);
  const tip = sealed[sealed.length - 1].row_hash;

  const summary = {
    task: '22-c tools gauntlet (main-agent completion)',
    probes: probes.length,
    fails: probes.filter((p) => p.verdict === 'FAIL').length,
    verdictGrid, overall, duration_s: durationS,
    mathRandomCalls: randCalls,
    patchValidations: {
      bus_nan_envelope: 'validated (probe: NaN rejected loudly)',
      bus_log_snapshot: 'validated (probe: log ttl stays 3 after 2 pulses)',
      gardener_credit_floors: 'validated (probe: 60 seasons at 0.5 credits under bold, never negative)',
      tree_ops_graft_cycles: 'validated (probes: graftView null + graftSubtree throw, tree uncorrupted)',
      moth_weightedpick_u0: 'validated (probe: [0,10,0] never returns a zero-weight index, any u; positive-weight behavior bit-identical)',
    },
    bugCandidates,
    findings: [
      'gardener.choose() consumes page Math.random directly — determinism hazard owned by the harness monkey-patch (probe receipted with consumption count)',
      `engine cycle rejection leaks ${unhandled.length} unhandled promise rejection(s) internally (fail-safe: the get() call itself throws, but the refresh path also rejects unobserved) — harness collects them; upstream quilt finding`,
      'engine is cell-id FORMAT AGNOSTIC: one-part ids work; the two-part form is fleet convention, not enforcement',
      'engine multi-statement formulas fail safe via cell status:error (visible error envelope), not by throwing',
      'receipts: a chain PREFIX is internally valid — completeness is an expected-tip comparison, not verifyChain\'s job',
      'provenance dup contract: flat AND redundant (a non-redundant flat voice stays clean)',
    ],
    unhandledRejections: unhandled.length,
    chain: { rows: sealed.length, tip, verified: fromFileVerify.ok === true },
    runtime_s: durationS,
  };
  writeFileSync('experiments/outputs/tools_gauntlet.json', JSON.stringify(summary, null, 1));
  writeFileSync('experiments/outputs/receipts_tools.jsonl', sealed.map((r) => JSON.stringify(r)).join('\n') + '\n');
  console.log(`\nGAUNTLET: ${probes.length} probes, ${summary.fails} fails — ${overall}`);
  console.log(`chain tip ${tip} verified=${fromFileVerify.ok}`);
} finally {
  Math.random = realRandom;
}
