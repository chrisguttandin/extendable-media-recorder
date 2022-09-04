import { TBlobEventFactoryFactory } from '../types';

export const createBlobEventFactory: TBlobEventFactoryFactory = (nativeBlobEventConstructor) => {
    return (type, blobEventInit) => {
        if (nativeBlobEventConstructor === null) {
            throw new Error('A native BlobEvent could not be created.');
        }

        return new nativeBlobEventConstructor(type, blobEventInit);
    };
};
