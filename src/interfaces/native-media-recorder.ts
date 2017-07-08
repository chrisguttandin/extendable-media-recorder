// @todo Define the complete interface.
export interface INativeMediaRecorder extends EventTarget {

    start (timeslice?: number): void;

    stop (): void;

}
