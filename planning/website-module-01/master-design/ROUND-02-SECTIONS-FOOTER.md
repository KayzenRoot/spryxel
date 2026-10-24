# MASTER DESIGN | Round 02 — Asset Explorer through Footer

> **OWNER REVIEW / NOT FROZEN / NO IMPLEMENTATION AUTHORIZATION.**
> Parent: [#70](https://github.com/KayzenRoot/spryxel/issues/70) / [#54](https://github.com/KayzenRoot/spryxel/issues/54); draft PR #75. Read Round 01 and `REFERENCE-AUDIT-v01.md` first.
> True chosen visual: **Option 07 "3D FOCADO EM WORLDS"**, bottom-row second tile on `painel_de_marca_e_interfaces_spryxel.png`. Brand reference: owner's exact double-leaf **Digital Leaf Option 05** `IMG_9281.jpeg`. This Round does **not** declare either current draft SVGs or generated fantasy art to be final masters.

## Decision / positioning
**Keep floating-world art as the cinematic visual thread, but make Pixel/2D game-asset families the first tangible promise.** The 3D island is an illustration, not proof that Spryxel can already generate 3D worlds. All copy must distinguish `AVAILABLE` from `PLANNED` based on verified release receipts; if proof is absent, use `IN DEVELOPMENT`, not unconditional claims or fake previews.

**Design direction:** premium gaming aesthetic with charcoal/night-blue foundations, dark glass panels for decorative framing, bright lime `#A3FF00`, cyan `#00E5FF`, amber `#FF8A00` only as brand-accent candidates. Canonical spectral-violet/electric-teal UI tokens cannot be overwritten before formally approved design delta. Clear WCAG 2.2 AA contrast, first-class light theme, small-screen static image fallback and reduced-motion treatment.

## Full homepage section stack and vertical rhythm (desktop 1440px reference)
The numbers are **layout targets**, not fixed heights; content length/translations and accessibility take precedence.
| Position | ID / section | Layout and visual contract | Semantic purpose |
| ---: | --- | --- | --- |
| 0 | `site-header` + `hero` (Round01) | floating accessible navigation; 45% copy / 55% floating-world art, initial ~660–780px hero | trustworthy description and CTA to a working anchor |
| 1 | `asset-types` **Asset Explorer** | high-contrast six-tile responsive grid (3x2 desktop, 2x3 tablet, 1x6 mobile), preview icon/mini asset sample, clear category name and current status | **immediate proof of game-asset focus**, visible at/near bottom first fold |
| 2 | `how-it-works` | five-step horizontally scrolling but keyboard navigable timeline on wide screen; vertical steps on mobile. Optional dotted fantasy trail behind cards | explain intended creator workflow, label unreleased steps |
| 3 | `showcase` **Creative Gallery** | 2–3 large art cards plus 3 smaller thumbnails, owned/licensed references only. Artwork may depict fantasy scenes, never claim fabricated generated examples | inspire without pretending image generation is shipped |
| 4 | `creator-types` | three creator personas with concise value cards, modern minimal sprites/tiles badges and no fictional people photos | indie developer, game artist, small studio |
| 5 | `quality-rights` | calm opaque content block, careful trust narrative, reusable asset-organization benefits | no fabricated certifications, commercial licenses, engine compatibility or performance guarantees |
| 6 | `faq` | accessible native-details accordion / clear focus; 6–8 reviewed Q&A, no invented contact, launch date, pricing, license terms or output-format guarantees | answer questions honestly |
| 7 | `final-cta` | restrained second floating-island art treatment, short statement, CTA to approved real target | motivate without deceptive sign-up promise |
| 8 | `site-footer` | complete responsive sitemap columns and transparent legal/cookie identity | working destinations, cookie settings reopen, EN/pt-BR/es, real copyright identity after verification |

### 1. Asset Explorer, the commercial core
**Headline:** `Everything your game needs, in one creative workspace.`
**Lead:** `Explore the asset workflows Spryxel is being built around.` (prelaunch wording; subject to translation and validation by A6)
**Cards:** `Characters & NPCs`, `Sprites & Pixel Art`, `Mobs & Creatures`, `Maps & Tilesets`, `Items & Props`, `UI & HUD`. Avoid claiming full animation, 3D mesh, seamless tiles or export engines without actual tests.
- A1 owns layout and cards; A6 owns canonical localized copy; A3 supplies referenced artwork; A4 owns SEO semantics and real section anchor inventory.
- Card anatomy: artwork thumbnail or icon with documented provenance, title, <=2 lines description, `In development` status for unverified work, and real detail link only if published. No dead clickable UI.
- Desktop 3 columns, min card height ~240px, radius 20px, meaningful card differentiation, glow low intensity. Mobile 1 column at 320px, 2 columns only when text remains readable.
- A subtle layered mist/stone texture bridges cinematic hero and practical card grid; **no giant 3D canvas** behind cards, because it hurts reading and performance.

### 2. How it Works, five honest stages
`Project` → `Style reference` → `Create` → `Review & refine` → `Export`.
- Workflow description is a **product roadmap illustration** until each step has verified implementation receipts.
- Iconography: folder/project → palette/seed → sprite stars → loupe/shield → export; these are decorative references and must correspond to true semantics in tooltips and a11y labels.
- For public copy say `Our planned workflow` or `The workflow we're building`, never `Generate unlimited assets in seconds`.
- Optional static connector lines; mobile vertical list, no animated dragging or autoplay required.

### 3. Gallery, asset inspiration without misleading claims
- **Concept showcase** is allowed as labeled conceptual art, provided the images are original/owned or verifiably licensed. Do NOT label generated illustrative art `Made with Spryxel` or use fictional testimonials.
- Selection theme: `Pixel hero roster`, `Environment tile study`, `Fantasy prop collection`, optionally `UI inventory sample`.
- Place two larger cards with clear visual hierarchy; metadata shows `Concept illustration`, not nonexistent model/version/download format.
- If rights/verified source are unavailable, use a quiet `Showcase coming soon` editorial panel or omit the section from published navigation and sitemap. No empty carousels.

### 4. Who it's For
Three clear personas:
- `Indie developers`: build visual consistency across small projects.
- `Pixel artists`: explore asset concepts and style direction.
- `Small studios`: organize asset production with a structured workflow.
Avoid `50k+ creators`, `3M generated assets`, `trusted worldwide`, `Unity/Godot certified` or implied sponsorships without documentation.

### 5. Quality and Responsible Creation
Headline option: `Built for deliberate creative workflows.`
Copy focuses on plans for project organization and repeatable style; do not promise nonexistent export rights, instant speed, protected IP, enterprise security/compliance attestations or guaranteed GPU cost.
No green checkmarks beside unverified features. Prefer `Principles` over `Why you can trust us` while still in development.

### 6. FAQ (editable content slot owned by A6)
- What is Spryxel? — an in-development creative workspace for game assets.
- Who is it for? — indie developers, pixel artists and small game studios.
- Which assets are in scope? — Pixel/2D characters, sprites, environments, maps, props and UI assets are the initial focus; exact available features depend on release status.
- Does Spryxel create 3D models today? — do not claim that; 3D Worlds shown here is a visual design motif, not a confirmed released generator.
- How do I sign in? — link to actual existing WorkOS sign-in only if public flow is working; otherwise truthfully describe access status.
- Can I export directly into Godot/Unity? — no compatibility claim until validated.
- How much does it cost? — `Pricing has not been announced.` (if still true at launch), never fabricated tiers or credits.
- Where can I read the privacy and cookie policies? — real linked routes with legal review and working preference controls.

### 7. Final CTA
**Headline:** `Your next game deserves a world of possibilities.` **Subhead:** `Follow the development of Spryxel, a workspace designed for game creators.`
- Primary CTA proposal `Explore asset types` → `#asset-types` (guaranteed in-page anchor).
- Secondary `How it works` → `#how-it-works` (guaranteed in-page anchor).
- `Sign in` in header/footer only with verified WorkOS route. Do NOT build an unapproved mailing list, subscribe flow, signup capture or promise free credits.

### 8. Footer: professional, truthful, accessible
**Four clusters** plus bottom legal bar:
- **Product:** Asset Types → `#asset-types`; How It Works → `#how-it-works`; Features → approved route; Showcase → approved/verified section only.
- **Resources:** FAQ → published locale route/`#faq`; Help/Docs only when real approved destinations exist.
- **Company:** About only if approved content, Contact only to real verified destination, available official social profiles only after handle ownership verified.
- **Legal:** Terms → `/{locale}/legal/terms`; Privacy → `/{locale}/legal/privacy`; Cookie Policy → `/{locale}/legal/cookies`; `Cookie Settings` is an accessible button reopening consent preferences.
- Bottom: confirmed legal controller/company name and copyright year dynamically based on real launch, locale+theme controls, accessibility or status only where maintained. **No invented email/phone/address/domain, bogus compliance badges or fake social links.**
- All links work in EN, pt-BR, es; footer must remain present in mobile/light screenshots. 320px single-column logical reading order, focus and 44px touch targets.

## Public legal / cookies UX, explicitly not optional
- Cookie banner: `Accept optional`, `Reject optional`, `Customize`, accessible modal/panel (if necessary), categories separated between strictly necessary and optional. Reopen via footer at any time. **No loading optional trackers before valid consent where required**.
- Terms/Privacy/Cookies pages must have real reviewed text about actual controller, processors, retention, user rights, jurisdiction and tracking inventory. Design placeholder is **not ready for publication**; qualified legal review is a separate launch gate.
- No deceptive dark patterns: equal prominence of accept/reject, no mandatory opt-in to navigate or hidden settings.

## English, Portuguese and Spanish
EN canonical page structure and content slots drive both pt-BR and es. Scope: section headings, cards, CTA, FAQ, alt text, metadata, errors, cookie choices, footer and legal routes. A6 is sole owner of public locale dictionaries; A1/A2/A4/A5/A7 may **consume** but not independently rewrite shared keys. Direction-specific mockup text in images is illustrative, not localized implementation.

## Accessibility and performance acceptance (design targets)
- Keyboard/focus path header → main → cards → FAQ → CTA → footer, skip link, semantic landmarks; images either descriptive with meaningful alt or CSS decorative.
- Motion: subtle entry transitions only, honor `prefers-reduced-motion`, opt out of parallax on phones. No animated 3D backdrop under FAQ/consent text.
- LCP target <=2.5s, INP <=200ms, CLS <=0.1 as **unverified benchmarks**; static hero fallback before WebGL, compression and responsive sources. No pretend measured scores.
- Desktop 1440 reference responsive reflow at 1024, 768, 390, 375, 320. Light mode specifically sampled with actual contrast/foreground checks before freeze.

## Module 01 implementation ownership, no clashes (planning)
- **A1 #65**: asset category, workflow, personas, gallery, final-CTA presentation components.
- **A2 #66**: legal copy/review gates and cookie preference components, not root layout.
- **A3 #67**: 3D Worlds static/licensed art and optional progressive hero, not Digital Leaf master.
- **A4 #68**: SEO/FAQ/support semantics + route metadata, not shared root files.
- **A5 #71**: reusable nav and footer components + cookie-settings slot, not global layout.
- **A6 #72**: EN/pt-BR/es text keys and assertions. **EXCLUSIVE WRITER**.
- **A7 #73**: existing WorkOS-bound public auth CTA adapter, not WorkOS security.
- **B1 #69**: shared integration/root layout, links, locale and consent behavior.
- **B2 #74**: final evidence/a11y/legal/brand launch go-no-go.
All seven independent candidate lanes need **G0 sequencing approval, G1 frozen route/i18n ownership, G2 owner-approved master design**, actual path collision preflight and formal admitted Work Orders before Codex execution. Existing WO-008 #29/PR #30 remains excluded.

## Round 02 review choices and stop
- [ ] Owner agrees to keep 3D Worlds imagery but lead with Pixel/2D game assets and a noncommercial CTA.
- [ ] Owner approves section order and density of the above 8 post-hero sections.
- [ ] Owner selects proposed headline/copy direction and authorizes next full-page dark/light/mobile visual reference production.
- [ ] Original Digital Leaf logo #53 remains **fidelity pending**, not a replaced generated logo.
- [ ] No fictitious 3D/video/marketing/pricing/testimonial/engine/stats copied into implementation.
- [ ] Footer, cookie consent/legal, theme/locale and honest sign-in routing all in release gate.
- [ ] Future visual master asset files may be generated in Round 03; neither this spec nor a concept render = production approval.

**STOP CONDITION (planning):** `SPRYXEL_WEB_G2_ROUND_02_SECTIONS_FOOTER_READY_FOR_OWNER_REVIEW`.
