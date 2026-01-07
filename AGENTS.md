# NudgeDO - Agent 指令

## 项目概述
NudgeDO 是一款 AI 驱动的 TODO 应用，通过主动追问帮助用户将模糊想法转化为可执行任务。

## 技术栈
- 前端：React + TypeScript + TailwindCSS
- 后端：待定（Node.js / Python FastAPI）
- LLM：GLM4.5 AIR（首选）/ Llama 4 Scout / Gemini 2.0 Flash

## 工作流规范
本项目采用 **OpenSpec + Rulebook + GitHub** 三体系交付流程。

### 硬门禁
1. **Issue 驱动**：所有任务必须有对应 Issue，Issue 号 N 是唯一 ID
2. **分支命名**：`task/<N>-<slug>`
3. **Commit 规范**：每个 commit message 必须包含 `(#N)`
4. **PR 规范**：必须包含 `Closes #N`，必须新增 `openspec/_ops/task_runs/ISSUE-N.md`
5. **Checks**：`ci` / `openspec-log-guard` / `merge-serial` 必须全绿
6. **Auto-merge**：必须启用（合并态由 `merge-serial` 串行验收）
7. **Preflight**：PR 前必须运行 `scripts/agent_pr_preflight.sh`
8. **Worktree**：每个 Issue 必须用 worktree 隔离开发，合并后必须清理 worktree

### 交付原则
- **Spec-first**：先建 task + 写 spec，再写代码
- **测试红就修到绿**：最终必须全绿
- **禁止 silent failure**：异常必须写日志或返回明确错误
- **结构化证据**：每个阶段输出落到 `rulebook/tasks/<task-id>/evidence/`

## 目录结构
```
NudgeDO/
├── AGENTS.md              # 本文件
├── README.md              # 项目说明
├── docs/                  # 产品文档
│   └── 01_product_vision.md
├── openspec/              # 规格说明
│   ├── project.md         # 项目元信息
│   ├── SPECS_INDEX.md     # 规格索引
│   ├── AGENTS.md          # OpenSpec 专用指令
│   ├── specs/             # 具体规格
│   ├── tasks/             # 任务定义
│   └── _ops/              # 操作日志
│       └── task_runs/     # Issue 运行记录
├── rulebook/              # 任务执行
│   └── tasks/             # 任务文件夹
├── .factory/              # Factory 配置
│   └── skills/            # 自定义技能
└── scripts/               # 自动化脚本
```

## GitHub 仓库
- URL: https://github.com/Leeky1017/NudegDO.git
- 默认分支: main
