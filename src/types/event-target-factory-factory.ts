import { TEventTargetFactory } from './event-target-factory';
import { TWindow } from './window';

export type TEventTargetFactoryFactory = (window: null | TWindow) => TEventTargetFactory;
