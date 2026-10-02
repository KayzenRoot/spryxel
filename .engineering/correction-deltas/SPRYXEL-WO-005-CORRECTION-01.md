# SPRYXEL-WO-005 — Correction Delta 01

Status: CORRECTION REQUIRED  
Work Order: `SPRYXEL-WO-005 R2`  
Increment: `SPRYXEL-IMP-001`  
Audited head: `210e7a453a48637ea1b558d571fedd8d10ca1c42`  
Base: `main@31e6aec13bcc427ec8449d68da1a420979488b06`

## Audit verdict

`CORRECTION REQUIRED`.

The implementation is broadly within scope and the four required GitHub checks passed, but acceptance is not satisfied because the architecture-boundary checker produces a false-green condition for `apps/web/app`. Seven additional bounded correctness/resilience findings are also valid and must be fixed in the same Work Order/PR before re-audit.

No merge or checkpoint promotion is authorized.

## Findings to correct

### C-01 — HIGH — architecture boundary checker misses Next.js App Router source

File: `scripts/check-architecture.ts`

The checker scans only `<workspace>/src`. `@spryxel/web` keeps runtime source under `apps/web/app`, so forbidden-import and private-deep-import rules are not applied to the web code. The current PASS therefore does not prove acceptance criterion 13.

Required correction:
- scan the whole workspace source surface, not only `src`;
- explicitly exclude generated/vendor/output directories such as `node_modules`, `.next`, `dist`, `build`, `coverage`, `test-results`, `playwright-report` and equivalent generated folders;
- preserve the current dependency graph/cycle logic;
- add a regression test/fixture proving a forbidden import placed under a Next.js `app/` path makes the checker fail;
- prove the real repository passes after the regression test exists.

### C-02 — MEDIUM — Redis readiness parser treats partial RESP data as complete

File: `apps/api/src/redis-probe.ts`

The probe splits the entire accumulated buffer and treats any non-empty trailing fragment as a complete reply. Fragmented TCP delivery can falsely fail a valid `+PONG\r\n`, and authenticated multi-reply probes need completed replies preserved across data events.

Required correction:
- preserve only the incomplete trailing fragment in the receive buffer;
- accumulate completed RESP lines separately;
- evaluate errors and the final PING reply only from completed lines;
- add a focused regression test with split response chunks, including authenticated multi-reply delivery.

### C-03 — MEDIUM — BullMQ probe lacks one end-to-end deadline

File: `apps/worker/src/queue-probe.ts`

The configured timeout applies only to `waitUntilFinished`. With `maxRetriesPerRequest: null`, readiness/submission/cleanup can wait beyond the intended bounded probe time when Redis is unavailable.

Required correction:
- enforce one overall deadline across readiness, add, completion and cleanup;
- on deadline, force-disconnect/terminate probe-owned Redis/BullMQ resources so the process cannot hang waiting for recovery;
- add a regression test proving an unavailable/unresponsive Redis target returns within a bounded margin.

### C-04 — MEDIUM — disposable BullMQ queue data can accumulate

File: `apps/worker/src/queue-probe.ts`

`removeOnComplete` removes the successful job, but failed/interrupted probes may leave queue metadata/jobs in a persistent Redis instance.

Required correction:
- stop worker/events before deleting the disposable queue;
- obliterate the uniquely named technical probe queue while its queue connection is still available;
- then close the queue/connections;
- make cleanup best-effort without masking the original probe failure;
- add evidence that repeated probes do not accumulate their disposable queue namespace.

### C-05 — MEDIUM — migration status fails on pristine database

File: `packages/db/src/index.ts`

`getMigrationStatus` directly selects from `public._spryxel_schema_migrations`. Before the first migration this relation does not exist, so a status query fails instead of reporting migrations as unapplied.

Required correction:
- detect whether the migration table exists before selecting it;
- if absent, report all loaded migrations as `applied: false`;
- preserve checksum mismatch behavior once the table exists;
- add a real PostgreSQL regression test on a pristine disposable database.

### C-06 — MEDIUM — saved/preferred theme is applied after first paint

Files: `apps/web/app/layout.tsx`, `apps/web/app/theme-toggle.tsx`

The server emits `data-theme="dark"`; a saved light theme or light OS preference is applied only after the client effect. This causes a visible wrong-theme first paint and weakens the canonical Dark/Light shell contract.

Required correction:
- apply saved/preferred theme before hydration/first paint without creating a second backend;
- avoid hydration warnings/unsafe inline behavior;
- add browser coverage for a persisted light-theme reload and preference fallback.

### C-07 — MEDIUM — theme toggle breaks when browser storage is unavailable

File: `apps/web/app/theme-toggle.tsx`

`localStorage.getItem/setItem` can throw under browser policy/security restrictions. Reads can abort initialization and writes can leave DOM theme and React state out of sync.

Required correction:
- catch storage read/write failures;
- keep document theme and React state synchronized even without persistence;
- add browser/unit coverage proving toggling remains usable when storage access throws.

### C-08 — LOW — API signal shutdown can create unhandled rejection

File: `apps/api/src/main.ts`

If `app.close()` rejects in a SIGINT/SIGTERM handler, the rejection is unhandled and shutdown failure is not logged.

Required correction:
- handle shutdown rejection;
- log a safe structured error;
- set non-zero exit status on failed shutdown;
- add focused coverage if the shutdown logic is factored into a testable helper.

## Evidence corrections

The existing Evidence Bundle says `architecture:check` proves the web forbidden-import boundary. Because C-01 invalidates that proof, the corrected Evidence Bundle must:
- explicitly supersede the audited-head architecture-check claim;
- record the regression test that proves `apps/web/app` is scanned;
- record all eight fixes and focused tests;
- retain exact base/head, dependency/image preflight and hard-out-of-scope proof;
- record the new exact-final-head required checks after the correction push.

## Scope guard

Correction only. Do not:
- add features or new product modules;
- change D-001…D-155;
- change canonical checkpoint;
- change `.gef` / GEF 1.1.1;
- change workflows, ruleset/provider, source seed;
- begin Identity/Tenancy;
- change SeaweedFS/provider choices unless a new security blocker is discovered, in which case STOP BLOCKED.

## Required revalidation

At minimum:
- focused regressions for C-01…C-08;
- `npm run format:check`;
- `npm run lint`;
- `npm run typecheck`;
- `npm run build`;
- `npm run architecture:check`;
- `npm run test:unit`;
- `npm run test:worker`;
- `npm run test:integration`;
- `npm run test:browser`;
- aggregate `npm test`;
- `npm audit --audit-level=high`;
- `git diff --check`;
- GEF 1.1.1 doctor/status evidence under the existing drift policy;
- all four required GitHub checks PASS on the new exact final head;
- zero unresolved review threads.

## STOP CONDITION

Use the original Work Order stop condition only after all corrections pass:

`SPRYXEL_IMP_001_PLATFORM_FOUNDATION_BOOTSTRAP_READY_FOR_AUDIT`

Do not merge. Do not promote checkpoint.
