import { openAnotherTab } from '../../helpers/open-another-tab';

const DETECTOR_WORKLET = `class DetectorProcessor extends AudioWorkletProcessor {
    constructor({ processorOptions }) {
        super();

        this.channelData = processorOptions;
        this.index = null;
    }

    process([ [ channelData ] ]) {
        let hasNonZeroInput = false;

        for (let i = 0; i < channelData.length; i += 1) {
            if (channelData[i] !== 0) {
                hasNonZeroInput = true;

                break;
            }
        }

        if (hasNonZeroInput) {
            for (let i = 0; i < channelData.length; i += 1) {
                if (this.index === null) {
                    for (let j = 0; j < this.channelData.length; j += 1) {
                        if (channelData[i] === this.channelData[j]) {
                            this.index = j;

                            break;
                        }
                    }

                    if (this.index === null) {
                        throw new Error("Couldn't find any matching sample.");
                    }
                } else {
                    this.index = (this.index + 1) % this.channelData.length;

                    if (channelData[i] !== this.channelData[this.index]) {
                        this.port.postMessage('An inconsistency was found.');

                        return false;
                    }
                }
            }
        }

        return true;
    }
}

registerProcessor('detector-processor', DetectorProcessor);
`;

describe('AudioWorklet', () => {
    let buffer;
    let playingAudioContext;
    let recordingAudioContext;

    afterEach(() => Promise.all([playingAudioContext.close(), recordingAudioContext.close()]));

    beforeEach(async () => {
        playingAudioContext = new AudioContext();

        const length = 100;
        const sampleRate = playingAudioContext.sampleRate;
        const offlineAudioContext = new OfflineAudioContext({ length, sampleRate });
        const oscillatorNode = new OscillatorNode(offlineAudioContext, { freqency: sampleRate / length, type: 'sawtooth' });

        oscillatorNode.connect(offlineAudioContext.destination);
        oscillatorNode.start(0);

        buffer = await offlineAudioContext.startRendering();

        recordingAudioContext = new AudioContext();

        const blob = new Blob([DETECTOR_WORKLET], { type: 'application/javascript; charset=utf-8' });
        const url = URL.createObjectURL(blob);

        await recordingAudioContext.audioWorklet.addModule(url);

        URL.revokeObjectURL(url);
    });

    // bug #17

    // This test will only work when changing the browser settings to allow popups.
    it('should occasionally throttle the processing when the current tab looses focus', (done) => {
        const audioBufferSourceNode = new AudioBufferSourceNode(playingAudioContext, { buffer, loop: true });
        const channelData = buffer.getChannelData(0);
        const audioWorkletNode = new AudioWorkletNode(recordingAudioContext, 'detector-processor', { processorOptions: channelData });
        const mediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode(playingAudioContext);
        const mediaStreamAudioSourceNode = new MediaStreamAudioSourceNode(recordingAudioContext, {
            mediaStream: mediaStreamAudioDestinationNode.stream
        });
        const stopOpeningAnotherTab = openAnotherTab();

        audioWorkletNode.port.onmessage = () => {
            audioBufferSourceNode.stop();
            audioBufferSourceNode.disconnect();

            mediaStreamAudioSourceNode.disconnect();

            stopOpeningAnotherTab();
            done();
        };

        audioBufferSourceNode.connect(mediaStreamAudioDestinationNode);
        audioBufferSourceNode.start();

        mediaStreamAudioSourceNode.connect(audioWorkletNode);
    });
});
