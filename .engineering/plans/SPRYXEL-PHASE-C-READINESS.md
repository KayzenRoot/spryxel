# SPRYXEL-PHASE-C-READINESS — Private Asset Storage & Bounded API Contract

**Status:** `PROPOSAL_ONLY / NOT_ADMITTED / PLANNING_ONLY`
**Risk:** `HIGH_ASSURANCE` (tenant isolation, private durable objects, signing credentials, immutable asset provenance)
**Date:** 2026-10-20 (America/Sao_Paulo)
**Repository and planning source base:** `KayzenRoot/spryxel@8205ea9ac5f76a83280fb488765a89a0b92d2e26`
**Tracking:** [Issue #91](https://github.com/KayzenRoot/spryxel/issues/91), [PR #103](https://github.com/KayzenRoot/spryxel/pull/103)
**Owner decision required:** specific scope/admission later; this proposal is **NOT** that decision.
**Authority:** subordinate to the existing `.engineering/CHECKPOINT.json`, `.engineering/SOURCE-HIERARCHY.md`, approved Decisions Ledger and DoD. Any post-base source movement requires re-read, reconciliation and newly pinned fingerprints *before* any admission.

## 1. Proven state and explicit limitations

- Phase 1 A+B of WO-010 is implemented and checkpoint-promoted, with disclosed limitations; full WO-010 is **INCOMPLETE**. The canonical Checkpoint is `SPRYXEL_WO_010_PHASE_1_AB_COMPLETE` (not whole-WO completion). WO-009 is still the last *fully* completed Work Order.
- Protected docs-only PR #103 merged on `main@8205ea9ac5f76a83280fb488765a89a0b92d2e26`; its historical WO-010 A+B Context Lock is `STALE`, must not be reused for C, D or E.
- `phaseC=NOT_ADMITTED`, `phaseD=NOT_ADMITTED`, `phaseE=NOT_ADMITTED`. No storage implementation, app endpoint, worker/UI expansion, deploy, release, account provisioning or provider selection is authorized by this plan.
- Canonical `productionObjectStorageProvider=NOT_FROZEN`. Local/test target is `SEAWEEDFS_S3_COMPATIBLE` under D-154/D-155, not a new service purchase. No release or image digest is frozen by this proposal.
- `defaultCostGuardDecision=DENY`, `realCostBearingExecution=PROHIBITED`, `publicAssetUpload=NOT_ENABLED`, `productionGeneration=NOT_ENABLED`, paid balance inactive. These remain fail-closed regardless of tests or documentation.
- No new independent PostgreSQL execution is claimed here; the A+B published evidence and known trace/coverage limitations remain as recorded. GitHub checks on PR #103/main are not substitutes for Phase C object-store integration tests.

## 2. Candidate mission and bounded boundary (planning, NOT admitted)

Prepare the possible future **Phase C only**: private S3-compatible object storage with server-enforced tenant/project authorization, metadata identity bound to the existing A+B `platform.asset` and `platform.asset_version` model, and narrowly scoped API/service **ports/contracts** for initiating, verifying, reading and revoking private object operations. Any actual endpoint or storage adapter requires a later, separately admitted Work Order.

**Potential contract sketches for owner decision, not implementation promises:**
- `beginPrivateAssetUpload(principal, projectId, assetVersionId, declaredContent)`: authorize active project membership/role and version state **server-side**; reserve a bounded, opaque upload attempt, with immutable tenant/project/version association and idempotency key. No public PUT grant by default.
- `finalizePrivateAssetUpload(principal, attemptId, objectReceipt)`: revalidate principal and lease; server-verify actual object bytes/length/digest, scan policy where specified, expected object key/tenant and finalize atomic metadata state or quarantine; reject stale, duplicate conflicting, incomplete and cross-project receipts.
- `authorizePrivateAssetRead(principal, versionId)`: re-authorize each request (and token redemption where feasible), return controlled short-lived signed access when later admitted, not enumerable buckets or permanent public URLs.
- `abortOrReconcileUpload(principal, attemptId)`: bound retries/timeouts and secure orphan cleanup, with idempotency, owner/role checks, audit evidence and no destructive data migration.
- `revokeAssetAccess(principal, assetVersionId)`: deny new reads and handle token/URL revocation limitations; ensure no implicit mutation of immutable published DNA/asset versions.

Contract questions **not yet decided**: exact API route names, method choices, content size/media allowlists, hash/checksum algorithm and multipart rules, signing TTL, key prefix design, upload lease/GC windows, scan approach, encryption/key management, version retention/legal holds, and permitted roles for delete/revoke. These must be resolved against existing decisions and threats in a new Work Order, not silently selected here.

## 3. Object isolation and threat model

| Threat / abuse case | Candidate fail-closed control | Planned objective evidence |
| --- | --- | --- |
| Cross-tenant read/list/modify or guessed asset ID | Authorize principal against canonical PostgreSQL tenant/project membership and ownership on **every** operation, with RLS + app checks; never trust client project/tenant claims | Cross-tenant integration negatives for each verb and guessed identifiers |
| Bucket/object-key enumeration, prefix collisions and traversal | Private buckets; opaque non-guessable server-generated object IDs, canonicalization and constrained prefixes; deny caller-chosen arbitrary key | Fuzz key validation for `../`, encoded separators, mixed-case, Unicode and guessed IDs |
| Signed URL leakage, replay or excessive TTL | Principle of minimum signed scope, short TTL, content restriction, audited issue events, no tokens in logs/referrers; model revocation as TTL-bound unless explicitly supported | Expiry, wrong verb/key/content headers, replay and revocation limitation tests |
| Direct S3 access bypassing API auth | Private endpoint/network and least-privilege adapter credentials; explicit bucket policy denying unauthenticated/other project access | Direct S3 requests with missing/invalid/cross-scope credentials all denied |
| Content mismatch, forged MIME, oversized or malicious payload | Compare actual received size, digest and sniffed format to claimed metadata; quotas, upload bounds and quarantine path; avoid trusting client SHA alone | Wrong digest/MIME/size/part count, truncation and untrusted multipart negatives |
| TOCTOU membership or version changes | Reauthorize on finalization/download, check asset/version state under transactional guard; bound upload lease | Revoke membership between begin/finalize; stale version and publish-race tests |
| Partial upload, retries and orphan objects | Durable attempt state, bounded idempotency, reconciliation/GC with non-destructive safe boundaries; never orphan discoverability | Duplicate requests, timeout/crash at each phase, retry and garbage-collection regression |
| Mutable provider blob overwrites immutable provenance | Version-scoped object identity and no client overwrite; transactionally bind digest/object receipt to append-only asset lineage; restore/fork via new version only | Existing published version unchanged after overwrite/restore attempts |
| Cost/availability amplification and credential exfiltration | CostGuard deny by default, local/test quotas, rate/concurrency/bytes budget, short-lived credentials and redaction; no paid provider | Over-quota, too-many-requests, secrets-in-logs and deny-case evidence |
| Cross-tenant metadata links and stale DB context | Tenant-leading FK/key and forced RLS with transaction-scoped principal; reset pooled connections; authorized adapter separation | Real PostgreSQL tenant A/B read/list/join/update/delete under pool reuse |
| CDN, caching and public URL regressions | No public-read object ACL, no public bucket policy and no cache of private signed responses; security headers where applicable | Unauthorized cached URL, public HEAD/GET and leaked redirect tests |
| S3-compatible provider-specific semantics | Provider-neutral adapter; verify SeaweedFS local/test behavior incl. signing, range, multipart, lifecycle and consistency where used | Pinned disposable SeaweedFS integration matrix with explicit deviations |

Never store S3 secrets, signing keys, session tokens, signed URLs or full object keys in public diagnostic evidence. Threat-model and security acceptance depend on up-to-date provider/security source at future admission.

## 4. Negative acceptance and test matrix, **all NOT_RUN**

| ID | Negative / invariant to demonstrate using admitted future code | Evidence required later |
| --- | --- | --- |
| C01 | No session / invalid issuer, audience, expiry, membership or role => deny for begin/finalize/list/read/revoke | Local auth fixtures and denied HTTP/service responses |
| C02 | Tenant A requests tenant B object (guessed ID or key) => deny, no existence leak | Real PostgreSQL tenant A/B plus object store |
| C03 | Same tenant, wrong project or revoked membership => deny every verb | Role/project switch and revocation fixtures |
| C04 | Direct bucket S3 GET/PUT/LIST/DELETE without permitted scope => deny; no public ACL | Disposable SeaweedFS and policy evidence |
| C05 | Traversal, encoded paths, prefix collisions and arbitrary bucket/key input => reject | Fuzz/object-key security unit + integration |
| C06 | Expired, wrong-method, wrong-key or leaked signed URL => reject within documented revocation limitations | Signing TTL and response header checks |
| C07 | Wrong digest, length, MIME, truncated body or oversize => fail closed/quarantine | Actual stored-byte verification |
| C08 | Idempotent repeat returns original authorized attempt; same key with conflicting content => conflict without duplicate asset | Retry/replay after persistence/timeout |
| C09 | Failed finalize/cancel leaves no visible asset nor unauthorized orphan; reconciliation bounded | Crash/timeouts + garbage-collection evidence |
| C10 | Published Asset/DNA versions cannot be rewritten or silently remapped; restore creates new version | Existing A+B immutability regression + object links |
| C11 | Membership revoked after issue/begin but before read/finalize => re-check; document residual capability expiry | Race tests with time/source controlled |
| C12 | Pooled principal/tenant context never bleeds into another request | Forced RLS transactional integration |
| C13 | Quota/concurrency/rate/exhausted budget blocks operation; default CostGuard remains DENY | Local fail-closed budget and ledger nonregression |
| C14 | Credential, URL/token and identifying object-key logs redacted | Structured audit/log inspection incl. errors |
| C15 | Provider-neutral contract works with pinned local SeaweedFS and documents deviations; no production-provider dependency | Disposable S3-compatible test profile |
| C16 | Negative storage/API tests do not weaken current Job/Contract/Credit Ledger/CostGuard or architecture guard | Regressions with exact commands, exit codes and immutable CI receipts |

**Evidence state:** `C01–C16 = NOT_RUN`. No local Docker, live WorkOS, real provider or production endpoint has been exercised for this planning task. Assertions must be proven later on their exact implementation HEAD with reproducible fixtures; mocks alone never certify storage isolation.

## 5. Dependencies, proposed decision packet and risk gates

1. **Owner scope decision (still absent):** confirm Phase C's minimal user journey/operation inventory, roles, size/type/TTL/quota bounds, threat acceptance, source allowlist and explicit exclusions. Keep API routes, workers, UI, D/E, payment/provider activation and external deployment excluded unless separately considered; do not infer their inclusion.
2. **Current-source compilation:** re-fetch canonical Checkpoint, Source Hierarchy, Decisions, Security, Data/Physical conventions, Scope, DoD, Work Order; compute actual exact Git blob + SHA256 fingerprints at a fresh base; compare A+B interfaces against the existing live source rather than copying stale pins.
3. **Propose new Work Order/Context Lock only after explicit admission:** new identifier and `FRESH` lock require owner-specified authority, exact new protected-main base, allowlisted paths/commit/evidence and D-0006 compliance. **This document is not a Context Lock** and must never be consumed by the executor.
4. **HIGH_ASSURANCE security review plan:** independent actor examines principal propagation, PostgreSQL FORCE RLS, object policies/credentials, signed URL semantics, replay/orphan handling, budget, data integrity, and license/provenance; any HIGH/CRITICAL or unresolved blocking thread => `CORRECTION REQUIRED / BLOCKED`.
5. **Future test/CI proof:** disposable local SeaweedFS S3-compatible and real PostgreSQL integration, deterministic fixture JWT/JWKS if relevant, C01–C16, existing B regressions, architecture guard, format/lint/typecheck/build where affected, six/seven applicable hosted checks on exact final HEAD, plus zero unresolved threads and protected review.
6. **Merge and checkpoint gates remain separate:** owner authorization for any Phase C docs admission, owner approval for code merge and exact HEAD, independent audit and a new checkpoint delta only after accepted evidence. No automatic milestone credit or whole-WO completion.
7. **Stop and reporting:** report candidate scope decision table, owner-deferred choices, `NOT_RUN` evidence, limitations and `STOP=SPRYXEL_PHASE_C_READINESS_PROPOSAL_ONLY_NOT_ADMITTED`. No background jobs, paid storage/generation, vendor enrollment, deployment or release.

## 6. Explicit exclusion and anti-escalation matrix

- **NO WRITE:** `.engineering/CHECKPOINT.json`, `.engineering/CHECKPOINT.md`, `.engineering/SOURCE-HIERARCHY.md`, `.engineering/DECISIONS-LEDGER.md`, canonical Security/Data/Scope/DoD sources, existing WO-010 or historic Context Lock, all product code, migrations, Docker manifests, secrets, CI, rulesets and `.gef/**`.
- **NO NEW EXECUTABLE AUTHORITY:** no admitted `SPRYXEL-WO-011` (or other new WO), no FRESH Context Lock, no budget/spend authorizations, no expanded permission for Phase C/D/E.
- **NO PRODUCT OUTCOME CLAIM:** no production storage, public asset URL, uploads, API endpoint, model inference, generated asset, release, user launch or payment flow has been built or enabled here.
- **ALLOWED BY CURRENT OWNER DIRECTIVE ONLY:** `AGENTS.md` reconciliation plus *this one* `.engineering/plans/SPRYXEL-PHASE-C-READINESS.md` proposal, in a separate docs-only branch/PR, subject to CI, independent review and **a later specific merge decision**.

**Current stop condition:** `SPRYXEL_PHASE_C_READINESS_PROPOSAL_ONLY_NOT_ADMITTED`.

