import type { CompletionEvent, NfcBinding, Task } from '../../types'

type TaskDetailsSheetProps = {
    isOpen: boolean
    task: Task | null
    nfcBinding?: NfcBinding | null
    recentCompletions: CompletionEvent[]
    onClose: () => void
    onComplete: (task: Task) => void
    onStartNfcScan: (task: Task) => void
    onLinkNfc: (task: Task) => void
    onUnlinkNfc: (task: Task) => void
}

function formatFrequencyLabel(task: Task) {
    switch (task.frequency) {
        case 'daily':
            return 'Chaque jour'
        case 'weekly':
            return 'Chaque semaine'
        case 'biweekly':
            return 'Toutes les 2 semaines'
        case 'monthly':
            return 'Chaque mois'
        case 'seasonal':
            return 'Chaque saison'
        case 'yearly':
            return 'Une fois par an'
        default:
            return task.frequency
    }
}

function formatDateTime(value: string) {
    return new Date(value).toLocaleString()
}

export function TaskDetailsSheet({
                                     isOpen,
                                     task,
                                     nfcBinding,
                                     recentCompletions,
                                     onClose,
                                     onComplete,
                                     onStartNfcScan,
                                     onLinkNfc,
                                     onUnlinkNfc,
                                 }: TaskDetailsSheetProps) {
    if (!isOpen || !task) return null

    const canValidateWithNfc = !!task.needsNfc && !!nfcBinding
    const needsNfcSetup = !!task.needsNfc && !nfcBinding

    return (
        <div
            className="task-sheet-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-sheet-title"
            onClick={onClose}
        >
            <div
                className="task-sheet"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="task-sheet-handle" aria-hidden="true" />

                <header className="task-sheet-header">
                    <div className="task-sheet-header-main">
                        <p className="task-sheet-eyebrow">Détail tâche</p>
                        <h2 id="task-sheet-title">{task.title}</h2>

                        {task.description && (
                            <p className="task-sheet-description">
                                {task.description}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        className="icon-button"
                        onClick={onClose}
                        aria-label="Fermer la fiche tâche"
                    >
                        ✕
                    </button>
                </header>

                <section className="task-sheet-section">
                    <div className="meta-grid">
                        <article className="meta-card">
                            <span className="meta-label">Fréquence</span>
                            <strong className="meta-value">
                                {formatFrequencyLabel(task)}
                            </strong>
                        </article>

                        <article className="meta-card">
                            <span className="meta-label">Points</span>
                            <strong className="meta-value">{task.points}</strong>
                        </article>

                        <article className="meta-card">
                            <span className="meta-label">Streak actuelle</span>
                            <strong className="meta-value">
                                {task.currentStreak ?? 0}
                            </strong>
                        </article>

                        <article className="meta-card">
                            <span className="meta-label">Meilleure streak</span>
                            <strong className="meta-value">
                                {task.bestStreak ?? 0}
                            </strong>
                        </article>
                    </div>
                </section>

                <section className="task-sheet-section">
                    <div className="task-sheet-subheader">
                        <h3>Validation</h3>
                    </div>

                    <article className="status-card">
                        <div className="status-row">
                            <span className="status-label">Mode</span>
                            <strong className="status-value">
                                {task.needsNfc ? 'NFC' : 'Manuel'}
                            </strong>
                        </div>

                        <div className="status-row">
                            <span className="status-label">Statut NFC</span>
                            <strong className="status-value">
                                {task.needsNfc
                                    ? nfcBinding
                                        ? `Badge lié : ${nfcBinding.tagLabel ?? nfcBinding.tagId}`
                                        : 'Aucun badge lié'
                                    : 'NFC non requis'}
                            </strong>
                        </div>

                        {task.lastCompletedAt && (
                            <div className="status-row">
                                <span className="status-label">Dernière validation</span>
                                <strong className="status-value">
                                    {formatDateTime(task.lastCompletedAt)}
                                </strong>
                            </div>
                        )}
                    </article>

                    <div className="task-sheet-actions">
                        {!task.needsNfc && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => onComplete(task)}
                            >
                                Valider maintenant
                            </button>
                        )}

                        {canValidateWithNfc && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => onStartNfcScan(task)}
                            >
                                Scanner maintenant
                            </button>
                        )}

                        {needsNfcSetup && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => onLinkNfc(task)}
                            >
                                Lier un badge NFC
                            </button>
                        )}

                        {task.needsNfc && nfcBinding && (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => onLinkNfc(task)}
                                >
                                    Changer le badge
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => onUnlinkNfc(task)}
                                >
                                    Retirer le badge
                                </button>
                            </>
                        )}
                    </div>
                </section>

                <section className="task-sheet-section">
                    <div className="task-sheet-subheader">
                        <h3>Infos</h3>
                    </div>

                    <ul className="info-list" role="list">
                        <li>
                            <span>Assigné à</span>
                            <strong>{task.assignee ?? 'Maison'}</strong>
                        </li>

                        <li>
                            <span>Catégorie</span>
                            <strong>{task.category ?? 'Général'}</strong>
                        </li>

                        <li>
                            <span>Critique</span>
                            <strong>{task.critical ? 'Oui' : 'Non'}</strong>
                        </li>

                        <li>
                            <span>Fait aujourd’hui</span>
                            <strong>{task.completedToday ? 'Oui' : 'Non'}</strong>
                        </li>

                        <li>
                            <span>Fait cette période</span>
                            <strong>{task.completedThisPeriod ? 'Oui' : 'Non'}</strong>
                        </li>
                    </ul>
                </section>

                <section className="task-sheet-section">
                    <div className="task-sheet-subheader">
                        <h3>Historique récent</h3>
                    </div>

                    {recentCompletions.length === 0 ? (
                        <p className="empty-label">
                            Aucune validation récente pour cette tâche.
                        </p>
                    ) : (
                        <div className="history-list">
                            {recentCompletions.map((event) => (
                                <article key={event.id} className="history-item">
                                    <div className="history-item-main">
                                        <strong>{event.taskTitle}</strong>
                                        <span>
                                            {formatDateTime(event.completedAt)}
                                        </span>
                                    </div>

                                    <div className="history-item-side">
                                        <span className="history-points">
                                            +{event.points} pts
                                        </span>
                                        <span className="history-mode">
                                            {event.needsNfc ? 'NFC' : 'Manuel'}
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}