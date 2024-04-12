import { deregister as drgstr, register as rgstr } from 'media-encoder-host';
import { createBlobEventFactory } from './factories/blob-event-factory';
import { createDecodeWebMChunk } from './factories/decode-web-m-chunk';
import { createEventTargetConstructor } from './factories/event-target-constructor';
import { createEventTargetFactory } from './factories/event-target-factory';
import { createInvalidModificationError } from './factories/invalid-modification-error';
import { createInvalidStateError } from './factories/invalid-state-error';
import { createIsSupportedPromise } from './factories/is-supported-promise';
import { createMediaRecorderConstructor } from './factories/media-recorder-constructor';
import { createNativeBlobEventConstructor } from './factories/native-blob-event-constructor';
import { createNativeMediaRecorderConstructor } from './factories/native-media-recorder-constructor';
import { createNativeMediaRecorderFactory } from './factories/native-media-recorder-factory';
import { createNotSupportedError } from './factories/not-supported-error';
import { createReadElementContent } from './factories/read-element-content';
import { createReadElementType } from './factories/read-element-type';
import { createReadVariableSizeInteger } from './factories/read-variable-size-integer';
import { createWebAudioMediaRecorderFactory } from './factories/web-audio-media-recorder';
import { createWebmPcmMediaRecorderFactory } from './factories/webm-pcm-media-recorder';
import { createWindow } from './factories/window';
import { readVariableSizeIntegerLength } from './functions/read-variable-size-integer-length';
import { wrapEventListener } from './functions/wrap-event-listener';
import { IMediaRecorderConstructor } from './interfaces';

/*
 * @todo Explicitly referencing the barrel file seems to be necessary when enabling the
 * isolatedModules compiler option.
 */
export * from './interfaces/index';
export * from './types/index';

const encoderRegexes: RegExp[] = [];

const window = createWindow();
const nativeBlobEventConstructor = createNativeBlobEventConstructor(window);
const createBlobEvent = createBlobEventFactory(nativeBlobEventConstructor);
const createWebAudioMediaRecorder = createWebAudioMediaRecorderFactory(
    createBlobEvent,
    createInvalidModificationError,
    createInvalidStateError,
    createNotSupportedError
);
const readVariableSizeInteger = createReadVariableSizeInteger(readVariableSizeIntegerLength);
const readElementContent = createReadElementContent(readVariableSizeInteger);
const readElementType = createReadElementType(readVariableSizeInteger);
const decodeWebMChunk = createDecodeWebMChunk(readElementContent, readElementType);
const createWebmPcmMediaRecorder = createWebmPcmMediaRecorderFactory(createBlobEvent, decodeWebMChunk, readVariableSizeInteger);
const createEventTarget = createEventTargetFactory(window);
const nativeMediaRecorderConstructor = createNativeMediaRecorderConstructor(window);

const mediaRecorderConstructor: IMediaRecorderConstructor = createMediaRecorderConstructor(
    createNativeMediaRecorderFactory(createNotSupportedError),
    createNotSupportedError,
    createWebAudioMediaRecorder,
    createWebmPcmMediaRecorder,
    encoderRegexes,
    createEventTargetConstructor(createEventTarget, wrapEventListener),
    nativeMediaRecorderConstructor
);

export { mediaRecorderConstructor as MediaRecorder };

const ports = new WeakMap<MessagePort, RegExp>();

export const deregister = async (port: MessagePort): Promise<void> => {
    await drgstr(port);

    const encoderRegex = ports.get(port);

    if (encoderRegex !== undefined) {
        const index = encoderRegexes.indexOf(encoderRegex);

        encoderRegexes.splice(index, 1);
    }
};

export const isSupported = () => createIsSupportedPromise(window);

export const register = async (port: MessagePort): Promise<void> => {
    const encoderRegex = await rgstr(port);

    encoderRegexes.push(encoderRegex);
    ports.set(port, encoderRegex);
};
