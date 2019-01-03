import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SearchActions, SearchActionTypes, SearchError, SearchSuccess, StringSearch, StringSearchPayload } from '../actions/search.actions';
import { SearchService } from '../services/search.service';

@Injectable()
export class SearchEffects {
  private readonly searchService: SearchService;

  constructor(private actions$: Actions<SearchActions>, searchService: SearchService) {
    this.searchService = searchService;
  }

  @Effect()
  search$ = this.actions$.pipe(
    ofType(SearchActionTypes.StringSearch),
    switchMap((action) => {
      const payload: StringSearchPayload = (action as StringSearch).payload;
      return this.searchService.searchByString(payload.searchString, payload.skip, payload.limit, ...payload.sort)
        .pipe(
          map((result) => new SearchSuccess({ ...result, items: [...result.items, ...result.items, ...result.items, ...result.items, ...result.items, ...result.items, ...result.items, ...result.items, ...result.items, ...result.items] })),
          catchError((error) => of(new SearchError(error)))
        );
    })
  );
}
