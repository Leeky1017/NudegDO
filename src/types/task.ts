export interface ChatMessage {
  role: 'ai' | 'user'
  content: string
  timestamp: Date
}

export interface Task {
  id: number
  title: string
  completed: boolean
  createdAt: Date
  completedAt?: Date
  isNudged: boolean
  persona?: 'coach' | 'buddy'
  chatHistory?: ChatMessage[]
  scheduledTime?: string
  scheduledDate?: string
  duration?: number
}

export function createTask(title: string): Task {
  const now = new Date()
  return {
    id: now.getTime(),
    title: title.trim(),
    completed: false,
    createdAt: now,
    isNudged: false,
  }
}

export function toggleComplete(task: Task): Task {
  const completed = !task.completed
  return {
    ...task,
    completed,
    completedAt: completed ? new Date() : undefined,
  }
}
