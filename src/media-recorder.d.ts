// @todo Define the complete type declarations as defined by the MediaStream Recording specification.

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

interface MediaRecorder extends EventTarget { // tslint:disable-line:interface-name

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
