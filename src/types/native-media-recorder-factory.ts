import { IMediaRecorderOptions } from '../interfaces';
import { TNativeMediaRecorder } from './native-media-recorder';
import { TNativeMediaRecorderConstructor } from './native-media-recorder-constructor';

export type TNativeMediaRecorderFactory = (
    nativeMediaRecorderConstructor: TNativeMediaRecorderConstructor,
    mediaStream: MediaStream,
    options: IMediaRecorderOptions
) => TNativeMediaRecorder;
