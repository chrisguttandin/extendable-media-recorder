import { IMediaRecorderConstructor, IMediaRecorderEventMap } from '../interfaces';
import { TEventTargetConstructor } from './event-target-constructor';
import { TNativeMediaRecorderFactory } from './native-media-recorder-factory';
import { TNotSupportedErrorFactory } from './not-supported-error-factory';
import { TWebAudioMediaRecorderFactory } from './web-audio-media-recorder-factory';
import { TWebmPcmMediaRecorderFactory } from './webm-pcm-media-recorder-factory';

export type TMediaRecorderConstructorFactory = (
    createNativeMediaRecorder: TNativeMediaRecorderFactory,
    createNotSupportedError: TNotSupportedErrorFactory,
    createWebAudioMediaRecorder: TWebAudioMediaRecorderFactory,
    createWebmPcmMediaRecorder: TWebmPcmMediaRecorderFactory,
    encoderRegexes: RegExp[],
    eventTargetConstructor: TEventTargetConstructor<IMediaRecorderEventMap>,
    nativeMediaRecorderConstructor: null | IMediaRecorderConstructor
) => IMediaRecorderConstructor;
