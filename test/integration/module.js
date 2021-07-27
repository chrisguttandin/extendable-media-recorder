import { MediaRecorder, isSupported, register } from '../../src/module';
import { AudioContext } from 'standardized-audio-context';
import { connect } from 'extendable-media-recorder-wav-encoder';
import { createMediaStreamWithAudioTrack } from '../helpers/create-media-stream-with-audio-track';
import { createMediaStreamWithVideoTrack } from '../helpers/create-media-stream-with-video-track';
import { spy } from 'sinon';

describe('module', () => {
    // eslint-disable-next-line no-undef
    if (!process.env.TARGET || !process.env.TARGET.endsWith('-unsupported')) {
        describe('MediaRecorder', () => {
            before(async () => {
                const port = await connect();

                await register(port);
            });

            const mimeTypes = [
                // Bug #11 Safari does not yet support the MediaRecorder which means it can't be used to record webm encoded files.
                ...(!/Chrome/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) ? [] : ['audio/webm']),
                'audio/wav'
            ];
            // eslint-disable-next-line no-undef
            const channelCounts = process.env.CI && /Chrome/.test(navigator.userAgent) ? [2] : [1, 2];

            for (const [channelCount, mimeType] of channelCounts.flatMap((c) => mimeTypes.map((m) => [c, m]))) {
                describe(`with a channelCount of ${channelCount} and a mimeType of ${mimeType}`, () => {
                    describe('with a MediaStream which contains an audio track', () => {
                        let audioContext;
                        let bufferLength;
                        let mediaRecorder;
                        let mediaStream;

                        afterEach(function () {
                            this.timeout(40000);

                            return audioContext.close();
                        });

                        beforeEach(async () => {
                            audioContext = new AudioContext();
                            bufferLength = 100;

                            mediaStream = await createMediaStreamWithAudioTrack(
                                audioContext,
                                channelCount,
                                audioContext.sampleRate / bufferLength
                            );

                            const [firstAudioTrack] = mediaStream.getAudioTracks();

                            // Bug #15: Firefox and Safari do not expose the channelCount yet.
                            if (firstAudioTrack.getSettings().channelCount === undefined) {
                                firstAudioTrack.getSettings = ((getSettings) => () => ({
                                    channelCount,
                                    ...getSettings.call(firstAudioTrack)
                                }))(firstAudioTrack.getSettings);
                            }

                            mediaRecorder = new MediaRecorder(mediaStream, { mimeType });
                        });

                        describe('mimeType', () => {
                            it('should expose the given mimeType', () => {
                                expect(mediaRecorder.mimeType).to.equal(mimeType);
                            });
                        });

                        describe('ondataavailable', () => {
                            it('should be null', () => {
                                expect(mediaRecorder.ondataavailable).to.be.null;
                            });

                            it('should be assignable to a function', () => {
                                const fn = () => {}; // eslint-disable-line unicorn/consistent-function-scoping
                                const ondataavailable = (mediaRecorder.ondataavailable = fn); // eslint-disable-line no-multi-assign

                                expect(ondataavailable).to.equal(fn);
                                expect(mediaRecorder.ondataavailable).to.equal(fn);
                            });

                            it('should be assignable to null', () => {
                                const ondataavailable = (mediaRecorder.ondataavailable = null); // eslint-disable-line no-multi-assign

                                expect(ondataavailable).to.be.null;
                                expect(mediaRecorder.ondataavailable).to.be.null;
                            });

                            it('should not be assignable to something else', () => {
                                const string = 'no function or null value';

                                mediaRecorder.ondataavailable = () => {};

                                const ondataavailable = (mediaRecorder.ondataavailable = string); // eslint-disable-line no-multi-assign

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
                                const onerror = (mediaRecorder.onerror = fn); // eslint-disable-line no-multi-assign

                                expect(onerror).to.equal(fn);
                                expect(mediaRecorder.onerror).to.equal(fn);
                            });

                            it('should be assignable to null', () => {
                                const onerror = (mediaRecorder.onerror = null); // eslint-disable-line no-multi-assign

                                expect(onerror).to.be.null;
                                expect(mediaRecorder.onerror).to.be.null;
                            });

                            it('should not be assignable to something else', () => {
                                const string = 'no function or null value';

                                mediaRecorder.onerror = () => {};

                                const onerror = (mediaRecorder.onerror = string); // eslint-disable-line no-multi-assign

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

                        describe('onstop', () => {
                            it('should be null', () => {
                                expect(mediaRecorder.onstop).to.be.null;
                            });

                            it('should be assignable to a function', () => {
                                const fn = () => {}; // eslint-disable-line unicorn/consistent-function-scoping
                                const onstop = (mediaRecorder.onstop = fn); // eslint-disable-line no-multi-assign

                                expect(onstop).to.equal(fn);
                                expect(mediaRecorder.onstop).to.equal(fn);
                            });

                            it('should be assignable to null', () => {
                                const onstop = (mediaRecorder.onstop = null); // eslint-disable-line no-multi-assign

                                expect(onstop).to.be.null;
                                expect(mediaRecorder.onstop).to.be.null;
                            });

                            it('should not be assignable to something else', () => {
                                const string = 'no function or null value';

                                mediaRecorder.onstop = () => {};

                                const onstop = (mediaRecorder.onstop = string); // eslint-disable-line no-multi-assign

                                expect(onstop).to.equal(string);
                                expect(mediaRecorder.onstop).to.be.null;
                            });

                            it('should register an independent event listener', (done) => {
                                const onstop = spy();

                                mediaRecorder.onstop = onstop;
                                mediaRecorder.addEventListener('stop', onstop);

                                mediaRecorder.dispatchEvent(new Event('stop'));

                                // Bug #7 & 8: The stop event is currently delayed.
                                setTimeout(() => {
                                    expect(onstop).to.have.been.calledTwice;

                                    done();
                                });
                            });
                        });

                        // @todo There is currently no way to disable the autoplay policy on BrowserStack or Sauce Labs.
                        // eslint-disable-next-line no-undef
                        if (!process.env.CI) {
                            describe('start()', () => {
                                for (const wasStartedBefore of [true, false]) {
                                    describe(`with a MediaRecorder that was${wasStartedBefore ? ' ' : ' not '}started before`, () => {
                                        if (wasStartedBefore) {
                                            beforeEach((done) => {
                                                mediaRecorder.onstop = () => {
                                                    mediaRecorder.onstop = null;

                                                    done();
                                                };

                                                mediaRecorder.start();
                                                mediaRecorder.stop();
                                            });
                                        }

                                        beforeEach(function (done) {
                                            this.timeout(3000);

                                            // Wait two seconds before starting the recording.
                                            setTimeout(done, 2000);
                                        });

                                        it('should abort the encoding when adding a track', function (done) {
                                            this.timeout(10000);

                                            let firedDataavailable = false;
                                            let firedError = false;

                                            mediaRecorder.addEventListener('dataavailable', function (event) {
                                                expect(firedDataavailable).to.be.false;
                                                expect(firedError).to.be.true;

                                                // Bug #14: Safari does not yet support the BlobEvent.
                                                if (typeof BlobEvent === 'undefined') {
                                                    expect(event).to.be.an.instanceOf(Event);
                                                } else {
                                                    expect(event).to.be.an.instanceOf(BlobEvent);
                                                }

                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                expect(event.target).to.equal(mediaRecorder);
                                                expect(event.type).to.equal('dataavailable');

                                                expect(this).to.equal(mediaRecorder);

                                                firedDataavailable = true;
                                            });
                                            mediaRecorder.addEventListener('error', function (event) {
                                                expect(firedDataavailable).to.be.false;
                                                expect(firedError).to.be.false;

                                                expect(event).to.be.an.instanceOf(ErrorEvent);
                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                expect(event.target).to.equal(mediaRecorder);
                                                expect(event.type).to.equal('error');

                                                expect(this).to.equal(mediaRecorder);

                                                expect(event.error.code).to.equal(13);
                                                expect(event.error.name).to.equal('InvalidModificationError');

                                                firedError = true;
                                            });
                                            mediaRecorder.addEventListener('stop', function (event) {
                                                expect(firedDataavailable).to.be.true;
                                                expect(firedError).to.be.true;

                                                expect(event).to.be.an.instanceOf(Event);
                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                expect(event.target).to.equal(mediaRecorder);
                                                expect(event.type).to.equal('stop');

                                                expect(this).to.equal(mediaRecorder);

                                                done();
                                            });
                                            mediaRecorder.start();

                                            setTimeout(() => {
                                                createMediaStreamWithAudioTrack(audioContext).then((anotherMediaStream) =>
                                                    mediaStream.addTrack(anotherMediaStream.getAudioTracks()[0])
                                                );
                                            }, 1000);
                                        });

                                        it('should abort the encoding when removing a track', function (done) {
                                            this.timeout(10000);

                                            let firedDataavailable = false;
                                            let firedError = false;

                                            mediaRecorder.addEventListener('dataavailable', function (event) {
                                                expect(firedDataavailable).to.be.false;
                                                expect(firedError).to.be.true;

                                                // Bug #14: Safari does not yet support the BlobEvent.
                                                if (typeof BlobEvent === 'undefined') {
                                                    expect(event).to.be.an.instanceOf(Event);
                                                } else {
                                                    expect(event).to.be.an.instanceOf(BlobEvent);
                                                }

                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                expect(event.target).to.equal(mediaRecorder);
                                                expect(event.type).to.equal('dataavailable');

                                                expect(this).to.equal(mediaRecorder);

                                                firedDataavailable = true;
                                            });
                                            mediaRecorder.addEventListener('error', function (event) {
                                                expect(firedDataavailable).to.be.false;
                                                expect(firedError).to.be.false;

                                                expect(event).to.be.an.instanceOf(ErrorEvent);
                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                expect(event.target).to.equal(mediaRecorder);
                                                expect(event.type).to.equal('error');

                                                expect(this).to.equal(mediaRecorder);

                                                expect(event.error.code).to.equal(13);
                                                expect(event.error.name).to.equal('InvalidModificationError');

                                                firedError = true;
                                            });
                                            mediaRecorder.addEventListener('stop', function (event) {
                                                expect(firedDataavailable).to.be.true;
                                                expect(firedError).to.be.true;

                                                expect(event).to.be.an.instanceOf(Event);
                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                expect(event.target).to.equal(mediaRecorder);
                                                expect(event.type).to.equal('stop');

                                                expect(this).to.equal(mediaRecorder);

                                                done();
                                            });
                                            mediaRecorder.start();

                                            setTimeout(() => {
                                                mediaStream.removeTrack(mediaStream.getAudioTracks()[0]);
                                            }, 1000);
                                        });

                                        it('should encode a mediaStream as a whole', function (done) {
                                            this.timeout(40000);

                                            let firedDataavailable = false;
                                            let firedStop = false;

                                            mediaRecorder.addEventListener('dataavailable', async function (event) {
                                                expect(firedDataavailable).to.be.false;
                                                expect(firedStop).to.be.false;

                                                // Bug #14: Safari does not yet support the BlobEvent.
                                                if (typeof BlobEvent === 'undefined') {
                                                    expect(event).to.be.an.instanceOf(Event);
                                                } else {
                                                    expect(event).to.be.an.instanceOf(BlobEvent);
                                                }

                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                expect(event.target).to.equal(mediaRecorder);
                                                expect(event.type).to.equal('dataavailable');

                                                expect(this).to.equal(mediaRecorder);

                                                firedDataavailable = true;

                                                // Test if the arrayBuffer is decodable.
                                                const audioBuffer = await audioContext.decodeAudioData(await event.data.arrayBuffer());

                                                expect(audioBuffer.numberOfChannels).to.equal(channelCount);

                                                // Test if the audioBuffer is at least half a second long.
                                                expect(audioBuffer.duration).to.be.above(0.5);

                                                // Only test if the audioBuffer contains the ouput of the oscillator when recording a lossless file.
                                                if (mimeType === 'audio/wav') {
                                                    const rotatingBuffers = [
                                                        new Float32Array(bufferLength),
                                                        new Float32Array(bufferLength)
                                                    ];

                                                    for (let i = 0; i < audioBuffer.numberOfChannels; i += 1) {
                                                        audioBuffer.copyFromChannel(rotatingBuffers[0], i);

                                                        for (
                                                            let startInChannel = bufferLength;
                                                            startInChannel < audioBuffer.length - bufferLength;
                                                            startInChannel += bufferLength
                                                        ) {
                                                            audioBuffer.copyFromChannel(rotatingBuffers[1], i, startInChannel);

                                                            for (let j = 0; j < bufferLength; j += 1) {
                                                                try {
                                                                    expect(rotatingBuffers[0][j]).to.not.equal(0);
                                                                    expect(rotatingBuffers[0][j]).to.be.closeTo(
                                                                        rotatingBuffers[1][j],
                                                                        0.0001
                                                                    );
                                                                } catch (err) {
                                                                    done(err);

                                                                    return;
                                                                }
                                                            }

                                                            rotatingBuffers.push(rotatingBuffers.shift());
                                                        }
                                                    }
                                                }

                                                expect(firedDataavailable).to.be.true;
                                                expect(firedStop).to.be.true;

                                                done();
                                            });
                                            mediaRecorder.addEventListener('stop', function (event) {
                                                expect(firedDataavailable).to.be.true;
                                                expect(firedStop).to.be.false;

                                                expect(event).to.be.an.instanceOf(Event);
                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                expect(event.target).to.equal(mediaRecorder);
                                                expect(event.type).to.equal('stop');

                                                expect(this).to.equal(mediaRecorder);

                                                firedStop = true;
                                            });
                                            mediaRecorder.start();

                                            setTimeout(() => mediaRecorder.stop(), 1000);
                                        });

                                        it('should encode a mediaStream in chunks', function (done) {
                                            this.timeout(40000);

                                            const chunks = [];

                                            let firedDataavailable = false;
                                            let firedStop = false;

                                            mediaRecorder.addEventListener('dataavailable', async function (event) {
                                                expect(firedDataavailable).to.be.false;
                                                expect(firedStop).to.be.false;

                                                // Bug #14: Safari does not yet support the BlobEvent.
                                                if (typeof BlobEvent === 'undefined') {
                                                    expect(event).to.be.an.instanceOf(Event);
                                                } else {
                                                    expect(event).to.be.an.instanceOf(BlobEvent);
                                                }

                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                expect(event.target).to.equal(mediaRecorder);
                                                expect(event.type).to.equal('dataavailable');

                                                expect(this).to.equal(mediaRecorder);

                                                chunks.push(event.data);

                                                if (mediaRecorder.state === 'inactive') {
                                                    firedDataavailable = true;

                                                    expect(chunks.length).to.be.above(5);

                                                    // Test if the arrayBuffer is decodable.
                                                    const audioBuffer = await audioContext.decodeAudioData(
                                                        await new Blob(chunks, { mimeType }).arrayBuffer()
                                                    );

                                                    expect(audioBuffer.numberOfChannels).to.equal(channelCount);

                                                    // Test if the audioBuffer is at least half a second long.
                                                    expect(audioBuffer.duration).to.be.above(0.5);

                                                    // Only test if the audioBuffer contains the ouput of the oscillator when recording a lossless file.
                                                    if (mimeType === 'audio/wav') {
                                                        const rotatingBuffers = [
                                                            new Float32Array(bufferLength),
                                                            new Float32Array(bufferLength)
                                                        ];

                                                        for (let i = 0; i < audioBuffer.numberOfChannels; i += 1) {
                                                            audioBuffer.copyFromChannel(rotatingBuffers[0], i);

                                                            for (
                                                                let startInChannel = bufferLength;
                                                                startInChannel < audioBuffer.length - bufferLength;
                                                                startInChannel += bufferLength
                                                            ) {
                                                                audioBuffer.copyFromChannel(rotatingBuffers[1], i, startInChannel);

                                                                for (let j = 0; j < bufferLength; j += 1) {
                                                                    try {
                                                                        expect(rotatingBuffers[0][j]).to.not.equal(0);
                                                                        expect(rotatingBuffers[0][j]).to.be.closeTo(
                                                                            rotatingBuffers[1][j],
                                                                            0.0001
                                                                        );
                                                                    } catch (err) {
                                                                        done(err);

                                                                        return;
                                                                    }
                                                                }

                                                                rotatingBuffers.push(rotatingBuffers.shift());
                                                            }
                                                        }
                                                    }

                                                    expect(firedDataavailable).to.be.true;
                                                    expect(firedStop).to.be.true;

                                                    done();
                                                }
                                            });
                                            mediaRecorder.addEventListener('stop', function (event) {
                                                expect(firedDataavailable).to.be.true;
                                                expect(firedStop).to.be.false;

                                                expect(event).to.be.an.instanceOf(Event);
                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                expect(event.target).to.equal(mediaRecorder);
                                                expect(event.type).to.equal('stop');

                                                expect(this).to.equal(mediaRecorder);

                                                firedStop = true;
                                            });
                                            mediaRecorder.start(100);

                                            setTimeout(() => mediaRecorder.stop(), 1000);
                                        });
                                    });
                                }
                            });
                        }
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
        // eslint-disable-next-line no-undef
        if (process.env.TARGET && process.env.TARGET.endsWith('-unsupported')) {
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
