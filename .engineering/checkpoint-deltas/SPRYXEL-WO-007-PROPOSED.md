# SPRYXEL-WO-007 — Proposed Checkpoint Delta

**Status:** PROPOSED_ONLY; NOT_ACCEPTED; NOT_PROMOTED.

## Preconditions for future promotion

Promotion is forbidden until an independent objective audit returns `APPROVED` for the exact final PR head and verifies the full Evidence Bundle.

The future audit must prove at minimum:

- Work Order/Context Lock remained valid;
- project schema/RLS/authorization/idempotency/audit contracts pass;
- canonical shell/Home/Projects behavior satisfies the admitted UX boundary;
- HIGH_ASSURANCE acceptance passes;
- four required GitHub checks pass on the same exact final head;
- no unresolved CRITICAL/HIGH finding remains;
- no hard-out-of-scope module was implemented.

## Proposed semantic delta after APPROVED only

If all gates pass, the checkpoint may record:

1. `SPRYXEL-WO-007 / SPRYXEL-IMP-003` Projects + canonical shell/Home as COMPLETE.
2. The exact audited candidate SHA, promotion SHA, eventual merge SHA and post-merge validation evidence.
3. PostgreSQL project state/RLS and project authorization as canonical implementation.
4. Global Shell, Home/Command Center, Projects list/create/select and minimal Project Overview as canonical V1 implemented surfaces.
5. Identity/Tenancy from WO-006 remains preserved and canonical.
6. D-001…D-161, WorkOS AuthKit, GEF 1.1.1, ruleset/provider/workflows and immutable seed remain unchanged.
7. The next NECESSARY implementation increment becomes Asset Contract + durable Job backbone, but remains `NOT_ADMITTED` until a new Work Order and fresh Context Lock.

## Explicitly prohibited now

- no edit/promotion of `.engineering/CHECKPOINT.json` or `.engineering/CHECKPOINT.md` by executor;
- no merge by executor;
- no Asset Contract/Job implementation;
- no downstream slice;
- no provider/ruleset/workflow/`.gef`/decision-ledger/source-seed mutation.

Current canonical checkpoint remains authoritative until independent approval and authorized promotion.
