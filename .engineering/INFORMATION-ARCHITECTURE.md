# Information Architecture

Status: CANONICAL-CANDIDATE — SPRYXEL-WO-003 / SPR-PLAN-006; awaiting audit and checkpoint promotion.

## Context layers

### Global shell

The global shell is available outside and between projects. It owns Home/Command Center, Projects, durable notifications, Developer Platform/AgentBridge, Credits/Billing and account/session settings. Project switching is available without losing a durable job or silently changing its scope. Global surfaces show whether an action is personal, project-bound or owner/admin-only.

### Project workspace

The selected project shell owns project overview, Spryxel DNA and version, Generate, studios admitted for the release class, Asset Library, Asset Graph, QA Center and Export Center. Persistent project context identifies project and DNA version; relevant asset family and generation/quality profile remain inspectable at studio level. Every project-bound asset, job, key, export and operation retains its canonical project relationship.

Asset Library, Graph and QA are sibling views of the same canonical asset and lineage records. A user can follow an asset to its source job/studio, a job to candidates and resulting assets, and QA evidence back to the asset/version. Export links back to included assets and their validation evidence.

### Owner/Admin operations

Owner/Admin Console and Observability & Economics are separate from normal creative navigation and visibly marked as privileged operations. Entry and action visibility depend on authenticated role and server permission; hiding a link is not authorization. Production Owner/Admin requires MFA. High-impact action paths show reauthentication/MFA, scope and audit implications before confirmation. No silent impersonation.

TrustShield, RevenueShield and CostGuard have owner/operator policy and evidence surfaces only where the viewer is authorized. Ordinary members see safe outcomes, understandable budget blocks and eligible remediation, not hidden risk graphs, thresholds, linked-account evidence, device identifiers, policy rules or internal margins.

## Role and permission visibility

| Viewer/context | Navigation visibility | Guard |
| --- | --- | --- |
| Anonymous visitor | Public sign-in/account entry only | No project, credential, billing ledger or operations data |
| Authenticated member | Home, Projects, allowed project studios/views, Jobs/Notifications, own account and permitted billing | Tenant/project authorization is checked by backend on every operation |
| Project-authorized developer/automation owner | Developer Platform, API/MCP/CLI setup and project-bound credentials where permitted | Scope, expiry, project binding, allowed SKU/profile, bounded budget, last use, risk class and revocation are explicit |
| Support/operator with granted role | Only assigned operational or case surfaces | Minimize sensitive evidence; apply least privilege, reason and audit requirements |
| Owner/Admin | Owner/Admin Console, security/billing/economics controls according to permission | MFA, step-up/reauth where required, scope preview, audit and explicit confirmation |

Role names describe navigation affordances only; the authoritative permission model remains server-side. A denied request must present the common permission state and not expose data through a stale page or hidden route.

## Studio grouping and ownership

The project workspace groups NECESSARY V1 production surfaces under Create: Generate, Character, World, Tileset and Items & Props, plus DNA as the shared project contract. V1.x IMPORTANT surfaces (UI/HUD, Animation, VFX, 2.5D/Isometric, workflow recipes, maps and expanded 3D) remain visibly classified and are not presented as V1 commitments. Individual map/UI subdomains belong to a shared Map family or UI/HUD family instead of separate top-level mini-apps.

Library, Graph and QA are review/evidence views; Export is a release-preparation view. Jobs/Queue and notifications are available from the global shell and deep-link to owning projects/studios. Credits/Billing and Developer Platform are global but show project binding wherever it applies.

## Cross-link contract

| Starting surface | Cross-link | Destination context |
| --- | --- | --- |
| Studio request/run | Durable job and its budget/contract | Jobs/Queue scoped to current project |
| Job | Candidates, QA, output asset/version, safe block or retry action | Originating studio or Library |
| Asset Library | Graph lineage, QA evidence, version history and export eligibility | Canonical asset/version |
| Asset Graph | Referenced assets and origin jobs | Library/job/studio deep links |
| QA Center | Repair or review request, hard-gate evidence, approval/version | Origin job/studio and canonical asset |
| Export Center | Target profile, included version, validation warning and provenance | Selected project assets/jobs |
| Notification center | Required next action and owning record | Correct global/project/owner context |
| Developer Platform | Job result, audit references and key activity | Project-bound job or settings |
| Cost/budget block | Allowed remediation and relevant account/project settings | No hidden fallback or unauthorized control |

Links identify the destination project and preserve unsaved-form warnings. Cross-links do not change ownership, provenance, scope or permissions.

## Responsive hierarchy

| Width/capability | Navigation and content |
| --- | --- |
| 1280–1440+ px | Preferred production workspace: resizable browser/navigation, central canvas/work area, inspector and optional bottom job/timeline/output tray |
| 1024 px and above | Full-studio target; allow pane collapse/resizing while retaining request, canvas, inspector and durable job access |
| Below 1024 px | Capability-aware companion for complex studios; no full canvas/map/UI edit promise |
| Mobile/tablet | Job monitoring, candidate/asset review and approval, notifications, billing/account, lightweight project browse and safe simple actions |

Owner/Admin, developer, dense table and security surfaces remain responsive and readable without glass treatment. Mobile is not required to reproduce multi-pane operations.

## Command and keyboard navigation

Ctrl/Cmd+K opens the global command palette. Search and commands respect current role, project and release class; disabled/unavailable actions explain the next permitted path. Keyboard shortcuts are discoverable and never the sole way to invoke an operation. Focus order follows global shell → project shell → current pane/content → durable tray or page actions.
