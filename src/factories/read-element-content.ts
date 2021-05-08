import { TReadElementContentFactory } from '../types';

export const createReadElementContent: TReadElementContentFactory = (readVariableSizeInteger) => {
    return (dataView, offset, type, channelCount = 2) => {
        const lengthAndValue = readVariableSizeInteger(dataView, offset);

        if (lengthAndValue === null) {
            return lengthAndValue;
        }

        const { length, value } = lengthAndValue;

        if (type === 'master') {
            return { content: null, length };
        }

        if (offset + length + value > dataView.byteLength) {
            return null;
        }

        if (type === 'binary') {
            const numberOfSamples = (value / Float32Array.BYTES_PER_ELEMENT - 1) / channelCount;
            const content = Array.from({ length: channelCount }, () => new Float32Array(numberOfSamples));

            for (let i = 0; i < numberOfSamples; i += 1) {
                const elementOffset = i * channelCount + 1;

                for (let j = 0; j < channelCount; j += 1) {
                    content[j][i] = dataView.getFloat32(offset + length + (elementOffset + j) * Float32Array.BYTES_PER_ELEMENT, true);
                }
            }

            return { content, length: length + value };
        }

        return { content: null, length: length + value };
    };
};
