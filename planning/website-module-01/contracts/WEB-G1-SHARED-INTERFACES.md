# WEB-G1: frozen-interface candidate for seven independent public-site builders

> **PROPOSED CONTRACT v0.2, NOT FROZEN, NO IMPLEMENTATION AUTHORIZED.**
> Issue #64, parent #54 and G0 ADR proposal #63. Round05 is only an owner-review candidate; exact logo #53 pending.
> Design system authority: existing `.engineering/UX-DESIGN-SYSTEM.md` / `.engineering/UI-UX.md`, not the prototype's hardcoded neon CSS.

## Source check and critical existing state
Verified at `main` baseline `08bd429bb924e26f7d5266ee9b556cc8da2c8b8c` during planning (must refresh at admission):
- `apps/web/app/page.tsx` has `requireWebSession()` and displays Home / Command Center at `/`.
- `apps/web/proxy.ts` uses `authkitProxy` and protects `/`, `/projects`, `/account`, with an explicitly controlled E2E test bypass only in configured tests.
- `apps/web/app/sign-in/route.ts` uses existing WorkOS `getSignInUrl({returnTo:'/account'})`. `/auth/callback` is already present.
- `apps/web/app/layout.tsx` currently renders `<html lang="en">` **unconditionally** and inserts theme-bootstrap. Proper server-rendered `lang="pt-BR"` / `lang="es"` for public locales must be solved by B1 safely; merely changing client DOM after hydration is not sufficient.
- `apps/web/app/components/global-shell.tsx` links the authenticated Home to `/`; any cutover of root must update all links/tests.
- `apps/web/app/globals.css` imports canonical `@spryxel/ui/tokens.css`. Marketing CSS must namespace its own **approved aliases** rather than modifying product/studio semantic tokens.
- Root workspace packages already contain Next.js 16, React 19 and `@workos-inc/authkit-nextjs` pins; no new login provider required.

## Route and HTML-language policy
Machine-readable companion: `WEB-G1-PUBLIC-ROUTES.plan.json`. Proposed new public URLs in Stage A: `/en`, `/pt-BR`, `/es`; localized `/features`, `/how-it-works`, `/faq`, `/contact`, `/legal/terms`, `/legal/privacy`, `/legal/cookies` nested under each locale. **24 candidate URLs, NOT 24 already implemented pages.**

**Stage A safe additive:** keep current protected `/` as user workspace, introduce public localized page subtree only after G0/G1/G2 authorizations. No agent edits proxy, root layout or WorkOS configuration independently. Sign-in links to existing `/sign-in` route if functional; no fake form or free credits.
**Stage B optional root cutover:** explicit, independently reviewed migration `/` → public marketing and `/app` or another approved authenticated home, with proxy, all hrefs, auth callback/returnTo as actually necessary, default locale redirect, test and rollback evidence. This path is **HIGH_ASSURANCE** because it changes auth and route boundaries, and must not be smuggled into an ordinary landing UI PR.

**Open architecture gate (P1 before localized deployment):** current single `app/layout.tsx` hardcodes `lang=en`. B1 must propose one **SSR-correct, testable** solution before we can claim multilingual accessibility:
- Multiple root layouts in isolated route groups is an option but requires careful existing-app migration and loss of shared root, and should only be admitted with high-assurance source review.
- A scoped server-side locale propagation mechanism is another option, but must be verified against Next.js 16 request isolation/caching and cannot trust unvalidated incoming header values.
- Client-only changing `document.documentElement.lang` after hydration is **not accepted** as proof for server HTML language; nor is falsely claiming the screenshot locale picker implements routing.
G1 freezes desired behavior and ownership, NOT a guess at a working Next.js implementation.

## Shared component contract: one owner per writer
- A1 (#65) owns `apps/web/components/public-landing/`, with the Round04 hero, asset-family, workflow, showcase, audiences, CTA props; no common layout/router editing.
- A2 (#66) owns `apps/web/components/public-consent/` plus isolated `apps/web/content/legal/`; strictly necessary vs optional consent, equal accept/reject/customize and reopen; real publisher/controller/legal signoff gates.
- A3 (#67) owns `apps/web/components/public-hero-art/` plus `design/website/3d-worlds/`; static licensed art and optional progressive visual, not reproducing Digital Leaf logo.
- A4 (#68) owns `apps/web/components/public-seo/` plus `apps/web/content/public-support/`; head/meta component and FAQ; `robots`, `sitemap`, canonical global routes only in B1.
- A5 (#71) owns `apps/web/components/public-chrome/`; Header/Footer, locale/theme switch slots, verified links and cookie reopening.
- A6 (#72) **SOLE WRITER** to `apps/web/content/public-locales/`; EN, pt-BR and es strings/typed namespace, alt copy and SEO/localized error-state labels. G1 alone freezes key shape before parallel work; others may **READ** schema but not edit dictionary.
- A7 (#73) owns `apps/web/components/public-auth-entry/`; adapter to existing `/sign-in`, gated until actual route and callback validated. AuthKit tokens and backend remain untouched.
- B1 (#69) alone changes `apps/web/app/**` shared routing/layout, root CSS and theme/locale wiring after independent A1–A7 outputs pass; independently reviewed and security-lane if auth boundary touched.
- B2 (#74) owns final independent QA/evidence/legal launch decision, not code implementation in parallel.

**Important:** ownership paths are *proposed*, not code changes. Agent contracts live at `master-design/ROUND-04-COMPONENT-CONTRACTS.plan.json` (19 contracts) and the 12-task plan manifest. G1 must reconcile exact filesystem/current HEAD before creating executable Context Locks; symlinks, reexports and shared transitive code also count as conflict.

## Frozen schemas that should precede parallel coding
- Public route keys stable: `home`, `features`, `how-it-works`, `faq`, `contact`, `terms`, `privacy`, `cookies`. Stage A root and Stage B root mapping are **distinct**.
- Section IDs stable from Round02 inventory: `site-header`, `hero`, `asset-types`, `how-it-works`, `showcase`, `creator-types`, `quality-rights`, `faq`, `final-cta`, `site-footer`.
- Public dictionary keys are proposed in `master-design/ROUND-02-COPY-DRAFT.json`: 28 grouped content keys shared by three locales; future legal/consent/accessibility keys need A6 ownership and counsel fact review.
- Header/Footer/CTA/consent visual interface slots and states are proposed in Round04 component JSON. **No fake interactive control**: a rendered link must have a real destination, a rendered button must have an actual action.
- Dark/light public role aliases from Round04 tokens must be mapped to canonical UX roles. Marketing lime/cyan remains a decorative accent until reviewed role assignment. Round05 corrected `--faint` light #526b73 reference on white.
- Original Digital Leaf logo reference **must** be imported and owner-approved (issue #53) before public launch. Screenshots are not source vectors.

## SEO, trust and legal boundaries
- Each published locale has consistent server `html lang`, localized `title/description`, `hreflang` URLs, `canonical`, valid sitemap and noindex for placeholders/unapproved legal pages.
- x-default root behavior is deferred until Stage B review; avoid pointing search to protected `/` as if public.
- Contact, controller and social profiles must be verified. Do not ship `href="#"` as functional footer, invented legal entity, pricing, payment, verified claims, testimonials or licensed asset ownership.
- Cookies: optional tracking disabled until lawful opt-in where required, with consent withdrawal and link to real policy; **design mock doesn't do this**.

## Verification before G1 sign-off
1. Resolve G0 sequence Decision Delta; inspect exact current `main`/PR #30 and branch protection on admission.
2. Confirm whether production `/` root migration is a separate B1 HIGH_ASSURANCE WO and define rollback.
3. Decide SSR-correct html-language approach with independent security architecture review.
4. Demonstrate all 24 route contracts have unique paths, no collisions with existing auth/project routes; verify G1 route manifest machine-check.
5. Owner approves Digital Leaf accurate final import and Round05 design screenshots; reconcile UX and marketing semantics.
6. Approve per-agent exclusively owned file paths, typed locale keys, reference hash manifests and rights.
7. Future WO adds real tests and current exact-HEAD evidence, no silent GEF/checkpoint edits, no automatic merge.

**STOP for this proposed G1 planning artifact:** `SPRYXEL_WEB_G1_ROUTE_I18N_AUTH_BOUNDARY_CONTRACT_READY_FOR_REVIEW`.
