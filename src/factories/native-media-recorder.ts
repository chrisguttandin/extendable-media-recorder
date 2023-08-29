import { IBlobEvent, IMediaRecorder } from '../interfaces';
import { TEventHandler, TNativeMediaRecorderFactoryFactory } from '../types';

export const createNativeMediaRecorderFactory: TNativeMediaRecorderFactoryFactory = () => {
    return (nativeMediaRecorderConstructor, stream, mediaRecorderOptions) => {
        const bufferedBlobEventListeners: Map<EventListener, IBlobEvent[]> = new Map();
        const dataAvailableListeners = new WeakMap<EventListener, (this: IMediaRecorder, event: IBlobEvent) => void>();
        const errorListeners = new WeakMap<EventListener, (this: IMediaRecorder, event: ErrorEvent) => void>();
        const nativeMediaRecorder = new nativeMediaRecorderConstructor(stream, mediaRecorderOptions);
        const stopListeners = new WeakMap<EventListener, (this: IMediaRecorder, event: Event) => void>();

        let isSliced = false;

        nativeMediaRecorder.addEventListener = ((addEventListener) => {
            return (
                type: string,
                listener: null | TEventHandler<IMediaRecorder> | EventListenerOrEventListenerObject,
                options?: boolean | AddEventListenerOptions
            ) => {
                let patchedEventListener = listener;

                if (typeof listener === 'function') {
                    if (type === 'dataavailable') {
                        const bufferedBlobEvents: IBlobEvent[] = [];

                        // Bug #20: Firefox dispatches multiple dataavailable events while being inactive.
                        patchedEventListener = (event: IBlobEvent) => {
                            if (isSliced && nativeMediaRecorder.state === 'inactive') {
                                bufferedBlobEvents.push(event);
                            } else {
                                listener.call(nativeMediaRecorder, event);
                            }
                        };

                        bufferedBlobEventListeners.set(listener, bufferedBlobEvents);
                        dataAvailableListeners.set(listener, patchedEventListener);
                    } else if (type === 'error') {
                        // Bug #12 & #13: Firefox fires a regular event with an error property.
                        patchedEventListener = (event: ErrorEvent | (Event & { error?: Error })) => {
                            if (event instanceof ErrorEvent) {
                                listener.call(nativeMediaRecorder, event);
                            } else {
                                listener.call(nativeMediaRecorder, new ErrorEvent('error', { error: event.error }));
                            }
                        };

                        errorListeners.set(listener, patchedEventListener);
                    } else if (type === 'stop') {
                        // Bug #20: Firefox dispatches multiple dataavailable events while being inactive.
                        patchedEventListener = (event: Event) => {
                            for (const [dataAvailableListener, bufferedBlobEvents] of bufferedBlobEventListeners.entries()) {

                                if (bufferedBlobEvents.length > 0) {
                                    const [blobEvent] = bufferedBlobEvents;

                                    if (bufferedBlobEvents.length > 1) {
                                        Object.defineProperty(blobEvent, 'data', {
                                            value: new Blob(bufferedBlobEvents.map(({data}) => data), { type: blobEvent.data.type })
                                        });
                                    }

                                    bufferedBlobEvents.length = 0;

                                    dataAvailableListener.call(nativeMediaRecorder, blobEvent);
                                }
                            }

                            isSliced = false;

                            listener.call(nativeMediaRecorder, event);
                        };

                        stopListeners.set(listener, patchedEventListener);
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
                    if (type === 'dataavailable') {
                        bufferedBlobEventListeners.delete(listener);

                        const dataAvailableListener = dataAvailableListeners.get(listener);

                        if (dataAvailableListener !== undefined) {
                            patchedEventListener = dataAvailableListener;
                        }
                    } else if (type === 'error') {
                        const errorListener = errorListeners.get(listener);

                        if (errorListener !== undefined) {
                            patchedEventListener = errorListener;
                        }
                    } else if (type === 'stop') {
                        const stopListener = stopListeners.get(listener);

                        if (stopListener !== undefined) {
                            patchedEventListener = stopListener;
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

        nativeMediaRecorder.start = ((start) => {
            return (timeslice?: number) => {
                isSliced = timeslice !== undefined;

                return timeslice === undefined ? start.call(nativeMediaRecorder) : start.call(nativeMediaRecorder, timeslice);
            };
        })(nativeMediaRecorder.start);

        return nativeMediaRecorder;
    };
};
