import { IMediaFormatRecorder } from './media-format-recorder';

export interface IMediaEncoder {

    start (mediaStream: MediaStream): IMediaFormatRecorder;

}
