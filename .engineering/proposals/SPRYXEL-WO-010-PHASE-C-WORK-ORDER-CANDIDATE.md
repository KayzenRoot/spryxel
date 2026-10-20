# SPRYXEL-WO-010-C — Phase C private asset storage and bounded API ports (CANDIDATE)

> **PROPOSAL_ONLY / CANDIDATE / NOT_ADMITTED / NON_EXECUTABLE / NO_CODE / NO_MERGE_AUTHORITY.**  
> Risk: HIGH_ASSURANCE. Planning source: `KayzenRoot/spryxel@7e13dbf60c047f1a2ca9006f06ae52a111fe3c4d` (2026-10-20).  
> Parent: [Issue #91](https://github.com/KayzenRoot/spryxel/issues/91), [Phase C readiness](../plans/SPRYXEL-PHASE-C-READINESS.md), owner-approved **preliminary scope for documents only**.  
> This is a **distinct prospective Phase C Work Order**, not a revision or expansion of the admitted **historical WO-010 A+B Work Order**. Do not move into `.engineering/work-orders/` or use to run an executor.

## 0. Authority, current evidence and stop gate

1. Authority remains `.engineering/CHECKPOINT.json` > Decisions Ledger > Scope > DoD > Architecture > Requirements > specialized canonical sources. Actual Git, code, tests and CI control observed facts. This proposal is subordinate to them and is not an owner admission.
2. Protected main source base `7e13dbf60c047f1a2ca9006f06ae52a111fe3c4d`, after [docs-only PR #104](https://github.com/KayzenRoot/spryxel/pull/104) squash. The canonical Checkpoint remains `DNA_ASSET_CORE_PHASE_1_AB_COMPLETE` / `SPRYXEL_WO_010_PHASE_1_AB_COMPLETE` for **A+B only**. Whole WO-010 = `INCOMPLETE_PHASES_C_D_E_NOT_ADMITTED`; C/D/E = `NOT_ADMITTED`; last fully complete WO = WO-009. Historical `.engineering/context-locks/SPRYXEL-WO-010.json` is `STALE` and forbidden for reuse.
3. D-153 keeps the ordered dependency sequence. D-140/D-157 require canonical PostgreSQL tenant authorization plus application checks and RLS; D-142 is partially superseded by D-154/D-155 for SeaweedFS local/test, not production. D-0005 forbids adding paid dependencies as required gates; D-0006 forbids executor self-promotion. Keep all D-001…D-161 decisions unchanged.
4. **Fail-closed always:** CostGuard `DENY`, real-cost execution `PROHIBITED`, production object-storage provider `NOT_FROZEN`, public asset upload `NOT_ENABLED`, production generation `NOT_ENABLED`, no purchased providers. C01–C16 = `NOT_RUN` (planned test definitions, not executed evidence).
5. This proposal supplies **no implementation authority**, no executable Work Order, no fresh lock, no context/credentials for Codex, and no authority to merge itself. If base, critical source, scope or threat model shifts: **STOP** and revise through a new owner decision.

## 1. Goal: one minimal Phase C vertical storage boundary

Proposed only: bind private, S3-compatible object bytes to the **existing** A+B immutable `platform.asset` / `platform.asset_version` metadata with server-verified tenant/project authorization. Preserve Project DNA and Asset version IDs, digests, lineage, published immutability, RLS, audit receipts, credit/ledger defaults and application auth. No second asset or product record, no public URLs and no broad platform rewrite.

**Candidate service PORTS (not frozen HTTP routes, not runnable):**
- `beginPrivateAssetUpload(principal, projectId, assetVersionId, declaredContent, idempotencyKey)`: authorize active local tenant/project membership, permitted role and mutable version state; reserve opaque private attempt scoped to exact tenant/project/version and bounded declared type/size; no user-selected bucket/key or public access.
- `finalizePrivateAssetUpload(principal, attemptId, objectReceipt)`: re-authorize after upload, verify actual stored bytes, size, checksum and configured content allowlist, lease and object identity; commit provenance atomically or leave quarantined/private; conflicting idempotency or cross-tenant receipt denied.
- `authorizePrivateAssetRead(principal, assetVersionId)`: re-authorize each request; return private bytes or a narrowly scoped expiring capability only under later accepted signing policy; never treat guessed asset ID, bucket key, or stale capability as tenancy proof.
- `abortOrReconcileUpload(principal, attemptId)`: authorized idempotent abort/retry and bounded orphan reconciliation with safe audit and no destructive history.
- `revokeAssetAccess(principal, assetVersionId)`: stop *new* reads/tokens, bound existing-capability TTL and document residual revocation limitations; never rewrite published versions.

Design principle: these **ports** describe prospective internal behavior. Actual API routes/methods, schema alterations, S3 adapters, worker behavior and UI additions remain undecided and require a later specific admitted Work Order with reviewed path allowlist.

## 2. Threat controls and negative proof required after admission

| Boundary | Mandatory objective behavior / future evidence |
| --- | --- |
| Canonical principal + RLS | WorkOS identity maps into canonical local tenant/membership/roles. App checks + PostgreSQL FORCE RLS; transaction-scoped principal; no cross-tenant guessed IDs, composite FK leaks, pooled-session bleed |
| Storage access | Server-owned, non-enumerable private keys; no public-read ACL, direct S3 access or cross-tenant bucket access; least-privilege adapter; traversal/encoding normalization and deny-by-default |
| Signing | Short TTL, method/key/header/size scoping, no raw tokens or URLs in logs/cache, reauthorization and explicit residual validity after revocation |
| Object integrity | Compare **actual bytes** with approved size/type/digest, immutable `asset_version` linkage, quarantine incomplete/mismatch, no overwrite or silent lineage mutation |
| Replay and failure | Durable attempt state/leases and idempotency, conflict detection, timeout/cancel/retry recovery, bounded orphan GC; no destructive applied-migration rewriting |
| Audit and economics | Tenant/project/actor/version/operation, redacted failure evidence, quota/rate limits, CostGuard default DENY and no paid provider or credit change |
| Infrastructure | Local disposable PostgreSQL and pinned maintained SeaweedFS release/image digest/license/provenance when implementation is **separately admitted**; production provider not selected |

**Mandatory future negative matrix:** the 16 exact cases C01–C16 in `.engineering/plans/SPRYXEL-PHASE-C-READINESS.md`, all `NOT_RUN` today. Include tenant A/B, revoked membership, direct S3 anonymous/cross-scope, traversal, expired signatures, mismatched content bytes, conflicting retries, partial upload, immutable history, pooled identity, CostGuard, secrets redaction, SeaweedFS compatibility and existing Contract/Job/Ledger regression. Mocks alone cannot prove isolation.

## 3. Provisional path ownership, never a write allowlist

Ownership candidates to verify against **actual source at next owner-admission review**:
- `packages/contracts/src/**`: versioned service boundary schemas and payload constraints only.
- `packages/domain/src/**`: lifecycle/idempotency/version invariants only.
- `packages/db/src/**`: tenant-safe repository port and prospective **new forward-only** migration **only if evidence proves current 0010 model insufficient**; do not touch applied migration `0010_project_dna_asset_core.sql`.
- `apps/api/src/**`: **possible** narrowly scoped server adapter/route wiring. No change is admitted now; actual route paths, auth guards, credential ownership and allowed files require owner signoff.
- `scripts/**`: **possible** isolated tests, only exact files identified in future review, not blanket test-writer permission.
- `infra/**`: test-only disposable SeaweedFS configuration **only if separately admitted**; no production or provider modifications.

**Protected/excluded pending separate decision:** `apps/web/**`, `apps/worker/**`, auth/session/WorkOS, credit/CostGuard pricing/ledger, historical SQL migrations, GEF/.gef, GitHub rules/workflows, environment secrets, provider provisioning, deployment/release, D/E, GPU/inference/generation, commercial payments, public sharing/CDN/export. The bullet candidates above are **not** effective allowlist entries and authorize **zero** file writes.

## 4. Open owner decisions (blocking executable admission)

| ID | Decision required | Current state |
| --- | --- | --- |
| C-OD-01 | Minimum user journey, exact five operations, roles/privileges and write-vs-read capability table | OPEN, not assumed |
| C-OD-02 | Exact bounded source/test/migration/API allowlist, owner/executor reviewer separation | OPEN |
| C-OD-03 | Per-object media allowlist, max size, content sniffing, digest, multipart rules | OPEN |
| C-OD-04 | Upload lease, GC retention, retry/idempotency window and conflict semantics | OPEN |
| C-OD-05 | Signed URL vs server-proxy read, TTL, replay/expiry, residual revocation treatment | OPEN |
| C-OD-06 | Private bucket layout, credential/scopes, encryption/rotation, quarantine/scan policy | OPEN |
| C-OD-07 | Audit retention/redaction, delete/legal hold, rollback/no-data-loss acceptance | OPEN |
| C-OD-08 | Exact maintained local SeaweedFS version/digest/license/provenance and Docker test feasibility | OPEN, `NOT_RUN` |
| C-OD-09 | Whether any HTTP route or migration is actually needed beyond current A+B interfaces | OPEN; no speculative implementation |

These must be resolved explicitly **before** executable Work Order admission. Lack of a decision is `BLOCKED`, not tacit permission.

## 4A. Owner decision options and conservative recommendations (NOT APPROVED)

**Status of EVERY C-OD-01..09: `OPEN / RECOMMENDATION_ONLY / OWNER_DECISION_PENDING`.** The preliminary owner approval permits **only drafting these alternatives**, NOT their binding selection, Phase C admission, new write allowlists, provider procurement, merge or implementation. Option **A** below is the preparer's least-privilege recommendation, not a normative decision. Option **B** is a comparison requiring separate explicit risk acceptance and proof. No value below overrides canonical authorization/retention/DoD decisions.

| Gate | Option A (recommended conservative design, NOT approved) | Option B (broader alternative, NOT approved) | Why A reduces risk / what owner must confirm |
| --- | --- | --- | --- |
| **C-OD-01: actor/operation/roles** | OWNER/ADMIN can begin, finalize and revoke only within a currently authorized project; initiator or OWNER/ADMIN can abort; MEMBER gets read only where explicit project/asset read authorization allows it. Recheck membership/role/state on **every** operation, and never infer asset privileges from the project-create role policy alone. | Add scoped MEMBER uploads after a distinct permission contract and cross-role tests. | Default least privilege blocks writers who are only project readers. Owner must approve the exact principal-to-operation matrix, step-up conditions and role inheritance. |
| **C-OD-02: exact code ownership** | Stage an initial admitted slice confined to **typed internal contracts/domain ports and deterministic tests**; for each actual code change name exact files plus exact DB/API/test dependencies in a new owner-approved allowlist. No broad `packages/**`, `apps/**` or `scripts/**` grant. | Admit narrowly scoped API adapters and additive storage-attempt schema **at the same time**, but only with explicit per-file allowlist and stronger integration evidence. | Separating concerns limits blast radius; neither option presently permits ANY file write. Recheck A+B source before proposing file paths and independent executor/reviewer owners. |
| **C-OD-03: payload/media/digest** | Local proof profile: PNG/WebP only, **10 MiB max per object**, byte-stream SHA-256 of *stored bytes*, magic-byte sniff + declared MIME consistency, strict reject unknown formats, SVG, archives, executable/polyglot and multipart; fixed quota and request-rate caps. These are **proposed test-profile limits**, not production SLA. | Add more art formats and 25 MiB/multipart in a separately reviewed expansion. | Small single-part content limits parser, upload, malware and DoS exposure. Owner must approve production classes/ceilings, quarantine/scan and hashing semantics. |
| **C-OD-04: attempts/replay/orphans** | Proposed 10-minute upload lease, 24-hour tenant/project/actor/version-scoped idempotency-key window, up to 3 bounded retries with same payload fingerprint; conflicting retry rejects. Failure stays private/quarantined, with **no destructive production GC** until retention approval. | Proposed 30-minute lease, resumable multipart and longer retry window after crash/restart tests and retention decision. | Limits replay/storage debt while preserving immutable versions and no-loss policy; all TTLs are draft values needing clock/race and rollback proofs. |
| **C-OD-05: read/upload capability** | **Server-streamed private uploads and server-proxied reads only** in initial narrow slice, auth checked for each call, bounded bytes/backpressure and no client-facing S3 pre-signed URLs. Revocation denies subsequent authorized requests. | Use object-scoped, method/header-bound **30-second** signed read grants after signed-capability threat/race/expiry tests, accepting that already-issued tokens can remain usable until TTL. | Proxy avoids unrevocable previously issued capabilities in first slice. Owner chooses latency/egress/privacy trade-offs; no promise of instant invalidation of prior signed grants. |
| **C-OD-06: isolation/keys/scan** | One **private** environment-scoped bucket/policy in disposable test, opaque server-created tenant/project/version keys, deny anonymous/direct client S3 access, least-privilege credentials and TLS; verify encryption requirements before admission; upload goes to **quarantine** until content checks/required scan succeed, fail closed when required scanner unavailable. | Separate tenant-private buckets and delegated restricted grants after policy-configuration, encryption and key-rotation proof. | Minimizes configuration sprawl while preventing cross-tenant access through app auth + RLS + storage policy; owner must decide actual encryption/secret rotation/scanning/tenant partition. |
| **C-OD-07: audit/retention/legal hold** | Emit minimal redacted actor/tenant/project/version/action/outcome IDs with **no signed URLs, bucket secrets, raw keys, JWTs, payloads or personal content**. Test data only: proposed 7-day disposable retention. **Production retention, deletion and legal-hold policy stay BLOCKED/UNDECIDED**; no irreversible purge or hard-delete. | Establish 30/90-day production retention and regulated deletion flow only after privacy/legal and data-owner signoff and end-to-end recovery/hold tests. | Do not silently invent LGPD retention or destroy provenance. Owner/privacy reviewer must set production periods and approved erase-vs-audit preservation semantics. |
| **C-OD-08: local provider preflight** | SeaweedFS **disposable local/test only**, after verifying upstream maintenance, license, vulnerability/provenance and immutable exact image digest; no new production provider, external calls, subscription or spending. PostgreSQL FORCE RLS integration and signing/object-policy evidence must be real, not mock only. | Another maintained S3-compatible local emulator only via separately owner-approved audited decision correcting D-154/D-155. | Preserves canonical storage direction and no-spend controls; exact SeaweedFS release/digest deliberately **NOT_SELECTED** until admission-time evidence. |
| **C-OD-09: routes and database** | First establish the five **internal port contracts** against existing A+B asset/version relations. No new HTTP route or migration unless gap analysis proves it necessary; stop for a new exact-file owner decision if a durable attempt table or external route is essential. Never edit applied migration 0010. | Include one strictly bounded authenticated API operation and forward-only storage-attempt migration after explicit dependency/locking/security proof. | Avoids premature public surface and schema churn; owner must decide whether true durable retries can work without new tables (likely require an additive migration). |

**Explicit cross-gate dependencies:** C-OD-01 (authorization roles), C-OD-03 (content limits), C-OD-04 (durable idempotent attempt) and C-OD-05 (capabilities) must agree before C-OD-02/C-OD-09 can freeze an effective allowlist; C-OD-06/C-OD-08 must validate private storage semantics; C-OD-07 must resolve irreversible deletion and retention law. A route-less internal contract alone is **not** proof that real begin/finalize/read/abort/revoke operations are implemented. The chosen implementation slice needs an explicit owner-approved dependency graph and realistic end-to-end acceptance after admission.

**Decision status:** all nine `OPEN`. `RECOMMENDED_A` means *suggestion*, **not** `APPROVED`, `FROZEN`, `OWNER_ADMITTED`, `READY_FOR_EXECUTION` or `NOT_APPLICABLE`. Exact values may change upon review; changes to canonical policy require a separate admitted decision process. No real tests C01–C16 have been run.

## 5. Prospective evidence, test gates and DoD

**Before owner admission**: validate Source Pack current main, reconcile D-001…D-161; independently evaluate exact path allowlist, threat model, project identity boundaries and unresolved decisions; choose exact new Work Order ID, STOP, scope, budget caps and **only then** prepare a fresh real lock at a freshly verified source SHA. `Context Lock CANDIDATE` is not a real `spryxel.context-lock` and must never be promoted merely by PR merge.

**After separate admission only**: bounded test matrix C01–C16 using genuine disposable PostgreSQL FORCE RLS and SeaweedFS, ledger/Jobs/contracts nonregression, typecheck/build/lint/architecture guard, least privilege/secret scan, negative signing/replay/orphans/digest; record `EXECUTED` / `OBSERVED` / `NOT_RUN` with exact commands and exit codes. Require four current strict GitHub checks and every actually emitted applicable security/quality check `completed/success` on exact future implementation PR HEAD; unresolved blocking comments or independent HIGH/CRITICAL findings => `BLOCKED`. No quality-gate relaxation or provider invoice.

**Final proof/STOP**: pre-merge independent HIGH_ASSURANCE reviewer distinct from executor; owner-only protected squash-merge decision, post-merge readback, separate auditor-controlled Checkpoint promotion per D-0006 only after satisfying explicit full acceptance, which is **not** satisfied today. This proposal never admits C, D, E or full WO-010 completion.

## 6. Proposed decision disposition

`OWNER_SCOPE_PRELIMINARY_APPROVED_FOR_DOCS_ONLY` ≠ `OWNER_PHASE_C_ADMITTED` ≠ `EXECUTION_AUTHORIZED`. The next owner decision may (a) request revisions to this candidate packet, or (b) separately admit a fully specified Phase C Work Order and fresh source-bound lock after closure of all C-OD gates. **No merge or execution is requested by this file.**

**STOP:** `SPRYXEL_WO010_PHASE_C_DOCS_CANDIDATE_OWNER_ADMISSION_NOT_GRANTED_NO_EXECUTION`.
