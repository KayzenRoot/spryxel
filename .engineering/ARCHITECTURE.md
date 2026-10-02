# Architecture

Status: CANONICAL — SPRYXEL-WO-003 / SPR-PLAN-006 approved by objective audit.
Product implementation is NOT_STARTED; this is approved planning architecture, not a deployment description.

## Product architecture boundary

The product is organized around game-production jobs and asset contracts, not model/provider names. A modular-monolith control plane coordinates independently scalable AI workers. PostgreSQL is canonical for durable users/projects/assets/jobs/ledger state; queue and provider state are transient projections and cannot replace it.

## Logical components

- Project and Identity: tenant-scoped accounts, projects, membership concepts, and project configuration.
- Spryxel DNA: style, palette, references, rules, and project-level visual memory.
- Asset System: canonical typed asset metadata, versioned files, families/packs, provenance, and the Asset Graph.
- Contract Compiler: converts a user/API/MCP request to a versioned SKU and explicit Asset Contract before inference.
- Job System: durable job identity, bounded workflow, idempotency, retry/repair accounting, and observable state.
- Authorization Plane: TrustShield risk/policy evaluation and RevenueShield entitlement/payment checks.
- CostGuard and Credit Ledger: authorize maximum cost and reserve credits before cost-incurring execution.
- Inference Gateway and Model Router: provider-neutral selection behind SKU/quality/contract requirements; local and serverless workers implement adapters.
- QA Pipeline: deterministic integrity and domain-specific QA plus multi-signal quality scoring; repair and candidate selection are bounded.
- Delivery: immutable asset versions, export bundles, and EngineBridge adaptation for Godot and Unity.
- AgentBridge: scoped, budgeted API/MCP/CLI workflows that use the same authorization, ledger, and job path as the UI.
- Observability/Admin: quality, economics, risk, audit, cost, and operational controls.

## Generation lifecycle

1. Authenticate and authorize the tenant/project.
2. Normalize a request into an explicit versioned Generation SKU and Asset Contract.
3. Evaluate TrustShield policy and trial/purchase eligibility.
4. Calculate the bounded worst-case internal cost and verify wallet, SKU, account, provider, and global limits.
5. Reserve credits and cost capacity idempotently before queueing.
6. Execute through the Model Router and inference adapter with bounded candidates, retries, repairs, time, and workflow fan-out.
7. Run integrity and applicable quality gates; raw model output never auto-promotes.
8. Promote a passing result as a versioned asset with lineage/provenance, or apply the documented failure/refund/credit policy.
9. Debit actual disclosed credits, release unused reservations, and record full attempts + QA + repair + delivery costs.
10. Export canonical engine-independent assets through authorized adapters.

The winning inference attempt alone is never the cost of an accepted asset.

## Data and execution boundaries

- PostgreSQL is canonical for product state and financial ledger entries.
- Object storage holds private asset objects; access uses project authorization and short-lived signed delivery links.
- Queue messages are references to durable jobs and bounded contracts, not a second source of truth.
- Inference workers cannot change payment, wallet, or policy invariants.
- Model and GPU adapters return execution evidence; Model Router and control plane apply policy.
- Webhooks are signature-verified and idempotent before the billing/ledger flow grants a credit lot.
- Tenant authorization is enforced in application logic, PostgreSQL RLS, storage policy, and export/download paths.

## Local-first and production architecture

Development uses Docker profiles to fit the planning baseline of 24 GB RAM and RTX 5050 8 GB VRAM. The local worker is a serious development/benchmark path, not a claim that every candidate model fits without quantization or offload. A provider-neutral serverless GPU adapter supports future production scale. Keep local and cloud job, contract, QA, ledger, and provenance semantics aligned.

No specific final database adjunct, queue, GPU vendor, object store, model, or commercial provider is selected unless the seed explicitly records a planning candidate. See MODEL-INFERENCE-STRATEGY.md and INTEGRATION-CONTRACTS.md.

## Reliability and security invariants

- Bounded retries, repairs, candidates, concurrency, wall time, credits, and internal cost.
- Durable job idempotency prevents duplicate reservation or generation on replay.
- Ledger entries are immutable after posting; corrections use compensating entries.
- No floating-point authoritative money; version every pricing rule.
- No trust score directly mutates credits or permanently deletes an account.
- Critical integrity defects override aesthetic scores.
- No paid production model without license, quality benchmark, and economic evidence.
- Provider outages do not silently route work to an unbounded expensive fallback.
- Recovery and migration do not rewrite GEF-managed baseline state.

## Governance control plane

The repository governance path remains the established GEF 1.1.1 / GitHub control plane: canonical source and checkpoint → bounded Work Order + Context Lock → executor diff and local evidence → exact-head GitHub checks → objective audit → authorized checkpoint promotion. SPRYXEL-WO-002 completed the product Source Pack migration and its audited promotion; no product implementation is admitted by that promotion.

## UX shell and workspace boundary — SPR-PLAN-006

The UI is a client of the existing authorization, job, contract, cost/ledger, asset, QA and export planes. One global shell owns Home, Projects, notifications, developer, billing and account. A selected project owns DNA, Generate/eligible Studios, Library/Graph, QA and Export. Owner/Admin and economics/operations surfaces remain separate and permission-gated.

Production studios share a resizable browser/navigation, central work area, contextual inspector and optional durable job/timeline/output tray. Persisted panel state is presentation preference, not product state. Project/DNA version, asset family and profile remain inspectable. Asset Library, Graph and QA are linked views of canonical assets/lineage/evidence; jobs and exports link to their originating contracts and versions.

The UI may request or display operations but cannot authorize by itself, bypass tenant checks, change ledger invariants, override CostGuard or promote a hard-gate failure. Cost, progress and policy states reflect durable backend records. Below 1024 px the complex studio surface becomes a limited companion, with full editing kept to the desktop target. These are planning constraints; implementation remains NOT_STARTED and needs separate admission.
