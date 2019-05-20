import { IMediaRecorderConstructor } from '../interfaces';
import { TNativeMediaRecorderConstructor } from './native-media-recorder-constructor';
import { TNativeMediaRecorderFactory } from './native-media-recorder-factory';
import { TNotSupportedErrorFactory } from './not-supported-error-factory';
import { TWebAudioMediaRecorderFactory } from './web-audio-media-recorder-factory';

export type TMediaRecorderConstructorFactory = (
    createNativeMediaRecorder: TNativeMediaRecorderFactory,
    createNotSupportedError: TNotSupportedErrorFactory,
    createWebAudioMediaRecorder: TWebAudioMediaRecorderFactory,
    encoderRegexes: RegExp[],
    nativeMediaRecorderConstructor: null | TNativeMediaRecorderConstructor
) => IMediaRecorderConstructor;
