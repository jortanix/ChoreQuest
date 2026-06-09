export type AsyncStatus =
    | 'idle'
    | 'loading'
    | 'empty'
    | 'success'
    | 'error'

export type IdleState = {
    status: 'idle'
}

export type LoadingState = {
    status: 'loading'
}

export type EmptyState = {
    status: 'empty'
}

export type SuccessState<T> = {
    status: 'success'
    data: T
}

export type ErrorState = {
    status: 'error'
    error: string
}

export type AsyncState<T> =
    | IdleState
    | LoadingState
    | EmptyState
    | SuccessState<T>
    | ErrorState

export function isIdleState<T>(state: AsyncState<T>): state is IdleState {
    return state.status === 'idle'
}

export function isLoadingState<T>(state: AsyncState<T>): state is LoadingState {
    return state.status === 'loading'
}

export function isEmptyState<T>(state: AsyncState<T>): state is EmptyState {
    return state.status === 'empty'
}

export function isSuccessState<T>(state: AsyncState<T>): state is SuccessState<T> {
    return state.status === 'success'
}

export function isErrorState<T>(state: AsyncState<T>): state is ErrorState {
    return state.status === 'error'
}