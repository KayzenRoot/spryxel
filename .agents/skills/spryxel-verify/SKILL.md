---
name: spryxel-verify
description: Fast evidence-driven validation before Spryxel PR handoff: formatting, lint, architecture, focused tests, source SHA and clean diff.
---

# Spryxel Verify

**Source:** ECC by Affaan Mustafa, MIT license, `affaan-m/ECC@90606c8315ee09cafc303515c5f33024db6b9882`. Adapted task playbooks, **not** the entire ECC agent/plugin/runtime. License: `docs/engineering/THIRD_PARTY_ECC_MIT_LICENSE.txt`.

Check actual `package.json` commands first. Do not use generic ECC's `npm test -- --coverage`, `pnpm`, or Astro/D1 commands here.

1. Pin SHA and `pwd -P`. On Windows use an explicit LF checkout and `core.autocrlf=false`, `core.eol=lf` **before checkout**; run commands in the same clone.
2. No global installs. With permitted network/package access: `npm ci --ignore-scripts --no-audit --no-fund`. Otherwise mark `BLOCKED_DEPENDENCIES`.
3. Cheap checks first: `npm run format:check`, `npm run lint`, `npm run architecture:check`. Capture real exit codes; no formatter writes.
4. If relevant, `npm run build`, then `npm run test:unit`. Add `test:worker`, `test:integration` (requires isolated Docker PostgreSQL/Redis/S3-compatible services) and `test:browser` (Chromium) only when affected and resources are available.
5. Verify `git diff --check`, `git status --porcelain`, `git rev-parse HEAD`. For PRs, verify GitHub checks, Sonar, Gitleaks, Trivy, Socket and review threads at exact HEAD.
6. Capture stdout/stderr, versions, results and a truthful `PASS/FAIL/BLOCKED/NOT_RUN`; store sanitized SHA-256-evidenced logs according to current project branch policy. Never alter the code to make a check appear green.

**STOP:** concise evidence table with unknowns and next actionable blocker. A passing quality gate does not establish test coverage or independent reviewer approval. No automatic merge/deploy.
