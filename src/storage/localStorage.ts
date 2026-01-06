import { DEFAULT_SETTINGS, type Settings, type Task } from "../types";

const KEY_PREFIX = "nudgedo_" as const;
const TASKS_KEY = `${KEY_PREFIX}tasks` as const;
const SETTINGS_KEY = `${KEY_PREFIX}settings` as const;
const EXPORT_VERSION = 1 as const;

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
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
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

    return parsed as Task[];
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
    if (tasks.some((t) => !isRecord(t))) {
      console.error("[TaskStorage] Import payload tasks must be objects.");
      return;
    }

    const settings = parsed.settings;
    if (!isRecord(settings)) {
      console.error("[TaskStorage] Import payload missing settings object.");
      return;
    }

    this.saveTasks(tasks as Task[]);
    this.saveSettings({ ...DEFAULT_SETTINGS, ...coerceSettings(settings) });
  }
}

