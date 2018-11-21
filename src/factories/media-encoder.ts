import { encode, instantiate } from 'media-encoder-host';
import { addRecorderAudioWorkletModule, createRecorderAudioWorkletNode } from 'recorder-audio-worklet';
import { AudioWorkletNode, MediaStreamAudioSourceNode, MinimalAudioContext, addAudioWorkletModule } from 'standardized-audio-context';
import { IMediaFormatRecorder } from '../interfaces';
import { TMediaEncoderFactory } from '../types';

// @todo This should live in a separate file.
const createPromisedAudioContextAndEncoder = async (mimeType: string) => {
    const { encoderId, port } = await instantiate(mimeType);
    const audioContext = new MinimalAudioContext();

    await addRecorderAudioWorkletModule((url: string) => {
        if (addAudioWorkletModule === undefined) {
            throw new Error('Missing AudioWorklet support. Maybe this is not runnin in a secure context.');
        }

        return addAudioWorkletModule(audioContext, url);
    });

    return { audioContext, encoderId, port };
};

export const createMediaEncoder: TMediaEncoderFactory = (mimeType) => {
    const promisedAudioContextAndEncoder = createPromisedAudioContextAndEncoder(mimeType);

    return {

        start (mediaStream: MediaStream): IMediaFormatRecorder {
            const promisedRecorderAudioWorkletNode = promisedAudioContextAndEncoder
                .then(async ({ audioContext, encoderId, port }) => {
                    const mediaStreamAudioSourceNode = new MediaStreamAudioSourceNode(audioContext, { mediaStream });

                    if (AudioWorkletNode === undefined) {
                        throw new Error('Missing AudioWorklet support. Maybe this is not runnin in a secure context.');
                    }

                    const recorderAudioWorkletNode = createRecorderAudioWorkletNode(AudioWorkletNode, audioContext);

                    mediaStreamAudioSourceNode
                        .connect(recorderAudioWorkletNode);

                    await recorderAudioWorkletNode.record(port);

                    return { encoderId, recorderAudioWorkletNode };
                });

            return {

                async stop (): Promise<ArrayBuffer[]> {
                    const { encoderId, recorderAudioWorkletNode } = await promisedRecorderAudioWorkletNode;

                    await recorderAudioWorkletNode.stop();

                    return encode(encoderId);
                }

            };
        }

    };

};
