import { createIsSupportedPromise } from './factories/is-supported-promise';
import { createMediaRecorderConstructor } from './factories/media-recorder-constructor';
import { createNativeMediaRecorderConstructor } from './factories/native-media-recorder-constructor';
import { createWindow } from './factories/window';
import { IMediaEncoder, IMediaRecorderConstructor } from './interfaces';

export * from './interfaces';
export * from './types';

const encoders: IMediaEncoder[] = [];

const window = createWindow();

const nativeMediaRecorderConstructor = createNativeMediaRecorderConstructor(window);

const mediaRecorderConstructor: IMediaRecorderConstructor = createMediaRecorderConstructor(
    encoders,
    nativeMediaRecorderConstructor
);

export { mediaRecorderConstructor as MediaRecorder };

export const extend = (encoder: IMediaEncoder): void => {
    encoders.push(encoder);
};

export const isSupported: Promise<boolean> = createIsSupportedPromise(window);
