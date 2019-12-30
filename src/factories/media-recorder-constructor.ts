import { IMediaRecorder, IMediaRecorderOptions } from '../interfaces';
import { TMediaRecorderConstructorFactory, TNativeEventTarget, TNativeMediaRecorder, TRecordingState } from '../types';

export const createMediaRecorderConstructor: TMediaRecorderConstructorFactory = (
    createNativeMediaRecorder,
    createNotSupportedError,
    createWebAudioMediaRecorder,
    createWebmPcmMediaRecorder,
    encoderRegexes,
    eventTargetConstructor,
    nativeMediaRecorderConstructor
) => {

    return class MediaRecorder implements IMediaRecorder {

        private _eventTarget: TNativeEventTarget;

        private _internalMediaRecorder: IMediaRecorder | TNativeMediaRecorder;

        constructor (stream: MediaStream, options: IMediaRecorderOptions = { }) {
            const { mimeType } = options;

            if ((nativeMediaRecorderConstructor !== null)
                    && (mimeType === undefined || nativeMediaRecorderConstructor.isTypeSupported(mimeType))) {
                this._internalMediaRecorder = createNativeMediaRecorder(nativeMediaRecorderConstructor, stream, options);
                this._eventTarget = new eventTargetConstructor(this._internalMediaRecorder);
            } else if (mimeType !== undefined && encoderRegexes.some((regex) => regex.test(mimeType))) {
                this._eventTarget = new eventTargetConstructor();

                if (nativeMediaRecorderConstructor !== null && nativeMediaRecorderConstructor.isTypeSupported('audio/webm; codecs=pcm')) {
                    this._internalMediaRecorder = createWebmPcmMediaRecorder(
                        this._eventTarget,
                        nativeMediaRecorderConstructor,
                        stream,
                        mimeType
                    );
                } else {
                    this._internalMediaRecorder = createWebAudioMediaRecorder(this._eventTarget, stream, mimeType);
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

        public addEventListener (type: string, listener: (event: Event) => void): void {
            return this._eventTarget.addEventListener(type, listener);
        }

        public dispatchEvent (event: Event): boolean {
            return this._eventTarget.dispatchEvent(event);
        }

        public removeEventListener (type: string, listener: (event: Event) => void): void {
            return this._eventTarget.removeEventListener(type, listener);
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
