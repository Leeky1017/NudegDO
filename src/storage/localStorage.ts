import { DEFAULT_SETTINGS, type Settings } from "../types";
import type { ChatMessage, Task } from "../types/task";

const KEY_PREFIX = "nudgedo_" as const;
const TASKS_KEY = `${KEY_PREFIX}tasks` as const;
const SETTINGS_KEY = `${KEY_PREFIX}settings` as const;
const EXPORT_VERSION = 1 as const;

type SerializedChatMessage = Omit<ChatMessage, "timestamp"> & { timestamp: number };

type SerializedTask = Omit<Task, "createdAt" | "completedAt" | "chatHistory"> & {
  createdAt: number;
  completedAt?: number;
  chatHistory?: SerializedChatMessage[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeJsonParse(raw: string): unknown | undefined {
  try {
    return JSON.parse(raw) as unknown;
  } catch (error) {
    console.error("[TaskStorage] Failed to parse JSON:", error);
    return undefined;
  }
}

function deserializeDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (typeof value === "number" && Number.isFinite(value)) return new Date(value);
  if (typeof value === "string") {
    const ms = Date.parse(value);
    if (Number.isFinite(ms)) return new Date(ms);
  }
  return undefined;
}

function serializeDate(value: Date | undefined): number | undefined {
  if (!value) return undefined;
  return value.getTime();
}

function coerceChatMessage(value: unknown): ChatMessage | undefined {
  if (!isRecord(value)) return undefined;
  if (value.role !== "ai" && value.role !== "user") return undefined;
  if (typeof value.content !== "string") return undefined;

  const timestamp = deserializeDate(value.timestamp);
  if (!timestamp) return undefined;

  return { role: value.role, content: value.content, timestamp };
}

function serializeChatMessage(message: ChatMessage): SerializedChatMessage {
  return {
    role: message.role,
    content: message.content,
    timestamp: message.timestamp.getTime(),
  };
}

function coerceTask(value: unknown): Task | undefined {
  if (!isRecord(value)) return undefined;

  const id = value.id;
  const title = value.title;
  const completed = value.completed;
  const createdAt = deserializeDate(value.createdAt);

  if (typeof id !== "number" || !Number.isFinite(id)) return undefined;
  if (typeof title !== "string") return undefined;
  if (typeof completed !== "boolean") return undefined;
  if (!createdAt) return undefined;

  const completedAt = value.completedAt === undefined ? undefined : deserializeDate(value.completedAt);
  const isNudged = typeof value.isNudged === "boolean" ? value.isNudged : false;

  const persona = value.persona;
  const personaValue: Task["persona"] | undefined =
    persona === "coach" || persona === "buddy" ? persona : undefined;

  const chatHistoryRaw = value.chatHistory;
  const chatHistory = Array.isArray(chatHistoryRaw)
    ? chatHistoryRaw
        .map(coerceChatMessage)
        .filter((message): message is ChatMessage => message !== undefined)
    : undefined;

  const scheduledTime = typeof value.scheduledTime === "string" ? value.scheduledTime : undefined;
  const scheduledDate = typeof value.scheduledDate === "string" ? value.scheduledDate : undefined;
  const duration =
    typeof value.duration === "number" && Number.isFinite(value.duration) ? value.duration : undefined;

  return {
    id,
    title,
    completed,
    createdAt,
    completedAt: completedAt ?? undefined,
    isNudged,
    persona: personaValue,
    chatHistory,
    scheduledTime,
    scheduledDate,
    duration,
  };
}

function serializeTask(task: Task): SerializedTask {
  return {
    ...task,
    createdAt: task.createdAt.getTime(),
    completedAt: serializeDate(task.completedAt),
    chatHistory: task.chatHistory?.map(serializeChatMessage),
  };
}

function coerceSettings(value: unknown): Partial<Settings> {
  if (!isRecord(value)) return {};

  const result: Partial<Settings> = {};
  if (typeof value.maxRounds === "number" && Number.isFinite(value.maxRounds)) {
    result.maxRounds = value.maxRounds;
  }

  for (const [key, val] of Object.entries(value)) {
    if (key === "maxRounds") continue;
    result[key] = val;
  }

  return result;
}

export class TaskStorage {
  saveTasks(tasks: Task[]): void {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks.map(serializeTask)));
    } catch (error) {
      console.error("[TaskStorage] Failed to save tasks:", error);
    }
  }

  loadTasks(): Task[] {
    if (typeof localStorage === "undefined") return [];

    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return [];

    const parsed = safeJsonParse(raw);
    if (!Array.isArray(parsed)) return [];

    const tasks: Task[] = [];
    let dropped = 0;

    for (const item of parsed) {
      const task = coerceTask(item);
      if (!task) {
        dropped += 1;
        continue;
      }
      tasks.push(task);
    }

    if (dropped > 0) {
      console.error(`[TaskStorage] Dropped ${dropped} invalid task(s) from storage.`);
    }

    return tasks;
  }

  saveSettings(settings: Settings): void {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("[TaskStorage] Failed to save settings:", error);
    }
  }

  loadSettings(): Settings {
    if (typeof localStorage === "undefined") return { ...DEFAULT_SETTINGS };

    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };

    const parsed = safeJsonParse(raw);
    const merged: Settings = {
      ...DEFAULT_SETTINGS,
      ...coerceSettings(parsed),
    };

    return merged;
  }

  exportData(): string {
    const payload = {
      version: EXPORT_VERSION,
      tasks: this.loadTasks(),
      settings: this.loadSettings(),
    };

    return JSON.stringify(payload);
  }

  importData(json: string): void {
    const parsed = safeJsonParse(json);
    if (!isRecord(parsed)) {
      console.error("[TaskStorage] Import payload must be an object.");
      return;
    }

    const version = parsed.version;
    if (typeof version !== "number") {
      console.error("[TaskStorage] Import payload missing numeric version.");
      return;
    }

    const tasks = parsed.tasks;
    if (!Array.isArray(tasks)) {
      console.error("[TaskStorage] Import payload missing tasks array.");
      return;
    }

    const nextTasks: Task[] = [];
    let dropped = 0;
    for (const item of tasks) {
      const task = coerceTask(item);
      if (!task) {
        dropped += 1;
        continue;
      }
      nextTasks.push(task);
    }
    if (dropped > 0) {
      console.error(`[TaskStorage] Import payload dropped ${dropped} invalid task(s).`);
    }

    const settings = parsed.settings;
    if (!isRecord(settings)) {
      console.error("[TaskStorage] Import payload missing settings object.");
      return;
    }

    this.saveTasks(nextTasks);
    this.saveSettings({ ...DEFAULT_SETTINGS, ...coerceSettings(settings) });
  }
}
