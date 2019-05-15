import { IMediaEncoder, IMediaFormatRecorder, IMediaRecorder, IMediaRecorderOptions } from '../interfaces';
import { TMediaRecorderConstructorFactory, TNativeMediaRecorder } from '../types';
// @todo This should be injected and not imported.
import { createMediaEncoder } from './media-encoder';

export const createMediaRecorderConstructor: TMediaRecorderConstructorFactory = (encoderRegexes, nativeMediaRecorderConstructor) => {

    return class MediaRecorder implements IMediaRecorder {

        private _extendedEncoder: null | IMediaEncoder;

        private _extendedRecorder: null | IMediaFormatRecorder;

        private _listeners: null | Map<string, Set<Function>>;

        private _nativeMediaRecorder: null | TNativeMediaRecorder;

        constructor (stream: MediaStream, options: IMediaRecorderOptions = { }) {
            const { mimeType } = options;

            if ((nativeMediaRecorderConstructor !== null) &&
                    (mimeType === undefined || nativeMediaRecorderConstructor.isTypeSupported(mimeType))) {
                this._extendedEncoder = null;
                this._listeners = null;
                this._nativeMediaRecorder = new nativeMediaRecorderConstructor(stream, options);
            } else if (mimeType !== undefined) {
                if (encoderRegexes.every((regex) => !regex.test(mimeType))) {
                    throw new Error(''); // @todo
                }

                this._extendedEncoder = createMediaEncoder(stream, mimeType);
                this._listeners = new Map();
                this._nativeMediaRecorder = null;
            } else {
                throw new Error(); // @todo
            }

            this._extendedRecorder = null;
        }

        public addEventListener (type: string, listener: (event: Event) => { }): void {
            if (this._nativeMediaRecorder !== null) {
                return this._nativeMediaRecorder.addEventListener(type, listener);
            }

            if (this._listeners === null) {
                throw new Error(); // @todo
            }

            const listenersOfType = this._listeners.get(type);

            if (listenersOfType !== undefined) {
                listenersOfType.add(listener);
            } else {
                this._listeners.set(type, new Set([ listener ]));
            }
        }

        public dispatchEvent (_: Event): boolean {
            return true;
        }

        public removeEventListener (type: string, listener: (event: Event) => { }): void {
            if (this._nativeMediaRecorder !== null) {
                return this._nativeMediaRecorder.removeEventListener(type, listener);
            }

            if (this._listeners === null) {
                throw new Error(); // @todo
            }

            const listenersOfType = this._listeners.get(type);

            if (listenersOfType !== undefined) {
                listenersOfType.delete(listener);

                if (listenersOfType.size === 0) {
                    this._listeners.delete(type);
                }
            }
        }

        public start (): void {
            if (this._nativeMediaRecorder !== null) {
                return this._nativeMediaRecorder.start();
            }

            if (this._extendedEncoder === null) {
                throw new Error();
            }

            this._extendedRecorder = this._extendedEncoder.start();
        }

        public stop (): void {
            if (this._nativeMediaRecorder !== null) {
                return this._nativeMediaRecorder.stop();
            }

            if (this._extendedRecorder === null) {
                throw new Error(); // @todo
            }

            this._extendedRecorder
                .stop()
                // @todo This is blindly assuming that the array contains only one ArrayBuffer.
                .then((blob) => {
                    if (this._listeners === null) {
                        throw new Error(); // @todo
                    }

                    const listenersOfType = this._listeners.get('dataavailable');

                    if (listenersOfType !== undefined) {
                        // @todo This should dispatch a BlobEvent.
                        listenersOfType.forEach((listener) => listener({ data: blob }));
                    }
                });
        }

        public static isTypeSupported (mimeType: string): boolean {
            return (nativeMediaRecorderConstructor !== null && nativeMediaRecorderConstructor.isTypeSupported(mimeType)) ||
                encoderRegexes.some((regex) => !regex.test(mimeType));
        }

    };

};
