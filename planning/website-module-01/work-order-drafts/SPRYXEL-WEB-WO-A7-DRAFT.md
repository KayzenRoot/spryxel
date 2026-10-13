# DRAFT WORK ORDER: SPRYXEL-WEB-WO-A7

**NOT ADMITTED / NOT EXECUTABLE.** Issue #73; parent #54; source authority remains in the canonical `.engineering` Source Pack. Candidate Work Order name reserves no official WO number. **No live execution authorization.**

## Context / scope / dependencies
- Module: Public Website 01, owner-selected Option 07 3D Worlds + true Digital Leaf brand ref #53.
- Lane: PARALLEL; dependencies: WEB-G2.
- Base SHA, fresh Context Lock and file ownership: **to be formally frozen at admission**, not inferred from a draft.
- Read actual `AGENTS.md`, `.engineering/CHECKPOINT.json`, Decisions, Scope, DoD, Architecture, Security, UI-UX, issue #54, G0/G1/G2 contracts before editing.
- Existing approved Identity/Projects functionality and WorkOS AuthKit must be reused. WO-008/PR #30 is isolated HIGH_ASSURANCE and remains untouched.
- EN canonical and complete pt-BR/es, dark/light, WCAG 2.2 AA and static WebGL fallback where relevant.
- No payment/credits/GPU, false product or pricing claims, invented footer identity/contact, no duplicate logo reproduction.

## Tasks and evidence
Follow the scope and checkboxes in the linked issue, with exclusive file/write ownership and independent branch/worktree. Supply a narrow PR, source/Head exact SHA, code/tests/visual/consent/legal QA as applicable, Evidence Bundle and proposed checkpoint delta only.
ChatGPT-first follow-up review #62 repairs safe bounded changes in the GitHub PR itself; P2 cosmetic deferral only when not an accepted DoD/WO requirement. P0/P1 remain blockers. Test policy #61 targets early feedback but **all mandatory final-HEAD acceptance tests must run**. Owner review, governance promotion and protected merge still separate.

## Source issue specification / proposed acceptance
# SPRYXEL-PMOD-01-WEB-A7 — Public Sign in/Register entrypoint UX aligned with existing WorkOS

**Planning:** CANDIDATE / NO IMPLEMENTATION ADMISSION / NO WORK ORDER EXECUTOR AUTHORIZATION.
**Parent:** #54, #35, #34; speed and review #61/#62.
**Lane:** `PARALLEL-WEB-AUTH-ENTRY`.
**Dependencies (planning):** #64 G1 route contract and #70 G2 master layout.
**Proposed exclusive ownership:** `apps/web/components/public-auth-entry/ and public CTA adapter only; no security/session provider sources` (to be reconciled by G1; not an authorized edit allowlist).
**Candidate WO ID:** `SPRYXEL-WEB-WO-A7` (draft only; do not collide with already admitted numbered WOs).

## OBJECTIVE
Specify and build the homepage public sign-in and registration CTA experience and safe routes toward the ALREADY EXISTING WorkOS/AuthKit identity. This is not a new authentication implementation. If login/register route isn't actually usable, require a truthful Coming Soon destination or disable public registration with an accessible explanation. Session/token changes, WorkOS provider swaps, auth security adjustments deferred to separate HIGH_ASSURANCE approved Work Order.

## CONTEXT / FILES TO READ BEFORE IMPLEMENTATION
`.engineering/CHECKPOINT.json`, Decisions Ledger/ADRs, Scope, DoD, Architecture, Requirements, UI-UX, approved Work Order/Context Lock, #54, #53, existing app paths and PR #30 (active HIGH_ASSURANCE). Freeze base/head SHA and read-only ownership receipt. Owner-approved visual direction is **Option 07 / 3D Worlds** with **two-leaf Digital Leaf** and dark-first plus complete light theme. Canonical EN, pt-BR and ES from start. Reuse Next.js App Router and WorkOS AuthKit without security refactoring.

## SCOPE / OUT OF SCOPE / ARCHITECTURE
- The scope is the OBJECTIVE above. No Stripe/crypto, cloud GPU/model, credits/ledger, 3D production feature, video generation, WorkOS provider change, synthetic legal identity, unverifiable metrics, or changing protected workflow/GEF/source hierarchy.
- Shared theme/locale/routes/components are frozen by G1/G2. No two agents edit the same paths; each agent receives one branch/worktree and a formally admitted Work Order/Context Lock.
- Public-site-first ordering conflicts with canonical D-153/Checkpoint; requires objective Decision Delta #63 and shared contracts #64/#70 *before implementation admission*. Existing WO-008/PR #30 remains isolated and not merged.
- F0/F1 targeted development checks, F2 mandatory WO test + exact-HEAD required CI, independent audit; no disabling tests for speed. P2 non-gating review polish can be tracked to module closeout only when no required acceptance is harmed.

## ACCEPTANCE CANDIDATES
- [ ] Functional, accessible public CTA destination validated in existing WorkOS setup or explicitly gated if unready
- [ ] Sign in/Register terminology accurate across EN/pt-BR/es, predictable return paths and error states
- [ ] No duplicate auth backend, no fake trial promise, no new payment or customer data tracking
- [ ] Protected tenant/session routes and existing RLS boundaries untouched, security review escalated if integration needed
- [ ] No shared router/header editing (A5/B1 integrates slots)
- [ ] Evidence: exact SHA, test receipts and file owner, license/right-to-use where applicable, independent review, corrective follow-up P0/P1 and explicit P2 closeout.
- [ ] User/owner approval of design/legal/publication where required; no promotion or merge assumed.

## DELIVERABLES / REVIEW / STOP
Deliver design or code artifacts only after formal WO admission; attach tests, screenshots/proofs, Evidence Bundle and a proposed checkpoint delta, **never self-promote**. Verdict in pt-BR `APPROVED/CORRECTION REQUIRED/BLOCKED`. Reuse R0 Control Tower #55/#56 for dry-run batching; real Codex dispatch needs its own approval.
**Future execution STOP:** `SPRYXEL_WEB_A7_AUTH_ENTRY_READY_FOR_REVIEW`.
**Planning STOP:** `SPRYXEL_WEB_A7_PLAN_READY_FOR_OWNER_REVIEW`.


**Planning STOP:** `SPRYXEL_WEB_A7_DRAFT_READY_FOR_OWNER_REVIEW`.
**Execution STOP:** Issue-defined string only after formal WO admission and Context Lock.
