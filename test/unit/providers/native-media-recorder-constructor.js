import 'core-js/es7/reflect';
import { NATIVE_MEDIA_RECORDER_CONSTRUCTOR_PROVIDER, nativeMediaRecorderConstructor } from '../../../src/providers/native-media-recorder-constructor';
import { ReflectiveInjector } from '@angular/core';
import { window } from '../../../src/providers/window';

describe('UnpatchedMediaRecorder', () => {

    let MediaRecorder;

    beforeEach(() => {
        MediaRecorder = 'a fake MediaRecorder';
    });

    it('should return null if there is no MediaRecorder', () => {
        const fakeWindow = {};

        const injector = ReflectiveInjector.resolveAndCreate([
            NATIVE_MEDIA_RECORDER_CONSTRUCTOR_PROVIDER,
            { provide: window, useValue: fakeWindow }
        ]);

        expect(injector.get(nativeMediaRecorderConstructor)).to.equal(null);
    });

    it('should return the MediaRecorder', () => {
        const fakeWindow = {
            MediaRecorder
        };

        const injector = ReflectiveInjector.resolveAndCreate([
            NATIVE_MEDIA_RECORDER_CONSTRUCTOR_PROVIDER,
            { provide: window, useValue: fakeWindow }
        ]);

        expect(injector.get(nativeMediaRecorderConstructor)).to.equal(MediaRecorder);
    });

});
