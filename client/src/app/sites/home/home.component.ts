import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { StringSearch } from '../../actions/search.actions';
import { EntrySearchResult } from '../../common/model';
import { AppState } from '../../reducers';
import { selectSearchError, selectSearchResult } from '../../selectors/search.selector';

@Component({
  selector: 'mvw-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private readonly store: Store<AppState>;

  readonly result$: Observable<EntrySearchResult | undefined>;
  readonly error$: Observable<Error | undefined>;

  constructor(store: Store<AppState>) {
    this.store = store;
    this.error$ = store.pipe(select(selectSearchError));
    this.result$ = store.pipe(select(selectSearchResult));
  }

  searchStringChanged(searchString: string): void {
    const stringSearch = new StringSearch({ searchString, skip: 0, limit: 100, sort: [] });
    this.store.dispatch(stringSearch);
  }
}
