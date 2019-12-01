import { TReadElementContentFunction } from './read-element-content-function';
import { TReadVariableSizeIntegerFunction } from './read-variable-size-integer-function';

export type TReadElementContentFactory = (readVariableSizeInteger: TReadVariableSizeIntegerFunction) => TReadElementContentFunction;
