# SPRYXEL-WO-007 — Evidence Bundle

**Status:** EXECUTION_NOT_STARTED  
**Work Order:** `SPRYXEL-WO-007`  
**Increment:** `SPRYXEL-IMP-003`  
**Risk:** `HIGH_ASSURANCE`  
**Tracking issue:** #26  
**Execution base:** `main@704b17f015f2bf0021730779f94bed38c45eeae5`  
**Authorized branch:** `codex/spryxel-wo-007-imp-003-projects-shell`

## Authority / admission

- Canonical checkpoint records `SPRYXEL-WO-006 / SPRYXEL-IMP-002` COMPLETE.
- Next NECESSARY sequence item is Projects + canonical product shell/Home.
- Work Order: `.engineering/work-orders/SPRYXEL-WO-007.md`.
- Context Lock: `.engineering/context-locks/SPRYXEL-WO-007.json`.
- D-001…D-161 are protected and must remain unchanged.
- GEF pin: `@gef-bootstrap/cli@1.1.1`.
- Ruleset/provider/workflows/check contexts are not admitted for mutation.

## Evidence to populate by executor

The executor must replace this placeholder with objective PT-BR evidence for:

- preflight and Context Lock freshness;
- baseline/head SHAs and changed paths;
- dependency preflight if any dependency is added;
- project schema/migration and runtime-role delta;
- RLS and membership authorization matrix;
- idempotency/concurrency proof;
- durable `project.created` audit proof;
- API contract/error/redaction evidence;
- Home/Projects/Project Overview implementation;
- accessibility/responsive/theme/browser evidence;
- architecture boundaries;
- format/lint/typecheck/build/unit/worker/integration/browser/`npm test`/audit;
- GEF doctor/status evidence under D-0007;
- exact-final-head required GitHub checks and existing quality/security gates;
- hard-out-of-scope proof;
- risks/findings and proposed Checkpoint Delta.

No prior SHA checks may be reused as final-head evidence.

## Current verdict

`NOT_READY_FOR_AUDIT`

## STOP CONDITION

`SPRYXEL_IMP_003_PROJECTS_CANONICAL_SHELL_HOME_READY_FOR_AUDIT`

Do not merge. Do not promote checkpoint. Do not start Asset Contract/Job or any later increment.
