# Spryxel: build-first development (CoinBlink pattern)

**Goal:** advance working Spryxel modules rather than a governance framework. This is the repository's active development procedure after owner-directed GEF Bootstrap removal.

1. Pick the smallest useful feature or defect from a normal GitHub issue. Document scope and dependencies in the PR; no mandatory Work Order, checkpoint delta, GEF command or executable Context Lock.
2. Make code changes in an ordinary feature branch. Keep the existing technical monorepo; never migrate Astro/D1 workflows from CoinBlink by copy/paste.
3. Run `npm ci --ignore-scripts`, `npm run build`, and inspect `npm run dev`. Run focused tests for the changed module. Record checks actually executed, not guesses.
4. PR CI: always-on **Repository validation** (install/build/architecture); **Pipeline integrity**, **Gitleaks secrets**, **Trivy** security; module-targeted unit, worker, real PostgreSQL/RLS/API integration and Playwright browser tests. SonarCloud/Socket may report externally. Other GitHub required checks remain active until settings are separately changed.
5. Fix broken checks and serious security flaws. PR and post-merge evidence are linked to the exact commit SHA. Owner gives a distinct merge authorization. No automatic production deployment.
6. Continue iterating on real product functions, not approval paperwork.

**Safety:** PostgreSQL FORCE RLS, tenant/project authorization, JWT/WorkOS verification, immutable asset provenance, private storage, idempotency and CostGuard DENY are product guarantees, not GEF features. Keep them and use realistic negative tests. Local Docker profiles are disposable and contain no real credentials. No paid/cloud/GPU/production-provider operations without separate owner request.

**History:** Previously admitted WO-010 Phase A+B and evidence remain intact. Phase C option-A drafts in PR #105 remain proposals until the owner chooses the new implementation scope. Past Git commits cannot and should not be rewritten to hide the historical use of GEF Bootstrap.
