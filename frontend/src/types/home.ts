import type { Task } from '../types'
import type { ToastType } from '../types/toast'
import type { DerivedBadge } from '../utils/badges'

export interface HomeScreenProps {
    onShowToast: (message: string, type?: ToastType) => void
}

export interface HomeOverviewMetrics {
    todayPoints: number
    bestLiveStreak: number
    unlockedBadgesCount: number
    nextBadge: DerivedBadge | undefined
}

export interface HomeCollections {
    todayTasks: Task[]
    weekTasks: Task[]
    criticalTasks: Task[]
    nfcTasks: Task[]
    overdueTasks: Task[]
    dueSoonTasks: Task[]
    featuredTasks: Task[]
    hotStreakTasks: Task[]
}