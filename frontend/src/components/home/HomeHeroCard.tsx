import type { ReactNode } from 'react'

export type HomeHeroNextBadge = {
    icon: ReactNode
    title: string
    description: string
    progressLabel: string
}

export interface HomeHeroCardProps {
    featuredCount: number
    overdueCount: number
    todayTasksCount: number
    weekTasksCount: number
    hotStreaksCount: number
    todayPoints: number
    bestLiveStreak: number
    unlockedBadgesCount: number
    totalBadgesCount: number
    nextBadge?: HomeHeroNextBadge
    onReset: () => void
}

export function HomeHeroCard({
                                 featuredCount,
                                 overdueCount,
                                 todayTasksCount,
                                 weekTasksCount,
                                 hotStreaksCount,
                                 todayPoints,
                                 bestLiveStreak,
                                 unlockedBadgesCount,
                                 totalBadgesCount,
                                 nextBadge,
                                 onReset,
                             }: HomeHeroCardProps) {
    return (
        <div className="card hero">
            <div className="eyebrow">❤ Routine intelligente</div>

            <div className="hero-top">
                <div>
                    <h1 className="hero-title">Tes quêtes maison sont prêtes.</h1>
                    <p className="hero-sub">
                        L’accueil met en avant les tâches du jour, les priorités de la
                        semaine, les urgences et les streaks à protéger.
                    </p>
                </div>

                <div className="mascot">🐾</div>
            </div>

            <div className="progress-wrap">
                <div className="split">
                    <div>
                        <div className="small muted">Focus actuel</div>
                        <div className="progress-number">{featuredCount} missions</div>
                    </div>

                    <span className="badge alert">{overdueCount} en retard</span>
                </div>

                <div className="progress-cute">
                    <span />
                </div>
            </div>

            <section className="daily-quest-card">
                <div className="daily-quest-top">
                    <div>
                        <p className="daily-quest-eyebrow">Quête du jour</p>

                        <h2 className="daily-quest-title">
                            {todayTasksCount > 0
                                ? `Compléter ${todayTasksCount} mission${todayTasksCount > 1 ? 's' : ''}`
                                : 'Journée calme, garde la cadence'}
                        </h2>

                        <p className="daily-quest-subtitle">
                            {todayPoints} pts gagnés aujourd’hui · Streak active max :{' '}
                            {bestLiveStreak}
                        </p>
                    </div>

                    <div className="daily-quest-badge" aria-hidden="true">
                        ✦
                    </div>
                </div>

                <div className="daily-quest-metrics">
                    <article className="daily-quest-metric">
                        <span className="daily-quest-metric-value">{todayPoints}</span>
                        <span className="daily-quest-metric-label">Points du jour</span>
                    </article>

                    <article className="daily-quest-metric">
                        <span className="daily-quest-metric-value">{bestLiveStreak}</span>
                        <span className="daily-quest-metric-label">
                            Meilleure streak active
                        </span>
                    </article>

                    <article className="daily-quest-metric">
                        <span className="daily-quest-metric-value">
                            {unlockedBadgesCount}/{totalBadgesCount}
                        </span>
                        <span className="daily-quest-metric-label">Badges débloqués</span>
                    </article>
                </div>

                {nextBadge && (
                    <div className="daily-quest-next">
                        <div className="daily-quest-next-icon" aria-hidden="true">
                            {nextBadge.icon}
                        </div>

                        <div className="daily-quest-next-copy">
                            <p className="daily-quest-next-label">Prochain badge</p>
                            <h3>{nextBadge.title}</h3>
                            <p>{nextBadge.description}</p>
                        </div>

                        <span className="daily-quest-next-progress">
                            {nextBadge.progressLabel}
                        </span>
                    </div>
                )}
            </section>

            <div className="stats">
                <div className="stat">
                    <strong>{todayTasksCount} ☀️</strong>
                    <span>tâches du jour</span>
                </div>

                <div className="stat">
                    <strong>{weekTasksCount} ✦</strong>
                    <span>à faire cette semaine</span>
                </div>

                <div className="stat">
                    <strong>{overdueCount} ⏰</strong>
                    <span>en retard</span>
                </div>

                <div className="stat">
                    <strong>{hotStreaksCount} 🔥</strong>
                    <span>streaks actives</span>
                </div>
            </div>

            <div className="task-actions">
                <button type="button" className="btn secondary" onClick={onReset}>
                    Réinitialiser
                </button>
            </div>
        </div>
    )
}