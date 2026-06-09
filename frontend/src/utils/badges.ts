import type { CompletionEvent, Task } from '../types'

export type DerivedBadge = {
    id: string
    icon: string
    title: string
    description: string
    unlocked: boolean
    progressLabel: string
    tone: 'gold' | 'teal' | 'pink' | 'default'
}

export function getDerivedBadges(
    completionHistory: CompletionEvent[],
    taskList: Task[]
): DerivedBadge[] {
    const totalCompletions = completionHistory.length
    const totalPoints = completionHistory.reduce((sum, event) => sum + event.points, 0)
    const nfcCompletions = completionHistory.filter((event) => event.needsNfc).length
    const bestStreak = taskList.reduce(
        (max, task) => Math.max(max, task.bestStreak ?? 0),
        0
    )

    return [
        {
            id: 'first-step',
            icon: '🌱',
            title: 'Premier pas',
            description: 'Valider une première tâche.',
            unlocked: totalCompletions >= 1,
            progressLabel: `${Math.min(totalCompletions, 1)}/1`,
            tone: 'teal',
        },
        {
            id: 'ten-completions',
            icon: '✅',
            title: 'Routine lancée',
            description: 'Atteindre 10 validations au total.',
            unlocked: totalCompletions >= 10,
            progressLabel: `${Math.min(totalCompletions, 10)}/10`,
            tone: 'default',
        },
        {
            id: 'fifty-points',
            icon: '⭐',
            title: 'Collecteur d’étoiles',
            description: 'Cumuler 50 points.',
            unlocked: totalPoints >= 50,
            progressLabel: `${Math.min(totalPoints, 50)}/50`,
            tone: 'gold',
        },
        {
            id: 'first-nfc',
            icon: '📶',
            title: 'Scan magique',
            description: 'Réaliser une première validation NFC.',
            unlocked: nfcCompletions >= 1,
            progressLabel: `${Math.min(nfcCompletions, 1)}/1`,
            tone: 'teal',
        },
        {
            id: 'streak-3',
            icon: '🔥',
            title: 'Sur la lancée',
            description: 'Atteindre une streak de 3.',
            unlocked: bestStreak >= 3,
            progressLabel: `${Math.min(bestStreak, 3)}/3`,
            tone: 'pink',
        },
        {
            id: 'streak-7',
            icon: '🏅',
            title: 'Régularité solide',
            description: 'Atteindre une streak de 7.',
            unlocked: bestStreak >= 7,
            progressLabel: `${Math.min(bestStreak, 7)}/7`,
            tone: 'gold',
        },
    ]
}