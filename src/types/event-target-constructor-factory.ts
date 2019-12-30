import { TEventTargetConstructor } from './event-target-constructor';
import { TEventTargetFactory } from './event-target-factory';
import { TWrapEventListenerFunction } from './wrap-event-listener-function';

export type TEventTargetConstructorFactory = (
    createEventTarget: TEventTargetFactory,
    wrapEventListener: TWrapEventListenerFunction
) => TEventTargetConstructor;
