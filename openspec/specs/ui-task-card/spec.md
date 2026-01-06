# UI-004: 任务卡片组件

## 概述
任务卡片是任务列表中的基本单元，显示任务信息和完成状态。

## 需求

### 功能需求
- [ ] R1: 显示任务标题
- [ ] R2: 显示任务元信息（时间、时长）
- [ ] R3: 显示 Nudge 标签（如果是 Nudge 创建的任务）
- [ ] R4: 左侧 checkbox 可点击切换完成状态
- [ ] R5: 右侧展开按钮（仅 Nudge 任务显示）
- [ ] R6: 完成状态下标题显示删除线

### 视觉需求
- [ ] V1: 白色背景，圆角 20px
- [ ] V2: 柔和阴影，hover 时阴影加深 + 上浮 2px
- [ ] V3: checkbox 24x24px，圆角 8px
- [ ] V4: checkbox 选中态：绿色背景 + 白色勾
- [ ] V5: Nudge 标签：珊瑚色背景，圆角 20px

## 接口定义

```typescript
interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: number) => void;
  onExpand: (id: number) => void;
  isExpanded: boolean;
}

interface Task {
  id: number;
  title: string;
  completed: boolean;
  isNudged: boolean;
  persona?: PersonaType;
  time?: string;
  duration?: string;
  chat: ChatMessage[];
}
```

## 验收标准
1. 任务信息正确显示
2. checkbox 点击切换状态
3. hover 动画流畅
4. Nudge 任务显示展开按钮
