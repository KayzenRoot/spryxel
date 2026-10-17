# SPRYXEL-WO-009 — Independent HIGH_ASSURANCE Audit and Post-Merge Closeout

**Verdict:** `APPROVED` for SPRYXEL-WO-009 / IMP-005, on the reviewed code candidate and the documentation-only PR head described below. No demonstrable financial or security HIGH/CRITICAL defect remains in the authorized non-commercial scope. This report does not approve commercial activation, real-cost execution, a future Work Order, or deployment.

## Immutable identities and review independence

- Repository: `KayzenRoot/spryxel`.
- Execution base: `34bad103d8066b6d31c5947c20a07ef52032c5d7`.
- Reviewed code candidate: `6cbd9210573815c82f0af60d274c41f31ef0b2bb`, tree `2aaa31508111c586ab5fc68d6fe7c785b72e71d0`.
- Final reviewed PR HEAD: `3f14441ac48d0067dfad8214ba29dfcb2e285a8a`, tree `efee1dca1a54942f35ab5d0f227e3f0d24919ad8`.
- The final PR HEAD adds only Evidence, Proposed Delta, and Correction 09–10 documentation after the code candidate; no product source or test file changed. The independent reviewer did not author the implementation patch.
- PR #87 was squash-merged by `KayzenRoot` at `2026-10-17T00:46:06Z` as `f1ce1df2dad7aabb45dd7d725d31821f30e21a2c`, with parent `34bad103d8066b6d31c5947c20a07ef52032c5d7`. Main tree `efee1dca1a54942f35ab5d0f227e3f0d24919ad8` equals the reviewed PR tree.
- The active `SPRYXEL main governance` ruleset is `24340349`; PR and required-check rules remain active, with no bypass actors configured. No ruleset or GitHub state was changed by this audit.

## Scope and verification basis

The review followed WO-009 AC01–AC28 and its HIGH_ASSURANCE financial-security invariants: immutable double-entry accounting, reserve/commit/release/compensation, operation identity and idempotency, lock ordering, reconciliation, FORCE RLS/ACL, tenant isolation, and CostGuard default deny. Source inspection and adversarial runtime evidence were considered separately. The implementation and test tree at main is the reviewed candidate; the intervening changes are documentation-only.

The auditor independently ran these commands on the unchanged code candidate `6cbd921` before merge:

| Command | Actual result | Scope |
|---|---|---|
| `npm run test:integration` | PASS, exit 0 | Real PostgreSQL; role/ACL/RLS, concurrency, idempotency, reconciliation, terminal release and fixture-only direct-SQL probe. |
| `npm run test:unit` | PASS, exit 0 | 24 files, 120 tests. |

Other acceptance commands and browser runs are recorded in `.engineering/evidence/SPRYXEL-WO-009-EVIDENCE.md` and Correction 09–10. They were not rerun during the documentation closeout. No Docker-backed suite was started for this closeout.

## Findings and adversarial reasoning

### Ledger lifecycle and AC17

The database transition function validates the linked Job's terminal state before app-callable release, and keeps the Job read unlocked to retain the established Job → reservation → wallet lock order (`packages/db/src/migrations/0009_credit_ledger_costguard.sql:900`, `:1077`). The integration regression attempts both full and partial release against queued and running Jobs, then compares balances and persisted reservation/event/posting/wallet snapshots (`scripts/credit-ledger-integration.ts:1167`, `:1179`, `:1192`, `:1204`, `:2352`). The real PostgreSQL integration passed on the unchanged code candidate. The previously identified AC17 defect is corrected; release remains exactly-once through the terminal transition path.

The migration applies ENABLE and FORCE ROW LEVEL SECURITY to wallet, lot, event, reservation, ledger-entry, and integrity-incident tables (`packages/db/src/migrations/0009_credit_ledger_costguard.sql:312`, `:314`, `:316`, `:318`, `:320`, `:322`). The tested role/tenant matrix, SQL grant assertions, same-key and cross-tenant replay, concurrency, and restart/reconciliation are summarized in the Evidence Bundle's AC01–AC28 matrix. No HIGH/CRITICAL cross-tenant, double-spend, idempotency, or ledger mutation defect was demonstrated.

### Direct SQL boundary and synthetic fixture limitation

`platform.reserve_credit_ledger` is callable as `spryxel_app` and accepts the fixture decision/reason metadata (`packages/db/src/migrations/0009_credit_ledger_costguard.sql:1287`, `:1340`). The function then rejects the existing non-costing integrity Job and admits only queued `test_fixture.credit_ledger.v1` Jobs (`:1400`, `:1403`) and selects only `TEST_FIXTURE` lots for the reserve allocation (`:1435`). The production Job constraint permits only the existing integrity operation and this synthetic fixture operation (`:1727`).

The real PostgreSQL adversarial helper deliberately bypasses the JavaScript CostGuard, successfully reserves a synthetic fixture amount for the fixture Job, verifies the allocation origin, attempts an amount that would require a non-fixture lot, and confirms that the call is denied without persisted state. It also confirms the integrity-check Job is denied (`scripts/credit-ledger-integration.ts:451`, `:532`, `:546`, `:556`, `:592`, `:596`). The `PAID_PACK` fixture is seeded in the disposable database to ensure the fixture reserve cannot draw from that origin (`scripts/credit-ledger-integration.ts:154`; `.engineering/evidence/SPRYXEL-WO-009-EVIDENCE.md`, preserved pre-merge C1 section).

This is intentionally a bounded limitation: the SQL function does not prove that caller-supplied `allow_fixture` metadata originated from the branded TypeScript CostGuard. A holder of the `spryxel_app` database credential can forge those fields and create a synthetic fixture reservation, but the accepted schema and allocator do not permit converting it into paid-lot spend or a real-cost operation in this increment. This is not a SQL-level authorization proof for future real generation. Before any real-spend Job is introduced, it needs a trusted SQL authorization boundary plus adversarial PostgreSQL evidence. No such real-spend operation/provider/payment path is in this Work Order. This is a documented scope limitation, not a claim of production SQL authorization; no HIGH/CRITICAL finding was demonstrated in the admitted scope.

### CostGuard and Sonar inventory

CostGuard is fail-closed for missing/unapproved price, policy, COGS and bounds; production cost-bearing work remains unavailable. No public grant/mint, paid checkout, GPU/model execution, or real payment path was added. Real execution remains prohibited and the decision default is DENY.

The PR Sonar inventory observed on `a52cb9d0d94b57fb4a6025cdb068ec5efc30f312` was 109 open/confirmed items, all `CODE_SMELL`: 76 Critical, 5 Major, 28 Minor; zero Security Hotspots; 0.0% new-code coverage; 2.7% duplication. The source code at that analysis SHA is unchanged from reviewed candidate `6cbd921`; changes after that analysis were documentation-only through final PR HEAD `3f14441`. The 71 `plsql:S1192` Critical findings concern duplicated SQL literals. The five `typescript:S3776` complexity findings occur in `packages/db/src/credit-ledger.ts:368`, `packages/domain/src/credit-ledger.ts:122`, `:677`, `:1321`, and `scripts/credit-ledger-integration.ts:966`; the five Major findings are nested ternaries, aliases, and parameter count. The independent review examined the relevant transaction, CostGuard, reconciliation, compensation, and test branches. It found maintainability debt and inadequate Sonar coverage, but no demonstrated security/financial HIGH or CRITICAL behavior defect. This classification does not claim that 0.0% coverage is adequate.

## Post-merge receipts

Read-only GitHub evidence on the exact merged `main@f1ce1df2dad7aabb45dd7d725d31821f30e21a2c` showed all six runs completed successfully:

| Check | Run/check ID | Result |
|---|---:|---|
| Repository validation (required) | `117263474902` | SUCCESS |
| Pipeline integrity (required) | `117263474185` | SUCCESS |
| Gitleaks secrets (required) | `117263474196` | SUCCESS |
| Trivy filesystem and configuration (required) | `117263474575` | SUCCESS |
| SonarCloud Code Analysis | `117263669389` | SUCCESS |
| Socket Security: Project Report | `117263477361` | SUCCESS |

The main SHA and PR merge evidence are live at [PR #87](https://github.com/KayzenRoot/spryxel/pull/87). Exact workflow receipts: [Repository validation](https://github.com/KayzenRoot/spryxel/actions/runs/38987883775/job/117263474902), [Pipeline integrity](https://github.com/KayzenRoot/spryxel/actions/runs/38987883783/job/117263474185), [Gitleaks](https://github.com/KayzenRoot/spryxel/actions/runs/38987883800/job/117263474196), [Trivy](https://github.com/KayzenRoot/spryxel/actions/runs/38987883862/job/117263474575), [SonarCloud](https://sonarcloud.io/dashboard?id=KayzenRoot_spryxel&branch=main), and [Socket Project Report](https://socket.dev/dashboard/org/nexlabs/sbom/26e45f72-4f20-4544-bc83-6f242f3225bc).

## Decision and boundaries

`APPROVED` is limited to the admitted, non-commercial WO-009 foundation. The Work Order is complete on merged main; the checkpoint changes in this worktree are a post-merge promotion candidate and become canonical only after protected integration of the documentation-only closeout. `promotionHeadSha` and any future closeout merge SHA are deliberately not asserted here. This separation follows D-0006 (`.engineering/DECISIONS-LEDGER.md:22-23`) and the DoD auditor-promotion rule (`.engineering/DEFINITION-OF-DONE.md:23`, `:34`). The next NECESSARY increment follows D-153 (`.engineering/DECISIONS-LEDGER.md:802-804`).

The WO-009 Context Lock file remains unchanged and historical; do not reuse it. The next D-153 increment is Spryxel DNA + Asset core, `NOT_ADMITTED` pending a new Work Order and Context Lock at the then-current main base. Pricing, measured COGS, paid balances, external billing, GPU/model execution and production-provider selection remain NOT_FROZEN/NOT_AVAILABLE as recorded in canonical sources.
