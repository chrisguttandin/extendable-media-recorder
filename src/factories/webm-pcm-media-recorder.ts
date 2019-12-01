import { encode, instantiate } from 'media-encoder-host';
import { TPromisedElementTypeEncoderIdAndPort, TRecordingState, TWebmPcmMediaRecorderFactoryFactory } from '../types';

export const createWebmPcmMediaRecorderFactory: TWebmPcmMediaRecorderFactoryFactory = (
    createInvalidModificationError,
    createNotSupportedError,
    decodeWebMChunk
) => {
    return (nativeMediaRecorderConstructor, mediaStream, mimeType) => {
        const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();
        const nativeMediaRecorder = new nativeMediaRecorderConstructor(mediaStream, { mimeType: 'audio/webm;codecs=pcm' });
        const audioTracks = mediaStream.getAudioTracks();
        const sampleRate = (audioTracks.length === 0)
            ? undefined
            : audioTracks[0].getSettings().sampleRate;

        let promisedElementTypeEncoderIdAndPort: null | TPromisedElementTypeEncoderIdAndPort = (sampleRate !== undefined)
            ? instantiate(mimeType, sampleRate)
            : null;
        let promisedPartialRecording: null | Promise<void> = null; // tslint:disable-line:invalid-void

        const dispatchEvent = (event: Event): boolean => {
            const listenersOfType = listeners.get(event.type);

            if (listenersOfType === undefined) {
                return false;
            }

            listenersOfType
                .forEach((listener) => {
                    if (typeof listener === 'object') {
                        listener.handleEvent(event);
                    } else {
                        listener(event);
                    }
                });

            return true;
        };

        const dispatchDataAvailableEvent = (arrayBuffers: ArrayBuffer[]): void => {
            dispatchEvent(new BlobEvent('dataavailable', { data: new Blob(arrayBuffers, { type: mimeType }) }));
        };

        const requestNextPartialRecording = async (encoderId: number, timeslice: number): Promise<void> => { // tslint:disable-line:invalid-void max-line-length
            dispatchDataAvailableEvent(await encode(encoderId, timeslice));

            if (nativeMediaRecorder.state !== 'inactive') {
                promisedPartialRecording = requestNextPartialRecording(encoderId, timeslice);
            }
        };

        const stop = (): void => {
            if (nativeMediaRecorder.state === 'inactive') {
                return;
            }

            if (promisedPartialRecording !== null) {
                promisedPartialRecording.catch(() => { /* @todo Only catch the errors caused by a duplicate call to encode. */ });
            }

            nativeMediaRecorder.stop();
        };

        nativeMediaRecorder.addEventListener('error', (event) => {
            // Bug #3 & 4: Chrome throws an error event without any error.
            Object.defineProperty(event, 'error', { value: createInvalidModificationError() });

            stop();
            dispatchEvent(event);
        });

        return {

            get state (): TRecordingState {
                return nativeMediaRecorder.state;
            },

            // @todo Respect the options object for faked events as well.
            addEventListener (
                type: string,
                listener: EventListenerOrEventListenerObject,
                _options?: boolean | AddEventListenerOptions
            ): void {
                const listenersOfType = listeners.get(type);

                if (listenersOfType !== undefined) {
                    listenersOfType.add(listener);
                } else {
                    listeners.set(type, new Set([ listener ]));
                }
            },

            dispatchEvent,

            // @todo Respect the options object for faked events as well.
            removeEventListener (
                type: string,
                listener: EventListenerOrEventListenerObject,
                _options?: boolean | EventListenerOptions
            ): void {
                const listenersOfType = listeners.get(type);

                if (listenersOfType !== undefined) {
                    listenersOfType.delete(listener);

                    if (listenersOfType.size === 0) {
                        listeners.delete(type);
                    }
                }
            },

            start (timeslice?: number): void {
                /*
                 * Bug #6: Chrome will emit a blob without any data when asked to encode a MediaStream with a video track into an audio
                 * codec.
                 */
                if (mediaStream.getVideoTracks().length > 0) {
                    throw createNotSupportedError();
                }

                if (nativeMediaRecorder.state !== 'inactive') {
                    nativeMediaRecorder.addEventListener('dataavailable', ({ data }) => {
                        if (promisedElementTypeEncoderIdAndPort !== null) {
                            promisedElementTypeEncoderIdAndPort = promisedElementTypeEncoderIdAndPort
                                .then(async ({ elementType = null, encoderId, port }) => {
                                    const { currentElementType, contents } = decodeWebMChunk(await data.arrayBuffer(), elementType);

                                    contents
                                        .forEach((content) => port.postMessage(content, content.map(({ buffer }) => buffer)));

                                    if (nativeMediaRecorder.state === 'inactive') {
                                        encode(encoderId, null)
                                            .then(dispatchDataAvailableEvent);

                                        port.postMessage([ ]);
                                        port.close();
                                    }

                                    return { elementType: currentElementType, encoderId, port };
                                });
                        }
                    });

                    if (promisedElementTypeEncoderIdAndPort !== null && timeslice !== undefined) {
                        promisedElementTypeEncoderIdAndPort
                            .then(({ encoderId }) => promisedPartialRecording = requestNextPartialRecording(encoderId, timeslice));
                    }
                }

                nativeMediaRecorder.start(100);
            },

            stop

        };

    };
};
