import { MediaRecorder, register } from '../../src/module';
import { connect } from 'extendable-media-recorder-wav-encoder';
import { createMediaStream } from '../helpers/create-media-stream';

describe('module', () => {

    before(async () => {
        const port = await connect();

        await register(port);
    });

    for (const mimeType of [ 'audio/wav', 'audio/webm' ]) {

        describe(`with the mimeType of ${ mimeType }`, () => {

            let audioContext;
            let bufferLength;
            let mediaRecorder;
            let mediaStream;

            afterEach(() => audioContext.close());

            beforeEach(function (done) {
                this.timeout(3000);

                audioContext = new AudioContext();
                bufferLength = 100;

                mediaStream = createMediaStream(audioContext, audioContext.sampleRate / bufferLength);
                mediaRecorder = new MediaRecorder(mediaStream, { mimeType });

                // Wait two seconds before starting the recording.
                setTimeout(done, 2000);
            });

            it('should abort the encoding when adding a track', function (done) {
                this.timeout(10000);

                let err = null;

                mediaRecorder.addEventListener('dataavailable', () => {
                    expect(err.code).to.equal(13);
                    expect(err.name).to.equal('InvalidModificationError');

                    done();
                });

                mediaRecorder.addEventListener('error', ({ error }) => {
                    err = error;
                });

                mediaRecorder.start();

                setTimeout(() => {
                    mediaStream.addTrack(createMediaStream(audioContext).getAudioTracks()[0]);
                }, 1000);
            });

            it('should abort the encoding when removing a track', function (done) {
                this.timeout(10000);

                let err = null;

                mediaRecorder.addEventListener('dataavailable', () => {
                    expect(err.code).to.equal(13);
                    expect(err.name).to.equal('InvalidModificationError');

                    done();
                });

                mediaRecorder.addEventListener('error', ({ error }) => {
                    err = error;
                });

                mediaRecorder.start();

                setTimeout(() => {
                    mediaStream.removeTrack(mediaStream.getAudioTracks()[0]);
                }, 1000);
            });

            if (mimeType === 'audio/wav') {

                it('should encode a mediaStream', function (done) {
                    this.timeout(20000);

                    mediaRecorder.addEventListener('dataavailable', async ({ data }) => {
                        // Test if the arrayBuffer is decodable.
                        const arrayBuffer = await new Promise((resolve) => {
                            const fileReader = new FileReader();

                            fileReader.onload = () => resolve(fileReader.result);
                            fileReader.readAsArrayBuffer(data);
                        });
                        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                        // Test if the audioBuffer is at least half a second long.
                        expect(audioBuffer.duration).to.above(0.5);

                        // Test if the audioBuffer contains the ouput of the oscillator.
                        const rotatingBuffers = [ new Float32Array(bufferLength), new Float32Array(bufferLength) ];

                        for (let i = 0; i < audioBuffer.numberOfChannels; i += 1) {
                            audioBuffer.copyFromChannel(rotatingBuffers[0], i);

                            for (let startInChannel = bufferLength; startInChannel < audioBuffer.length - bufferLength; startInChannel += bufferLength) {
                                audioBuffer.copyFromChannel(rotatingBuffers[1], i, startInChannel);

                                for (let j = 0; j < bufferLength; j += 1) {
                                    try {
                                        expect(rotatingBuffers[0][j]).to.not.equal(0);
                                        expect(rotatingBuffers[0][j]).to.be.closeTo(rotatingBuffers[1][j], 0.0001);
                                    } catch (err) {
                                        done(err);

                                        return;
                                    }
                                }

                                rotatingBuffers.push(rotatingBuffers.shift());
                            }
                        }

                        done();
                    });
                    mediaRecorder.start();

                    setTimeout(() => mediaRecorder.stop(), 1000);
                });

            }

        });

    }

    describe('with the mimeType of audio/anything', () => {

        let audioContext;
        let mediaStream;

        afterEach(() => audioContext.close());

        beforeEach(() => {
            audioContext = new AudioContext();

            mediaStream = createMediaStream(audioContext);
        });

        it('should throw a NotSupportedError', (done) => {
            try {
                new MediaRecorder(mediaStream, { mimeType: 'audio/anything' });
            } catch (err) {
                expect(err.code).to.equal(9);
                expect(err.name).to.equal('NotSupportedError');

                done();
            }
        });

    });

});
