// tslint:disable: max-classes-per-file

import { EntrySearchResult } from '../common/model';
import { Sort, TextSearchQuery } from '../common/search-engine/query';
import { PayloadAction } from './payload.action';

export type TextSearchPayload = TextSearchQuery;

export enum SearchActionTypes {
  TextSearch = '[Search] TextSearch',
  SearchSuccess = '[Search] Success',
  SearchError = '[Search] Error'
}

export type SearchActions = TextSearch | SearchSuccess | SearchError;

export class TextSearch extends PayloadAction<TextSearchPayload> {
  readonly type: SearchActionTypes.TextSearch = SearchActionTypes.TextSearch;
}

export class SearchSuccess extends PayloadAction<EntrySearchResult> {
  readonly type: SearchActionTypes.SearchSuccess = SearchActionTypes.SearchSuccess;
}

export class SearchError extends PayloadAction<Error> {
  readonly type: SearchActionTypes.SearchError = SearchActionTypes.SearchError;
}
