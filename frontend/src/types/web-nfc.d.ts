declare interface NDEFRecord {
    recordType?: string
    mediaType?: string
    id?: string
    encoding?: string
    lang?: string
    data?: DataView | null
}

declare interface NDEFMessage {
    records: NDEFRecord[]
}

declare interface NDEFReadingEvent extends Event {
    serialNumber?: string
    message: NDEFMessage
}

declare interface NDEFReader extends EventTarget {
    scan(options?: { signal?: AbortSignal }): Promise<void>
    write(message: string | NDEFMessage): Promise<void>
    onreading: ((this: NDEFReader, ev: NDEFReadingEvent) => unknown) | null
    onreadingerror: ((this: NDEFReader, ev: Event) => unknown) | null
}

declare const NDEFReader: {
    prototype: NDEFReader
    new (): NDEFReader
}