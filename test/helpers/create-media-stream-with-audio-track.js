import { MediaStreamAudioDestinationNode, OscillatorNode } from 'standardized-audio-context';

export const createMediaStreamWithAudioTrack = (audioContext, channelCount = 2, frequency = 440) => {
    const mediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode(audioContext, { channelCount });
    const oscillatorNode = new OscillatorNode(audioContext, { frequency });

    oscillatorNode.connect(mediaStreamAudioDestinationNode);
    oscillatorNode.start();

    const stream = mediaStreamAudioDestinationNode.stream;

    return new Promise((resolve) => {
        const intervalId = setInterval(() => {
            const channelCountOfStream = stream.getAudioTracks()[0].getSettings().channelCount;

            // Bug #15: Firefox and Safari do not expose the channelCount yet.
            if (channelCountOfStream === undefined || channelCountOfStream === channelCount) {
                clearInterval(intervalId);
                resolve(stream);
            }
        });
    });
};
