// @todo TypeScript does not include type definitions for the MediaStream Recording specification yet.
export interface IBlobEventInit extends EventInit {
    data: Blob;

    timecode?: number;
}
