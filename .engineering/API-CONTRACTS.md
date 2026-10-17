# API Contracts

Status: CANONICAL — SPRYXEL-WO-003 / SPR-PLAN-006 approved by objective audit.

## Surfaces and common execution model

API and MCP are first-class product surfaces; CLI is planned with a basic V1 surface. All surfaces invoke the same project authorization, Asset Contract/SKU compiler, TrustShield, RevenueShield, CostGuard, credit reservation, durable job, QA, provenance, and export path as the UI.

Cost-incurring requests must state or inherit bounded budgets. Repeated requests with the same idempotency key return the existing operation and cannot reserve twice or create duplicate generation.

## Authentication and scopes

API key concept: sprx_live_<prefix>.<secret> and sprx_test_<prefix>.<secret>. Reveal plaintext once; store secret as secure hash/HMAC; keep searchable prefix, project/workspace scope, expiry/revocation, last-used time, daily/monthly limits, and optional network allowlist.

Least-privilege scope examples: projects:read, assets:read, assets:write, generations:create/read, maps:create, ui:create, exports:create, credits:read, billing:read. No broad master key by default.

Key budgets may constrain credits per job/day/month, concurrent jobs, allowed SKUs, and quality profiles. API calls cannot exceed account, SKU, project, global, or policy budgets.

Remote interactive MCP uses OAuth-first authorization, discovery metadata, bearer-token verification, least privilege, resource-bound access, and step-up for stronger scopes where supported. API keys remain an option for headless/server/CI automation.

## MCP operations and risk classes

Map and UI receive first-class MCP/API operations for creation, bounded renders/workflows, reads, repair, and export. Exact tool names/input schemas remain open.

Risk classes: READ_ONLY; LOW_COST_MUTATION; COST_INCURRING; HIGH_IMPACT. Read-only list/inspect/status operations are separated from generation, repair, map render, bulk jobs, and privileged billing/configuration. Stronger classes may require stronger scope, budgets, trust level, step-up, or explicit confirmation.

## Budget inheritance and idempotency

Every cost-incurring agent request supports max_credits, max_jobs, max_candidates, max_repairs, max_retries, and max_wall_time. Composite workflows receive a workflow_budget; children inherit and consume it. Recursive calls cannot reset it.

Mutations carry an idempotency key. Replays return the original job/operation; no duplicate credit reservation, debit, provider event, or generation is created. Billing webhooks use provider event IDs and the same idempotent ledger flow.

## Machine-readable failure and audit behavior

Budget, authorization, policy, contract, safety, cost, provider, and QA errors must be machine-readable and distinguish retryable from terminal outcomes. Preserve correlation IDs and provenance. Never include secrets, raw payment data, internal TrustShield thresholds, linked account identities, or device hashes in client errors.

Downloads and exports are tenant-authorized with short-lived signed URLs and audit events. Every API/MCP path enforces tenant isolation, API-key scope, allowed SKU/profile, cost limits, and generation idempotency.

Open: exact product endpoint catalog, request/response schemas, pagination, error-code registry, OAuth scopes/resource metadata, CLI command syntax, partial-delivery semantics, and detailed MCP tool catalog. SPR-PLAN-007 sets only the foundation to JSON REST under versioned `/api/v1`, OpenAPI 3.1, Zod-compatible boundary schemas, RFC 9457-compatible errors, request correlation, UUIDv7-compatible IDs and durable idempotency requirements; it does not freeze product endpoints. See [API-FOUNDATION-CONTRACT.md](API-FOUNDATION-CONTRACT.md).

## Credential and automation UX contract — SPR-PLAN-006

Before enabling API/MCP/CLI credentials or cost-incurring automation, the developer surface presents credential scope, global/project binding, expiry, last use, allowed SKUs/profiles, bounded credit/job/candidate/repair/retry/time limits, risk class, revocation and one-time secret reveal. Interactive remote MCP remains OAuth-first. Workflow budgets are inherited by child operations, and idempotency is explained so retries do not reserve or generate twice.

The UI surfaces machine-readable budget, authorization, policy, contract, safety, cost, provider and QA outcomes as safe actionable states. It never returns a secret after its one-time reveal and never includes raw payment data, internal TrustShield thresholds, linked-account identities or device hashes in client-visible errors. This UX clarification freezes no paths, schemas, tool catalog or provider.
