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
    dueLabel: "aujourd'hui",
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
})