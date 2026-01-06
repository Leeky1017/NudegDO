import { COACH_FALLBACK_QUESTIONS, COACH_SYSTEM_PROMPT } from "../llm/prompts";

export type Persona = {
  id: string;
  name: string;
  displayName: string;
  accentColor: string;
  description: string;
};

export const CoachPersona: Persona = {
  id: "coach",
  name: "Coach",
  displayName: "教练",
  accentColor: "#FF6B5B",
  description: "专业、直接、结果导向"
};

export function getCoachSystemPrompt(): string {
  return COACH_SYSTEM_PROMPT;
}

export function getCoachFallbackQuestions(): string[] {
  return COACH_FALLBACK_QUESTIONS;
}

export function generateCoachConfirmation(taskTitle: string, time?: string): string {
  const trimmedTime = time?.trim();

  if (trimmedTime) {
    return `好，任务已记录。${trimmedTime} 我会提醒你。`;
  }

  return "好，任务已记录。";
}

