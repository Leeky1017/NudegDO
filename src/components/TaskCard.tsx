import React from "react";
import type { Task } from "../types/task";

export type TaskCardProps = {
  task: Task;
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onExpand?: (id: number) => void;
};

export function TaskCard({ task, onToggleComplete, onDelete, onExpand }: TaskCardProps) {
  return (
    <div className={`task-card ${task.completed ? "completed" : ""}`}>
      <button
        type="button"
        className="task-checkbox"
        onClick={() => onToggleComplete(task.id)}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed ? "✓" : ""}
      </button>
      <span className="task-title">{task.title}</span>
      <div className="task-actions">
        {task.isNudged && onExpand && (
          <button
            type="button"
            className="expand-button"
            onClick={() => onExpand(task.id)}
            aria-label="Show details"
          >
            ▼
          </button>
        )}
        <button
          type="button"
          className="delete-button"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
        >
          ×
        </button>
      </div>
    </div>
  );
}
