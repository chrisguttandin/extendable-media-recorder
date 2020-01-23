import { TDecodeWebMChunkFactory } from '../types';

export const createDecodeWebMChunk: TDecodeWebMChunkFactory = (readElementContent, readElementType) => {
    return (dataView, elementType, channelCount) => {
        const contents: (readonly Float32Array[])[] = [];

        let currentElementType = elementType;
        let offset = 0;

        while (offset < dataView.byteLength) {
            if (currentElementType === null) {
                const lengthAndType = readElementType(dataView, offset);

                if (lengthAndType === null) {
                    break;
                }

                const { length, type } = lengthAndType;

                currentElementType = type;
                offset += length;
            } else {
                const contentAndLength = readElementContent(dataView, offset, currentElementType, channelCount);

                if (contentAndLength === null) {
                    break;
                }

                const { content, length } = contentAndLength;

                currentElementType = null;
                offset += length;

                if (content !== null) {
                    contents.push(content);
                }
            }
        }

        return { contents, currentElementType, offset };
    };
};
