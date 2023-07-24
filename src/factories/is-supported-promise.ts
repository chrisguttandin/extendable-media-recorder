import { TIsSupportedPromiseFactory } from '../types';

export const createIsSupportedPromise: TIsSupportedPromiseFactory = (window) => {
    if (
        window !== null &&
        // Bug #14: Before v14.1 Safari did not support the BlobEvent.
        window.BlobEvent !== undefined &&
        window.MediaStream !== undefined &&
        /*
         * Bug #10: An early experimental implemenation in Safari did not provide the isTypeSupported() function.
         */
        (window.MediaRecorder === undefined || window.MediaRecorder.isTypeSupported !== undefined)
    ) {
        // Bug #11 Safari does not yet support the MediaRecorder but that isn't tested here.
        if (window.MediaRecorder === undefined) {
            return Promise.resolve(true);
        }

        const canvasElement = window.document.createElement('canvas');

        // @todo https://bugzilla.mozilla.org/show_bug.cgi?id=1388974
        canvasElement.getContext('2d');

        if (typeof canvasElement.captureStream !== 'function') {
            return Promise.resolve(false);
        }

        const mediaStream = canvasElement.captureStream();

        return Promise.all([
            /*
             * Bug #5: Up until v70 Firefox did emit a blob of type video/webm when asked to encode a MediaStream with a video track into an
             * audio codec.
             */
            new Promise((resolve) => {
                const mimeType = 'audio/webm';

                try {
                    const mediaRecorder = new window.MediaRecorder(mediaStream, { mimeType });

                    mediaRecorder.addEventListener('dataavailable', ({ data }) => resolve(data.type === mimeType));
                    mediaRecorder.start();

                    setTimeout(() => mediaRecorder.stop(), 10);
                } catch (err) {
                    resolve(err.name === 'NotSupportedError');
                }
            }),
            /*
             * Bug #1 & #2: Up until v83 Firefox fired an error event with an UnknownError when adding or removing a track.
             */
            new Promise((resolve) => {
                const mediaRecorder = new window.MediaRecorder(mediaStream);

                mediaRecorder.addEventListener('error', (event) => {
                    resolve(
                        'error' in event &&
                            event.error !== null &&
                            typeof event.error === 'object' &&
                            'name' in event.error &&
                            event.error.name !== 'UnknownError'
                    );
                    mediaRecorder.stop();
                });
                mediaRecorder.start();
                mediaStream.removeTrack(mediaStream.getVideoTracks()[0]);
            })
        ]).then((results) => results.every((result) => result));
    }

    return Promise.resolve(false);
};
