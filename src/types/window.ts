import { IMediaRecorderConstructor } from '../interfaces';
import { TBlobEventConstructor } from './blob-event-constructor';

export type TWindow = Window &
    typeof globalThis & {
        // @todo TypeScript does not include type definitions for the MediaStream Recording specification yet.
        BlobEvent?: TBlobEventConstructor;
        MediaRecorder?: IMediaRecorderConstructor;
    };
