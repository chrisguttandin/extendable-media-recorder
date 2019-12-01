import { TDecodeWebMChunkFunction } from './decode-web-m-chunk-function';
import { TInvalidModificationErrorFactory } from './invalid-modification-error-factory';
import { TNotSupportedErrorFactory } from './not-supported-error-factory';
import { TWebmPcmMediaRecorderFactory } from './webm-pcm-media-recorder-factory';

export type TWebmPcmMediaRecorderFactoryFactory = (
    createInvalidModificationError: TInvalidModificationErrorFactory,
    createNotSupportedError: TNotSupportedErrorFactory,
    decodeWebMChunk: TDecodeWebMChunkFunction
) => TWebmPcmMediaRecorderFactory;
