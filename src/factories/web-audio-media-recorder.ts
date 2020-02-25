import { encode, instantiate } from 'media-encoder-host';
import { addRecorderAudioWorkletModule, createRecorderAudioWorkletNode } from 'recorder-audio-worklet';
import {
    AudioBuffer,
    AudioBufferSourceNode,
    AudioWorkletNode,
    IMinimalAudioContext,
    MediaStreamAudioSourceNode,
    MinimalAudioContext,
    addAudioWorkletModule
} from 'standardized-audio-context';
import { IAudioNodesAndEncoderId } from '../interfaces';
import { TRecordingState, TWebAudioMediaRecorderFactoryFactory } from '../types';

// @todo This should live in a separate file.
const createPromisedAudioNodesEncoderIdAndPort = async (audioContext: IMinimalAudioContext, mediaStream: MediaStream, mimeType: string) => {
    const { encoderId, port } = await instantiate(mimeType, audioContext.sampleRate);
    const message = 'Missing AudioWorklet support. Maybe this is not running in a secure context.';

    await addRecorderAudioWorkletModule((url: string) => {
        if (addAudioWorkletModule === undefined) {
            throw new Error(message);
        }

        return addAudioWorkletModule(audioContext, url);
    });

    if (AudioWorkletNode === undefined) {
        throw new Error(message);
    }

    const mediaStreamAudioSourceNode = new MediaStreamAudioSourceNode(audioContext, { mediaStream });
    const length = Math.max(512, Math.ceil(audioContext.baseLatency * audioContext.sampleRate));
    const audioBuffer = new AudioBuffer({ length, sampleRate: audioContext.sampleRate });
    const audioBufferSourceNode = new AudioBufferSourceNode(audioContext, { buffer: audioBuffer });
    const recorderAudioWorkletNode = createRecorderAudioWorkletNode(AudioWorkletNode, audioContext);

    return { audioBufferSourceNode, encoderId, length, port, mediaStreamAudioSourceNode, recorderAudioWorkletNode };
};

export const createWebAudioMediaRecorderFactory: TWebAudioMediaRecorderFactoryFactory = (
    createInvalidModificationError,
    createInvalidStateError,
    createNotSupportedError
) => {
    return (eventTarget, mediaStream, mimeType) => {
        const audioContext = new MinimalAudioContext({ latencyHint: 'playback' });
        const promisedAudioNodesEncoderIdAndPort = createPromisedAudioNodesEncoderIdAndPort(audioContext, mediaStream, mimeType);

        let abortRecording: null | (() => void) = null;
        let intervalId: null | number = null;
        let promisedAudioNodesAndEncoderId: null | Promise<IAudioNodesAndEncoderId> = null;
        let promisedPartialRecording: null | Promise<void> = null;

        const dispatchDataAvailableEvent = (arrayBuffers: ArrayBuffer[]): void => {
            eventTarget.dispatchEvent(new BlobEvent('dataavailable', { data: new Blob(arrayBuffers, { type: mimeType }) }));
        };

        const requestNextPartialRecording = async (encoderId: number, timeslice: number): Promise<void> => {
            dispatchDataAvailableEvent(await encode(encoderId, timeslice));

            if (promisedAudioNodesAndEncoderId !== null) {
                promisedPartialRecording = requestNextPartialRecording(encoderId, timeslice);
            }
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

            if (promisedPartialRecording !== null) {
                promisedPartialRecording.catch(() => { /* @todo Only catch the errors caused by a duplicate call to encode. */ });
            }

            promisedAudioNodesAndEncoderId
                .then(async ({ encoderId, mediaStreamAudioSourceNode, recorderAudioWorkletNode }) => {
                    await recorderAudioWorkletNode.stop();

                    mediaStreamAudioSourceNode.disconnect(recorderAudioWorkletNode);

                    dispatchDataAvailableEvent(await encode(encoderId, null));
                });

            promisedAudioNodesAndEncoderId = null;
        };

        return {

            get state (): TRecordingState {
                return (promisedAudioNodesAndEncoderId === null) ? 'inactive' : 'recording';
            },

            start (timeslice?: number): void {
                if (promisedAudioNodesAndEncoderId !== null) {
                    throw createInvalidStateError();
                }

                if (mediaStream.getVideoTracks().length > 0) {
                    throw createNotSupportedError();
                }

                promisedAudioNodesAndEncoderId = Promise
                    .all([
                        audioContext.resume(),
                        promisedAudioNodesEncoderIdAndPort
                    ])
                    .then(async ([ , {
                        audioBufferSourceNode,
                        encoderId,
                        length,
                        port,
                        mediaStreamAudioSourceNode,
                        recorderAudioWorkletNode
                    } ]) => {
                        mediaStreamAudioSourceNode.connect(recorderAudioWorkletNode);

                        await new Promise((resolve) => {
                            audioBufferSourceNode.onended = resolve;
                            audioBufferSourceNode.connect(recorderAudioWorkletNode);
                            audioBufferSourceNode.start(audioContext.currentTime + (length / audioContext.sampleRate));
                        });

                        audioBufferSourceNode.disconnect(recorderAudioWorkletNode);

                        await recorderAudioWorkletNode.record(port);

                        if (timeslice !== undefined) {
                            promisedPartialRecording = requestNextPartialRecording(encoderId, timeslice);
                        }

                        return { encoderId, mediaStreamAudioSourceNode, recorderAudioWorkletNode };
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

                    if ((currentTracks.length !== tracks.length || currentTracks.some((track, index) => (track !== tracks[index])))
                            && abortRecording !== null) {
                        abortRecording();
                    }
                }, 1000);
            },

            stop

        };

    };
};
