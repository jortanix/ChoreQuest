import { useEffect, useState } from 'react'
import type { ToastItem, ToastType } from '../types/toast'

export function useToastQueue() {
    const [activeToast, setActiveToast] = useState<ToastItem | null>(null)
    const [toastQueue, setToastQueue] = useState<ToastItem[]>([])

    const showToast = (message: string, type: ToastType = 'default') => {
        const nextToast: ToastItem = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            message,
            type,
        }

        setToastQueue((currentQueue) => [...currentQueue, nextToast])
    }

    useEffect(() => {
        if (activeToast || toastQueue.length === 0) return

        const [nextToast, ...restQueue] = toastQueue
        setActiveToast(nextToast)
        setToastQueue(restQueue)
    }, [activeToast, toastQueue])

    useEffect(() => {
        if (!activeToast) return

        const timeout = window.setTimeout(() => {
            setActiveToast(null)
        }, activeToast.type === 'achievement' ? 3000 : 2200)

        return () => window.clearTimeout(timeout)
    }, [activeToast])

    return {
        activeToast,
        showToast,
    }
}