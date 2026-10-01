# Spryxel Agent Contract

## Authority
Read in order: `.engineering/CHECKPOINT.json`, Decisions Ledger/ADRs, Scope, Definition of Done, Architecture, Requirements, then supporting sources. Git/code/tests/provider evidence govern descriptive state.

## Executor boundary
Codex is the implementation/test/CI executor. Execute only the admitted Work Order and its Context Lock. Inspect the exact base before mutation. Do not invent missing product decisions.

## Current execution
Only `SPRYXEL-WO-001` is admitted. Product code is forbidden in this increment.

## Safety
No force-push, history rewrite, destructive GitHub mutation, visibility change or checkpoint self-promotion. Critical source/base drift makes the Context Lock STALE. Missing required permissions means BLOCKED, not weakened controls.

## Completion
Commit/push bounded changes, run required tests, update the PR with an Evidence Bundle and stop at the Work Order STOP CONDITION for ChatGPT audit.
