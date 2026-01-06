#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE' >&2
Usage:
  scripts/agent_controlplane_sync.sh [--retries <n>] [--sleep-seconds <n>] [--quiet]

What it does:
  - Locate the control-plane main worktree
  - Ensure it is clean and on main
  - Fetch + pull --ff-only origin/main (with retries)
  - Verify main == origin/main
USAGE
}

retries="3"
sleep_seconds="3"
quiet="0"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --retries)
      retries="${2:-}"
      shift 2
      ;;
    --sleep-seconds)
      sleep_seconds="${2:-}"
      shift 2
      ;;
    --quiet)
      quiet="1"
      shift
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

if ! [[ "${retries}" =~ ^[0-9]+$ ]] || [[ "${retries}" -lt 1 ]]; then
  echo "Invalid --retries: ${retries} (expected positive integer)" >&2
  exit 2
fi

if ! [[ "${sleep_seconds}" =~ ^[0-9]+$ ]]; then
  echo "Invalid --sleep-seconds: ${sleep_seconds} (expected integer seconds)" >&2
  exit 2
fi

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${repo_root}" ]]; then
  echo "not inside a git repository" >&2
  exit 2
fi

control_path="$(git worktree list --porcelain | awk '
  $1=="worktree"{path=$2}
  $1=="branch" && $2=="refs/heads/main"{main=path}
  END{if (main) print main}
')"

if [[ -z "${control_path}" ]]; then
  control_path="${repo_root}"
fi

if [[ ! -d "${control_path}" ]]; then
  echo "control-plane path not found: ${control_path}" >&2
  exit 2
fi

if ! git -C "${control_path}" remote get-url origin >/dev/null 2>&1; then
  echo "missing git remote: origin (in ${control_path})" >&2
  exit 2
fi

if [[ -n "$(git -C "${control_path}" status --porcelain)" ]]; then
  echo "control-plane worktree not clean; refuse to sync automatically:" >&2
  git -C "${control_path}" status --porcelain >&2
  exit 2
fi

git -C "${control_path}" switch main >/dev/null 2>&1 || true

control_branch="$(git -C "${control_path}" branch --show-current 2>/dev/null || true)"
if [[ "${control_branch}" != "main" ]]; then
  echo "control-plane worktree must stay on main (current=${control_branch:-unknown})" >&2
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

if ! run_with_retries git -C "${control_path}" fetch origin --prune --tags; then
  echo "failed to fetch origin after ${retries} attempts" >&2
  exit 1
fi

if ! run_with_retries git -C "${control_path}" pull --ff-only origin main; then
  echo "failed to pull --ff-only origin/main after ${retries} attempts" >&2
  exit 1
fi

read -r ahead behind < <(git -C "${control_path}" rev-list --left-right --count main...origin/main | tr '\t' ' ')
if [[ "${ahead}" != "0" || "${behind}" != "0" ]]; then
  echo "sync check failed: main...origin/main = ${ahead} ${behind}" >&2
  exit 1
fi

if [[ "${quiet}" != "1" ]]; then
  head_sha="$(git -C "${control_path}" rev-parse --short HEAD)"
  echo "OK: control-plane main synced (${control_path}) HEAD=${head_sha}"
fi
