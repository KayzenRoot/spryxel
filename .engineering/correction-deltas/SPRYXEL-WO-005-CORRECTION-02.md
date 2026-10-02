# SPRYXEL-WO-005 — Correction Delta 02

Status: SATISFIED / APPROVED  
Work Order: `SPRYXEL-WO-005 R2`  
Increment: `SPRYXEL-IMP-001`  
Previously approved code head: `ace62ffdb53bd5f602e23d1e9572955f2a5dc820`  
Promotion head superseded before merge: `90e8628fab2ea70adb7551fd67649c82aaea2987`

## Reason

Two review threads were created after the promotion commit and before merge. One is a valid bounded performance/scalability finding in the technical BullMQ probe; one is a documentation consistency correction. Because the code finding exists before merge, promotion is suspended and canonical promotion state is reverted on the PR branch until re-audit.

## C-09 — MEDIUM — avoid Redis KEYS in disposable queue cleanup

File: `apps/worker/src/queue-probe.ts`

The leftover-key verification currently calls Redis `KEYS` for the unique BullMQ probe prefix. Even with a unique prefix, `KEYS` scans the full keyspace and can block a shared/persistent Redis instance.

Required correction:
- replace `KEYS` with scoped incremental `SCAN` / `scanStream` matching only the probe namespace;
- stop once the first non-empty batch is found and preserve the existing leftover-key error;
- keep the check inside the existing best-effort cleanup wrapper so cleanup failures do not mask the original probe failure;
- preserve the global probe deadline and cleanup order introduced by Correction Delta 01;
- add/adjust focused coverage proving the cleanup verification no longer calls `KEYS` and repeated real probes still leave no disposable queue keys.

## C-10 — LOW — evidence post-push wording is stale

File: `.engineering/evidence/SPRYXEL-WO-005-EVIDENCE.md`

The Correction Delta 01 section says exact-head evidence “will be recorded” even though the PR description already contains it.

Required correction:
- change the sentence to present tense;
- preserve the rule that prior-SHA checks are not reused;
- do not duplicate or invent check IDs in the versioned file solely to make it self-referential.

## Scope guard

Correction only. Do not:
- change D-001…D-155;
- change package manifests/lockfile or dependencies;
- change SeaweedFS/provider choices;
- change canonical main checkpoint;
- change .gef / GEF 1.1.1;
- change workflows, ruleset/provider or source seed;
- add product features;
- begin Identity/Tenancy.

## Revalidation

Run:
- focused C-09 regression;
- `npm run format:check`;
- `npm run lint`;
- `npm run typecheck`;
- `npm run build`;
- `npm run architecture:check`;
- `npm run test:unit`;
- `npm run test:worker`;
- `npm run test:integration`;
- `npm run test:browser`;
- `npm test`;
- `npm audit --audit-level=high`;
- `git diff --check`;
- GEF doctor/status read-only evidence;
- four required GitHub checks on the new exact final head;
- zero unresolved review threads.

## STOP CONDITION

`SPRYXEL_IMP_001_PLATFORM_FOUNDATION_BOOTSTRAP_READY_FOR_AUDIT`

Do not merge. Do not promote checkpoint.

## RE-AUDIT CLOSURE

C-09 and C-10 were objectively verified on final audit head `a81ca67894265da3679d817db737a9af3aee9a79`.

- C-09: Redis KEYS removed; namespace-scoped incremental SCAN regression and real repeated probe evidence PASS.
- C-10: post-push wording corrected while retaining exact-head evidence rules.

Final status: `SATISFIED`.
