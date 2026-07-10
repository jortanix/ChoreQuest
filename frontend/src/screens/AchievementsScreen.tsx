import { useCallback, useEffect, useState } from "react"
import ScreenState from "../components/ScreenState"
import type { ScreenStateProps } from "../components/ScreenState"
import { useAsyncState } from "../hooks/useAsyncState"
import { achievementsMock } from "../mocks/achievements"
import {
    achievementCategoryLabels,
    type Achievement,
} from "../types/achievements"
import { getAchievementProgressPercent } from "../utils/achievements"
import { useTasks } from "../context/useTasks"

type Tab = "achievements" | "badges"

type DerivedBadge = {
    id: string
    icon: string
    title: string
    description: string
    unlocked: boolean
    progressLabel: string
    tone: "gold" | "teal" | "pink" | "default"
}

type AchievementsScreenProps = {
    onGoHome: () => void
}

// ─── Onglet Succès ────────────────────────────────────────────────────────────

function AchievementsTab({ onGoHome }: AchievementsScreenProps) {
    const loadAchievements = useCallback(async (): Promise<Achievement[]> => {
        await new Promise((resolve) => setTimeout(resolve, 800))
        return achievementsMock
    }, [])

    const isAchievementsEmpty = useCallback((achievements: Achievement[]) => {
        return achievements.length === 0
    }, [])

    const { state, execute } = useAsyncState(loadAchievements, {
        isEmpty: isAchievementsEmpty,
    })

    useEffect(() => {
        void execute()
    }, [execute])

    let screenState: ScreenStateProps

    switch (state.status) {
        case "idle":
            screenState = {
                status: "loading",
                loadingLabel: "Initialisation",
                loadingMessage: "Un instant…",
                loadingVariant: "inline",
                loadingCount: 1,
            }
            break

        case "loading":
            screenState = {
                status: "loading",
                loadingLabel: "Chargement des succès",
                loadingMessage: "On récupère les badges, séries et récompenses…",
                loadingVariant: "cards",
                loadingCount: 3,
            }
            break

        case "empty":
            screenState = {
                status: "empty",
                emptyIcon: "🏆",
                emptyTitle: "Aucun succès pour le moment",
                emptyDescription:
                    "Complète quelques tâches pour débloquer tes premiers badges et suivre tes progrès.",
                emptyActionLabel: "Retour à l'accueil",
                onEmptyAction: onGoHome,
            }
            break

        case "error":
            screenState = {
                status: "error",
                errorTitle: "Impossible de charger les succès",
                errorMessage:
                    state.error ||
                    "Une erreur empêche l'affichage des succès pour le moment.",
                errorActionLabel: "Réessayer",
                onErrorAction: () => void execute(),
                errorSecondaryActionLabel: "Retour à l'accueil",
                onErrorSecondaryAction: onGoHome,
            }
            break

        case "success":
            screenState = {
                status: "success",
                children: (
                    <div className="achievements-screen-content">
                        {state.data.map((achievement) => {
                            const progressPercent = getAchievementProgressPercent(achievement)
                            return (
                                <article
                                    key={achievement.id}
                                    className={`achievement-card ${
                                        achievement.unlocked ? "is-unlocked" : "is-locked"
                                    }`}
                                >
                                    <div className="achievement-card-top">
                                        <div className="achievement-card-icon" aria-hidden="true">
                                            {achievement.icon}
                                        </div>
                                        <div className="achievement-card-copy">
                                            <div className="achievement-card-header">
                                                <h3>{achievement.title}</h3>
                                                <span className="achievement-card-status">
                                                    {achievement.unlocked ? "Débloqué" : "En cours"}
                                                </span>
                                            </div>
                                            <p>{achievement.description}</p>
                                        </div>
                                    </div>
                                    <div className="achievement-card-meta">
                                        <span className="achievement-chip">
                                            {achievementCategoryLabels[achievement.category]}
                                        </span>
                                        <span className="achievement-reward">
                                            {achievement.rewardLabel}
                                        </span>
                                    </div>
                                    <div
                                        className="achievement-progress"
                                        aria-label={`Progression ${achievement.progress} sur ${achievement.target}`}
                                    >
                                        <div
                                            className="achievement-progress-bar"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <div className="achievement-progress-copy">
                                        <span>{achievement.progress}/{achievement.target}</span>
                                        <span>{progressPercent}%</span>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                ),
            }
            break
    }

    return <ScreenState {...screenState} />
}

// ─── Onglet Badges ────────────────────────────────────────────────────────────

function BadgesTab() {
    const { completionHistory, taskList } = useTasks()

    const totalCompletions = completionHistory.length
    const totalPoints = completionHistory.reduce((sum, e) => sum + e.points, 0)
    const nfcCompletions = completionHistory.filter((e) => e.needsNfc).length
    const bestStreak = taskList.reduce(
        (max, t) => Math.max(max, t.bestStreak ?? 0),
        0
    )

    const badges: DerivedBadge[] = [
        {
            id: "first-step",
            icon: "🌱",
            title: "Premier pas",
            description: "Valider une première tâche.",
            unlocked: totalCompletions >= 1,
            progressLabel: `${Math.min(totalCompletions, 1)}/1`,
            tone: "teal",
        },
        {
            id: "ten-completions",
            icon: "✅",
            title: "Routine lancée",
            description: "Atteindre 10 validations au total.",
            unlocked: totalCompletions >= 10,
            progressLabel: `${Math.min(totalCompletions, 10)}/10`,
            tone: "default",
        },
        {
            id: "fifty-points",
            icon: "⭐",
            title: "Collecteur d'étoiles",
            description: "Cumuler 50 points.",
            unlocked: totalPoints >= 50,
            progressLabel: `${Math.min(totalPoints, 50)}/50`,
            tone: "gold",
        },
        {
            id: "first-nfc",
            icon: "📶",
            title: "Scan magique",
            description: "Réaliser une première validation NFC.",
            unlocked: nfcCompletions >= 1,
            progressLabel: `${Math.min(nfcCompletions, 1)}/1`,
            tone: "teal",
        },
        {
            id: "streak-3",
            icon: "🔥",
            title: "Sur la lancée",
            description: "Atteindre une streak de 3.",
            unlocked: bestStreak >= 3,
            progressLabel: `${Math.min(bestStreak, 3)}/3`,
            tone: "pink",
        },
        {
            id: "streak-7",
            icon: "🏅",
            title: "Régularité solide",
            description: "Atteindre une streak de 7.",
            unlocked: bestStreak >= 7,
            progressLabel: `${Math.min(bestStreak, 7)}/7`,
            tone: "gold",
        },
    ]

    const unlockedBadges = badges.filter((b) => b.unlocked)
    const lockedBadges   = badges.filter((b) => !b.unlocked)

    const getBadgeClassName = (badge: DerivedBadge) => {
        if (!badge.unlocked) return "badge"
        if (badge.tone === "gold") return "badge pet"
        if (badge.tone === "teal") return "badge nfc"
        if (badge.tone === "pink") return "badge alert"
        return "badge"
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
                                    <h3 className="task-title">{badge.icon} {badge.title}</h3>
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
                                <h3 className="task-title">{badge.icon} {badge.title}</h3>
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

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function AchievementsScreen({ onGoHome }: AchievementsScreenProps) {
    const [tab, setTab] = useState<Tab>("achievements")

    return (
        <div className="screen">
            {/* Switcher d"onglets */}
            <div className="tab-switcher" role="tablist">
                <button
                    role="tab"
                    aria-selected={tab === "achievements"}
                    className={tab === "achievements" ? "active" : ""}
                    onClick={() => setTab("achievements")}
                >
                    🏆 Succès
                </button>
                <button
                    role="tab"
                    aria-selected={tab === "badges"}
                    className={tab === "badges" ? "active" : ""}
                    onClick={() => setTab("badges")}
                >
                    🎖️ Badges
                </button>
            </div>

            {/* Contenu */}
            {tab === "achievements" && <AchievementsTab onGoHome={onGoHome} />}
            {tab === "badges"       && <BadgesTab />}
        </div>
    )
}