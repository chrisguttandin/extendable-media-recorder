import { IMediaRecorder, IMediaRecorderOptions } from '../interfaces';
import { TMediaRecorderConstructorFactory, TNativeMediaRecorder, TRecordingState } from '../types';

export const createMediaRecorderConstructor: TMediaRecorderConstructorFactory = (
    createNativeMediaRecorder,
    createNotSupportedError,
    createWebAudioMediaRecorder,
    createWebmPcmMediaRecorder,
    encoderRegexes,
    eventTargetConstructor,
    nativeMediaRecorderConstructor
) => {

    return class MediaRecorder extends eventTargetConstructor implements IMediaRecorder {

        private _internalMediaRecorder: IMediaRecorder | TNativeMediaRecorder;

        constructor (stream: MediaStream, options: IMediaRecorderOptions = { }) {
            const { mimeType } = options;

            if ((nativeMediaRecorderConstructor !== null)
                    && (mimeType === undefined || nativeMediaRecorderConstructor.isTypeSupported(mimeType))) {
                const internalMediaRecorder = createNativeMediaRecorder(nativeMediaRecorderConstructor, stream, options);

                super(internalMediaRecorder);

                this._internalMediaRecorder = internalMediaRecorder;
            } else if (mimeType !== undefined && encoderRegexes.some((regex) => regex.test(mimeType))) {
                super();

                if (nativeMediaRecorderConstructor !== null && nativeMediaRecorderConstructor.isTypeSupported('audio/webm; codecs=pcm')) {
                    this._internalMediaRecorder = createWebmPcmMediaRecorder(this, nativeMediaRecorderConstructor, stream, mimeType);
                } else {
                    this._internalMediaRecorder = createWebAudioMediaRecorder(this, stream, mimeType);
                }
            } else {
                // This is creating a native MediaRecorder just to provoke it to throw an error.
                if (nativeMediaRecorderConstructor !== null) {
                    createNativeMediaRecorder(nativeMediaRecorderConstructor, stream, options);
                }

                throw createNotSupportedError();
            }
        }

        get state (): TRecordingState {
            return this._internalMediaRecorder.state;
        }

        public start (timeslice?: number): void {
            return this._internalMediaRecorder.start(timeslice);
        }

        public stop (): void {
            return this._internalMediaRecorder.stop();
        }

        public static isTypeSupported (mimeType: string): boolean {
            return (nativeMediaRecorderConstructor !== null && nativeMediaRecorderConstructor.isTypeSupported(mimeType)) ||
                encoderRegexes.some((regex) => !regex.test(mimeType));
        }

    };

};
