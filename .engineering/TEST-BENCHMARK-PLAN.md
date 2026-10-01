# Test and Benchmark Plan

Status: SOURCE_PACK_CANDIDATE

## SPRYXEL-WO-001 test profile
Risk: ELEVATED.

Required local/executor proofs:
1. `npm ci --ignore-scripts --no-audit --no-fund`
2. exact JSON identity: GEF version == 1.1.1
3. `gef doctor --target . --json` succeeds
4. two consecutive `gef status --target . --json` outputs are byte-identical
5. checkpoint JSON parses and is GEF-supported schemaVersion 2
6. workflow/config syntax checks
7. `git diff --check`
8. Gitleaks scan
9. Trivy filesystem/config scan

Required provider proofs:
- exact final PR head and check suite;
- successful contexts intended for branch protection;
- ruleset and repository-settings read-back;
- negative proof that no required context is missing/permanently pending.

## Benchmarks
No product performance benchmark exists yet. Do not manufacture one. Governance execution should favor deterministic correctness over timing claims.
