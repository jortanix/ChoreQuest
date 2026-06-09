import SkeletonBlock from './SkeletonBlock'

type SkeletonCardProps = {
    className?: string
    showAvatar?: boolean
    showMedia?: boolean
    lines?: number
}

export default function SkeletonCard({
                                         className = '',
                                         showAvatar = true,
                                         showMedia = false,
                                         lines = 3,
                                     }: SkeletonCardProps) {
    return (
        <div
            className={['skeleton-card', className].filter(Boolean).join(' ')}
            aria-hidden="true"
        >
            <div className="skeleton-card-header">
                {showAvatar && (
                    <SkeletonBlock
                        circle
                        width="2.75rem"
                        height="2.75rem"
                    />
                )}

                <div className="skeleton-card-heading">
                    <SkeletonBlock width="58%" height="1rem" />
                    <SkeletonBlock width="34%" height="0.875rem" />
                </div>
            </div>

            {showMedia && (
                <SkeletonBlock
                    className="skeleton-card-media"
                    width="100%"
                    height="10rem"
                    rounded={false}
                />
            )}

            <div className="skeleton-card-body">
                {Array.from({ length: lines }).map((_, index) => (
                    <SkeletonBlock
                        key={index}
                        width={
                            index === lines - 1
                                ? '68%'
                                : index === 1
                                    ? '92%'
                                    : '100%'
                        }
                        height="0.875rem"
                    />
                ))}
            </div>

            <div className="skeleton-card-footer">
                <SkeletonBlock width="5.5rem" height="2rem" rounded />
                <SkeletonBlock width="4.25rem" height="2rem" rounded />
            </div>
        </div>
    )
}