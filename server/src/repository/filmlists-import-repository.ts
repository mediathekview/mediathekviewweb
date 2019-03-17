import { FilmlistImport, FilmlistImportWithPartialId } from '../model/filmlist-import';

export interface FilmlistImportRepository {
  insert(filmlistImport: FilmlistImportWithPartialId): Promise<FilmlistImport>;

  setProcessed(id: string, data: { processedTimestamp: number, numberOfEntries: number }): Promise<void>;

  load(id: string): Promise<FilmlistImport>;

  hasFilmlist(filmlistId: string): Promise<boolean>;
}
