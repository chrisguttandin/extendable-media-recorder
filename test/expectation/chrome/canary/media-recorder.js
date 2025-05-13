import { AudioContext } from 'standardized-audio-context';
import { createMediaStreamWithAudioTrack } from '../../../helpers/create-media-stream-with-audio-track';
import { recordAboutASecondOfAudio } from '../../../helpers/record-about-a-second-of-audio';

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
            mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/mp4' });
        });

        // bug #9

        it('should fire another dataavailable event after being inactive', async function () {
            this.timeout(10000);

            expect(
                (await Promise.all(Array.from({ length: 2000 }, () => recordAboutASecondOfAudio(audioContext)))).sort().pop()
            ).to.be.above(1);
        });

        // bug #26

        it('should emit chunks of at least about a second', function (done) {
            this.timeout(10000);

            const chunks = [];

            mediaRecorder.ondataavailable = ({ data }) => {
                chunks.push(data);

                if (mediaRecorder.state === 'inactive') {
                    mediaRecorder.ondataavailable = null;

                    if (chunks.length === 5) {
                        expect(chunks.map(({ size }) => size)).to.deep.equal([641, 34045, 16539, 16539, 12671]);
                    } else {
                        expect(chunks.map(({ size }) => size)).to.deep.equal([36, 605, 34045, 16539, 16539, 12671]);
                    }

                    done();
                }
            };
            mediaRecorder.start(100);

            setTimeout(() => mediaRecorder.stop(), 5000);
        });
    });

    describe('isTypeSupported()', () => {
        // bug #28

        it('should not support audio/aac', () => {
            expect(MediaRecorder.isTypeSupported('audio/aac')).to.be.false;
        });

        // bug #23

        it('should not support audio/mp4 with alac as codec', () => {
            expect(MediaRecorder.isTypeSupported('audio/mp4; codecs=alac')).to.be.false;
        });

        // bug #27

        it('should not support audio/ogg', () => {
            expect(MediaRecorder.isTypeSupported('audio/ogg')).to.be.false;
        });
    });
});
