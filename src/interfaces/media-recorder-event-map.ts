import { IBlobEvent } from './blob-event';

// @todo TypeScript does not include type definitions for the MediaStream Recording specification yet.
export interface IMediaRecorderEventMap {
    dataavailable: IBlobEvent;

    // @todo This should fire a MediaRecorderErrorEvent.
    error: ErrorEvent;

    pause: Event;

    resume: Event;

    start: Event;

    stop: Event;
}
