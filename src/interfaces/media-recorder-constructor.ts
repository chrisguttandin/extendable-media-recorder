import { IMediaRecorder } from './media-recorder';
import { IMediaRecorderOptions } from './media-recorder-options';

// @todo TypeScript does not include type definitions for the MediaStream Recording specification yet.
export interface IMediaRecorderConstructor {
    new (stream: MediaStream, options?: IMediaRecorderOptions): IMediaRecorder;

    isTypeSupported(mimeType: string): boolean;
}
