describe('BlobEvent', () => {
    // bug #14

    it('should not be implemented', () => {
        // eslint-disable-next-line no-undef
        if (process.env.CI) {
            expect(typeof BlobEvent).to.not.equal('undefined');
        } else {
            expect(typeof BlobEvent).to.equal('undefined');
        }
    });
});
