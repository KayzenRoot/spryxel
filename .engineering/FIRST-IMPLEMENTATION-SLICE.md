# FIRST IMPLEMENTATION SLICE — SPRYXEL-IMP-001

Status: CANONICAL PLANNING SPECIFICATION — SPRYXEL-WO-004 / SPR-PLAN-007 approved by objective audit. A new implementation Work Order and Context Lock must admit any code.

## Identity and objective

**Work Order:** `SPRYXEL-IMP-001 — Platform Foundation Bootstrap`
**Sequence:** first code slice after approved SPR-PLAN-007
**Objective:** establish the smallest auditable npm-workspace foundation that can build and validate the web, API and worker boundaries, exposes technical health/readiness, provides typed configuration, PostgreSQL migration and external-service adapter harnesses, and gives later product increments a real test/observability base. Keep the foundation replaceable and free of product/business behavior.

The exact base, source fingerprints, Node/npm compatibility, package versions, registry/license advisories, Context Lock and four-check evidence must be revalidated in the future IMP-001 Work Order. This planning specification does not authorize implementation.

## In-scope outcome

1. Wire npm workspaces into the existing root package while preserving package identity, `@gef-bootstrap/cli@1.1.1`, `node >=22`, one root lockfile and current governance scripts. Add only the product workspace package manifests and exact versions justified by a recorded preflight; keep npm as the only package manager.
2. Add the non-empty topology from [REPOSITORY-TOPOLOGY.md](REPOSITORY-TOPOLOGY.md): `apps/web`, `apps/api`, `apps/worker`; `packages/contracts`, `domain`, `db`, `config`, `observability`, `ui`, `testkit`. No empty packages.
3. Build a minimal Next.js App Router/React/TypeScript shell that imports semantic tokens from the canonical UX contract. No finished product studio, workflow or business entity.
4. Build a Fastify API process with safe liveness/readiness endpoints, correlation/request ID, redacted structured logging and typed startup config. Readiness names bounded technical dependency categories and handles disabled optional adapters safely.
5. Build a separate Node worker process boundary with startup config, structured lifecycle events and a no-op/health path. It consumes no product jobs until a later Work Order defines them.
6. Add a PostgreSQL/Drizzle-compatible connection and checked-in SQL migration harness with an initial technical-only infrastructure migration if required by the harness. Do not create user, tenant, project, asset, job, wallet or ledger product tables. No automatic schema mutation on application startup.
7. Add Redis/BullMQ-compatible and S3-compatible adapter interfaces and bounded health/readiness probes. MinIO is the local test/development implementation. PostgreSQL remains the sole canonical persistence plane; the adapter probes do not create business records or public object access.
8. Add shared typed configuration with startup validation and safe redaction; provide examples/schema only, never secret values.
9. Add Pino-compatible JSON logging, request/correlation ID propagation and OpenTelemetry-compatible interfaces/export hooks without requiring a paid telemetry service.
10. Add Vitest-compatible unit tests, disposable real PostgreSQL/Redis/S3-compatible integration profile and an initial Playwright-compatible web-shell smoke harness. Add consistent root build/lint/typecheck/test tasks and Turborepo-compatible task graph with exact version from preflight.
11. Add bounded local `infra` and `test` Compose profiles for PostgreSQL, Redis and MinIO-compatible services if required by the selected real-infrastructure test harness. GPU/inference remains a separate opt-in profile, off by default. Profile resource defaults fit the 24 GB planning baseline.

## Planned file ownership (no files are created here)

The executor may refine internal filenames only with the same bounded ownership:

- Root: `package.json`, `package-lock.json`, `turbo.json`, workspace/task configuration, ignore rules and documented safe env examples. Existing GEF identity/scripts stay present; versioned package changes require preflight evidence.
- Web: `apps/web/package.json`, App Router shell/layout, semantic-token integration and shell smoke test.
- API: `apps/api/package.json`, Fastify bootstrap, `/healthz`, `/readyz`, schema/error primitives and API health tests.
- Worker: `apps/worker/package.json`, process bootstrap and lifecycle/health tests only.
- Shared: each planned package gets one clear export boundary; `domain`/`contracts` stay framework/provider-free, `db` owns migrations/adapters, `config` owns typed env parsing, `observability` owns telemetry interfaces/redaction helpers, `ui` owns design tokens/primitives, `testkit` owns disposable-service fixtures.
- Local infrastructure: only the profiles and test resources needed for bounded local parity; no production deployment/secret/provider configuration.

Do not create any of these product paths under SPRYXEL-WO-004 itself.

## Explicitly out of scope

- Real sign-up/login/session authentication, selecting or procuring an auth provider, production identity tables, tenant/project membership or fake production principals.
- Any product business entity/CRUD route, project shell behavior, asset, generation, job lifecycle beyond technical harnesses, billing, Credit Ledger, CostGuard, TrustShield scoring, RevenueShield, payments, refunds or pricing.
- AI/model/GPU inference, model download, benchmark/COGS measurement, production provider procurement, production object-store selection or service contract.
- Product migrations/tables, broad API endpoint catalog, full UI, completed workflows, public MCP/CLI surface or end-user production flows.
- Docker deployment manifests beyond local bounded infrastructure/test profiles; production cloud topology, production secret values or release automation.
- GEF, `.gef`, checkpoint, CI workflows, ruleset/provider or source-seed changes.

The explicit exclusions in D-152 are hard: no authentication, business entity, generation, billing, TrustShield scoring, credits, provider procurement or AI model path.

## Dependency and safety gates

- Every product dependency has a documented single reason and bounded owner in [RUNTIME-STACK.md](RUNTIME-STACK.md); record exact version, Node compatibility, license, lockfile delta and registry/security preflight in the future evidence bundle.
- Domain/contracts/db/ui dependency edges must satisfy [REPOSITORY-TOPOLOGY.md](REPOSITORY-TOPOLOGY.md); automated cycle/forbidden-import check is required.
- Run migrations only against an identified disposable test/local database. Startup never calls schema sync. Migration is reviewed and has forward/recovery reasoning.
- Readiness reports safe status only; no secrets, internal provider detail or raw adapter exceptions.
- No real identity is fabricated. No request path incurs cost. No worker retry can duplicate durable work because no product job is admitted yet.
- Local integration services use isolated named resources, bounded CPU/memory and deterministic teardown. GPU stays off by default.

## Required verification and evidence

Future IMP-001 must record exact command, exit code and relevant summary for:

1. Root npm/GEF identity assertion and clean install with lifecycle scripts disabled unless a specifically reviewed native build is necessary.
2. Workspace graph and task graph validation; no duplicate lockfile/package manager.
3. Lint, formatting check, typecheck, build and unit suite across all non-empty workspaces.
4. API health/readiness contract and config fail-closed/redaction tests.
5. Migration up on disposable PostgreSQL, schema verification, rollback/roll-forward reasoning and no implicit startup migration.
6. Real PostgreSQL, Redis and S3-compatible integration profile startup, bounded health checks, cleanup and data isolation.
7. Forbidden-import/cycle checks, secret scan and dependency/license/security preflight.
8. Browser smoke/accessibility baseline for the shell, including token themes and no fake protected data.
9. `git diff --check`, exact Context Lock/source fingerprints, unchanged GEF/checkpoint/provider restrictions and all required GitHub checks on the exact final PR head.

Do not call a service healthy based only on a running process; validate health response/handshake and test-owned cleanup. No benchmark/production COGS claim is in scope.

## Acceptance and stop boundary

IMP-001 is ready for audit only when the planned workspace/process boundaries work, all required tests pass, exact-head governance/security checks pass, no unresolved CRITICAL/HIGH finding remains, no product implementation exclusions were crossed, the diff is bounded and its PT-BR Evidence Bundle includes exact base/head and check URLs.

Proposed future stop string for that separately admitted increment: `SPRYXEL_IMP_001_PLATFORM_FOUNDATION_BOOTSTRAP_READY_FOR_AUDIT`. The string is a proposal, not a current Work Order admission or current stop condition.

## Rollback and recovery

Revert the implementation PR as a unit if the new shell, process or harness causes an unsafe or unreviewable foundation regression. Database changes are forward-only; do not erase applied schema/data by force. If an initial technical migration is applied outside a disposable environment or requires destructive recovery, stop and open a dedicated migration/recovery Work Order. No history rewrite, force-push, GEF baseline rewrite or provider/ruleset weakening is an allowed rollback.
