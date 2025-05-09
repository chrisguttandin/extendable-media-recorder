describe('AudioWorklet', () => {
    // @todo There is currently no way to disable the autoplay policy on BrowserStack or Sauce Labs.
    // eslint-disable-next-line no-undef
    if (!process.env.CI) {
        for (const { maximum, minimum, sampleRate } of [
            { maximum: 2360, minimum: 2232, sampleRate: 44100 },
            { maximum: 2620, minimum: 2481, sampleRate: 48000 }
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

                it('should start with a certain number of leading zeros', async function () {
                    this.timeout(0);

                    let measuredMaximum = Number.NEGATIVE_INFINITY;

                    for (let i = 0; i < 100 || (i < 200 && measuredMaximum < maximum); i += 1) {
                        const playingAudioContext = new AudioContext({ sampleRate: Math.random() < 0.5 ? 44100 : 48000 });
                        const recordingAudioContext = new AudioContext({ sampleRate });
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
    }
});
