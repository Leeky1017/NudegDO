import { describe, expect, it, vi } from "vitest";

import { LLMClient, type Message } from "./client";

describe("LLMClient", () => {
  it("returns assistant content on success", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({ choices: [{ message: { content: "hello" } }] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }) as unknown as typeof fetch;

    const client = new LLMClient({ apiKey: "test", fetch: fetchMock });
    const messages: Message[] = [{ role: "user", content: "hi" }];

    await expect(client.chatCompletion(messages)).resolves.toBe("hello");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws RATE_LIMIT on 429", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 429 })) as unknown as typeof fetch;
    const client = new LLMClient({ apiKey: "test", fetch: fetchMock });

    await expect(client.chatCompletion([{ role: "user", content: "hi" }])).rejects.toMatchObject({
      name: "LLMError",
      code: "RATE_LIMIT",
      status: 429
    });
  });

  it("throws AUTH on 401", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 401 })) as unknown as typeof fetch;
    const client = new LLMClient({ apiKey: "test", fetch: fetchMock });

    await expect(client.chatCompletion([{ role: "user", content: "hi" }])).rejects.toMatchObject({
      name: "LLMError",
      code: "AUTH",
      status: 401
    });
  });

  it("throws NETWORK when fetch rejects", async () => {
    const fetchMock = vi.fn(async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;
    const client = new LLMClient({ apiKey: "test", fetch: fetchMock });

    await expect(client.chatCompletion([{ role: "user", content: "hi" }])).rejects.toMatchObject({
      name: "LLMError",
      code: "NETWORK"
    });
  });

  it("throws TIMEOUT after 30 seconds", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_: unknown, init?: RequestInit) => {
      const signal = init?.signal;
      return new Promise((_, reject) => {
        if (signal) {
          if (signal.aborted) {
            reject(new DOMException("Aborted", "AbortError"));
          } else {
            signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
          }
        }
      });
    }) as unknown as typeof fetch;

    const client = new LLMClient({ apiKey: "test", fetch: fetchMock });
    const p = client.chatCompletion([{ role: "user", content: "hi" }]);
    const assertion = expect(p).rejects.toMatchObject({ name: "LLMError", code: "TIMEOUT" });

    await vi.advanceTimersByTimeAsync(30_000);
    await assertion;

    vi.useRealTimers();
  });
});
