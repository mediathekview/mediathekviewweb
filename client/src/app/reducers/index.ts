import { ActionReducerMap, MetaReducer, createSelector } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { searchReducer, SearchState } from './search.reducer';

export interface AppState {
  search: SearchState
}

export const reducers: ActionReducerMap<AppState, any> = {
  search: searchReducer
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];

