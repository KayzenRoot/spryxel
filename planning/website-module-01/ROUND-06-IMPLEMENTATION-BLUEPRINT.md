# Master Design Round 06 | Engineering handoff and execution-ready planning

> **STATUS: R06 PLAN COMPLETE, NO IMPLEMENTATION ADMISSION, NO DESIGN FREEZE.**
> Parent #54 / #70; sequencing gate #63, routes/contracts gate #64, reference ZIP/image owner review #53.
> **Purpose:** preserve speed by letting up to four Codex agents solve independent future admitted Work Orders with a single master prompt, while ChatGPT first reviews/fixes subsequent GitHub PRs. This is a plan, not a prompt already executed.

## 1. Verified current blockers, not speculative
- Canonical CHECKPOINT still schedules ASSET_CONTRACT_DURABLE_JOB_WORK_ORDER_REQUIRED; active #29 / PR #30 HIGH_ASSURANCE remains separate. **G0 needs an approved sequencing Decision Delta** before starting public-site coding.
- Current `apps/web/app/page.tsx` is Home / Command Center with `requireWebSession()` at `/`, and `apps/web/proxy.ts` protects it through WorkOS. A website cutover at `/` is **not** a harmless layout edit.
- Root `apps/web/app/layout.tsx` declares `<html lang="en">` regardless of route. Public localized pages cannot truthfully pass SSR locale accessibility until B1 solves this in the approved shared architecture.
- Original Digital Leaf exact brand master #53 fidelity not yet signed off and the Round05 ZIP assets are **not yet in GitHub**; current design files are candidates, not production master.
- Legal company/controller and consent behavior cannot be certified by a static screenshot or illustration.

## 2. Project structure recommended
- **G0** `governance/WEB-G0-SEQUENCING-ADR-PROPOSAL.md`: proposed phased public-site-first decision without rewriting past approved D-153.
- **G1** `contracts/WEB-G1-SHARED-INTERFACES.md` + `contracts/WEB-G1-PUBLIC-ROUTES.plan.json`: 8 proposed page templates × 3 locales = **24 URLs, not 24 duplicate page implementations**. Shared header/footer, semantic theme alias, SEO, SSR locale, CTA and consent interfaces.
- **G2** Round01–05 historical design, exact owner reference boards and four candidate master PNGs. Dark desktop is recommended primary; light/mobile derive from identical content/structure.
- **A1–A7** independent candidate Work Orders, separate owned subtrees and PRs; G1 freezes props/locale names before agents start, preventing shared edits.
- **B1** sole shared-layout/route integrator after independent approved PRs, with separate **HIGH_ASSURANCE** stage if it changes the authenticated root/proxy/redirect boundary.
- **B2** acceptance/launch audit; no incomplete legal/cookie/auth claims published.

## 3. Fastest safe batching model
**Do not optimize by maximizing simultaneous agents.** Start with up to four agents for file-disjoint admitted WOs, then refill freed slots only if fresh locks, risk class, environment capacity, and quota allow.

Candidate dispatch:
- **A1 (#65):** landing page structure and asset examples using frozen hero/art slots and read-only typed locale keys.
- **A3 (#67):** optimized 3D Worlds hero art/static fallback. No logo recreation and no unjustified WebGL dependency.
- **A5 (#71):** header/footer and theme/locale switch controls with slot APIs and verified destinations.
- **A6 (#72):** sole dictionary/schema writer, EN/pt-BR/es, content and accessibility keys. All other builders consume frozen G1 typings, not modify dictionaries.
- Refill with **A4 (#68)** FAQ/SEO, **A2 (#66)** consent/legal, **A7 (#73)** WorkOS CTA adapter only, subject to security preflight and actual independence.
- **B1 #69** integrates serially when independent deliverables reviewed; B1 has a stage A additive public site and stage B optional protected-root cutover. No merging agent branches into `main` without existing governance/CI/owner authorization.
- **B2 #74** verifies working footer, EN/pt-BR/es, theme, responsive/keyboard, cookie persistence/withdrawal where required, WorkOS route, correct SSR html lang, SEO/legal and independent exact-HEAD gate.

**One Codex prompt can coordinate several WOs without one giant shared editing branch**. Each future task has separate Context Lock, branch/worktree, exact authorized path, independent evidence/review. Control Tower #55 / PR #56 is still a **read-only simulation** until separately audited.

## 4. Route migration and rollback
**Stage A (safe path):** keep `/` protected, render marketing under `/en`, `/pt-BR`, `/es` and nested public routes. Preserve `/projects`, `/account`, `/sign-in`/callback and existing session/RLS contracts. URLs are a proposal, not currently real.

**Stage B (separate approval):** if owner wants a truly public homepage at `/`, move authenticated command center to a reviewed `/app` (name only candidate), update proxy matcher, protected Home links, auth navigation and tests, set language-aware root redirect/canonical, provide rollback. Must prove unauthenticated tenant isolation and no redirect loops; **HIGH_ASSURANCE** if touching authentication/proxy. Revert to additive routes if unsafe. These are not cosmetic corrections.

**SSR locale P1 architectural gate:** existing `app/layout.tsx` returns `<html lang=en>`. G1/B1 needs a tested Next 16-compatible server-rendered locale strategy before we claim three-language WCAG coverage. Reject client-only late DOM mutation as sufficient.

## 5. Component/visual design contract
Round04 semantic roles (15 candidate tokens) and 19 components plus Round05 corrected master references govern presentation. Preserve:
- Original owner brand option05 double-leaf SVG fidelity is separate #53, not approximated by a gradient leaf.
- Original 3D FOCADO EM WORLDS option07 is illustration only. **True business focus is V1 Pixel/2D game assets**: characters/NPCs, sprites, mobs, environments/tilesets, props and UI/HUD. Planned capabilities are labeled.
- Dark/lights and no-WebGL/reduced motion variants. Typography practical >=14px for meaningful microcopy in reviewed static mock, ~44px taps, readable body, pt-BR/es ~40% expansion.
- Contrast sample fixed for light muted on opaque white from 4.01 to 5.66:1; does not certify every overlay or real application WCAG.
- Real login and cookie consent implemented in admitted A2/A7/B1, never claim the static dialogs as functional. All footer destinations must be real and approved.

## 6. Correct division of testing and corrections (no wasted rounds)
- **F0:** quick targeted formatting/unit/typechecks for owned component during iteration. Avoid full E2E for each label/color edit.
- **F1:** affected module smoke and keyboard/locale/content QA before agent PR completion.
- **F2:** exact final PR HEAD, all required admitted Work Order tests, security/GEF/GitHub checks and real integration where relevant. Changing proxy/auth, consent, RLS or source hierarchy requires full mandatory independent security proof.
- **F3:** authorized merge + postmerge and public launch readiness. Browser screenshot ≠ legal, auth or cookie proof.
- **ChatGPT-first:** when Codex batch returns, review all PRs, fix bounded GitHub-possible defects directly, collect valid P2 non-gating design polish in closeout; ask Codex again only for specific complex/local blockers, consolidated into one Correction Delta. Never downgrade P0/P1.

## 7. What is READY vs what cannot yet be called READY
| Deliverable | State |
| --- | --- |
| 12 issue/WO candidates, dependency plan and agent file domains | READY FOR REVIEW |
| Round01–05 four master images and visual owner direction | GENERATED / G2 OWNER FREEZE PENDING |
| Round06 G0/G1 route and typed-interface ADRs | PROPOSED / NOT CANONICAL |
| Eight page templates × three language URLs | SPECIFIED ONLY / NOT LIVE |
| Seven independent Work Orders admitted / Codex dispatched | **NO** |
| Brand #53 official master imported and visually faithful | **PENDING** |
| Main/proxy/auth route cutover | **NOT STARTED / HIGH_ASSURANCE GATE** |
| Production checkout and GPU, privacy/cookie/legal go-live | **OUT OF SCOPE / DEFERRED** |

## 8. Next decisions and deliverables
1. Owner/auditor evaluates G0 proposed sequencing: additive localized public routes first; protected `/` remains live until reviewed root migration.
2. G1 freezes route keys/locale SSR approach, component and file ownership; obtain approved exact GitHub Source Check/Context Lock.
3. Import original visual binaries and approved current-master PNGs into repo with SHA evidence, no provisional logo substitution.
4. Owner approves exact final brand #53 and the four Round05 master layouts, or provides narrow changes. Design Freeze cannot be assumed merely from continuing planning.
5. After all gates, prepare one multi-WO Codex prompt, and have ChatGPT first perform post-prompt PR reviews and corrections.

**STOP:** `SPRYXEL_WEB_G2_ROUND_06_ARCHITECTURE_AND_BATCH_PLAN_READY_FOR_REVIEW`. This only closes this **planning** round.
