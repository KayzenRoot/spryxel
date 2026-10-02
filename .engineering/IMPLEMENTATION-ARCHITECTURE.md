# Implementation Architecture

Status: CANDIDATE — SPRYXEL-WO-004 / SPR-PLAN-007; pending objective audit and checkpoint promotion.

This document binds the implementation decisions needed to admit a small platform foundation. It is a planning contract: product implementation remains `NOT_STARTED`, and nothing in this file authorizes work beyond a separately admitted Work Order.

## Architectural shape

Use a TypeScript / Node.js 22 LTS-compatible modular-monolith control plane with three process boundaries: `apps/web` for the Next.js App Router shell, `apps/api` for the Fastify HTTP control plane, and `apps/worker` for independently scalable asynchronous execution. Shared contracts and domain rules live in framework-independent workspace packages. The API is the sole HTTP owner of product invariants; Next.js server features are a presentation/BFF edge and may not create a competing business backend.

PostgreSQL is the canonical durable store. Drizzle-compatible typed access and reviewed SQL migrations implement persistence, while PostgreSQL constraints and RLS remain available directly when the ORM cannot express the required invariant. Redis + BullMQ-compatible queues carry transient wake-up/coordination messages that reference durable PostgreSQL Job/Attempt records. S3-compatible private object storage carries bytes; product rows retain opaque object identity and metadata rather than public provider URLs. MinIO is the local-compatible adapter, not a production-provider selection.

```text
Browser
  └─ apps/web (Next.js / React; UI client and presentation state)
       └─ JSON REST /api/v1 ── apps/api (Fastify; authz, orchestration, health)
                                  ├─ packages/contracts (versioned boundary schemas)
                                  ├─ packages/domain (framework/provider-free invariants)
                                  ├─ packages/db (PostgreSQL / Drizzle / SQL migrations)
                                  ├─ packages/config (typed process configuration)
                                  ├─ packages/observability (logging / telemetry)
                                  └─ packages/* adapters at the system edge
                                        ├─ PostgreSQL (canonical durable state)
                                        ├─ Redis/BullMQ (transient work reference)
                                        └─ S3-compatible store (private object bytes)
  apps/worker (separate Node process) ── consumes bounded references; calls domain ports
```

This is one modular product, not a microservice decomposition. Separate processes exist for web delivery, the HTTP control plane and asynchronous worker scaling. A provider or infrastructure outage may pause/retry within a bounded policy; it cannot silently change cost, authorization, idempotency or durable truth.

## Direction of control and truth

1. Browser and automation clients submit versioned JSON contracts to the API. Presentation state, URL filters and optional local UI stores never authorize an operation.
2. `contracts` validates boundary data without importing persistence or providers. `domain` applies business invariants through explicit ports and owns no framework/database/provider imports.
3. API orchestration establishes authenticated identity and project authorization before calling domain services. The final auth provider remains open behind an identity/session adapter.
4. `db` implements persistence ports. PostgreSQL transactions, uniqueness/foreign-key/check constraints and RLS protect canonical state. Application checks and RLS are defense in depth.
5. A durable Job/Attempt and its bounds are committed before a queue message is emitted. Queue messages reference durable IDs; reconciliation can rebuild transient queue state from PostgreSQL.
6. Workers execute only authorized bounded work references and return evidence. They do not write wallet/ledger/trust invariants except through an authorized domain service and transaction.
7. Object storage is private and replaceable. Application authorization controls short-lived signed access; object keys are not tenant authorization tokens.

## Cross-cutting invariants

- Tenant/project authorization is enforced at the API/domain boundary and, for applicable tables, with PostgreSQL RLS; front-end filtering is never access control.
- Cost-bearing and replay-sensitive mutations are idempotent and reuse the durable operation identity. Bounded retries cannot duplicate a reservation or operation.
- PostgreSQL remains canonical for jobs, attempts, project state and financial facts. Redis, a worker process, an object store or a provider callback is never the sole durable record.
- Posted ledger entries are immutable; corrections use compensating entries. Authoritative credits are integers and money is integer/fixed precision.
- API/database schemas are distinct, versioned contracts. Provider failures are normalized to safe error categories; secrets, antifraud internals and raw provider errors never cross the boundary.
- Local and cloud paths preserve IDs, contracts, budget hooks, job semantics, QA/provenance shape and error categories.
- UI follows SPR-PLAN-006: canonical semantic tokens and accessible primitives; it cannot bypass authorization, CostGuard, ledger, job or QA gates.
- Provider SDKs and credentials stay at adapters. Auth, billing, GPU and production object-storage procurement/selection require their own current evidence and Work Order.

## Runtime and data decision references

The concrete planned choices and ownership are in [RUNTIME-STACK.md](RUNTIME-STACK.md), [REPOSITORY-TOPOLOGY.md](REPOSITORY-TOPOLOGY.md), [PHYSICAL-DATA-CONVENTIONS.md](PHYSICAL-DATA-CONVENTIONS.md), [API-FOUNDATION-CONTRACT.md](API-FOUNDATION-CONTRACT.md) and [LOCAL-DEVELOPMENT.md](LOCAL-DEVELOPMENT.md). The dependency table and open-choice state are in [evidence/SPRYXEL-WO-004-DEPENDENCY-MATRIX.md](evidence/SPRYXEL-WO-004-DEPENDENCY-MATRIX.md).

## Boundaries intentionally left open

This increment does not select an external auth or billing provider, production GPU/model, production S3 vendor, payment contract, price, credit quantity, benchmark result, retention period, final physical product schema, API endpoint catalog, or dependency version. These choices stay open in the decision/open-choice matrix until a bounded later Work Order has current compatibility, terms, security and/or economic evidence.

## Foundation increment boundary

`SPRYXEL-IMP-001 — Platform Foundation Bootstrap` is specified in [FIRST-IMPLEMENTATION-SLICE.md](FIRST-IMPLEMENTATION-SLICE.md). Its work is a future implementation Work Order, not authorized here. It provides replaceable technical health/readiness and migration/test harnesses only; it does not create production identity, tenant/business entities, billing, generation or AI behavior.
