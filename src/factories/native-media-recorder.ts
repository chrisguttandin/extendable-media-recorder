import { TNativeMediaRecorder, TNativeMediaRecorderFactoryFactory } from '../types';

export const createNativeMediaRecorderFactory: TNativeMediaRecorderFactoryFactory = (createInvalidModificationError) => {
    return (nativeMediaRecorderConstructor, stream, mediaRecorderOptions) => {
        const dataAvailableListeners = new WeakMap<any, null | ((this: TNativeMediaRecorder, event: Event) => any)>();
        const errorListeners = new WeakMap<any, null | ((this: TNativeMediaRecorder, event: Event) => any)>();
        const nativeMediaRecorder = new nativeMediaRecorderConstructor(stream, mediaRecorderOptions);

        nativeMediaRecorder.addEventListener = ((addEventListener) => {
            return (
                type: string,
                listener: EventListenerOrEventListenerObject | null = null,
                options?: boolean | AddEventListenerOptions
            ) => {
                let patchedEventListener = listener;

                if (typeof listener === 'function') {
                    if (type === 'dataavailable') {
                        patchedEventListener = (event: Event) => setTimeout(() => listener(event));

                        dataAvailableListeners.set(listener, patchedEventListener);
                    } else if (type === 'error') {
                        patchedEventListener = (event: Event) => {
                            // Bug #3 & 4: Chrome throws an error event without any error.
                            if ((<ErrorEvent> event).error === undefined) {
                                Object.defineProperty(event, type, { value: createInvalidModificationError() });
                            // Bug #3 & 4: Firefox throws an error event with an UnknownError.
                            } else if ((<ErrorEvent> event).error.name === 'UnknownError') {
                                const message = (<ErrorEvent> event).error.message;

                                Object.defineProperty(event, type, { value: createInvalidModificationError(message) });
                            }

                            listener(event);
                        };

                        dataAvailableListeners.set(listener, patchedEventListener);
                    }
                }

                return addEventListener.call(nativeMediaRecorder, type, patchedEventListener, options);
            };
        })(nativeMediaRecorder.addEventListener);

        nativeMediaRecorder.removeEventListener = ((removeEventListener) => {
            return (
                type: string,
                listener: EventListenerOrEventListenerObject | null = null,
                options?: boolean | AddEventListenerOptions
            ) => {
                let patchedEventListener = listener;

                if (typeof listener === 'function') {
                    if (type === 'dataavailable') {
                        const dataAvailableListener = dataAvailableListeners.get(listener);

                        if (dataAvailableListener !== undefined) {
                            patchedEventListener = dataAvailableListener;
                        }
                    } else if (type === 'error') {
                        const errorListener = errorListeners.get(listener);

                        if (errorListener !== undefined) {
                            patchedEventListener = errorListener;
                        }
                    }
                }

                return removeEventListener.call(nativeMediaRecorder, type, patchedEventListener, options);
            };
        })(nativeMediaRecorder.removeEventListener);

        return nativeMediaRecorder;
    };
};
