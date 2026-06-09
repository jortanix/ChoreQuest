import { useMemo } from 'react'
import { useTasks } from '../context/useTasks'

function ActivityScreen() {
    const { completionHistory } = useTasks()

    const recentEvents = useMemo(() => {
        return [...completionHistory]
            .sort(
                (a, b) =>
                    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
            )
            .slice(0, 20)
    }, [completionHistory])

    const totalPoints = useMemo(() => {
        return completionHistory.reduce((sum, event) => sum + event.points, 0)
    }, [completionHistory])

    const nfcCount = useMemo(() => {
        return completionHistory.filter((event) => event.needsNfc).length
    }, [completionHistory])

    const getEventIcon = (needsNfc?: boolean) => {
        return needsNfc ? '📶' : '✅'
    }

    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString)

        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date)
    }

    return (
        <section className="screen active">
            <div className="card hero">
                <div className="eyebrow">🕘 Activité récente</div>

                <div className="hero-top">
                    <div>
                        <h1 className="hero-title">Tout ce qui vient d’être validé.</h1>
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
                                    Valide une première tâche pour voir apparaître l’historique ici.
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
                                        {getEventIcon(event.needsNfc)} {event.taskTitle}
                                    </h3>
                                    <p className="task-meta">
                                        {event.assignee} a validé cette tâche · {formatEventDate(event.completedAt)}
                                    </p>
                                </div>
                                <span className={event.needsNfc ? 'badge nfc' : 'badge pet'}>
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

export default ActivityScreen