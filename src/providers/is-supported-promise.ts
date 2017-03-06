import { OpaqueToken } from '@angular/core';
import { window as wndw } from './window';

export const isSupportedPromise = new OpaqueToken('IS_SUPPORTED_PROMISE');

export const IS_SUPPORTED_PROMISE_PROVIDER = {
    deps: [ wndw ],
    provide: isSupportedPromise,
    useFactory: (window): Promise<boolean> => Promise.resolve('MediaStream' in window)
};
