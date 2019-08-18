import { createMediaStream } from '../../helpers/create-media-stream';
import { createMediaStreamWithVideoTrack } from '../../helpers/create-media-stream-with-video-track';

describe('module', () => {

    describe('with a MediaStream which contains an audio track', () => {

        let audioContext;
        let mediaRecorder;
        let mediaStream;

        afterEach(() => audioContext.close());

        beforeEach(() => {
            audioContext = new AudioContext();
            mediaStream = createMediaStream(audioContext);
            mediaRecorder = new MediaRecorder(mediaStream);
        });

        // bug #3

        it('should fire an error event without an error when adding a track', function (done) {
            this.timeout(10000);

            mediaRecorder.addEventListener('error', (err) => {
                expect(err.error).to.be.undefined;
                expect(err.type).to.equal('error');

                done();
            });
            mediaRecorder.start();
            mediaStream.addTrack(createMediaStream(audioContext).getAudioTracks()[0]);
        });

        // bug #4

        it('should fire an error event without an error when removing a track', function (done) {
            this.timeout(10000);

            mediaRecorder.addEventListener('error', (err) => {
                expect(err.error).to.be.undefined;
                expect(err.type).to.equal('error');

                done();
            });
            mediaRecorder.start();
            mediaStream.removeTrack(mediaStream.getAudioTracks()[0]);
        });

    });

    describe('with a MediaStream which contains a video track', () => {

        let mediaStream;
        let mediaRecorder;

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
