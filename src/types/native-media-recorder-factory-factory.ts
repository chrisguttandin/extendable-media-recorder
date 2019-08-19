import { TInvalidModificationErrorFactory } from './invalid-modification-error-factory';
import { TNativeMediaRecorderFactory } from './native-media-recorder-factory';
import { TNotSupportedErrorFactory } from './not-supported-error-factory';

export type TNativeMediaRecorderFactoryFactory = (
    createInvalidModificationError: TInvalidModificationErrorFactory,
    createNotSupportedError: TNotSupportedErrorFactory
) => TNativeMediaRecorderFactory;
