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

export interface Task {
    id: string
    title: string
    description: string
    frequency: TaskFrequency
    points: number
    dueLabel: string
    category?: TaskCategory
    assignee?: string
    needsNfc?: boolean
    nfcLabel?: string
    critical?: boolean
    penaltyLabel?: string
    streakBonus?: number
    completed?: boolean
    completedToday?: boolean
    completedThisPeriod?: boolean
    currentStreak?: number
    bestStreak?: number
    lastCompletedAt?: string | null
}

export interface CompletionEvent {
    id: string
    taskId: string
    taskTitle: string
    assignee: string
    points: number
    completedAt: string
    frequency: TaskFrequency
    needsNfc?: boolean
}

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

export interface Task {
    id: string
    title: string
    description: string
    frequency: TaskFrequency
    points: number
    dueLabel: string
    category?: TaskCategory
    assignee?: string
    needsNfc?: boolean
    nfcLabel?: string
    critical?: boolean
    penaltyLabel?: string
    streakBonus?: number
    completed?: boolean
    completedToday?: boolean
    completedThisPeriod?: boolean
    currentStreak?: number
    bestStreak?: number
    lastCompletedAt?: string | null
}

export interface CompletionEvent {
    id: string
    taskId: string
    taskTitle: string
    assignee: string
    points: number
    completedAt: string
    frequency: TaskFrequency
    needsNfc?: boolean
}

export interface NfcBinding {
    taskId: string
    tagId: string
    tagLabel?: string
    linkedAt: string
}