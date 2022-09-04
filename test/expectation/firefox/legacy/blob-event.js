describe('BlobEvent', () => {
    // bug #18

    it('should not have a timecode property', () => {
        const blobEvent = new BlobEvent('dataavailable', { data: new Blob([]), timecode: 123 });

        expect(blobEvent.timecode).to.be.undefined;
    });
});
