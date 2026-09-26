# quilt-murmur

**The murmur lineage reborn as quilt.** Twelve SuperInstance vessels —
murmur-agent, Murmur, murmur-protocol-v2, nexus-git-agent, git-agent,
git-agent-codespace, git-agent-system, lau-git-agent, decomp-agents,
engine-ensign, flux-agent-runtime, cocapn — walked as sequential agents.
This repo is the metamorphosis: their five shared primitives (reactive state,
provenance-carrying decisions, learned trust, branching exploration, ambient
gossip) as literal spreadsheet cells in a reactive mesh.

Read [MESH.md](./MESH.md) first — the crosswalk, the math, the receipted
findings.

## The five mesh primitives (in `murmur/`)

| module | primitive | old lineage |
|---|---|---|
| `bus.mjs` | murmur envelope + trust-weighted log-odds pooling | murmur-protocol-v2, Murmur |
| `trust.mjs` | Hedge / fixed-share trust edges | nexus-git-agent, cocapn |
| `spreader.mjs` | branch (cell copy + seed mutation) / prune / graft | git-agent-system, decomp-agents, Spreader-tool |
| `resonance.mjs` | Kuramoto order parameter — agreement as physics | MOTHquantum × engine-ensign |
| `gardener.mjs` | meta-bandit over bold/steady/timid gardening policies | git-agent's O-P-E-C-R loop |
| `provenance.mjs` | murmur-protocol-v3: origin claims, echo conviction, relay economics | murmur-agent's anti-gossip stance, lau-git-agent's provenance entries |
| `moth.mjs` | entropy vault (harvest once, stretch honestly, per-seed streams) | quilt-learn doctrine |
| `receipts.mjs` | fnv1a64 witness chain | the fleet canon |

## Experiments (all LLM-free unless stated; every claim receipted)

```bash
npm install
npm run smoke   # sheet + reflex + pool-verification in one pass
npm run e14     # the pricing mesh: 5 arms × seeds × 300 seasons
npm run e15     # adventure gardener: branch/prune/graft story generation
npm run e16     # resonance as lie detector (nexus's lying-node problem)
npm run e17     # gossip trust dynamics + the echo vulnerability
npm run e18     # LLM authors the sheet at setup; the mesh runs LLM-free
node experiments/e19_provenance_protocol.mjs   # murmur-protocol-v3 under fire
node experiments/e20_long_seasons.mjs          # the gardener given time to garden
node experiments/e21_coldstart_admission.mjs   # protocol v3.1: admission + fractional influence
node experiments/e22_crossfleet_bracket.mjs    # arena minds vs mesh minds under one ration
node experiments/e23_tree_gardener.mjs         # subtree operators under a high-order goal
```

Outputs land in `experiments/outputs/` (receipt chains + summaries).
`MOTH_KEY` is env-only; without it the vault degrades to a labeled mock —
a mock never pretends to be quantum.

## Headline receipts

- **Gardening beats single-path** at equal generation budget (E15, z ≈ 2.4,
  1.4–1.9× diversity).
- **The order parameter is a lie detector, not an accuracy meter**
  (E16: Δr = −0.141 when a murmur fights consensus; corr(r, error) ≈ 0 —
  both receipted).
- **Window-Hedge achieves negative regret** vs best fixed expert in
  non-stationary pools and re-crowns a flipped champion in 16.5 rounds
  (E17); **the echo vulnerability** — outcome-trust cannot see an active
  free-rider — is receipted, with the protocol implication.
- **The pricing mesh runs LLM-free**: 140 cells decide, a listener reflex
  writes its own memory, the vault elects, the gardener prunes. Five honest
  protocol iterations are receipted on the road to learned trust.
- **murmur-protocol-v3 defeats the echo amplification attack** (E19): the
  provenance envelope `{topic, from, origin, p, n, ttl}` + edge-precedence
  attribution collapse one observer's amplified voice mass from 3.55× to
  2.28×, halve window-end trust theft (0.961 → 0.514), recover boundary
  accuracy (+1.5pp), verify relays 24/24, with ZERO persistent false
  convictions in 190 honest runs — while the sheet's pool math stays
  byte-identical (480/480). Two receipted detector-design findings: content
  matching cannot attribute direction (autocorrelation is
  direction-symmetric), and edge COUNT convicts innocents where edge RATE
  does not. See [PROTOCOL-V3.md](./PROTOCOL-V3.md).
- **Graft starvation is structural, not temporal** (E20): coherence-gated
  selection saturates coherence at 1.0, so coherence-raising transplants
  starve at any season length; re-specifying the graft bar to QUALITY blooms
  the operator (17 vs 4 transplants in ×10 seasons) — when a signal
  saturates, change the signal, not the season.

- **Cold-start admission closes the spin-up window** (E21, protocol v3.1): history-less
  copiers held 6.9% of the vote under v3; v3.1's admission + aggregate cap holds them at
  1.0% (8x suppression during the attack; a 30-joiner flood with 71% raw trust stays
  under the 10% cap), honest joiners are admitted in admitWindow+1 rounds and sybils are
  never admitted (0/30) — plus a receipted metric bug: a denominator error MANUFACTURED
  a copy-source conviction that the forensics probe dissolved (0.0208 = 0.25/13).
- **The mesh loses the clean bracket and wins every hard column** (E22): UCB1 beats all
  mesh arms when nothing lies (2.5 vs 7.9 regret), but under adversary the mesh's
  per-round degradation is ~0 vs the arena's 0.032 (its running mean forgets at rate 1/n
  and keeps playing the trapped arm), and as the ration shrinks the mesh is the graceful
  one (K4→K2: ×1.0 vs ×3.0) — arena probes perish with the round; mesh whispers
  accumulate in trust. Corollary receipted: gating trust on resonance HURTS (r reads
  disagreement, not accuracy — E16's null, re-confirmed cross-fleet).
- **Subtree operators open the headroom node metrics lack** (E23): accepted subtree
  transplants 31 vs node-coherence grafts' 1 — E20's structural starvation is an artifact
  of the operator level, not the world; TREE gardener 0.954 vs node-level 0.926 vs
  NOGARD 0.903, and lineage diversity is retained (3.6 structural root-paths).
- **The spin-up ride converts to error exactly when the source lies** (E24): with sybils
  copying a toxic founder (acuity 0.25) instead of the honest expert, v3's clean-tag window
  carries copiers' marginal pool-damage 0.0055/round — and v3.1 cuts it 6.5x (paired
  +0.0046±0.0023, 8/8 seeds). The wave's structural finding: FRACTIONAL ATTRIBUTION ALONE
  FAILS here (damage 0.0082 ≈ v3's) — corroboration starvation: a liar's values match
  nobody's history, so soft echo-scores never rise; ADMISSION CAPS are the load-bearing
  wall. The two halves of v3.1 cover disjoint attacks. Receipted division of labor: the
  soft layer never flags the independent liar (echo-score exactly 0) and trust demotes
  him only glacially (not within 400 rounds at share 0.02) — the protocol's job is to
  not AMPLIFY entrenched liars while trust grinds.
- **The hybrid currency is bounded** (E25): feeding the arena's perishable probe rewards
  into the mesh's durable trust whispers did NOT pay at ration K=4 — hybrids land ~19x
  arena's clean regret (21.3 vs 1.1, meshE 7.4), probing bad arms is paid regret, and
  ttl=1 probe-witnesses DILUTE the pool rather than enrich it. Behaviorally the demotion
  channel still works (hybrids play the trap least: 5.1 vs arena's 37.6). Next seed:
  persistent probe-witness identity, or probes replacing (not adding to) the blind share.
- **Seeds firm the tree verdicts — downward** (E26): at 30 seeds, TREE vs NODE20 is
  directionally real but ~1 SE (paired +0.010±0.011, sign p=0.86) and the TREE>TREEG
  premium FLIPS (TREEG 0.953 ≥ TREE 0.942) — the tree-level view's edge is the
  transplant mechanism (103 subtree transplants vs 4 node-coherence grafts, 26x) and
  structural diversity (3.7 vs 10.2 sprawling root-paths), not the acceptance signal.
  C1's fate may hinge on tree budget (LEG 2 cut by the runtime rule, receipted).
- **The turn exploits its own good history** (E27): a founder honest to t=150 then turning
  toxic holds 7.6% share at turn with 1.91x honest-median trust — and the 0.25x demotion
  bar is NEVER reached within 250 post-turn rounds (8/8 seeds; 0.5x only in 4/8, median
  ~100r). The founder-turn hole is receipted by design: damage is arm-identical across
  v3/v3.1 (protocol layers are founder-blind — self-authored values are novel, non-copied,
  admission-ineligible). The next protocol seed is a founder-velocity guard: reward-
  trajectory change-point detection on entrenched voices. Metric lesson receipted: carried
  poison SHARE is the pool-relevant quantity; absolute protocol-adjusted mass differs 3.9x
  across arms and the pool normalization cancels it.
- **The tree advantage does not scale with budget** (E28, the receipted E26 cut): at 2x
  budget the TREE-NODE20 gap FLIPS (paired -0.024±0.012, 2W/8L) and at 4x it is noise
  (+0.011, p=0.75) — the 1200/2400/4800 trend +0.010 → -0.024 → +0.011 is
  budget-noise-dominated, not widening. The mechanism persists and intensifies (5.9
  transplants/run vs 3.4; sprawl ratio stable at ~2.7), but TREE trades leaf quality for
  canopy structure exactly when NODE20's node-level search still converts steps into
  quality. The tree view is a diversity instrument, not a quality instrument.

## Provenance

See [PROVENANCE.md](./PROVENANCE.md). Engine vendored from
SuperInstance/quilt (play-test-patched core, 8 receipted patches).

## License

MIT — the fleet's canon.
