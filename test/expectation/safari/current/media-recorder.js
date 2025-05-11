import { AudioContext } from 'standardized-audio-context';
import { createMediaStreamWithAudioTrack } from '../../../helpers/create-media-stream-with-audio-track';

describe('MediaRecorder', () => {
    describe('with a MediaStream which contains an audio track', () => {
        let audioContext;
        let mediaRecorder;
        let mediaStream;

        afterEach(() => {
            audioContext.close();
            mediaStream.getTracks().forEach((track) => track.stop());
        });

        beforeEach(async () => {
            audioContext = new AudioContext();
            mediaStream = await createMediaStreamWithAudioTrack(audioContext);
            mediaRecorder = new MediaRecorder(mediaStream);
        });

        // #26

        it('should emit chunks of at least about a second', function (done) {
            this.timeout(10000);

            const chunks = [];

            let maximumSize = Number.NEGATIVE_INFINITY;
            let minimumSize = Number.POSITIVE_INFINITY;

            mediaRecorder.addEventListener('dataavailable', ({ data }) => {
                chunks.push(data);

                const { size } = data;

                maximumSize = Math.max(maximumSize, size);
                minimumSize = Math.min(minimumSize, size);

                if (mediaRecorder.state === 'inactive') {
                    expect(chunks.length).to.equal(5);
                    expect(minimumSize / maximumSize).to.be.above(0.75);

                    done();
                }
            });
            mediaRecorder.start(100);

            setTimeout(() => mediaRecorder.stop(), 5000);
        });
    });

    describe('isTypeSupported()', () => {
        // #23

        it('should not support audio/mp4 with alac as codec', () => {
            expect(MediaRecorder.isTypeSupported('audio/mp4; codecs=alac')).to.be.false;
        });

        // #25

        it('should not support audio/mp4 with pcm as codec', () => {
            expect(MediaRecorder.isTypeSupported('audio/mp4; codecs=pcm')).to.be.false;
        });
    });
});
