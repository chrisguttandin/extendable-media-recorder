import { createMediaStreamWithAudioTrack } from './create-media-stream-with-audio-track';

export const recordAboutASecondOfAudio = (audioContext) =>
    new Promise(async (resolve) => {
        const mediaStream = await createMediaStreamWithAudioTrack(audioContext);
        const mediaRecorder = new MediaRecorder(mediaStream);

        mediaRecorder.start(1);

        setTimeout(() => {
            let callsWhileBeingInactive = 0;

            mediaRecorder.ondataavailable = () => {
                if (mediaRecorder.state === 'inactive') {
                    callsWhileBeingInactive += 1;
                }
            };
            mediaRecorder.stop();

            setTimeout(() => {
                resolve(callsWhileBeingInactive);

                mediaStream.getTracks().forEach((track) => track.stop());
            }, 1000);
        }, Math.random() * 1000);
    });
