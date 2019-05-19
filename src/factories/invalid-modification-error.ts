import { TInvalidModificationErrorFactory } from '../types';

export const createInvalidModificationError: TInvalidModificationErrorFactory = (message = '') => {
    try {
        return new DOMException(message, 'InvalidModificationError');
    } catch (err) {
        // @todo Edge is the only browser that does not yet allow to construct a DOMException.
        err.code = 13;
        err.message = message;
        err.name = 'InvalidModificationError';

        return err;
    }
};
