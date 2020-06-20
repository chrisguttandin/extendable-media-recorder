import { MultiBufferDataView } from 'multi-buffer-data-view';
import { TElementType } from './element-type';

export type TPromisedDataViewElementTypeEncoderIdAndPort = Promise<{
    dataView?: null | MultiBufferDataView;

    elementType?: null | TElementType;

    encoderId: number;

    port: MessagePort;
}>;
