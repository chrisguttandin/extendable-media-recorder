import { InjectionToken } from '@angular/core';
import { IMediaEncoder } from '../interfaces';

export const encoders = new InjectionToken<IMediaEncoder[]>('ENCODERS');

const ncdrs: IMediaEncoder[] = [];

export const ENCODERS_PROVIDER = { provide: encoders, useValue: ncdrs };
