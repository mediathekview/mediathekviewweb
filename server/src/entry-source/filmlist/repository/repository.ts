import { Filmlist } from '../../../models/filmlist';

export interface FilmlistRepository {
  getLatest(): Promise<Filmlist>;
  getArchive(): AsyncIterable<Filmlist>;
}
