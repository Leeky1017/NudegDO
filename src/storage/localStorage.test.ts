import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_SETTINGS, type Settings } from "../types";
import { TaskStorage } from "./localStorage";
import type { Task } from "../types/task";

const TASKS_KEY = "nudgedo_tasks";
const SETTINGS_KEY = "nudgedo_settings";

class MemoryStorage implements Storage {
  #data = new Map<string, string>();

  get length(): number {
    return this.#data.size;
  }

  clear(): void {
    this.#data.clear();
  }

  getItem(key: string): string | null {
    return this.#data.has(key) ? (this.#data.get(key) ?? null) : null;
  }

  key(index: number): string | null {
    if (index < 0 || index >= this.#data.size) return null;
    return Array.from(this.#data.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.#data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.#data.set(key, value);
  }
}

describe("TaskStorage", () => {
  const storage = new TaskStorage();

  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("saveTasks serializes tasks under nudgedo_tasks", () => {
    const tasks: Task[] = [
      { id: 1, title: "t1", createdAt: new Date(100), completed: false, isNudged: false },
      { id: 2, title: "t2", createdAt: new Date(200), completed: true, completedAt: new Date(300), isNudged: false }
    ];

    storage.saveTasks(tasks);

    expect(JSON.parse(localStorage.getItem(TASKS_KEY) ?? "null")).toEqual([
      { id: 1, title: "t1", createdAt: 100, completed: false, isNudged: false },
      { id: 2, title: "t2", createdAt: 200, completed: true, completedAt: 300, isNudged: false }
    ]);
  });

  it("loadTasks returns [] when nothing stored", () => {
    expect(storage.loadTasks()).toEqual([]);
  });

  it("loadTasks parses stored tasks array", () => {
    localStorage.setItem(
      TASKS_KEY,
      JSON.stringify([{ id: 1, title: "t1", createdAt: 100, completed: false, isNudged: false }])
    );

    const tasks = storage.loadTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({ id: 1, title: "t1", completed: false, isNudged: false });
    expect(tasks[0]?.createdAt.getTime()).toBe(100);
  });

  it("loadTasks returns [] on invalid JSON and logs error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem(TASKS_KEY, "{not valid json");

    expect(storage.loadTasks()).toEqual([]);
    expect(spy).toHaveBeenCalled();
  });

  it("saveSettings serializes settings under nudgedo_settings", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, maxRounds: 2, theme: "dark" };
    storage.saveSettings(settings);

    expect(localStorage.getItem(SETTINGS_KEY)).toBe(JSON.stringify(settings));
  });

  it("loadSettings returns defaults when nothing stored", () => {
    expect(storage.loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("loadSettings merges stored settings with defaults", () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ maxRounds: 2, theme: "dark" }));

    expect(storage.loadSettings()).toEqual({ ...DEFAULT_SETTINGS, maxRounds: 2, theme: "dark" });
  });

  it("loadSettings ignores invalid JSON and logs error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem(SETTINGS_KEY, "{not valid json");

    expect(storage.loadSettings()).toEqual(DEFAULT_SETTINGS);
    expect(spy).toHaveBeenCalled();
  });

  it("exportData returns versioned JSON with tasks + settings", () => {
    const tasks: Task[] = [{ id: 1, title: "t1", createdAt: new Date(100), completed: false, isNudged: false }];
    const settings: Settings = { ...DEFAULT_SETTINGS, maxRounds: 2 };
    storage.saveTasks(tasks);
    storage.saveSettings(settings);

    const exported = JSON.parse(storage.exportData()) as any;

    expect(exported.version).toBe(1);
    expect(exported.tasks).toEqual([
      { id: 1, title: "t1", createdAt: new Date(100).toISOString(), completed: false, isNudged: false }
    ]);
    expect(exported.settings).toEqual(settings);
  });

  it("importData replaces tasks + settings when payload is valid", () => {
    storage.saveTasks([{ id: 1, title: "old", createdAt: new Date(1), completed: false, isNudged: false }]);
    storage.saveSettings({ ...DEFAULT_SETTINGS, maxRounds: 1, theme: "light" });

    storage.importData(
      JSON.stringify({
        version: 1,
        tasks: [{ id: 2, title: "new", createdAt: 2, completed: true, completedAt: 3, isNudged: false }],
        settings: { maxRounds: 2, theme: "dark" }
      })
    );

    const tasks = storage.loadTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({ id: 2, title: "new", completed: true, isNudged: false });
    expect(tasks[0]?.createdAt.getTime()).toBe(2);
    expect(tasks[0]?.completedAt?.getTime()).toBe(3);
    expect(storage.loadSettings()).toEqual({ ...DEFAULT_SETTINGS, maxRounds: 2, theme: "dark" });
  });

  it("importData does not modify storage when payload is invalid", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    storage.saveTasks([{ id: 1, title: "keep", createdAt: new Date(1), completed: false, isNudged: false }]);
    storage.saveSettings({ ...DEFAULT_SETTINGS, maxRounds: 1 });

    storage.importData("{not valid json");

    const tasks = storage.loadTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({ id: 1, title: "keep", completed: false, isNudged: false });
    expect(tasks[0]?.createdAt.getTime()).toBe(1);
    expect(storage.loadSettings()).toEqual({ ...DEFAULT_SETTINGS, maxRounds: 1 });
    expect(spy).toHaveBeenCalled();
  });
});
