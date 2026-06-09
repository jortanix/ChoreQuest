import { useEffect, useMemo, useRef } from 'react'
import { useTasks } from '../context/useTasks'
import { getDerivedBadges } from '../utils/badges'
import type { ToastType } from '../types/toast'

type ShowToast = (message: string, type?: ToastType) => void

export function useAchievementToasts(showToast: ShowToast) {
    const { taskList, completionHistory } = useTasks()

    const previousUnlockedIdsRef = useRef<string[]>([])
    const hasMountedRef = useRef(false)

    const unlockedBadges = useMemo(() => {
        return getDerivedBadges(completionHistory, taskList).filter(
            (badge) => badge.unlocked
        )
    }, [completionHistory, taskList])

    useEffect(() => {
        const currentIds = unlockedBadges.map((badge) => badge.id)

        if (!hasMountedRef.current) {
            previousUnlockedIdsRef.current = currentIds
            hasMountedRef.current = true
            return
        }

        const previousIds = previousUnlockedIdsRef.current

        const newlyUnlocked = unlockedBadges.filter(
            (badge) => !previousIds.includes(badge.id)
        )

        newlyUnlocked.forEach((badge, index) => {
            window.setTimeout(() => {
                showToast(`🏆 Badge débloqué : ${badge.title}`, 'achievement')
            }, index * 1200)
        })

        previousUnlockedIdsRef.current = currentIds
    }, [unlockedBadges, showToast])
}