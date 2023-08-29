import { IMediaRecorder } from '../interfaces';
import { TEventHandler, TNativeMediaRecorderFactoryFactory } from '../types';

export const createNativeMediaRecorderFactory: TNativeMediaRecorderFactoryFactory = () => {
    return (nativeMediaRecorderConstructor, stream, mediaRecorderOptions) => {
        const errorListeners = new WeakMap<EventListener, (this: IMediaRecorder, event: ErrorEvent) => void>();
        const nativeMediaRecorder = new nativeMediaRecorderConstructor(stream, mediaRecorderOptions);

        nativeMediaRecorder.addEventListener = ((addEventListener) => {
            return (
                type: string,
                listener: null | TEventHandler<IMediaRecorder> | EventListenerOrEventListenerObject,
                options?: boolean | AddEventListenerOptions
            ) => {
                let patchedEventListener = listener;

                if (typeof listener === 'function') {
                    if (type === 'error') {
                        // Bug #12 & #13: Firefox fires a regular event with an error property.
                        patchedEventListener = (event: ErrorEvent | (Event & { error?: Error })) => {
                            if (event instanceof ErrorEvent) {
                                listener.call(nativeMediaRecorder, event);
                            } else {
                                listener.call(nativeMediaRecorder, new ErrorEvent('error', { error: event.error }));
                            }
                        };

                        errorListeners.set(listener, patchedEventListener);
                    }
                }

                return addEventListener.call(nativeMediaRecorder, type, <EventListenerOrEventListenerObject>patchedEventListener, options);
            };
        })(nativeMediaRecorder.addEventListener);

        nativeMediaRecorder.removeEventListener = ((removeEventListener) => {
            return (
                type: string,
                listener: null | TEventHandler<IMediaRecorder> | EventListenerOrEventListenerObject,
                options?: boolean | EventListenerOptions
            ) => {
                let patchedEventListener = listener;

                if (typeof listener === 'function') {
                    if (type === 'error') {
                        const errorListener = errorListeners.get(listener);

                        if (errorListener !== undefined) {
                            patchedEventListener = errorListener;
                        }
                    }
                }

                return removeEventListener.call(
                    nativeMediaRecorder,
                    type,
                    <EventListenerOrEventListenerObject>patchedEventListener,
                    options
                );
            };
        })(nativeMediaRecorder.removeEventListener);

        return nativeMediaRecorder;
    };
};
