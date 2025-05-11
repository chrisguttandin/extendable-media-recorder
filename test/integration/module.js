import { AudioContext, ConstantSourceNode } from 'standardized-audio-context';
import { MediaRecorder, deregister, isSupported, register } from '../../src/module';
import { connect } from 'extendable-media-recorder-wav-encoder';
import { createMediaStreamAudioDestinationNode } from '../helpers/create-media-stream-audio-destination-node';
import { createMediaStreamWithAudioTrack } from '../helpers/create-media-stream-with-audio-track';
import { createMediaStreamWithVideoTrack } from '../helpers/create-media-stream-with-video-track';
import { isSafari } from '../helpers/is-safari';
import { spy } from 'sinon';

const MIME_TYPES = [
    { isTypeSupported: false, mimeType: 'audio/anything' },
    // Bug #21: Firefox is the only browser not supporting encoding something as audio/mp4.
    { isTypeSupported: !/Firefox/.test(navigator.userAgent), mimeType: 'audio/mp4' },
    // Bug #27: Only Firefox supports encoding something as audio/ogg.
    { isTypeSupported: /Firefox/.test(navigator.userAgent), mimeType: 'audio/ogg' },
    { isTypeSupported: true, mimeType: 'audio/wav' },
    { isTypeSupported: true, mimeType: 'audio/webm' }
];
const compareRotatingBuffers = (maximum, minimum, rotatingBuffers, shouldThrow = true) => {
    const bufferLength = rotatingBuffers[0].length;

    expect(rotatingBuffers[1].length).to.equal(bufferLength);

    for (let i = 0; i < bufferLength; i += 1) {
        try {
            expect(rotatingBuffers[0][i]).to.be.at.least(minimum);
            expect(rotatingBuffers[0][i]).to.be.at.most(maximum);
            expect(rotatingBuffers[0][i]).to.be.closeTo(rotatingBuffers[1][i], 0.0001);
        } catch (err) {
            if (shouldThrow) {
                throw err;
            }

            return i;
        }
    }

    return bufferLength;
};

describe('module', () => {
    // eslint-disable-next-line no-undef
    if (!process.env.TARGET || !process.env.TARGET.endsWith('-unsupported')) {
        describe('MediaRecorder', () => {
            let port;

            after(() => deregister(port));

            before(async () => {
                port = await connect();

                await register(port);
            });

            // eslint-disable-next-line no-undef
            const channelCounts = process.env.CI && /Chrome/.test(navigator.userAgent) ? [2] : [1, 2];

            for (const channelCount of channelCounts) {
                for (const gain of [0, 0.25, 0.3]) {
                    const mimeTypes = MIME_TYPES.filter(({ isTypeSupported }) => isTypeSupported).map(({ mimeType }) => mimeType);

                    for (const mimeType of mimeTypes) {
                        for (const sampleRate of mimeType === 'audio/wav' ? [44100, 48000] : [48000]) {
                            describe(`with a channelCount of ${channelCount}, a gain of ${gain}, a mimeType of ${mimeType} and a sampleRate of ${sampleRate}`, () => {
                                describe('with a MediaStream which contains an audio track', () => {
                                    let audioContext;
                                    let bufferLength;
                                    let mediaRecorder;
                                    let mediaStream;
                                    let mediaStreamAudioDestinationNode;

                                    afterEach(function () {
                                        this.timeout(40000);

                                        return audioContext.close();
                                    });

                                    beforeEach(async () => {
                                        audioContext = new AudioContext({ sampleRate });
                                        bufferLength = 100;

                                        mediaStreamAudioDestinationNode = await createMediaStreamAudioDestinationNode(
                                            audioContext,
                                            channelCount,
                                            audioContext.sampleRate / bufferLength,
                                            gain
                                        );
                                        mediaStream = mediaStreamAudioDestinationNode.stream;

                                        const [firstAudioTrack] = mediaStream.getAudioTracks();

                                        // Bug #15: Firefox and Safari do not expose the channelCount yet.
                                        if (firstAudioTrack.getSettings().channelCount === undefined) {
                                            firstAudioTrack.getSettings = ((getSettings) => () => ({
                                                channelCount,
                                                ...getSettings.call(firstAudioTrack)
                                            }))(firstAudioTrack.getSettings);
                                        }

                                        // Bug #16: Firefox and Safari do not expose the sampleRate yet.
                                        if (firstAudioTrack.getSettings().sampleRate === undefined) {
                                            firstAudioTrack.getSettings = ((getSettings) => () => ({
                                                sampleRate,
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

                                        it('should register an independent event listener', () => {
                                            const ondataavailable = spy();

                                            mediaRecorder.ondataavailable = ondataavailable;
                                            mediaRecorder.addEventListener('dataavailable', ondataavailable);

                                            mediaRecorder.dispatchEvent(new Event('dataavailable'));

                                            expect(ondataavailable).to.have.been.calledTwice;
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

                                    describe('onpause', () => {
                                        it('should be null', () => {
                                            expect(mediaRecorder.onpause).to.be.null;
                                        });

                                        it('should be assignable to a function', () => {
                                            const fn = () => {}; // eslint-disable-line unicorn/consistent-function-scoping
                                            const onpause = (mediaRecorder.onpause = fn); // eslint-disable-line no-multi-assign

                                            expect(onpause).to.equal(fn);
                                            expect(mediaRecorder.onpause).to.equal(fn);
                                        });

                                        it('should be assignable to null', () => {
                                            const onpause = (mediaRecorder.onpause = null); // eslint-disable-line no-multi-assign

                                            expect(onpause).to.be.null;
                                            expect(mediaRecorder.onpause).to.be.null;
                                        });

                                        it('should not be assignable to something else', () => {
                                            const string = 'no function or null value';

                                            mediaRecorder.onpause = () => {};

                                            const onpause = (mediaRecorder.onpause = string); // eslint-disable-line no-multi-assign

                                            expect(onpause).to.equal(string);
                                            expect(mediaRecorder.onpause).to.be.null;
                                        });

                                        it('should register an independent event listener', () => {
                                            const onpause = spy();

                                            mediaRecorder.onpause = onpause;
                                            mediaRecorder.addEventListener('pause', onpause);

                                            mediaRecorder.dispatchEvent(new Event('pause'));

                                            expect(onpause).to.have.been.calledTwice;
                                        });
                                    });

                                    describe('onresume', () => {
                                        it('should be null', () => {
                                            expect(mediaRecorder.onresume).to.be.null;
                                        });

                                        it('should be assignable to a function', () => {
                                            const fn = () => {}; // eslint-disable-line unicorn/consistent-function-scoping
                                            const onresume = (mediaRecorder.onresume = fn); // eslint-disable-line no-multi-assign

                                            expect(onresume).to.equal(fn);
                                            expect(mediaRecorder.onresume).to.equal(fn);
                                        });

                                        it('should be assignable to null', () => {
                                            const onresume = (mediaRecorder.onresume = null); // eslint-disable-line no-multi-assign

                                            expect(onresume).to.be.null;
                                            expect(mediaRecorder.onresume).to.be.null;
                                        });

                                        it('should not be assignable to something else', () => {
                                            const string = 'no function or null value';

                                            mediaRecorder.onresume = () => {};

                                            const onresume = (mediaRecorder.onresume = string); // eslint-disable-line no-multi-assign

                                            expect(onresume).to.equal(string);
                                            expect(mediaRecorder.onresume).to.be.null;
                                        });

                                        it('should register an independent event listener', () => {
                                            const onresume = spy();

                                            mediaRecorder.onresume = onresume;
                                            mediaRecorder.addEventListener('resume', onresume);

                                            mediaRecorder.dispatchEvent(new Event('resume'));

                                            expect(onresume).to.have.been.calledTwice;
                                        });
                                    });

                                    describe('onstart', () => {
                                        it('should be null', () => {
                                            expect(mediaRecorder.onstart).to.be.null;
                                        });

                                        it('should be assignable to a function', () => {
                                            const fn = () => {}; // eslint-disable-line unicorn/consistent-function-scoping
                                            const onstart = (mediaRecorder.onstart = fn); // eslint-disable-line no-multi-assign

                                            expect(onstart).to.equal(fn);
                                            expect(mediaRecorder.onstart).to.equal(fn);
                                        });

                                        it('should be assignable to null', () => {
                                            const onstart = (mediaRecorder.onstart = null); // eslint-disable-line no-multi-assign

                                            expect(onstart).to.be.null;
                                            expect(mediaRecorder.onstart).to.be.null;
                                        });

                                        it('should not be assignable to something else', () => {
                                            const string = 'no function or null value';

                                            mediaRecorder.onstart = () => {};

                                            const onstart = (mediaRecorder.onstart = string); // eslint-disable-line no-multi-assign

                                            expect(onstart).to.equal(string);
                                            expect(mediaRecorder.onstart).to.be.null;
                                        });

                                        it('should register an independent event listener', () => {
                                            const onstart = spy();

                                            mediaRecorder.onstart = onstart;
                                            mediaRecorder.addEventListener('start', onstart);

                                            mediaRecorder.dispatchEvent(new Event('start'));

                                            expect(onstart).to.have.been.calledTwice;
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

                                        it('should register an independent event listener', () => {
                                            const onstop = spy();

                                            mediaRecorder.onstop = onstop;
                                            mediaRecorder.addEventListener('stop', onstop);

                                            mediaRecorder.dispatchEvent(new Event('stop'));

                                            expect(onstop).to.have.been.calledTwice;
                                        });
                                    });

                                    describe('pause()', () => {
                                        describe('with a state of inactive', () => {
                                            it('should throw an InvalidStateError', (done) => {
                                                try {
                                                    mediaRecorder.pause();
                                                } catch (err) {
                                                    expect(err.code).to.equal(11);
                                                    expect(err.name).to.equal('InvalidStateError');

                                                    done();
                                                }
                                            });
                                        });

                                        describe('with a state of paused', () => {
                                            afterEach(() => mediaRecorder.stop());

                                            beforeEach(() => {
                                                mediaRecorder.start();
                                                mediaRecorder.pause();
                                            });

                                            it('should not change the state', () => {
                                                mediaRecorder.pause();

                                                expect(mediaRecorder.state).to.equal('paused');
                                            });
                                        });

                                        describe('with a state of recording', () => {
                                            afterEach(() => mediaRecorder.stop());

                                            beforeEach(() => mediaRecorder.start());

                                            it('should set the state to paused', () => {
                                                mediaRecorder.pause();

                                                expect(mediaRecorder.state).to.equal('paused');
                                            });
                                        });
                                    });

                                    describe('resume()', () => {
                                        describe('with a state of inactive', () => {
                                            it('should throw an InvalidStateError', (done) => {
                                                try {
                                                    mediaRecorder.resume();
                                                } catch (err) {
                                                    expect(err.code).to.equal(11);
                                                    expect(err.name).to.equal('InvalidStateError');

                                                    done();
                                                }
                                            });
                                        });

                                        describe('with a state of paused', () => {
                                            afterEach(() => mediaRecorder.stop());

                                            beforeEach(() => {
                                                mediaRecorder.start();
                                                mediaRecorder.pause();
                                            });

                                            it('should set the state to recording', () => {
                                                mediaRecorder.resume();

                                                expect(mediaRecorder.state).to.equal('recording');
                                            });
                                        });

                                        describe('with a state of recording', () => {
                                            afterEach(() => mediaRecorder.stop());

                                            beforeEach(() => mediaRecorder.start());

                                            it('should not change the state', () => {
                                                mediaRecorder.resume();

                                                expect(mediaRecorder.state).to.equal('recording');
                                            });
                                        });
                                    });

                                    // @todo There is currently no way to disable the autoplay policy on BrowserStack or Sauce Labs.
                                    // eslint-disable-next-line no-undef
                                    if (!process.env.CI) {
                                        describe('start()', () => {
                                            for (const wasStartedBefore of [true, false]) {
                                                describe(`with a MediaRecorder that was${
                                                    wasStartedBefore ? ' ' : ' not '
                                                }started before`, () => {
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
                                                        let firedStart = false;

                                                        mediaRecorder.addEventListener('dataavailable', function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.false;
                                                                expect(firedError).to.be.true;
                                                                expect(firedStart).to.be.true;

                                                                expect(event).to.be.an.instanceOf(BlobEvent);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('dataavailable');

                                                                expect(this).to.equal(mediaRecorder);

                                                                expect(mediaRecorder.state).to.equal('inactive');

                                                                firedDataavailable = true;
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.addEventListener('error', function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.false;
                                                                expect(firedError).to.be.false;
                                                                expect(firedStart).to.be.true;

                                                                expect(event).to.be.an.instanceOf(ErrorEvent);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('error');

                                                                expect(this).to.equal(mediaRecorder);

                                                                expect(event.error.code).to.equal(13);
                                                                expect(event.error.name).to.equal('InvalidModificationError');

                                                                firedError = true;
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.addEventListener('start', function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.false;
                                                                expect(firedError).to.be.false;
                                                                expect(firedStart).to.be.false;

                                                                expect(event).to.be.an.instanceOf(Event);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('start');

                                                                expect(this).to.equal(mediaRecorder);

                                                                firedStart = true;
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.addEventListener('stop', function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.true;
                                                                expect(firedError).to.be.true;
                                                                expect(firedStart).to.be.true;

                                                                expect(event).to.be.an.instanceOf(Event);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('stop');

                                                                expect(this).to.equal(mediaRecorder);

                                                                done();
                                                            } catch (err) {
                                                                done(err);
                                                            }
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
                                                        let firedStart = false;

                                                        mediaRecorder.addEventListener('dataavailable', function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.false;
                                                                expect(firedError).to.be.true;
                                                                expect(firedStart).to.be.true;

                                                                expect(event).to.be.an.instanceOf(BlobEvent);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('dataavailable');

                                                                expect(this).to.equal(mediaRecorder);

                                                                expect(mediaRecorder.state).to.equal('inactive');

                                                                firedDataavailable = true;
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.addEventListener('error', function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.false;
                                                                expect(firedError).to.be.false;
                                                                expect(firedStart).to.be.true;

                                                                expect(event).to.be.an.instanceOf(ErrorEvent);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('error');

                                                                expect(this).to.equal(mediaRecorder);

                                                                expect(event.error.code).to.equal(13);
                                                                expect(event.error.name).to.equal('InvalidModificationError');

                                                                firedError = true;
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.addEventListener('start', function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.false;
                                                                expect(firedError).to.be.false;
                                                                expect(firedStart).to.be.false;

                                                                expect(event).to.be.an.instanceOf(Event);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('start');

                                                                expect(this).to.equal(mediaRecorder);

                                                                firedStart = true;
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.addEventListener('stop', function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.true;
                                                                expect(firedError).to.be.true;
                                                                expect(firedStart).to.be.true;

                                                                expect(event).to.be.an.instanceOf(Event);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('stop');

                                                                expect(this).to.equal(mediaRecorder);

                                                                done();
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.start();

                                                        setTimeout(() => {
                                                            mediaStream.removeTrack(mediaStream.getAudioTracks()[0]);
                                                        }, 1000);
                                                    });

                                                    it('should encode a mediaStream as a whole', function (done) {
                                                        this.timeout(40000);

                                                        let firedDataavailable = false;
                                                        let firedStart = false;
                                                        let firedStop = false;

                                                        mediaRecorder.addEventListener('dataavailable', async function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.false;
                                                                expect(firedStart).to.be.true;
                                                                expect(firedStop).to.be.false;

                                                                expect(event).to.be.an.instanceOf(BlobEvent);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('dataavailable');

                                                                expect(this).to.equal(mediaRecorder);

                                                                expect(mediaRecorder.state).to.equal('inactive');

                                                                firedDataavailable = true;

                                                                // Test if the arrayBuffer is decodable.
                                                                const arrayBuffer = await event.data.arrayBuffer();
                                                                const audioBuffer = await audioContext.decodeAudioData(
                                                                    arrayBuffer.slice(0)
                                                                );

                                                                expect(audioBuffer.numberOfChannels).to.equal(channelCount);

                                                                expect(audioBuffer.duration).to.at.least(0.5);
                                                                expect(audioBuffer.duration).to.at.most(1.5);

                                                                // Only test if the audioBuffer contains the ouput of the oscillator when recording a lossless file.
                                                                if (mimeType === 'audio/wav') {
                                                                    const dataView = new DataView(arrayBuffer);

                                                                    expect(dataView.getUint32(24, true), sampleRate);
                                                                    expect(dataView.getUint32(40, true) / 2 / channelCount).to.equal(
                                                                        audioBuffer.length
                                                                    );

                                                                    const rotatingBuffers = [
                                                                        new Float32Array(bufferLength),
                                                                        new Float32Array(bufferLength)
                                                                    ];

                                                                    for (let i = 0; i < audioBuffer.numberOfChannels; i += 1) {
                                                                        audioBuffer.copyFromChannel(rotatingBuffers[0], i);

                                                                        for (
                                                                            let j = bufferLength;
                                                                            j < audioBuffer.length;
                                                                            j += bufferLength
                                                                        ) {
                                                                            audioBuffer.copyFromChannel(rotatingBuffers[1], i, j);

                                                                            compareRotatingBuffers(gain * 3, gain, rotatingBuffers);

                                                                            rotatingBuffers.push(rotatingBuffers.shift());
                                                                        }
                                                                    }
                                                                }

                                                                expect(firedDataavailable).to.be.true;
                                                                expect(firedStart).to.be.true;
                                                                expect(firedStop).to.be.true;

                                                                done();
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.addEventListener('start', function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.false;
                                                                expect(firedStart).to.be.false;
                                                                expect(firedStop).to.be.false;

                                                                expect(event).to.be.an.instanceOf(Event);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('start');

                                                                expect(this).to.equal(mediaRecorder);

                                                                firedStart = true;
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.addEventListener('stop', function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.true;
                                                                expect(firedStart).to.be.true;
                                                                expect(firedStop).to.be.false;

                                                                expect(event).to.be.an.instanceOf(Event);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('stop');

                                                                expect(this).to.equal(mediaRecorder);

                                                                firedStop = true;
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.start();

                                                        setTimeout(() => mediaRecorder.stop(), 1000);
                                                    });

                                                    it('should encode a mediaStream as one chunk', function (done) {
                                                        this.timeout(40000);

                                                        let firedDataavailable = false;
                                                        let firedStart = false;
                                                        let firedStop = false;

                                                        mediaRecorder.addEventListener('dataavailable', async function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.false;
                                                                expect(firedStart).to.be.true;
                                                                expect(firedStop).to.be.false;

                                                                expect(event).to.be.an.instanceOf(BlobEvent);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('dataavailable');

                                                                expect(this).to.equal(mediaRecorder);

                                                                expect(mediaRecorder.state).to.equal('inactive');

                                                                firedDataavailable = true;

                                                                // Test if the arrayBuffer is decodable.
                                                                const arrayBuffer = await event.data.arrayBuffer();
                                                                const audioBuffer = await audioContext.decodeAudioData(
                                                                    arrayBuffer.slice(0)
                                                                );

                                                                expect(audioBuffer.numberOfChannels).to.equal(channelCount);

                                                                expect(audioBuffer.duration).to.at.least(0.5);
                                                                expect(audioBuffer.duration).to.at.most(1.5);

                                                                // Only test if the audioBuffer contains the ouput of the oscillator when recording a lossless file.
                                                                if (mimeType === 'audio/wav') {
                                                                    const dataView = new DataView(arrayBuffer);

                                                                    expect(dataView.getUint32(24, true)).to.equal(sampleRate);
                                                                    expect(dataView.getUint32(40, true) / 2 / channelCount).to.equal(
                                                                        audioBuffer.length
                                                                    );

                                                                    const rotatingBuffers = [
                                                                        new Float32Array(bufferLength),
                                                                        new Float32Array(bufferLength)
                                                                    ];

                                                                    for (let i = 0; i < audioBuffer.numberOfChannels; i += 1) {
                                                                        audioBuffer.copyFromChannel(rotatingBuffers[0], i);

                                                                        for (
                                                                            let j = bufferLength;
                                                                            j < audioBuffer.length;
                                                                            j += bufferLength
                                                                        ) {
                                                                            audioBuffer.copyFromChannel(rotatingBuffers[1], i, j);

                                                                            compareRotatingBuffers(gain * 3, gain, rotatingBuffers);

                                                                            rotatingBuffers.push(rotatingBuffers.shift());
                                                                        }
                                                                    }
                                                                }

                                                                expect(firedDataavailable).to.be.true;
                                                                expect(firedStart).to.be.true;
                                                                expect(firedStop).to.be.true;

                                                                done();
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.addEventListener('start', function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.false;
                                                                expect(firedStart).to.be.false;
                                                                expect(firedStop).to.be.false;

                                                                expect(event).to.be.an.instanceOf(Event);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('start');

                                                                expect(this).to.equal(mediaRecorder);

                                                                firedStart = true;
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.addEventListener('stop', function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.true;
                                                                expect(firedStart).to.be.true;
                                                                expect(firedStop).to.be.false;

                                                                expect(event).to.be.an.instanceOf(Event);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('stop');

                                                                expect(this).to.equal(mediaRecorder);

                                                                firedStop = true;
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.start(10000);

                                                        setTimeout(() => mediaRecorder.stop(), 1000);
                                                    });

                                                    it('should encode a mediaStream in chunks', function (done) {
                                                        this.timeout(40000);

                                                        const chunks = [];

                                                        let firedDataavailable = false;
                                                        let firedStart = false;
                                                        let firedStop = false;

                                                        mediaRecorder.addEventListener('dataavailable', async function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.false;
                                                                expect(firedStart).to.be.true;
                                                                expect(firedStop).to.be.false;

                                                                expect(event).to.be.an.instanceOf(BlobEvent);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('dataavailable');

                                                                expect(this).to.equal(mediaRecorder);

                                                                chunks.push(event.data);

                                                                if (mediaRecorder.state === 'inactive') {
                                                                    firedDataavailable = true;

                                                                    expect(chunks.length).to.be.above(5);

                                                                    // Test if the arrayBuffer is decodable.
                                                                    const arrayBuffer = await new Blob(chunks, { mimeType }).arrayBuffer();
                                                                    const audioBuffer = await audioContext.decodeAudioData(
                                                                        arrayBuffer.slice(0)
                                                                    );

                                                                    expect(audioBuffer.numberOfChannels).to.equal(channelCount);

                                                                    /*
                                                                     * Bug #26: Chrome (when encoding audio/mp4) and Safari emit chunks of
                                                                     * at least about a second.
                                                                     */
                                                                    if (
                                                                        (isSafari(navigator) && mimeType !== 'audio/wav') ||
                                                                        mimeType === 'audio/mp4'
                                                                    ) {
                                                                        expect(audioBuffer.duration).to.at.least(5);
                                                                        expect(audioBuffer.duration).to.at.most(15);
                                                                    } else {
                                                                        expect(audioBuffer.duration).to.at.least(0.5);
                                                                        expect(audioBuffer.duration).to.at.most(1.5);
                                                                    }

                                                                    // Only test if the audioBuffer contains the ouput of the oscillator when recording a lossless file.
                                                                    if (mimeType === 'audio/wav') {
                                                                        const dataView = new DataView(arrayBuffer);

                                                                        expect(dataView.getUint32(24, true)).to.equal(sampleRate);
                                                                        expect(dataView.getUint32(40, true)).to.equal(2 ** 32 - 45);
                                                                        expect((arrayBuffer.byteLength - 44) / 2 / channelCount).to.equal(
                                                                            audioBuffer.length
                                                                        );

                                                                        const rotatingBuffers = [
                                                                            new Float32Array(bufferLength),
                                                                            new Float32Array(bufferLength)
                                                                        ];

                                                                        for (let i = 0; i < audioBuffer.numberOfChannels; i += 1) {
                                                                            audioBuffer.copyFromChannel(rotatingBuffers[0], i);

                                                                            for (
                                                                                let j = bufferLength;
                                                                                j < audioBuffer.length;
                                                                                j += bufferLength
                                                                            ) {
                                                                                audioBuffer.copyFromChannel(rotatingBuffers[1], i, j);

                                                                                compareRotatingBuffers(gain * 3, gain, rotatingBuffers);

                                                                                rotatingBuffers.push(rotatingBuffers.shift());
                                                                            }
                                                                        }
                                                                    }

                                                                    expect(firedDataavailable).to.be.true;
                                                                    expect(firedStart).to.be.true;
                                                                    expect(firedStop).to.be.true;

                                                                    done();
                                                                }
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.addEventListener('start', function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.false;
                                                                expect(firedStart).to.be.false;
                                                                expect(firedStop).to.be.false;

                                                                expect(event).to.be.an.instanceOf(Event);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('start');

                                                                expect(this).to.equal(mediaRecorder);

                                                                firedStart = true;
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.addEventListener('stop', function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.true;
                                                                expect(firedStart).to.be.true;
                                                                expect(firedStop).to.be.false;

                                                                expect(event).to.be.an.instanceOf(Event);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('stop');

                                                                expect(this).to.equal(mediaRecorder);

                                                                firedStop = true;
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.start(100);

                                                        setTimeout(
                                                            () => mediaRecorder.stop(),
                                                            /*
                                                             * Bug #26: Chrome (when encoding audio/mp4) and Safari emit chunks of at least
                                                             * about a second.
                                                             */
                                                            (isSafari(navigator) && mimeType !== 'audio/wav') || mimeType === 'audio/mp4'
                                                                ? 10000
                                                                : 1000
                                                        );
                                                    });

                                                    it('should encode a mediaStream with a pause', function (done) {
                                                        this.timeout(40000);

                                                        let firedDataavailable = false;
                                                        let firedPause = false;
                                                        let firedResume = false;
                                                        let firedStop = false;

                                                        mediaRecorder.addEventListener('dataavailable', async function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.false;
                                                                expect(firedPause).to.be.true;
                                                                expect(firedResume).to.be.true;
                                                                expect(firedStop).to.be.false;

                                                                expect(event).to.be.an.instanceOf(BlobEvent);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('dataavailable');

                                                                expect(this).to.equal(mediaRecorder);

                                                                expect(mediaRecorder.state).to.equal('inactive');

                                                                firedDataavailable = true;

                                                                // Test if the arrayBuffer is decodable.
                                                                const arrayBuffer = await event.data.arrayBuffer();
                                                                const audioBuffer = await audioContext.decodeAudioData(
                                                                    arrayBuffer.slice(0)
                                                                );

                                                                expect(audioBuffer.numberOfChannels).to.equal(channelCount);

                                                                expect(audioBuffer.duration).to.at.least(0.5);
                                                                expect(audioBuffer.duration).to.at.most(1.5);

                                                                // Only test if the audioBuffer contains the ouput of the oscillator when recording a lossless file.
                                                                if (mimeType === 'audio/wav') {
                                                                    const dataView = new DataView(arrayBuffer);

                                                                    expect(dataView.getUint32(24, true), sampleRate);
                                                                    expect(dataView.getUint32(40, true) / 2 / channelCount).to.equal(
                                                                        audioBuffer.length
                                                                    );

                                                                    const rotatingBuffers = [
                                                                        new Float32Array(bufferLength),
                                                                        new Float32Array(bufferLength)
                                                                    ];

                                                                    let cut = null;

                                                                    for (let i = 0; i < audioBuffer.numberOfChannels; i += 1) {
                                                                        audioBuffer.copyFromChannel(rotatingBuffers[0], i);

                                                                        for (
                                                                            let j = bufferLength;
                                                                            j < audioBuffer.length;
                                                                            j += bufferLength
                                                                        ) {
                                                                            audioBuffer.copyFromChannel(rotatingBuffers[1], i, j);

                                                                            const k = compareRotatingBuffers(
                                                                                gain * 3,
                                                                                gain,
                                                                                rotatingBuffers,
                                                                                false
                                                                            );

                                                                            if (k !== bufferLength) {
                                                                                if (cut === null) {
                                                                                    cut = j + k;

                                                                                    expect(cut).to.be.at.least(audioBuffer.length / 3);
                                                                                    expect(cut).to.be.at.most((audioBuffer.length / 3) * 2);
                                                                                } else {
                                                                                    expect(cut).to.equal(j + k);
                                                                                }

                                                                                /*
                                                                                 * Bug #23: Safari inserts 128 samples of silence when
                                                                                 * something changes while the AudioContext is suspended.
                                                                                 */
                                                                                const numberOfExpectedZeros =
                                                                                    gain !== 0 && isSafari(navigator) ? 128 : 0;

                                                                                if (numberOfExpectedZeros > 0) {
                                                                                    const zeroBuffer = new Float32Array(
                                                                                        numberOfExpectedZeros
                                                                                    );

                                                                                    audioBuffer.copyFromChannel(zeroBuffer, i, cut);

                                                                                    for (let l = 0; l < numberOfExpectedZeros; l += 1) {
                                                                                        expect(zeroBuffer[l]).to.equal(0);
                                                                                    }
                                                                                }

                                                                                audioBuffer.copyFromChannel(
                                                                                    rotatingBuffers[0],
                                                                                    i,
                                                                                    cut + numberOfExpectedZeros
                                                                                );

                                                                                for (
                                                                                    let l = cut + numberOfExpectedZeros + bufferLength;
                                                                                    l < audioBuffer.length;
                                                                                    l += bufferLength
                                                                                ) {
                                                                                    audioBuffer.copyFromChannel(rotatingBuffers[1], i, l);

                                                                                    compareRotatingBuffers(
                                                                                        gain * 3 - 1,
                                                                                        gain - 1,
                                                                                        rotatingBuffers
                                                                                    );

                                                                                    rotatingBuffers.push(rotatingBuffers.shift());
                                                                                }

                                                                                break;
                                                                            }

                                                                            rotatingBuffers.push(rotatingBuffers.shift());
                                                                        }
                                                                    }
                                                                }

                                                                expect(firedDataavailable).to.be.true;
                                                                expect(firedStop).to.be.true;

                                                                done();
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.addEventListener('pause', function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.false;
                                                                expect(firedPause).to.be.false;
                                                                expect(firedResume).to.be.false;
                                                                expect(firedStop).to.be.false;

                                                                expect(event).to.be.an.instanceOf(Event);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('pause');

                                                                expect(this).to.equal(mediaRecorder);

                                                                firedPause = true;
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.addEventListener('resume', function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.false;
                                                                expect(firedPause).to.be.true;
                                                                expect(firedResume).to.be.false;
                                                                expect(firedStop).to.be.false;

                                                                expect(event).to.be.an.instanceOf(Event);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('resume');

                                                                expect(this).to.equal(mediaRecorder);

                                                                firedResume = true;
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.addEventListener('stop', function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.be.true;
                                                                expect(firedPause).to.be.true;
                                                                expect(firedResume).to.be.true;
                                                                expect(firedStop).to.be.false;

                                                                expect(event).to.be.an.instanceOf(Event);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('stop');

                                                                expect(this).to.equal(mediaRecorder);

                                                                firedStop = true;
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });

                                                        const constantSourceNode = new ConstantSourceNode(audioContext, { offset: 0 });

                                                        constantSourceNode.connect(mediaStreamAudioDestinationNode);
                                                        constantSourceNode.start();

                                                        mediaRecorder.start();

                                                        setTimeout(() => {
                                                            mediaRecorder.pause();

                                                            setTimeout(() => {
                                                                constantSourceNode.offset.value = 10;

                                                                setTimeout(() => {
                                                                    constantSourceNode.offset.value = -1;

                                                                    setTimeout(() => {
                                                                        mediaRecorder.resume();

                                                                        setTimeout(() => {
                                                                            mediaRecorder.stop();

                                                                            constantSourceNode.onended = () => {
                                                                                constantSourceNode.onended = null;

                                                                                constantSourceNode.disconnect(
                                                                                    mediaStreamAudioDestinationNode
                                                                                );
                                                                            };

                                                                            constantSourceNode.stop(audioContext.currentTime + 0.5);
                                                                        }, 500);
                                                                    }, 500);
                                                                }, 500);
                                                            }, 500);
                                                        }, 500);
                                                    });

                                                    it('should encode a mediaStream as two separate recodings', function (done) {
                                                        this.timeout(40000);

                                                        const blobs = [];

                                                        let firedDataavailable = 0;
                                                        let firedStop = 0;

                                                        mediaRecorder.addEventListener('dataavailable', async function (event) {
                                                            try {
                                                                expect(firedDataavailable).to.equal(firedStop);

                                                                expect(event).to.be.an.instanceOf(BlobEvent);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('dataavailable');

                                                                expect(this).to.equal(mediaRecorder);

                                                                firedDataavailable += 1;

                                                                blobs.push(event.data);

                                                                if (firedDataavailable === 2) {
                                                                    expect(mediaRecorder.state).to.equal('inactive');

                                                                    for (const blob of blobs) {
                                                                        // Test if the arrayBuffer is decodable.
                                                                        const arrayBuffer = await blob.arrayBuffer();
                                                                        const audioBuffer = await audioContext.decodeAudioData(
                                                                            arrayBuffer.slice(0)
                                                                        );

                                                                        expect(audioBuffer.numberOfChannels).to.equal(channelCount);

                                                                        expect(audioBuffer.duration).to.at.least(0.5);
                                                                        expect(audioBuffer.duration).to.at.most(1.5);

                                                                        // Only test if the audioBuffer contains the ouput of the oscillator when recording a lossless file.
                                                                        if (mimeType === 'audio/wav') {
                                                                            const dataView = new DataView(arrayBuffer);

                                                                            expect(dataView.getUint32(24, true)).to.equal(sampleRate);
                                                                            expect(
                                                                                dataView.getUint32(40, true) / 2 / channelCount
                                                                            ).to.equal(audioBuffer.length);

                                                                            const rotatingBuffers = [
                                                                                new Float32Array(bufferLength),
                                                                                new Float32Array(bufferLength)
                                                                            ];

                                                                            for (let i = 0; i < audioBuffer.numberOfChannels; i += 1) {
                                                                                audioBuffer.copyFromChannel(rotatingBuffers[0], i);

                                                                                for (
                                                                                    let j = bufferLength;
                                                                                    j < audioBuffer.length - bufferLength;
                                                                                    j += bufferLength
                                                                                ) {
                                                                                    audioBuffer.copyFromChannel(rotatingBuffers[1], i, j);

                                                                                    compareRotatingBuffers(gain * 3, gain, rotatingBuffers);

                                                                                    rotatingBuffers.push(rotatingBuffers.shift());
                                                                                }
                                                                            }
                                                                        }
                                                                    }

                                                                    done();
                                                                }
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });
                                                        mediaRecorder.addEventListener('stop', function (event) {
                                                            try {
                                                                expect(firedStop).to.equal(firedDataavailable - 1);

                                                                expect(event).to.be.an.instanceOf(Event);
                                                                expect(event.currentTarget).to.equal(mediaRecorder);
                                                                expect(event.target).to.equal(mediaRecorder);
                                                                expect(event.type).to.equal('stop');

                                                                expect(this).to.equal(mediaRecorder);

                                                                firedStop += 1;
                                                            } catch (err) {
                                                                done(err);
                                                            }
                                                        });

                                                        mediaRecorder.start();

                                                        setTimeout(() => {
                                                            mediaRecorder.stop();
                                                            mediaRecorder.start();

                                                            setTimeout(() => mediaRecorder.stop(), 1000);
                                                        }, 1000);
                                                    });
                                                });
                                            }
                                        });
                                    }
                                });

                                describe('with a MediaStream which contains a video track', () => {
                                    let mediaRecorder;
                                    let mediaStream;

                                    afterEach(() => mediaStream.getTracks().forEach((track) => track.stop()));

                                    beforeEach(() => {
                                        mediaStream = createMediaStreamWithVideoTrack();
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
                }
            }

            for (const { isTypeSupported, mimeType } of MIME_TYPES) {
                describe(`with the mimeType of ${mimeType}`, () => {
                    let audioContext;
                    let mediaStream;

                    afterEach(() => {
                        audioContext.close();
                        mediaStream.getTracks().forEach((track) => track.stop());
                    });

                    beforeEach(async () => {
                        audioContext = new AudioContext();
                        mediaStream = await createMediaStreamWithAudioTrack(audioContext);
                    });

                    describe('constructor()', () => {
                        if (isTypeSupported) {
                            it('should not throw any error', () => {
                                new MediaRecorder(mediaStream, { mimeType });
                            });
                        } else {
                            it('should throw a NotSupportedError', (done) => {
                                try {
                                    new MediaRecorder(mediaStream, { mimeType });
                                } catch (err) {
                                    expect(err.code).to.equal(9);
                                    expect(err.name).to.equal('NotSupportedError');

                                    done();
                                }
                            });
                        }
                    });

                    describe('isTypeSupported()', () => {
                        if (isTypeSupported) {
                            it(`should support ${mimeType}`, () => {
                                expect(MediaRecorder.isTypeSupported(mimeType)).to.be.true;
                            });
                        } else {
                            it(`should not support ${mimeType}`, () => {
                                expect(MediaRecorder.isTypeSupported(mimeType)).to.be.false;
                            });
                        }
                    });
                });
            }
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
