import { TElementType } from './element-type';

export type TDecodeWebMChunkFunction = (
    dataView: Pick<DataView, 'byteLength' | 'byteOffset' | 'getFloat32' | 'getUint8'>,
    elementType: null | TElementType,
    channelCount?: number
) => { contents: (readonly Float32Array[])[]; currentElementType: null | TElementType; offset: number };
