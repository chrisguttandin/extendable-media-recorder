import { TIsSupportedPromiseFactory } from '../types';

export const createIsSupportedPromise: TIsSupportedPromiseFactory = (window) => {
    return Promise.resolve(window !== null && window.hasOwnProperty('MediaStream'));
};
