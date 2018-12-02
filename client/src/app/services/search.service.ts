import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isErrorResponse, isResultResponse, Response } from '../common/api/rest';
import { EntrySearchResult } from '../common/model';
import { QueryBody, SearchQuery, Sort } from '../common/search-engine/query';
import { SearchStringParser } from '../common/search-string-parser/parser';
import { toError } from '../common/utils';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly httpClient: HttpClient;
  private readonly searchStringParser: SearchStringParser;

  constructor(httpClient: HttpClient, searchStringParser: SearchStringParser) {
    this.httpClient = httpClient;
    this.searchStringParser = searchStringParser;
  }

  searchByString(searchString: string, skip: number, limit: number, ...sort: Sort[]): Observable<EntrySearchResult> {
    const body: QueryBody = this.searchStringParser.parse(searchString);

    const query: SearchQuery = {
      body,
      sort,
      skip,
      limit
    };

    return this.search(query);
  }

  search(query: SearchQuery): Observable<EntrySearchResult> {
    const url = '/api/v2/search';
    // const url = 'http://localhost:8080/api/v2/search';
    // const url = 'https://testing.mediathekviewweb.de/api/v2/search';

    return this.httpClient.post<Response<EntrySearchResult>>(url, query, { responseType: 'json' })
      .pipe(
        map(toResult)
      );
  }
}

function toResult<T>(response: Response<T>): T {
  if (isErrorResponse(response)) {
    const errorMessage = JSON.stringify(response.errors, null, 2);
    throw new Error(errorMessage);
  }

  if (isResultResponse(response)) {
    return response.result;
  }

  throw toError(response);
}
