import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isErrorResponse, isResultResponse, Response } from '@tstdl/base/api';
import { toError } from '@tstdl/base/utils';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntrySearchResult } from '../common/models';
import { SearchQuery, TextSearchQuery } from '../common/search-engine/query';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  search(query: SearchQuery): Observable<EntrySearchResult> {
    return this.post('/api/v2/entries/search', query);
  }

  textSearch(query: TextSearchQuery): Observable<EntrySearchResult> {
    return this.post('/api/v2/entries/search/text', query);
  }

  private post<T, Data>(url: string, data: Data): Observable<T> {
    return this.httpClient.post<Response<T>>(url, data, { responseType: 'json' })
      .pipe(
        map(toResult)
      );
  }
}

function toResult<T>(response: Response<T>): T {
  if (isErrorResponse(response)) {
    const errorMessage = JSON.stringify(response.error, undefined, 2);
    throw new Error(errorMessage);
  }

  if (isResultResponse(response)) {
    return response.result;
  }

  throw toError(response);
}
