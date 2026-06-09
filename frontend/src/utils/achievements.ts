import type { Achievement } from '../types/achievements'

export function getAchievementProgressPercent(achievement: Achievement): number {
    if (achievement.target <= 0) {
        return 0
    }

    return Math.min(
        100,
        Math.round((achievement.progress / achievement.target) * 100)
    )
}