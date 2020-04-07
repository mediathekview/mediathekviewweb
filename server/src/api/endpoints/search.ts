import { EntrySearchResult, PublicEntry } from '../../common/models';
import { SearchEngine } from '../../common/search-engine';
import { SearchQuery, TextSearchQuery } from '../../common/search-engine/query';
import { SearchStringParser } from '../../common/search-string-parser';

export type SearchParameters = SearchQuery;
export type TextSearchParameters = TextSearchQuery;

export class SearchApiEndpoint {
  private readonly searchEngine: SearchEngine<PublicEntry>;
  private readonly searchStringParser: SearchStringParser;

  constructor(searchEngine: SearchEngine<PublicEntry>) {
    this.searchEngine = searchEngine;
    this.searchStringParser = new SearchStringParser();
  }

  async search(searchParameters: SearchParameters): Promise<EntrySearchResult> {
    const result = await this.searchEngine.search(searchParameters);
    return result;
  }

  async textSearch({ text, sort, skip, limit, cursor }: TextSearchParameters): Promise<EntrySearchResult> {
    const body = this.searchStringParser.parse(text);

    const searchQuery: SearchQuery = {
      body,
      skip,
      limit,
      sort,
      cursor
    };

    return this.searchEngine.search(searchQuery);
  }
}
