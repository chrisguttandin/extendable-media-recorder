import { register as rgstr } from 'media-encoder-host';
import { createIsSupportedPromise } from './factories/is-supported-promise';
import { createMediaRecorderConstructor } from './factories/media-recorder-constructor';
import { createNativeMediaRecorderConstructor } from './factories/native-media-recorder-constructor';
import { createWindow } from './factories/window';
import { IMediaRecorderConstructor } from './interfaces';

export * from './interfaces';
export * from './types';

const encoderRegexes: RegExp[] = [];

const window = createWindow();

const nativeMediaRecorderConstructor = createNativeMediaRecorderConstructor(window);

const mediaRecorderConstructor: IMediaRecorderConstructor = createMediaRecorderConstructor(
    encoderRegexes,
    nativeMediaRecorderConstructor
);

export { mediaRecorderConstructor as MediaRecorder };

export const register = async (port: MessagePort): Promise<void> => {
    encoderRegexes.push(await rgstr(port));
};

export const isSupported: Promise<boolean> = createIsSupportedPromise(window);
