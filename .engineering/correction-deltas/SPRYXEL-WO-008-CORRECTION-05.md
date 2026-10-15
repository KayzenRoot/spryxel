# SPRYXEL-WO-008 — Correction Delta 05

**Status:** IMPLEMENTED — local acceptance passed on the final three-case source tree; exact-HEAD hosted checks pending
**Work Order:** `SPRYXEL-WO-008 / SPRYXEL-IMP-004`
**Risk:** HIGH_ASSURANCE
**Repository / PR:** `KayzenRoot/spryxel` / #30
**Authorized base:** `main@08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`
**HEAD at reproduction:** `5947f86439996c42e70486f18e527e2f1a93927d`
**Context Lock:** `.engineering/context-locks/SPRYXEL-WO-008.json`, `FRESH`; base pins 39/39 and Work Order blob match at preflight.
**Pre-edit fingerprints:** `packages/db/src/index.ts` blob `6fc3cf8b5433d20f725bc0df931b8ec39bcf7789`; `scripts/run-integration.ts` blob `52abec14318bc8399d2bf99edc2882fa0da0b5d8`; Work Order blob `4a74623e75f5de2819e7d912c11d4ac63a23b06e`.

## OBJECTIVE

Reject structurally malformed Job list cursors in the repository decoder before binding them to PostgreSQL, preserving the existing safe API error mapping and microsecond pagination semantics.

## CONTEXT

The shared decoder is used by the global `GET /api/v1/jobs` and project-scoped `GET /api/v1/projects/:projectId/jobs` list paths. It already converts invalid cursor payloads into `DurableJobRepositoryError('job_not_found')`, which the API maps to HTTP 404. Two payload shapes passed its checks and failed later during PostgreSQL parameter casts.

## SOURCE / FINGERPRINTS

- `packages/db/src/index.ts:914-937`: base64url/JSON decoder, timestamp validation and UUID validation.
- `packages/db/src/index.ts:668-730`: cursor is passed to `$3::timestamptz` and `$4::uuid`; PostgreSQL errors are rethrown after rollback.
- `apps/api/src/server.ts:361-424,851-869`: both Jobs list routes call the repository; `job_not_found` maps to 404 while unexpected repository errors map to 503 and an unavailable event.
- `packages/contracts/src/index.ts:144-153`: query accepts a base64url cursor, so both reproduced cursors pass HTTP query validation.

## FINDING

**`SPRYXEL-WO008-F-01` — MEDIUM, API correctness / operational noise.** The decoder accepts a 36-character UUID string with invalid hyphen placement and an ISO-shaped date that JavaScript normalizes to a different calendar date. Both reach PostgreSQL casts; PostgreSQL rejects them, and the authenticated request returns a false `503 job_store_unavailable` rather than the decoder's existing invalid-cursor `404 job_not_found`. This does not expose tenant data or bypass authorization. Repeated requests can create unnecessary database errors and false repository-unavailable logs.

### Reproduction before any product edit

A disposable PostgreSQL 18.6 container was provisioned with the repository's test Compose profile, all eight migrations applied, the restricted `spryxel_app` role used, and an authenticated Fastify route exercised with two cursors:

1. `createdAt=2024-02-29T00:00:00Z`, `id` = 36 hyphens.
2. `createdAt=2024-02-31T00:00:00Z`, valid UUID. The runtime's `Date.parse` normalizes this value to 2024-03-02.

Observed for both: HTTP 503, code `job_store_unavailable`, request ID present. The ephemeral Compose project was torn down with volumes; no product files had been edited at reproduction time. The raw receipt is in the R2 review packet; generated credentials were not logged or retained.

After the first minimal date-roundtrip change and before the correction was committed, a separate PostgreSQL probe showed that `'0000-01-01T00:00:00Z'::timestamptz` is rejected (`date/time field value out of range`), while JavaScript's ISO round-trip preserves year `0000`. This is the same cursor-validation finding and remains within C-05. The final decoder rejects it explicitly and the integration matrix covers it on both list routes.

## SCOPE

Correct only the shared Job cursor validation and add real-service integration regressions that exercise both Jobs list routes and require the established invalid-cursor response.

## OUT OF SCOPE

No database schema/migration change, API contract redesign, tenant/auth changes, WorkOS/proxy/layout changes, new endpoint, pagination redesign, queue/worker behavior change, dependency, workflow, ruleset, GEF, `.gef`, canonical decision, checkpoint promotion, merge, or deploy.

## FILES

- `packages/db/src/index.ts`
- `scripts/run-integration.ts`
- `.engineering/evidence/SPRYXEL-WO-008-EVIDENCE.md`
- `.engineering/correction-deltas/SPRYXEL-WO-008-CORRECTION-05.md`

## REQUIREMENTS

- Require the UUID hex groups and hyphens to match the PostgreSQL UUID text shape; do not add version/variant restrictions PostgreSQL itself does not require.
- Reject timestamps whose parsed UTC calendar date/time does not round-trip to the same year/month/day/hour/minute/second, including year `0000` which PostgreSQL rejects.
- Preserve the original fractional seconds (up to six digits) in the cursor passed to PostgreSQL; JavaScript's millisecond precision must not alter the cursor identity or microsecond ordering.
- Continue returning `job_not_found` for malformed cursor values; keep the API's existing safe HTTP mapping.

## ARCHITECTURE RULES

- PostgreSQL remains canonical; the API application role remains NOBYPASSRLS and least privilege.
- Preserve transaction-local tenant context, cursor ordering `(created_at, id)`, UTC text format, and microsecond pagination.
- No raw cursor, SQL error text, contract, credential or token is added to logs or client responses.

## CONSTRAINTS

- No schema, migration, provider, dependency, external service, queue, business-flow, or protected auth change.
- Keep edits minimal and within the listed files.
- Do not use historical review suggestions or automated review status as a gate; independently verify this finding and use only repository tests and required GitHub checks.

## ACCEPTANCE CRITERIA

1. The three malformed cases (invalid UUID hyphens, normalized calendar date, and PostgreSQL-invalid year `0000`) are rejected before PostgreSQL casts and return HTTP 404 `job_not_found` through the global and project-scoped list endpoints.
2. Existing valid cursor and microsecond-order pagination tests continue to pass.
3. `npm run test:integration` passes on the final source tree using real disposable PostgreSQL/Redis/SeaweedFS; the harness confirms cleanup.
4. Relevant database/API unit tests, full `npm test`, format, lint, typecheck/build, `npm audit --audit-level=high`, and `git diff --check` pass on the correction tree, with actual exit codes recorded.
5. All seven GitHub checks, including four required contexts and Sonar quality, pass on the exact pushed PR HEAD; review-thread state is read back. No merge or checkpoint promotion is performed by the executor.
6. Evidence Bundle records the reproduction, minimal correction, test environment/results and remaining limits; PR #30 remains open.

## TESTS

- Pre-edit reproduction: completed at `5947f86439996c42e70486f18e527e2f1a93927d`; exit 0 as a reproducer, both requests observed the erroneous 503. This is not a post-fix PASS.
- Post-fix: targeted checks passed (16/16); `npm run test:integration` passed with real services and teardown; full `npm test` passed (94 unit, worker smoke, real-service integration, Playwright 20/20); format, lint, typecheck (18/18), build (11/11), audit (zero vulnerabilities), and `git diff --check` passed. Commands and exit codes are recorded in the Evidence Bundle. Exact-HEAD hosted checks remain pending push; unavailable checks will be labeled `NOT_RUN` / `NOT_AVAILABLE`.

## DELIVERABLES

- Minimal cursor validation change and regression coverage in this same WO/PR.
- Updated Evidence Bundle and exact-HEAD PR evidence.
- No checkpoint promotion, merge or release.

## REVIEW FORMAT

PT-BR; include base, pre-fix and final HEAD SHAs; reproduction requests/results; changed paths; date/UUID semantics; test commands, environments, exit codes and duration; exact-hosted check URLs/status; unresolved risks; and verdict `READY_FOR_INDEPENDENT_DECISION`, `CORRECTION REQUIRED` or `BLOCKED`.

## STOP CONDITION

`SPRYXEL_WO008_CORRECTION_05_CURSOR_VALIDATION_READY_FOR_INDEPENDENT_DECISION`
