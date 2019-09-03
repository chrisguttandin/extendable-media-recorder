import { TInvalidModificationErrorFactory } from './invalid-modification-error-factory';
import { TInvalidStateErrorFactory } from './invalid-state-error-factory';
import { TNotSupportedErrorFactory } from './not-supported-error-factory';
import { TWebAudioMediaRecorderFactory } from './web-audio-media-recorder-factory';

export type TWebAudioMediaRecorderFactoryFactory = (
    createInvalidModificationError: TInvalidModificationErrorFactory,
    createInvalidStateError: TInvalidStateErrorFactory,
    createNotSupportedError: TNotSupportedErrorFactory
) => TWebAudioMediaRecorderFactory;
