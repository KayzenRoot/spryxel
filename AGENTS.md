# Spryxel Agent Contract

## Authority
Read in order: `.engineering/CHECKPOINT.json`, Decisions Ledger/ADRs, Scope, Definition of Done, Architecture, Requirements, then specialized canonical sources. Git/code/tests/provider evidence govern descriptive state.

## Executor boundary
Codex executes only an explicitly admitted Work Order and its current Context Lock. Inspect the exact base before mutation. Do not invent missing product decisions or provider selections.

## Current execution
`SPRYXEL-WO-008 / SPRYXEL-IMP-004` is COMPLETE after independent HIGH_ASSURANCE APPROVAL, authorized checkpoint promotion, protected squash merge and exact-main post-merge validation. Its historical Context Lock is stale/closed.

The next NECESSARY slice is Credit Ledger + CostGuard authorization, but it remains `NOT_ADMITTED` until a new Work Order and Context Lock are created from the current main base.

## Safety
No force-push, history rewrite, destructive GitHub mutation, visibility change or executor self-promotion. Checkpoint promotion is an auditor action after objective `APPROVED`, under D-0006. Critical source/base drift makes an execution Context Lock STALE. Missing required permissions means BLOCKED, not weakened controls.
