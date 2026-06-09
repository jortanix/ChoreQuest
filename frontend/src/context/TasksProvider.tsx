import {
    useCallback,
    useMemo,
    type ReactNode,
} from 'react'
import { tasks as initialTasks } from '../data/tasks'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { CompletionEvent, NfcBinding, Task } from '../types'
import { TasksContext } from './TasksContext'
import { completeTask } from '../utils/streaks'

interface TasksProviderProps {
    children: ReactNode
}

export function TasksProvider({ children }: TasksProviderProps) {
    const [taskList, setTaskList] = useLocalStorage<Task[]>(
        'chanti-tasks',
        initialTasks
    )

    const [completionHistory, setCompletionHistory] = useLocalStorage<CompletionEvent[]>(
        'chanti-completion-history',
        []
    )

    const [nfcBindings, setNfcBindings] = useLocalStorage<NfcBinding[]>(
        'chanti-nfc-bindings',
        []
    )

    const completeTaskById = useCallback(
        (taskId: string) => {
            let updatedTask: Task | null = null
            let completionEvent: CompletionEvent | null = null

            setTaskList((currentTasks) =>
                currentTasks.map((task) => {
                    if (task.id !== taskId) return task

                    updatedTask = completeTask(task)

                    completionEvent = {
                        id: `${task.id}-${Date.now()}`,
                        taskId: task.id,
                        taskTitle: task.title,
                        assignee: task.assignee ?? 'Maison',
                        points: task.points,
                        completedAt: new Date().toISOString(),
                        frequency: task.frequency,
                        needsNfc: task.needsNfc,
                    }

                    return updatedTask
                })
            )

            if (completionEvent) {
                setCompletionHistory((currentHistory) => [
                    completionEvent as CompletionEvent,
                    ...currentHistory,
                ])
            }

            return updatedTask
        },
        [setTaskList, setCompletionHistory]
    )

    const linkNfcTagToTask = useCallback(
        (taskId: string, tagId: string, tagLabel?: string) => {
            const nextBinding: NfcBinding = {
                taskId,
                tagId,
                tagLabel,
                linkedAt: new Date().toISOString(),
            }

            setNfcBindings((currentBindings) => {
                const withoutSameTask = currentBindings.filter(
                    (binding) => binding.taskId !== taskId
                )

                const withoutSameTag = withoutSameTask.filter(
                    (binding) => binding.tagId !== tagId
                )

                return [nextBinding, ...withoutSameTag]
            })

            return nextBinding
        },
        [setNfcBindings]
    )

    const unlinkNfcTagFromTask = useCallback(
        (taskId: string) => {
            setNfcBindings((currentBindings) =>
                currentBindings.filter((binding) => binding.taskId !== taskId)
            )
        },
        [setNfcBindings]
    )

    const getNfcBindingByTaskId = useCallback(
        (taskId: string) => {
            return nfcBindings.find((binding) => binding.taskId === taskId) ?? null
        },
        [nfcBindings]
    )

    const getTaskByNfcTagId = useCallback(
        (tagId: string) => {
            const binding = nfcBindings.find((item) => item.tagId === tagId)

            if (!binding) return null

            return taskList.find((task) => task.id === binding.taskId) ?? null
        },
        [nfcBindings, taskList]
    )

    const resetTasks = useCallback(() => {
        setTaskList(initialTasks)
    }, [setTaskList])

    const clearHistory = useCallback(() => {
        setCompletionHistory([])
    }, [setCompletionHistory])

    const clearNfcBindings = useCallback(() => {
        setNfcBindings([])
    }, [setNfcBindings])

    const value = useMemo(
        () => ({
            taskList,
            completionHistory,
            nfcBindings,
            completeTaskById,
            linkNfcTagToTask,
            unlinkNfcTagFromTask,
            getNfcBindingByTaskId,
            getTaskByNfcTagId,
            resetTasks,
            clearHistory,
            clearNfcBindings,
            setTaskList,
        }),
        [
            taskList,
            completionHistory,
            nfcBindings,
            completeTaskById,
            linkNfcTagToTask,
            unlinkNfcTagFromTask,
            getNfcBindingByTaskId,
            getTaskByNfcTagId,
            resetTasks,
            clearHistory,
            clearNfcBindings,
            setTaskList,
        ]
    )

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}