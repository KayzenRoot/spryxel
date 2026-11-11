# CODEX CLOUD | SPRYXEL-WEB-BATCH-02: Static UX, accessibility and 3-language polish

**Read before dispatch.** This is a targeted implementation prompt on top of the currently unmerged SSR correction. **Source-controlled task:** [issue #81](https://github.com/KayzenRoot/spryxel/issues/81), parent #54, technical SSR PR #80, public frontend PR #76.  
**Source commit, require exact live recheck:** `9e34e76ce8e451a47999cdd354921b5fed0c08c9`, `feat/web-b1-ssr-locale-01`.  
**Target branch:** `feat/web-static-batch-02-polish`, new isolated worktree.  
**Final PR base:** `feat/web-b1-ssr-locale-01`, **DRAFT STACKED PR**, no merge, no retarget to main.  
**STOP CONDITION:** `SPRYXEL_WEB_STATIC_BATCH_02_DRAFT_STACKED_PR_READY_FOR_CHATGPT_FIRST_REVIEW`.

## Goal

Complete **only frontend static presentation refinement** of the already-created 24 public pages in English, pt-BR, and es. Focus first on game asset creators: characters, sprites, mobs, game items, environments/maps, HUD/UI. Keep the same seven existing still WebP hero/category images for now, and preserve dark/light. Make the website more polished, keyboard accessible, truthful and responsive. Do **NOT** implement new business features, backend, payment, GPU inference, billing, AI asset generation workflows, contact backend, user registration, consent tracking, animation, Blender, 3D rendering, image motion, video generation, or a full logo reproduction. Exact official Digital Leaf asset #53, the G2 visual master #70, and legal/cookie launch approval are separate and not available to claim as already approved.

## Phase 0: mandatory source/governance preflight

1. Read `.engineering/SOURCE-HIERARCHY.md`, `.engineering/CHECKPOINT.json`, `.engineering/DECISIONS-LEDGER.md`, `AGENTS.md`, #81 and #54, PR #76 and PR #80, plus the current reviewed source ownership and Work Order/Context Lock procedure. Current canonical next stage still references WO-008 asset/jobs #30; website G0/G1/G2 (#63/#64/#70) are not fully approved for protected integration. **This prompt does not override a governance gate or admit the task itself**. Where required approval/Context Lock is missing, STOP with a concrete source-backed blocker and request an independent owner/auditor resolution, not a fake PASS.
2. Fetch actual GitHub PR #80. If HEAD is **not exactly** `9e34e76ce8e451a47999cdd354921b5fed0c08c9`, STOP and request a refreshed prompt. Confirm parent #76 is still `3dd79038d0cca379a5cd3db7ac09a153a3c5b0a7` and PR #80 is still stacked onto it. Do not force-update/merge/rebase parent PR branches.
3. Read actual files `apps/web/src/public-site/shell.tsx`, `apps/web/src/public-site/content.ts`, `apps/web/src/public-site/sections.tsx`, `apps/web/app/globals.css`, `apps/web/public-site.spec.ts`, `apps/web/app/[locale]/layout.tsx` and current public WebP paths. Create a fresh worktree and check clean status.
4. Before starting concurrent agents, verify that your actual Codex Cloud environment supports safe subagents. Use at most **three** workers only if supported; otherwise run sequentially. No agent can modify shared paths, no parallel writes to one branch, and don't invent tools or quote unmeasured speedups.

## Phase 1: three independent file-locked workers

| Lane | Exact exclusive write path | Objective |
| --- | --- | --- |
| C1: Public Chrome/UX | `apps/web/src/public-site/shell.tsx` | Improve keyboard/mobile navigation focus, menu semantics and accurate active state, theme switch labeling/persistence, locale switch clarity, footer usability. Preserve actual existing `/sign-in` AuthKit CTA and each public route; keep `LeafMark` **provisional**, never claim official brand fidelity. |
| C2: EN/PT-BR/ES Copy QA | `apps/web/src/public-site/content.ts` | Correct linguistic inconsistencies, complete typed-key parity, true labels/alt for existing seven still images, status "planned" vs real and game-creator-first messaging. Preserve type API, exact key shape and consolidated per-locale data (the SonarCloud 0% duplication refactor must NOT be undone). Legal/contact drafts stay disclaimers with no invented domain/controller/pricing or production consent claims. |
| C3: Responsive static visual CSS | `apps/web/app/globals.css` | Refine existing dark/light semantics, mobile layout, header/footer responsive spacing, readable type, contrast, focus, ~44px targets, long locales, subtle glass surface; preserve `@spryxel/ui/tokens.css` product semantics and all current class names. **No JS motion, Blender/WebGL/video, new animation keyframes, unnecessary dependencies, branding override, network trackers, auth changes or global theme token rewriting.** |

**Read-only to every worker:** all remaining files, especially `app/(workspace)/**`, `app/[locale]/layout.tsx`, `proxy.ts`, auth callbacks, content other than assigned file, `.engineering/`, `.github/`, `package.json`, lockfiles, secrets, backend providers, RLS/tenancy, asset/jobs, payments. If one change needs a second worker's path or an unapproved path, STOP that lane, make a tiny `CONTRACT_CHANGE_REQUEST` and hand to serial integrator. Class/property shared contracts are frozen at Phase 0, not silently changed by individual workers.

## Phase 2: serial integrator and tests (only after C1-C3 complete)

- Independently check that each lane edited only its authorized file. Bring results together in **one** bounded PR without overwriting any worker changes. Do not merge code into upstream #80/#76/main.
- Review semantic correctness of navigation and hidden mobile menu, keyboard accessibility, visible focus, meaningful alt, lang-sensitive copy, legal disclaimers and noindex, no broken link or misleading "available" label.
- **Integration-only writer:** `apps/web/public-site.spec.ts`. Add focused Playwright tests **where gaps actually exist** for keyboard navigation/mobile disclosure, theme persistence across multiple root layouts, accessible language switching, raw server initial `<html lang>` EN/pt-BR/es still correct, noindex on legal drafts, 24 URLs intact, 320/375/390/768/1024/1440/1920 responsive smoke, no horizontal scroll. Reuse existing assertions; don't generate huge snapshots just to satisfy test count. If a target browser isn't available, mark NOT_RUN instead of fake PASS.
- All photos are static existing WebP: keep seven images, their dimensions/alt in 3 locales and asset weight roughly 1.9MB intact. If original-brand fidelity is asked, issue a documented G2/#53 blocker, no improvised single-leaf->official replacement. Do not use stock watermarked art or pretend to have final image licensing receipts.
- For small CSS/copy edits use targeted fast checks during iteration; for **final exact HEAD**, run actual build uncached, affected TypeScript, Biome and the relevant full public browser tests. Original default public Playwright use of 1 worker is a fact, not permission to reduce concurrency to conceal races; note configured workers and reason.
- The protected `/`, `/projects`, `/account` and WorkOS proxy must remain untouched. Because the branch inherits PR #80 SSR-root migration, run affected protected routing/browser smoke as required by the corresponding Work Order; real WorkOS/session/tenant tests remain NOT_RUN unless actually executed with real integrations.
- Run existing GitHub required checks on the **final exact SHA**. Since stacked PRs may not trigger `pull_request` workflows filtered to base=main, if `workflow_dispatch` is needed explicitly show `event`, commit SHA, execution and conclusion, and do not misrepresent this as ordinary branch protection passing. Treat CodeRabbit "skipped" honestly.

## Phase 3: proof and draft stacked PR

1. Report exact source SHA, complete `git diff --stat`, each worker's exclusive touched file and who wrote it, owner-facing changes, actual test commands + exit codes/elapsed times/worker counts, security/CI contexts, visual screenshots if genuinely rendered, remaining accessibility concerns and G0/G1/G2/brand/legal blockers.
2. Push `feat/web-static-batch-02-polish` **without force-push** and open one **DRAFT** PR targeting `feat/web-b1-ssr-locale-01`. If head/base differs from the verified state, STOP and provide a read-only report for re-planning. No direct main PR, no auto merge and no source-hierarchy/Checkpoint edits.
3. Do not start Batch03 or implement backend/Blender/motion/credits/auth providers. ChatGPT will review the new PR and fix GitHub-feasible defects before any additional Codex cycle.

**Completion means static presentation is implemented in an isolated reviewable PR, NOT that Spryxel production is released.**

**STOP CONDITION:** `SPRYXEL_WEB_STATIC_BATCH_02_DRAFT_STACKED_PR_READY_FOR_CHATGPT_FIRST_REVIEW`.
