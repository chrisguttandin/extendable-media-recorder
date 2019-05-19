import { IMediaRecorder } from '../interfaces';
import { TNativeMediaRecorderConstructor } from './native-media-recorder-constructor';
import { TNativeMediaRecorderOptions } from './native-media-recorder-options';

export type TNativeMediaRecorderFactory = (
    nativeMediaRecorderConstructor: TNativeMediaRecorderConstructor,
    mediaStream: MediaStream,
    options: TNativeMediaRecorderOptions
) => IMediaRecorder;
