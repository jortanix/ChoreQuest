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

const filterLabels: Record<CalendarFilter, string> = {
    today: "Aujourd’hui",
    week: 'Semaine',
    month: 'Mois',
    all: 'Tout',
}

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

export default function CalendarScreen({
    onCreateTask,
    onGoHome,
}: CalendarScreenProps) {
    const [activeFilter, setActiveFilter] = useState<CalendarFilter>('all')

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
            const completedEvents = filteredEvents.filter(
                (event) => event.completed
            ).length
            const pendingEvents = totalEvents - completedEvents

            const spotlightEvent =
                filteredEvents.find((event) => !event.completed) ??
                filteredEvents[0] ??
                null

            const weeklyGoal = Math.max(7, totalEvents || 0)
            const weeklyProgress =
                weeklyGoal === 0
                    ? 0
                    : Math.min(100, Math.round((completedEvents / weeklyGoal) * 100))

            const plannedCount = filteredEvents.filter(
                (event) => !event.completed && event.frequency !== 'daily'
            ).length

            screenState = {
                status: 'success',
                children: (
                    <section className="calendar-screen-content">
                        <div className="home-header">
                            <div>
                                <span className="eyebrow">Planning ménage</span>
                                <h1>Calendrier</h1>
                                <p className="home-subtitle">
                                    Visualise le rythme des tâches et ajuste
                                    l’affichage selon la temporalité.
                                </p>
                            </div>
                        </div>

                        <section className="home-section">
                            <article className="monthly-goal-card weekly-goal-card">
                                <div className="monthly-goal-top">
                                    <span className="monthly-goal-chip">
                                        ♡ Objectif hebdo
                                    </span>

                                    <div className="monthly-goal-icon">🗓️</div>
                                </div>

                                <div className="monthly-goal-copy">
                                    <h2>Garder la semaine claire et bien rythmée.</h2>
                                    <p>
                                        Suis les tâches à faire, celles déjà validées
                                        et la cadence globale du foyer sur la semaine.
                                    </p>
                                </div>

                                <div className="monthly-goal-progress-head">
                                    <div>
                                        <span className="monthly-goal-label">
                                            Progression hebdomadaire
                                        </span>
                                        <strong>
                                            {completedEvents} / {weeklyGoal}
                                        </strong>
                                    </div>

                                    <span className="monthly-goal-pill">
                                        {weeklyProgress}% rempli
                                    </span>
                                </div>

                                <div
                                    className="monthly-goal-bar"
                                    aria-label={`Progression hebdomadaire ${weeklyProgress}%`}
                                >
                                    <div
                                        className="monthly-goal-bar-fill"
                                        style={{ width: `${weeklyProgress}%` }}
                                    >
                                        <span className="monthly-goal-bar-dot">
                                            ♡
                                        </span>
                                    </div>
                                </div>

                                <div className="monthly-goal-stats">
                                    <article className="monthly-mini-card">
                                        <strong>{pendingEvents}</strong>
                                        <span>à faire</span>
                                    </article>

                                    <article className="monthly-mini-card">
                                        <strong>{completedEvents}</strong>
                                        <span>validées</span>
                                    </article>

                                    <article className="monthly-mini-card">
                                        <strong>{plannedCount}</strong>
                                        <span>à planifier</span>
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
                                    <strong>{pendingEvents}</strong>
                                </div>
                                <div className="metric-card">
                                    <span className="metric-label">Terminées</span>
                                    <strong>{completedEvents}</strong>
                                </div>
                            </div>
                        </section>

                        {spotlightEvent ? (
                            <section className="home-section">
                                <div className="section-head">
                                    <h2>Prochaine vue</h2>
                                    <p>Ce qui mérite ton attention maintenant</p>
                                </div>

                                <article
                                    className={`calendar-event-card ${
                                        spotlightEvent.completed
                                            ? 'is-completed'
                                            : ''
                                    }`}
                                >
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
                                <h2>Vue planning</h2>
                                <p>Les événements selon le filtre choisi</p>
                            </div>

                            <div className="card">
                                <div className="calendar-event-list">
                                    {filteredEvents.length === 0 ? (
                                        <p>
                                            Aucune tâche ne correspond à ce filtre
                                            temporel.
                                        </p>
                                    ) : (
                                        filteredEvents.map((event) => {
                                            const tone = getCalendarTone(event)

                                            return (
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
                                        })
                                    )}
                                </div>
                            </div>
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