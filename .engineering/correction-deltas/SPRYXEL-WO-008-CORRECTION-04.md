# SPRYXEL-WO-008 — Correction Delta 04

Status: CORRECTION REQUIRED  
Risk: HIGH_ASSURANCE  
Work Order: `SPRYXEL-WO-008`  
Increment: `SPRYXEL-IMP-004`  
Audited candidate head: `a407eb84fe5abb5bb3697e903f509e85862cd37b`  
Execution base: `main@08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`

## Re-audit result

C-03-A is materially satisfied.

Verified on the exact audited candidate:

- `platform.job_attempt` now persists immutable `executor_kind` and `executor_version`;
- existing Attempts are deterministically backfilled to `spryxel.asset_contract.integrity_worker` / `v1`;
- claim/Attempt insertion receives canonical executor provenance through the DB trigger;
- runtime roles cannot UPDATE executor provenance directly;
- worker keeps function-only access and no generic Job/Attempt DML;
- safe Job projection exposes semantic executor kind/version without exposing worker instance IDs;
- real PostgreSQL integration covers claim provenance, denied runtime UPDATE, duplicate delivery, retry/crash with stable executor version and distinct Attempts, RLS and cross-tenant isolation;
- unit `93/93`, worker, real PostgreSQL/RLS + Redis/BullMQ + SeaweedFS integration, serialized browser `19/19`, serialized aggregate test, dependency audit and hosted checks are recorded PASS;
- exact-head Repository validation, Pipeline integrity, Gitleaks, Trivy, SonarCloud and both Socket checks pass;
- 13 review threads exist and 0 are unresolved;
- Work Order, Context Lock and D-001…D-161 remain byte-preserved.

One acceptance defect remains and blocks APPROVED.

## C-04-A — MEDIUM, blocking — canonical browser/aggregate acceptance is nondeterministic under the repository's default Playwright configuration

The canonical repository configuration explicitly uses:

`playwright.config.ts -> fullyParallel: true`

and the Work Order requires the canonical commands:

- `npm run test:browser`;
- `npm test`;

to PASS.

The current Evidence/PR states that:

- the default parallel browser execution reproduced a race in the shared fixture;
- the accepted browser result used `npm run test:browser -- --workers=1`;
- the accepted aggregate result used `npm test -- -- --workers=1`.

That is not equivalent to proving the repository's canonical browser and aggregate commands. Serializing the suite masks a shared mutable fixture collision rather than proving the default test harness is deterministic.

The current fixture confirms the likely collision source: multiple fully-parallel tests reuse the same logical fixture scope (for example `jobs-populated`) backed by process-global in-memory Maps/Job state. One test can cancel/mutate the durable Job fixture while another parallel test expects the original state.

### Required correction

Fix test isolation without weakening the canonical test configuration.

1. Preserve `fullyParallel: true`.
2. Do not set global/default workers to 1 as the fix.
3. Give tests that mutate fixture state unique scopes/tenant/project/job identities, or otherwise namespace/reset fixture state so parallel tests cannot observe each other's mutations.
4. In particular, do not let a cancellation test and a read/overview test share the same mutable `jobs-populated` fixture Job.
5. Keep the deterministic browser API fixture impossible in production.
6. Do not add sleeps/retries as the primary fix.
7. Do not weaken assertions.
8. Do not serialize the entire file/suite merely to hide shared-state coupling.
9. If a small helper is needed to generate per-test scopes, keep it bounded and deterministic.
10. Preserve all existing auth/session/project/job fixture semantics.

### Required regression evidence

After the isolation fix:

- run `npm run test:browser` **exactly as defined in package.json**, with no `--workers=1` override, at least twice consecutively;
- both runs must pass `19/19` (or the new deterministic total if a focused regression is added);
- run `npm test` **exactly as defined in package.json**, with no browser-worker override;
- aggregate must PASS;
- add/order a regression proving that the formerly colliding scenarios can execute concurrently without shared-state contamination;
- keep `fullyParallel: true`;
- no test-only production escape hatch may be added.

## C-04-B — acceptance evidence cleanup

Update the final Evidence Bundle and PR description so that the canonical final acceptance clearly reports:

- default `npm run test:browser`: PASS;
- default `npm test`: PASS;
- any prior serialized-only runs are historical/superseded;
- exact final candidate SHA;
- exact-head hosted checks for that SHA;
- 0 unresolved review threads.

The self-reference handling from Correction-03 remains unchanged: exact hosted check IDs live in the PR attestation until auditor promotion.

## Accepted from prior corrections

Do not reopen unless a new regression appears:

- C-01-A…J;
- C-02-A/B;
- C-03-A;
- C-02-C governance interpretation.

## Acceptance rerun

After C-04-A/B:

- clean install;
- format/lint/typecheck/build/architecture;
- unit;
- worker;
- real PostgreSQL/RLS + Redis/BullMQ + SeaweedFS integration;
- `npm run test:browser` with canonical default parallel config, twice consecutively;
- `npm test` with canonical default command;
- `npm audit --audit-level=high`;
- `git diff --check`;
- GEF doctor/status read-only under D-0007;
- update Evidence Bundle + PR description;
- four required GitHub checks + SonarCloud + Socket on the new exact final head;
- zero unresolved review threads.

Do not reuse hosted checks from `a407eb84fe5abb5bb3697e903f509e85862cd37b` after changes.

## Scope guard

Do not:

- edit the fingerprint-bound Work Order or Context Lock;
- disable `fullyParallel` or globally force one worker to conceal the race;
- reopen WO-007/PR #27;
- start Credit Ledger/CostGuard or any later slice;
- implement inference/model/GPU/provider execution;
- add downstream Asset/DNA/QA/export systems;
- change WorkOS/AuthKit;
- change D-001…D-161;
- mutate GEF/.gef, workflows, ruleset/provider or source seed;
- merge PR #30;
- promote checkpoint.

## STOP CONDITION

After C-04-A/B is objectively satisfied and complete exact-head evidence passes:

`SPRYXEL_IMP_004_ASSET_CONTRACT_DURABLE_JOB_BACKBONE_READY_FOR_AUDIT`

Do not merge. Do not promote checkpoint. Do not start Credit Ledger/CostGuard.
