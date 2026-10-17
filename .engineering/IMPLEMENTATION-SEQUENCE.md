# Implementation Sequence

Status: CANONICAL — SPRYXEL-WO-004 / SPR-PLAN-007 approved by objective audit.

This is the default NECESSARY dependency sequence approved for planning by D-153. Each numbered increment remains its own Work Order with a current Context Lock, exact base and acceptance/evidence contract. Recompile the order if source evidence or dependencies change. IMPORTANT/FUTURE modules do not jump this queue automatically.

| Order | Work Order / capability | Entry dependency | Required gate before the next increment |
| ---: | --- | --- | --- |
| 1 | `SPRYXEL-IMP-001 — Platform Foundation Bootstrap` | This planning increment audited/promoted; separately admitted IMP-001 | Workspace and process boundaries build; health/readiness, config, migration harness, adapter boundaries, observability and test harness pass; no product business feature is implied |
| 2 | Identity/Tenancy security baseline | Foundation; auth-provider decision with current terms/security/compatibility evidence | Auth/session adapter and tenant principal model, project ownership boundary, application authorization + RLS, session/security/audit controls and cross-tenant integration evidence; no project or generation workflow bypass |
| 3 | Projects + canonical product shell/Home | Identity/Tenancy baseline | Project creation/selection and membership authorization; canonical UX shell and context; tenant isolation and audit evidence |
| 4 | Asset Contract + durable Job backbone | Identity/Tenancy and project context | Versioned contracts, durable PostgreSQL Job/Attempt/idempotency, bounded worker/queue reference, visible safe states and replay tests; no unbounded execution |
| 5 | Credit Ledger + CostGuard authorization foundation | Identity/tenant/project plus durable operation boundary | Immutable append-only ledger, reservation/compensation and bounded worst-case authorization, idempotent replay, real PostgreSQL integration tests and high-assurance economic review |
| 6 | Spryxel DNA + Asset core | Project context, contract/job primitives, tenant and ledger/cost controls available | Versioned DNA and canonical asset metadata/lineage/provenance with storage authorization; QA/approval requirements remain explicit |
| 7 | Bounded local inference / Generate vertical slice | Asset/contract/job/cost/ledger/security foundation; model/license evidence for chosen local route | Local inference adapter only under bounded budgets, fixed benchmark evidence, QA contract and rollback; no paid production inference without separate release gates |
| 8 | QA / approval / version / export vertical slice | Generated candidates and canonical asset/provenance foundations | Integrity and quality gates, immutable accepted versions, repair/review evidence and authorized engine-neutral/export adapters |

## High-assurance sequencing

Identity/Tenancy is a prerequisite to tenant-owned records and operations; PostgreSQL RLS and application authorization are designed and tested before downstream product surfaces rely on them. Asset Contract/Job primitives make operation identity durable before the economic layer. Credit Ledger/CostGuard must be in place before any cost-incurring generation slice. Local inference follows only after bounded authorization, replay safety and model qualification evidence. QA/approval/version/export cannot treat raw model output as a production asset.

Each Work Order may refine exact tables, routes, provider adapters, dependency versions, UI routes and rollout sequence when new evidence warrants it. Such refinement does not silently promote a FUTURE/IMPORTANT scope to V1 or skip tenant, cost, security, quality and governance gates.


## Identity/Tenancy entry decision — 2026-10-02

The provider prerequisite for sequence item 2 is now resolved for planning by D-156…D-161: WorkOS AuthKit is the V1 external human authentication/session provider, while Spryxel PostgreSQL remains canonical for tenant authorization/membership/RLS.

The implementation Work Order must still run current package/security/terms preflight before dependency installation. If that current evidence invalidates AuthKit, stop BLOCKED and return to an explicit provider decision; do not silently substitute.
