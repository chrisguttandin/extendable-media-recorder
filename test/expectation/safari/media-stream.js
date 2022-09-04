import { AudioContext } from 'standardized-audio-context';
import { createMediaStreamWithAudioTrack } from '../../helpers/create-media-stream-with-audio-track';

describe('MediaStream', () => {
    let audioContext;
    let mediaStream;

    afterEach(() => {
        audioContext.close();
        mediaStream.getTracks().forEach((track) => track.stop());
    });

    beforeEach(async () => {
        audioContext = new AudioContext();
        mediaStream = await createMediaStreamWithAudioTrack(audioContext);
    });

    // bug #15

    it('should not expose the channelCount as part of the settings', () => {
        expect(mediaStream.getAudioTracks()[0].getSettings().channelCount).to.be.undefined;
    });

    // bug #16

    it('should not expose the sampleRate as part of the settings', () => {
        expect(mediaStream.getAudioTracks()[0].getSettings().sampleRate).to.be.undefined;
    });
});
