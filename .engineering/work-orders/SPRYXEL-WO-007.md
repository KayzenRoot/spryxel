# SPRYXEL-WO-007 — SPRYXEL-IMP-003 Projects + Canonical Shell/Home

Tracking issue: #26

**Status:** ADMITTED_FOR_EXECUTION  
**Risk:** HIGH_ASSURANCE  
**Repository:** `KayzenRoot/spryxel`  
**Execution base:** `main@704b17f015f2bf0021730779f94bed38c45eeae5`  
**Authorized branch:** `codex/spryxel-wo-007-imp-003-projects-shell`  
**Implementation increment:** `SPRYXEL-IMP-003`  
**GEF:** `@gef-bootstrap/cli@1.1.1`

## OBJECTIVE

Implement the next NECESSARY increment in D-153 / IMPLEMENTATION-SEQUENCE: **Projects + canonical product shell/Home**.

This increment must turn the completed Identity/Tenancy baseline into the first tenant-owned product surface without skipping the authorization boundary. It must prove that an authenticated Spryxel subject can create, list, select and open authorized projects through the canonical API and web shell while another tenant cannot observe or mutate them even by direct identifier.

The implementation must also replace the foundation-only landing experience with the bounded V1 global shell, Home/Command Center, Projects surface and minimal project overview required by the canonical UX contracts. It must not implement downstream product modules that merely appear as future navigation destinations.

## CONTEXT

Canonical state at admission:

- `SPRYXEL-WO-006 / SPRYXEL-IMP-002`: COMPLETE.
- Canonical main base: `704b17f015f2bf0021730779f94bed38c45eeae5`.
- Identity/Auth/Tenant/RLS baseline: COMPLETE.
- WorkOS AuthKit V1: selected external authentication/session provider.
- Spryxel PostgreSQL: canonical internal identity, tenant membership, authorization and RLS authority.
- D-001…D-161 remain normative and unchanged.
- Implementation sequence item 3 is Projects + canonical product shell/Home.
- Pricing remains NOT_FROZEN.
- Benchmarks/COGS remain NOT_RUN / NOT_AVAILABLE.
- Billing, production GPU/model and production object-storage providers remain NOT_FROZEN.
- The next increment after this one is Asset Contract + durable Job backbone and is NOT_ADMITTED.

Canonical UX ownership:

- Global shell owns Home/Command Center, Projects, notifications, developer, billing and account.
- Selected project context owns project overview, DNA, Generate/eligible Studios, Library/Graph, QA and Export.
- This Work Order implements only the shell/context necessary for Home + Projects. Downstream module destinations must remain disabled/empty/not-admitted rather than fabricated.

## SOURCE CHECK / PREFLIGHT

Before mutation:

1. verify exact branch/base against the Context Lock;
2. read all MUST_READ sources completely enough to resolve the implementation boundary;
3. verify D-001…D-161 are unchanged;
4. inspect existing Identity/Tenancy implementation, PostgreSQL RLS model, runtime-role validator, API authentication flow, AuthKit web edge, design tokens and browser/integration harness;
5. run baseline targeted checks before schema/UI mutation;
6. verify there is no unexpected Git drift outside this Work Order;
7. do not add a new external dependency unless existing packages cannot satisfy a requirement.

For every newly introduced direct dependency, if any:

- resolve exact stable version;
- verify Node 22 compatibility/peers;
- verify license and current HIGH/CRITICAL advisories;
- document workspace owner and architectural reason;
- pin exact version;
- no `latest`, wildcard, beta-only dependency or second package manager.

If a new dependency, current source conflict, identity/RLS regression or missing product decision would materially widen this increment, STOP `BLOCKED` rather than inventing a new architecture or product policy.

## SCOPE

### A. Durable Project model

1. Add the minimum Spryxel-owned durable `project` entity in a new forward-only migration.

2. Minimum durable fields:
   - UUIDv7-compatible internal project ID;
   - owning `tenant_id`;
   - `created_by_subject_id`;
   - user-visible project name with bounded validation;
   - created/updated timestamps;
   - only additional fields objectively required by this increment.

3. Project must be tenant-owned. External WorkOS identifiers are not project keys.

4. Do **not** create project-level roles, team invitations, collaboration membership, project settings catalog, DNA tables, asset tables or job tables in this increment.

5. Authorization baseline for this increment:
   - active tenant membership is required for every project read/select operation;
   - project creation is limited to active `OWNER` or `ADMIN` tenant membership;
   - `MEMBER` may list/read/select projects in that tenant but cannot create one;
   - no UI visibility substitutes for these server/database checks.

6. Project names are presentation data, never authorization keys. Do not use slug/name as canonical ownership proof.

### B. PostgreSQL authorization / RLS

7. Enable and FORCE RLS on the project table.

8. RLS must default deny when subject/tenant context is absent.

9. Reads must require:
   - transaction-scoped internal subject context;
   - exact active tenant membership;
   - exact project tenant match.

10. Inserts must require:
   - exact request tenant context;
   - active OWNER/ADMIN membership;
   - `created_by_subject_id` equal to the authenticated internal subject.

11. Normal `spryxel_app` runtime role must remain restricted/NOBYPASSRLS. Update the runtime-role proof for the new table/privileges and nothing broader.

12. Pooled connections must not leak project/tenant/security context across transactions.

13. Direct-ID cross-tenant access must return no protected data and must not mutate another tenant even if application code supplies the other project UUID.

### C. Project repository/domain boundary

14. Implement project operations through the existing architectural homes:
   - provider/framework-neutral project types/use cases in existing core packages where appropriate;
   - PostgreSQL implementation in `packages/db`;
   - request/response boundary schema in `packages/contracts`;
   - Fastify HTTP orchestration in `apps/api`.

15. Do not create a new package only for organizational aesthetics. Reuse `packages/domain`, `packages/contracts`, `packages/db`, `packages/ui` unless evidence proves a new boundary is necessary.

16. Minimum operations:
   - create project;
   - list current tenant projects;
   - get/open one project by opaque ID;
   - project overview projection sufficient for the shell.

17. Selection is a client/request context, not a new canonical authorization fact. Prefer URL/project-ID context over browser localStorage as authority. Do not persist a “selected project” server setting unless an existing canonical requirement objectively needs it.

18. Do not add update/archive/delete/transfer ownership in this slice unless required to satisfy a canonical acceptance criterion. They are OUT OF SCOPE by default.

### D. API surface

19. Add versioned project endpoints under the canonical product API namespace `/api/v1`.

20. Minimum contract:
   - `GET /api/v1/projects`;
   - `POST /api/v1/projects`;
   - `GET /api/v1/projects/:projectId`.

21. If the existing Identity/Tenancy routes use a historical `/v1` namespace, do not rename or break them in this Work Order. New Projects routes follow the canonical `/api/v1` contract and endpoint migration of older routes is a separate concern.

22. Every project route:
   - authenticates first;
   - resolves the verified external principal to canonical internal subject/tenant;
   - applies membership/role policy before mutation;
   - uses RLS-backed repository access;
   - treats client project/tenant IDs only as selectors;
   - returns Problem Details-compatible safe errors;
   - does not reveal another tenant’s project existence.

23. Project creation must be replay-safe at the HTTP boundary. Require and validate an idempotency key for `POST /api/v1/projects`, scoped to internal subject + tenant + operation. A retry with the same key and same normalized request must return the same durable project. A key reused with a different request body must fail safely without a second project.

24. Store the minimum durable idempotency evidence needed for this mutation. Do not build the general Job/operation backbone from IMP-004.

### E. Audit evidence

25. Record durable audit evidence for successful project creation.

26. Prefer a minimal extension of the existing canonical security/audit record rather than a second generic audit framework. If extending `platform.security_event`:
   - add `project.created` to the bounded event type contract;
   - add an optional internal project reference protected by tenant/subject integrity;
   - never store bearer tokens, cookies, provider secrets or raw provider errors;
   - preserve existing `identity.bootstrap` and `session.revoked` invariants.

27. Ordinary project list/open navigation does not require a durable audit row solely for page views. Structured request logging/correlation is sufficient unless the operation changes security/business state.

### F. Canonical Global Shell

28. Replace the foundation-only signed-in experience with the bounded canonical global shell.

29. Required global shell affordances:
   - Spryxel identity/home link;
   - Home / Command Center;
   - Projects;
   - project switcher/current-project affordance when a project is selected;
   - account/session access;
   - notifications affordance may be visibly unavailable/empty because durable Notifications are not implemented yet;
   - visible command/search affordance consistent with Ctrl/Cmd+K contract.

30. Do not expose Developer Platform, Billing, Admin/Owner, Generate/Studios, Library/Graph, QA or Export as functional capabilities unless they already have an admitted implementation. They may appear only as clearly disabled/not-yet-available navigation when required to communicate the canonical information architecture; no fake data or fake actions.

31. Web code remains a presentation edge. It must use an explicit API/client boundary and cannot import `packages/db` or make product authorization decisions.

### G. Home / Command Center

32. Authenticated Home must provide:
   - welcome/context;
   - active/selected project when present;
   - primary create/select/resume action;
   - recent/available projects from canonical project data;
   - honest empty state for first run;
   - safe setup/next-action messaging.

33. Do not fabricate durable Jobs. The “recent jobs/status” portion of the canonical wireframe may render an explicit empty/not-yet-available state until IMP-004 introduces the durable Job backbone.

34. Home must distinguish:
   - no projects yet;
   - projects available;
   - loading;
   - dependency degraded/error;
   - permission denied without protected-record leakage.

### H. Projects UX

35. Implement:
   - Projects list;
   - bounded search/filter over already-loaded/listed authorized projects if useful without broadening backend query scope;
   - Create Project minimal dialog/form;
   - project select/open;
   - minimal Project Overview route/surface.

36. Create Project asks only for fields admitted by this Work Order. Do not ask for DNA, generation profile, billing, engine/export or advanced settings.

37. Project overview shows:
   - project identity/name;
   - current tenant/workspace context in safe terms;
   - DNA status as explicitly “not configured” / setup next step without implementing DNA persistence;
   - honest empty recent assets/jobs areas when their backends do not yet exist;
   - navigation skeleton for future project capabilities only where clearly nonfunctional/not admitted.

38. Active project context must remain inspectable without consuming the main workspace.

### I. Accessibility / responsive / theme

39. Preserve existing dark/light semantic token system and reduced-motion behavior.

40. Meet the existing WCAG 2.2 AA planning baseline for the implemented surfaces:
   - semantic landmarks/headings;
   - keyboard operation;
   - visible focus;
   - proper labels/errors;
   - modal/dialog focus behavior if used;
   - non-color-only states;
   - skip link or equivalent;
   - no inaccessible hidden-only action.

41. Full project creation/browse must remain usable below 1024 px as the canonical lightweight/companion behavior.

42. English remains canonical/default. Full pt-BR/ES translation content is not required in this increment unless localization infrastructure already exists, but layout/copy tests must avoid assumptions that break ~35–40% text expansion.

### J. Browser / client security

43. No bearer/access/refresh token may be persisted to localStorage/sessionStorage.

44. Browser tests must prove unauthenticated project surfaces redirect/deny through the existing AuthKit edge.

45. Authenticated deterministic browser strategy must prove Home → Projects → Create → Open/Select transition without live WorkOS credentials. Test-only identity mechanics must remain impossible in production configuration.

## OUT OF SCOPE — HARD STOP

- Spryxel DNA schema/versioning/editor beyond a not-configured/setup CTA;
- Generate/Character/World/Tileset/Items & Props implementation;
- Asset Library, Asset Graph, QA Center, Export implementation;
- Asset Contract or durable Job/Attempt backbone;
- Jobs/Queue product schema or worker consumer;
- credits, billing, wallet, ledger, CostGuard, RevenueShield;
- TrustShield graph/scoring, Turnstile, multi-account, trial/promotion/referral policy;
- API key/MCP OAuth implementation;
- project-level role designer, team collaboration or invitation workflow;
- project update/archive/delete/ownership transfer unless explicitly required by a failing acceptance criterion;
- AI/model/GPU runtime;
- production provider selection;
- production deployment;
- commercial pricing/credit freeze;
- broad admin console;
- WorkOS/provider replacement;
- D-001…D-161 mutation;
- `.gef` / GEF mutation;
- workflow/ruleset/provider mutation;
- source-seed mutation;
- checkpoint promotion by executor;
- next implementation increment.

## FILES / SOURCES TO READ

### MUST_READ

- `.engineering/CHECKPOINT.json`
- `.engineering/CHECKPOINT.md`
- `.engineering/SOURCE-HIERARCHY.md`
- `.engineering/DECISIONS-LEDGER.md`
- `.engineering/SCOPE.md`
- `.engineering/DEFINITION-OF-DONE.md`
- `.engineering/ARCHITECTURE.md`
- `.engineering/REQUIREMENTS.md`
- `.engineering/SECURITY.md`
- `.engineering/DATA-MODEL.md`
- `.engineering/PHYSICAL-DATA-CONVENTIONS.md`
- `.engineering/API-CONTRACTS.md`
- `.engineering/API-FOUNDATION-CONTRACT.md`
- `.engineering/IMPLEMENTATION-ARCHITECTURE.md`
- `.engineering/IMPLEMENTATION-SEQUENCE.md`
- `.engineering/REPOSITORY-TOPOLOGY.md`
- `.engineering/INTEGRATION-CONTRACTS.md`
- `.engineering/TEST-BENCHMARK-PLAN.md`
- `.engineering/DEPLOYMENT.md`
- `.engineering/LOCAL-DEVELOPMENT.md`
- `.engineering/UI-UX.md`
- `.engineering/INFORMATION-ARCHITECTURE.md`
- `.engineering/SCREEN-INVENTORY.md`
- `.engineering/UX-DESIGN-SYSTEM.md`
- `.engineering/UX-FLOWS.md`
- `.engineering/UX-STATE-CONTRACTS.md`
- `.engineering/UX-WIREFRAME-CONTRACTS.md`
- `AGENTS.md`
- existing migrations `0002_identity_tenancy.sql`, `0003_session_revocation_reconciliation.sql`;
- existing identity/db/API/web tests and implementation;
- `package.json`, `package-lock.json`;
- this Work Order and Context Lock.

## REQUIREMENTS

- Preserve D-001…D-161 unchanged.
- Preserve exact GEF 1.1.1 governance state.
- Keep npm as sole package manager and one root lockfile.
- PostgreSQL remains canonical for project state.
- Project IDs are Spryxel-owned UUIDv7-compatible opaque IDs.
- Every project belongs to exactly one Spryxel tenant.
- Active tenant membership is mandatory for project access.
- OWNER/ADMIN may create; MEMBER is read/select-only for this increment.
- Application authorization and PostgreSQL RLS are both required.
- Runtime DB role remains NOBYPASSRLS and least-privileged.
- Missing context fails closed.
- Project IDs/names/client-visible rows never imply authorization.
- Web never imports DB or provider authorization state.
- No project data in localStorage/sessionStorage as an authorization source.
- No fake project/job/asset data presented as canonical.
- Errors/logs/audit remain safe and redacted.
- Final Evidence Bundle/review in PT-BR.

## ARCHITECTURE RULES

- `apps/web`: presentation/routes/API client only.
- `apps/api`: Fastify authentication + authorization orchestration and HTTP transport.
- `packages/contracts`: public-safe project schemas/contracts; no DB/provider SDK.
- `packages/domain`: provider/framework-neutral project use cases/policy types; no Next/Fastify/Drizzle/WorkOS.
- `packages/db`: project migration, repository, RLS and DB transaction context.
- `packages/ui`: reusable presentation primitives only; no server/DB imports.
- No package dependency cycles.
- No direct Web → DB.
- No WorkOS authorization shortcut for project access.
- Existing Identity/Tenancy boundary is reused, not duplicated.
- No general durable Job framework.
- No speculative generic repository/service abstraction unless at least two concrete consumers require it.
- No second CSS/design system or second auth framework.

## ACCEPTANCE CRITERIA

1. Context Lock is FRESH at executor preflight.
2. D-001…D-161 are byte-preserved.
3. Baseline Identity/Tenancy security tests remain PASS.
4. Project migration is forward-only, idempotently tracked and preserves existing applied migrations.
5. Project table uses internal UUID project ID, explicit tenant ownership and creator subject integrity.
6. RLS is ENABLED + FORCED and runtime role cannot bypass it.
7. Missing RLS identity/tenant context returns zero protected project rows and prevents writes.
8. Tenant A cannot read, list, create into or direct-ID access Tenant B projects through real PostgreSQL/app role.
9. MEMBER cannot create; OWNER/ADMIN can create; active MEMBER can list/read/select within own tenant.
10. Suspended/no-membership identity cannot access project data.
11. Pooled connections do not leak subject/tenant/project context.
12. Project creation is idempotent by key+normalized request; replay creates exactly one project.
13. Reusing an idempotency key with a different normalized request fails safely without a second project.
14. Durable `project.created` audit evidence exists exactly once per successful project creation and contains no credential/provider secret.
15. `GET /api/v1/projects` returns only authorized tenant projects.
16. `POST /api/v1/projects` validates name/body/idempotency and enforces OWNER/ADMIN.
17. `GET /api/v1/projects/:projectId` does not reveal another tenant’s project existence.
18. Problem Details-compatible validation/auth/permission/not-found/conflict/dependency errors contain request ID and safe detail.
19. Global shell reflects authenticated state and canonical global/project navigation ownership.
20. Home correctly handles zero projects and one/multiple authorized projects without fake jobs/assets.
21. Projects page supports create/list/open and safe first-run empty state.
22. Project overview keeps project context visible and presents DNA/jobs/assets only as honest unimplemented/empty next-step states.
23. Web uses API boundary and cannot import DB/provider authz implementation.
24. Unauthenticated Home/Projects protected surfaces deny/redirect correctly.
25. Browser authenticated deterministic test covers Home → Projects → Create → Open/Select.
26. Dark/light theme, visible focus, keyboard navigation and reduced motion remain functional.
27. Implemented shell/forms pass accessibility checks in the existing browser test strategy; no obvious WCAG AA blocker remains.
28. Responsive project browse/create is usable in companion/mobile viewport test.
29. No raw access/refresh token/cookie/provider secret appears in browser storage, API body, log fixture or audit row.
30. Architecture checker still passes and catches forbidden Web→DB/provider edges.
31. `format:check`, lint, typecheck and build PASS.
32. Unit tests PASS.
33. Worker regression/smoke remains PASS.
34. Real PostgreSQL/Redis/SeaweedFS integration harness remains PASS.
35. Project-specific real PostgreSQL RLS/idempotency/audit integration tests PASS.
36. Browser tests PASS.
37. Aggregate `npm test` PASS.
38. `npm audit --audit-level=high` has zero unresolved HIGH/CRITICAL relevant findings.
39. Gitleaks, Trivy, Repository validation and Pipeline integrity PASS on exact final head.
40. No unresolved CRITICAL/HIGH finding remains.
41. No hard-out-of-scope module is implemented.
42. Evidence Bundle + proposed Checkpoint Delta are versioned.
43. Executor does not merge or promote checkpoint.

## TESTS / EVIDENCE

Run and record at minimum:

- exact base/head SHA and Context Lock result;
- exact Node/npm versions;
- `npm ci --no-audit --no-fund`;
- clean baseline test snapshot before mutation where practical;
- migration apply/status/idempotency;
- runtime DB-role capability proof including project table;
- project RLS missing-context proof;
- OWNER/ADMIN/MEMBER matrix;
- cross-tenant list/read/direct-ID/insert denial using real PostgreSQL;
- pooled connection context-isolation regression;
- project idempotency same-key/same-body replay;
- same-key/different-body conflict;
- concurrent duplicate create proof;
- durable project.created audit exactly-once proof;
- API validation/auth/authorization/not-found/conflict tests;
- API redaction/no-secret tests;
- Home zero/one/multiple projects tests;
- project create/open browser flow;
- unauthenticated browser guard;
- keyboard/focus/theme/reduced-motion regression;
- responsive companion viewport smoke;
- architecture checker and forbidden import fixture;
- format/lint/typecheck/build;
- unit;
- worker;
- integration with real PostgreSQL/RLS, Redis and SeaweedFS;
- browser;
- aggregate `npm test`;
- `npm audit --audit-level=high`;
- secret scan;
- `git diff --check`;
- exact GEF 1.1.1 assertion;
- `gef doctor --target . --json`;
- two deterministic `gef status --target . --json` reads interpreted under D-0007;
- four required GitHub checks on exact final head;
- SonarQube/other existing repository security-quality gates if they run on the PR;
- changed files + out-of-scope proof.

## DELIVERABLES

- forward-only project migration/RLS;
- project repository/domain/contracts;
- project create/list/get API;
- project-create idempotency boundary;
- project.created durable audit evidence;
- canonical authenticated Global Shell;
- Home / Command Center;
- Projects list/create/select;
- minimal Project Overview;
- deterministic unit/integration/browser regressions;
- architecture boundary regressions;
- `.engineering/evidence/SPRYXEL-WO-007-EVIDENCE.md`;
- `.engineering/checkpoint-deltas/SPRYXEL-WO-007-PROPOSED.md`;
- updated PR description with exact-head evidence.

## REVIEW FORMAT

PT-BR:

- base/head SHA and Context Lock;
- schema/migration/runtime-role delta;
- project authorization/RLS matrix;
- idempotency/concurrency evidence;
- audit evidence/privacy;
- API routes/contracts/errors;
- Home/Projects/Project Overview UX;
- accessibility/responsive/theme;
- architecture boundaries;
- format/lint/typecheck/build/unit/worker/integration/browser/npm-test/audit;
- GitHub/Sonar/security checks;
- changed paths;
- CRITICAL/HIGH/MEDIUM/LOW findings;
- hard-out-of-scope proof;
- proposed Checkpoint Delta;
- candidate verdict `READY_FOR_AUDIT` or `BLOCKED`.

## STOP CONDITION

`SPRYXEL_IMP_003_PROJECTS_CANONICAL_SHELL_HOME_READY_FOR_AUDIT`

Do not merge. Do not promote checkpoint. Do not start Asset Contract/Job or any later increment.
