import { TaskStorage } from "../storage/localStorage";
import type { Task } from "../types/task";
import { toggleComplete as toggleTaskComplete } from "../types/task";

export type TaskServiceErrorCode = "EMPTY_TITLE" | "NOT_FOUND" | "IMMUTABLE_FIELD";

export class TaskServiceError extends Error {
  readonly code: TaskServiceErrorCode;

  constructor(code: TaskServiceErrorCode, message: string) {
    super(message);
    this.name = "TaskServiceError";
    this.code = code;
  }
}

type ChangeListener = () => void;

export class TaskService {
  readonly #storage: TaskStorage;
  #tasks: Task[];
  readonly #listeners = new Set<ChangeListener>();

  constructor(storage = new TaskStorage()) {
    this.#storage = storage;
    this.#tasks = this.#storage.loadTasks();
  }

  subscribe(listener: ChangeListener): () => void {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  #notify(): void {
    for (const listener of this.#listeners) {
      listener();
    }
  }

  #persist(): void {
    this.#storage.saveTasks(this.#tasks);
  }

  #commit(): void {
    this.#persist();
    this.#notify();
  }

  #findIndex(id: number): number {
    return this.#tasks.findIndex((task) => task.id === id);
  }

  #requireTaskIndex(id: number): number {
    const index = this.#findIndex(id);
    if (index < 0) {
      throw new TaskServiceError("NOT_FOUND", `Task not found: ${id}`);
    }
    return index;
  }

  #normalizeTask(task: Task): Task {
    if (!task.completed) {
      return { ...task, completedAt: undefined };
    }
    if (!task.completedAt) {
      return { ...task, completedAt: new Date() };
    }
    return task;
  }

  createTask(title: string, isNudged = false): Task {
    const trimmed = title.trim();
    if (!trimmed) {
      throw new TaskServiceError("EMPTY_TITLE", "Task title cannot be empty.");
    }

    const now = new Date();
    let id = now.getTime();
    while (this.#tasks.some((task) => task.id === id)) id += 1;

    const task: Task = {
      id,
      title: trimmed,
      completed: false,
      createdAt: now,
      isNudged,
    };

    this.#tasks = [task, ...this.#tasks];
    this.#commit();
    return task;
  }

  getTasks(): Task[] {
    return [...this.#tasks];
  }

  getTaskById(id: number): Task | undefined {
    return this.#tasks.find((task) => task.id === id);
  }

  updateTask(id: number, updates: Partial<Task>): Task {
    if ("id" in updates || "createdAt" in updates) {
      throw new TaskServiceError("IMMUTABLE_FIELD", "Task id/createdAt cannot be updated.");
    }

    const index = this.#requireTaskIndex(id);
    const current = this.#tasks[index]!;

    const next: Task = { ...current, ...updates };
    if (updates.title !== undefined) {
      const trimmed = updates.title.trim();
      if (!trimmed) {
        throw new TaskServiceError("EMPTY_TITLE", "Task title cannot be empty.");
      }
      next.title = trimmed;
    }

    const normalized = this.#normalizeTask(next);
    const tasks = [...this.#tasks];
    tasks[index] = normalized;
    this.#tasks = tasks;
    this.#commit();
    return normalized;
  }

  deleteTask(id: number): void {
    const index = this.#requireTaskIndex(id);
    const tasks = [...this.#tasks];
    tasks.splice(index, 1);
    this.#tasks = tasks;
    this.#commit();
  }

  toggleComplete(id: number): Task {
    const index = this.#requireTaskIndex(id);
    const current = this.#tasks[index]!;
    const next = toggleTaskComplete(current);

    const tasks = [...this.#tasks];
    tasks[index] = next;
    this.#tasks = tasks;
    this.#commit();
    return next;
  }

  getCompletedTasks(): Task[] {
    return this.#tasks.filter((task) => task.completed);
  }

  getPendingTasks(): Task[] {
    return this.#tasks.filter((task) => !task.completed);
  }
}

export const taskService = new TaskService();

