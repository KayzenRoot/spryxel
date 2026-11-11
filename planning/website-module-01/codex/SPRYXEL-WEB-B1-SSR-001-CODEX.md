# CODEX WORK ORDER: SPRYXEL-WEB-B1-SSR-001

**Repository:** `KayzenRoot/spryxel`  
**Tracking issue:** https://github.com/KayzenRoot/spryxel/issues/79  
**Source:** exact HEAD of static frontend [PR #76](https://github.com/KayzenRoot/spryxel/pull/76) at creation: `3dd79038d0cca379a5cd3db7ac09a153a3c5b0a7`.  
**Target branch:** `feat/web-b1-ssr-locale-01` **based exclusively on this PR #76 HEAD**.  
**Result PR:** Open a **DRAFT STACKED PR** with `base=feat/public-static-frontend-batch-01`. Do not merge either PR.  
**Execution intent:** user requested frontend-first and continued the G1 SSR correction. This permits a **separate isolated implementation and tests**, NOT release, canonical Checkpoint promotion, source hierarchy changes, protected merge or new app features.  
**STOP:** `SPRYXEL_WEB_B1_SSR_LANG_STACKED_DRAFT_PR_READY_FOR_CHATGPT_REVIEW`.

## Your mission

Make the FIRST server-rendered root `<html lang>` correct for the three public locales **en, pt-BR and es**, without changing the protected WorkOS workspace. Fix the real problem: `apps/web/app/layout.tsx` hardcodes `lang="en"`; the existing `apps/web/app/[locale]/layout.tsx` currently produces only `<div lang={locale}>`. The browser bootstrap mutates document language AFTER HTML delivery. The existing six Playwright cases check the nested/hydrated result, not the raw SSR root.

This is deliberately the next SINGLE focused Codex job after successful Batch01/ReviewR3. **Do not rebuild the homepage or rerun Sonar correction. No Batch02, image generation, Blender/motion, backend, ledger/credits, payments or crypto.** Seven static WebP assets and existing public content stay untouched.

## Phase 0: hard preflight before edits

1. Read canonical `.engineering/CHECKPOINT.json`, `.engineering/SOURCE-HIERARCHY.md`, `.engineering/DECISIONS-LEDGER.md`, `AGENTS.md`; read B1 issue #69, G1 #64, new issue #79, PR #76, and current Work Order/Context Lock governance. If a protected source requires an explicit independent approval not present, **fail closed and report**; do not silently mutate canonical documents.
2. `git fetch origin`, verify source commit `3dd79038d0cca379a5cd3db7ac09a153a3c5b0a7` exists and is still PR #76 HEAD. If the head advanced, **STOP and ask ChatGPT to refresh this input rather than applying an unreviewed diff**.
3. Work in a **new isolated worktree and branch**, clean working tree. NEVER edit PR #76 branch directly and NEVER move `main`. Existing HIGH_ASSURANCE WO-008 PR #30 is out of scope; do not alter its files, history, or Context Lock.
4. Confirm current file list, original auth/proxy behavior and Next.js 16 version. Report preflight to the issue/PR. Read official framework references:
   - https://nextjs.org/docs/app/api-reference/file-conventions/route-groups
   - https://nextjs.org/docs/app/guides/internationalization
   Route groups do not appear in URLs; multiple root layouts cause full-page navigation; `app/[locale]/layout.tsx` can itself be the marketing ROOT if there is no top-level `app/layout.tsx`.

## Phase 1: minimal implementation, no architecture expansion

Prefer this narrow tested solution rather than the 9-page marketing migration proposed in the earlier Round09 map:

- Convert existing `apps/web/app/[locale]/layout.tsx` into a genuine **root layout** with `<html lang={validatedLocale} data-theme="dark" suppressHydrationWarning>`, `<body>`, the original theme bootstrap where needed, current `public-site` wrapper, header/footer, skip link and metadata semantics. Validate locale strictly to `en`, `pt-BR`, `es`; disallow arbitrary lang input. Retain existing `generateStaticParams` and any appropriate Next root-specific metadata.
- Move the EXISTING top-level `apps/web/app/layout.tsx` to `apps/web/app/(workspace)/layout.tsx` and adjust its import of `../globals.css`; preserve its `<html lang="en">`, theme bootstrap and workspace metadata.
- Move the five existing protected pages/not-found into `(workspace)` while **preserving exact URL paths**:
  `app/page.tsx` → `app/(workspace)/page.tsx`;
  `app/account/page.tsx` → `app/(workspace)/account/page.tsx`;
  `app/projects/page.tsx` → `app/(workspace)/projects/page.tsx`;
  `app/projects/[projectId]/page.tsx` → `app/(workspace)/projects/[projectId]/page.tsx`;
  `app/projects/[projectId]/not-found.tsx` → `app/(workspace)/projects/[projectId]/not-found.tsx`.
  Fix relative imports exactly, preserving authorization queries, RLS, route return paths and component behavior.
- Do not move `apps/web/app/components/`, `apps/web/src/auth/`, `apps/web/src/projects/`, existing `app/[locale]/page.tsx`, `app/[locale]/[slug]/page.tsx`, `app/sign-in/route.ts`, `app/sign-out/route.ts`, or `app/auth/callback/route.ts`. Do not modify `apps/web/proxy.ts`, AuthKit config, protected redirect contracts, DB, RLS, CI, `.engineering/`, GEF, root lockfile or package dependencies. If the solution genuinely requires one forbidden security file, STOP with minimal evidence and explicit review request instead of editing it.
- Keep `apps/web/app/globals.css` in its current place and imported exactly once per root as appropriate; avoid per-route duplicate global CSS or missing theme script. Do not introduce duplicate Next routes or a new custom auth provider.
- DO NOT silently change `/` into a public landing: current `/` must remain the WorkOS-protected Home/Command Center. No unrequested `/app` cutover. Public localized URLs remain `/en`, `/pt-BR`, `/es` and their current 7 subpages each.

If a simpler solution exists **without editing proxy or trusting spoofable request headers**, you may choose it **only** after demonstrating SSR-correct original response, no cookie/cache leak, preserved WorkOS, and lower change surface. Document the reason.

## Phase 2: tests REQUIRED

**First add a regression test that FAILS on the original PR #76 baseline**, using an actual HTTP response and no reliance on hydration:
```ts
for (const locale of ['en', 'pt-BR', 'es']) {
  const response = await page.request.get(`/${locale}`);
  const html = await response.text();
  expect(html).toMatch(new RegExp(`<html\\b[^>]*\\blang=["']${locale}["']`, 'i'));
}
```
Adapt regex to actual HTML attribute syntax, but *read the response source rather than client DOM*; also test at least one `/pt-BR/faq` and `/es/privacy` response, including noindex for privacy. Preserve the six existing tests unchanged unless genuinely needed.

**Required native, uncached validation at the isolated final HEAD:**
- `npm run build -- --force` (record whether 11 tasks and the public routes still generate, no cache shortcut).
- `npm run typecheck --workspace=@spryxel/web`.
- Biome lint and format on actual modified paths.
- `npm exec -- playwright test apps/web/public-site.spec.ts` (now 7+ tests), default configured worker policy; document worker number.
- Existing protected workspace route tests and actual WorkOS boundary checks appropriate to the changed root layouts; where real RLS/DB/auth integration isn't available, mark `NOT_RUN` explicitly, rather than implying that browser smoke proves tenant security.
- Anonymous `/`, `/projects`, `/account` protect as before; ensure `/sign-in`/callback work with real approved test config. Check /en, /pt-BR, /es and all 24 public URLs, locale switching and theme preference across root boundaries, mobile basic smoke.
- Required GitHub security/validation/Sonar checks must PASS at EXACT resulting commit. Never weaken CI, Sonar exclusions or use `workers=1` merely to hide concurrency races.

Fail closed on wrong server root locale, route ambiguity, WorkOS regression, new secrets or unbounded scope.

## Phase 3: deliver separate stacked DRAFT PR and evidence

1. Commit all relevant edits to `feat/web-b1-ssr-locale-01` from PR #76 HEAD; push safely **without force-push**.
2. Open **draft stacked PR with base `feat/public-static-frontend-batch-01`**, not `main`. Make the PR description clear this depends on #76 and does **NOT** authorize either merge. If GitHub denies a stacked PR or the baseline moved, STOP with branch and evidence; don't automatically retarget to `main`.
3. Publish `git diff --stat`, source SHA, final HEAD, files changed, exact commands/exit codes/worker count, sanitized logs, raw SSR responses, proof original root language regression, protected route/callback results, test coverage limits, Sonar/CodeRabbit states and any independent security review blocker. Attach to issue #79 / stacked PR.
4. **STOP. No merge, no Checkpoint/GEF/ADR edits, no CI settings changes, no Batch02.** ChatGPT will review first and correct feasible GitHub issues, then decide next steps with owner.

**Stop condition:** `SPRYXEL_WEB_B1_SSR_LANG_STACKED_DRAFT_PR_READY_FOR_CHATGPT_REVIEW`.
