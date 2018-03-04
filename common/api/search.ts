import { SearchQuery, SearchResult } from '../search-engine';
import { AggregatedEntry } from '../model';

export { SearchQuery, SearchResult, AggregatedEntry };

export interface SearchApi {
  search(query: SearchQuery): Promise<SearchResult<AggregatedEntry>>;
}
