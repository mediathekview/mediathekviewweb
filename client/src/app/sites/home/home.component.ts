import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { StringSearch } from 'src/app/actions/search.actions';
import { EntrySearchResult } from 'src/app/common/model';
import { AppState } from 'src/app/reducers';
import { selectSearchError, selectSearchResult } from 'src/app/selectors/search.selector';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private readonly store: Store<AppState>;
  readonly result$: Observable<EntrySearchResult | null>;
  readonly error$: Observable<Error | null>;

  constructor(store: Store<AppState>) {
    this.store = store;
    this.error$ = store.pipe(select(selectSearchError));
    this.result$ = store.pipe(select(selectSearchResult));
  }

  searchStringChanged(searchString: string) {
    const stringSearch = new StringSearch({ searchString, skip: 0, limit: 250, sort: [] });
    this.store.dispatch(stringSearch);
  }
}
