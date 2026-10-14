# WEB-BATCH02-G1 — Exact UI/interface contract, FREEZE CANDIDATE

**STATUS: TECHNICALLY REVIEWED CANDIDATE / NOT NORMATIVE-FROZEN / ADMISSION PENDING.**
Issue #64; owner narrow off-main static approval dated 2026-10-14; Work Order issue #81; G0 proposed D-162. No code changed in this governance PR.

## Baseline / route grammar
**Read-only code source**: PR #80 `feat/web-b1-ssr-locale-01@9e34e76ce8e451a47999cdd354921b5fed0c08c9`, stacked on PR #76 `3dd79038d0cca379a5cd3db7ac09a153a3c5b0a7`. Re-read at final admission and STOP on SHA drift.

Actual localized 24 route URLs: 3 locales (`en`, `pt-BR`, `es`) multiplied by:
```text
/{locale}
/{locale}/features
/{locale}/how-it-works
/{locale}/faq
/{locale}/contact
/{locale}/terms
/{locale}/privacy
/{locale}/cookies
```
**Critical reconciliation:** Older Round04/Round09 route candidates used `/{locale}/legal/{slug}`, but existing #76/#80 code uses `/{locale}/{slug}`. This exception freezes **existing behavior for static UI polish only**, not a product-level irreversible SEO decision. Never quietly redirect/rename before separate G1/site publication approval.

### G1 live interfaces to PRESERVE, no implementation of new ones
- `apps/web/src/public-site/content.ts`: existing TypeScript `PublicDictionary` shape, typed keys and consolidated English/pt-BR/es structures. Change strings only; do not broaden app contract or recreate per-locale duplication (Sonar 0% new-code duplicate on #76).
- `apps/web/src/public-site/shell.tsx`: existing Header/Footer/locale/theme components and genuine WorkOS `/sign-in` navigation. Keep the `LeafMark` as **provisional**, not owner-approved double-leaf Digital Leaf.
- `apps/web/app/globals.css`: marketing classes under `.public-site`; semantic design tokens continue to derive from `@spryxel/ui/tokens.css`; no new animations, WebGL, Blender, video, loaders, global root CSS semantics rewrite.
- `apps/web/public-site.spec.ts`: sole **serial integration writer** after C1/C2/C3; add only meaningful smoke/regressions. Preserve raw SSR first-response `html lang` from PR #80, noindex legal/contact behavior, 24 routes and cross-root theme.
- `apps/web/app/[locale]/layout.tsx`: read-only existing Next16 **public root** with raw response `<html lang=` correct for locales; `apps/web/app/(workspace)/layout.tsx` is read-only **protected root**. Do not change either in Batch02. Proxy/WorkOS, API, RLS, session, token ownership stays unchanged.

## Exact file ownership and no-collision rule
| Lane | Only writable source file | Current Git blob SHA at #80 |
| --- | --- | --- |
| C1 | `apps/web/src/public-site/shell.tsx` | `1595ece93227b28d6d246c89c8936a9807fac8d5` |
| C2 | `apps/web/src/public-site/content.ts` | `83acf3702e3b78f87c88ad4d8de57229905aa1a6` |
| C3 | `apps/web/app/globals.css` | `fa74f66d3e466080588a3d5fbf18d9595e8ada17` |
| Integration (AFTER all above) | `apps/web/public-site.spec.ts` | `8913322b377bbc303cae0d949be7644bcf10cb4a` |
| Read-only root | `apps/web/app/[locale]/layout.tsx` | `c500658fcb4bb6bba008c6017edcc5c0e6fcfda2` |

**No worker may edit a second worker's file, plus no worker may edit `apps/web/app/**` except C3's existing `globals.css` and the serial integrator's spec.** Protect `proxy.ts`, login callbacks, business routes, all backend, DB/RLS, dependencies, GitHub CI, Source Pack and secrets. Unexpected changed source SHA or overlap => STOP.

## G2 split for this limited batch
Owner has authorized static frontend first, and specifically postponed Blender/motion. G2 faithful final Digital Leaf logo, final art provenance and final Master Design screenshot approvals **are release/publication gates**, not a reason to require generating 3D motion during this CSS/keyboard/copy-only lane. The exact exception to postpone G2 for **coding** itself still requires an independent engineering/governance approval alongside proposed D-162. No claim that existing illustrations are the final official art.
The 7 static WebP must remain unchanged in this batch.

## Risk/acceptance limits
- UI semantics, keyboard focus, mobile sizes and screenreader labeling must remain functional across all 3 locales; no fake links, misleading product availability or plans.
- At final exact HEAD test the actual Next16 uncached build, web typecheck, changed-file Biome, public Playwright, impact-scoped protected route checks, and exact required CI/checks; mark non-run real WorkOS/RLS honestly as NOT_RUN. No downgrading HIGH_ASSURANCE in inherited PR #80.
- No launch, auth, route root cutover, payments, backend inference/GPUs, animation/Blender, marketing tracking or legal finalization.
- Any G1 interface change request sends lane to STOP rather than silently widening source writes.

## Freeze checkboxes
- [x] Source-code readback and immutable SHA scope documented.
- [x] Owner **preparation scope** approved.
- [ ] G0 canonical normative sequencing exception independently audited and promoted.
- [ ] G1 independent interface-review signature / scope freeze recorded by permitted reviewer.
- [ ] New admitted Work Order + FRESH Context Lock, not a candidate only.
- [ ] Off-main test/merge boundaries verified on actual branch.
- [ ] Final site publishing/master brand/legal security acceptance (separate from this slice).

**Stop:** `SPRYXEL_WEB_BATCH02_G1_SCOPE_CANDIDATE_READY_FOR_INDEPENDENT_AUDIT`.
