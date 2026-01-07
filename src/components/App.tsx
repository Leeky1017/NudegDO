import React, { useState, useCallback, useEffect } from "react";
import { TaskInput } from "./TaskInput";
import { TaskCard } from "./TaskCard";
import { NudgePanel } from "./NudgePanel";
import { TaskDrawer } from "./TaskDrawer";
import { TaskService } from "../services/taskService";
import { NudgeService, type NudgeSession, type PersonaType } from "../services/nudgeService";
import { CoachPersona, BuddyPersona } from "../personas";
import type { Task } from "../types/task";
import type { Message } from "../llm/client";

export type AppProps = {
  taskService: TaskService;
  nudgeService: NudgeService;
};

// Store chat history per task
const taskChatHistory = new Map<number, { messages: Message[]; persona: PersonaType }>();

export function App({ taskService, nudgeService }: AppProps) {
  const [tasks, setTasks] = useState<Task[]>(() => taskService.getTasks());
  const [nudgeSession, setNudgeSession] = useState<NudgeSession | null>(null);
  const [isNudgeLoading, setIsNudgeLoading] = useState(false);
  const [pendingTaskText, setPendingTaskText] = useState("");
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>("coach");
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  const currentPersona = selectedPersona === "coach" ? CoachPersona : BuddyPersona;

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
          const session = await nudgeService.startSession(text, selectedPersona);
          setNudgeSession(session);
        } finally {
          setIsNudgeLoading(false);
        }
      } else {
        taskService.createTask(text, false);
      }
    },
    [taskService, nudgeService, selectedPersona]
  );

  const handleNudgeSubmit = useCallback(
    async (response: string) => {
      if (!nudgeSession) return;
      setIsNudgeLoading(true);
      try {
        const updated = await nudgeService.submitResponse(nudgeSession.id, response);
        const title = updated.parsedTask?.title ?? pendingTaskText;
        const task = taskService.createTask(title, true);
        // Store chat history for this task
        taskChatHistory.set(task.id, {
          messages: updated.chatHistory,
          persona: selectedPersona,
        });
        setNudgeSession(null);
        setPendingTaskText("");
      } finally {
        setIsNudgeLoading(false);
      }
    },
    [nudgeSession, nudgeService, taskService, pendingTaskText, selectedPersona]
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
      taskChatHistory.delete(id);
      if (expandedTaskId === id) setExpandedTaskId(null);
    },
    [taskService, expandedTaskId]
  );

  const handleExpand = useCallback((id: number) => {
    setExpandedTaskId((prev) => (prev === id ? null : id));
  }, []);

  const handlePersonaChange = useCallback((persona: PersonaType) => {
    setSelectedPersona(persona);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>NudgeDO</h1>
      </header>

      <main className="app-main">
        <div className="persona-selector">
          <button
            type="button"
            className={`persona-option ${selectedPersona === "coach" ? "active" : ""}`}
            style={{ color: CoachPersona.accentColor }}
            onClick={() => handlePersonaChange("coach")}
          >
            {CoachPersona.displayName}
          </button>
          <button
            type="button"
            className={`persona-option ${selectedPersona === "buddy" ? "active" : ""}`}
            style={{ color: BuddyPersona.accentColor }}
            onClick={() => handlePersonaChange("buddy")}
          >
            {BuddyPersona.displayName}
          </button>
        </div>

        <TaskInput onSubmit={handleSubmit} disabled={isNudgeLoading} />

        {nudgeSession && (
          <NudgePanel
            taskText={pendingTaskText}
            questions={nudgeSession.questions}
            personaName={currentPersona.displayName}
            personaColor={currentPersona.accentColor}
            isLoading={isNudgeLoading}
            onSubmit={handleNudgeSubmit}
            onCancel={handleNudgeCancel}
          />
        )}

        <div className="task-list">
          {tasks.map((task) => {
            const history = taskChatHistory.get(task.id);
            const taskPersona = history?.persona === "buddy" ? BuddyPersona : CoachPersona;
            return (
              <React.Fragment key={task.id}>
                <TaskCard
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDelete}
                  onExpand={task.isNudged ? handleExpand : undefined}
                />
                {task.isNudged && history && (
                  <TaskDrawer
                    isOpen={expandedTaskId === task.id}
                    chatHistory={history.messages}
                    personaName={taskPersona.displayName}
                    personaColor={taskPersona.accentColor}
                    onClose={() => setExpandedTaskId(null)}
                  />
                )}
              </React.Fragment>
            );
          })}
          {tasks.length === 0 && (
            <div className="empty-state">暂无任务，添加一个吧！</div>
          )}
        </div>
      </main>
    </div>
  );
}
