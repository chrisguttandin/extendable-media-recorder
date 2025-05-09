import { encode, instantiate } from 'media-encoder-host';
import { addRecorderAudioWorkletModule, createRecorderAudioWorkletNode } from 'recorder-audio-worklet';
import {
    AudioBuffer,
    AudioBufferSourceNode,
    AudioWorkletNode,
    IAudioBuffer,
    IMinimalAudioContext,
    MediaStreamAudioSourceNode,
    MinimalAudioContext,
    addAudioWorkletModule
} from 'standardized-audio-context';
import { IAudioNodesAndEncoderInstanceId } from '../interfaces';
import { TRecordingState, TWebAudioMediaRecorderFactoryFactory } from '../types';

const ERROR_MESSAGE = 'Missing AudioWorklet support. Maybe this is not running in a secure context.';

// @todo This should live in a separate file.
const createPromisedAudioNodesEncoderInstanceIdAndPort = async (
    audioBuffer: null | IAudioBuffer,
    audioContext: IMinimalAudioContext,
    channelCount: number,
    mediaStream: MediaStream,
    mimeType: string
) => {
    const { encoderInstanceId, port } = await instantiate(mimeType, audioContext.sampleRate);

    if (AudioWorkletNode === undefined) {
        throw new Error(ERROR_MESSAGE);
    }

    const audioBufferSourceNode = audioBuffer === null ? null : new AudioBufferSourceNode(audioContext, { buffer: audioBuffer });
    const mediaStreamAudioSourceNode = new MediaStreamAudioSourceNode(audioContext, { mediaStream });
    const recorderAudioWorkletNode = createRecorderAudioWorkletNode(AudioWorkletNode, audioContext, { channelCount });

    return { audioBufferSourceNode, encoderInstanceId, mediaStreamAudioSourceNode, port, recorderAudioWorkletNode };
};

export const createWebAudioMediaRecorderFactory: TWebAudioMediaRecorderFactoryFactory = (
    createBlobEvent,
    createInvalidModificationError,
    createInvalidStateError,
    createNotSupportedError
) => {
    return (eventTarget, mediaStream, mimeType) => {
        const sampleRate = mediaStream.getAudioTracks()[0]?.getSettings().sampleRate;
        const audioContext = new MinimalAudioContext({ latencyHint: 'playback', sampleRate });
        /*
         * Bug #22: Safari adds a certain number of leading zeros which need to be skipped.
         *
         * Bug #21: Firefox is the only browser not supporting audio/mp4. This is totally unrelated and just used to apply the fix only for
         * Safari.
         */
        const audioBuffer = MediaRecorder.isTypeSupported('audio/mp4')
            ? new AudioBuffer({ length: 2688, sampleRate: audioContext.sampleRate })
            : null;
        const bufferedArrayBuffers: ArrayBuffer[] = [];
        const promisedAudioWorkletModule = addRecorderAudioWorkletModule((url: string) => {
            if (addAudioWorkletModule === undefined) {
                throw new Error(ERROR_MESSAGE);
            }

            return addAudioWorkletModule(audioContext, url);
        });

        let abortRecording: null | (() => void) = null;
        let intervalId: null | number = null;
        let promisedAudioNodesAndEncoderInstanceId: null | Promise<IAudioNodesAndEncoderInstanceId> = null;
        let promisedPartialRecording: null | Promise<void> = null;
        let isAudioContextRunning = true;

        const dispatchDataAvailableEvent = (arrayBuffers: ArrayBuffer[]): void => {
            eventTarget.dispatchEvent(createBlobEvent('dataavailable', { data: new Blob(arrayBuffers, { type: mimeType }) }));
        };

        const requestNextPartialRecording = async (encoderInstanceId: number, timeslice: number): Promise<void> => {
            const arrayBuffers = await encode(encoderInstanceId, timeslice);

            if (promisedAudioNodesAndEncoderInstanceId === null) {
                bufferedArrayBuffers.push(...arrayBuffers);
            } else {
                dispatchDataAvailableEvent(arrayBuffers);

                promisedPartialRecording = requestNextPartialRecording(encoderInstanceId, timeslice);
            }
        };

        const resume = (): Promise<void> => {
            isAudioContextRunning = true;

            return audioContext.resume();
        };

        const stop = (): void => {
            if (promisedAudioNodesAndEncoderInstanceId === null) {
                return;
            }

            if (abortRecording !== null) {
                mediaStream.removeEventListener('addtrack', abortRecording);
                mediaStream.removeEventListener('removetrack', abortRecording);
            }

            if (intervalId !== null) {
                clearTimeout(intervalId);
            }

            promisedAudioNodesAndEncoderInstanceId.then(
                async ({ encoderInstanceId, mediaStreamAudioSourceNode, recorderAudioWorkletNode }) => {
                    if (promisedPartialRecording !== null) {
                        promisedPartialRecording.catch(() => {
                            /* @todo Only catch the errors caused by a duplicate call to encode. */
                        });
                        promisedPartialRecording = null;
                    }

                    await recorderAudioWorkletNode.stop();

                    mediaStreamAudioSourceNode.disconnect(recorderAudioWorkletNode);

                    const arrayBuffers = await encode(encoderInstanceId, null);

                    if (promisedAudioNodesAndEncoderInstanceId === null) {
                        await suspend();
                    }

                    dispatchDataAvailableEvent([...bufferedArrayBuffers, ...arrayBuffers]);

                    bufferedArrayBuffers.length = 0;

                    eventTarget.dispatchEvent(new Event('stop'));
                }
            );

            promisedAudioNodesAndEncoderInstanceId = null;
        };

        const suspend = (): Promise<void> => {
            isAudioContextRunning = false;

            return audioContext.suspend();
        };

        suspend();

        return {
            get mimeType(): string {
                return mimeType;
            },

            get state(): TRecordingState {
                return promisedAudioNodesAndEncoderInstanceId === null ? 'inactive' : isAudioContextRunning ? 'recording' : 'paused';
            },

            pause(): void {
                if (promisedAudioNodesAndEncoderInstanceId === null) {
                    throw createInvalidStateError();
                }

                if (isAudioContextRunning) {
                    suspend();
                    eventTarget.dispatchEvent(new Event('pause'));
                }
            },

            resume(): void {
                if (promisedAudioNodesAndEncoderInstanceId === null) {
                    throw createInvalidStateError();
                }

                if (!isAudioContextRunning) {
                    resume();
                    eventTarget.dispatchEvent(new Event('resume'));
                }
            },

            start(timeslice?: number): void {
                if (promisedAudioNodesAndEncoderInstanceId !== null) {
                    throw createInvalidStateError();
                }

                if (mediaStream.getVideoTracks().length > 0) {
                    throw createNotSupportedError();
                }

                eventTarget.dispatchEvent(new Event('start'));

                const audioTracks = mediaStream.getAudioTracks();
                const channelCount = audioTracks.length === 0 ? 2 : (audioTracks[0].getSettings().channelCount ?? 2);

                promisedAudioNodesAndEncoderInstanceId = Promise.all([
                    resume(),
                    promisedAudioWorkletModule.then(() =>
                        createPromisedAudioNodesEncoderInstanceIdAndPort(audioBuffer, audioContext, channelCount, mediaStream, mimeType)
                    )
                ]).then(
                    async ([
                        ,
                        { audioBufferSourceNode, encoderInstanceId, mediaStreamAudioSourceNode, port, recorderAudioWorkletNode }
                    ]) => {
                        mediaStreamAudioSourceNode.connect(recorderAudioWorkletNode);

                        if (audioBufferSourceNode !== null) {
                            await new Promise((resolve) => {
                                audioBufferSourceNode.onended = resolve;
                                audioBufferSourceNode.connect(recorderAudioWorkletNode);
                                audioBufferSourceNode.start();
                            });

                            audioBufferSourceNode.disconnect(recorderAudioWorkletNode);
                        }

                        await recorderAudioWorkletNode.record(port);

                        if (timeslice !== undefined) {
                            promisedPartialRecording = requestNextPartialRecording(encoderInstanceId, timeslice);
                        }

                        return { encoderInstanceId, mediaStreamAudioSourceNode, recorderAudioWorkletNode };
                    }
                );

                const tracks = mediaStream.getTracks();

                abortRecording = () => {
                    stop();
                    eventTarget.dispatchEvent(new ErrorEvent('error', { error: createInvalidModificationError() }));
                };

                mediaStream.addEventListener('addtrack', abortRecording);
                mediaStream.addEventListener('removetrack', abortRecording);

                intervalId = setInterval(() => {
                    const currentTracks = mediaStream.getTracks();

                    if (
                        (currentTracks.length !== tracks.length || currentTracks.some((track, index) => track !== tracks[index])) &&
                        abortRecording !== null
                    ) {
                        abortRecording();
                    }
                }, 1000);
            },

            stop
        };
    };
};
