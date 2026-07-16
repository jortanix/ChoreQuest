import {
    useCallback,
    useEffect,
    useMemo,
    type ReactNode,
} from 'react'
import { tasks as initialTasks } from '../data/tasks'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { CompletionEvent, NfcBinding, Task } from '../types'
import { TasksContext, type CreateTaskInput } from './TasksContext'
import { completeTask } from '../utils/streaks'
import { getAccessToken } from '../lib/api'

interface TasksProviderProps {
    children: ReactNode
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8010/api'

function authHeaders(): HeadersInit {
    const token = getAccessToken()
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
}

// Aplati une réponse d'erreur DRF ({ champ: ["message"] }) en une phrase lisible.
function buildErrorMessage(detail: unknown): string {
    if (detail && typeof detail === 'object') {
        const parts: string[] = []
        for (const value of Object.values(detail as Record<string, unknown>)) {
            if (Array.isArray(value)) parts.push(...value.map(String))
            else if (value) parts.push(String(value))
        }
        if (parts.length) return parts.join(' ')
    }
    return 'Impossible de créer la tâche. Réessaie.'
}

// ─── Normaliseurs ─────────────────────────────────────────────────────────────

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
        id:                   String(task.id),
        title:                task.title,
        description:          task.description ?? '',
        frequency:            task.frequency,
        points:               task.points ?? 0,
        dueLabel:             task.due_label ?? '',
        category:             task.category ?? 'general',
        assignee:             task.assignee ?? 'Maison',
        needsNfc:             task.needs_nfc ?? false,
        nfcLabel:             task.nfc_label ?? '',
        critical:             task.critical ?? false,
        penaltyLabel:         task.penalty_label ?? '',
        streakBonus:          task.streak_bonus ?? 0,
        completed:            task.completed ?? false,
        completedToday:       task.completed_today ?? false,
        completedThisPeriod:  task.completed_this_period ?? false,
        currentStreak:        task.current_streak ?? 0,
        bestStreak:           task.best_streak ?? 0,
        lastCompletedAt:      task.last_completed_at ?? null,
    }
}

function normalizeCompletionEvent(event: ApiCompletionEvent): CompletionEvent {
    return {
        id:         String(event.id),
        taskId:     String(event.task_id),
        taskTitle:  event.task_title,
        assignee:   event.assignee ?? 'Maison',
        points:     event.points ?? 0,
        completedAt: event.completed_at,
        frequency:  event.frequency,
        needsNfc:   event.needs_nfc ?? false,
    }
}

function normalizeNfcBinding(binding: ApiNfcBinding): NfcBinding {
    return {
        taskId:   String(binding.task_id),
        tagId:    binding.tag_id,
        tagLabel: binding.tag_label,
        linkedAt: binding.linked_at,
    }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TasksProvider({ children }: TasksProviderProps) {
    const [taskList, setTaskList] = useLocalStorage<Task[]>(
        'chanti-tasks', initialTasks
    )
    const [completionHistory, setCompletionHistory] = useLocalStorage<CompletionEvent[]>(
        'chanti-completion-history', []
    )
    const [nfcBindings, setNfcBindings] = useLocalStorage<NfcBinding[]>(
        'chanti-nfc-bindings', []
    )

    // Charge les données depuis le backend (token déjà dispo via LoginScreen)
    useEffect(() => {
        let isMounted = true

        async function bootstrap() {
            // Si pas de token, on ne tente rien (LoginScreen n'a pas encore validé)
            if (!getAccessToken()) return

            try {
                const [tasksRes, completionRes, nfcRes] = await Promise.all([
                    fetch(`${API_URL}/tasks/`,             { headers: authHeaders() }),
                    fetch(`${API_URL}/completion-events/`, { headers: authHeaders() }),
                    fetch(`${API_URL}/nfc-bindings/`,      { headers: authHeaders() }),
                ])

                if (!tasksRes.ok || !completionRes.ok || !nfcRes.ok) {
                    throw new Error('Erreur chargement donnees')
                }

                const [tasksData, completionData, nfcData] = await Promise.all([
                    tasksRes.json(),
                    completionRes.json(),
                    nfcRes.json(),
                ])

                if (!isMounted) return

                setTaskList(Array.isArray(tasksData)
                    ? tasksData.map((t) => normalizeTask(t as ApiTask))
                    : [])
                setCompletionHistory(Array.isArray(completionData)
                    ? completionData.map((e) => normalizeCompletionEvent(e as ApiCompletionEvent))
                    : [])
                setNfcBindings(Array.isArray(nfcData)
                    ? nfcData.map((b) => normalizeNfcBinding(b as ApiNfcBinding))
                    : [])
            } catch (error) {
                console.error('Bootstrap echoue, donnees locales conservees :', error)
            }
        }

        void bootstrap()
        return () => { isMounted = false }
    }, [setTaskList, setCompletionHistory, setNfcBindings])

    const createTask = useCallback(
        async (input: CreateTaskInput): Promise<Task> => {
            const payload = {
                title:       input.title,
                description: input.description ?? '',
                category:    input.category || 'general',
                priority:    input.priority ?? 'low',
                frequency:   input.frequency ?? 'weekly',
                points:      input.points ?? 0,
                due_date:    input.dueDate || null,
                needs_nfc:   input.needsNfc ?? false,
            }

            const res = await fetch(`${API_URL}/tasks/`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const detail = await res.json().catch(() => null)
                throw new Error(buildErrorMessage(detail))
            }

            const created = normalizeTask(await res.json() as ApiTask)
            setTaskList((curr) => [created, ...curr])
            return created
        },
        [setTaskList]
    )

    const completeTaskById = useCallback(
        async (taskId: string) => {
            const existingTask = taskList.find((t) => t.id === taskId)
            if (!existingTask) return null

            try {
                const res = await fetch(`${API_URL}/tasks/${taskId}/complete/`, {
                    method: 'POST',
                    headers: authHeaders(),
                })
                if (!res.ok) throw new Error(`HTTP ${res.status}`)

                const data = await res.json()
                const updatedTask = normalizeTask(data.task as ApiTask)
                const event = normalizeCompletionEvent(data.event as ApiCompletionEvent)

                setTaskList((curr) => curr.map((t) => t.id === taskId ? updatedTask : t))
                setCompletionHistory((curr) => [event, ...curr])
                return updatedTask
            } catch (error) {
                console.error('Fallback local completeTask :', error)

                let updatedTask: Task | null = null
                let completionEvent: CompletionEvent | null = null

                setTaskList((curr) =>
                    curr.map((t) => {
                        if (t.id !== taskId) return t
                        updatedTask = completeTask(t)
                        completionEvent = {
                            id:          `${t.id}-${Date.now()}`,
                            taskId:      t.id,
                            taskTitle:   t.title,
                            assignee:    t.assignee ?? 'Maison',
                            points:      t.points,
                            completedAt: new Date().toISOString(),
                            frequency:   t.frequency,
                            needsNfc:    t.needsNfc,
                        }
                        return updatedTask
                    })
                )
                if (completionEvent) {
                    setCompletionHistory((curr) => [completionEvent as CompletionEvent, ...curr])
                }
                return updatedTask
            }
        },
        [taskList, setTaskList, setCompletionHistory]
    )

    const linkNfcTagToTask = useCallback(
        async (taskId: string, tagId: string, tagLabel?: string) => {
            try {
                const res = await fetch(`${API_URL}/nfc-bindings/`, {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({
                        task:      Number(taskId),
                        tag_id:    tagId,
                        tag_label: tagLabel ?? '',
                    }),
                })
                if (!res.ok) throw new Error(`HTTP ${res.status}`)

                const created = await res.json()
                const nextBinding = normalizeNfcBinding(created as ApiNfcBinding)

                setNfcBindings((curr) => [
                    nextBinding,
                    ...curr.filter((b) => b.taskId !== taskId && b.tagId !== tagId),
                ])
                return nextBinding
            } catch (error) {
                console.error('Fallback local linkNfc :', error)
                const nextBinding: NfcBinding = {
                    taskId, tagId, tagLabel,
                    linkedAt: new Date().toISOString(),
                }
                setNfcBindings((curr) => [
                    nextBinding,
                    ...curr.filter((b) => b.taskId !== taskId && b.tagId !== tagId),
                ])
                return nextBinding
            }
        },
        [setNfcBindings]
    )

    const unlinkNfcTagFromTask = useCallback(
        (taskId: string) => {
            setNfcBindings((curr) => curr.filter((b) => b.taskId !== taskId))
        },
        [setNfcBindings]
    )

    const getNfcBindingByTaskId = useCallback(
        (taskId: string) => nfcBindings.find((b) => b.taskId === taskId) ?? null,
        [nfcBindings]
    )

    const getTaskByNfcTagId = useCallback(
        (tagId: string) => {
            const binding = nfcBindings.find((b) => b.tagId === tagId)
            if (!binding) return null
            return taskList.find((t) => t.id === binding.taskId) ?? null
        },
        [nfcBindings, taskList]
    )

    const resetTasks       = useCallback(() => setTaskList(initialTasks), [setTaskList])
    const clearHistory     = useCallback(() => setCompletionHistory([]), [setCompletionHistory])
    const clearNfcBindings = useCallback(() => setNfcBindings([]), [setNfcBindings])

    const value = useMemo(() => ({
        taskList, completionHistory, nfcBindings,
        createTask, completeTaskById, linkNfcTagToTask, unlinkNfcTagFromTask,
        getNfcBindingByTaskId, getTaskByNfcTagId,
        resetTasks, clearHistory, clearNfcBindings, setTaskList,
    }), [
        taskList, completionHistory, nfcBindings,
        createTask, completeTaskById, linkNfcTagToTask, unlinkNfcTagFromTask,
        getNfcBindingByTaskId, getTaskByNfcTagId,
        resetTasks, clearHistory, clearNfcBindings, setTaskList,
    ])

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}