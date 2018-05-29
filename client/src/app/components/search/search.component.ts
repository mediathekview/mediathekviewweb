import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTable, MatTableDataSource } from '@angular/material';
import { Subscription, merge } from 'rxjs';
import { distinctUntilKeyChanged, startWith, throttleTime } from 'rxjs/operators';

import { AggregatedEntry, Field } from '../../common/model';
import { exhaustWithLastMap } from '../../common/rxjs/exhaustWithLastMap';
import { Order, SearchResult } from '../../common/search-engine';
import { SortBuilder } from '../../common/search-engine/query/builder/sort';
import { SearchService } from '../../services/search.service';
import { SettingsService } from '../../services/settings.service';
import { SearchInputComponent } from '../search-input/search-input.component';


const DEFAULT_SORT_FIELD = Field.Timestamp;
const DEFAULT_SORT_ORDER = Order.Descending;

@Component({
  selector: 'mvw-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly searchService: SearchService;

  readonly settingsService: SettingsService;

  private searchChangeSubscription!: Subscription;
  private pageSizeChangeSubscription!: Subscription;

  dataSource = new MatTableDataSource<AggregatedEntry>();
  columnsToDisplay = ['channel', 'topic', 'title', 'date', 'time', 'duration', 'play'];
  isFetching = false;

  @ViewChild(SearchInputComponent) searchInput!: SearchInputComponent;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<AggregatedEntry>;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(settingsService: SettingsService, searchService: SearchService) {
    this.settingsService = settingsService;
    this.searchService = searchService;
  }

  ngOnInit() {
    this.table.trackBy = (_index, entry) => entry.id;
  }

  ngAfterViewInit() {
    this.searchChangeSubscription = this.subscribeChanges();
    this.pageSizeChangeSubscription = this.subscribePageSizeChange();
  }

  ngOnDestroy() {
    this.searchChangeSubscription.unsubscribe();
    this.pageSizeChangeSubscription.unsubscribe();
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

  private subscribePageSizeChange(): Subscription {
    const subscription = this.paginator.page
      .pipe(
        distinctUntilKeyChanged('pageSize')
      )
      .subscribe((pageEvent) => this.settingsService.setPageSize(pageEvent.pageSize));

    return subscription;
  }

  private applyResult(result: SearchResult<AggregatedEntry> | Error) {
    if ((result instanceof Error) || (result instanceof HttpErrorResponse)) {
      this.applyError(result);
    } else {
      this.dataSource.data = result.items;
      this.paginator.length = result.total;
    }
  }

  private applyError(error: Error | HttpErrorResponse) {
    window.alert(JSON.stringify(error, null, 2));
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
