import { TDecodeWebMChunkFactory } from '../types';

export const createDecodeWebMChunk: TDecodeWebMChunkFactory = (readElementContent, readElementType) => {
    return (arrayBuffer, elementType) => {
        const dataView = new DataView(arrayBuffer);
        const contents: (readonly [ Float32Array, Float32Array ])[] = [];

        let currentElementType = elementType;
        let offset = 0;

        while (offset < dataView.byteLength) {
            if (currentElementType === null) {
                const { length, type } = readElementType(dataView, offset);

                currentElementType = type;
                offset += length;
            } else {
                const { length, content } = readElementContent(dataView, offset, currentElementType);

                currentElementType = null;
                offset += length;

                if (content !== null) {
                    contents.push(content);
                }
            }
        }

        return { contents, currentElementType };
    };
};
