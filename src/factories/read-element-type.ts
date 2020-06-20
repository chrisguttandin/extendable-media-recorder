import { TReadElementTypeFactory } from '../types';

export const createReadElementType: TReadElementTypeFactory = (readVariableSizeInteger) => {
    return (dataView, offset) => {
        const lengthAndValue = readVariableSizeInteger(dataView, offset);

        if (lengthAndValue === null) {
            return lengthAndValue;
        }

        const { length, value } = lengthAndValue;

        if (value === 35) {
            return { length, type: 'binary' };
        }

        if (
            value === 46 ||
            value === 97 ||
            value === 88713574 ||
            value === 106212971 ||
            value === 139690087 ||
            value === 172351395 ||
            value === 256095861
        ) {
            return { length, type: 'master' };
        }

        return { length, type: 'unknown' };
    };
};
