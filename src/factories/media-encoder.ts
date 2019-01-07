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
import { IMediaFormatRecorder } from '../interfaces';
import { TMediaEncoderFactory } from '../types';

// @todo This should live in a separate file.
const createPromisedAudioNodesEncoderIdAndPort = async (mediaStream: MediaStream, mimeType: string) => {
    const { encoderId, port } = await instantiate(mimeType);
    const audioContext = new MinimalAudioContext({ latencyHint: 'playback' });

    await addRecorderAudioWorkletModule((url: string) => {
        if (addAudioWorkletModule === undefined) {
            throw new Error('Missing AudioWorklet support. Maybe this is not runnin in a secure context.');
        }

        return addAudioWorkletModule(audioContext, url);
    });

    if (AudioWorkletNode === undefined) {
        throw new Error('Missing AudioWorklet support. Maybe this is not runnin in a secure context.');
    }

    const mediaStreamAudioSourceNode = new MediaStreamAudioSourceNode(audioContext, { mediaStream });
    const length = Math.ceil(audioContext.baseLatency * audioContext.sampleRate);
    const audioBuffer = new AudioBuffer({ length, sampleRate: audioContext.sampleRate });
    const audioBufferSourceNode = new AudioBufferSourceNode(audioContext, { buffer: audioBuffer });
    const recorderAudioWorkletNode = createRecorderAudioWorkletNode(AudioWorkletNode, audioContext);

    return { audioBufferSourceNode, audioContext, encoderId, length, port, mediaStreamAudioSourceNode, recorderAudioWorkletNode };
};

export const createMediaEncoder: TMediaEncoderFactory = (mediaStream, mimeType) => {
    const promisedAudioNodesEncoderIdAndPort = createPromisedAudioNodesEncoderIdAndPort(mediaStream, mimeType);

    return {

        start (): IMediaFormatRecorder {
            const promisedAudioNodesAndEncoderId = promisedAudioNodesEncoderIdAndPort
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

            return {

                async stop (): Promise<Blob> {
                    const { encoderId, mediaStreamAudioSourceNode, recorderAudioWorkletNode } = await promisedAudioNodesAndEncoderId;

                    await recorderAudioWorkletNode.stop();

                    mediaStreamAudioSourceNode.disconnect(recorderAudioWorkletNode);

                    const arrayBuffers = await encode(encoderId);

                    return new Blob(arrayBuffers, { type: mimeType });
                }

            };
        }

    };

};
