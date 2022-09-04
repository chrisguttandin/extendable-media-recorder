// @todo TypeScript does not include type definitions for the MediaStream Recording specification yet.
export interface IBlobEvent extends Event {
    readonly data: Blob;

    /*
     * Bug #18: Firefox does not yet support the timecode property.
     * readonly timecode: number;
     */
}
