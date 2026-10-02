# UX Wireframe Contracts

Status: CANONICAL-CANDIDATE — SPRYXEL-WO-003 / SPR-PLAN-006; awaiting audit and checkpoint promotion.

These are low-fidelity textual layouts that establish hierarchy and ownership, not pixel-perfect mockups. Read each row left-to-right on desktop. Below 1024 px, complex studio layouts become companion views under the responsive contract; they do not shrink into a full editor.

## Global shell

    +--------------------------------------------------------------------------------+
    | Global rail | Spryxel / Home | Project switcher | Search / command palette    |
    |             |----------------------------------------------------| Notifications|
    |             | Main global content: home, projects, developer, billing, account|
    |             | Durable notices and job status remain reachable                 |
    +--------------------------------------------------------------------------------+

The global rail exposes role-appropriate destinations. Home/Projects, notifications, developer, billing and account remain distinct from project studio navigation. The command palette is keyboard-accessible and also has a visible affordance.

## Project workspace and studio grammar

    +--------------------------------------------------------------------------------+
    | Global shell / Project selector / Active project + DNA version / Command       |
    | Project nav | Browser / layer tree | Canvas or primary work area | Inspector   |
    |             |                       |                             | Context     |
    |             |                       |                             | QA / profile|
    |-------------+-----------------------+-----------------------------+-------------|
    | Optional collapsible bottom tray: durable Jobs / timeline / outputs / notices  |
    +--------------------------------------------------------------------------------+

Project navigation owns overview, DNA, Generate and eligible studios, Library/Graph, QA and Export. The central work area stays primary. Inspector carries context and constraints without hiding the canvas. Pane size/collapse is a presentation preference; job/asset state is canonical elsewhere.

## Home / Command Center

    +--------------------------------------------------------------------------------+
    | Welcome + active project | Primary next action | Create / resume                |
    | Recent projects           | Recent durable jobs and status                      |
    | Useful quality/cost notices | Notifications and actionable setup items         |
    +--------------------------------------------------------------------------------+

Prioritize resume/create/select actions and status evidence. Empty first-run presents project creation and DNA setup. Avoid turning the home surface into a dense operations dashboard.

## Projects and project overview

    +--------------------------------------------------------------------------------+
    | Projects title / search / filters / Create project                              |
    | Project list: name, last activity, DNA/version, durable jobs, safe status       |
    +--------------------------------------------------------------------------------+
    | Selected project: identity + DNA/version + recent assets/jobs + next action    |
    | Project nav -> DNA | Generate | Studios | Library | Graph | QA | Export        |
    +--------------------------------------------------------------------------------+

Creation is a guided minimal path. Show permissions and project ownership as needed; do not infer tenant access from a visible row.

## DNA Studio

    +--------------------------------------------------------------------------------+
    | Project + active DNA/version | Save as new version | Compare history            |
    | Guided groups: project identity / style / palette / constraints                  |
    | Validation and conflict summary             | Usage by jobs/assets (linked)      |
    +--------------------------------------------------------------------------------+

The selected version and its downstream use remain clear. Editing produces a new version and preserves prior provenance.

## Generate and Character studios

    +--------------------------------------------------------------------------------+
    | Project + DNA/version | Family/SKU | Profile | Job tray                         |
    | Request / references / contract fields        | Context / bounded profile       |
    | Canvas/candidate area                         | Estimate / limits / QA evidence |
    | Candidate strip / compare                     | Approve, repair, reject          |
    +--------------------------------------------------------------------------------+

Before submission, the request and profile are reviewed with bounded credit estimate/reservation and confirmation. After submission, candidate and QA views occupy the primary work area, with job state and actions retained.

## World, Tileset and Items/Props studios

    +--------------------------------------------------------------------------------+
    | Project + DNA/version | Asset family | Contract / profile                        |
    | Browser: family/history | Central visual work area | Inspector: constraints      |
    | Optional bottom tray: queued/running/QA job, candidates and outputs               |
    +--------------------------------------------------------------------------------+

Show domain constraints in the inspector before cost confirmation: tile dimensions/transitions/seams; world/project fit; item family cohesion. Reuse the shared studio/job grammar.

## Asset Library, Graph and QA Center

    +--------------------------------------------------------------------------------+
    | Project / search / filters / family / status / version                           |
    | Asset list or graph canvas                 | Selected asset / lineage / version  |
    | QA Center: Integrity Gate -> evidence -> Production Score -> allowed next action|
    | Originating job / studio / export eligibility links                              |
    +--------------------------------------------------------------------------------+

Asset, job, graph and QA are linked views over canonical records. Hard integrity failures remain blocked. Reviewer actions create durable outcomes.

## Export Center

    +--------------------------------------------------------------------------------+
    | Project | Engine target/profile (Godot or Unity V1) | Export job status            |
    | Eligible asset/version selection | Dependencies / validation / warnings           |
    | Package scope + provenance preview | Bounded cost if applicable | Confirm         |
    +--------------------------------------------------------------------------------+

Separate blocking validation issues from compatibility warnings. Preserve version and provenance references in the final bundle record.

## Jobs and notifications

    +--------------------------------------------------------------------------------+
    | Jobs: project/status filters | Queued / running / QA / repair / export rows       |
    | Selected job: stages, contract, budget, origin, output and cancel eligibility    |
    +--------------------------------------------------------------------------------+
    | Notifications: actionable event, safe summary, owning record and preferences     |
    +--------------------------------------------------------------------------------+

The same durable job is reachable from studio, notification and Jobs Center. Critical outcomes survive navigation and toast dismissal.

## Billing and Developer Platform

    +--------------------------------------------------------------------------------+
    | Credits/Billing: balance and ledger evidence | purchase/receipt where enabled   |
    | Developer: API / MCP / CLI | project binding | scopes | expiry | allowed profile |
    | Budget/risk class | one-time reveal at creation | last use | revoke/rotate       |
    +--------------------------------------------------------------------------------+

Billing uses locale-aware presentation and does not imply a frozen public price. Credential secrets appear only once; later views expose metadata, never the secret.

## Map and UI/HUD families (IMPORTANT/V1.x)

    +--------------------------------------------------------------------------------+
    | Project + DNA/version | Map or UI family context | Shared job tray                 |
    | Structure/layers or component tree | Canvas/preview | Inspector/constraints       |
    | Map: POI/region graph + layers | UI: states/responsive/localization/theme         |
    | QA / candidate versions / target export and provenance                            |
    +--------------------------------------------------------------------------------+

Map and UI surfaces share one family grammar. Map structure stays machine-addressable and dimension-aligned. UI visuals do not replace the structured component contract. Their IMPORTANT classification stays visible; this contract does not make them V1.

## Owner/Admin Console and economics

    +--------------------------------------------------------------------------------+
    | Distinct Owner/Admin identity + permission + environment + MFA/reauth state      |
    | Operations navigation | Target scope and evidence | Change preview / consequences|
    | Explicit confirmation | Audit record / result                                     |
    +--------------------------------------------------------------------------------+

Operations are separated from creative navigation and permission-gated. High-impact action summaries identify scope, reversibility and audit effect; bulk operations preview affected items. No silent impersonation and no public exposure of hidden TrustShield data.

## Companion layout

    +--------------------------------------+
    | Project / job / notifications        |
    | Status + accessible evidence         |
    | Candidate or asset review            |
    | Safe approve/cancel/simple actions   |
    | Open full studio on supported device |
    +--------------------------------------+

On smaller screens, keep monitoring, candidate review/approval, notification, account/billing and lightweight project browsing usable. Replace complex editing controls with a clear companion boundary.
