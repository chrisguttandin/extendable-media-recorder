import { IMediaEncoder } from '../interfaces';

export type TMediaEncoderFactory = (mimeType: string) => IMediaEncoder;
