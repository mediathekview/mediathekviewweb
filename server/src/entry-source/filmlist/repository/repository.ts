import { Filmlist } from '../../../model/filmlist';

export interface FilmlistRepository {
  getLatest(): Promise<Filmlist>;
  getArchive(): AsyncIterable<Filmlist>;
}
