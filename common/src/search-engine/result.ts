import { SearchEngineItem } from './item';

export type SearchResult<T> = {
  total: number,
  milliseconds: number,
  items: T[]
};