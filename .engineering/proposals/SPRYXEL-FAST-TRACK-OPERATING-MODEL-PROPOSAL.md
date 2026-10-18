# Spryxel Fast-Track Operating Model: Risk-Tiered Execution (Proposal R1)

> **Status: PROPOSED / NONCANONICAL / OWNER DISCUSSION. NOT ADMITTED. NO RULESET, GEF BASELINE OR CHECKPOINT CHANGE.**
>
> Source: [Governance fast-track #92](https://github.com/KayzenRoot/spryxel/issues/92). Proposed from `main@218a719141dc6e53175adf9d28d52b7af3477595` on 2026-10-17 after the R4.4 execution receipts.
>
> This candidate **does not change** the normative order in `.engineering/SOURCE-HIERARCHY.md` or `.engineering/DECISIONS-LEDGER.md`. If accepted, applicable changes must be admitted and reconciled with GEF 1.1.1 via the proper audited Decision Delta/Work Order path.

## Purpose

Deliver code faster without weakening security, tests or `main` branch protection. The intended loop is **discover confirmed defect → implement scoped correction → run proportional tests → submit objective review → merge only with authority**. A developer should not stop on each tiny file change or repeat previously completed evidence for an unchanged source SHA.

## Known protected baseline

At proposal time, ruleset `SPRYXEL main governance` (ID `24340349`) is ACTIVE. It prohibits branch deletion and non-fast-forward history, requires PR integration, resolved review threads and these strict status checks:

1. `Repository validation`
2. `Pipeline integrity`
3. `Gitleaks secrets`
4. `Trivy filesystem and configuration`

Required approving-review count is **0** in GitHub configuration, but **do not confuse this with satisfying project-level HIGH_ASSURANCE independent audit obligations**. SonarCloud and Socket are checked and findings classified as appropriate, not dropped from evidence. No bypass actor is configured. Leave these settings unchanged.

`SPRYXEL-WO-009` is COMPLETE; next product increment `SPRYXEL-WO-010 / IMP-006 DNA + Asset Core` is NOT_ADMITTED (see [#91](https://github.com/KayzenRoot/spryxel/issues/91)). Public website G0/G1/G2 and brand/legal obligations are not silently completed by this proposal.

## Responsibilities

| Role | Owns | Does NOT own |
| --- | --- | --- |
| ChatGPT operating through GitHub | Issues, PR descriptions/comments, evidence summaries, specifications, decisions/proposals, governance analysis, independent source review, owner-facing progress and next coding mission | Inventing local test receipts, running user-PC Docker, committing unsafe product bypass |
| Codex/local engineer | Code, tests, code-only commits, reproduction, exact command/exit-code receipts, scoped investigation, appropriately isolated branches | Work Orders, ADRs, governance wording, PR administration, owner approvals, release claims |
| Owner | One **bounded mission approval** with objective, constraints, STOP, sensitive exceptions, merges and production release decisions | Routine per-file approvals for a previously admitted scoped task |

Codex may use independent subagents/worktrees on nonoverlapping **code** surfaces. Do not have multiple agents edit auth, migration, ledger, lockfile or shared build config at the same time. Code reviewer is not its own independent security reviewer.

## Risk routing

| Tier | Examples | Execution without recurrent authorization | Tests / review | Merge / deploy |
| --- | --- | --- | --- | --- |
| FAST | Docs and PR metadata, low-risk copy/style, narrowly scoped test-only fixes that do not alter auth/runtime gates, isolated formatting | Yes, within previously granted objective, exact repository and allowed path set | Focused tests, existing strict status checks and no outstanding review threads; documentation must state proposal vs effective authority | Existing protected merge process; no implicit authorization |
| STANDARD | Admitted feature/safe frontend, nonsecurity adapter work, bounded bug fixes with no credential/tenant/finance effect | Yes, within the admitted Work Order and bounded test scope; document newly discovered risks | Relevant unit/browser/integration tests, final DoD as currently authoritative, objective review | Separately authorized protected merge only |
| HIGH_ASSURANCE | Auth, proxy, session, tenant/RLS, credits/CostGuard, migration, secrets, CI/ruleset/GEF authority, paid provider calls | Once owner has authorized that specific sensitive **objective and boundaries**; no new approval required for minor internal steps of that objective | Fail-closed negative/security/tenant regression, exact-head CI and independent review; additional tests per canonical DoD | No unattended merge and no live deploy without explicit applicable owner authorization |

A change crossing tiers must be routed to the stricter tier. A declared FAST fix cannot be a backdoor for HIGH_ASSURANCE source changes.

## Evidence policy: avoid duplicate testing, not necessary validation

- Capture `baseSHA`, `headSHA`, Node/npm, tested command and exit code. Label evidence exactly `EXECUTED`, `OBSERVED`, `NOT_RUN`, `BLOCKED`; do not equate green CI with full local acceptance.
- Reuse a valid unchanged-SHA evidence receipt *within its supported scope*. When code relevant to the test changes, run affected tests again. Always perform any full-final verification mandated by the **current** Definition of Done before final acceptance. Do not rewrite DoD through this proposal.
- On transient failure, investigate trace/root cause, make a specific patch and retry only with new evidence. Do not loop indefinitely to obtain a lucky green: allow at most two focused correction campaigns per root cause; rerouting work is more productive than infinite rerun.
- One missing optional provider / local daemon does not stop unrelated work. Mark only the corresponding gate `NOT_RUN` and keep its *dependent acceptance* blocked.
- Use real Docker integration when available (PostgreSQL FORCE RLS, Redis/BullMQ, S3-compatible store), synthetic isolated data, protected credentials, and test-owned resource teardown. Never erase another project's volumes.
- A security P0 finding fails closed immediately for the affected lane, but low-risk documentation/planning may continue in parallel.

## Concrete pilot

- [#90](https://github.com/KayzenRoot/spryxel/issues/90) pilot **COMPLETED** at code scope: [PR #94](https://github.com/KayzenRoot/spryxel/pull/94) merged by protected squash on `main@56101f9cb73be0854f434b8c49eb3ce54929b6b2` with 7/7 source-HEAD checks, no thread exceptions, matching AuthKit routes for Jobs and conditional development-only fixture exemptions. Real WorkOS sign-in redirect remains `NOT_RUN` and must not be called a production release pass. ChatGPT performed GitHub issue/PR review and merge coordination, Codex code and tests.
- [#89](https://github.com/KayzenRoot/spryxel/pull/89) stays DRAFT at **combined head `f45a7a45e167db2845c42afa3612f50154937f5c`** after normal merge from new `main`. Codex reported **one full Playwright 33/33 PASS at combined HEAD**, format/lint/typecheck/unit/build/architecture PASS, while earlier branch had 3×33/33 and Docker integration PASS at `d8b770d`. No claim of 3×33/33 on combined SHA; source GEF/DoD/R4.4 must govern final acceptance. Real WorkOS staging `NOT_RUN`; production fixture remains denied. Source GitHub checks 7/7 PASS, Sonar 33 new issues/0 hotspots but issue-level severity unavailable.
- [#91](https://github.com/KayzenRoot/spryxel/issues/91) stays strictly a future DNA/Asset Core proposal, with no code or checkpoint promotion.

## Reconcile instead of duplicating existing policy proposals

- [#61](https://github.com/KayzenRoot/spryxel/issues/61) already defines **T0 targeted → T1 branch impact → T2 exact integrated HEAD → T3 protected merge/release**, conservative dependency impact, reuse of safe build cache and final full required DoD. Do not establish a rival policy; adopt this single test ladder after its required review.
- [#62](https://github.com/KayzenRoot/spryxel/issues/62) already defines **ChatGPT-first review and P0/P1/P2/P3 severity routing**, with `UNCLASSIFIED` not silently downgraded. Preserve dependent acceptance blocking for unknown high-assurance findings, but keep unrelated product/documentation lanes moving.
- [#93](https://github.com/KayzenRoot/spryxel/pull/93) merely reconciles these proposals with the owner's *Codex code/test only* delegation. No new runbook, extra required paid tool, release portal, or second blanket review procedure should be generated.
- **Sonar #89:** 33 new issues reported, 0 security hotspots, Quality Gate PASS, severity/details not accessible to GitHub-only review. Do not label any individual severity; do not automatically assert P0 or dismiss all 33. If required for exact merge acceptance, request a **single report/export of issue keys, severity, path and line** from an already-authorized Sonar reader. Record missing details once and avoid repeated work.
- **No deploy workflow discovered in current `.github/workflows`** (only repository-validation, pipeline-integrity, gitleaks and trivy at observed main). This limits *automatic GitHub Actions deployment risk*, but must not be construed as proof that an external service or other GitHub App cannot deploy upon branch updates.

## Proposed single bounded decision for future owner action

Approve one coherent **risk-based process amendment** for Spryxel only, without rewriting the closed GEF history. The proposed decision:
1. In an admitted scoped patch, let Codex autonomously correct related code/test defects. ChatGPT handles records/review. One owner approval per *sensitive objective*, not per file, path or rerun.
2. For routine iterative checks, use #61 T0/T1 conservatively. At final candidate HEAD, run the actual mandatory T2 once, including every canonical Work Order-specific test; if the accepted R4.4 mandate of **three complete browser runs on exact final SHA** remains an independently applicable acceptance requirement, it **must be satisfied or explicitly amended through the right authority**, never silently treated as passed because prior SHAs ran 3×.
3. No duplicate full Docker run on auth/frontend-only edits solely for progress reporting where the governing DoD permits impact reuse; high-assurance requirements that explicitly require current-HEAD integration are still mandatory.
4. Continue other independent admitted tasks while Docker/WorkOS/Sonar details are unavailable; `NOT_RUN` stops the dependent guarantee (e.g., actual WorkOS sign-in or public release), not every unrelated local code/documentation change.
5. Keep active ruleset, four required checks, zero unresolved threads, no force push, real data/tenant/finance security barriers, independent high-assurance reviewer, owner merge/deploy authority and product WO admission intact.

This is a **decision candidate**, not an exception to currently binding Source Hierarchy, Definition of Done, Work Orders, or protected branch rules. Owner can grant it prospectively after independent compatibility review; until then keep current gates.

## Proposal implementation and acceptance gates

1. Owner approves a coherent **fast-track process Decision Delta** within the Source Hierarchy, specifying which requirements are unchanged and which would be revised; an issue/PR comment alone does **not** outrank canonical policy.
2. Independent reviewer verifies this proposal against GEF 1.1.1 compatibility, DoD and branch/ruleset protection, with a path-by-path impact map.
3. Only upon formal admission should a separate minimal normative change be merged under existing required checks; retain immutable baselines. No unauthorized checkpoint changes.
4. Pilot demonstrates fewer handoffs and correctly scoped test reuse, with full security checks where they matter.

## Proposed STOP conditions

- `SPRYXEL_FAST_TRACK_PROCESS_R1_PROPOSAL_READY_FOR_OBJECTIVE_REVIEW_NOT_EFFECTIVE`: documentation is ready but not canonical.
- `SPRYXEL_FAST_TRACK_PROCESS_R1_CONFLICTS_WITH_CANONICAL_GEF`: precise conflicting clause identified, no bypass attempted.

**Never label the governance proposal as active until authority is established under the existing rules.**
