import { OpaqueToken } from '@angular/core';
import { IMediaEncoder } from '../interfaces';

export const encoders = new OpaqueToken('ENCODERS');

const ncdrs: IMediaEncoder[] = [];

export const ENCODERS_PROVIDER = { provide: encoders, useValue: ncdrs };
