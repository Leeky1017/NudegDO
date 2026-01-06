#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE' >&2
Usage:
  scripts/agent_github_sync_audit.sh [--pr-limit <n>] [--issue-limit <n>]

What it does:
  - Sync control-plane main (fetch+pull --ff-only)
  - Enumerate all PRs + Issues via GitHub CLI
  - For merged PRs, verify mergeCommit exists and is reachable from local main
  - Print a concise summary for evidence
USAGE
}

pr_limit="5000"
issue_limit="5000"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --pr-limit)
      pr_limit="${2:-}"
      shift 2
      ;;
    --issue-limit)
      issue_limit="${2:-}"
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

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${repo_root}" ]]; then
  echo "not inside a git repository" >&2
  exit 2
fi

scripts/agent_controlplane_sync.sh --quiet

control_path="$(git worktree list --porcelain | awk '
  $1=="worktree"{path=$2}
  $1=="branch" && $2=="refs/heads/main"{main=path}
  END{if (main) print main}
')"
if [[ -z "${control_path}" ]]; then
  control_path="${repo_root}"
fi

python_bin=""
if command -v python3 >/dev/null 2>&1; then
  python_bin="python3"
elif command -v python >/dev/null 2>&1; then
  python_bin="python"
fi

if [[ -z "${python_bin}" ]]; then
  echo "missing dependency: python3 (or python)" >&2
  exit 2
fi

"${python_bin}" - <<'PY' "${control_path}" "${pr_limit}" "${issue_limit}"
import json
import subprocess
import sys
from datetime import datetime, timezone

control_path = sys.argv[1]
pr_limit = int(sys.argv[2])
issue_limit = int(sys.argv[3])

def run(cmd):
  result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
  if result.returncode != 0:
    raise RuntimeError(f"command failed ({result.returncode}): {' '.join(cmd)}\n{result.stderr.strip()}")
  return result.stdout

def try_run(cmd):
  result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
  return result.returncode, result.stdout, result.stderr

repo = run(["gh", "repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]).strip()
head_sha = run(["git", "-C", control_path, "rev-parse", "--short", "HEAD"]).strip()

prs = json.loads(run([
  "gh", "pr", "list",
  "--state", "all",
  "--limit", str(pr_limit),
  "--json", "number,state,url,title,createdAt,mergedAt,mergeCommit",
]))

issues = json.loads(run([
  "gh", "issue", "list",
  "--state", "all",
  "--limit", str(issue_limit),
  "--json", "number,state,url,title,createdAt,closedAt",
]))

pr_states = {}
merged_prs = []
for pr in prs:
  pr_states[pr["state"]] = pr_states.get(pr["state"], 0) + 1
  if pr["state"] == "MERGED":
    merged_prs.append(pr)

issue_states = {}
for issue in issues:
  issue_states[issue["state"]] = issue_states.get(issue["state"], 0) + 1

missing_merge_commit = []
not_in_main = []

for pr in merged_prs:
  mc = pr.get("mergeCommit") or {}
  oid = mc.get("oid")
  if not oid:
    missing_merge_commit.append((pr["number"], pr["url"]))
    continue
  rc, _, _ = try_run(["git", "-C", control_path, "cat-file", "-e", f"{oid}^{{commit}}"])
  if rc != 0:
    missing_merge_commit.append((pr["number"], pr["url"]))
    continue
  rc, _, _ = try_run(["git", "-C", control_path, "merge-base", "--is-ancestor", oid, "main"])
  if rc != 0:
    not_in_main.append((pr["number"], pr["url"]))

print(f"Repo: {repo}")
print(f"Control-plane: {control_path}")
print(f"Local main HEAD: {head_sha}")
print("")
print("GitHub counts:")
print(f"- PR total: {len(prs)} (state={pr_states})")
print(f"- Issue total: {len(issues)} (state={issue_states})")
print("")
print("Merged PR mergeCommit audit:")
print(f"- merged PRs: {len(merged_prs)}")
print(f"- missing mergeCommit in local repo: {len(missing_merge_commit)}")
print(f"- mergeCommit not reachable from main: {len(not_in_main)}")
if missing_merge_commit[:5]:
  print("  examples (missing):")
  for n, url in missing_merge_commit[:5]:
    print(f"  - #{n}: {url}")
if not_in_main[:5]:
  print("  examples (not-in-main):")
  for n, url in not_in_main[:5]:
    print(f"  - #{n}: {url}")
PY
