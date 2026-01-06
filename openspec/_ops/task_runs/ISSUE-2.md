# ISSUE-2

- Issue: https://github.com/Leeky1017/NudegDO/issues/2
- Branch: task/2-task-core-model
- PR: <fill-after-created>

## Plan
- 生成 Rulebook task（proposal/tasks/specs/evidence）
- 实现 `src/types/task.ts`（Task/ChatMessage + helpers）
- 运行最小验证命令并落盘证据

## Runs

### 2026-01-06 18:10 task-start
- Command: `scripts/agent_task_start.sh --slug task-core-model`
- Key output: worktree created
- Evidence: .worktrees/issue-2-task-core-model

### 2026-01-06 18:11 verify
- Command:
  - `find src/types -maxdepth 2 -type f -print`
  - `sed -n '1,120p' src/types/task.ts`
- Key output:
  - `src/types/task.ts`
- Evidence:
  - `rulebook/tasks/issue-2-task-core-model/evidence/verify.txt`
