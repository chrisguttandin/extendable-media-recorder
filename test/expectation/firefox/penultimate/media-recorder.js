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

        // bug #12

        it('should fire an error event which is not an instance of ErrorEvent when adding a track', function (done) {
            this.timeout(10000);

            mediaRecorder.addEventListener('error', (event) => {
                expect(event instanceof ErrorEvent).to.be.false;

                done();
            });
            mediaRecorder.start();

            createMediaStreamWithAudioTrack(audioContext).then((anotherMediaStream) =>
                mediaStream.addTrack(anotherMediaStream.getAudioTracks()[0])
            );
        });

        // bug #13

        it('should fire an error event which is not an instance of ErrorEvent when removing a track', function (done) {
            this.timeout(10000);

            mediaRecorder.addEventListener('error', (event) => {
                expect(event instanceof ErrorEvent).to.be.false;

                done();
            });
            mediaRecorder.start();

            setTimeout(() => {
                mediaStream.removeTrack(mediaStream.getAudioTracks()[0]);
            }, 1000);
        });

        // bug #20

        it('should fire multiple dataavailable events when inactive', function (done) {
            this.timeout(10000);

            let firedDataAvailableWhenInactive = false;

            mediaRecorder.ondataavailable = () => {
                if (mediaRecorder.state === 'inactive') {
                    if (firedDataAvailableWhenInactive) {
                        mediaRecorder.ondataavailable = null;

                        done();
                    } else {
                        firedDataAvailableWhenInactive = true;
                    }
                }
            };
            mediaRecorder.start(100);

            setTimeout(() => mediaRecorder.stop(), 1000);
        });
    });
});
