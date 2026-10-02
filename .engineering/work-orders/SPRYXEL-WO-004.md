# SPRYXEL-WO-004 — SPR-PLAN-007 Implementation Architecture & Bootstrap Sequence

Tracking issue: #13

# SPRYXEL-WO-004 — SPR-PLAN-007 Implementation Architecture & Bootstrap Sequence

**Status:** APPROVED  
**Risk:** ELEVATED  
**Repository:** `KayzenRoot/spryxel`  
**Execution base:** `main@85173742325fa67fb6b4ea19e62871196eb7c210`  
**Planning increment:** `SPR-PLAN-007`  
**GEF:** `@gef-bootstrap/cli@1.1.1`

## OBJECTIVE

Complete the implementation-planning gate required by the canonical checkpoint before any product code is admitted.

Freeze only the technical decisions necessary to begin the first implementation slice safely: runtime/toolchain, repository topology, web/API/worker boundaries, persistence/migrations, queue/storage adapters, local development profiles, observability, test strategy, API foundation conventions, dependency direction and the ordered implementation sequence.

Produce an implementation-ready specification for the first code increment, `SPRYXEL-IMP-001 — Platform Foundation Bootstrap`, but **do not implement it**.

## CONTEXT

The canonical repository state proves:
- product Source Pack and UX baseline are canonical;
- planning is complete through `SPR-PLAN-006`;
- product implementation is `NOT_STARTED`;
- commercial pricing is `NOT_FROZEN`;
- benchmarks/production COGS are `NOT_RUN / NOT_AVAILABLE`;
- repository currently contains governance/docs only, plus the root npm package pinning GEF 1.1.1;
- Node engine baseline is already `>=22`;
- architecture already requires a modular-monolith control plane, PostgreSQL canonical state, provider-neutral workers/adapters, durable jobs, bounded costs, tenant isolation and local-first Docker profiles;
- exact auth provider, queue, object storage, runtime details and physical schema remain open.

This Work Order resolves only decisions required to start code without accidentally coupling product truth to a provider or violating security/economic invariants.

## ARCHITECT DECISIONS TO ESTABLISH

Encode the following stable decisions as D-123 through D-153 in `.engineering/DECISIONS-LEDGER.md`.

### Runtime, repository and frontend

- **D-123 — Primary implementation language/runtime:** Product control-plane, web and worker code use TypeScript on Node.js 22 LTS-compatible runtime. Python remains permitted only inside inference/model tooling where a model/runtime requires it; Python does not own product business invariants.
- **D-124 — Package management:** Preserve npm as the repository package manager with one root lockfile and npm workspaces. Do not introduce pnpm/yarn/bun merely for preference.
- **D-125 — Build/task orchestration:** Use Turborepo-compatible workspace task orchestration/caching for product packages/apps, while npm remains the package manager. Exact package version is pinned only during implementation preflight after compatibility verification.
- **D-126 — Repository topology:** Planned product topology is `apps/web`, `apps/api`, `apps/worker`; shared packages are `packages/contracts`, `packages/domain`, `packages/db`, `packages/config`, `packages/observability`, `packages/ui`, and `packages/testkit`. Add packages only when a Work Order needs them; do not generate empty architecture theatre.
- **D-127 — Web application:** Use Next.js App Router + React + TypeScript for the product web shell. Server-side product invariants remain in API/domain services; Next.js server features cannot become a second business backend.
- **D-128 — UI implementation boundary:** Implement the canonical Spryxel design system with semantic CSS custom-property tokens, Tailwind CSS utility composition and accessible headless primitives such as Radix-compatible primitives. Third-party component templates may accelerate implementation but cannot own Spryxel visual identity or bypass D-090…D-122.
- **D-129 — Web state model:** Remote/server state uses TanStack Query-compatible query/mutation semantics; shareable navigation/filter state prefers URL state; local complex-workspace presentation state may use Zustand-compatible stores. Do not create one global client store as a second product database.
- **D-130 — Localization implementation:** Use a Next.js-compatible ICU/message-catalog i18n layer such as next-intl, with English canonical/default and pt-BR/Spanish catalogs. Pseudo-localization remains a validation mode.

### API, contracts and domain boundaries

- **D-131 — API runtime:** Use Fastify + TypeScript as the modular-monolith HTTP control-plane runtime. Domain packages remain framework-agnostic.
- **D-132 — API foundation contract:** Public/internal HTTP foundation is JSON REST under versioned `/api/v1` paths with OpenAPI 3.1 documentation. Exact product endpoint catalog is not frozen by this increment.
- **D-133 — Boundary schemas:** Zod-compatible versioned schemas are the source of truth for request/response/environment boundary validation and may generate OpenAPI/type artifacts. Database models are not API schemas.
- **D-134 — Error contract:** Use RFC 9457 Problem Details-compatible JSON errors with stable machine-readable Spryxel error codes, correlation/request ID, safe human detail and explicit retryability where applicable. Secrets, antifraud internals and raw provider errors never cross the boundary.
- **D-135 — Mutation/idempotency baseline:** Cost-bearing and replay-sensitive mutations require an idempotency key and return/reuse the durable operation identity on replay. Exact endpoint-specific requirements are refined in their implementation Work Orders.
- **D-136 — Identifier baseline:** New durable product identifiers use UUIDv7-compatible opaque IDs unless an external provider supplies its own immutable identifier. User-visible slugs are aliases, never authorization keys.

### Persistence, queue and storage

- **D-137 — PostgreSQL implementation layer:** PostgreSQL remains canonical. Use Drizzle ORM/Drizzle Kit-compatible typed access plus checked-in SQL migrations. SQL/RLS/index/constraint capabilities may be authored directly when ORM abstractions are insufficient.
- **D-138 — Migration policy:** Schema changes are forward-only, reviewable migrations; no production `db push`/schema-sync shortcut. Destructive migration requires explicit migration/recovery Work Order. Every migration has rollback/roll-forward reasoning appropriate to risk.
- **D-139 — Physical data conventions:** Database names use snake_case; timestamps are UTC `timestamptz`; authoritative credits/money use integer/fixed-precision storage, never floating point; posted ledger facts are immutable and corrected by compensating entries; nullable/soft-delete behavior must be explicit per entity.
- **D-140 — Tenant isolation baseline:** From the first tenant-owned business table, tenancy/project ownership is explicit and protected by application authorization plus PostgreSQL RLS where applicable. UI filtering is never authorization.
- **D-141 — Queue choice:** Redis + BullMQ-compatible queues are the initial transient execution/coordination mechanism. PostgreSQL durable Job/Attempt records remain canonical; Redis/BullMQ state cannot become the only record of a job.
- **D-142 — Object storage choice:** Use an S3-compatible storage abstraction. Local development uses MinIO-compatible object storage; production provider stays replaceable and unfrozen. Product records store object identity/metadata, not provider-specific public URLs.

### Authentication, worker and provider boundaries

- **D-143 — Authentication provider boundary:** Final external auth provider is intentionally NOT FROZEN by SPR-PLAN-007. Auth is represented behind an application identity/session adapter. `SPRYXEL-IMP-001` does not implement real user authentication or production identity tables; auth/provider selection is admitted before the first identity/tenant slice.
- **D-144 — Worker process boundary:** `apps/worker` is a separate Node process consuming transient work references and using shared domain/contracts. Workers cannot mutate billing/ledger/trust invariants except through authorized domain services/transactions.
- **D-145 — External provider discipline:** Billing, auth, GPU and production object-storage providers remain adapters until a triggered Work Order has current terms/compatibility/economic evidence. No provider-specific SDK may leak through domain contracts.

### Configuration, observability and local environment

- **D-146 — Configuration contract:** Environment/configuration is typed and validated at process startup; commit only safe examples/schema, never secrets. Production-required variables fail closed. Provider secrets are injected externally.
- **D-147 — Observability baseline:** Use structured JSON logging (Pino-compatible), correlation/request IDs and OpenTelemetry-compatible traces/metrics. Logs exclude bearer tokens, API secrets, raw payment data and prohibited TrustShield internals.
- **D-148 — Local development profiles:** Core local infrastructure uses Docker Compose profiles designed for 24 GB RAM: PostgreSQL, Redis and MinIO are the minimal infrastructure profile; web/api/worker may run on host for fast HMR or in containers where required. GPU/inference services are separate optional profiles and are not started by default.
- **D-149 — Local/cloud semantic parity:** Local and cloud adapters must preserve the same IDs, contracts, durable-job semantics, cost authorization hooks, QA/provenance shapes and error categories. Development shortcuts may not create an incompatible product model.

### Tests, dependency direction and first slice

- **D-150 — Product test stack:** Use Vitest-compatible unit tests; integration tests execute against real disposable PostgreSQL/Redis/S3-compatible services via a dedicated Docker test profile; Playwright-compatible browser tests cover critical web flows once UI flows exist. Financial/tenant/idempotency invariants require real integration coverage, not mocks alone.
- **D-151 — Dependency direction:** Apps depend inward on shared packages. `domain` has no Next/Fastify/Drizzle/provider imports; `contracts` has no database/provider imports; `db` implements persistence for domain use; `ui` has no server/database imports; provider adapters sit at edges. Circular workspace dependencies are prohibited.
- **D-152 — First implementation slice:** The first code Work Order is `SPRYXEL-IMP-001 — Platform Foundation Bootstrap`. It creates the workspace/topology, web shell scaffold wired to canonical design tokens, API health/readiness foundation, typed config, PostgreSQL migration harness, Redis and S3-compatible adapter health boundaries, structured observability, test harness and product build/lint/typecheck/test commands. It implements **no authentication, business entity, generation, billing, TrustShield scoring, credits, provider procurement or AI model path**.
- **D-153 — Implementation sequence:** After IMP-001, the default NECESSARY sequence is: (2) Identity/Tenancy security baseline; (3) Projects + canonical product shell/Home; (4) Asset Contract + durable Job backbone; (5) Credit Ledger + CostGuard authorization foundation; (6) Spryxel DNA + Asset core; (7) bounded local inference/Generate vertical slice; (8) QA/approval/version/export vertical slice. Each is a separate Work Order and may be recompiled if dependencies/evidence change. IMPORTANT/FUTURE modules do not jump the queue automatically.

## SCOPE

1. Create `.engineering/IMPLEMENTATION-ARCHITECTURE.md`.
2. Create `.engineering/RUNTIME-STACK.md`.
3. Create `.engineering/REPOSITORY-TOPOLOGY.md`.
4. Create `.engineering/PHYSICAL-DATA-CONVENTIONS.md`.
5. Create `.engineering/API-FOUNDATION-CONTRACT.md`.
6. Create `.engineering/LOCAL-DEVELOPMENT.md`.
7. Create `.engineering/IMPLEMENTATION-SEQUENCE.md`.
8. Create `.engineering/FIRST-IMPLEMENTATION-SLICE.md` specifying `SPRYXEL-IMP-001` in executor-ready detail without writing code.
9. Update Decisions Ledger with D-123…D-153 exactly.
10. Update Architecture, Requirements, Data Model, API Contracts, Integration Contracts, Deployment, Test/Benchmark Plan, Backlog, DoD and Source Hierarchy only where needed to align with the approved implementation plan.
11. Produce a dependency-boundary matrix and a decision/open-choice matrix.
12. Produce Evidence Bundle and proposed Checkpoint Delta.

## OUT OF SCOPE

- Any product/runtime source code.
- Creating `apps/*` or `packages/*` directories as code scaffolds.
- Installing product dependencies.
- Changing package.json/package-lock.json except no change should be necessary in this planning increment.
- Choosing/finalizing auth provider.
- Choosing/finalizing billing provider.
- Choosing/finalizing production GPU provider/model.
- Running AI/model benchmarks.
- Freezing public pricing/credit packs.
- Implementing physical product DB tables/migrations.
- Implementing API endpoints.
- Implementing Docker/Compose runtime files.
- Modifying workflows/ruleset/provider.
- Editing `.gef`.
- Executing `SPRYXEL-IMP-001`.

## FILES / SOURCES TO READ

### MUST_READ
- `.engineering/CHECKPOINT.json`
- `.engineering/CHECKPOINT.md`
- `.engineering/SOURCE-HIERARCHY.md`
- `.engineering/DECISIONS-LEDGER.md`
- `.engineering/PROJECT-OVERVIEW.md`
- `.engineering/SCOPE.md`
- `.engineering/DEFINITION-OF-DONE.md`
- `.engineering/ARCHITECTURE.md`
- `.engineering/REQUIREMENTS.md`
- `.engineering/DATA-MODEL.md`
- `.engineering/API-CONTRACTS.md`
- `.engineering/INTEGRATION-CONTRACTS.md`
- `.engineering/SECURITY.md`
- `.engineering/BILLING-ECONOMICS.md`
- `.engineering/TEST-BENCHMARK-PLAN.md`
- `.engineering/DEPLOYMENT.md`
- `.engineering/MODEL-INFERENCE-STRATEGY.md`
- `.engineering/UI-UX.md`
- `.engineering/UX-DESIGN-SYSTEM.md`
- `.engineering/INFORMATION-ARCHITECTURE.md`
- `.engineering/SCREEN-INVENTORY.md`
- `.engineering/UX-STATE-CONTRACTS.md`
- `.engineering/BACKLOG.md`
- `package.json`
- `package-lock.json`
- `AGENTS.md`
- this Work Order and Context Lock.

## REQUIREMENTS

- Preserve D-001…D-122 unchanged.
- Add D-123…D-153 exactly once without semantic weakening.
- Preserve product implementation `NOT_STARTED`.
- Preserve pricing `NOT_FROZEN`.
- Preserve benchmarks/COGS `NOT_RUN / NOT_AVAILABLE`.
- Preserve all V1/V1.x/FUTURE classifications.
- Preserve GEF 1.1.1 and npm root package identity.
- Do not freeze external provider decisions not required by IMP-001.
- The first implementation slice must remain small enough for one audited PR and must not smuggle identity/billing/generation business logic into foundation code.
- Every planned dependency must have a single architectural reason and a bounded owner.
- Exact dependency versions are pinned by the future implementation Work Order after package-registry/compatibility preflight; no floating `latest` instruction is canonical.
- Do not add a microservice split. Modular monolith + separate worker remains canonical.
- Product CI contexts may be planned, but ruleset mutation is a later provider-changing action only after exact contexts have proven PASS.

## ARCHITECTURE RULES

- Domain/business invariants flow inward; frameworks/providers stay at edges.
- PostgreSQL is canonical durable state; Redis/provider/queue state is projection/transient.
- No UI/server-framework shortcut may bypass authorization, RLS, CostGuard, ledger, job or QA invariants.
- API/database schemas are distinct and versioned.
- Worker retries/idempotency cannot duplicate cost reservation or durable operations.
- Local development must fit the known 24 GB RAM / 8 GB VRAM baseline through profiles.
- Foundation code should be boring, observable and replaceable; do not prematurely implement AI complexity.

## CONSTRAINTS

- Documentation/planning only.
- No code, product dependency install, app scaffold, migration or Docker file.
- No `.gef` or GEF change.
- No workflow/ruleset/provider mutation.
- No source-seed edit.
- No external provider procurement.
- No benchmark execution.
- No pricing freeze.
- If base SHA or a critical canonical fingerprint changes unexpectedly, mark Context Lock STALE and stop.

## ACCEPTANCE CRITERIA

1. D-123…D-153 appear exactly once and match this Work Order semantically.
2. D-001…D-122 remain unchanged.
3. Runtime stack and topology are implementation-ready without selecting unnecessary external providers.
4. npm workspaces preserve the existing npm/GEF root instead of introducing a competing package manager.
5. Next.js web, Fastify API and Node worker boundaries cannot become competing business backends.
6. Domain/contracts/db/ui dependency rules are explicit and cycle-free on paper.
7. PostgreSQL/Drizzle migration and RLS conventions preserve canonical state, tenant isolation and financial invariants.
8. Redis/BullMQ remains transient and cannot replace durable Job records.
9. S3-compatible storage remains provider-neutral with MinIO local development.
10. Auth provider is explicitly deferred and IMP-001 does not fake production identity.
11. Typed config/secret rules and observability/redaction are explicit.
12. Docker local profiles fit the hardware baseline and GPU services remain optional/off by default.
13. Test strategy distinguishes unit/integration/E2E and requires real-infrastructure tests for tenant/ledger/idempotency invariants.
14. FIRST-IMPLEMENTATION-SLICE defines an executor-ready IMP-001 with objective scope, out-of-scope, files/topology, tests, evidence, rollback and STOP CONDITION.
15. IMP-001 contains no product business entity/auth/billing/AI generation implementation.
16. Ordered implementation sequence is dependency-driven and preserves HIGH_ASSURANCE gates around identity/tenancy and ledger/CostGuard.
17. package.json/package-lock.json, `.gef`, checkpoint, workflows, ruleset/provider and seed are unchanged by executor.
18. Four existing required GitHub checks PASS on exact final head.
19. No unresolved CRITICAL/HIGH finding.
20. Evidence Bundle and proposed Checkpoint Delta are present; executor does not promote checkpoint or merge.

## TESTS

- Exact base/Context Lock/fingerprint validation.
- Parse decision IDs D-001…D-153: uniqueness; D-001…D-122 preserved; D-123…D-153 present.
- Verify all new stack/tool choices are represented consistently across architecture/runtime/topology/local-dev/test docs.
- Dependency matrix cycle/forbidden-edge check.
- Verify IMP-001 scope contains no auth/business entity/billing/AI/provider implementation.
- Verify package.json and package-lock.json unchanged.
- Verify CHECKPOINT.json/.md, `.gef`, workflows and Product Master seed unchanged.
- Verify status guards: implementation NOT_STARTED, pricing NOT_FROZEN, benchmarks NOT_RUN_NOT_AVAILABLE.
- Verify V1/V1.x/FUTURE classifications unchanged.
- Markdown/JSON structure and internal-link checks.
- `git diff --check`.
- secret-pattern scan.
- `npm ci --ignore-scripts --no-audit --no-fund`.
- exact GEF 1.1.1 assertion.
- `gef doctor --target . --json`.
- two byte-identical `gef status --target . --json`, reconciled under D-0007.
- four required GitHub checks on exact final PR head.

## DELIVERABLES

- `.engineering/IMPLEMENTATION-ARCHITECTURE.md`
- `.engineering/RUNTIME-STACK.md`
- `.engineering/REPOSITORY-TOPOLOGY.md`
- `.engineering/PHYSICAL-DATA-CONVENTIONS.md`
- `.engineering/API-FOUNDATION-CONTRACT.md`
- `.engineering/LOCAL-DEVELOPMENT.md`
- `.engineering/IMPLEMENTATION-SEQUENCE.md`
- `.engineering/FIRST-IMPLEMENTATION-SLICE.md`
- updated canonical-candidate Decisions Ledger and affected sources;
- `.engineering/evidence/SPRYXEL-WO-004-DEPENDENCY-MATRIX.md`
- `.engineering/evidence/SPRYXEL-WO-004-EVIDENCE.md`
- `.engineering/checkpoint-deltas/SPRYXEL-WO-004-PROPOSED.md`
- PR description with exact-head post-push evidence.

## REVIEW FORMAT

Brazilian Portuguese:
- base/head SHA;
- Context Lock;
- D-123…D-153 coverage;
- proof D-001…D-122 preserved;
- stack/topology summary;
- dependency-boundary matrix;
- open provider/benchmark/pricing choices intentionally preserved;
- IMP-001 exact scope and exclusions;
- changed paths;
- local tests/checks PASS/FAIL;
- required GitHub checks;
- CRITICAL/HIGH/MEDIUM/LOW findings;
- proposed Checkpoint Delta;
- verdict candidate `READY_FOR_AUDIT` or `BLOCKED`.

## STOP CONDITION

`SPRYXEL_WO_004_IMPLEMENTATION_ARCHITECTURE_READY_FOR_AUDIT`

Do not implement IMP-001. Do not install product dependencies. Do not merge. Do not promote checkpoint.


## AUDIT CLOSURE

- Objective audit verdict: `APPROVED`.
- Audited execution head: `3a2c7015a90321ad6adc053c3984a3ee2461a770`.
- D-001…D-122 were preserved byte-for-byte; D-123…D-153 were verified exactly once and semantically against this Work Order.
- package.json/package-lock.json, checkpoint, .gef, workflows, ruleset/provider and source seed were unchanged by the executor.
- Required checks on the audited exact head: Repository validation `110845340350`; Pipeline integrity `110845340400`; Gitleaks secrets `110845340454`; Trivy filesystem and configuration `110845340502`; all PASS.
- Unresolved review threads at audit: 0.
- No known CRITICAL/HIGH finding remains.
- `SPRYXEL-IMP-001` remains specified but NOT EXECUTED.
- Canonical checkpoint/document promotion is an auditor action after this approval.
- No further executor action is authorized under this Work Order after promotion.
