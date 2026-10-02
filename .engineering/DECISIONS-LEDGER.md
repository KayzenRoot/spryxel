# Decisions Ledger

Status: CANONICAL-CANDIDATE — SPRYXEL-WO-003 / SPR-PLAN-006; awaiting audit and checkpoint promotion.

## D-0001 — GEF version
Use `@gef-bootstrap/cli@1.1.1` exactly. Upgrade requires a future Work Order.

## D-0002 — GitHub-first executor model
Adopt the GEF ADR-0008 operating model for this project: ChatGPT specifies/audits; Codex implements code/tests/CI; GitHub carries durable tasks and evidence.

## D-0003 — Product definition deferred
Historical decision for the SPRYXEL-WO-001 governance-bootstrap stage: no product mission, feature, or architecture was inferred during bootstrap; product truth was TBD until owner planning.

Current-state reconciliation: the owner-approved pre-repository Product Master v0.6.0 records product decisions D-001 through D-089. SPRYXEL-WO-002 migrated and objectively audited them into the repository Source Pack. After authorized checkpoint promotion, this ledger is the canonical owner of those stable decision IDs; the seed remains immutable historical evidence.

## D-0004 — Safe main protection
The target ruleset for `main` requires PR integration, resolved threads, deletion/non-fast-forward protection and no bypass. Required status checks are added only after their exact contexts have succeeded in Spryxel.

## D-0005 — Cost boundary
No paid/trial-only external service may become a required merge gate without explicit future owner approval.

## D-0006 — Checkpoint authority
Executor may propose a Checkpoint Delta but may not self-promote it. Promotion follows objective audit.

## D-0007 — GEF v1.1.1 drift interpretation
The installed v1.1.1 baseline is immutable evidence and is not rewritten merely because governed project files evolve. The exact v1.1.1 release implementation routes `gef status` project-drift comparison through `detectDrift(..., { authorized: false })`. Consequently, post-baseline changes can be reported as `UNEXPECTED` even when a Work Order authorized them. Spryxel resolves authorization outside that raw diagnostic by binding the delta to the Work Order, Context Lock, exact Git diff and Evidence Bundle. Unbound drift remains blocking.

## Pre-repository product decision namespace (seed D-001 through D-089)

These stable IDs are distinct from repository governance decisions D-0001 through D-0007. Each entry below has its sole canonical ownership in this ledger. The migration matrix provides source sections and non-owning cross-references. Exact wording and status were extracted from immutable Product Master v0.6.0 and approved by the SPRYXEL-WO-002 audit.

### D-001 — Product Name
Decision: SPRYXEL
Status: APPROVED FOR PLANNING
Note: Formal trademark/domain clearance required before public launch.
Source: Product Master v0.6.0, numbered section 22.

### D-002 — Product Category
Decision: AI Game Asset Platform, not generic AI image generator.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 22.

### D-003 — Target Audience
Decision: Indie developers, solo developers, vibe coders and AI-native game builders.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 22.

### D-004 — Asset Scope
Decision: Architecture must support pixel, 2D, 2.5D and 3D. Delivery will be incremental.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 22.

### D-005 — Developer Interfaces
Decision: API and MCP are first-class product surfaces; CLI is planned.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 22.

### D-006 — Languages
Decision: English canonical/default; PT-BR and Spanish localized UI.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 22.

### D-007 — Development Environment
Decision: Local-first Docker with RTX 5050 as primary development inference hardware.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 22.

### D-008 — Initial Infrastructure
Decision: Use free tiers wherever commercially permitted; external GPU is pay-per-use/serverless until scale justifies dedicated capacity.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 22.

### D-009 — Credit Economics
Decision: Ledger-based credits with pre-generation reservation and CostGuard.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 22.

### D-010 — Anti-Abuse
Decision: TrustShield risk graph; no single-signal multi-account bans.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 22.

### D-011 — Refund Strategy
Decision: Do not obstruct statutory rights. Protect the company using trial design, new-account exposure caps, reserves, evidence, antifraud, cost pricing and hard limits.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 22.

### D-012 — Commercial Safety
Decision: No generation without bounded cost authorization.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 22.

### D-013 — Product Navigation Model
Decision: Organize SPRYXEL by game-production job, not AI model/provider.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 26.

### D-014 — Canonical Asset Model
Decision: Assets are versioned entities with metadata, lineage, DNA and provenance, not mere files.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 26.

### D-015 — Asset Families
Decision: SPRYXEL supports coherent asset families/packs as a first-class concept.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 26.

### D-016 — V1 Asset Focus
Decision: V1 focuses on Pixel + 2D while platform architecture remains ready for 2.5D and 3D.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 26.

### D-017 — Model Abstraction
Decision: Model/provider selection is hidden behind the Model Router and Generation SKU contracts.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 26.

### D-018 — Agent Budgeting
Decision: MCP/API calls must support bounded spend/retries and machine-readable budget errors.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 26.

### D-019 — Economic Benchmark Metric
Decision: Optimize for cost per accepted production asset, not merely cost per inference attempt.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 26.

### D-020 — Repair Strategy
Decision: Prefer targeted repair over full regeneration when quality and economics justify it.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 26.

### D-021 — Production Asset Gate
Decision: Raw AI output cannot become an approved asset without required QA gates.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 44.

### D-022 — Anatomy Quality
Decision: Anatomy/topology validation is mandatory for applicable character/creature SKUs.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 44.

### D-023 — Resolution-Aware Anatomy
Decision: Anatomy validation must respect pixel resolution; tiny sprites are validated semantically/silhouette-wise rather than requiring impossible photorealistic finger detail.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 44.

### D-024 — Asset Contract
Decision: Every generation compiles to an explicit Asset Contract before inference.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 44.

### D-025 — Multi-Signal QA
Decision: No single probabilistic vision model may be the sole production approval mechanism for anatomy-sensitive assets.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 44.

### D-026 — Targeted Repair
Decision: Localized repair is preferred to full regeneration when it is cheaper and expected to meet quality.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 44.

### D-027 — Model Eligibility
Decision: Production models require verified commercial eligibility, quality benchmark and known economics.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 44.

### D-028 — Qwen-Image-2.1
Decision: Benchmark/research candidate only under current Qwen Research License; not a commercial SPRYXEL production dependency at this stage.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 44.

### D-029 — Initial Commercial-Friendly Model Shortlist
Decision: Prioritize benchmarking Z-Image, FLUX.1-schnell and HiDream-O1-Image because current published licenses are commercially friendlier (Apache-2.0 / MIT), subject to final license review.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 44.

### D-030 — ComfyUI Boundary
Decision: ComfyUI is an inference/workflow adapter and R&D environment, not the owner of billing/business invariants.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 44.

### D-031 — Control Plane Architecture
Decision: Start with a modular-monolith control plane and independently scalable AI workers; no premature microservice split.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 44.

### D-032 — PostgreSQL Canonical State
Decision: PostgreSQL is canonical for users/projects/assets/jobs/ledger state; transient provider/queue state cannot replace it.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 44.

### D-033 — Local Profiles
Decision: Docker development uses profiles so 24 GB RAM / 8 GB VRAM are not overwhelmed by unnecessary simultaneous services.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 44.

### D-034 — Benchmark Metric
Decision: Track explicit anatomy defect rates and cost per accepted asset, not generic image quality alone.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 44.

### D-035 — Dual Quality Layer
Decision: Integrity Gate is binary and independent from Production Score.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 79.

### D-036 — Critical Defect Supremacy
Decision: Aesthetic quality can never override a critical structural failure.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 79.

### D-037 — Resolution Profiles
Decision: Pixel QA/anatomy rules vary by target resolution.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 79.

### D-038 — V1 SKU Contracts
Decision: V1 generation operations are versioned SKUs with explicit asset contracts and bounded retries.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 79.

### D-039 — Four-Direction Identity
Decision: A four-direction character set is accepted only if all directions preserve one character identity.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 79.

### D-040 — Baseline / Scale Control
Decision: Character families use explicit baseline and scale-drift rules.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 79.

### D-041 — Benchmark Promotion
Decision: No model/pipeline reaches paid production from subjective review alone.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 79.

### D-042 — Golden Asset Suite
Decision: Generation changes require versioned regression benchmarks.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 79.

### D-043 — Failed Quality Billing
Decision: Hard-gate-invalid generation is not treated as a valid delivered production asset for full-charge purposes.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 79.

### D-044 — Cost Attribution
Decision: Credit economics use the entire attempt/retry/QA/repair cost, not the winning inference only.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 79.

### D-045 — Maps as First-Class System
Decision: map creation is a dedicated SPRYXEL product domain, not a side feature.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 97.

### D-046 — Multi-Layer Map Scope
Decision: SPRYXEL must support world, region, local, dungeon/interior and minimap layers conceptually.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 97.

### D-047 — Hybrid Map Direction
Decision: SPRYXEL should pursue hybrid structured/procedural + AI-assisted map workflows where useful.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 97.

### D-048 — UI/HUD as First-Class Asset Family
Decision: menus, HUD, inventory/backpack and screen systems are first-class product surfaces.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 97.

### D-049 — Maps and UI Share Project DNA
Decision: maps, minimaps, markers and UI assets must participate in the same project style system.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 97.

### D-050 — Combined Workflow Packs
Decision: map/UI bundles such as world navigation packs and backpack UI packs are valid workflow-level outputs.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 97.

### D-051 — Map SKUs
Decision: map production is represented by explicit versioned SKUs, not generic image generation.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 117.

### D-052 — Structured Dungeon First
Decision: dungeon generation should support structure-first graph generation before visual rendering.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 117.

### D-053 — Map Layer Contract
Decision: structured map layers must be dimension-aligned and machine-addressable.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 117.

### D-054 — UI Pack SKUs
Decision: HUD, backpack, menus and screen systems are packaged as coherent multi-component SKUs.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 117.

### D-055 — Localization-Safe UI
Decision: UI generation must be localization-safe for English, PT-BR and Spanish.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 117.

### D-056 — Engine-Agnostic Canonical Export
Decision: canonical assets remain engine-independent; EngineBridge performs Godot/Unity adaptation.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 117.

### D-057 — Agent Map/UI APIs
Decision: maps and UI receive first-class MCP/API operations with bounded budgets and idempotency.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 117.

### D-058 — Non-Destructive World Evolution
Decision: map versioning should preserve stable region/POI identities when feasible.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 117.

### D-059 — Canonical Cost Currency
Decision: USD is canonical internal cost currency; BRL is secondary owner-reporting currency.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 174.

### D-060 — Abstract Credits
Decision: Spryxel Credits are abstract non-cash usage units with no permanently fixed currency value.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 174.

### D-061 — Full Redemption Safety
Decision: paid packs must remain profitable assuming 100% credit redemption.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 174.

### D-062 — Trial Entitlements
Decision: free trial defaults to restricted SKU entitlements instead of generic free SC.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 174.

### D-063 — Zero Public Free Cloud Budget
Decision: default public free-cloud budget is zero until explicitly funded by the owner/campaign.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 174.

### D-064 — Credit-Pack First Launch
Decision: initial commercial model prioritizes prepaid credit packs; subscriptions are deferred until usage/retention data exists.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 174.

### D-065 — Billing Abstraction
Decision: payment-provider semantics live behind a BillingProvider adapter.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 174.

### D-066 — Early Global MoR Candidate
Decision: Paddle is the preferred early global Merchant-of-Record candidate for further validation; Stripe remains a first-class direct-payment alternative.
Status: APPROVED FOR PLANNING, NOT PROCUREMENT
Source: Product Master v0.6.0, numbered section 174.

### D-067 — Small-Pack Guard
Decision: avoid tiny paid packs that are disproportionately consumed by fixed transaction fees; $10 is an initial simulation floor, not a final price.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 174.

### D-068 — Working Capital Gate
Decision: public paid cloud inference requires a working-capital reserve independent of booked revenue.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 174.

### D-069 — Margin Guardrails
Decision: target >=70% base contribution margin; launch models must also remain >=60% in conservative and >=30% in approved severe stress simulations.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 174.

### D-070 — Hard Negative-Margin Stop
Decision: CostGuard prevents new affected jobs when predicted contribution margin is non-positive.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 174.

### D-071 — Stress Simulation
Decision: every pack/SKU is tested against GPU, FX, quality-regression, refund, chargeback, fraud, free-farming, heavy-user and worst-mix scenarios.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 174.

### D-072 — No Cross-Subsidized Hidden Loss
Decision: no normal paid SKU may knowingly lose money and depend on low usage to hide the loss.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 174.

### D-073 — Pricing Freeze
Decision: public prices remain simulation-only until measured benchmark COGS and legal/accounting/payment inputs are available.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 174.

### D-074 — Graph-Based TrustShield
Decision: Multi-account/fraud uses graph + multiple signals, never IP-only.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 236.

### D-075 — Promotional Eligibility Separation
Decision: Account and free-value eligibility are independent.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 236.

### D-076 — Privacy-Preserving Device Signal
Decision: First-party pseudonymous token; invasive fingerprinting is not a V1 dependency.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 236.

### D-077 — Turnstile V1
Decision: Cloudflare Turnstile preferred for V1 bot verification with server validation.
Status: APPROVED FOR PLANNING
Source: Product Master v0.6.0, numbered section 236.

### D-078 — Ephemeral IDs
Decision: Optional future Enterprise enhancement only.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 236.

### D-079 — Rules Before ML
Decision: TrustShield v1 uses rules/graph/provider signals.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 236.

### D-080 — No Auto-Delete by Score
Decision: Automated risk score alone cannot permanently delete account.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 236.

### D-081 — Trial Cluster Rule
Decision: Strong-linked accounts may share one promotional eligibility.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 236.

### D-082 — Payment Tokenization
Decision: No raw card storage; provider identifiers only.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 236.

### D-083 — Admin MFA
Decision: Production owner/admin requires MFA.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 236.

### D-084 — Agent Budget Inheritance
Decision: Nested agent calls consume one bounded workflow budget.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 236.

### D-085 — OAuth-First Remote MCP
Decision: Interactive remote MCP prefers OAuth.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 236.

### D-086 — Scoped API Keys
Decision: Keys are one-time revealed, hashed, scoped, budgeted and revocable.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 236.

### D-087 — False Positive Recovery
Decision: Review/appeal plus false-positive metrics required.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 236.

### D-088 — Security Kill Switches
Decision: Independent shutdown controls for signups, trials, referrals, agent mutations, purchases and generation.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 236.

### D-089 — Security Data Minimization
Decision: Each security signal requires purpose, necessity, access and retention documentation.
Status: APPROVED
Source: Product Master v0.6.0, numbered section 236.

### D-090 — Product UX Posture
Decision: SPRYXEL is a premium, technical creative workstation: high information density where useful, calm hierarchy, strong canvas/workspace focus, and progressive disclosure instead of dashboard clutter.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-091 — Theme Strategy
Decision: full Dark and Light themes are required. Dark is the default creative-workspace presentation; Light is a first-class equal theme, not an afterthought.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-092 — Glass/Translucency Boundary
Decision: glass/translucency may be used for navigation chrome, overlays, floating toolbars, command palette, modals and transient surfaces. Dense forms, tables, logs, billing/security details and long text use opaque/high-contrast surfaces. Readability wins over visual effect.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-093 — Tokenized Color System
Decision: use semantic tokens, never raw feature-specific colors. Core roles: canvas/background/surface/elevated/border/text-muted; brand accent; success/info/warning/danger; selection/focus; job states; quality states; cost/risk states. All tokens have dark/light variants.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-094 — Brand Palette Direction
Decision: neutral graphite/slate foundations with a restrained spectral-violet primary accent and electric-teal secondary accent. Status colors stay semantically distinct and are never conveyed by color alone.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-095 — Typography
Decision: Inter Variable (or metrics-compatible open fallback) for product UI; JetBrains Mono (or metrics-compatible open fallback) for code, IDs, hashes, costs where monospacing improves scanning. Typography scale is tokenized.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-096 — Spatial System
Decision: 4 px base spacing grid; tokenized density, radius and elevation. Default workspace density is compact-comfortable with explicit compact mode for data-heavy/operator screens.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-097 — Motion
Decision: purposeful motion only. Canonical duration tiers approximately 120/180/240 ms; avoid decorative blocking animation; respect reduced-motion preference; never hide state transition behind animation.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-098 — Desktop-First Strategy
Decision: full production studios target desktop/laptop and remain usable from 1024 px upward; 1280–1440+ is the preferred workspace. Below 1024 px, complex studios switch to limited companion behavior rather than pretending the full canvas editor fits.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-099 — Mobile Companion
Decision: mobile/tablet supports monitoring jobs, reviewing/approving assets, notifications, account/billing, lightweight project browsing and safe simple actions. Full complex canvas/map/UI studio editing is not a V1 mobile promise.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-100 — Global/Project Navigation
Decision: distinguish global context from project context. Global shell owns Home/Command Center, Projects, notifications, developer/billing/account surfaces. A selected project owns DNA, Generate/Studios, Library/Graph, QA and Export.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-101 — Studio Workspace Layout
Decision: production studios share a consistent resizable multi-pane grammar: navigation/browser pane, central canvas/work area, contextual inspector pane, with optional collapsible bottom job/timeline/output tray. Panel state may persist per user/project.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-102 — Persistent Project Context
Decision: active project, Spryxel DNA/version, relevant asset family and generation/quality profile must remain easy to inspect without consuming the main canvas.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-103 — Command Palette and Keyboard
Decision: Ctrl/Cmd+K command palette is first-class. Keyboard navigation, shortcut discovery and power-user flows are planned from the start; shortcuts cannot be the only way to perform an action.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-104 — Progressive Disclosure
Decision: default screens expose the next useful action and essential quality/cost/state evidence; advanced generation/model/QA/security detail expands on demand.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-105 — Toast System
Decision: polished, accessible success/info/warning/error toasts are standardized, deduplicated and action-aware. Critical failures cannot disappear only as transient toasts.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-106 — Notification Center
Decision: a durable notification center covers completed/failed jobs, approvals, exports, billing/account/security events, quota/budget warnings and actionable system notices. Users can configure non-security notification preferences where appropriate.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-107 — State Model
Decision: every major screen/operation defines loading, skeleton, empty, success, partial-success, queued, offline/degraded, recoverable error, terminal error, permission denied, budget/credit blocked and policy-restricted states as applicable.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-108 — Visible Jobs
Decision: cost-incurring generation never feels like a black box. Queued/running/QA/repair/export states, progress evidence, cancellation eligibility and final outcome are visible through the same durable job model.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-109 — Destructive/High-Impact Actions
Decision: destructive, irreversible, high-cost or security-sensitive operations require explicit confirmation appropriate to impact; bulk operations preview scope before execution.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-110 — Version/History UX
Decision: assets, DNA, maps, UI packs and other versioned entities expose lineage/history/compare/restore-or-fork concepts without rewriting provenance.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-111 — Generate/Character Shared Grammar
Decision: Generate Studio and Character Studio share request → contract/profile → cost/credit estimate → run → inspect candidates → QA/repair → approve/version/export grammar while retaining domain-specific controls.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-112 — Map Studio Grammar
Decision: maps use structure + layers + visual canvas + POI/region graph + QA/export views. World/region/local/dungeon/minimap modes share one family architecture rather than isolated apps.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-113 — UI/HUD Studio Grammar
Decision: UI/HUD creation uses component tree, canvas/preview, responsive/localization states, theme/DNA context, state variants and export packaging. Generated visuals do not replace structured component contracts.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-114 — Library/Graph/QA Integration
Decision: Asset Library, Asset Graph and QA Center are linked views of the same canonical assets, lineage and quality evidence, with deep links back to originating jobs/studios.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-115 — Export Center
Decision: export UX always shows target engine/profile, included assets/versions, validation status, compatibility warnings and provenance before producing a bundle.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-116 — Cost Transparency
Decision: before a cost-incurring action, show the user-facing credit estimate/reservation and bounded limits appropriate to the workflow. After completion, show actual charged/released credits where relevant. Do not expose unfrozen internal commercial-price fiction as a final price.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-117 — Budget Failures
Decision: CostGuard/budget/credit blocks use machine- and human-readable reasons, safe remediation and no hidden expensive fallback.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-118 — Safe TrustShield Messaging
Decision: user-facing policy/trial/risk messaging never reveals device hashes, linked accounts, graph edges, thresholds, rules or exploitable antifraud detail. Preserve the canonical safe-message posture from Security/UI-UX.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-119 — API/MCP/Key UX
Decision: developer surfaces make scopes, project binding, expiry, last use, budgets, allowed SKUs/profiles, one-time secret reveal, revocation and risk class understandable before a credential or cost-incurring automation is enabled.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-120 — Admin/Owner Separation
Decision: Owner/Admin Console is visually and navigationally separated from normal creative workspaces. High-impact actions surface MFA/reauth/audit implications and never use silent impersonation.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-121 — Accessibility Baseline
Decision: target WCAG 2.2 AA for product UI, including contrast, focus visibility, keyboard operability, reduced motion, semantic status communication, labels and non-color-only signals.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

### D-122 — Localization/Layout Baseline
Decision: English remains canonical/default; pt-BR and Spanish are first-class localized layouts. Designs must tolerate approximately 35–40% text expansion, pluralization and locale-aware number/date formatting without clipped controls. Pseudo-localization is part of future implementation validation.
Status: APPROVED FOR PLANNING
Source: SPRYXEL-WO-003, SPR-PLAN-006.

## Planning history carried forward

SPR-PLAN-001 — APPROVED / COMPLETED IN MASTER v0.2.0; SPR-PLAN-002 — APPROVED / COMPLETED IN MASTER v0.3.0; SPR-PLAN-003 — APPROVED / COMPLETED IN MASTER v0.4.0; SPR-SPECIAL-001 — APPROVED / ADDED IN MASTER v0.4.1; SPR-SPECIAL-002 — APPROVED / COMPLETED IN MASTER v0.4.2; SPR-PLAN-004 — APPROVED / COMPLETED IN MASTER v0.5.0; SPR-PLAN-005 — APPROVED / COMPLETED IN MASTER v0.6.0.
SPR-PLAN-006 — NECESSARY, executed as a SPRYXEL-WO-003 candidate; pending objective audit and checkpoint promotion.
