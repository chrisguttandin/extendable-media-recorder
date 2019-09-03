import { IMediaRecorder, IMediaRecorderOptions } from '../interfaces';
import { TMediaRecorderConstructorFactory, TNativeMediaRecorder, TRecordingState } from '../types';

export const createMediaRecorderConstructor: TMediaRecorderConstructorFactory = (
    createNativeMediaRecorder,
    createNotSupportedError,
    createWebAudioMediaRecorder,
    encoderRegexes,
    nativeMediaRecorderConstructor
) => {

    return class MediaRecorder implements IMediaRecorder {

        private _internalMediaRecorder: IMediaRecorder | TNativeMediaRecorder;

        constructor (stream: MediaStream, options: IMediaRecorderOptions = { }) {
            const { mimeType } = options;

            if ((nativeMediaRecorderConstructor !== null)
                    && (mimeType === undefined || nativeMediaRecorderConstructor.isTypeSupported(mimeType))) {
                this._internalMediaRecorder = createNativeMediaRecorder(nativeMediaRecorderConstructor, stream, options);
            } else if (mimeType !== undefined && encoderRegexes.some((regex) => regex.test(mimeType))) {
                this._internalMediaRecorder = createWebAudioMediaRecorder(stream, mimeType);
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

        public addEventListener (type: string, listener: (event: Event) => void): void {
            return this._internalMediaRecorder.addEventListener(type, listener);
        }

        public dispatchEvent (_: Event): boolean {
            return true;
        }

        public removeEventListener (type: string, listener: (event: Event) => void): void {
            return this._internalMediaRecorder.removeEventListener(type, listener);
        }

        public start (): void {
            return this._internalMediaRecorder.start();
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
