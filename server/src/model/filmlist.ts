export type Filmlist = {
  id: string,
  timestamp: number,
  resource: FilmlistResource
};

export type FilmlistResource = {
  url: string,
  timestamp: number,
  compressed: boolean
};
