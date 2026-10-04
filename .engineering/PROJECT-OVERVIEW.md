# Project Overview

Status: CANONICAL — approved by objective audit of SPRYXEL-WO-002.
Source: immutable SPRYXEL Product Master v0.6.0, migrated by SPRYXEL-WO-002.

## Identity and product definition

Product name: SPRYXEL. The name is approved for planning; formal trademark and domain clearance remains a public-launch prerequisite.

SPRYXEL is an AI Game Asset Platform, not a generic AI image generator. It helps game creators produce, organize, validate, evolve, and export coherent game assets. A game project and its visual universe are the fundamental organizing unit.

The product is a production-asset platform: raw model output is not an approved or delivered production asset by itself. The platform combines project memory, explicit asset contracts, bounded generation jobs, quality gates, lineage, economics, trust controls, and engine-independent export.

## Vision and users

The long-term product spans pixel art, 2D, 2.5D/isometric, and 3D. Delivery is incremental. V1 focuses on Pixel + 2D while keeping the architecture ready for later 2.5D/3D work.

Primary users:

- indie and solo game developers;
- vibe coders and AI-native game builders;
- small AI-native studios;
- developers working through coding agents;
- technical artists and game designers.

Mid-size teams, studio collaboration, and enterprise are later audiences.

## Product principles

- Organize by game-production job and asset family, not by model or provider.
- Treat a project’s Spryxel DNA, asset family, and Asset Graph as durable context.
- Version assets and preserve lineage, provenance, and replayable generation evidence.
- Compile an explicit contract and bounded budget before cost-incurring generation.
- Optimize for cost per accepted production asset, including failed attempts, QA, repairs, and retries.
- Keep TrustShield, RevenueShield, CostGuard, QA, audit, and observability cross-cutting.
- Keep canonical assets engine-independent; adapters perform engine-specific export.
- Make human and agent workflows first-class.

## Approved V1 profile

- Pixel and general 2D production with a Pixel + 2D first release focus.
- Basic characters, items/props, environment assets, tilesets, spritesheets, and image-to-variation.
- Projects, Asset Library, Asset Graph v1, Spryxel DNA v1, Generate Studio, jobs/queue, provenance, and Model Router v1.
- API v1, MCP v1, basic CLI, and initial Godot and Unity export.
- Pixel QA, Consistency Engine, and basic Seam Engine.
- Credit Ledger, CostGuard, TrustShield v1, RevenueShield v1, owner administration, and economics observability.
- English default UI with Brazilian Portuguese and Spanish localization.
- Local-first Docker development using an RTX 5050 with 8 GB VRAM and 24 GB system RAM as the planning baseline; local inference plus a bounded serverless adapter path.

The complete V1, V1.x, later-release, and module classifications are in SCOPE.md. No product implementation has started or is admitted by this Work Order.

## Planning history and current state

The immutable seed records approved planning through SPR-PLAN-005. The decomposed repository Source Pack was objectively audited and promoted by SPRYXEL-WO-002 and is now the canonical product authority. The seed remains immutable historical migration evidence and traceability source.

Completed in the seed:

- SPR-PLAN-001 — Product Modules & Asset Taxonomy — APPROVED / COMPLETED IN MASTER v0.2.0.
- SPR-PLAN-002 — Technical Architecture & Local AI Benchmark Strategy — APPROVED / COMPLETED IN MASTER v0.3.0.
- SPR-PLAN-003 — Quality System, Benchmark Protocol & Generation SKU Specification — APPROVED / COMPLETED IN MASTER v0.4.0.
- SPR-SPECIAL-001 — Maps, Worldbuilding & Game UI/HUD — APPROVED / ADDED IN MASTER v0.4.1.
- SPR-SPECIAL-002 — Map/UI SKU, Contracts, Export & Agent Automation — APPROVED / COMPLETED IN MASTER v0.4.2.
- SPR-PLAN-004 — Credit Economics, Pricing Safety & Financial Simulation — APPROVED / COMPLETED IN MASTER v0.5.0.
- SPR-PLAN-005 — Security, TrustShield, Abuse Graph & Account/Payment Risk Architecture — APPROVED / COMPLETED IN MASTER v0.6.0.

SPR-PLAN-006 and SPR-PLAN-007 are complete and canonical. SPRYXEL-IMP-001 — Platform Foundation Bootstrap — is COMPLETE under SPRYXEL-WO-005; only the bounded technical foundation is implemented. Product business features remain NOT_STARTED.

## Open decisions and release gates

Commercial prices, credit quantities, external auth/billing/GPU/production-storage providers, physical product schema, exact dependency versions, detailed endpoint/MCP/CLI catalog, legal/tax treatment, and trademark/domain clearance remain open or gated as recorded in the Source Pack. SPR-PLAN-007 resolves only the runtime/workspace/process-boundary and compatibility-level API, persistence, queue and storage-adapter choices needed to plan the foundation slice; exact versions and external providers remain open.

No AI model benchmark has been run. No paid-production model is selected. Public prices remain NOT FROZEN / SIMULATION_ONLY until measured COGS, provider/payment inputs, tax/accounting review, reserves, working capital, and approved stress simulations exist.


## WO-002 completion

`SPRYXEL-WO-002` is COMPLETE: the Product Master v0.6.0 migration was audited, promoted, squash-merged, and post-merge validated on `main@9a28858abe48c2b3c453dc4a23ac49cc8e40b987`. The next legal planning stage is `SPR-PLAN-006`; product implementation remains NOT_STARTED.

## SPR-PLAN-006 completion

SPRYXEL-WO-003 objectively approved the product UX, design-system and information-architecture planning baseline. Product implementation remains NOT_STARTED. The next legal action is a new bounded implementation-planning Work Order/Context Lock; no code is admitted automatically.


## WO-003 completion

`SPRYXEL-WO-003` is COMPLETE: SPR-PLAN-006 was objectively audited, promoted, squash-merged, and post-merge validated on `main@5614aabe4ac115dc94465ae477032256e8018219`. Product implementation remains NOT_STARTED; the next legal action is a separate implementation-planning Work Order.

## SPR-PLAN-007 completion

SPRYXEL-WO-004 completed implementation-architecture planning. D-123…D-153 and the SPRYXEL-IMP-001 specification are canonical planning after objective audit; IMP-001 was not executed. Pricing stays NOT_FROZEN; benchmarks/COGS stay NOT_RUN / NOT_AVAILABLE.


## WO-004 completion

`SPRYXEL-WO-004 / SPR-PLAN-007` is COMPLETE: the implementation-planning baseline was objectively audited, promoted, squash-merged and post-merge validated on `main@b3226fdff9a53ba5dbe1b7e30b1783cbc897b60a`. Product implementation remains NOT_STARTED. The next legal implementation slice is `SPRYXEL-IMP-001` under a new Work Order/Context Lock.


## WO-005 / IMP-001 approval

SPRYXEL-WO-005 objectively approved the first implementation slice on head `a81ca67894265da3679d817db737a9af3aee9a79` after Correction Delta 01 and Correction Delta 02 closed all audit findings. The implemented surface is technical foundation only: workspace/toolchain, web shell, API/worker process boundaries, shared technical packages, PostgreSQL/Redis/S3-compatible local infrastructure, observability, architecture checks and test harnesses.

Identity/Tenancy and every downstream business slice remain NOT_ADMITTED.


## WO-005 completion

`SPRYXEL-WO-005 / SPRYXEL-IMP-001` is COMPLETE: objectively audited, canonically promoted, squash-merged and post-merge validated on `main@6dbce3f1ba1e5b85a6e6ea40083e2d4418755261`.

The canonical implemented surface remains the technical platform foundation only. Identity/Tenancy and all downstream product/business slices remain NOT_ADMITTED.

## WO-006 / IMP-002 approval

SPRYXEL-WO-006 objectively approved `SPRYXEL-IMP-002 — Identity/Tenancy security baseline` on head `8e4f5b16883bf03a29893783032a00d31753457b`. The implemented surface establishes the V1 external authentication/session edge with WorkOS AuthKit while keeping tenant membership, product authorization and row-level security under Spryxel-owned PostgreSQL authority.

The slice includes durable identity bootstrap, tenant/membership schema, RLS isolation, JWT/JWKS verification, bounded session enumeration/revocation, durable revocation intents and fail-closed reconciliation of ambiguous provider outcomes. HIGH_ASSURANCE acceptance and the SonarQube Quality Gate passed; no known CRITICAL/HIGH finding remains.

Projects/Product Shell and all later business slices remain NOT_ADMITTED until WO-006 merge/post-merge closeout and a fresh Work Order/Context Lock.

## WO-006 completion

`SPRYXEL-WO-006 / SPRYXEL-IMP-002` is COMPLETE: objectively audited, canonically promoted, squash-merged and post-merge validated on `main@814abd6ab27b2a4c4549a1941a713e1c6cae69bd`.

The canonical implemented surface now includes the technical platform foundation plus Identity/Tenancy security baseline. Projects/Product Shell and every downstream business slice remain NOT_ADMITTED until their own Work Orders and Context Locks.

## WO-007 / IMP-003 approval

SPRYXEL-WO-007 objectively approved `SPRYXEL-IMP-003 — Projects + canonical shell/Home` on head `a64b76c858f9e72e462478d910655b3d69d85ec6`.

The implemented surface establishes durable tenant-owned projects with application authorization plus forced PostgreSQL RLS, replay-safe project creation and durable project-created audit evidence. The V1 product shell now includes the authenticated Global Shell, Home/Command Center, Projects list/create/select and a minimal Project Overview that represents downstream DNA/Jobs/Assets capabilities honestly as not yet implemented.

Identity/Tenancy from WO-006 remains preserved. Asset Contract/Job backbone and all later product slices remain NOT_ADMITTED until WO-007 merge/post-merge closeout and their own Work Orders/Context Locks.
