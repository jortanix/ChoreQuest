import { useContext, useMemo, useState } from "react"
import { TasksContext } from "../context/TasksContext"
import { useHomeDashboard } from "../hooks/useHomeDashboard"
import { api } from "../lib/api"
import { useTasks } from "../context/useTasks"

// ─── Types ────────────────────────────────────────────────────────────────────

type HomeTab = "tasks" | "activity" | "stats"

// ─── Onglet Activité ──────────────────────────────────────────────────────────

function ActivityTab() {
    const { completionHistory } = useTasks()

    const recentEvents = useMemo(() => {
        return [...completionHistory]
            .sort((a, b) =>
                new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
            )
            .slice(0, 20)
    }, [completionHistory])

    const totalPoints = useMemo(() =>
        completionHistory.reduce((sum, e) => sum + e.points, 0),
        [completionHistory]
    )

    const nfcCount = useMemo(() =>
        completionHistory.filter((e) => e.needsNfc).length,
        [completionHistory]
    )

    const formatEventDate = (dateString: string) =>
        new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit", month: "2-digit",
            hour: "2-digit", minute: "2-digit",
        }).format(new Date(dateString))

    return (
        <section className="screen active">
            <div className="card hero">
                <div className="eyebrow">🕘 Activité récente</div>
                <div className="hero-top">
                    <div>
                        <h1 className="hero-title">Tout ce qui vient d"être validé.</h1>
                        <p className="hero-sub">
                            Le feed affiche les dernières validations de tâches, les points
                            gagnés et les actions NFC les plus récentes.
                        </p>
                    </div>
                    <div className="mascot">📜</div>
                </div>
                <div className="stats">
                    <div className="stat">
                        <strong>{completionHistory.length}</strong>
                        <span>actions totales</span>
                    </div>
                    <div className="stat">
                        <strong>{totalPoints}</strong>
                        <span>points gagnés</span>
                    </div>
                    <div className="stat">
                        <strong>{nfcCount}</strong>
                        <span>scans NFC</span>
                    </div>
                </div>
            </div>

            <div className="section-head">
                <h2>Dernières actions</h2>
                <button className="ghost">{recentEvents.length} événements</button>
            </div>

            {recentEvents.length === 0 ? (
                <div className="task-list">
                    <article className="task-card">
                        <div className="task-top">
                            <div>
                                <h3 className="task-title">Aucune activité pour le moment</h3>
                                <p className="task-meta">
                                    Valide une première tâche pour voir apparaître l"historique ici.
                                </p>
                            </div>
                            <span className="badge nfc">Nouveau</span>
                        </div>
                    </article>
                </div>
            ) : (
                <div className="task-list">
                    {recentEvents.map((event) => (
                        <article className="task-card" key={event.id}>
                            <div className="task-top">
                                <div>
                                    <h3 className="task-title">
                                        {event.needsNfc ? "📶" : "✅"} {event.taskTitle}
                                    </h3>
                                    <p className="task-meta">
                                        {event.assignee} a validé cette tâche · {formatEventDate(event.completedAt)}
                                    </p>
                                </div>
                                <span className={event.needsNfc ? "badge nfc" : "badge pet"}>
                                    +{event.points} pts
                                </span>
                            </div>
                            <div className="row-badges">
                                <span className="pill">{event.assignee}</span>
                                <span className="pill">{event.frequency}</span>
                                {event.needsNfc && <span className="pill">scan NFC</span>}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}

// ─── Onglet Stats ─────────────────────────────────────────────────────────────

function isThisWeek(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffToMonday = now.getDay() === 0 ? 6 : now.getDay() - 1
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - diffToMonday)
    startOfWeek.setHours(0, 0, 0, 0)
    return date >= startOfWeek
}

function StatsTab() {
    const { completionHistory } = useTasks()

    const totalPoints = useMemo(() =>
        completionHistory.reduce((sum, e) => sum + e.points, 0),
        [completionHistory]
    )
    const weeklyEvents = useMemo(() =>
        completionHistory.filter((e) => isThisWeek(e.completedAt)),
        [completionHistory]
    )
    const weeklyPoints = useMemo(() =>
        weeklyEvents.reduce((sum, e) => sum + e.points, 0),
        [weeklyEvents]
    )
    const nfcCount = useMemo(() =>
        completionHistory.filter((e) => e.needsNfc).length,
        [completionHistory]
    )
    const topMember = useMemo(() => {
        const map = new Map<string, number>()
        completionHistory.forEach((e) => map.set(e.assignee, (map.get(e.assignee) ?? 0) + e.points))
        return Array.from(map.entries()).sort((a, b) => b[1] - a[1])[0] ?? null
    }, [completionHistory])

    const topTask = useMemo(() => {
        const map = new Map<string, number>()
        completionHistory.forEach((e) => map.set(e.taskTitle, (map.get(e.taskTitle) ?? 0) + 1))
        return Array.from(map.entries()).sort((a, b) => b[1] - a[1])[0] ?? null
    }, [completionHistory])

    const averagePointsPerAction = useMemo(() =>
        completionHistory.length === 0 ? 0 : Math.round(totalPoints / completionHistory.length),
        [completionHistory, totalPoints]
    )
    const recentDayCount = useMemo(() =>
        new Set(completionHistory.map((e) => e.completedAt.slice(0, 10))).size,
        [completionHistory]
    )

    if (completionHistory.length === 0) {
        return (
            <section className="screen active">
                <div className="card hero">
                    <div className="eyebrow">📊 Statistiques</div>
                    <div className="hero-top">
                        <div>
                            <h1 className="hero-title">Pas encore de stats à afficher.</h1>
                            <p className="hero-sub">
                                Valide quelques tâches pour débloquer les points, les tendances
                                et les premières métriques de progression.
                            </p>
                        </div>
                        <div className="mascot">📈</div>
                    </div>
                    <div className="row-badges">
                        <span className="badge nfc">Commence par une validation</span>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="screen active">
            <div className="card hero">
                <div className="eyebrow">📊 Statistiques</div>
                <div className="hero-top">
                    <div>
                        <h1 className="hero-title">La progression du foyer en chiffres.</h1>
                        <p className="hero-sub">
                            Cet écran résume les points, l"activité récente et les meilleures
                            performances de la maison.
                        </p>
                    </div>
                    <div className="mascot">✨</div>
                </div>
                <div className="stats">
                    <div className="stat"><strong>{totalPoints}</strong><span>points cumulés</span></div>
                    <div className="stat"><strong>{completionHistory.length}</strong><span>actions totales</span></div>
                    <div className="stat"><strong>{weeklyPoints}</strong><span>points cette semaine</span></div>
                    <div className="stat"><strong>{nfcCount}</strong><span>scans NFC</span></div>
                </div>
            </div>

            <div className="section-head">
                <h2>Insights</h2>
                <button className="ghost">Vue synthèse</button>
            </div>

            <div className="task-list">
                <article className="task-card">
                    <div className="task-top">
                        <div>
                            <h3 className="task-title">Membre le plus actif</h3>
                            <p className="task-meta">
                                {topMember
                                    ? `${topMember[0]} mène avec ${topMember[1]} points.`
                                    : "Pas encore de leader."}
                            </p>
                        </div>
                        <span className="badge pet">👑</span>
                    </div>
                </article>

                <article className="task-card">
                    <div className="task-top">
                        <div>
                            <h3 className="task-title">Tâche la plus répétée</h3>
                            <p className="task-meta">
                                {topTask
                                    ? `${topTask[0]} a été validée ${topTask[1]} fois.`
                                    : "Pas encore de tâche dominante."}
                            </p>
                        </div>
                        <span className="badge nfc">🔁</span>
                    </div>
                </article>

                <article className="task-card">
                    <div className="task-top">
                        <div>
                            <h3 className="task-title">Rythme moyen</h3>
                            <p className="task-meta">
                                {averagePointsPerAction} points gagnés en moyenne par validation.
                            </p>
                        </div>
                        <span className="badge">⚡</span>
                    </div>
                </article>

                <article className="task-card">
                    <div className="task-top">
                        <div>
                            <h3 className="task-title">Jours actifs</h3>
                            <p className="task-meta">
                                L"historique couvre {recentDayCount} jour(s) avec au moins une action validée.
                            </p>
                        </div>
                        <span className="badge pet">🗓️</span>
                    </div>
                </article>
            </div>

            <div className="section-head">
                <h2>Semaine en cours</h2>
                <button className="ghost">{weeklyEvents.length} validations</button>
            </div>

            <div className="task-list">
                <article className="task-card">
                    <div className="task-top">
                        <div>
                            <h3 className="task-title">Volume hebdomadaire</h3>
                            <p className="task-meta">
                                {weeklyEvents.length} tâche(s) validée(s) cette semaine pour {weeklyPoints} points.
                            </p>
                        </div>
                        <span className="badge nfc">📆</span>
                    </div>
                </article>
            </div>
        </section>
    )
}

// ─── Onglet Tâches (contenu original de HomeScreen) ───────────────────────────

function TasksTab() {
    const tasksContext = useContext(TasksContext)
    const [actionError, setActionError] = useState<string | null>(null)
    const [pendingTaskId, setPendingTaskId] = useState<string | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const { data: dash, loading: dashLoading, error: dashError } = useHomeDashboard(refreshKey)

    const todayLabel = useMemo(() =>
        new Intl.DateTimeFormat("fr-FR", {
            weekday: "long", day: "numeric", month: "long",
        }).format(new Date()),
        []
    )

    if (!tasksContext) {
        return (
            <div className="screen-state-card">
                <p>Contexte des tâches indisponible.</p>
            </div>
        )
    }

    const { taskList, linkNfcTagToTask, getNfcBindingByTaskId } = tasksContext

    const pendingTasks          = useMemo(() => taskList.filter((t) => !t.completed), [taskList])
    const completedTasks        = useMemo(() => taskList.filter((t) => t.completed),  [taskList])
    const featuredTask          = useMemo(() => pendingTasks[0] ?? null,               [pendingTasks])
    const secondaryPendingTasks = useMemo(() => pendingTasks.slice(1),                 [pendingTasks])

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

    const handleCompleteTask = async (taskId: string) => {
        try {
            setActionError(null)
            setPendingTaskId(taskId)
            const today = new Date().toISOString().slice(0, 10)
            await api.completeTask(taskId, today)
            setRefreshKey((k) => k + 1)
        } catch (error) {
            setActionError(error instanceof Error ? error.message : "Impossible de compléter la tâche.")
        } finally {
            setPendingTaskId(null)
        }
    }

    const handleLinkNfc = async (taskId: string) => {
        const tagId = window.prompt("Identifiant du badge NFC :")
        if (!tagId?.trim()) return
        const tagLabel = window.prompt("Nom du badge NFC (optionnel) :") ?? ""
        try {
            setActionError(null)
            setPendingTaskId(taskId)
            await linkNfcTagToTask(taskId, tagId.trim(), tagLabel.trim())
        } catch (error) {
            setActionError(error instanceof Error ? error.message : "Impossible de lier le badge NFC.")
        } finally {
            setPendingTaskId(null)
        }
    }

    const renderTaskCard = (taskId: string, variant: "default" | "compact" = "default") => {
        const task = taskList.find((item) => item.id === taskId)
        if (!task) return null
        const binding    = getNfcBindingByTaskId(task.id)
        const isPending  = pendingTaskId === task.id
        const isCompleted = task.completed

        return (
            <article
                key={task.id}
                className={`task-card ${variant === "compact" ? "task-card-compact" : ""}`}
            >
                <div className="task-top">
                    <div>
                        <h3 className="task-title">{task.title}</h3>
                        <p className="task-meta">{task.description || "Sans description"}</p>
                    </div>
                    <span className={`badge ${isCompleted ? "pet" : "alert"}`}>
                        {isCompleted ? "Terminée" : "À faire"}
                    </span>
                </div>
                <div className="row-badges">
                    <span className="pill">{task.frequency || "Fréquence non définie"}</span>
                    <span className="pill">{task.points ?? 0} points</span>
                    <span className="badge nfc">NFC : {task.needsNfc ? "Oui" : "Non"}</span>
                </div>
                <div className="pill-row">
                    <span className="pill">Assigné à : {task.assignee || "Non assigné"}</span>
                    <span className="pill">Échéance : {task.dueLabel || "—"}</span>
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
                            {isPending ? "Traitement…" : "Compléter"}
                        </button>
                    )}
                    <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => void handleLinkNfc(task.id)}
                        disabled={isPending}
                    >
                        {binding ? "Modifier NFC" : "Lier NFC"}
                    </button>
                </div>
            </article>
        )
    }

    return (
        <section className="screen home-screen">
            <div className="home-header">
                <div>
                    <span className="eyebrow">Aujourd"hui · {todayLabel}</span>
                    <h1>Accueil</h1>
                    <p className="home-subtitle">
                        {pendingTasks.length > 0
                            ? `${pendingTasks.length} tâche${pendingTasks.length > 1 ? "s" : ""} à terminer`
                            : "Tout est à jour pour le moment"}
                    </p>
                </div>
            </div>

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
                            nourrit le streak d"équipe et débloque des récompenses.
                        </p>
                    </div>
                    <div className="monthly-goal-progress-head">
                        <div>
                            <span className="monthly-goal-label">Progression d"équipe</span>
                            {dashLoading
                                ? <strong className="skeleton skeleton-text" style={{ width: 80 }} />
                                : <strong>{completedCount} / {monthlyGoal}</strong>
                            }
                        </div>
                        <span className="monthly-goal-pill">{monthlyProgress}% rempli</span>
                    </div>
                    <div className="monthly-goal-bar" aria-label={`Progression mensuelle ${monthlyProgress}%`}>
                        <div className="monthly-goal-bar-fill" style={{ width: `${monthlyProgress}%` }}>
                            <span className="monthly-goal-bar-dot">♡</span>
                        </div>
                    </div>
                    <div className="monthly-goal-stats">
                        <article className="monthly-mini-card">
                            {dashLoading
                                ? <span className="skeleton skeleton-text" style={{ width: 32, height: 28 }} />
                                : <strong>{streakDays}</strong>
                            }
                            <span>streak d"équipe</span>
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
                    {dashError && (
                        <p className="dashboard-error-hint">⚠ Stats indisponibles ({dashError})</p>
                    )}
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
                                <p className="task-meta">{featuredTask.description || "Sans description"}</p>
                            </div>
                            <span className="badge alert">À faire</span>
                        </div>
                        <div className="row-badges">
                            <span className="pill">{featuredTask.frequency || "Fréquence non définie"}</span>
                            <span className="pill">{featuredTask.points ?? 0} points</span>
                            <span className="badge nfc">NFC : {featuredTask.needsNfc ? "Oui" : "Non"}</span>
                        </div>
                        <div className="pill-row">
                            <span className="pill">Assigné à : {featuredTask.assignee || "Non assigné"}</span>
                            <span className="pill">Échéance : {featuredTask.dueLabel || "—"}</span>
                        </div>
                        {getNfcBindingByTaskId(featuredTask.id) && (
                            <div className="pill-row">
                                <span className="pill">
                                    Badge lié :{" "}
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
                                {pendingTaskId === featuredTask.id ? "Traitement…" : "Compléter"}
                            </button>
                            <button
                                className="btn btn-secondary"
                                type="button"
                                onClick={() => void handleLinkNfc(featuredTask.id)}
                                disabled={pendingTaskId === featuredTask.id}
                            >
                                {getNfcBindingByTaskId(featuredTask.id) ? "Modifier NFC" : "Lier NFC"}
                            </button>
                        </div>
                    </article>
                </section>
            )}

            {actionError && (
                <div className="screen-state-card">
                    <p>Erreur : {actionError}</p>
                </div>
            )}

            <section className="home-section">
                <div className="section-head">
                    <h2>À faire ensuite</h2>
                    <p>Les prochaines tâches du foyer</p>
                </div>
                {secondaryPendingTasks.length === 0 ? (
                    <div className="card">
                        <p>{featuredTask
                            ? "La tâche mise en avant est la seule priorité restante."
                            : "Aucune tâche en attente."}</p>
                    </div>
                ) : (
                    <div className="task-list">
                        {secondaryPendingTasks.map((task) => renderTaskCard(task.id, "compact"))}
                    </div>
                )}
            </section>

            <section className="home-section">
                <div className="section-head">
                    <h2>Déjà fait</h2>
                    <p>Ce qui a déjà été validé</p>
                </div>
                {completedTasks.length === 0 ? (
                    <div className="card"><p>Aucune tâche effectuée pour le moment.</p></div>
                ) : (
                    <div className="task-list">
                        {completedTasks.map((task) => renderTaskCard(task.id, "compact"))}
                    </div>
                )}
            </section>

            <section className="home-section">
                <div className="section-head"><h2>Vue d"ensemble</h2></div>
                <div className="card home-summary-card">
                    <p>
                        {completedCount} tâche{completedCount > 1 ? "s" : ""} complétée
                        {completedCount > 1 ? "s" : ""} sur {taskList.length}, pour une
                        progression de {completionRate}%.
                        {streakDays > 0 && ` Streak actuel : ${streakDays} jour${streakDays > 1 ? "s" : ""}.`}
                    </p>
                </div>
            </section>
        </section>
    )
}

// ─── HomeScreen principal ─────────────────────────────────────────────────────

export function HomeScreen() {
    const [tab, setTab] = useState<HomeTab>("tasks")

    return (
        <div className="screen">
            <div className="tab-switcher" role="tablist">
                <button
                    role="tab"
                    aria-selected={tab === "tasks"}
                    className={tab === "tasks" ? "active" : ""}
                    onClick={() => setTab("tasks")}
                >
                    🏠 Tâches
                </button>
                <button
                    role="tab"
                    aria-selected={tab === "activity"}
                    className={tab === "activity" ? "active" : ""}
                    onClick={() => setTab("activity")}
                >
                    🕘 Activité
                </button>
                <button
                    role="tab"
                    aria-selected={tab === "stats"}
                    className={tab === "stats" ? "active" : ""}
                    onClick={() => setTab("stats")}
                >
                    📊 Stats
                </button>
            </div>

            {tab === "tasks"    && <TasksTab />}
            {tab === "activity" && <ActivityTab />}
            {tab === "stats"    && <StatsTab />}
        </div>
    )
}