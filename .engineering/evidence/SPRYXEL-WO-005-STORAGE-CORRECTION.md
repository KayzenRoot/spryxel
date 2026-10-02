# SPRYXEL-WO-005 — Storage Preflight Correction Evidence

Status: ARCHITECT CORRECTION READY FOR MERGE
Date: 2026-10-02

## Trigger

The first admitted `SPRYXEL-IMP-001` preflight stopped BLOCKED before product dependency installation or product-code mutation because the canonical implementation plan required MinIO for local/test S3-compatible storage and the current upstream state failed the Work Order maintenance/security gate.

## MinIO evidence snapshot

Observed current public upstream facts:
- `https://github.com/minio/minio` is archived/read-only as of 2026-04-25.
- The upstream README states that the repository is no longer maintained.
- GitHub security advisories published in 2026 include HIGH-severity unauthenticated object-write/signature-validation vulnerabilities.
- Latest public community release evidence predates archival and the repository can no longer receive community-source fixes.

Conclusion: MinIO community server is not acceptable as a new mandatory Spryxel local/test dependency under the admitted preflight gate. The executor was correct to stop rather than silently substitute.

## Replacement evaluation

Selected implementation direction: SeaweedFS, while preserving the existing S3-compatible/provider-neutral application contract.

Current public evidence:
- upstream: `https://github.com/seaweedfs/seaweedfs`;
- current latest release observed: `4.48`, released 2026-09-28;
- active repository/release activity in September 2026;
- top-level license: Apache-2.0;
- documented S3 endpoint and single-node development mode;
- official Docker guidance exists;
- upstream Docker documentation states release images are signed via keyless cosign from the release workflow;
- the GitHub security page currently shows no published security advisories, while still requiring private vulnerability reporting.

This evidence does not waive future checks. The recompiled IMP-001 must pin the exact current safe release and immutable image digest, verify available signature/provenance evidence, re-run license/security scanning, and fail closed if the state has materially changed.

## Decision delta

- D-142 remains historical and unchanged.
- D-154 supersedes only the MinIO-specific local/test clause of D-142.
- D-148 remains historical and unchanged.
- D-155 supersedes only the MinIO-specific local-service clause of D-148.
- Private S3-compatible storage abstraction remains canonical.
- Production object-storage provider remains NOT FROZEN.
- No product data model, API contract, business invariant, pricing, provider procurement or production deployment choice changes.

## Execution state

The original SPRYXEL-WO-005 Context Lock is STALE. No product code or product dependency installation occurred under that stale admission. After this correction is merged and exact-main checks pass, SPRYXEL-WO-005 must be recompiled against the new main SHA before IMP-001 resumes.
