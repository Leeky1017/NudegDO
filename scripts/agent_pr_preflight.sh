#!/usr/bin/env bash
set -euo pipefail

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

"${python_bin}" scripts/agent_pr_preflight.py "$@"

