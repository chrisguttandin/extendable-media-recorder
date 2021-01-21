import { TBlobEventConstructor } from './blob-event-constructor';
import { TBlobEventFactory } from './blob-event-factory';

export type TBlobEventFactoryFactory = (nativeBlobEventConstructor: null | TBlobEventConstructor) => TBlobEventFactory;
