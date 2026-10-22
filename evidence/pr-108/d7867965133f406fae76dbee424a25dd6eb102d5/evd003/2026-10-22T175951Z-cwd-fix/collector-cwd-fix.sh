#!/usr/bin/env bash
set -uo pipefail

EXPECTED_HEAD='d7867965133f406fae76dbee424a25dd6eb102d5'
EXPECTED_MAIN='6a6b0fe3263e8af9daa026f94d0e9d7ca48b9b2f'
BRANCH='feat/spryxel-phase-c-private-asset-contracts-clean-20261020'
URL='https://github.com/KayzenRoot/spryxel.git'
: "${EVD_RUN_ID:?EVD_RUN_ID is required}"
: "${EVD_RUN_ROOT:?EVD_RUN_ROOT is required}"
RUN_ID="$EVD_RUN_ID"
RUN_ROOT="$EVD_RUN_ROOT"
OUT="$RUN_ROOT/evidence"
RAW="$RUN_ROOT/raw-private"
mkdir -p "$OUT" "$RAW" "$RUN_ROOT/work" || exit 80
START_UTC="$(date -u +%FT%TZ)"
META="$RAW/command-metadata.log"
EXITS="$RAW/exit-codes.log"
: > "$META"
: > "$EXITS"

record() { printf '%s=%s
' "$1" "$2"; }
run_logged() {
  local tag="$1" label="$2" rc start end
  shift 2
  start="$(date -u +%FT%TZ)"
  {
    printf 'UTC_START=%s
' "$start"
    printf 'LABEL=%s
' "$label"
    printf 'CALLER_CWD=%s
' "$(pwd -P)"
  } >> "$META"
  "$@" > "$RAW/$tag.stdout.log" 2> "$RAW/$tag.stderr.log"
  rc=$?
  end="$(date -u +%FT%TZ)"
  printf '%s=%s
' "$tag" "$rc" >> "$EXITS"
  {
    printf 'UTC_END=%s
' "$end"
    printf 'EXIT_CODE=%s

' "$rc"
  } >> "$META"
  return "$rc"
}

run_in_clone() { ( cd "$WORK/repo" || return 90; "$@" ); }

capture_cwd() {
  local stage="$1" actual expected rc
  if run_logged "cwd_$stage" "run_in_clone pwd -P before $stage" run_in_clone pwd -P; then
    rc=0
  else
    rc=$?
  fi
  actual="$(tr -d '\r\n' < "$RAW/cwd_$stage.stdout.log")"
  expected="$(cd "$WORK/repo" && pwd -P)"
  printf 'STAGE=%s
ACTUAL=%s
EXPECTED=%s
MATCH=%s
EXIT_CODE=%s

'     "$stage" "$actual" "$expected" "$([[ "$actual" == "$expected" && "$rc" == 0 ]] && echo true || echo false)" "$rc"     >> "$RAW/execution-cwd.private.log"
  [[ "$rc" == 0 && "$actual" == "$expected" ]]
}

record 'MISSION' 'SPRYXEL-PR108-EVD-003-CWD-FIX'
record 'RUN_ID' "$RUN_ID"
record 'EXPECTED_HEAD' "$EXPECTED_HEAD"
record 'EXPECTED_MAIN' "$EXPECTED_MAIN"
record 'UTC_START' "$START_UTC"

run_logged node_version 'node --version' node --version || { echo BLOCKED_NODE; exit 10; }
NODE_VERSION="$(tr -d '\r\n' < "$RAW/node_version.stdout.log")"
run_logged npm_version 'npm --version' npm --version || { echo BLOCKED_NPM; exit 11; }
NPM_VERSION="$(tr -d '\r\n' < "$RAW/npm_version.stdout.log")"
run_logged git_version 'git --version' git --version || { echo BLOCKED_GIT; exit 12; }
GIT_VERSION="$(tr -d '\r\n' < "$RAW/git_version.stdout.log")"

run_logged main_ref_before 'git ls-remote origin refs/heads/main' git ls-remote "$URL" refs/heads/main || { echo BLOCKED_MAIN_REF; exit 20; }
run_logged code_ref_before "git ls-remote origin refs/heads/$BRANCH" git ls-remote "$URL" "refs/heads/$BRANCH" || { echo BLOCKED_CODE_REF; exit 21; }
REMOTE_MAIN_BEFORE="$(awk '$2=="refs/heads/main" {print $1; exit}' "$RAW/main_ref_before.stdout.log")"
REMOTE_HEAD_BEFORE="$(awk -v ref="refs/heads/$BRANCH" '$2==ref {print $1; exit}' "$RAW/code_ref_before.stdout.log")"
[[ "$REMOTE_HEAD_BEFORE" == "$EXPECTED_HEAD" && "$REMOTE_MAIN_BEFORE" == "$EXPECTED_MAIN" ]] || { echo BLOCKED_STALE_BEFORE; exit 41; }

WORK="$(mktemp -d "$RUN_ROOT/work/clone-XXXXXX")" || { echo BLOCKED_TEMP_DIR; exit 30; }
run_logged clone 'git clone --no-checkout --single-branch --branch source branch' git clone --no-checkout --quiet --single-branch --branch "$BRANCH" "$URL" "$WORK/repo" || { echo BLOCKED_CLONE; exit 31; }
run_logged configure_autocrlf 'git config --local core.autocrlf false before checkout' git -C "$WORK/repo" config --local core.autocrlf false || { echo BLOCKED_GIT_CONFIG; exit 32; }
run_logged configure_eol 'git config --local core.eol lf before checkout' git -C "$WORK/repo" config --local core.eol lf || { echo BLOCKED_GIT_CONFIG; exit 32; }
run_logged verify_autocrlf 'git config --get core.autocrlf' git -C "$WORK/repo" config --get core.autocrlf || { echo BLOCKED_GIT_CONFIG; exit 32; }
run_logged verify_eol 'git config --get core.eol' git -C "$WORK/repo" config --get core.eol || { echo BLOCKED_GIT_CONFIG; exit 32; }
[[ "$(tr -d '\r\n' < "$RAW/verify_autocrlf.stdout.log")" == 'false' && "$(tr -d '\r\n' < "$RAW/verify_eol.stdout.log")" == 'lf' ]] || { echo BLOCKED_GIT_CONFIG; exit 32; }
run_logged checkout 'git checkout --detach exact source HEAD' git -C "$WORK/repo" checkout --quiet --detach "$EXPECTED_HEAD" || { echo BLOCKED_CHECKOUT; exit 33; }
run_logged head_before 'git rev-parse HEAD before npm' git -C "$WORK/repo" rev-parse HEAD || { echo BLOCKED_HEAD; exit 34; }
HEAD_BEFORE="$(tr -d '\r\n' < "$RAW/head_before.stdout.log")"
[[ "$HEAD_BEFORE" == "$EXPECTED_HEAD" ]] || { echo BLOCKED_STALE_CHECKOUT; exit 41; }
run_logged status_before 'git status --porcelain before npm' git -C "$WORK/repo" status --porcelain=v1 || { echo BLOCKED_STATUS; exit 35; }
[[ ! -s "$RAW/status_before.stdout.log" ]] || { echo BLOCKED_DIRTY_BEFORE; exit 44; }
run_logged package_manager 'node read packageManager and engines.node' run_in_clone node -e 'const p=require("./package.json"); process.stdout.write(JSON.stringify({packageManager:p.packageManager,node:p.engines?.node})+String.fromCharCode(10))' || { echo BLOCKED_PACKAGE_METADATA; exit 36; }
PACKAGE_METADATA="$(tr -d '\r\n' < "$RAW/package_manager.stdout.log")"

run_logged git_eol_before 'git ls-files --eol before npm' git -C "$WORK/repo" ls-files --eol || { echo BLOCKED_GIT_EOL; exit 37; }
run_logged git_eol_before_validation 'validate tracked text i/lf w/lf before npm' awk '
  $1 == "i/lf" && $2 == "w/lf" { text++ ; next }
  $1 == "i/-text" && $2 == "w/-text" { binary++ ; next }
  { print "UNEXPECTED_EOL", $0; unexpected++ }
  END {
    print "TEXT_FILES_I_LF_W_LF=" text
    print "BINARY_FILES=" binary
    print "UNEXPECTED_EOL_ENTRIES=" unexpected
    if (unexpected > 0) exit 1
  }
' "$RAW/git_eol_before.stdout.log" || { echo BLOCKED_GIT_EOL_VALIDATION; exit 38; }

capture_cwd pre_npm || { echo BLOCKED_CWD; exit 90; }
run_logged head_immediately_before_npm 'git rev-parse HEAD immediately before npm ci' git -C "$WORK/repo" rev-parse HEAD || { echo BLOCKED_HEAD; exit 34; }
HEAD_IMMEDIATELY_BEFORE_NPM="$(tr -d '\r\n' < "$RAW/head_immediately_before_npm.stdout.log")"
[[ "$HEAD_IMMEDIATELY_BEFORE_NPM" == "$EXPECTED_HEAD" ]] || { echo BLOCKED_STALE_CHECKOUT; exit 41; }

NPM_EXIT=0
if run_logged npm_ci 'npm ci no clone LF' run_in_clone npm ci --ignore-scripts --no-audit --no-fund; then NPM_EXIT=0; else NPM_EXIT=$?; fi
run_logged git_eol_after_npm 'git ls-files --eol after npm ci' git -C "$WORK/repo" ls-files --eol || { echo BLOCKED_GIT_EOL_AFTER_NPM; exit 39; }
run_logged git_eol_after_npm_validation 'validate tracked text i/lf w/lf after npm ci' awk '
  $1 == "i/lf" && $2 == "w/lf" { text++ ; next }
  $1 == "i/-text" && $2 == "w/-text" { binary++ ; next }
  { print "UNEXPECTED_EOL", $0; unexpected++ }
  END {
    print "TEXT_FILES_I_LF_W_LF=" text
    print "BINARY_FILES=" binary
    print "UNEXPECTED_EOL_ENTRIES=" unexpected
    if (unexpected > 0) exit 1
  }
' "$RAW/git_eol_after_npm.stdout.log"
EOL_AFTER_EXIT=$?
if [[ "$NPM_EXIT" == 0 && "$EOL_AFTER_EXIT" == 0 ]]; then
  capture_cwd pre_biome || { echo BLOCKED_CWD; exit 90; }
  BIOME_EXIT=0
  if run_logged biome_version 'Biome 2.5.15 no clone LF' run_in_clone ./node_modules/.bin/biome --version; then BIOME_EXIT=0; else BIOME_EXIT=$?; fi
  BIOME_VERSION="$(grep -oE '[0-9]+[.][0-9]+[.][0-9]+' "$RAW/biome_version.stdout.log" | tail -n 1)"
  if [[ "$BIOME_EXIT" == 0 && "$BIOME_VERSION" == '2.5.15' ]]; then
    capture_cwd pre_format || { echo BLOCKED_CWD; exit 90; }
    FORMAT_EXIT=0
    if run_logged format_check 'format:check no clone LF' run_in_clone npm run format:check; then FORMAT_EXIT=0; else FORMAT_EXIT=$?; fi
  else
    FORMAT_EXIT=-1
  fi
else
  BIOME_EXIT=-1
  BIOME_VERSION='NOT_RUN'
  FORMAT_EXIT=-1
fi

run_logged head_after 'git rev-parse HEAD after validation' git -C "$WORK/repo" rev-parse HEAD || { echo BLOCKED_HEAD; exit 34; }
HEAD_AFTER="$(tr -d '\r\n' < "$RAW/head_after.stdout.log")"
run_logged diff_check 'git diff --check' git -C "$WORK/repo" diff --check || { echo BLOCKED_WORKTREE_DIFF_CHECK; exit 44; }
run_logged diff_worktree 'git diff --exit-code' git -C "$WORK/repo" diff --exit-code || { echo BLOCKED_TRACKED_WORKTREE_CHANGE; exit 44; }
run_logged diff_cached 'git diff --cached --exit-code' git -C "$WORK/repo" diff --cached --exit-code || { echo BLOCKED_STAGED_CHANGE; exit 44; }
run_logged status_after 'git status --porcelain after validation' git -C "$WORK/repo" status --porcelain=v1 || { echo BLOCKED_STATUS; exit 35; }
[[ ! -s "$RAW/status_after.stdout.log" ]] || { echo BLOCKED_DIRTY_AFTER; exit 44; }

run_logged code_ref_after "git ls-remote origin refs/heads/$BRANCH after validation" git ls-remote "$URL" "refs/heads/$BRANCH" || { echo BLOCKED_CODE_REF_AFTER; exit 22; }
run_logged main_ref_after 'git ls-remote origin refs/heads/main after validation' git ls-remote "$URL" refs/heads/main || { echo BLOCKED_MAIN_REF_AFTER; exit 23; }
REMOTE_HEAD_AFTER="$(awk -v ref="refs/heads/$BRANCH" '$2==ref {print $1; exit}' "$RAW/code_ref_after.stdout.log")"
REMOTE_MAIN_AFTER="$(awk '$2=="refs/heads/main" {print $1; exit}' "$RAW/main_ref_after.stdout.log")"
[[ "$HEAD_AFTER" == "$EXPECTED_HEAD" && "$REMOTE_HEAD_AFTER" == "$EXPECTED_HEAD" && "$REMOTE_MAIN_AFTER" == "$EXPECTED_MAIN" ]] || { echo BLOCKED_STALE_AFTER; exit 42; }

if [[ "$NPM_EXIT" != 0 ]]; then RESULT='BLOCKED_NPM_CI'; COLLECTOR_EXIT=50
elif [[ "$EOL_AFTER_EXIT" != 0 ]]; then RESULT='BLOCKED_GIT_EOL_AFTER_NPM'; COLLECTOR_EXIT=39
elif [[ "$BIOME_EXIT" != 0 || "$BIOME_VERSION" != '2.5.15' ]]; then RESULT='BLOCKED_BIOME_VERSION'; COLLECTOR_EXIT=52
elif [[ "$FORMAT_EXIT" != 0 ]]; then RESULT='BLOCKED_FORMAT_ON_EXACT_HEAD'; COLLECTOR_EXIT=43
else RESULT='FORMAT_PASS'; COLLECTOR_EXIT=0
fi

END_UTC="$(date -u +%FT%TZ)"
cat > "$RUN_ROOT/result.env" <<EOF
RUN_ID=$RUN_ID
RESULT=$RESULT
COLLECTOR_EXIT=$COLLECTOR_EXIT
EXPECTED_HEAD=$EXPECTED_HEAD
HEAD_BEFORE=$HEAD_BEFORE
HEAD_IMMEDIATELY_BEFORE_NPM=$HEAD_IMMEDIATELY_BEFORE_NPM
HEAD_AFTER=$HEAD_AFTER
EXPECTED_MAIN=$EXPECTED_MAIN
REMOTE_HEAD_BEFORE=$REMOTE_HEAD_BEFORE
REMOTE_HEAD_AFTER=$REMOTE_HEAD_AFTER
REMOTE_MAIN_BEFORE=$REMOTE_MAIN_BEFORE
REMOTE_MAIN_AFTER=$REMOTE_MAIN_AFTER
NODE_VERSION=$NODE_VERSION
NPM_VERSION=$NPM_VERSION
GIT_VERSION=$GIT_VERSION
PACKAGE_METADATA=$PACKAGE_METADATA
NPM_EXIT=$NPM_EXIT
BIOME_VERSION=$BIOME_VERSION
BIOME_EXIT=$BIOME_EXIT
FORMAT_EXIT=$FORMAT_EXIT
EOL_AFTER_EXIT=$EOL_AFTER_EXIT
START_UTC=$START_UTC
END_UTC=$END_UTC
WORK_PATH=$WORK
EOF
cp "$BASH_SOURCE" "$OUT/collector-cwd-fix.sh"
printf '%s
' "$RESULT" > "$RUN_ROOT/result.txt"
printf 'RESULT=%s
COLLECTOR_EXIT=%s
' "$RESULT" "$COLLECTOR_EXIT"
exit "$COLLECTOR_EXIT"