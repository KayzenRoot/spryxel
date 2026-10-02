# Requirements

Status: CANONICAL — SPRYXEL-WO-003 / SPR-PLAN-006 approved by objective audit.
Source: Product Master v0.6.0; stable decision ownership remains in DECISIONS-LEDGER.md.

## Governance requirements

- REQ-GOV-001: Keep GEF Bootstrap CLI pinned exactly to 1.1.1 until a separately admitted upgrade.
- REQ-GOV-002: Use GitHub for durable task and evidence transport; keep canonical decisions versioned in this repository.
- REQ-GOV-003: Bound each implementation increment with a stable Work Order and Context Lock.
- REQ-GOV-004: Codex executes implementation, tests, and CI; ChatGPT specifies and audits.
- REQ-GOV-005: Prove exact check contexts exist and pass before requiring them in a ruleset.
- REQ-GOV-006: Protect main against deletion and non-fast-forward updates and require PR integration.
- REQ-GOV-007: Introduce no bypass actor by default.
- REQ-GOV-008: Read back provider-side changes as evidence.
- REQ-ASSURE-001: Preserve the established npm/GEF identity, doctor, deterministic status, checkpoint-schema, and repository-cleanliness proofs.
- REQ-ASSURE-002: Keep repository validation, pipeline integrity, Gitleaks, and Trivy in the governance CI profile.
- REQ-ASSURE-003: Pin third-party Actions immutably and use least-privilege permissions.
- REQ-ASSURE-004: Unresolved HIGH or CRITICAL findings block advancement.

## Product requirements

- PRD-001: SPRYXEL is an AI Game Asset Platform, not a generic image generator.
- PRD-002: The game project and its visual universe are the primary context for assets, style, workflows, and collaboration.
- PRD-003: Support coherent projects, Spryxel DNA, versioned asset families, Asset Graph relationships, provenance, and generation replay.
- PRD-004: Organize the product around production jobs, assets, and workflows rather than provider or model catalogs.
- PRD-005: V1 prioritizes Pixel + 2D; the architecture remains ready for 2.5D/3D without promising those production capabilities in V1.
- PRD-006: Compile every generation request into a versioned Asset Contract and Generation SKU before inference.
- PRD-007: Keep raw generations separate from accepted production assets. Apply required integrity and quality gates before promotion.
- PRD-008: Track all attempts, retries, QA, repairs, storage, and variable costs; optimize cost per accepted production asset.
- PRD-009: Reserve credits and authorize a bounded maximum internal cost before any cost-incurring execution.
- PRD-010: Expose first-class API and MCP surfaces and a basic CLI, all with bounded budgets, scopes, idempotency, and machine-readable errors.
- PRD-011: Keep canonical assets independent of engine; initial export targets are Godot and Unity.
- PRD-012: Make maps/worldbuilding and game UI/HUD first-class product domains with structured, versioned SKUs and project-style consistency.
- PRD-013: Provide English as the default/canonical UI language with pt-BR and Spanish localization.
- PRD-014: Provide TrustShield and RevenueShield controls for account, promotion, payment, API/MCP, and cost exposure.
- PRD-015: Keep owner-visible economics, risk, quality, and operational observability.

## Quality, safety, and economic requirements

- REQ-QUAL-001: Integrity Gate is binary and independent of Production Score; critical structural defects always fail.
- REQ-QUAL-002: Character/creature anatomy, dimensions, silhouette, pixel geometry, frame identity, seams, map structure, and UI layout are checked by applicable versioned rules.
- REQ-QUAL-003: No single probabilistic vision model is the sole production approver for anatomy-sensitive assets.
- REQ-QUAL-004: Candidate selection and localized repair are bounded; full regeneration is not the default when a targeted repair is economical and sufficient.
- REQ-QUAL-005: Model/pipeline promotion requires license eligibility, benchmark evidence, known economics, and regression evidence; subjective review alone is insufficient.
- REQ-ECON-001: No request may execute without a bounded cost authorization and passing global/SKU/account controls.
- REQ-ECON-002: Paid-pack launch simulations assume 100% credit redemption and worst-valid-SKU mix.
- REQ-ECON-003: Base contribution-margin target is at least 70%; conservative and approved severe stress floors are 60% and 30%.
- REQ-ECON-004: Predicted non-positive contribution is a hard stop for new affected jobs.
- REQ-ECON-005: No normal paid SKU may hide predictable per-use losses through expected low usage or cross-subsidy.
- REQ-ECON-006: Public prices remain unfrozen until benchmarks and financial/legal inputs listed in BILLING-ECONOMICS.md are available.
- REQ-TRUST-001: Account existence and promotional eligibility are separate; IP or any single signal cannot prove identity or trigger an automatic permanent ban.
- REQ-TRUST-002: Risk decisions are explainable, versioned, auditable, and have false-positive review/recovery paths.
- REQ-TRUST-003: Security signal collection is purpose-bound, minimized, access-controlled, and assigned a retention class.
- REQ-TRUST-004: TrustShield never writes wallet balances directly; credit changes use the auditable ledger.

## Product status constraints

- Product implementation: NOT_STARTED.
- Product benchmarks and measured production COGS: NOT AVAILABLE.
- Commercial pricing: NOT FROZEN.
- Model/provider choices listed as candidates remain planning candidates, not selections.
- SPR-PLAN-006 is approved/canonical through SPRYXEL-WO-003. Product implementation remains NOT_STARTED and still requires a separately admitted Work Order.

## Implementation foundation constraints — SPR-PLAN-007 canonical

- Preserve TypeScript/Node.js 22 compatibility, npm workspaces and one root lockfile while retaining the existing GEF root identity; exact package versions require implementation preflight.
- Keep Next.js/React as presentation, Fastify as the single HTTP control plane and the Node worker as a separate process; domain and contracts remain framework/provider-free.
- Keep PostgreSQL canonical, SQL migrations reviewed/forward-only, Redis/BullMQ transient, and S3-compatible storage private/provider-neutral. Tenant authorization uses application checks and PostgreSQL RLS where applicable.
- Validate typed config at startup and fail closed; redact secrets and prohibited TrustShield/payment data from logs and API errors.
- Product API foundation uses JSON REST `/api/v1`, OpenAPI 3.1, versioned Zod-compatible boundary schemas, safe RFC 9457-compatible errors and durable idempotency for replay-sensitive mutations.
- Local core profile is PostgreSQL + Redis + MinIO-compatible storage within the 24 GB RAM baseline; GPU/inference remains optional and off by default.
- IMP-001 is a future, separately admitted bootstrap slice and includes no real authentication, identity/business entity, generation, billing, TrustShield scoring, credits, provider procurement or AI model path.

These are canonical planning constraints approved under SPRYXEL-WO-004. They do not authorize implementation; the full decisions are D-123…D-153 and the executor specification is [FIRST-IMPLEMENTATION-SLICE.md](FIRST-IMPLEMENTATION-SLICE.md).

## UX and interaction requirements — SPR-PLAN-006

- REQ-UX-001: Use one shared global/project shell and reusable studio grammar; preserve project/DNA context and link jobs, assets, graph, QA and export to canonical records.
- REQ-UX-002: Production studios target desktop/laptop at 1024 px and above; below that, complex studios provide only the defined companion capabilities, not full complex editing.
- REQ-UX-003: Provide first-class Dark and Light themes, semantic theme-specific tokens, tokenized typography/space/density and the documented translucency/motion boundaries.
- REQ-UX-004: Major screens and operations define applicable loading, empty, queued, progress, offline/degraded, recoverable/terminal error, permission, budget/policy block, success and partial-success states.
- REQ-UX-005: Cost-incurring operations expose bounded credit estimate/reservation before execution and relevant charged/released credits after; preserve NOT_FROZEN pricing and CostGuard hard-stop/no-fallback behavior.
- REQ-UX-006: Jobs, critical errors, approvals, security events and cost outcomes remain discoverable through durable records; a toast alone is insufficient.
- REQ-UX-007: Target WCAG 2.2 AA; support keyboard operation, visible focus, semantic/non-color-only status, reduced motion, EN/pt-BR/ES and 35–40% text expansion.
- REQ-UX-008: Member-facing policy/risk messages preserve approved safe copy and never disclose internal TrustShield signals or antifraud rules.
- REQ-UX-009: Developer UX explains credential scopes, project binding, expiry, budgets, allowed SKU/profile, risk class, one-time secret reveal and revocation before activation.
- REQ-UX-010: Owner/Admin surfaces remain permission-gated and separate; high-impact paths show scope, MFA/reauth and audit implications, with no silent impersonation.
