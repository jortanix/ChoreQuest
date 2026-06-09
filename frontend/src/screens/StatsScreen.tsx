import { useMemo } from 'react'
import { useTasks } from '../context/useTasks'

function isThisWeek(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()

    const day = now.getDay()
    const diffToMonday = day === 0 ? 6 : day - 1

    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - diffToMonday)
    startOfWeek.setHours(0, 0, 0, 0)

    return date >= startOfWeek
}

function StatsScreen() {
    const { completionHistory } = useTasks()

    const totalPoints = useMemo(() => {
        return completionHistory.reduce((sum, event) => sum + event.points, 0)
    }, [completionHistory])

    const weeklyEvents = useMemo(() => {
        return completionHistory.filter((event) => isThisWeek(event.completedAt))
    }, [completionHistory])

    const weeklyPoints = useMemo(() => {
        return weeklyEvents.reduce((sum, event) => sum + event.points, 0)
    }, [weeklyEvents])

    const nfcCount = useMemo(() => {
        return completionHistory.filter((event) => event.needsNfc).length
    }, [completionHistory])

    const topMember = useMemo(() => {
        const memberPoints = new Map<string, number>()

        completionHistory.forEach((event) => {
            memberPoints.set(
                event.assignee,
                (memberPoints.get(event.assignee) ?? 0) + event.points
            )
        })

        return Array.from(memberPoints.entries())
            .sort((a, b) => b[1] - a[1])[0] ?? null
    }, [completionHistory])

    const topTask = useMemo(() => {
        const taskCounts = new Map<string, number>()

        completionHistory.forEach((event) => {
            taskCounts.set(
                event.taskTitle,
                (taskCounts.get(event.taskTitle) ?? 0) + 1
            )
        })

        return Array.from(taskCounts.entries())
            .sort((a, b) => b[1] - a[1])[0] ?? null
    }, [completionHistory])

    const averagePointsPerAction = useMemo(() => {
        if (completionHistory.length === 0) return 0
        return Math.round(totalPoints / completionHistory.length)
    }, [completionHistory, totalPoints])

    const recentDayCount = useMemo(() => {
        const uniqueDays = new Set(
            completionHistory.map((event) => event.completedAt.slice(0, 10))
        )
        return uniqueDays.size
    }, [completionHistory])

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
                            Cet écran résume les points, l’activité récente et les meilleures
                            performances de la maison.
                        </p>
                    </div>
                    <div className="mascot">✨</div>
                </div>

                <div className="stats">
                    <div className="stat">
                        <strong>{totalPoints}</strong>
                        <span>points cumulés</span>
                    </div>
                    <div className="stat">
                        <strong>{completionHistory.length}</strong>
                        <span>actions totales</span>
                    </div>
                    <div className="stat">
                        <strong>{weeklyPoints}</strong>
                        <span>points cette semaine</span>
                    </div>
                    <div className="stat">
                        <strong>{nfcCount}</strong>
                        <span>scans NFC</span>
                    </div>
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
                                {topMember ? `${topMember[0]} mène avec ${topMember[1]} points.` : 'Pas encore de leader.'}
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
                                {topTask ? `${topTask[0]} a été validée ${topTask[1]} fois.` : 'Pas encore de tâche dominante.'}
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
                                L’historique couvre {recentDayCount} jour(s) avec au moins une action validée.
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

export default StatsScreen