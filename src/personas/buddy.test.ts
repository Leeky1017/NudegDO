import { describe, expect, it } from "vitest";
import {
  BuddyPersona,
  getBuddySystemPrompt,
  getBuddyFallbackQuestions,
  generateBuddyConfirmation,
} from "./buddy";

describe("BuddyPersona", () => {
  it("has correct id and name", () => {
    expect(BuddyPersona.id).toBe("buddy");
    expect(BuddyPersona.name).toBe("Buddy");
    expect(BuddyPersona.displayName).toBe("伙伴");
  });

  it("has accent color", () => {
    expect(BuddyPersona.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

describe("getBuddySystemPrompt", () => {
  it("returns non-empty string", () => {
    const prompt = getBuddySystemPrompt();
    expect(prompt.length).toBeGreaterThan(0);
    expect(prompt).toContain("Buddy");
  });
});

describe("getBuddyFallbackQuestions", () => {
  it("returns array of questions", () => {
    const questions = getBuddyFallbackQuestions();
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.every((q) => typeof q === "string")).toBe(true);
  });
});

describe("generateBuddyConfirmation", () => {
  it("returns confirmation without time", () => {
    const msg = generateBuddyConfirmation("写周报");
    expect(msg).toContain("记下来了");
  });

  it("returns confirmation with time", () => {
    const msg = generateBuddyConfirmation("写周报", "明天上午10点");
    expect(msg).toContain("明天上午10点");
    expect(msg).toContain("提醒");
  });
});
