import React, { useState, useCallback, useEffect } from "react";
import { TaskInput } from "./TaskInput";
import { TaskCard } from "./TaskCard";
import { NudgePanel } from "./NudgePanel";
import { TaskService } from "../services/taskService";
import { NudgeService, type NudgeSession } from "../services/nudgeService";
import { CoachPersona } from "../personas/coach";
import type { Task } from "../types/task";

export type AppProps = {
  taskService: TaskService;
  nudgeService: NudgeService;
};

export function App({ taskService, nudgeService }: AppProps) {
  const [tasks, setTasks] = useState<Task[]>(() => taskService.getTasks());
  const [nudgeSession, setNudgeSession] = useState<NudgeSession | null>(null);
  const [isNudgeLoading, setIsNudgeLoading] = useState(false);
  const [pendingTaskText, setPendingTaskText] = useState("");

  useEffect(() => {
    return taskService.subscribe(() => {
      setTasks(taskService.getTasks());
    });
  }, [taskService]);

  const handleSubmit = useCallback(
    async (text: string, isNudge: boolean) => {
      if (isNudge) {
        setPendingTaskText(text);
        setIsNudgeLoading(true);
        try {
          const session = await nudgeService.startSession(text, "coach");
          setNudgeSession(session);
        } finally {
          setIsNudgeLoading(false);
        }
      } else {
        taskService.createTask(text, false);
      }
    },
    [taskService, nudgeService]
  );

  const handleNudgeSubmit = useCallback(
    async (response: string) => {
      if (!nudgeSession) return;
      setIsNudgeLoading(true);
      try {
        const updated = await nudgeService.submitResponse(nudgeSession.id, response);
        if (updated.parsedTask) {
          taskService.createTask(updated.parsedTask.title, true);
        } else {
          taskService.createTask(pendingTaskText, true);
        }
        setNudgeSession(null);
        setPendingTaskText("");
      } finally {
        setIsNudgeLoading(false);
      }
    },
    [nudgeSession, nudgeService, taskService, pendingTaskText]
  );

  const handleNudgeCancel = useCallback(() => {
    if (nudgeSession) {
      nudgeService.cancelSession(nudgeSession.id);
    }
    setNudgeSession(null);
    setPendingTaskText("");
  }, [nudgeSession, nudgeService]);

  const handleToggleComplete = useCallback(
    (id: number) => {
      taskService.toggleComplete(id);
    },
    [taskService]
  );

  const handleDelete = useCallback(
    (id: number) => {
      taskService.deleteTask(id);
    },
    [taskService]
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>NudgeDO</h1>
      </header>

      <main className="app-main">
        <TaskInput onSubmit={handleSubmit} disabled={isNudgeLoading} />

        {nudgeSession && (
          <NudgePanel
            taskText={pendingTaskText}
            questions={nudgeSession.questions}
            personaName={CoachPersona.displayName}
            personaColor={CoachPersona.accentColor}
            isLoading={isNudgeLoading}
            onSubmit={handleNudgeSubmit}
            onCancel={handleNudgeCancel}
          />
        )}

        <div className="task-list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
            />
          ))}
          {tasks.length === 0 && (
            <div className="empty-state">暂无任务，添加一个吧！</div>
          )}
        </div>
      </main>
    </div>
  );
}
