import { TDecodeWebMChunkFunction } from './decode-web-m-chunk-function';
import { TReadElementContentFunction } from './read-element-content-function';
import { TReadElementTypeFunction } from './read-element-type-function';

export type TDecodeWebMChunkFactory = (
    readElementContent: TReadElementContentFunction,
    readElementType: TReadElementTypeFunction
) => TDecodeWebMChunkFunction;
