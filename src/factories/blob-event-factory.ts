import { TBlobEventFactoryFactory } from '../types';

export const createBlobEventFactory: TBlobEventFactoryFactory = (nativeBlobEventConstructor) => {
    return (type, blobEventInit) => {
        // Bug #14: Safari does not yet support the BlobEvent.
        if (nativeBlobEventConstructor === null) {
            const { data, ...eventInit } = blobEventInit;
            const fakeBlobEvent = <BlobEvent>new Event(type, eventInit);

            (<Omit<BlobEvent, 'data'> & { -readonly [P in 'data']: BlobEvent[P] }>fakeBlobEvent).data = data;

            return fakeBlobEvent;
        }

        return new nativeBlobEventConstructor(type, blobEventInit);
    };
};
