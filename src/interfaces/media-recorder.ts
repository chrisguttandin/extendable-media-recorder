import { TBlobEventHandler, TErrorEventHandler, TNativeEventTarget, TRecordingState } from '../types';
import { IMediaRecorderEventMap } from './media-recorder-event-map';

export interface IMediaRecorder extends TNativeEventTarget {
    readonly mimeType: string;

    ondataavailable: null | TBlobEventHandler<this>;

    onerror: null | TErrorEventHandler<this>;

    readonly state: TRecordingState;

    addEventListener<K extends keyof IMediaRecorderEventMap>(
        type: K,
        listener: (this: this, event: IMediaRecorderEventMap[K]) => void,
        options?: boolean | AddEventListenerOptions
    ): void;

    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

    removeEventListener<K extends keyof IMediaRecorderEventMap>(
        type: K,
        listener: (this: this, event: IMediaRecorderEventMap[K]) => void,
        options?: boolean | EventListenerOptions
    ): void;

    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;

    start(timeslice?: number): void;

    stop(): void;
}
