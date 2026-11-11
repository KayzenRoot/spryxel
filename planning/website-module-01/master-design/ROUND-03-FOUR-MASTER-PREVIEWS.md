# Master Design Round 03 — four complete responsive homepage references

**Status:** `OWNER_REVIEW_CANDIDATE / NOT FROZEN / NOT ADMITTED / NO MERGE`
**Primary:** [Issue #70](https://github.com/KayzenRoot/spryxel/issues/70), [Module #54](https://github.com/KayzenRoot/spryxel/issues/54), [PR #75](https://github.com/KayzenRoot/spryxel/pull/75).
**Delivery:** conversation artifact `spryxel-module01-master-design-round03.zip`. **The PNG binary renders, HTML/CSS and original JPEG/PNG source assets are in this conversation download, NOT currently in GitHub.** The planning docs and checksums are versioned here for later deterministic asset import.

## 4 full page render candidates (actual Chromium screenshots)

| Variant | Resolution px | SHA-256 |
| --- | --- | --- |
| `master-home-desktop-dark.png` | **1440×6637** | `aede9fb9aeae9e0d5fe1a36c8d92ba129671c4c3164cad2225e302d29ef1b626` |
| `master-home-desktop-light.png` | **1440×6637** | `2d85f6c4d801131df017f57cd894a5e0cb6221f48e4a4e65596b593b7008d7b9` |
| `master-home-mobile-dark.png` | **390×7391** | `42f504fd8c4f18cfd3ea7ecb0d34e51dca4371e6bcefd53a84603e45ae087aff` |
| `master-home-mobile-light.png` | **390×7391** | `23dfea7c9e5d4e80b9531c37056ca91545747f5921b74f8fc616ada7598aa50f` |

Additional screenshots: `master-home-interaction-states.png` (1930×575), SHA256 `c5c5c5a9cc773d2596b1129dba02abfd09807fdbf63c955aeae69e85bfe2e5a0`; `master-home-round03-preview.jpg` (1950×1240), SHA256 `826ea4b71b91ca317a02477076e2d2dd72d32b333cdf3cfd84e0392780f9abb3`.
Editable source in ZIP: `master-home.html`, SHA256 `0f5ab5185d54ba8245c96c6f75ebef413bded24e3ec61e46d0ed5077ad44d8a5`; `master-home.css`, SHA256 `5577dfacd152153a3f6d3a5883f6aa91a9ef975f5094555951f05a49d381213c`; `render.py`, `states.py`, local cropped concept assets and `ASSET-PROVENANCE.json`. Exact hashes of all package files are in `DELIVERY-MANIFEST.json`.

## Visual decisions as implemented in reference
- Owner **Option 07 "3D FOCADO EM WORLDS"** atmospheric floating islands as hero imagery; visible commercial focus on Pixel/2D game asset families in the first viewport, not speculative 3D generation.
- Brand **Option 05 Digital Leaf** reference original `IMG_9281.jpeg` retained unchanged. Navigation icon is a **derived crop of the owner's image** and CSS wordmark is a **temporary stand-in**, **NOT pixel-faithful final master**; accurate editable logo still in #53 / PR #52.
- One consistent section hierarchy in all four renders: header+hero, asset categories, planned five-step workflow, honestly labelled concept gallery, creator personas, design principles, FAQ, final CTA and **complete footer**. Dark and light themes share layout, mobile reflows without horizontal scrolling.
- No fabricated subscription prices, free credits, growth statistics, fake logos/partnerships, live 3D-video-generation, active newsletter, legal/controller identity or false customer testimonials. The concept scenes and gallery art are AI-generated illustration references, **NOT** verified Spryxel output.

## Technical screenshot and limited interaction QA
- Browser used: headless Chromium via Playwright Python with inlined CSS and local generated media.
- Four screenshot runs: `document.documentElement.scrollWidth === innerWidth` (**1440/390**), missing image list empty, all internal section anchors resolve, **six FAQs** present.
- Demonstration-only interactions verified: auth preview dialog opens, cookie preferences dialog opens (optional analytics defaults OFF), mobile navigation drawer opens. Screenshots are under `master-home-interaction-states.png`. **This DOES NOT prove WorkOS authentication, real consent storage, payment/legal compliance or actual App Router behavior.**
- The theme and page are responsive visual sandbox references, not the deployed Next.js app. The screenshot does not prove WCAG screenreader testing, field performance, qualified legal review or full locales.
- Canonical English copy only is rendered here; pt-BR/es editorial candidates remain in `ROUND-02-COPY-DRAFT.json` for implementation after approval.

## Blockers before official asset freeze or Codex implementation
1. Owner reviews **all four full-page variants** and responds ACCEPT or list of visual modifications. The user has approved the *direction*, not yet these complete Master Design images.
2. #53 provides a **faithful editable Digital Leaf logo** replacing derived icon and temporary CSS wordmark. Keep exact owner uploaded source SHA.
3. Reference ZIP binaries and source HTML/CSS imported into the repository at an approved target path under `design/website/reference/` and/or `planning/website-module-01/master-design/`, byte-for-byte verified against this manifest. Do not invent links to absent GitHub assets.
4. Option07 original fantasy direction and generated concept imagery rights/provenance confirmed before advertising and publication. Replace AI visual placeholders for production as necessary.
5. G0 formal sequencing Decision Delta #63, G1 frozen interfaces #64, owner-approved G2 #70, per-WO Context Locks and standard independent acceptance. Current HIGH_ASSURANCE #29/PR #30 remains isolated.
6. Actual WorkOS sign-in, legal pages/consent persistence, EN/pt-BR/es full translation, metadata, performance and accessibility implemented/tested later by separately admitted WOs.

**Review recommendation:** composition ready for owner decision, **not ready for production**.
**STOP CONDITION:** `SPRYXEL_WEB_G2_ROUND_03_FOUR_MASTER_PREVIEWS_READY_FOR_OWNER_REVIEW`.
