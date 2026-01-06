# UI-005: 任务详情抽屉

## 概述
任务详情抽屉在任务卡片下方展开，显示 Nudge 对话历史。

## 需求

### 功能需求
- [ ] R1: 点击展开按钮时向下展开
- [ ] R2: 显示完整的 AI 对话历史
- [ ] R3: 支持继续对话（可选，Phase 2）
- [ ] R4: 再次点击收起

### 视觉需求
- [ ] V1: 展开动画：max-height 过渡，0.4s ease
- [ ] V2: 背景：奶油色
- [ ] V3: 顶部边框：1px 分隔线
- [ ] V4: 展开按钮箭头旋转 180 度

### 动画定义
```css
.task-chat {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
}

.task-card.expanded .task-chat {
  max-height: 400px;
}

.task-expand svg {
  transition: transform 0.3s ease;
}

.task-card.expanded .task-expand svg {
  transform: rotate(180deg);
}
```

## 接口定义

```typescript
interface TaskDrawerProps {
  isOpen: boolean;
  chat: ChatMessage[];
  persona: PersonaType;
}
```

## 验收标准
1. 展开/收起动画流畅
2. 对话历史正确显示
3. 箭头旋转动画正确
