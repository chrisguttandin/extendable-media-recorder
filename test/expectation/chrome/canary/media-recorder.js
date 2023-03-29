import { AudioContext } from 'standardized-audio-context';
import { createMediaStreamWithAudioTrack } from '../../../helpers/create-media-stream-with-audio-track';
import { createMediaStreamWithVideoTrack } from '../../../helpers/create-media-stream-with-video-track';
import { spy } from 'sinon';

describe('module', () => {
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

        // bug #7

        it('should fire an error event after the dataavailable and stop events when adding a track', function (done) {
            this.timeout(10000);

            const ondataavailable = spy();
            const onstop = spy();

            mediaRecorder.addEventListener('dataavailable', ondataavailable);
            mediaRecorder.addEventListener('error', () => {
                expect(ondataavailable).to.have.been.calledOnce;
                expect(onstop).to.have.been.calledOnce;

                done();
            });
            mediaRecorder.addEventListener('stop', onstop);
            mediaRecorder.start();

            createMediaStreamWithAudioTrack(audioContext).then((anotherMediaStream) =>
                mediaStream.addTrack(anotherMediaStream.getAudioTracks()[0])
            );
        });

        // bug #8

        it('should fire an error event after the dataavailable and stop events when removing a track', function (done) {
            this.timeout(10000);

            const ondataavailable = spy();
            const onstop = spy();

            mediaRecorder.addEventListener('dataavailable', ondataavailable);
            mediaRecorder.addEventListener('error', () => {
                expect(ondataavailable).to.have.been.calledOnce;
                expect(onstop).to.have.been.calledOnce;

                done();
            });
            mediaRecorder.addEventListener('stop', onstop);
            mediaRecorder.start();
            mediaStream.removeTrack(mediaStream.getAudioTracks()[0]);
        });

        // bug #9
        it('should fire another dataavailable event after being inactive', async function () {
            this.timeout(10000);

            const recordAboutASecondOfAudio = () =>
                new Promise(async (resolve) => {
                    mediaStream = await createMediaStreamWithAudioTrack(audioContext);

                    const recorder = new MediaRecorder(mediaStream);

                    recorder.start(1);

                    setTimeout(() => {
                        let callsWhileBeingInactive = 0;

                        recorder.ondataavailable = () => {
                            if (recorder.state === 'inactive') {
                                callsWhileBeingInactive += 1;
                            }
                        };
                        recorder.stop();

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
