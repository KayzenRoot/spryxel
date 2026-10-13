# WORK ORDER CANDIDATE — SPRYXEL-WEB-WO-A5

> **DRAFT SPECIFICATION ONLY. NOT AN ADMITTED/EXECUTABLE WORK ORDER.**
> Parent GitHub [#71](https://github.com/KayzenRoot/spryxel/issues/71) | main planning [#54](https://github.com/KayzenRoot/spryxel/issues/54) | module batch plan.
> This document is **non-canonical** under `planning/`. It does not modify `.engineering/work-orders/`, a Context Lock, Decision Ledger, protected CI, WorkOS, PR #30, or checkpoint.

## Execution identity and admission prerequisites
- Candidate ID: `SPRYXEL-WEB-WO-A5`. Do **not** convert to already occupied numbered series `SPRYXEL-WO-00x` without formal admission/unique allocation.
- Issue: [#71](https://github.com/KayzenRoot/spryxel/issues/71); execution mode: **PARALLEL**; prerequisites: **`WEB-G2`**.
- Bound repo: `KayzenRoot/spryxel`; **base/head SHA = TO BE FROZEN AT ADMISSION**, not today's informative repo snapshot. Context Lock: **NOT_CREATED/NOT_ADMITTED**.
- Authority hierarchy: canonical Checkpoint > Decisions/ADRs > Scope > DoD > Architecture > Requirements > owner-approved admitted WO and fresh Context Lock. Current checkpoint still expects Asset Contract / durable Job backbone. Sequencing proposal G0 must be separately audited before changing execution order.
- Agent assignment: **UNASSIGNED**. Proposed worktree: `../spryxel-web-a5`; candidate branch: `codex/spryxel-web-a5`. Neither currently exists or grants execution authority.
- Owner scope paths: inspect and lock at G1, validate exact directory collisions before running. No shared/unknown files may be written by two agents.
- Shared references: owner-supplied Double-Leaf Digital Leaf visual (#53), homepage concept **07 / 3D Worlds**, EN default with pt-BR/es, dark/light and accessible static fallback. Images are references, not release-licensed final source assets.

## Additional executable Work Order contract requirements
1. **OBJECTIVE/CONTEXT/SCOPE:** adopt the issue scope below only after technical review, remaining truthful to implemented V1 Pixel/2D product.
2. **OUT OF SCOPE:** existing WO-008/PR #30, core authentication/RLS, tokens & protected rules, ledger/payments, GPUs, models, production 3D, fabricated price/trial/customer statistics, changing canonical Checkpoint.
3. **FILES TO READ:** current `AGENTS.md`, Source Pack, approved G0/G1/G2, #54 and this issue, exact owned source files after admission, package scripts and relevant checks; never assume an unsupplied path exists.
4. **ARCHITECTURE/TESTS:** reuse current Next.js App Router, WorkOS provider boundary, typed EN/pt-BR/es content; F0 targeted checks during iteration, **all mandatory Work Order tests and required exact-HEAD checks** for acceptance, security and legal gates for affected paths.
5. **DELIVERABLES:** small scoped PR, independent Evidence Bundle (exact base/final HEAD, expected vs actual, screenshots where visual, functional/a11y/SEO/consent proofs as relevant), proposed checkpoint delta (not self-promoted), read-only test/CI receipts.
6. **REVIEW FORMAT:** pt-BR `APPROVED | CORRECTION REQUIRED | BLOCKED`. ChatGPT-first scoped GitHub fixes #62. P2 deferral only if genuinely outside mandatory acceptance; no protected gate waivers. NO MERGE before independent audit + explicit owner-governed promotion/authorization and postmerge checks.
7. **STOP CONDITION:** The future admitted WO must bind its issue-specific STOP string below. For now **`SPRYXEL_WEB_A5_DRAFT_READY_FOR_OWNER_REVIEW`** only.

## Canonical issue proposal (quoted as non-executable source)
# SPRYXEL-PMOD-01-WEB-A5 — Navigation, footer, responsive theme controls and public shell components

**Planning:** CANDIDATE / NO IMPLEMENTATION ADMISSION / NO WORK ORDER EXECUTOR AUTHORIZATION.
**Parent:** #54, #35, #34; speed and review #61/#62.
**Lane:** `PARALLEL-WEB-CHROME`.
**Dependencies (planning):** #64 G1 and #70 G2 approved design/route contracts.
**Proposed exclusive ownership:** `apps/web/components/public-chrome/ (proposed only; existing routes/layout owned by B1)` (to be reconciled by G1; not an authorized edit allowlist).
**Candidate WO ID:** `SPRYXEL-WEB-WO-A5` (draft only; do not collide with already admitted numbered WOs).

## OBJECTIVE
Create a reusable public header with logo slot, accessible navigation, locale switch integration slot, Sign in action slot, dark/light toggle, mobile menu, sticky/scroll fallback; professional full footer with Product, Features, Workflows, Resources, Company/Contact, Terms, Privacy, Cookie Policy, Cookie Settings and social links only where destinations are verified. No new AuthKit backend, no duplicate locale dictionary ownership, no product redesign beyond approved master.

## CONTEXT / FILES TO READ BEFORE IMPLEMENTATION
`.engineering/CHECKPOINT.json`, Decisions Ledger/ADRs, Scope, DoD, Architecture, Requirements, UI-UX, approved Work Order/Context Lock, #54, #53, existing app paths and PR #30 (active HIGH_ASSURANCE). Freeze base/head SHA and read-only ownership receipt. Owner-approved visual direction is **Option 07 / 3D Worlds** with **two-leaf Digital Leaf** and dark-first plus complete light theme. Canonical EN, pt-BR and ES from start. Reuse Next.js App Router and WorkOS AuthKit without security refactoring.

## SCOPE / OUT OF SCOPE / ARCHITECTURE
- The scope is the OBJECTIVE above. No Stripe/crypto, cloud GPU/model, credits/ledger, 3D production feature, video generation, WorkOS provider change, synthetic legal identity, unverifiable metrics, or changing protected workflow/GEF/source hierarchy.
- Shared theme/locale/routes/components are frozen by G1/G2. No two agents edit the same paths; each agent receives one branch/worktree and a formally admitted Work Order/Context Lock.
- Public-site-first ordering conflicts with canonical D-153/Checkpoint; requires objective Decision Delta #63 and shared contracts #64/#70 *before implementation admission*. Existing WO-008/PR #30 remains isolated and not merged.
- F0/F1 targeted development checks, F2 mandatory WO test + exact-HEAD required CI, independent audit; no disabling tests for speed. P2 non-gating review polish can be tracked to module closeout only when no required acceptance is harmed.

## ACCEPTANCE CANDIDATES
- [ ] Mobile/tablet/desktop semantic header/footer consistent with G2
- [ ] Keyboard, focus, skip-link, landmarks, reduced-motion and dark/light verified
- [ ] Every footer link either resolves to a legitimate approved route/anchor or is omitted/gated, no '#' placeholders in publish build
- [ ] Logo is a brand-master dependency on #53, with temporary design-safe slot that does not pretend draft is approved
- [ ] No shared router/layout or global design token edits in this lane
- [ ] Evidence: exact SHA, test receipts and file owner, license/right-to-use where applicable, independent review, corrective follow-up P0/P1 and explicit P2 closeout.
- [ ] User/owner approval of design/legal/publication where required; no promotion or merge assumed.

## DELIVERABLES / REVIEW / STOP
Deliver design or code artifacts only after formal WO admission; attach tests, screenshots/proofs, Evidence Bundle and a proposed checkpoint delta, **never self-promote**. Verdict in pt-BR `APPROVED/CORRECTION REQUIRED/BLOCKED`. Reuse R0 Control Tower #55/#56 for dry-run batching; real Codex dispatch needs its own approval.
**Future execution STOP:** `SPRYXEL_WEB_A5_CHROME_READY_FOR_REVIEW`.
**Planning STOP:** `SPRYXEL_WEB_A5_PLAN_READY_FOR_OWNER_REVIEW`.

