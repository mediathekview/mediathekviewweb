import { Entity, EntityWithPartialId } from '../common/model';

export type FilmlistImport = Entity & {
  filmlistId: string,
  enqueuedTimestamp: number,
  processedTimestamp: number | null,
  numberOfEntries: number | null,
};

export type FilmlistImportWithPartialId = EntityWithPartialId<FilmlistImport>;
