import type { CompletionEvent, Task } from '../types'
import type { HomeCollections, HomeOverviewMetrics } from '../types/home'
import type { DerivedBadge } from './badges'

type CreateHomeCollectionsInput = {
    todayTasks: Task[]
    weekTasks: Task[]
    criticalTasks: Task[]
    nfcTasks: Task[]
    overdueTasks: Task[]
    dueSoonTasks: Task[]
    taskList: Task[]
}

type CreateHomeOverviewMetricsInput = {
    completionHistory: CompletionEvent[]
    taskList: Task[]
    badges: DerivedBadge[]
}

export function getBadgeClassName(task: Task) {
    if (task.critical) return 'badge pet'
    if (task.penaltyLabel) return 'badge alert'
    return task.needsNfc ? 'badge nfc' : 'badge'
}

export function getBadgeLabel(task: Task) {
    if (task.critical) return '🐱 Critique'
    if (task.penaltyLabel) return task.penaltyLabel
    return task.needsNfc ? '✦ NFC' : '✓ Manuel'
}

export function getActionLabel(task: Task) {
    return task.needsNfc ? 'Scanner NFC' : 'Valider'
}

export function getFrequencyLabel(task: Task) {
    if (task.frequency === 'daily') return 'quotidien'
    if (task.frequency === 'weekly') return 'hebdo'
    if (task.frequency === 'biweekly') return '2 semaines'
    if (task.frequency === 'monthly') return 'mensuel'
    if (task.frequency === 'seasonal') return 'saisonnier'
    return 'annuel'
}

export function getTodayPoints(completionHistory: CompletionEvent[]) {
    const now = new Date()

    return completionHistory
        .filter((event) => {
            const completedAt = new Date(event.completedAt)

            return (
                completedAt.getDate() === now.getDate() &&
                completedAt.getMonth() === now.getMonth() &&
                completedAt.getFullYear() === now.getFullYear()
            )
        })
        .reduce((sum, event) => sum + event.points, 0)
}

export function getBestLiveStreak(taskList: Task[]) {
    return taskList.reduce((max, task) => Math.max(max, task.currentStreak ?? 0), 0)
}

export function getFeaturedTasks(todayTasks: Task[], weekTasks: Task[]) {
    const weeklyOnlyTasks = weekTasks.filter((task) => task.frequency === 'weekly')

    return [...todayTasks, ...weeklyOnlyTasks]
        .sort((a, b) => {
            if ((a.critical ? 1 : 0) !== (b.critical ? 1 : 0)) {
                return (b.critical ? 1 : 0) - (a.critical ? 1 : 0)
            }

            return b.points - a.points
        })
        .slice(0, 8)
}

export function getHotStreakTasks(taskList: Task[]) {
    return taskList
        .filter((task) => (task.currentStreak ?? 0) >= 3)
        .sort((a, b) => (b.currentStreak ?? 0) - (a.currentStreak ?? 0))
        .slice(0, 3)
}

export function getUnlockedBadgesCount(badges: DerivedBadge[]) {
    return badges.filter((badge) => badge.unlocked).length
}

export function getNextBadge(badges: DerivedBadge[]) {
    return badges.find((badge) => !badge.unlocked)
}

export function createHomeCollections(
    input: CreateHomeCollectionsInput
): HomeCollections {
    return {
        todayTasks: input.todayTasks,
        weekTasks: input.weekTasks,
        criticalTasks: input.criticalTasks,
        nfcTasks: input.nfcTasks,
        overdueTasks: input.overdueTasks,
        dueSoonTasks: input.dueSoonTasks,
        featuredTasks: getFeaturedTasks(input.todayTasks, input.weekTasks),
        hotStreakTasks: getHotStreakTasks(input.taskList),
    }
}

export function createHomeOverviewMetrics(
    input: CreateHomeOverviewMetricsInput
): HomeOverviewMetrics {
    return {
        todayPoints: getTodayPoints(input.completionHistory),
        bestLiveStreak: getBestLiveStreak(input.taskList),
        unlockedBadgesCount: getUnlockedBadgesCount(input.badges),
        nextBadge: getNextBadge(input.badges),
    }
}