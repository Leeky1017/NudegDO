import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  BUDDY_FALLBACK_QUESTIONS,
  BUDDY_SYSTEM_PROMPT,
  COACH_FALLBACK_QUESTIONS,
  COACH_SYSTEM_PROMPT,
  generateQuestionPrompt,
  parseResponsePrompt
} from "./prompts";

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\n$/, "");
}

function extractFirstTextFence(markdown: string, startMarker: string): string {
  const startIndex = markdown.indexOf(startMarker);
  if (startIndex < 0) throw new Error(`marker not found: ${startMarker}`);

  const fenceOpen = markdown.indexOf("```text", startIndex);
  if (fenceOpen < 0) throw new Error(`text fence not found after marker: ${startMarker}`);

  const contentStart = fenceOpen + "```text".length;
  const fenceClose = markdown.indexOf("```", contentStart);
  if (fenceClose < 0) throw new Error(`closing fence not found after marker: ${startMarker}`);

  const content = markdown.slice(contentStart, fenceClose);
  return normalizeNewlines(content).replace(/^\n/, "");
}

describe("prompts", () => {
  it("keeps system prompts exactly as OpenSpec defines", () => {
    const spec = readFileSync("openspec/specs/prompt-templates/spec.md", "utf-8");

    const coachFromSpec = extractFirstTextFence(spec, "### Requirement: Coach System Prompt");
    const buddyFromSpec = extractFirstTextFence(spec, "### Requirement: Buddy System Prompt");

    expect(normalizeNewlines(COACH_SYSTEM_PROMPT)).toBe(coachFromSpec);
    expect(normalizeNewlines(BUDDY_SYSTEM_PROMPT)).toBe(buddyFromSpec);
  });

  it("exports offline fallback questions", () => {
    expect(COACH_FALLBACK_QUESTIONS).toEqual([
      "这个任务的具体目标是什么？",
      "你打算什么时候开始？需要多长时间？",
      "有什么可能阻碍你的因素？",
      "完成它的第一步是什么？",
      "你希望结果达到什么标准才算完成？"
    ]);

    expect(BUDDY_FALLBACK_QUESTIONS).toEqual([
      "能跟我说说这个任务是关于什么的吗？",
      "你觉得什么时候做比较舒服？大概要多久呢？",
      "有什么我可以帮你提前准备的吗？",
      "我们可以把它拆成哪一步先开始呢？",
      "做完以后你希望自己感觉怎么样？"
    ]);
  });

  it("generates question prompt with persona and JSON-only requirement", () => {
    const coachPrompt = generateQuestionPrompt("  写周报  ", "coach");
    expect(coachPrompt).toContain('任务："写周报"');
    expect(coachPrompt).toContain("专业直接");
    expect(coachPrompt).toContain("2 或 3");
    expect(coachPrompt).toContain("JSON 数组");
    expect(coachPrompt).toContain("不要任何额外文字");

    const buddyPrompt = generateQuestionPrompt("买菜", "buddy");
    expect(buddyPrompt).toContain('任务："买菜"');
    expect(buddyPrompt).toContain("温暖陪伴");
    expect(buddyPrompt).toContain("JSON 数组");
  });

  it("generates parse prompt including task and response, requiring JSON object", () => {
    const prompt = parseResponsePrompt("写周报", "明天上午 9 点开始，1 小时搞定。");
    expect(prompt).toContain('原始任务："写周报"');
    expect(prompt).toContain('用户回答："明天上午 9 点开始，1 小时搞定。"');
    expect(prompt).toContain("\"title\"");
    expect(prompt).toContain("\"scheduledDate\"");
    expect(prompt).toContain("\"scheduledTime\"");
    expect(prompt).toContain("\"durationMinutes\"");
    expect(prompt).toContain("只输出 JSON");
  });
});

