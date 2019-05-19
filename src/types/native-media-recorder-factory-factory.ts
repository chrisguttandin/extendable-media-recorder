import { TInvalidModificationErrorFactory } from './invalid-modification-error-factory';
import { TNativeMediaRecorderFactory } from './native-media-recorder-factory';

export type TNativeMediaRecorderFactoryFactory = (
    createInvalidModificationError: TInvalidModificationErrorFactory
) => TNativeMediaRecorderFactory;
