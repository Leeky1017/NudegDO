# DATA-002: 对话历史存储

## 概述
定义 Nudge 对话历史的数据结构。

## 数据结构

```typescript
interface ChatMessage {
  role: 'ai' | 'user';
  content: string;
  timestamp?: string;  // ISO 时间戳
}

interface ChatHistory {
  taskId: number;
  persona: PersonaType;
  round: number;       // 当前轮次
  messages: ChatMessage[];
}
```

## 存储策略
- [ ] R1: 对话历史嵌入 Task 对象中
- [ ] R2: 随任务一起持久化
- [ ] R3: 支持追加新消息（继续对话）

## 验收标准
1. 对话历史正确存储
2. 可随任务一起加载
