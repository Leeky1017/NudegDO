# UI-003: Nudge 追问面板

## 概述
Nudge 面板在输入框下方原地展开，显示 AI 追问内容，用户可在此回答问题。

## 需求

### 功能需求
- [ ] R1: 从输入框下方展开，不跳转页面
- [ ] R2: 显示当前任务文本
- [ ] R3: 显示 AI 人格头像和名称
- [ ] R4: 显示 2-3 个追问问题（带序号）
- [ ] R5: 提供多行文本输入框供用户回答
- [ ] R6: 提供"取消"和"确认并创建任务"按钮
- [ ] R7: 支持人格选择器（可选）

### 视觉需求
- [ ] V1: 展开动画：max-height 过渡，0.5s cubic-bezier
- [ ] V2: 背景：奶油色渐变到白色
- [ ] V3: 问题序号：珊瑚色圆角方块，24x24px
- [ ] V4: 问题逐个淡入动画（stagger 0.15s）
- [ ] V5: 输入框：2px 边框，聚焦时珊瑚色

### 动画定义
```css
.nudge-panel {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.nudge-panel.active {
  max-height: 500px;
}

.question-item {
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp 0.4s ease forwards;
}

.question-item:nth-child(1) { animation-delay: 0.1s; }
.question-item:nth-child(2) { animation-delay: 0.25s; }
.question-item:nth-child(3) { animation-delay: 0.4s; }
```

## 接口定义

```typescript
interface NudgePanelProps {
  isOpen: boolean;
  taskText: string;
  questions: string[];
  persona: PersonaType;
  onPersonaChange: (persona: PersonaType) => void;
  onCancel: () => void;
  onConfirm: (response: string) => void;
}

type PersonaType = 'coach' | 'buddy';
```

## 验收标准
1. 展开/收起动画流畅
2. 问题逐个淡入显示
3. 输入框可正常输入多行文本
4. 取消按钮关闭面板，确认按钮创建任务
