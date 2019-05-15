import { IMediaRecorderEventMap } from './media-encoder-event-map';

export interface IMediaRecorder extends EventTarget {

    // @todo ondataavailable: ((this: IMediaRecorder, event: IBlobEvent) => any) | null;

    addEventListener<K extends keyof IMediaRecorderEventMap> (
        type: K,
        listener: (this: IMediaRecorder, event: IMediaRecorderEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions
    ): void;

    addEventListener (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

    removeEventListener<K extends keyof IMediaRecorderEventMap> (
        type: K,
        listener: (this: IMediaRecorder, event: IMediaRecorderEventMap[K]) => any,
        options?: boolean | EventListenerOptions
    ): void;

    removeEventListener (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;

    start (): void;

    stop (): void;

}
