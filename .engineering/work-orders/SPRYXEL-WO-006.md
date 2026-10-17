# SPRYXEL-WO-006 — SPRYXEL-IMP-002 Identity/Tenancy Security Baseline

Tracking issue: #23

# SPRYXEL-WO-006 — SPRYXEL-IMP-002 Identity/Tenancy Security Baseline

**Status:** ADMITTED_FOR_EXECUTION
**Risk:** HIGH_ASSURANCE
**Repository:** `KayzenRoot/spryxel`
**Execution base:** `main@95ae64d1951ca285c67014fcedbb00e74c3d163d`
**Implementation increment:** `SPRYXEL-IMP-002`
**GEF:** `@gef-bootstrap/cli@1.1.1`

## OBJECTIVE

Implement the first real identity, authentication, tenancy, authorization and PostgreSQL RLS boundary required before downstream product records exist.

Use WorkOS AuthKit as the V1 external human authentication/session provider under D-156…D-161, while keeping Spryxel PostgreSQL canonical for internal identity mapping, tenants, memberships, product roles/permissions, resource ownership and RLS.

This increment must prove that:
- external authentication can resolve to an internal Spryxel principal;
- authorization does not trust UI state or provider organization claims as canonical product authority;
- cross-tenant access fails at both application and database/RLS layers;
- session/re-auth/security controls are explicit and safe;
- provider coupling remains at adapter/edge boundaries;
- provider credentials are not required for deterministic local/CI authorization tests.

## CONTEXT

Canonical checkpoint:
- SPRYXEL-WO-005 / IMP-001 COMPLETE.
- Platform foundation COMPLETE/CANONICAL.
- Next legal stage: Identity/Tenancy security baseline.
- Auth provider: WORKOS_AUTHKIT_V1_SELECTED.
- D-001…D-161 are normative.
- Pricing, billing provider, GPU/model provider and production object-storage provider remain NOT_FROZEN.

Provider decision:
- D-156: WorkOS AuthKit selected for V1 external human auth/session.
- D-157: Spryxel PostgreSQL owns tenant authorization.
- D-158: internal UUIDv7-compatible identity; provider IDs are external refs.
- D-159: Fastify independently validates JWT/JWKS + issuer/audience/expiry/subject.
- D-160: revocable sessions + step-up; Owner/Admin MFA remains mandatory.
- D-161: deterministic local JWT/JWKS + real PostgreSQL RLS tests; no production fake identity provider.

## PREFLIGHT — MUST COMPLETE BEFORE PRODUCT DEPENDENCY INSTALL

Re-read current sources and current provider/package evidence.

For every newly introduced direct dependency:
1. resolve exact current version;
2. verify Node 22 compatibility and peers;
3. verify license;
4. verify current npm/GitHub security advisories;
5. document exact workspace owner and architectural reason;
6. pin exact version; no floating `latest`, `*`, speculative packages or second package manager.

For WorkOS specifically:
- re-check current AuthKit pricing/production terms;
- re-check current WorkOS Node SDK and AuthKit Next.js SDK versions;
- re-check WorkOS security/session/JWKS/PKCE/CSRF docs;
- verify Node 22 compatibility;
- verify exact package licenses;
- verify no newly published HIGH/CRITICAL issue invalidates the selected integration path;
- do not rely on beta-only SDK behavior unless explicitly justified and approved.

Current evidence snapshot is in `.engineering/AUTH-PROVIDER-PREFLIGHT.md`; do not treat snapshot versions as permanent pins.

If current evidence materially invalidates WorkOS AuthKit or a required dependency, STOP `BLOCKED`; do not silently substitute another auth provider or architecture.

## SCOPE

### Provider-neutral identity boundary

1. Add a bounded identity package only if needed by this Work Order, with provider-free:
   - `AuthenticatedPrincipal`;
   - external subject/session reference types;
   - tenant role/membership types;
   - authorization decision/result types;
   - recent-auth/step-up requirements;
   - identity/session provider ports.

2. Provider SDKs must stay in application/adapter edges. No WorkOS import in `packages/domain`, `packages/contracts` or other provider-neutral core packages.

### WorkOS AuthKit web edge

3. Integrate the official stable AuthKit Next.js App Router path for:
   - sign-in initiation;
   - callback;
   - sign-out;
   - secure sealed/session cookie handling;
   - PKCE/state/CSRF behavior supplied by the official SDK;
   - protected baseline account/identity route or shell state sufficient to prove authenticated browser flow mechanics.

4. Never persist access/refresh tokens in localStorage or sessionStorage.

5. Next.js auth handling is an authentication edge only; no product authorization/business invariants move into Next.js.

6. Do not enable eager/client token exposure unless the Work Order can prove it is necessary. Prefer server-side token handling for the baseline.

### Fastify authentication boundary

7. Add a Fastify authentication pre-handler/plugin that:
   - parses bearer credentials only where required;
   - verifies JWT signature against trusted WorkOS JWKS;
   - validates explicit expected issuer;
   - validates explicit audience/client/resource;
   - validates expiry/not-before where applicable;
   - validates subject presence/type;
   - rejects unsupported/malformed token context;
   - never trusts unverified JWT payloads;
   - emits RFC 9457-compatible safe 401/403 responses;
   - never logs raw tokens, refresh tokens, cookies or provider secrets.

8. API authorization must resolve a verified external subject into an internal Spryxel identity before tenant authorization.

9. Provider `org_id`, role or permission claims cannot alone authorize Spryxel tenant data. They may be recorded/mapped only under explicit local records.

### Canonical identity/tenancy schema

10. Add reviewed forward-only SQL migrations / Drizzle schema for the minimum durable identity/tenancy model.

Required conceptual entities:
- `identity_subject`: internal UUIDv7-compatible identity/account principal;
- `external_auth_identity`: provider + external subject mapping, unique per provider/subject;
- `tenant`: Spryxel-owned tenant/workspace authority boundary;
- `tenant_membership`: subject-to-tenant membership with bounded role;
- `security_event` or equivalent minimal security/audit record needed by this slice.

11. Do not use external WorkOS user/org/session IDs as internal primary keys.

12. Bounded tenant roles for this slice:
- OWNER
- ADMIN
- MEMBER

Do not implement arbitrary dynamic product permissions, project roles or enterprise role designer in this slice.

13. Do not implement invitation/team collaboration workflow in this slice unless strictly required for deterministic tenant bootstrap. Team collaboration remains FUTURE.

14. Add a deterministic/idempotent first-login/bootstrap path sufficient to create or resolve:
- internal identity mapping;
- one initial tenant/workspace where canonical product rules require it;
- OWNER membership;
- corresponding safe audit event.

The bootstrap must be concurrency-safe and replay-safe.

### Application authorization

15. Introduce explicit authorization service/policy for tenant-scoped operations:
- principal must resolve to internal identity;
- active membership required;
- role checks are server-side;
- object/tenant IDs from the client never imply authority;
- UI filtering is never authorization.

16. Add minimal protected API surfaces needed to prove the boundary, such as:
- current principal/profile;
- list current subject's tenant memberships;
- tenant bootstrap/current tenant context;
- session/security information if adapter support is available without widening scope.

Do not implement Projects yet.

### PostgreSQL RLS

17. Enable RLS on tenant-owned/authz tables where applicable.

18. Use a transaction-scoped database security context for the authenticated internal identity/tenant. Do not use interpolated policy SQL or a shared mutable process-global tenant context.

19. App runtime DB role must not bypass RLS. Migration/admin role may own migrations but cannot be the normal request role.

20. Missing identity/tenant context must fail closed.

21. Cross-tenant direct-ID access must fail even when application code attempts a query with another tenant's identifier.

22. Add explicit tests for:
- tenant A cannot read/write tenant B data;
- member cannot perform admin/owner-only mutation;
- no membership = deny;
- missing RLS context = deny;
- same request with correct context succeeds;
- direct SQL through app role remains contained by RLS.

### Sessions / security controls

23. Integrate provider session reference and revocation boundary:
- list/revoke session adapter capability where current provider SDK allows;
- sign-out invalidates provider session/cookie as documented;
- local security/audit projection records only safe references;
- no credential/token storage in audit rows.

24. Implement recent-auth/step-up policy primitive using provider `auth_time` or equivalent verified claim/adapter evidence.

25. Owner/Admin sensitive actions must have a reusable policy gate that can require recent auth/MFA-equivalent evidence. This slice does not need every future admin action; it must prove the gate.

26. No silent impersonation. If provider/dashboard impersonation evidence appears, it cannot be treated as a normal member session without explicit policy/audit.

### Deterministic provider-contract testing

27. Provider credentials are not mandatory for CI.

28. Build deterministic local provider-contract fixtures:
- local JWKS/keypair;
- valid signed WorkOS-shaped access token;
- invalid signature;
- wrong issuer;
- wrong audience;
- expired token;
- missing/invalid subject;
- stale `auth_time`;
- session/provider reference mapping.

29. Local fixture/fake provider code must be test-only and impossible to enable in production configuration.

30. WorkOS staging smoke is OPTIONAL/ADDITIVE when credentials are available. Lack of staging credentials does not waive deterministic security/RLS tests.

### Observability / privacy

31. Add safe auth/security event logging:
- correlation/request ID;
- internal identity/tenant IDs where safe;
- external provider reference only when needed;
- event/reason code;
- no raw tokens/cookies/passwords/secrets;
- no future TrustShield graph/signal details.

32. Preserve LGPD/minimization posture. Do not add device fingerprinting, graph linking, IP-only risk actions or TrustShield scoring in this slice.

## OUT OF SCOPE — HARD STOP

- Projects/product project tables or project CRUD;
- Spryxel DNA, Asset Library/Graph;
- billing, payments, wallet, credits, ledger, CostGuard, RevenueShield;
- TrustShield graph/scoring, multi-account linking, Turnstile integration, promo/trial eligibility;
- generation/assets/jobs as product entities;
- AI/model/GPU runtime;
- API keys/MCP OAuth implementation;
- team collaboration/invitations beyond any strictly internal bootstrap need;
- billing provider selection;
- production object-storage provider selection;
- pricing freeze;
- broad admin console;
- enterprise SSO/SCIM procurement/integration unless required by current AuthKit base flow;
- WorkOS organization roles as canonical Spryxel authorization;
- dynamic permissions designer;
- next implementation slice;
- .gef / GEF mutation;
- workflow/ruleset/provider mutation;
- source-seed mutation;
- checkpoint promotion by executor.

## FILES / SOURCES TO READ

### MUST_READ
- `.engineering/CHECKPOINT.json`
- `.engineering/CHECKPOINT.md`
- `.engineering/SOURCE-HIERARCHY.md`
- `.engineering/DECISIONS-LEDGER.md`
- `.engineering/AUTH-PROVIDER-PREFLIGHT.md`
- `.engineering/SCOPE.md`
- `.engineering/DEFINITION-OF-DONE.md`
- `.engineering/ARCHITECTURE.md`
- `.engineering/REQUIREMENTS.md`
- `.engineering/SECURITY.md`
- `.engineering/API-CONTRACTS.md`
- `.engineering/API-FOUNDATION-CONTRACT.md`
- `.engineering/DATA-MODEL.md`
- `.engineering/PHYSICAL-DATA-CONVENTIONS.md`
- `.engineering/INTEGRATION-CONTRACTS.md`
- `.engineering/IMPLEMENTATION-ARCHITECTURE.md`
- `.engineering/IMPLEMENTATION-SEQUENCE.md`
- `.engineering/RUNTIME-STACK.md`
- `.engineering/TEST-BENCHMARK-PLAN.md`
- `.engineering/DEPLOYMENT.md`
- `.engineering/LOCAL-DEVELOPMENT.md`
- `AGENTS.md`
- `package.json`
- `package-lock.json`
- this Work Order and Context Lock.

## REQUIREMENTS

- Preserve D-001…D-161 unchanged.
- Preserve GEF 1.1.1 exact package and governance scripts.
- Keep npm as sole package manager with one root lockfile.
- WorkOS AuthKit is the selected provider unless current preflight blocks execution.
- Internal identity and tenant keys are Spryxel-owned UUIDv7-compatible opaque IDs.
- PostgreSQL is canonical for tenancy/authorization.
- WorkOS provider identifiers are external references only.
- Provider org/role claims do not bypass local membership/RLS.
- RLS + application authorization are both required.
- App DB role must not bypass RLS.
- Secrets/tokens/cookies never appear in logs, API errors, fixtures committed as live credentials or audit payloads.
- Auth failure paths are safe and fail closed.
- No production fake identity mode.
- No product Project entity in this slice.
- Final review/evidence in PT-BR.

## ARCHITECTURE RULES

- `packages/domain`: no WorkOS/Next/Fastify/Drizzle/provider imports.
- `packages/contracts`: no WorkOS/DB/provider imports.
- identity provider interface/types: provider-neutral.
- WorkOS SDK: edge/adapter only.
- Fastify remains the HTTP authorization control plane.
- Next.js auth edge can manage provider web mechanics, not product authorization/business logic.
- RLS context is request/transaction scoped.
- no database superuser/bypass-RLS role in normal app runtime.
- no provider claim accepted as final tenant authorization without local mapping.
- no circular dependency or private deep import.
- no second package manager or second auth framework.

## ACCEPTANCE CRITERIA

1. Current provider/package preflight is documented and passes.
2. Exact dependency versions are pinned with compatible Node 22/license/security evidence.
3. WorkOS imports appear only in authorized edges/adapters.
4. Internal identity IDs are Spryxel-owned; provider IDs are external mappings.
5. First-login/bootstrap is idempotent/concurrency-safe.
6. Tenant + membership schema exists with reviewed constraints/indexes/FKs.
7. RLS is enabled/forced where applicable and normal app role cannot bypass it.
8. Missing RLS context fails closed.
9. Cross-tenant read/write tests fail as expected through real PostgreSQL.
10. App authorization rejects no-membership and insufficient-role cases before mutation.
11. JWT verifier rejects wrong signature/issuer/audience/expiry/subject.
12. Valid fixture JWT resolves to internal principal deterministically.
13. Access/refresh tokens are not persisted to localStorage/sessionStorage.
14. Protected Fastify routes return safe RFC 9457-compatible 401/403 responses.
15. Web sign-in/callback/sign-out edge compiles and browser smoke covers unauthenticated/protected behavior using deterministic test strategy.
16. Session/revocation adapter behavior is tested without logging credentials.
17. Recent-auth/step-up policy is tested for fresh/stale/missing `auth_time`.
18. Owner/Admin sensitive-policy gate requires the configured strong-auth evidence.
19. No silent impersonation path is admitted.
20. Auth/security logs and audit rows contain no raw credentials/secrets.
21. Architecture checker enforces provider-edge boundaries.
22. format/lint/typecheck/build/unit tests PASS.
23. real PostgreSQL integration/RLS tests PASS.
24. browser security/auth shell smoke PASS.
25. `npm audit --audit-level=high` has no unresolved HIGH/CRITICAL relevant finding.
26. Gitleaks/Trivy/repository/pipeline required checks PASS on exact final head.
27. No unresolved CRITICAL/HIGH audit finding.
28. No hard-out-of-scope feature is implemented.
29. Evidence Bundle + proposed Checkpoint Delta are versioned.
30. Executor stops without merge/checkpoint promotion.

## TESTS / EVIDENCE

Run and record at minimum:
- exact Node/npm versions;
- provider/package preflight table with version/license/engines/security/owner;
- clean `npm ci` from updated lockfile;
- package/workspace graph;
- format check;
- lint;
- typecheck;
- build;
- architecture/boundary check;
- unit tests;
- JWT/JWKS fixture security suite;
- invalid signature/issuer/audience/expiry/subject tests;
- recent-auth/step-up tests;
- provider adapter/session mapping tests;
- real PostgreSQL migration apply/status/idempotency;
- real PostgreSQL RLS cross-tenant test matrix;
- app-role non-bypass proof;
- tenant bootstrap concurrency/replay test;
- protected API 401/403/allowed cases;
- web unauthenticated/protected/callback/sign-out smoke using deterministic test mode;
- secret/redaction tests;
- security-event/audit payload tests;
- `npm audit --audit-level=high`;
- secret scan;
- `git diff --check`;
- exact GEF 1.1.1 assertion;
- `gef doctor --target . --json`;
- two byte-identical `gef status --target . --json` reads under D-0007 interpretation;
- four required GitHub checks on exact final head.

If provider credentials are available, record WorkOS staging smoke separately. Do not block deterministic local/CI authorization tests on absent provider credentials.

## DELIVERABLES

- provider-neutral identity/session boundary;
- WorkOS web/auth adapter edge;
- Fastify JWT/JWKS auth boundary;
- identity/tenant/membership/security-event schema and migrations;
- application authorization service/policies;
- PostgreSQL RLS policies and request transaction context;
- minimal protected API surfaces;
- deterministic JWT/JWKS provider fixtures;
- session/revocation/recent-auth policy adapters/tests;
- browser/auth shell tests;
- real cross-tenant RLS integration suite;
- architecture-boundary checks;
- updated environment examples/config schema;
- `.engineering/evidence/SPRYXEL-WO-006-EVIDENCE.md`;
- `.engineering/checkpoint-deltas/SPRYXEL-WO-006-PROPOSED.md`;
- PR description exact-head evidence.

## REVIEW FORMAT

PT-BR:
- base/head SHA + Context Lock;
- provider/package preflight;
- schema/migrations/RLS;
- JWT/JWKS verification;
- internal identity mapping;
- app authorization matrix;
- cross-tenant evidence;
- session/revocation/step-up evidence;
- privacy/logging/redaction;
- web/API behavior;
- dependency boundary results;
- format/lint/typecheck/build/unit/integration/browser/audit results;
- required GitHub checks;
- CRITICAL/HIGH/MEDIUM/LOW findings;
- hard-out-of-scope proof;
- proposed Checkpoint Delta;
- candidate verdict `READY_FOR_AUDIT` or `BLOCKED`.

## STOP CONDITION

`SPRYXEL_IMP_002_IDENTITY_TENANCY_SECURITY_BASELINE_READY_FOR_AUDIT`

Do not merge. Do not promote checkpoint. Do not start Projects/Product Shell.

