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
- Rulesets never require nonexistent checks.
- CI permissions are least privilege.
- Provider configuration is not trusted until read back.
- Product code cannot enter SPRYXEL-WO-001.
- Critical authority/base drift invalidates the Context Lock.

## GitHub target
The reference behavior for `main` is PR-only integration, deletion/non-fast-forward protection, resolved review threads, no bypass and required checks that have already proven successful in Spryxel.
