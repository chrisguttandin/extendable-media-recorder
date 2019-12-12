export type TReadVariableSizeIntegerLengthFunction = (
    dataView: Pick<DataView, 'byteLength' | 'byteOffset' | 'getUint8'>,
    offset: number
) => null | number;
