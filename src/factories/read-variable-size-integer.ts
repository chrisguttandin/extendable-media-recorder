import { TReadVariableSizeIntegerFactory } from '../types';

export const createReadVariableSizeInteger: TReadVariableSizeIntegerFactory = (readVariableSizeIntegerLength) => {
    return (dataView, offset) => {
        const length = readVariableSizeIntegerLength(dataView, offset);
        const firstDataByteOffset = offset + Math.floor((length - 1) / 8);
        const firstDataByte = dataView.getUint8(firstDataByteOffset);

        let value = firstDataByte & ((1 << (8 - (length % 8))) - 1); // tslint:disable-line:no-bitwise

        for (let i = 1; i < length; i += 1) {
            value = (value << 8) + dataView.getUint8(firstDataByteOffset + i); // tslint:disable-line:no-bitwise
        }

        return { length, value };
    };
};
