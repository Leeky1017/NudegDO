# Task Run: ISSUE-17

## 基本信息
- **Issue**: #17 feat: Nudge 对话服务与前端组件
- **分支**: task/17-nudge-service-ui
- **PR**: #18
- **状态**: In Progress

## 变更内容

### LLM Client 更新
- 新增 NVIDIA API 支持
- 默认模型改为 Kimi K2 (`moonshotai/kimi-k2-instruct`)
- 处理 GLM4 的 `reasoning_content` 和 MiniMax 的 `<think>` 标签

### NudgeService (`src/services/nudgeService.ts`)
- `startSession()`: 启动追问会话，生成 2-3 个问题
- `submitResponse()`: 提交用户回答，解析为结构化任务
- `cancelSession()`: 取消会话
- 支持 Coach/Buddy 两种人格
- LLM 失败时自动使用 fallback 问题

### React 组件
- `TaskInput`: 任务输入框 + N 按钮
- `TaskCard`: 任务卡片
- `NudgePanel`: 追问面板
- `App`: 主应用组件

### 样式
- `src/styles/app.css`: 完整应用样式

## 测试结果
- NudgeService: 12 tests passed

## 时间线
- 2026-01-07: 创建 Issue, 实现功能, 提交 PR
