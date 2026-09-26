# MESH — the murmur lineage, metamorphosed

> Twelve vessels walked. One mesh flies.
>
> murmura-agent · Murmur · murmur-protocol-v2 · nexus-git-agent · git-agent ·
> git-agent-codespace · git-agent-system · lau-git-agent · decomp-agents ·
> engine-ensign · flux-agent-runtime · cocapn

## 1. The diagnosis: twelve repos, five primitives

Read side by side, the old lineage was independently reinventing the same five
primitives — each repo a partial, hand-built, *walking* implementation:

| primitive | who built it, walking | what quilt already had |
|---|---|---|
| reactive state | flux-agent-runtime (FLUX VM), git-agent-system (commit = state transition) | the engine: cells, dependency graph, propagation |
| decisions with provenance | lau-git-agent (ProvenanceEntry: alternatives, tradeoffs, debt, commit link) | cell values + fnv1a64 witness chains |
| trust that learns | nexus-git-agent (0–100 behavior scores, quarantine), cocapn (Tile confidence/usage/success) | nothing — **the mesh adds it** (HedgeTrust) |
| branching exploration | git-agent-system (`thought/{topic}` branches), decomp-agents (worktree workers claiming from a queue) | nothing — **the mesh adds it** (Spreader) |
| ambient low-bandwidth messaging | murmur-agent, Murmur, murmur-protocol-v2 (whispers, TensorDB wiki, wire envelopes) | listener cells + subscriptions — **the mesh shapes it** (MurmurBus) |

The metamorphosis is not a port. A larva does not "carry" its legs into the
air. Each old mechanism *dissolves* into a cell pattern:

| old vessel (walking) | quilt form (flying) |
|---|---|
| murmur-agent's five thinking strategies (explore/connect/contradict/synthesize/question) | five *operator cells* applied to copied branch families — strategies are cells, not a controller loop |
| Murmur's TensorDB wiki | the sheet itself; a wiki page is a cell with provenance; the bulletin board is a listener filter |
| murmur-protocol-v2's wire envelope | `{topic, from, p, n, ttl}` carried by ordinary cells; the protocol is a *convention*, no network required |
| nexus's trust engine + quarantine | trust *edges* (Hedge weights); quarantine = a zero-weight voice has zero influence, for free |
| git-agent's observe→plan→execute→communicate→reflect | the seasonal loop: sense (set env cells) → infer (formulas) → elect (vault pick) → pay (outcome cells) → learn (trust writeback) |
| lau's provenance ledger | every decision cell carries its alternatives in the receipt chain; the ledger *is* the sheet's hash log |
| git-agent-system's thought branches + merge-as-decision | Spreader branch (cell copy with mutated seed) + graft (transplant of winning factor cells) |
| decomp-agents' worktree workers | branch families with claim semantics; self-grading = discriminator formulas; auto-merge = graft when trust is high |
| engine-ensign's pathos/logos/ethos tripartite | three discriminator families scoring every branch; the ensign is a label cell hoisting the winner |
| cocapn's Tile/Room/Flywheel | tile = cell with confidence + usage + success; room = sheet region; flywheel = listener-driven trust writeback |

**Why this is flying and not walking:** the old agents were sequential state
machines — one tick, one decision, one thread of thought. A mesh is a
*population* of micro-decisions evaluated concurrently in a reactive graph,
where redundancy replaces single-thread reliability and the "controller" is a
scalar read off the graph, not a loop.

## 2. The mesh thesis, stated precisely

> If a chatbot gives you a path to walk, decompose everything that went into
> that choice into cells. The decomposition — not the path — is the artifact.
> Weights on those cells are the inference. Copying a cell state with a
> changed seed is a thought. Pruning and grafting are editing the thought.
> A gardener that reads the whole tree and modulates the copy budget is the
> viewpoint that actualizes the greater goal.

Mechanically, in this repo:

1. **Decision decomposition**: a "price change" is not one number; it is five
   factor voices × N price-candidate branches × trust edges (E14's sheet:
   ~140 cells, zero LLM calls in the loop).
2. **Weights as the inference**: endorsement cells whisper probabilities
   (p, evidence mass n); the pool is trust-weighted log-odds
   `posterior = σ(Σ wᵢnᵢ·logit(pᵢ) / Σ wᵢnᵢ)` — a *logarithmic opinion pool*
   computed by literal formula cells. Verified against reference math at
   every sampled round (E14 `pool✗ = 0`; E16 preflight maxDiff 0 over 4000
   rounds; E17 4800/4800 checks at 1e-9).
3. **Graph-of-thought by cell copying**: branch = copy of the factor-estimate
   cells with a vault-seeded jitter (`Spreader.branch`); the copies share
   formula topology, so diversity is *structured* — every branch remains
   interpretable by the same cell grammar. This is the Spreader-tool doctrine
   ("copy a cell state and from that point change the seed slightly")
   promoted to an evolutionary operator.
4. **Prune / graft**: `Spreader.prune` (streak-based selection) and
   `Spreader.graft` (transplant the most-trusted factor's estimate into a
   fresh branch — trust guides the knife). E15 receipted the payoff:
   gardening beats single-path generation at equal budget (z ≈ 2.4), with
   1.4–1.9× story diversity.
5. **The gardener (meta-viewpoint)**: reads three scalars — Kuramoto order
   parameter r (consensus), trust entropy H (how opinionated the mesh is),
   rolling regret delta — and writes three scalars (temperature, prune
   floor, spawn budget). The "viewpoint that recognizes the higher-abstracted
   goal of the greater tree" is a scalar read plus three scalar writes.

## 3. The math stack (each piece receipted in experiments)

- **Trust = multiplicative weights with fixed share** (Herbster–Warmuth):
  `wᵢ ← ((1−α)wᵢ + α/N)·exp(ε·rᵢ)`, normalized. Regret vs best fixed expert
  `O(√(T ln N))`; fixed-share tracks the best *shifting* expert — the math
  of "cells learn to trust" under regime flips. E17: window-Hedge achieves
  *negative* regret vs best fixed expert (−8.79 ± 9.64) in non-stationary
  pools; eta 0.5 re-crowns a flipped champion in 16.5 rounds vs uniform's
  *never*.
- **Murmur integration = logarithmic opinion pool** in log-odds space with
  trust×evidence-mass weights. A confident liar with low trust is outvoted
  by a hesitant truth-teller with high trust; quarantine falls out at w=0.
- **Agreement = Kuramoto resonance**: `dθᵢ/dt = ωᵢ + (K/n)·Σⱼ aᵢⱼ·sin(θⱼ−θᵢ)`;
  order parameter `r = |mean(e^{iθ})|`. E16's receipt splits the thesis
  honestly: **r is a coherence meter, not an accuracy meter**
  (corr(r, next-error) ≈ 0, null receipted) — but **r is a lie detector**
  (mean r 0.853 when a murmur fights the consensus vs 0.995 in agreement,
  Δ = −0.141, 19/20 seeds). A mesh can be coherently wrong; the gardener
  should read r-drops, not r-levels.
- **The echo vulnerability** (E17, receipted): a plagiarist cell that copies
  a good cell's votes is *invisible to outcome-trust while it free-rides*
  (reward 0.612 vs source 0.622 during copying — statistically identical);
  trust punishes staleness, not theft. Post-copy degeneration is punished
  (weight delta +0.115 by round 350, 18/24 seeds). Protocol implication:
  provenance (who originated a murmur) must be a first-class cell field —
  trust alone cannot detectechoes.
- **Entropy doctrine** (inherited from quilt-learn L2, applied in E14 v2):
  structure beats entropy — UCB optimism over the sheet's ranks replaced
  softmax sampling; the vault's true entropy is spent only on tie-breaks
  and spawn jitter. "The sheet nominates; the vault elects."

## 4. Receipted engine lessons (the mesh's toll)

1. **Dotted-prefix law**: no cell id may be a dotted path-prefix of another
   (`b3` + `b3.est` explodes; `ex1.b3` + `ex1.b30` is fine). Two-segment ids
   everywhere.
2. **Listener contract**: conditions see `caller.metadata.current/prev`; a
   bare `current` is *silently* undefined (evaluates false). E2's original
   "pager payload" verification was itself bogus — `engine.get` on a program
   RE-EXECUTES it with an empty context, so a fired action's payload is
   unreachable by get. The fix is doctrine now: **reflexes write their own
   memory** (`runtime.set` into a value cell; see mesh.scaract).
3. **CellValue unwrap**: inside programs, `runtime.get` returns a CellValue,
   not `.data` (patch-11 contract) — unwrapping defensively is mandatory or
   arithmetic degrades to `"[object Object]1"` string coercion.
4. **Bare short ids**: a one-char id (`a`) corrupts `cand.a` after the
   formula compiler's id-rewriting (lookarounds pass inside quoted strings)
   — E15 receipted; use multi-char ids.
5. **Vault stream avalanche** (E17 receipted, fixed here): FNV-1a's low 32
   bits barely avalanche over a 1-char counter change — the naive
   counter-mode stream returned near-constant draws. The fix cross-keys
   twice per draw (validated: mean 0.5009, sd 0.2882, lag-1 ACF 0.001).

## 5. What the E-series established

| exp | question | verdict |
|---|---|---|
| E14 pricing mesh | can cells work out a pricing change with no LLM in the loop? | **Yes** — 140-cell sheet, live MOTH-seeded picks, sheet pooling ≡ reference math. Post-flip adaptation beats fixed pricing. Learned trust modulation: *not yet* (five protocol iterations receipted: echo double-counting, level-vs-optimum factor signals, credit sparsity) |
| E15 adventure gardener | does branch/prune/graft beat single-path at equal budget? | **Yes** (z ≈ 2.4, 1.4–1.9× diversity). Adaptive policy bandit ties best fixed policy at 40-step seasons (too few steps to converge — honest null) |
| E16 resonance consensus | is the order parameter useful to a meta-cell? | **As a lie detector, yes** (post-vault-fix Δ = −0.065, pre-fix −0.141 — direction stable, 19-20/20 seeds); as an accuracy predictor, no (receipted null). Hedge demotes a lying node to <1% weight (−90%) |
| E17 gossip trust | do cells learn to trust under non-stationarity? | **Yes** — window-Hedge: negative regret (−5.8 ± 11.5 post-vault-fix) vs best fixed expert; hedge50 re-crowns a flipped champion in 13.2 rounds (uniform: never); echo vulnerability receipted (source beats echo 24/24 seeds by round 350 — but ONLY after the free-rider degenerates) |
| E18 llm-setup | can the LLM be confined to setup? | **Yes** — z-ai authored the factor cells at setup (hook-and-drop with a whitelist inspector); the mesh ran LLM-free. Two independent live authorings landed −12% / −10% vs hand-designed: authoring quality matters, the mesh does not rescue a weak factor set |

## 6. How to build within a repo (the "quilt version of murmur-agent")

murmur-agent dropped into a project and thought all night in commits. The
mesh equivalent, all inside one repo:

```
loadSheet(pricing-mesh)        # the repo IS the sheet
  │
  ├─ env.* cells               # sensors: whatever your repo observes (CI, issues, prices)
  ├─ ex{i}.b{X} cells          # factors whisper endorsements to branches
  ├─ br{X}.* cells             # branches: copies with mutated seeds
  ├─ t.f* cells                # trust edges, Hedge-written back each season
  ├─ mesh.scar (listener)      # reflexes that write their own memory
  ├─ gardener                  # reads r, H, regret; writes temp/prune/spawn
  └─ receipts.jsonl            # fnv1a64 witness chain: the provenance ledger
```

Every commit is a cell transition with provenance; every branch is a cell
family; every PR is a graft; every review is a discriminator cell; every
retro is a trust writeback. Git was always the nervous system — quilt gives
it a body that reacts.
