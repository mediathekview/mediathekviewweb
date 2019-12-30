import { EntityRepository } from '@tstdl/database';
import { FilmlistImport } from '../models/filmlist-import';

export interface FilmlistImportRepository extends EntityRepository<FilmlistImport> {
  setProcessed(id: string, data: { processedTimestamp: number, numberOfEntries: number }): Promise<void>;
  hasFilmlist(filmlistId: string): Promise<boolean>;
}
