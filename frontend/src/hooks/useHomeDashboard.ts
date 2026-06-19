// src/hooks/useHomeDashboard.ts
import { useState, useEffect } from "react"
import { api, ApiError } from "../lib/api"
import type { HomeDashboardRaw } from "../lib/api"

// ─── Type exposé aux composants ───────────────────────────────────────────────

export interface HomeDashboardData {
  monthlyGoal:        { completed: number; goal: number; percentage: number }
  streakDays:         number
  todayDone:          number
  todayTotal:         number
  overdueCount:       number
  completionRate:     number
  frequencyBreakdown: { frequency: string; count: number }[]
}

interface State {
  data:    HomeDashboardData | null
  loading: boolean
  error:   string | null
}

// ─── Mapping raw → UI ─────────────────────────────────────────────────────────

function mapRawToData(raw: HomeDashboardRaw): HomeDashboardData {
  return {
    monthlyGoal: {
      completed:  raw.monthly_goal.completed,
      goal:       raw.monthly_goal.goal,
      percentage: raw.monthly_goal.percentage,
    },
    streakDays:         raw.streak_days,
    todayDone:          raw.today.done,
    todayTotal:         raw.today.total,
    overdueCount:       0, // à brancher quand l'endpoint expose overdue_count
    completionRate:     raw.monthly_goal.percentage,
    frequencyBreakdown: raw.frequency_breakdown ?? [],
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHomeDashboard(refreshKey?: number) {
  const [state, setState] = useState<State>({
    data: null, loading: true, error: null,
  })

  useEffect(() => {
    let cancelled = false
    setState(s => ({ ...s, loading: true, error: null }))

    api.getHomeDashboard()
      .then((raw) => {
        if (!cancelled) setState({
          data:    mapRawToData(raw),
          loading: false,
          error:   null,
        })
      })
      .catch((e: ApiError) => {
        if (!cancelled) setState({
          data:    null,
          loading: false,
          error:   e.status === 401 ? "Session expirée" : "Impossible de charger le tableau de bord",
        })
      })

    return () => { cancelled = true }
  }, [refreshKey])

  return state
}