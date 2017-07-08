import { InjectionToken } from '@angular/core';
import { window as wndw } from './window';

export const isSupportedPromise = new InjectionToken<Promise<boolean>>('IS_SUPPORTED_PROMISE');

export const IS_SUPPORTED_PROMISE_PROVIDER = {
    deps: [ wndw ],
    provide: isSupportedPromise,
    useFactory: (window: Window): Promise<boolean> => Promise.resolve('MediaStream' in window)
};
