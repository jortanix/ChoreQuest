import type { ReactNode } from 'react'

type ErrorStateProps = {
    title?: string
    message?: string
    actionLabel?: string
    onAction?: () => void
    secondaryActionLabel?: string
    onSecondaryAction?: () => void
    icon?: string
    children?: ReactNode
    className?: string
}

export default function ErrorState({
                                       title = 'Oups, quelque chose s’est mal passé',
                                       message = 'Impossible de charger ce contenu pour le moment. Réessaie dans un instant.',
                                       actionLabel = 'Réessayer',
                                       onAction,
                                       secondaryActionLabel,
                                       onSecondaryAction,
                                       icon = '⚠️',
                                       children,
                                       className = '',
                                   }: ErrorStateProps) {
    const hasPrimaryAction = Boolean(actionLabel && onAction)
    const hasSecondaryAction = Boolean(secondaryActionLabel && onSecondaryAction)

    return (
        <section
            className={['error-state', className].filter(Boolean).join(' ')}
            role="alert"
            aria-live="assertive"
        >
            <div className="error-state-visual" aria-hidden="true">
                {icon}
            </div>

            <div className="error-state-copy">
                <h2 className="error-state-title">{title}</h2>
                <p className="error-state-message">{message}</p>
            </div>

            {(hasPrimaryAction || hasSecondaryAction) && (
                <div className="error-state-actions">
                    {hasPrimaryAction && (
                        <button
                            type="button"
                            className="btn primary"
                            onClick={onAction}
                        >
                            {actionLabel}
                        </button>
                    )}

                    {hasSecondaryAction && (
                        <button
                            type="button"
                            className="btn secondary"
                            onClick={onSecondaryAction}
                        >
                            {secondaryActionLabel}
                        </button>
                    )}
                </div>
            )}

            {children}
        </section>
    )
}