import { IMediaEncoder } from '../interfaces';

export type TMediaEncoderFactory = (mediaStream: MediaStream, mimeType: string) => IMediaEncoder;
