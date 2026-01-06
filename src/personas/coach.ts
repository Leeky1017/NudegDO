import { COACH_FALLBACK_QUESTIONS, COACH_SYSTEM_PROMPT } from "../llm/prompts";

export function getCoachSystemPrompt(): string {
  return COACH_SYSTEM_PROMPT;
}

export function getCoachFallbackQuestions(): string[] {
  return COACH_FALLBACK_QUESTIONS;
}

export function generateCoachConfirmation(taskTitle: string, time?: string): string {
  const trimmedTitle = taskTitle.trim();
  const label = trimmedTitle ? `「${trimmedTitle}」` : "任务";
  const trimmedTime = time?.trim();
  const timePart = trimmedTime ? ` ${trimmedTime}` : "";
  return `已记录：${label}.${timePart}`;
}

export const CoachPersona = {
  id: "coach",
  name: "Coach",
  displayName: "教练",
  accentColor: "#4F46E5",
  description: "专业、直接、结果导向",
  getSystemPrompt: getCoachSystemPrompt,
  getFallbackQuestions: getCoachFallbackQuestions,
  generateConfirmation: generateCoachConfirmation
} as const;

