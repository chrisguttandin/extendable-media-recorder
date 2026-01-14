import { AudioContext, GainNode, MediaStreamAudioDestinationNode, OscillatorNode } from 'standardized-audio-context';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMediaStreamWithAudioTrack } from '../../../helpers/create-media-stream-with-audio-track';

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
            mediaStream = await createMediaStreamWithAudioTrack(audioContext);
            mediaRecorder = new MediaRecorder(mediaStream);
        });

        // bug #12

        it('should fire an error event which is not an instance of ErrorEvent when adding a track', () => {
            const { promise, resolve } = Promise.withResolvers();

            mediaRecorder.addEventListener('error', (event) => {
                expect(event instanceof ErrorEvent).to.be.false;

                resolve();
            });
            mediaRecorder.start();

            createMediaStreamWithAudioTrack(audioContext).then((anotherMediaStream) =>
                mediaStream.addTrack(anotherMediaStream.getAudioTracks()[0])
            );

            return promise;
        });

        // bug #13

        it('should fire an error event which is not an instance of ErrorEvent when removing a track', () => {
            const { promise, resolve } = Promise.withResolvers();

            mediaRecorder.addEventListener('error', (event) => {
                expect(event instanceof ErrorEvent).to.be.false;

                resolve();
            });
            mediaRecorder.start();

            setTimeout(() => {
                mediaStream.removeTrack(mediaStream.getAudioTracks()[0]);
            }, 1000);

            return promise;
        });
    });

    describe('with a MediaStream which contains a silent audio track', () => {
        let audioContext;
        let gainNode;
        let mediaRecorder;
        let mediaStream;
        let mediaStreamAudioDestinationNode;
        let oscillatorNode;

        afterEach(() => {
            gainNode.disconnect(mediaStreamAudioDestinationNode);
            oscillatorNode.disconnect(gainNode);
            oscillatorNode.stop();
            audioContext.close();
            mediaStream.getTracks().forEach((track) => track.stop());
        });

        beforeEach(() => {
            audioContext = new AudioContext();
            gainNode = new GainNode(audioContext, { gain: 0 });
            mediaStreamAudioDestinationNode = new MediaStreamAudioDestinationNode(audioContext);
            mediaStream = mediaStreamAudioDestinationNode.stream;
            mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/ogg' });
            oscillatorNode = new OscillatorNode(audioContext);

            oscillatorNode.connect(gainNode).connect(mediaStreamAudioDestinationNode);
            oscillatorNode.start();
        });

        describe(`with a MediaRecorder that was started before`, () => {
            beforeEach(async () => {
                await new Promise((resolve) => {
                    mediaRecorder.onstop = () => {
                        mediaRecorder.onstop = null;

                        resolve();
                    };

                    mediaRecorder.start();
                    mediaRecorder.stop();
                });
            });

            // bug #29

            it('should dispatch no dataavailable event while being recording', () => {
                const { promise, resolve } = Promise.withResolvers();

                let numberOfChunks = 0;

                mediaRecorder.ondataavailable = () => {
                    numberOfChunks += 1;

                    if (mediaRecorder.state === 'inactive') {
                        mediaRecorder.ondataavailable = null;

                        expect(numberOfChunks).to.equal(1);

                        resolve();
                    }
                };
                mediaRecorder.start(100);

                setTimeout(() => mediaRecorder.stop(), 5000);

                return promise;
            });
        });
    });

    describe('isTypeSupported()', () => {
        // bug #28

        it('should not support audio/aac', () => {
            expect(MediaRecorder.isTypeSupported('audio/aac')).to.be.false;
        });

        // bug #21

        it('should not support audio/mp4', () => {
            expect(MediaRecorder.isTypeSupported('audio/mp4')).to.be.false;
        });
    });
});
