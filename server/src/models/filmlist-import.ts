import { Entity, EntityWithPartialId } from '../common/models';
import { FilmlistMetadata, FilmlistResource } from '../entry-source/filmlist';

export type FilmlistImport = Entity & {
  resource: FilmlistResource,
  state: 'pending' | 'ok' | 'duplicate' | 'error',
  enqueueTimestamp: number,
  filmlistMetadata: FilmlistMetadata | null,
  importTimestamp: number | null,
  importDuration: number | null,
  entriesCount: number | null
};

export type FilmlistImportWithPartialId = EntityWithPartialId<FilmlistImport>;
