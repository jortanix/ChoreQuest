import HomeScreen from '../screens/HomeScreen'
import TeamScreen from '../screens/TeamScreen'
import CalendarScreen from '../screens/CalendarScreen'
import SettingsScreen from '../screens/SettingsScreen'
import AchievementsScreen from '../screens/AchievementsScreen'
import type { ToastType } from '../types/toast'
import type { Screen } from '../types/app'

type ScreenRendererProps = {
    activeScreen: Screen
    onShowToast: (message: string, type?: ToastType) => void
    onChangeScreen: (screen: Screen) => void
}

export default function ScreenRenderer({
                                           activeScreen,
                                           onShowToast,
                                           onChangeScreen,
                                       }: ScreenRendererProps) {
    if (activeScreen === 'home') {
        return <HomeScreen onShowToast={onShowToast} />
    }

    if (activeScreen === 'team') {
        return <TeamScreen />
    }

    if (activeScreen === 'calendar') {
        return (
            <CalendarScreen
                onCreateTask={() => {
                    onChangeScreen('home')
                    onShowToast('Ajoute une nouvelle tâche depuis l’accueil ✨')
                }}
                onGoHome={() => onChangeScreen('home')}
            />
        )
    }

    if (activeScreen === 'achievements') {
        return <AchievementsScreen onGoHome={() => onChangeScreen('home')} />
    }

    return <SettingsScreen />
}