import { encode, instantiate } from 'media-encoder-host';
import { MultiBufferDataView } from 'multi-buffer-data-view';
import { on } from 'subscribable-things';
import { TPromisedDataViewElementTypeEncoderIdAndPort, TRecordingState, TWebmPcmMediaRecorderFactoryFactory } from '../types';

export const createWebmPcmMediaRecorderFactory: TWebmPcmMediaRecorderFactoryFactory = (
    createBlobEvent,
    createNotSupportedError,
    decodeWebMChunk,
    readVariableSizeInteger
) => {
    return (eventTarget, nativeMediaRecorderConstructor, mediaStream, mimeType) => {
        const audioTracks = mediaStream.getAudioTracks();
        const bufferedArrayBuffers: ArrayBuffer[] = [];
        const nativeMediaRecorder = new nativeMediaRecorderConstructor(mediaStream, { mimeType: 'audio/webm;codecs=pcm' });

        let promisedPartialRecording: null | Promise<void> = null;
        let stopRecording = () => {}; // tslint:disable-line:no-empty

        const dispatchDataAvailableEvent = (arrayBuffers: ArrayBuffer[]): void => {
            eventTarget.dispatchEvent(createBlobEvent('dataavailable', { data: new Blob(arrayBuffers, { type: mimeType }) }));
        };

        const requestNextPartialRecording = async (encoderId: number, timeslice: number): Promise<void> => {
            const arrayBuffers = await encode(encoderId, timeslice);

            if (nativeMediaRecorder.state === 'inactive') {
                bufferedArrayBuffers.push(...arrayBuffers);
            } else {
                dispatchDataAvailableEvent(arrayBuffers);

                promisedPartialRecording = requestNextPartialRecording(encoderId, timeslice);
            }
        };

        const stop = (): void => {
            if (nativeMediaRecorder.state === 'inactive') {
                return;
            }

            if (promisedPartialRecording !== null) {
                promisedPartialRecording.catch(() => {
                    /* @todo Only catch the errors caused by a duplicate call to encode. */
                });
                promisedPartialRecording = null;
            }

            stopRecording();
            stopRecording = () => {}; // tslint:disable-line:no-empty

            nativeMediaRecorder.stop();
        };

        nativeMediaRecorder.addEventListener('error', (event) => {
            stop();
            eventTarget.dispatchEvent(
                new ErrorEvent('error', {
                    error: (<ErrorEvent>event).error
                })
            );
        });
        nativeMediaRecorder.addEventListener('pause', () => eventTarget.dispatchEvent(new Event('pause')));
        nativeMediaRecorder.addEventListener('resume', () => eventTarget.dispatchEvent(new Event('resume')));
        nativeMediaRecorder.addEventListener('start', () => eventTarget.dispatchEvent(new Event('start')));

        return {
            get mimeType(): string {
                return mimeType;
            },

            get state(): TRecordingState {
                return nativeMediaRecorder.state;
            },

            pause(): void {
                return nativeMediaRecorder.pause();
            },

            resume(): void {
                return nativeMediaRecorder.resume();
            },

            start(timeslice?: number): void {
                /*
                 * Bug #6: Chrome will emit a blob without any data when asked to encode a MediaStream with a video track into an audio
                 * codec.
                 */
                if (mediaStream.getVideoTracks().length > 0) {
                    throw createNotSupportedError();
                }

                if (nativeMediaRecorder.state === 'inactive') {
                    // Bug #19: Chrome does not expose the correct channelCount property right away.
                    // @todo TypeScript v4.4.2 removed the channelCount property from the MediaTrackSettings interface.
                    const channelCount = (<MediaTrackSettings & { channelCount?: number }>audioTracks[0]?.getSettings()).channelCount;
                    const sampleRate = audioTracks[0]?.getSettings().sampleRate;

                    if (channelCount === undefined) {
                        throw new Error('The channelCount is not defined.');
                    }

                    if (sampleRate === undefined) {
                        throw new Error('The sampleRate is not defined.');
                    }

                    let isRecording = false;
                    let isStopped = false;
                    // Bug #9: Chrome sometimes fires more than one dataavailable event while being inactive.
                    let pendingInvocations = 0;
                    let promisedDataViewElementTypeEncoderIdAndPort: TPromisedDataViewElementTypeEncoderIdAndPort = instantiate(
                        mimeType,
                        sampleRate
                    );

                    stopRecording = () => {
                        isStopped = true;
                    };

                    const removeEventListener = on(
                        nativeMediaRecorder,
                        'dataavailable'
                    )(({ data }) => {
                        pendingInvocations += 1;

                        promisedDataViewElementTypeEncoderIdAndPort = promisedDataViewElementTypeEncoderIdAndPort.then(
                            async ({ dataView = null, elementType = null, encoderId, port }) => {
                                const arrayBuffer = await data.arrayBuffer();

                                pendingInvocations -= 1;

                                const currentDataView =
                                    dataView === null
                                        ? new MultiBufferDataView([arrayBuffer])
                                        : new MultiBufferDataView([...dataView.buffers, arrayBuffer], dataView.byteOffset);

                                if (!isRecording && nativeMediaRecorder.state === 'recording' && !isStopped) {
                                    const lengthAndValue = readVariableSizeInteger(currentDataView, 0);

                                    if (lengthAndValue === null) {
                                        return { dataView: currentDataView, elementType, encoderId, port };
                                    }

                                    const { value } = lengthAndValue;

                                    if (value !== 172351395) {
                                        return { dataView, elementType, encoderId, port };
                                    }

                                    isRecording = true;
                                }

                                const { currentElementType, offset, contents } = decodeWebMChunk(
                                    currentDataView,
                                    elementType,
                                    channelCount
                                );
                                const remainingDataView =
                                    offset < currentDataView.byteLength
                                        ? new MultiBufferDataView(currentDataView.buffers, currentDataView.byteOffset + offset)
                                        : null;

                                contents.forEach((content) =>
                                    port.postMessage(
                                        content,
                                        content.map(({ buffer }) => buffer)
                                    )
                                );

                                if (pendingInvocations === 0 && (nativeMediaRecorder.state === 'inactive' || isStopped)) {
                                    encode(encoderId, null).then((arrayBuffers) => {
                                        dispatchDataAvailableEvent([...bufferedArrayBuffers, ...arrayBuffers]);

                                        bufferedArrayBuffers.length = 0;

                                        eventTarget.dispatchEvent(new Event('stop'));
                                    });

                                    port.postMessage([]);
                                    port.close();

                                    removeEventListener();
                                }

                                return { dataView: remainingDataView, elementType: currentElementType, encoderId, port };
                            }
                        );
                    });

                    if (timeslice !== undefined) {
                        promisedDataViewElementTypeEncoderIdAndPort.then(
                            ({ encoderId }) => (promisedPartialRecording = requestNextPartialRecording(encoderId, timeslice))
                        );
                    }
                }

                nativeMediaRecorder.start(100);
            },

            stop
        };
    };
};
