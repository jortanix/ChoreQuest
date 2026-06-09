import { createContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { CompletionEvent, NfcBinding, Task } from '../types'

export interface TasksContextValue {
    taskList: Task[]
    completionHistory: CompletionEvent[]
    nfcBindings: NfcBinding[]
    completeTaskById: (taskId: string) => Task | null
    linkNfcTagToTask: (taskId: string, tagId: string, tagLabel?: string) => NfcBinding
    unlinkNfcTagFromTask: (taskId: string) => void
    getNfcBindingByTaskId: (taskId: string) => NfcBinding | null
    getTaskByNfcTagId: (tagId: string) => Task | null
    resetTasks: () => void
    clearHistory: () => void
    clearNfcBindings: () => void
    setTaskList: Dispatch<SetStateAction<Task[]>>
}

export const TasksContext = createContext<TasksContextValue | undefined>(undefined)