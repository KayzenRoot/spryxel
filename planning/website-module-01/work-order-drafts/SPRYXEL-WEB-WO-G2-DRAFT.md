# WORK ORDER CANDIDATE — SPRYXEL-WEB-WO-G2

> **DRAFT SPECIFICATION ONLY. NOT AN ADMITTED/EXECUTABLE WORK ORDER.**
> Parent GitHub [#70](https://github.com/KayzenRoot/spryxel/issues/70) | main planning [#54](https://github.com/KayzenRoot/spryxel/issues/54) | module batch plan.
> This document is **non-canonical** under `planning/`. It does not modify `.engineering/work-orders/`, a Context Lock, Decision Ledger, protected CI, WorkOS, PR #30, or checkpoint.

## Execution identity and admission prerequisites
- Candidate ID: `SPRYXEL-WEB-WO-G2`. Do **not** convert to already occupied numbered series `SPRYXEL-WO-00x` without formal admission/unique allocation.
- Issue: [#70](https://github.com/KayzenRoot/spryxel/issues/70); execution mode: **SERIAL**; prerequisites: **`WEB-G1`**.
- Bound repo: `KayzenRoot/spryxel`; **base/head SHA = TO BE FROZEN AT ADMISSION**, not today's informative repo snapshot. Context Lock: **NOT_CREATED/NOT_ADMITTED**.
- Authority hierarchy: canonical Checkpoint > Decisions/ADRs > Scope > DoD > Architecture > Requirements > owner-approved admitted WO and fresh Context Lock. Current checkpoint still expects Asset Contract / durable Job backbone. Sequencing proposal G0 must be separately audited before changing execution order.
- Agent assignment: **UNASSIGNED**. Proposed worktree: `../spryxel-web-g2`; candidate branch: `codex/spryxel-web-g2`. Neither currently exists or grants execution authority.
- Owner scope paths: inspect and lock at G1, validate exact directory collisions before running. No shared/unknown files may be written by two agents.
- Shared references: owner-supplied Double-Leaf Digital Leaf visual (#53), homepage concept **07 / 3D Worlds**, EN default with pt-BR/es, dark/light and accessible static fallback. Images are references, not release-licensed final source assets.

## Additional executable Work Order contract requirements
1. **OBJECTIVE/CONTEXT/SCOPE:** adopt the issue scope below only after technical review, remaining truthful to implemented V1 Pixel/2D product.
2. **OUT OF SCOPE:** existing WO-008/PR #30, core authentication/RLS, tokens & protected rules, ledger/payments, GPUs, models, production 3D, fabricated price/trial/customer statistics, changing canonical Checkpoint.
3. **FILES TO READ:** current `AGENTS.md`, Source Pack, approved G0/G1/G2, #54 and this issue, exact owned source files after admission, package scripts and relevant checks; never assume an unsupplied path exists.
4. **ARCHITECTURE/TESTS:** reuse current Next.js App Router, WorkOS provider boundary, typed EN/pt-BR/es content; F0 targeted checks during iteration, **all mandatory Work Order tests and required exact-HEAD checks** for acceptance, security and legal gates for affected paths.
5. **DELIVERABLES:** small scoped PR, independent Evidence Bundle (exact base/final HEAD, expected vs actual, screenshots where visual, functional/a11y/SEO/consent proofs as relevant), proposed checkpoint delta (not self-promoted), read-only test/CI receipts.
6. **REVIEW FORMAT:** pt-BR `APPROVED | CORRECTION REQUIRED | BLOCKED`. ChatGPT-first scoped GitHub fixes #62. P2 deferral only if genuinely outside mandatory acceptance; no protected gate waivers. NO MERGE before independent audit + explicit owner-governed promotion/authorization and postmerge checks.
7. **STOP CONDITION:** The future admitted WO must bind its issue-specific STOP string below. For now **`SPRYXEL_WEB_G2_DRAFT_READY_FOR_OWNER_REVIEW`** only.

## Canonical issue proposal (quoted as non-executable source)
# SPRYXEL-PMOD-01-WEB-G2 — Master Design System + 3D Worlds full-page design references

**Planning:** CANDIDATE / NO IMPLEMENTATION ADMISSION / NO WORK ORDER EXECUTOR AUTHORIZATION.
**Parent:** #54, #35, #34; speed and review #61/#62.
**Lane:** `SERIAL-DESIGN-FREEZE`.
**Dependencies (planning):** #64 WEB-G1 approved; Digital Leaf original owner reference #53 for approval, site layout can plan independently.
**Proposed exclusive ownership:** `planning/website-module-01/master-design/ and design/website/reference/ (candidate, NO official brand master)` (to be reconciled by G1; not an authorized edit allowlist).
**Candidate WO ID:** `SPRYXEL-WEB-WO-G2` (draft only; do not collide with already admitted numbered WOs).

## OBJECTIVE
Define a faithful production-ready visual MASTER DESIGN for the entire public homepage (desktop full-height hero to footer, plus mobile and light variants), based on owner-selected Option 07 '3D Worlds' + original double-leaf Digital Leaf identity. Produce reference image deliverables AFTER visual generation/owner review, layout annotations, design tokens as proposed aliases, component geometry/spacing, glass panels, surface hierarchy, illustration licenses/provenance, typography, dark/light, reduced-motion/static fallback, performance budget. Separate design image reference from editable HTML/CSS implementation and original logo #53; current draft logos cannot be treated as official.

## CONTEXT / FILES TO READ BEFORE IMPLEMENTATION
`.engineering/CHECKPOINT.json`, Decisions Ledger/ADRs, Scope, DoD, Architecture, Requirements, UI-UX, approved Work Order/Context Lock, #54, #53, existing app paths and PR #30 (active HIGH_ASSURANCE). Freeze base/head SHA and read-only ownership receipt. Owner-approved visual direction is **Option 07 / 3D Worlds** with **two-leaf Digital Leaf** and dark-first plus complete light theme. Canonical EN, pt-BR and ES from start. Reuse Next.js App Router and WorkOS AuthKit without security refactoring.

## SCOPE / OUT OF SCOPE / ARCHITECTURE
- The scope is the OBJECTIVE above. No Stripe/crypto, cloud GPU/model, credits/ledger, 3D production feature, video generation, WorkOS provider change, synthetic legal identity, unverifiable metrics, or changing protected workflow/GEF/source hierarchy.
- Shared theme/locale/routes/components are frozen by G1/G2. No two agents edit the same paths; each agent receives one branch/worktree and a formally admitted Work Order/Context Lock.
- Public-site-first ordering conflicts with canonical D-153/Checkpoint; requires objective Decision Delta #63 and shared contracts #64/#70 *before implementation admission*. Existing WO-008/PR #30 remains isolated and not merged.
- F0/F1 targeted development checks, F2 mandatory WO test + exact-HEAD required CI, independent audit; no disabling tests for speed. P2 non-gating review polish can be tracked to module closeout only when no required acceptance is harmed.

## ACCEPTANCE CANDIDATES
- [ ] Desktop long-page master reference covering header/hero/benefits/asset families/workflows/gallery/FAQ/CTA/footer, plus mobile and light-mode views
- [ ] Component specs responsive 320–1920 widths, spacing/typography/contrast tokens, accessible controls and reduced motion
- [ ] Typography and color usage reviewed against canonical UX; any product-token change escalated through Decision Delta rather than implicit override
- [ ] Original Digital Leaf artifact referenced, license rights documented, owner visual approval marked pending until received
- [ ] Asset directory manifest for Codex, original editable sources vs reference bitmap clearly distinguished
- [ ] Evidence: exact SHA, test receipts and file owner, license/right-to-use where applicable, independent review, corrective follow-up P0/P1 and explicit P2 closeout.
- [ ] User/owner approval of design/legal/publication where required; no promotion or merge assumed.

## DELIVERABLES / REVIEW / STOP
Deliver design or code artifacts only after formal WO admission; attach tests, screenshots/proofs, Evidence Bundle and a proposed checkpoint delta, **never self-promote**. Verdict in pt-BR `APPROVED/CORRECTION REQUIRED/BLOCKED`. Reuse R0 Control Tower #55/#56 for dry-run batching; real Codex dispatch needs its own approval.
**Future execution STOP:** `SPRYXEL_WEB_G2_MASTER_DESIGN_READY_FOR_OWNER_REVIEW`.
**Planning STOP:** `SPRYXEL_WEB_G2_PLAN_READY_FOR_OWNER_REVIEW`.

