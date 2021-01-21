import { IMediaRecorderConstructor } from '../interfaces';
import { TWindow } from './window';

export type TNativeMediaRecorderConstructorFactory = (window: null | TWindow) => null | IMediaRecorderConstructor;
