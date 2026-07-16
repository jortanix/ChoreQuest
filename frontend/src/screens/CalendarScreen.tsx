import { useState, useMemo } from 'react'
import ScreenState from '../components/ScreenState'
import type { ScreenStateProps } from '../components/ScreenState'
import {
    useCalendarDashboard,
    type CalendarPeriod,
    type PlanningItem,
    type CompletedItem,
} from '../hooks/useCalendarDashboard'

type CompletedSort = 'recent' | 'oldest' | 'alpha'

const filterLabels: Record<CalendarPeriod, string> = {
    today: "Aujourd'hui",
    week:  'Semaine',
    month: 'Mois',
    all:   'Tout',
}

const completedSortLabels: Record<CompletedSort, string> = {
    recent:  'Recentes',
    oldest:  'Anciennes',
    alpha:   'A-Z',
}

const plannerDays = [
    { short: 'L' }, { short: 'M' }, { short: 'M' },
    { short: 'J' }, { short: 'V' }, { short: 'S' }, { short: 'D' },
]

const frequencyLabels: Record<string, string> = {
    daily:   'Quotidien',
    weekly:  'Hebdomadaire',
    monthly: 'Mensuel',
    once:    'Ponctuel',
}

function getDueWeight(label: string): number {
    const v = label.toLowerCase()
    if (v.includes('aujourd')) return 0
    if (v.includes('demain'))  return 1
    if (v.includes('semaine')) return 2
    if (v.includes('mois'))    return 3
    return 4
}

function getCalendarTone(item: PlanningItem) {
    if (item.frequency === 'daily')  return { status: 'A faire',     badgeClass: 'nfc',   marker: '+' }
    if (item.frequency === 'weekly') return { status: 'A planifier', badgeClass: 'alert', marker: 'o' }
    return                                  { status: 'Prevue',      badgeClass: 'rank',  marker: '+' }
}

function sortPlanning(items: PlanningItem[]): PlanningItem[] {
    return [...items].sort((a, b) => {
        if (a.critical !== b.critical) return a.critical ? -1 : 1
        const w = getDueWeight(a.dueLabel) - getDueWeight(b.dueLabel)
        return w !== 0 ? w : a.title.localeCompare(b.title, 'fr')
    })
}

function sortCompleted(items: CompletedItem[], sort: CompletedSort): CompletedItem[] {
    const list = [...items]
    if (sort === 'alpha')  return list.sort((a, b) => a.title.localeCompare(b.title, 'fr'))
    if (sort === 'oldest') return list.sort((a, b) => a.completedAt.localeCompare(b.completedAt))
    return                        list.sort((a, b) => b.completedAt.localeCompare(a.completedAt))
}

function matchesTodayFilter(item: PlanningItem | CompletedItem): boolean {
    return getDueWeight(item.dueLabel) === 0
}

type CalendarScreenProps = {
    onCreateTask: () => void
    onGoHome: () => void
}

export default function CalendarScreen({ onCreateTask, onGoHome }: CalendarScreenProps) {
    const [activeFilter, setActiveFilter]   = useState<CalendarPeriod>('week')
    const [completedSort, setCompletedSort] = useState<CompletedSort>('recent')
    const [refreshKey, setRefreshKey]       = useState(0)

    const { data, loading, error } = useCalendarDashboard(activeFilter, refreshKey)

    // ─── TOUS LES HOOKS AVANT TOUT RETURN ────────────────────────────────────

    const planning = useMemo(() => {
        if (!data) return []
        const base = sortPlanning(data.planning)
        return activeFilter === 'today' ? base.filter(matchesTodayFilter) : base
    }, [data, activeFilter])

    const completed = useMemo(() => {
        if (!data) return []
        const base = sortCompleted(data.completed, completedSort)
        return activeFilter === 'today' ? base.filter(matchesTodayFilter) : base
    }, [data, completedSort, activeFilter])

    const byFrequency = useMemo(() => {
        const groups: Record<string, (PlanningItem | CompletedItem)[]> = {}
        for (const item of [...planning, ...completed]) {
            if (!groups[item.frequency]) groups[item.frequency] = []
            groups[item.frequency].push(item)
        }
        return groups
    }, [planning, completed])

    // ─── Returns conditionnels APRES tous les hooks ───────────────────────────

    if (loading) {
        const s: ScreenStateProps = {
            status:         'loading',
            loadingLabel:   'Chargement du planning menage',
            loadingMessage: 'On prepare les taches a venir...',
            loadingVariant: 'cards',
            loadingCount:   2,
        }
        return <section className="screen"><ScreenState {...s} /></section>
    }

    if (error || !data) {
        const s: ScreenStateProps = {
            status:                    'error',
            errorTitle:                'Impossible de charger le planning',
            errorMessage:              error ?? 'Une erreur est survenue.',
            errorActionLabel:          'Reessayer',
            onErrorAction:             () => setRefreshKey((k) => k + 1),
            errorSecondaryActionLabel: "Retour a l'accueil",
            onErrorSecondaryAction:    onGoHome,
        }
        return <section className="screen"><ScreenState {...s} /></section>
    }

    const spotlightEvent       = planning[0] ?? null
    const totalEvents          = planning.length + completed.length
    const completedEventsCount = completed.length
    const pendingEventsCount   = planning.length
    const weeklyProgress       = data.progress.percentage

    if (totalEvents === 0) {
        const s: ScreenStateProps = {
            status:                    'empty',
            emptyIcon:                 'todo',
            emptyTitle:                'Aucune tache planifiee',
            emptyDescription:          'Ajoute des taches menageres pour construire ton planning.',
            emptyActionLabel:          'Creer une tache',
            onEmptyAction:             onCreateTask,
            emptySecondaryActionLabel: "Retour a l'accueil",
            onEmptySecondaryAction:    onGoHome,
        }
        return <section className="screen"><ScreenState {...s} /></section>
    }

    return (
        <section className="screen">
            <section className="calendar-screen-content">

                <div className="home-header">
                    <div>
                        <span className="eyebrow">Planning menage</span>
                        <h1>Calendrier</h1>
                        <p className="home-subtitle">
                            Une vue pratique du rythme de la semaine et des taches deja bouclees.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn-fab"
                        onClick={onCreateTask}
                        aria-label="Créer une tâche"
                    >
                        +
                    </button>
                </div>

                <section className="home-section">
                    <article className="planner-hero-card">
                        <div className="planner-hero-top">
                            <div>
                                <span className="planner-kicker">Semaine active</span>
                                <h2>Planning des taches</h2>
                                <p>Repere vite ce qui reste a faire et ce qui est deja valide.</p>
                            </div>
                            <div className="planner-hero-score">
                                <strong>{weeklyProgress}%</strong>
                                <span>complete</span>
                            </div>
                        </div>

                        <div className="planner-days-strip">
                            {plannerDays.map((day, index) => {
                                const isActive = index < Math.max(1, Math.round(weeklyProgress / 16))
                                return (
                                    <div key={index} className={`planner-day-pill ${isActive ? 'is-active' : ''}`}>
                                        <span>{day.short}</span>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="planner-summary-grid">
                            <article className="planner-summary-card">
                                <span>A traiter</span>
                                <strong>{data.summary.to_do}</strong>
                            </article>
                            <article className="planner-summary-card">
                                <span>Routines</span>
                                <strong>{data.summary.routines}</strong>
                            </article>
                            <article className="planner-summary-card">
                                <span>Retards</span>
                                <strong>{data.summary.overdue}</strong>
                            </article>
                        </div>
                    </article>
                </section>

                <section className="home-section">
                    <div className="pill-row">
                        {(Object.keys(filterLabels) as CalendarPeriod[]).map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                className={activeFilter === filter ? 'ghost' : 'pill'}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filterLabels[filter]}
                            </button>
                        ))}
                    </div>
                </section>

                <section className="home-section">
                    <div className="home-metrics">
                        <div className="metric-card">
                            <span className="metric-label">Affichees</span>
                            <strong>{totalEvents}</strong>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">A faire</span>
                            <strong>{pendingEventsCount}</strong>
                        </div>
                        <div className="metric-card">
                            <span className="metric-label">Terminees</span>
                            <strong>{completedEventsCount}</strong>
                        </div>
                    </div>
                </section>

                {spotlightEvent && (
                    <section className="home-section">
                        <div className="section-head">
                            <h2>Prochaine tache</h2>
                        </div>
                        <article className="calendar-event-card planning-spotlight-card">
                            <div className="calendar-event-main">
                                <div className="calendar-event-copy">
                                    <h3>{spotlightEvent.title}</h3>
                                </div>
                                <span className="calendar-event-due">{spotlightEvent.dueLabel}</span>
                            </div>
                            <div className="row-badges">
                                <span className="pill">{frequencyLabels[spotlightEvent.frequency]}</span>
                                <span className={`badge ${getCalendarTone(spotlightEvent).badgeClass}`}>
                                    {getCalendarTone(spotlightEvent).status}
                                </span>
                                {spotlightEvent.critical && <span className="badge alert">Critique</span>}
                            </div>
                        </article>
                    </section>
                )}

                <section className="home-section">
                    <div className="section-head"><h2>Planning des taches</h2></div>
                    {planning.length === 0 ? (
                        <div className="card"><p>Aucune tache en attente pour ce filtre.</p></div>
                    ) : (
                        <div className="calendar-event-list">
                            {planning.map((event) => {
                                const tone = getCalendarTone(event)
                                return (
                                    <article key={event.id} className="calendar-event-card planning-card">
                                        <div className="calendar-event-main">
                                            <div className="calendar-event-copy">
                                                <h3>{event.title}</h3>
                                            </div>
                                            <span className="calendar-event-due">{event.dueLabel}</span>
                                        </div>
                                        <div className="calendar-event-footer">
                                            <span className="calendar-event-frequency">
                                                {tone.marker} {frequencyLabels[event.frequency]}
                                            </span>
                                            <span className={`calendar-event-status badge ${tone.badgeClass}`}>
                                                {tone.status}
                                            </span>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    )}
                </section>

                <section className="home-section">
                    <div className="section-head"><h2>Taches completees</h2></div>
                    <div className="pill-row">
                        {(Object.keys(completedSortLabels) as CompletedSort[]).map((sortKey) => (
                            <button
                                key={sortKey}
                                type="button"
                                className={completedSort === sortKey ? 'ghost' : 'pill'}
                                onClick={() => setCompletedSort(sortKey)}
                            >
                                {completedSortLabels[sortKey]}
                            </button>
                        ))}
                    </div>
                    {completed.length === 0 ? (
                        <div className="card"><p>Aucune tache completee pour ce filtre.</p></div>
                    ) : (
                        <div className="calendar-event-list">
                            {completed.map((event) => (
                                <article key={event.id} className="calendar-event-card is-completed">
                                    <div className="calendar-event-main">
                                        <div className="calendar-event-copy">
                                            <h3>{event.title}</h3>
                                        </div>
                                        <span className="calendar-event-due">{event.dueLabel}</span>
                                    </div>
                                    <div className="calendar-event-footer">
                                        <span className="calendar-event-frequency">
                                            {frequencyLabels[event.frequency]}
                                        </span>
                                        <span className="calendar-event-status badge pet">Terminee</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="home-section">
                    <div className="section-head"><h2>Repartition</h2></div>
                    <div className="calendar-screen-content">
                        {(['daily', 'weekly', 'monthly', 'once'] as const).map((freq) => {
                            const items = byFrequency[freq] ?? []
                            if (items.length === 0) return null
                            return (
                                <section key={freq} className="calendar-section">
                                    <div className="calendar-section-header">
                                        <h2>{frequencyLabels[freq]}</h2>
                                        <span>{items.length} tache{items.length > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="calendar-event-list">
                                        {items.map((item) => {
                                            const isDone = 'completedAt' in item
                                            return (
                                                <article key={item.id} className={`calendar-event-card ${isDone ? 'is-completed' : ''}`}>
                                                    <div className="calendar-event-main">
                                                        <div className="calendar-event-copy">
                                                            <h3>{item.title}</h3>
                                                        </div>
                                                        <span className="calendar-event-due">{item.dueLabel}</span>
                                                    </div>
                                                    <div className="calendar-event-footer">
                                                        <span>{frequencyLabels[item.frequency]}</span>
                                                        <span>{isDone ? 'Terminee' : 'A faire'}</span>
                                                    </div>
                                                </article>
                                            )
                                        })}
                                    </div>
                                </section>
                            )
                        })}
                    </div>
                </section>

            </section>
        </section>
    )
}