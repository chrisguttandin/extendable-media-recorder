describe('MediaRecorder', () => {
    describe('isTypeSupported', () => {
        // bug #11

        it('should not be implemented', () => {
            expect(typeof MediaRecorder).to.equal('undefined');
        });
    });
});
