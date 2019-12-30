import { TEventTargetFactory } from './event-target-factory';

export type TEventTargetFactoryFactory = (window: null | Window) => TEventTargetFactory;
