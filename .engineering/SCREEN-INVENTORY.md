# Screen Inventory

Status: CANONICAL — SPRYXEL-WO-003 / SPR-PLAN-006 approved by objective audit.

Release classes below reproduce the module classifications in SCOPE.md. Implementation priority is a planning sequence only: P0 = necessary V1 surface, P1 = IMPORTANT/V1.x surface, P2 = later-delivery/FUTURE surface. It does not admit implementation or change release scope.

Responsive modes: **Studio** = full production workspace at 1024 px and above; **Companion** = review/monitor/simple actions below 1024 px, never full complex editing; **Account** = responsive global/account surface; **Ops** = responsive permission-gated operator surface; **Read/review** = inspect, approve or navigate on smaller displays.

| ID / module | Owned screen surface | Role and context | Source release class | Responsive behavior | Planning priority |
| --- | --- | --- | --- | --- | --- |
| M-01 Home / Command Center | Home, recent projects/jobs, next actions and status | Authenticated member; global | NECESSARY | Account + project/job summaries; companion | P0 |
| M-02 Projects | Project list, create/select, project overview | Member; global → project | NECESSARY | Account; lightweight browse and safe simple actions | P0 |
| M-03 Spryxel DNA Studio | DNA overview, guided setup, version/compare | Project member; project | NECESSARY | Studio; companion inspect/review only | P0 |
| M-04 Generate Studio | Request, profile/contract, estimate, run, candidates | Project member; project studio | NECESSARY | Studio; companion monitor/review only | P0 |
| M-05 Character Studio | Character identity/anatomy controls and shared run flow | Project member; project studio | NECESSARY | Studio; companion monitor/review only | P0 |
| M-06 World Studio | World/environment assets and project relationships | Project member; project studio | NECESSARY | Studio; companion monitor/review only | P0 |
| M-07 Tileset Studio | Tileset/transition request, canvas and QA evidence | Project member; project studio | NECESSARY | Studio; companion monitor/review only | P0 |
| M-08 Items & Props Studio | Item/prop family, candidate and variation workspace | Project member; project studio | NECESSARY | Studio; companion monitor/review only | P0 |
| M-09 UI / HUD Studio | Component-oriented UI/HUD workspace | Project member; IMPORTANT studio | IMPORTANT | Studio when admitted; companion review only | P1 |
| M-10 Animation Studio | Animation/timeline and Animation QA surfaces | Project member; IMPORTANT studio | IMPORTANT | Studio when admitted; companion monitor/review | P1 |
| M-11 VFX Studio | VFX request, preview and QA workspace | Project member; IMPORTANT studio | IMPORTANT | Studio when admitted; companion monitor/review | P1 |
| M-12 2.5D / Isometric Studio | 2.5D/isometric project surface | Project member; IMPORTANT studio | IMPORTANT | Studio when admitted; companion review | P1 |
| M-13 3D Studio | 3D planning/production surface after validation | Project member; later-delivery studio | IMPORTANT / LATER DELIVERY | No V1 promise; capability after separate admission | P2 |
| M-14 Asset Library | Search, filter, inspect, lineage, version and approve assets | Project member; project | NECESSARY | Read/review and safe approval actions | P0 |
| M-15 Asset Graph | Asset lineage/dependency graph with asset/job links | Project member; project | NECESSARY | Responsive graph summary/list; inspect links on companion | P0 |
| M-16 Workflow / Recipe Studio | Bounded workflow/recipe design and execution surface | Authorized project user; IMPORTANT | IMPORTANT | Desktop when admitted; companion run monitor/review | P1 |
| M-17 QA Center | Integrity, quality evidence, repair, review and approval | Project member/reviewer; project | NECESSARY | Read/review; safe approval and job follow-up | P0 |
| M-18 Export Center / EngineBridge | Target profile, asset/version selection, validation and bundle | Project member; project | NECESSARY | Account-compatible review/confirmation; detailed setup responsive | P0 |
| M-19 Developer Platform / AgentBridge | API/MCP/CLI credentials, scopes, budget, activity | Project developer; global + project binding | NECESSARY | Account; key operations responsive and reauth-gated | P0 |
| M-20 Jobs / Queue Center | Durable queue, progress, cancellation eligibility and results | Project member; global + project filters | NECESSARY | Companion-first monitor/review and eligible cancel | P0 |
| M-21 Credits / Billing | Credit balance/ledger views, purchase/receipt where enabled | Account owner; global | NECESSARY | Account; clear locale-aware monetary/credit data | P0 |
| M-22 CostGuard | Cost estimate and user-facing budget block; restricted policy operations | Member sees own operation outcome; owner sees permitted controls | NECESSARY | Account outcomes; Ops controls restricted | P0 |
| M-23 TrustShield | Safe promotional eligibility outcome; restricted case review | Member receives safe message; authorized reviewer handles case | NECESSARY | Read/review with privacy guard; Ops review restricted | P0 |
| M-24 RevenueShield | Revenue/payment risk and promotion control surface | Authorized owner/operator; global operations | NECESSARY | Ops; MFA/reauth and audit-required actions | P0 |
| M-25 Admin / Owner Console | Role-gated settings, kill switches and high-impact actions | Owner/Admin; separate operations context | NECESSARY | Ops responsive; step-up/reauth as required | P0 |
| M-26 Observability & Economics | Health/economics dashboards and evidence views | Authorized owner/operator; operations | NECESSARY | Ops; dense data opaque and accessible | P0 |
| M-27 Team / Collaboration | No V1 screen; FUTURE workspace remains out of V1 navigation | Future team role; not in current V1 shell | FUTURE | Not promised; separate planning/admission required | P2 |
| M-28 World Map Studio | World map structure, layers, POI/region graph, QA/export | Project member; IMPORTANT Map family | IMPORTANT | Studio when admitted; companion inspect/monitor | P1 |
| M-29 Region / Zone Map Studio | Region/zone composition and linked map structure | Project member; IMPORTANT Map family | IMPORTANT | Studio when admitted; companion inspect/review | P1 |
| M-30 Local Area / Battle Map Studio | Local/battle map structure and visual work area | Project member; IMPORTANT Map family | IMPORTANT | Studio when admitted; companion inspect/review | P1 |
| M-31 Dungeon / Interior Map Studio | Structure-first dungeon/interior graph and render views | Project member; IMPORTANT Map family | IMPORTANT | Studio when admitted; companion inspect/review | P1 |
| M-32 Minimap / Navigation Map Studio | Minimap/navigation derivative and validation view | Project member; IMPORTANT Map family | IMPORTANT | Studio when admitted; companion inspect/review | P1 |
| M-33 Map Export & Layer Studio | Map layer review, target compatibility and export package | Project member; IMPORTANT Map family | IMPORTANT | Studio when admitted; companion validate/review | P1 |
| M-34 UI / HUD Builder | Structured tree, canvas, preview and state variants | Project member; IMPORTANT UI family | IMPORTANT | Studio when admitted; companion inspect/review | P1 |
| M-35 Inventory / Backpack UI Studio | Inventory/backpack UI contract and responsive states | Project member; IMPORTANT UI family | IMPORTANT | Studio when admitted; companion inspect/review | P1 |
| M-36 Menu & Screen Builder | Menu/screen UI structure and state/localization variants | Project member; IMPORTANT UI family | IMPORTANT | Studio when admitted; companion inspect/review | P1 |
| M-37 UI Export & Theme Studio | Theme context, UI package validation and export | Project member; IMPORTANT UI family | IMPORTANT | Studio when admitted; companion validate/review | P1 |

## Shared screen-level contracts

- Every project surface identifies the project, DNA/version and owning job/asset when applicable.
- Studios follow the common pane grammar in UX-WIREFRAME-CONTRACTS.md; the tray presents durable jobs and output.
- Every cost-incurring action has a bounded credit estimate/reservation contract and an accessible blocked state. No screen substitutes an unfrozen price or hides an expensive fallback.
- V1.x rows are planned surfaces only. Navigation presence, labels or this inventory do not make them V1 deliverables.
- M-27 remains FUTURE with no V1 navigation or screen promise.

## Screen/module coverage

The 20 NECESSARY V1 modules are all assigned a named UX surface above. Detailed evidence appears in [evidence/SPRYXEL-WO-003-SCREEN-COVERAGE.md](evidence/SPRYXEL-WO-003-SCREEN-COVERAGE.md).

## Cross-cutting V1 surfaces

These shared surfaces support necessary platform capabilities and do not change the SCOPE.md module classifications.

| Surface | Ownership and role | Responsive behavior | Planning priority |
| --- | --- | --- | --- |
| Sign-in / session and account recovery | Global identity entry; authenticated principal | Account; accessible form and explicit session state | P0 |
| First-run onboarding | Global, then selected project | Account; short guided steps, skippable and resumable | P0 |
| Notification center | Global; links to authorized project/job/account records | Companion-friendly; durable critical events | P0 |
| Personal preferences | Global account; theme, language and eligible notice settings | Account; EN/pt-BR/ES and Dark/Light | P0 |
| Project create/select transition | Global to project context | Account; lightweight browsing/create flow | P0 |
