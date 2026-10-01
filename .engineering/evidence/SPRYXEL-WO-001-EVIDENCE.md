# SPRYXEL-WO-001 Evidence Bundle

Status: READY_FOR_AUDIT after final exact-head checks are recorded in PR #3.

## Binding

- Repository: KayzenRoot/spryxel
- Issue: #2
- PR: #3
- Branch: codex/spryxel-wo-001-gef-github-governance
- Bound execution base: main@10dca04e38cfcd2e07335faf9078cc6041766c02
- Context Lock: .engineering/context-locks/SPRYXEL-WO-001.json, status FRESH at preflight; all nine critical Git blob fingerprints matched.
- GEF: @gef-bootstrap/cli 1.1.1; source commit 1dc030f1358eab0347043a3d54c7fc311c7c2123.
- Product implementation: NOT_STARTED.

The exact head that first passed all four intended GitHub Actions contexts before provider mutation was 17e7bdc52c02fb08ae69ccc23be89db767e33164. This evidence commit advances the branch; the final branch SHA and all four post-commit check-run IDs/URLs are recorded in the updated PR #3 description after those runs complete.

## Changed paths

### Existing Source Pack already present on PR #3 before this execution

These files were introduced by the admitted planning/source-pack commits and remain unchanged by this execution:

- AGENTS.md
- README.md
- .engineering/ARCHITECTURE.md
- .engineering/BACKLOG.md
- .engineering/CHECKPOINT.json
- .engineering/CHECKPOINT.md
- .engineering/DECISIONS-LEDGER.md
- .engineering/DEFINITION-OF-DONE.md
- .engineering/DEPLOYMENT.md
- .engineering/PROJECT-OVERVIEW.md
- .engineering/REQUIREMENTS.md
- .engineering/SCOPE.md
- .engineering/SECURITY.md
- .engineering/SOURCE-HIERARCHY.md
- .engineering/TEST-BENCHMARK-PLAN.md
- .engineering/context-locks/SPRYXEL-WO-001.json
- .engineering/work-orders/SPRYXEL-WO-001.md

### SPRYXEL-WO-001 execution and evidence paths

- .github/CODEOWNERS
- .github/ISSUE_TEMPLATE/work-order.yml
- .github/dependabot.yml
- .github/pull_request_template.md
- .github/scripts/pipeline-integrity.rb
- .github/workflows/gef-bootstrap-install.yml (removed)
- .github/workflows/gitleaks.yml
- .github/workflows/pipeline-integrity.yml
- .github/workflows/repository-validation.yml
- .github/workflows/trivy.yml
- .engineering/evidence/SPRYXEL-WO-001-EVIDENCE.md
- .engineering/checkpoint-deltas/SPRYXEL-WO-001-PROPOSED.md

No product/runtime source, package manifest, package lock, checkpoint, Context Lock, or .gef managed state was changed by this execution.

## GEF baseline and drift reconciliation

- Immutable initialization observation fingerprint: ae52168e19d137ddb1c4d5d1473c5409d41f30c1d3cd4ca011119969a00533c1 (model PROJECT_DRIFT_V1), recorded in .gef/init-state.json for run run-1-fb5489f151fc.
- Current deterministic status projection: before 8e6af789ede5f95e3a8022d8e084f3775da9d76b940fd83ca8d8c6f30e541954; after acc1557694c599a2820bee1afe1f2d3d85a1d899c919c1e0a7ba3883c431bd63; changed=true; class=UNEXPECTED.
- The raw UNEXPECTED class is expected under exact GEF 1.1.1: its project-root detector excludes .gef and .gef-private, then calls detectDrift with authorized=false. See the pinned [GEF registry source](https://github.com/KayzenRoot/gef-bootstrap/blob/1dc030f1358eab0347043a3d54c7fc311c7c2123/packages/cli/src/registry.ts) and [D-0007](../DECISIONS-LEDGER.md).
- The initialization was applied in PR #1 after the recorded observation. The init commit ea9a5504162305bd5522511b417d8b07448e033b has pre-apply parent a4d7a8ebddb1abd7613da87dc5c5f64e99c7b2cd. At that parent, tracked root entries were .github, .gitignore, README.md, package-lock.json, and package.json; the GEF init workflow had already run npm ci before gef init. Current runtime entries .git and node_modules therefore existed in the observation environment. .gef is excluded from the project-root fingerprint.
- The only new current project-root entries relative to that observed state are .engineering and AGENTS.md. Both are authorized Source Pack/Work Order governance paths introduced on PR #3. README.md changed as part of the same Source Pack but its root entry already existed, so it does not add a root-name delta.
- All .engineering paths listed above, including the Work Order and Context Lock, are Source Pack changes on PR #3; they contain no product implementation. The current WO adds only .github governance/CI paths and the two authorized evidence paths.
- .gef/init-state.json and .gef/receipts/run-1-fb5489f151fc.json were created by the PR #1 GEF bootstrap after its observation and are managed bootstrap evidence, outside the project-root projection. They are unchanged by this WO. git diff from the bound main base reports no .gef paths.
- .github existed at the recorded baseline. Replacing its mutable, contents:write bootstrap workflow with read-only, SHA-pinned governance workflows changes paths below that existing root and does not add another project-root entry.
- No GEF baseline, adopt state, or receipt was hand-edited or rebaselined.

## Local validation

| Check | Result |
| --- | --- |
| npm ci --ignore-scripts --no-audit --no-fund | PASS; one exact package installed |
| npx --no-install gef --version --json | PASS; version 1.1.1; Node v24.19.0 locally |
| npx --no-install gef doctor --target . --json | PASS; terminal SUCCEEDED; checkpoint present, readable, valid |
| Two consecutive gef status --target . --json outputs | PASS; byte-identical; repository clean at observation |
| .engineering/CHECKPOINT.json | PASS; JSON schemaVersion 2 |
| package.json, package-lock.json, Context Lock, init state, and GEF receipt JSON parsing | PASS |
| git diff --check 2b2ba580993f644c2d687ed89055363610e2b4c8..HEAD | PASS for the WO execution delta |
| .gef diff from bound main base | PASS; empty |

The repository-wide diff check from main also reports trailing Markdown spaces in the pre-existing, fingerprint-locked CHECKPOINT.md and SPRYXEL-WO-001.md source-pack files. Those files were not changed because doing so would invalidate the bound Context Lock. The CI workflow validates the execution delta without making this pre-existing source-pack formatting issue a false WO failure.

GEF doctor reports subcomponent security state REVIEW for unverified npm provenance and its empty GitHub security evidence input, while the doctor command itself succeeds. Exact GEF 1.1.1 does not discover the workflow pins through that input. Immutable Action enforcement and workflow policy are independently proven below.

## Exact-head checks before provider mutation

All four contexts were completed successfully on head 17e7bdc52c02fb08ae69ccc23be89db767e33164 by GitHub Actions integration 15368:

| Context | Result | Check run |
| --- | --- | --- |
| Repository validation | PASS | [110638305698](https://github.com/KayzenRoot/spryxel/actions/runs/36942905418/job/110638305698) |
| Pipeline integrity | PASS | [110638305766](https://github.com/KayzenRoot/spryxel/actions/runs/36942905452/job/110638305766) |
| Gitleaks secrets | PASS | [110638305733](https://github.com/KayzenRoot/spryxel/actions/runs/36942905527/job/110638305733) |
| Trivy filesystem and configuration | PASS | [110638305600](https://github.com/KayzenRoot/spryxel/actions/runs/36942905463/job/110638305600) |

Pipeline integrity parsed all six GitHub YAML configuration files and passed eight policy fixtures, including negative mutable-action, write-all, pull_request_target, and hidden-local-action cases. Gitleaks scanned the PR commit range with redacted output and found no blocking secret. Trivy filesystem and misconfiguration scanning reported no HIGH or CRITICAL result. The exact final-head check runs after this evidence commit are listed in the PR #3 description.

## Provider state

### Before

- Repository visibility: public.
- Default branch: main.
- Repository rulesets: none; legacy main branch protection endpoint returned Branch not protected (404).
- GitHub Actions: enabled; allowed_actions=all; sha_pinning_required=false.
- allow_update_branch=false; allow_squash_merge=true; allow_merge_commit=true; allow_rebase_merge=true; delete_branch_on_merge=false; allow_auto_merge=false.
- Secret scanning and push protection were already enabled. Dependabot security updates were disabled.
- Labels gef-managed and governed were absent.

### After, read back from GitHub

- Visibility remains public; default branch remains main.
- GitHub Actions: enabled; allowed_actions=all; sha_pinning_required=true.
- allow_update_branch=true to support the ruleset's strict up-to-date check policy. Existing merge methods, auto-merge, branch deletion, secret scanning, and push protection were not changed.
- Active repository ruleset ID 24340349, name SPRYXEL main governance, target branch, exact include refs/heads/main, no excluded refs, no bypass actors; current_user_can_bypass=never.
- Rules: deletion blocked; non-fast-forward blocked; pull request required; required_approving_review_count=0; required_review_thread_resolution=true; code-owner review, last-push approval, stale-review dismissal, and extra approval for unattributed changes disabled.
- Required status checks, each bound to GitHub Actions integration 15368: Repository validation; Pipeline integrity; Gitleaks secrets; Trivy filesystem and configuration.
- A negative liveness probe added an intentionally missing synthetic context to the required set and detected it as missing; the four configured contexts had successful exact-head runs and missingRequiredContexts=[].
- Labels created and read back: gef-managed (ID 12501767532) and governed (ID 12501767627). Issue #2 has governed; PR #3 has both.
- Dependabot configuration proposes weekly GitHub Actions updates only. npm/GEF package updates were excluded because GEF 1.1.1 is frozen by D-0001 and upgrades require a future Work Order.

## Findings, risks, and closeout

- CRITICAL findings: none observed.
- HIGH findings: none observed.
- The diagnostic GEF drift remains true/UNEXPECTED by design and is reconciled above; it was not suppressed.
- The source-pack trailing Markdown spaces remain unchanged and are outside this execution delta.
- Initial CI iterations found and corrected a stale negative-fixture accumulator in the pipeline policy test and an over-broad whole-PR whitespace check. No final required check uses a nonexistent or filtered context.
- The repository-local checkpoint remains unchanged. The separate proposed delta is not promoted.
- Final exact PR head SHA, final check-run IDs/URLs, and the final check conclusions are recorded in the PR #3 description after the evidence commit's workflows complete.

STOP CONDITION: SPRYXEL_WO_001_EXACT_HEAD_AND_PROVIDER_STATE_READY_FOR_AUDIT
