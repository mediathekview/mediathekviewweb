import type { EntrySearchResult, PublicEntry } from '$shared/models/core';
import { SearchStringParser } from '$shared/search-string-parser';
import type { SearchIndex } from '@tstdl/search-index';

export class SearchApi {
  private readonly searchIndex: SearchIndex<PublicEntry>;
  private readonly searchStringParser: SearchStringParser;

  constructor(searchIndex: SearchIndex<PublicEntry>) {
    this.searchIndex = searchIndex;
    this.searchStringParser = new SearchStringParser();
  }

  async search(searchParameters: SearchQuery): Promise<EntrySearchResult> {
    const result = await this.searchIndex.search(searchParameters);
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

    return this.searchIndex.search(searchQuery);
  }
}
