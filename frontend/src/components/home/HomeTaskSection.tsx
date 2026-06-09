import type { ReactNode } from 'react'

export interface HomeTaskSectionProps {
    title: string
    actionLabel?: string
    actionVariant?: 'ghost' | 'primary' | 'secondary'
    onAction?: () => void
    children: ReactNode
}

export function HomeTaskSection({
                                    title,
                                    actionLabel,
                                    actionVariant = 'ghost',
                                    onAction,
                                    children,
                                }: HomeTaskSectionProps) {
    return (
        <>
            <div className="section-head">
                <h2>{title}</h2>

                {actionLabel && (
                    <button
                        type="button"
                        className={actionVariant}
                        onClick={onAction}
                    >
                        {actionLabel}
                    </button>
                )}
            </div>

            {children}
        </>
    )
}