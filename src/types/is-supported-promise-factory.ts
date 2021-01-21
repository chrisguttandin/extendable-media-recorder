import { TWindow } from './window';

export type TIsSupportedPromiseFactory = (window: null | TWindow) => Promise<boolean>;
