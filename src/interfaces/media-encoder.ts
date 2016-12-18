import { IMediaFormatRecoder } from './media-format-recoder';

export interface IMediaEncoder {

    isTypeSupported (type: string): boolean;

    start (stream: MediaStream): IMediaFormatRecoder;

};
