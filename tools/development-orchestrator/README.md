# Spryxel Control Tower | R0: deterministic development batch planner

**DRAFT / DRY-RUN ONLY / NOT A LIVE MULTIAGENT EXECUTOR**

Owner request and review: [#55](https://github.com/KayzenRoot/spryxel/issues/55); existing dependency map [#34](https://github.com/KayzenRoot/spryxel/issues/34), website [#54](https://github.com/KayzenRoot/spryxel/issues/54), Brand Fidelity [#53](https://github.com/KayzenRoot/spryxel/issues/53); WO-008 [#29](https://github.com/KayzenRoot/spryxel/issues/29) remains isolated. NOT the creative end-user Workflow Studio #36.

## Why this exists
A coordinator must NOT hand five agents five overlapping PRs. Parallelism starts only after an admitted Work Order, frozen contracts, exact base SHA and fresh Context Lock. The issue/Work Order is the task identity. GitHub checks and an independent auditor control merges.

## Agent roles (future runtime)
- Source Scout (read-only GitHub, checkpoint, SHA, issues/PRs, security and Context Lock)
- Contract Architect (single owner for shared API/schema/routes/tokens before parallel work)
- Risk Scheduler (DAG + path/semantic locks, risk class, budget and critical path)
- Builders (one bounded Work Order per isolated branch/worktree, exact file ownership)
- Tester (real tests and exact head, with evidence)
- Independent Auditor (approve/correction/block)
- Merge Gatekeeper (explicit owner permission; never self-approve, force push, or auto-promote checkpoint)

## R0 implemented here
`planner.mjs` is a **zero-dependency Node.js >=22, pure read-only JSON input planner**. It validates task status, dependencies, cycles, SHA, Context Lock, path ownership, governance locks, HIGH_ASSURANCE isolation, parallel count and token budgets. It prints deterministic scheduling waves, blocked reasons, and *simulation* estimates. It cannot log in, call Codex, run a workflow, or merge.

```bash
node --test tools/development-orchestrator/planner.test.mjs
node tools/development-orchestrator/planner.mjs tools/development-orchestrator/manifest.example.json
```

The example manifest contains real issue numbers but is **intentionally NOT ADMITTED**. The planner refuses to start the website/brand planning or the blocked WO-008. There is no automatic success claim.

## R1–R3 pending independent authorization
1. Reconcile #54 website-first ordering vs canonical D-153 and active WO-008 via formal Decision Delta; identify non-conflicting parallel lanes and freeze contracts.
2. GitHub read-only Scout: verify base SHA/Work Order/context fingerprints, exact current issue state, prior-approved dependency receipts; user-supplied JSON alone cannot authorize execution.
3. Provider-neutral adapters: local Codex Desktop/CLI *after validating actual supported command/API*, optional OpenAI Agents API / other tools after compatibility, entitlement, privacy and cost checks.
4. Durable journal for lease/heartbeat/retry/cancel/resume, bounded time/tokens and idempotency; sandbox, secret redaction, path constraints, worktree isolation.
5. Reviewer/audit and protected-GitHub merge gate: all required CI contexts on final HEAD, independent verdict, 0 unresolved blockers, separately authorized checkpoint promotion.
6. Dashboard for agent wall time, token usage, PR cycle time, failed attempts and regressions. No assumed percentage speedups.

## Risk and batching
Default 3 parallel standard-low agents; bounded maximum 4. Never split a HIGH_ASSURANCE financial/security/auth/migration work across builders concurrently. Shared contracts, database migrations, root package changes, security, branch protection, and GEF require explicit exclusive locks and suitable risk evidence. Do not secretly disable CI or waive tests. Source hierarchy always supersedes the planner. Site graphics and legal docs are parallel *only after shared route/i18n/theme contracts are frozen*, and legal text requires qualified review before public launch.

## Control and stop conditions
R0 can **only simulate**. It never changes `main`, active PR #30, auth/billing/GPU, root package scripts or `.engineering` canonical sources. Evidence must be rechecked on the final exact HEAD. No merge or checkpoint promotion by this proposal.

**STOP CONDITION:** `SPRYXEL_DEV_ORCH_001_DRY_RUN_PLANNER_READY_FOR_AUDIT`; actual autonomous dispatch **NOT_ADMITTED**.
