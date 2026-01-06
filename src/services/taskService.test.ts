import { beforeEach, describe, expect, it, vi } from "vitest";

import { TaskService, TaskServiceError } from "./taskService";

const TASKS_KEY = "nudgedo_tasks";

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

function readStoredTasks(): unknown {
  return JSON.parse(localStorage.getItem(TASKS_KEY) ?? "null");
}

describe("TaskService", () => {
  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage();
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  it("createTask creates a task, adds it to top, and persists to localStorage", () => {
    vi.setSystemTime(1_000);
    const service = new TaskService();

    const task = service.createTask("  hello  ");

    expect(task).toMatchObject({ id: 1_000, title: "hello", completed: false, isNudged: false });
    expect(service.getTasks()[0]?.id).toBe(1_000);

    expect(readStoredTasks()).toEqual([
      { id: 1_000, title: "hello", createdAt: 1_000, completed: false, isNudged: false }
    ]);
  });

  it("createTask supports nudged tasks", () => {
    vi.setSystemTime(1_000);
    const service = new TaskService();

    const task = service.createTask("nudge", true);

    expect(task.isNudged).toBe(true);
    expect(readStoredTasks()).toEqual([
      { id: 1_000, title: "nudge", createdAt: 1_000, completed: false, isNudged: true }
    ]);
  });

  it("createTask rejects empty titles", () => {
    const service = new TaskService();

    expect(() => service.createTask("   ")).toThrowError(TaskServiceError);
    expect(() => service.createTask("   ")).toThrowError(/cannot be empty/i);
    expect(readStoredTasks()).toBeNull();
  });

  it("getTaskById returns the task when it exists", () => {
    vi.setSystemTime(1_000);
    const service = new TaskService();
    const task = service.createTask("t1");

    expect(service.getTaskById(task.id)?.title).toBe("t1");
    expect(service.getTaskById(999)).toBeUndefined();
  });

  it("updateTask updates a task and persists", () => {
    vi.setSystemTime(1_000);
    const service = new TaskService();
    const task = service.createTask("t1");

    const updated = service.updateTask(task.id, { title: "  t2  ", scheduledTime: "10:00" });

    expect(updated.title).toBe("t2");
    expect(updated.scheduledTime).toBe("10:00");
    expect(readStoredTasks()).toEqual([
      {
        id: 1_000,
        title: "t2",
        createdAt: 1_000,
        completed: false,
        isNudged: false,
        scheduledTime: "10:00"
      }
    ]);
  });

  it("updateTask throws NOT_FOUND when task does not exist", () => {
    const service = new TaskService();

    expect(() => service.updateTask(123, { title: "x" })).toThrowError(TaskServiceError);
    expect(() => service.updateTask(123, { title: "x" })).toThrowError(/not found/i);
  });

  it("toggleComplete flips completion and sets/clears completedAt", () => {
    vi.setSystemTime(1_000);
    const service = new TaskService();
    const task = service.createTask("t1");

    vi.setSystemTime(2_000);
    const completed = service.toggleComplete(task.id);
    expect(completed.completed).toBe(true);
    expect(completed.completedAt?.getTime()).toBe(2_000);

    expect(readStoredTasks()).toEqual([
      { id: 1_000, title: "t1", createdAt: 1_000, completed: true, completedAt: 2_000, isNudged: false }
    ]);

    vi.setSystemTime(3_000);
    const reopened = service.toggleComplete(task.id);
    expect(reopened.completed).toBe(false);
    expect(reopened.completedAt).toBeUndefined();
  });

  it("deleteTask removes task and persists", () => {
    vi.setSystemTime(1_000);
    const service = new TaskService();
    const t1 = service.createTask("t1");

    vi.setSystemTime(2_000);
    const t2 = service.createTask("t2");

    expect(service.getTasks().map((t) => t.id)).toEqual([t2.id, t1.id]);

    service.deleteTask(t2.id);
    expect(service.getTasks().map((t) => t.id)).toEqual([t1.id]);

    expect(readStoredTasks()).toEqual([
      { id: 1_000, title: "t1", createdAt: 1_000, completed: false, isNudged: false }
    ]);
  });

  it("getCompletedTasks and getPendingTasks reflect current state", () => {
    vi.setSystemTime(1_000);
    const service = new TaskService();
    const t1 = service.createTask("t1");

    vi.setSystemTime(2_000);
    const t2 = service.createTask("t2");

    expect(service.getPendingTasks().map((t) => t.id).sort()).toEqual([t1.id, t2.id].sort());
    expect(service.getCompletedTasks()).toEqual([]);

    vi.setSystemTime(3_000);
    service.toggleComplete(t1.id);

    expect(service.getCompletedTasks().map((t) => t.id)).toEqual([t1.id]);
    expect(service.getPendingTasks().map((t) => t.id)).toEqual([t2.id]);
  });

  it("loads existing tasks from localStorage on construction", () => {
    localStorage.setItem(
      TASKS_KEY,
      JSON.stringify([{ id: 1, title: "from-storage", createdAt: 123, completed: false, isNudged: false }])
    );

    const service = new TaskService();
    const tasks = service.getTasks();

    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({ id: 1, title: "from-storage", completed: false, isNudged: false });
    expect(tasks[0]?.createdAt.getTime()).toBe(123);
  });
});

