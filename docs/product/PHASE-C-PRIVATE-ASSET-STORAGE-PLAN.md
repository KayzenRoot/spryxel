# Phase C: private asset storage | Owner-endorsed Option A planning

> **PLANNING ONLY | OPTIONS A ENDORSED FOR PLANNING | NOT IMPLEMENTED | NO DEPLOY | NO PRODUCTION OR PAID COST.**
>
> Repository: `KayzenRoot/spryxel`. Owner direction: retire GEF Bootstrap (merged [PR #106](https://github.com/KayzenRoot/spryxel/pull/106), `main@6a6b0fe3263e8af9daa026f94d0e9d7ca48b9b2f`), follow [build-first guide](../BUILD_FIRST.md), retain Spryxel-specific security tests. This is an **ordinary product design note**, not a governed Work Order, executable Context Lock, admission process or barrier to normal feature branches.
>
> Prior [PR #105](https://github.com/KayzenRoot/spryxel/pull/105) drafted nine Option A/B choices before GEF retirement. Owner expressly endorses **Option A for planning** after uninstall. Endorsement means **design direction only**, not approval to implement a particular endpoint, migrate production data, spend, merge, deploy or publish.

## Purpose and boundaries

Deliver a first narrow tenant/project-authorized **private S3-compatible object storage** boundary around existing immutable Project DNA, Asset and AssetVersion metadata. Backend-authorized operations: **begin**, **finalize**, **read**, **abort/reconcile**, **revoke**. Do not duplicate metadata or trust bucket keys, project IDs, public URLs or caller credentials as authorization. Preserve WorkOS identity, PostgreSQL tenant and project membership checks, transaction-scoped FORCE RLS, immutable version/provenance, idempotency, redacted audit and CostGuard `DENY` for cost-bearing execution.

The initial build is **local/testing only** with SeaweedFS S3-compatible plus actual disposable PostgreSQL/RLS, no production object provider, public CDN, payment activation, commercial releases, GPU generation, extra feature phases, production secrets or cloud deploy. D/E remain future, unimplemented. Historical canonical engineering checkpoints and locks remain archival; no GEF-era admission/lock is needed to develop bounded product features under the current `AGENTS.md`.

## Owner-endorsed option A for planning, C-OD-01..09

| Area | Option A: OWNER-ENDORSED FOR PLANNING, not final operational acceptance | Option B, deferred |
| --- | --- | --- |
| **C-OD-01 roles** | OWNER/ADMIN write only when member of active authorized project; abort by initiator/OWNER/ADMIN; MEMBER read only by explicit asset/project read permission. Reauthorize *every* operation, no guessed-ID bypass. | Scoped MEMBER upload after explicit permission tests |
| **C-OD-02 development slice** | Start with typed internal contracts/domain boundaries and focused tests; every actual code PR states exact files, tests and any API/DB dependency. No broad write grant. | API adapter and additive persistence in same iteration after dependency proof |
| **C-OD-03 content** | Local test baseline **PNG/WebP up to 10 MiB**, single-part only, streaming actual-byte SHA-256, magic-byte and declared MIME consistency, reject unsupported formats and polyglot/payload tricks. | More formats / 25 MiB / multipart after security tests |
| **C-OD-04 retries** | Proposed **10-minute lease**, **24-hour scoped idempotency window**, at most **three** bounded retries per matching fingerprint. Reject conflicting attempts; quarantine orphan, no irreversible production garbage collection. | Longer lease, multipart and retry windows after crash tests |
| **C-OD-05 access** | Server-mediated streaming uploads and reads with authentication on each request; **no client-facing S3 presigned URLs** in first slice. Revocation immediately denies *new* server-authorized reads; already-running transfers require explicit race handling. | Narrow 30-second presigned capability after TTL/revocation risk review |
| **C-OD-06 privacy** | Disposable test-private bucket, non-enumerable server-owned tenant/project/version object keys, least-privilege S3 credentials, transport security and quarantine pending verification/scanning, with fail-closed security dependencies. | Per-tenant buckets and delegated scoped grants after policy proof |
| **C-OD-07 audit/retention** | Redacted actor/tenant/project/version/op/outcome receipts, never secret/token/URL/content in logs. Local disposable test retention **7 days proposed**; **production retention, deletion and legal-hold remain UNDECIDED** pending privacy/legal assessment. | Formal 30/90-day production policy after legal signoff |
| **C-OD-08 local storage** | SeaweedFS **local/test only**, pin maintained upstream version + immutable digest after license/vulnerability/provenance checks; run real PostgreSQL FORCE RLS and S3 isolation negatives. **No paid or production provider**. | Alternate S3 emulator only after new technical choice |
| **C-OD-09 API/persistence** | Define internal ports first; add HTTP route and **new forward-only** migration only on demonstrated need with focused tests, never edit applied `0010_project_dna_asset_core.sql`. | Admit route plus additive durable attempt schema together after explicit risk proof |

**Open engineering questions not settled by endorsement:** exact authorized route inventory and role inheritance; service auth/audit field schema; upload payload bounds beyond local tests; scanner/virus policy; durable attempt persistence after crashes; cancellation/finalize atomicity and immutable evidence; incident revocation for already-running transfers; encryption/secret rotation; legal retention and deletion/holds; SeaweedFS image digest; final performance budget, release gates and UI shape. Resolve these through normal scoped engineering issues, code PRs and relevant regressions, not GEF governance documents.

## Tests and acceptance for actual future implementation

- Contract tests for state transitions and tenant/project/version key integrity, no unsafe cross-tenant deduplication.
- Real local PostgreSQL FORCE RLS and direct/pooled tenant identity negatives, missing roles, membership revocation, cross-project objects, multi-request isolation.
- S3-compatible local tests for anonymous/direct access denial, traversal, wrong digest/size/type, finalize conflicts, idempotency replay, orphan handling, expiration/revocation races, complete audit redaction.
- Integration and browser cases for authorized user journey when routes are implemented; worker regressions for eventual cleanup.
- Prior draft's negative scenarios **C01–C16 remain NOT_RUN**, not completed proof.
- Use current GitHub build + modular path-aware tests, Gitleaks, Trivy, SonarCloud/Socket emitted checks. Do not claim CI on a proposed future feature constitutes proof of that feature.

## Safeguards carried forward from product design

Real-cost execution `PROHIBITED` and default CostGuard `DENY` until a new product-cost decision; production object-storage provider remains `NOT_FROZEN`. The historical Checkpoint records A+B completed within scope and full WO-010 `INCOMPLETE_PHASES_C_D_E_NOT_ADMITTED`; the history's stale Context Lock is **archival only**. Do not modify it, promote the checkpoint or claim C/D/E implemented as part of this documentation.

**Next iteration:** implement the smallest authorized build-first local feature in a normal PR *only after the owner chooses the concrete product scope*. This planning endorsement is not blanket implementation authorization.

**STOP:** `SPRYXEL_PHASE_C_OPTIONS_A_PLANNING_ENDORSED_ONLY_BUILD_FIRST_NO_IMPLEMENTATION`.
