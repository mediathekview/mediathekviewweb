import { Filmlist } from './filmlist';
import { FilmlistResource } from './filmlist-resource';

export interface FilmlistProvider<TFilmlistResource extends FilmlistResource = FilmlistResource> {
  readonly name: string;

  getLatest(): AsyncIterable<Filmlist<TFilmlistResource>>;
  getArchive(): AsyncIterable<Filmlist<TFilmlistResource>>;

  getFromResource(resource: TFilmlistResource): Promise<Filmlist<TFilmlistResource>>;
}
