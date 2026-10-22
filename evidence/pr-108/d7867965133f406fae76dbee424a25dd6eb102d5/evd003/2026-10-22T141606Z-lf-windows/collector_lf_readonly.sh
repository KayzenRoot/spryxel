#!/usr/bin/env bash
# One-shot evidence-only EVD-003 LF collector. No source-repository writes.
set -uo pipefail
EXPECTED_HEAD='d7867965133f406fae76dbee424a25dd6eb102d5'
EXPECTED_MAIN='6a6b0fe3263e8af9daa026f94d0e9d7ca48b9b2f'
BRANCH='feat/spryxel-phase-c-private-asset-contracts-clean-20261020'
URL='https://github.com/KayzenRoot/spryxel.git'
: "${EVD_RUN_ID:?EVD_RUN_ID is required}"
: "${EVD_RUN_DIR:?EVD_RUN_DIR is required}"
RUN_ID="$EVD_RUN_ID"
OUT="$EVD_RUN_DIR"
RAW="$OUT/raw"
mkdir -p "$RAW"
RECEIPT="$OUT/collector.receipt.txt"
: > "$RECEIPT"
record() { printf '%s\n' "$*" >> "$RECEIPT"; }
finish() {
  local result="$1"
  local code="$2"
  record "RESULT=$result"
  record "COLLECTOR_EXIT=$code"
  record "UTC_END=$(date -u +%FT%TZ)"
  exit "$code"
}
run_logged() {
  local tag="$1"
  local label="$2"
  shift 2
  record "COMMAND_$tag=$label"
  "$@" >"$RAW/$tag.stdout.log" 2>"$RAW/$tag.stderr.log"
  local rc=$?
  record "EXIT_$tag=$rc"
  return "$rc"
}

record 'MISSION=SPRYXEL-PR108-EVD-003'
record 'MODE=READ_ONLY_TEMPORARY_LF_CLONE'
record "RUN_ID=$RUN_ID"
record "EXPECTED_HEAD=$EXPECTED_HEAD"
record "EXPECTED_MAIN=$EXPECTED_MAIN"
record "UTC_START=$(date -u +%FT%TZ)"

run_logged node_version 'node --version' node --version || finish BLOCKED_NODE 10
run_logged npm_version 'npm --version' npm --version || finish BLOCKED_NPM 11
run_logged git_version 'git --version' git --version || finish BLOCKED_GIT 12

run_logged branch_ref_before "git ls-remote $URL refs/heads/$BRANCH" git ls-remote "$URL" "refs/heads/$BRANCH" || finish BLOCKED_REMOTE_HEAD 20
run_logged main_ref_before "git ls-remote $URL refs/heads/main" git ls-remote "$URL" refs/heads/main || finish BLOCKED_REMOTE_MAIN 21
REMOTE_HEAD_BEFORE="$(awk -v ref="refs/heads/$BRANCH" '$2==ref {print $1; exit}' "$RAW/branch_ref_before.stdout.log")"
REMOTE_MAIN_BEFORE="$(awk '$2=="refs/heads/main" {print $1; exit}' "$RAW/main_ref_before.stdout.log")"
record "REMOTE_HEAD_BEFORE=$REMOTE_HEAD_BEFORE"
record "REMOTE_MAIN_BEFORE=$REMOTE_MAIN_BEFORE"
[[ "$REMOTE_HEAD_BEFORE" == "$EXPECTED_HEAD" && "$REMOTE_MAIN_BEFORE" == "$EXPECTED_MAIN" ]] || finish STALE_SHA_BEFORE 41

WORK="$(mktemp -d "${TMPDIR:-/tmp}/spryxel-evd003-lf-XXXXXXXX")" || finish BLOCKED_TEMP_DIR 30
run_logged clone 'git clone --no-checkout --single-branch --branch <code-branch> <repo-url> <temporary-path>' git clone --no-checkout --quiet --single-branch --branch "$BRANCH" "$URL" "$WORK/repo" || finish BLOCKED_CLONE 31
run_logged configure_autocrlf 'git config --local core.autocrlf false in temporary clone' git -C "$WORK/repo" config --local core.autocrlf false || finish BLOCKED_GIT_CONFIG 32
run_logged configure_eol 'git config --local core.eol lf in temporary clone' git -C "$WORK/repo" config --local core.eol lf || finish BLOCKED_GIT_CONFIG 32
run_logged verify_autocrlf 'git config --get core.autocrlf' git -C "$WORK/repo" config --get core.autocrlf || finish BLOCKED_GIT_CONFIG 32
run_logged verify_eol 'git config --get core.eol' git -C "$WORK/repo" config --get core.eol || finish BLOCKED_GIT_CONFIG 32
[[ "$(tr -d '\r\n' < "$RAW/verify_autocrlf.stdout.log")" == "false" ]] || finish BLOCKED_GIT_CONFIG 32
[[ "$(tr -d '\r\n' < "$RAW/verify_eol.stdout.log")" == "lf" ]] || finish BLOCKED_GIT_CONFIG 32

run_logged checkout 'git checkout --detach <expected-head>' git -C "$WORK/repo" checkout --quiet --detach "$EXPECTED_HEAD" || finish BLOCKED_CHECKOUT 33
run_logged head_before 'git rev-parse HEAD' git -C "$WORK/repo" rev-parse HEAD || finish BLOCKED_HEAD 34
HEAD_BEFORE="$(tr -d '\r\n' < "$RAW/head_before.stdout.log")"
record "HEAD_BEFORE=$HEAD_BEFORE"
[[ "$HEAD_BEFORE" == "$EXPECTED_HEAD" ]] || finish STALE_SHA_CHECKOUT 41
run_logged git_status_before 'git status --porcelain=v1' git -C "$WORK/repo" status --porcelain=v1 || finish BLOCKED_STATUS 35
[[ ! -s "$RAW/git_status_before.stdout.log" ]] || finish DIRTY_BEFORE_TESTS 44

run_logged git_eol 'git ls-files --eol' git -C "$WORK/repo" ls-files --eol || finish BLOCKED_GIT_EOL 36
run_logged git_eol_validation 'require every i/lf entry to have w/lf; report binary/other entries separately' awk '
  $1 == "i/lf" { indexed_lf++; if ($2 != "w/lf") { print "MISMATCH " $0; mismatches++ } }
  $1 == "i/crlf" { indexed_crlf++ }
  $1 == "i/-text" { binary++ }
  END {
    printf "INDEX_LF_FILES=%d\nINDEX_CRLF_FILES=%d\nBINARY_OR_NON_TEXT_FILES=%d\nLF_WORKTREE_MISMATCHES=%d\n", indexed_lf, indexed_crlf, binary, mismatches
    if (mismatches > 0) exit 1
  }
' "$RAW/git_eol.stdout.log" || finish BLOCKED_GIT_EOL_VALIDATION 37
record "GIT_EOL_SUMMARY=$(tr '\n' ';' < "$RAW/git_eol_validation.stdout.log" | sed 's/;$//')"

run_logged npm_ci 'npm ci --ignore-scripts --no-audit --no-fund' npm ci --ignore-scripts --no-audit --no-fund || finish BLOCKED_DEPENDENCIES 50
run_logged biome_version './node_modules/.bin/biome --version' ./node_modules/.bin/biome --version || finish BLOCKED_BIOME 51
if ! grep -Eq '(^|[^[:digit:].])2\.5\.15([^[:digit:].]|$)' "$RAW/biome_version.stdout.log"; then finish WRONG_BIOME_VERSION 52; fi

FORMAT_EXIT=0
if run_logged format_check 'npm run format:check' npm run format:check; then
  FORMAT_EXIT=0
else
  FORMAT_EXIT=$?
fi
record "FORMAT_CHECK_EXIT=$FORMAT_EXIT"

run_logged git_diff_check 'git diff --check' git -C "$WORK/repo" diff --check || finish DIRTY_AFTER_TESTS 44
run_logged git_diff_working 'git diff --exit-code' git -C "$WORK/repo" diff --exit-code || finish DIRTY_AFTER_TESTS 44
run_logged git_diff_staged 'git diff --cached --exit-code' git -C "$WORK/repo" diff --cached --exit-code || finish DIRTY_AFTER_TESTS 44
run_logged git_status_after 'git status --porcelain=v1' git -C "$WORK/repo" status --porcelain=v1 || finish BLOCKED_STATUS 35
[[ ! -s "$RAW/git_status_after.stdout.log" ]] || finish DIRTY_AFTER_TESTS 44
run_logged head_after 'git rev-parse HEAD' git -C "$WORK/repo" rev-parse HEAD || finish BLOCKED_HEAD 34
HEAD_AFTER="$(tr -d '\r\n' < "$RAW/head_after.stdout.log")"
record "HEAD_AFTER=$HEAD_AFTER"
[[ "$HEAD_AFTER" == "$EXPECTED_HEAD" ]] || finish STALE_SHA_AFTER 41

run_logged branch_ref_after "git ls-remote $URL refs/heads/$BRANCH" git ls-remote "$URL" "refs/heads/$BRANCH" || finish BLOCKED_REMOTE_HEAD_AFTER 22
run_logged main_ref_after "git ls-remote $URL refs/heads/main" git ls-remote "$URL" refs/heads/main || finish BLOCKED_REMOTE_MAIN_AFTER 23
REMOTE_HEAD_AFTER="$(awk -v ref="refs/heads/$BRANCH" '$2==ref {print $1; exit}' "$RAW/branch_ref_after.stdout.log")"
REMOTE_MAIN_AFTER="$(awk '$2=="refs/heads/main" {print $1; exit}' "$RAW/main_ref_after.stdout.log")"
record "REMOTE_HEAD_AFTER=$REMOTE_HEAD_AFTER"
record "REMOTE_MAIN_AFTER=$REMOTE_MAIN_AFTER"
[[ "$REMOTE_HEAD_AFTER" == "$EXPECTED_HEAD" && "$REMOTE_MAIN_AFTER" == "$EXPECTED_MAIN" ]] || finish STALE_SHA_AFTER 41

if [[ "$FORMAT_EXIT" -ne 0 ]]; then finish BLOCKED_FORMAT_CHECK 43; fi
finish FORMAT_EVIDENCE_PASS 0

