import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Field, AggregatedEntry } from '../../common/model';
import { Order, SearchResult } from '../../common/search-engine';
import { Subscription, merge } from 'rxjs';
import { startWith, throttleTime } from 'rxjs/operators';
import { exhaustWithLastMap } from '../../common/rxjs/exhaustWithLastMap';
import { SortBuilder } from '../../common/search-engine/query/builder/sort';

const DEFAULT_SORT_FIELD = Field.Timestamp;
const DEFAULT_SORT_ORDER = Order.Descending;

@Component({
  selector: 'mvw-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.searchChangeSubscription = this.subscribeChanges();
    this.pageSizeChangeSubscription = this.subscribePageSizeChange();
  }

  searchStringChanged(searchString: string) {

  }

  private subscribeChanges(): Subscription {
    const subscription = merge(this.paginator.page, this.sort.sortChange, this.searchInput.searchStringChanged)
      .pipe(
        startWith({}),
        throttleTime(50, undefined, { leading: true, trailing: true }),
        exhaustWithLastMap(() => this.search())
      )
      .subscribe((searchResult) => this.applyResult(searchResult));

    return subscription;
  }

  private async search(): Promise<SearchResult<AggregatedEntry> | Error> {
    const skip = this.paginator.pageIndex * this.paginator.pageSize;
    const limit = this.paginator.pageSize;

    const sortField = this.getSortField();
    const sortOrder = this.getSortOrder();

    const sort =
      new SortBuilder()
        .add(sortField, sortOrder)
        .build();

    try {
      const result = await this.searchService.searchByString(this.searchInput.searchString, skip, limit, ...sort);
      return result;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  private getSortField(): string {
    const sortField = (this.sort.direction == '') ? DEFAULT_SORT_FIELD : this.sort.active;
    return sortField;
  }

  private getSortOrder(): Order {
    switch (this.sort.direction) {
      case 'asc':
        return Order.Ascending;

      case 'desc':
        return Order.Descending;

      case '':
        return DEFAULT_SORT_ORDER;

      default:
        throw new Error(`unknown direction '${this.sort.direction}'`);
    }
  }
}
