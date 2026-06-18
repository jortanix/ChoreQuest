import { useCallback, useEffect, useState } from 'react'
import ScreenState from '../components/ScreenState'
import type { ScreenStateProps } from '../components/ScreenState'
import { useAsyncState } from '../hooks/useAsyncState'
import { calendarEventsMock } from '../mocks/calendarEvents'
import { calendarFrequencyLabels, type CalendarEvent } from '../types/calendar'
import {
    groupCalendarEventsByFrequency,
    orderedCalendarFrequencies,
} from '../utils/calendar'

type CalendarScreenProps = {
    onCreateTask: () => void
    onGoHome: () => void
}

type CalendarFilter = 'today' | 'week' | 'month' | 'all'
type CompletedSort = 'recent' | 'oldest' | 'alpha'

const filterLabels: Record<CalendarFilter, string> = {
    today: "Aujourd’hui",
    week: 'Semaine',
    month: 'Mois',
    all: 'Tout',
}

const completedSortLabels: Record<CompletedSort, string> = {
    recent: 'Récentes',
    oldest: 'Anciennes',
    alpha: 'A-Z',
}

const plannerDays = [
    { short: 'L', label: 'Lun' },
    { short: 'M', label: 'Mar' },
    { short: 'M', label: 'Mer' },
    { short: 'J', label: 'Jeu' },
    { short: 'V', label: 'Ven' },
    { short: 'S', label: 'Sam' },
    { short: 'D', label: 'Dim' },
]

function matchesTemporalFilter(
    event: CalendarEvent,
    filter: CalendarFilter
): boolean {
    const value = `${event.dueLabel} ${event.frequency}`.toLowerCase()

    if (filter === 'all') return true

    if (filter === 'today') {
        return (
            value.includes('aujourd') ||
            value.includes('today') ||
            value.includes('ce jour')
        )
    }

    if (filter === 'week') {
        return (
            value.includes('semaine') ||
            value.includes('weekly') ||
            value.includes('week')
        )
    }

    if (filter === 'month') {
        return (
            value.includes('mois') ||
            value.includes('monthly') ||
            value.includes('month')
        )
    }

    return true
}

function getCalendarTone(event: CalendarEvent) {
    if (event.completed) {
        return {
            status: 'Terminée',
            badgeClass: 'pet',
            marker: '✓',
        }
    }

    if (event.frequency === 'daily') {
        return {
            status: 'À faire',
            badgeClass: 'nfc',
            marker: '•',
        }
    }

    if (event.frequency === 'weekly') {
        return {
            status: 'À planifier',
            badgeClass: 'alert',
            marker: '◦',
        }
    }

    return {
        status: 'Prévue',
        badgeClass: 'rank',
        marker: '•',
    }
}

function getDueWeight(label: string): number {
    const value = label.toLowerCase()

    if (value.includes('aujourd')) return 0
    if (value.includes('demain')) return 1
    if (value.includes('semaine')) return 2
    if (value.includes('mois')) return 3
    return 4
}

function sortPlannedEvents(events: CalendarEvent[]) {
    return [...events].sort((a, b) => {
        const weightDiff = getDueWeight(a.dueLabel) - getDueWeight(b.dueLabel)
        if (weightDiff !== 0) return weightDiff

        return a.title.localeCompare(b.title, 'fr')
    })
}

function sortCompletedEvents(
    events: CalendarEvent[],
    sort: CompletedSort
): CalendarEvent[] {
    const list = [...events]

    if (sort === 'alpha') {
        return list.sort((a, b) => a.title.localeCompare(b.title, 'fr'))
    }

    if (sort === 'oldest') {
        return list.sort((a, b) => {
            const weightDiff = getDueWeight(a.dueLabel) - getDueWeight(b.dueLabel)
            if (weightDiff !== 0) return weightDiff
            return a.title.localeCompare(b.title, 'fr')
        })
    }

    return list.sort((a, b) => {
        const weightDiff = getDueWeight(b.dueLabel) - getDueWeight(a.dueLabel)
        if (weightDiff !== 0) return weightDiff
        return a.title.localeCompare(b.title, 'fr')
    })
}

export default function CalendarScreen({
    onCreateTask,
    onGoHome,
}: CalendarScreenProps) {
    const [activeFilter, setActiveFilter] = useState<CalendarFilter>('all')
    const [completedSort, setCompletedSort] = useState<CompletedSort>('recent')

    const loadCalendarEvents = useCallback(async (): Promise<CalendarEvent[]> => {
        await new Promise((resolve) => setTimeout(resolve, 800))
        return calendarEventsMock
    }, [])

    const isCalendarEmpty = useCallback((events: CalendarEvent[]) => {
        return events.length === 0
    }, [])

    const { state, execute } = useAsyncState(loadCalendarEvents, {
        isEmpty: isCalendarEmpty,
    })

    useEffect(() => {
        void execute()
    }, [execute])

    let screenState: ScreenStateProps

    switch (state.status) {
        case 'idle':
            screenState = {
                status: 'loading',
                loadingLabel: 'Initialisation',
                loadingMessage: 'Un instant…',
                loadingVariant: 'inline',
                loadingCount: 1,
            }
            break

        case 'loading':
            screenState = {
                status: 'loading',
                loadingLabel: 'Chargement du planning ménage',
                loadingMessage: 'On prépare les tâches à venir…',
                loadingVariant: 'cards',
                loadingCount: 2,
            }
            break

        case 'empty':
            screenState = {
                status: 'empty',
                emptyIcon: '🗓️',
                emptyTitle: 'Aucune tâche planifiée',
                emptyDescription:
                    'Ajoute quelques tâches ménagères pour construire ton planning.',
                emptyActionLabel: 'Créer une tâche',
                onEmptyAction: onCreateTask,
                emptySecondaryActionLabel: 'Retour à l’accueil',
                onEmptySecondaryAction: onGoHome,
            }
            break

        case 'error':
            screenState = {
                status: 'error',
                errorTitle: 'Impossible de charger le planning',
                errorMessage:
                    state.error ||
                    'Une erreur empêche l’affichage du planning pour le moment.',
                errorActionLabel: 'Réessayer',
                onErrorAction: () => {
                    void execute()
                },
                errorSecondaryActionLabel: 'Retour à l’accueil',
                onErrorSecondaryAction: onGoHome,
            }
            break

        case 'success': {
            const filteredEvents = state.data.filter((event) =>
                matchesTemporalFilter(event, activeFilter)
            )

            const groupedEvents = groupCalendarEventsByFrequency(filteredEvents)
            const totalEvents = filteredEvents.length
            const completedEventsCount = filteredEvents.filter(
                (event) => event.completed
            ).length
            const pendingEventsCount = totalEvents - completedEventsCount

            const spotlightEvent =
                filteredEvents.find((event) => !event.completed) ??
                filteredEvents[0] ??
                null

            const plannedCount = filteredEvents.filter(
                (event) => !event.completed && event.frequency !== 'daily'
            ).length

            const dailyCount = filteredEvents.filter(
                (event) => !event.completed && event.frequency === 'daily'
            ).length

            const weeklyProgress =
                totalEvents === 0
                    ? 0
                    : Math.min(100, Math.round((completedEventsCount / totalEvents) * 100))

            const plannedEvents = sortPlannedEvents(
                filteredEvents.filter((event) => !event.completed)
            )

            const completedEvents = sortCompletedEvents(
                filteredEvents.filter((event) => event.completed),
                completedSort
            )

            screenState = {
                status: 'success',
                children: (
                    <section className="calendar-screen-content">
                        <div className="home-header">
                            <div>
                                <span className="eyebrow">Planning ménage</span>
                                <h1>Calendrier</h1>
                                <p className="home-subtitle">
                                    Une vue pratique du rythme de la semaine et des
                                    tâches déjà bouclées.
                                </p>
                            </div>
                        </div>

                        <section className="home-section">
                            <article className="planner-hero-card">
                                <div className="planner-hero-top">
                                    <div>
                                        <span className="planner-kicker">
                                            Semaine active
                                        </span>
                                        <h2>Planning des tâches</h2>
                                        <p>
                                            Repère vite ce qui reste à faire, ce qui
                                            revient chaque jour et ce qui est déjà validé.
                                        </p>
                                    </div>

                                    <div className="planner-hero-score">
                                        <strong>{weeklyProgress}%</strong>
                                        <span>complété</span>
                                    </div>
                                </div>

                                <div className="planner-days-strip">
                                    {plannerDays.map((day, index) => {
                                        const isActive = index < Math.max(1, Math.round(weeklyProgress / 16))

                                        return (
                                            <div
                                                key={`${day.label}-${index}`}
                                                className={`planner-day-pill ${
                                                    isActive ? 'is-active' : ''
                                                }`}
                                            >
                                                <span>{day.short}</span>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="planner-summary-grid">
                                    <article className="planner-summary-card">
                                        <span>À traiter</span>
                                        <strong>{pendingEventsCount}</strong>
                                    </article>

                                    <article className="planner-summary-card">
                                        <span>Routines</span>
                                        <strong>{dailyCount}</strong>
                                    </article>

                                    <article className="planner-summary-card">
                                        <span>Prévisions</span>
                                        <strong>{plannedCount}</strong>
                                    </article>
                                </div>
                            </article>
                        </section>

                        <section className="home-section">
                            <div className="pill-row">
                                {(Object.keys(filterLabels) as CalendarFilter[]).map(
                                    (filter) => (
                                        <button
                                            key={filter}
                                            type="button"
                                            className={
                                                activeFilter === filter
                                                    ? 'ghost'
                                                    : 'pill'
                                            }
                                            onClick={() => setActiveFilter(filter)}
                                        >
                                            {filterLabels[filter]}
                                        </button>
                                    )
                                )}
                            </div>
                        </section>

                        <section className="home-section">
                            <div className="home-metrics">
                                <div className="metric-card">
                                    <span className="metric-label">Affichées</span>
                                    <strong>{totalEvents}</strong>
                                </div>
                                <div className="metric-card">
                                    <span className="metric-label">À faire</span>
                                    <strong>{pendingEventsCount}</strong>
                                </div>
                                <div className="metric-card">
                                    <span className="metric-label">Terminées</span>
                                    <strong>{completedEventsCount}</strong>
                                </div>
                            </div>
                        </section>

                        {spotlightEvent ? (
                            <section className="home-section">
                                <div className="section-head">
                                    <h2>Prochaine tâche</h2>
                                    <p>Le prochain point d’attention</p>
                                </div>

                                <article className="calendar-event-card planning-spotlight-card">
                                    <div className="calendar-event-main">
                                        <div className="calendar-event-copy">
                                            <h3>{spotlightEvent.title}</h3>
                                            <p>{spotlightEvent.area}</p>
                                        </div>

                                        <span className="calendar-event-due">
                                            {spotlightEvent.dueLabel}
                                        </span>
                                    </div>

                                    <div className="row-badges">
                                        <span className="pill">
                                            {
                                                calendarFrequencyLabels[
                                                    spotlightEvent.frequency
                                                ]
                                            }
                                        </span>
                                        <span
                                            className={`badge ${
                                                getCalendarTone(spotlightEvent)
                                                    .badgeClass
                                            }`}
                                        >
                                            {getCalendarTone(spotlightEvent).status}
                                        </span>
                                    </div>
                                </article>
                            </section>
                        ) : null}

                        <section className="home-section">
                            <div className="section-head">
                                <h2>Planning des tâches</h2>
                                <p>Les tâches actives à venir</p>
                            </div>

                            {plannedEvents.length === 0 ? (
                                <div className="card">
                                    <p>Aucune tâche en attente pour ce filtre.</p>
                                </div>
                            ) : (
                                <div className="calendar-event-list">
                                    {plannedEvents.map((event) => {
                                        const tone = getCalendarTone(event)

                                        return (
                                            <article
                                                key={event.id}
                                                className="calendar-event-card planning-card"
                                            >
                                                <div className="calendar-event-main">
                                                    <div className="calendar-event-copy">
                                                        <h3>{event.title}</h3>
                                                        <p>{event.area}</p>
                                                    </div>

                                                    <span className="calendar-event-due">
                                                        {event.dueLabel}
                                                    </span>
                                                </div>

                                                <div className="calendar-event-footer">
                                                    <span className="calendar-event-frequency">
                                                        {tone.marker}{' '}
                                                        {
                                                            calendarFrequencyLabels[
                                                                event.frequency
                                                            ]
                                                        }
                                                    </span>
                                                    <span
                                                        className={`calendar-event-status badge ${tone.badgeClass}`}
                                                    >
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
                            <div className="section-head">
                                <h2>Tâches complétées</h2>
                                <p>Triables et séparées du planning actif</p>
                            </div>

                            <div className="pill-row">
                                {(Object.keys(
                                    completedSortLabels
                                ) as CompletedSort[]).map((sortKey) => (
                                    <button
                                        key={sortKey}
                                        type="button"
                                        className={
                                            completedSort === sortKey ? 'ghost' : 'pill'
                                        }
                                        onClick={() => setCompletedSort(sortKey)}
                                    >
                                        {completedSortLabels[sortKey]}
                                    </button>
                                ))}
                            </div>

                            {completedEvents.length === 0 ? (
                                <div className="card">
                                    <p>Aucune tâche complétée pour ce filtre.</p>
                                </div>
                            ) : (
                                <div className="calendar-event-list completed-event-list">
                                    {completedEvents.map((event) => (
                                        <article
                                            key={event.id}
                                            className="calendar-event-card is-completed completed-card"
                                        >
                                            <div className="calendar-event-main">
                                                <div className="calendar-event-copy">
                                                    <h3>{event.title}</h3>
                                                    <p>{event.area}</p>
                                                </div>

                                                <span className="calendar-event-due">
                                                    {event.dueLabel}
                                                </span>
                                            </div>

                                            <div className="calendar-event-footer">
                                                <span className="calendar-event-frequency">
                                                    ✓{' '}
                                                    {
                                                        calendarFrequencyLabels[
                                                            event.frequency
                                                        ]
                                                    }
                                                </span>
                                                <span className="calendar-event-status badge pet">
                                                    Terminée
                                                </span>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="home-section">
                            <div className="section-head">
                                <h2>Répartition</h2>
                                <p>Lecture par fréquence</p>
                            </div>

                            <div className="calendar-screen-content">
                                {orderedCalendarFrequencies.map((frequency) => {
                                    const events = groupedEvents[frequency]

                                    if (events.length === 0) {
                                        return null
                                    }

                                    return (
                                        <section
                                            key={frequency}
                                            className="calendar-section"
                                        >
                                            <div className="calendar-section-header">
                                                <h2>
                                                    {calendarFrequencyLabels[frequency]}
                                                </h2>
                                                <span>{events.length} tâches</span>
                                            </div>

                                            <div className="calendar-event-list">
                                                {events.map((event) => (
                                                    <article
                                                        key={event.id}
                                                        className={`calendar-event-card ${
                                                            event.completed
                                                                ? 'is-completed'
                                                                : ''
                                                        }`}
                                                    >
                                                        <div className="calendar-event-main">
                                                            <div className="calendar-event-copy">
                                                                <h3>{event.title}</h3>
                                                                <p>{event.area}</p>
                                                            </div>

                                                            <span className="calendar-event-due">
                                                                {event.dueLabel}
                                                            </span>
                                                        </div>

                                                        <div className="calendar-event-footer">
                                                            <span className="calendar-event-frequency">
                                                                {
                                                                    calendarFrequencyLabels[
                                                                        event.frequency
                                                                    ]
                                                                }
                                                            </span>
                                                            <span className="calendar-event-status">
                                                                {event.completed
                                                                    ? 'Terminée'
                                                                    : 'À faire'}
                                                            </span>
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>
                                        </section>
                                    )
                                })}
                            </div>
                        </section>
                    </section>
                ),
            }
            break
        }
    }

    return (
        <section className="screen">
            <ScreenState {...screenState} />
        </section>
    )
}