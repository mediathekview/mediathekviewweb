import { Filmlist } from './filmlist';

export type FilmlistResource<T = any> = {
  type: string,
  data: T
};

export interface FilmlistProvider<TData = any> {
  readonly type: string;

  getLatest(): Promise<Filmlist>;
  getArchive(): AsyncIterable<Filmlist>;
}
