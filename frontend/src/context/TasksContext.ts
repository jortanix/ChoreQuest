import { createContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { CompletionEvent, NfcBinding, Task, TaskCategory, TaskFrequency } from '../types'

export interface CreateTaskInput {
    title: string
    description?: string
    category?: TaskCategory
    priority?: 'low' | 'medium' | 'high'
    frequency?: TaskFrequency
    points?: number
    dueDate?: string | null
    needsNfc?: boolean
}

export interface TasksContextValue {
    taskList: Task[]
    completionHistory: CompletionEvent[]
    nfcBindings: NfcBinding[]
    createTask: (input: CreateTaskInput) => Promise<Task>
    completeTaskById: (taskId: string) => Promise<Task | null>
    linkNfcTagToTask: (
        taskId: string,
        tagId: string,
        tagLabel?: string
    ) => Promise<NfcBinding>
    unlinkNfcTagFromTask: (taskId: string) => void
    getNfcBindingByTaskId: (taskId: string) => NfcBinding | null
    getTaskByNfcTagId: (tagId: string) => Task | null
    resetTasks: () => void
    clearHistory: () => void
    clearNfcBindings: () => void
    setTaskList: Dispatch<SetStateAction<Task[]>>
}

export const TasksContext = createContext<TasksContextValue | undefined>(undefined)