export type NfcFlowMode = 'complete-task' | 'link-task' | 'quick-scan'

export type NfcBinding = {
    taskId: string
    tagId: string
    tagLabel?: string
    linkedAt: string
}

export type ParsedNfcRecord = {
    recordType: string
    mediaType?: string
    id?: string
    encoding?: string
    lang?: string
    text?: string
    json?: unknown
}

export type NfcScanSuccess = {
    status: 'success'
    taskId?: string
    tagId: string
    tagLabel?: string
    records: ParsedNfcRecord[]
    scannedAt: string
}

export type NfcScanState =
    | { status: 'idle'; taskId?: string }
    | { status: 'unsupported'; taskId?: string; message: string }
    | { status: 'scanning'; taskId?: string }
    | { status: 'permission-denied'; taskId?: string; message: string }
    | { status: 'error'; taskId?: string; message: string }
    | NfcScanSuccess