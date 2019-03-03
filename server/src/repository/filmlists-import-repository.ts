import { FilmlistImport, FilmlistImportWithPartialId } from '../model/filmlist-import';

export interface FilmlistImportRepository {
  insert(filmlistImport: FilmlistImportWithPartialId): Promise<FilmlistImport>;
  has(id: string): Promise<boolean>;
}
