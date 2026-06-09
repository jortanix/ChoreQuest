import { useCallback, useMemo, useRef, useState } from 'react'
import type { NfcScanState, ParsedNfcRecord } from '../types/nfc'

type UseNfcScannerResult = {
    scanState: NfcScanState
    isSupported: boolean
    startScan: (taskId?: string) => Promise<void>
    cancelScan: () => void
    resetScan: () => void
}

function getErrorMessage(error: unknown) {
    if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
            return 'Permission NFC refusée.'
        }

        if (error.name === 'NotSupportedError') {
            return 'NFC non supporté sur cet appareil ou navigateur.'
        }

        if (error.name === 'NotReadableError') {
            return 'Impossible de lire ce badge NFC.'
        }

        if (error.name === 'AbortError') {
            return 'Scan annulé.'
        }

        if (error.name === 'NotFoundError') {
            return 'Aucun badge NFC détecté.'
        }

        return error.message || 'Une erreur NFC est survenue.'
    }

    if (error instanceof Error) {
        return error.message
    }

    return 'Une erreur inconnue est survenue.'
}

function parseNdefRecord(record: NDEFRecord): ParsedNfcRecord {
    const decoder = new TextDecoder()
    const base: ParsedNfcRecord = {
        recordType: record.recordType,
        mediaType: record.mediaType,
        id: record.id,
        encoding: record.encoding,
        lang: record.lang,
    }

    try {
        if (!record.data) return base

        const textValue = decoder.decode(record.data)

        if (record.recordType === 'text' || record.recordType === 'url') {
            return {
                ...base,
                text: textValue,
            }
        }

        if (
            record.recordType === 'mime' &&
            record.mediaType === 'application/json'
        ) {
            return {
                ...base,
                text: textValue,
                json: JSON.parse(textValue),
            }
        }

        return {
            ...base,
            text: textValue,
        }
    } catch {
        return base
    }
}

export function useNfcScanner(): UseNfcScannerResult {
    const [scanState, setScanState] = useState<NfcScanState>({ status: 'idle' })
    const abortControllerRef = useRef<AbortController | null>(null)

    const isSupported = useMemo(() => {
        return typeof window !== 'undefined' && 'NDEFReader' in window
    }, [])

    const cancelScan = useCallback(() => {
        abortControllerRef.current?.abort()
        abortControllerRef.current = null
        setScanState({ status: 'idle' })
    }, [])

    const resetScan = useCallback(() => {
        abortControllerRef.current?.abort()
        abortControllerRef.current = null
        setScanState({ status: 'idle' })
    }, [])

    const startScan = useCallback(async (taskId?: string) => {
        if (!isSupported) {
            setScanState({
                status: 'unsupported',
                taskId,
                message: 'Le scan NFC n’est pas supporté sur cet appareil.',
            })
            return
        }

        abortControllerRef.current?.abort()

        const controller = new AbortController()
        abortControllerRef.current = controller

        setScanState({ status: 'scanning', taskId })

        try {
            const ndef = new NDEFReader()

            ndef.addEventListener(
                'reading',
                (event: Event) => {
                    const readingEvent = event as NDEFReadingEvent
                    const records = Array.from(readingEvent.message.records).map(
                        parseNdefRecord
                    )

                    setScanState({
                        status: 'success',
                        taskId,
                        tagId: readingEvent.serialNumber || 'unknown-tag',
                        tagLabel:
                            records.find((record) => record.text)?.text ??
                            undefined,
                        records,
                        scannedAt: new Date().toISOString(),
                    })

                    controller.abort()
                    abortControllerRef.current = null
                },
                { once: true }
            )

            ndef.addEventListener(
                'readingerror',
                () => {
                    setScanState({
                        status: 'error',
                        taskId,
                        message: 'Le badge a été détecté mais sa lecture a échoué.',
                    })
                },
                { once: true }
            )

            await ndef.scan({ signal: controller.signal })
        } catch (error) {
            const message = getErrorMessage(error)

            if (error instanceof DOMException && error.name === 'AbortError') {
                setScanState({ status: 'idle', taskId })
                return
            }

            if (error instanceof DOMException && error.name === 'NotAllowedError') {
                setScanState({
                    status: 'permission-denied',
                    taskId,
                    message,
                })
                return
            }

            if (error instanceof DOMException && error.name === 'NotSupportedError') {
                setScanState({
                    status: 'unsupported',
                    taskId,
                    message,
                })
                return
            }

            setScanState({
                status: 'error',
                taskId,
                message,
            })
        }
    }, [isSupported])

    return {
        scanState,
        isSupported,
        startScan,
        cancelScan,
        resetScan,
    }
}