import { ChangeDetectionStrategy, Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Order, TextSearchQuery } from 'src/app/common/search-engine/query';
import { TextSearch } from '../../actions/search.actions';
import { EntrySearchResult, Field } from '../../common/model';
import { AppState } from '../../reducers';
import { selectSearchError, selectSearchResult } from '../../selectors/search.selector';

@Component({
  selector: 'mvw-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    const textSearchQuery: TextSearchQuery = {
      text: searchString,
      skip: 0,
      limit: 25,
      sort: [{ field: Field.Date, order: Order.Descending }]
    };

    const stringSearch = new TextSearch(textSearchQuery);
    this.store.dispatch(stringSearch);
  }
}
