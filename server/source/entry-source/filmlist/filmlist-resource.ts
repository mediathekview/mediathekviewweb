export enum FilmlistResourceType {
  Filesystem = 0,
  Http = 1
}

type FilmlistResourceBase<Type extends FilmlistResourceType> = {
  type: Type
};

export type FilesystemFilmlistResource = FilmlistResourceBase<FilmlistResourceType.Filesystem> & {
  path: string
};

export type HttpFilmlistResource = FilmlistResourceBase<FilmlistResourceType.Http> & {
  url: string
};

export type FilmlistResource = FilesystemFilmlistResource | HttpFilmlistResource;
