import { useState, useEffect } from 'react'
import { api } from '../lib/api'

// ─── Types publics ────────────────────────────────────────────────────────────

export type CalendarPeriod = 'today' | 'week' | 'month' | 'all'

export interface PlanningItem {
    id: string
    title: string
    frequency: string
    dueLabel: string
    critical: boolean
    points: number
    category: string
    needsNfc: boolean
}

export interface CompletedItem {
    id: string
    title: string
    frequency: string
    dueLabel: string
    completedAt: string
    points: number
}

export interface CalendarDashboardData {
    planning:  PlanningItem[]
    completed: CompletedItem[]
    progress: {
        completed:  number
        total:      number
        percentage: number
    }
    period: {
        start: string
        end:   string
    }
    summary: {
        to_do:    number
        routines: number
        overdue:  number
    }
}

// ─── Mapping backend → frontend ───────────────────────────────────────────────

function toApiPeriod(period: CalendarPeriod): 'week' | 'month' {
    // 'today' et 'all' sont gérés côté client — on envoie toujours 'week' au backend
    if (period === 'month') return 'month'
    return 'week'
}

function mapPlanning(raw: import('../lib/api').TaskRaw): PlanningItem {
    return {
        id:        raw.id,
        title:     raw.title,
        frequency: raw.frequency,
        dueLabel:  raw.due_label ?? '',
        critical:  raw.critical,
        points:    raw.points,
        category:  raw.category,
        needsNfc:  raw.needs_nfc,
    }
}

function mapCompleted(raw: import('../lib/api').CompletionEventRaw, taskTitle: string, frequency: string): CompletedItem {
    return {
        id:          raw.id,
        title:       taskTitle,
        frequency,
        dueLabel:    raw.scheduled_date,
        completedAt: raw.completed_at,
        points:      raw.points,
    }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseCalendarDashboardResult {
    data:    CalendarDashboardData | null
    loading: boolean
    error:   string | null
}

export function useCalendarDashboard(
    period: CalendarPeriod,
    refreshKey: number = 0
): UseCalendarDashboardResult {
    const [data, setData]       = useState<CalendarDashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)

        const apiPeriod = toApiPeriod(period)

        api.getCalendarDashboard(apiPeriod)
            .then((raw) => {
                if (cancelled) return

                const planning = raw.planning.map(mapPlanning)

                // Reconstruit le titre des completed depuis le planning si dispo
                const taskMap: Record<string, { title: string; frequency: string }> = {}
                for (const t of raw.planning) {
                    taskMap[t.id] = { title: t.title, frequency: t.frequency }
                }

                const completed = raw.completed.map((ev) => {
                    const info = taskMap[ev.task]
                    return mapCompleted(ev, info?.title ?? 'Tache', info?.frequency ?? 'daily')
                })

                setData({
                    planning,
                    completed,
                    progress: raw.progress,
                    period:   raw.period,
                    summary:  raw.summary,
                })
            })
            .catch((err) => {
                if (cancelled) return
                const msg = err?.detail
                    ? typeof err.detail === 'string'
                        ? err.detail
                        : JSON.stringify(err.detail)
                    : err?.message ?? 'Erreur inconnue'
                setError(msg)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => { cancelled = true }
    }, [period, refreshKey])

    return { data, loading, error }
}