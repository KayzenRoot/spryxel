# SPRYXEL-WO-008 — SPRYXEL-IMP-004 Asset Contract + Durable Job Backbone

Tracking issue: #29

**Status:** ADMITTED_FOR_EXECUTION  
**Risk:** HIGH_ASSURANCE  
**Repository:** `KayzenRoot/spryxel`  
**Execution base:** `main@08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`  
**Authorized branch:** `codex/spryxel-wo-008-imp-004-asset-contract-jobs`  
**Implementation increment:** `SPRYXEL-IMP-004`  
**GEF:** `@gef-bootstrap/cli@1.1.1`

## OBJECTIVE

Implement the next NECESSARY increment in D-153 / IMPLEMENTATION-SEQUENCE: **Asset Contract + durable Job backbone**.

This increment must establish the durable operation boundary that every later generation/cost/QA/export slice can reuse:

1. immutable/versioned Asset Contract identity and envelope;
2. durable PostgreSQL Job + Attempt state;
3. replay-safe operation identity and bounded state machine;
4. Redis/BullMQ only as a transient reference/coordination projection;
5. a real worker consumer that can recover from queue loss/process crash by reconciling from PostgreSQL;
6. safe Jobs/Queue monitoring UX linked to canonical project/contract/job records.

This Work Order does **not** authorize generation, inference, paid/provider work, credits, ledger, CostGuard, Spryxel DNA, canonical Asset/Asset Version rows, QA, export, model routing, GPU execution or production provider selection.

The only executable job kind admitted here is a deterministic, non-costing contract-integrity operation used to prove the durable Job/Attempt/queue/worker boundary. No image/audio/3D output is produced.

## CONTEXT

Canonical state at admission:

- `SPRYXEL-WO-005 / SPRYXEL-IMP-001`: COMPLETE.
- `SPRYXEL-WO-006 / SPRYXEL-IMP-002`: COMPLETE.
- `SPRYXEL-WO-007 / SPRYXEL-IMP-003`: COMPLETE.
- Canonical main base: `08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`.
- Identity/Tenancy + WorkOS/AuthKit + project membership/RLS: CANONICAL.
- Projects + Global Shell/Home/Projects/Project Overview: CANONICAL.
- PostgreSQL is canonical durable state.
- Redis/BullMQ is transient coordination only.
- SeaweedFS remains local/test object storage but this increment stores no asset bytes.
- D-001…D-161 remain normative and unchanged.
- D-024 requires an explicit Asset Contract before inference.
- D-032 requires PostgreSQL to remain canonical for jobs.
- D-135 requires replay-sensitive mutations to reuse durable operation identity.
- D-141 requires PostgreSQL Job/Attempt records to remain canonical and Redis/BullMQ never to become the sole job record.
- D-144 keeps `apps/worker` as a separate Node process.
- D-153 selects Asset Contract + durable Job backbone as sequence item 4.
- Credit Ledger + CostGuard is the next NECESSARY increment and remains NOT_ADMITTED.
- Commercial pricing remains NOT_FROZEN.
- Benchmarks/COGS remain NOT_RUN / NOT_AVAILABLE.
- No production model/provider/GPU path is selected.

## SOURCE CHECK / PREFLIGHT

Before any product mutation:

1. verify exact branch/base against the Context Lock;
2. read all MUST_READ sources sufficiently to resolve this Work Order;
3. verify D-001…D-161 are byte-preserved;
4. inspect existing Project/Identity RLS, runtime-role proof, worker queue probe, Redis/BullMQ configuration, config schema, integration harness, browser harness and project UX;
5. run baseline format/lint/typecheck/build/unit/worker/integration/browser checks appropriate to prove the current base is healthy;
6. verify no unexpected Git drift outside this Work Order;
7. inspect exact installed BullMQ/ioredis/PostgreSQL APIs before implementation rather than guessing;
8. do not add a new package/dependency unless the existing workspaces cannot satisfy a concrete admitted requirement.

For any newly introduced direct dependency:

- exact stable version only;
- current Node 22 compatibility/peer check;
- license and current HIGH/CRITICAL advisory check;
- explicit workspace owner and architectural reason;
- one root npm lockfile;
- no wildcard/latest/beta-only dependency.

If current evidence requires a new external service/provider, general scheduler, financial service, production object-store provider or paid infrastructure to satisfy this slice, STOP `BLOCKED` and report the architectural decision needed.

## SCOPE

### A. Asset Contract foundation

1. Add a Spryxel-owned durable Asset Contract identity plus immutable contract versions in a forward-only migration.

2. Minimum identity/integrity:
   - UUIDv7-compatible opaque IDs;
   - explicit `tenant_id` + `project_id`;
   - `created_by_subject_id`;
   - monotonically increasing version number per contract identity;
   - contract envelope/schema version;
   - canonical planning `sku_id`;
   - canonicalized contract specification snapshot;
   - deterministic specification hash;
   - explicit execution bounds;
   - created timestamp;
   - no mutable-in-place contract version.

3. Contract versions are append-only. A newer version creates a new immutable row. Existing versions cannot be UPDATEd or DELETEd by application/worker runtime roles.

4. The contract envelope must be provider/model neutral.

5. The contract envelope must contain the cross-cutting bounded controls already owned by canonical API/architecture contracts:
   - max candidates;
   - max retries;
   - max repairs;
   - max wall time.

6. Exact numeric hard caps must be explicit, finite, tested and documented in the Evidence Bundle. They are safety limits, not commercial pricing or a claim that a SKU is inference-ready.

7. The canonical SKU registry must derive from the catalog already versioned in `.engineering/SCOPE.md`. Unknown SKU IDs are rejected.

8. Merely being present in the planning catalog does **not** make a SKU executable or promise its release. This increment records/validates contract identity only.

9. Do not freeze model ID, provider, pipeline, seed, credit price, wallet reservation, QA result, Asset ID, DNA version or export target as required execution fields in this slice. Those belong to later admitted increments.

10. Contract specification bytes must be bounded by an explicit maximum serialized size. Do not allow an unbounded JSON document.

11. Raw contract specification content must not be written to operational logs/traces. Log only safe IDs, version/hash, outcome and bounded metadata.

12. Implement a framework/provider-neutral domain compiler/envelope boundary that:
   - validates known `sku_id`;
   - canonicalizes the envelope deterministically;
   - hashes the canonical representation;
   - rejects malformed/unbounded input;
   - returns a versionable immutable contract snapshot.

13. Do not expose a production HTTP endpoint that accepts arbitrary uncompiled contract JSON directly from the browser/client in this increment. Future Generate/API/MCP callers must pass through a domain compiler/admitted per-SKU schema.

14. Read-only contract projection APIs may expose safe contract metadata required by Job detail. They must not expose secrets or future provider internals.

### B. Durable Job model

15. Add canonical PostgreSQL Job and Job Attempt records.

16. Minimum Job fields:
   - UUIDv7-compatible job ID;
   - tenant/project ownership;
   - creator subject;
   - exact referenced Asset Contract version;
   - bounded job kind;
   - durable status;
   - idempotency-key hash + normalized request hash;
   - max attempts;
   - attempt count;
   - available/queued time;
   - lease/claim expiry where needed for crash recovery;
   - cancellation request time where applicable;
   - terminal result/failure code;
   - created/updated/started/finished timestamps as applicable.

17. Minimum Job Attempt fields:
   - UUIDv7-compatible attempt ID;
   - job ID;
   - attempt number;
   - executor kind/version;
   - start/end timestamps;
   - outcome/failure code;
   - no provider/model/cost/output-byte fields unless objectively needed by this deterministic integrity operation.

18. The only admitted executable job kind is:
   - `asset_contract.integrity_check.v1`

19. Its behavior is deterministic and non-costing:
   - load the exact immutable contract version;
   - verify canonical envelope/schema/SKU/bounds/hash integrity;
   - return a safe result code;
   - produce no asset bytes;
   - call no model/provider/GPU;
   - reserve/debit no credits.

20. Job state machine for this increment is bounded to:
   - `queued`;
   - `running`;
   - `cancel_requested`;
   - `succeeded`;
   - `failed`;
   - `cancelled`.

21. Legal transitions must be explicitly encoded/tested. Illegal direct transitions fail closed.

22. Terminal jobs are immutable except for non-semantic administrative timestamps/evidence if objectively required. A terminal result cannot be rewritten from failed to succeeded or vice versa.

23. A Job references one exact contract version for its lifetime; it cannot be repointed to a newer version.

### C. Durable idempotency and replay

24. Creating the same durable job operation with the same authenticated subject + tenant/project + operation + idempotency key + normalized request must return/reuse the same Job ID.

25. Reusing the same key with a different normalized request must return a safe conflict and must not create a second Job.

26. Concurrent same-key creation must converge on exactly one Job.

27. Redis/BullMQ retries or duplicate deliveries must not create another durable Job or another concurrent active Attempt for the same claim.

28. Idempotency evidence is canonical in PostgreSQL. Redis keys are not sufficient proof.

29. Use hashes for idempotency keys at rest. Do not persist raw bearer/session tokens or secrets.

### D. Queue and dispatch boundary

30. Redis/BullMQ is a transient projection. The canonical Job row must exist before any queue reference is emitted.

31. Queue payload must contain the minimum durable reference, normally `jobId` plus a bounded schema/version discriminator if required. Do not duplicate full contract bodies, tenant secrets, access tokens or browser session material into Redis payloads.

32. BullMQ queue job identity must deterministically bind to the durable Job ID so duplicate enqueue attempts remain safe.

33. Queue loss must be recoverable from PostgreSQL without user recreation of the job.

34. Implement bounded reconciliation:
   - scan a finite batch of eligible durable queued/retryable work;
   - enqueue missing transient references;
   - never scan/process without a hard batch limit;
   - no unbounded hot loop.

35. A Redis restart/flush during an eligible queued job must not lose the durable operation. Reconciliation must recreate the transient reference.

36. Queue state is never used as authorization or terminal truth.

### E. Worker process and service identity

37. Turn `apps/worker` from technical-probe-only into a real bounded product consumer while preserving the existing technical probe/smoke coverage.

38. Worker must use a **separate least-privilege PostgreSQL service identity/role** from the web/API `spryxel_app` role.

39. The worker database role must be:
   - LOGIN only as required;
   - NOSUPERUSER;
   - NOBYPASSRLS;
   - NOCREATEDB;
   - NOCREATEROLE;
   - NOREPLICATION;
   - no broad role memberships;
   - no schema CREATE;
   - no access to billing/ledger/trust/identity secrets;
   - restricted only to contract/job/attempt processing paths required by this slice.

40. Prefer explicit RLS/service policies and/or narrowly scoped database functions for worker claim/finalize/recovery. Do not grant broad table UPDATE simply because it is convenient.

41. Add a runtime-role validator for the worker role analogous in strength to the existing application-role proof.

42. The worker must claim work atomically in PostgreSQL before executing it.

43. A successful claim creates exactly one active Attempt for the claim sequence.

44. Use a bounded lease/claim timeout or objectively equivalent crash-recovery mechanism.

45. Worker/process death after claim must not permanently strand a Job:
   - expired claims become eligible for bounded recovery;
   - recovery never exceeds max attempts;
   - after max attempts, Job becomes terminal failed with safe failure code.

46. Worker operation has an explicit wall-time timeout derived from the contract/job safety bound and an internal hard cap.

47. The worker must check cancellation at deterministic safe points and finalize a requested cancellation without fabricating success.

48. Worker logs contain safe job/attempt/contract IDs and outcome categories only, not raw contract bodies or credentials.

### F. Cancellation

49. Add a safe cancellation boundary for durable jobs.

50. Production HTTP may expose:
   - `POST /api/v1/projects/:projectId/jobs/:jobId/cancel`.

51. Cancel semantics:
   - queued -> cancelled when cancellation wins before claim;
   - running -> cancel_requested, then worker cooperatively finalizes cancelled at a safe point;
   - already terminal -> idempotently returns current terminal state;
   - another tenant/project -> safe not-found/permission behavior without existence leak.

52. Cancellation is allowed to:
   - the job creator; or
   - active tenant OWNER/ADMIN for that project context.
   Active MEMBERs who did not create the job may read but may not cancel it in this slice.

53. The application runtime role must not receive a generic privilege that lets arbitrary API code mark a Job `succeeded`/`failed`. Cancellation mutation must be narrowly constrained.

### G. User-facing read APIs

54. Add versioned read surfaces under `/api/v1`:
   - `GET /api/v1/projects/:projectId/jobs`;
   - `GET /api/v1/projects/:projectId/jobs/:jobId`;
   - safe read-only contract/version metadata sufficient for Job detail, using an endpoint shape consistent with existing project routing.

55. Do **not** add public production Job creation or generation endpoints in this increment.

56. Do **not** add an arbitrary raw-contract creation endpoint in this increment.

57. Every read/cancel route:
   - authenticates first;
   - resolves canonical subject/tenant/project;
   - applies application authorization;
   - relies on RLS as defense in depth;
   - returns RFC 9457-compatible safe errors;
   - preserves request ID;
   - never confirms another tenant's Job/Contract existence.

58. Pagination/list limits are bounded. No unbounded Job history response.

59. Job response exposes safe state, retryability/cancel eligibility, attempt summary, contract/SKU/version metadata and timestamps. It does not expose Redis keys, worker credentials, raw stack/provider errors or future cost policy internals.

### H. RLS / tenant isolation

60. Contract, contract-version, Job and Attempt tables are tenant/project scoped and protected by ENABLE + FORCE RLS.

61. Application reads require:
   - internal subject context;
   - active tenant membership;
   - exact project ownership/match.

62. Application-side creation services for contract/job foundation require active project membership and exact project ownership.

63. Missing security context returns zero protected rows and denies mutation.

64. Cross-tenant direct-ID Contract/Job/Attempt access is denied even if a caller knows the UUID.

65. Pooled application connections do not leak subject/tenant/project context.

66. Worker service policies may process jobs across tenants only through the admitted worker role/boundary and only for the specific contract-integrity job kind/state. They do not create a generic cross-tenant business read API.

67. A worker queue payload alone is never sufficient authorization to mutate a Job; claim/finalize must validate canonical PostgreSQL state.

### I. Jobs / Queue Center UX

68. Implement the first functional M-20 Jobs/Queue monitoring surface.

69. Global shell gains a functional Jobs link.

70. Minimum UX:
   - global/tenant Jobs list with optional project filter;
   - project-scoped recent Jobs on Project Overview;
   - Job detail;
   - safe status badge/state;
   - contract/SKU/version link/summary;
   - attempt count/history summary;
   - queued/running/cancel-requested/succeeded/failed/cancelled states;
   - safe cancel action only when eligible;
   - empty, loading, degraded, permission and not-found states;
   - no fake progress percentage.

71. Home recent-Jobs placeholder should become backed by durable Job data where safely available; when none exist, show honest empty state.

72. Project Overview recent-Jobs placeholder should become backed by durable Job data.

73. The UI must not expose contract raw JSON by default. Safe contract metadata is sufficient.

74. Mobile/tablet companion behavior must support Job monitoring and eligible cancellation without horizontal overflow or inaccessible controls.

75. Job state must remain discoverable after navigation/reload because it comes from durable backend state, not a toast/local store.

### J. Deterministic internal creation path for tests/future callers

76. Implement framework-independent domain/service functions for:
   - compiling/persisting a contract identity/version;
   - creating/reusing a durable Job idempotently;
   - requesting cancellation;
   - reading Job/Attempt state.

77. These functions are the future reuse point for Generate/API/MCP once their Work Orders are admitted.

78. For this increment, integration/worker/browser fixtures may call this internal service directly to seed real durable Jobs. Any test-only HTTP/session mechanics must remain impossible in production configuration.

79. No production user action may trigger inference or cost-bearing work.

## OUT OF SCOPE — HARD STOP

- model/GPU/inference execution;
- Model Router implementation;
- ComfyUI/provider adapter execution;
- paid/serverless inference;
- Credit Ledger;
- credit reservation/debit/refund;
- CostGuard/RevenueShield;
- billing/payment/provider;
- TrustShield risk graph/scoring;
- Spryxel DNA persistence/editor;
- canonical Asset/Asset Version tables;
- Asset Library/Asset Graph;
- generated candidate/output records;
- object-storage asset writes;
- QA/Integrity Gate/Production Score;
- repair pipeline;
- approval/version promotion;
- export/EngineBridge;
- Generate/Character/World/Tileset/Items Studio execution;
- API key/MCP OAuth/CLI credential surface;
- notifications system beyond existing affordance;
- project/team collaboration roles;
- production deployment/provider selection;
- pricing/credit freeze;
- D-001…D-161 mutation;
- WorkOS/AuthKit replacement;
- `.gef` / GEF mutation;
- workflow/ruleset/provider mutation;
- source-seed mutation;
- checkpoint self-promotion;
- next implementation increment.

## FILES / SOURCES TO READ

### MUST_READ

- `.engineering/CHECKPOINT.json`
- `.engineering/CHECKPOINT.md`
- `.engineering/SOURCE-HIERARCHY.md`
- `.engineering/DECISIONS-LEDGER.md`
- `.engineering/SCOPE.md`
- `.engineering/DEFINITION-OF-DONE.md`
- `.engineering/ARCHITECTURE.md`
- `.engineering/REQUIREMENTS.md`
- `.engineering/SECURITY.md`
- `.engineering/DATA-MODEL.md`
- `.engineering/PHYSICAL-DATA-CONVENTIONS.md`
- `.engineering/API-CONTRACTS.md`
- `.engineering/API-FOUNDATION-CONTRACT.md`
- `.engineering/IMPLEMENTATION-ARCHITECTURE.md`
- `.engineering/IMPLEMENTATION-SEQUENCE.md`
- `.engineering/RUNTIME-STACK.md`
- `.engineering/REPOSITORY-TOPOLOGY.md`
- `.engineering/INTEGRATION-CONTRACTS.md`
- `.engineering/TEST-BENCHMARK-PLAN.md`
- `.engineering/DEPLOYMENT.md`
- `.engineering/LOCAL-DEVELOPMENT.md`
- `.engineering/UI-UX.md`
- `.engineering/INFORMATION-ARCHITECTURE.md`
- `.engineering/SCREEN-INVENTORY.md`
- `.engineering/UX-DESIGN-SYSTEM.md`
- `.engineering/UX-FLOWS.md`
- `.engineering/UX-STATE-CONTRACTS.md`
- `.engineering/UX-WIREFRAME-CONTRACTS.md`
- `AGENTS.md`
- current Project/Identity migrations and DB implementation;
- current `apps/worker` queue probe/runtime;
- current API project routes;
- current Global Shell/Home/Project Overview;
- `package.json`, `package-lock.json`;
- this Work Order and Context Lock.

## REQUIREMENTS

- Preserve D-001…D-161 unchanged.
- Preserve GEF 1.1.1 and existing GitHub governance.
- PostgreSQL remains canonical durable truth.
- Redis/BullMQ remains transient.
- Durable Job exists before queue reference.
- Queue loss/restart is recoverable from PostgreSQL.
- Durable Contract versions are immutable.
- Durable Jobs/Attempts are tenant/project owned.
- New IDs are UUIDv7-compatible.
- Job creation is idempotent.
- Duplicate delivery is safe.
- Execution is bounded by attempt count and wall-time.
- No cost-bearing operation is admitted.
- No AI/provider/model call is admitted.
- Worker uses a separate least-privilege database identity.
- App authorization + RLS both remain required.
- Web never imports DB/worker provider implementation.
- No bearer/session/worker credential in browser storage, queue payloads, logs or contract snapshots.
- Errors remain safe/machine-readable.
- Final Evidence Bundle/review is PT-BR.

## ARCHITECTURE RULES

- `apps/web`: presentation/API client only.
- `apps/api`: authenticated HTTP read/cancel orchestration; no worker execution.
- `apps/worker`: bounded transient queue reconciliation + consumer.
- `packages/contracts`: boundary schemas only; no DB/BullMQ/provider SDK.
- `packages/domain`: Asset Contract and Job state/idempotency/transition invariants; no Fastify/Next/pg/BullMQ.
- `packages/db`: migrations, repositories, RLS, role proofs and DB transactions.
- Reuse existing workspaces unless a new package has at least two concrete consumers and a clear dependency-direction reason.
- No direct Web -> DB.
- No Redis-only truth.
- No client-supplied tenant/project/job ID as authorization proof.
- No worker broad super-role/bypass-RLS shortcut.
- No general microservice/scheduler architecture.
- No future ledger/cost/provider abstraction disguised as a placeholder.

## ACCEPTANCE CRITERIA

1. Context Lock is FRESH at executor preflight.
2. D-001…D-161 are byte-preserved.
3. Existing WO-006/WO-007 auth/project/RLS regressions remain PASS.
4. New migrations are forward-only and migration status/idempotency remain correct.
5. Asset Contract identity/version schema is tenant/project owned and RLS protected.
6. Contract versions are immutable for application and worker runtime roles.
7. Unknown SKU ID is rejected; known catalog ID structural envelope is accepted without implying generation availability.
8. Contract canonicalization/hash is deterministic across property order/semantically equivalent normalized envelope inputs defined by the compiler contract.
9. Contract specification size and bounds are explicitly capped and over-limit inputs fail safely.
10. Contract raw specification is absent from operational logs/queue payloads.
11. Job/Attempt are canonical PostgreSQL rows with UUIDv7-compatible IDs.
12. Job references one exact immutable contract version.
13. Job states/transitions match the admitted state machine and illegal transitions are rejected.
14. Same idempotency key + same normalized request returns one Job.
15. Same key + different request returns conflict with no second Job.
16. Concurrent same-key creation yields exactly one Job.
17. Queue message is emitted only after durable Job exists.
18. Queue payload contains only the minimum durable reference/schema data.
19. Duplicate queue delivery cannot create a duplicate active Attempt or duplicate terminal transition.
20. Redis queue loss can be reconstructed from PostgreSQL queued state.
21. Reconciliation is hard-bounded by batch size/time and leaves no infinite hot loop.
22. Worker role is distinct from `spryxel_app`, NOBYPASSRLS, non-privileged and least-privilege verified.
23. Worker role cannot read/write identity, billing, trust or unrelated product tables beyond explicitly admitted references.
24. Worker atomically claims a Job and creates one Attempt.
25. Worker crash/forced termination after claim is recovered after lease expiry.
26. Recovery never exceeds max attempts.
27. Exhausted attempts produce terminal failed state exactly once.
28. Integrity-check job succeeds deterministically for a valid contract and calls no provider/model/GPU/object-storage asset path.
29. Corrupt/invalid contract evidence produces terminal safe failure without leaking raw contract content.
30. Queued cancellation reaches cancelled without worker success.
31. Running cancellation becomes cancel_requested then cancelled at safe point.
32. Terminal cancellation request is idempotent and does not rewrite terminal result.
33. Unauthorized/cross-tenant cancellation/read does not reveal Job existence.
34. Active project members can read project Jobs; cancellation follows creator-or-tenant-OWNER/ADMIN policy.
35. Missing RLS context returns no Contract/Job/Attempt protected rows.
36. Cross-tenant direct-ID Contract/Job/Attempt access is denied using real PostgreSQL.
37. Pooled connections do not leak project/job RLS context.
38. GET Job list/detail routes are bounded/paginated and return safe contract/job metadata.
39. Cancel route returns safe RFC 9457-compatible outcomes with request ID.
40. No production public create-generation/job/raw-contract endpoint is added.
41. Global shell Jobs link is functional.
42. Jobs Center handles empty/loading/degraded/permission/not-found states.
43. Jobs Center renders queued/running/cancel-requested/succeeded/failed/cancelled safely.
44. Job detail shows contract SKU/version/hash-safe metadata and Attempt summary, not raw contract JSON.
45. Home recent Jobs is durable-data-backed or honest empty.
46. Project Overview recent Jobs is durable-data-backed or honest empty.
47. Browser refresh/navigation preserves Job state from backend.
48. Mobile/companion Job monitoring and eligible cancellation are usable.
49. Web architecture boundary remains free of DB/BullMQ imports.
50. `format:check`, lint, typecheck, build and architecture check PASS.
51. Unit tests PASS.
52. Worker smoke/product consumer tests PASS.
53. Real PostgreSQL/Redis/SeaweedFS integration PASS.
54. Job/queue crash/recovery/replay tests use real PostgreSQL + Redis, not a mock queue.
55. Browser tests PASS.
56. Aggregate `npm test` PASS.
57. `npm audit --audit-level=high` has zero unresolved HIGH/CRITICAL relevant findings.
58. Gitleaks, Trivy, Repository validation and Pipeline integrity PASS on exact final head.
59. Existing Sonar/quality/security checks pass on exact final head.
60. No unresolved CRITICAL/HIGH finding remains.
61. No hard-out-of-scope module is implemented.
62. Evidence Bundle + proposed Checkpoint Delta are versioned.
63. Executor does not merge or promote checkpoint.

## TESTS / EVIDENCE

Run and record at minimum:

- exact base/head SHA and Context Lock result;
- exact Node/npm versions;
- baseline suite before mutation;
- `npm ci --no-audit --no-fund`;
- migration apply/status/idempotency;
- app runtime-role proof;
- new worker-role privilege/RLS proof;
- contract RLS missing-context/cross-tenant proof;
- contract immutable-version proof;
- deterministic canonicalization/hash proof;
- unknown SKU/oversized spec/out-of-bound limits;
- job state-machine unit tests;
- same-key replay + different-body conflict + concurrent creation;
- durable-before-enqueue proof;
- duplicate delivery proof;
- Redis loss/rebuild proof;
- worker claim/Attempt exactly-once proof;
- forced worker crash/lease-expiry/recovery proof;
- max-attempt exhaustion proof;
- queued and running cancellation races;
- worker cross-tenant/service-role access proof;
- pooled context isolation;
- no-secret/no-contract-body queue/log proof;
- list/detail/cancel API tests;
- Jobs Center empty/state/detail/cancel browser tests;
- Home/Project Overview recent-job browser tests;
- mobile viewport/keyboard/focus/theme/reduced-motion regressions;
- architecture checker;
- format/lint/typecheck/build;
- unit;
- worker;
- integration with real PostgreSQL/RLS + Redis/BullMQ + SeaweedFS baseline;
- browser;
- aggregate `npm test`;
- `npm audit --audit-level=high`;
- `git diff --check`;
- exact GEF 1.1.1 assertion;
- `gef doctor --target . --json`;
- two deterministic `gef status --target . --json` reads interpreted under D-0007;
- four required GitHub checks on exact final head;
- Sonar/other existing repository checks on exact final head;
- changed-file + hard-out-of-scope proof.

## DELIVERABLES

- forward-only Asset Contract/Job/Attempt migration(s);
- immutable Asset Contract envelope/version domain + persistence;
- durable Job/Attempt state machine + idempotency;
- bounded queue reconciliation;
- separate least-privilege worker DB role/config/proof;
- real `apps/worker` product consumer for `asset_contract.integrity_check.v1`;
- crash/lease recovery;
- cancellation boundary;
- Job list/detail/cancel APIs;
- functional Jobs/Queue Center;
- Home/Project Overview durable recent Jobs;
- deterministic unit/integration/browser regressions;
- `.engineering/evidence/SPRYXEL-WO-008-EVIDENCE.md`;
- `.engineering/checkpoint-deltas/SPRYXEL-WO-008-PROPOSED.md`;
- updated PR description with exact-head evidence.

## REVIEW FORMAT

PT-BR:

- base/head SHA and Context Lock;
- schema/migration delta;
- Asset Contract envelope/version invariants;
- Job/Attempt state machine;
- app role + worker role privilege/RLS matrix;
- idempotency/concurrency;
- queue transient/canonical PostgreSQL proof;
- Redis loss/rebuild;
- crash/lease recovery;
- cancellation race behavior;
- API contracts/errors/redaction;
- Jobs Center/Home/Project Overview UX;
- accessibility/responsive/theme;
- architecture boundaries;
- format/lint/typecheck/build/unit/worker/integration/browser/npm-test/audit;
- GitHub/Sonar/security checks;
- changed paths;
- CRITICAL/HIGH/MEDIUM/LOW findings;
- hard-out-of-scope proof;
- proposed Checkpoint Delta;
- candidate verdict `READY_FOR_AUDIT` or `BLOCKED`.

## STOP CONDITION

`SPRYXEL_IMP_004_ASSET_CONTRACT_DURABLE_JOB_BACKBONE_READY_FOR_AUDIT`

Do not merge. Do not promote checkpoint. Do not start Credit Ledger/CostGuard or any later increment.
