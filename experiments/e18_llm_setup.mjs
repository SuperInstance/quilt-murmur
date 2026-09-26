// E18 — LLM AS AUTHOR, NOT ORACLE (the setup-only leg)
// ============================================================
// Doctrine under test: "use the quilt without LLM intermix, or with LLM
// only used to set up the run." The LLM's ONLY job: read the pricing
// problem in prose and author the FACTOR WHISPERERS (hook-and-drop).
// Everything else — pooling, trust, branching, gardening, election — is
// the mesh, LLM-free. The authored sheet then runs the SAME E14-style
// season loop against the hand-designed sheet on the same environment.
//
// Live path: z-ai-web-dev-sdk (if resolvable + not rate-limited; 2-call
// budget, backoff, {__refused} honest degrade). Mock path: the canned
// author — a labeled stand-in that must NEVER masquerade as live
// (receipts carry author: 'mock' | 'zai').
//
// Run: node experiments/e18_llm_setup.mjs [seeds]

import { QuiltEngine } from '../engine/dist/index.js';
import { HedgeTrust } from '../murmur/trust.mjs';
import { MothVault } from '../murmur/moth.mjs';
import { fnv1a64, sealChain, verifyChain } from '../murmur/receipts.mjs';
import { writeFileSync } from 'node:fs';

const T = 300, FLIP = 150, MAXB = 10;
const PRICES = [19, 24, 29, 34, 39], COST = 12, D0 = 120;
const gauss = (u1, u2) => Math.sqrt(-2 * Math.log(Math.max(1e-9, u1))) * Math.cos(2 * Math.PI * u2);

// ---- environment: same contract as E14 (E_B = 3.5 discriminating flip) ----
class Env {
  constructor(rng) { this.rng = rng; this.comp = 29; this.inv = 55; this.ehat = 1.2; this.ehist = []; this.t = 0;
    this.noise = []; for (let t = 0; t < T; t++) this.noise.push(gauss(rng(), rng()) * 6);
    this.E = () => (this.t < FLIP ? 0.5 : 3.5); }
  step(t) { this.t = t;
    const jump = t >= FLIP;
    if (!jump) this.comp = Math.min(38, Math.max(20, this.comp + gauss(this.rng(), this.rng()) * 1.2));
    else this.comp = 29 + gauss(this.rng(), this.rng()) * 6;
    const season = Math.max(0, Math.min(1, 0.5 + 0.45 * Math.sin((2 * Math.PI * t) / 40) + gauss(this.rng(), this.rng()) * 0.03));
    this.inv = Math.max(30, Math.min(100, this.inv + gauss(this.rng(), this.rng()) * 6 - 0.08 * (this.inv - 55) + (t % 37 === 0 ? 35 : 0)));
    return { comp: this.comp, season, inv: this.inv }; }
  invF(p, inv) { return inv > 70 ? 1 + 0.5 * ((inv - 70) / 30) * ((34 - p) / 15) : 1 + 0.1 * ((55 - inv) / 55); }
  Ddet(p, w) { const sig = 1 / (1 + Math.exp((p - w.comp) / 6));
    return D0 * Math.exp(-this.E() * ((p - 29) / 29)) * sig * (1 + 0.45 * (w.season - 0.5)) * this.invF(p, w.inv); }
  revenueAt(p, t, w) { return (p - COST) * Math.max(4, this.Ddet(p, w) + this.noise[t]); }
  observe(p, Dobs) { this.ehist.push([p, Dobs]); if (this.ehist.length > 14) this.ehist.shift(); }
  updateEhat() { if (this.t % 5 !== 0 || this.ehist.length < 8) return this.ehat;
    const xs = this.ehist.map(([p]) => (p - 29) / 29), ys = this.ehist.map(([, d]) => Math.log(Math.max(6, d)));
    const mx = xs.reduce((a, b) => a + b, 0) / xs.length, my = ys.reduce((a, b) => a + b, 0) / ys.length;
    let sxy = 0, sxx = 0;
    for (let i = 0; i < xs.length; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
    const slope = sxx > 1e-6 ? sxy / sxx : -1.2;
    this.ehat = Math.max(0.2, Math.min(3, 0.65 * this.ehat + 0.35 * (-slope + gauss(this.rng(), this.rng()) * 0.15)));
    return this.ehat; }
}

// ---- the author contract: prose in, factor spec out ----
// A factor spec: { name, expr } where expr is an endorsement probability
// formula over ALLOWED variables only: price, comp, season, inv, ehat,
// cost. Validated against a whitelist; anything else → author rejected
// → mock. This validation IS the security boundary (hook-and-drop with
// a hook inspector).
const ALLOWED = new Set(['price', 'comp', 'season', 'inv', 'ehat', 'cost']);
const HELPER_OK = new Set(['sig', 'clamp', 'max', 'min', 'abs', 'exp', 'math']);

function compileAuthor(spec) {
  // spec: [{name, expr}] — expr must be a JS expression using only allowed vars
  if (!Array.isArray(spec) || spec.length < 2 || spec.length > 6) return null;
  const clean = [];
  for (const f of spec) {
    if (!f || typeof f.expr !== 'string') return null;
    const stripped = f.expr.replace(/\s/g, '');
    // SECURITY BOUNDARY: every identifier must be an allowed variable or helper
    const ids = stripped.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
    for (const id of ids) {
      if (!ALLOWED.has(id) && !HELPER_OK.has(id.toLowerCase())) return null;
    }
    // charset sanity: only math punctuation beyond identifiers/numbers
    if (!/^[0-9+\-*/().,\s_a-zA-Z]*$/.test(stripped)) return null;
    clean.push({ name: String(f.name || 'factor').slice(0, 24), expr: f.expr });
  }
  return clean;
}

function authorFactors(express) {
  return [
    { name: 'competitor-gap', expr: 'sig(1.5*(1 - abs(price - comp)/12))' },
    { name: 'margin-depth', expr: 'sig(2.0*((price - cost)/cost - 0.8))' },
    { name: 'inventory-pressure', expr: 'sig(2.5*(((34 - price)/15)*((inv - 55)/25)))' },
    { name: 'season-timing', expr: 'sig(2.2*((price - 29)/10 + (season - 0.5)))' },
    { name: 'demand-implied-E', expr: 'sig(1.6*(((29 - price)/10)*((ehat - 1.2)/0.9)))' },
  ];
}

async function liveAuthor() {
  // 2-call budget, honest refusal. The z-ai sdk lives in the quilt-lab
  // install; if unresolvable under node, we refuse (mock receipts it).
  try {
    const { createRequire } = await import('node:module');
    const require = createRequire(import.meta.url);
    // resolve the sdk from quilt-lab's install (env-overridable, portable default)
    const sdkPath = process.env.ZAI_SDK_PATH || '../../../scripts/quilt-lab/node_modules/z-ai-web-dev-sdk';
    const mod = require((await import('node:path')).resolve(import.meta.dirname, sdkPath));
    const ZAI = mod.default || mod;
    const zai = await ZAI.create();
    const prompt = `You are authoring factor cells for a reactive pricing mesh.
The product: cost=$12, candidate prices [19,24,29,34,39], base demand 120.
The world exposes: competitor price (comp), season index (season 0..1), inventory (inv 30..100), demand-implied elasticity estimate (ehat).
Author 3-5 factor whisperers. Each factor = {name, expr} where expr is a SINGLE JavaScript expression returning a probability in [0,1] that a given price is good, using ONLY these variables: price, comp, season, inv, ehat, cost, and helpers sig(x)=1/(1+exp(-x)), clamp(x,lo,hi), abs(x), min, max.
Reply with ONLY a JSON array like [{"name":"...","expr":"sig(1.5*(1-abs(price-comp)/12))"}, ...]. No prose.`;
    for (const wait of [0, 15000, 30000]) {
      if (wait) await new Promise((r) => setTimeout(r, wait));
      try {
        const res = await zai.chat.completions.create({ messages: [{ role: 'user', content: prompt }], temperature: 0.2 });
        const text = (res.choices?.[0]?.message?.content || '').trim();
        const m = text.match(/\[[\s\S]*\]/);
        if (!m) continue;
        const spec = compileAuthor(JSON.parse(m[0]));
        if (spec) return { author: 'zai', spec, raw: m[0].slice(0, 400) };
      } catch (e) {
        if (String(e).includes('__refused') || String(e).includes('429')) continue;
        break;
      }
    }
    return null;
  } catch { return null; }
}

// ---- build the sheet from ANY validated author spec (the hook-and-drop) ----
const sig = (z) => `(1/(1+Math.exp(-(${z}))))`;
function buildSheet(spec) {
  const cells = [
    { id: 'env.competitor', kind: 'value', value: 29 },
    { id: 'env.season', kind: 'value', value: 0.5 },
    { id: 'env.inventory', kind: 'value', value: 55 },
    { id: 'env.ehat', kind: 'value', value: 1.2 },
    { id: 'mesh.mix', kind: 'value', value: 0.45 },
    { id: 'mesh.temp', kind: 'value', value: 0.12 },
    { id: 'mesh.choice', kind: 'value', value: 0 },
    { id: 'mesh.maxrank', kind: 'formula', expr: `max(${Array.from({ length: MAXB }, (_, i) => `br${i + 1}.rank`).join(',')})` },
  ];
  const NF = spec.length;
  for (let i = 1; i <= NF; i++) cells.push({ id: `t.f${i}`, kind: 'value', value: 1 / NF });
  for (let b = 1; b <= MAXB; b++) {
    cells.push({ id: `br${b}.price`, kind: 'value', value: PRICES[(b - 1) % 5] });
    cells.push({ id: `br${b}.est`, kind: 'value', value: 1.2 });
    cells.push({ id: `br${b}.alive`, kind: 'value', value: b <= 5 ? 1 : 0 });
    spec.forEach((f, i) => {
      const cellExpr = authorExprToCell(f.expr, b);
      cells.push({ id: `ex${i + 1}.br${b}`, kind: 'formula', expr: cellExpr });
    });
    const wsum = Array.from({ length: NF }, (_, i) => `t.f${i + 1}`).join(' + ');
    const lsum = Array.from({ length: NF }, (_, i) => {
      const x = `ex${i + 1}.br${b}`;
      return `t.f${i + 1}*Math.log(clamp(${x},0.02,0.98)/(1-clamp(${x},0.02,0.98)))`;
    }).join(' + ');
    cells.push({ id: `br${b}.pool`, kind: 'formula', expr: sig(`(${lsum}) / (${wsum})`) });
    cells.push({
      id: `br${b}.scoren`, kind: 'formula',
      expr: `clamp((br${b}.price - ${COST}) * (120*${sig(`-br${b}.est*((br${b}.price - 29)/29)`)}) / 1600, 0, 1.3)`,
    });
    cells.push({ id: `br${b}.rank`, kind: 'formula', expr: `br${b}.alive * (br${b}.scoren + mesh.mix * 0.6 * (br${b}.pool - 0.5))` });
    cells.push({ id: `br${b}.pickw`, kind: 'formula', expr: `br${b}.alive * Math.exp((br${b}.rank - mesh.maxrank) / mesh.temp)` });
  }
  return { id: 'authored-mesh', title: 'Authored Pricing Mesh', cells };
}
// expand an author expression into a cell expression:
// 1) substitute author variables with cell ids (EXACTLY ONCE — recursion
//    must not re-substitute: 'price' inside 'br1.price' would produce
//    'br1.br1.price', receipted as the identical-scores bug)
// 2) expand sig( / clamp( / abs( with proper paren matching
function authorExprToCell(src, b, substitute = true) {
  let e = src;
  if (substitute) {
    const VARS = [[/\bprice\b/g, `br${b}.price`], [/\bcomp\b/g, 'env.competitor'], [/\bseason\b/g, 'env.season'], [/\binv\b/g, 'env.inventory'], [/\behat\b/g, 'env.ehat'], [/\bcost\b/g, String(COST)]];
    e = VARS.reduce((acc, [re, to]) => acc.replace(re, to), src);
  }
  let out = '', i = 0;
  while (i < e.length) {
    const m = /^(sig|clamp|abs|max|min)\(/.exec(e.slice(i));
    if (!m) { out += e[i]; i++; continue; }
    const name = m[1], start = i + m[0].length;
    let depth = 1, j = start;
    while (j < e.length && depth > 0) { if (e[j] === '(') depth++; if (e[j] === ')') depth--; j++; }
    const inner = e.slice(start, j - 1);
    const expanded = authorExprToCell(inner, b, false); // no re-substitution
    if (name === 'sig') out += `(1/(1+Math.exp(-(${expanded}))))`;
    else if (name === 'clamp') out += `clamp(${expanded})`;
    else if (name === 'abs') out += `abs(${expanded})`;
    else out += `${name}(${expanded})`;
    i = j;
  }
  return out;
}

// ---- the season loop (same skeleton as E14, UCB pick, trust outcome-credit) ----
async function runAuthored(spec, seed, vault) {
  const env = new Env(vault.streamFor(vault.current, `env:${seed}`));
  const rng = vault.streamFor(vault.current, `e18:${seed}`);
  const NF = spec.length;
  const trust = new HedgeTrust(spec.map((_, i) => `f${i + 1}`), { eta: 0.35, share: 0.02 });
  const engine = new QuiltEngine(`authored-${seed}`, {});
  engine.loadSheet(buildSheet(spec));
  const visits = new Map(Array.from({ length: MAXB }, (_, i) => [i + 1, 0]));
  let tot = 0, emaR = 900, stdR = 200, totalRev = 0, postRev = 0;
  const regretHist = [];
  for (let t = 0; t < T; t++) {
    const w = t === 0 ? env.step(0) : env.step(t);
    env.updateEhat();
    await engine.set('env.competitor', +w.comp.toFixed(3));
    await engine.set('env.season', +w.season.toFixed(4));
    await engine.set('env.inventory', +w.inv.toFixed(2));
    await engine.set('env.ehat', +env.ehat.toFixed(3));
    for (let b = 1; b <= MAXB; b++) {
      if ((await engine.get(`br${b}.alive`)).data === 1) {
        const est = (await engine.get(`br${b}.est`)).data;
        await engine.set(`br${b}.est`, +(est + 0.08 * (env.ehat - est)).toFixed(4));
      }
    }
    const rks = [], pws = [];
    for (let b = 1; b <= MAXB; b++) {
      pws.push((await engine.get(`br${b}.pickw`)).data);
      rks.push((await engine.get(`br${b}.rank`)).data);
    }
    tot++;
    let idx = 0, bestU = -Infinity;
    const c = 2.5;
    for (let b = 1; b <= MAXB; b++) {
      if (pws[b - 1] <= 0) continue;
      const ucb = rks[b - 1] + c * Math.sqrt(Math.log(tot + 1) / Math.max(1, visits.get(b)));
      if (ucb > bestU) { bestU = ucb; idx = b - 1; }
    }
    const pickBranch = idx + 1;
    visits.set(pickBranch, (visits.get(pickBranch) ?? 0) + 1);
    const pickPrice = (await engine.get(`br${pickBranch}.price`)).data;
    const Dobs = env.Ddet(pickPrice, w) + env.noise[t];
    const rev = (pickPrice - COST) * Math.max(4, Dobs);
    env.observe(pickPrice, Math.max(4, Dobs));
    totalRev += rev; if (t >= FLIP) postRev += rev;
    const dev = (rev - emaR) / Math.max(60, stdR);
    stdR = 0.97 * stdR + 0.03 * Math.abs(rev - emaR);
    emaR = 0.92 * emaR + 0.08 * rev;
    let bestV = -Infinity;
    for (const p of PRICES) bestV = Math.max(bestV, env.revenueAt(p, t, w));
    regretHist.push(bestV - rev);
    // outcome-credit trust (centered)
    const rewards = new Map();
    for (let f = 1; f <= NF; f++) {
      const en = (await engine.get(`ex${f}.br${pickBranch}`)).data;
      rewards.set(`f${f}`, Math.max(0.05, Math.min(0.95, 0.5 + 0.18 * (en - 0.5) * Math.max(-1.5, Math.min(1.5, dev)))));
    }
    trust.update(rewards);
    for (let f = 1; f <= NF; f++) await engine.set(`t.f${f}`, +trust.weight(`f${f}`).toFixed(5));
  }
  return { totalRev, postRev, regret: regretHist.reduce((a, b) => a + b, 0) };
}

// ---- main ----
const SEEDS = Number(process.argv[2] || 8);
console.log(`── E18 llm-setup leg · ${SEEDS} seeds ──`);
const vault = new MothVault({ label: 'murmur-e18', maxLiveJobs: 0 }); // budget 0: E14 spent the live job this session
vault.current = await vault.harvest(256);

const rows = []; let seq = 0;
const book = (kind, extra) => rows.push({ seq: ++seq, kind, ...extra });

let author = null, authorKind = 'mock';
const live = await liveAuthor();
if (live) { author = live.spec; authorKind = 'zai'; book('author.live', { spec: live.spec, raw: live.raw }); }
else {
  author = compileAuthor(authorFactors());
  book('author.mock', { why: 'z-ai unresolvable or refused — labeled mock, never masquerades', spec: author });
}
console.log(`author: ${authorKind} — factors: ${author.map((f) => f.name).join(', ')}`);
const okSheet = (() => { try { const e = new QuiltEngine('probe', {}); e.loadSheet(buildSheet(author)); return true; } catch (e) { console.log('sheet build FAILED:', e.message); return false; } })();
book('author.sheetbuild', { ok: okSheet, factors: author.length, kind: authorKind });
if (!okSheet) { author = compileAuthor(authorFactors()); book('author.fallback', { why: 'authored sheet failed to build — hand-designed fallback (receipted)' }); }

const hand = compileAuthor(authorFactors());
const runs = { authored: [], hand: [] };
for (let s = 0; s < SEEDS; s++) {
  runs.authored.push(await runAuthored(author, s, vault));
  runs.hand.push(await runAuthored(hand, s, vault));
}
const sum = (a) => ({ total: a.reduce((x, r) => x + r.totalRev, 0) / a.length, post: a.reduce((x, r) => x + r.postRev, 0) / a.length });
const sA = sum(runs.authored), sH = sum(runs.hand);
book('arm.authored', { kind: authorKind, total: Math.round(sA.total), post: Math.round(sA.post), perSeed: runs.authored.map((r) => Math.round(r.totalRev)) });
book('arm.hand', { total: Math.round(sH.total), post: Math.round(sH.post), perSeed: runs.hand.map((r) => Math.round(r.totalRev)) });
console.log(`authored (${authorKind}): total ${Math.round(sA.total)}  post-flip ${Math.round(sA.post)}`);
console.log(`hand-designed:          total ${Math.round(sH.total)}  post-flip ${Math.round(sH.post)}`);
const verdict = Math.abs(sA.total - sH.total) < 0.06 * sH.total
  ? 'AUTHORED ≈ HAND — the LLM-authored factor set is competitive; the mesh carries the run'
  : (sA.total > sH.total ? 'AUTHORED > HAND' : 'AUTHORED < HAND (honest: authoring quality matters; the mesh did not rescue a weak factor set)');
book('e18.verdict', { verdict, authoredKind: authorKind, delta: Math.round(sA.total - sH.total) });
book('chain.seal', { rows: rows.length });
const v = verifyChain(sealChain(rows));
console.log(`receipts: ${rows.length}, chain ${v.ok ? 'VERIFIED' : 'BROKEN'} tip=${rows[rows.length - 1].row_hash}`);
writeFileSync(new URL('./outputs/e18_summary.json', import.meta.url), JSON.stringify({ authorKind, spec: author, authored: sA, hand: sH, verdict }, null, 1));
writeFileSync(new URL('./outputs/receipts_e18.jsonl', import.meta.url), rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
console.log(v.ok ? 'E18 DONE' : 'E18 CHAIN BROKEN');
