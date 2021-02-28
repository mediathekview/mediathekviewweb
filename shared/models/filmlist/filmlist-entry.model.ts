import type { TypedOmit } from '@tstdl/base/types';
import type { Entity } from '@tstdl/database';
import type { Entry } from '../core';

export type FilmlistEntry = TypedOmit<Entry, keyof Entity | 'firstSeen' | 'lastSeen' | 'indexJob' | 'indexJobTimeout' | 'indexRequiredSince'>;
