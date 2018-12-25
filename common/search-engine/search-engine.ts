import { AsyncDisposable } from '../disposable';
import { SearchEngineItem } from './item';
import { SearchQuery } from './query';
import { SearchResult } from './result';

export interface SearchEngine<T> extends AsyncDisposable {
  initialize(): Promise<void>;
  index(entries: SearchEngineItem<T>[]): Promise<void>;
  search(query: SearchQuery): Promise<SearchResult<T>>;
  drop(): Promise<void>;
}
