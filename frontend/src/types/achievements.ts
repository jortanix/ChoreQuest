export type AchievementCategory =
    | 'streak'
    | 'daily'
    | 'weekly'
    | 'special'

export type Achievement = {
    id: string
    title: string
    description: string
    category: AchievementCategory
    progress: number
    target: number
    unlocked: boolean
    rewardLabel: string
    icon: string
}

export const achievementCategoryLabels: Record<AchievementCategory, string> = {
    streak: 'Série',
    daily: 'Quotidien',
    weekly: 'Hebdomadaire',
    special: 'Spécial',
}