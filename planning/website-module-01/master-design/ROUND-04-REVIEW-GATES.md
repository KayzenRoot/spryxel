# Round 04: objective review, UX fixes and Master Design freeze checklist

**Verdict at creation: DESIGN CORRECTION REQUIRED for final visual master; Round04 proposal READY FOR OWNER REVIEW.** No application code changed; no release tests/functional behavior claimed.

## Contrast spot-check on Round03 **opaque surface** samples (local math, not complete WCAG audit)

Calculated sRGB WCAG contrast ratios of text versus **opaque card surface**, without assuming semi-transparent hero backgrounds; thresholds: >=4.5:1 normal text, >=3:1 large text, and suitable UI/focus indicators separately.

| Theme | Card surface | Text | Ratio | Implication |
| --- | --- | --- | ---: | --- |
| dark | #0e1e25 | primary #f3faf7 | 16.11:1 | PASS normal-text threshold on this surface |
| dark | #0e1e25 | secondary #a7bac0 | 8.47:1 | PASS on this surface |
| dark | #0e1e25 | muted #6d8990 | 4.57:1 | Narrow PASS on this surface, recheck tiny sizes / transparency |
| light | #ffffff | primary #11252c | 15.85:1 | PASS on this surface |
| light | #ffffff | secondary #4b656d | 6.21:1 | PASS on this surface |
| light | #ffffff | muted #6b8389 | **4.01:1** | **FAIL normal-text threshold**, decorative-only pending stronger text token |

This analysis is **not a claim that every page/card/transparent overlay meets WCAG 2.2 AA**. Real browser contrast, zoom and focus audits still required. It shows a specific proposed muted-light value must be adjusted before publishing meaningful labels, especially small footer/microcopy. Preserve color-role semantics in both themes, no naive blanket conversion to #A3FF00.

## P1: must fix before owner freezes master reference
| ID | Found in Round03 local HTML/CSS | Why it matters | Route | Owner and evidence |
| --- | --- | --- | --- | --- |
| R4-P1-01 | Round03 uses a **provisional leaf**, not exact approved Digital Leaf Option05 | User explicitly requested pixel-level faithful logo | #53 / PR #52 faithful source + signed exact image/hash + owner comparison | Design owner; do not overwrite original reference |
| R4-P1-02 | CSS prototype accents #b3ff42 and #22e5e0 differ from brand board #A3FF00 and #00E5FF; some numeric product UI tokens would contradict spectral-violet/teal canonical roles | No false claim of exact master/implicit canonical UI change | G1 #64 theme-role alias review and design Decision Delta as needed | G1 + G2; compare dark/light contrast and exact approved logo |
| R4-P1-03 | CSS informative labels ~7–12px and some touch elements below comfortable 44px | Mobile legibility, translated expansion, small taps; WCAG review not complete | Make text/control role token sizes + re-render full page | G2 revision; screenshots + 320/390/768/1440 accessible audit |
| R4-P1-04 | EN-only static mock and locale text is a badge rather than functional navigation | Owner requires EN/pt-BR/es from start | A6 typed dictionary + A5 locale switch when admitted | G1 stable schema, A6 implementation, B1 smoke |
| R4-P1-05 | Mock sign-in dialog has fake inputs; cookie panel has no durable consent enforcement | Cannot publish fake login/consent | A7 verified existing WorkOS entry; A2 real consent, B1 integration | Real clean-browser persistence/no-before-consent smoke; legal advice |
| R4-P1-06 | Legal/footer currently explicitly uses inactive contact/Terms/Privacy/Cookie placeholders | Owner demands real footer and compliant public pages | A2/A5/B1/B2, verified legal identity and actual approved content | Real route crawler, qualified counsel review |
| R4-P1-07 | Original four PNGs / CSS / owner artwork remain in conversation ZIP, not in repository | Codex cannot rely on unavailable local asset path; source provenance broken | Import exact original plus approved derivative binaries into versioned design source repo using available supported method | Compare SHA256 against Round03 and original board manifest |
| R4-P1-08 | Decorative studio/gallery image examples could be mistaken for real generated Spryxel product output | Truth in marketing and rights | Mark clearly Concept / In development and verify licensed artwork for each item | Source manifest plus public copy audit |
| R4-P1-09 | G2 visual direction selected but complete Round03 dark/light/mobile master not owner approved | Cannot declare master frozen based on generation alone | Owner review of corrected full-page images after P1-01/02/03 | Explicit reviewed image hashes and status decision |

## P2: eligible for grouped refinement only if non-gating
- Refine fog depth/ambient glow/card shadows after high-contrast copy is approved; avoid sacrificing readability.
- Try marginally improved hero art cropping on tablet, but preserve approved floating-world composition.
- Reduce final PNG export size and replace decorative assets with licensed optimised responsive formats; performance budgets have to be measured in real app separately.
- Minor tracking/kicker punctuation, consistent naming and icon sizing; acceptable to defer to Module 01 closeout only if independent acceptance agrees. NEVER downgrade legal/consent/small-target/accessibility to P2 automatically.

## Evidence table required in design review
1. Full-page screenshots: desktop dark, desktop light, mobile dark, mobile light; copy exact filename/dimensions/SHA256 and approval status.
2. Source: raw original IMG_9281.jpeg and the selected Option07 source board, all derivatives individually listed with provenance/license.
3. Representative states: menu open, theme switch, locale choices, cookie Reject/Accept/Customize and reopen, login entry success/error/gated states; reference-only state ≠ functional backend.
4. QA: contrast matrix dark/light, zoom 200% and 400%, 320px touch target audit, keyboard tab order, focus restore, reduced motion, screenreader semantically, pt-BR/es pseudo-expansion (40%).
5. Content accuracy: Pixel/2D focus, planned vs released labels, no false production 3D generation, free credits, customer counts, partner badges or paid pricing.
6. Infrastructure trust: verified module route/link targets, no external tracker before valid consent where required, WorkOS session boundary untouched, exact final HEAD mandatory checks when code exists.
7. G0 and G1 formally approved by current source hierarchy before any executable WO; no silent source-pack changes.

## Next completion order
- R4 is a **technical design contract**; review tokens and component API ownership with the owner; avoid choosing arbitrary bright accent values without explicit theme/signoff.
- Fix source art import and logo fidelity separately, using Codex only when high-fidelity local graphics reconstruction is truly necessary (#53). Small design prose/spec/CI correction belongs to ChatGPT-first #62.
- Re-render four visuals after accessibility/type/token adjustments. Bind new SHA256 and provenance in revised Round03 + Round04 and seek explicit owner approval.
- Then freeze G2 + shared G1 contract, admit WOs only after G0 sequencing authority and objective review, run 4 agents max for disjoint A-lanes.

**STOP CONDITION:** SPRYXEL_WEB_G2_ROUND_04_REVIEW_GATES_READY_FOR_OWNER_SIGNOFF (proposal only).
