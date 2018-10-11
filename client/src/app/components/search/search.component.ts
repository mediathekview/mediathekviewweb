import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { merge, Observable, Subscription } from 'rxjs';
import { startWith, throttleTime } from 'rxjs/operators';
import { AggregatedEntry } from '../../common/model';
import { exhaustWithLastMap } from '../../common/rxjs/exhaustWithLastMap';
import { SearchResult } from '../../common/search-engine';
import { SortBuilder } from '../../common/search-engine/query/builder/sort';
import { SearchService } from '../../services/search.service';
import { EntryListComponent } from '../entry-list/entry-list.component';
import { SearchInputComponent } from '../search-input/search-input.component';

@Component({
  selector: 'mvw-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  private readonly searchService: SearchService;
  private readonly dataSource: MatTableDataSource<AggregatedEntry>;
  private readonly subscriptions: Subscription[];

  @ViewChild(MatPaginator) private paginator: MatPaginator;
  @ViewChild(EntryListComponent) private entryList: EntryListComponent;
  @ViewChild(SearchInputComponent) private searchInput: SearchInputComponent;

  constructor(searchService: SearchService) {
    this.searchService = searchService;

    this.dataSource = new MatTableDataSource();
    this.subscriptions = [];
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.entryList.sort;
    this.entryList.initialize(this.dataSource);

    this.subscriptions.push(
      this.searchResultObservable().subscribe((result) => this.applyResult(result))
    );
  }

  private searchResultObservable(): Observable<SearchResult<AggregatedEntry> | Error> {
    const observable = merge(this.paginator.page, this.entryList.sort.sortChange, this.searchInput.searchStringChanged)
      .pipe(
        startWith({}),
        throttleTime(50, undefined, { leading: true, trailing: true }),
        exhaustWithLastMap(() => this.search())
      );

    return observable;
  }

  applyResult(searchResult: SearchResult<AggregatedEntry> | Error) {
    if (searchResult instanceof Error) {
      console.error(searchResult);
      return;
    }

    this.dataSource.data = searchResult.items;
  }

  private async search(): Promise<SearchResult<AggregatedEntry> | Error> {
    const skip = this.paginator.pageIndex * this.paginator.pageSize;
    const limit = this.paginator.pageSize;

    const sort = new SortBuilder()
      .add(this.entryList.sortField, this.entryList.sortOrder)
      .build();

    try {
      const result = await this.searchService.searchByString(this.searchInput.searchString, skip, limit, ...sort);
      return result;
    } catch (error) {
      return error;
    }
  }
}
