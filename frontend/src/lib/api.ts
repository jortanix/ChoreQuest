const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8010/api"

function getToken(): string {
  return localStorage.getItem("access_token") ?? ""
}

export class ApiError extends Error {
  constructor(public status: number, public detail: unknown) {
    super(`API error ${status}`)
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    ...options,
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new ApiError(res.status, detail)
  }
  return res.json() as Promise<T>
}

// ─── Types réponses backend ───────────────────────────────────────────────────

export interface HomeDashboardRaw {
  monthly_goal: { completed: number; goal: number; percentage: number }
  streak_days: number
  today: { done: number; total: number }
  frequency_breakdown: { frequency: string; count: number }[]
}

export interface CalendarDashboardRaw {
  period: { start: string; end: string }
  progress: { completed: number; total: number; percentage: number }
  summary: { to_do: number; routines: number; overdue: number }
  planning: TaskRaw[]
  completed: CompletionEventRaw[]
}

export interface TaskRaw {
  id: string
  household: string
  assigned_to: string | null
  title: string
  description: string
  frequency: "daily" | "weekly" | "monthly" | "once"
  points: number
  category: string
  needs_nfc: boolean
  nfc_label: string
  critical: boolean
  streak_bonus: boolean
  is_active: boolean
  due_date: string | null
  due_label: string | null
  priority: "high" | "medium" | "low"
  created_at: string
  updated_at: string
}

export interface CompletionEventRaw {
  id: string
  task: string
  completed_by: string | null
  scheduled_date: string
  completed_at: string
  points: number
  notes: string
  needs_nfc: boolean
}

export interface CreateTaskPayload {
  title: string
  description?: string
  frequency: "daily" | "weekly" | "monthly" | "once"
  points?: number
  category?: string
  needs_nfc?: boolean
  nfc_label?: string
  critical?: boolean
  streak_bonus?: boolean
  due_date?: string | null
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const api = {
  // Dashboard
  getHomeDashboard: () =>
    request<HomeDashboardRaw>("/dashboard/home/"),

  getCalendarDashboard: (period: "week" | "month" = "week", date?: string) =>
    request<CalendarDashboardRaw>(
      `/dashboard/calendar/?period=${period}${date ? `&date=${date}` : ""}`
    ),

  // Tasks
  getTasks: (params?: Record<string, string>) =>
    request<TaskRaw[]>(`/tasks/${params ? "?" + new URLSearchParams(params) : ""}`),

  createTask: (payload: CreateTaskPayload) =>
    request<TaskRaw>("/tasks/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateTask: (id: string, payload: Partial<CreateTaskPayload>) =>
    request<TaskRaw>(`/tasks/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteTask: (id: string) =>
    request<void>(`/tasks/${id}/`, { method: "DELETE" }),

  completeTask: (id: string, scheduled_date: string, notes?: string) =>
    request<{ task: TaskRaw; event: CompletionEventRaw; already_completed: boolean }>(
      `/tasks/${id}/complete/`,
      {
        method: "POST",
        body: JSON.stringify({ scheduled_date, notes }),
      }
    ),

  // Completion events
  getCompletionEvents: (params?: { date_from?: string; date_to?: string; ordering?: string }) =>
    request<CompletionEventRaw[]>(
      `/completion-events/${params ? "?" + new URLSearchParams(params as Record<string, string>) : ""}`
    ),
}