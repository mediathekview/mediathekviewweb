import type { FilmlistResource } from '$root/entry-source/filmlist';
import type { Entity, MaybeNewEntity, NewEntity } from '@tstdl/database';

export enum FilmlistImportRecordState {
  Pending = 0,
  Imported = 1,
  Duplicate = 2,
  Error = 3
}

export type FilmlistImportRecord = Entity & {
  resource: FilmlistResource,
  state: FilmlistImportRecordState,
  enqueueTimestamp: number,
  filmlistId?: string,
  filmlistTimestamp?: number,
  importTimestamp?: number,
  importDuration?: number,
  entriesCount?: number
};

export type NewFilmlistImportRecord = NewEntity<FilmlistImportRecord>;
export type MaybeNewFilmlistImportRecord = MaybeNewEntity<FilmlistImportRecord>;
