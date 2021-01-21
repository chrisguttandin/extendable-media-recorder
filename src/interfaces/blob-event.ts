// @todo TypeScript does not include type definitions for the MediaStream Recording specification yet.
export interface IBlobEvent extends Event {
    readonly data: Blob;

    // @todo readonly timecode: number;
}
