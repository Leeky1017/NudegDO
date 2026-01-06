import { describe, expect, it } from "vitest";

import {
  BUDDY_FALLBACK_QUESTIONS,
  BUDDY_SYSTEM_PROMPT,
  COACH_FALLBACK_QUESTIONS,
  COACH_SYSTEM_PROMPT
} from "../llm/prompts";
import {
  BuddyPersona,
  generateBuddyConfirmation,
  getBuddyFallbackQuestions,
  getBuddySystemPrompt
} from "./buddy";
import {
  CoachPersona,
  generateCoachConfirmation,
  getCoachFallbackQuestions,
  getCoachSystemPrompt
} from "./coach";
import { personas } from "./index";

describe("personas", () => {
  it("exports buddy system prompt and fallbacks from prompts.ts", () => {
    expect(getBuddySystemPrompt()).toBe(BUDDY_SYSTEM_PROMPT);
    expect(getBuddyFallbackQuestions()).toBe(BUDDY_FALLBACK_QUESTIONS);
    expect(BuddyPersona.getSystemPrompt()).toBe(BUDDY_SYSTEM_PROMPT);
    expect(BuddyPersona.getFallbackQuestions()).toBe(BUDDY_FALLBACK_QUESTIONS);
  });

  it("exports coach system prompt and fallbacks from prompts.ts", () => {
    expect(getCoachSystemPrompt()).toBe(COACH_SYSTEM_PROMPT);
    expect(getCoachFallbackQuestions()).toBe(COACH_FALLBACK_QUESTIONS);
    expect(CoachPersona.getSystemPrompt()).toBe(COACH_SYSTEM_PROMPT);
    expect(CoachPersona.getFallbackQuestions()).toBe(COACH_FALLBACK_QUESTIONS);
  });

  it("generates buddy confirmation including time when provided", () => {
    expect(generateBuddyConfirmation("", "14:00")).toBe(
      "太棒了！任务已经记录好啦～14:00 我会来陪你一起开始。"
    );
    expect(generateBuddyConfirmation("写周报")).toContain("我会来陪你一起开始。");
  });

  it("generates coach confirmation in brief style", () => {
    expect(generateCoachConfirmation("", "09:00")).toBe("已记录：任务. 09:00");
    expect(generateCoachConfirmation("写周报")).toContain("已记录：");
  });

  it("provides unified persona mapping", () => {
    expect(personas.coach.id).toBe("coach");
    expect(personas.buddy.id).toBe("buddy");
  });
});

