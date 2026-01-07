#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF' >&2
Usage:
  scripts/agent_pr_automerge_and_sync.sh [options]

Behavior:
  - Expects current branch name: task/<N>-<slug>
  - Requires file exists in HEAD: openspec/_ops/task_runs/ISSUE-N.md
  - Runs preflight: scripts/agent_pr_preflight.sh (unless --skip-preflight)
    - If preflight fails: creates/keeps PR as draft and waits by default
  - Ensures a PR exists (creates one unless --no-create)
  - Enables auto-merge (squash + delete branch), watches checks, waits merge
  - Syncs local controlplane main to origin/main (unless --no-sync)

Options:
  --pr <number>              Use an existing PR number
  --no-create                Do not create PR if missing
  --skip-preflight           Skip preflight entirely
  --force                    Proceed even if preflight fails
  --no-wait-preflight        Fail fast if preflight fails (still creates draft PR)
  --wait-interval <seconds>  Preflight polling interval (default: 60)
  --wait-timeout <seconds>   Preflight wait timeout, 0 means forever (default: 0)
  --no-wait                  Enable auto-merge but do not wait merge/sync
  --no-sync                  Skip controlplane sync after merge
  --timeout-seconds <n>      Merge wait timeout (default: 1800)
  --retries <n>              Network retries for gh/git push (default: 3)
  --sleep-seconds <n>        Sleep between retries (default: 3)
EOF
}

pr_number=""
no_create="false"
skip_preflight="false"
force="false"
wait_preflight="true"
wait_interval_seconds="60"
wait_timeout_seconds="0"
no_wait="false"
no_sync="false"
timeout_seconds="1800"
retries="3"
sleep_seconds="3"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --pr)
      pr_number="${2:-}"
      shift 2
      ;;
    --no-create)
      no_create="true"
      shift 1
      ;;
    --skip-preflight)
      skip_preflight="true"
      shift 1
      ;;
    --force)
      force="true"
      shift 1
      ;;
    --no-wait-preflight)
      wait_preflight="false"
      shift 1
      ;;
    --wait-interval)
      wait_interval_seconds="${2:-}"
      shift 2
      ;;
    --wait-timeout)
      wait_timeout_seconds="${2:-}"
      shift 2
      ;;
    --no-wait)
      no_wait="true"
      shift 1
      ;;
    --no-sync)
      no_sync="true"
      shift 1
      ;;
    --timeout-seconds)
      timeout_seconds="${2:-}"
      shift 2
      ;;
    --retries)
      retries="${2:-}"
      shift 2
      ;;
    --sleep-seconds)
      sleep_seconds="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 2
      ;;
  esac
done

if ! command -v gh >/dev/null 2>&1; then
  echo "missing dependency: gh" >&2
  exit 2
fi

if [[ -z "$(gh auth status 2>/dev/null || true)" ]]; then
  echo "gh auth required: run 'gh auth login' first" >&2
  exit 2
fi

if [[ -n "${pr_number}" ]] && ! [[ "${pr_number}" =~ ^[0-9]+$ ]]; then
  echo "Invalid --pr: ${pr_number} (expected positive integer)" >&2
  exit 2
fi

if ! [[ "${timeout_seconds}" =~ ^[0-9]+$ ]] || [[ "${timeout_seconds}" -lt 1 ]]; then
  echo "Invalid --timeout-seconds: ${timeout_seconds} (expected positive integer)" >&2
  exit 2
fi

if ! [[ "${retries}" =~ ^[0-9]+$ ]] || [[ "${retries}" -lt 1 ]]; then
  echo "Invalid --retries: ${retries} (expected positive integer)" >&2
  exit 2
fi

if ! [[ "${sleep_seconds}" =~ ^[0-9]+$ ]]; then
  echo "Invalid --sleep-seconds: ${sleep_seconds} (expected integer seconds)" >&2
  exit 2
fi

if ! [[ "${wait_interval_seconds}" =~ ^[0-9]+$ ]] || [[ "${wait_interval_seconds}" -lt 1 ]]; then
  echo "Invalid --wait-interval: ${wait_interval_seconds} (expected positive integer)" >&2
  exit 2
fi

if ! [[ "${wait_timeout_seconds}" =~ ^[0-9]+$ ]]; then
  echo "Invalid --wait-timeout: ${wait_timeout_seconds} (expected integer seconds)" >&2
  exit 2
fi

run_with_retries() {
  local attempt="1"
  while (( attempt <= retries )); do
    if "$@"; then
      return 0
    fi
    if (( attempt == retries )); then
      return 1
    fi
    sleep "${sleep_seconds}"
    attempt=$((attempt + 1))
  done
}

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
if [[ -z "${branch}" ]]; then
  echo "detached HEAD (expected task/<N>-<slug> branch)" >&2
  exit 2
fi

if ! [[ "${branch}" =~ ^task/([0-9]+)-([a-z0-9][a-z0-9-]*)$ ]]; then
  echo "invalid branch name: ${branch} (expected task/<N>-<slug>)" >&2
  exit 2
fi

issue_number="${BASH_REMATCH[1]}"
slug="${BASH_REMATCH[2]}"
run_log="openspec/_ops/task_runs/ISSUE-${issue_number}.md"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "working tree not clean; commit your changes before submitting PR" >&2
  git status --porcelain >&2
  exit 2
fi

if ! git cat-file -e "HEAD:${run_log}" 2>/dev/null; then
  echo "missing required run log in HEAD: ${run_log}" >&2
  exit 2
fi

if ! run_with_retries git push -u origin HEAD; then
  echo "failed to push after ${retries} attempts" >&2
  exit 1
fi

preflight_rc="0"
if [[ "${skip_preflight}" != "true" ]]; then
  set +e
  scripts/agent_pr_preflight.sh
  preflight_rc="$?"
  set -e
fi

if [[ -z "${pr_number}" ]]; then
  pr_number="$(gh pr list --head "${branch}" --json number --jq '.[0].number' 2>/dev/null || true)"
fi

if [[ -z "${pr_number}" ]]; then
  if [[ "${no_create}" == "true" ]]; then
    echo "ERROR: no PR found for branch ${branch} and --no-create set" >&2
    exit 1
  fi

  title="$(git log -1 --pretty=%s)"
  body=$(
    cat <<EOF
Closes #${issue_number}

## Summary
- (fill)

## Test plan
- \`openspec validate --specs --strict --no-interactive\`
- \`npm test\`
- \`npm run typecheck\`
- \`npm run build\`

## Evidence
- \`${run_log}\`
EOF
  )

  draft_flag=""
  if [[ "${preflight_rc}" != "0" && "${force}" != "true" ]]; then
    draft_flag="--draft"
  fi

  pr_url="$(run_with_retries gh pr create --base main --head "${branch}" ${draft_flag} --title "${title}" --body "${body}")"
  pr_number="${pr_url##*/}"
fi

if ! gh pr view "${pr_number}" --json body --jq .body | grep -Eiq "Closes[[:space:]]*#[[:space:]]*${issue_number}\\b"; then
  current_body="$(gh pr view "${pr_number}" --json body --jq .body)"
  if ! run_with_retries gh pr edit "${pr_number}" --body "${current_body}"$'\n\n'"Closes #${issue_number}"; then
    echo "failed to edit PR body after ${retries} attempts" >&2
    exit 1
  fi
fi

if [[ "${skip_preflight}" != "true" && "${preflight_rc}" != "0" && "${force}" != "true" ]]; then
  if [[ "${wait_preflight}" != "true" ]]; then
    echo "ERROR: preflight reported issues (exit ${preflight_rc})." >&2
    echo "       Resolve/coordinate then re-run, or use --force / --skip-preflight." >&2
    exit 1
  fi

  echo "Preflight blocked (exit ${preflight_rc}); waiting until it becomes OK (exit 0)." >&2
  echo "Tip: Ctrl-C to stop waiting; PR stays as draft if applicable." >&2

  start_ts="$(date +%s)"
  while true; do
    set +e
    scripts/agent_pr_preflight.sh
    preflight_rc="$?"
    set -e

    if [[ "${preflight_rc}" == "0" ]]; then
      break
    fi

    if [[ "${wait_timeout_seconds}" != "0" ]]; then
      now_ts="$(date +%s)"
      if (( now_ts - start_ts >= wait_timeout_seconds )); then
        echo "ERROR: preflight still failing after ${wait_timeout_seconds}s (last exit ${preflight_rc})." >&2
        exit 1
      fi
    fi

    sleep "${wait_interval_seconds}"
  done
fi

is_draft="$(gh pr view "${pr_number}" --json isDraft --jq '.isDraft')"
if [[ "${is_draft}" == "true" ]]; then
  gh pr ready "${pr_number}"
fi

if ! run_with_retries gh pr merge "${pr_number}" --auto --squash --delete-branch; then
  echo "failed to enable auto-merge after ${retries} attempts" >&2
  exit 1
fi

gh pr checks "${pr_number}" --watch

if [[ "${no_wait}" == "true" ]]; then
  exit 0
fi

deadline=$((SECONDS + timeout_seconds))
while (( SECONDS < deadline )); do
  merged_at="$(gh pr view "${pr_number}" --json mergedAt --jq '.mergedAt')"
  if [[ "${merged_at}" != "null" && -n "${merged_at}" ]]; then
    break
  fi

  state="$(gh pr view "${pr_number}" --json state --jq '.state')"
  if [[ "${state}" == "CLOSED" ]]; then
    echo "PR #${pr_number} closed without merge" >&2
    exit 1
  fi

  sleep 10
done

merged_at="$(gh pr view "${pr_number}" --json mergedAt --jq '.mergedAt')"
if [[ "${merged_at}" == "null" || -z "${merged_at}" ]]; then
  state="$(gh pr view "${pr_number}" --json state --jq '.state')"
  echo "timeout waiting PR #${pr_number} to merge (state=${state})" >&2
  gh pr checks "${pr_number}" || true
  exit 1
fi

if [[ "${no_sync}" == "true" ]]; then
  exit 0
fi

scripts/agent_controlplane_sync.sh --retries "${retries}" --sleep-seconds "${sleep_seconds}" --quiet

common_dir="$(git rev-parse --git-common-dir)"
controlplane_root="$(cd "$(dirname "${common_dir}")" && pwd)"

local_head="$(git -C "${controlplane_root}" rev-parse main)"
remote_head="$(git -C "${controlplane_root}" rev-parse origin/main)"

if [[ "${local_head}" != "${remote_head}" ]]; then
  echo "ERROR: controlplane main not in sync with origin/main" >&2
  echo "  local : ${local_head}" >&2
  echo "  remote: ${remote_head}" >&2
  exit 1
fi

echo "OK: merged PR #${pr_number} and synced controlplane main (issue #${issue_number}, slug ${slug})"

