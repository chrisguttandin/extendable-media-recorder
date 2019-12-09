import { MediaRecorder, isSupported, register } from '../../src/module';

describe('module', () => {

    it('should export the MediaRecorder constructor', () => {
        expect(MediaRecorder).to.be.a('function');
    });

    it('should export the isSupported function', () => {
        expect(isSupported).to.be.a('function');
    });

    it('should export the register function', () => {
        expect(register).to.be.a('function');
    });

});
