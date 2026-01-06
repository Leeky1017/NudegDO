export type Task = {
  id: number;
  title: string;
  createdAt: number;
  completed: boolean;
  completedAt?: number | null;
  isNudged?: boolean;
  personaType?: string;
  chatHistory?: unknown;
  scheduledTime?: string;
  scheduledDate?: string;
  duration?: number;
  [key: string]: unknown;
};

export type Settings = {
  maxRounds: number;
  [key: string]: unknown;
};

export const DEFAULT_SETTINGS: Settings = {
  maxRounds: 1,
};

