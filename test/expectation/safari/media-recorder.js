describe('MediaRecorder', () => {

    describe('isTypeSupported', () => {

        // bug #10

        it('should not be implemented', () => {
            expect(MediaRecorder.isTypeSupported).to.be.undefined;
        });

    });

});
