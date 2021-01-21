import { TNativeBlobEventConstructorFactory } from '../types';

export const createNativeBlobEventConstructor: TNativeBlobEventConstructorFactory = (window) => {
    if (window !== null && window.hasOwnProperty('BlobEvent')) {
        return window.BlobEvent;
    }

    return null;
};
