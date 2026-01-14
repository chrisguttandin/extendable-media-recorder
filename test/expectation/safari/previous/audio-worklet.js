import { beforeEach, describe, expect, it } from 'vitest';
import { resumeAudioContext } from '../../../helpers/resume-audio-context';

describe('AudioWorklet', () => {
    describe('when starting to record a MediaStream', () => {
        for (const { maximum, minimum, sampleRate } of [
            { maximum: 2360, minimum: 2176, sampleRate: 44100 },
            { maximum: 2771, minimum: 2353, sampleRate: 48000 }
        ]) {
            describe(`with a sampleRate of ${sampleRate}`, () => {
                let blob;

                beforeEach(() => {
                    blob = new Blob(
                        [
                            `registerProcessor('processor', class extends AudioWorkletProcessor {
                                #numberOfLeadingZeros = 0;

                                process([input]) {
                                    if (input.length > 0) {
                                        const [channelData] = input;

                                        for (let sampleIndex = 0; sampleIndex < channelData.length; sampleIndex += 1) {
                                            if (channelData[sampleIndex] !== 0) {
                                                this.port.postMessage(this.#numberOfLeadingZeros + sampleIndex);

                                                return false;
                                            }
                                        }

                                        this.#numberOfLeadingZeros += 128;
                                    }

                                    return true;
                                }
                            });`
                        ],
                        { type: 'application/javascript; charset=utf-8' }
                    );
                });

                // bug #22

                it('should start with a certain number of leading zeros', { timeout: 0 }, async () => {
                    let measuredMaximum = Number.NEGATIVE_INFINITY;

                    for (let i = 0; i < 100 || (i < 200 && measuredMaximum < maximum); i += 1) {
                        const playingAudioContext = new AudioContext({ sampleRate: Math.random() < 0.5 ? 44100 : 48000 });
                        const recordingAudioContext = new AudioContext({ sampleRate });

                        await resumeAudioContext(playingAudioContext);
                        await resumeAudioContext(recordingAudioContext);

                        const url = URL.createObjectURL(blob);

                        await recordingAudioContext.audioWorklet.addModule(url);

                        URL.revokeObjectURL(blob);

                        const audioWorkletNode = new AudioWorkletNode(recordingAudioContext, 'processor');
                        const mediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode(playingAudioContext);
                        const mediaStreamAudioSourceNode = new MediaStreamAudioSourceNode(recordingAudioContext, {
                            mediaStream: mediaStreamAudioDestinationNode.stream
                        });
                        const oscillatorNode = new OscillatorNode(playingAudioContext);
                        const { promise, resolve } = Promise.withResolvers();

                        audioWorkletNode.port.onmessage = async ({ data }) => {
                            audioWorkletNode.port.onmessage = null;
                            audioWorkletNode.port.close();

                            oscillatorNode.stop();
                            oscillatorNode.disconnect();

                            mediaStreamAudioSourceNode.disconnect();

                            await Promise.all([playingAudioContext.close(), recordingAudioContext.close()]);

                            resolve(data);
                        };

                        mediaStreamAudioSourceNode.connect(audioWorkletNode);

                        oscillatorNode.connect(mediaStreamAudioDestinationNode);
                        oscillatorNode.start();

                        measuredMaximum = Math.max(measuredMaximum, await promise);
                    }

                    expect(measuredMaximum).to.at.most(maximum);
                    expect(measuredMaximum).to.at.least(minimum);
                });
            });
        }
    });

    describe('when resuming an AudioContext while recording a MediaStream', () => {
        let blob;

        beforeEach(() => {
            blob = new Blob(
                [
                    `registerProcessor('processor', class extends AudioWorkletProcessor {
                            #isRunning = false;

                            process([input]) {
                                if (input.length > 0) {
                                    const [channelData] = input;

                                    if (!this.#isRunning && this.port !== null) {
                                        for (let sampleIndex = 0; sampleIndex < channelData.length; sampleIndex += 1) {
                                            if (channelData[sampleIndex] !== 0) {
                                                this.#isRunning = true;

                                                break;
                                            }
                                        }
                                    }

                                    if (this.#isRunning) {
                                        this.port.postMessage(channelData);
                                    }
                                }

                                return true;
                            }
                        });`
                ],
                { type: 'application/javascript; charset=utf-8' }
            );
        });

        // bug #24

        it('should insert a full render quantum of zeros', async () => {
            const playingAudioContext = new AudioContext();
            const recordingAudioContext = new AudioContext();
            const url = URL.createObjectURL(blob);

            await recordingAudioContext.audioWorklet.addModule(url);

            URL.revokeObjectURL(blob);

            const audioWorkletNode = new AudioWorkletNode(recordingAudioContext, 'processor');
            const mediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode(playingAudioContext);
            const mediaStreamAudioSourceNode = new MediaStreamAudioSourceNode(recordingAudioContext, {
                mediaStream: mediaStreamAudioDestinationNode.stream
            });
            const constantSourceNode = new ConstantSourceNode(playingAudioContext, { offset: 1 });
            const { promise, resolve } = Promise.withResolvers();

            audioWorkletNode.port.onmessage = () => {
                recordingAudioContext.suspend();

                setTimeout(() => {
                    constantSourceNode.offset.value = 10;

                    setTimeout(() => {
                        constantSourceNode.offset.value = 1;

                        setTimeout(() => {
                            recordingAudioContext.resume();
                        }, 500);
                    }, 500);
                }, 500);

                audioWorkletNode.port.onmessage = async ({ data }) => {
                    if (data.every((sample) => sample === 0)) {
                        audioWorkletNode.port.onmessage = null;
                        audioWorkletNode.port.close();

                        constantSourceNode.stop();
                        constantSourceNode.disconnect();

                        mediaStreamAudioSourceNode.disconnect();

                        await Promise.all([playingAudioContext.close(), recordingAudioContext.close()]);

                        resolve();
                    }
                };
            };

            mediaStreamAudioSourceNode.connect(audioWorkletNode);

            constantSourceNode.connect(mediaStreamAudioDestinationNode);
            constantSourceNode.start();

            await promise;
        });
    });
});
