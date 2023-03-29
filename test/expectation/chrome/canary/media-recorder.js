import { AudioContext } from 'standardized-audio-context';
import { createMediaStreamWithAudioTrack } from '../../../helpers/create-media-stream-with-audio-track';
import { createMediaStreamWithVideoTrack } from '../../../helpers/create-media-stream-with-video-track';

describe('module', () => {
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

            const recordAboutASecondOfAudio = () =>
                new Promise(async (resolve) => {
                    const mediaStream = await createMediaStreamWithAudioTrack(audioContext);
                    const mediaRecorder = new MediaRecorder(mediaStream);

                    mediaRecorder.start(1);

                    setTimeout(() => {
                        let callsWhileBeingInactive = 0;

                        mediaRecorder.ondataavailable = () => {
                            if (mediaRecorder.state === 'inactive') {
                                callsWhileBeingInactive += 1;
                            }
                        };
                        mediaRecorder.stop();

                        setTimeout(() => {
                            resolve(callsWhileBeingInactive);

                            mediaStream.getTracks().forEach((track) => track.stop());
                        }, 1000);
                    }, Math.random() * 1000);
                });

            expect((await Promise.all(Array.from({ length: 200 }, recordAboutASecondOfAudio))).sort().pop()).to.be.above(1);
        });
    });

    describe('with a MediaStream which contains a video track', () => {
        let mediaStream;
        let mediaRecorder;

        afterEach(() => mediaStream.getTracks().forEach((track) => track.stop()));

        beforeEach(() => {
            mediaStream = createMediaStreamWithVideoTrack();
            mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm' });
        });

        // bug #6

        it('should emit a blob without any data', function (done) {
            this.timeout(10000);

            mediaRecorder.addEventListener('dataavailable', ({ data }) => {
                expect(data.size).to.equal(0);

                done();
            });
            mediaRecorder.start();

            setTimeout(() => mediaRecorder.stop(), 1000);
        });
    });
});
