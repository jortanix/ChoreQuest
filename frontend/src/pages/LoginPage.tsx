import { useState } from "react"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8010/api"

export function LoginPage({ onLogin }: { onLogin: () => void }) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError]     = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`${API}/auth/login/`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ username, password }),
            })
            if (!res.ok) throw new Error("Identifiants incorrects")
            const data = await res.json()
            window.localStorage.setItem("jwt_access", data.access)
            onLogin()
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={handleSubmit}>
                <h1>ChoreQuest</h1>
                <p className="login-subtitle">Connecte-toi pour accéder à ton foyer</p>

                <input
                    type="text"
                    placeholder="Nom d’utilisateur"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />

                {error && <p className="login-error">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Connexion..." : "Continuer"}
                </button>
            </form>
        </div>
    )
}