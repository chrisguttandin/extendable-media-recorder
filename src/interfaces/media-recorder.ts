import { TBlobEventHandler, TErrorEventHandler, TEventHandler, TRecordingState } from '../types';
import { IEventTarget } from './event-target';
import { IMediaRecorderEventMap } from './media-recorder-event-map';

export interface IMediaRecorder extends IEventTarget<IMediaRecorderEventMap> {
    readonly mimeType: string;

    ondataavailable: null | TBlobEventHandler<this>;

    onerror: null | TErrorEventHandler<this>;

    onpause: null | TEventHandler<this>;

    onresume: null | TEventHandler<this>;

    onstart: null | TEventHandler<this>;

    onstop: null | TEventHandler<this>;

    readonly state: TRecordingState;

    pause(): void;

    resume(): void;

    start(timeslice?: number): void;

    stop(): void;

    requestData(): void;
}
