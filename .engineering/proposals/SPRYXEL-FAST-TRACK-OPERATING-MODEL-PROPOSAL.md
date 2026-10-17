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

- [#90](https://github.com/KayzenRoot/spryxel/issues/90) shows the problem: `apps/web/proxy.ts` omitted `/jobs` from the WorkOS/Next proxy matcher even though server components call `requireWebSession`. A 200 streamed error shell is not itself an auth bypass. The owner has separately authorized a narrow HIGH_ASSURANCE *code/test only* fix. The authorized Codex work should add `/jobs` and `/jobs/:path*` coverage and negative tests in an isolated main-based branch, without production E2E fixture or WorkOS real keys. ChatGPT handles the resulting PR, evidence and review.
- [#89](https://github.com/KayzenRoot/spryxel/pull/89) stays DRAFT. At `d8b770d`, local Codex reported 3 × 33/33 Playwright, 120 unit, lint/typecheck/worker/GEF and Docker integration PASS. Real WorkOS staging is NOT_RUN and must never be reported passed. Existing production fixture guard remains closed. No repeated campaign on unchanged code just to fill time.
- [#91](https://github.com/KayzenRoot/spryxel/issues/91) stays strictly a future DNA/Asset Core proposal, with no code or checkpoint promotion.

## Proposal implementation and acceptance gates

1. Owner approves a coherent **fast-track process Decision Delta** within the Source Hierarchy, specifying which requirements are unchanged and which would be revised; an issue/PR comment alone does **not** outrank canonical policy.
2. Independent reviewer verifies this proposal against GEF 1.1.1 compatibility, DoD and branch/ruleset protection, with a path-by-path impact map.
3. Only upon formal admission should a separate minimal normative change be merged under existing required checks; retain immutable baselines. No unauthorized checkpoint changes.
4. Pilot demonstrates fewer handoffs and correctly scoped test reuse, with full security checks where they matter.

## Proposed STOP conditions

- `SPRYXEL_FAST_TRACK_PROCESS_R1_PROPOSAL_READY_FOR_OBJECTIVE_REVIEW_NOT_EFFECTIVE`: documentation is ready but not canonical.
- `SPRYXEL_FAST_TRACK_PROCESS_R1_CONFLICTS_WITH_CANONICAL_GEF`: precise conflicting clause identified, no bypass attempted.

**Never label the governance proposal as active until authority is established under the existing rules.**
