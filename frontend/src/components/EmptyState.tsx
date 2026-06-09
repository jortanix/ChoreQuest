import type { ReactNode } from 'react'

type EmptyStateVariant = 'empty' | 'success' | 'error'

type EmptyStateProps = {
    type?: EmptyStateVariant
    title?: string
    description?: string
    icon?: string
    actionLabel?: string
    onAction?: () => void
    secondaryActionLabel?: string
    onSecondaryAction?: () => void
    children?: ReactNode
}

const variantDefaults: Record<
    EmptyStateVariant,
    { icon: string; title: string; description: string }
> = {
    empty: {
        icon: '✨',
        title: 'Rien à afficher pour le moment',
        description: 'Ajoute du contenu ou lance une première action pour commencer.',
    },
    success: {
        icon: '🎉',
        title: 'Tout est terminé',
        description: 'Bravo, tout s’est bien passé et il n’y a plus rien à faire ici.',
    },
    error: {
        icon: '⚠️',
        title: 'Une erreur est survenue',
        description: 'Impossible d’afficher ce contenu pour le moment. Réessaie dans un instant.',
    },
}

export default function EmptyState({
                                       type = 'empty',
                                       title,
                                       description,
                                       icon,
                                       actionLabel,
                                       onAction,
                                       secondaryActionLabel,
                                       onSecondaryAction,
                                       children,
                                   }: EmptyStateProps) {
    const defaults = variantDefaults[type]

    const resolvedIcon = icon ?? defaults.icon
    const resolvedTitle = title ?? defaults.title
    const resolvedDescription = description ?? defaults.description

    const hasPrimaryAction = Boolean(actionLabel && onAction)
    const hasSecondaryAction = Boolean(secondaryActionLabel && onSecondaryAction)

    return (
        <section
            className={`empty-state-card empty-state-${type}`}
            aria-live={type === 'error' ? 'assertive' : 'polite'}
            aria-label={resolvedTitle}
        >
            <div className="empty-state-visual" aria-hidden="true">
                {resolvedIcon}
            </div>

            <div className="empty-state-copy">
                <h2 className="empty-state-title">{resolvedTitle}</h2>
                <p className="empty-state-description">{resolvedDescription}</p>
            </div>

            {(hasPrimaryAction || hasSecondaryAction) && (
                <div className="empty-state-actions">
                    {hasPrimaryAction && (
                        <button className="btn primary" onClick={onAction}>
                            {actionLabel}
                        </button>
                    )}

                    {hasSecondaryAction && (
                        <button className="btn secondary" onClick={onSecondaryAction}>
                            {secondaryActionLabel}
                        </button>
                    )}
                </div>
            )}

            {children}
        </section>
    )
}