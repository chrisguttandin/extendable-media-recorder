import { TNativeMediaRecorderFactory } from './native-media-recorder-factory';
import { TNotSupportedErrorFactory } from './not-supported-error-factory';

export type TNativeMediaRecorderFactoryFactory = (createNotSupportedError: TNotSupportedErrorFactory) => TNativeMediaRecorderFactory;
