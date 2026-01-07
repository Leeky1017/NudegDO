import { describe, expect, it, vi, beforeEach } from "vitest";
import { NudgeService, type NudgeSession } from "./nudgeService";
import { LLMClient } from "../llm/client";

function createMockLLMClient(responses: string[]) {
  let callIndex = 0;
  const mockClient = {
    chatCompletion: vi.fn(async () => {
      return responses[callIndex++] ?? "";
    }),
  } as unknown as LLMClient;
  return mockClient;
}

describe("NudgeService", () => {
  describe("startSession", () => {
    it("generates questions from LLM response", async () => {
      const mockClient = createMockLLMClient([
        '["问题1？", "问题2？", "问题3？"]',
      ]);
      const service = new NudgeService({ llmClient: mockClient });

      const session = await service.startSession("写周报");

      expect(session.state).toBe("questioning");
      expect(session.originalText).toBe("写周报");
      expect(session.questions).toEqual(["问题1？", "问题2？", "问题3？"]);
      expect(session.persona).toBe("coach");
    });

    it("uses fallback questions on LLM error", async () => {
      const mockClient = {
        chatCompletion: vi.fn(async () => {
          throw new Error("LLM error");
        }),
      } as unknown as LLMClient;
      const service = new NudgeService({ llmClient: mockClient });

      const session = await service.startSession("写周报");

      expect(session.state).toBe("questioning");
      expect(session.questions.length).toBeGreaterThan(0);
    });

    it("uses fallback questions on invalid JSON", async () => {
      const mockClient = createMockLLMClient(["not valid json"]);
      const service = new NudgeService({ llmClient: mockClient });

      const session = await service.startSession("写周报");

      expect(session.questions.length).toBeGreaterThan(0);
    });

    it("respects maxQuestions config", async () => {
      const mockClient = createMockLLMClient([
        '["Q1", "Q2", "Q3", "Q4", "Q5"]',
      ]);
      const service = new NudgeService({ llmClient: mockClient, maxQuestions: 2 });

      const session = await service.startSession("写周报");

      expect(session.questions.length).toBe(2);
    });

    it("supports buddy persona", async () => {
      const mockClient = createMockLLMClient(['["问题1？"]']);
      const service = new NudgeService({ llmClient: mockClient });

      const session = await service.startSession("写周报", "buddy");

      expect(session.persona).toBe("buddy");
    });
  });

  describe("submitResponse", () => {
    it("parses task from LLM response", async () => {
      const mockClient = createMockLLMClient([
        '["问题1？"]',
        '{"title": "完成周报", "scheduledDate": "2026-01-08", "scheduledTime": "10:00", "durationMinutes": 30, "notes": null, "subtasks": ["收集数据", "写总结"]}',
      ]);
      const service = new NudgeService({ llmClient: mockClient });

      const session = await service.startSession("写周报");
      const updated = await service.submitResponse(session.id, "明天上午10点，大概30分钟");

      expect(updated.state).toBe("completed");
      expect(updated.parsedTask).toEqual({
        title: "完成周报",
        scheduledDate: "2026-01-08",
        scheduledTime: "10:00",
        durationMinutes: 30,
        notes: null,
        subtasks: ["收集数据", "写总结"],
      });
    });

    it("throws on invalid session id", async () => {
      const service = new NudgeService({ llmClient: createMockLLMClient([]) });

      await expect(service.submitResponse("invalid", "response")).rejects.toThrow("Session not found");
    });

    it("throws on invalid session state", async () => {
      const mockClient = createMockLLMClient(['["Q1"]', '{"title": "T"}']);
      const service = new NudgeService({ llmClient: mockClient });

      const session = await service.startSession("写周报");
      await service.submitResponse(session.id, "response");

      await expect(service.submitResponse(session.id, "again")).rejects.toThrow("Invalid session state");
    });
  });

  describe("cancelSession", () => {
    it("sets state to cancelled", async () => {
      const mockClient = createMockLLMClient(['["Q1"]']);
      const service = new NudgeService({ llmClient: mockClient });

      const session = await service.startSession("写周报");
      const cancelled = service.cancelSession(session.id);

      expect(cancelled?.state).toBe("cancelled");
    });

    it("returns null for invalid session", () => {
      const service = new NudgeService({ llmClient: createMockLLMClient([]) });

      expect(service.cancelSession("invalid")).toBeNull();
    });
  });

  describe("getSession / deleteSession", () => {
    it("retrieves existing session", async () => {
      const mockClient = createMockLLMClient(['["Q1"]']);
      const service = new NudgeService({ llmClient: mockClient });

      const session = await service.startSession("写周报");
      const retrieved = service.getSession(session.id);

      expect(retrieved?.id).toBe(session.id);
    });

    it("deletes session", async () => {
      const mockClient = createMockLLMClient(['["Q1"]']);
      const service = new NudgeService({ llmClient: mockClient });

      const session = await service.startSession("写周报");
      const deleted = service.deleteSession(session.id);

      expect(deleted).toBe(true);
      expect(service.getSession(session.id)).toBeUndefined();
    });
  });
});
