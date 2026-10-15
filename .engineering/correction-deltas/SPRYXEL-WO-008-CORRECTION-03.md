# SPRYXEL-WO-008 — Correction Delta 03

Status: CORRECTION REQUIRED  
Risk: HIGH_ASSURANCE  
Work Order: `SPRYXEL-WO-008`  
Increment: `SPRYXEL-IMP-004`  
Audited candidate head: `16be0f7d0575dc8cf6249017e8a32e3979e2fbf1`  
Execution base: `main@08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`

## Re-audit result

Correction Delta 02 is materially satisfied for C-02-A and C-02-B.

Verified on the exact audited candidate:

- Asset Contract execution bounds are explicit, immutable and persisted:
  - `maxCandidates = 1`;
  - `maxRetries = 2`;
  - `maxRepairs = 0`;
  - `maxWallTimeMs = 5000`.
- request identity binds SKU + specification hash + execution bounds.
- PostgreSQL independently constrains the admitted bounds.
- durable Job max attempts/wall time are derived from the exact contract version.
- worker reads the persisted bound for its active claim and clamps execution to the internal 5000 ms hard cap.
- running cancellation preserves the active lease.
- reconciliation does not terminalize `cancel_requested` while its lease is valid.
- worker safe-point finalization reaches `cancelled` exactly once.
- cancelled-after-worker-crash reaches terminal `cancelled` after lease expiry without a new execution Attempt.
- stale finish after expiry/terminal state cannot rewrite success.
- exact-head HIGH_ASSURANCE acceptance is recorded PASS under Node `22.23.3` / npm `10.9.9`.
- unit `93/93`, worker, real PostgreSQL/RLS + Redis/BullMQ + SeaweedFS integration, browser `19/19`, aggregate `npm test`, audit and architecture checks pass.
- Repository validation, Pipeline integrity, Gitleaks, Trivy, SonarCloud and both Socket checks pass on exact head `16be0f7d0575dc8cf6249017e8a32e3979e2fbf1`.
- 13 review threads exist; 0 are unresolved.
- Work Order, Context Lock and D-001…D-161 remain byte-preserved.

One Work Order requirement remains objectively incomplete.

## C-03-A — MEDIUM, blocking — Job Attempt is missing executor kind/version provenance

WO-008 section B.17 defines the minimum Job Attempt fields and explicitly requires:

- executor kind/version;
- start/end timestamps;
- outcome/failure code.

Current `platform.job_attempt` persists:

- id;
- job/tenant/project;
- attempt number;
- status;
- `worker_id`;
- lease token;
- safe failure code;
- started/completed timestamps.

`worker_id` is an instance identifier (for example a UUID-suffixed worker identity). It is **not** a stable executor kind and does not identify the executor contract/version that produced the Attempt.

This weakens durable provenance for the backbone that later generation, cost, QA and recovery slices must rely on.

### Required correction

Implement the smallest immutable executor provenance contract.

1. Add forward-only Attempt columns for:
   - `executor_kind`;
   - `executor_version`.

2. Use bounded, provider-neutral constants for this slice, for example semantic identifiers equivalent to:
   - kind: Spryxel Asset Contract integrity worker;
   - version: v1 of the admitted executor contract.
   Exact names may follow repository naming conventions but must be explicit and bounded.

3. Do not use package version `0.0.0` as the semantic executor contract unless the canonical architecture explicitly defines that coupling. Prefer a stable executor-contract identifier/version owned by the Job backbone.

4. Persist both values at atomic claim/Attempt creation time.

5. They must be immutable after Attempt insertion for runtime roles.

6. The worker role must not gain generic table DML privileges to set/modify them directly.

7. Job detail/Attempt response may expose the safe executor kind/version if consistent with the existing safe contract; raw worker instance IDs do not need to become public.

8. Existing Attempts upgraded by the forward-only migration must receive the canonical executor kind/version for this sole admitted operation, with a deterministic migration path.

9. Add real PostgreSQL evidence proving:
   - claim persists the expected executor kind/version;
   - duplicate delivery does not create a second provenance record;
   - crash/retry creates a new Attempt with the same executor contract version and a distinct Attempt identity;
   - application and worker runtime roles cannot UPDATE executor provenance;
   - cross-tenant/RLS behavior remains unchanged.

10. Add domain/contracts tests as needed without broadening into a general executor registry or provider/model identity system.

## C-03-B — auditor resolution of the C-02-C self-reference loop

The executor correctly identified that a Git-tracked Evidence Bundle cannot contain the IDs/URLs of GitHub checks for its **own exact commit**, because those checks are created only after the commit exists. Editing the bundle afterward produces a new SHA and therefore a new set of checks.

The original C-02-C wording was therefore self-referential and cannot be satisfied literally without an infinite commit/check loop.

### Canonical auditor interpretation

For the implementation candidate:

1. the versioned Evidence Bundle must contain:
   - authorized base;
   - Work Order/Context Lock identity;
   - complete local HIGH_ASSURANCE evidence;
   - clear statement that exact hosted evidence is attached after commit;
   - no claim that pre-existing check IDs validate a later SHA.

2. the PR description acts as the live exact-head attestation for:
   - candidate SHA;
   - required check IDs/URLs/conclusions;
   - Sonar/Socket exact-head results;
   - unresolved thread count.

3. after independent audit returns `APPROVED`, the **auditor promotion commit** may update the Evidence Bundle/checkpoint governance docs with the audited candidate SHA and its hosted check IDs. The promotion commit then receives its own required checks before merge.

4. post-merge validation is recorded against the resulting exact `main` SHA.

This breaks the self-reference cleanly while preserving objective provenance at candidate, promotion and post-merge stages.

No executor code/document correction is required solely for C-02-C beyond keeping the Evidence Bundle/PR description internally consistent after C-03-A.

## Required acceptance rerun

After C-03-A is implemented, rerun the complete WO-008 HIGH_ASSURANCE acceptance under Node `22.23.3` / npm `10.9.9`:

- clean install;
- format/lint/typecheck/build/architecture;
- unit;
- worker;
- real PostgreSQL/RLS + Redis/BullMQ + SeaweedFS integration;
- Attempt provenance;
- idempotency/replay/concurrency;
- queue loss/rebuild;
- duplicate delivery;
- crash/lease/recovery;
- max-attempt exhaustion;
- queued/running cancellation;
- browser;
- aggregate `npm test`;
- `npm audit --audit-level=high`;
- `git diff --check`;
- GEF doctor/status read-only under D-0007;
- Evidence Bundle updated with final local evidence;
- PR description updated with the **new exact final head** and exact-head hosted check IDs;
- four required GitHub checks + SonarCloud + Socket on the new exact head;
- zero unresolved review threads.

Do not reuse hosted checks from `16be0f7d0575dc8cf6249017e8a32e3979e2fbf1` after code/evidence changes.

## Scope guard

Do not:

- edit the fingerprint-bound Work Order or Context Lock;
- reopen WO-007/PR #27;
- start Credit Ledger/CostGuard or any later slice;
- implement inference/model/GPU/provider execution;
- introduce a general executor/provider registry;
- add Asset/AssetVersion/Library/QA/export/DNA downstream systems;
- change WorkOS/AuthKit;
- change D-001…D-161;
- mutate GEF/.gef, workflows, ruleset/provider or source seed;
- merge PR #30;
- promote checkpoint.

## STOP CONDITION

After C-03-A is objectively satisfied and the complete exact-head evidence passes:

`SPRYXEL_IMP_004_ASSET_CONTRACT_DURABLE_JOB_BACKBONE_READY_FOR_AUDIT`

Do not merge. Do not promote checkpoint. Do not start Credit Ledger/CostGuard.
