import { TElementType } from './element-type';

export type TPromisedElementTypeEncoderIdAndPort = Promise<{ elementType?: null | TElementType; encoderId: number; port: MessagePort }>;
