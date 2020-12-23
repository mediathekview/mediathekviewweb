import type { EntityRepository } from '@tstdl/database';
import type { FilmlistMetadata } from '../entry-source/filmlist';
import type { FilmlistImportRecord } from '../shared/models/filmlist/filmlist-import-record.model';

export type FilmlistImportProcessData = Partial<{
  state: FilmlistImportRecord['state'],
  filmlistMetadata: FilmlistMetadata,
  importTimestamp: number,
  importDuration: number,
  entriesCount: number
}>;

export interface FilmlistImportRepository extends EntityRepository<FilmlistImportRecord> {
  hasPendingResourceImport(excludedImportId: string, filmlistId: string): Promise<boolean>;
}
