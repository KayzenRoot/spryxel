# Spryxel Homepage Master Design Contract — G2 (PROPOSED)

> Visual master contract for Module 01, NOT a finished reference image, Figma file, vector logo, or approval.
> Owner's previously selected homepage **Option 07: 3D Worlds**. Owner's brand board **Option 05: Digital Leaf**, exact two luminous leaves, tagline **CREATE. PLAY. BUILD.** These are distinct decisions. Formal reference files and final brand asset must be reviewed through #53/#70.

## North star
A creative professional game-asset production workspace with an immersive **fantasy floating-islands world** in its opening scene, yet practical, scannable sections and developer-grade credibility. The atmosphere is luxurious/dark/gaming, but never distracts from concise value proposition, search-friendly copy, clear product status, sign-in and legal/consent.

The primary customer is a **game creator**; V1 actual focus Pixel and 2D assets. 3D-island environments can appear as illustration, not unverified claims that the product already generates worlds, 3D models, video, crypto payments or assets without price limits. A future Creator/Marketing studio is subject to release admission.

## Design reference deliverables to be created in G2 (not yet generated/published)
1. `master-home-desktop-dark.png`: **full-page screenshot** 1440 CSS pixels wide, with the entire homepage from top navigation through every section and complete footer. Annotation manifest lists section IDs, spacing, typography and image source.
2. `master-home-desktop-light.png`: same sections/content in complete light treatment, contrast tested.
3. `master-home-mobile-dark.png`: full-page 390px mobile view showing reflow and navigation/menu/CTA.
4. `master-home-mobile-light.png`: full-page 390px light view and mobile footer.
5. `master-header-footer-states.png`: menu open/closed, focus, locale, cookie preferences opened/closed, theme variants, login action state.
6. `master-asset-map.md`: for each screenshot asset, pointer to original source, editable file, safe export, provenance/license, optimized file, fallback and owner approval status. **No pretend external image ownership.**
7. Image design must match the **exact Digital Leaf** owner board for the logo area; older provisional vectors #52 are NOT exact matches. Show original approved board as a referenced asset until #53 final approved, do not falsely trace without review.

Avoid mockup-generated tiny illegible text as implementation source; HTML and localized content come from typed copy/dictionaries. The full-page master is a **visual target**; accessibility and interaction specifications govern behavior.

## Page architecture from top to footer
| Order | Section ID | Content / visual anchor | CTA / states |
|---:|---|---|---|
| 0 | `site-header` | Transparent-tinted glass nav above 3D world; Spryxel two-leaf logo slot; Product, Features, How It Works, Resources/FAQ, Sign In; language and theme controls | keyboard accessible, mobile drawer with close, skip to content; CTA must lead to actual auth or truthful Coming Soon |
| 1 | `hero` | Huge atmospheric floating-islands game world with an authored 3D/WebGL enhancement only where efficient, otherwise licensed pre-render | headline about helping creators design Pixel/2D game assets; secondary story/preview; never promise free credits or launch status without evidence |
| 2 | `creator-segments` | Solo/indie developers, pixel artists, small studios: concise cards with clear workflow jobs | accessible hover/focus, cards link to real routes |
| 3 | `asset-families` | Characters, mobs, sprites/animations, environments, props/items, maps/tilesets and UI/HUD families, current capabilities labeled accurately | preview galleries only from owned/licensed data, distinguish planned from available |
| 4 | `workflow` | Project → style/DNA → create → QA → export storytelling, professional stages visualized, output/cost not invented | mark roadmap stages that have not shipped |
| 5 | `showcase` | Examples of real approved work with provenance; if unavailable, replace with honest illustrations labeled concept; no fake customer cases | lightbox/cards and alt text; can hide until verified |
| 6 | `compatibility` | Planned developer workflows Godot/Unity / engine-neutral formats, never promise shipped plugins unless tested | documentation link when available |
| 7 | `trust` | Safe cross-tenant design, repeatable workflow, no unsubstantiated trust badges; accessible non-hype messaging | no invented certifications, statistics, awards |
| 8 | `faq` | 5–8 real FAQ answers: current status, games/asset types, supported languages, account, pricing not yet available, rights, support | accessible details, works without JS if possible |
| 9 | `final-cta` | Premium forest/astral vista echoing hero, modest Get Updates / Sign In CTA depending real status | verified link; no fake waitlist capture |
| 10 | `site-footer` | Multi-column sitemap: Product; Creators/Resources; Company & Help; Terms/Privacy/Cookies and Cookie Settings; socials only after confirmed | no dead links, valid contact/controller identity before publish, copyright and EN/pt-BR/es |

## Style primitives (proposals to reconcile with UI canon)
- Dark backdrop: graphite near-black `#081319`, charcoal/slate panel layers, balanced opaque card surfaces even when decorative glass effect.
- Brand accents sampled from owner board: lime `#A3FF00`, cyan `#00E5FF`, mint `#00FFC8`, warm amber `#FF8A00`, yellow `#FFD400`, occasional violet `#7B2DFF`. **These are brand-board references, not an authorized replacement for spectral-violet/electric-teal canonical UI tokens.**
- Typography: modern highly readable sans (Sora/Inter class), Orbitron/Exo 2 optionally for controlled titles only. No font binaries checked in without rights/license; correct fallback metrics tested.
- Surface: glass navigation and small accents; dense text controls use opaque backgrounds, visible borders and high contrast.
- Shapes: corner radius system 12/16/24px depending semantic component; restrained glow/bloom behind illustration and neon CTA only.
- Responsive: 320/375/390, 768, 1024/1280/1440/1920; keep 44px comfortable touch targets and sensible long-page layout.
- Motion: gentle parallax only if meaningful and smooth; fully accessible `prefers-reduced-motion` static fallback, pause or disable interactive animation, handle WebGL unavailable/context loss and low-end mobile.
- Performance objective: static image first, progressive WebGL only after profiling. Treat LCP <=2.5s, INP <=200ms, CLS <=0.1 as **targets** subject to field measurement, not as guaranteed site metrics.

## UX contracts that images cannot substitute for
- Locale switch respects current valid route and translates navigation, legal content, metadata, error/loading states.
- Cookie banner offers equally discoverable accept/reject nonessential/customize, opt-in enforcement where required, withdrawal via footer at any point. Actual lawfulness requires qualified legal review.
- Correct theme persistence and SSR behavior (avoid flash/hydration mismatch); focus and screen-reader support.
- Links/routes, Form interactions, auth and analytics require actual verified real destinations. An image cannot prove working login, privacy compliance, SEO or keyboard support.
- Footer included on **every** approved reference master and implemented public route.
- Accessibility target WCAG 2.2 AA verified in code and manual checks, not merely claimed from the artwork.

## Review / sign-off and STOP
1. Owner first selects and approves **one** of the homepage references (07 is currently directional favorite). Refine Master Design, then mark final page hierarchy/colors/branding/components as owner-approved for the G2 contract.
2. Reconcile any clashes with canonical product UX tokens, route architecture and existing WorkOS integration. Version design decision delta; no unreviewed new dependencies.
3. Bind approved reference file paths, hashes, license/provenance and mobile/light variants to G2 before A1–A7 code work begins. A draft without these can guide discussion, **not** gate acceptance.
4. No merge, deployment or copy of reference-only invented product claims into live page.
**STOP:** `SPRYXEL_WEB_G2_MASTER_DESIGN_SPEC_READY_FOR_OWNER_REVIEW` (proposal only).
