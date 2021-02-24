import type { EntityRepository } from '@tstdl/database';
import type { FilmlistImportRecord } from '../shared/models/filmlist/filmlist-import-record.model';

export interface FilmlistImportRepository extends EntityRepository<FilmlistImportRecord> {
  hasFilmlistResourceImport(source: string, tag: string): Promise<boolean>;
}
