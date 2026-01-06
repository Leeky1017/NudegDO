#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE' >&2
Usage:
  scripts/agent_worktree_setup.sh <issue-number> <slug> [--base <ref>] [--no-sync] [--retries <n>] [--sleep-seconds <n>]

Examples:
  scripts/agent_worktree_setup.sh 12 feature-name
  scripts/agent_worktree_setup.sh 12 feature-name --base origin/main
  scripts/agent_worktree_setup.sh 12 feature-name --no-sync
USAGE
}

if [[ $# -lt 2 ]]; then
  usage
  exit 2
fi

issue_number="$1"
slug="$2"
shift 2

base_ref="origin/main"
worktree_dir=".worktrees/issue-${issue_number}-${slug}"
do_sync="1"
retries="3"
sleep_seconds="3"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base)
      base_ref="${2:-}"
      shift 2
      ;;
    --no-sync|--no-fetch)
      do_sync="0"
      shift
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

if ! [[ "$issue_number" =~ ^[0-9]+$ ]]; then
  echo "Invalid issue number: $issue_number (expected digits)" >&2
  exit 2
fi

if ! [[ "$slug" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "Invalid slug: $slug (expected lowercase kebab-case)" >&2
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

if [[ ! -d .git && ! -f .git ]]; then
  echo "Run from repo root (where .git exists)." >&2
  exit 2
fi

control_branch="$(git branch --show-current 2>/dev/null || true)"
if [[ "${control_branch}" != "main" ]]; then
  echo "Control-plane worktree must stay on main. Run: git switch main" >&2
  exit 2
fi

mkdir -p .worktrees

branch="task/${issue_number}-${slug}"

if [[ "$do_sync" == "1" ]]; then
  if ! scripts/agent_controlplane_sync.sh --retries "${retries}" --sleep-seconds "${sleep_seconds}" --quiet; then
    echo "WARN: control-plane sync failed; continuing with local refs (base may be stale)" >&2
    if [[ "${base_ref}" == "origin/main" ]]; then
      base_ref="main"
    fi
  fi
fi

if [[ "$base_ref" == "origin/main" ]]; then
  if ! git show-ref --verify --quiet "refs/remotes/origin/main"; then
    base_ref="main"
  fi
fi

if git show-ref --verify --quiet "refs/heads/${branch}"; then
  git worktree add "${worktree_dir}" "${branch}"
else
  git worktree add -b "${branch}" "${worktree_dir}" "${base_ref}"
fi

if [[ -d .venv && ! -e "${worktree_dir}/.venv" ]]; then
  ln -s "$(cd .venv && pwd -P)" "${worktree_dir}/.venv" || true
fi

if [[ -d node_modules && ! -e "${worktree_dir}/node_modules" ]]; then
  ln -s "$(cd node_modules && pwd -P)" "${worktree_dir}/node_modules" || true
fi

echo "OK: ${worktree_dir} (${branch})"
