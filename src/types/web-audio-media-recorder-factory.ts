import { IMediaRecorder } from '../interfaces';

export type TWebAudioMediaRecorderFactory = (mediaStream: MediaStream, mimeType: string) => IMediaRecorder;
