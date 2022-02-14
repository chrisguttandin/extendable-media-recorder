import { IMediaRecorder, IMediaRecorderEventMap, IMediaRecorderOptions } from '../interfaces';
import {
    TBlobEventHandler,
    TErrorEventHandler,
    TEventHandler,
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
    return class MediaRecorder extends eventTargetConstructor<IMediaRecorderEventMap> implements IMediaRecorder {
        private _internalMediaRecorder: Omit<
            IMediaRecorder,
            'ondataavailable' | 'onerror' | 'onpause' | 'onresume' | 'onstart' | 'onstop' | keyof TNativeEventTarget
        >;

        private _ondataavailable: null | [TBlobEventHandler<this>, TBlobEventHandler<this>];

        private _onerror: null | [TErrorEventHandler<this>, TErrorEventHandler<this>];

        private _onpause: null | [TEventHandler<this>, TEventHandler<this>];

        private _onresume: null | [TEventHandler<this>, TEventHandler<this>];

        private _onstart: null | [TEventHandler<this>, TEventHandler<this>];

        private _onstop: null | [TEventHandler<this>, TEventHandler<this>];

        constructor(stream: MediaStream, options: IMediaRecorderOptions = {}) {
            const { mimeType } = options;

            if (
                nativeMediaRecorderConstructor !== null &&
                // Bug #10: Safari does not yet implement the isTypeSupported() method.
                (mimeType === undefined ||
                    (nativeMediaRecorderConstructor.isTypeSupported !== undefined &&
                        nativeMediaRecorderConstructor.isTypeSupported(mimeType)))
            ) {
                const internalMediaRecorder = createNativeMediaRecorder(nativeMediaRecorderConstructor, stream, options);

                super(internalMediaRecorder);

                this._internalMediaRecorder = internalMediaRecorder;
            } else if (mimeType !== undefined && encoderRegexes.some((regex) => regex.test(mimeType))) {
                super();

                // Bug #10: Safari does not yet implement the isTypeSupported() method.
                if (
                    nativeMediaRecorderConstructor !== null &&
                    nativeMediaRecorderConstructor.isTypeSupported !== undefined &&
                    nativeMediaRecorderConstructor.isTypeSupported('audio/webm;codecs=pcm')
                ) {
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
            this._onpause = null;
            this._onresume = null;
            this._onstart = null;
            this._onstop = null;
        }

        get mimeType(): string {
            return this._internalMediaRecorder.mimeType;
        }

        get ondataavailable(): null | TBlobEventHandler<this> {
            return this._ondataavailable === null ? this._ondataavailable : this._ondataavailable[0];
        }

        set ondataavailable(value) {
            if (this._ondataavailable !== null) {
                this.removeEventListener('dataavailable', this._ondataavailable[1]);
            }

            if (typeof value === 'function') {
                const boundListener = value.bind(this);

                this.addEventListener('dataavailable', boundListener);

                this._ondataavailable = [value, boundListener];
            } else {
                this._ondataavailable = null;
            }
        }

        get onerror(): null | TErrorEventHandler<this> {
            return this._onerror === null ? this._onerror : this._onerror[0];
        }

        set onerror(value) {
            if (this._onerror !== null) {
                this.removeEventListener('error', this._onerror[1]);
            }

            if (typeof value === 'function') {
                const boundListener = value.bind(this);

                this.addEventListener('error', boundListener);

                this._onerror = [value, boundListener];
            } else {
                this._onerror = null;
            }
        }

        get onpause(): null | TEventHandler<this> {
            return this._onpause === null ? this._onpause : this._onpause[0];
        }

        set onpause(value) {
            if (this._onpause !== null) {
                this.removeEventListener('pause', this._onpause[1]);
            }

            if (typeof value === 'function') {
                const boundListener = value.bind(this);

                this.addEventListener('pause', boundListener);

                this._onpause = [value, boundListener];
            } else {
                this._onpause = null;
            }
        }

        get onresume(): null | TEventHandler<this> {
            return this._onresume === null ? this._onresume : this._onresume[0];
        }

        set onresume(value) {
            if (this._onresume !== null) {
                this.removeEventListener('resume', this._onresume[1]);
            }

            if (typeof value === 'function') {
                const boundListener = value.bind(this);

                this.addEventListener('resume', boundListener);

                this._onresume = [value, boundListener];
            } else {
                this._onresume = null;
            }
        }

        get onstart(): null | TEventHandler<this> {
            return this._onstart === null ? this._onstart : this._onstart[0];
        }

        set onstart(value) {
            if (this._onstart !== null) {
                this.removeEventListener('start', this._onstart[1]);
            }

            if (typeof value === 'function') {
                const boundListener = value.bind(this);

                this.addEventListener('start', boundListener);

                this._onstart = [value, boundListener];
            } else {
                this._onstart = null;
            }
        }

        get onstop(): null | TEventHandler<this> {
            return this._onstop === null ? this._onstop : this._onstop[0];
        }

        set onstop(value) {
            if (this._onstop !== null) {
                this.removeEventListener('stop', this._onstop[1]);
            }

            if (typeof value === 'function') {
                const boundListener = value.bind(this);

                this.addEventListener('stop', boundListener);

                this._onstop = [value, boundListener];
            } else {
                this._onstop = null;
            }
        }

        get state(): TRecordingState {
            return this._internalMediaRecorder.state;
        }

        public pause(): void {
            return this._internalMediaRecorder.pause();
        }

        public resume(): void {
            return this._internalMediaRecorder.resume();
        }

        public start(timeslice?: number): void {
            return this._internalMediaRecorder.start(timeslice);
        }

        public stop(): void {
            return this._internalMediaRecorder.stop();
        }

        public static isTypeSupported(mimeType: string): boolean {
            return (
                (nativeMediaRecorderConstructor !== null &&
                    // Bug #10: Safari does not yet implement the isTypeSupported() method.
                    nativeMediaRecorderConstructor.isTypeSupported !== undefined &&
                    nativeMediaRecorderConstructor.isTypeSupported(mimeType)) ||
                encoderRegexes.some((regex) => regex.test(mimeType))
            );
        }
    };
};
