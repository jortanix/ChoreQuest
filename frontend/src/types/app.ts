export const APP_SCREENS = [
    'home',
    'team',
    'calendar',
    'achievements',
    'settings',
] as const

export type Screen = (typeof APP_SCREENS)[number]

export type ThemeMode = 'light' | 'dark'