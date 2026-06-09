import type { Screen } from '../types/app'
import { navigationItems } from '../config/navigation'

type BottomNavProps = {
    activeScreen: Screen
    onChangeScreen: (screen: Screen) => void
}

export default function BottomNav({
                                      activeScreen,
                                      onChangeScreen,
                                  }: BottomNavProps) {
    return (
        <nav className="bottom-nav" aria-label="Navigation principale">
            {navigationItems.map((item) => {
                const isActive = activeScreen === item.screen

                return (
                    <button
                        key={item.screen}
                        className={`nav-btn ${isActive ? 'active' : ''}`}
                        onClick={() => onChangeScreen(item.screen)}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                )
            })}
        </nav>
    )
}