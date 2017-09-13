import { IMediaRecorderOptions } from './media-recorder-options';
import { INativeMediaRecorder } from './native-media-recorder';

export interface INativeMediaRecorderConstructor {

    new (stream: MediaStream, options: IMediaRecorderOptions): INativeMediaRecorder;

    isTypeSupported (mimeType: string): boolean;

}
