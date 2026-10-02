# SPRYXEL-WO-006 — Correction Delta 01

Status: CORRECTION REQUIRED  
Risk: HIGH_ASSURANCE  
Work Order: `SPRYXEL-WO-006`  
Increment: `SPRYXEL-IMP-002`  
Audited candidate head: `f51b5a5f3fee9de74a4e635f3212f8797f384752`  
Base: `main@95ae64d1951ca285c67014fcedbb00e74c3d163d`

## Audit verdict

`CORRECTION REQUIRED`.

The candidate is substantially within scope and its exact-head required GitHub checks passed, but HIGH_ASSURANCE acceptance is not satisfied. Two HIGH findings invalidate security-boundary proof; additional bounded correctness, resilience, provider-contract and evidence findings must be corrected before re-audit.

No merge or checkpoint promotion is authorized.

## C-01 — HIGH — API does not fail startup when the runtime DB role can bypass RLS

Files:
- `apps/api/src/main.ts`
- `apps/api/src/server.ts`
- `packages/db/src/index.ts`
- relevant tests

Current behavior:
- `probePostgres()` correctly detects `rolsuper` / `rolbypassrls`;
- that check is used only by `/readyz`;
- `main.ts` binds the HTTP server without proving the configured runtime `DATABASE_URL` uses a NOBYPASSRLS/non-superuser role;
- protected identity routes can therefore execute if a deployment misconfigures `DATABASE_URL` to a migration-owner/superuser URL, even though readiness is red.

This violates the Work Order requirement that normal application runtime cannot bypass RLS and that the boundary fails closed.

Required correction:
1. Create/reuse one bounded runtime database/pool owned by the API process rather than constructing independent identity pools per request.
2. Before binding/listening in any configuration where the identity database is enabled, verify the connected runtime role is:
   - not superuser;
   - not BYPASSRLS;
   - not the migration-owner role where that can be determined;
   - capable of the admitted runtime operations only.
3. If the runtime-role proof fails, startup must fail and the API must not bind/serve protected routes.
4. Preserve a separate migration-owner URL/path for migrations only.
5. Close the shared pool in the Fastify/server shutdown lifecycle.
6. Add integration coverage proving a privileged/migration-owner `DATABASE_URL` is rejected before serving and the restricted `spryxel_app` role is accepted.
7. Preserve transaction-scoped `set_config(..., true)`; prove pooled connections do not leak subject/tenant context across transactions.

## C-02 — HIGH — provider-edge architecture enforcement has a false-green import form

File: `scripts/check-architecture.ts`

The WorkOS detector only recognizes imports containing `from '@workos-inc/...'`. A side-effect import such as:
`import '@workos-inc/authkit-nextjs';`
can bypass the provider-edge rule.

Required correction:
- detect static imports with and without `from`;
- detect dynamic imports/requires if those syntaxes are admitted by the source language/tooling;
- do not create a regex that matches comments/string prose as code if a simple parser/AST check is available;
- add a regression fixture proving an unauthorized WorkOS side-effect import outside approved edges fails;
- prove all legitimate WorkOS imports remain only at admitted edges.

## C-03 — MEDIUM — JWKS/provider infrastructure failures are converted to invalid-token 401

Files:
- `apps/api/src/auth/jwt.ts`
- `apps/api/src/auth/jwt.test.ts`
- `apps/api/src/server.ts`

Current catch logic converts every verification exception except `ERR_JWKS_TIMEOUT` into `InvalidAccessTokenError`. DNS/fetch failures, malformed/unavailable JWKS and other provider infrastructure failures can therefore become 401.

Required correction:
- convert only actual token/JWS/JWT validation failures and no-matching-key cases that semantically mean the presented credential cannot be validated as a valid token;
- propagate provider/network/JWKS infrastructure failures to the API availability path;
- preserve safe 401 for invalid credentials and safe 503 for authentication infrastructure outage;
- add direct tests of `verifyWorkOSAccessToken()` with a key resolver throwing a non-token infrastructure error and a representative JWKS infrastructure error;
- keep response bodies free of provider internals.

## C-04 — MEDIUM — provider session is revoked before local identity/suspension validation and audit durability is fragile

File: `apps/api/src/server.ts`

Current order:
1. provider revoke;
2. local bootstrap/suspension check;
3. audit insert.

Consequences:
- a suspended local identity can trigger the external side effect before local denial;
- a DB failure after provider success can return 503 with no durable `session.revoked` event;
- retry may no longer observe an active provider session, making the audit gap permanent.

Required correction:
- resolve/validate local identity before provider revocation;
- map `identity_suspended` to the canonical 403 before any provider side effect;
- verify session ownership before revoke;
- after confirmed provider revocation, failure to write the audit projection must not falsely tell the client the revoke failed; return success and emit a distinct safe error-level operational event for audit-reconciliation;
- add tests for suspended identity, provider success + audit failure, unowned session and normal success;
- do not log raw provider errors/tokens/cookies.

## C-05 — MEDIUM — identity repository creates a new PostgreSQL pool per request

Files:
- `packages/db/src/index.ts`
- `apps/api/src/server.ts`

`bootstrapIdentity`, `listIdentityMemberships` and `recordSessionRevocation` construct/end a separate `Pool` on each call. This adds TCP/SCRAM/TLS churn and creates an avoidable connection-exhaustion path under concurrent identity traffic.

Required correction:
- use the shared validated API runtime pool/database from C-01;
- repository operations receive/use the shared database/pool;
- preserve transaction boundaries and request-scoped RLS GUCs;
- server shutdown closes the pool exactly once;
- tests prove no RLS context leaks across reused connections.

## C-06 — MEDIUM — WorkOS session listing/revocation checks only one page

File: `apps/api/src/adapters/workos-auth.ts`

The adapter calls `listSessions(..., { limit: 100 })` once. WorkOS documents the session list as paginated with `list_metadata` cursors. A user with more sessions than the first page can receive an incomplete session list and an owned session outside that page cannot be revoked through the current ownership check.

Official contract reference:
- https://workos.com/docs/reference/authkit/session

Required correction:
- implement bounded pagination for session listing/ownership verification using the SDK's documented cursor contract;
- define a sane hard cap/deadline to prevent unbounded provider traversal;
- preserve fail-closed ownership checks;
- add adapter tests with a second page containing the target session and with the cap/deadline reached.

## C-07 — MEDIUM / HIGH_ASSURANCE PROVIDER-CONTRACT GAP — fabricated `amr=mfa` evidence is treated as real MFA proof

Files:
- `apps/api/src/auth/jwt.ts`
- `packages/identity/src/index.ts`
- related tests/evidence

Current implementation reads arbitrary JWT `amr` and tests `['pwd','mfa']` as verified strong-auth evidence.

Current official WorkOS evidence:
- AuthKit reauthentication documents `auth_time` + `max_age` as the step-up mechanism and states every AuthKit access token carries `auth_time`;
- the documented AuthKit session token claim set does not establish an `amr` MFA contract;
- the session API exposes `auth_method`, while hosted AuthKit MFA is a policy/factor flow and explicitly does not apply to SSO users.

References:
- https://workos.com/docs/authkit/reauthentication
- https://workos.com/docs/authkit/sessions
- https://workos.com/docs/reference/authkit/session
- https://workos.com/docs/authkit/mfa

Required correction:
1. Do not treat an undocumented/free-form `amr` claim as verified MFA evidence.
2. Keep `auth_time`/recent-auth based on the documented provider contract.
3. Model strong-auth evidence provider-neutrally and only mark it verified when derived from a documented, trustworthy WorkOS signal/policy path.
4. If no current WorkOS API/token contract can prove MFA use for all relevant auth methods, fail closed: sensitive Owner/Admin actions remain denied for lack of strong-auth evidence and production MFA proof remains an explicit release/deployment gate.
5. Do not weaken D-083/D-160 to make tests pass.
6. Update deterministic fixtures to mirror documented provider claims rather than inventing provider claims.
7. Version the exact remaining production MFA/SSO policy dependency in the Evidence Bundle.

## C-08 — LOW — final-head evidence and Markdown table need deterministic repair

File: `.engineering/evidence/SPRYXEL-WO-006-EVIDENCE.md`

Required correction:
- record the exact audited/correction final SHA and actual final-head required check IDs/URLs in the post-push evidence section after the correction push;
- do not reuse admission-SHA checks;
- escape literal peer-range pipe separators in Markdown tables so the evidence renders with the intended column count;
- keep PR description as the authoritative post-push record while making the versioned bundle internally unambiguous.

## Existing review threads

Do not resolve review threads merely because this delta mentions them. Resolve each thread only after its corresponding code/evidence change exists and has been revalidated.

## Scope guard

Correction only. Do not:
- change D-001…D-161;
- change the selected WorkOS AuthKit provider;
- add Projects/Product Shell;
- add billing/credits/CostGuard/RevenueShield;
- add TrustShield, Turnstile, multi-account graph or promo/trial logic;
- add product jobs/assets/generation/AI/GPU;
- add API keys/MCP OAuth;
- change `.gef`, GEF 1.1.1, source seed, workflows, ruleset/provider;
- promote checkpoint;
- widen roles beyond OWNER/ADMIN/MEMBER;
- silently redefine the production MFA requirement.

If current WorkOS evidence makes a required security property impossible without changing D-156…D-161, STOP `BLOCKED` and return to architect review. Do not improvise a provider contract.

## Required revalidation

At minimum:
- focused regressions for C-01…C-08;
- privileged/BYPASSRLS startup refusal;
- restricted-role startup success;
- pooled-connection RLS context leak test;
- full JWT/JWKS valid/invalid/infrastructure matrix;
- documented-claim fixture compatibility;
- recent-auth + strong-auth fail-closed matrix;
- session pagination/ownership/revoke/audit-failure matrix;
- architecture negative fixture for side-effect WorkOS import;
- real PostgreSQL migrations/idempotency/bootstrap/RLS/cross-tenant suite;
- `npm run format:check`;
- `npm run lint`;
- `npm run typecheck`;
- `npm run build`;
- `npm run architecture:check`;
- `npm test`;
- `npm run test:integration`;
- `npm run test:browser`;
- `npm audit --audit-level=high`;
- `git diff --check`;
- exact GEF 1.1.1 doctor/status evidence under D-0007;
- all four required GitHub checks PASS on the new exact final head;
- zero unresolved review threads.

## Evidence Bundle update

The corrected Evidence Bundle must explicitly record:
- C-01…C-08 disposition;
- runtime DB role startup proof;
- shared-pool lifecycle/RLS non-leak proof;
- JWT infrastructure-vs-invalid-token semantics;
- WorkOS session pagination proof;
- exact documented strong-auth/recent-auth contract and any remaining production MFA gate;
- exact final head and post-push required check IDs/URLs;
- hard-out-of-scope proof.

## STOP CONDITION

Return to the original Work Order stop condition only after all corrections and evidence pass:

`SPRYXEL_IMP_002_IDENTITY_TENANCY_SECURITY_BASELINE_READY_FOR_AUDIT`

Do not merge. Do not promote checkpoint. Do not start Projects/Product Shell.
