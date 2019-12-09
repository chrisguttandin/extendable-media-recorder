import { TIsSupportedPromiseFactory } from '../types';

export const createIsSupportedPromise: TIsSupportedPromiseFactory = (window) => {
    if (window !== null && window.hasOwnProperty('MediaStream')) {
        /*
         * Bug #5: Up until v70 Firefox did emit a blob of type video/webm when asked to encode a MediaStream with a video track into an
         * audio codec.
         */
        return new Promise((resolve) => {
            const canvasElement = document.createElement('canvas');

            // @todo https://bugzilla.mozilla.org/show_bug.cgi?id=1388974
            canvasElement.getContext('2d');

            const mediaStream = canvasElement.captureStream();
            const mimeType = 'audio/webm';
            const mediaRecorder = new MediaRecorder(mediaStream, { mimeType });

            mediaRecorder.addEventListener('dataavailable', ({ data }) => resolve(data.type === mimeType));

            try {
                mediaRecorder.start();

                setTimeout(() => mediaRecorder.stop(), 10);
            } catch (err) {
                resolve(err.name === 'NotSupportedError');
            }
        });
    }

    return Promise.resolve(false);
};
