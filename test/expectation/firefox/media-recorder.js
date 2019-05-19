import { createMediaStream } from '../../helpers/create-media-stream';

describe('module', () => {

    let audioContext;
    let mediaRecorder;
    let mediaStream;

    afterEach(() => audioContext.close());

    beforeEach(() => {
        audioContext = new AudioContext();
        mediaStream = createMediaStream(audioContext);
        mediaRecorder = new MediaRecorder(mediaStream);
    });

    // bug #1

    it('should fire an error event with an UnknownError when adding a track', function (done) {
        this.timeout(10000);

        mediaRecorder.addEventListener('error', (err) => {
            expect(err.type).to.equal('error');
            expect(err.error.name).to.equal('UnknownError');

            done();
        });
        mediaRecorder.start();
        mediaStream.addTrack(createMediaStream(audioContext).getAudioTracks()[0]);
    });

    // bug #2

    it('should fire an error event with an UnknownError when removing a track', function (done) {
        this.timeout(10000);

        mediaRecorder.addEventListener('error', (err) => {
            expect(err.type).to.equal('error');
            expect(err.error.name).to.equal('UnknownError');

            done();
        });
        mediaRecorder.start();

        setTimeout(() => {
            mediaStream.removeTrack(mediaStream.getAudioTracks()[0]);
        }, 1000);
    });

});
