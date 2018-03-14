import { IMediaEncoder, IMediaRecorderConstructor } from '../interfaces';
import { TNativeMediaRecorderConstructor } from './native-media-recorder-constructor';

export type TMediaRecorderConstructorFactory = (
    encoders: IMediaEncoder[],
    nativeMediaRecorderConstructor: null | TNativeMediaRecorderConstructor
) => IMediaRecorderConstructor;
