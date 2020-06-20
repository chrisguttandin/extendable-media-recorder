import { IRecorderAudioWorkletNode } from 'recorder-audio-worklet';
import { IMediaStreamAudioSourceNode, IMinimalAudioContext } from 'standardized-audio-context';

export interface IAudioNodesAndEncoderId {
    encoderId: number;

    mediaStreamAudioSourceNode: IMediaStreamAudioSourceNode<IMinimalAudioContext>;

    recorderAudioWorkletNode: IRecorderAudioWorkletNode<IMinimalAudioContext>;
}
