import { useEffect, useMemo, useState } from "react";

import type { Task } from "../types/task";
import { taskService, type TaskService } from "../services/taskService";

export type UseTaskServiceResult = {
  tasks: Task[];
  completedTasks: Task[];
  pendingTasks: Task[];
  createTask: TaskService["createTask"];
  getTaskById: TaskService["getTaskById"];
  updateTask: TaskService["updateTask"];
  deleteTask: TaskService["deleteTask"];
  toggleComplete: TaskService["toggleComplete"];
};

export function useTaskService(service: TaskService = taskService): UseTaskServiceResult {
  const [tasks, setTasks] = useState<Task[]>(() => service.getTasks());

  useEffect(() => {
    setTasks(service.getTasks());
    return service.subscribe(() => {
      setTasks(service.getTasks());
    });
  }, [service]);

  return useMemo(() => {
    return {
      tasks,
      completedTasks: tasks.filter((task) => task.completed),
      pendingTasks: tasks.filter((task) => !task.completed),
      createTask: service.createTask.bind(service),
      getTaskById: service.getTaskById.bind(service),
      updateTask: service.updateTask.bind(service),
      deleteTask: service.deleteTask.bind(service),
      toggleComplete: service.toggleComplete.bind(service),
    };
  }, [service, tasks]);
}

