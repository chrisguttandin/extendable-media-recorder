import { IEventTarget } from '../interfaces';
import { TNativeEventTarget } from './native-event-target';

export type TEventTargetConstructor<EventMap extends Record<string, Event>> = new (
    nativeEventTarget?: TNativeEventTarget
) => IEventTarget<EventMap>;
