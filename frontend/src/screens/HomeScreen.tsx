import { useMemo, useState } from 'react'
import type { Task } from '../types'
import { useTasks } from '../context/useTasks'
import { getDueSoonTasks, getOverdueTasks } from '../utils/streaks'
import { NfcScanFlow } from '../components/nfc/NfcScanFlow'
import { TaskDetailsSheet } from '../components/home/TaskDetailsSheet'

type ToastType = 'success' | 'error' | 'info'

type ToastState = {
    message: string
    type: ToastType
} | null

type NfcMode = 'complete-task' | 'link-task' | 'quick-scan'

function getFeaturedTasks(tasks: Task[]) {
    return [...tasks]
        .filter((task) => !task.completedToday)
        .sort((a, b) => {
            if ((a.critical ?? false) !== (b.critical ?? false)) {
                return a.critical ? -1 : 1
            }

            if ((a.needsNfc ?? false) !== (b.needsNfc ?? false)) {
                return a.needsNfc ? -1 : 1
            }

            return b.points - a.points
        })
        .slice(0, 8)
}

function getTodayPoints(taskList: Task[], completionHistoryLength: number) {
    const today = new Date()
    const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    ).getTime()

    return taskList
        .filter((task) => {
            if (!task.lastCompletedAt) return false
            return new Date(task.lastCompletedAt).getTime() >= todayStart
        })
        .reduce((total, task) => total + task.points, 0) + completionHistoryLength * 0
}

function getBestLiveStreak(taskList: Task[]) {
    return taskList.reduce((best, task) => {
        const streak = task.currentStreak ?? 0
        return Math.max(best, streak)
    }, 0)
}

function getUnlockedBadgesCount(taskList: Task[]) {
    return taskList.filter((task) => (task.bestStreak ?? 0) >= 7).length
}

function getHotStreakTasks(taskList: Task[]) {
    return [...taskList]
        .filter((task) => (task.currentStreak ?? 0) >= 2)
        .sort((a, b) => (b.currentStreak ?? 0) - (a.currentStreak ?? 0))
        .slice(0, 3)
}

function getNextBadge(taskList: Task[]) {
    const candidate = [...taskList]
        .filter((task) => (task.bestStreak ?? 0) < 7)
        .sort((a, b) => {
            const aGap = 7 - (a.bestStreak ?? 0)
            const bGap = 7 - (b.bestStreak ?? 0)
            return aGap - bGap
        })[0]

    if (!candidate) return null

    return {
        taskId: candidate.id,
        taskTitle: candidate.title,
        current: candidate.bestStreak ?? 0,
        target: 7,
    }
}

export function HomeScreen() {
    const {
        taskList,
        completionHistory,
        completeTaskById,
        getNfcBindingByTaskId,
    } = useTasks()

    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false)
    const [isNfcOpen, setIsNfcOpen] = useState(false)
    const [nfcMode, setNfcMode] = useState<NfcMode>('quick-scan')
    const [toast, setToast] = useState<ToastState>(null)

    const featuredTasks = useMemo(() => getFeaturedTasks(taskList), [taskList])
    const overdueTasks = useMemo(() => getOverdueTasks(taskList), [taskList])
    const dueSoonTasks = useMemo(() => getDueSoonTasks(taskList), [taskList])
    const hotStreakTasks = useMemo(() => getHotStreakTasks(taskList), [taskList])

    const todayPoints = useMemo(
        () => getTodayPoints(taskList, completionHistory.length),
        [taskList, completionHistory.length]
    )

    const bestLiveStreak = useMemo(
        () => getBestLiveStreak(taskList),
        [taskList]
    )

    const unlockedBadgesCount = useMemo(
        () => getUnlockedBadgesCount(taskList),
        [taskList]
    )

    const nextBadge = useMemo(() => getNextBadge(taskList), [taskList])

    const selectedTaskBinding = useMemo(() => {
        if (!selectedTask) return null
        return getNfcBindingByTaskId(selectedTask.id)
    }, [selectedTask, getNfcBindingByTaskId])

    const selectedTaskHistory = useMemo(() => {
        if (!selectedTask) return []
        return completionHistory.filter(
            (event) => event.taskId === selectedTask.id
        ).slice(0, 5)
    }, [selectedTask, completionHistory])

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type })
        window.setTimeout(() => {
            setToast(null)
        }, 2500)
    }

    const openTask = (task: Task) => {
        setSelectedTask(task)
        setIsTaskSheetOpen(true)
    }

    const closeTaskSheet = () => {
        setIsTaskSheetOpen(false)
    }

    const handlePrimaryAction = (task: Task) => {
        const binding = getNfcBindingByTaskId(task.id)

        if (task.needsNfc) {
            setSelectedTask(task)
            setNfcMode(binding ? 'complete-task' : 'link-task')
            setIsNfcOpen(true)
            return
        }

        completeTaskById(task.id)
        showToast(`Tâche "${task.title}" validée.`, 'success')
    }

    const handleOpenQuickScan = () => {
        setSelectedTask(null)
        setNfcMode('quick-scan')
        setIsNfcOpen(true)
    }

    const handleLinkNfc = (task: Task) => {
        setSelectedTask(task)
        setNfcMode('link-task')
        setIsNfcOpen(true)
    }

    const handleStartTaskNfcValidation = (task: Task) => {
        setSelectedTask(task)
        setNfcMode('complete-task')
        setIsNfcOpen(true)
    }

    return (
        <main className="home-screen">
            <header className="home-header">
                <div>
                    <p className="eyebrow">Aujourd’hui</p>
                    <h1>Chanti</h1>
                    <p className="home-subtitle">
                        Garde le rythme sur tes tâches ménagères.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleOpenQuickScan}
                >
                    Scanner un badge
                </button>
            </header>

            <section className="home-metrics" aria-label="Vue d’ensemble">
                <article className="metric-card">
                    <span className="metric-label">Points du jour</span>
                    <strong className="metric-value">{todayPoints}</strong>
                </article>

                <article className="metric-card">
                    <span className="metric-label">Streak active max</span>
                    <strong className="metric-value">{bestLiveStreak}</strong>
                </article>

                <article className="metric-card">
                    <span className="metric-label">Badges débloqués</span>
                    <strong className="metric-value">{unlockedBadgesCount}</strong>
                </article>
            </section>

            <section className="home-section">
                <div className="section-header">
                    <h2>À faire maintenant</h2>
                </div>

                <div className="task-list">
                    {featuredTasks.length === 0 && (
                        <p className="empty-label">Aucune tâche prioritaire pour le moment.</p>
                    )}

                    {featuredTasks.map((task) => {
                        const binding = getNfcBindingByTaskId(task.id)

                        return (
                            <article key={task.id} className="task-card">
                                <div className="task-card-main">
                                    <div className="task-card-top">
                                        <h3>{task.title}</h3>
                                        <div className="task-badges">
                                            {task.critical && (
                                                <span className="badge badge-danger">Critique</span>
                                            )}
                                            {task.needsNfc && (
                                                <span className="badge badge-info">NFC</span>
                                            )}
                                        </div>
                                    </div>

                                    <p className="task-meta">
                                        {task.frequency} · {task.points} pts
                                    </p>

                                    <p className="task-status">
                                        {task.needsNfc
                                            ? binding
                                                ? `Badge lié : ${binding.tagLabel ?? binding.tagId}`
                                                : 'NFC à configurer'
                                            : 'Validation manuelle'}
                                    </p>
                                </div>

                                <div className="task-card-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => openTask(task)}
                                    >
                                        Voir
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => handlePrimaryAction(task)}
                                    >
                                        {task.needsNfc
                                            ? binding
                                                ? 'Scanner NFC'
                                                : 'Configurer NFC'
                                            : 'Valider'}
                                    </button>
                                </div>
                            </article>
                        )
                    })}
                </div>
            </section>

            <section className="home-section">
                <div className="section-header">
                    <h2>Urgent</h2>
                </div>

                <div className="task-list">
                    {overdueTasks.map((task) => (
                        <article key={`overdue-${task.id}`} className="task-card task-card-alert">
                            <div className="task-card-main">
                                <h3>{task.title}</h3>
                                <p className="task-meta">En retard · {task.points} pts</p>
                            </div>
                            <div className="task-card-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => openTask(task)}
                                >
                                    Voir
                                </button>
                            </div>
                        </article>
                    ))}

                    {dueSoonTasks.map((task) => (
                        <article key={`soon-${task.id}`} className="task-card">
                            <div className="task-card-main">
                                <h3>{task.title}</h3>
                                <p className="task-meta">Bientôt due · {task.points} pts</p>
                            </div>
                            <div className="task-card-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => openTask(task)}
                                >
                                    Voir
                                </button>
                            </div>
                        </article>
                    ))}

                    {overdueTasks.length === 0 && dueSoonTasks.length === 0 && (
                        <p className="empty-label">Rien d’urgent pour l’instant.</p>
                    )}
                </div>
            </section>

            {nextBadge && (
                <section className="home-section">
                    <div className="section-header">
                        <h2>Prochain badge</h2>
                    </div>

                    <article className="next-badge-card">
                        <h3>{nextBadge.taskTitle}</h3>
                        <p>
                            Progression : {nextBadge.current}/{nextBadge.target}
                        </p>
                    </article>
                </section>
            )}

            {hotStreakTasks.length > 0 && (
                <section className="home-section">
                    <div className="section-header">
                        <h2>Hot streaks</h2>
                    </div>

                    <div className="task-list">
                        {hotStreakTasks.map((task) => (
                            <article key={`hot-${task.id}`} className="task-card">
                                <div className="task-card-main">
                                    <h3>{task.title}</h3>
                                    <p className="task-meta">
                                        Streak actuelle : {task.currentStreak ?? 0}
                                    </p>
                                </div>

                                <div className="task-card-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => openTask(task)}
                                    >
                                        Voir
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            <TaskDetailsSheet
                isOpen={isTaskSheetOpen}
                task={selectedTask}
                nfcBinding={selectedTaskBinding}
                recentCompletions={selectedTaskHistory}
                onClose={closeTaskSheet}
                onComplete={(task) => {
                    completeTaskById(task.id)
                    showToast(`Tâche "${task.title}" validée.`, 'success')
                }}
                onStartNfcScan={handleStartTaskNfcValidation}
                onLinkNfc={handleLinkNfc}
                onUnlinkNfc={() => {
                    showToast('Suppression NFC à brancher.', 'info')
                }}
            />

            <NfcScanFlow
                isOpen={isNfcOpen}
                mode={nfcMode}
                task={selectedTask}
                onClose={() => setIsNfcOpen(false)}
                onShowToast={showToast}
            />

            {toast && (
                <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
                    {toast.message}
                </div>
            )}
        </main>
    )
}