import { IBlobEvent } from './blob-event';

export interface IMediaRecorderEventMap {

    dataavailable: IBlobEvent;

    // @todo This should fire a MediaRecorderErrorEvent.
    error: ErrorEvent;

    pause: Event;

    resume: Event;

    start: Event;

    stop: Event;

}
