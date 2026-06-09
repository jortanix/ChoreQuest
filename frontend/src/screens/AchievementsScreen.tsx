import { useCallback, useEffect } from 'react'
import ScreenState from '../components/ScreenState'
import type { ScreenStateProps } from '../components/ScreenState'
import { useAsyncState } from '../hooks/useAsyncState'
import { achievementsMock } from '../mocks/achievements'
import {
    achievementCategoryLabels,
    type Achievement,
} from '../types/achievements'
import { getAchievementProgressPercent } from '../utils/achievements'

type AchievementsScreenProps = {
    onGoHome: () => void
}

export default function AchievementsScreen({
                                               onGoHome,
                                           }: AchievementsScreenProps) {
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
        case 'idle':
            screenState = {
                status: 'loading',
                loadingLabel: 'Initialisation',
                loadingMessage: 'Un instant…',
                loadingVariant: 'inline',
                loadingCount: 1,
            }
            break

        case 'loading':
            screenState = {
                status: 'loading',
                loadingLabel: 'Chargement des succès',
                loadingMessage: 'On récupère les badges, séries et récompenses…',
                loadingVariant: 'cards',
                loadingCount: 3,
            }
            break

        case 'empty':
            screenState = {
                status: 'empty',
                emptyIcon: '🏆',
                emptyTitle: 'Aucun succès pour le moment',
                emptyDescription:
                    'Complète quelques tâches pour débloquer tes premiers badges et suivre tes progrès.',
                emptyActionLabel: 'Retour à l’accueil',
                onEmptyAction: onGoHome,
            }
            break

        case 'error':
            screenState = {
                status: 'error',
                errorTitle: 'Impossible de charger les succès',
                errorMessage:
                    state.error ||
                    'Une erreur empêche l’affichage des succès pour le moment.',
                errorActionLabel: 'Réessayer',
                onErrorAction: () => {
                    void execute()
                },
                errorSecondaryActionLabel: 'Retour à l’accueil',
                onErrorSecondaryAction: onGoHome,
            }
            break

        case 'success':
            screenState = {
                status: 'success',
                children: (
                    <div className="achievements-screen-content">
                        {state.data.map((achievement) => {
                            const progressPercent =
                                getAchievementProgressPercent(achievement)

                            return (
                                <article
                                    key={achievement.id}
                                    className={`achievement-card ${
                                        achievement.unlocked ? 'is-unlocked' : 'is-locked'
                                    }`}
                                >
                                    <div className="achievement-card-top">
                                        <div
                                            className="achievement-card-icon"
                                            aria-hidden="true"
                                        >
                                            {achievement.icon}
                                        </div>

                                        <div className="achievement-card-copy">
                                            <div className="achievement-card-header">
                                                <h3>{achievement.title}</h3>
                                                <span className="achievement-card-status">
                                                    {achievement.unlocked
                                                        ? 'Débloqué'
                                                        : 'En cours'}
                                                </span>
                                            </div>

                                            <p>{achievement.description}</p>
                                        </div>
                                    </div>

                                    <div className="achievement-card-meta">
                                        <span className="achievement-chip">
                                            {
                                                achievementCategoryLabels[
                                                    achievement.category
                                                    ]
                                            }
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
                                        <span>
                                            {achievement.progress}/{achievement.target}
                                        </span>
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

    return (
        <div className="screen">
            <ScreenState {...screenState} />
        </div>
    )
}