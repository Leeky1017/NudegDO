# Tasks (ISSUE-21)

- [x] Add delivery workflow spec + README under `openspec/specs/nudgedo-delivery-workflow/`
- [x] Add roadmap execution plan stub under `openspec/specs/nudgedo-roadmap/`
- [x] Add `CONTRIBUTING.md` and `.github/pull_request_template.md`
- [x] Add `scripts/agent_pr_preflight.sh` + `scripts/agent_pr_preflight.py`
- [x] Add `scripts/agent_worktree_cleanup.sh`
- [x] Update `scripts/agent_pr_automerge_and_sync.sh` to enforce preflight + watch checks
- [x] Tighten `.github/workflows/ci.yml` (strict + OpenSpec validate)
- [x] Tighten `.github/workflows/openspec-log-guard.yml` (also check commit messages)
- [x] Tighten `.github/workflows/merge-serial.yml` (concurrency=merge-serial + merge-context verification)
- [x] Run `openspec validate --specs --strict --no-interactive`
- [x] Run `npm test` + `npm run typecheck` + `npm run build`
- [x] Save evidence under `rulebook/tasks/issue-21-delivery-workflow/evidence/` and update `openspec/_ops/task_runs/ISSUE-21.md`
