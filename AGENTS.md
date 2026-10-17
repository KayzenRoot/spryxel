# Spryxel Agent Contract

## Authority
Read in order: `.engineering/CHECKPOINT.json`, Decisions Ledger/ADRs, Scope, Definition of Done, Architecture, Requirements, then specialized canonical sources. Git/code/tests/provider evidence govern descriptive state.

## Executor boundary
Codex executes only an explicitly admitted Work Order and its current Context Lock. Inspect the exact base before mutation. Do not invent missing product decisions or provider selections.

## Current execution
`SPRYXEL-WO-009 / SPRYXEL-IMP-005` is APPROVED and code-merged at `main@f1ce1df2dad7aabb45dd7d725d31821f30e21a2c`, with canonical COMPLETE effective upon protected merge of auditor-reviewed checkpoint PR #88. The WO-009 Context Lock is historical and must remain stale/closed after this promotion; do not reuse it.

The next NECESSARY slice is Spryxel DNA + Asset core. It remains `NOT_ADMITTED` until a new Work Order and Context Lock are created from the then-current `main` base.

## Safety
No force-push, history rewrite, destructive GitHub mutation, visibility change or executor self-promotion. Checkpoint promotion is an auditor action after objective `APPROVED`, under D-0006. Critical source/base drift makes an execution Context Lock STALE. Missing required permissions means BLOCKED, not weakened controls.
