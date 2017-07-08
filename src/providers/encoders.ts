import { InjectionToken } from '@angular/core';
import { IMediaFormatRecoder } from '../interfaces';

export const encoders = new InjectionToken<IMediaFormatRecoder[]>('ENCODERS');

const ncdrs: IMediaFormatRecoder[] = [];

export const ENCODERS_PROVIDER = { provide: encoders, useValue: ncdrs };
