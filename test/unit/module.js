import { MediaRecorder, isSupported } from '../../src/module';

describe('module', () => {

    it('should export the MediaRecorder constructor', () => {
        expect(MediaRecorder).to.be.a('function');
    });

    it('should export the isSupported promise', () => {
        expect(isSupported).to.be.an.instanceof(Promise);
    });

});
