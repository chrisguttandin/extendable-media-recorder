import { IBlobEvent, IMediaRecorder } from '../interfaces';
import { TEventHandler, TNativeMediaRecorderFactoryFactory } from '../types';

export const createNativeMediaRecorderFactory: TNativeMediaRecorderFactoryFactory =
    (createNotSupportedError) => (nativeMediaRecorderConstructor, stream, mediaRecorderOptions) => {
        const bufferedBlobEventListeners: Map<EventListener, IBlobEvent[]> = new Map();
        const dataAvailableListeners = new WeakMap<EventListener, (this: IMediaRecorder, event: IBlobEvent) => void>();
        const errorListeners = new WeakMap<EventListener, (this: IMediaRecorder, event: ErrorEvent) => void>();
        const flags: [boolean, boolean][] = [];
        const nativeMediaRecorder = new nativeMediaRecorderConstructor(stream, mediaRecorderOptions);
        const stopListeners = new WeakMap<EventListener, (this: IMediaRecorder, event: Event) => void>();

        nativeMediaRecorder.addEventListener('stop', ({ isTrusted }: Event): void => {
            if (isTrusted) {
                setTimeout(() => flags.shift());
            }
        });

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
                            const [[isSliced, isActive] = [false, false]] = flags;

                            if (isSliced && !isActive) {
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
                                            value: new Blob(
                                                bufferedBlobEvents.map(({ data }) => data),
                                                { type: blobEvent.data.type }
                                            )
                                        });
                                    }

                                    bufferedBlobEvents.length = 0;

                                    dataAvailableListener.call(nativeMediaRecorder, blobEvent);
                                }
                            }

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
                /*
                 * Bug #6: Safari will emit a blob without any data when asked to encode a MediaStream with a video track into an audio
                 * codec.
                 */
                if (
                    mediaRecorderOptions.mimeType !== undefined &&
                    mediaRecorderOptions.mimeType.startsWith('audio/') &&
                    stream.getVideoTracks().length > 0
                ) {
                    throw createNotSupportedError();
                }

                if (nativeMediaRecorder.state === 'inactive') {
                    flags.push([timeslice !== undefined, true]);
                }

                return timeslice === undefined ? start.call(nativeMediaRecorder) : start.call(nativeMediaRecorder, timeslice);
            };
        })(nativeMediaRecorder.start);

        nativeMediaRecorder.stop = ((stop) => {
            return () => {
                if (nativeMediaRecorder.state !== 'inactive') {
                    flags[0][1] = false;
                }

                stop.call(nativeMediaRecorder);
            };
        })(nativeMediaRecorder.stop);

        return nativeMediaRecorder;
    };
