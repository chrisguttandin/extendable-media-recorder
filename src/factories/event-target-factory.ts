import { TEventTargetFactoryFactory } from '../types';

export const createEventTargetFactory: TEventTargetFactoryFactory = (window) => {
    return () => {
        if (window === null) {
            throw new Error('A native EventTarget could not be created.');
        }

        return window.document.createElement('p');
    };
};
