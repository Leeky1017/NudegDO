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

export type LLMProvider = "openrouter" | "nvidia";

type LLMClientConfig = {
  provider?: LLMProvider;
  apiKey?: string;
  endpoint?: string;
  model?: string;
  referer?: string;
  title?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
};

const PROVIDER_DEFAULTS: Record<LLMProvider, { endpoint: string; model: string; envKey: string }> = {
  openrouter: {
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    model: "nex-agi/deepseek-v3.1-nex-n1:free",
    envKey: "OPENROUTER_API_KEY"
  },
  nvidia: {
    endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
    model: "moonshotai/kimi-k2-instruct",
    envKey: "NVIDIA_API_KEY"
  }
};

export class LLMClient {
  readonly provider: LLMProvider;
  readonly endpoint: string;
  readonly model: string;
  readonly referer: string;
  readonly title: string;
  readonly timeoutMs: number;
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: LLMClientConfig = {}) {
    this.provider = config.provider ?? "nvidia";
    const defaults = PROVIDER_DEFAULTS[this.provider];

    const apiKey = config.apiKey ?? process.env[defaults.envKey];
    if (!apiKey) {
      throw new LLMError("AUTH", `Missing ${defaults.envKey} environment variable`);
    }

    this.endpoint = config.endpoint ?? defaults.endpoint;
    this.model = config.model ?? defaults.model;
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
        throw new LLMError("RATE_LIMIT", "LLM rate limit exceeded", { status: 429 });
      }
      if (res.status === 401) {
        throw new LLMError("AUTH", "LLM authentication failed", { status: 401 });
      }
      if (!res.ok) {
        let detail = "";
        try {
          const text = await res.text();
          detail = text ? `: ${text}` : "";
        } catch {
          // ignore
        }
        throw new LLMError("HTTP", `LLM request failed (${res.status})${detail}`, {
          status: res.status
        });
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string | null; reasoning_content?: string | null } }>;
      };

      const msg = data?.choices?.[0]?.message;
      // NVIDIA GLM4 returns reasoning_content instead of content
      let content = msg?.content ?? msg?.reasoning_content;
      if (typeof content !== "string") {
        throw new LLMError("BAD_RESPONSE", "LLM response missing message content");
      }
      // Strip <think>...</think> tags from MiniMax responses
      content = content.replace(/<think>[\s\S]*?<\/think>\s*/g, "").trim();
      return content;
    } catch (err) {
      if (err instanceof LLMError) throw err;
      if (didTimeout) {
        throw new LLMError("TIMEOUT", `LLM request timed out after ${timeoutMs}ms`, {
          cause: err
        });
      }
      throw new LLMError("NETWORK", "LLM request failed", { cause: err });
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

