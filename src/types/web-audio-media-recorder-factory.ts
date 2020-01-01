import { IMediaRecorder } from '../interfaces';
import { TNativeEventTarget } from './native-event-target';

export type TWebAudioMediaRecorderFactory = (
    eventTarget: TNativeEventTarget,
    mediaStream: MediaStream,
    mimeType: string
) => Omit<IMediaRecorder, 'ondataavailable' | keyof TNativeEventTarget>;
