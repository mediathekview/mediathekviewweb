import { EntityRepository } from '@tstdl/database';
import { FilmlistMetadata, Filmlist } from '../entry-source/filmlist';
import { FilmlistImport } from '../models/filmlist-import';

export type FilmlistImportProcessData = Partial<{
  state: FilmlistImport['state'],
  filmlistMetadata: FilmlistMetadata,
  importTimestamp: number,
  importDuration: number,
  entriesCount: number
}>;

export interface FilmlistImportRepository extends EntityRepository<FilmlistImport> {
  update(id: string, data: FilmlistImportProcessData): Promise<void>;
  hasFilmlistFromOtherImport(excludedImportId: string, filmlistId: string): Promise<boolean>;
  hasResource(resourceId: string): Promise<boolean>;
}
