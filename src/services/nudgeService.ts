import { LLMClient, type Message } from "../llm/client";
import {
  COACH_SYSTEM_PROMPT,
  BUDDY_SYSTEM_PROMPT,
  COACH_FALLBACK_QUESTIONS,
  BUDDY_FALLBACK_QUESTIONS,
  generateQuestionPrompt,
  parseResponsePrompt,
} from "../llm/prompts";

export type PersonaType = "coach" | "buddy";

export type NudgeState = "idle" | "questioning" | "answered" | "completed" | "cancelled";

export type ParsedTask = {
  title: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  durationMinutes: number | null;
  notes: string | null;
  subtasks: string[];
};

export type NudgeSession = {
  id: string;
  state: NudgeState;
  persona: PersonaType;
  originalText: string;
  questions: string[];
  userResponse: string | null;
  parsedTask: ParsedTask | null;
  chatHistory: Message[];
  createdAt: Date;
};

export type NudgeServiceConfig = {
  llmClient?: LLMClient;
  defaultPersona?: PersonaType;
  maxQuestions?: number;
};

export class NudgeService {
  readonly #llm: LLMClient;
  readonly #defaultPersona: PersonaType;
  readonly #maxQuestions: number;
  #sessions: Map<string, NudgeSession> = new Map();

  constructor(config: NudgeServiceConfig = {}) {
    this.#llm = config.llmClient ?? new LLMClient();
    this.#defaultPersona = config.defaultPersona ?? "coach";
    this.#maxQuestions = config.maxQuestions ?? 3;
  }

  #generateId(): string {
    return `nudge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  #getSystemPrompt(persona: PersonaType): string {
    return persona === "coach" ? COACH_SYSTEM_PROMPT : BUDDY_SYSTEM_PROMPT;
  }

  #getFallbackQuestions(persona: PersonaType): string[] {
    const questions = persona === "coach" ? COACH_FALLBACK_QUESTIONS : BUDDY_FALLBACK_QUESTIONS;
    return questions.slice(0, this.#maxQuestions);
  }

  #parseQuestionsFromResponse(response: string): string[] | null {
    const trimmed = response.trim();
    // Try to extract JSON array from response
    const jsonMatch = trimmed.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.every((q) => typeof q === "string")) {
        return parsed.slice(0, this.#maxQuestions);
      }
    } catch {
      // ignore parse error
    }
    return null;
  }

  #parseTaskFromResponse(response: string): ParsedTask | null {
    const trimmed = response.trim();
    // Try to extract JSON object from response
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (typeof parsed.title === "string") {
        return {
          title: parsed.title,
          scheduledDate: parsed.scheduledDate ?? null,
          scheduledTime: parsed.scheduledTime ?? null,
          durationMinutes: parsed.durationMinutes ?? null,
          notes: parsed.notes ?? null,
          subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks : [],
        };
      }
    } catch {
      // ignore parse error
    }
    return null;
  }

  async startSession(taskText: string, persona?: PersonaType): Promise<NudgeSession> {
    const id = this.#generateId();
    const selectedPersona = persona ?? this.#defaultPersona;
    const systemPrompt = this.#getSystemPrompt(selectedPersona);

    const session: NudgeSession = {
      id,
      state: "questioning",
      persona: selectedPersona,
      originalText: taskText.trim(),
      questions: [],
      userResponse: null,
      parsedTask: null,
      chatHistory: [{ role: "system", content: systemPrompt }],
      createdAt: new Date(),
    };

    // Generate questions via LLM
    const questionPrompt = generateQuestionPrompt(taskText, selectedPersona);
    session.chatHistory.push({ role: "user", content: questionPrompt });

    try {
      const response = await this.#llm.chatCompletion(session.chatHistory, {
        maxTokens: 256,
        temperature: 0.7,
      });
      session.chatHistory.push({ role: "assistant", content: response });

      const questions = this.#parseQuestionsFromResponse(response);
      session.questions = questions ?? this.#getFallbackQuestions(selectedPersona);
    } catch {
      // Use fallback questions on LLM error
      session.questions = this.#getFallbackQuestions(selectedPersona);
    }

    this.#sessions.set(id, session);
    return session;
  }

  async submitResponse(sessionId: string, userResponse: string): Promise<NudgeSession> {
    const session = this.#sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    if (session.state !== "questioning") {
      throw new Error(`Invalid session state: ${session.state}`);
    }

    session.userResponse = userResponse.trim();
    session.state = "answered";

    // Parse response via LLM
    const parsePrompt = parseResponsePrompt(session.originalText, userResponse);
    session.chatHistory.push({ role: "user", content: parsePrompt });

    try {
      const response = await this.#llm.chatCompletion(session.chatHistory, {
        maxTokens: 512,
        temperature: 0.3,
      });
      session.chatHistory.push({ role: "assistant", content: response });

      const parsedTask = this.#parseTaskFromResponse(response);
      if (parsedTask) {
        session.parsedTask = parsedTask;
        session.state = "completed";
      }
    } catch {
      // Keep state as answered if parsing fails
    }

    return session;
  }

  cancelSession(sessionId: string): NudgeSession | null {
    const session = this.#sessions.get(sessionId);
    if (!session) return null;

    session.state = "cancelled";
    return session;
  }

  getSession(sessionId: string): NudgeSession | undefined {
    return this.#sessions.get(sessionId);
  }

  deleteSession(sessionId: string): boolean {
    return this.#sessions.delete(sessionId);
  }
}

// Note: Create instance with LLMClient when API key is available
// export const nudgeService = new NudgeService();
