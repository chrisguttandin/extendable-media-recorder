// @todo Define the complete type declarations as defined by the MediaStream Recording specification.

interface Blob { // tslint:disable-line:interface-name

    arrayBuffer (): Promise<ArrayBuffer>;

}

interface BlobEvent extends Event { // tslint:disable-line:interface-name

    readonly data: Blob;

    readonly timecode: number;

}

interface BlobEventInit extends EventInit { // tslint:disable-line:interface-name

    data: Blob;

    timecode?: number;

}

declare var BlobEvent: {

    prototype: BlobEvent;

    new (type: string, eventInitDict: BlobEventInit): BlobEvent;

};

interface MediaRecorderOptions { // tslint:disable-line:interface-name

    audioBitsPerSecond?: number;

    bitsPerSecond?: number;

    mimeType?: string;

    videoBitsPerSecond?: number;

}

type RecordingState = 'inactive' | 'paused' | 'recording';

interface MediaRecorderEventMap { // tslint:disable-line:interface-name

    dataavailable: BlobEvent;

    // @todo This should fire a MediaRecorderErrorEvent.
    error: ErrorEvent;

}

interface MediaRecorder extends EventTarget { // tslint:disable-line:interface-name

    readonly state: RecordingState;

    addEventListener<K extends keyof MediaRecorderEventMap> (
        type: K,
        listener: (this: MediaRecorder, event: MediaRecorderEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions
    ): void;

    addEventListener (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

    removeEventListener<K extends keyof MediaRecorderEventMap> (
        type: K,
        listener: (this: MediaRecorder, event: MediaRecorderEventMap[K]) => any,
        options?: boolean | EventListenerOptions
    ): void;

    removeEventListener (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;

    start (timeslice?: number): void;

    stop (): void;

}

declare var MediaRecorder: {

    prototype: MediaRecorder;

    new (stream: MediaStream, options: MediaRecorderOptions): MediaRecorder;

    isTypeSupported (mimeType: string): boolean;

};

interface Window { // tslint:disable-line:interface-name

    MediaRecorder: typeof MediaRecorder;

}
