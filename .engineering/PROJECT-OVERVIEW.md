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

Next proposed NECESSARY planning increment: SPR-PLAN-006 — Product UX, Design System & Information Architecture. It is not executed here.

## Open decisions and release gates

Commercial prices, credit quantities, final model/provider selection, final application stack choices, final database/queue/storage details where still marked open, API/MCP/CLI contracts, detailed UX and wireframes, legal/tax treatment, and trademark/domain clearance remain open or gated as recorded in the seed and specialized Source Pack documents.

No AI model benchmark has been run by this Work Order. No paid-production model is selected. Public prices remain NOT FROZEN / SIMULATION_ONLY until measured COGS, provider/payment inputs, tax/accounting review, reserves, working capital, and approved stress simulations exist.
