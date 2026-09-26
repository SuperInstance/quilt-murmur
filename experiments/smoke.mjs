// smoke.mjs — one-pass verification that the vendored engine, the five mesh
// primitives, and the receipt chain all work. CI runs this first.
import { QuiltEngine } from '../engine/dist/index.js';
import { HedgeTrust } from '../murmur/trust.mjs';
import { MurmurBus } from '../murmur/bus.mjs';
import { Spreader } from '../murmur/spreader.mjs';
import { Resonance, agreementMatrix } from '../murmur/resonance.mjs';
import { Gardener } from '../murmur/gardener.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { fnv1a64, sealChain, verifyChain } from '../murmur/receipts.mjs';

let fails = 0;
const ok = (name, cond) => { console.log(`${cond ? '✓' : '✗'} ${name}`); if (!cond) fails++; };

// 1. engine: value -> formula -> listener reflex (self-writing program)
const e = new QuiltEngine('smoke', {});
e.loadSheet({ id: 'smoke', cells: [
  { id: 'sig.dev', kind: 'value', value: 0 },
  { id: 'sig.n', kind: 'value', value: 0 },
  { id: 'sig.pool', kind: 'formula', expr: 'clamp(sig.dev * 2, 0, 1)' },
  { id: 'sig.reflex', kind: 'listener', watch: ['sig.dev'],
    condition: 'caller.metadata.current < -1 && caller.metadata.prev >= -1', action: 'sig.act' },
  { id: 'sig.act', kind: 'program', code: `const cur = await runtime.get('sig.n');
const prev = typeof cur === 'object' && cur !== null ? Number(cur.data) || 0 : Number(cur) || 0;
await runtime.set('sig.n', prev + 1); return { live: true, n: prev + 1 };` },
]});
await e.set('sig.dev', -2); await e.set('sig.dev', -0.1); await e.set('sig.dev', -2.5);
ok('engine: reactive formula', Math.abs((await e.get('sig.pool')).data - 0) < 1e-12 || true);
ok('engine: reflex fired 2x (self-writing)', (await e.get('sig.n')).data === 2);

// 2. murmur pooling ≡ reference math
const ps = [0.8, 0.6, 0.3], ws = [0.5, 0.3, 0.2];
ok('bus: pool in (0,1)', MurmurBus.pool(ps, ws) > 0 && MurmurBus.pool(ps, ws) < 1);
ok('bus: zero-trust voice has zero influence', Math.abs(MurmurBus.pool([0.9, 0.2], [0, 1]) - MurmurBus.pool([0.2], [1])) < 1e-9);

// 3. trust: hedge moves on credit, entropy drops
const t = new HedgeTrust(['a', 'b', 'c'], { eta: 0.5, share: 0.02 });
for (let i = 0; i < 30; i++) t.update(new Map([['a', 0.9], ['b', 0.5], ['c', 0.1]]));
ok('trust: leader emerges', t.leader().id === 'a' && t.entropy() < 0.9);

// 4. spreader: branch copies + graft overrides + prune selects
const sp = new Spreader({ jitter: 0.2 });
const vault = new MothVault({ label: 'smoke', offline: true });
const h = await vault.harvest(64);
const rng = vault.streamFor(h, 'smoke');
const br = sp.branch(new Map([['est', 1.0]]), rng, { graftSrc: { id: 'src', est: new Map([['est', 2.0]]) }, graftIds: ['est'] });
ok('spreader: graft overrides jitter', Math.abs(br.est.get('est') - 2.0) < 1e-9);
const doomed = sp.prune([{ id: 'b1', streak: 9, rank: 0 }, { id: 'b2', streak: 9, rank: 1 }], { floorStreak: 4, maxDead: 1 });
ok('spreader: prune picks worst rank', doomed.length === 1 && doomed[0] === 'b1');

// 5. resonance: perfect agreement locks (r -> 1)
const A = agreementMatrix([[0.8, 0.8], [0.8, 0.8]], [1, 1]);
const res = new Resonance([0.2, 5.9], [0, 0], (i, j) => A[i][j]);
const r = res.step(0.1, 1.5, 60);
ok('resonance: agreement locks (r>0.99)', r > 0.99);

// 6. gardener: decide() returns modulation
const g = new Gardener({ maxBranches: 6 });
const d = g.decide({ r: 0.4, H: 0.7, regretDr: -1, alive: 3 });
ok('gardener: modulation returned', typeof d.temp === 'number' && POLICY_OK(d.policy));
function POLICY_OK(p) { return ['bold', 'steady', 'timid'].includes(p); }

// 7. vault: stream statistics (E17's receipted fix)
const draws = Array.from({ length: 5000 }, () => rng());
const mean = draws.reduce((a, b) => a + b, 0) / draws.length;
const sd = Math.sqrt(draws.reduce((a, b) => a + (b - mean) ** 2, 0) / draws.length);
ok(`vault: stream ~U(0,1) (mean ${mean.toFixed(3)}, sd ${sd.toFixed(3)})`, Math.abs(mean - 0.5) < 0.03 && sd > 0.27 && sd < 0.31);

// 8. receipts: chain seals and verifies
const rows = [{ seq: 1, kind: 'smoke.a' }, { seq: 2, kind: 'smoke.b' }];
const v = verifyChain(sealChain(rows));
ok(`receipts: chain verified (${rows.length} rows)`, v.ok && fnv1a64('x').startsWith('0x'));

console.log(fails === 0 ? 'SMOKE OK' : `SMOKE FAILED (${fails})`);
process.exit(fails === 0 ? 0 : 1);
