import { encode, instantiate } from 'media-encoder-host';
import { addRecorderAudioWorkletModule, createRecorderAudioWorkletNode } from 'recorder-audio-worklet';
import {
    AudioBuffer,
    AudioBufferSourceNode,
    AudioWorkletNode,
    ConstantSourceNode,
    IAudioBuffer,
    IMinimalAudioContext,
    MediaStreamAudioSourceNode,
    MinimalAudioContext,
    addAudioWorkletModule
} from 'standardized-audio-context';
import { IAudioNodesAndEncoderId } from '../interfaces';
import { TRecordingState, TWebAudioMediaRecorderFactoryFactory } from '../types';

const ERROR_MESSAGE = 'Missing AudioWorklet support. Maybe this is not running in a secure context.';

// @todo This should live in a separate file.
const createPromisedAudioNodesEncoderIdAndPort = async (
    audioBuffer: IAudioBuffer,
    audioContext: IMinimalAudioContext,
    channelCount: number,
    mediaStream: MediaStream,
    mimeType: string
) => {
    const { encoderId, port } = await instantiate(mimeType, audioContext.sampleRate);

    if (AudioWorkletNode === undefined) {
        throw new Error(ERROR_MESSAGE);
    }

    const audioBufferSourceNode = new AudioBufferSourceNode(audioContext, { buffer: audioBuffer });
    const mediaStreamAudioSourceNode = new MediaStreamAudioSourceNode(audioContext, { mediaStream });
    const recorderAudioWorkletNode = createRecorderAudioWorkletNode(AudioWorkletNode, audioContext, { channelCount });

    return { audioBufferSourceNode, encoderId, mediaStreamAudioSourceNode, port, recorderAudioWorkletNode };
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
        const length = Math.max(1024, Math.ceil(audioContext.baseLatency * audioContext.sampleRate));
        const audioBuffer = new AudioBuffer({ length, sampleRate: audioContext.sampleRate });
        const bufferedArrayBuffers: ArrayBuffer[] = [];
        const promisedAudioWorkletModule = addRecorderAudioWorkletModule((url: string) => {
            if (addAudioWorkletModule === undefined) {
                throw new Error(ERROR_MESSAGE);
            }

            return addAudioWorkletModule(audioContext, url);
        });

        let abortRecording: null | (() => void) = null;
        let intervalId: null | number = null;
        let promisedAudioNodesAndEncoderId: null | Promise<IAudioNodesAndEncoderId> = null;
        let promisedPartialRecording: null | Promise<void> = null;
        let isAudioContextRunning = true;

        const dispatchDataAvailableEvent = (arrayBuffers: ArrayBuffer[]): void => {
            eventTarget.dispatchEvent(createBlobEvent('dataavailable', { data: new Blob(arrayBuffers, { type: mimeType }) }));
        };

        const requestNextPartialRecording = async (encoderId: number, timeslice: number): Promise<void> => {
            const arrayBuffers = await encode(encoderId, timeslice);

            if (promisedAudioNodesAndEncoderId === null) {
                bufferedArrayBuffers.push(...arrayBuffers);
            } else {
                dispatchDataAvailableEvent(arrayBuffers);

                promisedPartialRecording = requestNextPartialRecording(encoderId, timeslice);
            }
        };

        const resume = (): Promise<void> => {
            isAudioContextRunning = true;

            return audioContext.resume();
        };

        const stop = (): void => {
            if (promisedAudioNodesAndEncoderId === null) {
                return;
            }

            if (abortRecording !== null) {
                mediaStream.removeEventListener('addtrack', abortRecording);
                mediaStream.removeEventListener('removetrack', abortRecording);
            }

            if (intervalId !== null) {
                clearTimeout(intervalId);
            }

            promisedAudioNodesAndEncoderId.then(
                async ({ constantSourceNode, encoderId, mediaStreamAudioSourceNode, recorderAudioWorkletNode }) => {
                    if (promisedPartialRecording !== null) {
                        promisedPartialRecording.catch(() => {
                            /* @todo Only catch the errors caused by a duplicate call to encode. */
                        });
                        promisedPartialRecording = null;
                    }

                    await recorderAudioWorkletNode.stop();

                    mediaStreamAudioSourceNode.disconnect(recorderAudioWorkletNode);
                    constantSourceNode.stop();

                    const arrayBuffers = await encode(encoderId, null);

                    if (promisedAudioNodesAndEncoderId === null) {
                        await suspend();
                    }

                    dispatchDataAvailableEvent([...bufferedArrayBuffers, ...arrayBuffers]);

                    bufferedArrayBuffers.length = 0;

                    eventTarget.dispatchEvent(new Event('stop'));
                }
            );

            promisedAudioNodesAndEncoderId = null;
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
                return promisedAudioNodesAndEncoderId === null ? 'inactive' : isAudioContextRunning ? 'recording' : 'paused';
            },

            pause(): void {
                if (promisedAudioNodesAndEncoderId === null) {
                    throw createInvalidStateError();
                }

                if (isAudioContextRunning) {
                    suspend();
                    eventTarget.dispatchEvent(new Event('pause'));
                }
            },

            resume(): void {
                if (promisedAudioNodesAndEncoderId === null) {
                    throw createInvalidStateError();
                }

                if (!isAudioContextRunning) {
                    resume();
                    eventTarget.dispatchEvent(new Event('resume'));
                }
            },

            start(timeslice?: number): void {
                if (promisedAudioNodesAndEncoderId !== null) {
                    throw createInvalidStateError();
                }

                if (mediaStream.getVideoTracks().length > 0) {
                    throw createNotSupportedError();
                }

                eventTarget.dispatchEvent(new Event('start'));

                const audioTracks = mediaStream.getAudioTracks();
                // @todo TypeScript v4.4.2 removed the channelCount property from the MediaTrackSettings interface.
                const channelCount =
                    audioTracks.length === 0
                        ? 2
                        : (<MediaTrackSettings & { channelCount?: number }>audioTracks[0].getSettings()).channelCount ?? 2;

                promisedAudioNodesAndEncoderId = Promise.all([
                    resume(),
                    promisedAudioWorkletModule.then(() =>
                        createPromisedAudioNodesEncoderIdAndPort(audioBuffer, audioContext, channelCount, mediaStream, mimeType)
                    )
                ]).then(async ([, { audioBufferSourceNode, encoderId, mediaStreamAudioSourceNode, port, recorderAudioWorkletNode }]) => {
                    mediaStreamAudioSourceNode.connect(recorderAudioWorkletNode);

                    await new Promise((resolve) => {
                        audioBufferSourceNode.onended = resolve;
                        audioBufferSourceNode.connect(recorderAudioWorkletNode);
                        audioBufferSourceNode.start(audioContext.currentTime + length / audioContext.sampleRate);
                    });

                    audioBufferSourceNode.disconnect(recorderAudioWorkletNode);

                    // Bug #17: Safari does throttle the processing on hidden tabs if there is no active audio output.
                    const constantSourceNode = new ConstantSourceNode(audioContext, { offset: 0 });

                    constantSourceNode.onended = () => constantSourceNode.disconnect();
                    constantSourceNode.connect(audioContext.destination);
                    constantSourceNode.start();

                    await recorderAudioWorkletNode.record(port);

                    if (timeslice !== undefined) {
                        promisedPartialRecording = requestNextPartialRecording(encoderId, timeslice);
                    }

                    return { constantSourceNode, encoderId, mediaStreamAudioSourceNode, recorderAudioWorkletNode };
                });

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
