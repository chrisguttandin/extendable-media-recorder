import { IMediaRecorder, IMediaRecorderConstructor } from '../interfaces';
import { TNativeEventTarget } from './native-event-target';

export type TWebmPcmMediaRecorderFactory = (
    eventTarget: TNativeEventTarget,
    nativeMediaRecorderConstructor: IMediaRecorderConstructor,
    mediaStream: MediaStream,
    mimeType: string
) => Omit<IMediaRecorder, 'ondataavailable' | 'onerror' | 'onpause' | 'onresume' | 'onstart' | 'onstop' | keyof TNativeEventTarget>;
