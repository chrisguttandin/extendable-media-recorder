import { encode, instantiate } from 'media-encoder-host';
import { MultiBufferDataView } from 'multi-buffer-data-view';
import { on } from 'subscribable-things';
import { TPromisedDataViewElementTypeEncoderIdAndPort, TRecordingState, TWebmPcmMediaRecorderFactoryFactory } from '../types';

export const createWebmPcmMediaRecorderFactory: TWebmPcmMediaRecorderFactoryFactory = (
    createBlobEvent,
    createInvalidModificationError,
    createNotSupportedError,
    decodeWebMChunk
) => {
    return (eventTarget, nativeMediaRecorderConstructor, mediaStream, mimeType) => {
        const nativeMediaRecorder = new nativeMediaRecorderConstructor(mediaStream, { mimeType: 'audio/webm;codecs=pcm' });
        const audioTracks = mediaStream.getAudioTracks();
        const channelCount = audioTracks.length === 0 ? undefined : audioTracks[0].getSettings().channelCount;
        const sampleRate = audioTracks.length === 0 ? undefined : audioTracks[0].getSettings().sampleRate;

        let promisedPartialRecording: null | Promise<void> = null;

        const dispatchDataAvailableEvent = (arrayBuffers: ArrayBuffer[]): void => {
            eventTarget.dispatchEvent(createBlobEvent('dataavailable', { data: new Blob(arrayBuffers, { type: mimeType }) }));
        };

        const requestNextPartialRecording = async (encoderId: number, timeslice: number): Promise<void> => {
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
                promisedPartialRecording.catch(() => {
                    /* @todo Only catch the errors caused by a duplicate call to encode. */
                });
                promisedPartialRecording = null;
            }

            nativeMediaRecorder.stop();
        };

        nativeMediaRecorder.addEventListener('error', () => {
            stop();
            // Bug #3 & 4: Chrome throws an error event without any error.
            eventTarget.dispatchEvent(new ErrorEvent('error', { error: createInvalidModificationError() }));
        });

        return {
            get mimeType(): string {
                return mimeType;
            },

            get state(): TRecordingState {
                return nativeMediaRecorder.state;
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
                    let promisedDataViewElementTypeEncoderIdAndPort: null | TPromisedDataViewElementTypeEncoderIdAndPort = null;

                    if (sampleRate !== undefined) {
                        promisedDataViewElementTypeEncoderIdAndPort = instantiate(mimeType, sampleRate);
                    }

                    // Bug #9: Chrome sometimes fires more than one dataavailable event while being inactive.
                    let pendingInvocations = 0;

                    const removeEventListener = on(
                        nativeMediaRecorder,
                        'dataavailable'
                    )(({ data }) => {
                        pendingInvocations += 1;

                        if (promisedDataViewElementTypeEncoderIdAndPort !== null) {
                            promisedDataViewElementTypeEncoderIdAndPort = promisedDataViewElementTypeEncoderIdAndPort.then(
                                async ({ dataView = null, elementType = null, encoderId, port }) => {
                                    const multiOrSingleBufferDataView =
                                        dataView === null
                                            ? new DataView(await data.arrayBuffer())
                                            : new MultiBufferDataView([...dataView.buffers, await data.arrayBuffer()], dataView.byteOffset);

                                    const { currentElementType, offset, contents } = decodeWebMChunk(
                                        multiOrSingleBufferDataView,
                                        elementType,
                                        channelCount
                                    );

                                    const remainingDataView =
                                        offset < multiOrSingleBufferDataView.byteLength
                                            ? 'buffer' in multiOrSingleBufferDataView
                                                ? new MultiBufferDataView(
                                                      [multiOrSingleBufferDataView.buffer],
                                                      multiOrSingleBufferDataView.byteOffset + offset
                                                  )
                                                : new MultiBufferDataView(
                                                      multiOrSingleBufferDataView.buffers,
                                                      multiOrSingleBufferDataView.byteOffset + offset
                                                  )
                                            : null;

                                    contents.forEach((content) =>
                                        port.postMessage(
                                            content,
                                            content.map(({ buffer }) => buffer)
                                        )
                                    );

                                    pendingInvocations -= 1;

                                    if (pendingInvocations === 0 && nativeMediaRecorder.state === 'inactive') {
                                        encode(encoderId, null).then(dispatchDataAvailableEvent);

                                        port.postMessage([]);
                                        port.close();

                                        removeEventListener();
                                    }

                                    return { dataView: remainingDataView, elementType: currentElementType, encoderId, port };
                                }
                            );
                        }
                    });

                    if (promisedDataViewElementTypeEncoderIdAndPort !== null && timeslice !== undefined) {
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
