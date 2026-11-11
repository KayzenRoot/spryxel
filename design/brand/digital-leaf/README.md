# Spryxel Digital Leaf — owner-referenced brand pack

> Status: two-leaf vector DRAFT; approved visual direction, NOT final pixel-exact source / not authorized for public use. Issue #51 and PMOD-01 #35.
> Separate branch: design/spryxel-brand-001-digital-leaf; main, WO-008 and PR #30 remain untouched.

## Supplied source of truth
The owner supplied a 1179×775 Digital Leaf brand board in conversation dated 2026-10-13. The image is **not committed as a repo binary**. The board is the visual benchmark; this repo's hand-drawn SVGs are design **candidates**, not exact artwork replicas.
Two asymmetrical luminous glass leaves share a lower point: small amber/yellow/lime left leaf and large lime/cyan/turquoise right leaf. Brand name: **Spryxel**. Tagline: **CREATE. PLAY. BUILD.**
Board demonstrates dark/light, horizontal logo, app icon, favicon, video/marketing. Suggested fonts: Exo 2/Exo 2 Bold, Inter/Sora, Orbitron heading. Do not bundle font files.

## Canonical reference palette (brand only, pending sampling confirmation)
- Lime #A3FF00; cyan #00E5FF; orange #FF8A00; pink #FF2D55; violet #7B2DFF; mint #00FFC8; yellow #FFD400.
- Product UI canon under .engineering/UI-UX.md currently uses spectral-violet and electric-teal. Brand direction does NOT overwrite approved UI tokens without reviewed Decision Delta.

## Versioned deliverables
- sources/digital-leaf-symbol.svg: transparent dual-leaf COLOR DRAFT replacing prior incorrect single leaf
- sources/digital-leaf-symbol-mono-dark.svg: monochrome dark symbol for light backgrounds
- sources/digital-leaf-symbol-mono-light.svg: monochrome light symbol for dark backgrounds
- tokens/brand-colors.json: screenshot-referenced color chips and tagline, NOT UI tokens
- exports/README.md: planned PNG, WebP, favicon ICO/SVG and social sizes (raster files not yet committed)
- social/launch-copy.md: EN/pt-BR/es first-post and profile bio drafts; unreviewed

## Release gates
- [ ] Compare two-leaf vectors with original board; refine proportions, neon/glass facets, vein highlights; owner approves final symbol.
- [ ] Produce outlined-letter Spryxel wordmark, two-leaf x detail, lockups horizontal/stacked; audit licenses.
- [ ] Derive PNG/WebP/ICO in actual transparent/dark/light/mono variants; inspect 16/32/48px plus full-res, color, alpha and contrast.
- [ ] Add polished X/Twitter 1500x500 cover, square profile avatar, OG 1200x630, reusable media templates.
- [ ] Review copyright, trademark, social handle/domain availability and all launch copy against actual working features.
- [ ] Prepare high resolution board reference image in repo after an authorized binary transfer, not a made-up GitHub URL.

Design review is independent of WO-008; merging final art requires normal safeguards. STOP CONDITION: SPRYXEL_BRAND_001_DESIGN_PACK_READY_FOR_REVIEW.
