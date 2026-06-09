import type { ReactNode } from 'react'
import LoadingState from './LoadingState'
import EmptyState from './EmptyState'
import ErrorState from './ErrorState'

type ScreenStateLoading = {
    status: 'loading'
    loadingLabel?: string
    loadingMessage?: string
    loadingVariant?: 'cards' | 'lines' | 'inline'
    loadingCount?: number
    className?: string
}

type ScreenStateEmpty = {
    status: 'empty'
    emptyTitle?: string
    emptyDescription?: string
    emptyIcon?: string
    emptyActionLabel?: string
    onEmptyAction?: () => void
    emptySecondaryActionLabel?: string
    onEmptySecondaryAction?: () => void
    className?: string
}

type ScreenStateError = {
    status: 'error'
    errorTitle?: string
    errorMessage?: string
    errorIcon?: string
    errorActionLabel?: string
    onErrorAction?: () => void
    errorSecondaryActionLabel?: string
    onErrorSecondaryAction?: () => void
    className?: string
}

type ScreenStateSuccess = {
    status: 'success'
    children: ReactNode
    className?: string
}

export type ScreenStateProps =
    | ScreenStateLoading
    | ScreenStateEmpty
    | ScreenStateError
    | ScreenStateSuccess

export default function ScreenState(props: ScreenStateProps) {
    if (props.status === 'loading') {
        return (
            <div className={props.className}>
                <LoadingState
                    label={props.loadingLabel}
                    message={props.loadingMessage}
                    variant={props.loadingVariant}
                    count={props.loadingCount}
                />
            </div>
        )
    }

    if (props.status === 'empty') {
        return (
            <div className={props.className}>
                <EmptyState
                    type="empty"
                    icon={props.emptyIcon}
                    title={props.emptyTitle}
                    description={props.emptyDescription}
                    actionLabel={props.emptyActionLabel}
                    onAction={props.onEmptyAction}
                    secondaryActionLabel={props.emptySecondaryActionLabel}
                    onSecondaryAction={props.onEmptySecondaryAction}
                />
            </div>
        )
    }

    if (props.status === 'error') {
        return (
            <div className={props.className}>
                <ErrorState
                    icon={props.errorIcon}
                    title={props.errorTitle}
                    message={props.errorMessage}
                    actionLabel={props.errorActionLabel}
                    onAction={props.onErrorAction}
                    secondaryActionLabel={props.errorSecondaryActionLabel}
                    onSecondaryAction={props.onErrorSecondaryAction}
                />
            </div>
        )
    }

    return <div className={props.className}>{props.children}</div>
}