import { createSelector } from '@ngrx/store';
import { AppState } from '../reducers';
import { SearchState } from '../reducers/search.reducer';

export const selectSearch = (state: AppState) => state.search;
export const selectResult = (state: SearchState) => state.result;
export const selectError = (state: SearchState) => state.error;

export const selectSearchResult = createSelector(
  selectSearch,
  selectResult
);

export const selectSearchError = createSelector(
  selectSearch,
  selectError
);
