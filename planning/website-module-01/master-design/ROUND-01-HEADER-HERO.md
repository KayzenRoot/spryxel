# MASTER DESIGN | Round 01: Header + Hero (OWNER REVIEW)

> **STATUS: DESIGN CANDIDATE / NOT FROZEN / NOT IMPLEMENTED.**
> Issue [#70](https://github.com/KayzenRoot/spryxel/issues/70), Module 01 [#54](https://github.com/KayzenRoot/spryxel/issues/54), planning DRAFT PR #75.
> Owner-selected public visual baseline: homepage **Option 07 / 3D Worlds**; brand **Option 05 / Digital Leaf**, two glass-crystalline leaves. Image reference approved direction, exact reproduction is still open [#53](https://github.com/KayzenRoot/spryxel/issues/53). Never substitute the old single-leaf SVG or a newly imagined logo for the approved source.
> Round 01 scope ONLY: visible first viewport, header/navigation, first CTAs and initial trust framing. Later rounds address asset families, workflows, showcase, FAQ, final CTA and long footer. The full-page master still must include the footer.

## 1. Visual thesis
**"A gateway to game worlds being built"**, not an anonymous AI SaaS dashboard. Dark graphite/blue-black atmospheric canvas with a cinematic floating-islands / fantasy world illustration, hints of pixel sprites and props, luminous lime/cyan/gold as focal points, carefully bounded glass navigation. Serious readable UI typography; avoid a generic neon game-casino aesthetic.

The atmospheric world is **illustrative**: do not advertise launched 3D generation, paid GPU workflows, creators' rights certifications, speed multipliers or any live functionality not yet independently demonstrated in V1.

## 2. Desktop header contract (design proposal)
- Canvas/reference viewport: 1440 x 900 for first fold, extend to the bottom in master-page revision. Content max width 1280px, horizontal gutters 64px at 1440; at 1024 use 32px; at 390 use 16px.
- Header: top 24px inset floating nav, height ~78px including border, rounded ~20px with lightly frosted dark glass. Dark first; light mode must have clear readable opaque surfaces.
- Left: **reusable Digital Leaf approved symbol+Spryxel wordmark**. In mockups use a clearly marked BRAND PLACEHOLDER anchored to the owner's reference image if exact vector not available. Visual source #53, do not invent a different two-leaf master.
- Center nav order: **Features | How It Works | Asset Types | Resources**. Include **Showcase** only when artwork is verified/licensed, otherwise hide in live routing.
- Right controls: **EN/pt-BR/es locale**, dark/light theme switch, **Sign In** link to existing functioning WorkOS/AuthKit, primary CTA **Explore Spryxel** pointing to factual `#asset-types` or a verified in-product route. Registration as a CTA only when functioning; otherwise honest `Coming Soon` with no fake form.
- Keyboard tab/focus ring, skip link, contrast, hover, active and closed/open states defined; no inaccessible hover-only popovers.

## 3. Hero: Option 07 refined, proposed split composition
- At 1440: two columns, ~45% text and ~55% art; 72–96px breathing room, hero height 660–780px excluding header. Artwork expands into cinematic frame on the right and visually connects to the next content strip; avoid clipping CTA/readable typography.
- Text eyebrow: **CREATE. PLAY. BUILD.** (exact brand slogan).
- Main headline option A **"The creative home for game assets."** (clear and factual, subject to prelaunch product-copy status review).
- Alternative headline B **"Every great game starts with a world."** (more cinematic, less product-specific).
- Alternative headline C **"Imagine the world. Shape the assets."** (creator-first, avoid implying unavailable generators).
- Proposed subhead EN: **"A game-creator workspace taking shape around pixel art and 2D assets, from characters and sprites to environments and props."** (clearly in development, no misleading ability claims).
- Proposed primary CTA EN: **"Explore the vision"** -> `#asset-types` (reliable in-page anchor). Secondary CTA: **"How it works"** -> `#workflow` (route/section exists before release).
- Optional subtle status label **"In development"**; never invented testimonials, user counts, priced credits, fictitious integrations, or `Start free` when unverified.
- Below CTA: THREE short asset categories with visual glyphs **Characters / Environments / Sprites & Items**, not a fake growth statistics bar.

## 4. Floating-world visual art spec
- One principal large levitating rocky island with stylized game-world grass, small mossy stone ruins, glimmering cyan waterfalls, scattered stylized game props and a few pixel-shape details; one or two depth-layered satellite islands.
- A subtly luminous turquoise energy river/ring and restrained lime highlights, with localized gold/orange specular warmth referring to owner Digital Leaf colors. No crypto coins, no fake logos/certificates, no generic robot heads, no photoreal portraits.
- Use a static premium art image as default CSS/background with accurate `alt` or decorative presentation. Optional Drei/Three.js/WebGL as progressive enhancement only if performance/rights allow, with reduced-motion/mobile/WebGL-disabled fully static fallback.
- Proposed hero illustration asset filename: `design/website/reference/3d-worlds-hero-round-01-CONCEPT.png`; **not committed / not final** until a confirmed asset is available. Full-page master dark/light/mobile images are still required by G2 in later rounds.

## 5. Visual foundations (candidate reference values; not official UI tokens)
- Atmosphere background `#081319` (pending contrast and reconciliation to product canonical graphite); surfaces `#122029`, light `#F7FAFC`; text white-ish `#F6FAFC`.
- Brand board accents ONLY as candidate refs: lime `#A3FF00`, cyan `#00E5FF`, amber `#FF8A00`, optional mint `#00FFC8`. No wholesale substitution of approved D-094 spectral-violet/electric-teal UI components absent a separately approved Decision Delta.
- Hero H1 desktop target 64–76px, line-height 1.02–1.1, mobile 36–44px; body desktop 17–20px, mobile 16–18px; tight readable navigation 14–15px. Exo 2/Sora/Inter as font **candidates subject to license/actual availability**; zero font binaries embedded.
- Glass only on hero nav and supporting cards. Opaque or semi-opaque contrast-backed controls. Max background bloom away from H1, WCAG 2.2 AA targeted, no important info in glowing color alone.

## 6. Mobile and light mode behavior
- <768px: header brand symbol/name + language button + menu + theme, no giant 3D scene blocking text; primary CTA visible in first scroll. Hero layout stacks text then art, illustration ~260–360px max height with authored crop.
- Reduced motion: no autoplay/camera/orbit; consistent focus and screen-reader semantics.
- Light: layered pale backgrounds, dark typography, island art remapped for contrast rather than simply inverting; gold/green highlights not used as long-form text.
- The future full-page master must show legal/cookie UI states and complete footer, not merely hero.

## 7. Reusable design export contract
Round 01 preview art is a **mockup/reference**, not original user artwork and not a working landing page. Reusable repo assets require actual source provenance, sanitized scalable SVGs, original raster/scene files and deterministic PNG/WebP outputs, true transparent alpha where applicable. The correct approved logo will come from #53 and only then from a versioned shared brand directory, not from traced concept-image lettering.

## 8. Round 01 review gates
- [ ] Owner approves **header/hero composition** and one EN headline (A/B/C).
- [ ] Owner reviews actual visual preview at desktop dark; requests revisions before declaring MASTER DESIGN FROZEN.
- [ ] Header/footer/CTA semantics and bilingual/trilingual UX matched to G1.
- [ ] No visual approximation of Digital Leaf presented as approved final master.
- [ ] Reference ownership, license and potential branding collisions recorded.
- [ ] Mobile/light variants and entire full-page master reserved for subsequent rounds.
- [ ] No changes to actual app, canonical checkpoint, WO-008 or PR #30.

**STOP CONDITION (planning Round 01):** `SPRYXEL_WEB_G2_ROUND_01_HEADER_HERO_READY_FOR_OWNER_REVIEW`.
