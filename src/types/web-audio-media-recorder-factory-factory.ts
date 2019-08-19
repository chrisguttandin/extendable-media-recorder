import { TInvalidModificationErrorFactory } from './invalid-modification-error-factory';
import { TNotSupportedErrorFactory } from './not-supported-error-factory';
import { TWebAudioMediaRecorderFactory } from './web-audio-media-recorder-factory';

export type TWebAudioMediaRecorderFactoryFactory = (
    createInvalidModificationError: TInvalidModificationErrorFactory,
    createNotSupportedError: TNotSupportedErrorFactory
) => TWebAudioMediaRecorderFactory;
