import 'core-js/es7/reflect'; // tslint:disable-line:ordered-imports
import { ReflectiveInjector } from '@angular/core'; // tslint:disable-line:ordered-imports
import { IMediaEncoder, IMediaRecorderConstructor } from './interfaces';
import { ENCODERS_PROVIDER, encoders } from './providers/encoders';
import { IS_SUPPORTED_PROMISE_PROVIDER, isSupportedPromise } from './providers/is-supported-promise';
import { MEDIA_RECORDER_CONSTRUCTOR_PROVIDER, mediaRecorderConstructor } from './providers/media-recorder-constructor';
import { NATIVE_MEDIA_RECORDER_CONSTRUCTOR_PROVIDER } from './providers/native-media-recorder-constructor';
import { WINDOW_PROVIDER } from './providers/window';

const injector = ReflectiveInjector.resolveAndCreate([
    ENCODERS_PROVIDER,
    MEDIA_RECORDER_CONSTRUCTOR_PROVIDER,
    IS_SUPPORTED_PROMISE_PROVIDER,
    NATIVE_MEDIA_RECORDER_CONSTRUCTOR_PROVIDER,
    WINDOW_PROVIDER
]);

const ncdrs = injector.get(encoders);

// tslint:disable-next-line:variable-name
export const MediaRecorder: IMediaRecorderConstructor = injector.get(mediaRecorderConstructor);

export const extend = (encoder: IMediaEncoder): void => {
    ncdrs.push(encoder);
};

export const isSupported: Promise<boolean> = injector.get(isSupportedPromise);
