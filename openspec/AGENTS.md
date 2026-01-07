# NudgeDO OpenSpec AGENTS.md

## OpenSpec Workflow

本项目使用 [OpenSpec](https://openspec.dev/) 规范驱动开发框架。

## 交付硬门禁（OpenSpec + Rulebook + GitHub）

NudgeDO 沿用 `$openspec-rulebook-github-delivery`，权威说明见：
- `openspec/specs/nudgedo-delivery-workflow/spec.md`
- `openspec/specs/nudgedo-delivery-workflow/README.md`

核心门禁（MUST）：
- Issue `#N` 是任务唯一 ID
- 分支：`task/<N>-<slug>`
- Commit：message 必须包含 `(#N)`
- PR：body 必须包含 `Closes #N` 且包含 run log：`openspec/_ops/task_runs/ISSUE-N.md`
- Required checks：`ci` / `openspec-log-guard` / `merge-serial` 全绿并启用 auto-merge
- Worktree 隔离开发，合并后清理

常用命令：
- 控制面同步：`scripts/agent_controlplane_sync.sh`
- 创建 worktree：`scripts/agent_worktree_setup.sh <N> <slug>`
- PR 预检：`scripts/agent_pr_preflight.sh`
- 一键 PR + auto-merge：`scripts/agent_pr_automerge_and_sync.sh`
- 合并后清理 worktree：`scripts/agent_worktree_cleanup.sh <N> <slug>`

### 目录结构

```
openspec/
├── specs/           # 当前权威规格（Source of Truth）
│   ├── task-core/
│   ├── task-crud/
│   ├── nudge-trigger/
│   ├── nudge-conversation/
│   ├── nudge-round/
│   ├── persona-coach/
│   ├── persona-buddy/
│   ├── llm-client/
│   ├── storage-local/
│   └── auth-session/
├── changes/         # 活跃变更提案
│   └── mvp-core/
│       ├── proposal.md
│       ├── design.md
│       ├── tasks.md
│       └── specs/   # Spec deltas
└── archive/         # 已归档变更
```

### Spec 格式

每个 spec 文件使用以下格式：

```markdown
# <spec-name> Specification

## Purpose
<简要描述>

## Requirements

### Requirement: <requirement-name>
The system SHALL/MUST <behavior>.

#### Scenario: <scenario-name>
- GIVEN <precondition>
- WHEN <action>
- THEN <expected result>
```

### Delta 格式

变更使用 delta 格式记录增量：

```markdown
## ADDED Requirements
### Requirement: <new-feature>

## MODIFIED Requirements
### Requirement: <changed-feature>

## REMOVED Requirements
### Requirement: <deprecated-feature>
```

### 工作流程

1. **Draft** - 创建变更提案 (`changes/<change-id>/proposal.md`)
2. **Review** - 审查 spec deltas 和 tasks
3. **Implement** - 按 tasks.md 实现代码
4. **Complete** - 完成所有任务
5. **Archive** - 归档变更，合并 deltas 到 specs/

## 开发指南

### 技术栈
- React 18 + TypeScript
- Tailwind CSS
- Vite
- OpenRouter API (GLM4.5 AIR)

### 代码规范
- 使用 TypeScript 严格模式
- 组件使用函数式 + Hooks
- 状态管理使用 React Context
