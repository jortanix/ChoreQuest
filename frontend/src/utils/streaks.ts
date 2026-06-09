import type { Task, TaskFrequency } from '../types'

const DAY_MS = 1000 * 60 * 60 * 24

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function diffInDays(a: Date, b: Date) {
    const aStart = startOfDay(a).getTime()
    const bStart = startOfDay(b).getTime()
    return Math.round((aStart - bStart) / DAY_MS)
}

function addDays(date: Date, days: number) {
    const next = new Date(date)
    next.setDate(next.getDate() + days)
    return startOfDay(next)
}

function addMonths(date: Date, months: number) {
    const next = new Date(date)
    next.setMonth(next.getMonth() + months)
    return startOfDay(next)
}

function addYears(date: Date, years: number) {
    const next = new Date(date)
    next.setFullYear(next.getFullYear() + years)
    return startOfDay(next)
}

function getNextDueDate(lastCompleted: Date, frequency: TaskFrequency) {
    switch (frequency) {
        case 'daily':
            return addDays(lastCompleted, 1)
        case 'weekly':
            return addDays(lastCompleted, 7)
        case 'biweekly':
            return addDays(lastCompleted, 14)
        case 'monthly':
            return addMonths(lastCompleted, 1)
        case 'seasonal':
            return addMonths(lastCompleted, 3)
        case 'yearly':
            return addYears(lastCompleted, 1)
        default: {
            const exhaustiveCheck: never = frequency
            return exhaustiveCheck
        }
    }
}

function getGraceWindowDays(frequency: TaskFrequency) {
    switch (frequency) {
        case 'daily':
            return 1
        case 'weekly':
            return 1
        case 'biweekly':
            return 1
        case 'monthly':
            return 2
        case 'seasonal':
            return 7
        case 'yearly':
            return 14
        default: {
            const exhaustiveCheck: never = frequency
            return exhaustiveCheck
        }
    }
}

export function isTaskOverdue(task: Task, now = new Date()) {
    if (!task.lastCompletedAt) return false

    const today = startOfDay(now)
    const lastCompleted = startOfDay(new Date(task.lastCompletedAt))
    const nextDueDate = getNextDueDate(lastCompleted, task.frequency)
    const graceWindowDays = getGraceWindowDays(task.frequency)
    const overdueThreshold = addDays(nextDueDate, graceWindowDays)

    return today > overdueThreshold
}

export function isTaskDueSoon(task: Task, now = new Date()) {
    if (!task.lastCompletedAt) return task.frequency !== 'yearly'

    const today = startOfDay(now)
    const lastCompleted = startOfDay(new Date(task.lastCompletedAt))
    const nextDueDate = getNextDueDate(lastCompleted, task.frequency)
    const daysUntilDue = diffInDays(nextDueDate, today)

    switch (task.frequency) {
        case 'daily':
            return daysUntilDue <= 1
        case 'weekly':
            return daysUntilDue <= 2
        case 'biweekly':
            return daysUntilDue <= 3
        case 'monthly':
            return daysUntilDue <= 5
        case 'seasonal':
            return daysUntilDue <= 14
        case 'yearly':
            return daysUntilDue <= 30
        default: {
            const exhaustiveCheck: never = task.frequency
            return exhaustiveCheck
        }
    }
}

export function getOverdueTasks(tasks: Task[], now = new Date()) {
    return tasks.filter((task) => isTaskOverdue(task, now))
}

export function getDueSoonTasks(tasks: Task[], now = new Date()) {
    return tasks.filter((task) => isTaskDueSoon(task, now))
}

export function completeTask(task: Task, now = new Date()): Task {
    const today = startOfDay(now)

    if (!task.lastCompletedAt) {
        return {
            ...task,
            completedToday: true,
            completedThisPeriod: true,
            currentStreak: 1,
            bestStreak: Math.max(task.bestStreak ?? 0, 1),
            lastCompletedAt: today.toISOString(),
        }
    }

    const lastCompleted = startOfDay(new Date(task.lastCompletedAt))
    const daysSinceLastCompletion = diffInDays(today, lastCompleted)
    const nextDueDate = getNextDueDate(lastCompleted, task.frequency)
    const graceWindowDays = getGraceWindowDays(task.frequency)
    const streakContinues = today <= addDays(nextDueDate, graceWindowDays)

    let nextStreak = task.currentStreak ?? 0

    if (daysSinceLastCompletion === 0) {
        nextStreak = task.currentStreak ?? 1
    } else if (streakContinues) {
        nextStreak = (task.currentStreak ?? 0) + 1
    } else {
        nextStreak = 1
    }

    return {
        ...task,
        completedToday: true,
        completedThisPeriod: true,
        currentStreak: nextStreak,
        bestStreak: Math.max(task.bestStreak ?? 0, nextStreak),
        lastCompletedAt: today.toISOString(),
    }
}