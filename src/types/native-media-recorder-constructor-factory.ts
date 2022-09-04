import { TNativeMediaRecorderConstructor } from './native-media-recorder-constructor';
import { TWindow } from './window';

export type TNativeMediaRecorderConstructorFactory = (window: null | TWindow) => null | TNativeMediaRecorderConstructor;
