import { MediaRecorder, isSupported, register } from '../../src/module';
import { connect } from 'extendable-media-recorder-wav-encoder';
import { createMediaStreamWithAudioTrack } from '../helpers/create-media-stream-with-audio-track';
import { createMediaStreamWithVideoTrack } from '../helpers/create-media-stream-with-video-track';
import { spy } from 'sinon';

describe('module', () => {

    if (!process.env.TARGET || !process.env.TARGET.endsWith('-unsupported')) { // eslint-disable-line no-undef

        describe('MediaRecorder', () => {

            before(async () => {
                const port = await connect();

                await register(port);
            });

            // @todo There is currently no way to disable the autoplay policy on BrowserStack or Sauce Labs.
            if (!(process.env.TRAVIS && /Chrome/.test(navigator.userAgent))) { // eslint-disable-line no-undef

                for (const [ channelCount, mimeType ] of [ [ 1, 'audio/wav' ], [ 2, 'audio/wav' ], [ 1, 'audio/webm' ], [ 2, 'audio/webm' ] ]) {

                    describe(`with a channelCount of ${ channelCount } and a mimeType of ${ mimeType }`, () => {

                        describe('with a MediaStream which contains an audio track', () => {

                            let audioContext;
                            let bufferLength;
                            let mediaRecorder;
                            let mediaStream;

                            afterEach(function () {
                                this.timeout(20000);

                                return audioContext.close();
                            });

                            beforeEach(async () => {
                                audioContext = new AudioContext();
                                bufferLength = 100;

                                mediaStream = await createMediaStreamWithAudioTrack(audioContext, channelCount, audioContext.sampleRate / bufferLength);
                                mediaRecorder = new MediaRecorder(mediaStream, { mimeType });
                            });

                            describe('ondataavailable', () => {

                                it('should be null', () => {
                                    expect(mediaRecorder.ondataavailable).to.be.null;
                                });

                                it('should be assignable to a function', () => {
                                    const fn = () => {}; // eslint-disable-line unicorn/consistent-function-scoping
                                    const ondataavailable = mediaRecorder.ondataavailable = fn; // eslint-disable-line no-multi-assign

                                    expect(ondataavailable).to.equal(fn);
                                    expect(mediaRecorder.ondataavailable).to.equal(fn);
                                });

                                it('should be assignable to null', () => {
                                    const ondataavailable = mediaRecorder.ondataavailable = null; // eslint-disable-line no-multi-assign

                                    expect(ondataavailable).to.be.null;
                                    expect(mediaRecorder.ondataavailable).to.be.null;
                                });

                                it('should not be assignable to something else', () => {
                                    const string = 'no function or null value';

                                    mediaRecorder.ondataavailable = () => {};

                                    const ondataavailable = mediaRecorder.ondataavailable = string; // eslint-disable-line no-multi-assign

                                    expect(ondataavailable).to.equal(string);
                                    expect(mediaRecorder.ondataavailable).to.be.null;
                                });

                                it('should register an independent event listener', (done) => {
                                    const ondataavailable = spy();

                                    mediaRecorder.ondataavailable = ondataavailable;
                                    mediaRecorder.addEventListener('dataavailable', ondataavailable);

                                    mediaRecorder.dispatchEvent(new Event('dataavailable'));

                                    // Bug #7 & 8: The dataavailable event is currently delayed.
                                    setTimeout(() => {
                                        expect(ondataavailable).to.have.been.calledTwice;

                                        done();
                                    });
                                });

                            });

                            describe('onerror', () => {

                                it('should be null', () => {
                                    expect(mediaRecorder.onerror).to.be.null;
                                });

                                it('should be assignable to a function', () => {
                                    const fn = () => {}; // eslint-disable-line unicorn/consistent-function-scoping
                                    const onerror = mediaRecorder.onerror = fn; // eslint-disable-line no-multi-assign

                                    expect(onerror).to.equal(fn);
                                    expect(mediaRecorder.onerror).to.equal(fn);
                                });

                                it('should be assignable to null', () => {
                                    const onerror = mediaRecorder.onerror = null; // eslint-disable-line no-multi-assign

                                    expect(onerror).to.be.null;
                                    expect(mediaRecorder.onerror).to.be.null;
                                });

                                it('should not be assignable to something else', () => {
                                    const string = 'no function or null value';

                                    mediaRecorder.onerror = () => {};

                                    const onerror = mediaRecorder.onerror = string; // eslint-disable-line no-multi-assign

                                    expect(onerror).to.equal(string);
                                    expect(mediaRecorder.onerror).to.be.null;
                                });

                                it('should register an independent event listener', () => {
                                    const onerror = spy();

                                    mediaRecorder.onerror = onerror;
                                    mediaRecorder.addEventListener('error', onerror);

                                    mediaRecorder.dispatchEvent(new Event('error'));

                                    expect(onerror).to.have.been.calledTwice;
                                });

                            });

                            describe('start()', () => {

                                beforeEach(function (done) {
                                    this.timeout(3000);

                                    // Wait two seconds before starting the recording.
                                    setTimeout(done, 2000);
                                });

                                it('should abort the encoding when adding a track', function (done) {
                                    this.timeout(10000);

                                    let err = null;

                                    mediaRecorder.addEventListener('dataavailable', function (event) {
                                        expect(event).to.be.an.instanceOf(BlobEvent);
                                        expect(event.currentTarget).to.equal(mediaRecorder);
                                        expect(event.target).to.equal(mediaRecorder);
                                        expect(event.type).to.equal('dataavailable');

                                        expect(this).to.equal(mediaRecorder);

                                        expect(err.code).to.equal(13);
                                        expect(err.name).to.equal('InvalidModificationError');

                                        done();
                                    });

                                    mediaRecorder.addEventListener('error', function (event) {
                                        expect(event).to.be.an.instanceOf(ErrorEvent);
                                        expect(event.currentTarget).to.equal(mediaRecorder);
                                        expect(event.target).to.equal(mediaRecorder);
                                        expect(event.type).to.equal('error');

                                        expect(this).to.equal(mediaRecorder);

                                        err = event.error;
                                    });

                                    mediaRecorder.start();

                                    setTimeout(() => {
                                        createMediaStreamWithAudioTrack(audioContext)
                                            .then((anotherMediaStream) => mediaStream.addTrack(anotherMediaStream.getAudioTracks()[0]));
                                    }, 1000);
                                });

                                it('should abort the encoding when removing a track', function (done) {
                                    this.timeout(10000);

                                    let err = null;

                                    mediaRecorder.addEventListener('dataavailable', function (event) {
                                        expect(event).to.be.an.instanceOf(BlobEvent);
                                        expect(event.currentTarget).to.equal(mediaRecorder);
                                        expect(event.target).to.equal(mediaRecorder);
                                        expect(event.type).to.equal('dataavailable');

                                        expect(this).to.equal(mediaRecorder);

                                        expect(err.code).to.equal(13);
                                        expect(err.name).to.equal('InvalidModificationError');

                                        done();
                                    });

                                    mediaRecorder.addEventListener('error', function (event) {
                                        expect(event).to.be.an.instanceOf(ErrorEvent);
                                        expect(event.currentTarget).to.equal(mediaRecorder);
                                        expect(event.target).to.equal(mediaRecorder);
                                        expect(event.type).to.equal('error');

                                        expect(this).to.equal(mediaRecorder);

                                        err = event.error;
                                    });

                                    mediaRecorder.start();

                                    setTimeout(() => {
                                        mediaStream.removeTrack(mediaStream.getAudioTracks()[0]);
                                    }, 1000);
                                });

                                it('should encode a mediaStream as a whole', function (done) {
                                    this.timeout(20000);

                                    mediaRecorder.addEventListener('dataavailable', async function (event) {
                                        expect(event).to.be.an.instanceOf(BlobEvent);
                                        expect(event.currentTarget).to.equal(mediaRecorder);
                                        expect(event.target).to.equal(mediaRecorder);
                                        expect(event.type).to.equal('dataavailable');

                                        expect(this).to.equal(mediaRecorder);

                                        // Test if the arrayBuffer is decodable.
                                        const audioBuffer = await audioContext.decodeAudioData(await event.data.arrayBuffer());

                                        // Test if the audioBuffer is at least half a second long.
                                        expect(audioBuffer.duration).to.be.above(0.5);

                                        // Only test if the audioBuffer contains the ouput of the oscillator when recording a lossless file.
                                        if (mimeType === 'audio/wav') {
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
                                        }

                                        done();
                                    });
                                    mediaRecorder.start();

                                    setTimeout(() => mediaRecorder.stop(), 1000);
                                });

                                it('should encode a mediaStream in chunks', function (done) {
                                    this.timeout(20000);

                                    const chunks = [ ];

                                    mediaRecorder.addEventListener('dataavailable', async function (event) {
                                        expect(event).to.be.an.instanceOf(BlobEvent);
                                        expect(event.currentTarget).to.equal(mediaRecorder);
                                        expect(event.target).to.equal(mediaRecorder);
                                        expect(event.type).to.equal('dataavailable');

                                        expect(this).to.equal(mediaRecorder);

                                        chunks.push(event.data);

                                        if (mediaRecorder.state === 'inactive') {
                                            expect(chunks.length).to.be.above(5);

                                            // Test if the arrayBuffer is decodable.
                                            const audioBuffer = await audioContext.decodeAudioData(await (new Blob(chunks, { mimeType })).arrayBuffer());

                                            // Test if the audioBuffer is at least half a second long.
                                            expect(audioBuffer.duration).to.be.above(0.5);

                                            // Only test if the audioBuffer contains the ouput of the oscillator when recording a lossless file.
                                            if (mimeType === 'audio/wav') {
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
                                            }

                                            done();
                                        }
                                    });
                                    mediaRecorder.start(100);

                                    setTimeout(() => mediaRecorder.stop(), 1000);
                                });

                            });

                        });

                        describe('with a MediaStream which contains a video track', () => {

                            let mediaRecorder;

                            beforeEach(() => {
                                const mediaStream = createMediaStreamWithVideoTrack();

                                mediaRecorder = new MediaRecorder(mediaStream, { mimeType });
                            });

                            describe('start()', () => {

                                it('should throw a NotSupportedError', (done) => {
                                    try {
                                        mediaRecorder.start();
                                    } catch (err) {
                                        expect(err.code).to.equal(9);
                                        expect(err.name).to.equal('NotSupportedError');

                                        done();
                                    }
                                });

                            });

                        });

                    });

                }

            }

            describe('with the mimeType of audio/anything', () => {

                let audioContext;
                let mediaStream;

                afterEach(() => audioContext.close());

                beforeEach(async () => {
                    audioContext = new AudioContext();

                    mediaStream = await createMediaStreamWithAudioTrack(audioContext);
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

    }

    describe('isSupported()', () => {

        if (process.env.TARGET && process.env.TARGET.endsWith('-unsupported')) { // eslint-disable-line no-undef

            it('should resolve to false', async () => {
                expect(await isSupported()).to.be.false;
            });

        } else {

            it('should resolve to true', async () => {
                expect(await isSupported()).to.be.true;
            });

        }

    });

});
