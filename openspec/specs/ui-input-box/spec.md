# UI-001: 任务输入框基础组件

## 概述
任务输入框是用户输入任务的核心入口，支持 OnMe 和 Nudge 两种模式。

## 需求

### 功能需求
- [ ] R1: 单行文本输入框，支持中英文输入
- [ ] R2: placeholder 文案："输入你的任务..."
- [ ] R3: 输入框获得焦点时，外层容器显示聚焦状态（阴影加深）
- [ ] R4: 输入框右侧集成 N 按钮和提交按钮
- [ ] R5: 支持 Enter 键提交（OnMe 模式）
- [ ] R6: 支持 Ctrl+N 快捷键切换 Nudge 模式

### 视觉需求
- [ ] V1: 圆角容器（28px），白色背景
- [ ] V2: 柔和阴影（默认态 / 聚焦态）
- [ ] V3: 字体：Noto Serif SC，1.1rem
- [ ] V4: 内边距：16px

### 响应式需求
- [ ] M1: 移动端宽度 100%，左右边距 16px
- [ ] M2: 桌面端最大宽度 680px，居中

## 接口定义

```typescript
interface TaskInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string, mode: 'onme' | 'nudge') => void;
  isNudgeMode: boolean;
  onNudgeModeToggle: () => void;
  placeholder?: string;
  disabled?: boolean;
}
```

## 验收标准
1. 输入框可正常输入中英文
2. Enter 键在 OnMe 模式下直接提交
3. Ctrl+N 可切换 Nudge 模式
4. 聚焦/失焦状态视觉反馈正确
