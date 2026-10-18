# SPRYXEL-WO-010 / IMP-006: Versioned DNA + Asset Core

> **Status: CANDIDATE / PLANNING ONLY / NOT_ADMITTED / NO EXECUTION CONTEXT LOCK / NO PRODUCT CODE.**
>
> Issue: [#91](https://github.com/KayzenRoot/spryxel/issues/91). Current draft analysis base: `main@f544aba74c7609d3ad1bce80538e8218fe555ca8` after protected frontend PR #89 merge, 2026-10-18. Critical source Git blob fingerprints are recorded in the proposed WO-010 below. This is still NOT_ADMITTED. Refresh base and all critical source fingerprints before admitting a real Work Order. This is not an approval to mutate tables, routes or provider configuration.

## Why this increment, now

`.engineering/CHECKPOINT.json` remains `SPRYXEL_WO_009_COMPLETE` with `nextLegalStage=SPRYXEL_DNA_ASSET_CORE_WORK_ORDER_REQUIRED`. Decision D-153 and `.engineering/IMPLEMENTATION-SEQUENCE.md` order 6 explicitly place DNA + Asset Core **after** canonical Identity/Tenancy, Projects, durable Jobs, Credit Ledger and CostGuard, and **before** the local inference and QA/export slices. Do not reopen the already-completed WO-008/009 planning to obtain this admission.

Existing `.engineering/IMPLEMENTATION-ARCHITECTURE.md` binds TypeScript/Node 22, Next.js web as BFF, Fastify API as product invariant owner, PostgreSQL durable state + RLS, Redis/BullMQ ephemeral coordination and private S3-compatible objects (SeaweedFS **local/test**, production S3 provider not selected). Existing `.engineering/PHYSICAL-DATA-CONVENTIONS.md` requires tenant-leading keys, explicit ownership, audited migrations and cross-tenant negative evidence.

## Objective and bounded first vertical slice

Establish **one minimal end-to-end, tenant-safe asset metadata + immutable DNA version contract** without paid inference, asset creation GPU pipelines, public sharing or commercial execution.

### 1. DNA domain (candidate contract)

- DNA belongs to a canonical `tenant_id` and `project_id`; immutable UUIDv7-compatible `dna_version_id` references a stable `dna_id`; deterministic SHA-256 content digest attests version content, not version identity. Historical versions are never silently rewritten. Draft/published/version transitions must be explicit and idempotent.
- Define a minimally useful typed JSON DNA payload for project creative direction/constraints with schema version, provenance, originator, timestamps and deterministic canonical serialization/checksum; the exact field inventory must be approved before code.
- Every version transition records actor, tenant/project context and changed content digest. Validate references, size and schema; enforce bounded payloads and reject cross-project version references.
- Retrieval of project DNA may not enumerate/resolve another tenant's objects based only on caller-provided IDs. Design reversion as a **new version** referencing the restored ancestor, not destructive mutation.

### 2. Asset metadata core (candidate contract)

- Stable `asset_id`, immutable or audit-append-only `asset_version_id`, tenant/project association, object blob checksum, content type, size, S3-compatible opaque bucket/key/version locator, availability state and lineage/provenance edges.
- Product code never treats a public URL or S3 object key as proof of resource authorization. Store original bytes privately and separate publication/export policies from metadata.
- Asset-to-DNA and asset-to-job relationships have explicit tenant/project guard and version validity. Prevent orphaned or cross-tenant lineage edges by constraints plus application authorization.
- No content deduplication across tenants that reveals asset possession or object identity. No anonymous asset delivery.

### 3. API/data boundaries (candidate, not frozen endpoints)

- API owns create/version/read/list operations; `apps/web` only consumes authorized API responses, not separate business logic. `packages/contracts` owns versioned boundary schemas, `packages/domain` owns invariants, `packages/db` owns persistence ports and migrations.
- Use least-privilege app/worker roles. Tenant-owned records get FORCE RLS where applicable, transaction-scoped tenant identity (no leaked pooled context), tenant-inclusive uniqueness/foreign keys, deny-by-default access. Match shared existing session and membership policies.
- Plan signed object upload/download with explicit user/tenant/project authorization, short expiration, bound content metadata and cost limits. **Do not implement a public upload service, lifecycle/virus scanning bypass or production storage provider selection by assumption.**
- API requires bounded request/content sizes and consistent safe error/status behavior (400 invalid input, 401/403 auth, 404 non-enumerating, 409 conflict). Sensitive access events are audit-recorded without tokens, raw credentials or provider internals.

## Explicit NON-GOALS

No inference/GPU/model execution, QA approval, complete creative editors, publication/distribution, final export, video, social, marketplace, paid credits purchase/spend, commercial provider, new external paid services, broad new WorkOS permissions, anonymous/public asset URLs, auto-migration of production database, changes to GEF CI/ruleset, trademark/legal/G0/G1/G2 website publication, or checkpoint promotion.

The `CostGuard` default is still **DENY**, and credit authorization/ledger invariants must remain unaffected. Creating a metadata record never implies permission to incur paid compute, grants, balance or export.

## Candidate implementation sequencing (must be explicitly admitted later)

| Slice | Product code owner | Deliverable | Minimal acceptance |
| --- | --- | --- | --- |
| A | contracts + domain | Versioned DNA/Asset schema validators and transition rules | typed build, schema validation, boundary/limit and invalid-transition unit tests |
| B | database/migrations | Tenant and project referenced DNA/Asset tables + lineage constraints | real PostgreSQL, FORCE RLS, tenant A/B negative reads/writes/joins, migration forward safety |
| C | S3 adapter + API | Authorized metadata operations and private object reference port | S3 SeaweedFS put/get/delete policy, checksum and failure tests, no direct public URL |
| D | worker/job compatibility | Link canonical Jobs and CostGuard DENY invariants where relevant, no generation | idempotency/replay and safe cancellation; no paid operations activated |
| E | web (only if admitted) | Minimal authenticated project DNA / asset metadata UI | protected route, client never authoritative, cross-tenant 404/403, accessible basics |

**Recommended first authorized execution inside WO-010 is A+B only** (typed contracts/domain and tenant-safe PostgreSQL with FORCE RLS); C/D/E remain NOT_ADMITTED. Phase A+B alone must not promote WO-010 to COMPLETE: private object/storage authorization required by D-153 is not delivered until separately authorized Phase C is audited. See `.engineering/work-orders/SPRYXEL-WO-010.md` for the proposed bounded Code/Test contract.

## Admission contract: required before Codex may implement

1. Owner reviews this scope and authorizes the exact increment, non-goals, execution budget, affected path allowlist and provisional stop condition; no generic "continue" interpreted as permission to weaken canonical policies.
2. ChatGPT prepares **current** Source Pack/DoD/Architecture/Decisions fingerprints, audits conflict and writes a **fresh** executable Context Lock only **after** the proper Work Order is admitted. Do not reuse WO-009 historical locks.
3. Separate independent HIGH_ASSURANCE audit of RLS, membership, signed object boundary, migrations, integrity, ledger/CostGuard interactions and any actor privilege changes.
4. Codex implements **code/tests only** in isolated branch/worktree with exclusive path ownership and no autonomous governance update. ChatGPT handles PR body, reviews, issues, documentation, audit records.
5. Progress is valid only when tests actually run; mark `EXECUTED`, `OBSERVED`, `NOT_RUN`, or `BLOCKED`. Never claim release or integration acceptance from green source-only checks.

## Verification matrix (future executable WO, not a current receipt)

- `npm ci`, format, lint, typecheck, architecture, unit, worker, production build and GEF doctor/status using supported Node 22 and npm 10.
- Isolated real Docker profile: PostgreSQL/redis/SeaweedFS; forward-only migrations, FORCE RLS, application/worker SQL permission boundaries; two-tenant authorization negative tests for list, find, update, delete, lineage, version pointers and pool-context reuse.
- Object validation: checksum match/mismatch, size/type limit, expired/bad signature, object unavailable/partial write, key authorization, no tenant enumeration or publicly readable storage.
- Domain tests: deterministic schema/version IDs or content digest, provenance and idempotent retry, immutable published version, rollback-by-new-version, illegal transitions, conflicting writes.
- Job/CreditLedger/CostGuard nonregression: no reservation/spend from metadata-only commands; denied operation must not produce side-effects.
- Final exact-head required GitHub checks (Repository validation, Pipeline integrity, Gitleaks, Trivy), classify Sonar/Socket findings, independent review, 0 unresolved review threads, protected merge only on separate specific owner authorization. Any real provider acceptance remains NOT_RUN without a permitted environment.

## Proposed deliverables by ChatGPT and Codex

**ChatGPT/GitHub (now):** this single proposal, bounded scope and tests, an owner-ready admission packet and review; avoid duplicative 20-round administrative planning.

**Codex (only after admission):** contract/domain/DB/API code and focused tests, technical receipts and code-only commits. No Work Order, ADR, GitHub PR administration, GEF checkpoint or release mutation.

**Proposal STOP:** `SPRYXEL_WO010_DNA_ASSET_CORE_SCOPE_TEST_MATRIX_CANDIDATE_READY_NOT_ADMITTED`.

**Implementation STOP, reserved for future admitted mission:** `SPRYXEL_WO010_CODE_VERIFIED_EXACT_HEAD_READY_FOR_INDEPENDENT_HIGH_ASSURANCE_AUDIT`.

Nothing in this document elevates the proposal to canonical, approves spending, or authorizes merging.
