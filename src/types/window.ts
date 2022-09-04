import { TNativeBlobEventConstructor } from './native-blob-event-constructor';
import { TNativeMediaRecorderConstructor } from './native-media-recorder-constructor';

export type TWindow = Window &
    typeof globalThis & {
        BlobEvent?: TNativeBlobEventConstructor;
        MediaRecorder?: TNativeMediaRecorderConstructor;
    };
