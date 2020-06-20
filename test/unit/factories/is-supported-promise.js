import { createIsSupportedPromise } from '../../../src/factories/is-supported-promise';

describe('createIsSupportedPromise()', () => {
    let fakeWindow;

    beforeEach(() => {
        fakeWindow = { MediaStream: 'a fake MediaStream constructor' };
    });

    it('should resolve to true if all test pass', () => {
        return createIsSupportedPromise(fakeWindow).then((isSupported) => expect(isSupported).to.be.true);
    });

    it('should resolve to false if the window contains no MediaStream constructor', () => {
        delete fakeWindow.MediaStream;

        return createIsSupportedPromise(fakeWindow).then((isSupported) => expect(isSupported).to.be.false);
    });
});
