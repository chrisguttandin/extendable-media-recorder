import { createMediaStreamAudioDestinationNode } from './create-media-stream-audio-destination-node';

export const createMediaStreamWithAudioTrack = async (audioContext, channelCount = 2, frequency = 440) => {
    const mediaStreamAudioDestinationNode = await createMediaStreamAudioDestinationNode(audioContext, channelCount, frequency);

    return mediaStreamAudioDestinationNode.stream;
};
