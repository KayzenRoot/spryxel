# Architecture

Status: SOURCE_PACK_CANDIDATE

## Current architecture boundary
Only the engineering control plane is defined. Product architecture is intentionally TBD.

### Control plane
```
Owner decisions
  -> canonical Source Pack / Checkpoint
  -> Work Order + Context Lock
  -> Codex executor
  -> repository diff + tests
  -> GitHub Actions evidence
  -> provider ruleset/settings read-back
  -> ChatGPT audit
  -> approved Checkpoint Delta
```

## Invariants
- Canonical governance is stored in Git.
- `.gef/` is tracked governed GEF state; `.gef-private/` remains ignored/private runtime state.
- The immutable GEF init/adopt baseline is evidence, not a file to rewrite after ordinary project changes.
- In GEF v1.1.1, the public `status` path compares project state to the recorded baseline with `authorized: false`; therefore a legitimate post-baseline Work Order delta can still be projected as `drift.class=UNEXPECTED`. That raw class is not, by itself, an authorization verdict.
- Authorization of a project delta is established by the canonical Work Order, Context Lock, exact Git diff and Evidence Bundle. Any changed path outside that admitted surface remains a blocker.
- Rulesets never require nonexistent checks.
- CI permissions are least privilege.
- Provider configuration is not trusted until read back.
- Product code cannot enter SPRYXEL-WO-001.
- Critical authority/base drift invalidates the Context Lock.

## GitHub target
The reference behavior for `main` is PR-only integration, deletion/non-fast-forward protection, resolved review threads, no bypass and required checks that have already proven successful in Spryxel.
