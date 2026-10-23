# PR #110 | ROOT CAUSE PROVEN: case-insensitive Windows path collision

Date: 2026-10-23
Repository: KayzenRoot/spryxel
PR #110 exact HEAD: `b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b`
Main exact SHA: `126e3a17265e38c94c5057d5d423eb14a12bb9c9`
Prior forensic evidence: `952ae3d9f684d71ae24041cc9a4585fb3bf1ab0e`
Status: `ROOT_CAUSE_CONFIRMED / CORRECTION_NOT_APPLIED / ECC5_NOT_RUN`

## Findings verified directly from immutable GitHub refs

GitHub REST `GET /git/trees/b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b?recursive=1` returned an untruncated tree of **394 entries**. A case-insensitive comparison of **all** paths discovered exactly one collision:

| Git path at PR HEAD | Git blob SHA-1 | Content |
| --- | --- | --- |
| `.github/PULL_REQUEST_TEMPLATE.md` | `042e00c0560887f90a0b7d69e75010a21c10c8a3` | 673 bytes, 17 LF, starts `## Vertical scope` |
| `.github/pull_request_template.md` | `90e8d37ddee973aafcb230e48e15dd83cab4c2a6` | 683 bytes, 23 LF, starts `## Feature or fix` |

GitHub REST `GET /git/trees/126e3a17265e38c94c5057d5d423eb14a12bb9c9?recursive=1` returned an untruncated main tree of **378 entries**, with only **the lowercase** `.github/pull_request_template.md` (blob `90e8d37ddee973aafcb230e48e15dd83cab4c2a6`). The uppercase file was introduced by PR #110, as confirmed by the PR's changed-file patch. No other casefold collisions in either HEAD or main.

In the user's [authenticated Windows forensic report](https://github.com/KayzenRoot/spryxel/blob/952ae3d9f684d71ae24041cc9a4585fb3bf1ab0e/evidence/pr-110/b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b/template-forensics/2026-10-23T195055Z-template-forensics/audit.md), BOTH fresh Windows clones checked out exact `b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b` and had the uppercase index blob `042e00c...` but the physical `.github/PULL_REQUEST_TEMPLATE.md` bytes equal `90e8d37...`, which is **exactly the separately tracked lowercase template**. The full [clone-A patch](https://github.com/KayzenRoot/spryxel/blob/952ae3d9f684d71ae24041cc9a4585fb3bf1ab0e/evidence/pr-110/b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b/template-forensics/2026-10-23T195055Z-template-forensics/raw/clone-a-diff.patch) confirms a wholesale content replacement from `Vertical scope` to `Feature or fix`, not a formatter change. Clone B was identical.

Windows default case-insensitive worktree paths cannot represent both Git paths as separate physical files. The second tracked Git path overwrites/collides with the first on checkout; the index still has two distinct entries. This **fully explains the observed clean-tree failures**, though it does not establish which underlying Windows API operation ran last. EOL, clean filters and globally configured attributes are not the cause.

Source working tree `git diff --check` exit 0 is consistent with a content conflict that does not introduce trailing whitespace, and does NOT prove a clean worktree. The evidence-branch `git diff --cached --check` exit 2/99 trailing-space diagnostics is a separate archival-quality finding; previously published byte-accurate forensic files and manifests must not be altered to conceal it.

## Scope / safeguards

GitHub current-state preflight: PR #110 OPEN/DRAFT; exact HEAD `b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b`; main `126e3a17265e38c94c5057d5d423eb14a12bb9c9`; **7/7 current CI checks SUCCESS** including Trivy, SonarCloud and Socket; ruleset 24340349 active with zero bypass actors; PR #105 and PR #108 remained open on their prior HEADs.

**This audit only publishes new evidence**. Product PR #110's code/template and main remain unchanged in this turn. The five ECC skills remain `NOT_RUN`. No checkout gate was bypassed. No merge, deploy, paid API, ruleset or checkpoint changes.

## Next safe step

Apply the precise [two-path correction work order](./minimal-fix-work-order.md) ONLY on PR #110 branch after a new owner decision, then verify the new commit has no case-fold collision, Windows checkout is clean, CI recompletes and the exact new SHA is used for skill functional tests. Preserve all previous evidence as immutable.
