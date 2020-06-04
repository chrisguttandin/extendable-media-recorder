import { IMediaRecorder, IMediaRecorderOptions } from '../interfaces';
import {
    TBlobEventHandler,
    TErrorEventHandler,
    TMediaRecorderConstructorFactory,
    TNativeEventTarget,
    TRecordingState
} from '../types';

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

        private _internalMediaRecorder: Omit<IMediaRecorder, 'ondataavailable' | 'onerror' | keyof TNativeEventTarget>;

        private _ondataavailable: null | [ TBlobEventHandler<this>, TBlobEventHandler<this> ];

        private _onerror: null | [ TErrorEventHandler<this>, TErrorEventHandler<this> ];

        constructor (stream: MediaStream, options: IMediaRecorderOptions = { }) {
            const { mimeType } = options;

            if ((nativeMediaRecorderConstructor !== null)
                    && (mimeType === undefined || nativeMediaRecorderConstructor.isTypeSupported(mimeType))) {
                const internalMediaRecorder = createNativeMediaRecorder(nativeMediaRecorderConstructor, stream, options);

                super(internalMediaRecorder);

                this._internalMediaRecorder = internalMediaRecorder;
            } else if (mimeType !== undefined && encoderRegexes.some((regex) => regex.test(mimeType))) {
                super();

                if (nativeMediaRecorderConstructor !== null && nativeMediaRecorderConstructor.isTypeSupported('audio/webm;codecs=pcm')) {
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

            this._ondataavailable = null;
            this._onerror = null;
        }

        get mimeType (): string {
            return this._internalMediaRecorder.mimeType;
        }

        get ondataavailable (): null | TBlobEventHandler<this> {
            return this._ondataavailable === null ? this._ondataavailable : this._ondataavailable[0];
        }

        set ondataavailable (value) {
            if (this._ondataavailable !== null) {
                (<IMediaRecorder> this).removeEventListener('dataavailable', this._ondataavailable[1]);
            }

            if (typeof value === 'function') {
                const boundListener = value.bind(this);

                (<IMediaRecorder> this).addEventListener('dataavailable', boundListener);

                this._ondataavailable = [ value, boundListener ];
            } else {
                this._ondataavailable = null;
            }
        }

        get onerror (): null | TErrorEventHandler<this> {
            return this._onerror === null ? this._onerror : this._onerror[0];
        }

        set onerror (value) {
            if (this._onerror !== null) {
                (<IMediaRecorder> this).removeEventListener('error', this._onerror[1]);
            }

            if (typeof value === 'function') {
                const boundListener = value.bind(this);

                (<IMediaRecorder> this).addEventListener('error', boundListener);

                this._onerror = [ value, boundListener ];
            } else {
                this._onerror = null;
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
                encoderRegexes.some((regex) => regex.test(mimeType));
        }

    };

};
