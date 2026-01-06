import { BUDDY_FALLBACK_QUESTIONS, BUDDY_SYSTEM_PROMPT } from "../llm/prompts";

export function getBuddySystemPrompt(): string {
  return BUDDY_SYSTEM_PROMPT;
}

export function getBuddyFallbackQuestions(): string[] {
  return BUDDY_FALLBACK_QUESTIONS;
}

export function generateBuddyConfirmation(taskTitle: string, time?: string): string {
  const trimmedTitle = taskTitle.trim();
  const label = trimmedTitle ? `「${trimmedTitle}」` : "任务";
  const trimmedTime = time?.trim();
  const timePart = trimmedTime ? `${trimmedTime} ` : "";

  return `太棒了！${label}已经记录好啦～${timePart}我会来陪你一起开始。`;
}

export const BuddyPersona = {
  id: "buddy",
  name: "Buddy",
  displayName: "伙伴",
  accentColor: "#7DB59A",
  description: "温暖、陪伴、鼓励但不过度",
  getSystemPrompt: getBuddySystemPrompt,
  getFallbackQuestions: getBuddyFallbackQuestions,
  generateConfirmation: generateBuddyConfirmation
} as const;

