import { createMediaStreamWithVideoTrack } from '../../../helpers/create-media-stream-with-video-track';

describe('MediaRecorder', () => {
    describe('with a MediaStream which contains a video track', () => {
        let mediaStream;
        let mediaRecorder;

        afterEach(() => mediaStream.getTracks().forEach((track) => track.stop()));

        beforeEach(() => {
            mediaStream = createMediaStreamWithVideoTrack();
            mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/mp4' });
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

    describe('isTypeSupported()', () => {
        // #23

        it('should not support audio/mp4 with alac as codec', () => {
            expect(MediaRecorder.isTypeSupported('audio/mp4; codecs=alac')).to.be.false;
        });

        // #25

        it('should not support audio/mp4 with pcm as codec', () => {
            expect(MediaRecorder.isTypeSupported('audio/mp4; codecs=pcm')).to.be.false;
        });

        // #27

        it('should not support audio/ogg', () => {
            expect(MediaRecorder.isTypeSupported('audio/ogg')).to.be.false;
        });
    });
});
