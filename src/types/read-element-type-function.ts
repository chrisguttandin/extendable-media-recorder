import { TElementType } from './element-type';

export type TReadElementTypeFunction = (dataView: DataView, offset: number) => { length: number; type: TElementType };
