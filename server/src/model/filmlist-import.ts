import { Entity, EntityWithPartialId } from '../common/model';
import { Filmlist } from './filmlist';

export type FilmlistImportQueueItem = {
  filmlistImportId: string
};

export type FilmlistImport = Entity & {
  filmlist: Filmlist,
  enqueuedTimestamp: number,
  processedTimestamp: number | null,
  numberOfEntries: number | null,
};

export type FilmlistImportWithPartialId = EntityWithPartialId<FilmlistImport>;
