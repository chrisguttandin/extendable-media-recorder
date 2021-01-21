import { TNativeBlobEventConstructorFactory } from '../types';

export const createNativeBlobEventConstructor: TNativeBlobEventConstructorFactory = (window) => {
    if (window !== null && window.BlobEvent !== undefined) {
        return window.BlobEvent;
    }

    return null;
};
