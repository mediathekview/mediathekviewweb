import { FilmlistImport, FilmlistImportWithPartialId } from '../model/filmlist-import';

export interface FilmlistImportRepository {
  insert(filmlistImport: FilmlistImportWithPartialId): Promise<FilmlistImport>;

  setProcessedTimestamp(id: string, processedTime: number): Promise<void>;

  load(id: string): Promise<FilmlistImport>;

  hasFilmlist(filmlistId: string): Promise<boolean>;
}
