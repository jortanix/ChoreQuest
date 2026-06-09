export type CalendarFrequency =
    | 'daily'
    | 'weekly'
    | 'biweekly'
    | 'monthly'
    | 'seasonal'
    | 'yearly'

export type CalendarEvent = {
    id: string
    title: string
    frequency: CalendarFrequency
    dueLabel: string
    area: string
    completed: boolean
}

export const calendarFrequencyLabels: Record<CalendarFrequency, string> = {
    daily: 'Chaque jour',
    weekly: 'Chaque semaine',
    biweekly: 'Toutes les 2 semaines',
    monthly: 'Chaque mois',
    seasonal: 'Chaque saison',
    yearly: 'Une fois par an',
}