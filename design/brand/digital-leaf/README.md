# Spryxel Digital Leaf — brand source pack (DRAFT)

> **DESIGN CANDIDATE / NOT APPROVED FOR PUBLIC PRODUCTION USE**  
> Parent: [SPRYXEL-BRAND-001 / issue #51](https://github.com/KayzenRoot/spryxel/issues/51); see also PMOD-01 #35.  
> This branch is isolated from WO-008/PR #30 and the protected `main`.

## Identity direction
- **Spryxel** is the product name. **Digital Leaf** is the selected logo *direction* (option 05), never the hexagon/portal direction.
- Express creativity, growth and connected game-asset production with a translucent, digital leaf.
- Color direction: vivid lime and turquoise/teal, dark-first, fully viable on light backgrounds.
- A 3D/glass treatment is **presentation only**. Keep a clean, robust flat mark for favicons, merchandise, avatars and monochrome reproduction.
- This draft is a *new editable interpretation* of the verbal description. The original user-selected visual reference is not supplied in this repository, so **fidelity to that exact prior image is unverified**.

## Versioned folder layout
```
design/brand/digital-leaf/
  README.md                 design/provenance/status/QA
  sources/
    digital-leaf-symbol.svg
    digital-leaf-symbol-mono-dark.svg
    digital-leaf-symbol-mono-light.svg
  tokens/
    brand-colors.json      candidate brand palette, not app UI tokens
  exports/
    README.md              raster, favicon and social export targets / QA
  social/
    launch-copy.md         early-launch messaging (EN, pt-BR, es)
```

## Relationship to the product design system
Canonical product UX currently specifies graphite/slate foundations, spectral-violet primary and electric-teal secondary in `.engineering/UI-UX.md`. The lime/turquoise *brand* palette here does **not** override those approved tokens. A later separately-reviewed Decision Delta may reconcile the logo and the application design system.

## Usage and rights
- These SVGs are clean, self-contained vector source candidates (no scripts, remote calls, font files or external image embeds).
- Brand art is created here as original repository design work, with author/owner approval and pre-launch trademark/name/handle clearance still required.
- Do not treat concept colors, typography, mark dimensions or public launch claims as frozen.
- Use explicit backgrounds behind white/black mono candidates; do not ship the glossy mark as a monochrome replacement.

## Required approval checks
- [ ] Compare candidate against the actual user-selected **Digital Leaf** reference and approve/revise.
- [ ] Create and approve *wordmark* / horizontal and vertical lockups with outlined vector typography and optical kerning.
- [ ] Check small-size readability at 16/32/48 px, safe area, minimum width, pixel rendering, contrast on both themes.
- [ ] Export PNG/WebP and ICO/favicon / app icons and validate dimensions, alpha channel and metadata.
- [ ] Approve social templates (X/Twitter avatar/header, Open Graph, future channels).
- [ ] Approve EN/pt-BR/es copy and review screenshots/claimed capabilities against verified product state.
- [ ] Record logo source, revision, licenses, no external visual infringement, trademark/name/handle checks before publicity.

**Stop condition:** `SPRYXEL_BRAND_001_DESIGN_PACK_READY_FOR_REVIEW`, not "production approved".