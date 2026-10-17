# SPRYXEL-WO-007 — Correction Delta 02

Status: CORRECTION REQUIRED  
Risk: HIGH_ASSURANCE  
Work Order: `SPRYXEL-WO-007`  
Increment: `SPRYXEL-IMP-003`  
Audited candidate head: `a1ab29cc1da1f719e22a399eca1662ecb58aac93`  
Base: `main@704b17f015f2bf0021730779f94bed38c45eeae5`

## Re-audit result

The main IMP-003 implementation is materially strong:

- Correction-01 restored a deterministic real-PostgreSQL integration harness with PGDATA on Linux tmpfs;
- Projects schema, RLS, membership authorization, idempotent creation and `project.created` audit are present;
- Home, Projects and Project Overview are implemented without fabricating downstream Jobs/Assets/DNA state;
- HIGH_ASSURANCE acceptance is recorded PASS under Node `22.23.3` / npm `10.9.9`;
- unit 73/73, worker, real integration, Playwright 10/10, aggregate `npm test`, dependency audit and repository validations passed;
- the four required GitHub checks and SonarCloud Quality Gate pass on the exact audited head;
- the previously open CodeRabbit cookie-store thread was resolved by auditor interpretation without mutating the fingerprint-bound Work Order/Context Lock.

Two bounded findings remain before approval.

## C-02-A — MEDIUM — Web project states collapse authorization/not-found into dependency outage

The Work Order requires Home to distinguish permission-denied/not-found state from dependency degraded/error state without leaking protected records.

Current behavior:

- `fetchProjects()` and `fetchProject()` preserve HTTP status in `ProjectApiError`;
- Home and Projects catch every `ProjectApiError` and render the same “temporarily unavailable” dependency state;
- Project Overview handles 404 as not-found but maps every other thrown error, including non-`ProjectApiError` programmer/control-flow errors, to the same temporary-unavailable UI.

This loses the safe semantic distinction already provided by the API and can misrepresent a denied or unavailable workspace as a transient service outage.

### Required correction

Implement the smallest presentation-layer classification that preserves the existing API and authorization model.

At minimum:

1. `401`: present a safe reauthentication/session-expired path or propagate to the existing auth/session handling; do not label it as dependency outage.
2. `403`: render a safe permission/access-unavailable state without protected project/tenant details.
3. `404`: render safe workspace/project-not-found/unavailable behavior without confirming another tenant’s record.
4. `502/503`: retain the dependency degraded/temporarily unavailable state.
5. unexpected errors that are not `ProjectApiError` must be rethrown to normal Next error handling; do not swallow programmer/control-flow errors.
6. No new backend endpoint or auth provider behavior is required.
7. Do not expose internal API codes, provider messages, tenant identifiers or cross-tenant existence.

Add deterministic tests for Home, Projects and Project Overview proving these distinctions.

## C-02-B — MEDIUM — runtime DB role has an unnecessary UPDATE capability on idempotency mapping

The current migration grants:

`UPDATE (project_id) ON platform.project_create_idempotency TO spryxel_app`

and defines an UPDATE RLS policy for that table. The runtime-role validator explicitly requires this capability.

The current project repository never updates `project_create_idempotency.project_id`; it writes the final mapping once with `INSERT`, then reads it on replay. Therefore the UPDATE capability is not required by the admitted implementation.

For this HIGH_ASSURANCE slice, the canonical idempotency mapping should be immutable after insertion unless a concrete use case proves otherwise. Retaining an unused write privilege weakens least privilege and permits an accidental future query to remap a key to another project in the same authorized tenant.

### Required correction

Because migration `0004_projects.sql` is unmerged/unreleased in this PR, tighten it before canonical merge:

1. remove the UPDATE RLS policy for `project_create_idempotency`;
2. remove the column UPDATE grant on `project_id` for `spryxel_app`;
3. update `validateRuntimePoolRole()` to require SELECT + INSERT only for this table and explicitly prove no UPDATE privilege on any idempotency column;
4. preserve the existing create/replay/concurrent-idempotency behavior unchanged;
5. add a real PostgreSQL integration assertion that a runtime-role direct UPDATE of the mapping is denied while same-key/same-body replay still resolves exactly one project;
6. do not broaden privileges elsewhere to compensate.

## Accepted non-finding — AuthKit cookie-store thread

The resolved CodeRabbit thread on Work Order criterion 29 does not require a Work Order edit.

Auditor interpretation, consistent with WO-007 section J.43 and the already-canonical WorkOS/AuthKit baseline:

- bearer/access/refresh tokens and provider secrets must not be persisted to `localStorage` or `sessionStorage`;
- credential/cookie values and provider secrets must not appear in API bodies, logs, fixtures-as-live-secrets or audit rows;
- HttpOnly/PKCE/session cookies managed by the official AuthKit SDK may exist in the browser cookie store as required by the selected auth flow.

Do not mutate the fingerprint-bound Work Order or Context Lock for this wording clarification.

## Required regression evidence

Preserve all existing IMP-003 and WO-006 regressions and add proof for:

- Home/Projects 403 state is not rendered as dependency outage;
- requested unauthorized/missing workspace/project does not leak record existence;
- 502/503 still renders degraded/unavailable state;
- non-`ProjectApiError` failures are rethrown rather than swallowed;
- Project Overview preserves 404 semantics and distinguishes permission/dependency states safely;
- runtime role cannot UPDATE any `project_create_idempotency` column;
- same-key/same-normalized-body replay remains idempotent;
- concurrent create remains exactly-once;
- same-key/different-body remains conflict without second project;
- `project.created` remains exactly once;
- cross-tenant RLS remains intact;
- Correction-01 tmpfs harness remains deterministic and cleans all disposable resources.

## Acceptance rerun

After C-02-A and C-02-B are satisfied, rerun the complete HIGH_ASSURANCE suite under canonical Node `22.23.3` / npm `10.9.9`:

- `npm ci --no-audit --no-fund`;
- format check using the repository’s canonical Windows/CI line-ending procedure;
- `npm run lint`;
- `npm run typecheck -- --force` or the exact canonical typecheck command used by the repository;
- `npm run build -- --force` or the exact canonical build command used by the repository;
- `npm run architecture:check`;
- `npm run test:unit`;
- `npm run test:worker`;
- `npm run test:integration`;
- `npm run test:browser`;
- `npm test`;
- `npm audit --audit-level=high`;
- `git diff --check`;
- GEF 1.1.1 doctor/status read-only under D-0007;
- four required GitHub checks on the new exact final head;
- SonarCloud Quality Gate on the new exact final head;
- zero unresolved review threads before READY_FOR_AUDIT.

Update the Evidence Bundle and PR description with the new exact head and exact-head checks. Do not reuse results from `a1ab29cc1da1f719e22a399eca1662ecb58aac93` after code changes.

## Scope guard

Do not:

- edit the fingerprint-bound Work Order or Context Lock;
- start Asset Contract/Job or any later slice;
- implement DNA/assets/generation/billing/credits/TrustShield;
- change WorkOS/AuthKit selection;
- change D-001…D-161;
- promote checkpoint;
- mutate `.gef`, GEF 1.1.1, workflows, ruleset/provider or source seed;
- add a new dependency unless objectively necessary;
- merge the PR.

## STOP CONDITION

After both findings are objectively satisfied and the complete exact-head evidence passes:

`SPRYXEL_IMP_003_PROJECTS_CANONICAL_SHELL_HOME_READY_FOR_AUDIT`

Do not merge. Do not promote checkpoint. Do not start the next slice.
