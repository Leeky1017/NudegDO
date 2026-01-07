# Proposal (ISSUE-21)

## Summary

ADDED
- `openspec/specs/nudgedo-delivery-workflow/`: delivery workflow spec + README (Issue → Branch → PR → Checks → Auto-merge)
- `scripts/agent_pr_preflight.*`: preflight gate (open PR file overlap + roadmap dependencies)
- `scripts/agent_worktree_cleanup.sh`: mandatory cleanup after merge
- `.github/pull_request_template.md`: PR body template (Closes #N + test plan + run log link)

MODIFIED
- `.github/workflows/ci.yml`: make CI strict (no `continue-on-error`) + run OpenSpec strict validate
- `.github/workflows/openspec-log-guard.yml`: enforce branch/PR/run-log/commit-message gates
- `.github/workflows/merge-serial.yml`: serialize merge-state verification via `concurrency: merge-serial`
- `scripts/agent_pr_automerge_and_sync.sh`: run preflight, draft-on-block, watch checks, sync controlplane
- `.gitignore`: ignore worktree symlinks like `node_modules`
- `AGENTS.md` / `openspec/AGENTS.md` / `openspec/SPECS_INDEX.md` / `CONTRIBUTING.md`: document hard gates and operator workflow

## Why

Current NudgeDO workflow gates are not reliably enforceable (e.g. CI uses `continue-on-error`, missing preflight/cleanup, and guards don’t cover commit message rules).

## Impact

- Breaking change: YES (GitHub required checks become strict and may fail existing PRs until fixed)
- Developer experience: improved (one-click scripts + consistent run logs + safer concurrency)

