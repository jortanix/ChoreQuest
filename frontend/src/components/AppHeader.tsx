import type { ThemeMode } from '../types/app'

type AppHeaderProps = {
    theme: ThemeMode
    onToggleTheme: () => void
}

export default function AppHeader({
                                      theme,
                                      onToggleTheme,
                                  }: AppHeaderProps) {
    return (
        <header className="topbar">
            <div className="brand">
                <div className="logo">🐾</div>
                <div>
                    <p className="brand-title">ChoreQuest</p>
                    <p className="brand-sub">cozy chores for Pep’s ✦</p>
                </div>
            </div>

            <div className="top-actions">
                <button
                    className="icon-btn"
                    onClick={onToggleTheme}
                    aria-label={
                        theme === 'light'
                            ? 'Activer le mode sombre'
                            : 'Activer le mode clair'
                    }
                >
                    ☾
                </button>

                <button className="icon-btn" aria-label="Favoris">
                    ♡
                </button>
            </div>
        </header>
    )
}