#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/agent_worktree_cleanup.sh <issue-number> <slug> [--force]

Behavior:
  - Removes worktree directory: .worktrees/issue-<N>-<slug>
  - Deletes local branch: task/<N>-<slug> (if exists)
  - Prunes stale worktree metadata

Notes:
  - Only run after PR is merged and controlplane main is synced to origin/main.
  - Run from the controlplane root (NOT inside the target worktree).
EOF
}

force="false"

if [[ $# -lt 2 ]]; then
  usage >&2
  exit 2
fi

issue_number="${1:-}"
slug="${2:-}"
shift 2

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force)
      force="true"
      shift 1
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown arg: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ ! "${issue_number}" =~ ^[0-9]+$ ]]; then
  echo "ERROR: issue-number must be numeric, got: ${issue_number}" >&2
  exit 2
fi

if [[ "${slug}" =~ [^a-z0-9-] ]]; then
  echo "ERROR: slug must be kebab-case (a-z0-9-), got: ${slug}" >&2
  exit 2
fi

branch="task/${issue_number}-${slug}"
dir=".worktrees/issue-${issue_number}-${slug}"

common_dir="$(git rev-parse --git-common-dir)"
controlplane_root="$(cd "$(dirname "$common_dir")" && pwd)"

target_dir="${controlplane_root}/${dir}"

pwd_real="$(pwd -P)"
target_real=""
if [[ -d "${target_dir}" ]]; then
  target_real="$(cd "${target_dir}" && pwd -P)"
fi

if [[ -n "${target_real}" && "${pwd_real}" == "${target_real}"* ]]; then
  echo "ERROR: you are inside the worktree to be removed: ${target_real}" >&2
  echo "       cd to controlplane root and rerun." >&2
  exit 1
fi

if [[ -d "${target_dir}" ]]; then
  dirty="$(git -C "${target_dir}" status --porcelain 2>/dev/null || true)"
  if [[ -n "${dirty}" && "${force}" != "true" ]]; then
    echo "ERROR: worktree has uncommitted changes: ${dir}" >&2
    echo "       Re-run with --force to remove anyway." >&2
    exit 1
  fi

  if [[ "${force}" == "true" ]]; then
    git -C "${controlplane_root}" worktree remove --force "${dir}"
  else
    git -C "${controlplane_root}" worktree remove "${dir}"
  fi
else
  echo "Worktree directory not found (skip remove): ${target_dir}" >&2
fi

if git -C "${controlplane_root}" show-ref --verify --quiet "refs/heads/${branch}"; then
  git -C "${controlplane_root}" branch -D "${branch}"
fi

git -C "${controlplane_root}" worktree prune

echo "OK: cleaned worktree ${dir} and local branch ${branch}"

