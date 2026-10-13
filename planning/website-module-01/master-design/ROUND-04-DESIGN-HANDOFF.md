# Master Design Round 04: production handoff (PROPOSAL)

**Status: OWNER REVIEW CANDIDATE / NOT FROZEN / NO IMPLEMENTATION ADMISSION.**
Sources: issue #70, master design PR #75, Round 03 previews, and canonical .engineering/UX-DESIGN-SYSTEM.md + .engineering/UI-UX.md.

## Documents
- ROUND-04-DESIGN-TOKENS.plan.json: 15 public semantic token roles, two theme samples, typography, spacing, breakpoints and motion.
- ROUND-04-COMPONENT-CONTRACTS.plan.json: 19 component slots, owners, dependencies, proposed APIs, state matrices and test criteria.
- ROUND-04-REVIEW-GATES.md: P1 design freeze blockers, P2 refinements, owner signoff and test matrix.
- Round 03 editable HTML/CSS and full-page PNGs live in the user-facing conversation ZIP, **not committed** to GitHub as binaries. SHA and provenance are recorded in ROUND-03-VISUAL-CANDIDATE.md. A draft screenshot is NOT an application component or approved final brand vector.

## The correct source of truth
- Owner-selected landing option **07, 3D FOCADO EM WORLDS**: floating worlds are the atmosphere; Pixel/2D characters, sprites, mobs, maps/tilesets, props and UI are the product focus.
- Owner-selected **Digital Leaf option 05**, exact two-leaf original image, stays the brand reference. Reconstructed logo draft in PR #52 and provisional leaf in screenshot are NOT official.
- Product/studio **canonical** semantic design system remains graphite/slate, spectral-violet brand-primary, electric-teal brand-secondary, dark and light themes, Inter variable UI/JetBrains Mono data, 4px spacing grid, 120/180/240ms feedback/motion and WCAG 2.2 AA target.
- Public marketing aliases may use neon lime/cyan/gold as **artwork accents only**. Round03 CSS actually uses #b3ff42 / #22e5e0 instead of owner board #A3FF00 / #00E5FF; do NOT claim they match exactly. Reconcile concrete production tokens under G1 and reviewed design decision before release. Never use green artwork accent alone for success or verification.

## Responsive and typography contract
- Proposed fluid max container 1320px; 4px-based spaces; normal section gap 112px desktop and 64px mobile; cards radius approx 20px; header and hero chrome may be glass only if text stays legible.
- Ref breakpoint proposals from Round03 CSS: max 480px, max 800px, max 1180px. Check 320, 375, 390, 768, 800, 1024, 1180, 1440 and 1920. Product studio below-1024 mobile-companion boundary is a distinct canonical design concern.
- Proposed H1 72px desktop/40px mobile, H2 48px/30px, body 18px/16px, functional captions and buttons 14px minimum except carefully reviewed cases. Support ~40% text expansion EN to pt-BR/es with no fixed-height clipping.
- Round03 known accessibility gaps: functional microcopy approx 7–12px, tiny labels, controls approx 39px, possible insufficient focus/color contrast. Increase text/touch sizing and re-render corresponding master images before owner freeze. Target comfortable 44px touch actions and strong keyboard focus.
- First view: accessible header, honest hero, static licensed floating-world art, game asset categories visible, two real anchor CTAs. No fabricated pricing, generation-3D availability, awards, metrics, partner logos, free account or fake site/contacts.
- Theme switch is presentational only and must avoid SSR flash; reduced-motion users get a static hero. WebGL cannot be a prerequisite for reading or navigating.

## Typed component slots and ownership
G1 first freezes public route manifest, section IDs, locale-key contracts, tokens, layout shell and SEO metadata ownership. Round04 JSON then provides 18 independent component contracts.

| Task | Issue | Ownership ONLY after real admission | Responsibilities |
| --- | --- | --- | --- |
| A1 | #65 | apps/web/components/public-landing/ | HeroWords, AssetExplorer/CategoryCard, Workflow, ConceptGallery, CreatorAudience, ClosingCTA |
| A2 | #66 | apps/web/components/public-consent/ and apps/web/content/legal/ | Legal content gates + consent choices and reopening; actual GDPR/LGPD inventory requires review |
| A3 | #67 | apps/web/components/public-hero-art/ + design/website/3d-worlds/ | Image, progressive 3D only if justified, static/reduced-motion fallback, artwork hashes/licenses |
| A4 | #68 | apps/web/components/public-seo/ | FAQ semantics, metadata, hreflang, OG and noindex where appropriate |
| A5 | #71 | apps/web/components/public-chrome/ | Header, Footer, brand slot, theme and locale switch, mobile navigation |
| A6 | #72 | apps/web/content/public-locales/ | **Sole writer** of EN, pt-BR, es dictionaries and content-key schema |
| A7 | #73 | apps/web/components/public-auth-entry/ | Public sign-in entry adapter to existing verified WorkOS, NO backend/session replacement |
| B1 | #69 | shared routing/layout app integration | Only agent permitted to edit shared public layouts, root route files, common styles after A1–A7 reviewed |
| B2 | #74 | release evidence / acceptance | Final exact-head tests, legal/cookie accessibility proof and public GO/NO-GO |

Do not let independent builders edit shared root package files, Next root layout or app global CSS, approved WorkOS auth config, common route map or canonical .engineering/GEF sources. One Codex prompt may dispatch up to FOUR independent admitted lanes, with continuous refill, exact worktree ownership and separate PR evidence; not seven writers in a shared worktree. HIGH_ASSURANCE WO-008 PR #30 stays separate.

## Release and test model
- During drafting: targeted lint/typecheck + component unit/browser smoke (do not rerun full acceptance per label tweak).
- At actual final PR HEAD: mandatory Work Order and security/CI checks remain full and independent; if changed after audit, revalidate. A QA-proven P2 nonrequired polish may be tracked to Module 01 closeout, but P1 functional, accessibility, cookie, data, security and legal blockers cannot.
- After every Codex batch, ChatGPT performs the review and directly fixes feasible scoped GitHub diffs before any necessary consolidated Codex correction (#62).
- Actual cookie consent needs equal Accept/Reject/Customize, persistent preference and revocation via footer, not the Round03 mock dialog. Login needs true WorkOS endpoint, not fake email/password. A generated screenshot cannot pass either gate.
- EN, pt-BR, es functional locale controls, dark and light contrast/keyboard, device 320–1920 and real legal link targets are launch requirements.

## Steps until code admission
G0 #63 reviewed sequencing ADR -> G1 #64 route/token/ownership freeze -> G2 #70 **owner visual signoff plus exact Digital Leaf #53** -> formal Work Orders and Context Locks -> up to four parallel isolated A1–A7 -> B1 integration -> B2 objective audit, protected merge and public launch authorization.

**STOP CONDITION:** SPRYXEL_WEB_G2_ROUND_04_COMPONENT_AND_TOKENS_CONTRACT_READY_FOR_OWNER_REVIEW.
This does NOT mean the design master is fully approved, deployed, or even present as GitHub binary images.
