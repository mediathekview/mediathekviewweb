import 'rxjs/add/operator/toPromise';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Result as RestApiResult } from '../common/api/rest';
import { AggregatedEntry, Field } from '../common/model';
import { Order, QueryBody, SearchQuery, SearchResult, Sort } from '../common/search-engine';
import { SearchStringParser } from '../common/search-string-parser/parser';

@Injectable()
export class SearchService {
  private readonly httpClient: HttpClient;
  private readonly searchStringParser: SearchStringParser;

  constructor(httpClient: HttpClient, searchStringParser: SearchStringParser) {
    this.httpClient = httpClient;
    this.searchStringParser = searchStringParser;
  }

  async searchByString(searchString: string, skip: number, limit: number, ...sort: Sort[]): Promise<SearchResult<AggregatedEntry>> {
    const body: QueryBody = this.searchStringParser.parse(searchString);

    const query: SearchQuery = {
      body,
      sort,
      skip,
      limit
    };

    return await this.search(query);
  }

  async search(query: SearchQuery): Promise<SearchResult<AggregatedEntry>> {
    const url = '/api/v2/search';
    // const url = 'http://localhost:8080/api/v2/search';
    // const url = 'https://testing.mediathekviewweb.de/api/v2/search';

    const response = await this.httpClient.post<RestApiResult<SearchResult<AggregatedEntry>>>(url, query, { responseType: 'json' }).toPromise();

    if (response.errors != undefined) {
      const errorMessage = JSON.stringify(response.errors, null, 2);
      throw new Error(errorMessage);
    }

    return response.result!;
  }
}
