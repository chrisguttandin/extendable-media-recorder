import { OpaqueToken } from '@angular/core';
import { window } from './window';

export const nativeMediaRecorderConstructor = new OpaqueToken('NATIVE_MEDIA_RECORDER_CONSTRUCTOR');

export const NATIVE_MEDIA_RECORDER_CONSTRUCTOR_PROVIDER = {
    deps: [ window ],
    provide: nativeMediaRecorderConstructor,
    useFactory: (window) => (window.hasOwnProperty('MediaRecorder')) ?
        window.MediaRecorder :
        null
};
