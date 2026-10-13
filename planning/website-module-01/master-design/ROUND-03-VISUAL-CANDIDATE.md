# Spryxel Module 01 | Master Design Round 03 visual candidates

> **Owner design REVIEW CANDIDATE / NOT FROZEN / NOT A DEPLOYABLE SITE / NO MERGE.** [#70](https://github.com/KayzenRoot/spryxel/issues/70) / [PR #75](https://github.com/KayzenRoot/spryxel/pull/75).
> Scope: faithful historical directions **Option 07, 3D FOCADO EM WORLDS** for public homepage; **Digital Leaf Option 05** owner original logo. The exact logo recreation remains tracked at #53 / draft PR #52.

## What has actually been generated
Four consistent, **full-page reference screenshots** from one HTML/CSS reference template. These files were created and measured in the conversation's `spryxel-master-design-round03-review-pack.zip`, **NOT committed as binary assets in this GitHub PR**.

| Reference asset | Rendered pixels | SHA256 |
| --- | ---: | --- |
| `master-home-desktop-dark.png` | 1440 x 6637 | `aede9fb9aeae9e0d5fe1a36c8d92ba129671c4c3164cad2225e302d29ef1b626` |
| `master-home-desktop-light.png` | 1440 x 6637 | `2d85f6c4d801131df017f57cd894a5e0cb6221f48e4a4e65596b593b7008d7b9` |
| `master-home-mobile-dark.png` | 391 x 7391 | `42f504fd8c4f18cfd3ea7ecb0d34e51dca4371e6bcefd53a84603e45ae087aff` |
| `master-home-mobile-light.png` | 391 x 7391 | `23dfea7c9e5d4e80b9531c37056ca91545747f5921b74f8fc616ada7598aa50f` |
| `master-home.html` | 16941 UTF-8 bytes | `0f5ab5185d54ba8245c96c6f75ebef413bded24e3ec61e46d0ed5077ad44d8a5` |
| `master-home.css` | 23411 UTF-8 bytes | `5577dfacd152153a3f6d3a5883f6aa91a9ef975f5094555951f05a49d381213c` |

The conversation ZIP also contains source artwork, the two unchanged original owner-approved **direction** images, HTML/CSS, PNGs of proposed interaction states, provenance/hashes and reproducible local Playwright render/check scripts. GitHub cannot fetch those binaries by the ZIP's local path; until explicitly imported via an authorized process, **do not invent GitHub-hosted PNG/HTML URLs**.

## Visual review after real raster inspection
- Original **Digital Leaf** board: `IMG_9281.jpeg` SHA256 `ccea6a42e1787b8a2162019ba07a800ca28274bfa6f2f4d74faf4dec870652aa`; this has **not** been fully faithfully outlined/vectorized in final source. The HTML mock contains an explicitly provisional derived leaf image, **not** the approved logo master.
- Selected landing source board: `painel_de_marca_e_interfaces_spryxel.png` SHA256 `8e86b97c86b30dd9f155fe9165abefef28cbd8a32b52512b6c9c5decb29a1a70`, selected tile bottom row, second column: **7 3D FOCADO EM WORLDS**.
- Retains visual atmosphere of fantasy islands, glossy dark-first gaming design and bright lime/cyan accents, but makes **Pixel/2D game asset creation** obvious above and immediately below fold, with Characters, Sprites, Mobs, Maps, Items and UI/HUD.
- Desktop and mobile dark/light mockups show hero, six category cards, planned creator steps, conceptual examples, creator profiles, FAQ, prelaunch CTAs and full footer. Editorial English is a reference only; three-locale typed implementation remains A6 #72.

## Browser preview QA (not real app acceptance)
Executed a static local Chromium/Playwright reference suite against the generated HTML/CSS at **seven CSS viewport widths**: 320, 375, 390, 768, 1024, 1440, 1920. PASS for:
- no horizontal document overflow;
- no broken in-page anchor links;
- six asset category cards, six FAQ accordion entries, four footer columns;
- illustrative theme toggle, sign-in preview dialog, cookie settings preview dialog, responsive menu.
Render QA separately confirmed screenshot sizes, asset loading and full-page document heights for the four variants.
**These checks do not validate production app routes, WorkOS integration, real consent persistence/tracker blocking, WCAG 2.2 AA, 3-language runtime functionality, legal content, real GPU/provider features or shipped capabilities.** No host CI run validates these binary artifacts while they remain outside GitHub.

## Known gaps / visual and product correctness
1. **P1 BEFORE DESIGN MASTER FREEZE:** owner visual approval of all four full-height images; compare brand mark pixel-level fidelity against exact original #53. Existing concept leaf in render is not final. Archive exact master references inside repo with original bytes and SHA check.
2. **P1 BEFORE PUBLIC LAUNCH:** actual qualified-reviewed Terms/Privacy/Cookie Policy, verified publisher/controller/contact, working consent controls; reference footer deliberately marks unpublished legal routes inactive.
3. **P1 BEFORE REAL AUTH CTA:** use existing WorkOS/AuthKit actual route and preserve tenant boundary; dialog is a demonstrative mock, no authentication.
4. **P2 DESIGN POLISH:** refine very small mobile card body typography, complete EN/pt-BR/es responsive copy QA, improve decorative layering and image resolution where approved without obscuring readability.
5. **Performance/accessibility:** measure real app bundle, fonts, contrast, reduced motion, WebGL/static fallback and screen reader once implemented. Decorative 3D art is **not** proof of shipped 3D creation.

## Proposed immediate next steps (no Codex required for planning)
1. Owner reviews the four visuals and approves or requests narrow alterations (this is the **G2 direction gate**, not an implementation Work Order).
2. Import binary ZIP assets with verified hashes to a dedicated design reference folder through an explicitly supported repository upload workflow; do not inject a single 15 MB ZIP into the app runtime.
3. Upon design confirmation, make a versioned design token/component/layout manifest and exact referenced asset inventory to guide parallel A1–A7 WOs.
4. G0 sequencing ADR #63 and G1 contract #64 remain necessary before any executable G2 or website CodeX admission because current canonical Checkpoint D-153 still prioritizes WO-008.
5. Keep [PR #75](https://github.com/KayzenRoot/spryxel/pull/75) **DRAFT**, no merge/no checkpoint promotion, no unsupported production claims.

**Round03 planning STOP:** `SPRYXEL_WEB_G2_ROUND_03_VISUALS_READY_FOR_OWNER_REVIEW`.
