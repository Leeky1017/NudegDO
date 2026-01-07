# NudgeDO Delivery Workflow — Index

本目录是 NudgeDO 的“交付流程圣旨”（OpenSpec）。目标：把协作约束成可执行的门禁，让每一次变更都 **可追溯、可复现、可审计**。

权威门禁（MUST）定义在：`openspec/specs/nudgedo-delivery-workflow/spec.md`。

## 三层职责（谁负责什么）

- OpenSpec（`openspec/`）：规则与需求增量（spec-first），权威约束在 `openspec/specs/`。
- Rulebook（`rulebook/`）：任务执行清单（可勾选、可验收），每个 Issue 对应一个 task。
- GitHub（Issue/Branch/PR/Checks/Auto-merge）：并发与交付唯一入口。

补充：`openspec/_ops/task_runs/ISSUE-N.md` 是 NudgeDO 的“运行证据账本”，PR 必带。

## 标准流程（Issue → PR → Merge）

### 0) 选定 Issue（得到 N）

- 没有 Issue 就先建 Issue（写清：目标/范围/验收标准）。
- 任何需求变更：先改 Issue/Spec，再改代码（禁止“先写代码再补 spec”）。

### 1) 创建 worktree（并行隔离）

在控制面（仓库根目录）执行：

```bash
scripts/agent_controlplane_sync.sh

N=21
SLUG=delivery-workflow
scripts/agent_worktree_setup.sh "$N" "$SLUG"
cd ".worktrees/issue-${N}-${SLUG}"
```

搜索时避免重复命中 worktree：

```bash
PATTERN="TaskInput"
rg -g'!.worktrees/**' -n "$PATTERN" .
```

### 2) 落盘 run log（强制）

创建：`openspec/_ops/task_runs/ISSUE-N.md`，并在每次关键运行后追加：
- 命令（可复制）
- 关键输出（短片段）
- 证据路径（文件/日志等）

### 3) 创建 Rulebook task（强制）

- task-id：`issue-<N>-<slug>`
- 填写：
  - `proposal.md`：本次变更影响面（ADDED/MODIFIED/REMOVED）
  - `tasks.md`：可勾选的执行拆解（按验收标准拆）

### 4) 写/改 OpenSpec（强制）

最小门禁（必须全绿）：

```bash
openspec validate --specs --strict --no-interactive
```

### 5) 实现（按 tasks.md 推进）

提交要求（强制）：
- 每个 commit message 必须包含 `(#N)`

### 6) 本地验证（强制）

```bash
openspec validate --specs --strict --no-interactive
npm test
npm run typecheck
npm run build
```

把关键输出写入 run log：`openspec/_ops/task_runs/ISSUE-N.md`。

### 7) PR + Auto-merge（强制）

- PR body 必须包含：`Closes #N`
- PR 必须包含：`openspec/_ops/task_runs/ISSUE-N.md`
- required checks：`ci` / `openspec-log-guard` / `merge-serial`
- 必须启用 auto-merge

提交 PR 前先做预检（依赖 + 冲突风险）：

```bash
scripts/agent_pr_preflight.sh
```

推荐用仓库脚本一键完成 PR + auto-merge：

```bash
scripts/agent_pr_automerge_and_sync.sh
```

### 8) 合并后收口（强制）

- 控制面同步：`scripts/agent_controlplane_sync.sh`
- 归档 Rulebook task（保持任务树干净）

### 9) 清理 worktree（强制）

合并完成且控制面 `main` 已同步到 `origin/main` 后，必须清理本次任务的 worktree（避免遗留与误用旧环境）。

在控制面（仓库根目录）执行：

```bash
scripts/agent_worktree_cleanup.sh "$N" "$SLUG"
```

