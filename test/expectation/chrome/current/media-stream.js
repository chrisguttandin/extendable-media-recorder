import { AudioContext, MediaStreamAudioDestinationNode, OscillatorNode } from 'standardized-audio-context';

describe('MediaStream', () => {
    let audioContext;
    let mediaStreamAudioDestinationNode;
    let oscillatorNode;

    afterEach(() => {
        oscillatorNode.disconnect(mediaStreamAudioDestinationNode);
        oscillatorNode.stop();
        audioContext.close();
        mediaStreamAudioDestinationNode.stream.getTracks().forEach((track) => track.stop());
    });

    beforeEach(() => {
        audioContext = new AudioContext();
        mediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode(audioContext, { channelCount: 1 });
        oscillatorNode = new OscillatorNode(audioContext);

        oscillatorNode.connect(mediaStreamAudioDestinationNode);
        oscillatorNode.start();
    });

    // bug #19

    it('should not expose the correct channelCount right away', () => {
        expect(mediaStreamAudioDestinationNode.stream.getAudioTracks()[0].getSettings().channelCount).to.equal(2);

        return new Promise((resolve) => {
            const interval = setInterval(() => {
                try {
                    expect(mediaStreamAudioDestinationNode.stream.getAudioTracks()[0].getSettings().channelCount).to.equal(1);

                    clearInterval(interval);
                    resolve();
                } catch {}
            });
        });
    });
});
