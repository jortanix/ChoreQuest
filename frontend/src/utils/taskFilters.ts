import type { Task, TaskFrequency } from '../types'

export const frequencyOrder = [
    'daily',
    'weekly',
    'biweekly',
    'monthly',
    'seasonal',
    'yearly',
] as const satisfies ReadonlyArray<TaskFrequency>

export const frequencyLabels: Record<TaskFrequency, string> = {
    daily: 'Quotidien',
    weekly: 'Hebdomadaire',
    biweekly: 'Toutes les 2 semaines',
    monthly: 'Mensuel',
    seasonal: 'Saisonnier',
    yearly: 'Annuel',
}

export function getTasksByFrequency(tasks: Task[], frequency: TaskFrequency) {
    return tasks.filter((task) => task.frequency === frequency)
}

export function getTodayTasks(tasks: Task[]) {
    return tasks.filter((task) => task.frequency === 'daily')
}

export function getThisWeekTasks(tasks: Task[]) {
    return tasks.filter(
        (task) => task.frequency === 'daily' || task.frequency === 'weekly'
    )
}

export function getNfcTasks(tasks: Task[]) {
    return tasks.filter((task) => task.needsNfc)
}

export function getManualTasks(tasks: Task[]) {
    return tasks.filter((task) => !task.needsNfc)
}

export function getCriticalTasks(tasks: Task[]) {
    return tasks.filter((task) => task.critical)
}

export function getTasksGroupedByFrequency(tasks: Task[]) {
    return frequencyOrder.map((frequency) => ({
        frequency,
        label: frequencyLabels[frequency],
        items: getTasksByFrequency(tasks, frequency),
    }))
}