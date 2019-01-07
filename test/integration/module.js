import { MediaRecorder, register } from '../../src/module';
import { connect } from 'extendable-media-recorder-wav-encoder';

describe('module', () => {

    let audioContext;
    let bufferLength;
    let frequency;
    let mediaRecorder;

    afterEach(() => audioContext.close());

    before(async () => {
        const port = await connect();

        await register(port);
    });

    beforeEach(function (done) {
        this.timeout(3000);

        audioContext = new AudioContext();
        bufferLength = 100;
        frequency = audioContext.sampleRate / bufferLength;

        const mediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode(audioContext);
        const oscillatorNode = new OscillatorNode(audioContext, { frequency });

        oscillatorNode.connect(mediaStreamAudioDestinationNode);
        oscillatorNode.start();

        mediaRecorder = new MediaRecorder(mediaStreamAudioDestinationNode.stream, { mimeType: 'audio/wav' });

        // Wait two seconds before starting the recording.
        setTimeout(done, 2000);
    });

    it('should encode a mediaStream', function (done) {
        this.timeout(10000);

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
                        expect(rotatingBuffers[0][j]).to.not.equal(0);
                        expect(rotatingBuffers[0][j]).to.be.closeTo(rotatingBuffers[1][j], 0.0001);
                    }

                    rotatingBuffers.push(rotatingBuffers.shift());
                }
            }

            done();
        });
        mediaRecorder.start();

        setTimeout(() => mediaRecorder.stop(), 1000);
    });

});
