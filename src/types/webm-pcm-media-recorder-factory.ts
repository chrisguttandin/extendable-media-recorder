import { IMediaRecorder } from '../interfaces';
import { TNativeMediaRecorderConstructor } from './native-media-recorder-constructor';

export type TWebmPcmMediaRecorderFactory = (
    nativeMediaRecorderConstructor: TNativeMediaRecorderConstructor,
    mediaStream: MediaStream,
    mimeType: string
) => IMediaRecorder;
