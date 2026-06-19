import { useContext, useMemo, useState } from 'react'
import { TasksContext } from '../context/TasksContext'
import { useHomeDashboard } from '../hooks/useHomeDashboard'
import { api } from '../lib/api'

export function HomeScreen() {
    const tasksContext = useContext(TasksContext)

    const [actionError, setActionError] = useState<string | null>(null)
    const [pendingTaskId, setPendingTaskId] = useState<string | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    // ─── Données backend ─────────────────────────────────────────────────────
    const { data: dash, loading: dashLoading, error: dashError } = useHomeDashboard(refreshKey)

    const todayLabel = useMemo(() => {
        return new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        }).format(new Date())
    }, [])

    // ─── Guard contexte ───────────────────────────────────────────────────────
    if (!tasksContext) {
        return (
            <section className="screen home-screen">
                <div className="home-header">
                    <div>
                        <span className="eyebrow">Maison</span>
                        <h1>Accueil</h1>
                        <p className="home-subtitle">Vue d'ensemble des tâches</p>
                    </div>
                </div>
                <div className="screen-state-card">
                    <p>Contexte des tâches indisponible.</p>
                </div>
            </section>
        )
    }

    const { taskList, linkNfcTagToTask, getNfcBindingByTaskId } = tasksContext

    // ─── Calculs locaux (conservés pour les listes de cartes) ─────────────────
    const pendingTasks = useMemo(() => taskList.filter((t) => !t.completed), [taskList])
    const completedTasks = useMemo(() => taskList.filter((t) => t.completed), [taskList])
    const featuredTask = useMemo(() => pendingTasks[0] ?? null, [pendingTasks])
    const secondaryPendingTasks = useMemo(() => pendingTasks.slice(1), [pendingTasks])

    // ─── Stats : backend en priorité, fallback local ───────────────────────────
    const completedCount  = dash?.monthlyGoal.completed  ?? completedTasks.length
    const monthlyGoal     = dash?.monthlyGoal.goal       ?? Math.max(taskList.length, 1)
    const monthlyProgress = dash?.monthlyGoal.percentage ?? 0
    const streakDays      = dash?.streakDays             ?? 0
    const todayDone       = dash?.todayDone              ?? 0
    const todayTotal      = dash?.todayTotal             ?? pendingTasks.length
    const overdueCount    = dash?.overdueCount           ?? 0
    const completionRate  = dash?.completionRate         ?? (
        taskList.length === 0 ? 0 : Math.round((completedTasks.length / taskList.length) * 100)
    )

    // ─── Actions ──────────────────────────────────────────────────────────────
    const handleCompleteTask = async (taskId: string) => {
        try {
            setActionError(null)
            setPendingTaskId(taskId)
            const today = new Date().toISOString().slice(0, 10)
            await api.completeTask(taskId, today)
            setRefreshKey((k) => k + 1) // re-fetch dashboard
        } catch (error) {
            setActionError(
                error instanceof Error ? error.message : 'Impossible de compléter la tâche.'
            )
        } finally {
            setPendingTaskId(null)
        }
    }

    const handleLinkNfc = async (taskId: string) => {
        const tagId = window.prompt('Identifiant du badge NFC :')
        if (!tagId?.trim()) return
        const tagLabel = window.prompt('Nom du badge NFC (optionnel) :') ?? ''

        try {
            setActionError(null)
            setPendingTaskId(taskId)
            await linkNfcTagToTask(taskId, tagId.trim(), tagLabel.trim())
        } catch (error) {
            setActionError(
                error instanceof Error ? error.message : 'Impossible de lier le badge NFC.'
            )
        } finally {
            setPendingTaskId(null)
        }
    }

    // ─── Composant carte tâche ────────────────────────────────────────────────
    const renderTaskCard = (taskId: string, variant: 'default' | 'compact' = 'default') => {
        const task = taskList.find((item) => item.id === taskId)
        if (!task) return null

        const binding    = getNfcBindingByTaskId(task.id)
        const isPending  = pendingTaskId === task.id
        const isCompleted = task.completed

        return (
            <article
                key={task.id}
                className={`task-card ${variant === 'compact' ? 'task-card-compact' : ''}`}
            >
                <div className="task-top">
                    <div>
                        <h3 className="task-title">{task.title}</h3>
                        <p className="task-meta">{task.description || 'Sans description'}</p>
                    </div>
                    <span className={`badge ${isCompleted ? 'pet' : 'alert'}`}>
                        {isCompleted ? 'Terminée' : 'À faire'}
                    </span>
                </div>

                <div className="row-badges">
                    <span className="pill">{task.frequency || 'Fréquence non définie'}</span>
                    <span className="pill">{task.points ?? 0} points</span>
                    <span className="badge nfc">NFC : {task.needsNfc ? 'Oui' : 'Non'}</span>
                </div>

                <div className="pill-row">
                    <span className="pill">Assigné à : {task.assignee || 'Non assigné'}</span>
                    <span className="pill">Échéance : {task.dueLabel || '—'}</span>
                </div>

                {binding && (
                    <div className="pill-row">
                        <span className="pill">
                            Badge lié : {binding.tagLabel?.trim() || binding.tagId}
                        </span>
                    </div>
                )}

                <div className="task-actions">
                    {isCompleted ? (
                        <button className="btn btn-primary" type="button" disabled>
                            Terminée
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            type="button"
                            onClick={() => void handleCompleteTask(task.id)}
                            disabled={isPending}
                        >
                            {isPending ? 'Traitement…' : 'Compléter'}
                        </button>
                    )}
                    <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => void handleLinkNfc(task.id)}
                        disabled={isPending}
                    >
                        {binding ? 'Modifier NFC' : 'Lier NFC'}
                    </button>
                </div>
            </article>
        )
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <section className="screen home-screen">

            {/* En-tête */}
            <div className="home-header">
                <div>
                    <span className="eyebrow">Aujourd'hui · {todayLabel}</span>
                    <h1>Accueil</h1>
                    <p className="home-subtitle">
                        {pendingTasks.length > 0
                            ? `${pendingTasks.length} tâche${pendingTasks.length > 1 ? 's' : ''} à terminer`
                            : 'Tout est à jour pour le moment'}
                    </p>
                </div>
            </div>

            {/* Bloc objectif mensuel */}
            <section className="home-section">
                <article className="monthly-goal-card">
                    <div className="monthly-goal-top">
                        <span className="monthly-goal-chip">♡ Objectif mensuel</span>
                        <div className="monthly-goal-icon">🐾</div>
                    </div>

                    <div className="monthly-goal-copy">
                        <h2>Rendre la maison cute, propre et à jour.</h2>
                        <p>
                            Chaque tâche complétée fait avancer la jauge du mois,
                            nourrit le streak d'équipe et débloque des récompenses.
                        </p>
                    </div>

                    <div className="monthly-goal-progress-head">
                        <div>
                            <span className="monthly-goal-label">Progression d'équipe</span>
                            {dashLoading ? (
                                <strong className="skeleton skeleton-text" style={{ width: 80 }} />
                            ) : (
                                <strong>{completedCount} / {monthlyGoal}</strong>
                            )}
                        </div>
                        <span className="monthly-goal-pill">{monthlyProgress}% rempli</span>
                    </div>

                    <div
                        className="monthly-goal-bar"
                        aria-label={`Progression mensuelle ${monthlyProgress}%`}
                    >
                        <div
                            className="monthly-goal-bar-fill"
                            style={{ width: `${monthlyProgress}%` }}
                        >
                            <span className="monthly-goal-bar-dot">♡</span>
                        </div>
                    </div>

                    {/* 3 mini-cartes de stats */}
                    <div className="monthly-goal-stats">
                        <article className="monthly-mini-card">
                            {dashLoading
                                ? <span className="skeleton skeleton-text" style={{ width: 32, height: 28 }} />
                                : <strong>{streakDays}</strong>
                            }
                            <span>streak d'équipe</span>
                        </article>

                        <article className="monthly-mini-card">
                            {dashLoading
                                ? <span className="skeleton skeleton-text" style={{ width: 32, height: 28 }} />
                                : <strong>{todayDone}/{todayTotal}</strong>
                            }
                            <span>tâches du jour</span>
                        </article>

                        <article className="monthly-mini-card">
                            {dashLoading
                                ? <span className="skeleton skeleton-text" style={{ width: 32, height: 28 }} />
                                : <strong>{overdueCount}</strong>
                            }
                            <span>retards à corriger</span>
                        </article>
                    </div>

                    {/* Erreur dashboard non bloquante */}
                    {dashError && (
                        <p className="dashboard-error-hint">
                            ⚠ Stats indisponibles ({dashError})
                        </p>
                    )}
                </article>
            </section>

            {/* Métriques rapides */}
            <section className="home-section">
                <div className="home-metrics">
                    <div className="metric-card">
                        <span className="metric-label">En cours</span>
                        <strong>{pendingTasks.length}</strong>
                    </div>
                    <div className="metric-card">
                        <span className="metric-label">Terminées</span>
                        <strong>{completedCount}</strong>
                    </div>
                    <div className="metric-card">
                        <span className="metric-label">Progression</span>
                        <strong>{completionRate}%</strong>
                    </div>
                </div>
            </section>

            {/* Focus du jour */}
            {featuredTask && (
                <section className="home-section">
                    <div className="section-head">
                        <h2>Focus du jour</h2>
                        <p>La priorité la plus utile à traiter maintenant</p>
                    </div>

                    <article className="task-card task-card-featured">
                        <div className="task-featured-glow" />

                        <div className="task-top">
                            <div>
                                <span className="task-kicker">Tâche prioritaire</span>
                                <h3 className="task-title">{featuredTask.title}</h3>
                                <p className="task-meta">
                                    {featuredTask.description || 'Sans description'}
                                </p>
                            </div>
                            <span className="badge alert">À faire</span>
                        </div>

                        <div className="row-badges">
                            <span className="pill">{featuredTask.frequency || 'Fréquence non définie'}</span>
                            <span className="pill">{featuredTask.points ?? 0} points</span>
                            <span className="badge nfc">
                                NFC : {featuredTask.needsNfc ? 'Oui' : 'Non'}
                            </span>
                        </div>

                        <div className="pill-row">
                            <span className="pill">
                                Assigné à : {featuredTask.assignee || 'Non assigné'}
                            </span>
                            <span className="pill">
                                Échéance : {featuredTask.dueLabel || '—'}
                            </span>
                        </div>

                        {getNfcBindingByTaskId(featuredTask.id) && (
                            <div className="pill-row">
                                <span className="pill">
                                    Badge lié :{' '}
                                    {getNfcBindingByTaskId(featuredTask.id)?.tagLabel?.trim() ||
                                        getNfcBindingByTaskId(featuredTask.id)?.tagId}
                                </span>
                            </div>
                        )}

                        <div className="task-actions">
                            <button
                                className="btn btn-primary"
                                type="button"
                                onClick={() => void handleCompleteTask(featuredTask.id)}
                                disabled={pendingTaskId === featuredTask.id}
                            >
                                {pendingTaskId === featuredTask.id ? 'Traitement…' : 'Compléter'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={() => void handleLinkNfc(featuredTask.id)}
                                disabled={pendingTaskId === featuredTask.id}
                            >
                                {getNfcBindingByTaskId(featuredTask.id) ? 'Modifier NFC' : 'Lier NFC'}
                            </button>
                        </div>
                    </article>
                </section>
            )}

            {/* Erreur action */}
            {actionError && (
                <div className="screen-state-card">
                    <p>Erreur : {actionError}</p>
                </div>
            )}

            {/* À faire ensuite */}
            <section className="home-section">
                <div className="section-head">
                    <h2>À faire ensuite</h2>
                    <p>Les prochaines tâches du foyer</p>
                </div>

                {secondaryPendingTasks.length === 0 ? (
                    <div className="card">
                        <p>
                            {featuredTask
                                ? 'La tâche mise en avant est la seule priorité restante.'
                                : 'Aucune tâche en attente.'}
                        </p>
                    </div>
                ) : (
                    <div className="task-list">
                        {secondaryPendingTasks.map((task) => renderTaskCard(task.id, 'compact'))}
                    </div>
                )}
            </section>

            {/* Déjà fait */}
            <section className="home-section">
                <div className="section-head">
                    <h2>Déjà fait</h2>
                    <p>Ce qui a déjà été validé</p>
                </div>

                {completedTasks.length === 0 ? (
                    <div className="card">
                        <p>Aucune tâche effectuée pour le moment.</p>
                    </div>
                ) : (
                    <div className="task-list">
                        {completedTasks.map((task) => renderTaskCard(task.id, 'compact'))}
                    </div>
                )}
            </section>

            {/* Vue d'ensemble */}
            <section className="home-section">
                <div className="section-head">
                    <h2>Vue d'ensemble</h2>
                </div>
                <div className="card home-summary-card">
                    <p>
                        {completedCount} tâche{completedCount > 1 ? 's' : ''} complétée
                        {completedCount > 1 ? 's' : ''} sur {taskList.length}, pour une
                        progression de {completionRate}%.
                        {streakDays > 0 && ` Streak actuel : ${streakDays} jour${streakDays > 1 ? 's' : ''}.`}
                    </p>
                </div>
            </section>

        </section>
    )
}