# MVP Core - Implementation Tasks

## Phase 1: 项目初始化

### 1.1 项目搭建
- [ ] 1.1.1 使用 Vite 创建 React + TypeScript 项目
- [ ] 1.1.2 配置 Tailwind CSS
- [ ] 1.1.3 配置 ESLint + Prettier
- [ ] 1.1.4 创建基础目录结构

### 1.2 类型定义
- [ ] 1.2.1 定义 Task 接口
- [ ] 1.2.2 定义 ChatMessage 接口
- [ ] 1.2.3 定义 UserSettings 接口
- [ ] 1.2.4 定义 PersonaType 类型

## Phase 2: 基础设施层

### 2.1 存储服务
- [ ] 2.1.1 实现 StorageService 类
- [ ] 2.1.2 实现 getTasks/saveTasks 方法
- [ ] 2.1.3 实现 getSettings/saveSettings 方法
- [ ] 2.1.4 实现 exportData/importData 方法

### 2.2 LLM 客户端
- [ ] 2.2.1 实现 LLMClient 类
- [ ] 2.2.2 实现 OpenRouter API 调用
- [ ] 2.2.3 实现错误处理和重试
- [ ] 2.2.4 实现离线 fallback 模板

### 2.3 Prompt 模板
- [ ] 2.3.1 创建 Coach 系统 prompt
- [ ] 2.3.2 创建 Buddy 系统 prompt
- [ ] 2.3.3 创建问题生成 prompt
- [ ] 2.3.4 实现模板渲染函数

## Phase 3: UI 组件层

### 3.1 输入区域
- [ ] 3.1.1 实现 TaskInput 组件
- [ ] 3.1.2 实现 NButton 组件（呼吸动画）
- [ ] 3.1.3 实现 NudgePanel 组件
- [ ] 3.1.4 实现 PersonaSelector 组件

### 3.2 任务列表
- [ ] 3.2.1 实现 TaskCard 组件
- [ ] 3.2.2 实现 TaskDrawer 组件（对话历史）
- [ ] 3.2.3 实现 ChatBubble 组件
- [ ] 3.2.4 实现 TaskList 组件

### 3.3 布局
- [ ] 3.3.1 实现 Header 组件
- [ ] 3.3.2 实现 MainLayout 组件
- [ ] 3.3.3 实现响应式布局

## Phase 4: 业务逻辑层

### 4.1 状态管理
- [ ] 4.1.1 创建 TaskContext
- [ ] 4.1.2 创建 SettingsContext
- [ ] 4.1.3 创建 NudgeContext

### 4.2 Nudge 逻辑
- [ ] 4.2.1 实现轮次控制逻辑
- [ ] 4.2.2 实现问题生成逻辑
- [ ] 4.2.3 实现任务优化逻辑

## Phase 5: 集成测试

### 5.1 功能测试
- [ ] 5.1.1 测试 OnMe 模式完整流程
- [ ] 5.1.2 测试 Nudge 模式完整流程
- [ ] 5.1.3 测试数据持久化
- [ ] 5.1.4 测试离线 fallback

### 5.2 UI 测试
- [ ] 5.2.1 测试动画效果
- [ ] 5.2.2 测试响应式布局
- [ ] 5.2.3 测试键盘快捷键
