import { IBlobEvent } from './blob-event';

export interface IMediaRecorderEventMap extends Record<string, Event> {
    dataavailable: IBlobEvent;

    // @todo This should fire a MediaRecorderErrorEvent.
    error: ErrorEvent;

    pause: Event;

    resume: Event;

    start: Event;

    stop: Event;
}
