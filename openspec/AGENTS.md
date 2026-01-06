# OpenSpec - Agent 指令

## 职责
管理 NudgeDO 项目的规格说明（specs）和任务运行记录。

## 目录结构
```
openspec/
├── project.md         # 项目元信息
├── SPECS_INDEX.md     # 规格索引（本文件维护）
├── AGENTS.md          # 本文件
├── specs/             # 具体规格文件夹
│   └── <spec-name>/
│       ├── spec.md
│       ├── requirements.md
│       ├── design.md
│       ├── tasks.md
│       ├── acceptance.md
│       └── evidence.md
├── tasks/             # 任务定义
└── _ops/              # 操作日志
    └── task_runs/     # Issue 运行记录
        └── ISSUE-N.md
```

## 规格生命周期
1. **Draft**: 初始草稿
2. **Review**: 评审中
3. **Approved**: 已批准，可实施
4. **Implemented**: 已实施
5. **Archived**: 已归档

## 任务运行记录格式
每个 Issue 对应一个 `ISSUE-N.md`，格式：

```md
# ISSUE-N

- Issue: #N
- Branch: task/N-slug
- PR: <PR-URL>

## Plan
- <计划要点>

## Runs
### YYYY-MM-DD HH:MM <标签>
- Command: `<命令>`
- Key output: `<关键输出>`
- Evidence: `<证据路径>`
```
