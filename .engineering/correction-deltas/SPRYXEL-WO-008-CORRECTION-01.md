# SPRYXEL-WO-008 — Correction Delta 01

Status: CORRECTION REQUIRED  
Risk: HIGH_ASSURANCE  
Work Order: `SPRYXEL-WO-008`  
Increment: `SPRYXEL-IMP-004`  
Audited candidate head: `24afecc852cbe3d56816d2199ee20ebc496eb5a4`  
Execution base: `main@08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`

## Context verdict

The executor BLOCKED screenshot that referenced PR #27 / WO-007 is stale executor context and is **not** the current project state.

Current canonical state verified by auditor:

- PR #27 / WO-007 is closed and merged;
- canonical `main` is `08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`;
- PR #30 / WO-008 is OPEN on the authorized branch;
- WO-008 Context Lock explicitly binds to `main@08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`;
- WO-008 Work Order and Context Lock are the current execution authority;
- the stale WO-007 worktree/context must not be resumed or “corrected”.

Do not reopen PR #27 and do not execute WO-007 Correction Delta 02. That work is historical and complete.

## Current PR #30 audit status

The current PR #30 already contains a substantial IMP-004 implementation and all required GitHub checks plus SonarCloud are green on `24afecc852cbe3d56816d2199ee20ebc496eb5a4`. However the implementation is **not ready for approval** because multiple review findings remain objectively valid and ten review threads remain unresolved after the Work Order route-interpretation thread was resolved by audit.

The following findings are blocking this HIGH_ASSURANCE slice.

## C-01-A — MEDIUM — cancel race degrades to generic error boundary

File: `apps/web/app/jobs/actions.ts`.

The cancel action calls `cancelJob()` without handling `JobApiError`. A Job can become terminal or the store can transiently fail between rendering the cancel control and form submission. The action then throws into the generic Next error boundary instead of returning the user to the durable Job detail/current state.

Required correction:

1. handle only verified `JobApiError` from `cancelJob`;
2. redirect back to the same Job detail so current durable state is rendered;
3. preserve propagation of unexpected/non-API errors;
4. add deterministic regression coverage for terminal-race and transient Job API failure.

## C-01-B — MEDIUM — Jobs page validates project errors with the wrong error type

File: `apps/web/app/jobs/page.tsx`.

`fetchProjects()` throws `ProjectApiError`, but the catch path validates it through `assertJobApiError`. This collapses project 403/404 into a 503-style dependency outage and may hide unexpected errors.

Required correction:

1. validate project-list failures with the project API error type/assertion;
2. preserve exact safe 401/403/404/502/503 semantics already established by WO-007;
3. rethrow unexpected errors;
4. add regression tests.

## C-01-C — MEDIUM — BullMQ blocking connection can be killed by ioredis commandTimeout and queue/worker errors are silently discarded

File: `apps/worker/src/durable-jobs.ts`.

The worker blocking Redis connection is duplicated with `commandTimeout: 1000`. BullMQ workers rely on blocking Redis commands; an ioredis command timeout can spuriously terminate/interrupt a healthy blocking wait. In addition, both Queue and Worker `error` events are currently swallowed by empty handlers.

Required correction:

1. use a dedicated worker/blocking Redis connection compatible with BullMQ blocking semantics and without the short command timeout;
2. keep bounded connect/start/reconciliation behavior elsewhere;
3. report Queue/Worker Redis errors through the existing safe `onOutcome` telemetry path;
4. rate-limit/deduplicate repeated infrastructure error reporting so an outage cannot become an unbounded log storm;
5. no credentials/raw payloads in error telemetry;
6. add deterministic worker/Redis regression coverage.

## C-01-D — MEDIUM SECURITY — production worker unnecessarily requires the application DB credential

File: `packages/config/src/index.ts`.

The generic production `databaseUrl` requirement applies to every service, including `worker`, even though the worker uses the dedicated `workerDatabaseUrl`. This forces the production worker environment to possess the more capable app credential contrary to the admitted least-privilege worker boundary.

Required correction:

1. require `databaseUrl` in production only for the API/web-facing service paths that actually use it;
2. for `serviceName === 'worker'`, require `workerDatabaseUrl` and do not require/expose the app DB credential;
3. preserve production fail-closed config validation;
4. add config tests proving worker production config succeeds without `databaseUrl` and fails without `workerDatabaseUrl`.

## C-01-E — MEDIUM — Job cursor truncates PostgreSQL timestamp precision

File: `packages/db/src/index.ts`.

The Job list cursor is built with `Date#toISOString()`, truncating PostgreSQL microseconds to milliseconds. Composite pagination using `(created_at, id) < (cursor_timestamp, cursor_id)` can therefore skip rows created inside the discarded microsecond range.

Required correction:

1. preserve full PostgreSQL timestamp precision in the cursor representation;
2. keep stable `created_at DESC, id DESC` ordering;
3. ensure cursor decode/validation remains bounded and safe;
4. add a real PostgreSQL pagination test with multiple Jobs inside the same millisecond but different microseconds proving no skip/duplication.

## C-01-F — MEDIUM — Asset Contract size limit is measured over different byte representations in domain and PostgreSQL

Files:

- `packages/domain/src/index.ts`;
- `packages/db/src/migrations/0005_asset_contract_jobs.sql`.

The compiler limits the compact canonical JSON bytes, while PostgreSQL currently measures `p_specification::text`, whose jsonb textual rendering can contain different whitespace/representation. A contract accepted by the compiler near the boundary can be rejected by the DB.

Required correction:

1. choose one exact canonical byte representation for the 65,536-byte limit;
2. enforce the same representation at domain and DB boundary;
3. do not weaken/remove the DB invariant;
4. keep specification hash bound to the same canonicalized content;
5. add boundary tests just below/at/above the cap through the real PostgreSQL path.

## C-01-G — MEDIUM — compiler accepts PostgreSQL-jsonb-invalid strings/keys and uses inherited-property semantics for normalized-key collision

File: `packages/domain/src/index.ts`.

Current compiler string/key normalization does not reject U+0000 or lone UTF-16 surrogates that PostgreSQL jsonb cannot store. Such user input can escape domain validation and fail later as a generic persistence/dependency error.

The normalized-key duplicate check also uses `normalizedKey in output`, which includes inherited prototype names. Valid JSON object keys such as `__proto__`/constructor-like names can be rejected or behave inconsistently.

Required correction:

1. reject U+0000 and lone UTF-16 surrogates in values and keys during compiler validation;
2. preserve NFC normalization;
3. use null-prototype output or an own-property-only collision test;
4. ensure normalized-key collisions remain rejected deterministically;
5. map all such client-invalid input to the existing safe contract validation category;
6. add unit + persistence-boundary tests.

Also fix the oversized-envelope unit test so it exceeds the total envelope limit using multiple individually valid strings and asserts `specification_too_large`; the current single 65k string hits the per-string 4096-byte limit first and does not test the intended branch.

## C-01-H — MAJOR LOCAL RELIABILITY — existing local Postgres volumes do not receive the new worker role

Files:

- `scripts/local-infra.ts`;
- `infra/postgres/create-app-role.sh`;
- migration `0005_asset_contract_jobs.sql`.

When an existing `.env.local-infra` lacks `DATABASE_WORKER_PASSWORD`, the script appends a generated password but does not provision `spryxel_worker` into an already initialized PostgreSQL data volume. Docker init scripts only run on an empty data directory. The subsequent migration requires the worker role and can fail on an ordinary upgrade of an existing local environment.

Required correction:

1. make `infra:up` idempotently reconcile/provision the restricted `spryxel_worker` role for an existing initialized local database;
2. do not require deleting/resetting the developer database volume;
3. do not grant broader privileges than migration 0005 requires;
4. keep secrets only in ignored/local credential material;
5. add an upgrade-path test or deterministic scripted proof: existing initialized DB without worker role -> infra up/reconcile -> migration succeeds -> role validator proves least privilege.

## C-01-I — MEDIUM TEST ISOLATION — browser Job fixture mutates project state for unrelated scopes

File: `scripts/run-browser-api.ts`.

`jobRepository.list()` calls `ensureJobsProject()` before checking whether the fixture scope is a Jobs scope. Non-Jobs browser scenarios can therefore gain a synthetic project and become order-dependent.

Required correction:

1. return an empty Job list for non-`jobs-*` scopes before creating any Jobs fixture/project;
2. preserve existing Jobs fixture behavior;
3. add/order-shuffle regression proving project counts/empty states are independent of Jobs tests.

## C-01-J — LOW but required for trustworthy evidence — rollback failure can replace the original integration failure

File: `scripts/run-integration.ts`.

The error path performs `ROLLBACK` without protecting the original error. If the connection itself is broken, rollback may throw and obscure the root failure.

Required correction:

- attempt rollback best-effort without replacing the original exception;
- preserve the original error;
- keep cleanup/finally behavior intact.

## Accepted auditor interpretation — global Jobs list route

The resolved review thread requesting a literal `/api/v1/tenants/:tenantId/jobs` Work Order edit does not require mutation.

WO-008 already requires a global/tenant Jobs list with optional project filter and bounded pagination. The current `GET /api/v1/jobs` implementation derives the tenant from authenticated canonical context and accepts an optional `projectId` filter. This is a valid, safer concretization than treating a client-provided tenant path parameter as authorization evidence.

Do not edit the fingerprint-bound Work Order or Context Lock for this point.

## Required regression evidence

After C-01-A through C-01-J are satisfied, prove at minimum:

- cancel terminal-race/transient error returns to durable current Job state;
- project-list 403/404 is not misreported as dependency outage;
- BullMQ worker remains stable through an idle blocking period longer than one second;
- Redis connection outage produces bounded safe telemetry, not silent discard/log storm;
- production worker config works without app DB credential and cannot obtain it through config requirements;
- full-precision pagination returns every Job exactly once across pages;
- canonical contract byte-limit matches domain + real PostgreSQL;
- U+0000/lone-surrogate/key-collision cases fail as client validation, not 503;
- total-envelope size test genuinely exercises `specification_too_large`;
- existing initialized local Postgres upgrades to worker-role support without volume reset;
- non-Jobs browser fixtures do not mutate project inventory;
- integration rollback cannot mask root error;
- all existing IMP-004 idempotency, queue-loss/rebuild, claim/lease/crash recovery, cancellation, RLS and cross-tenant tests remain PASS.

## Acceptance rerun

Rerun the complete WO-008 HIGH_ASSURANCE acceptance under Node `22.23.3` / npm `10.9.9` after all corrections:

- clean install;
- format/lint/typecheck/build/architecture checks;
- unit;
- worker;
- real PostgreSQL/RLS + Redis/BullMQ + SeaweedFS integration;
- crash/lease/recovery/replay/cancellation cases;
- browser;
- aggregate `npm test`;
- `npm audit --audit-level=high`;
- `git diff --check`;
- GEF doctor/status read-only under D-0007;
- update Evidence Bundle and PR description;
- obtain all four required GitHub checks on the **new exact final head**;
- obtain Sonar/Socket existing quality/security gates on that same head;
- zero unresolved review threads before READY_FOR_AUDIT.

Do not reuse checks from `24afecc852cbe3d56816d2199ee20ebc496eb5a4` after code changes.

## Scope guard

Do not:

- reopen or mutate PR #27 / WO-007;
- execute WO-007 Correction Delta 02;
- edit WO-008 Work Order or Context Lock;
- start Credit Ledger/CostGuard or any later slice;
- implement inference/model/GPU/provider execution;
- implement DNA/Asset/QA/export downstream slices;
- change WorkOS/AuthKit;
- change D-001…D-161;
- mutate GEF/.gef, workflows, ruleset/provider or source seed;
- merge PR #30;
- promote checkpoint.

## STOP CONDITION

After every correction above is objectively satisfied and the complete exact-head evidence passes:

`SPRYXEL_IMP_004_ASSET_CONTRACT_DURABLE_JOB_BACKBONE_READY_FOR_AUDIT`

Do not merge. Do not promote checkpoint. Do not start the next increment.
