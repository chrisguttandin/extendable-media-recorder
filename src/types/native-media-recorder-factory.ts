import { TNativeMediaRecorder } from './native-media-recorder';
import { TNativeMediaRecorderConstructor } from './native-media-recorder-constructor';
import { TNativeMediaRecorderOptions } from './native-media-recorder-options';

export type TNativeMediaRecorderFactory = (
    nativeMediaRecorderConstructor: TNativeMediaRecorderConstructor,
    mediaStream: MediaStream,
    options: TNativeMediaRecorderOptions
) => TNativeMediaRecorder;
