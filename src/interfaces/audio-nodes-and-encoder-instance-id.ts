import { IRecorderAudioWorkletNode } from 'recorder-audio-worklet';
import { IMediaStreamAudioSourceNode, IMinimalAudioContext } from 'standardized-audio-context';

export interface IAudioNodesAndEncoderInstanceId {
    encoderInstanceId: number;

    mediaStreamAudioSourceNode: IMediaStreamAudioSourceNode<IMinimalAudioContext>;

    recorderAudioWorkletNode: IRecorderAudioWorkletNode<IMinimalAudioContext>;
}
