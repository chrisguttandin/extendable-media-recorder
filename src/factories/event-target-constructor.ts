import { IEventTarget } from '../interfaces';
import { TEventHandler, TEventTargetConstructorFactory, TNativeEventTarget } from '../types';

export const createEventTargetConstructor: TEventTargetConstructorFactory = (createEventTarget, wrapEventListener) => {
    return class EventTarget<EventMap extends Record<string, Event>> implements IEventTarget<EventMap> {
        private _listeners: WeakMap<EventListenerOrEventListenerObject, EventListenerOrEventListenerObject>;

        private _nativeEventTarget: TNativeEventTarget;

        constructor(nativeEventTarget: null | TNativeEventTarget = null) {
            this._listeners = new WeakMap();
            this._nativeEventTarget = nativeEventTarget === null ? createEventTarget() : nativeEventTarget;
        }

        public addEventListener(
            type: string,
            listener: null | TEventHandler<this> | EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions
        ): void {
            if (listener !== null) {
                let wrappedEventListener = this._listeners.get(listener);

                if (wrappedEventListener === undefined) {
                    wrappedEventListener = wrapEventListener(this, listener);

                    if (typeof listener === 'function') {
                        this._listeners.set(listener, wrappedEventListener);
                    }
                }

                this._nativeEventTarget.addEventListener(type, wrappedEventListener, options);
            }
        }

        public dispatchEvent(event: Event): boolean {
            return this._nativeEventTarget.dispatchEvent(event);
        }

        public removeEventListener(
            type: string,
            listener: null | TEventHandler<this> | EventListenerOrEventListenerObject,
            options?: boolean | EventListenerOptions
        ): void {
            const wrappedEventListener = listener === null ? undefined : this._listeners.get(listener);

            this._nativeEventTarget.removeEventListener(type, wrappedEventListener === undefined ? null : wrappedEventListener, options);
        }
    };
};
