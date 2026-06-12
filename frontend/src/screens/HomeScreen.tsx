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
            <section className="screen home-screen">
                <div className="section-head">
                    <h1>Accueil</h1>
                </div>
                <div className="card">
                    <p>Chargement des tâches…</p>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="screen home-screen">
                <div className="section-head">
                    <h1>Accueil</h1>
                </div>
                <div className="card">
                    <p>Erreur : {error}</p>
                </div>
            </section>
        )
    }

    return (
        <section className="screen home-screen">
            <div className="section-head">
                <h1>Accueil</h1>
            </div>

            <div className="home-metrics">
                <div className="metric-card">
                    <span className="metric-label">Tâches</span>
                    <strong>{tasks.length}</strong>
                </div>
                <div className="metric-card">
                    <span className="metric-label">Complétées</span>
                    <strong>{completedCount}</strong>
                </div>
                <div className="metric-card">
                    <span className="metric-label">Points</span>
                    <strong>{totalPoints}</strong>
                </div>
            </div>

            {tasks.length === 0 ? (
                <div className="card">
                    <p>Aucune tâche disponible.</p>
                </div>
            ) : (
                <div className="task-list">
                    {tasks.map((task) => (
                        <article key={task.id} className="task-card">
                            <div className="task-top">
                                <div>
                                    <h2 className="task-title">{task.title}</h2>
                                    <p className="task-meta">
                                        {task.description || 'Sans description'}
                                    </p>
                                </div>

                                <span
                                    className={`badge ${
                                        task.completed ? 'pet' : 'alert'
                                    }`}
                                >
                                    {task.completed ? 'Terminée' : 'À faire'}
                                </span>
                            </div>

                            <div className="row-badges">
                                <span className="pill">
                                    {task.frequency || 'Fréquence non définie'}
                                </span>
                                <span className="pill">{task.points ?? 0} points</span>
                                <span className="badge nfc">
                                    NFC : {task.needsNfc ? 'Oui' : 'Non'}
                                </span>
                            </div>

                            <div className="task-actions">
                                <button className="btn btn-primary" type="button">
                                    Ouvrir
                                </button>
                                <button className="btn btn-secondary" type="button">
                                    Assigner
                                </button>
                            </div>

                            <div className="pill-row">
                                <span className="pill">
                                    Assigné à : {task.assignee || 'Non assigné'}
                                </span>
                                <span className="pill">
                                    Échéance : {task.dueLabel || '—'}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}