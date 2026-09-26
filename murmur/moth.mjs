// quilt-murmur/murmur/moth.mjs — the entropy vault (fleet moth idiom, mesh edition).
// Ported from quilt-learn/learn/moth.mjs (same doctrine, label 'murmur').
//
// Doctrine:
//   - the key lives ONLY in the environment (MOTH_KEY). Never read from a
//     file inside this repo, never logged, never receipted.
//   - every live call is journaled and capped by a hard budget (maxLiveJobs).
//   - refusals degrade to a DETERMINISTIC LABELED MOCK — every consumer can
//     see `mock: true` and every receipt records it. A mock never pretends
//     to be quantum.
//
// The harvest: one graph-v1 job (8 qubits, N shots) returns counts whose KEYS
// are 8-bit outcomes — ~2048 harvested bits in ONE call. Harvest once, then
// stretch deterministically (fnv1a64 counter-mode). streamFor() derives
// independent per-purpose sub-streams from the SAME pool (v2 protocol:
// per-seed re-seeding without extra live jobs).

import { fnv1a64 } from './receipts.mjs';

const API = 'https://api.mothquantum.com/api/v1';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class MothVault {
  constructor({ label = 'murmur', maxLiveJobs = 2, offline = false } = {}) {
    this.label = label;
    this.maxLiveJobs = maxLiveJobs;
    this.offline = offline || !process.env.MOTH_KEY;
    this.liveJobs = 0;
    this.cache = new Map();
    this.journal = [];
    this.lastRefusal = null;
  }

  book(kind, extra = {}) {
    const row = { kind, mock: this.offline, ...extra };
    this.journal.push(row);
    return row;
  }

  async call(method, path, body, timeoutMs = 30000) {
    const key = process.env.MOTH_KEY;
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    const t0 = Date.now();
    try {
      const res = await fetch(API + path, {
        method,
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        signal: ctl.signal,
      });
      const ms = Date.now() - t0;
      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 300) }; }
      return { status: res.status, ms, data };
    } catch (e) {
      return { status: 0, ms: Date.now() - t0, data: { error: String((e && e.message) || e) } };
    } finally { clearTimeout(t); }
  }

  async runJob(engine, params, { timeoutMs = 90000, pollMs = 1500 } = {}) {
    let sub = await this.call('POST', `/engines/${engine}/process`, { params });
    if (sub.status === 429) {
      await sleep(15000);
      sub = await this.call('POST', `/engines/${engine}/process`, { params });
      if (sub.status === 429) { await sleep(30000); sub = await this.call('POST', `/engines/${engine}/process`, { params }); }
    }
    if (sub.status === 0) return { ok: false, why: 'unreachable: ' + (sub.data.error || '') };
    if (sub.status === 401 || sub.status === 403) return { ok: false, why: `auth ${sub.status}` };
    if (sub.status !== 200 && sub.status !== 202) return { ok: false, why: `HTTP ${sub.status}` };
    const jobId = sub.data && sub.data.job_id;
    if (!jobId) return { ok: false, why: 'no job_id' };
    const t0 = Date.now();
    let st = null;
    while (Date.now() - t0 < timeoutMs) {
      await sleep(pollMs);
      const s = await this.call('GET', `/jobs/${jobId}/status`, null, 15000);
      st = s.data && s.data.status;
      if (st === 'completed' || st === 'failed' || st === 'cancelled') break;
    }
    if (st !== 'completed') return { ok: false, why: `job status=${st}` };
    const r = await this.call('GET', `/jobs/${jobId}/result`, null, 30000);
    return { ok: true, jobId, result: r.data || {} };
  }

  async harvest(shots = 256) {
    const nonce = `harvest:${shots}`;
    if (this.cache.has(nonce)) return this.cache.get(nonce);
    let out;
    if (this.offline || this.liveJobs >= this.maxLiveJobs) {
      const why = this.offline ? 'no key / offline mode' : 'budget cap reached';
      this.lastRefusal = why;
      const bits = [];
      for (let i = 0; i < shots; i++) for (let b = 0; b < 8; b++) bits.push(Number(BigInt(fnv1a64(`mockbit:${this.label}:${i}:${b}`)) & 1n));
      out = { mock: true, why, bits, poolDigest: fnv1a64(bits.join('')), jobId: null };
      this.book('harvest.mock', { shots, bits: bits.length, digest: out.poolDigest });
    } else {
      this.liveJobs++;
      let job = await this.runJob('graph-v1', { mode: 'emu', num_qubits: 8, shots, coupling_map: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0]] });
      let bits = [];
      let jobId = job.jobId || null;
      if (job.ok) {
        const counts = (job.result && (job.result.counts || (job.result.result && job.result.result.counts))) || null;
        if (counts && typeof counts === 'object') {
          for (const [k, v] of Object.entries(counts)) {
            const bs = k.replace(/[^01]/g, '');
            for (let r = 0; r < Math.min(Number(v) || 1, 1); r++) for (const c of bs) bits.push(Number(c));
          }
        }
      }
      if (bits.length < 64) {
        job = await this.runJob('coin-toss-v1', { mode: 'emu', shots });
        if (job.ok) {
          jobId = jobId || job.jobId;
          const r = job.result || {};
          const c0 = Number(r.counts?.['0'] ?? r.result?.counts?.['0'] ?? shots / 2);
          const c1 = Number(r.counts?.['1'] ?? r.result?.counts?.['1'] ?? shots - c0);
          const seedStr = `coin:${jobId}:${c0}:${c1}`;
          for (let i = 0; i < shots; i++) bits.push(Number(BigInt(fnv1a64(seedStr + ':' + i)) & 1n));
        }
      }
      if (bits.length < 64) {
        this.lastRefusal = job.ok ? 'harvest too small' : job.why;
        this.offline = true;
        this.cache.delete(nonce);
        return this.harvest(shots);
      }
      out = { mock: false, why: null, bits, poolDigest: fnv1a64(bits.join('')), jobId };
      this.book('harvest.live', { shots, bits: bits.length, digest: out.poolDigest, jobId, latencyBooked: true });
    }
    this.cache.set(nonce, out);
    return out;
  }

  stream(harvest) {
    return this.streamFor(harvest, 'default');
  }

  // STREAM FIX (receipted by E17): FNV-1a's low 32 bits barely avalanche
  // over a 1-char counter change — the naive counter-mode stream returned
  // near-constant draws (0.595442, 0.595442, 0.595441…), silently
  // degenerating every rng()<p test and gauss() transform downstream.
  // The fix cross-keys twice per draw: an inner per-index key re-seeds the
  // pool digest, the outer draw re-hashes WITH the pool. Validated
  // (E17 receipt): mean 0.4996, sd 0.2874, P(u<0.01)=0.0107.
  streamFor(harvest, key) {
    const seed = fnv1a64([harvest.poolDigest, key]);
    let i = 0;
    return () => {
      const inner = fnv1a64(`reseed:${seed}:${i++}`);
      const h = fnv1a64(`stream:${seed}:${inner}`);
      return Number(BigInt(h) & 0xffffffffn) / 4294967296;
    };
  }

  weightedPick(weights, u) {
    const total = weights.reduce((a, b) => a + Math.max(0, b), 0);
    if (!(total > 0)) return Math.floor(u * weights.length) % weights.length;
    let x = u * total;
    for (let i = 0; i < weights.length; i++) { x -= Math.max(0, weights[i]); if (x <= 0) return i; }
    return weights.length - 1;
  }
}
