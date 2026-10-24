# Spryxel Master Design — source image audit v0.1

**Status: HISTORICAL REFERENCE VERIFIED; FINAL FULL-PAGE MASTER NOT YET APPROVED OR COMMITTED.**
**Issue:** #70 Master Design, #53 faithful Digital Leaf, parent #54 and planning PR #75.
**Date:** 2026-10-13. This document records verified attached image bytes and owner selection; it does not admit an implementation Work Order, change a canonical decision, or release any design.

## EXACT APPROVAL REFERENCES AND ORIGINALS
1. **BRAND / owner-selected logo Option 05 “Digital Leaf”**. Exact image file **`IMG_9281.jpeg`**, 1179×775 JPEG, 226234 bytes, SHA-256 `ccea6a42e1787b8a2162019ba07a800ca28274bfa6f2f4d74faf4dec870652aa`. Two glass-crystalline asymmetric neon leaves: small left warm gold/lime, larger right lime/cyan/turquoise, Spryxel wordmark, **CREATE. PLAY. BUILD.** Board contains dark/light applications, alternate icons and color chips. This is approved **visual direction**; don't claim the draft SVGs in PR #52 are exact vector masters. The original owner artifact is preserved unchanged in the session reference package.
2. **PUBLIC LANDING / owner-selected Option 07 “3D FOCADO EM WORLDS”**. Exact source image **`painel_de_marca_e_interfaces_spryxel.png`**, 1312×1199 PNG, 2439648 bytes, SHA-256 `8e86b97c86b30dd9f155fe9165abefef28cbd8a32b52512b6c9c5decb29a1a70`. The desired **Option 07** is **bottom row, second column** of this board; it has a public landing illustration (floating-world island) and a creator-studio dashboard mockup. The selected tile is archived as `spryxel-approved-option07-source-crop.png` (265×432), SHA-256 `8b5eb30cef12bb69927177b6c11e1e2843e725b66af85fb1c8f40707017ad6d5`; crop is a **derived visual pointer**, not a true larger-resolution master.
3. **NUMBERING AMBIGUITY WARNING:** other generated boards ALSO have an "07" (e.g. Split Hero or Storytelling). Do **not** match by numeric option alone. Match the **exact original board filename + label `7 3D FOCADO EM WORLDS` + visual comparison**. Wrong board = incorrect design.
4. Additional boards `galeria_futurista_de_homepages_spryxel.png`, `painel_de_branding_e_interfaces_spryxel.png`, `painel_de_marca_spryxel_e_conceitos_web.png`, etc., are concept galleries, **not evidence of separate approvals**.
5. Generated full-height homepage proposals (`a_tall_ultra_detailed_dark_themed_landing_page_w.png` and latest `a_detailed_cinematic_high_quality_website_homepa.png`) are **DRAFT, NOT APPROVED AS MASTER**. They contain invented pricing tiers, mock statistics, unsupported AI 3D/animation/GPU claims, possible external integration logos, unauthorised trial/newsletter, fictitious copyright and/or invented testimonial assertions. **Never feed their text, pricing, legal identity or partner badges into product implementation.** Their art can inspire a sketch only after rights review.

## SOURCE STORAGE VERIFICATION
- Connected repository `KayzenRoot/spryxel` `main` full Git tree readback: **no PNG/JPEG/WebP/SVG raster/vector image asset files** at the inspected HEAD `08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`.
- PR #75 draft planning branch at inspected HEAD `5c662b4ed0ac80e6ea23cf2f0e3ca420314b3e04`: **no image binaries**, only markdown/json planning.
- PR #52 draft brand branch: **three draft SVG candidates**, not the exact logo reference or full board.
- The original exact image bytes, crop, audit montage and manifest are available in the **conversation's `spryxel-master-reference-pack-v01.zip` artifact** (not an official GitHub attachment/URL). The ZIP's image assets are **NOT** committed to GitHub yet. On future import, place under `design/brand/digital-leaf/references/` (original logo) and `design/website/reference/` (original homepage board + selected crop), verify exact SHA-256 values above. Never invent a GitHub link or quietly substitute a downscaled image for the original.

## DESIGN-FREEZE RECOMMENDATION (OWNER DELEGATED CHOICE)
**Preserve Option 07 3D Worlds as the hero/environment art, but show actual game-asset categories immediately in the first viewport**, rather than leading with an attractive fantasy environment and hiding what the product is for. This is an evolution of selected 07, not a new separate concept:
- Desktop header: original Digital Leaf logo slot; `Features | How It Works | Asset Types | Resources` with EN/pt-BR/es, dark/light and truthful WorkOS sign-in.
- Hero, left: proposed headline **`The creative home for game assets.`**; eyebrow original **`CREATE. PLAY. BUILD.`**; accurate prelaunch subcopy focused on **Pixel/2D**. CTA `Explore game assets` to real `#asset-types`; `How it works` to actual `#workflow`. Sign Up only if existing WorkOS works; never "Start free" or fabricate unlimited GPU/credits.
- Hero, right: floating island with little game-creator hints and static/fallback visual, no guarantee of 3D generation.
- Above fold/below first CTA: cards for **Characters, Sprites & Animations (only describe shipped assets), Mobs & Creatures, Maps/Tilesets, Items/Props, UI/HUD** with shipped/planned labels based on verifiable scope. No false customer, games engines integration or prices.
- Full long-page plan: same World 07 art DNA, asset families → how-it-works → licensed example gallery only after approval → FAQ → final truthful CTA → complete legal/cookies/footer. EN canonical; PT-BR, es all pages. Mobile and light still required.
- Do not change canonical UX semantic spectral-violet/electric-teal tokens by fiat. Brand lime/cyan/amber are visual-direction references and need reviewed token reconciliation.

## Exact future master deliverables / approval gates
- [ ] `master-home-desktop-dark.png`, complete hero-to-footer in long-form high-resolution.
- [ ] `master-home-desktop-light.png`, identical section hierarchy.
- [ ] `master-home-mobile-dark.png` and `master-home-mobile-light.png`, same content and compliant navigation.
- [ ] Header states (EN/pt-BR/es, theme, WorkOS sign-in, consent customization/reopen), plus token/spacing/font and asset provenance specs.
- [ ] Brand fidelity #53 approved from exact original; don't quietly swap owner-selected leaves for other variants.
- [ ] Confirm actual rights for art, brand and any UI mockup; validate factual public claims against admitted shipped implementation.
- [ ] Qualified counsel review of actual privacy/cookies/terms/controller/contact before public launch.
- [ ] Owner explicitly approves final full-page master (approval of *direction* does not mean full-page screenshots already approved).

**Audit conclusion:** two owner-selected design **directions** found; **zero finalized full-page Master Design image files verified as approved**. Keep G2 status `DESIGN_REFERENCE_CONFIRMED / MASTER_FREEZE_PENDING`, NO MERGE.
