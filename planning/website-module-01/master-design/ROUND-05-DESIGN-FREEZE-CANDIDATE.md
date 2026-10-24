# Round 05: Design Freeze Candidate, Accessibility Refinements and Asset Lock

> **STATUS: ROUND 05 CANDIDATE READY FOR OWNER REVIEW, NOT FROZEN / NO EXECUTABLE WO / NO MERGE.**
> Parent: [G2 #70](https://github.com/KayzenRoot/spryxel/issues/70), [DRAFT PR #75](https://github.com/KayzenRoot/spryxel/pull/75), website parent #54, brand fidelity #53, sequencing G0 #63, shared contract G1 #64.
> **Canonical product/studio UX stays unchanged**. Read `.engineering/UX-DESIGN-SYSTEM.md`, `.engineering/UI-UX.md` first. This proposal only refines a standalone public website HTML/CSS mock; it does not authorize global token replacement.

## 1. Actual changes made to the visual references
A recovered **authentic Round 03 reference ZIP** was extracted and preserved unchanged. Its HTML/CSS/assets were copied to a new Round 05 candidate worktree in the current conversation and the CSS corrected, without changing app source code.

| Area | Round 03 issue | Round 05 improvement | Limit |
| --- | --- | --- | --- |
| Dark/light design roles | light `--faint:#6b8389` on white = ~4.01:1 | changed the local reference-only token to `#526b73`, measured ~**5.66:1** on opaque white | Not universal contrast certification; actual surface/gradient overlays require full audit |
| Small copy | labels and microcopy as small as 7–12px in mobile and some desktop | candidate CSS overrides enlarge functional small labels to **at least 14px** in measured visible text nodes | Real app still needs screen reader, zoom, 40% locale expansion tests |
| Touch and focus | some navigation/control targets well below 44px and variable border visibility | candidate CSS adds larger clickable areas, 3px theme-specific focus outlines, increased tap heights | Button controls in final app still require keyboard/focus restoration validation |
| Asset cards on mobile | two very dense narrow columns | use one full-width column at phone widths, preserve category names and summaries | This increases image height (expected), art remains concept only |
| Layout integrity | long-page desktop/mobile dark/light | preserved same sections/headlines/footer and overall Option 07 cinematic atmosphere | Visual consistency is not yet owner approval |

**Preserved:** exact owner reference board for brand Option 05 (`IMG_9281.jpeg`) and exact Option 07 world homepage board, with SHA-256 pinned. The current mockup still uses `derived-logo-symbol-concept.png` which is **NOT the approved faithful logo**. Do not label the provisional render "official".

## 2. Newly rendered full-page visual sources
All four are real image files in **the current conversation's** downloadable `spryxel-master-design-round05-review-pack.zip`, plus editable `master-home.html` and corrected `master-home.css`, unchanged original reference image binaries and QA JSON. This ZIP is **NOT yet stored in the GitHub repo**. Refer to `ROUND-05-FREEZE-LOCK.plan.json` for exact hashes and render dimensions:

- Desktop Dark: **1440×6817**, SHA `d51b776b14f58bc0b8dbc66f4e558c7a5fd6dc0b94bdce4c134c75632daf3dec`
- Desktop Light: **1440×6817**, SHA `410cbe3cf5d734d56d7eea466a718e1440916089b6d35e22df4999e5fd34e1d2`
- Mobile Dark: **391×9533**, SHA `31d6837eb560602935c2a1806b15b8a570ae64f40bfa0232ebdc96b6f836bc57`
- Mobile Light: **391×9533**, SHA `582f62cdbf1a2e74b55cf8b5cb8910d6099073d46aeee95e800d7e72fda1bc41`
- CSS candidate SHA `6566be98a17cc29ccc4812cc955f4908102cfd61759ea933e2127f387eafaabe`; HTML source SHA unchanged from R03.

## 3. QA executed on recovered standalone prototype (not live Next.js)
**PASS, scope clearly limited:**
1. Chromium/Playwright render of all 4 final image candidates with full page capture; same section hierarchy, loaded reference art, no missing internal anchors in generated full-page captures.
2. Seven width browser smoke at 320, 375, 390, 768, 1024, 1440 and 1920 CSS px: **7/7 PASS**, zero horizontal overflow/broken anchors, 6 asset cards, 6 FAQ, 4 footer columns, simulated theme/login/cookies/menu interactions.
3. Targeted computed-typography QA on eight dark/light × [320,390,768,1440] screen states: **8/8 PASS**, zero visible own-text nodes under 14px and zero visible action targets under 44px in the measured DOM scope. This isn't an exhaustive optical/AT audit and WCAG Target Size (Minimum) has separate exceptions.
4. Opaque-white light-muted text contrast improved to **5.66:1**, vs prior 4.01:1; no claim that every transparent surface/color pairing passes WCAG.
5. Original approved design board SHA-256 preserved verbatim in the Round 05 ZIP, no direct edits to original.

**NOT TESTED / NOT CLAIMED:** live WorkOS sessions, persistent cookie consent and tracking gating, legal terms reviewed by counsel, true EN/pt-BR/es route operation, color/spacing owner signoff, screen readers/200-400% zoom, real Lighthouse field performance, license approval of all generated art, product functional integration, other CI beyond PR's existing governance checks.

## 4. Owner-design decisions awaiting explicit confirmation
**Recommendation:** Desktop Dark is the **primary design reference**; Desktop Light and both Mobile layouts follow the same content and semantic structure, not independent designs. It retains the chosen Option 07 / 3D FOCADO EM WORLDS art and Digital Leaf exact original board *as the target*.
- Accept/refine four corrected reference PNGs by their exact SHA above. If changing fonts/graphics, re-render all four and update SHA and QA.
- Keep game assets (characters, NPCs, sprites/pixel art, mobs, maps/tiles, items/props, UI/HUD) **immediately visible** around the first fold; no fake pricing, free credit, user stats, social proof or unshipped AI/3D/video generator claims.
- Reproduce real Digital Leaf official logo via issue #53 **with user visual approval**, and import source/vector/transparent official export with checksum.
- Public site must have English canonical, pt-BR and es actual copy/route support, working dark/light, real footer legal links and consent, verified signup/login WorkOS behavior **at product implementation/launch**, not falsely validated by this static preview.

## 5. Asset package/merging discipline
- Existing images are delivered in a ZIP in the current chat, not in GitHub. Before any Codex task attempts to read `design/website/reference/master-*`, **import original PNG/JPEG binaries and final candidate sources to exact GitHub paths**, or place the ZIP on Codex's local accessible machine, verify SHA-256 from the freeze-lock manifest. No fake repo URLs.
- G1 must own shared website token alias freeze and route component boundaries before A1–A7 launch.
- Seven lanes are still only candidate Work Orders, **NOT_ADMITTED**. No agent may edit current active WO-008/PR #30, existing canonical GEF/ruleset/Checkpoint, provider/credit/payment modules or WorkOS security. Use one prompt for multiple *independent* scopes only after formal G0/G1/G2 gating.
- ChatGPT-first review (#62) for feasible corrections; required P0/P1 legal/security/acceptance cannot be deferred as "cosmetic".
- Qualified human/owner public site launch approval stays separate from design candidate selection and independent code acceptance.

## 6. Round 05 gates / objective verdict
| Gate | Result |
| --- | --- |
| Selected original visual direction verified by hash | PASS, original board preserved in ZIP |
| Four corrected candidate mockups created | PASS, images and HTML/CSS in ZIP, not GitHub |
| 7-width static reference browser smoke | PASS_PREVIEW_ONLY |
| Computed small text/touch target spot-check | PASS_PREVIEW_ONLY (8 theme/viewport states) |
| Light muted contrast vs opaque white | PASS_SELECTED_SAMPLE (5.66:1) |
| All binaries committed in GitHub | **BLOCKED / NOT YET** |
| Exact final Digital Leaf faithful symbol/logo owner approval | **BLOCKED / #53** |
| Owner final visual approval of these 4 screenshots | **PENDING** |
| G0 sequencing and G1 shared contracts formal admission | **PENDING** |
| Public launch operational/login/legal/cookie gates | **PENDING** |

**Design freeze verdict:** `CORRECTION REQUIRED BEFORE MASTER FROZEN` (primarily asset import, faithful official logo and explicit owner image approval). **Round 05 planning STOP achieved:** `SPRYXEL_WEB_G2_ROUND_05_DESIGN_FREEZE_CANDIDATE_READY_FOR_OWNER_REVIEW`.

No merge or checkpoint promotion; leave PR #75 DRAFT.
