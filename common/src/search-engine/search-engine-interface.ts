import { Query } from './';
import { Nullable } from '../utils';

export type SearchEngineItem<T> = { id: string, document: T };
export type SearchEngineSearchResult<T> = { items: SearchEngineItem<T>[], total: number, milliseconds: number };

export interface SearchEngine<T> {
  index(...entries: SearchEngineItem<T>[]): Promise<void>;
  search(query: Query): Promise<SearchEngineSearchResult<T>>;
}
