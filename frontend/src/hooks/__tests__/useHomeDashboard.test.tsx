import { renderHook, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useHomeDashboard } from "../useHomeDashboard"

// Mock de l'api
vi.mock("../../lib/api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../lib/api")>()
    return {
        ...actual,
        api: {
            getHomeDashboard: vi.fn(),
        },
    }
})

import { api } from "../../lib/api"
const mockGetHomeDashboard = api.getHomeDashboard as ReturnType<typeof vi.fn>

const fakeRaw = {
    monthly_goal: { completed: 3, goal: 10, percentage: 30 },
    streak_days: 5,
    today: { done: 2, total: 4 },
    frequency_breakdown: [],
}

beforeEach(() => {
    vi.clearAllMocks()
    mockGetHomeDashboard.mockResolvedValue(fakeRaw)
})

describe("useHomeDashboard", () => {
    it("renvoie un objectif mensuel correct", async () => {
        const { result } = renderHook(() => useHomeDashboard())
        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.data?.monthlyGoal.percentage).toBe(30)
    })

    it("calcule le streak correctement", async () => {
        const { result } = renderHook(() => useHomeDashboard())
        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.data?.streakDays).toBeGreaterThanOrEqual(0)
    })

    it("calcule le taux de complétion", async () => {
        const { result } = renderHook(() => useHomeDashboard())
        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.data?.completionRate).toBeGreaterThanOrEqual(0)
        expect(result.current.data?.completionRate).toBeLessThanOrEqual(100)
    })
})