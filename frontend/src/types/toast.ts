export type ToastType = 'default' | 'success' | 'warning' | 'achievement'

export type ToastItem = {
    id: string
    message: string
    type: ToastType
}