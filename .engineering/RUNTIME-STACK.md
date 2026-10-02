# Runtime Stack

Status: CANONICAL — SPRYXEL-WO-004 / SPR-PLAN-007 approved by objective audit.

This is the compatibility-level stack contract. Exact package versions and registry availability are intentionally established by implementation preflight, not guessed here. No dependency was installed for this plan.

| Boundary | Planned choice | One architectural reason | Bounded owner | Version/provider state |
| --- | --- | --- | --- | --- |
| Product runtime | TypeScript on Node.js 22 LTS-compatible runtime | One type/runtime model for control plane, web and workers | Web/API/worker processes | Node engine baseline is already `>=22`; exact runtime image is implementation-preflight evidence |
| Package management | npm workspaces; one root `package-lock.json` | Preserve current npm + GEF identity and one dependency graph | Repository root | Existing root package stays governance-only in this plan; product workspace edits belong to IMP-001 |
| Task orchestration | Turborepo-compatible task graph/cache | Coordinate product app/package tasks without replacing npm | Root task runner | Compatible version pinned in future preflight after compatibility review |
| Web | Next.js App Router + React + TypeScript | Shared server-rendered web shell and client workspace | `apps/web` | Compatible version pinned in future preflight |
| UI composition | Semantic CSS custom-property tokens, Tailwind utilities, accessible headless primitives (Radix-compatible) | Implement canonical UX tokens while retaining accessible, owned product identity | `packages/ui` and `apps/web` | Exact utilities/primitives not pinned here; D-090…D-122 govern visual behavior |
| Web state | TanStack Query-compatible remote state; URL state for shareable filters; optional Zustand-compatible local presentation state | Keep server truth remote and shareable state in navigation | `apps/web` | Compatible versions chosen during implementation preflight; no global client database |
| Localization | Next.js-compatible ICU/message catalogs (e.g. next-intl) | Preserve canonical English plus pt-BR/Spanish message catalogs and pseudo-localization | `apps/web`, shared messages only if needed | Example is compatible direction, not a mandatory provider/version selection |
| HTTP control plane | Fastify + TypeScript | One explicit modular-monolith API boundary | `apps/api` | Compatible version pinned during IMP-001 preflight |
| Boundary validation | Zod-compatible schemas | Runtime validation shared with typed/OpenAPI contract generation | `packages/contracts`, `packages/config` | Compatible version pinned during preflight; DB model remains distinct |
| API description | JSON REST `/api/v1`, OpenAPI 3.1 | Stable documented HTTP boundary for UI and integrations | `apps/api` + contracts | Endpoint catalog and generated artifact policy remain later endpoint decisions |
| Persistence | PostgreSQL + Drizzle ORM/Drizzle Kit-compatible access and SQL migrations | Typed repository access with explicit SQL/RLS escape hatch | `packages/db` | PostgreSQL target compatibility is checked in preflight; no schema is implemented here |
| Transient queue | Redis + BullMQ-compatible work coordination | Familiar Node worker coordination while durable job truth remains PostgreSQL | Adapter edge used by `apps/worker` | Redis deployment/provider and exact library versions are preflight choices |
| Object storage | S3-compatible private-object adapter; MinIO-compatible local service | Keep stored object identity independent from production vendor | Storage adapter edge and local profile | Production vendor not selected; exact SDK is preflight choice |
| Configuration | Typed schema validated on process startup | Fail closed on missing/invalid production configuration | `packages/config` and each process entrypoint | No secrets or live environment values committed |
| Logging | Structured JSON, Pino-compatible | Consistent machine-readable operational events | `packages/observability` | Compatible version pinned during preflight |
| Telemetry | OpenTelemetry-compatible traces and metrics; correlation/request IDs | Connect requests, durable jobs and adapter operations | `packages/observability`, adapters | Exporter/backend/provider remains open |
| Worker | Separate Node process using contracts/domain and explicit ports | Scale asynchronous execution without making queue state canonical | `apps/worker` | No business-invariant ownership in a worker handler |
| Unit tests | Vitest-compatible | Fast deterministic tests for pure domain and boundary logic | Package-local test suites | Exact version pinned during preflight |
| Integration tests | Real disposable PostgreSQL, Redis and S3-compatible service instances in a dedicated Docker test profile | Exercise persistence, tenancy, ledger and idempotency properties beyond mocks | `packages/testkit` and integration suites | Versions pinned together during preflight; tests require explicit cleanup/isolation |
| Browser tests | Playwright-compatible for critical flows once screens exist | Verify user-visible end-to-end contracts | `apps/web` tests | No browser flow is implemented by IMP-001 beyond the shell smoke boundary |

## Dependency preflight rules

- Keep the root package name `spryxel`, current GEF CLI pin `@gef-bootstrap/cli@1.1.1`, Node engine baseline and npm lockfile identity.
- Add exact product dependency versions only in an admitted implementation Work Order after registry availability, Node 22 compatibility, license, security and peer-dependency checks.
- Do not use floating `latest`; do not introduce a second package manager or an unbounded provider SDK in `domain`/`contracts`.
- Each installed dependency must have one documented runtime/test/tooling purpose and one bounded owner in the workspace. Remove unused direct dependencies during preflight rather than keeping speculative libraries.
- Provider selection or a current commercial terms claim is not implied by using an adapter protocol or compatibility family.

## Configuration and safe startup

Each process imports the typed configuration boundary, parses environment values before binding or processing work, rejects malformed/missing required values, and emits only a redacted configuration summary. `.env.example` may contain names and harmless local defaults only. Production-required secrets arrive from the deployment secret manager and never appear in logs, examples, tests, CI output or committed files.
