import { describe, it, expect } from 'vitest'
import type { Task, CompletionEvent } from '../../types'
import {
    getTodayPoints,
    getBestLiveStreak,
    getFeaturedTasks,
    getHotStreakTasks,
} from '../home'

const makeTask = (overrides: Partial<Task> = {}): Task => ({
    id: 't1',
    title: 'Test',
    description: '',
    frequency: 'daily',
    points: 10,
    dueLabel: 'aujourd’hui',
    ...overrides,
})

describe('home utils', () => {
    it('calcule correctement les points du jour', () => {
        const today = new Date()
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

        const events: CompletionEvent[] = [
            {
                id: 'e1',
                taskId: 't1',
                taskTitle: 'A',
                assignee: 'Alice',
                points: 10,
                completedAt: today.toISOString(),
                frequency: 'daily',
            },
            {
                id: 'e2',
                taskId: 't2',
                taskTitle: 'B',
                assignee: 'Bob',
                points: 5,
                completedAt: yesterday.toISOString(),
                frequency: 'daily',
            },
        ]

        expect(getTodayPoints(events)).toBe(10)
    })

    it('retourne la meilleure streak active', () => {
        const tasks: Task[] = [
            makeTask({ id: '1', currentStreak: 1 }),
            makeTask({ id: '2', currentStreak: 5 }),
            makeTask({ id: '3', currentStreak: 3 }),
        ]

        expect(getBestLiveStreak(tasks)).toBe(5)
    })

    it('remonte les featured tasks en mettant les critiques en premier', () => {
        const today = [makeTask({ id: '1', points: 5 }), makeTask({ id: '2', points: 10 })]
        const week = [
            makeTask({ id: '3', frequency: 'weekly', critical: true, points: 1 }),
        ]

        const featured = getFeaturedTasks(today, week)

        expect(featured[0].id).toBe('3') // critique d’abord
        expect(featured).toHaveLength(3)
    })

    it('retourne uniquement les tâches avec une streak >= 3', () => {
        const tasks: Task[] = [
            makeTask({ id: '1', currentStreak: 1 }),
            makeTask({ id: '2', currentStreak: 3 }),
            makeTask({ id: '3', currentStreak: 5 }),
        ]

        const hot = getHotStreakTasks(tasks)

        expect(hot.map((t) => t.id)).toEqual(['3', '2'])
    })
})