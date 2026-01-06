# INFRA-002: Prompt 模板管理

## 概述
管理 LLM 调用所需的 Prompt 模板。

## 需求

### 功能需求
- [ ] R1: 系统指令模板（按人格）
- [ ] R2: 问题生成模板
- [ ] R3: 任务优化模板
- [ ] R4: 模板变量替换
- [ ] R5: 支持模板版本管理

### 模板结构

```typescript
interface PromptTemplate {
  id: string;
  name: string;
  version: string;
  template: string;
  variables: string[];  // 需要替换的变量
}

const templates: Record<string, PromptTemplate> = {
  'system-coach': {
    id: 'system-coach',
    name: 'Coach 系统指令',
    version: '1.0',
    template: `你是 Coach（教练），一个专业、直接、结果导向的任务规划助手。
风格要求：语气专业简洁，直接给出建议和时间安排。`,
    variables: []
  },
  
  'system-buddy': {
    id: 'system-buddy',
    name: 'Buddy 系统指令',
    version: '1.0',
    template: `你是 Buddy（伙伴），一个温暖、鼓励、有陪伴感的任务规划助手。
风格要求：语气温暖友好，多用鼓励性语言。`,
    variables: []
  },
  
  'question-gen': {
    id: 'question-gen',
    name: '问题生成',
    version: '1.0',
    template: `用户想要完成：{{task_text}}
请生成 {{count}} 个追问问题，帮助用户明确目标、时间和障碍。`,
    variables: ['task_text', 'count']
  },
  
  'task-optimize': {
    id: 'task-optimize',
    name: '任务优化',
    version: '1.0',
    template: `原始任务：{{original_task}}
用户补充：{{user_response}}
请优化任务标题并提取时间信息，返回 JSON。`,
    variables: ['original_task', 'user_response']
  }
};
```

### 模板渲染函数
```typescript
function renderTemplate(templateId: string, vars: Record<string, string>): string;
```

## 验收标准
1. 模板正确渲染
2. 变量替换正确
