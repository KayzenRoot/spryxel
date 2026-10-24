# WORK ORDER CANDIDATE — SPRYXEL-WEB-WO-A1

> **DRAFT SPECIFICATION ONLY. NOT AN ADMITTED/EXECUTABLE WORK ORDER.**
> Parent GitHub [#65](https://github.com/KayzenRoot/spryxel/issues/65) | main planning [#54](https://github.com/KayzenRoot/spryxel/issues/54) | module batch plan.
> This document is **non-canonical** under `planning/`. It does not modify `.engineering/work-orders/`, a Context Lock, Decision Ledger, protected CI, WorkOS, PR #30, or checkpoint.

## Execution identity and admission prerequisites
- Candidate ID: `SPRYXEL-WEB-WO-A1`. Do **not** convert to already occupied numbered series `SPRYXEL-WO-00x` without formal admission/unique allocation.
- Issue: [#65](https://github.com/KayzenRoot/spryxel/issues/65); execution mode: **PARALLEL**; prerequisites: **`WEB-G2`**.
- Bound repo: `KayzenRoot/spryxel`; **base/head SHA = TO BE FROZEN AT ADMISSION**, not today's informative repo snapshot. Context Lock: **NOT_CREATED/NOT_ADMITTED**.
- Authority hierarchy: canonical Checkpoint > Decisions/ADRs > Scope > DoD > Architecture > Requirements > owner-approved admitted WO and fresh Context Lock. Current checkpoint still expects Asset Contract / durable Job backbone. Sequencing proposal G0 must be separately audited before changing execution order.
- Agent assignment: **UNASSIGNED**. Proposed worktree: `../spryxel-web-a1`; candidate branch: `codex/spryxel-web-a1`. Neither currently exists or grants execution authority.
- Owner scope paths: inspect and lock at G1, validate exact directory collisions before running. No shared/unknown files may be written by two agents.
- Shared references: owner-supplied Double-Leaf Digital Leaf visual (#53), homepage concept **07 / 3D Worlds**, EN default with pt-BR/es, dark/light and accessible static fallback. Images are references, not release-licensed final source assets.

## Additional executable Work Order contract requirements
1. **OBJECTIVE/CONTEXT/SCOPE:** adopt the issue scope below only after technical review, remaining truthful to implemented V1 Pixel/2D product.
2. **OUT OF SCOPE:** existing WO-008/PR #30, core authentication/RLS, tokens & protected rules, ledger/payments, GPUs, models, production 3D, fabricated price/trial/customer statistics, changing canonical Checkpoint.
3. **FILES TO READ:** current `AGENTS.md`, Source Pack, approved G0/G1/G2, #54 and this issue, exact owned source files after admission, package scripts and relevant checks; never assume an unsupplied path exists.
4. **ARCHITECTURE/TESTS:** reuse current Next.js App Router, WorkOS provider boundary, typed EN/pt-BR/es content; F0 targeted checks during iteration, **all mandatory Work Order tests and required exact-HEAD checks** for acceptance, security and legal gates for affected paths.
5. **DELIVERABLES:** small scoped PR, independent Evidence Bundle (exact base/final HEAD, expected vs actual, screenshots where visual, functional/a11y/SEO/consent proofs as relevant), proposed checkpoint delta (not self-promoted), read-only test/CI receipts.
6. **REVIEW FORMAT:** pt-BR `APPROVED | CORRECTION REQUIRED | BLOCKED`. ChatGPT-first scoped GitHub fixes #62. P2 deferral only if genuinely outside mandatory acceptance; no protected gate waivers. NO MERGE before independent audit + explicit owner-governed promotion/authorization and postmerge checks.
7. **STOP CONDITION:** The future admitted WO must bind its issue-specific STOP string below. For now **`SPRYXEL_WEB_A1_DRAFT_READY_FOR_OWNER_REVIEW`** only.

## Canonical issue proposal (quoted as non-executable source)
# SPRYXEL-PMOD-01-WEB-A1 — Landing page content/layout and professional game-asset showcase

**Status:** PLANNING CANDIDATE / NOT ADMITTED / NOT AN EXECUTABLE WORK ORDER.
**Parent:** #54 (public website), #35 (product UX), #34 (batch plan), #62 (ChatGPT-first review), #61 (fast feedback).
**Lane:** `PARALLEL-WEB-LANDING`. **Dependency:** WEB-G1 shared contract freeze; #53 branding dependency where used.
**Proposed paths / ownership:** apps/web/components/landing/ (proposed), no root layout. Actual absolute ownership must be frozen by G1 + Context Lock before use.

## Scope and objective
Create hero/benefits/features/workflow/demo sections with honest Pixel & 2D game asset copy and accessible navigation. Option 07 3D Worlds is visual direction; don't advertise 3D generation/video as shipping, invented stats, unverified prices, or 'free credits'. Separate route layout owner belongs G1/B1. Dark/light responsive EN/pt-BR/es all require tested rendering.

## Requirements and constraints
- Reuse existing Next.js/React, WorkOS/AuthKit identity boundary and i18n EN/pt-BR/es; never duplicate the business backend or tenant authorization.
- V1 production promises must match canonical game-assets Pixel/2D release; illustrative 3D worlds are permitted as art, not a production-capability claim.
- Respect repo Source Pack and current WO-008 HIGH_ASSURANCE, which is not merged; website-first requires reviewed sequencing decision, exact main SHA and new Context Lock.
- No GPU, purchase/checkout, API credentials, WorkOS provider changes or commercial pricing introduced.
- A single Codex prompt may dispatch A1–A4 in isolated worktrees *only after admission and zero shared-path conflicts*. This package is parallel-safe only after G1 and exact source-owner checks.
- After every Codex return, ChatGPT does first review and fixes scoped GitHub-possible issues. Only required local validation/complex corrections return to Codex as one Correction Delta; P2 tracking never waives required DoD/CI/legal gates.

## Future Work Order acceptance checklist
- [ ] Source Check / canonical dependencies and design classification verified.
- [ ] Approved Work Order and Context Lock with frozen contract and exact SHAs.
- [ ] Owned paths nonoverlapping; STOP and exclusions copied into multiagent Batch Manifest.
- [ ] Unit/targeted feedback in iterations, full Work Order-required tests and exact-HEAD checks for audit.
- [ ] Usability/a11y/i18n/security/rights/legal gate as applicable; no fabricated success metrics.
- [ ] Evidence Bundle + independent review; authorized checkpoint/merge, postmerge before dependent package starts.

**STOP CONDITION (only after future admission):** `SPRYXEL_WEB_A1_LANDING_READY_FOR_REVIEW`.
**Current STOP:** `SPRYXEL_WEB_A1_PLAN_READY_FOR_OWNER_REVIEW`.
