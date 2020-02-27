import { IBlobEvent } from '../interfaces';
import { TEventHandler } from './event-handler';

export type TBlobEventHandler<T> = TEventHandler<T, IBlobEvent>;
