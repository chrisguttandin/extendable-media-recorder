import { TNativeMediaRecorder, TNativeMediaRecorderFactoryFactory } from '../types';

export const createNativeMediaRecorderFactory: TNativeMediaRecorderFactoryFactory = (
    createInvalidModificationError,
    createNotSupportedError
) => {
    return (nativeMediaRecorderConstructor, stream, mediaRecorderOptions) => {
        const dataAvailableListeners = new WeakMap<any, (this: TNativeMediaRecorder, event: Event) => any>();
        const errorListeners = new WeakMap<any, (this: TNativeMediaRecorder, event: Event) => any>();
        const nativeMediaRecorder = new nativeMediaRecorderConstructor(stream, mediaRecorderOptions);

        nativeMediaRecorder.addEventListener = ((addEventListener) => {
            return (
                type: string,
                listener: EventListenerOrEventListenerObject,
                options?: boolean | AddEventListenerOptions
            ) => {
                let patchedEventListener = listener;

                if (typeof listener === 'function') {
                    if (type === 'dataavailable') {
                        patchedEventListener = (event: Event) => setTimeout(() => listener.call(nativeMediaRecorder, event));

                        dataAvailableListeners.set(listener, patchedEventListener);
                    } else if (type === 'error') {
                        patchedEventListener = (event: Event) => {
                            // Bug #3 & 4: Chrome throws an error event without any error.
                            if ((<ErrorEvent> event).error === undefined) {
                                Object.defineProperty(event, type, { value: createInvalidModificationError() });
                            // Bug #1 & 2: Firefox throws an error event with an UnknownError.
                            } else if ((<ErrorEvent> event).error.name === 'UnknownError') {
                                const message = (<ErrorEvent> event).error.message;

                                Object.defineProperty(event, type, { value: createInvalidModificationError(message) });
                            }

                            listener.call(nativeMediaRecorder, event);
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
                listener: EventListenerOrEventListenerObject,
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

        nativeMediaRecorder.start = ((start) => {
            return (timeslice?: number) => {
                /*
                 * Bug #6: Chrome will emit a blob without any data when asked to encode a MediaStream with a video track into an audio
                 * codec.
                 */
                if (mediaRecorderOptions.mimeType !== undefined
                        && mediaRecorderOptions.mimeType.startsWith('audio/')
                        && stream.getVideoTracks().length > 0) {
                    throw createNotSupportedError();
                }

                return (timeslice === undefined) ? start.call(nativeMediaRecorder) : start.call(nativeMediaRecorder, timeslice);
            };
        })(nativeMediaRecorder.start);

        return nativeMediaRecorder;
    };
};
