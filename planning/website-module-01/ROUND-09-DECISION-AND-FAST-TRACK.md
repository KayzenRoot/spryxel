# Spryxel Module 01 | ROUND 09, final engineering planning checkpoint

**Outcome:** G0/G1 DECISION PACKET COMPLETE, not formally approved; **no implementation, no merge, no Codex dispatch**. Project #54, DRAFT PR #75, G0 #63, G1 #64, G2 #70, brand #53.

## What was verified (2026-10-14)
- Current canonical main SHA at inspection: `08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`. Canonical CHECKPOINT expects Asset Contract Durable Job Backbone next. D-153 in decisions ledger says **job backbone precedes credits/CostGuard, DNA, inference**. D-153 is approved planning, not automatically superseded by owner prioritization of public website.
- [PR #30](https://github.com/KayzenRoot/spryxel/pull/30) is OPEN HIGH_ASSURANCE, head `4a7d696b72ffab6f1569510d1059f42964864626`. Its missing real integration/browser acceptance is not a cosmetic P2 item. Do not disturb its Source Pack/Context Lock/merge order.
- [PR #75](https://github.com/KayzenRoot/spryxel/pull/75) remains a DRAFT planning PR based on that same canonical main SHA. Confirm live HEAD again before any merge.
- **Real existing code**: `apps/web/app/page.tsx` is authenticated `/`; `apps/web/proxy.ts` applies WorkOS authkitProxy; `apps/web/app/layout.tsx` hardcodes `<html lang="en">`. Current projects and account share this protected root.
- Actual [Next.js Route Groups docs](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) support multiple root layouts and warn about full-page reload between roots; [Layout docs](https://nextjs.org/docs/app/api-reference/file-conventions/layout) require a root layout to emit `html` and `body`, allow an `[locale]` root to consume validated async params. **Framework support ≠ confirmed application migration**.
- The **user-supplied exact Round08 ZIP** at the conversation's attachment was reverified: SHA256 `d7a85c0d592e14aa64b4f58af8b0b7f6ed8f75fa7eb6d0fc26d53907dbbe9d2d`; 11 ZIP entries total (8 intended design files, README, importer, manifest). **All 8 file payload SHA256 hashes MATCH** the declared expected SHA. This is a VALID IMPORT SOURCE, **not** a GitHub binary import.
- No GitHub storage path for those 8 exact binary files was verified. The existing importer remains dry-run by default.

## Round 09 source documents created
1. `governance/ROUND-09-G0-PARALLEL-SEQUENCE-DECISION.md`: explicit **proposed** exception for public-site component work in isolated off-main branches without bypassing exact frozen WO-008 and protected merge order. Does not rewrite D-153.
2. `contracts/ROUND-09-G1-ROOT-MIGRATION-MAP.plan.json`: **six exact existing files + Git blob hashes** to move under a `(workspace)` root group; four auth/proxy files to preserve without changing by default; nine proposed public page/layout files under a locale-aware marketing root. No app code mutated, no route/page overlap authorized.
3. `ROUND-09-CRITICAL-PATH.plan.json`: optional partial-order optimization. **A6 dictionaries and A4 FAQ/SEO model** may be eligible for separately admitted off-main early work after formally approved G0+G1 (and individual fresh WOs) **if owner/auditor approves a limited amendment** to the original all-A-after-G2 DAG. Actual logo/master asset release gates still apply to A1/A3/A5 and public launch.
4. This checkpoint and read-only cross-file validation.

## The shortest path to implementation (owner decision required)
**Decision A (recommended):** Approve G0 proposed off-main public component exception; keep current HIGH_ASSURANCE WO-008 independently and do not merge anything into `main` until source/merger reviewer confirms the sequencing. Stage the original assets via the already prepared ZIP and verified importer on a non-main design PR. Freeze G1 typed EN/pt-BR/es and route component contracts. Admit A6 and A4 **first** only after a targeted audited dependency amendment and individual Context Locks. Complete faithful Digital Leaf #53, choose/approve four master PNGs #70, then admit remaining truly independent A1/A3/A5 and safely bounded A2/A7. B1 protected root/SSR locale migration is separate HIGH_ASSURANCE work; B2 closes full launch acceptance.

**Decision B:** Keep original all-A-after-G2 dependency order, spend effort first on image fidelity/import, then admit batch. Safer administrative simplicity, potentially slower if design assets remain pending.

**Decision C:** Continue only WO-008 until fully independently audited and merged, then revisit website work. No sequence exception, longer time-to-landing.

No option is auto-approved by this document. `CONTINUE` in a planning chat is not proof of required independent Source Check, protected merge permissions, current Context Lock or visual signoff.

## Agent scheduling on Decision A (proposed)
| Slot/WO | Earliest start | Scope | Must not edit |
| --- | --- | --- | --- |
| **A6 #72** | After canonical G0 and G1 + its WO admitted | typed English/pt-BR/es, UI/SEO strings | `app/layout.tsx`, auth, shared route files |
| **A4 #68** | After same decision and WO admission | FAQ, SEO metadata *interfaces* | live public routing, invented domain/claims |
| **A1 #65** | After G2 owner art/master verified | hero/asset types/landing components | shared CSS/layout, brand master |
| **A3 #67** | After G2 reference import and art rights | responsive static fantasy art and fallback | WorkOS, approved Digital Leaf source |
| **A5 #71** | After brand/legal header contract | nav/footer/theme/locale slots | global route/layout integration |
| **A2 #66** | G0/G1 + risk review | isolated consent/legal components | real tracker deployment and unreviewed legal publication |
| **A7 #73** | G0/G1 + security review | existing WorkOS sign-in link adapter | authkit provider/proxy/session |
| **B1 #69** | Accepted A-lane contracts and separate admission | Next16 root route migration, SSR locale + real service integration | no self-approved protected root changes |
| **B2 #74** | Audited B1 | exact-HEAD QA, legal/cookie/accessibility, release decision | no launch without verified approval |

**Control Tower requirement:** real runtime/agent support and budget limits, max four safe concurrent slots, separate PRs/worktrees, exact SHA + issue/WO Context Lock, quick inner-loop tests and full final-HEAD mandatory acceptance. ChatGPT-first reviews and direct GitHub corrections; only necessary consolidated local-only issues return to Codex.

## STOP and release boundary
- `G0`: **READY FOR FORMAL OWNER/AUDITOR DECISION**, not promoted.
- `G1`: **SOURCE-BACKED ROOT MIGRATION MAP READY**, but native Next16/WorkOS auth tests and actual contract freeze remain.
- `G2`: **EXACT ZIP VERIFIED**, but official faithful logo and owner final full-page Master Design approvals remain.
- `A/B` WOs: **NOT ADMITTED**; zero implementation execution.
- `main`, the application, WorkOS, GEF, canonical decisions, existing WO-008, branch-protection and release gates: **UNMODIFIED**.

**STOP CONDITION:** `SPRYXEL_WEB_ROUND09_G0_G1_DECISION_PACK_READY_FOR_OWNER_REVIEW`.
