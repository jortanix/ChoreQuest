import type { Screen } from '../types/app'
import { navigationItems } from '../config/navigation'

type BottomNavProps = {
    activeScreen:   Screen
    onChangeScreen: (screen: Screen) => void
}

export default function BottomNav({ activeScreen, onChangeScreen }: BottomNavProps) {
    return (
        <nav className="bottom-nav" aria-label="Navigation principale">
            {navigationItems.map((item) => {
                const isActive = activeScreen === item.screen
                return (
                    <button
                        key={item.screen}
                        className={[
                            'nav-btn',
                            item.isAction            ? 'nav-btn--action' : '',
                            isActive && !item.isAction ? 'nav-btn--active' : '',
                        ].filter(Boolean).join(' ')}
                        onClick={() => onChangeScreen(item.screen)}
                        aria-label={item.label || 'Ajouter une tâche'}
                        aria-current={isActive && !item.isAction ? 'page' : undefined}
                    >
                        <span className="nav-btn__icon">{item.icon}</span>
                        {!item.isAction && (
                            <span className="nav-btn__label">{item.label}</span>
                        )}
                    </button>
                )
            })}
        </nav>
    )
}