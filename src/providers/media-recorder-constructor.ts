import { OpaqueToken } from '@angular/core';
import { IMediaRecorder, IMediaRecorderConstructor, IMediaRecorderOptions } from '../interfaces';
import { encoders } from './encoders';
import { nativeMediaRecorderConstructor } from './native-media-recorder-constructor';

export const mediaRecorderConstructor = new OpaqueToken('MEDIA_RECORDER_CONSTRUCTOR');

export const MEDIA_RECORDER_CONSTRUCTOR_PROVIDER = {
    deps: [
        encoders,
        nativeMediaRecorderConstructor
    ],
    provide: mediaRecorderConstructor,
    useFactory: (
        ncdrs,
        NativeMediaRecorder // tslint:disable-line:variable-name
    ): IMediaRecorderConstructor => {
        class MediaRecorder implements IMediaRecorder {

            private _extendedEncoder;

            private _extendedRecorder;

            private _listeners: Map<string, Set<Function>>;

            private _nativeMediaRecorder;

            private _stream;

            constructor (stream: MediaStream, options: IMediaRecorderOptions) {
                const { mimeType } = options;

                if (mimeType === undefined || NativeMediaRecorder.isTypeSupported(mimeType)) {
                    this._extendedEncoder = null;
                    this._listeners = null;
                    this._nativeMediaRecorder = new NativeMediaRecorder(stream, options);
                    this._stream = null;
                } else {
                    const extendedEncoder = ncdrs.find((encoder) => encoder.isTypeSupported(mimeType));

                    if (extendedEncoder === undefined) {
                        throw new Error(''); // @todo
                    }

                    this._extendedEncoder = extendedEncoder;
                    this._listeners = new Map();
                    this._nativeMediaRecorder = null;
                    this._stream = stream;
                }

                this._extendedRecorder = null;
            }

            public addEventListener (type: string, listener: (event: Event) => {}): void {
                if (this._nativeMediaRecorder !== null) {
                    return this._nativeMediaRecorder.addEventListener(type, listener);
                }

                if (this._listeners.has(type)) {
                    this._listeners.get(type).add(listener);
                } else {
                    this._listeners.set(type, new Set([ listener ]));
                }
            }

            public dispatchEvent (event: Event): boolean {
                return true;
            }

            public removeEventListener (type: string, listener: (event: Event) => {}): void {
                if (this._nativeMediaRecorder !== null) {
                    return this._nativeMediaRecorder.removeEventListener(type, listener);
                }

                if (this._listeners.has(type)) {
                    const listeners = this._listeners.get(type);

                    listeners.delete(listener);

                    if (listeners.size === 0) {
                        this._listeners.delete(type);
                    }
                }
            }

            public start () {
                if (this._nativeMediaRecorder !== null) {
                    return this._nativeMediaRecorder.start();
                }

                this._extendedRecorder = this._extendedEncoder.start(this._stream);
            }

            public stop () {
                if (this._nativeMediaRecorder !== null) {
                    return this._nativeMediaRecorder.stop();
                }

                this._extendedRecorder
                    .stop()
                    .then((arrayBuffer) => {
                        if (this._listeners.has('dataavailable')) {
                            const listeners = this._listeners.get('dataavailable');

                            if (listeners) {
                                listeners.forEach((listener) => listener({ data: arrayBuffer }));
                            }
                        }
                    });
            }

            public static isTypeSupported (mimeType: string): boolean {
                return NativeMediaRecorder.isTypeSupported(mimeType) ||
                    ncdrs.some((encoder) => encoder.isTypeSupported(mimeType));
            }

        }

        return MediaRecorder;
    }
};
