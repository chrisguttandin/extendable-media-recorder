import { OpaqueToken } from '@angular/core';
import { window } from './window';

export const isSupportedPromise = new OpaqueToken('IS_SUPPORTED_PROMISE');

export const IS_SUPPORTED_PROMISE_PROVIDER = {
    deps: [ window ],
    provide: isSupportedPromise,
    useFactory: (window): Promise<boolean> => Promise.resolve('MediaStream' in window)
};
