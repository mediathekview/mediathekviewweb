import { AggregatedEntry, EntrySearchResult } from '../common/model';
import { SearchEngine } from '../common/search-engine';
import { SearchQuery } from '../common/search-engine/query';

export class MediathekViewWebApi {
  private searchEngine: SearchEngine<AggregatedEntry>;

  constructor(searchEngine: SearchEngine<AggregatedEntry>) {
    this.searchEngine = searchEngine;
  }

  async initialize(): Promise<void> {
    await this.searchEngine.initialize();
  }

  async search(searchQuery: SearchQuery): Promise<EntrySearchResult> {
    const result = await this.searchEngine.search(searchQuery);
    return result;
  }
}
