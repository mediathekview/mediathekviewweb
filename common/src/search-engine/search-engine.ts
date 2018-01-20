import { SearchQuery } from './query';
import { SearchEngineItem } from './item';
import { SearchResult } from './result';

export interface SearchEngine<T> {
  index(entries: SearchEngineItem<T>[]): Promise<void>;
  search(query: SearchQuery): Promise<SearchResult<T>>;
}
