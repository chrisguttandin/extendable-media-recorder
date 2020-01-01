import { IBlobEvent, IMediaRecorder } from '../interfaces';

export type TDataavailableEventHandler = (this: IMediaRecorder, event: IBlobEvent) => void;
