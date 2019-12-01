import { TElementType } from './element-type';

export type TReadElementContentFunction = (
    dataView: DataView,
    offset: number,
    type: TElementType
) => { content: null | readonly [ Float32Array, Float32Array ]; length: number };
