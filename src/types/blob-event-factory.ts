import { IBlobEvent, IBlobEventInit } from '../interfaces';

export type TBlobEventFactory = (type: string, blobEventInit: IBlobEventInit) => IBlobEvent;
