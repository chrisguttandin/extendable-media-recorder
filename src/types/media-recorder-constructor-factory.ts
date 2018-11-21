import { IMediaRecorderConstructor } from '../interfaces';
import { TNativeMediaRecorderConstructor } from './native-media-recorder-constructor';

export type TMediaRecorderConstructorFactory = (
    encoderRegexes: RegExp[],
    nativeMediaRecorderConstructor: null | TNativeMediaRecorderConstructor
) => IMediaRecorderConstructor;
