# SPRYXEL-WO-008 — Evidence Bundle

**Status:** EXECUTION_NOT_STARTED  
**Work Order:** `SPRYXEL-WO-008`  
**Increment:** `SPRYXEL-IMP-004`  
**Risk:** `HIGH_ASSURANCE`  
**Tracking issue:** #29  
**Execution base:** `main@08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`  
**Authorized branch:** `codex/spryxel-wo-008-imp-004-asset-contract-jobs`

## Authority / admission

- Canonical checkpoint records `SPRYXEL-WO-007 / SPRYXEL-IMP-003` COMPLETE.
- Next NECESSARY sequence item is Asset Contract + durable Job backbone.
- Work Order: `.engineering/work-orders/SPRYXEL-WO-008.md`.
- Context Lock: `.engineering/context-locks/SPRYXEL-WO-008.json`.
- D-001…D-161 are protected and must remain unchanged.
- GEF pin: `@gef-bootstrap/cli@1.1.1`.
- Ruleset/provider/workflows/check contexts are not admitted for mutation.
- No cost-bearing/generation/model/GPU/provider execution is admitted.

## Evidence to populate by executor

Replace this placeholder with objective PT-BR evidence for:

- preflight and Context Lock freshness;
- baseline/head SHAs and changed paths;
- dependency preflight if any dependency is added;
- migration/app-role/worker-role delta;
- immutable Asset Contract versioning and deterministic hash/caps;
- Job/Attempt state machine;
- idempotency/concurrency/replay;
- durable-before-queue proof;
- Redis loss/rebuild;
- duplicate delivery safety;
- worker claim/Attempt exactly-once;
- forced crash, lease expiry and bounded recovery;
- max-attempt exhaustion;
- queued/running cancellation races;
- RLS and worker cross-tenant/service-role matrix;
- queue/log redaction and no raw contract body in transient payload;
- Job list/detail/cancel API behavior;
- Jobs Center/Home/Project Overview durable states;
- accessibility/responsive/theme/browser evidence;
- architecture boundaries;
- format/lint/typecheck/build/unit/worker/integration/browser/`npm test`/audit;
- GEF doctor/status evidence under D-0007;
- exact-final-head GitHub/Sonar/security-quality gates;
- hard-out-of-scope proof;
- findings/risks and proposed Checkpoint Delta.

No prior SHA check may be reused as final-head evidence.

## Current verdict

`NOT_READY_FOR_AUDIT`

## STOP CONDITION

`SPRYXEL_IMP_004_ASSET_CONTRACT_DURABLE_JOB_BACKBONE_READY_FOR_AUDIT`

Do not merge. Do not promote checkpoint. Do not start Credit Ledger/CostGuard or any later increment.
