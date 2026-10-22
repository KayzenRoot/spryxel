# EVD-003 evidence migration audit

- Repo: `KayzenRoot/spryxel`; PR #108; source HEAD `d7867965133f406fae76dbee424a25dd6eb102d5`.
- Source main SHA: `6a6b0fe3263e8af9daa026f94d0e9d7ca48b9b2f`.
- Original evidence source: local verified `SPRYXEL_PR108_EVD003_LF_READONLY_20261021.zip`, collected at `2026-10-21T14:01:09Z`.
- Original nested manifest SHA-256 verified **6/6** entries locally; package manifest verified **13/13** entries locally before publication.
- Only five short, non-sensitive textual evidence files are replicated verbatim in this folder; `manifest.sha256` contains their original verified hashes.
- Genuine result: `git ls-remote` exit **128**, DNS lookup `github.com` failed; collector exit **46**, `BLOCKED_REMOTE_HEAD`.
- Consequently this run's checkout, `git ls-files --eol`, Biome 2.5.15, `npm run format:check`, Windows clone validation: **NOT_RUN**.
- GitHub-side read-only verification observed PR #108 open/unmerged on `d7867965133f406fae76dbee424a25dd6eb102d5`, main unchanged, **11/11 exact-head checks SUCCESS** including SonarCloud/Gitleaks/Trivy/Socket/contract tests/worker/PostgreSQL RLS/Chromium. These CI checks do **not** establish exact-head global formatter execution.
- SonarCloud's PR comment reports Quality Gate PASS, zero new issues, zero hotspots, and 0.0% coverage on new code.
- Two old review threads resolved; no independent substantive approval on the final source HEAD. CodeRabbit `success` status says review skipped.
- Existing independent reviewer and validated formatting requirements remain **BLOCKED**. This publication must not be construed as a merge approval.

**Decision: `SPRYXEL_PR108_EVD003_BLOCKED_NO_MERGE`.**
