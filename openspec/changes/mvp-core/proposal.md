# MVP Core - Change Proposal

## Summary
实现 NudgeDO MVP 核心功能，包括双模式任务输入（OnMe/Nudge）、AI 追问对话、任务管理。

## Motivation
传统 TODO 应用存在"记录疲劳"问题，用户往往只记录模糊的任务描述，导致执行时缺乏清晰度。NudgeDO 通过 AI 主动追问帮助用户在记录时就明确任务细节。

## Scope

### In Scope
- 任务输入框组件（支持 OnMe/Nudge 双模式）
- N 按钮（呼吸动画、状态切换）
- Nudge 追问面板（原地展开）
- 任务卡片列表
- 任务详情抽屉（对话历史）
- 轮次制追问系统（1-2轮，每轮2-3问）
- Coach/Buddy 双人格
- LLM API 集成（OpenRouter + GLM4.5 AIR）
- 本地存储（localStorage）

### Out of Scope
- 用户认证系统
- 云端同步
- 提醒通知
- 订阅付费

## Technical Approach

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Framer Motion（动画）

### Backend
- 纯前端应用，无后端
- OpenRouter API 调用

### Storage
- localStorage 持久化

## Risks
1. LLM API 延迟可能影响用户体验 → 提供离线模板问题作为 fallback
2. 免费模型质量不稳定 → 支持多模型切换

## Success Criteria
- [ ] 用户可通过 OnMe 模式快速记录任务
- [ ] 用户可通过 Nudge 模式获得 AI 追问
- [ ] 任务数据在刷新后保留
- [ ] 对话历史可在任务卡片中查看
