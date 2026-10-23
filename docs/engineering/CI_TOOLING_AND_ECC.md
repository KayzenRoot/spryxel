# Spryxel CI, GitHub apps and curated ECC playbooks

Audit baseline: 2026-10-23, `main 6a6b0fe3263e8af9daa026f94d0e9d7ca48b9b2f`. Intended as a small **draft PR**, not automatically merged.

## Verified GitHub capabilities

- Repository is public, GitHub Actions enabled with eight YAML workflows: `repository-validation`, `pipeline-integrity`, `gitleaks`, `trivy`, and `module-{core,integration,worker,browser}`.
- Exact PR #108 SHA `d7867965133f406fae76dbee424a25dd6eb102d5` yielded 11/11 checks SUCCESS.
- **Verified external GitHub Check Apps** on that SHA: SonarQube Cloud (`sonarqubecloud`) and Socket Security (`socket-security`). GitHub Actions produced **eight** check-runs, Socket **two**, and SonarQube Cloud **one**. Counts are verified at PR #108 exact HEAD; checks are not the same as installed Apps.
- Gitleaks and Trivy are scanners invoked by pinned GitHub Actions, **not** distinct third-party marketplace installations by that fact alone.
- CodeRabbit is not present among current 11 check-runs and has been removed by the owner. Older `Review skipped` messages are not an independent review.
- CodeQL is **not proved active** by those checks; do not claim it is installed. GitHub Copilot left historical comment-only review; pricing and current automated review enablement not verified.
- GitHub connector installation listing exposes only the current first-party connector installation, **not an exhaustive marketplace GitHub Apps inventory**. Account Settings > Applications > Installed GitHub Apps must be consulted for completeness; no admin action performed.
- `main` ruleset remains unchanged: repository validation, pipeline integrity, Gitleaks and Trivy are required; zero bypass actors. Independent approval may remain a stronger project gate despite `required_approving_review_count=0`.

## Workflow improvement proposed

Modify **existing required** `.github/workflows/repository-validation.yml`, retaining its pinned checkout/setup-node, npm cache, least-privilege token and job name. After `npm ci`, run **read-only, fast-fail** `npm run format:check` and `npm run lint` before heavier `npm run build` and `npm run architecture:check`. Do not add a redundant heavy workflow or change four required-check names, external app settings or merge rules. This prevents another PR #108-style local formatting/CI blind spot. If lint finds existing debt, keep this PR Draft and fix only separately verified blockers.

Existing core/integration/worker/browser path filters, cancellation, dependency cache and pinned Actions already reduce iteration costs. Keep them. Recommended future work (not enabled): measure duration of each check, avoid unnecessary full browser/integration runs only with guardrails, review CodeQL Free availability, and assess new-code coverage accurately.

## ECC selection (source and operational compatibility)

Provenance: MIT-licensed [affaan-m/ECC](https://github.com/affaan-m/ECC) at `90606c8315ee09cafc303515c5f33024db6b9882`. Corresponding source skill families:
- `search-first` => `spryxel-search-first`
- `change-impact` => `spryxel-change-impact`
- `contract-first` => `spryxel-contract-first`
- `security-review` => `spryxel-secure-review`
- `verification-loop` => `spryxel-verify`

These five repo-local **adapted** Agent Skills are in `.agents/skills/`. They are small, readable, task-triggered, and purpose-built for Spryxel commands and trust boundaries. This is a selective repo-scope installation of guidance, **not** the full ECC native Codex marketplace plugin. Native marketplace hooks and global tool registrations have **not** been installed, do not run, and must not be claimed active. Source release reports dozens of agents and hundreds of skills, many unrelated to this product.

Explicit exclusions: no ECC Pro/GitHub App or billed reviews, browser/MCP connectors, runtime hooks, self-writing memory, autonomous merges, destructive installers, model councils or broad AI orchestration. They create security, token, review, cost and duplicated-configuration risks. No new npm dependencies or lockfile changes.

## Suggested development loop

`scope -> reuse/search -> impact/contract -> tests -> smallest implementation -> fast formatting/lint -> affected build/tests -> security/diff -> independent review -> human-authorized merge`.

Always save exact-head results and sanitized logs in existing evidence practices. Avoid mandatory planning bureaucracy for routine bugfixes. Use skill instructions as relevant guidance, not as an authorization to access secrets, networks, paid services or production.

## Acceptance checklist (must be independently checked)

- The new workflow remains syntactically valid, unchanged job name `Repository validation`, read-only token, original action SHAs, and no changed required rules.
- Existing code compiles and satisfies `npm run format:check`, `npm run lint`, `npm run build`, `npm run architecture:check`. These commands must be executed by CI or in a real project checkout before claiming PASS.
- All five skill frontmatters parse, Codex discovers project skills on restart/new session, and no hook/native plugin was installed.
- No modifications to PR #108, PR #105, Issue #109, main, evidence/spryxel, rulesets or checkpoints; no merge/deploy, paid services, or admin changes.

STOP CONDITION: Proposed ECC selective onboarding in isolated draft PR; production activation only after CI validates and owner approves merge.
