import { useCallback, useState } from 'react'
import OnboardingScreen from './screens/OnboardingScreen'
import Toast from './components/Toast'
import AppHeader from './components/AppHeader'
import BottomNav from './components/BottomNav'
import ScreenRenderer from './components/ScreenRenderer'
import { useToastQueue } from './hooks/useToastQueue'
import { useAchievementToasts } from './hooks/useAchievementToasts'
import type { Screen, ThemeMode } from './types/app'

function App() {
    const [activeScreen, setActiveScreen] = useState<Screen>('home')
    const [theme, setTheme] = useState<ThemeMode>('light')
    const [hasOnboarded, setHasOnboarded] = useState(false)

    const { activeToast, showToast } = useToastQueue()

    useAchievementToasts(showToast)

    const toggleTheme = useCallback(() => {
        setTheme((currentTheme) => {
            const nextTheme = currentTheme === 'light' ? 'dark' : 'light'

            showToast(
                nextTheme === 'dark'
                    ? 'Mode nuit magique activé ✦'
                    : 'Mode clair activé ♡',
                'default'
            )

            return nextTheme
        })
    }, [showToast])

    if (!hasOnboarded) {
        return (
            <div className={`app-root ${theme}`}>
                <div className="app-shell">
                    <AppHeader theme={theme} onToggleTheme={toggleTheme} />

                    <main>
                        <OnboardingScreen onFinish={() => setHasOnboarded(true)} />
                    </main>
                </div>

                <Toast toast={activeToast} />
            </div>
        )
    }

    return (
        <div className={`app-root ${theme}`}>
            <div className="app-shell">
                <AppHeader theme={theme} onToggleTheme={toggleTheme} />

                <main>
                    <ScreenRenderer
                        activeScreen={activeScreen}
                        onShowToast={showToast}
                        onChangeScreen={setActiveScreen}
                    />
                </main>

                <BottomNav
                    activeScreen={activeScreen}
                    onChangeScreen={setActiveScreen}
                />
            </div>

            <Toast toast={activeToast} />
        </div>
    )
}

export default App