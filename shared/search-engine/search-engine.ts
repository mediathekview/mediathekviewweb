import type { AsyncDisposable } from '@tstdl/base/disposable';
import type { SearchEngineItem } from './item';
import type { SearchQuery } from './query';
import type { SearchResult } from './result';

export interface SearchEngine<T> extends AsyncDisposable {
  initialize(): Promise<void>;
  index(entries: SearchEngineItem<T>[]): Promise<void>;
  search(query: SearchQuery): Promise<SearchResult<T>>;
  drop(): Promise<void>;
}
