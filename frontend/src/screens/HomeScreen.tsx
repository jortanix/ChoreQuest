import { useEffect, useMemo, useState } from 'react'
import type { Task } from '../types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8010/api'

function normalizeTask(task: Task): Task {
    return {
        ...task,
        dueLabel: task.dueLabel ?? task.due_label ?? '',
        needsNfc: task.needsNfc ?? task.needs_nfc ?? false,
        nfcLabel: task.nfcLabel ?? task.nfc_label ?? '',
        penaltyLabel: task.penaltyLabel ?? task.penalty_label ?? '',
        streakBonus: task.streakBonus ?? task.streak_bonus ?? 0,
        completedToday: task.completedToday ?? task.completed_today ?? false,
        completedThisPeriod:
            task.completedThisPeriod ?? task.completed_this_period ?? false,
        currentStreak: task.currentStreak ?? task.current_streak ?? 0,
        bestStreak: task.bestStreak ?? task.best_streak ?? 0,
        lastCompletedAt: task.lastCompletedAt ?? task.last_completed_at ?? null,
        nfcBinding: task.nfcBinding ?? task.nfc_binding ?? null,
        completionEvents: task.completionEvents ?? task.completion_events ?? [],
    }
}

export function HomeScreen() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        async function fetchTasks() {
            try {
                setIsLoading(true)
                setError(null)

                const response = await fetch(`${API_URL}/tasks/`)

                if (!response.ok) {
                    throw new Error(`Erreur API (${response.status})`)
                }

                const data = await response.json()

                if (!isMounted) return

                const normalizedTasks = Array.isArray(data)
                    ? data.map(normalizeTask)
                    : []

                setTasks(normalizedTasks)
            } catch (err) {
                if (!isMounted) return

                setError(
                    err instanceof Error
                        ? err.message
                        : 'Impossible de charger les tâches.'
                )
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        fetchTasks()

        return () => {
            isMounted = false
        }
    }, [])

    const totalPoints = useMemo(() => {
        return tasks.reduce((sum, task) => sum + (task.points ?? 0), 0)
    }, [tasks])

    const completedCount = useMemo(() => {
        return tasks.filter((task) => task.completed).length
    }, [tasks])

    if (isLoading) {
        return (
            <section>
                <h1>Accueil</h1>
                <p>Chargement des tâches…</p>
            </section>
        )
    }

    if (error) {
        return (
            <section>
                <h1>Accueil</h1>
                <p>Erreur : {error}</p>
            </section>
        )
    }

    return (
        <section>
            <h1>Accueil</h1>
            <p>
                {tasks.length} tâche{tasks.length > 1 ? 's' : ''} • {completedCount}{' '}
                complétée{completedCount > 1 ? 's' : ''} • {totalPoints} points
            </p>

            {tasks.length === 0 ? (
                <p>Aucune tâche disponible.</p>
            ) : (
                <ul>
                    {tasks.map((task) => (
                        <li key={task.id}>
                            <h2>{task.title}</h2>
                            <p>{task.description || 'Sans description'}</p>
                            <p>
                                Fréquence : {task.frequency} • Points : {task.points}
                            </p>
                            <p>
                                Assigné à : {task.assignee || 'Non assigné'} • Échéance :{' '}
                                {task.dueLabel || '—'}
                            </p>
                            <p>
                                NFC : {task.needsNfc ? 'Oui' : 'Non'} • Statut :{' '}
                                {task.completed ? 'Terminée' : 'À faire'}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}