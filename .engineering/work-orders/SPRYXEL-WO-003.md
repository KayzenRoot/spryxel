# SPRYXEL-WO-003 — SPR-PLAN-006 Product UX, Design System & Information Architecture

Tracking issue: #10

# SPRYXEL-WO-003 — SPR-PLAN-006 Product UX, Design System & Information Architecture

**Status:** ADMITTED_FOR_EXECUTION  
**Risk:** ELEVATED  
**Repository:** `KayzenRoot/spryxel`  
**Execution base:** `main@914aa4e7a1e4f2090523696e858e203b8e866d09`  
**Planning increment:** `SPR-PLAN-006`  
**GEF:** `@gef-bootstrap/cli@1.1.1`

## OBJECTIVE

Complete the next canonical planning increment, `SPR-PLAN-006 — Product UX, Design System & Information Architecture`, as documentation/specification only.

Turn the currently open UX/design questions into an implementation-ready canonical UX contract while preserving all existing product, security, economic, scope, language, engine, quality, agent-budget and trust decisions.

No product UI code, component code, CSS, runtime, prototype application or implementation Work Order is admitted.

## CONTEXT

The canonical checkpoint records:
- product Source Pack is complete and canonical;
- planning is approved through `SPR-PLAN-005`;
- `SPR-PLAN-006` is the next NECESSARY planning increment;
- product implementation is `NOT_STARTED`;
- commercial pricing remains `NOT_FROZEN`;
- benchmarks/production COGS remain `NOT_RUN / NOT_AVAILABLE`.

The current `UI-UX.md` already establishes a premium developer-first creative platform, English canonical UI with pt-BR/Spanish localization, visible project/Spryxel DNA context, useful quality/cost/status evidence, and safe anti-abuse messaging. This Work Order resolves the remaining design-system, IA, screen-contract and interaction questions without changing product scope.

## ARCHITECT DECISIONS TO ESTABLISH

The executor must encode the following as stable decisions D-090 through D-122 in the Decisions Ledger and reflect them in the relevant specialized UX documents.

### Visual system

- **D-090 — Product UX posture:** SPRYXEL is a premium, technical creative workstation: high information density where useful, calm hierarchy, strong canvas/workspace focus, and progressive disclosure instead of dashboard clutter.
- **D-091 — Theme strategy:** full Dark and Light themes are required. Dark is the default creative-workspace presentation; Light is a first-class equal theme, not an afterthought.
- **D-092 — Glass/translucency boundary:** glass/translucency may be used for navigation chrome, overlays, floating toolbars, command palette, modals and transient surfaces. Dense forms, tables, logs, billing/security details and long text use opaque/high-contrast surfaces. Readability wins over visual effect.
- **D-093 — Tokenized color system:** use semantic tokens, never raw feature-specific colors. Core roles: canvas/background/surface/elevated/border/text-muted; brand accent; success/info/warning/danger; selection/focus; job states; quality states; cost/risk states. All tokens have dark/light variants.
- **D-094 — Brand palette direction:** neutral graphite/slate foundations with a restrained spectral-violet primary accent and electric-teal secondary accent. Status colors stay semantically distinct and are never conveyed by color alone.
- **D-095 — Typography:** Inter Variable (or metrics-compatible open fallback) for product UI; JetBrains Mono (or metrics-compatible open fallback) for code, IDs, hashes, costs where monospacing improves scanning. Typography scale is tokenized.
- **D-096 — Spatial system:** 4 px base spacing grid; tokenized density, radius and elevation. Default workspace density is compact-comfortable with explicit compact mode for data-heavy/operator screens.
- **D-097 — Motion:** purposeful motion only. Canonical duration tiers approximately 120/180/240 ms; avoid decorative blocking animation; respect reduced-motion preference; never hide state transition behind animation.

### Responsive/product shell

- **D-098 — Desktop-first strategy:** full production studios target desktop/laptop and remain usable from 1024 px upward; 1280–1440+ is the preferred workspace. Below 1024 px, complex studios switch to limited companion behavior rather than pretending the full canvas editor fits.
- **D-099 — Mobile companion:** mobile/tablet supports monitoring jobs, reviewing/approving assets, notifications, account/billing, lightweight project browsing and safe simple actions. Full complex canvas/map/UI studio editing is not a V1 mobile promise.
- **D-100 — Global/project navigation:** distinguish global context from project context. Global shell owns Home/Command Center, Projects, notifications, developer/billing/account surfaces. A selected project owns DNA, Generate/Studios, Library/Graph, QA and Export.
- **D-101 — Studio workspace layout:** production studios share a consistent resizable multi-pane grammar: navigation/browser pane, central canvas/work area, contextual inspector pane, with optional collapsible bottom job/timeline/output tray. Panel state may persist per user/project.
- **D-102 — Persistent project context:** active project, Spryxel DNA/version, relevant asset family and generation/quality profile must remain easy to inspect without consuming the main canvas.
- **D-103 — Command palette and keyboard:** `Ctrl/Cmd+K` command palette is first-class. Keyboard navigation, shortcut discovery and power-user flows are planned from the start; shortcuts cannot be the only way to perform an action.

### Interaction and feedback

- **D-104 — Progressive disclosure:** default screens expose the next useful action and essential quality/cost/state evidence; advanced generation/model/QA/security detail expands on demand.
- **D-105 — Toast system:** polished, accessible success/info/warning/error toasts are standardized, deduplicated and action-aware. Critical failures cannot disappear only as transient toasts.
- **D-106 — Notification center:** a durable notification center covers completed/failed jobs, approvals, exports, billing/account/security events, quota/budget warnings and actionable system notices. Users can configure non-security notification preferences where appropriate.
- **D-107 — State model:** every major screen/operation defines loading, skeleton, empty, success, partial-success, queued, offline/degraded, recoverable error, terminal error, permission denied, budget/credit blocked and policy-restricted states as applicable.
- **D-108 — Jobs are visible:** cost-incurring generation never feels like a black box. Queued/running/QA/repair/export states, progress evidence, cancellation eligibility and final outcome are visible through the same durable job model.
- **D-109 — Destructive/high-impact actions:** destructive, irreversible, high-cost or security-sensitive operations require explicit confirmation appropriate to impact; bulk operations preview scope before execution.
- **D-110 — Version/history UX:** assets, DNA, maps, UI packs and other versioned entities expose lineage/history/compare/restore-or-fork concepts without rewriting provenance.

### Domain workspaces

- **D-111 — Generate/Character shared grammar:** Generate Studio and Character Studio share request → contract/profile → cost/credit estimate → run → inspect candidates → QA/repair → approve/version/export grammar while retaining domain-specific controls.
- **D-112 — Map Studio grammar:** maps use structure + layers + visual canvas + POI/region graph + QA/export views. World/region/local/dungeon/minimap modes share one family architecture rather than isolated apps.
- **D-113 — UI/HUD Studio grammar:** UI/HUD creation uses component tree, canvas/preview, responsive/localization states, theme/DNA context, state variants and export packaging. Generated visuals do not replace structured component contracts.
- **D-114 — Library/Graph/QA integration:** Asset Library, Asset Graph and QA Center are linked views of the same canonical assets, lineage and quality evidence, with deep links back to originating jobs/studios.
- **D-115 — Export Center:** export UX always shows target engine/profile, included assets/versions, validation status, compatibility warnings and provenance before producing a bundle.

### Cost, trust, developer and admin UX

- **D-116 — Cost transparency:** before a cost-incurring action, show the user-facing credit estimate/reservation and bounded limits appropriate to the workflow. After completion, show actual charged/released credits where relevant. Do not expose unfrozen internal commercial-price fiction as a final price.
- **D-117 — Budget failures:** CostGuard/budget/credit blocks use machine- and human-readable reasons, safe remediation and no hidden expensive fallback.
- **D-118 — Safe TrustShield messaging:** user-facing policy/trial/risk messaging never reveals device hashes, linked accounts, graph edges, thresholds, rules or exploitable antifraud detail. Preserve the canonical safe-message posture from Security/UI-UX.
- **D-119 — API/MCP/key UX:** developer surfaces make scopes, project binding, expiry, last use, budgets, allowed SKUs/profiles, one-time secret reveal, revocation and risk class understandable before a credential or cost-incurring automation is enabled.
- **D-120 — Admin/Owner separation:** Owner/Admin Console is visually and navigationally separated from normal creative workspaces. High-impact actions surface MFA/reauth/audit implications and never use silent impersonation.

### Accessibility, i18n and onboarding

- **D-121 — Accessibility baseline:** target WCAG 2.2 AA for product UI, including contrast, focus visibility, keyboard operability, reduced motion, semantic status communication, labels and non-color-only signals.
- **D-122 — Localization/layout baseline:** English remains canonical/default; pt-BR and Spanish are first-class localized layouts. Designs must tolerate approximately 35–40% text expansion, pluralization and locale-aware number/date formatting without clipped controls. Pseudo-localization is part of future implementation validation.

## SCOPE

Create and/or update planning documentation to make SPR-PLAN-006 implementation-ready:

1. Update `.engineering/UI-UX.md` from open placeholder into the canonical UX overview.
2. Create `.engineering/UX-DESIGN-SYSTEM.md` containing:
   - visual principles;
   - theme contract;
   - token taxonomy;
   - typography;
   - spacing/density/radius/elevation;
   - glass/translucency rules;
   - motion;
   - focus/accessibility;
   - component-state rules.
3. Create `.engineering/INFORMATION-ARCHITECTURE.md` containing:
   - global vs project navigation;
   - role/permission visibility;
   - studio grouping;
   - cross-links among jobs/library/graph/QA/export;
   - desktop/mobile-companion hierarchy.
4. Create `.engineering/SCREEN-INVENTORY.md` with every V1/necessary screen and major V1.x screen classified by module, role/context, release class, responsive behavior and implementation priority. Do not silently promote IMPORTANT/FUTURE modules into V1.
5. Create `.engineering/UX-FLOWS.md` covering at minimum:
   - first-run/onboarding + project creation;
   - DNA setup;
   - generation/character flow;
   - map flow;
   - UI/HUD flow;
   - asset review/QA/repair/approval;
   - export;
   - jobs/notifications;
   - credits/budget-block flow;
   - API key/MCP setup;
   - owner/admin high-impact action.
6. Create `.engineering/UX-STATE-CONTRACTS.md` defining canonical loading/empty/error/queued/blocked/success/partial states and safe user messaging.
7. Create `.engineering/UX-WIREFRAME-CONTRACTS.md` with implementation-neutral low-fidelity textual layouts for the major V1 shells/studios. No pixel-perfect mockups and no code.
8. Update `.engineering/DECISIONS-LEDGER.md` with D-090…D-122 exactly.
9. Update Requirements, Scope, Architecture, Security, API Contracts, Backlog and Definition of Done only where SPR-PLAN-006 decisions materially change/clarify their contracts.
10. Produce a screen/module coverage matrix proving all NECESSARY V1 modules have an owned UX surface or an explicit non-screen/system-only rationale.
11. Produce Evidence Bundle and proposed Checkpoint Delta.

## OUT OF SCOPE

- React/Next/Vue/Svelte or any product UI code.
- CSS/Tailwind/component implementation.
- Storybook implementation.
- Figma/Sketch design files.
- Image generation or final marketing brand/logo.
- Exact public commercial pricing or credits-per-pack.
- AI/model benchmarks or provider selection.
- Physical DB schema implementation.
- Exact API/MCP endpoint implementation.
- Executing any future implementation increment.
- Reclassifying V1/V1.x/FUTURE scope without explicit contradiction evidence.
- GEF upgrade, `.gef` edits, ruleset/provider changes.

## FILES / SOURCES TO READ

### MUST_READ
- `.engineering/CHECKPOINT.json`
- `.engineering/CHECKPOINT.md`
- `.engineering/SOURCE-HIERARCHY.md`
- `.engineering/DECISIONS-LEDGER.md`
- `.engineering/PROJECT-OVERVIEW.md`
- `.engineering/SCOPE.md`
- `.engineering/DEFINITION-OF-DONE.md`
- `.engineering/ARCHITECTURE.md`
- `.engineering/REQUIREMENTS.md`
- `.engineering/UI-UX.md`
- `.engineering/SECURITY.md`
- `.engineering/BILLING-ECONOMICS.md`
- `.engineering/API-CONTRACTS.md`
- `.engineering/DATA-MODEL.md`
- `.engineering/INTEGRATION-CONTRACTS.md`
- `.engineering/TEST-BENCHMARK-PLAN.md`
- `.engineering/BACKLOG.md`
- `AGENTS.md`
- this Work Order
- its Context Lock

### READ_IF_TRIGGERED
- immutable Product Master v0.6.0 only for traceability if a canonical document points to a seed detail not fully represented in current Source Pack.

## REQUIREMENTS

- Preserve D-001…D-089 unchanged.
- Add D-090…D-122 exactly as specified above; no semantic weakening.
- Preserve V1/V1.x/FUTURE classifications.
- Preserve English default + pt-BR + Spanish.
- Preserve product implementation `NOT_STARTED`.
- Preserve pricing `NOT_FROZEN`.
- Preserve benchmarks/COGS `NOT_RUN / NOT_AVAILABLE`.
- Preserve TrustShield safe-messaging/data-minimization boundaries.
- Preserve CostGuard/ledger/budget invariants.
- Keep canonical assets engine-independent and Godot/Unity as V1 export targets.
- Keep full mobile complex-studio editing out of the V1 promise.
- Make UX contracts specific enough that later component/screen implementation Work Orders do not need to reinvent global navigation, state handling or design-system rules.

## ARCHITECTURE RULES

- One product shell and shared studio grammar; avoid 37 isolated mini-app visual systems.
- Shared design tokens and interaction contracts; module-specific variation only where job semantics require it.
- Canvas/workspace state must not become a second source of product truth.
- UI can display/operate durable jobs/assets/contracts but cannot bypass backend authorization/economic/security invariants.
- Security/risk internals remain concealed from untrusted users.
- Cost/credit states must be transparent without presenting simulation-only commercial values as final.
- Responsive strategy is capability-aware, not merely CSS shrinkage.

## CONSTRAINTS

- Documentation/planning only.
- No product code.
- No `.gef`.
- No provider/ruleset mutation.
- No GEF version change.
- No source-seed edits.
- No commercial-price freeze.
- No new model/provider decisions.
- No scope expansion beyond SPR-PLAN-006.
- If base SHA or critical canonical fingerprints change unexpectedly, mark Context Lock STALE and stop.

## ACCEPTANCE CRITERIA

1. D-090 through D-122 exist exactly once in the Decisions Ledger and match this Work Order semantically.
2. D-001 through D-089 are byte/semantic-preserved; no prior approved decision is silently changed.
3. `UI-UX.md` no longer lists SPR-PLAN-006 outputs as unresolved; it points to the new specialized canonical UX docs.
4. Design system defines both dark/light themes, semantic tokens, typography, spacing/density, glass boundary, motion and accessibility contract.
5. Information architecture clearly separates global/project/owner-admin contexts and maps every relevant module to navigation ownership.
6. Screen inventory preserves V1/V1.x/FUTURE classifications and identifies desktop/full-studio vs companion-only behavior.
7. All NECESSARY V1 modules have an owned UX surface or explicit system-only rationale.
8. Core studio flows use shared job/contract/cost/QA/version/export grammar rather than divergent bespoke flows.
9. UX state contracts cover loading/empty/queued/degraded/error/blocked/success/partial states and durable critical errors.
10. Billing/cost UX preserves NOT_FROZEN pricing and CostGuard hard-stop semantics.
11. Trust/security/admin UX does not reveal prohibited antifraud internals and preserves reauth/MFA/audit expectations.
12. API/MCP/key UX preserves scope, budget, project binding, idempotency and risk-class concepts.
13. Accessibility target is WCAG 2.2 AA and localization layout supports EN/pt-BR/ES with expansion tolerance.
14. No product/runtime/component code is introduced.
15. `.gef`, GEF 1.1.1, ruleset and provider state are unchanged.
16. Existing four required GitHub checks PASS on the exact final PR head.
17. No unresolved CRITICAL/HIGH finding exists.
18. Evidence Bundle includes base/head, changed paths, decision coverage, module/screen coverage, state/flow coverage, tests/checks, known open decisions and proposed Checkpoint Delta.
19. Checkpoint remains unpromoted by executor.
20. Next legal action after audit/promotion is a separately admitted implementation-planning increment, not automatic product coding.

## TESTS

- Verify exact execution base and Context Lock fingerprints.
- Parse/check D-001…D-122 uniqueness; D-001…D-089 unchanged; D-090…D-122 present.
- Cross-check module classifications against `SCOPE.md`.
- Verify every NECESSARY V1 module appears in screen/module coverage matrix or has explicit system-only rationale.
- Verify theme contract includes DARK + LIGHT and accessibility/reduced-motion requirements.
- Verify mobile strategy does not claim full complex-studio editing.
- Verify EN/pt-BR/ES and text-expansion contract.
- Verify pricing remains `NOT_FROZEN`, product implementation `NOT_STARTED`, benchmarks `NOT_RUN / NOT_AVAILABLE`.
- Verify safe TrustShield messaging guard and no internal threshold/device/linked-account exposure.
- JSON/Markdown structural checks.
- `git diff --check`.
- secret-pattern scan for changed docs.
- `npm ci --ignore-scripts --no-audit --no-fund`.
- exact GEF 1.1.1 assertion.
- `gef doctor --target . --json`.
- two byte-identical `gef status --target . --json` outputs; reconcile drift under D-0007.
- four existing required GitHub checks on exact final PR head.

## DELIVERABLES

- updated canonical-candidate `UI-UX.md`;
- `UX-DESIGN-SYSTEM.md`;
- `INFORMATION-ARCHITECTURE.md`;
- `SCREEN-INVENTORY.md`;
- `UX-FLOWS.md`;
- `UX-STATE-CONTRACTS.md`;
- `UX-WIREFRAME-CONTRACTS.md`;
- updated Decisions Ledger and affected canonical docs;
- screen/module coverage evidence;
- `.engineering/evidence/SPRYXEL-WO-003-EVIDENCE.md`;
- `.engineering/checkpoint-deltas/SPRYXEL-WO-003-PROPOSED.md`;
- updated PR description with exact-head post-push check evidence.

## REVIEW FORMAT

Brazilian Portuguese:
- base/head SHA;
- Context Lock state;
- D-090…D-122 coverage;
- proof D-001…D-089 unchanged;
- V1 module/screen coverage;
- theme/design-system/state/flow coverage;
- accessibility/i18n/mobile contract;
- changed files;
- tests/checks PASS/FAIL;
- CRITICAL/HIGH/MEDIUM/LOW findings;
- unresolved product/UX decisions that remain intentionally open;
- proposed Checkpoint Delta;
- verdict candidate `READY_FOR_AUDIT` or `BLOCKED`.

## STOP CONDITION

`SPRYXEL_WO_003_SPR_PLAN_006_UX_SYSTEM_READY_FOR_AUDIT`

Do not merge. Do not promote the checkpoint. Do not implement product code.
