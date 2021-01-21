import { TNativeMediaRecorderConstructorFactory } from '../types';

export const createNativeMediaRecorderConstructor: TNativeMediaRecorderConstructorFactory = (window) => {
    if (window === null) {
        return null;
    }

    return window.MediaRecorder === undefined ? null : window.MediaRecorder;
};
