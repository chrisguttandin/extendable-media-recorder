import { TElementType } from './element-type';

export type TReadElementTypeFunction = (
    dataView: Pick<DataView, 'byteLength' | 'byteOffset' | 'getFloat32' | 'getUint8'>,
    offset: number
) => null | { length: number; type: TElementType };
