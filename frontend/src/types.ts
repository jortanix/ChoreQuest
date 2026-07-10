export type TaskFrequency =
    | 'daily'
    | 'weekly'
    | 'biweekly'
    | 'monthly'
    | 'seasonal'
    | 'yearly'

export type TaskCategory =
    | 'pet'
    | 'kitchen'
    | 'bathroom'
    | 'bedroom'
    | 'living-room'
    | 'general'

export interface NfcBinding {
    id?: number
    taskId?: number
    task_id?: number
    tagId?: string
    tag_id?: string
    tagLabel?: string
    tag_label?: string
    linkedAt?: string
    linked_at?: string
}

export interface CompletionEvent {
    id: number | string
    taskId?: number | string
    task_id?: number | string
    taskTitle: string
    task_title?: string
    assignee: string
    points: number
    completedAt?: string
    completed_at?: string
    frequency: TaskFrequency
    needsNfc?: boolean
    needs_nfc?: boolean
}

export interface Task {
    id: number | string
    title: string
    description: string
    frequency: TaskFrequency
    points: number
    dueLabel?: string
    due_label?: string
    category?: TaskCategory | ''
    assignee?: string
    needsNfc?: boolean
    needs_nfc?: boolean
    nfcLabel?: string
    nfc_label?: string
    critical?: boolean
    penaltyLabel?: string
    penalty_label?: string
    streakBonus?: number
    streak_bonus?: number
    completed?: boolean
    completedToday?: boolean
    completed_today?: boolean
    completedThisPeriod?: boolean
    completed_this_period?: boolean
    currentStreak?: number
    current_streak?: number
    bestStreak?: number
    best_streak?: number
    lastCompletedAt?: string | null
    last_completed_at?: string | null
    createdAt?: string
    created_at?: string
    updatedAt?: string
    updated_at?: string
    nfcBinding?: NfcBinding | null
    nfc_binding?: NfcBinding | null
    completionEvents?: CompletionEvent[]
    completion_events?: CompletionEvent[]
}