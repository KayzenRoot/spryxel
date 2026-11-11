> **ROUND 08 now prepared, still NOT ADMITTED:** `governance/ROUND-08-G0-DECISION-BRIEF.md` records owner-facing additive-first public-site sequencing alternatives, `contracts/ROUND-08-G1-SSR-ARCHITECTURE.md` evaluates Next.js 16 multiple-root SSR language with existing protected `/`, `ROUND-08-ASSET-IMPORT-RECEIPT.md` records verified reference ZIP extraction and **no GitHub binary upload**, and `tools/import-round08.py` stages exactly eight original/candidate files into a non-main git branch after digest checks. Actual reference import ZIP is in the chat download, not GitHub. G0 formal decision, G1 security-reviewed runtime proof, #53 faithful logo and #70 four-master owner approval remain pending. No implementation or authorization can be inferred.

# Spryxel Module 01 | Round 07 readiness, audit and owner decision register

> **STATE: PLANNING HANDOFF PREPARED / IMPLEMENTATION NOT ADMITTED / MASTER NOT FROZEN.**
> Single source: issue #54, design #70, brand #53, G0 #63, G1 #64, draft PR #75. Do not merge, run Codex or self-promote a Checkpoint based on this plan.

## What Round 07 delivered in GitHub
1. `ROUND-07-ASSET-INTAKE.plan.json`: 8 known source/candidate files (exact names, SHA256 and proposed target paths); 3 unverified graphic groups; verified-intake sequence and no-ship-reference guard. **Image binaries remain in conversation ZIP**, not in GitHub: manifest is NOT a binary upload.
2. `ROUND-07-MULTIAGENT-HANDOFF.plan.json`: candidate **A1–A7** agent envelopes, exclusive file roots, risk gates, proposed 4-agent schedule and resource caps to be filled at execution. All statuses NOT_ADMITTED.
3. `ROUND-07-ACCEPTANCE-MATRIX.plan.json`: 26 acceptance items with responsible WO, P0/P1/P2 prioritization, required evidence and phase. User-facing copy and mock UI can be fast-reviewed, but protected security/legal and release gates remain.
4. `ROUND-07-CODEX-MASTER-PROMPT-TEMPLATE.md`: one conditional master prompt for several **independently admitted** WOs, separate worktrees and PRs, completion-driven refill and ChatGPT-first review/corrections. This is a template and has not been run.

## Concrete architecture risk inherited from Round 06
- **Current protected root:** `apps/web/app/page.tsx` uses `requireWebSession()`, AuthKit proxy protects `/`; the public website should be **additive first** under `/en`, `/pt-BR`, `/es`. A future public root cutover requires a separate HIGH_ASSURANCE migration and fallback.
- **SSR locale:** `apps/web/app/layout.tsx` hardcodes `<html lang="en">`; G1/B1 must approve and implement correct server-rendered locale per language before declaring multilingual usability complete.
- **Shared Code Ownership:** A1–A7 disjoint candidate subtrees, **A6 sole locale writer**, B1 sole layout/route integrator, no auth/proxy editing by A-lanes. Freeze G1 typed contracts before A6 begins translations so parallel consumer agents don't require shared-file fixes.
- **Actual Codex runtime support, tokens and timing** have not been measured; concurrency 4 is a cap for later benchmarking, **not** an entitlement or speedup promise.
- **Legal publication:** real contact/controller, privacy/cookie inventory and qualified legal approval are launch gates; no simulated consent/login accepted.

## Owner/auditor review queue
| Order | Issue | Decision needed | Current status |
| --- | --- | --- | --- |
| 1 | #63 G0 | Approve additive-first public-site sequencing vs canonical next WO-008 / D-153; independent architecture review | PROPOSED |
| 2 | #64 G1 | Freeze route/SSR-language/security contract, shared token mapping and actual git ownership | PROPOSED |
| 3 | #53 Brand | Approve pixel-faithful Digital Leaf source, favicon, SVG/transparency/social exports | NOT FINISHED |
| 4 | #70 G2 | Visually approve four Round05 exact-hash master reference PNGs and binary GitHub import | CANDIDATE |
| 5 | #65–#73 A1–A7 | After all preceding gates, create/admit separate actual WOs, fresh Context Locks, branch owners and baseline tests | NOT ADMITTED |
| 6 | #69 B1 | Integrate approved A-lanes; migrate protected root only with separate HIGH_ASSURANCE scope | NOT ADMITTED |
| 7 | #74 B2 | Full exact-HEAD acceptance, legal and public-launch approval | NOT ADMITTED |

## Speed and correction policy
- Ready *planning tasks* may move now through GitHub: specs, copy/dictionary schemas, artwork manifests, contract reviews and issue updates. Never treat these as authorized code execution.
- **One Codex master prompt** later can dispatch up to 4 independent admitted A-lanes, reuse approved sources, then refill freed slots. B1/B2 are serial. A builder's self-review is not an audit; owner/auditor controls merge.
- After Codex: ChatGPT handles all feasible scoped GitHub fixes before sending one consolidated local-only P1 correction back; P2 only if demonstrably outside formal DoD and linked to module closeout.
- Fast iteration tests can avoid repetitive heavy infra loops, but final head acceptance cannot skip WorkOS/tenant, real consent/legal, SSR locale, accessibility, mandatory CI, independent review or protected merge.

## Evidence and exclusions
Previous local/static Round05 preview: four long screenshots and 7-width smoke, 8 theme/viewport targeted controls, corrected light muted text sample. It does **not** demonstrate production pages, real WorkOS, real cookies, licensed artwork, legal or 3 languages. Four required GitHub checks are governance/safety, NOT automatically the full product acceptance suite.

**Round07 exit criterion:** planning files internally consistent, current PR HEAD four required hosted workflows observed and unadmitted statuses retained. **Design Freeze/Implementation verdict remains NO-GO** until owner and independent review actions above.

**STOP:** `SPRYXEL_WEB_ROUND07_PLANNING_HANDOFF_READY_FOR_OWNER_REVIEW`.
