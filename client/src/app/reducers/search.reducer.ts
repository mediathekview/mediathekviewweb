import { SearchActions, SearchActionTypes } from '../actions/search.actions';
import { AggregatedEntry } from '../common/model';
import { SearchResult } from '../common/search-engine';

export type SearchState = {
  result: SearchResult<AggregatedEntry> | null,
  error: Error | null
};

export const initialState: SearchState = {
  result: null,
  error: null
};

export function searchReducer(state: SearchState = initialState, action: SearchActions): SearchState {
  switch (action.type) {
    case SearchActionTypes.SearchSuccess:
      return { result: action.payload, error: null };

    case SearchActionTypes.SearchError:
      return { result: null, error: action.payload };

    default:
      return state;
  }
}
