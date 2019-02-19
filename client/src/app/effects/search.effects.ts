import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SearchActions, SearchActionTypes, SearchError, SearchSuccess, TextSearchPayload } from '../actions/search.actions';
import { SearchService } from '../services/search.service';

@Injectable()
export class SearchEffects {
  private readonly actions$: Actions<SearchActions>;
  private readonly searchService: SearchService;

  @Effect() search$: Observable<SearchSuccess | SearchError>;

  constructor(actions$: Actions<SearchActions>, searchService: SearchService) {
    this.actions$ = actions$;
    this.searchService = searchService;

    this.search$ = this.getSearchEffect();
  }

  private getSearchEffect(): Observable<SearchSuccess | SearchError> {
    return this.actions$.pipe(
      ofType(SearchActionTypes.TextSearch),
      switchMap((action) => {
        const payload: TextSearchPayload = action.payload;
        return this.searchService.textSearch(payload)
          .pipe(
            map((result) => new SearchSuccess({ ...result, items: [...result.items] })),
            catchError((error) => of(new SearchError(error)))
          );
      })
    );
  }
}
