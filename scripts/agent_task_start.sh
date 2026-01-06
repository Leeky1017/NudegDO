#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE' >&2
Usage:
  scripts/agent_task_start.sh --slug <slug> [--issue <n>] [--title <title>] [--body <body>]

What it does:
  - Sync control-plane main (main == origin/main)
  - Create or reuse GitHub Issue
  - Create task worktree: .worktrees/issue-<N>-<slug> (branch: task/<N>-<slug>)
  - Create openspec run log if missing: openspec/_ops/task_runs/ISSUE-<N>.md

Examples:
  scripts/agent_task_start.sh --slug feature-name --title "Add feature X" --body "..."
  scripts/agent_task_start.sh --slug feature-name --issue 5
USAGE
}

issue_number=""
title=""
body=""
slug=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --issue)
      issue_number="${2:-}"
      shift 2
      ;;
    --title)
      title="${2:-}"
      shift 2
      ;;
    --body)
      body="${2:-}"
      shift 2
      ;;
    --slug)
      slug="${2:-}"
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

if [[ -z "${slug}" ]]; then
  echo "missing required argument: --slug" >&2
  exit 2
fi

if ! [[ "${slug}" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "Invalid --slug: ${slug} (expected lowercase kebab-case)" >&2
  exit 2
fi

if [[ -n "${issue_number}" ]] && ! [[ "${issue_number}" =~ ^[0-9]+$ ]]; then
  echo "Invalid --issue: ${issue_number} (expected digits)" >&2
  exit 2
fi

if [[ -z "${issue_number}" ]] && [[ -z "${title}" ]]; then
  echo "missing --title (required when --issue is not provided)" >&2
  exit 2
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "missing dependency: gh" >&2
  exit 2
fi

if [[ -z "$(gh auth status 2>/dev/null || true)" ]]; then
  echo "gh auth required: run 'gh auth login' first" >&2
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

scripts/agent_controlplane_sync.sh

issue_url=""
if [[ -z "${issue_number}" ]]; then
  issue_url="$(gh issue create -t "${title}" -b "${body:-}")"
  issue_number="${issue_url##*/}"
else
  issue_url="$(gh issue view "${issue_number}" --json url --jq .url)"
fi

scripts/agent_worktree_setup.sh "${issue_number}" "${slug}" --no-sync

worktree_dir=".worktrees/issue-${issue_number}-${slug}"
if [[ ! -d "${worktree_dir}" ]]; then
  echo "worktree not found after setup: ${worktree_dir}" >&2
  exit 1
fi

run_log_path="${worktree_dir}/openspec/_ops/task_runs/ISSUE-${issue_number}.md"
if [[ ! -f "${run_log_path}" ]]; then
  mkdir -p "$(dirname "${run_log_path}")"
  cat >"${run_log_path}" <<EOF
# ISSUE-${issue_number}

- Issue: ${issue_url}
- Branch: task/${issue_number}-${slug}
- PR: <fill-after-created>

## Plan
- <计划要点>

## Runs

### $(date '+%Y-%m-%d %H:%M') task-start
- Command: \`scripts/agent_task_start.sh --slug ${slug}\`
- Key output: worktree created
- Evidence: ${worktree_dir}
EOF
fi

echo "OK: Issue #${issue_number} (${issue_url})"
echo "OK: ${worktree_dir} (task/${issue_number}-${slug})"
echo "OK: ${run_log_path}"
