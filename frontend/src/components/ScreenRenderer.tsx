import type { Screen } from '../types/app'
import { HomeScreen } from '../screens/HomeScreen'
import TaskFormScreen     from '../screens/TaskFormScreen'
import CalendarScreen     from '../screens/CalendarScreen'
import AchievementsScreen from '../screens/AchievementsScreen'
import TeamScreen         from '../screens/TeamScreen'

type ToastType = 'success' | 'error' | 'default'

type Props = {
    activeScreen:   Screen
    onShowToast:    (msg: string, type: ToastType) => void
    onChangeScreen: (screen: Screen) => void
}

export default function ScreenRenderer({ activeScreen, onShowToast, onChangeScreen }: Props) {
    switch (activeScreen) {
        case 'home':
            return <HomeScreen onShowToast={onShowToast} onChangeScreen={onChangeScreen} />
        case 'add':
            return (
                <TaskFormScreen
                    onSuccess={() => {
                        onShowToast('Tâche créée !', 'success')
                        onChangeScreen('home')
                    }}
                    onCancel={() => onChangeScreen('home')}
                />
            )
        case 'calendar':
            return (
                <CalendarScreen
                    onCreateTask={() => onChangeScreen('add')}
                    onGoHome={() => onChangeScreen('home')}
                />
            )
        case 'achievements':
            return <AchievementsScreen />
        case 'team':
            return <TeamScreen />
        default:
            return null
    }
}