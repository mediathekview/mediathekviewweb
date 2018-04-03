import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, ViewChildren } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatTable, MatSortable } from '@angular/material';
import { merge } from 'rxjs/observable/merge';
import { switchMap } from 'rxjs/operators/switchMap';
import { throttleTime } from 'rxjs/operators/throttleTime';
import { distinctUntilKeyChanged } from 'rxjs/operators/distinctUntilKeyChanged';

import { AggregatedEntry } from '../../common/model';
import { SearchResult, Order } from '../../common/search-engine';
import { SearchService } from '../../services/search.service';
import { SettingsService } from '../../services/settings.service';
import { SearchInputComponent } from '../search-input/search-input.component';
import { Subscription } from 'rxjs/Subscription';
import { SortBuilder } from '../../common/search-engine/query/builder/sort';

@Component({
  selector: 'mvw-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly settingsService: SettingsService;
  private readonly searchService: SearchService;

  private searchChangeSubscription: Subscription;
  private pageSizeChangeSubscription: Subscription;

  dataSource = new MatTableDataSource<AggregatedEntry>();
  columnsToDisplay = ['channel', 'topic', 'title', 'timestamp', 'duration'];
  isFetching = false;

  @ViewChild(SearchInputComponent) searchInput: SearchInputComponent;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatTable) table: MatTable<AggregatedEntry>;
  @ViewChild(MatSort) sort: MatSort;

  constructor(settingsService: SettingsService, searchService: SearchService) {
    this.settingsService = settingsService;
    this.searchService = searchService;
  }

  ngOnInit() {
    this.table.trackBy = (_index, entry) => entry.id;
  }

  ngOnDestroy() {
    this.searchChangeSubscription.unsubscribe();
    this.pageSizeChangeSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    this.searchChangeSubscription = this.subscribeChanges();
    this.pageSizeChangeSubscription = this.subscribePageSizeChange();

    const timestampSortable = this.sort.sortables.get('timestamp') as MatSortable;
    this.sort.sort(timestampSortable);
  }

  private subscribeChanges(): Subscription {
    const subscription = merge(this.paginator.page, this.sort.sortChange, this.searchInput.searchStringChanged)
      .pipe(
        throttleTime(50, undefined, { leading: true, trailing: true }),
        switchMap(() => this.search())
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

  private applyResult(searchResult: SearchResult<AggregatedEntry>) {
    this.dataSource.data = searchResult.items;
    this.paginator.length = searchResult.total;
  }

  private search(): Promise<SearchResult<AggregatedEntry>> {
    const skip = this.paginator.pageIndex * this.paginator.pageSize;
    const limit = this.paginator.pageSize;

    const sort =
      new SortBuilder()
        .add(this.sort.active, this.sort.direction == 'desc' ? Order.Descending : Order.Ascending)
        .build();

    console.log(this.searchInput.searchString);

    return this.searchService.searchByString(this.searchInput.searchString, skip, limit, ...sort);
  }
}
