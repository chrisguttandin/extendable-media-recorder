// @todo TypeScript does not include type definitions for the MediaStream Recording specification yet.
export interface IMediaRecorderOptions {
    audioBitsPerSecond?: number;

    bitsPerSecond?: number;

    mimeType?: string;

    videoBitsPerSecond?: number;
}
