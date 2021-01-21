import { IBlobEvent } from '../interfaces';
import { TBlobEventFactoryFactory } from '../types';

export const createBlobEventFactory: TBlobEventFactoryFactory = (nativeBlobEventConstructor) => {
    return (type, blobEventInit) => {
        // Bug #14: Safari does not yet support the BlobEvent.
        if (nativeBlobEventConstructor === null) {
            const { data, ...eventInit } = blobEventInit;
            const fakeBlobEvent = <IBlobEvent>new Event(type, eventInit);

            (<Omit<IBlobEvent, 'data'> & { -readonly [P in 'data']: IBlobEvent[P] }>fakeBlobEvent).data = data;

            return fakeBlobEvent;
        }

        return new nativeBlobEventConstructor(type, blobEventInit);
    };
};
