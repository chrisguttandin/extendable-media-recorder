import { IRecorderAudioWorkletNode } from 'recorder-audio-worklet';
import { IConstantSourceNode, IMediaStreamAudioSourceNode, IMinimalAudioContext } from 'standardized-audio-context';

export interface IAudioNodesAndEncoderId {
    constantSourceNode: IConstantSourceNode<IMinimalAudioContext>;

    encoderId: number;

    mediaStreamAudioSourceNode: IMediaStreamAudioSourceNode<IMinimalAudioContext>;

    recorderAudioWorkletNode: IRecorderAudioWorkletNode<IMinimalAudioContext>;
}
