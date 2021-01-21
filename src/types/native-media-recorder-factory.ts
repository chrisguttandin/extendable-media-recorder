import { IMediaRecorder, IMediaRecorderConstructor, IMediaRecorderOptions } from '../interfaces';

export type TNativeMediaRecorderFactory = (
    nativeMediaRecorderConstructor: IMediaRecorderConstructor,
    mediaStream: MediaStream,
    options: IMediaRecorderOptions
) => IMediaRecorder;
