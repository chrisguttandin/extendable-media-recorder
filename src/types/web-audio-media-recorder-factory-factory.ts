import { TInvalidModificationErrorFactory } from './invalid-modification-error-factory';
import { TWebAudioMediaRecorderFactory } from './web-audio-media-recorder-factory';

export type TWebAudioMediaRecorderFactoryFactory = (
    createInvalidModificationError: TInvalidModificationErrorFactory
) => TWebAudioMediaRecorderFactory;
