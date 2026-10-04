# SPRYXEL-WO-008 — Correction Delta 02

Status: CORRECTION REQUIRED  
Risk: HIGH_ASSURANCE  
Work Order: `SPRYXEL-WO-008`  
Increment: `SPRYXEL-IMP-004`  
Audited candidate head: `ba8cd741b86533ef8e5e1f72e07f2c0d7caa692e`  
Execution base: `main@08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`

## Re-audit result

Correction Delta 01 is materially satisfied:

- C-01-A…C-01-J are corrected in the current candidate;
- Work Order, Context Lock and D-001…D-161 remain byte-preserved;
- `main` remains the authorized base;
- HIGH_ASSURANCE acceptance is recorded PASS under Node `22.23.3` / npm `10.9.9`;
- unit `91/91`, worker, real PostgreSQL/RLS + Redis/BullMQ + SeaweedFS integration, browser `19/19`, aggregate `npm test`, dependency audit and architecture checks pass;
- exact-head Repository validation, Pipeline integrity, Gitleaks and Trivy pass;
- SonarCloud Quality Gate and Socket checks pass on the exact audited head;
- 13 review threads exist and zero remain unresolved.

The candidate is still **not approvable** because two independent Work Order invariants are not implemented as specified, plus one evidence-governance gap must be closed on the final candidate.

## C-02-A — MEDIUM, blocking — Asset Contract is missing its required immutable execution bounds

The Work Order requires the Asset Contract envelope/version itself to contain explicit bounded controls:

- max candidates;
- max retries;
- max repairs;
- max wall time.

Current implementation:

- `CompiledAssetContract` contains schema version, SKU, specification, canonical specification and hashes only;
- `platform.asset_contract_version` persists SKU/specification/hash but no execution bounds;
- `durable_job` carries fixed `max_attempts = 3` and `max_wall_time_ms = 5000`, but those Job fields do not satisfy the requirement that the **contract envelope/version** owns the cross-cutting bounds;
- max candidates and max repairs are absent from the durable contract entirely;
- the worker uses a local `operationBudgetMs = 5000` constant rather than reading/deriving the execution timeout from the persisted contract/job bound.

This leaves the central Asset Contract incomplete and creates drift risk between compiler, durable contract, durable Job and worker execution.

### Required correction

Implement the smallest provider-neutral immutable execution-bounds model.

1. The compiled Asset Contract must expose explicit finite values for:
   - `maxCandidates`;
   - `maxRetries`;
   - `maxRepairs`;
   - `maxWallTimeMs`.

2. These controls must be compiler-owned/admitted safety values for this slice, not arbitrary browser/provider fields and not pricing claims.

3. Exact numeric values and semantics must be documented in the Evidence Bundle. They must be conservative for the non-generating `asset_contract.integrity_check.v1` operation and consistent with existing Job attempt/wall-time behavior.

4. Persist the bounds immutably with the exact Asset Contract version. Application/worker runtime roles must not be able to mutate them after insertion.

5. The contract canonicalization/request identity must deterministically bind the execution bounds so an Asset Contract version cannot silently change its safety envelope while retaining the same logical identity/hash evidence.

6. PostgreSQL must validate the admitted bounds independently; malformed/out-of-range values fail closed.

7. Durable Job creation must copy/derive the relevant Job execution limits from the exact referenced contract version rather than from an unrelated hidden constant.

8. Worker claim/execution must consume the persisted wall-time bound with an internal hard cap. No caller may raise execution above the hard cap.

9. Do not introduce model/provider/GPU/pricing/credit fields.

10. Preserve provider/model neutrality and the existing SKU catalog semantics.

### Required regression evidence

At minimum prove:

- compiler returns all four bounds deterministically;
- same specification + same admitted bounds produces identical canonical/hash/request identity;
- any differing bound changes the contract/request identity;
- persisted contract version exposes the exact immutable bounds;
- runtime roles cannot UPDATE the bounds;
- PostgreSQL rejects out-of-range/tampered bounds;
- Job max-attempt/retry semantics are derived consistently from contract bounds;
- worker wall-time uses persisted bound and cannot exceed the internal hard cap;
- no inference/provider/GPU/cost path is introduced.

## C-02-B — MEDIUM, blocking — cancellation can be finalized by reconciliation before the worker reaches a safe point

WO-008 requires:

- `running -> cancel_requested`;
- the **worker cooperatively finalizes cancelled at a deterministic safe point**;
- a crashed worker must still be recoverable through the bounded lease mechanism.

Current PostgreSQL behavior conflicts with that contract:

1. `request_job_cancel()` changes a running Job to `cancel_requested` and clears `lease_expires_at`.
2. `reconcile_jobs()` immediately scans every `cancel_requested` Job, marks the running Attempt `cancelled`, and marks the Job `cancelled`.
3. This reconciliation can run concurrently while the BullMQ processor is still executing the operation.
4. Therefore durable state can say `cancelled` before the active worker reaches its safe point.
5. Clearing the lease also removes the durable way to distinguish an active cancelling worker from one that died after receiving cancellation.

The current integrity operation has no external side effects, but this Work Order explicitly establishes the reusable Job backbone, so the cancellation invariant must be correct before promotion.

### Required correction

Preserve the existing state machine names and close only this race.

1. For a running Job, cancellation must move to `cancel_requested` while retaining an objectively valid claim/lease until either:
   - the active worker reaches its deterministic safe point and finalizes `cancelled`; or
   - the active claim expires and bounded reconciliation safely finalizes/recoveries the cancellation.

2. `reconcile_jobs()` must **not** immediately finalize a `cancel_requested` Job whose active lease/claim is still valid.

3. `finish_job()` must continue to convert a valid active `cancel_requested` claim to terminal `cancelled`, never `succeeded`.

4. If the worker dies after cancellation is requested, lease expiry must eventually reach a terminal cancelled state without re-running the integrity operation and without stranding the Job.

5. A stale worker/attempt whose lease has been invalidated/expired must not later rewrite terminal state.

6. Cancellation remains idempotent for already terminal Jobs.

7. Do not add external cancellation services, schedulers or new dependencies.

### Required regression evidence

At minimum prove with real PostgreSQL + worker behavior:

- running Job -> cancel_requested preserves a bounded active claim;
- immediate reconciliation while the lease is valid does not mark the Job terminal;
- worker safe-point finalization produces `cancelled` exactly once;
- cancel request + forced worker death -> lease expiry -> terminal `cancelled` without a new execution attempt;
- stale post-expiry finish cannot rewrite the terminal state;
- queued cancellation remains immediate;
- terminal cancellation remains idempotent;
- no success can be committed after a valid cancellation request.

## C-02-C — LOW, required governance proof — Evidence Bundle must carry its own exact final-head evidence

The current Evidence Bundle records the authorized base and historical acceptance runs, but delegates the exact final candidate SHA and hosted check URLs/conclusions to the PR description.

Project governance requires the Evidence Bundle itself to identify the exact base/head and exact-head hosted evidence.

### Required correction

On the final candidate:

1. update the top-level Evidence Bundle metadata with the exact final head SHA;
2. include the exact required-check IDs/URLs/conclusions for that same SHA;
3. include Sonar/Socket conclusions for that same SHA;
4. clearly mark historical/pre-hardening acceptance tables as superseded so there is one unambiguous final acceptance set;
5. keep the PR description consistent with the bundle;
6. do not claim checks from a prior SHA.

This documentation correction must be included in the final exact-head check cycle.

## Accepted findings from prior review

The auditor accepts the current Correction-01 implementations for:

- cancel action error handling;
- ProjectApiError classification;
- BullMQ blocking Redis connection + bounded safe telemetry;
- production worker credential separation;
- microsecond-safe Job pagination;
- canonical byte-limit alignment;
- PostgreSQL-jsonb-safe string/key validation;
- local existing-database worker-role reconciliation;
- browser fixture isolation;
- rollback root-error preservation;
- Docker CLI absolute-path hardening.

Do not reopen these unless a new regression appears.

## Acceptance rerun

After C-02-A/B/C are satisfied, rerun the complete WO-008 HIGH_ASSURANCE acceptance under canonical Node `22.23.3` / npm `10.9.9`:

- `npm ci --no-audit --no-fund`;
- canonical format check;
- lint;
- typecheck;
- build;
- architecture check;
- unit;
- worker;
- real PostgreSQL/RLS + Redis/BullMQ + SeaweedFS integration;
- queue loss/rebuild, duplicate delivery, crash/lease recovery, cancellation and retry exhaustion;
- browser;
- aggregate `npm test`;
- `npm audit --audit-level=high`;
- `git diff --check`;
- GEF 1.1.1 doctor/status read-only under D-0007;
- update Evidence Bundle + PR description;
- all four required GitHub checks on the new exact final head;
- SonarCloud + Socket existing checks on the same head;
- zero unresolved review threads.

Do not reuse required checks from `ba8cd741b86533ef8e5e1f72e07f2c0d7caa692e` after code/evidence changes.

## Scope guard

Do not:

- edit the fingerprint-bound Work Order or Context Lock;
- reopen WO-007/PR #27;
- start Credit Ledger/CostGuard or any later slice;
- implement inference/model/GPU/provider execution;
- add Asset/AssetVersion/Library/QA/export/DNA downstream systems;
- change WorkOS/AuthKit;
- change D-001…D-161;
- mutate GEF/.gef, workflows, ruleset/provider or source seed;
- merge PR #30;
- promote checkpoint.

## STOP CONDITION

After every requirement above is objectively satisfied and exact-head evidence passes:

`SPRYXEL_IMP_004_ASSET_CONTRACT_DURABLE_JOB_BACKBONE_READY_FOR_AUDIT`

Do not merge. Do not promote checkpoint. Do not start Credit Ledger/CostGuard.
