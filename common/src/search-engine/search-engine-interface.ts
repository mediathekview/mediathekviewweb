import { QueryObject } from './';
import { Nullable } from '../utils';

export type SearchEngineItem<T> = { id: string, document: T };
export type SearchEngineSearchResult<T> = { total: number, milliseconds: number, items: SearchEngineItem<T>[] };

export interface SearchEngine<T> {
  index(...entries: SearchEngineItem<T>[]): Promise<void>;
  search(query: QueryObject): Promise<SearchEngineSearchResult<T>>;
}
