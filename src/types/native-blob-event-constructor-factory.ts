import { TNativeBlobEventConstructor } from './native-blob-event-constructor';
import { TWindow } from './window';

export type TNativeBlobEventConstructorFactory = (window: null | TWindow) => null | TNativeBlobEventConstructor;
