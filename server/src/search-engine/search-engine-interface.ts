import { Query } from './';
import { Nullable } from '../utils';

export type SearchEngineEntry<T> = { id: string, document: T };

export type SearchEngineSearchResult<T> = { items: T[], total: number, milliseconds: number };

export interface ISearchEngine<T> {
  index(...entries: SearchEngineEntry<T>[]): Promise<void>;
  search(query: Query): Promise<SearchEngineSearchResult<T>>;
}
