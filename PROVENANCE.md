# PROVENANCE

- `engine/dist/` — vendored build of `SuperInstance/quilt` `packages/core`
  (play-test working clone, 8 receipted patches incl. listener watch-edge
  wiring, eager mode, program cache-busting, patch-11 context-bound runtime,
  patch-12 memo semantics). Source of truth: github.com/SuperInstance/quilt.
  Vendored unmodified; all mesh behavior lives in `murmur/` + `experiments/`.
- `murmur/receipts.mjs` — ported verbatim from quilt-learn/learn/receipts.mjs
  (itself ported from quilt-cortex/cortex/receipts.mjs — the fleet witness
  idiom, same fnv1a64 chain everywhere).
- `murmur/moth.mjs` — ported from quilt-learn/learn/moth.mjs with the E17
  receipted stream fix (two-stage cross-key counter mode; validated
  mean 0.5009, sd 0.2882, lag-1 ACF 0.001).
- Keys: **env-only doctrine**. `MOTH_KEY` never committed, never logged;
  without it the vault serves a deterministic labeled mock. Typesafe/JEV
  calls (E18) take `TYPESAFE_API_KEY` env and degrade to a labeled mock.
