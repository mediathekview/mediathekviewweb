import { EntrySearchResult } from '../common/model';
import { Sort } from '../common/search-engine/query';
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

export class SearchSuccess extends PayloadAction<EntrySearchResult> {
  readonly type = SearchActionTypes.SearchSuccess;
}

export class SearchError extends PayloadAction<Error> {
  readonly type = SearchActionTypes.SearchError;
}

export type SearchActions = StringSearch | SearchSuccess | SearchError;
