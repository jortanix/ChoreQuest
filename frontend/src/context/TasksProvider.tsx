import {
    useCallback,
    useEffect,
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

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8010/api'

type ApiTask = {
    id: number | string
    title: string
    description: string
    frequency: Task['frequency']
    points: number
    due_label?: string
    category?: Task['category'] | ''
    assignee?: string
    needs_nfc?: boolean
    nfc_label?: string
    critical?: boolean
    penalty_label?: string
    streak_bonus?: number
    completed?: boolean
    completed_today?: boolean
    completed_this_period?: boolean
    current_streak?: number
    best_streak?: number
    last_completed_at?: string | null
}

type ApiCompletionEvent = {
    id: number | string
    task_id: number | string
    task_title: string
    assignee: string
    points: number
    completed_at: string
    frequency: CompletionEvent['frequency']
    needs_nfc?: boolean
}

type ApiNfcBinding = {
    id?: number | string
    task_id: number | string
    tag_id: string
    tag_label?: string
    linked_at: string
}

function normalizeTask(task: ApiTask): Task {
    return {
        id: String(task.id),
        title: task.title,
        description: task.description ?? '',
        frequency: task.frequency,
        points: task.points ?? 0,
        dueLabel: task.due_label ?? '',
        category: task.category ?? 'general',
        assignee: task.assignee ?? 'Maison',
        needsNfc: task.needs_nfc ?? false,
        nfcLabel: task.nfc_label ?? '',
        critical: task.critical ?? false,
        penaltyLabel: task.penalty_label ?? '',
        streakBonus: task.streak_bonus ?? 0,
        completed: task.completed ?? false,
        completedToday: task.completed_today ?? false,
        completedThisPeriod: task.completed_this_period ?? false,
        currentStreak: task.current_streak ?? 0,
        bestStreak: task.best_streak ?? 0,
        lastCompletedAt: task.last_completed_at ?? null,
    }
}

function normalizeCompletionEvent(event: ApiCompletionEvent): CompletionEvent {
    return {
        id: String(event.id),
        taskId: String(event.task_id),
        taskTitle: event.task_title,
        assignee: event.assignee ?? 'Maison',
        points: event.points ?? 0,
        completedAt: event.completed_at,
        frequency: event.frequency,
        needsNfc: event.needs_nfc ?? false,
    }
}

function normalizeNfcBinding(binding: ApiNfcBinding): NfcBinding {
    return {
        taskId: String(binding.task_id),
        tagId: binding.tag_id,
        tagLabel: binding.tag_label,
        linkedAt: binding.linked_at,
    }
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

    useEffect(() => {
        let isMounted = true

        async function bootstrapTasks() {
            try {
                const [tasksResponse, completionResponse, nfcResponse] =
                    await Promise.all([
                        fetch(`${API_URL}/tasks/`),
                        fetch(`${API_URL}/completion-events/`),
                        fetch(`${API_URL}/nfc-bindings/`),
                    ])

                if (!tasksResponse.ok) {
                    throw new Error(`Erreur chargement tâches (${tasksResponse.status})`)
                }

                if (!completionResponse.ok) {
                    throw new Error(
                        `Erreur chargement historique (${completionResponse.status})`
                    )
                }

                if (!nfcResponse.ok) {
                    throw new Error(
                        `Erreur chargement NFC (${nfcResponse.status})`
                    )
                }

                const tasksData = await tasksResponse.json()
                const completionData = await completionResponse.json()
                const nfcData = await nfcResponse.json()

                if (!isMounted) return

                setTaskList(
                    Array.isArray(tasksData)
                        ? tasksData.map((task) => normalizeTask(task as ApiTask))
                        : []
                )

                setCompletionHistory(
                    Array.isArray(completionData)
                        ? completionData.map((event) =>
                              normalizeCompletionEvent(event as ApiCompletionEvent)
                          )
                        : []
                )

                setNfcBindings(
                    Array.isArray(nfcData)
                        ? nfcData.map((binding) =>
                              normalizeNfcBinding(binding as ApiNfcBinding)
                          )
                        : []
                )
            } catch (error) {
                console.error('Impossible de charger les données backend :', error)
            }
        }

        bootstrapTasks()

        return () => {
            isMounted = false
        }
    }, [setTaskList, setCompletionHistory, setNfcBindings])

    const completeTaskById = useCallback(
        async (taskId: string) => {
            const existingTask = taskList.find((task) => task.id === taskId)
            if (!existingTask) return null

            try {
                const response = await fetch(`${API_URL}/tasks/${taskId}/complete/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (!response.ok) {
                    throw new Error(`Erreur validation tâche (${response.status})`)
                }

                const data = await response.json()
                const updatedTask = normalizeTask(data.task as ApiTask)
                const completionEvent = normalizeCompletionEvent(
                    data.event as ApiCompletionEvent
                )

                setTaskList((currentTasks) =>
                    currentTasks.map((task) =>
                        task.id === taskId ? updatedTask : task
                    )
                )

                setCompletionHistory((currentHistory) => [
                    completionEvent,
                    ...currentHistory,
                ])

                return updatedTask
            } catch (error) {
                console.error('Validation backend impossible, fallback local :', error)

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
            }
        },
        [taskList, setTaskList, setCompletionHistory]
    )

    const linkNfcTagToTask = useCallback(
        async (taskId: string, tagId: string, tagLabel?: string) => {
            try {
                const response = await fetch(`${API_URL}/nfc-bindings/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        task: Number(taskId),
                        tag_id: tagId,
                        tag_label: tagLabel ?? '',
                    }),
                })

                if (!response.ok) {
                    throw new Error(`Erreur liaison NFC (${response.status})`)
                }

                const createdBinding = await response.json()

                const nextBinding = normalizeNfcBinding(createdBinding as ApiNfcBinding)

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
            } catch (error) {
                console.error('Liaison NFC backend impossible, fallback local :', error)

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
            }
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