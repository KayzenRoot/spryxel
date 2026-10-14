
# Round 08 / G1: Next.js 16 SSR locale architecture review

**STATUS: RECOMMENDED TECHNICAL OPTION, NOT ADMITTED, NOT IMPLEMENTED.** Issue #64; parent #54; draft PR #75.

Official Next.js documentation (2026):
- https://nextjs.org/docs/app/api-reference/file-conventions/layout
- https://nextjs.org/docs/app/api-reference/file-conventions/route-groups
- https://nextjs.org/docs/app/guides/internationalization

## Verified source conflict
- Current apps/web/app/layout.tsx emits **html lang="en" unconditionally**, includes styles/theme bootstrap. A nested public [locale]/layout.tsx below that layout cannot replace html lang safely.
- apps/web/app/page.tsx is protected Home/Command Center with requireWebSession() at /.
- apps/web/proxy.ts WorkOS authkitProxy matcher protects /, /projects, /account and has guarded E2E-only bypass.
- apps/web/app/sign-in/route.ts already uses WorkOS AuthKit and redirects to /account.
- Therefore even adding public /en, /pt-BR and /es while maintaining a fixed EN root requires a reviewed SSR-language approach. The Round06 phrase "additive, no-risk" must not imply zero root-layout security risk.

## Alternatives / proposed decision
**A (recommended pending isolated architecture proof): Multiple Next.js root layouts via route groups.**
Relocate the existing authenticated URL routes to a route group such as app/(workspace)/ (URLs remain unchanged, including protected /), and create a separate app/(marketing)/[locale]/layout.tsx as the PUBLIC ROOT layout, where validated params.locale sets the server html lang. Omit shared app/layout.tsx only as part of a complete atomic reviewed restructure. Route groups never add a URL segment. Crossing root layouts causes full-page reload. Enumerate ALL current page and route handler files (projects, account, sign-in/out, auth callbacks, errors/metadata) before relocation; prevent duplicate paths. Keep original WorkOS proxy and theme behavior unless a reviewed change is unavoidable.

**B (fallback experiment only): Trusted server-derived locale in current shared root.**
Potentially derive language from validated request routing/headers while avoiding file moves. BUT must prove trusted input, request isolation, Next.js 16 cache behavior, proxy/matcher safety, and SSR correctness. Do not choose without native tests and security audit.

**C (reject for public release): Visible translation only, keeping html lang=en.**
Client-only post-hydration DOM update or visual locale badge does not provide correct initial HTML language and fails launch accessibility/i18n acceptance.

## Recommended G1/B1 release-gated file architecture (concept only)
- WORKSPACE root group: own root html, same current protected / and /projects and /account URLs, existing theme bootstrap and protected navigation.
- MARKETING [locale] root: own server-rendered html lang from strict allowlist en, pt-BR, es; public /en, /pt-BR, /es and nested legal/FAQ/feature templates.
- URL / remains WorkOS protected in phase A, NOT automatically public. Optional future public root cutover is a SEPARATELY ADMITTED HIGH_ASSURANCE Work Order with rollback.
- Root shared contracts need G1 freeze before A1..A7; B1 is sole editor of shared App Router layout, WorkOS proxy, routing and SSR locale files.
- Route groups must not define two pages resolving to the same URL. Build tool must verify all imports and the remaining static metadata links.

## Native acceptance before ANY public locale release
1. next build PASS with pinned Next16, server-rendered html lang exactly en, pt-BR, es for three GET public routes; invalid locales 404/explicit safe redirect.
2. E2E browser anonymous access to public pages, anonymous BLOCK to /, /projects and /account; authenticated sessions and callback redirects remain correct.
3. Real cross-tenant RLS and auth regression suite when governed by relevant Work Order; E2E test-only bypass stays test-only.
4. Hreflang, canonical URLs, locale switching, cookie/consent persistence and CSS/theme across full-page layout navigation.
5. Protected fallback plan to revert staged root layout restructure without DB/data changes.
6. All current required GitHub checks at exact final HEAD, independent HIGH_ASSURANCE audit and owner authorization.

**Status:** Option A has official framework support, but it is not yet proven safe for THIS repository. No changes to app, proxy, WorkOS, GEF, checkpoint or canonical decisions were made.

**STOP:** SPRYXEL_WEB_G1_NEXT16_ROOT_LAYOUT_REVIEW_READY
