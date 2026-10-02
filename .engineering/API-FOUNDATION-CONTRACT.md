# API Foundation Contract

Status: CANDIDATE — SPRYXEL-WO-004 / SPR-PLAN-007; pending objective audit and checkpoint promotion.

This contract defines the transport and boundary rules needed for the initial platform foundation. It does not freeze the product endpoint catalog or implement endpoints. Existing [API-CONTRACTS.md](API-CONTRACTS.md) remains the owner of product-surface authorization, budgets, MCP/API principles and safety behavior.

## Transport and ownership

- `apps/api` is the Fastify + TypeScript modular-monolith HTTP control plane. Domain use cases remain framework-agnostic. `apps/web` is a client and presentation edge, not another business backend.
- Product HTTP uses JSON REST under versioned `/api/v1` paths. OpenAPI 3.1 describes the API surface and is generated/validated from versioned boundary contracts where practical.
- `/healthz` is a process liveness endpoint: it says whether the API process can serve health traffic and does not disclose dependency credentials or internal diagnostics.
- `/readyz` is a readiness summary for required configured foundations. It reports a bounded status per dependency category, not raw provider errors, hostnames with secrets or sensitive configuration. Optional adapters do not make the process unready when not enabled.
- Exact product routes, endpoint names, pagination, filtering, API/MCP catalog, auth provider, OAuth metadata, and compatibility/deprecation policy remain open for their domain Work Orders.

## Boundary validation and schema separation

- Versioned Zod-compatible schemas define JSON request/response boundaries and typed environment/config boundaries. The same contract may generate OpenAPI/type artifacts, with drift checked in CI.
- Database row/Drizzle types are persistence types, not API schemas. Responses explicitly project safe fields; raw storage, provider, payment and internal TrustShield structures never serialize directly.
- Validate content type, body size, path/query values and enum/version fields before domain execution. Invalid requests use the common error envelope and do not partially mutate state.
- Unknown fields are handled consistently by each versioned contract; do not let coercion silently weaken authorization, budget or monetary inputs.

## Error envelope

Use RFC 9457 Problem Details-compatible JSON with a stable Spryxel machine code extension. For example, an envelope may contain `type`, `title`, `status`, safe `detail`, `instance`, `code`, `requestId` and optional `retryable`. This shape is illustrative; exact field spelling and registry are frozen with endpoint contracts.

Errors preserve a correlation/request ID and distinguish validation, authentication, authorization, not-found, conflict/idempotency, budget/policy, dependency-unavailable, rate-limit and internal failure categories. Retryability is explicit where meaningful. Safe detail gives the caller an allowed next action without revealing raw provider messages, stack traces, secrets, antifraud thresholds, linked-account identities or device hashes. Internal causes are retained only in redacted structured telemetry.

## Mutation replay and identifiers

- Cost-bearing and other replay-sensitive mutations require an idempotency key. The server scopes the key to the authenticated principal and operation/tenant boundary, stores a durable operation identity/result, and returns/reuses that identity on replay.
- A replay cannot create a second job, cost reservation, debit, provider event or credit grant. Define request-hash mismatch behavior and key-retention duration in each endpoint Work Order.
- New durable product identifiers use UUIDv7-compatible opaque IDs. External immutable provider identifiers retain a provider namespace. Slugs and display names are never authorization keys.
- Authentication provider remains open behind an identity/session adapter. IMP-001 has technical process health only; it must not invent a fake production principal or claim protected product data exists.

## Tenant and security boundary

For every future tenant-bound route, authenticate before object access, authorize membership/project ownership in the service path and rely on PostgreSQL RLS where applicable. Verify access again for job, asset, storage, download and export follow-ups. Return safe 404/permission behavior without confirming another tenant's records. Request schemas may carry project IDs but those IDs are selectors, not proof of permission.

Secrets are accepted only where an explicitly admitted route needs them, are redacted before logs/traces, and do not appear in errors or OpenAPI examples. Production configuration is validated at startup and fails closed when required values are missing.

## API observability and compatibility

Each request receives a correlation/request ID propagated to domain calls, persistence spans, queue messages and worker continuations where present. Structured JSON logs include route template, safe outcome/category and timing, not bearer tokens, API secrets, raw payment data or prohibited TrustShield internals. Metrics avoid tenant/user identifiers as unbounded labels.

OpenAPI is versioned with the `/api/v1` compatibility contract. Breaking changes require a versioning/deprecation decision and migration window. The foundation health contract does not authorize product business endpoints; API/MCP/CLI remain aligned to the same authorization, idempotency, cost and job contracts.
