import { useCallback, useState } from 'react'
import OnboardingScreen from './screens/OnboardingScreen'
import LoginScreen from './screens/LoginScreen'
import Toast from './components/Toast'
import AppHeader from './components/AppHeader'
import BottomNav from './components/BottomNav'
import ScreenRenderer from './components/ScreenRenderer'
import { useToastQueue } from './hooks/useToastQueue'
import { useAchievementToasts } from './hooks/useAchievementToasts'
import { isAuthenticated, logout } from './lib/auth'
import type { Screen, ThemeMode } from './types/app'

function App() {
    const [authed, setAuthed]             = useState(isAuthenticated)
    const [activeScreen, setActiveScreen] = useState<Screen>('home')
    const [theme, setTheme]               = useState<ThemeMode>('light')
    const [hasOnboarded, setHasOnboarded] = useState(() => {
        return sessionStorage.getItem('onboarded') === '1'
    })

    const { activeToast, showToast } = useToastQueue()
    useAchievementToasts(showToast)

    const toggleTheme = useCallback(() => {
        setTheme((cur) => {
            const next = cur === 'light' ? 'dark' : 'light'
            showToast(next === 'dark' ? 'Mode nuit active' : 'Mode clair active', 'default')
            return next
        })
    }, [showToast])

    const handleLogout = useCallback(() => {
        logout()
        setAuthed(false)
    }, [])

    if (!authed) {
        return <LoginScreen onSuccess={() => setAuthed(true)} />
    }

    if (!hasOnboarded) {
        return (
            <div className={`app-root ${theme}`}>
                <div className="app-shell">
                    <AppHeader theme={theme} onToggleTheme={toggleTheme} onLogout={handleLogout} />
                    <main>
                        <OnboardingScreen onFinish={() => {
                            sessionStorage.setItem('onboarded', '1')
                            setHasOnboarded(true)
                        }} />
                    </main>
                </div>
                <Toast toast={activeToast} />
            </div>
        )
    }

    return (
        <div className={`app-root ${theme}`}>
            <div className="app-shell">
                <AppHeader theme={theme} onToggleTheme={toggleTheme} onLogout={handleLogout} />
                <main>
                    <ScreenRenderer
                        activeScreen={activeScreen}
                        onShowToast={showToast}
                        onChangeScreen={setActiveScreen}
                    />
                </main>
                <BottomNav activeScreen={activeScreen} onChangeScreen={setActiveScreen} />
            </div>
            <Toast toast={activeToast} />
        </div>
    )
}

export default App