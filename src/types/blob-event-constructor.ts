import { IBlobEvent, IBlobEventInit } from '../interfaces';

// @todo TypeScript does not include type definitions for the MediaStream Recording specification yet.
export type TBlobEventConstructor = new (type: string, eventInitDict: IBlobEventInit) => IBlobEvent;
