# MVP Core - Technical Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      React App                          │
├─────────────────────────────────────────────────────────┤
│  Components Layer                                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │TaskInput│ │NButton  │ │NudgePane│ │TaskCard │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
├─────────────────────────────────────────────────────────┤
│  Context Layer                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ TaskContext │ │NudgeContext │ │SettingsCtx  │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
├─────────────────────────────────────────────────────────┤
│  Services Layer                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ LLMClient   │ │StorageServ  │ │PromptTempl  │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
├─────────────────────────────────────────────────────────┤
│  External                                               │
│  ┌─────────────┐ ┌─────────────┐                       │
│  │ OpenRouter  │ │localStorage │                       │
│  └─────────────┘ └─────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. State Management: React Context vs Redux
**Decision:** Use React Context

**Rationale:**
- MVP 规模较小，Context 足够
- 减少依赖，降低复杂度
- 后续可迁移到 Zustand 如需要

### 2. Styling: Tailwind vs CSS-in-JS
**Decision:** Use Tailwind CSS

**Rationale:**
- 快速开发，减少样式文件
- 与 React 组件良好集成
- 易于实现响应式设计

### 3. Animation: CSS vs Framer Motion
**Decision:** CSS for simple, Framer Motion for complex

**Rationale:**
- N 按钮呼吸动画用 CSS（性能好）
- 面板展开用 Framer Motion（更流畅）

### 4. LLM Provider: Direct API vs SDK
**Decision:** Direct fetch to OpenRouter

**Rationale:**
- 减少依赖
- OpenRouter 提供统一接口
- 易于切换模型

## Data Flow

### OnMe Mode
```
User Input → Enter → createTask(text, false) → saveTasks() → UI Update
```

### Nudge Mode
```
User Input → N Key → setNudgeMode(true) → generateQuestions()
    → User Response → createTask(text, true, chat) → saveTasks() → UI Update
```

## Error Handling Strategy

1. **LLM Errors:** Fallback to template questions
2. **Storage Errors:** Show toast, retry on next action
3. **Network Errors:** Offline indicator, queue for retry
