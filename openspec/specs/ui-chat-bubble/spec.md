# UI-006: Chat 气泡组件

## 概述
Chat 气泡用于显示 AI 和用户的对话消息。

## 需求

### 功能需求
- [ ] R1: 区分 AI 消息和用户消息
- [ ] R2: 显示头像（AI 用人格 emoji，用户用默认头像）
- [ ] R3: 支持多行文本显示

### 视觉需求
- [ ] V1: AI 气泡：白色背景，左上角小圆角
- [ ] V2: 用户气泡：淡紫色背景，右上角小圆角，右对齐
- [ ] V3: 头像 32x32px，圆角 10px
- [ ] V4: AI 头像：绿色渐变背景
- [ ] V5: 用户头像：紫色渐变背景
- [ ] V6: 气泡最大宽度 85%
- [ ] V7: 淡入动画，stagger 0.1s

### 动画定义
```css
.chat-message {
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}
```

## 接口定义

```typescript
interface ChatBubbleProps {
  message: ChatMessage;
  persona?: PersonaType;
  animationDelay?: number;
}

interface ChatMessage {
  role: 'ai' | 'user';
  content: string;
}
```

## 验收标准
1. AI 和用户消息样式区分明显
2. 头像正确显示
3. 淡入动画流畅
