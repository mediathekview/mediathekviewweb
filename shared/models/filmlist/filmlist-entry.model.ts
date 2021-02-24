import { TypedOmit } from '@tstdl/base/types';
import { Entity } from '@tstdl/database';
import { Entry } from '../core';

export type FilmlistEntry = TypedOmit<Entry, keyof Entity | 'firstSeen' | 'lastSeen' | 'indexJob' | 'indexJobTimeout' | 'indexRequiredSince' | 'source'>;
