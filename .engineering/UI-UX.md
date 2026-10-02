# UI/UX

Status: CANONICAL-CANDIDATE — SPRYXEL-WO-003 / SPR-PLAN-006; awaiting audit and checkpoint promotion.

## Product posture

SPRYXEL is a premium, technical creative workstation for game-production teams and individual creators. Keep the active canvas and production workspace central, show useful project, DNA, job, quality and cost context, and use progressive disclosure to keep the initial view calm. Prefer a compact-comfortable information density over decorative dashboard cards.

The product has one global shell and project workspaces that share navigation, design tokens, job visibility, asset lineage, quality evidence, cost feedback and interaction rules. Individual studios may expose domain-specific controls but do not become isolated applications or sources of product truth.

English is the canonical/default UI language. pt-BR and Spanish are first-class localized layouts. Project context and the current Spryxel DNA/version remain inspectable throughout creation and evolution. User-facing quality feedback distinguishes hard integrity gates from production-quality guidance. Cost and status evidence is visible before and after relevant work without presenting unfrozen commercial values as final prices.

## Theme and visual direction

Dark is the default creative-workspace presentation. Light is a complete, first-class theme with equivalent hierarchy, status meaning, focus visibility and contrast. Foundations are neutral graphite/slate with a restrained spectral-violet primary accent and electric-teal secondary accent. Status and risk meaning use semantically distinct tokens and never rely on color alone.

Glass/translucency is limited to navigation chrome, overlays, floating toolbars, command palette, modal frames and transient surfaces. Dense forms, tables, logs, billing/security details and long text use opaque, high-contrast surfaces. Readability wins over visual effect.

Product UI uses Inter Variable or a metrics-compatible open fallback. Code, IDs, hashes and costs may use JetBrains Mono or a metrics-compatible open fallback when fixed-width glyphs improve scanning. A 4 px base grid, named density/radius/elevation tokens and purposeful motion are shared across modules. Respect reduced-motion settings and never hide a state change behind animation.

The UX target is WCAG 2.2 AA. Keyboard access, visible focus, semantic labels, non-color-only status, sufficient contrast and reduced motion apply across global, project, developer and owner/admin surfaces. Shortcuts supplement visible and assistive-technology-operable actions. Pseudo-localization is part of future implementation validation.

## Product shell and capability-aware layout

Global navigation owns Home/Command Center, Projects, notifications, developer platform, billing and account. A selected project owns DNA, Generate and eligible Studios, Library/Graph, QA and Export. Owner/Admin Console and economics/operations surfaces are separately identified and permission-gated.

Production studios use a consistent resizable grammar: navigation/browser pane, central work area/canvas, contextual inspector and an optional collapsible jobs/timeline/output tray. Persisted pane state is a convenience only; backend contracts, durable jobs and canonical asset records remain authoritative. Active project, DNA/version, asset family and generation/quality profile stay easy to inspect without taking over the main canvas.

Full production studios target laptop/desktop at widths of 1024 px and above; 1280–1440+ px is preferred. Below 1024 px, complex studios become limited companions. Mobile/tablet supports job monitoring, asset review/approval, notifications, account/billing, lightweight project browsing and safe simple actions. Full complex canvas, map or UI studio editing is not a V1 mobile promise.

## Interaction contract

- Ctrl/Cmd+K opens a first-class command palette; keyboard discovery and navigation are planned from the start, with non-keyboard alternatives for every action.
- Screens initially expose the next useful action and essential cost, quality and state evidence. Advanced model, generation, QA and security detail expands on demand.
- Standardized success/info/warning/error toasts are accessible, deduplicated and action-aware. A critical failure is retained in its durable owning surface and cannot exist only as a transient toast.
- A durable notification center covers job completion/failure, approvals, exports, billing/account/security events, budget/quota warnings and actionable system notices. Non-security preferences may be configured where appropriate; required security notices cannot be hidden through ordinary preference controls.
- Cost-incurring generation follows request → contract/profile → bounded credit estimate/reservation → durable job → inspect candidates → QA/repair → approve/version → export. The UI cannot bypass server authorization, CostGuard, ledger, policy or idempotency rules.
- Destructive, irreversible, high-cost, bulk and security-sensitive actions preview scope and require confirmation proportional to impact. Sensitive operations may require reauthentication/MFA and create an auditable outcome.
- Versioned assets, DNA, maps and UI packs expose lineage/history, comparison and controlled restore-as-new-version or fork concepts without rewriting provenance.

## Domain grammar

Generate and Character share the request/contract/profile/cost/job/candidate/QA/repair/approval/version/export grammar, with character-specific anatomy, identity and consistency controls. Map work is structured around layers, visual canvas, POI/region graph, QA and export. UI/HUD work (IMPORTANT/V1.x) is structured around component tree, canvas/preview, responsive and localization states, theme/DNA context, state variants and export packaging; generated visuals never replace component contracts.

Asset Library, Asset Graph and QA Center are linked views over the same canonical assets, lineage and quality evidence, with deep links to originating jobs and studios. Export Center presents target engine/profile, included assets/versions, validation status, compatibility warnings and provenance before bundle creation.

## Canonical UX contracts

This overview is completed by the specialized documents:

- [UX-DESIGN-SYSTEM.md](UX-DESIGN-SYSTEM.md) — visual, token, theme, type, space, motion, focus and state rules.
- [INFORMATION-ARCHITECTURE.md](INFORMATION-ARCHITECTURE.md) — global/project/owner-admin navigation, visibility and responsive hierarchy.
- [SCREEN-INVENTORY.md](SCREEN-INVENTORY.md) — screen ownership, source release classifications, responsive behavior and implementation priority.
- [UX-FLOWS.md](UX-FLOWS.md) — onboarding, shared studio, review, export, jobs, cost and developer/admin flows.
- [UX-STATE-CONTRACTS.md](UX-STATE-CONTRACTS.md) — loading, empty, progress, degraded, error, blocked, success and partial states.
- [UX-WIREFRAME-CONTRACTS.md](UX-WIREFRAME-CONTRACTS.md) — implementation-neutral layouts for principal shells and workspaces.
- [evidence/SPRYXEL-WO-003-SCREEN-COVERAGE.md](evidence/SPRYXEL-WO-003-SCREEN-COVERAGE.md) — NECESSARY V1 module-to-surface coverage.

The Decisions Ledger records D-090…D-122 as SPR-PLAN-006 decisions. SCOPE.md remains authoritative for V1/V1.x/FUTURE classification; this planning increment does not reclassify modules. Product implementation remains NOT_STARTED, pricing remains NOT_FROZEN, and benchmark/production COGS status remains NOT_RUN / NOT_AVAILABLE.

## Safety and quality boundaries

The UI presents useful quality verdicts and optional advanced QA evidence while preserving hard integrity gates. A user-facing policy/trial/risk message must not expose device hashes, linked accounts, graph edges, thresholds, hidden rules or exploitable antifraud details. The approved safe promotional message remains in SECURITY.md.

CostGuard blocks are explicit, explain the actionable user-facing reason and safe next step, and never trigger a hidden expensive fallback. Internal monetary prices, margins, thresholds, model/provider selection and security signals are not inferred or made final through UX copy. API/MCP credentials show scope, project binding, expiry, last use, budgets, allowed SKUs/profiles, risk class, revocation and one-time secret reveal before activation.

Owner/Admin Console is visually and navigationally separated from ordinary creation. High-impact actions make MFA/reauthentication and audit implications clear; silent impersonation is prohibited.

## SPR-PLAN-006 boundary

This is an implementation-ready planning contract, not product implementation. No UI components, CSS, runtime, prototype, Figma artifact, public price, provider, model, physical schema or endpoint is established here. Future screen/component Work Orders must implement these shared contracts and receive separate admission; completion of this plan does not admit product coding.
