export type FilmlistResource<Type extends string = string, Data = unknown> = {
  type: Type,
  source: string,
  tag: string,
  timestamp: number,
  data: Data
};
