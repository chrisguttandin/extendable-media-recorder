import { TElementType } from './element-type';

export type TDecodeWebMChunkFunction = (
    arrayBuffer: ArrayBuffer,
    currentElementType: null | TElementType
) => { contents: (readonly [ Float32Array, Float32Array ])[]; currentElementType: null | TElementType };
