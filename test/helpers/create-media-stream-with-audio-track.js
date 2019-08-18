export const createMediaStreamWithAudioTrack = (audioContext, frequency = 440) => {
    const mediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode(audioContext);
    const oscillatorNode = new OscillatorNode(audioContext, { frequency });

    oscillatorNode.connect(mediaStreamAudioDestinationNode);
    oscillatorNode.start();

    return mediaStreamAudioDestinationNode.stream;
};
