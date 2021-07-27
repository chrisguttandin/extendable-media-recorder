import { IBlobEvent, IMediaRecorder } from '../interfaces';
import { TNativeMediaRecorderFactoryFactory } from '../types';

export const createNativeMediaRecorderFactory: TNativeMediaRecorderFactoryFactory = (
    createInvalidModificationError,
    createNotSupportedError
) => {
    return (nativeMediaRecorderConstructor, stream, mediaRecorderOptions) => {
        const bufferedBlobs: Blob[] = [];
        const dataAvailableListeners = new WeakMap<any, (this: IMediaRecorder, event: Event) => any>();
        const errorListeners = new WeakMap<any, (this: IMediaRecorder, event: Event) => any>();
        const nativeMediaRecorder = new nativeMediaRecorderConstructor(stream, mediaRecorderOptions);
        const stopListeners = new WeakMap<any, (this: IMediaRecorder, event: Event) => any>();

        let isActive = true;

        nativeMediaRecorder.addEventListener = ((addEventListener) => {
            return (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
                let patchedEventListener = listener;

                if (typeof listener === 'function') {
                    if (type === 'dataavailable') {
                        // Bug #7 & 8: Chrome fires the dataavailable and stop events before it fires the error event.
                        patchedEventListener = (event: Event) => {
                            setTimeout(() => {
                                if (isActive && nativeMediaRecorder.state === 'inactive') {
                                    bufferedBlobs.push((<IBlobEvent>event).data);
                                } else {
                                    if (bufferedBlobs.length > 0) {
                                        const blob = (<IBlobEvent>event).data;

                                        Object.defineProperty(<IBlobEvent>event, 'data', {
                                            value: new Blob([...bufferedBlobs, blob], { type: blob.type })
                                        });

                                        bufferedBlobs.length = 0;
                                    }

                                    listener.call(nativeMediaRecorder, event);
                                }
                            });
                        };

                        dataAvailableListeners.set(listener, patchedEventListener);
                    } else if (type === 'error') {
                        patchedEventListener = (event: Event) => {
                            // Bug #3 & 4: Chrome throws an error event without any error.
                            if ((<ErrorEvent>event).error === undefined) {
                                listener.call(nativeMediaRecorder, new ErrorEvent('error', { error: createInvalidModificationError() }));
                                // Bug #1 & 2: Firefox throws an error event with an UnknownError.
                            } else if ((<ErrorEvent>event).error.name === 'UnknownError') {
                                const message = (<ErrorEvent>event).error.message;

                                listener.call(
                                    nativeMediaRecorder,
                                    new ErrorEvent('error', { error: createInvalidModificationError(message) })
                                );
                            } else if (!(event instanceof ErrorEvent)) {
                                listener.call(nativeMediaRecorder, new ErrorEvent('error', { error: (<ErrorEvent>event).error }));
                            } else {
                                listener.call(nativeMediaRecorder, event);
                            }
                        };

                        errorListeners.set(listener, patchedEventListener);
                    } else if (type === 'stop') {
                        // Bug #7 & 8: Chrome fires the dataavailable and stop events before it fires the error event.
                        patchedEventListener = (event: Event) => {
                            isActive = false;

                            setTimeout(() => listener.call(nativeMediaRecorder, event));
                        };

                        stopListeners.set(listener, patchedEventListener);
                    }
                }

                return addEventListener.call(nativeMediaRecorder, type, patchedEventListener, options);
            };
        })(nativeMediaRecorder.addEventListener);

        nativeMediaRecorder.dispatchEvent = ((dispatchEvent) => {
            // Bug #7 & 8: Chrome fires the dataavailable and stop events before it fires the error event.
            return (event: Event) => {
                let wasActive: boolean;

                setTimeout(() => {
                    wasActive = isActive;
                    isActive = false;
                });

                const returnValue = dispatchEvent.call(nativeMediaRecorder, event);

                setTimeout(() => (isActive = wasActive));

                return returnValue;
            };
        })(nativeMediaRecorder.dispatchEvent);

        nativeMediaRecorder.removeEventListener = ((removeEventListener) => {
            return (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
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
                    } else if (type === 'stop') {
                        const stopListener = stopListeners.get(listener);

                        if (stopListener !== undefined) {
                            patchedEventListener = stopListener;
                        }
                    }
                }

                return removeEventListener.call(nativeMediaRecorder, type, patchedEventListener, options);
            };
        })(nativeMediaRecorder.removeEventListener);

        nativeMediaRecorder.start = ((start) => {
            return (timeslice?: number) => {
                /*
                 * Bug #6: Chrome will emit a blob without any data when asked to encode a MediaStream with a video track into an audio
                 * codec.
                 */
                if (
                    mediaRecorderOptions.mimeType !== undefined &&
                    mediaRecorderOptions.mimeType.startsWith('audio/') &&
                    stream.getVideoTracks().length > 0
                ) {
                    throw createNotSupportedError();
                }

                isActive = timeslice !== undefined;

                return timeslice === undefined ? start.call(nativeMediaRecorder) : start.call(nativeMediaRecorder, timeslice);
            };
        })(nativeMediaRecorder.start);

        return nativeMediaRecorder;
    };
};
