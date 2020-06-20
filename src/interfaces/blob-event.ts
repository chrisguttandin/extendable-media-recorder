export interface IBlobEvent extends Event {
    readonly data: Blob;

    // @todo readonly timecode: number;
}
