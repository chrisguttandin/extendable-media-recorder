import { createMediaStreamWithAudioTrack } from '../../../helpers/create-media-stream-with-audio-track';

describe('module', () => {
    describe('with a MediaStream which contains an audio track', () => {
        let audioContext;
        let mediaRecorder;
        let mediaStream;

        afterEach(() => audioContext.close());

        beforeEach(async () => {
            audioContext = new AudioContext();
            mediaStream = await createMediaStreamWithAudioTrack(audioContext);
            mediaRecorder = new MediaRecorder(mediaStream);
        });

        // bug #1

        it('should fire an error event with an UnknownError when adding a track', function (done) {
            this.timeout(10000);

            mediaRecorder.addEventListener('error', (event) => {
                expect(event.type).to.equal('error');
                expect(event.error.name).to.equal('UnknownError');

                done();
            });
            mediaRecorder.start();

            createMediaStreamWithAudioTrack(audioContext).then((anotherMediaStream) =>
                mediaStream.addTrack(anotherMediaStream.getAudioTracks()[0])
            );
        });

        // bug #2

        it('should fire an error event with an UnknownError when removing a track', function (done) {
            this.timeout(10000);

            mediaRecorder.addEventListener('error', (event) => {
                expect(event.type).to.equal('error');
                expect(event.error.name).to.equal('UnknownError');

                done();
            });
            mediaRecorder.start();

            setTimeout(() => {
                mediaStream.removeTrack(mediaStream.getAudioTracks()[0]);
            }, 1000);
        });
    });
});
