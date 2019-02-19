import { AggregatedEntry, EntrySearchResult } from '../common/model';
import { SearchEngine } from '../common/search-engine';
import { SearchQuery, TextSearchQuery } from '../common/search-engine/query';
import { SearchStringParser } from '../common/search-string-parser';

export class MediathekViewWebApi {
  private readonly searchEngine: SearchEngine<AggregatedEntry>;
  private readonly searchStringParser: SearchStringParser;

  constructor(searchEngine: SearchEngine<AggregatedEntry>) {
    this.searchEngine = searchEngine;
    this.searchStringParser = new SearchStringParser();
  }

  async search(searchQuery: SearchQuery): Promise<EntrySearchResult> {
    const result = await this.searchEngine.search(searchQuery);
    return result;
  }

  async textSearch({ text, sort, skip, limit, cursor }: TextSearchQuery): Promise<EntrySearchResult> {
    const body = this.searchStringParser.parse(text);

    const searchQuery: SearchQuery = {
      body,
      skip,
      limit,
      sort,
      cursor
    };

    return this.search(searchQuery);
  }
}
