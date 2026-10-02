# Spryxel Agent Contract

## Authority
Read in order: `.engineering/CHECKPOINT.json`, Decisions Ledger/ADRs, Scope, Definition of Done, Architecture, Requirements, then supporting sources. Git/code/tests/provider evidence govern descriptive state.

## Executor boundary
Codex is the implementation/test/CI executor. Execute only an explicitly admitted Work Order and its current Context Lock. Inspect the exact base before mutation. Do not invent missing product decisions.

## Current execution
`SPRYXEL-WO-001` is approved and has no remaining executor implementation. No product implementation Work Order is currently admitted. Product Discovery planning may be admitted only after the approved governance PR is merged and validated.

## Safety
No force-push, history rewrite, destructive GitHub mutation, visibility change or checkpoint self-promotion. Critical source/base drift makes an execution Context Lock STALE. Missing required permissions means BLOCKED, not weakened controls.

## Completion
Executors must commit/push bounded changes, run required tests, update the PR with an Evidence Bundle and stop at the Work Order STOP CONDITION for ChatGPT audit. Checkpoint promotion is performed only after objective approval.
