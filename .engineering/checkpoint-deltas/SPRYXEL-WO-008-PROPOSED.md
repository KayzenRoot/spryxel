# SPRYXEL-WO-008 — Proposed Checkpoint Delta

**Status:** PROPOSED_ONLY; NOT_ACCEPTED; NOT_PROMOTED.

## Preconditions for future promotion

Promotion is forbidden until an independent objective audit returns `APPROVED` for the exact final PR head and verifies the full Evidence Bundle.

The future audit must prove at minimum:

- Work Order/Context Lock remained valid;
- immutable Asset Contract identity/version contract passes;
- durable PostgreSQL Job/Attempt/idempotency/state-machine contracts pass;
- Redis/BullMQ remains transient and queue loss is reconstructible from PostgreSQL;
- separate worker service identity is least-privilege and validated;
- crash/lease recovery, bounded attempts and cancellation races pass;
- Jobs/Queue monitoring UX satisfies the admitted boundary;
- HIGH_ASSURANCE acceptance passes;
- four required GitHub checks and existing quality/security gates pass on the same exact final head;
- no unresolved CRITICAL/HIGH finding remains;
- no hard-out-of-scope module was implemented.

## Proposed semantic delta after APPROVED only

If all gates pass, the checkpoint may record:

1. `SPRYXEL-WO-008 / SPRYXEL-IMP-004` Asset Contract + durable Job backbone as COMPLETE.
2. Exact audited candidate, promotion, merge and post-merge SHAs/evidence.
3. Versioned immutable Asset Contract envelope/identity as canonical foundation.
4. PostgreSQL Job/Attempt state as canonical; Redis/BullMQ as transient reconstruction-safe projection.
5. Separate least-privilege worker service role and bounded claim/lease/recovery/cancellation semantics as canonical.
6. Jobs/Queue Center and durable Home/Project Overview recent-job states as implemented.
7. All canonical implementation through WO-007 remains preserved.
8. D-001…D-161, WorkOS/AuthKit, GEF 1.1.1, ruleset/provider/workflows and immutable seed remain unchanged.
9. The next NECESSARY increment becomes Credit Ledger + CostGuard authorization foundation, but remains `NOT_ADMITTED` until WO-008 merge/post-merge validation and a fresh Work Order/Context Lock.

## Explicitly prohibited now

- no edit/promotion of canonical Checkpoint by executor;
- no merge by executor;
- no Credit Ledger/CostGuard implementation;
- no inference/model/GPU/provider execution;
- no Asset/DNA/QA/export downstream slice;
- no provider/ruleset/workflow/`.gef`/decision-ledger/source-seed mutation.

Current canonical checkpoint remains authoritative until independent approval and authorized promotion.
