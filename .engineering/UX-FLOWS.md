# UX Flows

Status: CANONICAL — SPRYXEL-WO-003 / SPR-PLAN-006 approved by objective audit.

## Shared operation grammar

Every cost-incurring studio flow follows:

1. Confirm active project and current DNA/version; select an asset family and permitted workflow.
2. Enter a request and review the resulting structured contract/profile. Validation identifies missing or incompatible fields before submission.
3. Show bounded credit estimate/reservation, applicable limits, and any known uncertainty. The user explicitly confirms a cost-incurring operation. No frozen public price or hidden fallback is inferred.
4. Submit an idempotent request and create/follow a durable job. Display queued/running/progress and the available cancellation boundary.
5. Present candidates and integrity/production-quality evidence. A hard integrity failure cannot be overridden by aesthetic approval.
6. Offer only bounded, authorized repair/retry or safe next action; each cost-incurring action shows its own bound and contributes to the parent budget where applicable.
7. Approve/version or reject with a durable outcome. Preserve lineage and link the job, contract, QA evidence and asset.
8. Export only eligible versions after target/profile validation and provenance preview.

## First run, onboarding and project creation

1. Sign-in/account state establishes the authenticated principal and available role without exposing project data before authorization.
2. Explain the workbench in short, skippable steps: create/select project, choose language and theme, review the project’s DNA setup, then start or browse work.
3. New project creation confirms a name and supported initial project context; avoid asking for every advanced setting before a first useful action.
4. Show the project shell, an explicit DNA setup path and a clear empty state that explains the next useful action.
5. If setup is incomplete, preserve drafts and identify which operations require completion. Do not create a generation job implicitly.

## DNA setup and versioning

1. Open DNA Studio from the selected project; show its current version or an explicit not-configured state.
2. Guide through project identity, style, palette and relevant constraints using readable groups and examples rather than a dense single form.
3. Validate completeness and conflicts before save; communicate which downstream operations use the selected version.
4. Save a new version with durable history. Compare versions before switching; preserve lineage and use a new version rather than rewriting provenance.
5. Studios show the active DNA/version and an intentional switch affordance. A version change never silently rewrites an in-flight job.

## Generate and Character Studio

1. Choose asset family/SKU and project DNA; Character Studio adds identity/anatomy/equipment consistency constraints.
2. Compose request, reference and profile; make required contract fields and any applicable limits visible.
3. Validate and present estimate/reservation and bounded run/repair limits; require confirmation.
4. Create the durable job and show queued/running/QA progress, safe cancellation availability and linked contract.
5. Inspect candidates alongside hard integrity verdict and production-quality evidence. Character review includes applicable anatomy, silhouette and identity consistency evidence.
6. Select an allowed bounded repair/retry or approve/reject. A hard-gate failure cannot be approved through the UI.
7. Approval creates a versioned asset with provenance and links to QA/job. Eligible outputs continue to Export Center.

## World, Tileset and Items/Props flow

1. Select the project surface, family and permitted production contract.
2. For tilesets, show grid/dimension, transition and seam constraints before cost confirmation; for world assets, keep environment/project fit and linked DNA visible; for items/props, keep family cohesion and candidate comparison available.
3. Use the shared validation → bounded estimate → confirm → durable job → QA → approve/version grammar.
4. Show applicable technical QA (such as crop, alpha, grid, silhouette, topology or seams) before aesthetic production scoring.
5. Link approved assets and their version/lineage to the Library, Graph and eligible export profiles.

## Map flow (IMPORTANT/V1.x)

1. Enter the Map family through the project workspace and select world, region/zone, local/battle, dungeon/interior or minimap context; do not expose separate unrelated applications.
2. Confirm map dimensions/structure, layer plan, stable region/POI identities where feasible and project DNA.
3. Edit structured layer/graph inputs beside a visual canvas; keep dimensions and machine-addressable layers aligned.
4. Review cost bounds before a cost-incurring generation/render job; show a durable job and cancellation eligibility.
5. Inspect structural QA and visual evidence; repair only through bounded authorized operations.
6. Version the map with lineage and prepare the target profile/layers in Map Export & Layer Studio. IMPORTANT/V1.x classification remains visible; this flow is not a V1 commitment.

## UI/HUD flow (IMPORTANT/V1.x)

1. Enter the UI family and select HUD, inventory/backpack, menu/screen or another admitted UI package.
2. Set project DNA/theme and localization targets. Work from a structured component contract/tree as well as a canvas/preview.
3. Define responsive layouts and semantic state variants; inspect English, pt-BR and Spanish expansion/layout cases.
4. Review estimate/budget before a cost-incurring operation, then follow the durable job/candidate/QA grammar.
5. Validate component completeness, localization, theme, focus/status variants and export packaging. Generated visuals cannot stand in for structured component contracts.
6. Version the UI pack and review target profile/provenance before export. IMPORTANT/V1.x classification remains visible.

## Asset review, QA, repair and approval

1. Open a candidate from its job, Library or QA Center. Show origin, contract/profile, DNA version and asset lineage.
2. Present Integrity Gate first as binary PASS/FAIL, then Production Score and evidence when integrity passes. Explain the distinction in accessible language.
3. A failed hard gate remains blocked from production approval. Display a durable error, relevant evidence and allowed repair/regenerate/support path.
4. Eligible bounded repair shows its own credit estimate/limit before confirmation and creates a linked job. Preserve earlier candidates and evidence.
5. Reviewer approves, approves with minor repair where allowed, requests bounded repair, rejects or escalates. Record who/when/outcome and create a version without rewriting provenance.

## Export Center

1. Select Godot or Unity V1 target and the applicable export profile; do not present Unreal as V1.
2. Select eligible assets/versions and review dependencies, formats, validation state and compatibility warnings.
3. Show unresolved blockers separately from warnings, with links to QA or source studio.
4. Preview included assets/versions, provenance and package scope before export. For a cost-incurring action, show the applicable bounded credit estimate first.
5. Confirm and follow the durable export job. Present success, partial output or actionable failure and retain the bundle’s source/version references.

## Jobs and notifications

1. Submission creates one durable job record with project, contract, budget, status and originating surface links.
2. Jobs Center presents queued/running/QA/repair/export progress and safe cancellation eligibility; a notification deep-links to that record.
3. Success, partial success, failure and restriction remain durable in the job and relevant notification center.
4. Notifications can be marked read and non-security preferences may be configured. Required security events and critical job outcomes cannot be erased by transient toast dismissal.
5. Any retry/repair action returns to the owning workflow and repeats cost/budget and authorization checks.

## Credits, budget and CostGuard block

1. Before a cost-incurring operation, explain the estimated/reserved credits and applicable user-facing bounds; after completion show actual charged/released credits where relevant.
2. If the ledger, budget or CostGuard blocks the action, stop before creating the disallowed cost-incurring work.
3. State the safe, actionable reason and permitted remediation (for example review limits, choose an eligible lower-bound workflow, add credits where available, or contact support).
4. Do not switch to a more expensive provider/model/profile, retry, or split the work silently. Do not represent simulation-only prices as final.
5. Account/project support paths do not expose internal margins, provider budgets, hidden thresholds or risk signals.

## API key and MCP setup

1. Select global or project binding and a permitted use; explain API/MCP risk class and the capability scope before credential creation.
2. Choose scopes, expiry, allowed SKUs/profiles and bounded budgets (including applicable jobs/candidates/repairs/retries/wall time); show last-use and revocation behavior.
3. Present idempotency and shared workflow-budget behavior for cost-incurring automation. Nested calls consume the parent budget.
4. Reauthenticate where required, create the credential and reveal its secret once. Warn the user to store it safely; never reveal it again from history.
5. Show non-secret metadata, activity, last use and revoke/rotate action. Revocation is explicit, auditable and effective at the authorization boundary.
6. Interactive remote MCP prefers OAuth; keys remain scoped/hashed and project-bound where applicable. No endpoint or provider choice is frozen by this flow.

## Owner/Admin high-impact action

1. Enter a visibly separated Owner/Admin Console; confirm the current identity, permission, environment and target scope.
2. Explain effect, affected users/jobs/projects, reversibility and relevant audit consequence before execution.
3. Require MFA/reauthentication or step-up when required. Provide a preview for bulk changes and prohibit silent impersonation.
4. Confirm explicitly using action-specific wording. If permission/step-up is absent, stop safely without partial execution.
5. Record actor, scope, reason, timestamp and result in the audit surface; expose only information allowed to the current role.

## Cross-flow invariants

- All operations re-check authorization, project scope, policy and budget at execution time.
- A client-side confirmation does not authorize a backend operation or override a hard gate.
- Job, ledger, asset and provenance state is durable and canonical outside transient workspace layout.
- Safe TrustShield wording is used for members; no device, linked-account, graph or threshold detail is surfaced.
- EN remains canonical/default with pt-BR/ES layouts and approximately 35–40% expansion tolerance.
