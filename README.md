# Spryxel

Spryxel is governed by **GEF Bootstrap 1.1.1**.

## Current stage
The repository/GitHub governance bootstrap `SPRYXEL-WO-001` is **COMPLETE**. PR #3 was objectively audited, checkpoint-promoted, squash-merged to `main`, and all four required governance/security checks passed after merge. Product definition and implementation have **not** started.

The next legal stage is Product Discovery planning under a new bounded Work Order and Context Lock.

## Canonical source order
1. `.engineering/CHECKPOINT.json` and `.engineering/CHECKPOINT.md`
2. `.engineering/DECISIONS-LEDGER.md`
3. `.engineering/SCOPE.md`
4. `.engineering/DEFINITION-OF-DONE.md`
5. `.engineering/ARCHITECTURE.md`
6. `.engineering/REQUIREMENTS.md`
7. Remaining Source Pack documents

See `.engineering/SOURCE-HIERARCHY.md` for conflict rules.

## Development handoff
ChatGPT owns architecture/specification/audit and compiles Work Orders. Codex is the implementation/CI executor. GitHub is the task/evidence transport. No product implementation is admitted until Product Discovery and the relevant Source Pack/Work Order explicitly permit it.
