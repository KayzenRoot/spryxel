# SPRYXEL — Product Master

**Document type:** Pre-Repository Canonical Product Master  
**Status:** ACTIVE / EVOLVING  
**Version:** 0.6.0  
**Date:** 2026-10-01  
**Canonical product name:** SPRYXEL  
**Default product language:** English  
**Supported UI languages:** English (default), Portuguese (Brazil), Spanish  
**Initial development environment:** Local-first, Docker, NVIDIA RTX 5050 8 GB  
**Initial production strategy:** Free infrastructure tiers wherever commercially permitted; serverless GPU only when external generation requires it.

> This file is the temporary source of truth while no repository exists. It must be updated as product decisions are approved. Once the repository is created, this document becomes the seed source for the canonical Source Pack and is decomposed into Requirements, Scope, Architecture, Security, Billing/Economics, Data Model, API Contracts, UI/UX, Test Plan, Deployment, Backlog, Definition of Done, Decisions Ledger/ADRs, and Checkpoint.

---

## 1. Product Identity

### 1.1 Name

**SPRYXEL**

Working pronunciation: **SPRIX-el / SPRAI-xel**

The name intentionally evokes:
- sprites;
- pixels;
- voxels;
- game assets;
- a technical/creative developer tool.

It does not lock the product to pixel art, allowing the platform to expand across 2D, 2.5D, 3D, animation, materials, VFX, UI, environments, and engine-ready assets.

### 1.2 Category

**AI Game Asset Platform**

### 1.3 Positioning

> **Game-ready assets for humans and AI agents.**

Alternative marketing line:

> **Build worlds. Generate assets. Ship games.**

### 1.4 Primary Audience

1. Indie game developers.
2. Solo game developers.
3. Vibe coders building games with AI.
4. Small AI-native game studios.
5. Developers using Codex, Cursor, Claude Code and other coding agents.
6. Technical artists and designers that need repeatable asset pipelines.
7. Later: mid-size game studios through team and API products.

---

## 2. Product Vision

SPRYXEL is not intended to be a generic image generator.

It is intended to become a **game asset production system** that can create, validate, organize, reproduce, version, export and integrate game-ready assets while preserving a project's visual identity.

The fundamental unit is not an isolated image. The fundamental unit is the **game project and its visual universe**.

A project should contain persistent information about:

- art direction;
- palette;
- lighting;
- camera;
- pixel/grid rules;
- proportions;
- character identities;
- world identities;
- materials;
- texture style;
- animation rules;
- engine targets;
- asset relationships;
- export settings;
- model/pipeline provenance.

---

## 3. Long-Term Asset Coverage

SPRYXEL must be architected to support all of the following categories even if they are delivered incrementally.

### 3.1 Pixel Art

- Characters.
- Creatures.
- NPCs.
- Enemies.
- Bosses.
- Items.
- Weapons.
- Armor.
- Buildings.
- Props.
- Terrain.
- Tilesets.
- Autotiles.
- UI icons.
- Inventory icons.
- Portraits.
- Effects.
- Spritesheets.
- Directional sprites.
- Animations.

### 3.2 2D

- Raster game art.
- Stylized characters.
- Environment art.
- Props.
- Backgrounds.
- Foregrounds.
- UI assets.
- Icons.
- Concept-to-production conversion.
- Character sheets.
- Animation frames.
- Texture sheets.

### 3.3 2.5D

- Isometric assets.
- Layered sprites.
- Pseudo-3D characters.
- Isometric environments.
- Multi-angle props.
- Depth-aware asset packs.
- Parallax environment layers.
- Orthographic render pipelines.

### 3.4 3D

Long-term platform scope:

- Text-to-3D.
- Image-to-3D.
- Mesh generation.
- Mesh refinement.
- UV generation.
- Texture generation.
- Material generation.
- Normal/roughness/metalness maps.
- Retopology assistance.
- Rigging.
- Animation.
- LOD generation.
- Collision proxy generation.
- Turntable previews.
- Format conversion.
- Engine-ready packaging.

Target formats may include:

- GLB/GLTF.
- FBX where licensing/tooling permits.
- OBJ.
- USD/USDZ where applicable.
- Engine-specific packages.

---

## 4. Core Differentiators

### 4.1 Spryxel DNA

Persistent visual identity system for a game project.

Potential components:

- Project DNA.
- Character DNA.
- Creature DNA.
- Environment DNA.
- Material DNA.
- Palette DNA.
- Camera DNA.
- Animation DNA.

The goal is to prevent each generation from behaving as an unrelated prompt.

Example:

```text
Game Project
  ├─ Visual DNA
  ├─ Character DNA
  ├─ World DNA
  ├─ Palette Rules
  ├─ Lighting Rules
  ├─ Camera Rules
  ├─ Engine Target
  └─ Asset Graph
```

### 4.2 Asset Graph

Every generated asset can have semantic relationships.

Examples:

```text
Knight
  ├─ owns Sword_04
  ├─ wears Armor_Blue_02
  ├─ belongs to Kingdom_A
  ├─ uses Palette_Knight
  ├─ has Idle_01
  ├─ has Walk_01
  └─ has Attack_01
```

This enables project-wide consistency and agent automation.

### 4.3 Consistency Engine

Target capabilities:

- identity consistency;
- palette consistency;
- scale consistency;
- lighting consistency;
- camera consistency;
- equipment consistency;
- animation consistency;
- world-style consistency;
- cross-asset cohesion.

### 4.4 Pixel QA Engine

For pixel-oriented assets:

- mixed-pixel detection;
- unwanted anti-aliasing detection;
- grid alignment validation;
- palette validation;
- outline consistency;
- sprite dimension validation;
- transparent-edge cleanup;
- frame registration checks.

### 4.5 Animation QA

Automatic frame-level checks:

- body size changes;
- anchor drift;
- weapon mutation;
- clothing mutation;
- silhouette instability;
- palette shifts;
- missing pixels;
- inconsistent outlines;
- frame jitter;
- loop continuity.

### 4.6 Tileset Seam Engine

Automated verification of:

- horizontal seams;
- vertical seams;
- corner transitions;
- Wang tile compatibility;
- autotile rules;
- edge consistency;
- repeat artifacts.

### 4.7 Model Router

The application must not depend on a single AI model or cloud provider.

The router should select inference based on:

- asset type;
- requested quality;
- resolution;
- VRAM requirements;
- estimated latency;
- current provider cost;
- current provider availability;
- historic quality score;
- user plan;
- project settings.

Possible backends:

- local RTX GPU;
- serverless GPU;
- dedicated GPU;
- external inference API;
- future proprietary models.

### 4.8 Generation Replay

Every generation should be reproducible where technically possible.

Store:

- model;
- model version;
- pipeline version;
- seed;
- prompt;
- negative prompt;
- control inputs;
- source assets;
- post-processing version;
- generation parameters;
- hardware/backend;
- timestamps.

### 4.9 Provenance Ledger

Each asset should preserve generation provenance, useful for:

- reproducibility;
- support;
- auditing;
- licensing;
- AI disclosure;
- engine/project metadata;
- dispute evidence.

---

## 5. Developer and Agent Platform

SPRYXEL must be built as both a visual product and a developer platform.

### 5.1 Public API

The API should eventually support:

- project creation;
- project DNA management;
- asset generation;
- asset variation;
- character generation;
- animation;
- tilesets;
- 3D generation;
- conversion;
- quality validation;
- export;
- credit balance;
- job status;
- webhooks;
- provenance retrieval.

### 5.2 MCP Server

SPRYXEL should expose an MCP server so coding agents can create and manipulate assets.

Target experiences:

```text
"Create a 32x32 skeleton enemy matching the current project style."
"Generate idle, walk, attack and death animations."
"Export it into the Godot project."
```

The agent should be able to perform the entire operation without the user manually leaving the IDE.

### 5.3 CLI

Proposed package:

```bash
@spryxel/cli
```

Potential commands:

```bash
spryxel login
spryxel project init
spryxel generate character
spryxel generate tileset
spryxel animate
spryxel validate
spryxel export godot
spryxel export unity
spryxel jobs
spryxel credits
```

### 5.4 IDE / Agent Targets

Initial integration targets:

- Codex.
- Cursor.
- Claude Code.
- VS Code.
- Generic MCP clients.
- Generic REST/API clients.

Future:

- JetBrains.
- game-engine editor plugins;
- GitHub agent workflows;
- CI asset generation.

---

## 6. Game Engine Integrations

### Initial

- Godot.
- Unity.

### Later

- Unreal Engine.
- Phaser.
- PixiJS.
- Defold.
- Construct.
- RPG-oriented engines when useful.

Exports must aim to include not just image files, but usable metadata.

Examples:

- spritesheet;
- frame map;
- animation names;
- anchor points;
- collision metadata where available;
- import presets;
- engine manifest;
- source/provenance metadata.

---

## 7. Credit Economy

### 7.1 Fundamental Rule

**No generation may be accepted without an economically bounded cost.**

The platform must know or safely bound the maximum expected variable cost before a generation job begins.

### 7.2 Credit Ledger

Never store the economy as only:

```text
users.credits = 100
```

Use an auditable double-entry-inspired ledger or equivalent immutable transactional model.

Entities:

- wallets;
- credit lots;
- ledger entries;
- reservations;
- debits;
- refunds;
- expirations;
- promotional credits;
- purchased credits;
- subscription credits;
- compensation credits;
- chargeback adjustments;
- generation charges.

### 7.3 Credit Classes

Credits should preserve origin.

Suggested classes:

1. `PAID`
2. `SUBSCRIPTION`
3. `PROMOTIONAL`
4. `TRIAL`
5. `REFERRAL`
6. `COMPENSATION`

This enables accurate economics and prevents free-credit abuse from being hidden inside paid economics.

### 7.4 Generation Authorization Flow

```text
Request
  ↓
Estimate maximum cost
  ↓
Risk check
  ↓
Verify wallet
  ↓
Reserve credits
  ↓
Verify platform spending circuit breaker
  ↓
Enqueue
  ↓
Generate
  ↓
Calculate actual cost
  ↓
Commit debit
  ↓
Release unused reservation
```

On failure:

```text
Failed generation
  ↓
Classify fault
  ↓
Refund/release credits according to policy
  ↓
Record infrastructure cost
```

### 7.5 Cost Formula

Every generation type requires a versioned cost model.

Conceptually:

```text
True Variable Cost =
    GPU cost
  + external model/API cost
  + preprocessing
  + postprocessing
  + storage allocation
  + bandwidth allocation
  + retry reserve
  + failed-job reserve
  + free-credit allocation
  + refund reserve
  + chargeback/fraud reserve
  + payment processing allocation
  + applicable variable tax allocation
```

Then:

```text
Minimum Customer Price =
    True Variable Cost / (1 - Target Contribution Margin)
```

The final formula will be calibrated by real benchmarks before pricing is frozen.

### 7.6 Margin Policy

Initial planning target:

- Target contribution margin: **>= 70%** after directly attributable variable costs.
- Stress-case contribution margin: **must remain positive**.
- A plan must not launch if a reasonable worst-case usage pattern can produce negative unit economics without an explicit, capped marketing budget.

These targets are planning defaults, not final commercial prices.

### 7.7 Free Credits

Free credits are not "free" to SPRYXEL.

Every free-credit program must have:

- budget owner;
- budget cap;
- expected redemption rate;
- expected inference cost;
- anti-abuse eligibility;
- maximum exposure;
- kill switch.

The platform must display:

```text
Free Credit Liability
Free Credits Issued
Free Credits Redeemed
Free Credit COGS
Free-to-Paid Conversion
Abuse Prevented
```

### 7.8 Financial Circuit Breakers

Mandatory:

- per-generation maximum cost;
- per-user daily cost limit;
- per-account free-credit limit;
- per-device/cluster promo limit;
- per-plan cost limit;
- per-provider spend limit;
- global daily GPU budget;
- global monthly GPU budget;
- provider failure circuit breaker;
- automatic disable of economically invalid generation SKUs.

---

## 8. Anti-Multi-Account and Abuse System

Internal feature name:

**SPRYXEL TrustShield**

### 8.1 Principle

Do not rely on one identifier.

Shared IPs, shared computers, schools, offices, coworking spaces, families and VPNs can cause false positives.

Use a **risk graph** and multiple privacy-conscious signals.

### 8.2 Potential Signals

Account signals:
- account age;
- verified email;
- email-domain reputation;
- email reuse patterns;
- phone verification when risk requires it;
- account behavior;
- signup velocity.

Device/browser signals:
- privacy-preserving device fingerprint;
- browser characteristics;
- device stability signals;
- suspicious automation signals;
- headless/bot indicators.

Network signals:
- IP;
- ASN;
- datacenter/VPN/Tor indicators;
- signup velocity by IP/network;
- geo inconsistency.

Payment signals:
- payment-method fingerprint/token from PSP;
- repeated payment instrument across unrelated accounts;
- billing-country mismatch;
- 3DS result;
- payment risk score;
- dispute history.

Usage signals:
- same prompts copied across accounts;
- identical generation timing patterns;
- automated account farming;
- free-credit exhaustion immediately after signup;
- repeated signup → consume → abandon cycles.

Relationship signals:
- shared device clusters;
- shared payment clusters;
- shared network clusters;
- repeated referral loops;
- suspicious account graph density.

### 8.3 Data Minimization

Where possible:

- store hashes/HMAC-derived identifiers rather than raw sensitive identifiers;
- avoid storing raw card data;
- use PSP tokens/fingerprints;
- rotate security secrets;
- define retention periods;
- separate security telemetry from product analytics;
- document fraud-prevention purposes.

### 8.4 Risk Score

Example conceptual score:

```text
0–29   LOW
30–59  MEDIUM
60–79  HIGH
80–100 CRITICAL
```

This is not a finalized numeric model.

### 8.5 Responses

LOW:
- normal access.

MEDIUM:
- CAPTCHA;
- slower promotional-credit unlock;
- additional email verification;
- rate limit.

HIGH:
- require phone verification or payment verification;
- suspend free-credit eligibility;
- require 3DS where supported;
- restrict burst generation;
- queue with manual/automatic review.

CRITICAL:
- deny promotional benefits;
- block suspicious transaction/generation;
- manual review;
- suspend linked abuse cluster where evidence is sufficient.

### 8.6 Important Rule

**Never auto-ban solely because multiple accounts share an IP.**

The system must use multiple signals and provide internal auditability.

### 8.7 Promotional Eligibility

Separate:

```text
Can Create Account
```

from:

```text
Eligible For Free Credits
```

A legitimate person may create another workspace/account for valid reasons while still being ineligible for another promotional grant.

This distinction is important.

---

## 9. Refund, Chargeback and Friendly-Fraud Protection

Internal system name:

**SPRYXEL RevenueShield**

### 9.1 Brazil: Statutory Cooling-Off Risk

Brazil's Consumer Defense Code, Article 49, provides a 7-day withdrawal right for covered contracts made outside a commercial establishment.

The e-commerce regulation (Decree 7.962/2013) requires clear and effective means for the consumer to exercise withdrawal and requires support for cancellation/refund workflows.

Therefore SPRYXEL must **not depend on obstructing the consumer's statutory right** as a fraud-prevention strategy.

### 9.2 Safer Economic Strategy

Use several layers:

#### A. Try-Before-Buy

Provide a small, controlled free trial before payment.

Purpose:
- user can verify quality;
- reduces legitimate buyer remorse;
- reduces "I paid only to test it" refunds.

Trial credits require TrustShield eligibility.

#### B. New-Account Purchase Exposure Cap

During a configurable trust-building period, new accounts may have a limited maximum purchase size or maximum generation throughput.

This is a product/risk rule and must be clearly disclosed. It must not be presented as a restriction on statutory refund rights.

Purpose:
- cap maximum economic loss from a fresh account;
- reduce stolen-card abuse;
- reduce signup → consume everything → disappear attacks.

After sufficient trust/account age, higher limits unlock.

#### C. Seven-Day Revenue Risk Reserve

For Brazilian consumer purchases potentially within the statutory withdrawal period:

```text
Payment received
  ↓
Mark revenue as cooling_off_exposure
  ↓
Do not treat it as fully safe margin
  ↓
Release reserve after risk period expires
```

Financial dashboards must distinguish:
- booked gross sales;
- settlement;
- refund exposure;
- chargeback exposure;
- economically cleared revenue.

#### D. Cost Reserve in Pricing

Pricing must include a refund/friendly-fraud reserve based on measured historical data.

Until enough data exists, use a conservative planning assumption and hard loss caps.

#### E. Immediate Entitlement Freeze on Refund Request

When a refund/withdrawal is requested:

1. stop new paid generation;
2. lock remaining refundable entitlements;
3. snapshot wallet state;
4. snapshot job history;
5. preserve payment and access evidence;
6. process the legally appropriate refund path;
7. record returned funds;
8. reconcile the ledger.

#### F. Generated Asset License State

The Terms of Service may define consequences for refunded transactions and associated licenses, subject to jurisdiction-specific legal review.

However, SPRYXEL **must not rely on post-refund license revocation as its primary economic protection**, because downloaded assets cannot practically be "taken back" and consumer law may limit contractual approaches.

#### G. Dispute Evidence Bundle

For each paid transaction preserve:

- account creation time;
- login history relevant to the transaction;
- IP/network evidence where legally appropriate;
- device/security identifiers where legally appropriate;
- Terms version accepted;
- checkout disclosures;
- invoice/receipt;
- PSP transaction ID;
- 3DS result;
- credit issuance;
- credit consumption ledger;
- generation IDs;
- job timestamps;
- asset previews;
- asset downloads;
- API/MCP usage logs;
- support interactions;
- refund requests;
- cancellation state.

This enables evidence-backed responses to illegitimate chargebacks.

### 9.3 Payment Security

Candidate capabilities:

- 3D Secure.
- PSP fraud scoring.
- card testing protection.
- velocity rules.
- payment-method reuse detection.
- dispute alerts.
- manual review for high-risk events.

Stripe currently offers built-in fraud protection and optional Radar tiers, including multi-account/free-trial/bot abuse signals in higher tiers. Payment-provider selection is not frozen and must be benchmarked against local and international alternatives.

### 9.4 Refund UX

The product should make legitimate refund/cancellation requests clear and auditable.

Goals:
- compliant;
- low support cost;
- deterministic;
- less chargeback escalation;
- full ledger reconciliation.

---

## 10. LGPD / Privacy Requirements for TrustShield

Anti-abuse cannot become uncontrolled surveillance.

Required principles:

- specific fraud-prevention purpose;
- data minimization;
- transparency;
- proportionality;
- access controls;
- retention policy;
- audit logs;
- secure hashing/tokenization;
- separation of duties;
- documented lawful basis;
- rights-request workflow.

Sensitive-data processing must receive additional legal/security review.

---

## 11. Local-First Development Architecture

### 11.1 Primary Goal

The complete core product must be runnable locally through Docker for development and testing.

### 11.2 Proposed Local Stack

```text
Docker Compose
  ├─ web
  ├─ api
  ├─ worker
  ├─ postgres
  ├─ redis / queue
  ├─ object storage emulator / MinIO
  ├─ inference gateway
  ├─ local GPU worker
  ├─ scheduler
  ├─ observability
  └─ test services
```

### 11.3 RTX 5050 Role

The RTX 5050 is the development laboratory.

Use it for:
- inference experiments;
- pipeline development;
- LoRA experiments where feasible;
- post-processing;
- validators;
- benchmarking;
- local integration tests;
- quality comparison.

8 GB VRAM will constrain some large 3D and high-resolution pipelines. Therefore inference must be modular and allow cloud fallback.

---

## 12. Initial Production Infrastructure Strategy

Goal: **near-zero fixed infrastructure cost before meaningful customer traction.**

Candidate stack:

- Frontend/static delivery: Cloudflare Pages or equivalent free commercial-capable tier.
- Edge/API: Cloudflare Workers or equivalent.
- Database/Auth: Supabase Free initially.
- Object storage/CDN: Cloudflare R2 free allowance initially.
- GPU: serverless, pay-per-use.
- Development inference: local RTX 5050.
- Monitoring: free tiers/open-source where practical.
- Email: free transactional tier where practical.

Production providers are implementation candidates, not permanent architectural dependencies.

The architecture must make provider replacement possible.

---

## 13. UI/UX Direction

### 13.1 Design Personality

Premium developer tool + creative studio.

Avoid:
- childish gamer visuals;
- noisy neon overload;
- generic AI chat clone;
- excessive gradients without hierarchy.

Prefer:
- refined dark theme;
- excellent light theme;
- restrained glass surfaces;
- clear hierarchy;
- powerful asset previews;
- smooth micro-interactions;
- high-density professional controls;
- optional command palette;
- keyboard-first workflows;
- accessible contrast;
- responsive layouts.

### 13.2 Main Product Areas

Potential navigation:

```text
Dashboard
Projects
Generate
Characters
Worlds
Animations
Tilesets
3D
Asset Library
Workflows
Models
Jobs
API
MCP
Integrations
Credits
Billing
Usage
Settings
```

### 13.3 Developer Dashboard

Should expose:

- API keys;
- MCP setup;
- CLI setup;
- SDKs;
- webhook logs;
- request logs;
- generation jobs;
- rate limits;
- credit usage;
- cost estimates;
- errors;
- examples.

### 13.4 Admin / Owner Console

Must include:

- users;
- organizations;
- subscriptions;
- credit wallets;
- ledger;
- promotions;
- inference providers;
- models;
- generation costs;
- margin metrics;
- refund exposure;
- chargebacks;
- fraud clusters;
- TrustShield risk events;
- free-credit liability;
- global GPU budget;
- provider outages;
- pricing configuration;
- feature flags;
- country/regional rules;
- audit logs.

---

## 14. Internationalization

Canonical source language for:
- code;
- internal identifiers;
- database;
- APIs;
- documentation;
- developer docs;

is **English**.

UI locales at launch target:

- `en` — default.
- `pt-BR`.
- `es`.

Requirements:
- no hardcoded UI strings;
- locale-aware numbers;
- locale-aware dates;
- currency localization;
- legal content versioned per jurisdiction;
- fallback to English.

---

## 15. Security Baseline

Required from the start:

- secure authentication;
- MFA-ready architecture;
- API-key scopes;
- encrypted secrets;
- short-lived tokens where appropriate;
- signed webhooks;
- rate limiting;
- bot protection;
- CSRF protection where applicable;
- XSS protection;
- SQL injection defenses;
- SSRF protections;
- upload validation;
- image/file scanning where appropriate;
- object-level authorization;
- tenant isolation;
- immutable billing audit logs;
- provenance audit logs;
- administrator RBAC;
- security event logging;
- dependency scanning;
- secret scanning;
- backup/recovery plan.

Financial, authentication and irreversible operations are **HIGH_ASSURANCE** areas.

---

## 16. Architecture Principles

1. Local-first development.
2. Docker reproducibility.
3. Provider independence.
4. Async generation jobs.
5. Idempotent billing.
6. Immutable economic audit trail.
7. Versioned inference pipelines.
8. Versioned pricing rules.
9. Versioned model cost rules.
10. No job without authorization and cost reservation.
11. No promotional benefit without TrustShield evaluation.
12. No raw card storage.
13. No single-signal fraud decisions.
14. Explicit tenant isolation.
15. API-first core.
16. MCP as a first-class product surface.
17. Human UI and agent UI share the same underlying platform capabilities.
18. Provenance by default.
19. Observability by default.
20. Fail closed for financial invariants.

---

## 17. Proposed Delivery Strategy

The final platform scope is broad, but delivery must be incremental.

### Phase 0 — Product/Architecture Planning

**NECESSARY**

- Product Master.
- competitive research;
- business model;
- inference benchmark plan;
- credit economics model;
- anti-abuse model;
- refund/chargeback model;
- legal/compliance review list;
- asset taxonomy;
- model/provider evaluation;
- UX information architecture;
- initial architecture.

### Phase 1 — Foundation / Pixel + 2D MVP

**NECESSARY**

- local Docker stack;
- auth;
- projects;
- Asset Library;
- Spryxel DNA v1;
- image/pixel generation pipeline;
- job queue;
- local GPU worker;
- cloud inference abstraction;
- credit ledger;
- CostGuard;
- TrustShield v1;
- basic billing abstraction;
- provenance;
- API v1;
- MCP v1;
- basic Godot/Unity export;
- English/PT-BR/Spanish framework;
- admin cost dashboard.

### Phase 2 — Advanced 2D / Animation / Tiles

**IMPORTANT**

- character consistency;
- directional characters;
- spritesheet builder;
- animation generation;
- Animation QA;
- tileset generation;
- Seam Engine;
- UI/icon generation;
- project-level Asset Graph.

### Phase 3 — 2.5D

**IMPORTANT**

- isometric generation;
- multi-angle consistency;
- layered assets;
- depth metadata;
- orthographic workflows.

### Phase 4 — 3D

**IMPORTANT / LATER RELEASE**

- text/image-to-3D;
- meshes;
- materials;
- textures;
- UV;
- retopology assistance;
- rigging;
- animation;
- LOD;
- collision;
- engine-ready export.

### Phase 5 — Studio / Team / Enterprise

**FUTURE**

- organizations;
- team roles;
- shared style libraries;
- approval workflows;
- private models;
- enterprise inference;
- audit/export;
- SSO;
- SLA;
- advanced API quotas.

---

## 18. Metrics Required From Day One

Product:
- signup conversion;
- first-generation completion;
- generation success;
- time-to-first-asset;
- asset download rate;
- 7/30-day retention;
- free-to-paid conversion.

Quality:
- accepted generation rate;
- regeneration rate;
- QA failure rate;
- human correction rate;
- consistency score.

Economics:
- COGS per generation type;
- COGS per customer;
- gross contribution per plan;
- free-credit COGS;
- refund rate;
- chargeback rate;
- fraud loss;
- payment fees;
- storage cost;
- GPU utilization;
- revenue per GPU dollar.

Abuse:
- multi-account clusters;
- blocked promo abuse;
- false-positive review rate;
- bot/signup velocity;
- payment-risk distribution.

Infrastructure:
- queue wait time;
- generation latency;
- provider error rate;
- cold-start rate;
- retries;
- GPU seconds;
- availability.

---

## 19. Suggested Proprietary Systems

Working internal names:

- **Spryxel DNA** — project/character/style consistency.
- **Asset Graph** — semantic relationships between game assets.
- **CostGuard** — pre-generation economic authorization and margin protection.
- **TrustShield** — multi-account, promo abuse, bot and fraud risk engine.
- **RevenueShield** — refund, chargeback, reserve and evidence system.
- **Model Router** — model/provider routing by quality/cost/latency.
- **Pixel QA** — pixel-specific validation.
- **Animation QA** — temporal/frame validation.
- **Seam Engine** — tileset continuity validation.
- **Generation Replay** — deterministic/reproducible generation history.
- **Provenance Ledger** — asset origin/license/generation metadata.
- **AgentBridge** — API/MCP/CLI agent integration layer.
- **EngineBridge** — Godot/Unity/Unreal export and integration layer.

These are working product/system names and require later brand/trademark review before public marketing.

---

## 20. Important Business Rule: No-Loss-by-Design

"Never lose money" cannot mathematically mean no individual transaction can ever incur fraud, a refund, outage, or unexpected cost.

The operational objective is:

1. bound maximum loss;
2. price expected losses into unit economics;
3. maintain positive contribution margin under stress assumptions;
4. enforce hard budget ceilings;
5. detect abnormal behavior early;
6. never allow uncapped free or paid generation;
7. measure real costs continuously;
8. automatically disable economically unsafe SKUs/rules.

This makes losses **bounded, observable and funded**, rather than accidental.

---

## 21. Open Decisions for Next Planning Rounds

1. Exact asset taxonomy and generator workflows.
2. Initial open-source models to benchmark on RTX 5050.
3. 2D/pixel quality benchmark suite.
4. 3D provider/model shortlist.
5. Initial credit denomination.
6. Trial credit quantity.
7. Maximum financial exposure per new account.
8. Target plan structure.
9. Monthly vs credit-pack model.
10. Payment providers by region.
11. Formal Brazilian legal review before launch.
12. Domain acquisition.
13. Formal trademark clearance.
14. Brand system/logo.
15. Final technology stack.
16. Database model.
17. API contract.
18. MCP tool contract.
19. UX wireframes.
20. First Definition of Done.

---

## 22. Decisions Ledger — Pre-Repository

### D-001 — Product Name
**Decision:** SPRYXEL  
**Status:** APPROVED FOR PLANNING  
**Note:** Formal trademark/domain clearance required before public launch.

### D-002 — Product Category
**Decision:** AI Game Asset Platform, not generic AI image generator.  
**Status:** APPROVED

### D-003 — Target Audience
**Decision:** Indie developers, solo developers, vibe coders and AI-native game builders.  
**Status:** APPROVED

### D-004 — Asset Scope
**Decision:** Architecture must support pixel, 2D, 2.5D and 3D. Delivery will be incremental.  
**Status:** APPROVED

### D-005 — Developer Interfaces
**Decision:** API and MCP are first-class product surfaces; CLI is planned.  
**Status:** APPROVED

### D-006 — Languages
**Decision:** English canonical/default; PT-BR and Spanish localized UI.  
**Status:** APPROVED

### D-007 — Development Environment
**Decision:** Local-first Docker with RTX 5050 as primary development inference hardware.  
**Status:** APPROVED

### D-008 — Initial Infrastructure
**Decision:** Use free tiers wherever commercially permitted; external GPU is pay-per-use/serverless until scale justifies dedicated capacity.  
**Status:** APPROVED

### D-009 — Credit Economics
**Decision:** Ledger-based credits with pre-generation reservation and CostGuard.  
**Status:** APPROVED

### D-010 — Anti-Abuse
**Decision:** TrustShield risk graph; no single-signal multi-account bans.  
**Status:** APPROVED

### D-011 — Refund Strategy
**Decision:** Do not obstruct statutory rights. Protect the company using trial design, new-account exposure caps, reserves, evidence, antifraud, cost pricing and hard limits.  
**Status:** APPROVED

### D-012 — Commercial Safety
**Decision:** No generation without bounded cost authorization.  
**Status:** APPROVED

---

## 23. Legal / Compliance Research Notes

This section is planning input, not a substitute for legal advice.

### Brazil — Consumer Withdrawal

Brazilian Consumer Defense Code (Law 8.078/1990), Article 49:
- provides a 7-day withdrawal period for covered purchases/services contracted outside a commercial establishment;
- provides for return of amounts paid when the right is exercised.

Brazilian e-commerce regulation (Decree 7.962/2013):
- requires clear information;
- requires effective electronic customer service;
- requires clear and effective means to exercise withdrawal;
- provides that the consumer can exercise withdrawal through the same tool used to contract;
- requires communication to the financial institution/card administrator for cancellation/refund.

### Brazil — Data Protection

LGPD principles relevant to anti-abuse:
- purpose;
- adequacy;
- necessity;
- transparency;
- security;
- prevention;
- accountability.

Fraud prevention and electronic-account security can be legally relevant processing purposes, but implementation must still respect necessity, proportionality and the applicable legal basis.

---

## 24. Research Sources — Initial

Official / primary sources:

- Brazilian Consumer Defense Code, Art. 49:
  https://legis.senado.gov.br/norma/549954/publicacao/34619932
- Decree 7.962/2013 — Brazilian e-commerce rules:
  https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm
- LGPD principles, Brazilian government:
  https://www.gov.br/saude/pt-br/acesso-a-informacao/lgpd/principios
- LGPD processing-basis overview, Brazilian government:
  https://www.gov.br/fazenda/pt-br/acesso-a-informacao/acoes-e-programas/protecao-de-dados-pessoais/perguntas-frequentes/perguntas-frequentes/em-que-hipoteses-pode-ser

Payments / antifraud reference:

- Stripe Brazil pricing:
  https://stripe.com/br/pricing
- Stripe Radar pricing/features:
  https://stripe.com/br/radar/pricing

Brand-search note:

- Public search on 2026-10-01 did not surface a competing game-asset platform using "Spryxel". Public search did surface unrelated usernames. This is not a legal trademark clearance.

---

## 25. Planning Increment Status

### SPR-PLAN-001 — Product Modules & Asset Taxonomy

**Status:** APPROVED / COMPLETED IN MASTER v0.2.0

Objective completed:
- module inventory;
- complete asset taxonomy;
- user workflows;
- agent workflows;
- V1 boundary;
- 2D/2.5D/3D capability matrix;
- dependency graph;
- first release scope;
- first benchmark requirements;
- checkpoint delta.

---

# 26. SPR-PLAN-001 — Product Modules & Asset Taxonomy

## 26.1 Product Organization Principle

SPRYXEL must be organized around **game-development jobs**, not around AI model names.

The user should think in terms of:

```text
Character
World
Tiles
Items
UI
Animation
VFX
3D
Export
```

and not:

```text
Model A
Model B
Diffusion X
Provider Y
Checkpoint Z
```

Models and providers are implementation details selected by the **Model Router**.

This gives SPRYXEL a stable product architecture even as underlying AI technologies change.

---

## 26.2 Top-Level Module Map

### M-01 — Home / Command Center
**Classification:** NECESSARY

Purpose:
- global overview;
- recent projects;
- generation queue;
- credit balance;
- spend status;
- failed jobs;
- recent assets;
- alerts;
- quick actions.

Primary widgets:
- active generations;
- project activity;
- credit usage;
- free-credit exposure;
- cost trends;
- export activity;
- agent/API activity.

---

### M-02 — Projects
**Classification:** NECESSARY

Each project represents one game or one coherent visual production universe.

Capabilities:
- project creation;
- game genre;
- target platform;
- target engine;
- target resolution;
- target asset families;
- project languages;
- visual references;
- project-level instructions;
- project-level budget;
- project-level generation defaults;
- collaborators later;
- archive/restore.

A project owns:
- Spryxel DNA;
- Asset Graph;
- Asset Library;
- workflows;
- generation history;
- exports;
- API/MCP permissions;
- economic usage.

---

### M-03 — Spryxel DNA Studio
**Classification:** NECESSARY

Purpose:
Create and maintain the persistent visual identity of the project.

Subcomponents:
- Art Style DNA;
- Palette DNA;
- Lighting DNA;
- Camera DNA;
- Scale DNA;
- Outline DNA;
- Material DNA;
- Character DNA;
- Environment DNA;
- Animation DNA;
- UI DNA.

Inputs:
- natural language;
- reference images;
- imported assets;
- manually selected rules;
- generated style probes.

Outputs:
- versioned DNA manifest;
- reusable style tokens;
- validation rules;
- generation constraints.

Important:
DNA versions must be immutable after use in published assets. New changes create a new version.

---

### M-04 — Generate Studio
**Classification:** NECESSARY

Universal generation surface.

Modes:
- Text → Asset.
- Image → Asset.
- Asset → Variation.
- Asset → Style Match.
- Asset → Resolution Variant.
- Asset → Direction Variant.
- Asset → Animation.
- Batch Generation.
- Pack Generation.

The Generate Studio must show:
- estimated credit cost before submission;
- estimated resource class;
- expected output count;
- project DNA;
- model route where appropriate;
- advanced controls;
- queue state.

---

### M-05 — Character Studio
**Classification:** NECESSARY

Supports:
- player characters;
- NPCs;
- enemies;
- bosses;
- humanoids;
- creatures;
- monsters;
- pets;
- mounts.

Capabilities:
- character identity creation;
- body/proportion rules;
- face/head identity;
- clothing;
- armor;
- equipment;
- color variants;
- faction variants;
- class variants;
- damage states;
- pose sheets;
- directional views;
- expression sheets;
- animation handoff.

Core requirement:
Once a character identity is approved, downstream generations should reference its Character DNA rather than rely only on fresh prompts.

---

### M-06 — World Studio
**Classification:** NECESSARY

Supports:
- environments;
- biomes;
- rooms;
- dungeons;
- towns;
- interiors;
- exteriors;
- landmarks;
- backgrounds;
- foreground layers;
- modular environment kits.

Capabilities:
- world/faction identity;
- biome definitions;
- prop families;
- architecture rules;
- lighting presets;
- time-of-day variants;
- weather variants;
- environment pack generation.

---

### M-07 — Tileset Studio
**Classification:** NECESSARY

Supports:
- terrain tiles;
- autotiles;
- Wang tiles;
- dual-grid sets;
- 3x3 sets;
- interior tiles;
- dungeon tiles;
- roads;
- water;
- cliffs;
- vegetation;
- walls;
- floors;
- transitions.

Required tools:
- tile preview grid;
- repeat preview;
- seam preview;
- adjacency validation;
- collision metadata later;
- engine preset export.

---

### M-08 — Items & Props Studio
**Classification:** NECESSARY

Categories:
- weapons;
- armor;
- consumables;
- crafting materials;
- food;
- loot;
- quest items;
- furniture;
- environment props;
- containers;
- vehicles;
- decorative objects;
- resource nodes.

Capabilities:
- single asset;
- themed collection;
- rarity ladder;
- material variants;
- damaged/repaired states;
- upgrade progression;
- icon + world-object pairing.

---

### M-09 — UI / HUD Studio
**Classification:** IMPORTANT

Supports:
- inventory icons;
- skill icons;
- buttons;
- frames;
- panels;
- health/mana bars;
- cursor sets;
- status icons;
- minimap components;
- dialog frames;
- shop UI elements;
- badges;
- achievement icons.

Goal:
UI assets must follow the same project visual language rather than feel generated by an unrelated tool.

---

### M-10 — Animation Studio
**Classification:** IMPORTANT

Supports:
- idle;
- walk;
- run;
- attack;
- cast;
- hit;
- block;
- dodge;
- death;
- emotes;
- interaction;
- custom animation.

Capabilities:
- animation generation;
- frame count;
- FPS metadata;
- loop/non-loop;
- anchor point;
- onion-skin preview;
- frame edit;
- frame regenerate;
- Animation QA;
- spritesheet assembly;
- engine export.

---

### M-11 — VFX Studio
**Classification:** IMPORTANT

Supports:
- explosions;
- magic effects;
- hit sparks;
- smoke;
- fire;
- water;
- lightning;
- particles;
- trails;
- status effects;
- environmental effects.

Future extension:
engine-specific particle-system generation.

---

### M-12 — 2.5D / Isometric Studio
**Classification:** IMPORTANT

Supports:
- isometric characters;
- isometric buildings;
- props;
- multi-angle objects;
- layered environments;
- parallax layers;
- orthographic views;
- depth metadata.

Core challenge:
maintaining geometric and style consistency across views.

---

### M-13 — 3D Studio
**Classification:** IMPORTANT / LATER DELIVERY

Supports:
- text/image-to-3D;
- mesh generation;
- mesh refinement;
- texture/material generation;
- UV assistance;
- PBR maps;
- retopology;
- rigging assistance;
- animation;
- LOD;
- collision proxies;
- turntable preview.

The 3D module must use the same Project / DNA / Asset Graph concepts as 2D.

---

### M-14 — Asset Library
**Classification:** NECESSARY

Canonical repository of project assets.

Functions:
- folders/collections;
- tags;
- asset types;
- search;
- filters;
- favorites;
- versions;
- variants;
- lineage;
- approval status;
- generation source;
- engine export status;
- DNA version;
- provenance;
- license state;
- archive.

Asset lifecycle:

```text
DRAFT
→ GENERATED
→ QA_PENDING
→ APPROVED
→ EXPORTED
→ DEPRECATED
→ ARCHIVED
```

---

### M-15 — Asset Graph
**Classification:** NECESSARY

Visual/semantic dependency graph between assets.

Relationship examples:
- character uses weapon;
- animation belongs to character;
- icon represents item;
- material belongs to biome;
- building belongs to faction;
- tile belongs to terrain family;
- asset replaces another version.

Agent use:
The Asset Graph gives AI agents structured project context instead of forcing them to infer relationships from filenames.

---

### M-16 — Workflow / Recipe Studio
**Classification:** IMPORTANT

A workflow is a reusable production recipe.

Examples:
- "Create RPG enemy pack."
- "Create full player character."
- "Create biome starter kit."
- "Create 50 inventory icons."
- "Create eight-direction NPC."
- "Create Godot-ready character pack."

A recipe may contain:
- generator operations;
- dependencies;
- QA gates;
- cost limits;
- retry policy;
- output packaging.

Future:
visual workflow editor.

---

### M-17 — QA Center
**Classification:** NECESSARY

Central quality validation system.

Sub-engines:
- Pixel QA;
- Animation QA;
- Seam Engine;
- Consistency Engine;
- asset-size validation;
- transparency validation;
- naming validation;
- export validation;
- project-DNA compliance.

Output:
- PASS;
- WARN;
- FAIL;
- score breakdown;
- repair suggestions;
- auto-repair eligibility.

No automatic global quality score should hide hard failures. Critical validators remain explicit.

---

### M-18 — Export Center / EngineBridge
**Classification:** NECESSARY

Initial targets:
- raw PNG/WebP;
- spritesheet;
- metadata JSON;
- Godot;
- Unity.

Later:
- Unreal;
- Phaser;
- PixiJS;
- Defold;
- Construct;
- additional pipelines.

Export bundles should be reproducible and versioned.

---

### M-19 — Developer Platform / AgentBridge
**Classification:** NECESSARY

Surfaces:
- REST/HTTP API;
- MCP;
- CLI;
- SDKs later;
- webhooks.

Core principle:
Everything critical available in the human UI should eventually have an agent-safe equivalent unless security or product constraints prohibit it.

---

### M-20 — Jobs / Queue Center
**Classification:** NECESSARY

Purpose:
- queued jobs;
- running jobs;
- completed jobs;
- failed jobs;
- cancelled jobs;
- retries;
- provider status;
- estimated wait;
- generation history.

Economic data:
- reserved credits;
- actual credits;
- variable cost;
- provider;
- GPU class;
- retry cost.

---

### M-21 — Credits / Billing
**Classification:** NECESSARY

Includes:
- wallet;
- credit lots;
- subscriptions;
- credit packs;
- promotional credits;
- invoices;
- payment methods;
- receipts;
- consumption history;
- refunds;
- chargeback status;
- usage forecasts.

---

### M-22 — CostGuard
**Classification:** NECESSARY

Pre-generation economic authorization.

Responsibilities:
- predicted cost;
- max cost;
- credit reservation;
- margin guard;
- plan eligibility;
- global budget;
- provider budget;
- free-credit budget;
- SKU kill switch.

---

### M-23 — TrustShield
**Classification:** NECESSARY

Responsibilities:
- anti-multi-account;
- promo abuse;
- signup abuse;
- bot abuse;
- stolen-payment risk signals;
- suspicious account clusters;
- verification escalation;
- review queue.

---

### M-24 — RevenueShield
**Classification:** NECESSARY

Responsibilities:
- refund exposure;
- chargeback evidence;
- transaction evidence;
- entitlement freeze;
- reserve tracking;
- ledger reconciliation;
- dispute history.

---

### M-25 — Admin / Owner Console
**Classification:** NECESSARY

Owner capabilities:
- users;
- tenants/workspaces;
- projects;
- billing;
- credit grants;
- price tables;
- models/providers;
- risk events;
- refunds;
- disputes;
- jobs;
- GPU spend;
- free-tier exposure;
- feature flags;
- content policy controls;
- localization;
- audit logs.

No high-risk financial mutation may occur without audit logging.

---

### M-26 — Observability & Economics
**Classification:** NECESSARY

Product observability:
- generations;
- success rate;
- latency;
- queue;
- retention.

Infrastructure:
- API latency;
- DB;
- queue;
- worker health;
- GPU provider health.

Economics:
- COGS;
- contribution margin;
- GPU cost;
- free-credit liability;
- refunds;
- chargebacks;
- payment fees.

---

### M-27 — Team / Collaboration
**Classification:** FUTURE

Capabilities:
- organizations;
- roles;
- invitations;
- comments;
- approval workflows;
- shared DNA libraries;
- private team recipes;
- usage budgets;
- asset review.

---

## 26.3 Canonical Asset Taxonomy

Every asset must have one **primary asset type** and may have additional semantic tags.

### A. Character Assets

- Player Character.
- NPC.
- Enemy.
- Boss.
- Creature.
- Pet.
- Mount.
- Companion.
- Character Portrait.
- Bust.
- Face.
- Expression.
- Character Sheet.
- Directional Sheet.
- Pose Sheet.

### B. Character Components

- Hair.
- Headgear.
- Face accessory.
- Torso.
- Legs.
- Gloves.
- Boots.
- Cape.
- Armor.
- Weapon.
- Shield.
- Back item.
- Accessory.
- Aura.

### C. Animation Assets

- Idle.
- Walk.
- Run.
- Jump.
- Fall.
- Land.
- Attack.
- Heavy Attack.
- Ranged Attack.
- Cast.
- Channel.
- Hit.
- Knockback.
- Block.
- Parry.
- Dodge.
- Death.
- Revive.
- Interaction.
- Emote.
- Custom.

### D. Environment Assets

- Background.
- Foreground.
- Parallax Layer.
- Biome.
- Room.
- Interior.
- Exterior.
- Landmark.
- Dungeon.
- Town.
- Village.
- City.
- Cave.
- Forest.
- Desert.
- Snow.
- Swamp.
- Beach.
- Space.
- Sci-Fi Environment.

### E. Tiles

- Ground.
- Floor.
- Wall.
- Cliff.
- Road.
- Path.
- Water.
- Lava.
- Vegetation.
- Transition.
- Corner.
- Edge.
- Autotile.
- Wang Tile.
- Dual Grid Tile.
- Isometric Tile.
- Animated Tile.

### F. Props

- Furniture.
- Container.
- Door.
- Window.
- Sign.
- Lamp.
- Torch.
- Barrel.
- Crate.
- Vegetation Prop.
- Rock.
- Machine.
- Vehicle.
- Crafting Station.
- Interactive Prop.
- Destructible Prop.

### G. Items

- Weapon.
- Armor.
- Shield.
- Accessory.
- Consumable.
- Potion.
- Food.
- Crafting Material.
- Resource.
- Quest Item.
- Currency.
- Key Item.
- Treasure.
- Loot.
- Tool.

### H. UI

- Inventory Icon.
- Skill Icon.
- Status Icon.
- Button.
- Panel.
- Frame.
- Tab.
- Checkbox.
- Slider.
- Cursor.
- Health Bar.
- Resource Bar.
- Minimap Element.
- Dialog Box.
- Tooltip Frame.
- Badge.
- Achievement.
- Logo/Title Element.

### I. VFX

- Impact.
- Explosion.
- Fire.
- Smoke.
- Water.
- Ice.
- Lightning.
- Magic.
- Projectile.
- Trail.
- Aura.
- Buff.
- Debuff.
- Environmental Effect.
- Transition Effect.

### J. 3D Assets

- Character Mesh.
- Creature Mesh.
- Prop Mesh.
- Environment Mesh.
- Building Mesh.
- Vehicle Mesh.
- Weapon Mesh.
- Armor Mesh.
- Material.
- Texture Set.
- Skeleton.
- Rig.
- Animation Clip.
- LOD.
- Collision Mesh.
- Prefab/Scene Package.

---

## 26.4 Asset Metadata Contract — Conceptual

Every asset should eventually support:

```text
asset_id
project_id
asset_type
asset_subtype
name
description
tags
status
version
parent_asset_id
source_asset_ids
dna_version
generation_id
workflow_id
model_id
pipeline_version
seed
width
height
frame_count
fps
directions
palette_id
license_state
provenance_id
qa_status
created_at
updated_at
approved_at
export_targets
```

3D-specific metadata can extend this with:
- vertex count;
- triangle count;
- UV state;
- rig state;
- material slots;
- LOD levels;
- collision state.

---

## 26.5 Asset Family Concept

Assets should be generated and managed as **families**, not merely files.

Example:

```text
Iron Sword
  ├─ World Sprite
  ├─ Inventory Icon
  ├─ Equipped Variant
  ├─ Broken Variant
  ├─ Rare Variant
  └─ Upgrade Variants
```

Another example:

```text
Skeleton Warrior
  ├─ Character Base
  ├─ Portrait
  ├─ Idle
  ├─ Walk
  ├─ Attack
  ├─ Hit
  ├─ Death
  └─ Drop Icon
```

This allows SPRYXEL to produce coherent game-ready packs.

---

## 26.6 Human Workflow — Primary

### WF-H01 — New Project

```text
Sign up
→ Create Project
→ Select engine
→ Select asset style
→ Add references
→ Create Spryxel DNA
→ Run style probes
→ Approve DNA
→ Enter production workspace
```

### WF-H02 — Generate Asset

```text
Choose asset type
→ describe asset
→ select project DNA
→ configure output
→ see estimated credits
→ submit
→ queue
→ generation
→ QA
→ compare variants
→ approve
→ Asset Library
```

### WF-H03 — Generate Complete Character

```text
Create Character Identity
→ approve base
→ lock Character DNA
→ create directional views
→ create poses
→ create animations
→ Animation QA
→ build spritesheet
→ export engine package
```

### WF-H04 — Generate Tileset

```text
Select biome/style
→ define tile dimensions
→ select tile topology
→ generate
→ Seam Engine
→ preview repeated map
→ repair/regenerate failures
→ export engine preset
```

### WF-H05 — Create Asset Pack

```text
Choose recipe
→ define theme
→ select count/budget
→ preview estimated credits
→ generate batch
→ QA
→ approve/reject
→ package
→ export
```

---

## 26.7 Agent Workflow — MCP/API

### WF-A01 — Agent Creates Asset

```text
Agent authenticates
→ reads project capabilities
→ fetches current Project DNA
→ requests cost estimate
→ submits generation request
→ receives job_id
→ observes job state/webhook
→ retrieves QA result
→ accepts or requests bounded retry
→ writes asset to target project
→ records provenance
```

### WF-A02 — Agent Generates Full Character Pack

Agent intent example:

> Create a 32x32 goblin scout matching the current game style with idle, walk, attack and death animations and export it for Godot.

System decomposition:

```text
create_character
→ approve/auto-approve according to policy
→ generate_directions
→ generate_animation(idle)
→ generate_animation(walk)
→ generate_animation(attack)
→ generate_animation(death)
→ validate_character_consistency
→ validate_animation
→ build_spritesheet
→ export_godot
```

CostGuard must evaluate the workflow budget before execution.

### WF-A03 — Agent Budget Safety

Every MCP/API generation request should support:

```text
max_credits
max_cost
max_retries
quality_profile
timeout_policy
```

If the workflow would exceed the caller's limit:
- do not silently spend more;
- return a machine-readable budget error.

---

## 26.8 Agent-Native Design Requirements

SPRYXEL must be designed so an agent can reliably understand the platform.

Requirements:
- stable resource IDs;
- explicit schemas;
- deterministic status enums;
- machine-readable errors;
- idempotency keys;
- cost estimates;
- job polling;
- webhooks;
- pagination;
- scoped API keys;
- MCP tool schemas;
- versioned contracts;
- discoverable capabilities;
- asset metadata;
- provenance;
- bounded retries.

Avoid agent-hostile behavior:
- hidden state;
- ambiguous success responses;
- UI-only operations;
- unpredictable billing;
- undocumented defaults.

---

## 26.9 V1 Boundary

The product vision includes Pixel, 2D, 2.5D and 3D.

However, **V1 must establish the platform core before broadening inference complexity**.

### V1 — NECESSARY

Platform:
- authentication;
- Projects;
- Asset Library;
- Asset Graph v1;
- Spryxel DNA v1;
- Generate Studio;
- Jobs/Queue;
- provenance;
- local Docker stack;
- local GPU worker;
- serverless inference adapter;
- Model Router v1.

Asset production:
- pixel character generation;
- general pixel assets;
- general 2D assets;
- items/props;
- basic environment assets;
- basic tilesets;
- simple spritesheets;
- basic image-to-variation.

Developer:
- API v1;
- MCP v1;
- basic CLI;
- Godot export v1;
- Unity export v1.

Quality:
- Pixel QA v1;
- Consistency Engine v1;
- basic Seam Engine.

Commercial:
- Credit Ledger;
- CostGuard;
- free-credit budget;
- TrustShield v1;
- RevenueShield v1;
- owner admin;
- economics dashboard.

Localization:
- English;
- PT-BR;
- Spanish.

### V1.1 / V1.x — IMPORTANT

- advanced directional characters;
- character identity strengthening;
- advanced tilesets;
- animation generation;
- Animation QA;
- UI/HUD studio;
- VFX studio;
- workflow recipes;
- richer CLI/SDK.

### Later Major Releases

- advanced 2.5D/isometric;
- full 3D generation pipeline;
- rigging;
- LOD;
- team collaboration;
- enterprise.

---

## 26.10 Capability Matrix

| Capability | V1 | V1.x | Later |
|---|---|---|---|
| Pixel characters | Full initial focus | Advanced | Continuous |
| Pixel items/props | Yes | Advanced | Continuous |
| Pixel tilesets | Basic | Advanced | Continuous |
| General 2D | Yes | Advanced | Continuous |
| 2D animation | Basic/limited | Full focus | Continuous |
| UI/HUD | Basic support | Studio | Continuous |
| VFX | Limited | Studio | Continuous |
| 2.5D | Architecture-ready | Experimental | Full |
| Isometric | Limited research | Beta | Full |
| 3D mesh generation | No production promise | R&D | Full |
| 3D texturing | No production promise | R&D | Full |
| Rigging | No | R&D | Full |
| Godot export | Yes | Advanced | Continuous |
| Unity export | Yes | Advanced | Continuous |
| Unreal export | No | Planned | Yes |
| API | Yes | Expanded | Continuous |
| MCP | Yes | Expanded | Continuous |
| CLI | Basic | Full | Continuous |

---

## 26.11 Dependency Graph

Core dependency order:

```text
Identity/Auth
    ↓
Projects
    ↓
Spryxel DNA
    ↓
Asset Metadata + Asset Library
    ↓
Asset Graph
    ↓
Job System
    ↓
Inference Gateway / Model Router
    ↓
CostGuard + Credit Reservation
    ↓
Generation Pipelines
    ↓
QA
    ↓
Approval / Versioning
    ↓
Export
    ↓
API / MCP / CLI automation
```

Cross-cutting systems:

```text
TrustShield
RevenueShield
Observability
Audit
Security
Localization
```

These systems affect multiple layers and cannot be bolted on at the end.

---

## 26.12 Product SKU Concept

A **Generation SKU** is an economically measurable operation.

Examples:

```text
PIXEL_CHARACTER_BASE_V1
PIXEL_CHARACTER_4DIR_V1
PIXEL_ITEM_V1
PIXEL_TILESET_BASIC_V1
IMAGE_VARIATION_V1
ANIMATION_WALK_V1
ASSET_PACK_RPG_ITEMS_V1
```

Each SKU must define:
- expected model route;
- expected GPU class;
- max runtime;
- max retries;
- output count;
- QA cost;
- credit price;
- variable-cost ceiling;
- minimum margin;
- availability by plan.

This is how SPRYXEL can safely change models internally without changing the public product contract.

---

## 26.13 Quality Profiles

Instead of exposing infrastructure details, users may choose a quality profile.

Proposed concepts:

### Draft
- low cost;
- fast;
- ideation;
- lower generation count/quality guarantees.

### Production
- default;
- stronger consistency;
- full QA;
- game-ready target.

### Ultra
- higher-cost pipeline;
- extra passes;
- higher resolution/consistency where supported.

Not every asset type must support every profile.

Exact pricing is deferred until benchmarks.

---

## 26.14 First Benchmark Suite

Before commercial pricing, V1 must have a repeatable benchmark harness.

### Benchmark Categories

#### Pixel Character
At minimum:
- humans;
- fantasy;
- sci-fi;
- monsters;
- armored characters.

#### Items
- weapons;
- armor;
- consumables;
- materials;
- props.

#### Tiles
- grass;
- dirt;
- water;
- stone;
- interiors;
- transitions.

#### 2D
- character;
- item;
- environment;
- icon;
- stylized prop.

### Required Measures

Technical:
- generation latency;
- VRAM;
- RAM;
- GPU seconds;
- failure rate;
- retry rate;
- cold-start impact.

Quality:
- DNA adherence;
- palette adherence;
- identity consistency;
- grid correctness;
- seam pass rate;
- human acceptance rate.

Economics:
- raw inference cost;
- retry cost;
- QA cost;
- postprocessing cost;
- storage cost;
- effective cost per accepted asset.

### Important Metric

Do not use only:

```text
cost per generation
```

Use:

```text
cost per ACCEPTED production asset
```

Example:

If one model costs $0.01 per attempt but only 40% are accepted, while another costs $0.018 but 90% are accepted, the second model may be economically superior.

---

## 26.15 Initial Benchmark Acceptance Targets

These are planning targets and may be adjusted after empirical testing.

V1 baseline targets:
- generation pipeline success: >= 97%;
- billing/ledger correctness: 100% in tested invariants;
- no double charge on idempotent retry;
- failed generation credit reconciliation: 100%;
- job status consistency: 100%;
- critical QA hard-failure detection: deterministic where rule-based;
- reproducible pipeline metadata: 100%;
- bounded generation cost: 100%;
- asset provenance captured: 100%.

Quality scores such as style similarity must not be given hard commercial thresholds until the benchmark method is validated.

---

## 26.16 Differentiation Layers

SPRYXEL should compete through multiple reinforcing layers.

### Layer 1 — Project Memory
Spryxel DNA remembers the game, not just the last prompt.

### Layer 2 — Asset Relationships
Asset Graph connects the visual universe.

### Layer 3 — Production QA
Assets are checked for game-production problems, not merely aesthetics.

### Layer 4 — Agent Native
API/MCP/CLI are core product surfaces.

### Layer 5 — Engine Ready
Outputs target usable game packages rather than isolated files.

### Layer 6 — Economic Intelligence
CostGuard chooses and bounds production economics.

### Layer 7 — Reproducibility
Generation Replay + Provenance Ledger.

### Layer 8 — Pack Generation
Create coherent production packs rather than one-off images.

---

## 26.17 New Product Concepts Added

### Style Capsule
Portable, versioned subset of Spryxel DNA that can be reused across projects or teams when licensing permits.

### Asset Pack Composer
User selects a game-production goal, not individual prompts.

Example:

```text
RPG Forest Starter Pack
- 1 tileset
- 20 props
- 10 item icons
- 5 enemies
- 3 VFX
```

The Composer calculates cost before execution.

### Variant Families
Generate controlled families:
- rarity;
- faction;
- season;
- damage;
- upgrade;
- biome;
- color;
- equipment.

### Repair Instead of Regenerate
Where possible, repair failing regions/frames instead of paying for a complete regeneration.

This can become a major cost advantage.

### Cost-Aware Retry
Retries must not automatically repeat the same expensive pipeline.

The system can:
1. diagnose failure;
2. choose repair;
3. choose cheaper retry;
4. route to stronger model only when needed.

---

## 26.18 Scope Classification Summary

### NECESSARY
- Home.
- Projects.
- Spryxel DNA.
- Generate Studio.
- Character Studio.
- World Studio.
- Tileset Studio.
- Items/Props.
- Asset Library.
- Asset Graph.
- QA Center.
- Export Center.
- API.
- MCP.
- basic CLI.
- Jobs.
- Credits/Billing.
- CostGuard.
- TrustShield.
- RevenueShield.
- Admin.
- Observability.
- localization.
- local Docker.
- local RTX inference.
- serverless inference abstraction.

### IMPORTANT
- Animation Studio.
- advanced tilesets.
- UI/HUD Studio.
- VFX.
- Workflow/Recipe Studio.
- advanced 2.5D.
- advanced engine plugins.
- SDKs.

### FUTURE
- team collaboration;
- enterprise;
- advanced private models;
- full 3D production stack if not yet validated;
- marketplace;
- community asset sharing;
- public Style Capsule marketplace.

### OUT OF SCOPE FOR V1
- video generation;
- music generation;
- voice generation;
- general-purpose graphic design;
- full game engine;
- game hosting;
- game publishing marketplace.

These can only enter a later scope through explicit planning decisions.

---

## 26.19 New Decisions

### D-013 — Product Navigation Model
**Decision:** Organize SPRYXEL by game-production job, not AI model/provider.  
**Status:** APPROVED

### D-014 — Canonical Asset Model
**Decision:** Assets are versioned entities with metadata, lineage, DNA and provenance, not mere files.  
**Status:** APPROVED

### D-015 — Asset Families
**Decision:** SPRYXEL supports coherent asset families/packs as a first-class concept.  
**Status:** APPROVED

### D-016 — V1 Asset Focus
**Decision:** V1 focuses on Pixel + 2D while platform architecture remains ready for 2.5D and 3D.  
**Status:** APPROVED

### D-017 — Model Abstraction
**Decision:** Model/provider selection is hidden behind the Model Router and Generation SKU contracts.  
**Status:** APPROVED

### D-018 — Agent Budgeting
**Decision:** MCP/API calls must support bounded spend/retries and machine-readable budget errors.  
**Status:** APPROVED

### D-019 — Economic Benchmark Metric
**Decision:** Optimize for cost per accepted production asset, not merely cost per inference attempt.  
**Status:** APPROVED

### D-020 — Repair Strategy
**Decision:** Prefer targeted repair over full regeneration when quality and economics justify it.  
**Status:** APPROVED

---

# 27. Updated Open Decisions

1. Exact initial model shortlist for RTX 5050.
2. Benchmark harness implementation design.
3. Final technology stack.
4. Database/data model.
5. Job queue technology.
6. local inference runtime.
7. cloud/serverless GPU provider abstraction.
8. object storage approach.
9. exact Generation SKU list for V1.
10. initial credit denomination.
11. trial credit quantity.
12. maximum financial exposure per new account.
13. target plans and credit packs.
14. payment providers by region.
15. trademark/domain formal clearance.
16. final brand/logo system.
17. API v1 contract.
18. MCP v1 tool contract.
19. CLI v1 contract.
20. UI information architecture and wireframes.
21. first formal Definition of Done.
22. formal Brazilian legal review before commercial launch.

---

# 28. Next Recommended Planning Increment

## SPR-PLAN-002 — Technical Architecture & Local AI Benchmark Strategy

**Classification:** NECESSARY

**Status:** APPROVED / COMPLETED IN MASTER v0.3.0

### Objective

Define the technical architecture that can be developed locally with Docker and the RTX 5050 while preserving a clean path to free-tier web infrastructure and serverless GPU production.

### Required Outputs

- application architecture;
- service boundaries;
- Docker topology;
- local GPU worker architecture;
- Inference Gateway;
- Model Router architecture;
- queue/job architecture;
- storage strategy;
- preliminary database domains;
- model shortlist by asset type;
- RTX 5050 benchmark matrix;
- VRAM fallback strategy;
- cloud inference fallback strategy;
- observability design;
- failure/retry architecture;
- security boundaries;
- first technical risk register;
- architecture decisions.

### STOP CONDITION

Do not select commercial credit prices yet.

Prices can only be frozen after the candidate generation pipelines are benchmarked and real cost-per-accepted-asset measurements exist.

---

## Checkpoint

**Current stage:** PRE-REPOSITORY PRODUCT PLANNING  
**Completed increment:** SPR-PLAN-001 — Product Modules & Asset Taxonomy  
**Verdict:** APPROVED  
**Implementation started:** NO  
**Repository exists:** NO  
**Canonical temporary source:** this file  
**Product name:** SPRYXEL  
**Current Master version:** 0.2.0  
**Next necessary increment:** SPR-PLAN-002 — Technical Architecture & Local AI Benchmark Strategy  
**Known blocker:** none for continued planning  
**Commercial pricing status:** NOT FROZEN — awaiting empirical inference benchmarks  
**Public launch blockers:** trademark/domain clearance, benchmark-backed pricing, payment/legal review, security review, production infrastructure validation.


---

# 29. SPR-PLAN-002 — Technical Architecture & Local AI Benchmark Strategy

**Status:** APPROVED / COMPLETED IN MASTER v0.3.0  
**Risk class:** ELEVATED for generation infrastructure; HIGH_ASSURANCE for billing, credits, fraud and authorization paths.

## 29.1 Quality Doctrine

SPRYXEL is a **production-asset platform**, not a raw diffusion-output gallery.

The application MUST distinguish:

```text
RAW_GENERATION
```

from:

```text
PRODUCTION_ASSET
```

A raw generation is only a candidate.

An asset becomes production-ready only after the required quality gates pass.

### Non-Negotiable Rule

**BROKEN ANATOMY, BROKEN GEOMETRY, WRONG DIMENSIONS, BROKEN ALPHA, INVALID FRAME ALIGNMENT OR FAILED PROJECT-CONTRACT CHECKS MUST NOT BE SILENTLY PROMOTED TO APPROVED ASSETS.**

Examples of defects that must be caught where technically detectable:

- missing hand;
- missing arm;
- missing leg;
- accidental extra limb;
- malformed limb;
- disconnected body region;
- accidental duplicate hand/foot;
- severely malformed fingers at resolutions where fingers are expected to be represented;
- head/body proportion drift;
- character height drift between directions;
- feet floating above/below the project baseline;
- incorrect sprite canvas dimensions;
- inconsistent frame dimensions;
- cropped weapon/body;
- broken transparency;
- anti-aliased edge where prohibited;
- unintended mixed pixel scales;
- animation anchor drift;
- clothing/equipment mutation;
- weapon mutation;
- palette violation;
- tileset seam failure.

### Important Resolution Rule

At very small pixel resolutions, correct anatomy does **not** mean photorealistic anatomical detail.

Example:

```text
16x16 / 24x24 / 32x32
```

A hand may intentionally be represented by only a few pixels.

For small sprites, quality validation focuses on:

- presence of the expected limb;
- correct silhouette;
- correct attachment;
- pose readability;
- left/right consistency;
- proportion;
- absence of accidental extra structures.

At larger sprite resolutions, the validator can require:

- recognizable hand structure;
- finger-group correctness;
- finer joint geometry;
- detailed face consistency.

This requirement prevents the QA system itself from destroying legitimate pixel-art abstraction.

---

## 29.2 Production Asset Contract

Every generation job MUST be compiled into an explicit **Asset Contract** before inference.

Conceptual example:

```yaml
asset_type: character_sprite
archetype: humanoid_biped
target:
  canvas_width: 64
  canvas_height: 64
  frame_width: 64
  frame_height: 64
  transparent_background: true
  baseline_y: 57
  directions: [south, west, east, north]
anatomy:
  arms: 2
  legs: 2
  hands: 2
  feet: 2
  visible_hand_detail: grouped_fingers
style:
  dna_version: dna_018
  palette_id: pal_004
quality:
  profile: production
  hard_integrity_gate: true
budget:
  max_credits: 20
  max_repair_attempts: 2
```

The contract becomes the source of truth for:

- generation;
- QA;
- repair;
- export;
- billing;
- reproducibility.

---

## 29.3 Anatomy Contract

Character/creature generation must compile an anatomy contract from the asset archetype.

### Humanoid Biped

Typical expectations:

- one head;
- one torso;
- two arms;
- two hands unless intentionally hidden/disabled;
- two legs;
- two feet unless intentionally hidden;
- defined left/right relationship;
- joint topology;
- expected visibility by pose.

### Quadruped

Typical expectations:

- one head;
- one torso;
- four legs;
- tail optional/configured;
- paw/hoof configuration;
- pose-specific occlusion rules.

### Winged Creature

Adds:

- wing count;
- wing attachment points;
- wing symmetry/asymmetry contract.

### Arachnid / Multi-Limbed

Adds explicit limb count and topology.

### Mechanical / Non-Biological

Uses a component topology rather than human anatomical assumptions.

### Rule

No universal "human anatomy detector" may be used as the sole authority for every character type.

---

## 29.4 Quality Gate Pipeline

Working system name:

**SPRYXEL Production Gate**

High-level pipeline:

```text
Intent
  ↓
Asset Contract
  ↓
Project / Character DNA
  ↓
Pose / Layout Contract
  ↓
Candidate Generation
  ↓
Structural Segmentation
  ↓
Anatomy / Topology Validation
  ↓
Dimension / Anchor Validation
  ↓
Identity / Style Validation
  ↓
Pixel / Alpha Validation
  ↓
Asset-Specific QA
  ↓
PASS?
 ├─ YES → Production Asset
 └─ NO
      ↓
   Failure Diagnosis
      ↓
   Targeted Repair
      ↓
   Re-run QA
      ↓
   PASS?
      ├─ YES → Production Asset
      └─ NO → bounded retry / FAILED_QUALITY
```

A `FAILED_QUALITY` result must not be charged as if a valid production asset was delivered unless the commercial policy explicitly defines a cheaper failed-attempt charge. Initial planning assumption: user-facing production jobs should refund/release undelivered output credits according to the SKU policy.

---

## 29.5 Dual-Representation Sprite Strategy

For characters and anatomically complex sprites, SPRYXEL should benchmark three approaches.

### Strategy A — Direct Pixel Generation

```text
Prompt + DNA + Pose
→ direct target-resolution sprite
→ Pixel QA
```

Advantages:
- potentially fast;
- cheap;
- native pixel style.

Risks:
- anatomy can collapse at tiny resolution;
- identity consistency may be weak.

### Strategy B — High-Resolution Structural Master

```text
Prompt + DNA + Pose
→ high-resolution structural master
→ Anatomy QA
→ segmentation
→ controlled pixel conversion
→ target-resolution sprite
→ Pixel QA
```

Advantages:
- anatomy can be verified before pixel abstraction;
- reusable master for multiple directions/animations.

Risks:
- conversion can lose pixel-art style;
- additional compute.

### Strategy C — Hybrid Reference-Constrained Pixel Generation

```text
High-resolution anatomy/reference master
        +
target pose/skeleton
        +
Project DNA
        ↓
pixel-specialized generation
        ↓
Pixel QA
```

This is currently the preferred hypothesis for difficult humanoid/creature assets, but it must be proven empirically.

No strategy is frozen until benchmark evidence exists.

---

## 29.6 Structural Validation Signals

QA should use multiple independent signals.

### Deterministic Signals

Highest trust where applicable:

- exact canvas size;
- exact frame size;
- alpha presence;
- transparent-background requirement;
- bounding-box boundaries;
- baseline;
- pivot/anchor;
- frame count;
- palette cardinality;
- pixel grid;
- tile edge equality;
- file format;
- metadata schema.

### Pose / Keypoint Signals

Candidate technologies include:

- DWPose;
- OpenPose-compatible representations;
- future commercial-safe pose models.

Uses:
- body topology;
- joint position;
- pose adherence;
- left/right sanity;
- hand/foot region localization.

Pose estimation is a signal, not a sole authority, especially for highly stylized sprites.

### Segmentation Signals

Candidate technology:
- Segment Anything family or smaller compatible segmenters.

Uses:
- character/background separation;
- isolated body-region validation;
- weapon/prop separation;
- cropped-object detection;
- repair masks.

### Vision-Critic Signals

A vision model may evaluate:

- missing limbs;
- duplicate limbs;
- malformed visible hand;
- pose mismatch;
- identity drift;
- equipment mismatch;
- obvious visual artifacts.

The critic MUST produce structured reasons, not only an opaque score.

### Reference Similarity Signals

For approved Character DNA / Project DNA:
- embedding similarity;
- color distribution;
- silhouette;
- proportions;
- garment/equipment markers.

### Ensemble Principle

No single probabilistic validator can grant production approval for anatomy-sensitive assets.

Approval combines:
- deterministic rules;
- topology/pose;
- semantic vision;
- project contracts.

---

## 29.7 DimensionLock

Working subsystem name:

**DimensionLock**

Purpose:
guarantee that game assets fit their declared production dimensions.

Validates:

- canvas dimensions;
- frame cell dimensions;
- sprite bounding box;
- baseline;
- pivot;
- padding;
- expected occupancy;
- safe margins;
- object not cropped;
- spritesheet grid;
- directional sheet layout.

Example:

```text
Requested:
64x64 frame

Generated:
63x64
→ HARD FAIL

Generated:
64x64 but foot crosses frame boundary
→ HARD FAIL

Generated:
64x64 and character height differs 18% from approved identity
→ CONSISTENCY FAIL
```

---

## 29.8 AnatomyGuard

Working subsystem name:

**AnatomyGuard**

Responsibilities:

- anatomy contract validation;
- expected limb count;
- missing-region detection;
- extra-region detection;
- pose topology;
- joint-angle plausibility;
- visibility/occlusion rules;
- hand/foot inspection when resolution allows;
- region-level defect localization.

Important:
AnatomyGuard may use a higher-resolution structural master even when the final deliverable is a tiny sprite.

This allows SPRYXEL to validate anatomy before the final pixel representation removes detail.

---

## 29.9 SilhouetteGuard

Working subsystem name:

**SilhouetteGuard**

Pixel characters must remain readable at actual game size.

Measures:
- body/limb separation;
- pose readability;
- weapon readability;
- overlap;
- negative space;
- outline coherence;
- directional distinction.

The system should preview assets at:
- 1x;
- 2x;
- 4x;
- nearest-neighbor scaling.

A sprite that only looks correct when zoomed 800% is not automatically game-ready.

---

## 29.10 FrameLock

Working subsystem name:

**FrameLock**

For directional sheets and animations:

- character anchor must remain stable;
- body scale must remain within tolerance;
- floor contact must remain coherent;
- camera must remain stable;
- equipment must not teleport/change;
- palette must remain coherent;
- frame dimensions must match;
- declared animation frame count must match.

FrameLock works together with Animation QA.

---

## 29.11 Targeted Repair Architecture

A quality failure should first become a structured defect.

Example:

```json
{
  "code": "ANATOMY_HAND_MISSING",
  "region": "right_hand",
  "confidence": 0.97,
  "repairable": true
}
```

Repair options:

1. masked inpainting/edit;
2. region regeneration;
3. pose reconditioning;
4. reference-strength adjustment;
5. frame-only regeneration;
6. direction-only regeneration;
7. full asset regeneration as last resort.

### Economic Rule

Repair is attempted only if:

```text
Expected Repair Cost
<
Expected Full Regeneration Cost
```

and predicted quality is acceptable.

CostGuard participates in the repair decision.

---

## 29.12 Candidate Selection Strategy

Production-quality generation may use a bounded candidate pool.

Concept:

```text
Generate N candidates
→ cheap deterministic filters
→ discard obvious failures
→ deeper QA on survivors
→ rank survivors
→ optionally repair best candidate
→ deliver highest-scoring valid asset
```

`N` is SKU- and quality-profile-specific.

The system MUST NOT generate unlimited candidates.

CostGuard must reserve the maximum candidate budget before generation begins.

---

## 29.13 Quality Profiles Revisited

All user-facing profiles must satisfy hard integrity requirements.

### Draft

Purpose:
- ideation;
- quick exploration.

May use:
- fewer candidates;
- faster model;
- lighter aesthetic refinement.

Still MUST NOT intentionally deliver:
- corrupted file;
- invalid dimensions;
- severe structural defect that a hard gate detects.

### Production

Purpose:
- normal game-ready asset.

Includes:
- stronger generation route;
- full required QA;
- repair loop;
- project consistency validation;
- provenance.

### Ultra

Purpose:
- highest supported quality for demanding assets.

May include:
- more candidate exploration;
- stronger models;
- additional repair/refinement pass;
- more expensive consistency validation.

Exact generation counts are deferred to benchmarks.

---

# 30. Technical Architecture

## 30.1 Architecture Style

Recommended architecture:

**Modular Monolith Control Plane + Isolated AI Workers**

Reasoning:
- avoids premature microservice complexity;
- keeps business invariants centralized;
- lets GPU inference scale independently;
- gives clean boundaries for future extraction.

Logical architecture:

```text
                   ┌─────────────────────┐
                   │      Web App        │
                   │   Next/React UI     │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Edge/API Control    │
                   │ Plane + AgentBridge │
                   └──────────┬──────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
   ┌────────────┐      ┌────────────┐      ┌────────────┐
   │  Supabase  │      │     R2     │      │  Billing   │
   │ DB + Auth  │      │  Objects   │      │  Adapter   │
   └──────┬─────┘      └────────────┘      └────────────┘
          │
          ▼
   ┌────────────────┐
   │ Job / Ledger   │
   │ State          │
   └───────┬────────┘
           │
           ▼
   ┌──────────────────┐
   │ Inference Gateway│
   └───────┬──────────┘
           │
      ┌────┴─────────────┐
      │                  │
      ▼                  ▼
┌─────────────┐    ┌─────────────┐
│ Local RTX   │    │ Serverless  │
│ 5050 Worker │    │ GPU Worker  │
└──────┬──────┘    └──────┬──────┘
       │                  │
       └────────┬─────────┘
                ▼
       ┌─────────────────┐
       │ Production Gate │
       │ QA + Repair     │
       └────────┬────────┘
                ▼
           Asset Library
```

---

## 30.2 Recommended Technology Stack

### Frontend

Preferred direction:
- TypeScript;
- React;
- Next.js or equivalent production framework;
- Tailwind CSS;
- accessible component primitives;
- design-system tokens;
- high-quality motion library;
- WebGL/Three.js only where justified for 3D previews.

Final frontend framework version is not frozen until repository creation.

### Edge / API Control Plane

Preferred direction:
- TypeScript;
- lightweight edge-compatible HTTP framework;
- OpenAPI-first public API;
- shared schema validation;
- idempotent mutation endpoints.

Responsibilities:
- auth;
- project operations;
- generation authorization;
- CostGuard calls;
- credit reservation;
- TrustShield checks;
- job creation;
- provider dispatch;
- signed callbacks;
- asset metadata;
- API/MCP surface.

### Database

**PostgreSQL via Supabase initially**

Reasons:
- relational invariants;
- transactions;
- Auth integration;
- Row-Level Security;
- local Docker development;
- free hosted starting tier;
- SQL auditability.

### Authentication

**Supabase Auth initially**, abstracted behind application authorization.

### Queue / Durable Job State

Canonical truth:
- PostgreSQL job table;
- immutable/append-only job events where useful.

Candidate queue:
- Supabase Queues / `pgmq`.

Queue technology must be hidden behind an interface so it can later be replaced.

### Object Storage

Production:
- Cloudflare R2 initially.

Local:
- MinIO or filesystem-compatible S3 emulator.

All application code should use an S3-compatible object-storage interface where possible.

### AI Runtime

Python.

Primary experimental runtime:
- ComfyUI as a workflow laboratory and execution adapter.

Production architecture:
- `inference-worker` with versioned adapters;
- ComfyUI workflows allowed;
- native Diffusers/model-specific execution allowed;
- no business logic inside ComfyUI graphs.

### Observability

- structured JSON logs;
- OpenTelemetry-compatible tracing;
- generation IDs propagated end-to-end;
- local optional metrics stack;
- hosted free-tier telemetry where practical.

---

## 30.3 Why ComfyUI Is an Adapter, Not the Product Core

SPRYXEL may use ComfyUI heavily during development because:

- workflows are easy to prototype;
- model ecosystem support is broad;
- experiments are reproducible;
- the local RTX 5050 can run the same conceptual pipelines later containerized in cloud GPUs.

However:

**SPRYXEL business logic MUST NOT live inside opaque ComfyUI workflows.**

Business rules that stay outside:
- credits;
- authorization;
- risk;
- SKU cost;
- project permissions;
- asset state;
- billing;
- provenance;
- QA verdict policy.

A pipeline may be exported/promoted from ComfyUI into a production worker adapter when stability or performance demands it.

---

## 30.4 Local Docker Topology

Local development should support profiles rather than running everything at once.

### Profile: `core`

```text
web
api
supabase-local
object-storage-local
```

### Profile: `ai`

```text
inference-worker
optional-comfyui
model-cache
```

### Profile: `qa`

```text
qa-worker
validator-models
```

### Profile: `observability`

```text
otel-collector
metrics/log viewer
```

### Important Hardware Constraint

The development machine has:

- RTX 5050;
- 8 GB VRAM;
- 24 GB system RAM.

The full local Supabase stack itself is documented as requiring a meaningful RAM footprint, with official CLI documentation recommending at least roughly 7 GB available to start all services.

Therefore:
- use Docker profiles;
- disable unnecessary local Supabase services;
- do not force large AI model CPU-offload and the full observability stack to run simultaneously;
- benchmark peak RAM and commit a local resource budget.

---

## 30.5 Local Model Cache

Models must not be baked repeatedly into application images.

Use a persistent model cache:

```text
/models
  /generation
  /editing
  /pose
  /segmentation
  /qa
  /loras
```

Requirements:
- checksums;
- model manifest;
- license metadata;
- source URL;
- version;
- size;
- commercial eligibility;
- benchmark status.

---

## 30.6 Model Registry

SPRYXEL needs a first-class Model Registry.

Conceptual fields:

```text
model_id
display_name
provider
version
model_family
tasks
license
commercial_allowed
redistribution_allowed
local_supported
min_vram_profile
recommended_vram
quantization
precision
runtime
quality_status
benchmark_status
deprecated
```

No model can enter a commercial generation SKU unless:
- license status is explicitly reviewed;
- commercial use is permitted;
- benchmark has passed;
- cost route is known.

---

# 31. Initial Model Benchmark Shortlist

This is a benchmark shortlist, not a production commitment.

## 31.1 Z-Image / Z-Image-Turbo

**Priority:** HIGH  
**Role hypothesis:** local draft/production candidate.

Known properties:
- 6B family;
- Apache-2.0;
- broad style support;
- Z-Image foundation variant for flexibility/quality;
- Turbo variant for fast generation;
- official project notes community inference support down to low VRAM through memory-efficient runtimes.

Why test:
- commercially friendly;
- promising fit for an 8 GB development GPU;
- fast Turbo path can be useful for candidate exploration;
- base model can become a stronger production route.

Required benchmarks:
- anatomy;
- pixel-art adaptability;
- LoRA compatibility;
- reference conditioning;
- speed;
- quantized quality loss;
- VRAM/RAM;
- commercial asset quality.

---

## 31.2 FLUX.1-schnell

**Priority:** MEDIUM-HIGH  
**Role hypothesis:** fast commercially permitted baseline / candidate generator.

Known properties:
- Apache-2.0;
- 12B;
- 1–4 step generation;
- ComfyUI/Diffusers ecosystem support.

Why test:
- mature ecosystem;
- fast candidate generation;
- commercially usable model license.

Risk:
- memory footprint;
- may need quantization/offload on RTX 5050;
- not specialized for pixel assets.

---

## 31.3 HiDream-O1-Image

**Priority:** HIGH QUALITY REFERENCE  
**Role hypothesis:** high-quality production/cloud candidate; experimental local path.

Known properties:
- 8B;
- MIT license;
- unified generation/editing;
- subject-driven personalization;
- layout conditioning;
- skeleton conditioning;
- native high-resolution generation.

Why test:
- strong fit for Character DNA;
- skeleton conditioning aligns directly with AnatomyGuard;
- editing supports targeted repair.

Hardware note:
community ComfyUI FP8 packages report roughly 10–11 GB VRAM for straightforward FP8 use, so the 8 GB RTX 5050 path likely requires heavier offload/quantization and may be slow. Local support must be proven rather than assumed.

---

## 31.4 Qwen-Image (Apache-2.0 Generation)

**Priority:** CLOUD / REFERENCE  
**Role hypothesis:** editing/generation reference where hardware permits.

Known properties:
- earlier Qwen-Image weights are Apache-2.0;
- strong image generation/editing family;
- large memory footprint.

Likely not a primary RTX 5050 local model.

---

## 31.5 Qwen-Image-2.1

**Priority:** RESEARCH BENCHMARK ONLY AT PRESENT  
**Commercial production:** DO NOT ENABLE under current planning.

Why:
- very recent;
- 7B visual generation component;
- native RGBA;
- unified generation/editing;
- multiple references;
- strong asset-oriented capabilities.

Blocking issue:
the current model is published under the **Qwen Research License**, not Apache-2.0.

SPRYXEL must not depend on it for paid commercial inference unless licensing is independently reviewed and permits our use case.

---

## 31.6 FLUX.1-dev

**Priority:** RESEARCH/QUALITY REFERENCE ONLY  
**Commercial self-hosted production:** DO NOT ASSUME.

Reason:
current weight license is non-commercial.

Generated-output rights do not automatically mean SPRYXEL may commercially operate the model weights as a SaaS inference backend.

---

## 31.7 Specialized Pixel Models / LoRAs

**Priority:** HIGH, license-dependent.

We should test:
- pixel-specialized LoRAs;
- sprite checkpoints;
- character-style adapters;
- palette-conditioned adapters.

Rule:
No community model or LoRA enters a paid SKU until:
- license verified;
- upstream/base license verified;
- training/use restrictions reviewed;
- provenance documented.

---

# 32. RTX 5050 Benchmark Matrix

## 32.1 Hardware Profiles

### LOCAL-8G

Target:
- RTX 5050 8 GB;
- 24 GB system RAM.

### CLOUD-24G

Target:
- 24 GB production serverless GPU class.

### CLOUD-48G

Only for models/pipelines whose quality advantage justifies higher COGS.

---

## 32.2 Precision Profiles

Benchmark where supported:

- BF16;
- FP16;
- FP8;
- INT8;
- 6-bit;
- 5-bit;
- 4-bit / GGUF or runtime-specific quantization.

Record:
- VRAM;
- RAM;
- latency;
- output quality;
- failure rate;
- model load time;
- first-generation time;
- subsequent-generation time.

---

## 32.3 Resolution Benchmarks

Pixel-target output:
- 16x16;
- 24x24;
- 32x32;
- 48x48;
- 64x64;
- 96x96;
- 128x128.

Structural-master resolutions:
- 256;
- 512;
- 768;
- 1024 where feasible.

General 2D:
- 512;
- 768;
- 1024.

---

## 32.4 Character Benchmark Set

Create a fixed seed/reference suite.

At minimum:

1. unarmored human;
2. armored knight;
3. robed mage;
4. archer with bow;
5. goblin;
6. skeleton;
7. orc;
8. quadruped wolf;
9. winged creature;
10. robot.

Test:
- front;
- back;
- left;
- right;
- 3/4 where relevant;
- idle;
- walk pose;
- attack pose.

---

## 32.5 Anatomy Defect Metrics

Track explicit rates:

```text
missing_limb_rate
extra_limb_rate
hand_failure_rate
foot_failure_rate
weapon_mutation_rate
identity_drift_rate
pose_failure_rate
crop_failure_rate
baseline_failure_rate
dimension_failure_rate
```

These metrics matter more to SPRYXEL than generic "looks nice" ratings.

---

## 32.6 Human Quality Review

Automatic QA is necessary but not sufficient during model qualification.

Each benchmark asset receives:

```text
ACCEPT
ACCEPT_WITH_MINOR_REPAIR
REJECT
```

Reasons are tagged.

We then compute:

```text
First-Pass Acceptance Rate
Repair Success Rate
Final Acceptance Rate
Cost per Accepted Asset
Median Time per Accepted Asset
```

---

## 32.7 Production Model Promotion Gate

A model/pipeline can be promoted from experimental to production only if:

1. license check passes;
2. reliability passes;
3. quality benchmark passes;
4. cost model is known;
5. deterministic asset contracts pass;
6. retry behavior is bounded;
7. provenance is captured;
8. security review passes.

---

# 33. Inference Gateway Architecture

## 33.1 Purpose

The application never calls a model directly from business logic.

All generation goes through:

**Inference Gateway**

Inputs:

```text
generation_sku
asset_contract
project_dna
references
quality_profile
budget
```

Outputs:

```text
job_id
provider_job_id
pipeline_version
estimated_cost
status
```

---

## 33.2 Backend Adapters

Initial adapter interface:

```text
LocalComfyAdapter
LocalNativeAdapter
ServerlessGPUAdapter
ExternalAPIAdapter
```

Future:
- dedicated GPU;
- regional provider;
- studio private worker.

---

## 33.3 Provider Routing

Model Router chooses based on:

- task;
- quality profile;
- Project DNA;
- asset type;
- current queue;
- VRAM requirement;
- historical acceptance rate;
- real cost per accepted asset;
- provider health;
- commercial-license eligibility.

### Critical Rule

**Cheapest inference attempt does not automatically win.**

Routing optimizes:

```text
expected cost per accepted production asset
```

subject to:
- quality floor;
- latency class;
- license;
- availability.

---

# 34. Job State Machine

Canonical states:

```text
CREATED
AUTHORIZED
QUEUED
DISPATCHED
RUNNING
QA_RUNNING
REPAIRING
SUCCEEDED
FAILED_GENERATION
FAILED_QUALITY
CANCELLED
EXPIRED
```

Credit states remain separate from job states.

Never infer billing state from a generic `SUCCEEDED` flag.

---

## 34.1 Idempotency

All mutation surfaces must support idempotency:

- REST;
- MCP;
- CLI;
- webhook processing;
- payment events;
- provider callbacks.

A retry of the same request must not:
- duplicate a generation;
- reserve credits twice;
- charge twice;
- create duplicate assets.

---

## 34.2 Provider Callback Security

Production providers must call back through:
- signed secret/HMAC;
- request timestamp;
- replay protection;
- provider job ID correlation;
- payload validation.

---

# 35. Storage Architecture

## 35.1 Object Classes

Suggested prefixes:

```text
originals/
references/
candidates/
masters/
approved/
exports/
thumbnails/
qa/
provenance/
```

Candidate files may have shorter retention.

Approved/provenance files follow project retention rules.

---

## 35.2 Temporary Candidate Cleanup

To control free-tier storage:

- rejected candidates are short-lived;
- temporary masks are short-lived;
- intermediate masters can be policy-controlled;
- approved assets are retained;
- provenance metadata is retained according to policy.

Never delete evidence required for an open payment dispute or security investigation merely because normal candidate TTL expired.

---

# 36. Production Free-Tier Architecture

Initial production target:

```text
Web/UI
→ Cloudflare free-capable edge/static tier

API / orchestration
→ Cloudflare Worker-class edge runtime

DB/Auth
→ Supabase Free

Object Storage
→ Cloudflare R2 free allowance

GPU
→ serverless pay-per-use

Email
→ free transactional allowance

Generation
→ asynchronous
```

Current platform research confirms:
- Cloudflare Workers Free currently allows 100,000 requests/day;
- Cloudflare Queues is available on Workers Free with 10,000 operations/day;
- R2 currently includes 10 GB-month storage, 1M Class A operations and 10M Class B operations/month free, with free internet egress;
- Supabase CLI can run the local stack through Docker for local development.

These are current planning facts and must be revalidated before deployment because provider limits can change.

---

# 37. Local-to-Cloud Parity

Goal:
the same asset contract should run locally and in production.

Example:

```text
Generation SKU
      ↓
Pipeline Manifest
      ↓
Model Registry
      ↓
Backend Adapter
      ↓
LOCAL RTX 5050
or
SERVERLESS GPU
```

Only the provider changes.

The asset contract, QA policy, provenance schema and billing semantics do not.

---

# 38. Resource Budget for Development Machine

Because the RTX 5050 has 8 GB VRAM and the machine has 24 GB RAM:

### Rules

1. Do not require every development container to run at once.
2. AI containers use Docker profiles.
3. Model loading is explicit.
4. Only one large generation model is resident by default.
5. QA models may be unloaded between stages if necessary.
6. CPU offload is benchmarked for RAM pressure.
7. Windows Docker/WSL memory behavior must be measured.
8. Local OOM is a benchmark failure, not something hidden by repeated retries.

### Desired baseline

Core product development should remain usable even when the GPU model stack is stopped.

---

# 39. Quality Benchmark Scoring

## 39.1 Hard Gates

Binary pass/fail.

Examples:
- exact dimensions;
- file integrity;
- expected frame count;
- no crop;
- required alpha;
- topology where confidently measurable;
- baseline;
- sprite-grid validity.

Hard gate failure = not production-ready.

## 39.2 Soft Scores

Examples:
- aesthetics;
- DNA similarity;
- visual appeal;
- silhouette readability;
- pose adherence;
- palette similarity.

Soft scores help rank candidates but must not override a hard failure.

---

# 40. Golden Asset Suite

SPRYXEL must build its own versioned **Golden Asset Suite**.

Contains:
- prompts;
- references;
- poses;
- DNA manifests;
- expected dimensions;
- acceptance labels;
- known failure examples.

Every pipeline/model change runs against this suite.

Purpose:
detect regressions such as:

```text
new model is prettier
but
hand_failure_rate increased from 2% to 9%
```

Such a model must not be promoted simply because subjective image quality improved.

---

# 41. Defect Corpus

Every rejected generation can optionally contribute anonymized, policy-compliant defect metadata to a **Defect Corpus**.

Categories:

- missing hand;
- extra finger;
- missing leg;
- limb fusion;
- weapon mutation;
- identity drift;
- bad alpha;
- wrong dimensions;
- broken tile seam;
- palette drift;
- frame jitter.

Purpose:
- improve validators;
- regression tests;
- future fine-tuning;
- model routing.

Do not automatically use customer assets for training unless terms, consent and privacy policy explicitly permit it.

---

# 42. Data / Training Principle

Customer assets and references are not automatically a free training dataset.

Required future policy controls:
- training opt-in/opt-out;
- private projects;
- retention;
- deletion;
- enterprise no-training mode;
- provenance;
- dataset licensing.

This is part of product trust.

---

# 43. Security Boundaries

## 43.1 Public Client Never Receives

- service-role DB secrets;
- provider GPU secrets;
- billing secret;
- model-provider secret;
- TrustShield internals;
- object-storage admin credentials.

## 43.2 Signed Uploads

Large input/output asset transfers should use signed object-storage URLs where appropriate rather than proxying binary data through the edge API.

## 43.3 Tenant Isolation

Every project, asset, generation, wallet and API key must be tenant/user scoped.

RLS plus application authorization must be tested.

---

# 44. New Architecture Decisions

### D-021 — Production Asset Gate
**Decision:** Raw AI output cannot become an approved asset without required QA gates.  
**Status:** APPROVED

### D-022 — Anatomy Quality
**Decision:** Anatomy/topology validation is mandatory for applicable character/creature SKUs.  
**Status:** APPROVED

### D-023 — Resolution-Aware Anatomy
**Decision:** Anatomy validation must respect pixel resolution; tiny sprites are validated semantically/silhouette-wise rather than requiring impossible photorealistic finger detail.  
**Status:** APPROVED

### D-024 — Asset Contract
**Decision:** Every generation compiles to an explicit Asset Contract before inference.  
**Status:** APPROVED

### D-025 — Multi-Signal QA
**Decision:** No single probabilistic vision model may be the sole production approval mechanism for anatomy-sensitive assets.  
**Status:** APPROVED

### D-026 — Targeted Repair
**Decision:** Localized repair is preferred to full regeneration when it is cheaper and expected to meet quality.  
**Status:** APPROVED

### D-027 — Model Eligibility
**Decision:** Production models require verified commercial eligibility, quality benchmark and known economics.  
**Status:** APPROVED

### D-028 — Qwen-Image-2.1
**Decision:** Benchmark/research candidate only under current Qwen Research License; not a commercial SPRYXEL production dependency at this stage.  
**Status:** APPROVED

### D-029 — Initial Commercial-Friendly Model Shortlist
**Decision:** Prioritize benchmarking Z-Image, FLUX.1-schnell and HiDream-O1-Image because current published licenses are commercially friendlier (Apache-2.0 / MIT), subject to final license review.  
**Status:** APPROVED

### D-030 — ComfyUI Boundary
**Decision:** ComfyUI is an inference/workflow adapter and R&D environment, not the owner of billing/business invariants.  
**Status:** APPROVED

### D-031 — Control Plane Architecture
**Decision:** Start with a modular-monolith control plane and independently scalable AI workers; no premature microservice split.  
**Status:** APPROVED

### D-032 — PostgreSQL Canonical State
**Decision:** PostgreSQL is canonical for users/projects/assets/jobs/ledger state; transient provider/queue state cannot replace it.  
**Status:** APPROVED

### D-033 — Local Profiles
**Decision:** Docker development uses profiles so 24 GB RAM / 8 GB VRAM are not overwhelmed by unnecessary simultaneous services.  
**Status:** APPROVED

### D-034 — Benchmark Metric
**Decision:** Track explicit anatomy defect rates and cost per accepted asset, not generic image quality alone.  
**Status:** APPROVED

---

# 45. Research References Added in SPR-PLAN-002

Current technical references consulted during this planning increment:

- Qwen-Image-2.1 official repository:
  https://github.com/QwenLM/Qwen-Image-2.1
- Qwen-Image-2.1 license:
  https://huggingface.co/Qwen/Qwen-Image-2.1
- HiDream-O1-Image:
  https://github.com/HiDream-ai/HiDream-O1-Image
- Z-Image:
  https://github.com/Tongyi-MAI/Z-Image
- FLUX.1-schnell:
  https://huggingface.co/black-forest-labs/FLUX.1-schnell
- DWPose:
  https://github.com/IDEA-Research/DWPose
- Segment Anything 3:
  https://ai.meta.com/sam3/
- Supabase local development:
  https://supabase.com/docs/guides/local-development/cli/getting-started
- Supabase Queues / pgmq:
  https://supabase.com/docs/guides/queues
- Cloudflare Workers limits:
  https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare Queues limits/pricing:
  https://developers.cloudflare.com/queues/platform/limits/
- Cloudflare R2 pricing:
  https://developers.cloudflare.com/r2/pricing/

All external licenses, limits and model capabilities must be revalidated before production release.

---

# 46. SPR-PLAN-002 Evidence / Planning Verdict

### Architecture
**APPROVED**

### Local-first feasibility
**APPROVED WITH BENCHMARK OBLIGATION**

The RTX 5050 8 GB is sufficient as a serious development and benchmark machine, but not every high-quality model will fit natively. Quantization/offload and cloud fallback are part of the architecture by design.

### Quality strategy
**APPROVED**

Quality is implemented as:
- contracts;
- controlled generation;
- deterministic checks;
- multi-signal visual QA;
- bounded repair;
- regression benchmarks.

### Commercial model selection
**NOT FROZEN**

Model candidates exist, but no model is approved for paid production until real benchmark and license-review evidence exists.

### Pricing
**NOT FROZEN**

No credit price may be finalized yet.

---

# 47. Next Recommended Planning Increment

## SPR-PLAN-003 — Quality System, Benchmark Protocol & Generation SKU Specification

**Classification:** NECESSARY

### Objective

Turn the quality doctrine into measurable pass/fail specifications and define the first V1 Generation SKUs before repository implementation.

### Required Outputs

1. exact V1 Generation SKU inventory;
2. asset contract schemas per SKU;
3. resolution profiles;
4. humanoid anatomy specification;
5. creature topology specification;
6. DimensionLock rules;
7. AnatomyGuard rule matrix;
8. SilhouetteGuard rules;
9. Pixel QA rule matrix;
10. candidate-selection policy;
11. repair policy;
12. benchmark prompts;
13. golden asset suite structure;
14. human-review rubric;
15. acceptance thresholds;
16. cost fields to capture;
17. benchmark result schema;
18. production-model promotion checklist;
19. quality failure codes;
20. QA observability fields.

### STOP CONDITION

Do not create paid credit prices and do not claim any model is the production winner until SPR-PLAN-003 defines the measurement protocol and the later benchmark execution produces evidence.

---

# 48. Updated Checkpoint

**Current stage:** PRE-REPOSITORY PRODUCT PLANNING  
**Completed increment:** SPR-PLAN-002 — Technical Architecture & Local AI Benchmark Strategy  
**Verdict:** APPROVED  
**Implementation started:** NO  
**Repository exists:** NO  
**Canonical temporary source:** `SPRYXEL-PRODUCT-MASTER.md`  
**Product name:** SPRYXEL  
**Current Master version:** 0.3.0  
**Quality doctrine:** PRODUCTION-GATE / NO RAW GENERATION AUTO-APPROVAL  
**Local development:** Docker + RTX 5050 8 GB + 24 GB RAM  
**Commercial model winner:** NOT SELECTED  
**Commercial pricing:** NOT FROZEN  
**Next necessary increment:** SPR-PLAN-003 — Quality System, Benchmark Protocol & Generation SKU Specification  
**Known blocker for continued planning:** none  
**Implementation gate:** repository + canonical Source Pack + approved first Work Order required before code  
**Public launch blockers:** formal trademark/domain clearance, model license verification, executed benchmark evidence, benchmark-backed pricing, payment/legal review, security review, production infrastructure validation.


---

# 49. SPR-PLAN-003 — Quality System, Benchmark Protocol & Generation SKU Specification

**Status:** APPROVED / COMPLETED IN MASTER v0.4.0  
**Classification:** NECESSARY  
**Primary objective:** turn SPRYXEL quality from subjective preference into measurable production contracts.

---

## 49.1 Quality Model

SPRYXEL quality is split into two independent layers.

### Layer A — Integrity Gate

Binary.

```text
PASS
or
FAIL
```

Integrity Gate asks:

- Is the file valid?
- Is the canvas correct?
- Is anatomy/topology structurally acceptable?
- Is the asset cropped?
- Are required limbs/components present?
- Is transparency valid?
- Is the spritesheet layout valid?
- Is the asset compatible with its declared contract?
- Are critical project constraints respected?

An Integrity Gate failure cannot be overridden by a high aesthetic score.

### Layer B — Production Score

Applied only after Integrity Gate passes.

Measures:

- visual appeal;
- style adherence;
- silhouette clarity;
- pose adherence;
- identity consistency;
- palette cohesion;
- detail quality;
- gameplay readability;
- project fit.

This separation prevents:

```text
beautiful but broken
```

from being selected over:

```text
structurally correct and game-ready
```

---

## 49.2 Canonical Quality Verdicts

All asset QA returns one of:

```text
APPROVED
APPROVED_WITH_MINOR_REPAIR
REPAIR_REQUIRED
REGENERATE_REQUIRED
FAILED_CONTRACT
FAILED_SAFETY
FAILED_TECHNICAL
```

Definitions:

### APPROVED
All mandatory gates passed; no meaningful repair needed.

### APPROVED_WITH_MINOR_REPAIR
All critical gates passed, but deterministic or localized non-creative cleanup is still applied before final export.

Examples:
- one stray edge pixel;
- tiny transparent halo;
- metadata fix;
- palette normalization.

### REPAIR_REQUIRED
A localized defect exists and is economically repairable.

### REGENERATE_REQUIRED
The asset is structurally or compositionally too broken for targeted repair to be economical.

### FAILED_CONTRACT
The output does not satisfy the requested Asset Contract.

### FAILED_SAFETY
The request/output violates applicable safety/content rules.

### FAILED_TECHNICAL
Infrastructure/runtime failure prevented a valid result.

---

# 50. Resolution Profiles

SPRYXEL will use resolution-aware rules.

## 50.1 PX-MICRO

Target sizes:
- 16×16
- 24×24

Use cases:
- tiny icons;
- retro characters;
- tiny enemies;
- map markers.

Quality philosophy:
- silhouette and topology over anatomical detail.

Requirements:
- all expected major body regions represented;
- no accidental extra major limbs;
- clear facing direction;
- no crop;
- exact canvas;
- stable baseline;
- project-approved pixel scale.

Hand rule:
- individual fingers are generally not required;
- hand presence/attachment must remain readable if the pose exposes a hand.

---

## 50.2 PX-STANDARD

Target sizes:
- 32×32
- 48×48

Use cases:
- common game sprites;
- RPG characters;
- enemies;
- items.

Requirements:
- readable body topology;
- left/right limb plausibility;
- hand/foot region presence where visible;
- equipment silhouette;
- stable proportions;
- exact frame dimensions;
- strong baseline consistency.

---

## 50.3 PX-DETAILED

Target sizes:
- 64×64
- 96×96

Use cases:
- detailed player characters;
- larger enemies;
- bosses;
- portraits in pixel style.

Requirements:
- stronger hand/foot readability;
- more explicit joint structure;
- clothing/equipment consistency;
- face/head consistency where relevant;
- higher identity fidelity.

---

## 50.4 PX-HIGH

Target sizes:
- 128×128 and above

Requirements:
- visible anatomy should withstand detailed inspection;
- malformed hands/fingers become material defects;
- face/eyes/equipment details are validated when part of the asset contract.

---

## 50.5 GENERAL-2D

Typical working resolutions:
- 512×512
- 768×768
- 1024×1024
- aspect-ratio variants.

Requirements:
- full anatomy/detail validation where human/creature anatomy is relevant;
- no acceptance of obvious malformed hands, extra fingers, duplicate limbs, fused arms/legs or malformed faces.

---

# 51. V1 Generation SKU Inventory

Credit prices are intentionally omitted.

Each SKU is a production operation with:
- contract;
- cost ceiling;
- QA profile;
- output definition;
- retry policy;
- model-routing policy.

---

## SKU-001 — `PX_CHARACTER_BASE_V1`

Purpose:
generate one approved base pixel character.

Inputs:
- project_id;
- description;
- character archetype;
- resolution profile;
- Project DNA;
- optional references;
- optional palette;
- optional pose.

Outputs:
- one approved transparent PNG;
- thumbnail;
- QA report;
- provenance;
- Character DNA seed record.

Required QA:
- DimensionLock;
- AnatomyGuard;
- SilhouetteGuard;
- Pixel QA;
- DNA consistency;
- alpha validation.

---

## SKU-002 — `PX_CHARACTER_4DIR_V1`

Purpose:
generate a four-direction character set.

Directions:
- south/front;
- west;
- east;
- north/back.

Outputs:
- four approved direction frames;
- combined directional sheet;
- metadata JSON.

Required QA:
- all SKU-001 checks;
- FrameLock;
- direction consistency;
- scale consistency;
- equipment consistency;
- color consistency.

Hard requirement:
all four directions must belong to the same character identity.

---

## SKU-003 — `PX_CHARACTER_VARIANT_V1`

Purpose:
create controlled variants of an approved character.

Variant classes:
- palette;
- faction;
- equipment;
- rarity;
- damage;
- season;
- class/job.

Must preserve:
- identity;
- body proportions;
- target resolution;
- approved project style.

---

## SKU-004 — `PX_ITEM_SINGLE_V1`

Purpose:
generate one item/inventory/world icon.

Asset categories:
- weapon;
- armor;
- potion;
- food;
- material;
- quest item;
- resource;
- accessory.

Required QA:
- exact dimensions;
- alpha;
- silhouette;
- crop;
- project palette;
- item identity;
- anti-alias policy.

---

## SKU-005 — `PX_ITEM_PACK_8_V1`

Purpose:
generate a coherent eight-item pack.

Additional QA:
- family cohesion;
- individual readability;
- no accidental duplicates;
- size normalization;
- consistent lighting/perspective.

---

## SKU-006 — `PX_PROP_SINGLE_V1`

Purpose:
generate a world prop.

Examples:
- barrel;
- crate;
- chair;
- lamp;
- crafting station;
- plant;
- rock;
- sign.

Required QA:
- dimensions;
- alpha;
- baseline;
- perspective consistency;
- project DNA.

---

## SKU-007 — `PX_TILE_SINGLE_V1`

Purpose:
generate one tile.

Required:
- exact tile size;
- no unintended edge leakage;
- tile-class metadata;
- deterministic edge extraction.

---

## SKU-008 — `PX_TILESET_BASIC_V1`

Purpose:
generate a basic game-ready tileset.

Possible topology:
- 3×3;
- Wang;
- dual-grid;
- configured autotile set.

Required QA:
- DimensionLock;
- Seam Engine;
- adjacency checks;
- repeat preview;
- palette/style consistency;
- exact tile count;
- export manifest.

---

## SKU-009 — `PX_ENV_OBJECT_V1`

Purpose:
generate a pixel environment object or landmark.

Examples:
- tree;
- rock formation;
- building;
- shrine;
- machine;
- structure.

Required QA:
- silhouette;
- scale class;
- project perspective;
- crop;
- alpha/background contract.

---

## SKU-010 — `IMG_VARIATION_V1`

Purpose:
create a controlled variation from an approved asset.

Required controls:
- preserve identity;
- preserve dimensions unless explicitly changed;
- declare variation axis;
- lineage link to source asset.

---

## SKU-011 — `TWO_D_CHARACTER_BASE_V1`

Purpose:
generate one general 2D game character.

Required QA:
- full anatomy;
- hands/feet where visible;
- face consistency;
- crop;
- transparency/background;
- project DNA;
- pose.

---

## SKU-012 — `TWO_D_ITEM_V1`

Purpose:
general 2D item/prop generation.

Required QA:
- geometry;
- crop;
- perspective;
- style;
- intended background/alpha.

---

## SKU-013 — `TWO_D_ENV_ASSET_V1`

Purpose:
general 2D environment element.

Required QA:
- declared dimensions;
- perspective;
- style;
- crop;
- compositing contract.

---

## SKU-014 — `SPRITESHEET_ASSEMBLE_V1`

Purpose:
assemble already approved frames into a validated spritesheet.

This SKU does not invent animation frames.

Required QA:
- cell dimensions;
- frame count;
- frame order;
- metadata;
- anchor;
- output format.

---

## SKU-015 — `ASSET_REPAIR_V1`

Purpose:
repair a localized defect in an existing candidate/asset.

Inputs:
- source asset;
- defect code;
- repair mask;
- immutable regions;
- budget.

Output:
- repaired candidate;
- new provenance link;
- QA rerun.

---

# 52. Asset Contract Schemas

## 52.1 Shared Contract Fields

Every V1 generation contract includes:

```text
contract_version
generation_sku
project_id
tenant_id
asset_type
asset_subtype
target_format
quality_profile
project_dna_version
reference_asset_ids
seed_policy
max_candidates
max_repair_attempts
max_retries
max_cost_internal
max_credits_user
```

---

## 52.2 Pixel Contract Fields

```text
canvas_width
canvas_height
frame_width
frame_height
pixel_scale
transparent_background
palette_id
palette_max_colors
outline_policy
anti_alias_policy
baseline_y
pivot_x
pivot_y
safe_margin
occupancy_target
camera
direction
```

---

## 52.3 Character Contract Fields

```text
anatomy_archetype
head_count
arm_count
hand_count
leg_count
foot_count
tail_count
wing_count
expected_visible_regions
allowed_occlusions
body_proportion_profile
equipment_slots
pose_id
identity_reference_id
```

---

## 52.4 Tileset Contract Fields

```text
tile_width
tile_height
topology
required_tile_roles
edge_classes
corner_classes
animated
frame_count
engine_target
```

---

# 53. Humanoid Anatomy Specification

## 53.1 Mandatory Semantic Regions

For a standard biped when visible:

- head;
- neck or valid direct head/torso connection;
- torso;
- left upper arm;
- left lower arm;
- left hand;
- right upper arm;
- right lower arm;
- right hand;
- left upper leg;
- left lower leg;
- left foot;
- right upper leg;
- right lower leg;
- right foot.

Tiny pixel profiles may merge these visually, but the resulting silhouette must still represent the intended topology.

---

## 53.2 Allowed Exceptions

Valid exceptions must be declared in the contract.

Examples:
- one-arm character;
- prosthetic limb;
- hidden hand behind shield;
- cloak concealing legs;
- seated pose;
- amputee character;
- stylized floating character;
- non-human anatomy.

The QA system must not "repair" intentional character traits.

---

## 53.3 Humanoid Hard Failures

Examples:

```text
ANAT_MISSING_REQUIRED_LIMB
ANAT_EXTRA_MAJOR_LIMB
ANAT_DUPLICATE_HAND
ANAT_DUPLICATE_FOOT
ANAT_DISCONNECTED_LIMB
ANAT_FUSED_LEGS_SEVERE
ANAT_TORSO_BREAK
ANAT_HEAD_BODY_DISCONNECT
ANAT_POSE_TOPOLOGY_INVALID
```

Detailed-hand defects become hard failures in profiles where hand detail is expected.

---

# 54. Creature Topology Specification

Every creature type requires an explicit topology profile.

Initial profiles:

```text
HUMANOID_BIPED
QUADRUPED
AVIAN
WINGED_BIPED
SERPENTINE
ARACHNID_8
INSECT_6
SLIME_AMORPHOUS
MECHANICAL_BIPED
MECHANICAL_QUADRUPED
CUSTOM
```

`CUSTOM` requires declared component counts.

Example:

```text
ARACHNID_8
head/body regions: configured
legs: 8
wings: 0
arms: 0
```

An eight-legged spider must not fail a human-anatomy rule for having "extra limbs."

---

# 55. DimensionLock Rules

## 55.1 Exact File Dimensions

Hard rule:

```text
actual_width == contract.canvas_width
actual_height == contract.canvas_height
```

Mismatch:
`DIM_CANVAS_MISMATCH`

---

## 55.2 Frame Dimensions

For sheets:

```text
sheet_width % frame_width == 0
sheet_height % frame_height == 0
```

Expected cell count must match declared frame count.

---

## 55.3 Crop Rule

No required visible semantic region may touch/cross the unsafe crop boundary unless the contract explicitly allows full-bleed composition.

Failure:
`DIM_REQUIRED_REGION_CROPPED`

---

## 55.4 Baseline Tolerance

Planning default:

### PX-MICRO / PX-STANDARD
- target baseline deviation: <= 1 pixel for same identity/direction family where applicable.

### PX-DETAILED / PX-HIGH
- target baseline deviation: <= 2 pixels unless animation intentionally changes vertical position.

### General 2D
- normalized anchor tolerance is asset-specific.

Animation jumps/dodges may override baseline rules through explicit motion contracts.

---

## 55.5 Scale Drift

For directional static character sets:

Planning target:
- body bounding-box height drift <= 5% across directions.

Warning:
- >5% and <=8%.

Fail:
- >8% unless perspective contract explicitly expects it.

These thresholds are provisional and must be validated empirically.

---

# 56. AnatomyGuard Rule Matrix

## 56.1 Critical Rules

| Rule | PX-MICRO | PX-STANDARD | PX-DETAILED | PX-HIGH | 2D |
|---|---:|---:|---:|---:|---:|
| Required major limb exists | HARD | HARD | HARD | HARD | HARD |
| Extra major limb absent | HARD | HARD | HARD | HARD | HARD |
| Limb attached plausibly | HARD | HARD | HARD | HARD | HARD |
| Hand region present if visible | SOFT/HARD by pose | HARD | HARD | HARD | HARD |
| Individual finger detail | N/A | N/A/soft | SOFT | HARD when visible | HARD when visible |
| Foot region plausible | SOFT/HARD | HARD | HARD | HARD | HARD |
| Joint geometry | soft | soft | HARD for severe defect | HARD | HARD |
| Face geometry | N/A/soft | soft | soft/hard | HARD when visible | HARD when visible |

---

# 57. SilhouetteGuard Rules

A game sprite must be readable at play scale.

## 57.1 Required Checks

- body separates from background;
- major limbs do not collapse into unintentional blobs;
- held weapon reads as separate/understandable where expected;
- facing direction is discernible;
- pose is recognizable;
- overlapping parts preserve useful negative space;
- outline treatment matches Project DNA.

---

## 57.2 Preview Test

Every pixel character benchmark generates:
- 1× nearest-neighbor view;
- 2× nearest-neighbor view;
- 4× nearest-neighbor view.

Human reviewers score the 1×/2× views, not only enlarged inspection.

---

# 58. Pixel QA Rule Matrix

## 58.1 Hard Rules

Where contract requires:

- exact dimensions;
- no fractional scaling;
- no corrupted alpha;
- no unintended semi-transparent edge;
- no off-grid frame;
- no invalid palette index/export;
- no crop.

---

## 58.2 Project-Dependent Rules

- maximum palette colors;
- outline thickness;
- anti-alias policy;
- dithering;
- highlight direction;
- shadow direction;
- pixel cluster style.

These are driven by Project DNA.

---

## 58.3 Mixel Detection

A `mixel` is an unintended mixture of incompatible pixel scales.

Pixel QA should detect suspicious local scaling/cluster patterns.

Because stylized exceptions exist:
- strong detections can hard fail;
- ambiguous detections warn for review.

---

# 59. FrameLock Rules

For static directional sets:

- consistent identity;
- consistent equipment;
- same palette family;
- same body scale;
- stable baseline;
- compatible camera;
- no unexpected mirroring artifacts.

For animation later:

- anchor trajectory;
- intended motion path;
- loop closure;
- temporal identity;
- frame-to-frame equipment stability.

---

# 60. Candidate Selection Policy

## 60.1 Default Strategy

Each SKU defines:

```text
min_candidates
max_candidates
```

No unbounded generation.

### Draft
Typical planning range:
- 1–2 candidates.

### Production
Typical planning range:
- 2–4 candidates.

### Ultra
Typical planning range:
- 3–6 candidates.

These are maximum planning ranges, not final production defaults.

---

## 60.2 Candidate Funnel

```text
Candidate Generation
↓
Cheap Deterministic QA
↓
Structural QA
↓
Semantic QA
↓
Production Score
↓
Select best valid candidate
↓
Optional Repair
↓
Final QA
```

Expensive QA should not run on obviously invalid files.

---

# 61. Repair Policy

## 61.1 Repair Levels

### R0 — Deterministic Cleanup
Examples:
- remove stray edge pixels;
- normalize canvas;
- metadata;
- alpha cleanup.

### R1 — Local Pixel Repair
Examples:
- small outline break;
- one-pixel artifact;
- tiny disconnected cluster.

### R2 — Semantic Region Repair
Examples:
- hand;
- weapon;
- face;
- foot;
- localized armor.

### R3 — Structural Repair
Examples:
- pose region;
- body proportion;
- direction-specific reconstruction.

### R4 — Full Regeneration
Used when repair is unlikely to preserve quality/economics.

---

## 61.2 Repair Decision

Conceptual rule:

```text
if expected_repair_success * asset_value
   and expected_repair_cost < expected_regeneration_cost:
       repair
else:
       regenerate
```

Actual decision engine must be deterministic, configurable and logged.

---

## 61.3 Repair Attempt Limit

Every SKU defines `max_repair_attempts`.

Default planning ceiling:
- Production: 2
- Ultra: 3

No infinite repair loops.

---

# 62. Quality Failure Code Catalog v1

## File / Format

```text
FILE_CORRUPT
FILE_UNSUPPORTED_FORMAT
FILE_ALPHA_INVALID
FILE_TRANSPARENCY_REQUIRED
```

## Dimensions

```text
DIM_CANVAS_MISMATCH
DIM_FRAME_MISMATCH
DIM_SHEET_GRID_INVALID
DIM_REQUIRED_REGION_CROPPED
DIM_BASELINE_DRIFT
DIM_SCALE_DRIFT
DIM_PADDING_INVALID
DIM_PIVOT_INVALID
```

## Anatomy

```text
ANAT_MISSING_REQUIRED_LIMB
ANAT_EXTRA_MAJOR_LIMB
ANAT_DUPLICATE_HAND
ANAT_DUPLICATE_FOOT
ANAT_DISCONNECTED_LIMB
ANAT_FUSED_LIMBS
ANAT_HAND_MALFORMED
ANAT_FOOT_MALFORMED
ANAT_FINGER_MALFORMED
ANAT_FACE_MALFORMED
ANAT_TORSO_BREAK
ANAT_HEAD_BODY_DISCONNECT
ANAT_POSE_TOPOLOGY_INVALID
ANAT_CREATURE_TOPOLOGY_INVALID
```

## Identity / Consistency

```text
ID_CHARACTER_DRIFT
ID_FACE_DRIFT
ID_EQUIPMENT_MUTATION
ID_WEAPON_MUTATION
ID_PALETTE_DRIFT
ID_SCALE_DRIFT
ID_STYLE_DRIFT
```

## Pixel

```text
PIX_OFF_GRID
PIX_UNWANTED_AA
PIX_MIXEL
PIX_OUTLINE_BREAK
PIX_PALETTE_OVERFLOW
PIX_CLUSTER_NOISE
PIX_STRAY_PIXEL
```

## Tiles

```text
TILE_SEAM_HORIZONTAL
TILE_SEAM_VERTICAL
TILE_CORNER_INVALID
TILE_ADJACENCY_INVALID
TILE_ROLE_MISSING
TILE_REPEAT_ARTIFACT
```

## Generation

```text
GEN_MODEL_FAILURE
GEN_TIMEOUT
GEN_OOM
GEN_PROVIDER_FAILURE
GEN_EMPTY_OUTPUT
GEN_POLICY_BLOCK
```

## QA

```text
QA_MODEL_FAILURE
QA_LOW_CONFIDENCE
QA_CONFLICTING_SIGNALS
QA_REVIEW_REQUIRED
```

---

# 63. Production Score v1

Only valid candidates receive a score.

Planning weighted dimensions:

```text
Structural Confidence       25%
Project DNA Adherence       20%
Identity Consistency        20%
Gameplay Readability        15%
Aesthetic Quality           10%
Technical Cleanliness       10%
```

Important:
weights vary by asset family.

For tilesets:
- Seam/adjacency replaces anatomy/identity weights.

For items:
- silhouette/readability becomes more important.

A hard gate failure always overrides this score.

---

# 64. Human Review Rubric

Each review dimension uses 1–5.

## 64.1 Anatomy / Geometry

5:
- no meaningful defect;
- plausible and intentional structure.

4:
- minor imperfection not visible in normal gameplay.

3:
- noticeable issue requiring minor repair.

2:
- obvious malformed anatomy/geometry.

1:
- unusable.

---

## 64.2 Identity Consistency

5:
- unmistakably same approved identity.

4:
- minor drift.

3:
- visible drift but repairable.

2:
- major identity change.

1:
- effectively another character/object.

---

## 64.3 Style / DNA Adherence

5:
- fully belongs to project.

4:
- minor divergence.

3:
- mixed style.

2:
- strong divergence.

1:
- unrelated visual style.

---

## 64.4 Gameplay Readability

5:
- immediately readable at actual target scale.

4:
- clear with minimal ambiguity.

3:
- usable but weak.

2:
- confusing.

1:
- unreadable.

---

## 64.5 Production Usefulness

5:
- can ship without creative rework.

4:
- tiny cleanup only.

3:
- repair required.

2:
- major rework.

1:
- discard.

---

# 65. Acceptance Thresholds

Initial qualification targets.

## 65.1 Per-Asset

To become `APPROVED`:

- all hard gates pass;
- no critical defect;
- production usefulness >= 4/5 during qualification;
- anatomy/geometry >= 4/5 where applicable;
- style adherence >= 4/5;
- gameplay readability >= 4/5.

These manual scores are required during model qualification, not necessarily for every production asset forever.

---

## 65.2 Pipeline Qualification

Before a generation pipeline is eligible for paid Production:

### Reliability
- successful technical completion >= 97%.

### Critical Integrity
Target:
- 0 known critical deterministic contract violations among delivered approved assets.

### Human Acceptance
Initial target:
- final accepted production asset rate >= 90% after bounded repair.

### First-Pass Acceptance
Initial target:
- >= 70% for mature V1 SKUs.

A lower first-pass rate may be temporarily tolerated if:
- repair success is high;
- cost per accepted asset remains within economic target;
- latency remains acceptable.

### Cost
- cost per accepted asset must be measurable;
- worst-case bounded cost must be known.

These are initial qualification targets and may be tightened after real benchmark data.

---

# 66. Benchmark Protocol

## 66.1 Benchmark Phases

### Phase A — Smoke
Purpose:
verify the pipeline runs.

Per scenario:
- 2–3 outputs.

No quality conclusion.

### Phase B — Local Candidate Benchmark
Purpose:
compare candidate models/workflows cheaply on RTX 5050.

Per scenario:
- minimum 10 outputs where practical.

### Phase C — Qualification Benchmark
Purpose:
production eligibility.

Target:
- at least 30 outputs per key scenario when economically practical;
- enough total samples to expose recurrent defects;
- fixed benchmark version.

Cloud qualification can be phased to control spend.

---

## 66.2 Fixed Variables

Record:
- prompt;
- negative prompt;
- references;
- pose;
- Project DNA version;
- model;
- model hash;
- runtime;
- quantization;
- sampler/scheduler if applicable;
- seed;
- resolution;
- steps;
- guidance;
- device;
- pipeline version.

---

## 66.3 Warm/Cold Measurements

Measure separately:
- model load time;
- cold first generation;
- warm subsequent generation.

For serverless:
- cold-start time;
- billed cold-start cost;
- warm generation cost.

---

# 67. Golden Asset Suite v1

## 67.1 Characters

### G-CHAR-001 — Knight
- humanoid;
- sword;
- armor;
- readable hands;
- asymmetrical equipment.

### G-CHAR-002 — Mage
- robe;
- staff;
- hands visible;
- cloth silhouette.

### G-CHAR-003 — Archer
- bow;
- quiver;
- difficult hand/weapon interaction.

### G-CHAR-004 — Goblin
- stylized non-human humanoid.

### G-CHAR-005 — Skeleton
- difficult topology/readability.

### G-CHAR-006 — Orc
- large proportions.

### G-CHAR-007 — Wolf
- quadruped.

### G-CHAR-008 — Winged Imp
- winged creature.

### G-CHAR-009 — Spider
- eight-leg topology.

### G-CHAR-010 — Robot
- mechanical biped.

---

## 67.2 Items

### G-ITEM-001 — Sword
### G-ITEM-002 — Bow
### G-ITEM-003 — Potion
### G-ITEM-004 — Helmet
### G-ITEM-005 — Crystal
### G-ITEM-006 — Food
### G-ITEM-007 — Key
### G-ITEM-008 — Shield

Test:
- silhouette;
- palette;
- crop;
- family cohesion.

---

## 67.3 Tiles

### G-TILE-001 — Grass
### G-TILE-002 — Dirt
### G-TILE-003 — Water
### G-TILE-004 — Stone
### G-TILE-005 — Interior Floor
### G-TILE-006 — Wall
### G-TILE-007 — Grass/Dirt Transition
### G-TILE-008 — Water/Grass Transition

---

## 67.4 2D General

### G-2D-001 — Fantasy Human
### G-2D-002 — Sci-Fi Human
### G-2D-003 — Creature
### G-2D-004 — Weapon
### G-2D-005 — Environment Prop

---

# 68. Benchmark Prompt Structure

Prompts themselves will be versioned data, not undocumented strings.

Template fields:

```text
benchmark_id
asset_type
subject
style
camera
pose
lighting
palette
equipment
background
target_resolution
negative_constraints
expected_regions
references
```

Example concept:

```text
subject:
  armored medieval knight

pose:
  standing neutral, sword in right hand

hard constraints:
  two arms
  two legs
  both hands present
  sword fully visible
  no crop
  transparent background
  exact 64×64 pixel canvas
```

The final benchmark prompt text is generated from structured fields.

---

# 69. Cost Capture Schema

Every generation attempt records:

```text
generation_attempt_id
generation_sku
model_id
provider_id
gpu_type
started_at
completed_at
gpu_seconds
wall_seconds
provider_cost
api_cost
storage_write_cost_estimate
storage_retention_cost_estimate
qa_compute_cost
repair_compute_cost
retry_cost
candidate_count
accepted
failure_codes
```

Derived:

```text
raw_cost_per_attempt
total_job_cost
cost_per_valid_candidate
cost_per_accepted_asset
cost_per_delivered_asset
```

---

# 70. Cost Attribution Rules

A production SKU must account for failed attempts.

Example:

```text
attempt 1 = $0.01 FAIL
attempt 2 = $0.01 FAIL
attempt 3 = $0.01 PASS
QA          $0.003
repair      $0.004
```

The economic cost is not:

```text
$0.01
```

It is:

```text
$0.037
```

before allocated reserves/fees.

This rule is mandatory for later credit pricing.

---

# 71. Benchmark Result Schema

Each benchmark result must store:

```text
benchmark_run_id
benchmark_version
pipeline_version
model_version
hardware_profile
precision_profile
scenario_id
seed
technical_status
integrity_verdict
failure_codes
repair_attempts
first_pass_accepted
final_accepted
human_scores
latency
vram_peak
ram_peak
raw_cost
final_cost
```

Aggregates:

```text
technical_success_rate
first_pass_acceptance
final_acceptance
repair_success_rate
critical_defect_rate
hand_failure_rate
limb_failure_rate
dimension_failure_rate
identity_drift_rate
median_latency
p95_latency
median_cost_per_accepted_asset
p95_cost_per_accepted_asset
```

---

# 72. Production Model Promotion Checklist

A pipeline/model cannot power a paid SKU until all items pass.

## Legal
- [ ] model license reviewed;
- [ ] base-model license reviewed;
- [ ] LoRA/adapter license reviewed;
- [ ] commercial SaaS inference permitted;
- [ ] redistribution constraints documented.

## Technical
- [ ] pipeline versioned;
- [ ] model checksum recorded;
- [ ] local/cloud runtime documented;
- [ ] deterministic contract checks pass;
- [ ] OOM behavior documented;
- [ ] timeout policy documented.

## Quality
- [ ] Golden Asset Suite run;
- [ ] critical defect rates reviewed;
- [ ] anatomy benchmark passes;
- [ ] dimension benchmark passes;
- [ ] style/DNA benchmark passes;
- [ ] human review completed.

## Economics
- [ ] cost per accepted asset measured;
- [ ] repair cost measured;
- [ ] p95 cost known;
- [ ] max job cost bounded;
- [ ] CostGuard rule exists.

## Operations
- [ ] provenance captured;
- [ ] logs/metrics available;
- [ ] rollback target exists;
- [ ] previous production model retained for fallback where licensing allows.

---

# 73. Regression Policy

Any change to:

- model;
- quantization;
- sampler;
- pipeline;
- prompt compiler;
- ControlNet/pose system;
- QA model;
- repair model;
- pixel postprocessor;

that can materially alter outputs requires regression benchmarking.

No production promotion based only on:
- screenshots;
- subjective impressions;
- one successful seed.

---

# 74. Quality Release Gate

A release touching generation quality cannot be approved without evidence containing:

- base SHA;
- head SHA;
- changed pipeline IDs;
- benchmark version;
- Golden Asset Suite result;
- before/after metrics;
- critical defect delta;
- cost delta;
- latency delta;
- regression analysis;
- rollback plan.

---

# 75. QA Observability Fields

Dashboard metrics:

## Structural
- hard-gate failure rate;
- anatomy failure rate;
- dimension failure rate;
- alpha/crop failure rate.

## Identity
- character drift rate;
- equipment mutation rate;
- palette drift rate.

## Pixel
- unwanted AA rate;
- mixel rate;
- outline-break rate.

## Repair
- repair attempt rate;
- repair success rate;
- average repair cost;
- repairs per accepted asset.

## Economics
- first-pass cost;
- final accepted cost;
- QA cost percentage;
- repair cost percentage.

---

# 76. Quality Feedback Loop

User actions become quality signals.

Examples:
- regenerate immediately;
- discard;
- approve;
- download;
- export;
- edit;
- report defect.

These signals may improve routing/QA analytics.

Important:
they do not automatically become model-training data without applicable permission.

---

# 77. User-Facing Quality Transparency

The user should see useful quality status without being overloaded.

Example:

```text
Production Ready ✓
Dimensions       ✓
Anatomy          ✓
Project Style    ✓
Transparency     ✓
```

If repair occurred:

```text
Auto-repaired:
right hand region
```

Advanced view can expose detailed QA.

The UI should not expose internal antifraud/security heuristics.

---

# 78. Refund / Quality Interaction

A quality failure is not a successful delivered generation.

Ledger policy must differentiate:

```text
FAILED_TECHNICAL
FAILED_QUALITY
USER_REJECTED_VALID
SUCCESS
```

Commercial policy for each SKU defines:
- reservation;
- committed charge;
- automatic release/refund;
- paid retry eligibility.

No user should lose full production credits because SPRYXEL internally produced a hard-gate-invalid asset.

---

# 79. New Decisions

### D-035 — Dual Quality Layer
**Decision:** Integrity Gate is binary and independent from Production Score.  
**Status:** APPROVED

### D-036 — Critical Defect Supremacy
**Decision:** Aesthetic quality can never override a critical structural failure.  
**Status:** APPROVED

### D-037 — Resolution Profiles
**Decision:** Pixel QA/anatomy rules vary by target resolution.  
**Status:** APPROVED

### D-038 — V1 SKU Contracts
**Decision:** V1 generation operations are versioned SKUs with explicit asset contracts and bounded retries.  
**Status:** APPROVED

### D-039 — Four-Direction Identity
**Decision:** A four-direction character set is accepted only if all directions preserve one character identity.  
**Status:** APPROVED

### D-040 — Baseline / Scale Control
**Decision:** Character families use explicit baseline and scale-drift rules.  
**Status:** APPROVED

### D-041 — Benchmark Promotion
**Decision:** No model/pipeline reaches paid production from subjective review alone.  
**Status:** APPROVED

### D-042 — Golden Asset Suite
**Decision:** Generation changes require versioned regression benchmarks.  
**Status:** APPROVED

### D-043 — Failed Quality Billing
**Decision:** Hard-gate-invalid generation is not treated as a valid delivered production asset for full-charge purposes.  
**Status:** APPROVED

### D-044 — Cost Attribution
**Decision:** Credit economics use the entire attempt/retry/QA/repair cost, not the winning inference only.  
**Status:** APPROVED

---

# 80. SPR-PLAN-003 Verdict

### Quality contract
**APPROVED**

### Anatomy / dimension quality
**APPROVED**

### V1 SKU definition
**APPROVED FOR PLANNING**

Credit values remain intentionally undefined.

### Benchmark protocol
**APPROVED**

### Production model
**NOT SELECTED**

### Credit pricing
**NOT FROZEN**

### Implementation
**NOT STARTED**

No known blocker prevents continued planning.

---

# 81. Next Recommended Planning Increment

## SPR-PLAN-004 — Credit Economics, Pricing Safety & Financial Simulation

**Classification:** NECESSARY / HIGH_ASSURANCE

### Objective

Design the complete financial model before assigning any real credit price.

This increment must define:

1. credit denomination;
2. credit-lot accounting;
3. subscription vs credit-pack structure;
4. free-trial budget;
5. free-credit liability;
6. new-account exposure cap;
7. COGS formula;
8. payment fee allocation;
9. refund reserve;
10. chargeback/fraud reserve;
11. tax reserve inputs;
12. infrastructure allocation;
13. contribution-margin target;
14. stress scenarios;
15. worst-case usage scenarios;
16. provider price shock scenario;
17. FX shock scenario;
18. failure/retry scenario;
19. free-user abuse scenario;
20. break-even calculations;
21. plan-level guardrails;
22. SKU-level minimum price formula;
23. CostGuard financial rules;
24. admin economics dashboard specification.

### Important Constraint

Real public prices still cannot be finalized until generation benchmarks provide measured COGS.

SPR-PLAN-004 will define the formulas, reserves, simulations and safety rails so benchmark results can later be inserted without redesigning the business model.

### STOP CONDITION

Do not publish prices or sell credits until:
- benchmark COGS exists;
- payment-provider costs are verified;
- applicable tax/legal assumptions are reviewed;
- all proposed plans remain contribution-positive under the approved stress scenarios.

---

# 82. Updated Checkpoint

**Current stage:** PRE-REPOSITORY PRODUCT PLANNING  
**Completed increment:** SPR-PLAN-003 — Quality System, Benchmark Protocol & Generation SKU Specification  
**Verdict:** APPROVED  
**Implementation started:** NO  
**Repository exists:** NO  
**Canonical temporary source:** `SPRYXEL-PRODUCT-MASTER.md`  
**Current Master version:** 0.4.0  
**Product quality rule:** NO CRITICAL STRUCTURAL DEFECT MAY BE PROMOTED TO APPROVED ASSET  
**Commercial model winner:** NOT SELECTED  
**Commercial pricing:** NOT FROZEN  
**Next necessary increment:** SPR-PLAN-004 — Credit Economics, Pricing Safety & Financial Simulation  
**Known blocker for continued planning:** none  
**Implementation gate:** repository + canonical Source Pack + approved first Work Order required before code  
**Public launch blockers:** trademark/domain clearance, model license verification, executed benchmark evidence, benchmark-backed pricing, payment/legal review, security review, production infrastructure validation.


---

# 83. SPR-SPECIAL-001 — Maps, Worldbuilding & Game UI/HUD

**Status:** APPROVED / ADDED IN MASTER v0.4.1  
**Classification:** IMPORTANT WITH STRONG DIFFERENTIATION POTENTIAL  
**Purpose:** formalize maps, regions, worldbuilding layouts and game UI/HUD as first-class production surfaces inside SPRYXEL.

## 83.1 Strategic Rationale

Many asset tools generate isolated objects well enough but under-serve:

- world maps;
- region maps;
- zone layouts;
- dungeon structures;
- minimaps;
- biome consistency;
- points of interest;
- navigation readability;
- game UI;
- menus;
- inventory/backpack layouts;
- HUD systems;
- cohesive screen packs.

SPRYXEL should treat these not as secondary decoration, but as **production systems**.

This gives SPRYXEL an important differentiation layer because game developers do not only need "art"; they need **playable world structure and usable interface systems**.

---

## 83.2 Dedicated Product Area

Add a top-level domain:

### **Map & Interface Systems**

This domain spans two connected families:

1. **Map Systems**
2. **Game UI/HUD Systems**

These should share Project DNA and Asset Graph so that:
- a biome map matches environment assets;
- region icons match the item/UI style;
- minimap symbols match HUD style;
- menu frames and inventory/backpack UI match the game's visual language.

---

# 84. Map Systems

## 84.1 Core Product Goal

SPRYXEL should support map creation at multiple layers of abstraction:

```text
WORLD
  ↓
REGION
  ↓
ZONE
  ↓
LOCAL AREA
  ↓
INTERIOR / DUNGEON
  ↓
MINIMAP / NAV VIEW
```

The platform should help generate both:
- visual maps;
- structured map assets usable inside game pipelines.

---

## 84.2 Map Module Family

### M-28 — World Map Studio
**Classification:** IMPORTANT

Supports:
- continent maps;
- planet maps;
- island maps;
- kingdom/faction maps;
- open-world layouts;
- overworld exploration maps;
- stylized fantasy maps;
- sci-fi sector maps;
- post-apocalyptic maps.

Outputs may include:
- rendered world map;
- biome masks;
- region masks;
- point-of-interest layer;
- named settlements;
- route overlays;
- fog-of-war layer;
- stylized parchment version;
- game-UI-ready minimap base.

---

### M-29 — Region / Zone Map Studio
**Classification:** IMPORTANT

Supports:
- provinces;
- kingdoms;
- districts;
- subregions;
- biome zones;
- chapter maps;
- route maps;
- explorable region layouts.

Outputs:
- region map render;
- district masks;
- route networks;
- POI metadata;
- regional icon set;
- local minimap source.

---

### M-30 — Local Area / Battle Map Studio
**Classification:** IMPORTANT

Supports:
- village layouts;
- city districts;
- camps;
- outdoor encounter maps;
- tactical maps;
- field maps;
- quest areas.

Outputs:
- map render;
- collision guide later;
- tile/layout export where applicable;
- prop placement suggestions;
- POI metadata.

---

### M-31 — Dungeon / Interior Map Studio
**Classification:** IMPORTANT

Supports:
- dungeon layouts;
- cave systems;
- houses;
- taverns;
- castles;
- temples;
- labs;
- sci-fi corridors;
- room networks;
- floor plans;
- multi-floor maps later.

Outputs:
- top-down map;
- room graph;
- door/connection metadata;
- thematic prop pack suggestions;
- fog-of-war versions;
- encounter markers.

---

### M-32 — Minimap / Navigation Map Studio
**Classification:** IMPORTANT

Supports:
- circular minimaps;
- square minimaps;
- automap overlays;
- dungeon minimaps;
- world minimaps;
- tactical navigation maps;
- HUD-compatible minimap assets.

Outputs:
- simplified minimap texture;
- icon layers;
- fog layer;
- border/frame;
- player marker set;
- objective marker set;
- legend/overlay assets.

---

### M-33 — Map Export & Layer Studio
**Classification:** IMPORTANT

Purpose:
export structured map layers and metadata.

Target outputs may include:
- flat image;
- layered image pack;
- tilemap source;
- JSON metadata;
- POI list;
- region polygons;
- route graph;
- mask layers;
- icon sheet;
- minimap package.

---

# 85. Map Taxonomy

## 85.1 World Maps

Typical classes:
- continent;
- archipelago;
- planet surface;
- kingdom overview;
- world-atlas page;
- chapter world map;
- exploration world map.

Styles:
- parchment fantasy;
- pixel overworld;
- stylized strategy map;
- painted atlas;
- sci-fi star/sector map;
- tactical abstract map.

---

## 85.2 Region Maps

Typical classes:
- province;
- biome region;
- route region;
- faction territory;
- quest chapter region;
- district map.

---

## 85.3 Local Maps

Typical classes:
- village;
- town;
- city district;
- camp;
- field;
- ruins;
- harbor;
- farm;
- forest clearing.

---

## 85.4 Interior / Dungeon Maps

Typical classes:
- cave;
- crypt;
- sewer;
- house;
- inn;
- castle floor;
- temple;
- lab;
- spaceship section;
- industrial floor;
- prison.

---

## 85.5 Navigation / Minimap Assets

Typical classes:
- minimap base;
- fog-of-war layer;
- revealed layer;
- border/frame;
- player arrow;
- party marker;
- enemy marker;
- objective marker;
- fast-travel marker;
- chest marker;
- quest marker;
- legend icon set.

---

# 86. Map Asset Contract

A map generation should compile a dedicated map contract.

## 86.1 Shared Map Contract Fields

```text
map_scope
map_type
theme
style
perspective
play_context
target_engine
target_output
resolution_profile
dna_version
biome_profile
poi_density
road_density
water_density
settlement_density
structure_density
fog_support
legend_required
layer_requirements
```

---

## 86.2 World Map Fields

```text
continent_count
island_count
major_biomes
faction_count
capital_count
landmark_count
route_style
sea_style
border_style
label_style
```

---

## 86.3 Region Map Fields

```text
region_count
district_count
road_network_type
poi_count
quest_marker_support
travel_route_support
```

---

## 86.4 Dungeon / Interior Fields

```text
room_count
branching_level
linear_vs_open
floor_count
secret_room_count
trap_density
encounter_density
door_count
corridor_style
```

---

## 86.5 Minimap Fields

```text
shape
frame_required
fog_layers
marker_set
icon_style
player_marker
objective_marker
background_simplification_level
```

---

# 87. Map Quality Principles

Maps are not judged only by beauty.

A high-quality map must satisfy some combination of:

- readability;
- navigability;
- layer clarity;
- POI distinction;
- region separation;
- theme coherence;
- game usefulness;
- export usefulness;
- style cohesion with project assets.

## 87.1 Map Integrity Gate

A map may fail if it has issues such as:

- unreadable routes;
- overlapping labels/markers where labels are part of the contract;
- visual clutter beyond threshold;
- invalid legend/icon contrast;
- unusable minimap readability;
- disconnected dungeon graph when connectivity is required;
- impossible door/room relationships when structural export is requested;
- region masks inconsistent with rendered borders;
- broken layer pack.

## 87.2 Map Production Score

Maps that pass integrity can then be ranked by:

- composition;
- readability;
- thematic fit;
- strategic clarity;
- exploration appeal;
- icon clarity;
- minimap clarity;
- worldbuilding value.

---

# 88. Map QA Subsystems

## 88.1 ReadabilityGuard
Validates:
- clear region boundaries;
- readable roads/rivers;
- identifiable POIs;
- minimap icon clarity;
- useful contrast;
- clutter level.

## 88.2 TopologyGuard
Validates structural relationships where map structure is explicit.

Examples:
- dungeon room connectivity;
- route continuity;
- island/landmass segmentation;
- zone adjacency.

## 88.3 LayerGuard
Validates:
- required layers exist;
- mask sizes match render size;
- exported layers align;
- minimap layer set complete.

## 88.4 LegendGuard
Validates:
- icon family consistency;
- legend clarity;
- marker distinctness;
- player/objective readability.

## 88.5 WorldConsistencyGuard
Checks whether:
- biomes fit the project world rules;
- faction colors/symbols match project identity;
- map visual language matches UI/world assets.

---

# 89. Map Output Modes

SPRYXEL should support several output intentions.

## 89.1 Visual-Only
A polished rendered map for display, menus or lore.

## 89.2 Playable-Reference
A map suitable as a reference for manual implementation.

## 89.3 Structured-Export
A map with machine-usable metadata, masks or graphs.

## 89.4 HUD-Minimap
A simplified navigation representation for in-game UI.

## 89.5 Hybrid
Visual render + structured layers.

---

# 90. Worldbuilding Synergy

Maps should connect to the rest of SPRYXEL.

Examples:

```text
World Map
  ├─ Region A
  │   ├─ Village Map
  │   ├─ Dungeon 01
  │   └─ Minimap Set
  ├─ Region B
  └─ Faction Territories
```

Asset Graph relationships can link:
- biome → tileset family;
- region → props;
- region → enemies;
- settlement → buildings;
- dungeon → prop pack;
- world map marker → UI icon;
- faction territory → banner/UI theme.

This makes maps part of the game's production graph, not isolated images.

---

# 91. Procedural + AI Hybrid Direction

A map system should not rely only on pure image generation.

SPRYXEL should be designed to support a hybrid approach:

```text
structured generator
      +
AI rendering
      +
QA
      +
layer export
```

Examples:
- region graph generated procedurally, then rendered artistically;
- dungeon room graph generated structurally, then themed/rendered;
- minimap simplified from a source world layout;
- faction-color layer compiled from world map metadata.

This direction is especially valuable for:
- dungeons;
- interiors;
- route maps;
- strategic maps;
- reproducibility.

---

# 92. Game UI / HUD Systems

## 92.1 Core Goal

UI must become a first-class asset family, not an afterthought.

SPRYXEL should help generate:
- menus;
- HUD;
- inventory/backpack systems;
- panel kits;
- dialog systems;
- shop UI;
- skill trees;
- map screens;
- pause screens;
- title screens;
- settings menus;
- journal/quest log UI;
- crafting UI;
- party UI;
- minimap frames and overlays.

---

## 92.2 Dedicated UI Module Family

### M-34 — UI / HUD Builder
**Classification:** IMPORTANT

Supports:
- HUD kits;
- interface themes;
- panel systems;
- button systems;
- bars;
- cursors;
- frames;
- tooltip systems;
- modal/dialog systems.

### M-35 — Inventory / Backpack UI Studio
**Classification:** IMPORTANT

Supports:
- inventory grids;
- backpack UI;
- equipment paper-doll layouts;
- chest UI;
- loot window;
- drag/drop visual assets;
- slot states;
- rarity frames;
- quantity indicators.

### M-36 — Menu & Screen Builder
**Classification:** IMPORTANT

Supports:
- main menu;
- title screen;
- save/load screen;
- pause menu;
- settings menu;
- quest log;
- map screen;
- character sheet;
- crafting screen;
- shop screen;
- battle result screen.

### M-37 — UI Export & Theme Studio
**Classification:** IMPORTANT

Supports:
- UI theme tokens;
- sliced panel exports;
- icon atlases;
- state packs;
- screen packs;
- UI style consistency.

---

# 93. UI Asset Taxonomy

## 93.1 HUD

- health bar;
- mana/resource bar;
- stamina bar;
- skill hotbar;
- minimap frame;
- compass;
- quest tracker;
- status effect tray;
- action prompts;
- interaction hints;
- cast bar;
- party frames.

## 93.2 Menus

- main menu;
- pause menu;
- settings;
- save/load;
- map screen;
- inventory;
- backpack;
- quest journal;
- codex/bestiary;
- shop;
- forge/crafting;
- dialogue UI;
- character screen;
- social/guild UI later.

## 93.3 Inventory / Backpack

- slot grid;
- rarity border;
- selected state;
- hover state;
- equipped state;
- locked state;
- empty slot;
- stack counter;
- weight/space indicator;
- bag tabs;
- sorting/filter controls;
- backpack frame/theme.

## 93.4 Panel Components

- windows;
- tabs;
- dropdowns;
- toggles;
- sliders;
- checkboxes;
- radio buttons;
- modal frames;
- notification cards;
- progress bars;
- tooltip frames.

---

# 94. UI Contract & QA

## 94.1 UI Contract Fields

```text
ui_surface
screen_type
style_family
theme
target_resolution
aspect_ratio
engine_target
input_mode
state_pack_required
icon_pack_required
slice_export_required
```

State pack examples:
- idle;
- hover;
- pressed;
- disabled;
- selected;
- active;
- error.

## 94.2 UI Quality Principles

A high-quality game UI must satisfy:

- readability;
- clear hierarchy;
- visual consistency;
- gameplay usability;
- interactive-state clarity;
- scalability;
- icon clarity;
- style fit with the project.

## 94.3 UI Integrity Gate

Potential failure conditions:
- unreadable text areas where text placement is part of the contract;
- low-contrast interactions;
- inconsistent state pack;
- broken slice/export alignment;
- icon illegibility;
- clutter;
- panel overlap failure in generated layouts.

---

# 95. Maps + UI Combined Workflows

SPRYXEL should support higher-level packs.

Examples:

### Workflow — `RPG_WORLD_NAV_PACK`
Outputs:
- world map;
- region map set;
- minimap theme;
- map markers;
- fast-travel icons;
- map screen UI frame.

### Workflow — `DUNGEON_NAV_PACK`
Outputs:
- dungeon top-down map;
- automap/minimap;
- room markers;
- treasure marker set;
- boss marker;
- floor-switch UI.

### Workflow — `BACKPACK_UI_PACK`
Outputs:
- backpack/inventory screen;
- slot set;
- equipment panel;
- rarity frames;
- quantity badges;
- tooltip frame;
- icon style sheet.

### Workflow — `MENU_SCREEN_PACK`
Outputs:
- title screen;
- main menu;
- pause menu;
- settings menu;
- panel kit;
- button state pack.

---

# 96. V1 / V1.x / Later Scope for Maps & UI

## V1
- Map-aware architecture.
- Asset taxonomy and contracts.
- World/region/local/dungeon/minimap concepts in the data model.
- basic map visual generation experiments.
- minimap/HUD frame support at concept level.
- inventory/backpack/menu as asset categories and UI concepts.
- UI icon/panel generation support through the broader asset system.

## V1.x
- dedicated World Map Studio.
- dedicated Dungeon/Interior Studio.
- Minimap Studio.
- Menu/Inventory screen packs.
- UI state packs.
- structured map layers.
- map pack workflows.
- stronger export support.

## Later
- procedural+AI hybrid generators.
- tilemap export.
- graph-based dungeon authoring.
- tactical/battle map generators.
- interactive layout editor.
- advanced UI screen composition.
- engine-specific UI export helpers.

---

# 97. New Decisions

### D-045 — Maps as First-Class System
**Decision:** map creation is a dedicated SPRYXEL product domain, not a side feature.  
**Status:** APPROVED

### D-046 — Multi-Layer Map Scope
**Decision:** SPRYXEL must support world, region, local, dungeon/interior and minimap layers conceptually.  
**Status:** APPROVED

### D-047 — Hybrid Map Direction
**Decision:** SPRYXEL should pursue hybrid structured/procedural + AI-assisted map workflows where useful.  
**Status:** APPROVED

### D-048 — UI/HUD as First-Class Asset Family
**Decision:** menus, HUD, inventory/backpack and screen systems are first-class product surfaces.  
**Status:** APPROVED

### D-049 — Maps and UI Share Project DNA
**Decision:** maps, minimaps, markers and UI assets must participate in the same project style system.  
**Status:** APPROVED

### D-050 — Combined Workflow Packs
**Decision:** map/UI bundles such as world navigation packs and backpack UI packs are valid workflow-level outputs.  
**Status:** APPROVED

---

# 98. Updated Strategic Note Before SPR-PLAN-004

The addition of Maps + UI/HUD does **not** replace the next financial planning increment.

Instead, it expands the future SKU/economics surface that SPR-PLAN-004 must consider.

Specific consequence:
- map SKUs and UI pack SKUs will later need their own cost simulation and pricing safety rules.
- hybrid structured map generation may change COGS shape relative to plain image generation.
- menu/inventory/backpack workflows may be more economically similar to pack generation than to single-image generation.

---

# 99. Updated Checkpoint Addendum

**Special addition completed:** SPR-SPECIAL-001 — Maps, Worldbuilding & Game UI/HUD  
**Master version after addition:** 0.4.1  
**Status:** APPROVED  
**Impact:** expands product differentiation and future SKU families  
**Next necessary increment remains:** SPR-PLAN-004 — Credit Economics, Pricing Safety & Financial Simulation


---

# 100. SPR-SPECIAL-002 — Map/UI SKU, Contracts, Export & Agent Automation

**Status:** APPROVED / COMPLETED IN MASTER v0.4.2  
**Classification:** IMPORTANT / PRE-FINANCIAL CATALOG COMPLETION  
**Purpose:** define production SKUs, contracts, QA, exports and agent workflows for maps and game UI before financial modeling.

---

# 101. Map Generation SKUs

Credit prices remain intentionally undefined.

## SKU-MAP-001 — `WORLD_MAP_CONCEPT_V1`

Purpose:
generate one polished visual world map concept.

Outputs:
- world map render;
- thumbnail;
- provenance;
- QA report.

Typical uses:
- lore;
- menu map;
- concept exploration;
- pitch/demo.

Required QA:
- ReadabilityGuard;
- WorldConsistencyGuard;
- output dimension validation;
- label/marker collision check when labels are generated.

---

## SKU-MAP-002 — `WORLD_MAP_STRUCTURED_V1`

Purpose:
generate a world map plus machine-usable structure.

Outputs:
- rendered map;
- region mask;
- biome mask;
- POI layer;
- route layer;
- metadata JSON;
- provenance;
- QA report.

Hard requirements:
- masks aligned to render;
- region IDs unique;
- metadata references valid regions/POIs;
- layer dimensions identical.

---

## SKU-MAP-003 — `REGION_MAP_V1`

Purpose:
generate one regional map derived from or compatible with a parent world map.

Inputs:
- parent map optional;
- region identity;
- biome mix;
- settlements;
- POIs;
- route structure.

Outputs:
- region render;
- POI metadata;
- optional route graph;
- optional region masks.

Required QA:
- WorldConsistencyGuard;
- ReadabilityGuard;
- parent-world consistency when linked.

---

## SKU-MAP-004 — `LOCAL_AREA_MAP_V1`

Purpose:
generate one local playable/reference area.

Examples:
- village;
- forest clearing;
- camp;
- ruins;
- city district;
- harbor.

Outputs:
- local area render;
- optional object/POI placement metadata;
- optional navigation mask.

---

## SKU-MAP-005 — `DUNGEON_GRAPH_V1`

Purpose:
generate a structured dungeon layout before art rendering.

Outputs:
- room graph;
- corridor graph;
- start node;
- exit node;
- optional secret rooms;
- optional boss room;
- metadata JSON;
- schematic preview.

Required QA:
- TopologyGuard;
- reachability validation;
- disconnected-room detection;
- graph integrity.

This SKU should be mostly procedural/structured and relatively low-cost compared with rendered generation.

---

## SKU-MAP-006 — `DUNGEON_RENDER_V1`

Purpose:
render an approved structured dungeon into project style.

Inputs:
- dungeon graph/layout;
- Project DNA;
- biome/theme;
- visual references.

Outputs:
- rendered dungeon map;
- structural overlay;
- optional minimap source.

Required QA:
- topology alignment;
- visual/structural consistency;
- door/room correspondence;
- style consistency.

---

## SKU-MAP-007 — `MINIMAP_PACK_V1`

Purpose:
generate a complete minimap visual kit.

Outputs:
- simplified minimap base;
- frame;
- player marker;
- objective marker;
- quest marker;
- chest marker;
- boss marker;
- optional fog layers;
- icon atlas;
- metadata.

Required QA:
- marker distinguishability;
- readability at actual HUD scale;
- contrast;
- icon-family consistency;
- exact dimensions.

---

## SKU-MAP-008 — `MAP_MARKER_PACK_V1`

Purpose:
generate a coherent marker/icon family.

Marker classes may include:
- player;
- party;
- enemy;
- NPC;
- quest;
- objective;
- boss;
- chest;
- vendor;
- crafting;
- fast travel;
- dungeon;
- town;
- waypoint.

Required QA:
- distinct silhouettes;
- style coherence;
- small-size readability;
- no semantic collisions.

---

## SKU-MAP-009 — `RPG_WORLD_NAV_PACK_V1`

Purpose:
high-level workflow SKU.

Outputs:
- world map;
- selected region maps;
- minimap style;
- marker pack;
- map UI frame;
- route/POI metadata where configured.

CostGuard:
must estimate and reserve the whole workflow before execution.

---

# 102. Game UI / HUD SKUs

## SKU-UI-001 — `HUD_CORE_PACK_V1`

Outputs may include:
- health bar;
- mana/resource bar;
- stamina bar;
- action bar frame;
- minimap frame;
- quest tracker frame;
- status-effect tray;
- interaction prompt style.

Required QA:
- hierarchy;
- readability;
- state consistency;
- project DNA;
- screen-scale legibility.

---

## SKU-UI-002 — `BACKPACK_UI_PACK_V1`

Purpose:
generate a coherent inventory/backpack visual system.

Outputs:
- inventory screen frame;
- backpack panel;
- slot grid visual;
- equipment panel;
- slot states;
- rarity frames;
- quantity badge;
- tooltip frame;
- tab/header treatment;
- empty/selected/locked/equipped states.

Required QA:
- component consistency;
- state coverage;
- alignment/grid;
- icon readability;
- contrast;
- project style.

---

## SKU-UI-003 — `MENU_SCREEN_PACK_V1`

Outputs:
- title/main-menu treatment;
- pause menu;
- settings menu;
- common panel kit;
- button states;
- tabs;
- modal/dialog frame.

Required QA:
- consistent component language;
- state-pack completeness;
- readable hierarchy;
- no incompatible visual variants.

---

## SKU-UI-004 — `MAP_SCREEN_UI_V1`

Purpose:
create the interface around world/region map navigation.

Outputs:
- map frame;
- legend panel;
- filter buttons;
- region label style;
- zoom controls;
- quest marker frame;
- fast-travel prompt;
- POI tooltip style.

Must visually match `MINIMAP_PACK_V1` and project UI DNA when linked.

---

## SKU-UI-005 — `DIALOG_UI_PACK_V1`

Outputs:
- dialogue frame;
- speaker-name plate;
- portrait frame;
- choice buttons;
- continue indicator;
- optional narration frame.

---

## SKU-UI-006 — `SHOP_UI_PACK_V1`

Outputs:
- shop window;
- item row/card;
- currency indicator;
- buy/sell tabs;
- tooltip;
- quantity selector;
- confirmation modal.

---

## SKU-UI-007 — `CRAFTING_UI_PACK_V1`

Outputs:
- recipe list;
- ingredient slots;
- crafting result panel;
- progress indicator;
- category tabs;
- locked/unlocked states.

---

## SKU-UI-008 — `QUEST_JOURNAL_UI_V1`

Outputs:
- quest list;
- quest details;
- objective states;
- map-link treatment;
- reward panel;
- completed/active/failed state visuals.

---

## SKU-UI-009 — `UI_ICON_FAMILY_32_V1`

Purpose:
generate a coherent set of 32 UI icons.

Use cases:
- inventory;
- skills;
- map markers;
- status effects;
- crafting.

Required QA:
- family consistency;
- semantic uniqueness;
- icon readability;
- exact dimensions.

---

## SKU-UI-010 — `FULL_RPG_INTERFACE_STARTER_V1`

High-level workflow SKU.

Potential outputs:
- HUD core;
- backpack/inventory;
- map UI;
- pause/settings;
- dialogue UI;
- base icon family.

This is a future premium workflow and must only be enabled when component SKUs are mature.

---

# 103. Map Contracts

## 103.1 Shared Map Contract

```text
map_contract_version
map_scope
map_type
project_id
project_dna_version
parent_map_id
target_engine
target_resolution
aspect_ratio
style_profile
navigation_purpose
layer_requirements
label_policy
marker_policy
fog_policy
structured_export
```

---

## 103.2 Structured World Contract

```text
world_seed
world_extent
region_count
biome_count
settlement_count
major_poi_count
route_graph_required
region_mask_required
biome_mask_required
water_mask_required
faction_mask_required
```

---

## 103.3 Dungeon Graph Contract

```text
room_count_min
room_count_max
branching_target
dead_end_policy
secret_room_count
boss_room_required
start_exit_distance
loop_count_target
floor_count
connectivity_required
```

---

## 103.4 Minimap Contract

```text
shape
pixel_size
frame_style
simplification_level
marker_size
marker_set
fog_support
rotation_mode
north_indicator
zoom_levels
```

---

# 104. Game UI Contracts

## 104.1 Shared UI Contract

```text
ui_contract_version
project_id
project_dna_version
ui_dna_version
screen_type
target_resolution
safe_area
aspect_ratio
input_mode
theme
component_family
state_pack
localization_safe
engine_target
```

---

## 104.2 Localization-Safe UI

Since SPRYXEL supports English, Portuguese and Spanish, generated screen layouts must anticipate variable text length.

Rules:
- avoid baking language-specific text into core asset backgrounds;
- create text-safe zones;
- support expandable button/label regions;
- separate visual assets from localized strings;
- flag layouts with insufficient text expansion room.

This is critical because Portuguese and Spanish labels can be longer than English.

---

## 104.3 UI State Contract

Common component states:

```text
DEFAULT
HOVER
PRESSED
SELECTED
DISABLED
FOCUS
ERROR
SUCCESS
LOCKED
```

A SKU can declare which are mandatory.

Missing required states:
`UI_STATE_PACK_INCOMPLETE`

---

# 105. Map QA Failure Codes

## Structure

```text
MAP_GRAPH_DISCONNECTED
MAP_ROUTE_BROKEN
MAP_REGION_ID_DUPLICATE
MAP_PARENT_REGION_MISMATCH
MAP_POI_OUTSIDE_REGION
MAP_LAYER_SIZE_MISMATCH
MAP_LAYER_ALIGNMENT_FAIL
```

## Readability

```text
MAP_ROUTE_LOW_READABILITY
MAP_REGION_LOW_CONTRAST
MAP_POI_COLLISION
MAP_LABEL_COLLISION
MAP_MARKER_AMBIGUOUS
MAP_MINIMAP_UNREADABLE
MAP_VISUAL_CLUTTER
```

## Consistency

```text
MAP_BIOME_STYLE_DRIFT
MAP_FACTION_STYLE_DRIFT
MAP_UI_STYLE_MISMATCH
MAP_PARENT_STYLE_MISMATCH
```

---

# 106. UI QA Failure Codes

## Layout

```text
UI_OVERLAP
UI_ALIGNMENT_FAIL
UI_SAFE_AREA_VIOLATION
UI_TEXT_ZONE_TOO_SMALL
UI_GRID_INCONSISTENT
```

## Interaction

```text
UI_STATE_PACK_INCOMPLETE
UI_DISABLED_STATE_UNCLEAR
UI_SELECTED_STATE_UNCLEAR
UI_HOVER_STATE_UNCLEAR
UI_INTERACTION_LOW_CONTRAST
```

## Visual

```text
UI_ICON_UNREADABLE
UI_ICON_FAMILY_DRIFT
UI_PANEL_STYLE_DRIFT
UI_HIERARCHY_WEAK
UI_CLUTTER
UI_PROJECT_DNA_DRIFT
```

## Export

```text
UI_SLICE_EXPORT_INVALID
UI_ATLAS_INVALID
UI_DIMENSION_MISMATCH
UI_EXPORT_METADATA_INVALID
```

---

# 107. Map QA Benchmark Suite

## 107.1 Golden Map Scenarios

### G-MAP-001 — Fantasy Continent
Tests:
- biome separation;
- major routes;
- capital/POI hierarchy;
- parchment readability.

### G-MAP-002 — Pixel Overworld
Tests:
- low-resolution readability;
- biome borders;
- settlement markers;
- map/minimap relationship.

### G-MAP-003 — Archipelago
Tests:
- island separation;
- sea routes;
- POI placement.

### G-MAP-004 — Sci-Fi Sector
Tests:
- nodes/routes;
- non-terrain map style;
- marker systems.

### G-MAP-005 — Branching Dungeon
Tests:
- graph integrity;
- branching;
- secrets;
- boss room;
- render/graph consistency.

### G-MAP-006 — Multi-Room Interior
Tests:
- room connectivity;
- door placement;
- interior readability.

### G-MAP-007 — Circular Minimap
Tests:
- simplification;
- marker readability;
- fog;
- HUD-scale legibility.

---

# 108. UI QA Benchmark Suite

## 108.1 Golden UI Scenarios

### G-UI-001 — RPG Backpack
Tests:
- slot grid;
- rarity states;
- equipment panel;
- tooltip;
- localization-safe regions.

### G-UI-002 — Action RPG HUD
Tests:
- health/resource;
- skill bar;
- minimap;
- quest tracker;
- combat readability.

### G-UI-003 — Main Menu
Tests:
- visual hierarchy;
- button states;
- safe text zones.

### G-UI-004 — Map Screen
Tests:
- legend;
- marker filters;
- quest POI;
- zoom controls.

### G-UI-005 — Shop
Tests:
- list/detail;
- currency;
- buy/sell state;
- tooltip.

### G-UI-006 — Dialogue
Tests:
- speaker name;
- portrait;
- choices;
- multiline localization.

---

# 109. Engine Export Direction

## 109.1 Godot

Potential export bundle:

```text
assets/
ui/
maps/
metadata/
manifest.json
```

Future helpers may generate:
- sprite resources;
- AtlasTexture references;
- TileSet-related metadata;
- UI theme resource hints;
- map JSON/graph data.

No engine-specific exporter should silently mutate the user's game project without explicit API/MCP permission.

---

## 109.2 Unity

Potential export bundle:
- sprite atlases;
- sliced UI assets;
- metadata;
- ScriptableObject-compatible JSON schema;
- map/POI metadata;
- import settings hints.

---

## 109.3 Engine-Agnostic First

Canonical export should remain engine-independent.

EngineBridge adapters transform canonical assets into engine-specific packages.

This prevents Godot/Unity assumptions from contaminating core asset metadata.

---

# 110. AgentBridge Map Tools — Proposed MCP Surface

Conceptual MCP tools:

```text
create_world_map
create_region_map
create_dungeon_graph
render_dungeon_map
create_minimap_pack
create_map_marker_pack
validate_map
export_map
```

All mutating tools require:
- project scope;
- cost budget;
- idempotency;
- output contract.

---

# 111. AgentBridge UI Tools — Proposed MCP Surface

Conceptual MCP tools:

```text
create_hud_pack
create_backpack_ui
create_menu_pack
create_map_screen_ui
create_dialog_ui
create_icon_family
validate_ui_pack
export_ui_pack
```

Example developer-agent request:

> Create a dark-fantasy backpack UI matching Project DNA, 10×6 inventory slots, equipment panel on the right, four rarity states, tooltip frame, and export it for Godot.

AgentBridge decomposition:

```text
read_project_dna
↓
estimate BACKPACK_UI_PACK_V1
↓
reserve budget
↓
generate components
↓
validate state pack
↓
validate localization-safe zones
↓
assemble preview
↓
export canonical pack
↓
EngineBridge → Godot
```

---

# 112. Agent Budgeting for Packs

Composite workflows must expose cost before execution.

Example request:

```text
RPG_WORLD_NAV_PACK_V1
```

CostGuard returns:

```text
estimated_min_credits
estimated_max_credits
estimated_candidate_count
included_repairs
max_retries
```

The agent cannot automatically exceed `max_credits`.

If partial completion is possible, the contract must state whether:
- fail whole workflow;
- return partial valid outputs;
- pause for additional budget.

Default planning preference:
**return partial valid outputs only when the workflow schema explicitly allows it.**

---

# 113. Map + UI Provenance

Every exported map/UI component keeps:

- source workflow;
- Project DNA version;
- generation SKU;
- model/pipeline;
- source structured graph if applicable;
- parent asset relationships;
- repair history;
- QA result;
- export target.

This allows:
- regeneration;
- consistent expansion;
- audit;
- agent continuation.

---

# 114. Map Evolution / Regeneration

World maps are long-lived assets.

SPRYXEL should support non-destructive changes.

Example:

```text
World Map v1
↓
Add northern kingdom
↓
World Map v2
```

The system should preserve:
- existing region IDs when possible;
- linked POIs;
- region relationships;
- downstream references.

This is more important than generating a visually unrelated new map from scratch.

---

# 115. UI Theme Evolution

UI themes should use versioned `UI DNA`.

Example:

```text
UI DNA v1
↓
dark fantasy bronze
```

Later:

```text
UI DNA v2
↓
same identity + higher contrast + cleaner mobile scale
```

Existing screens can then be migrated or regenerated against the new version.

---

# 116. Map/UI Product Differentiation

SPRYXEL can differentiate by combining:

```text
visual generation
+
structured data
+
project memory
+
QA
+
engine export
+
agent access
```

A generic image generator can produce a pretty fantasy map.

SPRYXEL should aim to produce:

```text
world map
+
regions
+
POIs
+
marker family
+
minimap
+
map screen UI
+
metadata
+
engine export
```

as one coherent system.

Likewise, a generic image model can produce a pretty inventory panel.

SPRYXEL should aim to produce:

```text
inventory screen
+
equipment panel
+
slot states
+
rarity frames
+
tooltip
+
icon family
+
export metadata
```

with consistent game-production semantics.

---

# 117. New Decisions

### D-051 — Map SKUs
**Decision:** map production is represented by explicit versioned SKUs, not generic image generation.  
**Status:** APPROVED

### D-052 — Structured Dungeon First
**Decision:** dungeon generation should support structure-first graph generation before visual rendering.  
**Status:** APPROVED

### D-053 — Map Layer Contract
**Decision:** structured map layers must be dimension-aligned and machine-addressable.  
**Status:** APPROVED

### D-054 — UI Pack SKUs
**Decision:** HUD, backpack, menus and screen systems are packaged as coherent multi-component SKUs.  
**Status:** APPROVED

### D-055 — Localization-Safe UI
**Decision:** UI generation must be localization-safe for English, PT-BR and Spanish.  
**Status:** APPROVED

### D-056 — Engine-Agnostic Canonical Export
**Decision:** canonical assets remain engine-independent; EngineBridge performs Godot/Unity adaptation.  
**Status:** APPROVED

### D-057 — Agent Map/UI APIs
**Decision:** maps and UI receive first-class MCP/API operations with bounded budgets and idempotency.  
**Status:** APPROVED

### D-058 — Non-Destructive World Evolution
**Decision:** map versioning should preserve stable region/POI identities when feasible.  
**Status:** APPROVED

---

# 118. SPR-SPECIAL-002 Verdict

### Map SKU catalog
**APPROVED**

### UI/HUD SKU catalog
**APPROVED**

### Map contracts
**APPROVED FOR PLANNING**

### UI contracts
**APPROVED FOR PLANNING**

### QA/failure taxonomy
**APPROVED**

### Agent workflows
**APPROVED FOR PLANNING**

### Engine export direction
**APPROVED**

### Pricing
**NOT FROZEN**

The product catalog is now sufficiently complete to proceed into financial modeling without ignoring major map/UI cost surfaces.

---

# 119. Updated Checkpoint

**Current stage:** PRE-REPOSITORY PRODUCT PLANNING  
**Completed special increment:** SPR-SPECIAL-002 — Map/UI SKU, Contracts, Export & Agent Automation  
**Verdict:** APPROVED  
**Master version:** 0.4.2  
**Implementation started:** NO  
**Repository exists:** NO  
**Map system status:** FIRST-CLASS / SKU-DEFINED  
**Game UI/HUD status:** FIRST-CLASS / SKU-DEFINED  
**MCP/API integration:** INCLUDED IN PLANNING  
**Pricing:** NOT FROZEN  
**Next necessary increment:** SPR-PLAN-004 — Credit Economics, Pricing Safety & Financial Simulation  
**Known blocker for continued planning:** none


---

# 120. SPR-PLAN-004 — Credit Economics, Pricing Safety & Financial Simulation

**Status:** APPROVED / COMPLETED IN MASTER v0.5.0  
**Classification:** NECESSARY / HIGH_ASSURANCE  
**Primary objective:** define financial invariants, formulas, reserves, payment architecture and loss-containment controls before any public price is published.

---

# 121. Financial Doctrine

SPRYXEL must never depend on optimistic assumptions to remain solvent.

Core principles:

1. every generation has a bounded economic cost before execution;
2. every credit grant has an identifiable financial liability;
3. paid credits are modeled at 100% redemption;
4. free usage has a hard budget cap;
5. failed generations are part of COGS;
6. retries and repairs are part of COGS;
7. refunds and chargebacks are modeled explicitly;
8. payment fees are modeled per provider/payment route;
9. FX risk is explicit;
10. a profitable average must not hide a loss-making SKU;
11. cash-flow timing matters independently from accounting margin;
12. no plan/SKU launches if approved stress cases can create unbounded loss.

---

# 122. Canonical Economic Currency

## 122.1 Internal Cost Currency

**USD** is the canonical internal cost currency for inference economics because:
- major GPU providers commonly price in USD;
- model/API providers commonly price in USD;
- international product pricing can naturally be denominated in USD.

All internal cost calculations use integer minor/micro units.

Never use binary floating-point as the authoritative billing representation.

Example concepts:

```text
money_microusd
money_minor_units
currency_code
fx_rate_id
```

---

## 122.2 Reporting Currency

**BRL** is the secondary owner-reporting currency.

The owner console should display:
- USD canonical economics;
- BRL converted reporting;
- transaction-original currency.

Reference market rate observed during SPR-PLAN-004 on 2026-10-01:

```text
1 USD ≈ 5.2248 BRL
```

This is a planning snapshot only and MUST NOT be hardcoded into pricing.

---

## 122.3 FX Versioning

Every converted transaction/cost stores:

```text
fx_rate_id
source_currency
target_currency
rate
rate_timestamp
rate_source
```

Historical reports must use the rate recorded at the economic event, not today's rate.

---

# 123. Spryxel Credit Definition

## 123.1 Credit Is Not Currency

The user-facing unit:

**Spryxel Credit (`SC`)**

is an abstract usage unit.

It:
- has no fixed permanent USD value;
- is not cash;
- is not transferable by default;
- is not redeemable for cash except where legally required;
- can have different acquisition origins;
- is consumed by versioned Generation SKUs.

This separation lets SPRYXEL change infrastructure/model economics without redefining the product contract.

---

## 123.2 Atomic Credit Storage

Credits are stored as integers.

No fractional floating balances.

Example:

```text
1 SC
100 SC
1250 SC
```

If future granularity requires smaller units, the database can use:

```text
credit_microunits
```

while keeping user-facing SC integer-friendly.

---

# 124. Credit Lot Accounting

Every grant creates a **Credit Lot**.

Fields:

```text
credit_lot_id
wallet_id
origin
issued_credits
remaining_credits
issued_at
expires_at_nullable
purchase_id_nullable
subscription_cycle_id_nullable
promotion_id_nullable
jurisdiction
status
```

Origins:

```text
TRIAL
PROMOTIONAL
REFERRAL
COMPENSATION
SUBSCRIPTION
PAID_PACK
```

---

## 124.1 Consumption Order

Default planning order:

1. expiring trial entitlements;
2. expiring promotional credits;
3. expiring referral credits;
4. subscription-cycle credits;
5. oldest paid-pack credits.

Reason:
- use expiring/non-cash promotional liabilities first;
- preserve purchased credits;
- simplify customer trust and refund reconciliation.

Exact legal implications require launch review.

---

## 124.2 Paid Pack Redemption Assumption

**Paid credit packs must be profitable even if 100% of credits are consumed.**

SPRYXEL must never rely on:
- unused credits;
- forgotten balances;
- breakage;
- churn before consumption;

to make the economics positive.

Any breakage is upside, not required margin.

---

# 125. Free Tier Strategy

## 125.1 Do Not Give Generic Free Wallets by Default

The default free experience should use **Trial Entitlements**, not unrestricted SC.

Example conceptual entitlement:

```text
2 × Draft Pixel Character
3 × Draft Item
1 × Minimap Preview
```

Entitlements:
- only allow low-cost approved SKUs;
- use low-cost quality profile;
- have bounded candidate counts;
- have strict repair limits;
- are TrustShield-gated;
- cannot be converted into paid SC.

This sharply reduces multi-account farming value.

---

## 125.2 Zero-Cash Launch Mode

Default initial configuration:

```text
PUBLIC_FREE_CLOUD_BUDGET_USD = 0
```

Result:
- users may explore the app, project setup, examples, documentation and demo assets;
- external cloud inference for free users remains disabled until the owner explicitly funds a promotional budget.

During development/private alpha:
- free test generation may use the local RTX 5050;
- usage remains subject to test quotas.

This protects the owner from accidental free-cloud spend before revenue exists.

---

## 125.3 Promotional Budget

Free cloud generation can only activate when:

```text
promotion_budget_remaining > estimated_worst_case_cost
```

Required limits:
- global daily budget;
- global monthly budget;
- campaign budget;
- per-account budget;
- per-device/risk-cluster eligibility;
- per-SKU budget.

When budget reaches zero:

```text
FREE CLOUD GENERATION STOPS
```

Paid customer generation remains independent.

---

# 126. Commercial Launch Model

## 126.1 V1 Commercial Strategy

Primary commercial mechanism:

**Prepaid Credit Packs**

Reason:
- simple;
- transparent;
- easier financial reconciliation;
- lower subscription/refund complexity;
- users pay before variable GPU consumption;
- fits developers with irregular production workloads.

---

## 126.2 Subscription Timing

Subscriptions remain in product architecture but are **deferred from the first commercial pricing decision**.

Recommended sequence:

```text
V1
→ prepaid packs

V1.x
→ subscription + monthly credits after retention/usage data exists
```

This avoids guessing monthly usage before real data exists.

---

## 126.3 Future Subscription Credits

If subscriptions are introduced:
- cycle credits remain a separate lot;
- rollover policy is explicit;
- expiry/rollover must be jurisdictionally reviewed;
- subscription economics must assume full cycle-credit redemption.

---

# 127. Payment Provider Architecture

Business logic must depend on a `BillingProvider` abstraction.

Candidate adapters:

```text
PaddleBillingAdapter
StripeBillingAdapter
FutureBillingAdapter
```

Do not hardwire ledger semantics to one processor.

---

# 128. Current Payment Provider Planning Facts

## 128.1 Paddle

Current published pay-as-you-go checkout fee:

```text
5% + USD 0.50 per transaction
```

Current published inclusions include:
- payments/billing;
- global sales-tax compliance;
- fraud/chargeback protection;
- no monthly platform fee at pay-as-you-go tier.

Paddle acts as Merchant of Record and supports sales across more than 200 countries/territories.

Brazil is present in Paddle's supported-country data and BRL is supported as a transaction currency.

Current payout documentation indicates a normal monthly seller payout cycle:
- balance becomes payout on the 1st when minimum threshold is met;
- Paddle sends it by the 15th;
- minimum payout threshold documented as USD 100 equivalent.

Implication:
Paddle can greatly simplify global indirect-tax/compliance operations, but early SPRYXEL must maintain working capital to fund GPU usage before payout.

---

## 128.2 Stripe Brazil

Current standard published pricing:

```text
Domestic cards:
3.99% + R$0.39

International cards:
domestic fee + 2 percentage points

Pix:
1.19% per paid Pix
currently documented as invite-only

Dispute received:
R$55

Manual dispute counter:
R$55
returned if won, not returned if lost
```

3D Secure is included with standard Payments pricing.

Radar Lite fraud protection is included with standard payment pricing.

Stripe direct can reduce payment percentage versus a Merchant of Record in some baskets, but:
- SPRYXEL/the operating entity retains broader tax/compliance responsibilities;
- dispute economics remain directly visible;
- global sales-tax/VAT architecture requires accounting/legal implementation.

---

## 128.3 Paddle vs Stripe Planning Decision

No processor is irreversibly frozen.

### Preferred early global candidate:
**Paddle / Merchant-of-Record route**

Reasons:
- no fixed monthly fee;
- global tax administration;
- global payment localization;
- fraud/chargeback handling;
- Brazil-supported seller geography;
- smaller legal/operational burden for an early global SaaS.

### Direct-payment alternative:
**Stripe**

Reasons to reconsider:
- lower effective fee in some payment mixes;
- more direct payment control;
- potential local Brazilian payment advantages;
- scale may justify taking tax/compliance complexity in-house.

Architecture must allow migration or dual routing later.

---

# 129. Fixed Fee Dilution

Fixed per-transaction fees make tiny credit packs economically inefficient.

Using Paddle's current `5% + $0.50` structure:

| Illustrative checkout | Fee | Effective fee |
|---:|---:|---:|
| $5 | $0.75 | 15.0% |
| $10 | $1.00 | 10.0% |
| $20 | $1.50 | 7.5% |
| $50 | $3.00 | 6.0% |

**Planning implication:**
do not launch ultra-small paid packs without explicit economic evidence.

Initial simulation floor:

```text
MIN_CHECKOUT_TEST_POINT_USD = 10
```

This is **not a final public price**.

It means $5 micro-packs are disfavored for Merchant-of-Record economics.

---

# 130. Stripe Effective-Fee Comparison Snapshot

Using the 2026-10-01 planning FX snapshot (`1 USD ≈ 5.2248 BRL`) only for comparison:

| USD-equivalent basket | Stripe BR domestic effective fee | Stripe BR international-card effective fee |
|---:|---:|---:|
| $5 | ~5.48% | ~7.48% |
| $10 | ~4.74% | ~6.74% |
| $20 | ~4.36% | ~6.36% |
| $50 | ~4.14% | ~6.14% |

These are simplified comparisons based on currently published percentage/fixed fees and the planning FX snapshot.

They do not include:
- tax/compliance operational cost;
- FX settlement effects;
- refunds;
- chargebacks;
- optional fraud products;
- accounting/legal cost.

Therefore lower processing percentage does not automatically mean lower total commercial cost.

---

# 131. GPU Price Reference

Current RunPod Serverless planning references include approximately:

```text
16 GB class:  $0.58/hour
24 GB class:  $0.69/hour
RTX 4090:     $1.10/hour
48 GB A40/A6000 class: $1.22/hour
48 GB L40-class:       $1.75/hour
```

Exact provider pricing is external and volatile.

Cost formula:

```text
gpu_cost =
    billed_gpu_seconds / 3600
    × gpu_hourly_rate
```

Example only:

At `$0.69/hour`, 30 billed GPU seconds:

```text
≈ $0.00575
```

This is raw GPU compute only.

It is NOT final asset COGS.

---

# 132. True SKU COGS

For each Generation SKU:

```text
TRUE_SKU_COGS =
    inference_attempts
  + model_api_cost
  + QA_compute
  + repair_compute
  + retry_compute
  + storage_write
  + storage_retention_allocation
  + bandwidth_variable_cost
  + third_party_variable_fees
```

Then financial modeling adds expected commercial-loss components separately.

---

# 133. Cost Per Accepted Asset

Canonical quality economics metric:

```text
COST_PER_ACCEPTED_ASSET =
    sum(all attempt + QA + repair costs)
    /
    accepted production assets
```

Example:

```text
Attempt 1    $0.010 fail
Attempt 2    $0.010 fail
Attempt 3    $0.010 pass
QA           $0.003
Repair       $0.004
--------------------
True delivery COGS
              $0.037
```

Never record the winning attempt alone as the asset cost.

---

# 134. Revenue Waterfall

For every transaction calculate:

```text
CUSTOMER_CHARGE
- INDIRECT_TAX_WITHHELD_OR_COLLECTED
= PRODUCT_REVENUE_BEFORE_PROCESSING

- PAYMENT_PROCESSING
- REFUND_LOSS
- CHARGEBACK_LOSS
- FRAUD_LOSS
- VARIABLE_DELIVERY_COGS
- PROMOTIONAL_SUBSIDY_ALLOCATION
- FX_LOSS
= CONTRIBUTION
```

The exact tax location in the waterfall depends on billing provider and jurisdiction.

---

# 135. Contribution Margin

Canonical planning formula:

```text
Contribution Margin =
    Contribution
    /
    Product Revenue Before Processing
```

Approved target from prior planning remains:

```text
TARGET_CONTRIBUTION_MARGIN >= 70%
```

This is a target after directly attributable variable costs.

---

# 136. Financial Guardrail Bands

## GREEN
```text
Projected contribution margin >= 70%
```

Normal operation.

## YELLOW
```text
50% <= margin < 70%
```

Investigate:
- provider cost;
- retry rate;
- fraud;
- FX;
- promotions.

No automatic expansion of free usage.

## ORANGE
```text
35% <= margin < 50%
```

Automatic actions may include:
- disable new promotions;
- route to cheaper qualified model;
- reduce candidate counts where quality allows;
- pause low-margin SKU discounts;
- alert owner.

## RED
```text
0% < margin < 35%
```

Affected SKU/plan cannot be newly promoted.

CostGuard should restrict or disable the affected route until reviewed.

## BLACK
```text
margin <= 0%
```

**Hard economic stop.**

New affected generation requests are rejected before GPU execution.

Existing paid entitlements require controlled remediation/migration policy rather than silent non-delivery.

---

# 137. Launch Margin Requirements

A SKU/pack may launch only if:

### Base Scenario
```text
Contribution Margin >= 70%
```

### Conservative Scenario
```text
Contribution Margin >= 60%
```

### Severe Approved Stress Scenario
```text
Contribution Margin >= 30%
```

### Catastrophic Scenario
May cross below 30%, but:
- loss must be bounded;
- automatic circuit breakers must activate;
- no unlimited free/paid execution.

These are internal safety thresholds, not customer promises.

---

# 138. SKU Price Floor Formula

Simplified conceptual formula:

Let:

```text
C = expected delivered COGS
L = expected loss reserve
V = variable processor percentage
F = fixed processor fee allocation
M = target contribution margin
```

Then minimum pre-tax product price approximation:

```text
PRICE_MIN =
    (C + L + F)
    /
    (1 - V - M)
```

Only valid where:
- denominator is positive;
- tax treatment is separately modeled;
- all omitted costs are immaterial or explicitly allocated.

Production uses the full financial simulator, not this simplified formula alone.

---

# 139. Credit Price Safety

Public credit packs contain:

```text
pack_price
pack_credits
```

Derived:

```text
revenue_per_credit
```

Each SKU has:

```text
sku_credit_price
expected_cogs
p95_cogs
worst_bounded_cogs
```

Safety rule:

```text
sku_credit_price × conservative_revenue_per_credit
>
approved_stress_cogs + approved_reserves
```

Otherwise:
- increase SKU credit cost;
- improve pipeline;
- change model;
- change pack economics;
- disable SKU.

---

# 140. Versioned Credit Pricing

Generation credit costs are versioned.

Example:

```text
PX_CHARACTER_BASE_V1
price_rule_v3
20 SC
```

A price change creates:

```text
price_rule_v4
```

Historical jobs retain their original rule.

Never rewrite historical credit costs.

---

# 141. Pricing Grandfathering

Purchased SC remain SC.

When Generation SKU credit prices change:
- old wallet balances remain intact;
- new generation uses the currently disclosed SKU credit cost unless a contractual grandfather rule exists.

This avoids changing a user's recorded balance while allowing economic adaptation.

---

# 142. Refund Reserve

Refund economics have two separate effects:

1. revenue reversal;
2. unrecoverable consumed generation COGS.

Model separately:

```text
EXPECTED_REFUND_COGS_LOSS =
    refund_probability
    × average_consumed_cogs_before_refund
```

Do not model the refunded sale amount itself as "COGS"; it is a reversal of revenue.

---

# 143. Brazil Cooling-Off Exposure

For potentially applicable Brazilian consumer transactions:

Track:

```text
cooling_off_started_at
cooling_off_expires_at
credits_issued
credits_consumed
cogs_consumed
remaining_entitlement
refund_exposure
```

Dashboard separates:
- gross transaction;
- cooling-off exposure;
- consumed COGS at risk;
- post-cooling-off transaction status.

This does not remove later chargeback risk.

---

# 144. Refund Request Flow

On qualifying refund/withdrawal request:

```text
1. freeze unused refundable entitlement
2. stop new consumption from affected credit lot
3. snapshot ledger
4. snapshot generation/download/API evidence
5. process applicable refund path
6. reconcile payment + wallet
7. record consumed COGS as refund-loss metric
```

Do not delete evidence needed for disputes/audit.

---

# 145. Chargeback Reserve

Expected chargeback cost model:

```text
CB_EXPECTED_LOSS =
    p_chargeback
    × (
        transaction_principal_at_risk
        + unrecoverable_cogs
        + nonrefundable_dispute_fees
      )
```

Provider-specific dispute costs are versioned.

Example current Stripe Brazil reference:
- R$55 dispute received fee;
- another R$55 for manual counter, refunded if won.

---

# 146. Fraud Reserve

Fraud loss is modeled separately from chargebacks.

Examples:
- stolen payment instrument;
- free-account farming;
- promo abuse;
- bot farming;
- compromised API key;
- account takeover.

TrustShield supplies risk metrics.

CostGuard can respond with:
- lower concurrency;
- reduced purchase limit;
- 3DS requirement;
- blocked promo grant;
- blocked generation;
- manual review.

---

# 147. New Account Exposure Tiers

No fresh account receives unlimited financial exposure.

Conceptual tiers:

## N0 — NEW / UNTRUSTED
- trial-only or smallest paid pack;
- low concurrency;
- strict promo eligibility;
- high-risk purchase blocked or verified.

## N1 — VERIFIED
Signals may include:
- verified email;
- successful payment;
- 3DS/payment verification;
- stable device/account behavior.

Unlocks:
- larger pack;
- normal concurrency.

## N2 — ESTABLISHED
Signals:
- account age;
- successful usage;
- no dispute history;
- stable payment profile.

Unlocks:
- higher limits;
- higher-value pack;
- API throughput.

Exact monetary caps are configurable and not frozen before live fraud data.

---

# 148. Working Capital Gate

Positive unit economics do not guarantee enough cash to pay GPU costs before processor payouts.

Required formula:

```text
MIN_WORKING_CAPITAL_RESERVE =
    expected_p95_daily_cloud_cogs
    × payout_lag_days
    + provider_prepaid_balance_requirement
    + refund_cash_buffer
    + operational_safety_buffer
```

Public paid cloud generation must not launch until:

```text
available_generation_cash_reserve
>=
MIN_WORKING_CAPITAL_RESERVE
```

This is a separate launch gate from profitability.

---

# 149. Zero-Resource Development vs Commercial Launch

## Development
Can remain near zero cloud cost:
- local Docker;
- local RTX 5050;
- free web/database/storage tiers;
- no public free cloud inference.

## Closed Alpha
Can primarily use:
- local RTX 5050;
- capped testers;
- no SLA;
- explicit alpha limitations.

## Public Paid Production
Requires:
- serverless GPU;
- working-capital reserve;
- payment processor;
- benchmarked COGS;
- financial circuit breakers.

This distinction prevents the false assumption that a commercially running AI SaaS can always have literally zero cash needs.

---

# 150. Stress Scenario Matrix

Financial simulation must support versioned scenarios.

## S0 — BASE

Inputs:
- measured median/P50 COGS;
- normal retry rate;
- normal repair rate;
- current provider rate;
- current FX;
- observed/initial risk assumptions.

Requirement:
- margin >= 70%.

---

## S1 — CONSERVATIVE

Suggested planning shocks:
- p75/p90 generation COGS;
- retry rate +50% vs measured baseline;
- repair rate +50%;
- GPU price +15%;
- localized FX cost +10%;
- refund loss above observed baseline.

Requirement:
- margin >= 60%.

---

## S2 — GPU SHOCK

```text
GPU provider price +35%
```

Evaluate:
- each SKU;
- each pack;
- each quality profile.

Model Router should attempt qualified cheaper route before price changes.

---

## S3 — FX SHOCK

For BRL/local-currency pricing against USD costs:

```text
USD cost basis +20%
```

Evaluate:
- localized pack margins;
- when price refresh becomes necessary.

---

## S4 — QUALITY REGRESSION

Simulate:
- first-pass acceptance decreases;
- retries double;
- repairs double.

This catches a "better-looking" model that quietly destroys economics.

---

## S5 — REFUND SPIKE

Planning stress, not prediction:

```text
refund event rate materially above baseline
```

Simulator should test multiple values, including 5%, 8%, 10%.

Primary concern:
- consumed COGS before refund;
- processing/refund fees;
- working capital.

---

## S6 — CHARGEBACK/FRAUD SPIKE

Test:
- higher dispute rate;
- processor dispute fees;
- unrecoverable GPU usage;
- attack concentrated on highest-cost SKU.

TrustShield response should be included.

---

## S7 — FREE FARMING ATTACK

Simulate:
- large signup burst;
- shared/reused devices;
- VPN/proxy rotation;
- trial exhaustion attempts.

Hard budget rule ensures maximum cloud loss remains:

```text
<= configured promotional budget
```

---

## S8 — HEAVY USER

Assume one user consumes:
- every purchased credit;
- highest permitted cost mix;
- maximum bounded retries.

The plan must remain positive.

---

## S9 — WORST VALID MIX

All customers choose the least profitable SKU allowed by their pack.

This prevents profitable average usage from subsidizing a hidden loss-making SKU.

---

## S10 — PROVIDER OUTAGE

Simulate:
- primary GPU unavailable;
- fallback provider 30–60% more expensive.

CostGuard may:
- queue;
- downgrade if user allows;
- pause SKU;
- use fallback only if margin remains safe.

Never silently route to an unbounded expensive provider.

---

# 151. Economic Simulation Dimensions

Every simulation varies:

```text
processor
country
currency
pack_price
credits_issued
sku_mix
redemption_rate
generation_cogs
retry_rate
repair_rate
refund_rate
chargeback_rate
fraud_rate
gpu_rate
fx_rate
promo_subsidy
quality_profile
```

Paid pack simulations force:

```text
redemption_rate = 100%
```

for launch-safety calculations.

---

# 152. Plan Safety Test

For each candidate pack:

```text
for every approved stress scenario:
    simulate all-credits-redeemed
    simulate worst-valid-SKU mix
    calculate margin
    calculate cash requirement
```

Pack verdict:

```text
APPROVED
REPRICE
RESTRICT_SKU
BLOCKED
```

No manual optimism override without an explicit recorded Decision/ADR.

---

# 153. Payment Basket Simulation

Initial test checkout values:

```text
$10
$20
$50
```

Purpose:
- study fixed-fee dilution;
- define future pack ladder.

These are **simulation points**, not customer prices.

A `$5` basket remains useful as an anti-pattern/test case because Merchant-of-Record fixed fees consume a large percentage.

---

# 154. Trial Economics

Trial entitlements calculate exposure as:

```text
TRIAL_MAX_EXPOSURE =
    max_entitlement_execution_count
    × worst_bounded_cogs_per_entitlement
```

Account grant allowed only if:

```text
TrustShield eligible
AND
campaign_budget_remaining >= TRIAL_MAX_EXPOSURE
```

No hidden overage.

---

# 155. Referral Economics

Referral rewards are promotional liabilities.

Before campaign launch calculate:

```text
max_referrals
× reward_credits
× conservative_cost_per_credit
```

The result must fit campaign budget.

Anti-self-referral graph required.

---

# 156. Compensation Credits

Support compensation must not bypass economics.

Compensation grant requires:
- reason code;
- amount;
- issuer/admin;
- associated incident/job optional;
- budget allocation;
- audit log.

Large grants require stronger admin permission.

---

# 157. Payment Failure / Reconciliation

Billing and credit grant must be atomic/idempotent at the application level.

Payment webhook flow:

```text
provider_event
↓
verify signature
↓
idempotency check
↓
record payment state
↓
grant credit lot exactly once
↓
ledger entry
↓
audit
```

A duplicated webhook must not duplicate credits.

---

# 158. Credit Reservation

Generation workflow:

```text
1. calculate current SKU credit cost
2. calculate maximum possible internal cost
3. verify wallet
4. reserve SC
5. verify global financial gates
6. generate
7. QA/repair
8. commit final SC debit
9. release unused reservation
```

No negative wallet balance by default.

---

# 159. Composite Workflow Reservation

For maps/UI packs:

```text
RPG_WORLD_NAV_PACK_V1
BACKPACK_UI_PACK_V1
MENU_SCREEN_PACK_V1
```

reserve against the whole bounded workflow, not only the first sub-job.

Agent/API calls support:

```text
max_credits
max_internal_cost
max_retries
partial_delivery_policy
```

---

# 160. Economic Kill Switches

Global:

```text
GLOBAL_DAILY_GPU_USD
GLOBAL_MONTHLY_GPU_USD
FREE_DAILY_GPU_USD
FREE_MONTHLY_GPU_USD
```

Provider:

```text
PROVIDER_DAILY_USD
PROVIDER_MONTHLY_USD
```

SKU:

```text
SKU_MAX_COGS
SKU_MAX_RETRY_COST
SKU_MIN_MARGIN
```

Account:

```text
ACCOUNT_DAILY_COGS
ACCOUNT_CONCURRENCY
ACCOUNT_PROMO_EXPOSURE
```

When a hard limit trips:
- no new cost-incurring job passes authorization;
- alert owner/admin;
- current jobs follow safe cancellation/completion policy.

---

# 161. Automatic Margin Protection

CostGuard continuously compares:

```text
rolling_actual_cogs
vs
pricing_assumption
```

Triggers:
- COGS +10% → warning;
- COGS +20% → review route;
- projected margin below Orange threshold → restrict promotion;
- projected margin below Red threshold → block new affected jobs.

Thresholds are versioned/configurable.

---

# 162. SKU Cross-Subsidy Rule

A profitable pack may contain many SKUs, but no SKU may be knowingly unbounded-loss.

Allowed:
- one SKU has lower margin but remains positive;
- another has higher margin.

Not allowed:
- one SKU loses money on every valid use and depends on customers "not using it much" unless it is an explicitly budgeted promotional feature with a hard cap.

---

# 163. Quality Profile Economics

### Draft
Economic target:
- lowest cost;
- low candidate count;
- strict COGS ceiling.

### Production
Economic target:
- main product balance;
- full QA;
- bounded repair.

### Ultra
Economic target:
- substantially higher SC cost;
- higher candidate/repair budget;
- never subsidized by Production pricing.

Each profile gets separate SKU economics.

---

# 164. Admin Economics Dashboard

Required owner metrics:

## Revenue
- gross checkout;
- net-of-tax product revenue;
- processor fees;
- refunds;
- disputes;
- cleared revenue.

## Credits
- paid credits issued;
- paid credits remaining;
- promotional credits issued;
- promotional credits remaining;
- subscription credits later;
- credit liability.

## COGS
- GPU;
- model APIs;
- QA;
- repair;
- storage;
- per-SKU cost;
- per-account cost.

## Margin
- contribution amount;
- contribution margin;
- margin by SKU;
- margin by pack;
- margin by customer cohort;
- margin by country;
- margin by provider.

## Risk
- cooling-off exposure;
- refund COGS loss;
- chargeback exposure;
- fraud loss;
- promo abuse prevented.

## Cash
- cloud prepaid balance;
- working-capital reserve;
- next estimated payout;
- generation runway days.

---

# 165. Generation Runway

New owner metric:

```text
GENERATION_RUNWAY =
    available_cloud_generation_cash
    /
    p95_daily_cloud_cogs
```

Display:

```text
18.4 days
```

Alert thresholds:
- <14 days;
- <7 days;
- <3 days.

This prevents operational interruption even when booked revenue looks healthy.

---

# 166. Financial Data Invariants

HIGH_ASSURANCE requirements:

1. ledger entries immutable after posting;
2. corrections through compensating entries;
3. no floating-point authoritative money;
4. webhook idempotency;
5. generation idempotency;
6. credit reservation before cost;
7. no double debit;
8. no duplicate grant;
9. payment state separate from wallet state;
10. transaction references traceable end-to-end;
11. all admin grants audited;
12. all pricing rules versioned.

---

# 167. Accounting Boundary

SPRYXEL economics dashboard is operational management accounting.

It does not replace:
- statutory bookkeeping;
- Brazilian tax accounting;
- corporate income tax calculation;
- accountant/legal advice.

Indirect tax treatment differs between:
- Merchant of Record;
- direct payment processor;
- jurisdiction.

Launch requires professional tax/accounting review.

---

# 168. Merchant-of-Record vs Direct Processor Decision Matrix

| Area | Merchant of Record | Direct Processor |
|---|---|---|
| Checkout fee | generally higher | often lower |
| Global sales tax/VAT | handled by MoR | seller responsibility |
| Chargeback/fraud admin | more bundled | more seller exposure/control |
| Cash-flow timing | provider-specific, may be slower | provider-specific |
| Control | lower | higher |
| Initial operational burden | lower | higher |
| Best fit | early global launch | later optimization / local-heavy scale |

Planning preference:
start architecturally neutral, test Paddle as primary early global candidate, preserve Stripe adapter path.

---

# 169. Current Cash-Flow Warning: Paddle

Current published Paddle payout behavior materially affects zero-resource launch planning.

Normal documented model:
- monthly payout;
- payout created around first of month if threshold reached;
- sent by mid-month;
- minimum threshold around USD 100 equivalent.

Therefore:
**customer prepayment does not instantly become usable bank cash.**

SPRYXEL must maintain independent cloud-generation funding until payout.

This can be small at early scale but cannot be ignored.

---

# 170. Public Pricing Freeze Rule

No customer-facing SC pack price can be marked final until all are available:

- benchmarked cost per accepted asset;
- p95 cost per accepted asset;
- benchmarked map/UI workflow costs;
- current payment-provider fee table;
- current GPU provider rate;
- tax/accounting review;
- refund/chargeback reserve assumptions;
- working-capital calculation;
- stress simulator output.

Until then:

```text
PRICING_STATUS = SIMULATION_ONLY
```

---

# 171. Initial Financial Simulator Outputs

Every candidate plan/pack report must contain:

```text
gross_price
tax_mode
processor_fee
net_product_revenue
credits_issued
revenue_per_credit
base_cogs
conservative_cogs
severe_cogs
refund_reserve
fraud_chargeback_reserve
fx_buffer
contribution_base
margin_base
margin_conservative
margin_severe
working_capital_required
verdict
```

---

# 172. Economic Proof Obligations

Before `APPROVED` for commercial release:

### P-ECON-001
Every paid SKU has positive unit economics under full redemption.

### P-ECON-002
No paid SKU has unbounded retry/repair cost.

### P-ECON-003
Free usage has a hard absolute budget.

### P-ECON-004
Worst-valid-SKU mix remains contribution-positive.

### P-ECON-005
Provider price shock does not silently create negative execution.

### P-ECON-006
FX shock is bounded for localized pricing.

### P-ECON-007
Refunded consumed COGS is tracked.

### P-ECON-008
Chargeback fees/losses are modeled.

### P-ECON-009
Working-capital reserve covers payout lag.

### P-ECON-010
All credit grants are auditable and idempotent.

---

# 173. Current Recommended Economic Launch Shape

Not public pricing.

Recommended shape after benchmark confirmation:

```text
FREE / DEMO
→ no generic free wallet
→ budgeted Trial Entitlements

PAID
→ prepaid credit packs
→ minimum checkout sized to dilute fixed fees

LATER
→ subscription bundles
→ studio/team plans
```

This structure minimizes initial financial complexity while preserving future recurring revenue.

---

# 174. New Decisions

### D-059 — Canonical Cost Currency
**Decision:** USD is canonical internal cost currency; BRL is secondary owner-reporting currency.  
**Status:** APPROVED

### D-060 — Abstract Credits
**Decision:** Spryxel Credits are abstract non-cash usage units with no permanently fixed currency value.  
**Status:** APPROVED

### D-061 — Full Redemption Safety
**Decision:** paid packs must remain profitable assuming 100% credit redemption.  
**Status:** APPROVED

### D-062 — Trial Entitlements
**Decision:** free trial defaults to restricted SKU entitlements instead of generic free SC.  
**Status:** APPROVED

### D-063 — Zero Public Free Cloud Budget
**Decision:** default public free-cloud budget is zero until explicitly funded by the owner/campaign.  
**Status:** APPROVED

### D-064 — Credit-Pack First Launch
**Decision:** initial commercial model prioritizes prepaid credit packs; subscriptions are deferred until usage/retention data exists.  
**Status:** APPROVED

### D-065 — Billing Abstraction
**Decision:** payment-provider semantics live behind a BillingProvider adapter.  
**Status:** APPROVED

### D-066 — Early Global MoR Candidate
**Decision:** Paddle is the preferred early global Merchant-of-Record candidate for further validation; Stripe remains a first-class direct-payment alternative.  
**Status:** APPROVED FOR PLANNING, NOT PROCUREMENT

### D-067 — Small-Pack Guard
**Decision:** avoid tiny paid packs that are disproportionately consumed by fixed transaction fees; $10 is an initial simulation floor, not a final price.  
**Status:** APPROVED

### D-068 — Working Capital Gate
**Decision:** public paid cloud inference requires a working-capital reserve independent of booked revenue.  
**Status:** APPROVED

### D-069 — Margin Guardrails
**Decision:** target >=70% base contribution margin; launch models must also remain >=60% in conservative and >=30% in approved severe stress simulations.  
**Status:** APPROVED

### D-070 — Hard Negative-Margin Stop
**Decision:** CostGuard prevents new affected jobs when predicted contribution margin is non-positive.  
**Status:** APPROVED

### D-071 — Stress Simulation
**Decision:** every pack/SKU is tested against GPU, FX, quality-regression, refund, chargeback, fraud, free-farming, heavy-user and worst-mix scenarios.  
**Status:** APPROVED

### D-072 — No Cross-Subsidized Hidden Loss
**Decision:** no normal paid SKU may knowingly lose money and depend on low usage to hide the loss.  
**Status:** APPROVED

### D-073 — Pricing Freeze
**Decision:** public prices remain simulation-only until measured benchmark COGS and legal/accounting/payment inputs are available.  
**Status:** APPROVED

---

# 175. Current External Economic References

Facts captured for this planning version must be revalidated before launch.

### Paddle
- Pay-as-you-go Checkout: 5% + $0.50 per transaction.
- Merchant of Record model.
- global tax/compliance handling.
- fraud/chargeback protection described as included in standard pricing.
- supported-country system includes Brazil.
- normal seller payout documentation currently describes monthly payouts and minimum threshold.

Sources:
- https://www.paddle.com/pricing
- https://www.paddle.com/legal/terms
- https://developer.paddle.com/concepts/sell/supported-countries-locales/
- https://www.paddle.com/help/manage/get-paid/when-and-how-do-i-get-paid
- https://www.paddle.com/help/sell/tax/how-paddle-handles-vat-on-your-behalf

### Stripe Brazil
- Domestic cards: 3.99% + R$0.39.
- International cards: additional 2%.
- Pix: 1.19%, currently documented as invite-only.
- dispute received fee: R$55.
- manual dispute counter fee: R$55, returned on wins.
- standard 3DS included.
- Radar Lite included in standard pricing.

Source:
- https://stripe.com/br/pricing
- https://stripe.com/br/radar/pricing

### RunPod
Current planning references:
- 16 GB serverless class: ~$0.58/hr.
- 24 GB serverless class: ~$0.69/hr.
- RTX 4090 serverless: ~$1.10/hr.
- 48 GB A40/A6000 class: ~$1.22/hr.
- 48 GB L40-class: ~$1.75/hr.

Sources:
- https://www.runpod.io/pricing
- https://www.runpod.io/articles/guides/ai-server-cost

### FX
Planning snapshot on 2026-10-01:
- USD/BRL ≈ 5.2248.

No FX rate may be hardcoded as a permanent economic assumption.

---

# 176. SPR-PLAN-004 Verdict

### Credit architecture
**APPROVED**

### Free-tier economics
**APPROVED**

### Credit-pack-first launch
**APPROVED**

### Margin protection model
**APPROVED**

### Refund/fraud/chargeback reserves
**APPROVED AS FORMULAS / RATES NOT FROZEN**

### Payment provider
**PADDLE PREFERRED PLANNING CANDIDATE / NOT CONTRACTUALLY SELECTED**

### Public pack prices
**NOT FROZEN**

### Credit quantity per pack
**NOT FROZEN**

### Working-capital requirement
**FORMULA APPROVED / AMOUNT NOT FROZEN**

### Implementation
**NOT STARTED**

---

# 177. Next Recommended Planning Increment

## SPR-PLAN-005 — Security, TrustShield, Abuse Graph & Account/Payment Risk Architecture

**Classification:** NECESSARY / HIGH_ASSURANCE

### Objective

Turn anti-multi-account, trial-abuse, API abuse and payment-risk ideas into explicit architecture, signals, risk tiers, privacy constraints and evidence flows.

### Required Outputs

1. identity/account threat model;
2. multi-account graph schema;
3. device/network signal policy;
4. privacy-safe fingerprint strategy;
5. email risk signals;
6. payment-method linkage strategy;
7. TrustShield score architecture;
8. risk tiers/actions;
9. trial eligibility rules;
10. purchase exposure tiers;
11. API/MCP abuse controls;
12. rate limits;
13. bot protection;
14. referral abuse protection;
15. account-takeover protection;
16. chargeback evidence bundle;
17. audit requirements;
18. LGPD data minimization/retention;
19. admin risk console specification;
20. false-positive handling;
21. ban/appeal/review workflow;
22. incident/kill-switch policies.

### STOP CONDITION

Do not expose public free generation, referral rewards or high-value first purchases until TrustShield v1 requirements and privacy/security controls are represented in the canonical Source Pack and tested.

---

# 178. Updated Checkpoint

**Current stage:** PRE-REPOSITORY PRODUCT PLANNING  
**Completed increment:** SPR-PLAN-004 — Credit Economics, Pricing Safety & Financial Simulation  
**Verdict:** APPROVED  
**Canonical temporary source:** `SPRYXEL-PRODUCT-MASTER.md`  
**Master version:** 0.5.0  
**Implementation started:** NO  
**Repository exists:** NO  
**Public free cloud spend:** DEFAULT 0  
**Commercial launch shape:** PREPAID CREDIT PACKS FIRST  
**Commercial prices:** NOT FROZEN  
**Credit quantities:** NOT FROZEN  
**Canonical cost currency:** USD  
**Owner reporting currency:** USD + BRL  
**Early MoR candidate:** Paddle  
**Direct-payment alternative:** Stripe  
**Working-capital gate:** REQUIRED  
**Next necessary increment:** SPR-PLAN-005 — Security, TrustShield, Abuse Graph & Account/Payment Risk Architecture  
**Known blocker for continued planning:** none  
**Commercial launch blockers:** executed generation benchmarks, measured COGS, payment-provider onboarding/verification, accounting/tax review, TrustShield/security validation, working-capital reserve, trademark/domain clearance.


---

# 179. SPR-PLAN-005 — Security, TrustShield, Abuse Graph & Account/Payment Risk Architecture

**Status:** APPROVED / COMPLETED IN MASTER v0.6.0  
**Classification:** NECESSARY / HIGH_ASSURANCE

## 179.1 Objective

Transform anti-multi-account, trial abuse, payment fraud, account takeover and API/MCP protection into explicit, auditable architecture with:
- bounded financial exposure;
- privacy-conscious signals;
- explainable decisions;
- false-positive recovery;
- kill switches;
- no single-signal bans.

---

# 180. Threat Model

Primary threats:

```text
T-001 Multi-account trial farming
T-002 Bot signup farming
T-003 VPN/proxy rotation
T-004 Disposable-email farming
T-005 Referral self-farming/rings
T-006 Stolen-card purchases / card testing
T-007 Friendly-fraud refund abuse
T-008 Chargeback after credit consumption
T-009 Account takeover / credential stuffing
T-010 Session/token theft
T-011 API key theft
T-012 MCP credential leakage
T-013 Agent runaway spend
T-014 Concurrency/cost abuse
T-015 Promo-code abuse
T-016 Payment-method reuse across farms
T-017 Privileged/admin compromise
T-018 Webhook replay/spoofing
T-019 Rate-limit bypass
T-020 Storage/download abuse
T-021 Cross-tenant unauthorized access
```

---

# 181. TrustShield Principles

1. No single signal is authoritative.
2. Same IP never proves same person.
3. Same device token never proves same human.
4. Promotional eligibility is separate from account existence.
5. Trust increases gradually; event risk is dynamic.
6. Risk decisions are versioned and explainable internally.
7. Hard spend caps exist independently of risk score accuracy.
8. Security data collection follows minimization.
9. False positives must have a review/recovery path.
10. Automated score alone cannot permanently delete an account.
11. Rules/graph logic comes before internal ML.
12. TrustShield never mutates wallet balances directly.

---

# 182. TrustShield Architecture

```text
Request / Event
      ↓
Signal Collector
      ↓
Normalization
      ↓
Trust Graph
      ↓
Rules Engine
      ↓
Risk Score + Reason Codes
      ↓
Policy Engine
      ↓
ALLOW
ALLOW_WITH_LIMITS
STEP_UP
REVIEW
DENY_BENEFIT
BLOCK_COST
```

---

# 183. Trust Graph

## Node Types

```text
ACCOUNT
SESSION
DEVICE_TOKEN
NETWORK_TOKEN
EMAIL_IDENTITY
EMAIL_DOMAIN
PAYMENT_CUSTOMER
PAYMENT_INSTRUMENT_TOKEN
PURCHASE
API_KEY
MCP_CLIENT
REFERRAL_CODE
PROMOTION
PROJECT
GENERATION_JOB
DISPUTE
REFUND
SECURITY_EVENT
```

## Edge Types

```text
ACCOUNT_USED_DEVICE
ACCOUNT_USED_NETWORK
ACCOUNT_USED_EMAIL_DOMAIN
ACCOUNT_USED_PAYMENT_INSTRUMENT
ACCOUNT_REFERRED_ACCOUNT
ACCOUNT_CREATED_API_KEY
ACCOUNT_USED_MCP_CLIENT
PURCHASE_USED_PAYMENT_INSTRUMENT
ACCOUNT_RECEIVED_PROMOTION
ACCOUNT_HAS_DISPUTE
ACCOUNT_HAS_REFUND
DEVICE_ASSOCIATED_ACCOUNT
NETWORK_ASSOCIATED_ACCOUNT
```

Every edge records:
- first_seen_at;
- last_seen_at;
- confidence;
- source;
- retention_class;
- reason code.

---

# 184. Signal Strength

### Weak
- shared IP;
- same ASN;
- common email domain.

### Medium
- same first-party pseudonymous device token;
- repeated signup timing pattern;
- repeated session/client pattern.

### Strong
- same payment-instrument provider token across unrelated accounts;
- same verified phone where justified;
- referral ring plus strong shared signals;
- compromised credential reuse.

Policies use signal combinations rather than single-signal enforcement.

---

# 185. Privacy-Preserving Device Strategy

## V1

Issue a random first-party SPRYXEL device token.

Properties:
- first-party only;
- random;
- no cross-site tracking;
- HMAC/keyed representation on server where practical;
- used for trial/security correlation;
- not treated as proof of personhood.

## Explicit Non-Goal

V1 does not depend on invasive persistent browser fingerprinting such as:
- canvas fingerprinting;
- audio fingerprinting;
- installed-font enumeration;
- invasive hardware probing.

Advanced device intelligence requires future privacy/security review.

---

# 186. Bot / Human Verification

Primary V1 candidate:

**Cloudflare Turnstile**

Protect:
- signup;
- password recovery;
- suspicious login;
- trial request;
- referral redemption;
- suspicious generation bursts.

Rules:
- validate via Siteverify on the server;
- reject replay/expired tokens;
- validate expected hostname/action where applicable;
- log only necessary outcome metadata.

Cloudflare Ephemeral IDs are treated as an optional Enterprise future enhancement, not a V1 dependency.

---

# 187. Signup Pipeline

```text
Signup
↓
Edge rate limit
↓
Turnstile
↓
Email normalization / risk
↓
Network + device signals
↓
Account creation
↓
Email verification
↓
TrustShield evaluation
↓
Independent Trial Eligibility evaluation
```

Invariant:

```text
ACCOUNT_CREATED != TRIAL_APPROVED
```

---

# 188. Email Risk Signals

Potential:
- verification state;
- disposable-domain reputation;
- suspicious alias patterns;
- signup velocity;
- bounce history;
- known abuse-cluster links.

Do not penalize mainstream domains solely because many users share them.

---

# 189. Network Signals

Potential:
- event IP;
- network prefix;
- ASN;
- datacenter/proxy/VPN/Tor indication;
- country/region;
- event velocity.

Special care:
- CGNAT;
- schools;
- companies;
- coworking;
- households;
- mobile networks.

Rule:

```text
SAME_IP != SAME_PERSON
```

Raw network data should be short-lived where possible, with pseudonymous derived tokens used for longer security correlation.

---

# 190. Payment Signals

Use processor/Merchant-of-Record identifiers, not raw card data.

Potential:
- provider customer ID;
- provider payment-instrument token/fingerprint when available;
- country signals;
- 3DS/auth result;
- processor fraud/risk result;
- failure velocity;
- dispute/refund history.

Never store:
- raw PAN;
- CVV;
- complete card details.

Same payment instrument across accounts is strong context, not automatic fraud.

Legitimate cases include:
- family;
- corporate card;
- studio team.

---

# 191. Trust Level and Dynamic Risk

## Trust Level

```text
N0_NEW
N1_VERIFIED
N2_ESTABLISHED
N3_STUDIO_TRUSTED
```

## Event Risk

```text
0–24   R0_LOW
25–49  R1_ELEVATED
50–69  R2_HIGH
70–84  R3_VERY_HIGH
85–100 R4_CRITICAL
```

Initial planning bands only; real data calibrates them.

---

# 192. Risk Reason Codes

Examples:

```text
RISK_SIGNUP_VELOCITY
RISK_DEVICE_PROMO_REUSE
RISK_NETWORK_PROMO_VELOCITY
RISK_DISPOSABLE_EMAIL
RISK_PAYMENT_MULTI_ACCOUNT
RISK_PAYMENT_FAILURE_VELOCITY
RISK_RECENT_CHARGEBACK
RISK_REFERRAL_LOOP
RISK_API_BURST
RISK_MCP_BUDGET_BURST
RISK_LOGIN_GEO_ANOMALY
RISK_SESSION_ANOMALY
RISK_ACCOUNT_TAKEOVER_PATTERN
```

Risk decisions must expose internal reasons, not just opaque scores.

---

# 193. Policy Actions

## R0_LOW
Normal.

## R1_ELEVATED
- Turnstile/step-up;
- lower promo throughput;
- extra audit.

## R2_HIGH
- trial denied or delayed;
- first purchase restricted/verified;
- concurrency reduced;
- sensitive actions may require MFA.

## R3_VERY_HIGH
- promotions denied;
- stronger payment authentication;
- API/MCP budget reduced;
- review.

## R4_CRITICAL
- new cost-incurring request blocked;
- credential/session revocation if compromise is evidenced;
- security review.

---

# 194. Trial Eligibility

States:

```text
ELIGIBLE
INELIGIBLE
REVIEW
USED
EXPIRED
```

Possible conditions:
- verified account;
- successful bot check;
- no prior redeemed trial in strongly linked cluster;
- acceptable current risk;
- campaign/free budget available.

User can remain:

```text
ACCOUNT_ALLOWED
TRIAL_INELIGIBLE
```

---

# 195. Multi-Account Patterns

## Simple Farm

```text
Device D1
├─ Account A → trial used
├─ Account B → trial request
└─ Account C → trial request
```

Expected:
- accounts may remain;
- additional promotional grant denied.

## Rotating IP

```text
A → Network 1 → Device D1
B → Network 2 → Device D1
C → Network 3 → Device D1
```

Device relation strengthens the cluster.

## Payment Cluster

Several accounts use same payment instrument.

Expected:
- contextual review;
- legitimate paid use can remain;
- repeated promotional benefit may be denied.

## Referral Ring

Circular referrals plus strong shared signals.

Expected:
- reward frozen/reviewed;
- no automatic destructive ban.

---

# 196. False-Positive Strategy

Preferred escalation:

```text
restrict benefit
↓
step-up verification
↓
reduce exposure/concurrency
↓
review
↓
temporary cost block
↓
permanent enforcement only with strong evidence
```

False-positive rate is itself a quality metric.

---

# 197. Purchase Exposure Tiers

## N0_NEW
- smallest approved packs;
- low concurrency;
- processor risk checks;
- no abnormal burst.

## N1_VERIFIED
- normal packs;
- higher concurrency;
- bounded API use.

## N2_ESTABLISHED
- larger packs;
- higher API/MCP quotas.

## N3_STUDIO_TRUSTED
Future:
- organization billing;
- team credentials;
- higher limits.

Values remain configurable.

---

# 198. Account-Takeover Protection

Signals:
- new device;
- abrupt location change;
- password reset + immediate purchase;
- new API key + high-cost generation;
- MFA removal;
- email change;
- session anomaly.

Responses:
- step-up MFA;
- session revoke;
- temporarily block high-risk purchase/key creation;
- notify user;
- reauthentication.

---

# 199. MFA Architecture

Supabase-based planning:

### Consumer
- optional but encouraged.

### Sensitive Actions
May require stronger assurance:
- email change;
- MFA removal;
- privileged API key creation;
- owner/admin changes;
- high-risk purchase;
- sensitive export.

### SPRYXEL Owner/Admin
**MFA required.**

---

# 200. Session Security

Requirements:
- short-lived access tokens;
- refresh-token rotation;
- session ID correlation;
- compromised-session revocation;
- reauth/step-up for sensitive actions;
- user-visible session management;
- never log bearer tokens.

---

# 201. Layered Rate Limiting

Use:

```text
Supabase Auth native rate limits
+
SPRYXEL edge/risk-aware limits
```

Possible dimensions:
- account;
- device token;
- network token;
- API key;
- MCP client;
- promotion;
- SKU.

Generation limits must be **cost-aware**, not only request-count-aware.

---

# 202. Cost-Aware Abuse Limits

Control:
- requests/time;
- concurrent jobs;
- credits/hour/day;
- internal COGS/day;
- candidate count;
- retry count;
- workflow fan-out.

Most important limit:

```text
MAX_COST
```

---

# 203. API Key Architecture

Concept:

```text
sprx_live_<prefix>.<secret>
sprx_test_<prefix>.<secret>
```

Requirements:
- plaintext visible once;
- secret stored as secure hash/HMAC;
- prefix searchable;
- workspace/project scope;
- explicit scopes;
- revocable;
- expiration support;
- last-used tracking;
- daily/monthly budget;
- optional network allowlist.

---

# 204. API Scopes

Examples:

```text
projects:read
assets:read
assets:write
generations:create
generations:read
maps:create
ui:create
exports:create
credits:read
billing:read
```

No broad master key by default.

---

# 205. API Key Budgets

```text
max_credits_per_job
max_credits_per_day
max_credits_per_month
max_concurrent_jobs
allowed_skus
allowed_quality_profiles
```

A leaked key cannot spend beyond its policy.

---

# 206. Remote MCP Authorization

Planning direction:
- OAuth-based authorization;
- discovery metadata;
- bearer token verification;
- least-privilege scopes;
- resource-bound access;
- step-up for stronger scopes when supported.

Interactive remote MCP clients prefer OAuth.

API keys remain for headless/server/CI automation.

---

# 207. MCP Risk Classes

```text
READ_ONLY
LOW_COST_MUTATION
COST_INCURRING
HIGH_IMPACT
```

Examples:

READ_ONLY:
- list projects;
- inspect assets;
- check jobs.

COST_INCURRING:
- generate;
- render map;
- repair.

HIGH_IMPACT:
- bulk generation;
- privileged billing/config.

Higher classes may require:
- stronger scope;
- budget;
- trust;
- step-up;
- explicit confirmation.

---

# 208. Agent Runaway Protection

Every cost-incurring agent request supports:

```text
max_credits
max_jobs
max_candidates
max_repairs
max_retries
max_wall_time
```

Composite workflows receive:

```text
workflow_budget
```

Child calls inherit and consume the parent budget.

Recursive calls cannot reset the budget.

---

# 209. API/MCP Idempotency

Cost-incurring mutations use idempotency keys.

Repeated request:
- returns existing operation;
- never reserves credits twice;
- never creates duplicate generations.

---

# 210. Referral and Promotion Abuse

Referral remains gated until TrustShield exists.

Referral controls:
- no self-referral;
- qualifying event before reward;
- delayed reward;
- graph analysis;
- hard campaign budget;
- promotional adjustment via compensating ledger entries when applicable.

Promotion controls:
- audience;
- redemption cap;
- trust requirement;
- cluster policy;
- date window;
- SKU scope;
- budget.

Purchased credits are not seized simply to recover promo abuse.

---

# 211. Storage / Download Abuse

Controls:
- non-guessable object IDs;
- signed URLs;
- short-lived links;
- project authorization;
- bandwidth/download limits;
- export audit;
- no enumerable public asset URLs.

---

# 212. Tenant Isolation

Every request involving:

```text
project
asset
generation
wallet
API key
export
map
UI pack
billing
```

must enforce tenant authorization.

Defense in depth:
- PostgreSQL RLS;
- application-level authorization;
- storage policies;
- signed URLs;
- cross-tenant IDOR tests.

Cross-tenant access defect:

```text
CRITICAL
```

---

# 213. Payment Webhook Security

Requirements:
- signature verification;
- replay/timestamp controls where supported;
- provider event ID persistence;
- idempotency;
- never trust client-only success state;
- provider API reconciliation on ambiguity.

Webhook events pass through canonical billing/ledger logic.

---

# 214. Security Evidence Bundle

Relevant event record:

```text
event_id
account_id
session_id
device_token_ref
network_token_ref
payment_ref
risk_score
risk_reasons
policy_decision
trust_level
related_jobs
related_purchase
timestamp
policy_version
```

Do not duplicate raw sensitive signals unnecessarily.

---

# 215. Chargeback Evidence Bundle

Potential contents:
- transaction reference;
- accepted Terms version;
- account verification;
- 3DS/auth result;
- credit issuance;
- ledger consumption;
- generation jobs;
- successfully delivered assets;
- downloads/exports;
- API/MCP usage;
- support/refund history;
- legally appropriate security context.

All evidence remains factual.

---

# 216. Security Events

```text
AUTH_SIGNUP
AUTH_LOGIN
AUTH_LOGIN_FAILED
AUTH_PASSWORD_RESET
AUTH_EMAIL_CHANGE
AUTH_MFA_ENROLL
AUTH_MFA_REMOVE
SESSION_REVOKE

RISK_TRIAL_REQUEST
RISK_PROMO_REDEMPTION
RISK_REFERRAL
RISK_PAYMENT
RISK_GENERATION
RISK_API
RISK_MCP

PAYMENT_SUCCESS
PAYMENT_FAILURE
PAYMENT_REFUND
PAYMENT_DISPUTE

KEY_CREATE
KEY_ROTATE
KEY_REVOKE

ADMIN_RISK_OVERRIDE
ADMIN_CREDIT_GRANT
ADMIN_ACCOUNT_RESTRICTION
```

---

# 217. TrustShield Versioning

Every automated decision records:

```text
policy_version
signal_schema_version
score_model_version
```

Enables:
- audit;
- rollback;
- reproduction;
- false-positive analysis.

---

# 218. Rules Before ML

V1 TrustShield uses:
- explicit rules;
- graph relationships;
- velocity;
- payment-provider signals;
- hard cost limits.

Internal ML is deferred until enough labeled outcomes exist.

---

# 219. Privacy / LGPD Data Inventory

Categories:

## Operational
- account ID;
- session ID;
- first-party device token.

## Network / Security
- IP/network information;
- ASN;
- security-provider results.

## Payment-Derived
- processor customer ID;
- payment instrument token/fingerprint;
- dispute ID.

## Contact
- email;
- optional phone if justified.

Each field must document:
- purpose;
- lawful-basis candidate;
- access;
- retention class;
- processor/subprocessor;
- deletion behavior.

---

# 220. Data-Minimization Gate

Before adding any new security signal document:

```text
purpose
necessity
less_intrusive_alternative
retention
access
security
false_positive_risk
```

Prefer less intrusive alternatives when they achieve the purpose.

---

# 221. Fraud / Legitimate-Interest Review

Do not interpret "security" as unlimited surveillance.

Where applicable:
- perform balancing/proportionality analysis;
- define exact purpose;
- consider reasonable user expectations;
- evaluate less intrusive alternatives;
- document safeguards.

---

# 222. Retention Architecture

Retention classes:

```text
RET_AUTH_SHORT
RET_NETWORK_SHORT
RET_RISK_DERIVED
RET_PAYMENT_LEGAL
RET_DISPUTE_HOLD
RET_AUDIT_HIGH_ASSURANCE
RET_PROMO_ANALYTICS
```

Final retention periods require legal/operational review.

Legal hold can suspend deletion for data relevant to:
- open dispute;
- incident;
- legal obligation.

---

# 223. Secret Management

Requirements:
- no production secret in Git;
- dev/test/prod separation;
- rotation;
- browser never receives service-role/provider secrets;
- API secrets stored hashed;
- model/provider credentials server-side;
- encrypted transport.

---

# 224. Admin Security

Owner/Admin:
- MFA required;
- RBAC;
- stronger session controls;
- step-up for critical actions;
- immutable audit;
- no silent impersonation.

Critical actions:
- credit grant;
- refund override;
- risk override;
- unblock;
- credential/provider rotation;
- payment config;
- model routing config;
- kill-switch changes.

---

# 225. Admin Risk Console

Views:

## Queue
- trial reviews;
- payment risk;
- API/MCP anomalies;
- account reviews.

## Graph
- accounts;
- devices;
- networks;
- payments;
- referrals;
- disputes.

## Timeline
- signup;
- login;
- payment;
- generation;
- refund;
- dispute;
- policy action.

## Actions
- allow;
- deny promo;
- require step-up;
- temporary restriction;
- clear false positive.

---

# 226. User-Facing Security Messaging

Do not expose antifraud implementation details.

Preferred:
> This promotional offer isn't available for this account. You can continue with eligible paid options or contact support if you believe this is an error.

Avoid revealing:
- device hashes;
- linked account IDs;
- detection thresholds;
- internal fraud rules.

---

# 227. Review / Appeal

```text
User reports false positive
↓
Support case
↓
Minimized evidence review
↓
Decision
↓
Override or maintain
↓
Reason code
↓
Audit
```

---

# 228. Kill Switches

## Security
```text
DISABLE_SIGNUPS
DISABLE_TRIALS
DISABLE_REFERRALS
DISABLE_API_KEY_CREATION
DISABLE_MCP_MUTATIONS
REQUIRE_GLOBAL_STEP_UP
```

## Payment
```text
DISABLE_NEW_PURCHASES
DISABLE_HIGH_VALUE_PURCHASES
FORCE_STRONG_PAYMENT_AUTH
```

## Existing Financial
```text
DISABLE_FREE_CLOUD
DISABLE_SKU
GLOBAL_GPU_STOP
PROVIDER_BUDGET_STOP
```

All are:
- audited;
- reasoned;
- reversible.

---

# 229. Incident Modes

### NORMAL
Standard operation.

### ELEVATED
Possible:
- tighter rate limits;
- more bot checks;
- trial freeze;
- alerts.

### LOCKDOWN
Possible:
- stop new cost-incurring requests;
- revoke compromised credential classes;
- disable purchases;
- force reauthentication.

---

# 230. Rate-Limit Matrix

| Surface | Primary dimensions | Cost-aware |
|---|---|---|
| Signup | network/device | No |
| Login | account/network | No |
| Password reset | account/network | No |
| Trial | account/device/cluster | Yes |
| Purchase | account/payment/risk | Exposure-aware |
| Generate UI | account/SKU | Yes |
| REST API | key/account/SKU | Yes |
| MCP | subject/client/tool | Yes |
| Download | account/project/object | Bandwidth-aware |
| Referral | account/cluster/code | Budget-aware |

Numeric limits remain configurable.

---

# 231. TrustShield Observability

Metrics:

```text
signup_block_rate
turnstile_failure_rate
trial_eligibility_rate
trial_abuse_prevented
multi_account_cluster_count
false_positive_review_rate
step_up_rate
payment_high_risk_rate
chargeback_by_risk_band
refund_by_risk_band
api_abuse_events
mcp_budget_blocks
account_takeover_events
session_revocations
```

False-positive metrics:

```text
appeals_created
appeals_upheld
appeals_overturned
time_to_review
promo_false_positive_rate
purchase_limit_false_positive_rate
account_restriction_false_positive_rate
```

---

# 232. TrustShield Test Plan

## Unit
- rule evaluation;
- graph edges;
- retention/TTL behavior;
- API scopes;
- budget enforcement.

## Integration
- signup + Turnstile;
- trial request;
- payment webhook;
- generation authorization;
- API key budget;
- MCP authorization;
- session revoke.

## Abuse Simulation
- 20 accounts / one device;
- rotating IP / one device;
- shared IP legitimate users;
- shared payment instrument;
- referral ring;
- leaked API key;
- recursive agent generation.

---

# 233. Golden Security Scenarios

### TS-GOLD-001 — Legitimate Household
Same IP, separate devices/accounts.  
Expected: no auto-ban.

### TS-GOLD-002 — Trial Farm
Ten accounts, one device, rotating email/IP.  
Expected: one promotional eligibility maximum; accounts not destroyed.

### TS-GOLD-003 — Corporate Card
Several studio members share corporate card.  
Expected: no automatic fraud ban.

### TS-GOLD-004 — Referral Ring
Circular referrals + strong shared signals.  
Expected: rewards frozen/reviewed.

### TS-GOLD-005 — Account Takeover
Old account + reset + new device + new key + expensive job.  
Expected: step-up / sensitive-action block.

### TS-GOLD-006 — API Leak
One key bursts to budget ceiling.  
Expected: key-specific stop.

### TS-GOLD-007 — Coworking
Many legitimate accounts share one network.  
Expected: IP alone has no punitive effect.

---

# 234. TrustShield v1 Acceptance Criteria

Before public promotional GPU generation:

1. Turnstile server verification.
2. Signup rate limiting.
3. First-party device token.
4. Trial eligibility separated from account state.
5. Promotional hard budget.
6. Graph relations for device/network/payment.
7. No IP-only auto-ban.
8. Reason codes and policy version on decisions.
9. Scoped/hashed API keys.
10. API/MCP cost budgets.
11. Admin MFA.
12. Idempotent payment webhooks.
13. Cross-tenant tests.
14. Security audit trail.
15. False-positive review path.
16. Retention classes documented.
17. Kill switches tested.

---

# 235. Current External Security Notes — 2026-10-01

## Cloudflare Turnstile

Current documentation indicates:
- Free plan;
- up to 20 widgets on Free;
- unlimited challenges/verification requests on Free;
- server-side Siteverify is mandatory;
- tokens are single-use and expire after roughly 5 minutes;
- Ephemeral IDs are Enterprise-only.

Planning consequence:
V1 can use free Turnstile without paid device-identity dependencies.

## Supabase Auth

Current documentation indicates:
- authentication endpoint rate limits;
- many limits configurable;
- TOTP and phone MFA;
- `aal1` / `aal2` assurance levels;
- some advanced session controls are plan-dependent.

Planning consequence:
use native Auth protections plus SPRYXEL-specific risk and COGS controls.

## MCP

Current MCP authorization guidance supports OAuth-based authorization for protected remote servers/tools with discovery, bearer-token validation and scoped access.

Planning consequence:
AgentBridge remote interactive usage is OAuth-first.

## ANPD / LGPD

Current ANPD guidance emphasizes:
- security risk management;
- purpose limitation;
- proportionality;
- minimization;
- documented balancing in relevant legitimate-interest/fraud scenarios.

TrustShield is a fraud/security system, not a general surveillance system.

---

# 236. Decisions Ledger Additions

### D-074 — Graph-Based TrustShield
Multi-account/fraud uses graph + multiple signals, never IP-only.  
**APPROVED**

### D-075 — Promotional Eligibility Separation
Account and free-value eligibility are independent.  
**APPROVED**

### D-076 — Privacy-Preserving Device Signal
First-party pseudonymous token; invasive fingerprinting is not a V1 dependency.  
**APPROVED**

### D-077 — Turnstile V1
Cloudflare Turnstile preferred for V1 bot verification with server validation.  
**APPROVED FOR PLANNING**

### D-078 — Ephemeral IDs
Optional future Enterprise enhancement only.  
**APPROVED**

### D-079 — Rules Before ML
TrustShield v1 uses rules/graph/provider signals.  
**APPROVED**

### D-080 — No Auto-Delete by Score
Automated risk score alone cannot permanently delete account.  
**APPROVED**

### D-081 — Trial Cluster Rule
Strong-linked accounts may share one promotional eligibility.  
**APPROVED**

### D-082 — Payment Tokenization
No raw card storage; provider identifiers only.  
**APPROVED**

### D-083 — Admin MFA
Production owner/admin requires MFA.  
**APPROVED**

### D-084 — Agent Budget Inheritance
Nested agent calls consume one bounded workflow budget.  
**APPROVED**

### D-085 — OAuth-First Remote MCP
Interactive remote MCP prefers OAuth.  
**APPROVED**

### D-086 — Scoped API Keys
Keys are one-time revealed, hashed, scoped, budgeted and revocable.  
**APPROVED**

### D-087 — False Positive Recovery
Review/appeal plus false-positive metrics required.  
**APPROVED**

### D-088 — Security Kill Switches
Independent shutdown controls for signups, trials, referrals, agent mutations, purchases and generation.  
**APPROVED**

### D-089 — Security Data Minimization
Each security signal requires purpose, necessity, access and retention documentation.  
**APPROVED**

---

# 237. SPR-PLAN-005 Verdict

Threat model: **APPROVED**  
Multi-account architecture: **APPROVED**  
Trial-abuse architecture: **APPROVED**  
Payment-risk architecture: **APPROVED**  
Account-takeover architecture: **APPROVED**  
API/MCP security: **APPROVED**  
Privacy/LGPD design: **APPROVED FOR PLANNING / LEGAL REVIEW REQUIRED BEFORE LAUNCH**  
Turnstile: **PREFERRED V1 BOT-PROTECTION CANDIDATE**  
TrustShield ML: **DEFERRED**  
Implementation: **NOT STARTED**

---

# 238. Next Recommended Planning Increment

## SPR-PLAN-006 — Product UX, Design System & Information Architecture

**Classification:** NECESSARY

### Objective

Define the complete visual and interaction architecture for a premium developer-first creative platform before UI implementation.

### Required Outputs

1. visual principles;
2. brand direction;
3. typography;
4. token/color architecture;
5. dark/light themes;
6. glass/translucency rules;
7. motion system;
8. layout/grid;
9. responsive strategy;
10. global navigation;
11. project navigation;
12. Generate Studio UX;
13. Character Studio UX;
14. Map Studio UX;
15. UI/HUD Studio UX;
16. Asset Library UX;
17. Jobs/Queue UX;
18. Credits/Billing UX;
19. API/MCP UX;
20. Owner/Admin UX;
21. risk-safe messaging;
22. onboarding;
23. empty/loading/error/success states;
24. toast/notification system;
25. accessibility;
26. i18n layout rules;
27. command palette;
28. keyboard-first workflows;
29. desktop/mobile strategy;
30. screen inventory.

### STOP CONDITION

Do not implement visual components until navigation, information hierarchy, core screen contracts, theme/token architecture and accessibility rules are represented in the canonical Source Pack.

---

# 239. Updated Checkpoint

**Current stage:** PRE-REPOSITORY PRODUCT PLANNING  
**Completed increment:** SPR-PLAN-005 — Security, TrustShield, Abuse Graph & Account/Payment Risk Architecture  
**Verdict:** APPROVED  
**Canonical temporary source:** `SPRYXEL-PRODUCT-MASTER-v0.6.0.md`  
**Master version:** 0.6.0  
**Implementation started:** NO  
**Repository exists:** NO  
**TrustShield:** ARCHITECTURE DEFINED  
**Trial eligibility:** SEPARATE FROM ACCOUNT CREATION  
**Bot protection:** TURNSTILE V1 CANDIDATE  
**Invasive fingerprinting:** NOT A V1 DEPENDENCY  
**Remote MCP auth:** OAUTH-FIRST  
**API keys:** SCOPED / HASHED / BUDGET-LIMITED  
**Admin MFA:** REQUIRED  
**Public free cloud spend:** DEFAULT 0  
**Commercial pricing:** NOT FROZEN  
**Next necessary increment:** SPR-PLAN-006 — Product UX, Design System & Information Architecture  
**Known blocker for continued planning:** none  
**Commercial launch blockers:** executed benchmarks, measured COGS, payment onboarding, accounting/tax review, security implementation/validation, privacy/legal review, working-capital reserve, trademark/domain clearance.
