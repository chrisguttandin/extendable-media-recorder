import { TReadVariableSizeIntegerFunction } from './read-variable-size-integer-function';
import { TReadVariableSizeIntegerLengthFunction } from './read-variable-size-integer-length-function';

export type TReadVariableSizeIntegerFactory = (
    readVariableSizeIntegerLength: TReadVariableSizeIntegerLengthFunction
) => TReadVariableSizeIntegerFunction;
