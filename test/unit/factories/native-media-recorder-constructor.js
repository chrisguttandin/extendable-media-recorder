import { createNativeMediaRecorderConstructor } from '../../../src/factories/native-media-recorder-constructor';

describe('createNativeMediaRecorderConstructor()', () => {

    let fakeWindow;

    beforeEach(() => {
        fakeWindow = { a: 'fake window' };
    });

    it('should return null if there is no MediaRecorder', () => {
        expect(createNativeMediaRecorderConstructor(fakeWindow)).to.equal(null);
    });

    it('should return the MediaRecorder', () => {
        const fakeMediaRecorder = 'a fake MediaRecorder';

        fakeWindow.MediaRecorder = fakeMediaRecorder;

        expect(createNativeMediaRecorderConstructor(fakeWindow)).to.equal(fakeMediaRecorder);
    });

});
