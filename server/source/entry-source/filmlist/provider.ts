import type { Readable } from 'stream';
import type { FilmlistResource } from './filmlist-resource';

export interface FilmlistProvider<TFilmlistResource extends FilmlistResource = FilmlistResource> {
  readonly type: string;

  getLatest(): AsyncIterable<TFilmlistResource>;
  getArchive(minimumTimestamp: number): AsyncIterable<TFilmlistResource>;

  canHandle(resource: FilmlistResource): boolean;

  getFromResource(resource: TFilmlistResource): Promise<Readable>;
}
