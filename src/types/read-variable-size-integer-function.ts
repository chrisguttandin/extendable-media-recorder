export type TReadVariableSizeIntegerFunction = (
    dataView: Pick<DataView, 'byteLength' | 'byteOffset' | 'getUint8'>,
    offset: number
) => null | { length: number; value: number };
