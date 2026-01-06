import { describe, expect, it } from "vitest";

import { COACH_FALLBACK_QUESTIONS, COACH_SYSTEM_PROMPT } from "../llm/prompts";

import {
  CoachPersona,
  generateCoachConfirmation,
  getCoachFallbackQuestions,
  getCoachSystemPrompt
} from "./coach";

describe("Coach persona", () => {
  it("exports CoachPersona metadata", () => {
    expect(CoachPersona).toEqual({
      id: "coach",
      name: "Coach",
      displayName: "教练",
      accentColor: "#FF6B5B",
      description: "专业、直接、结果导向"
    });
  });

  it("returns system prompt from prompts.ts", () => {
    expect(getCoachSystemPrompt()).toBe(COACH_SYSTEM_PROMPT);
  });

  it("returns offline fallback questions from prompts.ts", () => {
    expect(getCoachFallbackQuestions()).toBe(COACH_FALLBACK_QUESTIONS);
  });

  it("generates brief confirmations with optional time", () => {
    expect(generateCoachConfirmation("写周报")).toBe("好，任务已记录。");
    expect(generateCoachConfirmation("写周报", "14:00")).toBe(
      "好，任务已记录。14:00 我会提醒你。"
    );
    expect(generateCoachConfirmation("写周报", " 14:00 ")).toBe(
      "好，任务已记录。14:00 我会提醒你。"
    );
  });
});

