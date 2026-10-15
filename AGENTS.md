# Spryxel Agent Contract

## Authority
Read in order: `.engineering/CHECKPOINT.json`, Decisions Ledger/ADRs, Scope, Definition of Done, Architecture, Requirements, then specialized canonical sources. Git/code/tests/provider evidence govern descriptive state.

## Executor boundary
Codex executes only an explicitly admitted Work Order and its current Context Lock. Inspect the exact base before mutation. Do not invent missing product decisions or provider selections.

## Current execution
`SPRYXEL-WO-008 / SPRYXEL-IMP-004` is independently APPROVED on exact code head `fe54bfac66bcb85c10d56c4c8a0c9c7526bec624`; its checkpoint is `APPROVED_PENDING_MERGE`. Merge and post-merge validation are still required before COMPLETE. The WO-008 Context Lock is historical and closes after authorized checkpoint promotion.

The next NECESSARY slice is Credit Ledger + CostGuard authorization, but it remains `NOT_ADMITTED` until WO-008 protected squash merge, exact-main post-merge validation and a new Work Order/Context Lock.

## Safety
No force-push, history rewrite, destructive GitHub mutation, visibility change or executor self-promotion. Checkpoint promotion is an auditor action after objective `APPROVED`, under D-0006. Critical source/base drift makes an execution Context Lock STALE. Missing required permissions means BLOCKED, not weakened controls.
