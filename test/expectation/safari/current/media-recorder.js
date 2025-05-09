describe('MediaRecorder', () => {
    describe('isTypeSupported()', () => {
        // #23

        it('should not support audio/mp4 with alac as codec', () => {
            expect(MediaRecorder.isTypeSupported('audio/mp4; codecs=alac')).to.be.false;
        });
    });
});
