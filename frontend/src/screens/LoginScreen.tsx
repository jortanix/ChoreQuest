// src/screens/LoginScreen.tsx
import { useState } from 'react'
import { login } from '../lib/auth'

interface Props {
    onSuccess: () => void
}

export default function LoginScreen({ onSuccess }: Props) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError]       = useState<string | null>(null)
    const [loading, setLoading]   = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await login(username, password)
            onSuccess()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Connexion impossible')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f3e8ff 0%, #dbeafe 100%)',
            padding: '1rem',
        }}>
            <div style={{
                background: 'white',
                borderRadius: '1.5rem',
                padding: '2.5rem 2rem',
                width: '100%',
                maxWidth: '360px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                    🐾
                </div>
                <h1 style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#2d1b69',
                    marginBottom: '0.25rem',
                }}>
                    ChoreQuest
                </h1>
                <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Connecte-toi pour continuer
                </p>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div
                            role="alert"
                            style={{
                                background: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                borderRadius: '0.5rem',
                                padding: '0.6rem 0.9rem',
                                fontSize: '0.875rem',
                                marginBottom: '1rem',
                                textAlign: 'left',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
                        <label
                            htmlFor="username"
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#555',
                                marginBottom: '0.35rem',
                            }}
                        >
                            Nom d{"'"}utilisateur
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            autoFocus
                            required
                            style={{
                                width: '100%',
                                padding: '0.65rem 0.9rem',
                                border: '1.5px solid #ddd',
                                borderRadius: '0.75rem',
                                fontSize: '1rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
                        <label
                            htmlFor="password"
                            style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#555',
                                marginBottom: '0.35rem',
                            }}
                        >
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                            style={{
                                width: '100%',
                                padding: '0.65rem 0.9rem',
                                border: '1.5px solid #ddd',
                                borderRadius: '0.75rem',
                                fontSize: '1rem',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: loading
                                ? '#ccc'
                                : 'linear-gradient(135deg, #a855f7, #ec4899)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1rem',
                            borderRadius: '0.75rem',
                            border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginTop: '0.5rem',
                        }}
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    )
}