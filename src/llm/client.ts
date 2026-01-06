export type MessageRole = "system" | "user" | "assistant" | "tool";

export type Message = {
  role: MessageRole;
  content: string;
};

export type LLMOptions = {
  timeoutMs?: number;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  model?: string;
};

export type LLMErrorCode =
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "AUTH"
  | "NETWORK"
  | "BAD_RESPONSE"
  | "HTTP";

export class LLMError extends Error {
  readonly code: LLMErrorCode;
  readonly status?: number;
  override readonly cause?: unknown;

  constructor(
    code: LLMErrorCode,
    message: string,
    options?: { status?: number; cause?: unknown }
  ) {
    super(message);
    this.name = "LLMError";
    this.code = code;
    this.status = options?.status;
    this.cause = options?.cause;
  }
}

type LLMClientConfig = {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  referer?: string;
  title?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
};

export class LLMClient {
  readonly endpoint: string;
  readonly model: string;
  readonly referer: string;
  readonly title: string;
  readonly timeoutMs: number;
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: LLMClientConfig = {}) {
    const apiKey = config.apiKey ?? process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new LLMError("AUTH", "Missing OPENROUTER_API_KEY environment variable");
    }

    this.endpoint = config.endpoint ?? "https://openrouter.ai/api/v1/chat/completions";
    this.model = config.model ?? "nex-agi/deepseek-v3.1-nex-n1:free";
    this.referer = config.referer ?? "https://nudgedo.app";
    this.title = config.title ?? "NudgeDO";
    this.timeoutMs = config.timeoutMs ?? 30_000;
    this.apiKey = apiKey;
    this.fetchImpl = config.fetch ?? fetch;
  }

  async chatCompletion(messages: Message[], options: LLMOptions = {}): Promise<string> {
    const timeoutMs = options.timeoutMs ?? this.timeoutMs;
    const model = options.model ?? this.model;

    const controller = new AbortController();
    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, timeoutMs);

    try {
      const res = await this.fetchImpl(this.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": this.referer,
          "X-Title": this.title
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature,
          top_p: options.topP,
          max_tokens: options.maxTokens
        }),
        signal: controller.signal
      });

      if (res.status === 429) {
        throw new LLMError("RATE_LIMIT", "OpenRouter rate limit exceeded", { status: 429 });
      }
      if (res.status === 401) {
        throw new LLMError("AUTH", "OpenRouter authentication failed", { status: 401 });
      }
      if (!res.ok) {
        let detail = "";
        try {
          const text = await res.text();
          detail = text ? `: ${text}` : "";
        } catch {
          // ignore
        }
        throw new LLMError("HTTP", `OpenRouter request failed (${res.status})${detail}`, {
          status: res.status
        });
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== "string") {
        throw new LLMError("BAD_RESPONSE", "OpenRouter response missing choices[0].message.content");
      }
      return content;
    } catch (err) {
      if (err instanceof LLMError) throw err;
      if (didTimeout) {
        throw new LLMError("TIMEOUT", `OpenRouter request timed out after ${timeoutMs}ms`, {
          cause: err
        });
      }
      throw new LLMError("NETWORK", "OpenRouter request failed", { cause: err });
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

