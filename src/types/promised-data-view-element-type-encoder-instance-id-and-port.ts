import { MultiBufferDataView } from 'multi-buffer-data-view';
import { TElementType } from './element-type';

export type TPromisedDataViewElementTypeEncoderInstanceIdAndPort = Promise<{
    dataView?: null | MultiBufferDataView;

    elementType?: null | TElementType;

    encoderInstanceId: number;

    port: MessagePort;
}>;
