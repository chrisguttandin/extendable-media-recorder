import { TReadElementTypeFunction } from './read-element-type-function';
import { TReadVariableSizeIntegerFunction } from './read-variable-size-integer-function';

export type TReadElementTypeFactory = (readVariableSizeInteger: TReadVariableSizeIntegerFunction) => TReadElementTypeFunction;
