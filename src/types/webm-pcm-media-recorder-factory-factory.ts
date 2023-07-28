import { TBlobEventFactory } from './blob-event-factory';
import { TDecodeWebMChunkFunction } from './decode-web-m-chunk-function';
import { TNotSupportedErrorFactory } from './not-supported-error-factory';
import { TReadVariableSizeIntegerFunction } from './read-variable-size-integer-function';
import { TWebmPcmMediaRecorderFactory } from './webm-pcm-media-recorder-factory';

export type TWebmPcmMediaRecorderFactoryFactory = (
    createBlobEvent: TBlobEventFactory,
    createNotSupportedError: TNotSupportedErrorFactory,
    decodeWebMChunk: TDecodeWebMChunkFunction,
    readVariableSizeInteger: TReadVariableSizeIntegerFunction
) => TWebmPcmMediaRecorderFactory;
