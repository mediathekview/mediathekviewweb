export type SearchResult<T> = {
  total: number,
  milliseconds: number,
  items: T[],
  cursor: string
};
