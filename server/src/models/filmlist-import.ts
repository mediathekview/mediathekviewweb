import { Entity, EntityWithPartialId } from '../common/models';

export type FilmlistImport = Entity & {
  filmlist: FilmlistMetadata,
  resource: FilmlistResource,
  enqueueTimestamp: number,
  importTimestamp: number | null,
  importDuration: number | null,
  entriesCount: number | null
};

export type FilmlistMetadata = {
  id: string,
  timestamp: number
};

export type FilmlistResource<T = any> = {
  type: string,
  data: T
};

export type FilmlistImportWithPartialId = EntityWithPartialId<FilmlistImport>;
