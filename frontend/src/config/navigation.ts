import type { Screen } from '../types/app'

export type NavItem = {
    screen:    Screen
    label:     string
    icon:      string
    isAction?: boolean
}

export const navigationItems: NavItem[] = [
    { screen: 'home',         label: 'Accueil',  icon: '🏠' },
    { screen: 'calendar',     label: 'Planning', icon: '📅' },
    { screen: 'add',          label: '',         icon: '+',  isAction: true },
    { screen: 'achievements', label: 'Succès',   icon: '🏆' },
    { screen: 'team',         label: 'Équipe',   icon: '👥' },
]