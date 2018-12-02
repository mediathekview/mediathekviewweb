import { AggregatedEntry } from '../common/model';
import { SearchResult, Sort } from '../common/search-engine';
import { PayloadAction } from './payload.action';

export type StringSearchPayload = {
  searchString: string,
  skip: number,
  limit: number,
  sort: Sort[]
};

export enum SearchActionTypes {
  StringSearch = '[Search] StringSearch',
  SearchSuccess = '[Search] Success',
  SearchError = '[Search] Error'
}

export class StringSearch extends PayloadAction<StringSearchPayload> {
  readonly type = SearchActionTypes.StringSearch;
}

export class SearchSuccess extends PayloadAction<SearchResult<AggregatedEntry>> {
  readonly type = SearchActionTypes.SearchSuccess;
}

export class SearchError extends PayloadAction<Error> {
  readonly type = SearchActionTypes.SearchError;
}

export type SearchActions = StringSearch | SearchSuccess | SearchError;
