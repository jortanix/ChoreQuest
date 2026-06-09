import type { Screen } from '../types/app'

export type NavigationItem = {
    screen: Screen
    label: string
    icon: string
}

export const navigationItems: NavigationItem[] = [
    {
        screen: 'home',
        label: 'Accueil',
        icon: '🏠',
    },
    {
        screen: 'team',
        label: 'Équipe',
        icon: '👥',
    },
    {
        screen: 'calendar',
        label: 'Calendrier',
        icon: '🗓️',
    },
    {
        screen: 'achievements',
        label: 'Succès',
        icon: '🏆',
    },
    {
        screen: 'settings',
        label: 'Réglages',
        icon: '⚙️',
    },
]