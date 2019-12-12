import { TReadElementContentFactory } from '../types';

export const createReadElementContent: TReadElementContentFactory = (readVariableSizeInteger) => {
    return (dataView, offset, type) => {
        const lengthAndValue = readVariableSizeInteger(dataView, offset);

        if (lengthAndValue === null) {
            return lengthAndValue;
        }

        const { length, value } = lengthAndValue;

        if (type === 'master') {
            return { content: null, length };
        }

        if (offset + length + value > dataView.byteOffset + dataView.byteLength) {
            return null;
        }

        if (type === 'binary') {
            const numberOfSamples = ((value / Float32Array.BYTES_PER_ELEMENT) - 1) / 2;
            const content = [ new Float32Array(numberOfSamples), new Float32Array(numberOfSamples) ] as const;

            for (let i = 0; i < numberOfSamples; i += 1) {
                content[0][i] = dataView.getFloat32(offset + length + (((i * 2) + 1) * Float32Array.BYTES_PER_ELEMENT), true);
                content[1][i] = dataView.getFloat32(offset + length + (((i * 2) + 2) * Float32Array.BYTES_PER_ELEMENT), true);
            }

            return { content, length: length + value };
        }

        return { content: null, length: length + value };
    };
};
