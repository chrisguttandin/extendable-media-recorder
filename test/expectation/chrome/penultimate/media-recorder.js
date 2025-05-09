import { AudioContext } from 'standardized-audio-context';
import { recordAboutASecondOfAudio } from '../../../helpers/record-about-a-second-of-audio';

describe('MediaRecorder', () => {
    describe('with a MediaStream which contains an audio track', () => {
        let audioContext;

        afterEach(() => {
            audioContext.close();
        });

        beforeEach(() => {
            audioContext = new AudioContext();
        });

        // bug #9

        it('should fire another dataavailable event after being inactive', async function () {
            this.timeout(10000);

            expect(
                (await Promise.all(Array.from({ length: 2000 }, () => recordAboutASecondOfAudio(audioContext)))).sort().pop()
            ).to.be.above(1);
        });
    });

    describe('isTypeSupported()', () => {
        // #23

        it('should not support audio/mp4 with alac as codec', () => {
            expect(MediaRecorder.isTypeSupported('audio/mp4; codecs=alac')).to.be.false;
        });
    });
});
