import { useCallback, useEffect } from 'react'
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

export default function CalendarScreen({
                                           onCreateTask,
                                           onGoHome,
                                       }: CalendarScreenProps) {
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
            const groupedEvents = groupCalendarEventsByFrequency(state.data)

            screenState = {
                status: 'success',
                children: (
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
                                        <h2>{calendarFrequencyLabels[frequency]}</h2>
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
                                                        {calendarFrequencyLabels[event.frequency]}
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
                ),
            }
            break
        }
    }

    return (
        <div className="screen">
            <ScreenState {...screenState} />
        </div>
    )
}