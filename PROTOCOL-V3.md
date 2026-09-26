# murmur-protocol-v3 — the provenance envelope (RFC)

> Status: implemented + receipted (E19, 24 seeds, 6/6 claims; `murmur/provenance.mjs`)
> Supersedes: murmur-protocol-v2's wire envelope for in-mesh use
> Doctrine: the protocol is a convention carried by cells, no network required

## 1. The wound this heals

E17's receipt: outcome-trust (Hedge over supervised rewards) never *saw* an
echo — it ranked a plagiarist slightly below its source only by accident of
lag. Worse, E19 shows the sharper attack: an echo BLOCK (source + 3
near-synchronous copies) speaks with **3.55× one observer's true mass** under
plain trust-weighted pooling, and drags pool accuracy at every regime
boundary — exactly where diversity matters most. No amount of trust math
fixes this, because trust only sees *rewards*, and copies of a good source
earn good rewards. The fix must live in the protocol layer: **murmurs must
carry provenance, and the bus must police content.**

## 2. The envelope

```
v2:  { topic, from, p, n, ttl }
v3:  { topic, from, origin, p, n, ttl }
                       └── declared original producer (null = "I made this")
```

`origin` is a *claim*, and claims are cheap — so the bus never trusts the
claim alone. It inspects content and issues tags. One rule binds the two
paths:

**A verified claim beats content suspicion.** If a murmur declares an origin
and its content matches that origin's recent history, it is a RELAY — checked
before any plagiarism scan. Declaring "I am re-broadcasting a2" is
self-verifying: if you match a2's history you *are* carrying a2's content,
whatever your motive. Relaying is honest range extension; the protocol makes
it cheap and legal. Plagiarism is *claiming you made what you copied*.

## 3. The four tags

| tag | meaning | influence | trust state |
|---|---|---|---|
| `relay` | declared origin, content verified | ε_relay × trust(origin) = 0.2 × origin's | untouched |
| `echo` | plagiarism convicted (below) | ε_echo × own = 0.15 × own | ×(1−0.15)/round while convicted, floor 0.02 |
| `dup` | flat content that matches someone's past (honest redundancy: two equal eyes colliding at p≈0.5) | ε_dup × own = 0.5 × own | untouched |
| `clean` | no confirmed pattern | own | untouched |

The asymmetry is deliberate: the harm of a false `dup` is bounded by the
correlation itself (their pooled votes barely move when merged); the harm of a
missed `echo` is unbounded (stale copied content gains independent influence
at regime boundaries). So the detector prefers `dup` over `echo` when the
evidence is ambiguous, and `clean` over both when unsure. Tags are reviewed
every round and **unstick** when the copying stops — a reformed plagiarist is
re-reviewed, not branded forever (E19: 72/72 convictions reformed).

## 4. Attribution: two receipted design findings

**Finding #0 — content matching cannot attribute direction.** Within a
regime, every sender's stream is nearly constant, so a source's *present*
matches its copier's *past* as well as vice versa: autocorrelation is
direction-symmetric. Our first detector branded the SOURCE an echo of its own
plagiarist (stable lag, match-rate ≈ 1.0). Only **novelty has direction**: a
regime crossing (edge: |Δv| > θ) appears in the source's stream *before* it
appears in the copy's.

**Finding #1 — edge COUNT convicts innocents; edge RATE does not.** With
per-round signal errors, honest senders run dense error-edge trains between
two fixed levels (their acuity). Two honest experts with equal acuity share
levels exactly, and lag-lucky time coincidences across 6 lags × 11 partners
convict on a 2-edge threshold. The receipted fix: an alignment is not a time
match — it is a **time + value + jump match** (the copy arrives at the same
level with the same jump size), and attribution requires a **rate**: ≥80% of
the sender's edges in a 100-round window must value-align at one (k, L).
A copier reproduces *all* of the source's edges; two honest eyes share none
of their error timings. A reverse-rate check (does k align to j at the same
lag?) plus **root-of-copy-chain preference** (attribute to the cleanest
candidate, not a middleman) complete the test.

Full evidence specification:
- content corroboration: match-rate(v_j, v_k past at L) ≥ 0.8 over 30 rounds
- edge alignment rate ≥ 0.8 over 100 rounds, ≥ 2 aligned edges
- alignment = same round-lag L ∈ 1..6, |Δv| within 0.03 at edge, same jump
- reverse rate must be strictly lower (no mutual conviction)

## 5. What the sheet sees: nothing

The sheet's pool formulas are byte-identical across all arms. Provenance only
changes **what weights arrive at the w.\* cells**. This is v2's own doctrine
one layer deeper: the protocol is a convention over cell values; inference
math stays pure. E19 verified sheet ≡ reference pooling 480/480 across arms.

## 6. Receipts (E19, 24 seeds × 400 rounds × 13 voices)

| claim | result |
|---|---|
| C1 amplification: one observer's voice mass | 3.55× under plain trust → 2.37× (v3) → 2.28× (v3+penalty) — CONFIRMED |
| C2 theft: echo/source trust at window end | 0.961 under plain trust → 0.514 under v3+penalty (floor-bound) — CONFIRMED |
| C3 boundary price: accuracy at regime flips | 0.705 → 0.720 (+1.5pp) — CONFIRMED |
| C4 relay economics: honest relay rides origin's trust | 24/24 seeds verified — CONFIRMED |
| C5 detector honesty: persistent FPs on honest senders | 0 in 190 runs (2 transient `dup`, self-cleared) — CONFIRMED |
| C6 sheet untouched | 480/480 verifications — CONFIRMED |

Residual amplification (>1) is honest detection latency: conviction needs
≥2 value-aligned novelty events, ≈ 96 rounds after the attack starts in a
world where novelty comes every ~50 rounds. **Declared origin is the fast
path (≈31 rounds, content-only); edge attribution is the slow, claim-free
path.** Protocol implication: senders who want cheap, instant treatment
should DECLARE origins — the protocol rewards honesty with speed.

## 7. Open problems

1. **Latency vs damage**: ~96 rounds of undiscounted amplification before
   conviction. Candidate lever: admission control for brand-new senders
   (cold-start influence cap) — untested.
2. **Slow-lag copies**: lag > maxLag (6) is invisible. Raising maxLag is
   O(maxLag) in the scan; likely fine to raise.
3. **Mixed content**: a sender that copies *half* its stream sits under the
   rate bar. Fractional attribution (per-murmur, not per-sender) is the
   principled endgame.
4. **Relay laundering**: declaring an origin whose content you also carry is
   indistinguishable from honest relaying — because it *is* relaying. The
   attack that matters is declaring a FALSE origin, which the content
   verification rejects (it only verifies against the declared origin's own
   history).
5. **Graft bars, the E20 lesson** (from the gardener side of the mesh):
   operator acceptance predicates must be specified against what selection
   actually saturates. Coherence-gated selection saturates coherence; a
   coherence-raising graft starves STRUCTURALLY, at any season length. The
   receipted fix (quality-raising grafts) is the same operator with an
   honest bar — the same class of fix as replacing reward-trust with
   provenance: when a signal saturates, change the signal, not the season.


## v3.1 addendum — admission + fractional influence (E21, receipted)

The v3 envelope is unchanged; two bus-side layers compose over Provenance
(`murmur/admission.mjs`; provenance.mjs untouched):

1. **Fractional per-murmur attribution.** Influence multiplier
   `m = (1 - s_j) * (alpha + (1 - alpha) * n_j)` with a continuous echo-score
   `s_j` (EWMA of corroborated edge-alignment rate, MIRROR-GUARDED: a
   conviction requires strict directional dominance — ported from the v3 hard
   layer's finding #2) and per-murmur value-novelty `n_j` vs the present
   crowd. Hard tags remain as backstop CAPS on the extremes.
   RECEIPTED: the fractional floor is mesh-wide and cancels under
   normalization — correctness is RELATIVE (copiers sink below honest
   voices), never absolute.
2. **Cold-start admission.** Joiners are PROBATIONARY (x epsNew) until
   age >= admitWindow AND >= minEdgesIndep independent novelty edges AND mean
   |p - pooled| <= admitErr; the AGGREGATE probationary influence mass is
   capped at capShare of each round's total (fixed-point redistribution).
   Founders are admitted by acclamation (D1).

Open problems carried forward: the spin-up exposure is influence-real but
error-masked while the copied source is truthful — a toxic-source leg is
needed to price the cap correctly (next round); fractional novelty vanishes
in dense honest meshes (value-space crowding) — per-murmur direction
(finding #0 all the way down) is the next lever.
