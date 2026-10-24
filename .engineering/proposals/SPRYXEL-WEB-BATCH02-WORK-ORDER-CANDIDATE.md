# SPRYXEL-WEB-BATCH02 | Formal Work Order candidate for independent admission

**Tracking Issue:** #81. **Proposal state:** `OWNER_SCOPE_APPROVED / INDEPENDENT_AUDIT_PENDING / NOT_ADMITTED_FOR_EXECUTION`.
**Prerequisite proposal:** D-162 in `.engineering/proposals/D-162-WEB-BATCH02-OFFMAIN-CANDIDATE.md`, G1 candidate in `.engineering/proposals/WEB-BATCH02-G1-CONTRACT-CANDIDATE.md`. **No bypass of `AGENTS.md` or current Checkpoint.**

## Scope and owner authorization
The owner confirmed in chat (2026-10-14) authorization to advance Batch02 **in a separate off-main branch**, with **NO merges**, no backend, WorkOS/authentication, Blender/motion or payments. This does not constitute approval from an independent reviewer, admission into canonical Source Pack, or a merge/release signature.

Goal: finish static public website typography, navigation, mobile layouts, accessible interactions and the three locale copy sets already present in the unmerged Batch01/SSR branches. Only the file scope listed below, no new product functionality.

## Source and execution base (ONLY when formally admitted)
- Repository: `KayzenRoot/spryxel`
- **Proposed source:** `feat/web-b1-ssr-locale-01@9e34e76ce8e451a47999cdd354921b5fed0c08c9` (stacked draft PR #80, which is based on #76 `3dd79038d0cca379a5cd3db7ac09a153a3c5b0a7`).
- **Prepared staging branch:** `feat/web-static-batch-02-polish` already exists at the exact #80 parent SHA above and has no commits ahead of it. It was created only for owner-scoped preparation; it is **not admitted for execution**. Before admission, keep it read-only: no product edits, commits, PR creation, dispatch, rebase, reset, or retarget.
- **Proposed target after admission:** reuse that staging branch only after a fresh Context Lock is approved and preflight confirms its remote head still equals the exact #80 parent and it remains clean/empty. If either check differs, stop and recompile the admission artifacts; do not repair or move the branch silently. Keep any eventual DRAFT PR based on `feat/web-b1-ssr-locale-01`; do not retarget to `main` or alter existing parent PRs.
- **Canonical main:** `08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`, current next legal stage `ASSET_CONTRACT_DURABLE_JOB_WORK_ORDER_REQUIRED`. Canonical governance change is required to admit this separate off-main exception without contradicting that rule.
- **Risk:** `ELEVATED_SOURCE_GOVERNANCE_DEPENDENCY` (UI edits low risk, inherited parent route/auth migration remains HIGH_ASSURANCE). Does not weaken inherited #80 acceptance.

## Executable work plan only after formal admission
**C1 Shell UI:** existing `apps/web/src/public-site/shell.tsx` exclusively; mobile header/footer, keyboard/focus, theme, locale navigation, truthful link destinations. Official Digital Leaf brand reproduction explicitly deferred; provisional logo not marked final.

**C2 Copy:** existing `apps/web/src/public-site/content.ts` exclusively; EN, pt-BR, es parity, game-creator-first labels, alt, clear planned-vs-live capabilities. No fabricated products/prices/legal publisher or SEO domain. Preserve type keys and refactored zero-duplication catalog.

**C3 Responsive static CSS:** existing `apps/web/app/globals.css` exclusively; dark/light, focus/contrast/touch targets, 320..1920 mobile/desktop, locale 40% expansion. No animation, Blender, WebGL or global security/layout change.

**Serial integrator** only AFTER C1–C3: `apps/web/public-site.spec.ts` exclusively; focused keyboard/mobile/no-scroll, themes, locale, raw SSR `html lang`, all 24 public URLs, legal drafts noindex; preserve existing authenticated-root redirection smoke.

At most three concurrent agents if the actual Codex runtime supports it with disjoint worktrees; otherwise sequential. File owners cannot cross-edit. No migration/route/CI/provider/lockfile changes; forbidden are `apps/web/app/(workspace)/**`, `apps/web/app/[locale]/**`, `apps/web/proxy.ts`, callbacks/auth, backend, DB, RLS, credits, GPU, Blender, all `.engineering`, `.gef`, workflows and 7 existing WebP.

## Mandatory gates
**PRE-EXECUTION (fail-closed):** Re-read main Checkpoint/Source Hierarchy/D-153, current D-162 formal status, G1 frozen status, PRs #30/#76/#80 HEADs, path ownership and Work Order. Must have separately approved, source-valid `FRESH` Context Lock and independently admitted decision. Missing/changed -> STOP `BLOCKED_MISSING_ADMISSION` with no writes.

**INNER-LOOP:** run quick relevant code checks rather than repeated full builds for every cosmetic edit.

**FINAL EXACT HEAD:** un-cached production build, web typecheck, Biome, public Playwright, actual full set of legally required Work Order tests, relevant protected-root regression, exact-head GitHub security/quality checks. Real WorkOS provider session and tenant/RLS tests `NOT_RUN` unless true integration executed; do not mislabel fixture tests as live. Sonar false exclusions prohibited, no fake benchmarks/time gain. Demonstrate unchanged SSR root, no WorkOS/proxy edits, 24 working public paths, 7 WebP stills unchanged and test worker count. Independent code review, no self-merges.

**OUTPUT:** One DRAFT stacked PR, strict file inventory and per-lane proof, exact HEAD checks, test commands/exit codes, accessibility evidence and remaining P0/P1 and G0/G2/brand/legal/tenant gates. No Batch03.

## Approval register
| Role/gate | Evidence | State |
| --- | --- | --- |
| Owner, scope-limited off-main preparation | Explicit 2026-10-14 user instruction | **YES for preparation only** |
| Owner formal execution admission | Must approve exact WO/Context Lock, not inferred from preparation | **PENDING** |
| Independent engineering/security auditor | Need concrete review of source/critical conflicts | **PENDING** |
| D-162 source promotion | Separate audited PR required | **PENDING** |
| G1 interface freeze | Typed/route contract independently signed | **PENDING** |
| Fresh Context Lock | Candidate being drafted, cannot mark FRESH yet | **PENDING** |
| Protected main merge or public release | Explicitly denied by owner | **NO** |

**Current STOP:** `SPRYXEL_WEB_BATCH02_WORK_ORDER_CANDIDATE_READY_FOR_INDEPENDENT_ADMISSION`.

**Future authorized coding STOP:** `SPRYXEL_WEB_STATIC_BATCH_02_DRAFT_STACKED_PR_READY_FOR_CHATGPT_FIRST_REVIEW`.
