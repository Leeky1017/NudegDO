import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import { TaskService } from "./services/taskService";
import { NudgeService } from "./services/nudgeService";
import { LLMClient } from "./llm/client";
import "./styles/app.css";

const llmClient = new LLMClient({
  apiKey: import.meta.env.VITE_NVIDIA_API_KEY,
});

const taskService = new TaskService();
const nudgeService = new NudgeService({ llmClient });

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App taskService={taskService} nudgeService={nudgeService} />
  </React.StrictMode>
);
