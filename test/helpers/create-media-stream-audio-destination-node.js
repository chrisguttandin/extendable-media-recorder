import { ConstantSourceNode, GainNode, MediaStreamAudioDestinationNode, OscillatorNode } from 'standardized-audio-context';

export const createMediaStreamAudioDestinationNode = (audioContext, channelCount = 2, frequency = 441) => {
    const constantSourceNode = new ConstantSourceNode(audioContext, { offset: 2 });
    const gainNode = new GainNode(audioContext, { gain: 0.25 });
    const mediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode(audioContext, { channelCount });
    const oscillatorNode = new OscillatorNode(audioContext, { frequency, type: 'sawtooth' });

    oscillatorNode.connect(gainNode).connect(mediaStreamAudioDestinationNode);
    oscillatorNode.start();
    constantSourceNode.connect(gainNode);
    constantSourceNode.start();

    const stream = mediaStreamAudioDestinationNode.stream;

    // Bug #19: Chrome does not expose the correct channelCount property right away.
    return new Promise((resolve) => {
        const intervalId = setInterval(() => {
            const channelCountOfStream = stream.getAudioTracks()[0].getSettings().channelCount;

            // Bug #15: Firefox and Safari do not expose the channelCount yet.
            if (channelCountOfStream === undefined || channelCountOfStream === channelCount) {
                clearInterval(intervalId);
                resolve(mediaStreamAudioDestinationNode);
            }
        });
    });
};
