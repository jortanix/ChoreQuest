import { describe, it, expect, vi, beforeEach } from "vitest"
import { setAccessToken } from "../api"

global.fetch = vi.fn()
const mockFetch = global.fetch as ReturnType<typeof vi.fn>

beforeEach(() => {
    vi.clearAllMocks()
    setAccessToken("fake-token")
})

describe("api layer", () => {
    it("envoie le token dans le header Authorization", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ monthly_goal: { completed: 0, goal: 1, percentage: 0 } }),
        })

        const { api } = await import("../api")
        await api.getHomeDashboard()

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining("/dashboard/home/"),
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: "Bearer fake-token",
                }),
            })
        )
    })

    it("lève une erreur ApiError sur 4xx/5xx", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ detail: "Unauthorized" }),
        })

        const { api, ApiError } = await import("../api")
        await expect(api.getHomeDashboard()).rejects.toThrow(ApiError)
    })
})