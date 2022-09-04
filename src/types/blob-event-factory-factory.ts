import { TBlobEventFactory } from './blob-event-factory';
import { TNativeBlobEventConstructor } from './native-blob-event-constructor';

export type TBlobEventFactoryFactory = (nativeBlobEventConstructor: null | TNativeBlobEventConstructor) => TBlobEventFactory;
