import { useCallback, useState } from 'react'
import type { AsyncState } from '../types/asyncState'

type UseAsyncStateOptions<T> = {
    immediate?: boolean
    isEmpty?: (data: T) => boolean
}

export function useAsyncState<T>(
    asyncFn: () => Promise<T>,
    options: UseAsyncStateOptions<T> = {}
) {
    const { immediate = false, isEmpty } = options

    const [state, setState] = useState<AsyncState<T>>(
        immediate ? { status: 'loading' } : { status: 'idle' }
    )

    const execute = useCallback(async () => {
        setState({ status: 'loading' })

        try {
            const data = await asyncFn()

            if (isEmpty?.(data)) {
                setState({ status: 'empty' })
                return { status: 'empty' as const }
            }

            setState({ status: 'success', data })
            return { status: 'success' as const, data }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Une erreur inattendue est survenue.'

            setState({ status: 'error', error: message })
            return { status: 'error' as const, error: message }
        }
    }, [asyncFn, isEmpty])

    const reset = useCallback(() => {
        setState({ status: 'idle' })
    }, [])

    const setLoading = useCallback(() => {
        setState({ status: 'loading' })
    }, [])

    const setEmpty = useCallback(() => {
        setState({ status: 'empty' })
    }, [])

    const setError = useCallback((message: string) => {
        setState({ status: 'error', error: message })
    }, [])

    const setSuccess = useCallback((data: T) => {
        setState({ status: 'success', data })
    }, [])

    return {
        state,
        execute,
        reset,
        setLoading,
        setEmpty,
        setError,
        setSuccess,
        isIdle: state.status === 'idle',
        isLoading: state.status === 'loading',
        isEmpty: state.status === 'empty',
        isError: state.status === 'error',
        isSuccess: state.status === 'success',
    }
}