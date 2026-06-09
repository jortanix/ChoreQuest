import type { ToastItem } from '../types/toast'

type ToastProps = {
    toast: ToastItem | null
}

const achievementBurst = Array.from({ length: 8 }, (_, index) => index)

function Toast({ toast }: ToastProps) {
    if (!toast) return null

    const icon =
        toast.type === 'achievement'
            ? '🏆'
            : toast.type === 'success'
                ? '✅'
                : toast.type === 'warning'
                    ? '⚠️'
                    : '💬'

    const label =
        toast.type === 'achievement'
            ? 'Succès'
            : toast.type === 'success'
                ? 'Validation'
                : toast.type === 'warning'
                    ? 'Attention'
                    : 'Info'

    return (
        <div className={`toast show toast-${toast.type}`}>
            {toast.type === 'achievement' && (
                <div className="toast-burst" aria-hidden="true">
                    {achievementBurst.map((particle) => (
                        <span
                            key={particle}
                            className={`toast-spark toast-spark-${particle + 1}`}
                        />
                    ))}
                </div>
            )}

            <div className="toast-icon" aria-hidden="true">
                {icon}
            </div>

            <div className="toast-copy">
                <p className="toast-label">{label}</p>
                <p className="toast-message">{toast.message}</p>
            </div>
        </div>
    )
}

export default Toast