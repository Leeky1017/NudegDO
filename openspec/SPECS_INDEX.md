# NudgeDO - 规格索引

## Phase 1: MVP 核心 (P0)

### UI 组件层
| ID | Spec | 描述 | 状态 |
|----|------|------|------|
| UI-001 | [ui-input-box](specs/ui-input-box/spec.md) | 任务输入框基础组件 | Draft |
| UI-002 | [ui-n-button](specs/ui-n-button/spec.md) | N 按钮（呼吸动画、状态切换） | Draft |
| UI-003 | [ui-nudge-panel](specs/ui-nudge-panel/spec.md) | Nudge 追问面板（原地展开） | Draft |
| UI-004 | [ui-task-card](specs/ui-task-card/spec.md) | 任务卡片组件 | Draft |
| UI-005 | [ui-task-drawer](specs/ui-task-drawer/spec.md) | 任务详情抽屉（折叠展开） | Draft |
| UI-006 | [ui-chat-bubble](specs/ui-chat-bubble/spec.md) | Chat 气泡组件 | Draft |

### 交互流程层
| ID | Spec | 描述 | 状态 |
|----|------|------|------|
| FLOW-001 | [flow-onme-input](specs/flow-onme-input/spec.md) | OnMe 模式：Enter 直接存入 | Draft |
| FLOW-002 | [flow-nudge-trigger](specs/flow-nudge-trigger/spec.md) | Nudge 触发：N 键/按钮激活 | Draft |
| FLOW-003 | [flow-nudge-conversation](specs/flow-nudge-conversation/spec.md) | Nudge 对话：问答交互流程 | Draft |
| FLOW-004 | [flow-task-complete](specs/flow-task-complete/spec.md) | 任务完成：checkbox 状态切换 | Draft |

### 业务逻辑层
| ID | Spec | 描述 | 状态 |
|----|------|------|------|
| LOGIC-001 | [logic-round-system](specs/logic-round-system/spec.md) | 轮次制追问（1-2轮，每轮2-3问） | Draft |
| LOGIC-002 | [logic-question-gen](specs/logic-question-gen/spec.md) | 问题生成策略 | Draft |
| LOGIC-003 | [logic-task-optimize](specs/logic-task-optimize/spec.md) | 任务优化（标题重写、时间提取） | Draft |
| LOGIC-004 | [logic-persona-coach](specs/logic-persona-coach/spec.md) | Coach 人格：专业直接风格 | Draft |
| LOGIC-005 | [logic-persona-buddy](specs/logic-persona-buddy/spec.md) | Buddy 人格：温暖鼓励风格 | Draft |

### 数据模型层
| ID | Spec | 描述 | 状态 |
|----|------|------|------|
| DATA-001 | [data-task-model](specs/data-task-model/spec.md) | 任务数据结构定义 | Draft |
| DATA-002 | [data-chat-history](specs/data-chat-history/spec.md) | 对话历史存储结构 | Draft |
| DATA-003 | [data-user-settings](specs/data-user-settings/spec.md) | 用户设置数据结构 | Draft |

### 基础设施层
| ID | Spec | 描述 | 状态 |
|----|------|------|------|
| INFRA-001 | [infra-llm-client](specs/infra-llm-client/spec.md) | LLM API 客户端封装 | Draft |
| INFRA-002 | [infra-prompt-templates](specs/infra-prompt-templates/spec.md) | Prompt 模板管理 | Draft |
| INFRA-003 | [infra-local-storage](specs/infra-local-storage/spec.md) | 本地存储（IndexedDB/localStorage） | Draft |

---

## Phase 2: 增强功能 (P1)

| ID | Spec | 描述 | 状态 |
|----|------|------|------|
| UI-007 | [ui-persona-selector](specs/ui-persona-selector/spec.md) | 人格选择器组件 | Pending |
| UI-008 | [ui-task-meta](specs/ui-task-meta/spec.md) | 任务元信息（时间、时长、提醒） | Pending |
| FLOW-005 | [flow-keyboard-shortcuts](specs/flow-keyboard-shortcuts/spec.md) | 键盘快捷键系统 | Pending |
| INFRA-004 | [infra-user-auth](specs/infra-user-auth/spec.md) | 用户认证系统 | Pending |

---

## Phase 3: 高级功能 (P2)

| ID | Spec | 描述 | 状态 |
|----|------|------|------|
| FEAT-001 | [feat-deep-nudge](specs/feat-deep-nudge/spec.md) | 深度追问模式 | Pending |
| FEAT-002 | [feat-stuck-button](specs/feat-stuck-button/spec.md) | "卡住了"按钮 | Pending |
| FEAT-003 | [feat-startup-ritual](specs/feat-startup-ritual/spec.md) | 启动仪式（倒计时+深呼吸） | Pending |
| FEAT-004 | [feat-reminder](specs/feat-reminder/spec.md) | 任务提醒系统 | Pending |
| FEAT-005 | [feat-time-calibration](specs/feat-time-calibration/spec.md) | 时间预估校准 | Pending |

---

## Phase 4: 商业化 (P3)

| ID | Spec | 描述 | 状态 |
|----|------|------|------|
| FEAT-006 | [feat-analytics](specs/feat-analytics/spec.md) | 数据分析仪表盘 | Pending |
| FEAT-007 | [feat-subscription](specs/feat-subscription/spec.md) | 订阅系统（免费/Pro） | Pending |
| FEAT-008 | [feat-overcommit-detect](specs/feat-overcommit-detect/spec.md) | 过度承诺检测 | Pending |

---

## 依赖关系

```
Phase 1 MVP 依赖图:

INFRA-001 (llm-client)
    └── INFRA-002 (prompt-templates)
            └── LOGIC-002 (question-gen)
                    └── LOGIC-001 (round-system)

DATA-001 (task-model)
    ├── DATA-002 (chat-history)
    └── INFRA-003 (local-storage)

UI-001 (input-box)
    └── UI-002 (n-button)
            └── UI-003 (nudge-panel)
                    └── UI-006 (chat-bubble)

UI-004 (task-card)
    └── UI-005 (task-drawer)

FLOW-001 (onme-input) ← UI-001
FLOW-002 (nudge-trigger) ← UI-002
FLOW-003 (nudge-conversation) ← LOGIC-001 + UI-003
FLOW-004 (task-complete) ← UI-004
```

---

*更新时间: 2026-01-06*
