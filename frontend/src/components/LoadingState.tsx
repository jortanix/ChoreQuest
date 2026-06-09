import SkeletonBlock from './SkeletonBlock'
import SkeletonCard from './SkeletonCard'

type LoadingStateVariant = 'cards' | 'lines' | 'inline'

type LoadingStateProps = {
    label?: string
    message?: string
    variant?: LoadingStateVariant
    count?: number
    className?: string
}

export default function LoadingState({
                                         label = 'Chargement en cours',
                                         message = 'Un instant, on prépare le contenu…',
                                         variant = 'cards',
                                         count = 3,
                                         className = '',
                                     }: LoadingStateProps) {
    return (
        <section
            className={['loading-state', `loading-state-${variant}`, className]
                .filter(Boolean)
                .join(' ')}
            aria-live="polite"
            aria-busy="true"
            aria-label={label}
        >
            <div className="loading-state-copy">
                <p className="loading-state-label">{label}</p>
                <p className="loading-state-message">{message}</p>
            </div>

            {variant === 'inline' && (
                <div className="loading-state-inline" aria-hidden="true">
                    <span className="loading-state-spinner" />
                </div>
            )}

            {variant === 'lines' && (
                <div className="loading-state-lines" aria-hidden="true">
                    {Array.from({ length: count }).map((_, index) => (
                        <SkeletonBlock
                            key={index}
                            height={index === 0 ? '1.125rem' : '0.875rem'}
                            width={
                                index === count - 1
                                    ? '68%'
                                    : index % 2 === 0
                                        ? '100%'
                                        : '92%'
                            }
                        />
                    ))}
                </div>
            )}

            {variant === 'cards' && (
                <div className="loading-state-cards" aria-hidden="true">
                    {Array.from({ length: count }).map((_, index) => (
                        <SkeletonCard key={index} />
                    ))}
                </div>
            )}
        </section>
    )
}