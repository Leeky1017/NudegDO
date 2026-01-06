# INFRA-001: LLM API 客户端

## 概述
封装 LLM API 调用，支持多个模型提供商。

## 需求

### 功能需求
- [ ] R1: 支持 OpenRouter API（GLM4.5 AIR、Llama 4 Scout）
- [ ] R2: 支持流式响应（可选）
- [ ] R3: 错误处理和重试机制
- [ ] R4: API Key 安全存储
- [ ] R5: 请求超时处理（30s）

### 接口定义

```typescript
interface LLMClient {
  chat(messages: LLMMessage[], options?: LLMOptions): Promise<string>;
  chatStream?(messages: LLMMessage[], onChunk: (chunk: string) => void): Promise<void>;
}

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

// 默认配置
const defaultConfig = {
  baseUrl: 'https://openrouter.ai/api/v1',
  model: 'zhipu/glm-4-air',  // GLM4.5 AIR
  temperature: 0.7,
  maxTokens: 1024,
  timeout: 30000
};
```

### 错误处理
```typescript
class LLMError extends Error {
  code: 'TIMEOUT' | 'RATE_LIMIT' | 'AUTH' | 'NETWORK' | 'UNKNOWN';
}
```

## 验收标准
1. 可成功调用 OpenRouter API
2. 错误正确捕获和处理
3. 超时机制有效
