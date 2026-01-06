# DATA-001: 任务数据模型

## 概述
定义任务的核心数据结构。

## 数据结构

```typescript
interface Task {
  // 基础信息
  id: number;                    // 唯一标识（时间戳）
  title: string;                 // 任务标题
  originalTitle?: string;        // 原始输入（优化前）
  
  // 状态
  completed: boolean;            // 是否完成
  createdAt: string;             // 创建时间 ISO
  completedAt?: string;          // 完成时间 ISO
  
  // Nudge 相关
  isNudged: boolean;             // 是否通过 Nudge 创建
  persona?: PersonaType;         // 使用的人格
  chat: ChatMessage[];           // 对话历史
  
  // 时间规划
  scheduledTime?: string;        // 计划开始时间 HH:MM
  scheduledDate?: string;        // 计划日期 YYYY-MM-DD
  duration?: string;             // 预计时长 Xh/Xm
  reminderTime?: string;         // 提醒时间 ISO
  
  // 扩展（Phase 2+）
  subtasks?: Subtask[];          // 子任务
  tags?: string[];               // 标签
  priority?: 'low' | 'medium' | 'high';
}

interface Subtask {
  id: number;
  title: string;
  completed: boolean;
}

type PersonaType = 'coach' | 'buddy';
```

## 验收标准
1. 数据结构支持所有 MVP 功能
2. 可序列化为 JSON
3. 支持扩展字段
