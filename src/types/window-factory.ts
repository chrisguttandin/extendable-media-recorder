import { TWindow } from './window';

// @todo TypeScript does not include type definitions for the MediaStream Recording specification yet.
export type TWindowFactory = () => null | TWindow;
