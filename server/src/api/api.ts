import { SearchEngine, SearchQuery, SearchResult } from '../common/search-engine';
import { AggregatedEntry } from '../common/model';
import { SearchApi } from '../common/api';

export class BaseSearchApi implements SearchApi {
  private searchEngine: SearchEngine<AggregatedEntry>;

  constructor(searchEngine: SearchEngine<AggregatedEntry>) {
    this.searchEngine = searchEngine;
  }

  search(query: SearchQuery): Promise<SearchResult<AggregatedEntry>> {
    return this.searchEngine.search(query);
  }
}
