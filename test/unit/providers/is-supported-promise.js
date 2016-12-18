import 'core-js/es7/reflect';
import { IS_SUPPORTED_PROMISE_PROVIDER, isSupportedPromise } from '../../../src/providers/is-supported-promise';
import { ReflectiveInjector } from '@angular/core';
import { window } from '../../../src/providers/window';

describe('isSupportedPromise', () => {

    let fakeWindow;
    let injector;

    beforeEach(() => {
        fakeWindow = { MediaStream: 'a fake MediaStream constructor' };

        injector = ReflectiveInjector.resolveAndCreate([
            IS_SUPPORTED_PROMISE_PROVIDER,
            { provide: window, useValue: fakeWindow }
        ]);
    });

    it('should resolve to true if all test pass', () => {
        return injector
            .get(isSupportedPromise)
            .then((isSupported) => expect(isSupported).to.be.true);
    });

    it('should resolve to false if the window contains no MediaStream constructor', () => {
        delete fakeWindow.MediaStream;

        return injector
            .get(isSupportedPromise)
            .then((isSupported) => expect(isSupported).to.be.false);
    });

});
