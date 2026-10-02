# Repository Topology

Status: CANDIDATE — SPRYXEL-WO-004 / SPR-PLAN-007; pending objective audit and checkpoint promotion.

This tree is a future product layout contract, not a set of directories created by SPRYXEL-WO-004. The repository remains governance/documentation-only until a separate implementation Work Order.

All three processes and shared code use TypeScript on a Node.js 22 LTS-compatible runtime. npm workspaces and the one root npm lockfile own dependency resolution; Turborepo-compatible tasks may orchestrate product builds without replacing npm. Exact package versions are deferred to implementation preflight.

The shared service boundaries are PostgreSQL/Drizzle for canonical state, Redis/BullMQ-compatible transient work coordination, and private S3-compatible object storage with MinIO-compatible local development. Pino-compatible structured logging and OpenTelemetry-compatible telemetry are cross-process concerns owned by `packages/observability`, not mandatory vendor services.

```text
/
├─ package.json                 # existing npm/GEF root; product workspace wiring is future IMP-001
├─ package-lock.json            # one npm lockfile at the root
├─ turbo.json                   # future task graph, added only by an admitted implementation slice
├─ apps/
│  ├─ web/                      # Next.js App Router / React presentation shell
│  ├─ api/                      # Fastify modular-monolith HTTP control plane
│  └─ worker/                   # separate Node process for bounded asynchronous work
├─ packages/
│  ├─ contracts/                # versioned request/response/config boundary schemas
│  ├─ domain/                   # framework-free business invariants and ports
│  ├─ db/                       # PostgreSQL repositories, SQL migrations and RLS support
│  ├─ config/                   # typed process configuration and redaction
│  ├─ observability/            # logging, correlation and telemetry interfaces
│  ├─ ui/                       # Spryxel tokens and accessible shared UI primitives
│  └─ testkit/                  # disposable-service fixtures and test helpers
├─ infra/                       # only when an admitted Work Order needs shared local infra files
└─ .engineering/                # canonical governance and product planning sources
```

`apps/*` and `packages/*` names above define allowed architectural homes; add a directory only with owned code and an admitted slice. Do not create empty packages or split these boundaries into services without a new decision.

## Ownership rules

| Path | Owns | Must not own |
| --- | --- | --- |
| `apps/web` | Routes, layouts, accessibility, token composition, URL state, remote query/mutation integration, presentation-only local state | Canonical domain rules, authorization decisions, direct database access, ledger/cost policy, provider secrets |
| `apps/api` | Fastify plugins/routes, request lifecycle, authentication adapter integration, authorization orchestration, rate/budget boundary, health/readiness, domain-service composition | A second copy of rules in route handlers, direct provider semantics in response contracts, bypass of domain transactions |
| `apps/worker` | Process lifecycle, transient queue consumers, durable reference load, bounded execution orchestration and telemetry | Sole job truth, unbounded retries, direct ledger/trust mutation, UI concerns |
| `packages/contracts` | Versioned JSON request/response schemas, API-safe errors and generated OpenAPI/types | Database entities, provider SDKs, secrets or persistence logic |
| `packages/domain` | Framework- and provider-neutral rules, application use cases/ports and invariant-level errors | Next.js, Fastify, Drizzle, Redis/S3 SDK imports or direct environment reads |
| `packages/db` | PostgreSQL access, migrations, constraints, RLS helpers and repository implementations | API DTO ownership, provider calls, UI, silent schema sync |
| `packages/config` | Typed environment schema, startup validation, secret classification and safe redaction | Committed secret values or domain-policy duplication |
| `packages/observability` | Stable logging/trace/metric interfaces, redaction conventions and correlation propagation | Business state, raw secret capture or mandatory paid telemetry provider |
| `packages/ui` | Canonical semantic tokens and reusable accessible presentation primitives | Server/database imports or feature/business policy |
| `packages/testkit` | Disposable test-service orchestration, fixtures and invariant-focused helpers | Production runtime dependencies or mocks as the only evidence for financial/tenant invariants |

## Allowed dependency direction

```text
apps/web ───────► contracts, ui, config (public-safe subset), observability
apps/api ───────► contracts, domain, db, config, observability, edge adapters
apps/worker ────► contracts, domain, db, config, observability, edge adapters
packages/db ────► domain ports/types only where required; PostgreSQL/Drizzle implementation
packages/ui ────► contracts only for presentation-safe types; no server package
packages/domain ► platform-neutral types and ports only
packages/contracts ► platform-neutral schema/types only
```

Dependency cycles are prohibited. `domain` has zero framework/database/provider imports; `contracts` has zero database/provider imports; `ui` has zero server/database imports. The API and worker compose adapters at the edge. Web server rendering may call a public API client boundary but cannot import `db` or invoke domain persistence directly.

## Root and workspace rules

- npm remains the sole package manager with one root lockfile. Workspace globs and task orchestration are introduced together only by IMP-001 after exact versions and package-manager behavior are verified.
- The existing GEF root identity and pin remain intact. Product scripts may be added as a coherent change only in the implementation Work Order, with governance scripts still available.
- Turborepo-compatible tasks declare explicit inputs/outputs and dependencies. CI and local commands share the same lint, typecheck, build and test task graph; cache use cannot hide failed or stale source validation.
- Package exports are intentional public boundaries. No cross-package deep imports into another package's private source tree.
- No implementation scaffold is created by this planning increment.
