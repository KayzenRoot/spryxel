> **Round05 CANDIDATE READY (NOT FROZEN):** `master-design/ROUND-05-DESIGN-FREEZE-CANDIDATE.md` records four new dark/light desktop/mobile full-page renders with measured CSS legibility/contrast fixes and 7-width preview smoke; `master-design/ROUND-05-FREEZE-LOCK.plan.json` records exact SHA256 of original owner references, re-rendered PNGs, CSS and ZIP. The corrected **~16.8 MB** ZIP and editable HTML/CSS source exist as a downloadable artifact in this conversation, **NOT** GitHub binary files. Final 2-leaf logo #53, explicit owner approval of corrected four images, G0/G1 gate and true legal/WorkOS/consent remain P1 or future implementation gates. No Codex, merge, Work Order admission or canonical UI change.

> **Round04 component-and-token technical handoff READY FOR OWNER REVIEW (not frozen):** `master-design/ROUND-04-DESIGN-HANDOFF.md` + `ROUND-04-DESIGN-TOKENS.plan.json` (15 proposed semantic roles, dark/light, type/space/motion) + `ROUND-04-COMPONENT-CONTRACTS.plan.json` (19 components and nonoverlapping agent owners) + `ROUND-04-REVIEW-GATES.md` (P1/P2, contrast evidence and design signoff). Original Round03 PNG/HTML binary reference pack remains in the conversation ZIP and is not GitHub-hosted. No Work Order admission, CodeX dispatch, merge, or canonical UI change. G0 #63, G1 #64 and G2 #70 approval gates unchanged.

> **Round03 reference package is READY FOR OWNER VISUAL REVIEW (not master approved):** `master-design/ROUND-03-VISUAL-CANDIDATE.md` records the four generated full-page desktop/mobile dark/light PNGs, SHA-256, source HTML/CSS, seven-width Chromium preview QA, owner logo/layout original hashes and remaining fidelity/legal/auth gaps. The actual 15 MB `spryxel-master-design-round03-review-pack.zip` and its binaries are provided in the conversation only; **not committed to GitHub**, no website implementation admitted. Previous Round01/02 planning remains preserved.

> **Round03 actual visual artifacts produced for OWNER REVIEW**: `master-design/ROUND-03-FOUR-MASTER-PREVIEWS.md` documents exact four long-form desktop/mobile, dark/light screenshots with SHA256, a state sheet, editable HTML/CSS source and screenshot QA. The **binary files remain in the conversation ZIP** `spryxel-module01-master-design-round03.zip`, not in the GitHub tree. No design freeze, logo finalization or execution authorization is implied. Source-of-truth keeps original option 07 + Digital Leaf; any prelaunch legal/auth/claim semantics remain gated.

> **Master Design Round02 ready for review:** `master-design/ROUND-02-SECTIONS-FOOTER.md` refines all sections below the hero, complete functional footer and cookie settings; `master-design/ROUND-02-COPY-DRAFT.json` has consistent EN/pt-BR/es editorial candidates; `master-design/ROUND-02-SECTION-INVENTORY.plan.json` maps sections to agent ownership and publication gates. ALL DRAFT / NOT ADMITTED; still no approved full-page master render or official final Digital Leaf vector. The next visual Round03 should produce explicit desktop dark/light and mobile full-page references, subject to owner approval.

> **Reference audit/approval:** `master-design/REFERENCE-AUDIT-v01.md` pins the exact previous selection by filename, crop, dimensions and SHA256. The real brand Option05 and homepage Option07 design **direction** were selected, but full-page production master screenshots were never confirmed as approved or committed. Binary originals are preserved in the downloadable reference pack, not yet in GitHub. No new homepage brand image has authority over the owner's original.

# Spryxel Module 01 — Public website / homepage: 12 candidate Work Orders

> **PLANNING ONLY / NOT ADMITTED / NO CODE AUTHORIZED / NO MERGE.** Created in response to owner's 2026-10-13 Module 01 planning request.
> Parent [#54](https://github.com/KayzenRoot/spryxel/issues/54), product [#35](https://github.com/KayzenRoot/spryxel/issues/35), developer Control Tower [#55](https://github.com/KayzenRoot/spryxel/issues/55), review-first [#62](https://github.com/KayzenRoot/spryxel/issues/62).
> Current canonical Checkpoint `.engineering/CHECKPOINT.json` expects Asset Contract + durable Job (active [#29](https://github.com/KayzenRoot/spryxel/issues/29) / PR #30). A new G0 audited sequencing Decision Delta is needed **before** public-site Work Order admission.

## Product identity and publication limits
**Spryxel**, owner-picked **Option 07 / 3D Worlds** long-form public homepage, with the exact owner-supplied two-leaf **Digital Leaf** brand reference; brand high-fidelity master is tracked by #53/PR #52, **NOT APPROVED for final site until visual review**. Default English, complete pt-BR and Spanish; dark-first, full light mode, saturated lime/cyan/amber accent only after design-token reconciliation. Glassmorphism/3D visuals enhance storytelling with static fallback. Game assets V1 Pixel/2D is the honest primary messaging; 2.5D/3D generation and creator/video/marketing are aspirational unless validated as shipped.

## 12 candidate WOs / graph
| WO draft | Issue | Mode | Depends on | Ownership (proposal, freeze at G1) |
| --- | --- | --- | --- | --- |
| G0 | [#63](https://github.com/KayzenRoot/spryxel/issues/63) | serial | owner source/review | proposal only, sequencing ADR |
| G1 | [#64](https://github.com/KayzenRoot/spryxel/issues/64) | serial | G0 | contracts/route ownership proposal |
| G2 | [#70](https://github.com/KayzenRoot/spryxel/issues/70) | serial | G1 | `planning/website-module-01/master-design/` |
| A1 | [#65](https://github.com/KayzenRoot/spryxel/issues/65) | parallel | G2 | `apps/web/components/public-landing/` |
| A2 | [#66](https://github.com/KayzenRoot/spryxel/issues/66) | parallel | G2 | `apps/web/components/public-consent/`, `apps/web/content/legal/` |
| A3 | [#67](https://github.com/KayzenRoot/spryxel/issues/67) | parallel | G2 | `apps/web/components/public-hero-art/`, `design/website/3d-worlds/` |
| A4 | [#68](https://github.com/KayzenRoot/spryxel/issues/68) | parallel | G2 | `apps/web/components/public-seo/`, `apps/web/content/public-support/` |
| A5 | [#71](https://github.com/KayzenRoot/spryxel/issues/71) | parallel | G2 | `apps/web/components/public-chrome/` |
| A6 | [#72](https://github.com/KayzenRoot/spryxel/issues/72) | parallel | G2 | `apps/web/content/public-locales/` |
| A7 | [#73](https://github.com/KayzenRoot/spryxel/issues/73) | parallel | G2 | `apps/web/components/public-auth-entry/` |
| B1 | [#69](https://github.com/KayzenRoot/spryxel/issues/69) | serial | A1…A7 accepted | shared app routing/layout/site integration |
| B2 | [#74](https://github.com/KayzenRoot/spryxel/issues/74) | serial | B1 audited | module acceptance, launch readiness/counsel gates |

**Seven implementation streams ≠ seven simultaneous agents.** Initial cap **four** agents in separate worktrees/branches, with **event-driven refill** as resources, cost ceilings, locks and admitted Work Orders permit. Example first slots A1, A2, A3, A6; refill with A4/A5/A7. This is a candidate schedule, not a real dispatch, and the scheduler may choose a different order after measurements. One Codex master prompt may coordinate all seven admitted streams only after G0/G1/G2 and current required approvals. Each WO has its own PR, evidence and independent verdict. Protected merge + checkpoint promotion are not replaced by a batch.

## Shared-contract rule before agents
G1 owns authoritative public route schema, design token alias contract, locale key namespace map, header/footer component slots, content promise inventory, SEO route list, legal release flag and test owner boundary. G2 freezes the visual specification and reference assets after owner review. **A1…A7 may read shared contracts but may not modify shared layout, router, root package manifests, common dictionaries, AuthKit, `.engineering`, `.gef` or CI.** A6 is sole writer to public locale dictionary. A5 is sole writer to chrome slots; A7 produces an auth CTA adapter only; B1 alone integrates shared app files and tests routes.

## Proposed home route content
Header/locale/theme/sign-in → immersive fantasy floating-island hero with a truthful "in development" or verified CTA → game asset families: Pixel/2D characters, mobs, sprites, environments, tilemaps, props and UI/HUD → how it works (project → style → generation → review → export, label planned steps) → licensed example showcase only when actual content is available → accessibility/quality/export narrative without invented endorsements → FAQ → footer with product, support, company/legal/cookies/social.
Routes propose `/{locale}`, `/{locale}/features`, `/{locale}/how-it-works`, `/{locale}/faq`, `/{locale}/contact`, `/{locale}/legal/terms`, `/{locale}/legal/privacy`, `/{locale}/legal/cookies`. Showcase gated until examples rights verified; login entry must point to existing functional WorkOS or display truthful unavailable state. No fake contact/link/PRICES/metrics; legal text requires qualified review and factual owner inputs.

## Faster reviews without waiving gates
ChatGPT first reviews every Codex batch, fixes GitHub-scoped code/docs and updates exact HEAD. P0/P1 safety/canonical test/critical DoD blocks approval; non-gating P2 can be assigned to tracked Module 01 closeout, P3 backlog. Bundle actual Codex-only corrections into one prompt. During implementation run scoped fast tests; at exact final HEAD run all Work Order-required validation, security and required CI; owner/auditor gates and post-merge validation remain.

## Decision gates before actual implementation
1. Formal audited sequencing decision for public website first and relationship to WO-008/PR #30. Do not change canonical Checkpoint by planning issue.
2. Owner signs off a faithful Digital Leaf and G2 desktop full-page master design, mobile variant, dark/light and permissions for any imagery.
3. Freeze G1 contract; reconcile any new lime/cyan theme changes with approved spectral-violet UI product tokens via formal ADR as appropriate.
4. Verify chosen CTA: existing actual WorkOS sign-in or truthful Coming Soon; do not create a new login provider.
5. Confirm legal entity/controller, contact, cookie/processor inventory, jurisdictions and counsel signoff before public launch.

**PLANNING STOP:** `SPRYXEL_WEB_MODULE_01_TWELVE_WORK_ORDER_DRAFTS_READY_FOR_OWNER_REVIEW`.
