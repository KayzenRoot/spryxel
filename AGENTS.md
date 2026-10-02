# Spryxel Agent Contract

## Authority
Read in order: `.engineering/CHECKPOINT.json`, Decisions Ledger/ADRs, Scope, Definition of Done, Architecture, Requirements, then specialized canonical sources. Git/code/tests/provider evidence govern descriptive state.

The Product Master v0.6.0 in `.engineering/source-seeds/` is immutable historical migration evidence. It must not be edited and does not supersede the promoted repository Source Pack.

## Executor boundary
Codex is the implementation/test/CI executor. Execute only an explicitly admitted Work Order and its current Context Lock. Inspect the exact base before mutation. Do not invent missing product decisions.

## Current execution
`SPRYXEL-WO-003` is COMPLETE and its historical Context Lock is stale/closed. No product implementation Work Order is active.

The next legal action is a separate implementation-planning Work Order with a new Context Lock. Product implementation is not currently admitted.

## Safety
No force-push, history rewrite, destructive GitHub mutation, visibility change or checkpoint self-promotion. Critical source/base drift makes an execution Context Lock STALE. Missing required permissions means BLOCKED, not weakened controls.
