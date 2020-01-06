import { Entity, EntityWithPartialId } from '../common/models';

export type FilmlistImport = Entity & {
  filmlist: FilmlistMetadata,
  importTimestamp: number | null,
  importDuration: number | null,
  entriesCount: number | null
};

export type FilmlistMetadata = {
  id: string,
  timestamp: number
};

export type FilmlistImportWithPartialId = EntityWithPartialId<FilmlistImport>;
