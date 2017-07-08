import { InjectionToken } from '@angular/core';
import { INativeMediaRecorder } from '../interfaces';
import { window as wndw } from './window';

export const nativeMediaRecorderConstructor = new InjectionToken<Promise<null | INativeMediaRecorder>>('NATIVE_MEDIA_RECORDER_CONSTRUCTOR');

export const NATIVE_MEDIA_RECORDER_CONSTRUCTOR_PROVIDER = {
    deps: [ wndw ],
    provide: nativeMediaRecorderConstructor,
    useFactory: (window: Window): Promise<null | INativeMediaRecorder> => (window.hasOwnProperty('MediaRecorder')) ?
        (<any> window).MediaRecorder :
        null
};
