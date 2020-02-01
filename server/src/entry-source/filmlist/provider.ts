import { Filmlist } from './filmlist';

export type FilmlistResource<TProviderName extends string = any, TData = any> = {
  providerName: TProviderName,
  data: TData
};

export interface FilmlistProvider<TFilmlistResource extends FilmlistResource> {
  readonly name: string;

  getLatest(): Promise<Filmlist<TFilmlistResource>>;
  getArchive(): AsyncIterable<Filmlist<TFilmlistResource>>;

  getFromResource(resource: TFilmlistResource): Promise<Filmlist<TFilmlistResource>>;
}
