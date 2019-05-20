import { register as rgstr } from 'media-encoder-host';
import { createInvalidModificationError } from './factories/invalid-modification-error';
import { createIsSupportedPromise } from './factories/is-supported-promise';
import { createMediaRecorderConstructor } from './factories/media-recorder-constructor';
import { createNativeMediaRecorderFactory } from './factories/native-media-recorder';
import { createNativeMediaRecorderConstructor } from './factories/native-media-recorder-constructor';
import { createNotSupportedError } from './factories/not-supported-error';
import { createWebAudioMediaRecorderFactory } from './factories/web-audio-media-recorder';
import { createWindow } from './factories/window';
import { IMediaRecorderConstructor } from './interfaces';

export * from './interfaces';
export * from './types';

const encoderRegexes: RegExp[] = [];

const createNativeMediaRecorder = createNativeMediaRecorderFactory(createInvalidModificationError);
const createWebAudioMediaRecorder = createWebAudioMediaRecorderFactory(createInvalidModificationError);
const window = createWindow();
const nativeMediaRecorderConstructor = createNativeMediaRecorderConstructor(window);

const mediaRecorderConstructor: IMediaRecorderConstructor = createMediaRecorderConstructor(
    createNativeMediaRecorder,
    createNotSupportedError,
    createWebAudioMediaRecorder,
    encoderRegexes,
    nativeMediaRecorderConstructor
);

export { mediaRecorderConstructor as MediaRecorder };

export const isSupported: Promise<boolean> = createIsSupportedPromise(window);

export const register = async (port: MessagePort): Promise<void> => {
    encoderRegexes.push(await rgstr(port));
};
