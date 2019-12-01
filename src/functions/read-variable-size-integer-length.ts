import { TReadVariableSizeIntegerLengthFunction } from '../types';

export const readVariableSizeIntegerLength: TReadVariableSizeIntegerLengthFunction = (dataView, offset) => {
    const byte = dataView.getUint8(offset);

    if (byte > 127) {
        return 1;
    }

    if (byte > 63) {
        return 2;
    }

    if (byte > 31) {
        return 3;
    }

    if (byte > 15) {
        return 4;
    }

    if (byte > 7) {
        return 5;
    }

    if (byte > 3) {
        return 6;
    }

    if (byte > 1) {
        return 7;
    }

    if (byte > 0) {
        return 8;
    }

    return 8 + readVariableSizeIntegerLength(dataView, offset + 1);
};
