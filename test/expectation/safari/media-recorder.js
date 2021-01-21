describe('BlobEvent', () => {
    // bug #14

    it('should not be implemented', () => {
        expect(typeof BlobEvent).to.equal('undefined');
    });
});

describe('MediaRecorder', () => {
    // bug #11

    it('should not be implemented', () => {
        expect(typeof MediaRecorder).to.equal('undefined');
    });
});
