# SPRYXEL-WO-005 — SPRYXEL-IMP-001 Platform Foundation Bootstrap

Tracking issue: #17

# SPRYXEL-WO-005 — SPRYXEL-IMP-001 Platform Foundation Bootstrap

**Status:** ADMITTED_FOR_EXECUTION  
**Risk:** ELEVATED  
**Repository:** `KayzenRoot/spryxel`  
**Execution base:** `main@df5304c2e3c0b579989d809a0c54d4de562bdc04`  
**Implementation increment:** `SPRYXEL-IMP-001`  
**GEF:** `@gef-bootstrap/cli@1.1.1`

## OBJECTIVE

Implement the first bounded product-code slice exactly as specified by the canonical `.engineering/FIRST-IMPLEMENTATION-SLICE.md`.

Create a boring, replaceable, observable platform foundation that proves the planned workspace/process boundaries actually build and test:

- npm workspaces with one root lockfile;
- `apps/web` Next.js shell;
- `apps/api` Fastify technical health/readiness foundation;
- `apps/worker` separate Node process boundary;
- non-empty shared packages `contracts`, `domain`, `db`, `config`, `observability`, `ui`, `testkit`;
- PostgreSQL/Drizzle migration harness with technical-only infrastructure migration if needed;
- Redis/BullMQ and S3/MinIO adapter health boundaries;
- typed configuration and redaction;
- structured logging/correlation and OpenTelemetry-compatible hooks;
- bounded local/test Docker Compose profiles;
- unit, real-infrastructure integration and browser-shell smoke test harnesses;
- root lint/format/typecheck/build/test commands and dependency-boundary/cycle checks.

This Work Order admits code for the foundation only. It does not admit any product business feature.

## CONTEXT

The canonical checkpoint records planning complete through SPR-PLAN-007 and identifies `SPRYXEL-IMP-001 — Platform Foundation Bootstrap` as the next legal stage.

Canonical decisions D-123…D-153 control implementation. In particular:
- TypeScript + Node.js 22 LTS-compatible;
- npm workspaces and one root lockfile;
- Turborepo-compatible task orchestration;
- Next.js web, Fastify API, separate Node worker;
- PostgreSQL + Drizzle-compatible typed access + checked-in SQL migrations;
- Redis/BullMQ is transient, never canonical job truth;
- S3-compatible storage with MinIO local;
- typed startup config;
- Pino-compatible structured logging and OpenTelemetry-compatible telemetry;
- real integration infrastructure for tests;
- strict dependency direction;
- no auth/business entities/generation/billing/TrustShield/credits/provider procurement/AI model path in IMP-001.

The repository has no product source code before this Work Order.

## PREFLIGHT — MUST COMPLETE BEFORE PRODUCT DEPENDENCY INSTALL

Record current evidence for every direct product dependency selected.

For each direct dependency:
1. query the registry for the exact available version;
2. verify Node 22 compatibility/engines where published;
3. verify peer-dependency compatibility;
4. record package license;
5. check for known registry/dependency security advisories with available repository tooling;
6. document one architectural reason and bounded owner;
7. pin an exact version in package.json / lockfile; no floating `latest`, `*`, broad speculative direct dependencies or second package manager.

Use the minimum dependency set necessary for this slice. Do not install TanStack Query, Zustand, next-intl, Radix, billing/auth/provider SDKs or inference libraries unless IMP-001 actually exercises them. Canonical compatibility direction does not require speculative packages.

If an exact package/version needed for the canonical architecture is incompatible, materially insecure, unavailable or license-blocked, STOP as `BLOCKED`; do not silently substitute architecture.

## SCOPE

### Root/workspace
1. Preserve root package name `spryxel`, Node `>=22`, GEF 1.1.1 scripts and exact GEF pin.
2. Add npm workspace globs for admitted apps/packages.
3. Keep one root `package-lock.json`; no nested lockfiles.
4. Add exact-version product/tooling dependencies justified by preflight.
5. Add Turborepo-compatible task graph and consistent root scripts:
   - format:check
   - lint
   - typecheck
   - build
   - test
   - test:unit
   - test:integration
   - test:e2e or smoke equivalent
   - boundaries/cycle check
   - local infra up/down/health helpers as appropriate.
6. Add safe committed environment example/schema; never live secrets.

### apps/web
7. Minimal Next.js App Router + React + TypeScript shell.
8. Wire canonical semantic design tokens for Dark/Light; no finished studio/product screens.
9. Use accessible semantic HTML and a minimal shell state; no fake account/project data.
10. Add browser smoke test proving the shell renders, theme tokens load and no obvious accessibility blocker is introduced.

### apps/api
11. Fastify process with:
   - typed config;
   - structured redacted logs;
   - request/correlation ID;
   - `/healthz` liveness;
   - `/readyz` bounded readiness;
   - RFC 9457-compatible technical errors where applicable;
   - no product/business endpoints.
12. Readiness may check enabled technical adapters only and must report safe dependency categories, never secrets/raw provider exceptions.

### apps/worker
13. Separate Node process with typed config, structured lifecycle events and a bounded technical self-test/health command.
14. Do not consume product jobs or implement retry/business semantics.

### shared packages
15. `packages/contracts`: framework/provider-free boundary schemas/types actually used by foundation health/config/error contracts.
16. `packages/domain`: framework/provider-free foundation ports/types only; no product entity/business rule.
17. `packages/db`: PostgreSQL/Drizzle connection boundary + migration harness and technical migration ownership.
18. `packages/config`: typed environment schemas/startup validation/redaction helpers.
19. `packages/observability`: Pino-compatible logger/correlation + OpenTelemetry-compatible interfaces/hooks without mandatory paid backend.
20. `packages/ui`: canonical semantic tokens + minimum reusable accessible shell primitive actually used by web.
21. `packages/testkit`: disposable/local integration resource helpers and deterministic cleanup.

### persistence/adapters/local infra
22. Add PostgreSQL connection and reviewed migration harness. A first migration may contain only technical foundation metadata required by the harness; no user/tenant/project/asset/job/wallet/ledger/business table.
23. No schema-sync/db-push on app startup.
24. Add Redis/BullMQ-compatible adapter interface + bounded connectivity probe only.
25. Add S3-compatible adapter interface + MinIO-backed local/test connectivity probe only.
26. No public buckets/objects, production provider selection or persisted product object metadata.
27. Add bounded Docker Compose `infra` and `test` profiles for PostgreSQL, Redis, MinIO. GPU/inference absent or explicitly opt-in/off; not started by default.
28. Resource defaults must remain reasonable for the canonical 24 GB RAM development baseline.

### architecture enforcement
29. Automate cycle/forbidden-import checks covering D-151.
30. Apps depend inward. Domain/contracts/ui boundaries must not import forbidden server/database/provider layers.
31. Do not create empty packages, placeholder architecture directories without code, or microservices.

## OUT OF SCOPE — HARD STOP

- real authentication/signup/session or auth provider selection;
- user/tenant/project/member tables or product business entities;
- production authorization/RLS policies tied to tenant entities;
- billing, payments, credits, wallet, ledger, CostGuard, RevenueShield;
- TrustShield scoring/risk graph/multi-account logic;
- generation, assets, jobs/attempts as product entities, QA/repair/export;
- AI/model/GPU runtime, model downloads or benchmarks;
- paid provider procurement/configuration;
- production cloud deployment;
- production object-storage/provider choice;
- pricing/credit-pack freeze;
- MCP/CLI product catalogs;
- product database schema beyond technical foundation harness;
- ruleset/provider mutation;
- required-status-context changes;
- GEF or `.gef` edits;
- source-seed edits;
- checkpoint promotion;
- next implementation slice.

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
- `.engineering/TEST-BENCHMARK-PLAN.md`
- `.engineering/DEPLOYMENT.md`
- `.engineering/IMPLEMENTATION-ARCHITECTURE.md`
- `.engineering/RUNTIME-STACK.md`
- `.engineering/REPOSITORY-TOPOLOGY.md`
- `.engineering/PHYSICAL-DATA-CONVENTIONS.md`
- `.engineering/API-FOUNDATION-CONTRACT.md`
- `.engineering/LOCAL-DEVELOPMENT.md`
- `.engineering/IMPLEMENTATION-SEQUENCE.md`
- `.engineering/FIRST-IMPLEMENTATION-SLICE.md`
- `.engineering/UX-DESIGN-SYSTEM.md`
- `.engineering/UI-UX.md`
- `package.json`
- `package-lock.json`
- `AGENTS.md`
- this Work Order and Context Lock.

## REQUIREMENTS

- Preserve D-001…D-153 unchanged.
- Preserve GEF 1.1.1 exact package and root governance scripts.
- Product dependency versions must be exact and justified by preflight evidence.
- Keep one npm lockfile and npm as sole package manager.
- Product implementation status may become `FOUNDATION_IN_PROGRESS` only in proposed checkpoint delta/evidence; executor must not promote canonical checkpoint.
- No business entity or provider-specific production dependency.
- PostgreSQL remains canonical; Redis/MinIO are technical adapters/transient infrastructure only.
- Local/test resources must be isolated and cleanable.
- Config must fail closed for required process variables and redact secrets.
- Health/readiness output must be safe.
- Logs must not expose bearer tokens, secrets, raw payment/security data or prohibited TrustShield internals.
- All non-empty workspaces must build/typecheck/test according to their role.
- Code and tests use English canonical identifiers/docs; final review/evidence is PT-BR.

## ARCHITECTURE RULES

- `domain`: no Next.js/Fastify/Drizzle/Redis/S3/provider imports.
- `contracts`: no DB/provider imports.
- `ui`: no server/database imports.
- `web`: no direct DB/domain persistence.
- `api` and `worker`: compose shared domain/contracts/adapters; do not duplicate business rules.
- `db`: persistence implementation only; API DTOs are not DB schema authority.
- No workspace cycles/deep imports into private package internals.
- No second business backend inside Next.js.
- No queue/object-store state treated as canonical product truth.

## ACCEPTANCE CRITERIA

1. npm workspace topology exists with all admitted apps/packages non-empty and meaningfully owned.
2. No extra speculative package/workspace is introduced.
3. package.json preserves root identity/GEF 1.1.1 and one root lockfile.
4. Direct product dependencies have exact-version/Node/license/security/owner preflight evidence.
5. Web shell builds and browser smoke test passes with canonical semantic theme tokens.
6. API starts with valid config; health/readiness contracts are tested; invalid required config fails closed.
7. Worker starts and exits/health-checks cleanly without product jobs.
8. PostgreSQL migration harness runs against disposable DB and does not mutate schema automatically on app startup.
9. No product/business tables exist.
10. Redis and MinIO probes use real disposable/local services and deterministic cleanup.
11. Integration profile proves PostgreSQL/Redis/S3-compatible service handshakes, not just running containers.
12. Logs/config tests prove redaction of representative secret fields.
13. Dependency-boundary and cycle check PASS.
14. lint + format check + typecheck + build + unit tests PASS across workspaces.
15. integration tests PASS against real disposable services.
16. browser smoke/accessibility baseline PASS.
17. Docker profiles do not start GPU/inference by default and remain bounded for local hardware.
18. No auth/billing/credits/TrustShield/generation/AI/provider procurement code appears.
19. No `.gef`, GEF version, source seed, ruleset/provider or checkpoint mutation by executor.
20. Four required GitHub checks PASS on exact final PR head.
21. No unresolved CRITICAL/HIGH finding.
22. Evidence Bundle contains exact base/head, dependency preflight table, paths, tests, Docker/service evidence, migration evidence, architecture-boundary evidence, security scans, known risks and proposed Checkpoint Delta.
23. Executor stops without merge or checkpoint promotion.

## TESTS / EVIDENCE

Run and record at minimum:
- Node/npm versions and engine assertion;
- dependency preflight commands/results/licenses;
- clean `npm ci` from lockfile after implementation;
- workspace/package graph;
- format check;
- lint;
- typecheck;
- build;
- unit tests;
- dependency-boundary/cycle check;
- Docker Compose config validation;
- integration profile up → health handshakes → tests → deterministic teardown;
- migration apply on disposable PostgreSQL + schema evidence + no startup auto-migration;
- API invalid-config/valid-config tests;
- health/readiness response tests;
- logging redaction tests;
- web shell Playwright smoke/accessibility baseline;
- secret scan;
- dependency/security scan available in repository/toolchain;
- `git diff --check`;
- exact GEF 1.1.1 assertion;
- `gef doctor --target . --json`;
- two byte-identical `gef status --target . --json`, reconcile authorized drift under D-0007;
- four required GitHub checks on exact final head.

If Docker is unavailable in the executor environment, do not replace real-infrastructure acceptance with mocks. Mark `BLOCKED` with evidence.

## DELIVERABLES

- root npm-workspace/task/config changes;
- `apps/web`;
- `apps/api`;
- `apps/worker`;
- seven admitted `packages/*`;
- bounded local/test infrastructure files;
- migration harness;
- automated architecture-boundary checks;
- unit/integration/browser smoke tests;
- safe environment examples;
- dependency preflight evidence;
- `.engineering/evidence/SPRYXEL-WO-005-EVIDENCE.md`;
- `.engineering/checkpoint-deltas/SPRYXEL-WO-005-PROPOSED.md`;
- PR description updated with exact-head post-push check evidence.

## REVIEW FORMAT

PT-BR:
- base/head SHA and Context Lock;
- package/version/license/security preflight;
- paths/workspaces created;
- architecture-boundary result;
- config/log/redaction result;
- migration and real-service integration evidence;
- web/API/worker evidence;
- format/lint/typecheck/build/unit/integration/e2e results;
- required GitHub checks;
- CRITICAL/HIGH/MEDIUM/LOW findings;
- explicit proof hard out-of-scope was not crossed;
- proposed Checkpoint Delta;
- candidate verdict `READY_FOR_AUDIT` or `BLOCKED`.

## STOP CONDITION

`SPRYXEL_IMP_001_PLATFORM_FOUNDATION_BOOTSTRAP_READY_FOR_AUDIT`

Do not merge. Do not promote checkpoint. Do not start Identity/Tenancy or any later slice.
