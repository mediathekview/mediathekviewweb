import type { Filmlist } from './filmlist-parser';
import type { FilmlistResource } from './filmlist-resource';

export interface FilmlistProvider<TFilmlistResource extends FilmlistResource = FilmlistResource> {
  readonly type: string;

  getLatest(): AsyncIterable<Filmlist>;
  getArchive(minimumTimestamp: number): AsyncIterable<Filmlist>;

  canHandle(resource: FilmlistResource): boolean;

  getFromResource(resource: TFilmlistResource): Promise<Filmlist>;
}
