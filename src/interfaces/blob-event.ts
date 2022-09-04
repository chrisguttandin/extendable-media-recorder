export interface IBlobEvent extends Event {
    readonly data: Blob;

    /*
     * Bug #18: Firefox does not yet support the timecode property.
     * readonly timecode: number;
     */
}
