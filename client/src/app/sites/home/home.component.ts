import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Subject } from 'rxjs';
import { EntrySearchResult, Field } from '../../common/model';
import { Order, TextSearchQuery } from '../../common/search-engine/query';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'mvw-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private readonly searchService: SearchService;

  private textSearchQuery: TextSearchQuery;
  private searchResult: EntrySearchResult;

  readonly result$: Subject<EntrySearchResult | undefined>;
  readonly error$: Subject<Error | undefined>;

  constructor(searchService: SearchService) {
    this.searchService = searchService;

    this.error$ = new Subject();
    this.result$ = new Subject();
  }

  async searchStringChanged(searchString: string): Promise<void> {
    this.textSearchQuery = {
      text: searchString,
      skip: 0,
      limit: 25,
      sort: [{ field: Field.Date, order: Order.Descending }],
      cursor: undefined
    };

    try {
      this.searchResult = await this.searchService.textSearch(this.textSearchQuery).toPromise();
      this.result$.next(this.searchResult);
      this.error$.next(undefined);
    }
    catch (error) {
      this.result$.next(undefined);
      this.error$.next(error);
    }
  }

  async endReached(): Promise<void> {
    const fetchNextTextSearchQuery: TextSearchQuery = {
      ...this.textSearchQuery,
      skip: undefined,
      cursor: this.searchResult.cursor
    };

    try {
      const result = await this.searchService.textSearch(fetchNextTextSearchQuery).toPromise();

      this.searchResult = {
        ...result,
        items: [...this.searchResult.items, ...result.items],
        cursor: result.cursor,
      };

      this.result$.next(this.searchResult);
      this.error$.next(undefined);
    }
    catch (error) {
      this.result$.next(undefined);
      this.error$.next(error);
    }
  }
}
