import { useEffect, useMemo, useRef } from 'react'
import type { Task } from '../../types'
import type { NfcFlowMode } from '../../types/nfc'
import { useNfcScanner } from '../../hooks/useNfcScanner'
import { useTasks } from '../../context/useTasks'

type NfcScanFlowProps = {
    isOpen: boolean
    mode: NfcFlowMode
    task?: Task | null
    onClose: () => void
    onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void
}

export function NfcScanFlow({
                                isOpen,
                                mode,
                                task,
                                onClose,
                                onShowToast,
                            }: NfcScanFlowProps) {
    const {
        completeTaskById,
        linkNfcTagToTask,
        getNfcBindingByTaskId,
        getTaskByNfcTagId,
    } = useTasks()

    const { scanState, startScan, cancelScan, resetScan } = useNfcScanner()

    const handledScanKeyRef = useRef<string | null>(null)

    const existingBinding = useMemo(() => {
        if (!task) return null
        return getNfcBindingByTaskId(task.id)
    }, [task, getNfcBindingByTaskId])

    useEffect(() => {
        if (!isOpen) {
            resetScan()
        }
    }, [isOpen, resetScan])

    useEffect(() => {
        if (scanState.status !== 'success') {
            handledScanKeyRef.current = null
        }
    }, [scanState.status])

    useEffect(() => {
        if (scanState.status !== 'success') return

        const scanKey = `${mode}-${task?.id ?? 'none'}-${scanState.tagId}-${scanState.scannedAt}`

        if (handledScanKeyRef.current === scanKey) return
        handledScanKeyRef.current = scanKey

        if (mode === 'link-task') {
            if (!task) return

            linkNfcTagToTask(task.id, scanState.tagId, scanState.tagLabel)
            onShowToast?.(`Badge NFC lié à "${task.title}".`, 'success')
            return
        }

        if (mode === 'complete-task') {
            if (!task) return

            const binding = getNfcBindingByTaskId(task.id)

            if (task.needsNfc && !binding) {
                onShowToast?.(
                    `Aucun badge NFC n’est encore lié à "${task.title}".`,
                    'error'
                )
                return
            }

            if (binding && binding.tagId !== scanState.tagId) {
                onShowToast?.(
                    `Ce badge ne correspond pas à "${task.title}".`,
                    'error'
                )
                return
            }

            completeTaskById(task.id)
            onShowToast?.(`Tâche "${task.title}" validée via NFC.`, 'success')
            return
        }

        if (mode === 'quick-scan') {
            const matchedTask = getTaskByNfcTagId(scanState.tagId)

            if (!matchedTask) {
                onShowToast?.(
                    'Aucune tâche n’est liée à ce badge NFC.',
                    'error'
                )
                return
            }

            completeTaskById(matchedTask.id)
            onShowToast?.(
                `Tâche "${matchedTask.title}" validée via badge NFC.`,
                'success'
            )
        }
    }, [
        scanState,
        mode,
        task,
        linkNfcTagToTask,
        completeTaskById,
        getNfcBindingByTaskId,
        getTaskByNfcTagId,
        onShowToast,
    ])

    const title = useMemo(() => {
        if (mode === 'link-task') return 'Lier un badge NFC'
        if (mode === 'complete-task') return 'Scanner pour valider'
        return 'Scanner un badge NFC'
    }, [mode])

    const subtitle = useMemo(() => {
        if (mode === 'link-task' && task) {
            return `Associer un badge à : ${task.title}`
        }

        if (mode === 'complete-task' && task) {
            return `Valider : ${task.title}`
        }

        return 'Approche ton téléphone du badge NFC.'
    }, [mode, task])

    if (!isOpen) return null

    return (
        <div
            className="nfc-flow-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nfc-flow-title"
        >
            <div className="nfc-flow-sheet">
                <header className="nfc-flow-header">
                    <div>
                        <h2 id="nfc-flow-title">{title}</h2>
                        <p>{subtitle}</p>
                    </div>

                    <button
                        type="button"
                        className="icon-button"
                        onClick={onClose}
                        aria-label="Fermer"
                    >
                        ✕
                    </button>
                </header>

                <div className="nfc-flow-body">
                    {scanState.status === 'idle' && (
                        <section className="nfc-state nfc-state-idle">
                            <div className="nfc-icon" aria-hidden="true">
                                📶
                            </div>

                            {task && (
                                <div className="nfc-task-summary">
                                    <strong>{task.title}</strong>

                                    <span>
                                        {task.needsNfc
                                            ? existingBinding
                                                ? `Badge lié : ${existingBinding.tagLabel ?? existingBinding.tagId}`
                                                : 'Aucun badge lié'
                                            : 'Validation NFC disponible'}
                                    </span>
                                </div>
                            )}

                            {mode === 'quick-scan' && (
                                <p>
                                    Scanne un badge pour retrouver automatiquement
                                    la tâche associée.
                                </p>
                            )}

                            {mode !== 'quick-scan' && (
                                <p>
                                    Approche le téléphone du badge NFC pour continuer.
                                </p>
                            )}

                            <div className="nfc-actions">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => startScan(task?.id)}
                                >
                                    Commencer le scan
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    Annuler
                                </button>
                            </div>
                        </section>
                    )}

                    {scanState.status === 'scanning' && (
                        <section className="nfc-state nfc-state-scanning">
                            <div className="nfc-pulse" aria-hidden="true">
                                📡
                            </div>

                            <p>Scan en cours… approche ton téléphone du badge.</p>

                            <p className="muted">
                                Web NFC fonctionne surtout sur Android avec un
                                navigateur compatible.
                            </p>

                            <div className="nfc-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={cancelScan}
                                >
                                    Annuler le scan
                                </button>
                            </div>
                        </section>
                    )}

                    {scanState.status === 'success' && (
                        <section className="nfc-state nfc-state-success">
                            <div className="nfc-icon" aria-hidden="true">
                                ✅
                            </div>

                            <p>Badge détecté avec succès.</p>

                            <div className="nfc-result-card">
                                <div>
                                    <span className="label">Tag ID</span>
                                    <strong>{scanState.tagId}</strong>
                                </div>

                                {scanState.tagLabel && (
                                    <div>
                                        <span className="label">Label</span>
                                        <strong>{scanState.tagLabel}</strong>
                                    </div>
                                )}

                                <div>
                                    <span className="label">Lu à</span>
                                    <strong>
                                        {new Date(
                                            scanState.scannedAt
                                        ).toLocaleString()}
                                    </strong>
                                </div>
                            </div>

                            {mode === 'quick-scan' && (
                                <p className="muted">
                                    Si un badge est déjà lié à une tâche, la validation
                                    est appliquée automatiquement.
                                </p>
                            )}

                            <div className="nfc-actions">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={onClose}
                                >
                                    Terminer
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        resetScan()
                                    }}
                                >
                                    Scanner un autre badge
                                </button>
                            </div>
                        </section>
                    )}

                    {scanState.status === 'error' && (
                        <section className="nfc-state nfc-state-error">
                            <div className="nfc-icon" aria-hidden="true">
                                ⚠️
                            </div>

                            <p>{scanState.message}</p>

                            <div className="nfc-actions">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        resetScan()
                                    }}
                                >
                                    Réessayer
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    Fermer
                                </button>
                            </div>
                        </section>
                    )}

                    {scanState.status === 'permission-denied' && (
                        <section className="nfc-state nfc-state-error">
                            <div className="nfc-icon" aria-hidden="true">
                                🔒
                            </div>

                            <p>{scanState.message}</p>

                            <p className="muted">
                                Le scan NFC doit être déclenché via une action
                                utilisateur et peut demander une autorisation.
                            </p>

                            <div className="nfc-actions">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        resetScan()
                                    }}
                                >
                                    Réessayer
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    Fermer
                                </button>
                            </div>
                        </section>
                    )}

                    {scanState.status === 'unsupported' && (
                        <section className="nfc-state nfc-state-error">
                            <div className="nfc-icon" aria-hidden="true">
                                📵
                            </div>

                            <p>{scanState.message}</p>

                            <p className="muted">
                                Cette fonction n’est généralement disponible que sur
                                certains navigateurs Android compatibles Web NFC.
                            </p>

                            <div className="nfc-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    Fermer
                                </button>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    )
}