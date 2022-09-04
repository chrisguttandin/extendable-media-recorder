import { IMediaRecorder } from '../interfaces';
import { TNativeEventTarget } from './native-event-target';
import { TNativeMediaRecorderConstructor } from './native-media-recorder-constructor';

export type TWebmPcmMediaRecorderFactory = (
    eventTarget: TNativeEventTarget,
    nativeMediaRecorderConstructor: TNativeMediaRecorderConstructor,
    mediaStream: MediaStream,
    mimeType: string
) => Omit<IMediaRecorder, 'ondataavailable' | 'onerror' | 'onpause' | 'onresume' | 'onstart' | 'onstop' | keyof TNativeEventTarget>;
