import { SearchActions, SearchActionTypes } from '../actions/search.actions';
import { EntrySearchResult } from '../common/model';

export type SearchState = {
  result: EntrySearchResult | undefined,
  error: Error | undefined
};

export const initialState: SearchState = {
  result: undefined,
  error: undefined
};

export function searchReducer(state: SearchState = initialState, action: SearchActions): SearchState {
  switch (action.type) {
    case SearchActionTypes.SearchSuccess:
      return { result: action.payload, error: undefined };

    case SearchActionTypes.SearchError:
      return { result: undefined, error: action.payload };

    default:
      return state;
  }
}
