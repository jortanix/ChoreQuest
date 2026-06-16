import { useContext, useMemo, useState } from 'react'
import { TasksContext } from '../context/TasksContext'

export function HomeScreen() {
    const tasksContext = useContext(TasksContext)

    const [actionError, setActionError] = useState<string | null>(null)
    const [pendingTaskId, setPendingTaskId] = useState<string | null>(null)

    if (!tasksContext) {
        return (
            <section className="screen home-screen">
                <div className="home-header">
                    <div>
                        <span className="eyebrow">Maison</span>
                        <h1>Accueil</h1>
                        <p className="home-subtitle">Vue d’ensemble des tâches</p>
                    </div>
                </div>

                <div className="screen-state-card">
                    <p>Contexte des tâches indisponible.</p>
                </div>
            </section>
        )
    }

    const {
        taskList,
        completeTaskById,
        linkNfcTagToTask,
        getNfcBindingByTaskId,
    } = tasksContext

    const totalPoints = useMemo(() => {
        return taskList.reduce((sum, task) => sum + (task.points ?? 0), 0)
    }, [taskList])

    const completedCount = useMemo(() => {
        return taskList.filter((task) => task.completed).length
    }, [taskList])

    const pendingTasks = useMemo(() => {
        return taskList.filter((task) => !task.completed)
    }, [taskList])

    const completedTasks = useMemo(() => {
        return taskList.filter((task) => task.completed)
    }, [taskList])

    const completionRate = useMemo(() => {
        if (taskList.length === 0) return 0
        return Math.round((completedCount / taskList.length) * 100)
    }, [completedCount, taskList.length])

    const featuredTask = useMemo(() => {
        return pendingTasks[0] ?? null
    }, [pendingTasks])

    const secondaryPendingTasks = useMemo(() => {
        return pendingTasks.slice(1)
    }, [pendingTasks])

    const completedPoints = useMemo(() => {
        return completedTasks.reduce((sum, task) => sum + (task.points ?? 0), 0)
    }, [completedTasks])

    const monthlyGoal = useMemo(() => {
        return Math.max(1500, Math.ceil(totalPoints / 250) * 250)
    }, [totalPoints])

    const monthlyProgress = useMemo(() => {
        if (monthlyGoal === 0) return 0
        return Math.min(100, Math.round((completedPoints / monthlyGoal) * 100))
    }, [completedPoints, monthlyGoal])

    const overdueCount = useMemo(() => {
        return pendingTasks.filter((task) => {
            const due = (task.dueLabel || '').toLowerCase()
            return due.includes('retard') || due.includes('hier')
        }).length
    }, [pendingTasks])

    const todayLabel = useMemo(() => {
        return new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        }).format(new Date())
    }, [])

    const handleCompleteTask = async (taskId: string) => {
        try {
            setActionError(null)
            setPendingTaskId(taskId)
            await completeTaskById(taskId)
        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : 'Impossible de compléter la tâche.'
            )
        } finally {
            setPendingTaskId(null)
        }
    }

    const handleLinkNfc = async (taskId: string) => {
        const tagId = window.prompt('Identifiant du badge NFC :')

        if (!tagId || !tagId.trim()) {
            return
        }

        const tagLabel = window.prompt('Nom du badge NFC (optionnel) :') ?? ''

        try {
            setActionError(null)
            setPendingTaskId(taskId)
            await linkNfcTagToTask(taskId, tagId.trim(), tagLabel.trim())
        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : 'Impossible de lier le badge NFC.'
            )
        } finally {
            setPendingTaskId(null)
        }
    }

    const renderTaskCard = (
        taskId: string,
        variant: 'default' | 'compact' = 'default'
    ) => {
        const task = taskList.find((item) => item.id === taskId)

        if (!task) return null

        const binding = getNfcBindingByTaskId(task.id)
        const isPending = pendingTaskId === task.id
        const isCompleted = task.completed

        return (
            <article
                key={task.id}
                className={`task-card ${variant === 'compact' ? 'task-card-compact' : ''}`}
            >
                <div className="task-top">
                    <div>
                        <h3 className="task-title">{task.title}</h3>
                        <p className="task-meta">
                            {task.description || 'Sans description'}
                        </p>
                    </div>

                    <span className={`badge ${isCompleted ? 'pet' : 'alert'}`}>
                        {isCompleted ? 'Terminée' : 'À faire'}
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

                <div className="pill-row">
                    <span className="pill">
                        Assigné à : {task.assignee || 'Non assigné'}
                    </span>
                    <span className="pill">
                        Échéance : {task.dueLabel || '—'}
                    </span>
                </div>

                {binding ? (
                    <div className="pill-row">
                        <span className="pill">
                            Badge lié : {binding.tagLabel?.trim() || binding.tagId}
                        </span>
                    </div>
                ) : null}

                <div className="task-actions">
                    {isCompleted ? (
                        <button
                            className="btn btn-primary"
                            type="button"
                            disabled
                        >
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

    return (
        <section className="screen home-screen">
            <div className="home-header">
                <div>
                    <span className="eyebrow">Aujourd’hui · {todayLabel}</span>
                    <h1>Accueil</h1>
                    <p className="home-subtitle">
                        {pendingTasks.length > 0
                            ? `${pendingTasks.length} tâche${
                                  pendingTasks.length > 1 ? 's' : ''
                              } à terminer`
                            : 'Tout est à jour pour le moment'}
                    </p>
                </div>
            </div>

            <section className="home-section">
                <article className="monthly-goal-card">
                    <div className="monthly-goal-top">
                        <span className="monthly-goal-chip">
                            ♡ Objectif mensuel de mai
                        </span>

                        <div className="monthly-goal-icon">🐾</div>
                    </div>

                    <div className="monthly-goal-copy">
                        <h2>Rendre la maison cute, propre et à jour.</h2>
                        <p>
                            Chaque tâche complétée fait avancer la jauge du mois,
                            nourrit le streak d’équipe et débloque des récompenses.
                        </p>
                    </div>

                    <div className="monthly-goal-progress-head">
                        <div>
                            <span className="monthly-goal-label">
                                Progression d’équipe
                            </span>
                            <strong>
                                {completedPoints} / {monthlyGoal}
                            </strong>
                        </div>

                        <span className="monthly-goal-pill">
                            {monthlyProgress}% rempli
                        </span>
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

                    <div className="monthly-goal-stats">
                        <article className="monthly-mini-card">
                            <strong>{completedCount}</strong>
                            <span>streak d’équipe</span>
                        </article>

                        <article className="monthly-mini-card">
                            <strong>{pendingTasks.length}</strong>
                            <span>tâches du jour</span>
                        </article>

                        <article className="monthly-mini-card">
                            <strong>{overdueCount}</strong>
                            <span>retards à corriger</span>
                        </article>
                    </div>
                </article>
            </section>

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

            {featuredTask ? (
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
                            <span className="pill">
                                {featuredTask.frequency || 'Fréquence non définie'}
                            </span>
                            <span className="pill">
                                {featuredTask.points ?? 0} points
                            </span>
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

                        {getNfcBindingByTaskId(featuredTask.id) ? (
                            <div className="pill-row">
                                <span className="pill">
                                    Badge lié :{' '}
                                    {getNfcBindingByTaskId(featuredTask.id)
                                        ?.tagLabel?.trim() ||
                                        getNfcBindingByTaskId(featuredTask.id)?.tagId}
                                </span>
                            </div>
                        ) : null}

                        <div className="task-actions">
                            <button
                                className="btn btn-primary"
                                type="button"
                                onClick={() => void handleCompleteTask(featuredTask.id)}
                                disabled={pendingTaskId === featuredTask.id}
                            >
                                {pendingTaskId === featuredTask.id
                                    ? 'Traitement…'
                                    : 'Compléter'}
                            </button>

                            <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={() => void handleLinkNfc(featuredTask.id)}
                                disabled={pendingTaskId === featuredTask.id}
                            >
                                {getNfcBindingByTaskId(featuredTask.id)
                                    ? 'Modifier NFC'
                                    : 'Lier NFC'}
                            </button>
                        </div>
                    </article>
                </section>
            ) : null}

            {actionError ? (
                <div className="screen-state-card">
                    <p>Erreur : {actionError}</p>
                </div>
            ) : null}

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
                        {secondaryPendingTasks.map((task) =>
                            renderTaskCard(task.id, 'compact')
                        )}
                    </div>
                )}
            </section>

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
                        {completedTasks.map((task) =>
                            renderTaskCard(task.id, 'compact')
                        )}
                    </div>
                )}
            </section>

            <section className="home-section">
                <div className="section-head">
                    <h2>Vue d’ensemble</h2>
                </div>

                <div className="card home-summary-card">
                    <p>
                        {completedCount} tâche{completedCount > 1 ? 's' : ''}{' '}
                        complétée{completedCount > 1 ? 's' : ''} sur {taskList.length},
                        pour un total de {totalPoints} points et une progression de{' '}
                        {completionRate}%.
                    </p>
                </div>
            </section>
        </section>
    )
}