import { createMediaStreamWithVideoTrack } from '../../../helpers/create-media-stream-with-video-track';

describe('module', () => {

    describe('with a MediaStream which contains a video track', () => {

        let mediaStream;
        let mediaRecorder;

        beforeEach(() => {
            mediaStream = createMediaStreamWithVideoTrack();

            mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm' });
        });

        // bug #5

        it('should emit a blob of type video/webm', function (done) {
            this.timeout(10000);

            mediaRecorder.addEventListener('dataavailable', ({ data }) => {
                expect(data.type).to.equal('video/webm');

                done();
            });
            mediaRecorder.start();

            setTimeout(() => mediaRecorder.stop(), 1000);
        });

    });

});
