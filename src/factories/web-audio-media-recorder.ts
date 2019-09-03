import { encode, instantiate } from 'media-encoder-host';
import { addRecorderAudioWorkletModule, createRecorderAudioWorkletNode } from 'recorder-audio-worklet';
import {
    AudioBuffer,
    AudioBufferSourceNode,
    AudioWorkletNode,
    MediaStreamAudioSourceNode,
    MinimalAudioContext,
    addAudioWorkletModule
} from 'standardized-audio-context';
import { IAudioNodesAndEncoderId } from '../interfaces';
import { TRecordingState, TWebAudioMediaRecorderFactoryFactory } from '../types';

// @todo This should live in a separate file.
const createPromisedAudioNodesEncoderIdAndPort = async (mediaStream: MediaStream, mimeType: string) => {
    const { encoderId, port } = await instantiate(mimeType);
    const audioContext = new MinimalAudioContext({ latencyHint: 'playback' });
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
    const length = Math.ceil(audioContext.baseLatency * audioContext.sampleRate);
    const audioBuffer = new AudioBuffer({ length, sampleRate: audioContext.sampleRate });
    const audioBufferSourceNode = new AudioBufferSourceNode(audioContext, { buffer: audioBuffer });
    const recorderAudioWorkletNode = createRecorderAudioWorkletNode(AudioWorkletNode, audioContext);

    return { audioBufferSourceNode, audioContext, encoderId, length, port, mediaStreamAudioSourceNode, recorderAudioWorkletNode };
};

export const createWebAudioMediaRecorderFactory: TWebAudioMediaRecorderFactoryFactory = (
    createInvalidModificationError,
    createInvalidStateError,
    createNotSupportedError
) => {
    return (mediaStream, mimeType) => {
        const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();
        const promisedAudioNodesEncoderIdAndPort = createPromisedAudioNodesEncoderIdAndPort(mediaStream, mimeType);

        let abortRecording: null | (() => void) = null;
        let intervalId: null | number = null;
        let promisedAudioNodesAndEncoderId: null | Promise<IAudioNodesAndEncoderId> = null;

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

            promisedAudioNodesAndEncoderId
                .then(async ({ encoderId, mediaStreamAudioSourceNode, recorderAudioWorkletNode }) => {
                    await recorderAudioWorkletNode.stop();

                    mediaStreamAudioSourceNode.disconnect(recorderAudioWorkletNode);

                    const arrayBuffers = await encode(encoderId);

                    dispatchEvent(new BlobEvent('dataavailable', { data: new Blob(arrayBuffers, { type: mimeType }) }));
                });

            promisedAudioNodesAndEncoderId = null;
        };

        return {

            get state (): TRecordingState {
                return (promisedAudioNodesAndEncoderId === null) ? 'inactive' : 'recording';
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

            start (): void {
                if (promisedAudioNodesAndEncoderId !== null) {
                    throw createInvalidStateError();
                }

                if (mediaStream.getVideoTracks().length > 0) {
                    throw createNotSupportedError();
                }

                promisedAudioNodesAndEncoderId = promisedAudioNodesEncoderIdAndPort
                    .then(async ({
                        audioBufferSourceNode,
                        audioContext,
                        encoderId,
                        length,
                        port,
                        mediaStreamAudioSourceNode,
                        recorderAudioWorkletNode
                    }) => {
                        mediaStreamAudioSourceNode.connect(recorderAudioWorkletNode);

                        await new Promise((resolve) => {
                            audioBufferSourceNode.onended = resolve;
                            audioBufferSourceNode.connect(recorderAudioWorkletNode);
                            audioBufferSourceNode.start(audioContext.currentTime + (length / audioContext.sampleRate));
                        });

                        audioBufferSourceNode.disconnect(recorderAudioWorkletNode);

                        await recorderAudioWorkletNode.record(port);

                        return { encoderId, mediaStreamAudioSourceNode, recorderAudioWorkletNode };
                    });

                const tracks = mediaStream.getTracks();

                abortRecording = () => {
                    stop();
                    dispatchEvent(new ErrorEvent('error', { error: createInvalidModificationError() }));
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
