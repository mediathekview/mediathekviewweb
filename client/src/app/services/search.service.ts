import 'rxjs/add/operator/toPromise';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AggregatedEntry } from '../common/model';
import { QueryBody, SearchQuery, SearchResult } from '../common/search-engine';
import { SearchStringParser } from '../common/search-string-parser/parser';

@Injectable()
export class SearchService {
  private readonly httpClient: HttpClient;
  private readonly searchStringParser: SearchStringParser;

  constructor(httpClient: HttpClient, searchStringParser: SearchStringParser) {
    this.httpClient = httpClient;
    this.searchStringParser = searchStringParser;
  }

  async search(searchString: string): Promise<SearchResult<AggregatedEntry>> {
    const queryBody: QueryBody = this.searchStringParser.parse(searchString);

    const query: SearchQuery = {
      body: queryBody
    };

    const response = await this.httpClient.post('http://localhost:8080/api/search', query, { responseType: 'text' }).toPromise();

    document.getElementsByTagName('body')[0].innerHTML = response;

    return (response as any).result as SearchResult<AggregatedEntry>;
  }
}
