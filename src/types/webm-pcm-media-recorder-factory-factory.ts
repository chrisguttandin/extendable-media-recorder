import { TBlobEventFactory } from './blob-event-factory';
import { TDecodeWebMChunkFunction } from './decode-web-m-chunk-function';
import { TReadVariableSizeIntegerFunction } from './read-variable-size-integer-function';
import { TWebmPcmMediaRecorderFactory } from './webm-pcm-media-recorder-factory';

export type TWebmPcmMediaRecorderFactoryFactory = (
    createBlobEvent: TBlobEventFactory,
    decodeWebMChunk: TDecodeWebMChunkFunction,
    readVariableSizeInteger: TReadVariableSizeIntegerFunction
) => TWebmPcmMediaRecorderFactory;
