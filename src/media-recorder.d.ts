// @todo Define the complete type declarations as defined by the MediaStream Recording specification.

// tslint:disable-next-line:interface-name
interface Blob {
    arrayBuffer(): Promise<ArrayBuffer>;
}

// tslint:disable-next-line:interface-name
interface BlobEvent extends Event {
    readonly data: Blob;

    readonly timecode: number;
}

// tslint:disable-next-line:interface-name
interface BlobEventInit extends EventInit {
    data: Blob;

    timecode?: number;
}

declare var BlobEvent: {
    prototype: BlobEvent;

    new (type: string, eventInitDict: BlobEventInit): BlobEvent;
};

// tslint:disable-next-line:interface-name
interface MediaRecorderOptions {
    audioBitsPerSecond?: number;

    bitsPerSecond?: number;

    mimeType?: string;

    videoBitsPerSecond?: number;
}

type RecordingState = 'inactive' | 'paused' | 'recording';

// tslint:disable-next-line:interface-name
interface MediaRecorderEventMap {
    dataavailable: BlobEvent;

    // @todo This should fire a MediaRecorderErrorEvent.
    error: ErrorEvent;
}

// tslint:disable-next-line:interface-name
interface MediaRecorder extends EventTarget {
    readonly mimeType: string;

    readonly state: RecordingState;

    addEventListener<K extends keyof MediaRecorderEventMap>(
        type: K,
        listener: (this: MediaRecorder, event: MediaRecorderEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions
    ): void;

    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

    removeEventListener<K extends keyof MediaRecorderEventMap>(
        type: K,
        listener: (this: MediaRecorder, event: MediaRecorderEventMap[K]) => any,
        options?: boolean | EventListenerOptions
    ): void;

    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;

    start(timeslice?: number): void;

    stop(): void;
}

declare var MediaRecorder: {
    prototype: MediaRecorder;

    new (stream: MediaStream, options?: MediaRecorderOptions): MediaRecorder;

    isTypeSupported(mimeType: string): boolean;
};

// tslint:disable-next-line:interface-name
interface Window {
    MediaRecorder: typeof MediaRecorder;
}
