import type { CalendarEvent, CalendarFrequency } from '../types/calendar'

export const orderedCalendarFrequencies: CalendarFrequency[] = [
    'daily',
    'weekly',
    'biweekly',
    'monthly',
    'seasonal',
    'yearly',
]

export function createEmptyCalendarGroups(): Record<
    CalendarFrequency,
    CalendarEvent[]
> {
    return {
        daily: [],
        weekly: [],
        biweekly: [],
        monthly: [],
        seasonal: [],
        yearly: [],
    }
}

export function groupCalendarEventsByFrequency(
    events: CalendarEvent[]
): Record<CalendarFrequency, CalendarEvent[]> {
    return events.reduce<Record<CalendarFrequency, CalendarEvent[]>>(
        (groups, event) => {
            groups[event.frequency].push(event)
            return groups
        },
        createEmptyCalendarGroups()
    )
}