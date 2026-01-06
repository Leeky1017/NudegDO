# llm-client Specification

## Purpose
LLM API 客户端封装，支持多模型提供商。

## Requirements

### Requirement: OpenRouter Integration
The system SHALL support OpenRouter API for LLM calls.

#### Scenario: Call GLM4.5 AIR
- GIVEN OpenRouter API key is configured
- WHEN making a chat completion request
- THEN use endpoint https://openrouter.ai/api/v1/chat/completions
- AND set model to "zhipu/glm-4-air"

### Requirement: Message Format
The system SHALL use standard chat message format.

#### Scenario: Send messages
- GIVEN a conversation context
- WHEN calling LLM
- THEN format messages as array of {role, content}
- AND include system message first

### Requirement: Error Handling
The system SHALL handle API errors gracefully.

#### Scenario: Timeout error
- GIVEN request exceeds 30 seconds
- WHEN timeout occurs
- THEN throw LLMError with code 'TIMEOUT'

#### Scenario: Rate limit error
- GIVEN API returns 429 status
- WHEN error is received
- THEN throw LLMError with code 'RATE_LIMIT'

#### Scenario: Auth error
- GIVEN API returns 401 status
- WHEN error is received
- THEN throw LLMError with code 'AUTH'

### Requirement: Fallback Templates
The system SHALL provide offline fallback when LLM unavailable.

#### Scenario: Network failure
- GIVEN LLM API is unreachable
- WHEN generating questions
- THEN use predefined template questions
- AND indicate offline mode to user
