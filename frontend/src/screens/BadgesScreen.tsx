import { useMemo } from 'react'
import { useTasks } from '../context/useTasks'

type DerivedBadge = {
  id: string
  icon: string
  title: string
  description: string
  unlocked: boolean
  progressLabel: string
  tone: 'gold' | 'teal' | 'pink' | 'default'
}

function BadgesScreen() {
  const { completionHistory, taskList } = useTasks()

  const totalCompletions = completionHistory.length
  const totalPoints = completionHistory.reduce((sum, event) => sum + event.points, 0)
  const nfcCompletions = completionHistory.filter((event) => event.needsNfc).length
  const bestStreak = taskList.reduce(
      (max, task) => Math.max(max, task.bestStreak ?? 0),
      0
  )

  const badges = useMemo<DerivedBadge[]>(() => {
    return [
      {
        id: 'first-step',
        icon: '🌱',
        title: 'Premier pas',
        description: 'Valider une première tâche.',
        unlocked: totalCompletions >= 1,
        progressLabel: `${Math.min(totalCompletions, 1)}/1`,
        tone: 'teal',
      },
      {
        id: 'ten-completions',
        icon: '✅',
        title: 'Routine lancée',
        description: 'Atteindre 10 validations au total.',
        unlocked: totalCompletions >= 10,
        progressLabel: `${Math.min(totalCompletions, 10)}/10`,
        tone: 'default',
      },
      {
        id: 'fifty-points',
        icon: '⭐',
        title: 'Collecteur d’étoiles',
        description: 'Cumuler 50 points.',
        unlocked: totalPoints >= 50,
        progressLabel: `${Math.min(totalPoints, 50)}/50`,
        tone: 'gold',
      },
      {
        id: 'first-nfc',
        icon: '📶',
        title: 'Scan magique',
        description: 'Réaliser une première validation NFC.',
        unlocked: nfcCompletions >= 1,
        progressLabel: `${Math.min(nfcCompletions, 1)}/1`,
        tone: 'teal',
      },
      {
        id: 'streak-3',
        icon: '🔥',
        title: 'Sur la lancée',
        description: 'Atteindre une streak de 3.',
        unlocked: bestStreak >= 3,
        progressLabel: `${Math.min(bestStreak, 3)}/3`,
        tone: 'pink',
      },
      {
        id: 'streak-7',
        icon: '🏅',
        title: 'Régularité solide',
        description: 'Atteindre une streak de 7.',
        unlocked: bestStreak >= 7,
        progressLabel: `${Math.min(bestStreak, 7)}/7`,
        tone: 'gold',
      },
    ]
  }, [bestStreak, nfcCompletions, totalCompletions, totalPoints])

  const unlockedBadges = badges.filter((badge) => badge.unlocked)
  const lockedBadges = badges.filter((badge) => !badge.unlocked)

  const getBadgeClassName = (badge: DerivedBadge) => {
    if (!badge.unlocked) return 'badge'
    if (badge.tone === 'gold') return 'badge pet'
    if (badge.tone === 'teal') return 'badge nfc'
    if (badge.tone === 'pink') return 'badge alert'
    return 'badge'
  }

  if (badges.length === 0) {
    return (
        <section className="screen active">
          <div className="card hero">
            <div className="eyebrow">🏆 Badges</div>
            <div className="hero-top">
              <div>
                <h1 className="hero-title">Aucun badge pour le moment.</h1>
                <p className="hero-sub">
                  Les badges apparaîtront ici dès que la progression sera disponible.
                </p>
              </div>
              <div className="mascot">🎖️</div>
            </div>
          </div>
        </section>
    )
  }

  return (
      <section className="screen active">
        <div className="card hero">
          <div className="eyebrow">🏆 Badges</div>

          <div className="hero-top">
            <div>
              <h1 className="hero-title">Les récompenses du foyer.</h1>
              <p className="hero-sub">
                Débloque des badges en validant des tâches, en gagnant des points
                et en protégeant tes streaks.
              </p>
            </div>
            <div className="mascot">🎖️</div>
          </div>

          <div className="stats">
            <div className="stat">
              <strong>{unlockedBadges.length}</strong>
              <span>badges débloqués</span>
            </div>
            <div className="stat">
              <strong>{lockedBadges.length}</strong>
              <span>badges à viser</span>
            </div>
            <div className="stat">
              <strong>{bestStreak}</strong>
              <span>meilleure streak</span>
            </div>
          </div>
        </div>

        <div className="section-head">
          <h2>Débloqués</h2>
          <button className="ghost">{unlockedBadges.length} obtenus</button>
        </div>

        <div className="task-list">
          {unlockedBadges.length === 0 ? (
              <article className="task-card">
                <div className="task-top">
                  <div>
                    <h3 className="task-title">Aucun badge débloqué</h3>
                    <p className="task-meta">
                      Valide une première tâche pour lancer ta collection.
                    </p>
                  </div>
                  <span className="badge nfc">À commencer</span>
                </div>
              </article>
          ) : (
              unlockedBadges.map((badge) => (
                  <article className="task-card" key={badge.id}>
                    <div className="task-top">
                      <div>
                        <h3 className="task-title">
                          {badge.icon} {badge.title}
                        </h3>
                        <p className="task-meta">{badge.description}</p>
                      </div>
                      <span className={getBadgeClassName(badge)}>Débloqué</span>
                    </div>

                    <div className="row-badges">
                      <span className="pill">Progression : {badge.progressLabel}</span>
                    </div>
                  </article>
              ))
          )}
        </div>

        <div className="section-head">
          <h2>À débloquer</h2>
          <button className="ghost">{lockedBadges.length} restants</button>
        </div>

        <div className="task-list">
          {lockedBadges.map((badge) => (
              <article className="task-card" key={badge.id}>
                <div className="task-top">
                  <div>
                    <h3 className="task-title">
                      {badge.icon} {badge.title}
                    </h3>
                    <p className="task-meta">{badge.description}</p>
                  </div>
                  <span className="badge">Verrouillé</span>
                </div>

                <div className="row-badges">
                  <span className="pill">Progression : {badge.progressLabel}</span>
                </div>
              </article>
          ))}
        </div>
      </section>
  )
}

export default BadgesScreen