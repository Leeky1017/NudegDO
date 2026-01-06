#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE' >&2
Usage:
  scripts/agent_pr_automerge_and_sync.sh [--no-wait] [--timeout-seconds <n>] [--retries <n>] [--sleep-seconds <n>]

What it does:
  - Push current task/<N>-<slug> branch
  - Ensure PR exists and contains "Closes #<N>"
  - Enable auto-merge (squash + delete branch)
  - (Default) wait until merged, then sync control-plane main worktree

Notes:
  - Run inside the task worktree (not the control-plane repo root)
  - Requires GitHub CLI: gh auth status must be OK
USAGE
}

wait_merge="1"
timeout_seconds="1800"
retries="3"
sleep_seconds="3"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-wait)
      wait_merge="0"
      shift
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

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${repo_root}" ]]; then
  echo "not inside a git worktree" >&2
  exit 2
fi

branch="$(git branch --show-current 2>/dev/null || true)"
if [[ -z "${branch}" ]]; then
  echo "detached HEAD (expected task/<N>-<slug> branch)" >&2
  exit 2
fi

if ! [[ "${branch}" =~ ^task/([0-9]+)-([a-z0-9][a-z0-9-]*)$ ]]; then
  echo "invalid branch name: ${branch} (expected task/<N>-<slug>)" >&2
  exit 2
fi

issue_number="${BASH_REMATCH[1]}"
required_run_log="openspec/_ops/task_runs/ISSUE-${issue_number}.md"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "working tree not clean; commit your changes before submitting PR" >&2
  git status --porcelain >&2
  exit 2
fi

if [[ ! -f "${required_run_log}" ]]; then
  echo "missing required run log: ${required_run_log}" >&2
  exit 2
fi

if ! run_with_retries git push -u origin HEAD; then
  echo "failed to push after ${retries} attempts" >&2
  exit 1
fi

pr_number=""
if gh pr view >/dev/null 2>&1; then
  pr_number="$(gh pr view --json number --jq .number)"
else
  title="$(git log -1 --pretty=%s)"
  if ! run_with_retries gh pr create --title "${title}" --body "Closes #${issue_number}"; then
    echo "failed to create PR after ${retries} attempts" >&2
    exit 1
  fi
  pr_number="$(gh pr view --json number --jq .number)"
fi

if ! gh pr view "${pr_number}" --json body --jq .body | grep -Eiq "Closes[[:space:]]*#[[:space:]]*${issue_number}\\b"; then
  current_body="$(gh pr view "${pr_number}" --json body --jq .body)"
  if ! run_with_retries gh pr edit "${pr_number}" --body "${current_body}"$'\n\n'"Closes #${issue_number}"; then
    echo "failed to edit PR body after ${retries} attempts" >&2
    exit 1
  fi
fi

if ! run_with_retries gh pr merge "${pr_number}" --auto --squash --delete-branch; then
  echo "failed to enable auto-merge after ${retries} attempts" >&2
  exit 1
fi

if [[ "${wait_merge}" != "1" ]]; then
  exit 0
fi

deadline=$((SECONDS + timeout_seconds))
while (( SECONDS < deadline )); do
  state="$(gh pr view "${pr_number}" --json state --jq .state)"
  if [[ "${state}" == "MERGED" ]]; then
    break
  fi
  if [[ "${state}" == "CLOSED" ]]; then
    echo "PR #${pr_number} closed without merge" >&2
    exit 1
  fi
  sleep 10
done

state="$(gh pr view "${pr_number}" --json state --jq .state)"
if [[ "${state}" != "MERGED" ]]; then
  echo "timeout waiting PR #${pr_number} to merge (state=${state})" >&2
  gh pr checks "${pr_number}" || true
  exit 1
fi

scripts/agent_controlplane_sync.sh --retries "${retries}" --sleep-seconds "${sleep_seconds}"
