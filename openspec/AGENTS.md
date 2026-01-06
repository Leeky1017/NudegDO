# NudgeDO OpenSpec AGENTS.md

## OpenSpec Workflow

本项目使用 [OpenSpec](https://openspec.dev/) 规范驱动开发框架。

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
