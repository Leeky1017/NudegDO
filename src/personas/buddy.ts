import { BUDDY_FALLBACK_QUESTIONS, BUDDY_SYSTEM_PROMPT } from "../llm/prompts";
import type { Persona } from "./coach";

export const BuddyPersona: Persona = {
  id: "buddy",
  name: "Buddy",
  displayName: "伙伴",
  accentColor: "#7C6FEA",
  description: "温暖、陪伴、鼓励但不过度"
};

export function getBuddySystemPrompt(): string {
  return BUDDY_SYSTEM_PROMPT;
}

export function getBuddyFallbackQuestions(): string[] {
  return BUDDY_FALLBACK_QUESTIONS;
}

export function generateBuddyConfirmation(taskTitle: string, time?: string): string {
  const trimmedTime = time?.trim();

  if (trimmedTime) {
    return `好的～任务记下来了！${trimmedTime} 我会提醒你的！`;
  }

  return "好的～任务记下来了！";
}
