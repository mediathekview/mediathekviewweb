export type FilmlistResource<TProviderName extends string = string, TData = any> = {
  id: string,
  timestamp: number,
  providerName: TProviderName,
  data: TData
};
