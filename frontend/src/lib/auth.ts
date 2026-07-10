import { setAccessToken, clearAccessToken, getAccessToken } from './api'

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8010/api"

export async function login(username: string, password: string): Promise<void> {
  const res = await fetch(`${BASE}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(
      typeof data?.detail === "string"
        ? data.detail
        : "Identifiants invalides"
    )
  }

  const { access } = await res.json()
  setAccessToken(access)
}

export function logout(): void {
  clearAccessToken()
}

export function isAuthenticated(): boolean {
  return !!getAccessToken()
}