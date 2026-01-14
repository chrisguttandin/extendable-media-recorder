import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AudioContext } from 'standardized-audio-context';
import { createMediaStreamWithAudioTrack } from '../../../helpers/create-media-stream-with-audio-track';
import { resumeAudioContext } from '../../../helpers/resume-audio-context';

describe('MediaRecorder', () => {
    describe('with a MediaStream which contains an audio track', () => {
        let audioContext;
        let mediaRecorder;
        let mediaStream;

        afterEach(() => {
            audioContext.close();
            mediaStream.getTracks().forEach((track) => track.stop());
        });

        beforeEach(async () => {
            audioContext = new AudioContext();

            await resumeAudioContext(audioContext);

            mediaStream = await createMediaStreamWithAudioTrack(audioContext);
            mediaRecorder = new MediaRecorder(mediaStream);
        });

        // bug #26

        it('should emit chunks of at least about a second', () => {
            const { promise, resolve } = Promise.withResolvers();
            const chunks = [];

            let maximumSize = Number.NEGATIVE_INFINITY;
            let minimumSize = Number.POSITIVE_INFINITY;

            mediaRecorder.addEventListener('dataavailable', ({ data }) => {
                chunks.push(data);

                const { size } = data;

                maximumSize = Math.max(maximumSize, size);
                minimumSize = Math.min(minimumSize, size);

                if (mediaRecorder.state === 'inactive') {
                    expect(chunks.length).to.equal(5);
                    expect(minimumSize / maximumSize).to.be.above(0.75);

                    resolve();
                }
            });
            mediaRecorder.start(100);

            setTimeout(() => mediaRecorder.stop(), 5000);

            return promise;
        });
    });

    describe('isTypeSupported()', () => {
        // bug #28

        it('should not support audio/aac', () => {
            expect(MediaRecorder.isTypeSupported('audio/aac')).to.be.false;
        });

        // bug #27

        it('should not support audio/ogg', () => {
            expect(MediaRecorder.isTypeSupported('audio/ogg')).to.be.false;
        });
    });
});
