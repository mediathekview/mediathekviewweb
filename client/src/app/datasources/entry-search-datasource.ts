import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { AggregatedEntry } from '../common/models';
import { Sort, TextSearchQuery } from '../common/search-engine/query';
import { SearchService } from '../services/search.service';

export class EntrySearchDataSource extends DataSource<AggregatedEntry | undefined> {
  private readonly searchService: SearchService;
  private readonly pageSize: number;
  private readonly fetchedPages: Set<number>;
  private readonly dataStream: ReplaySubject<(AggregatedEntry | undefined)[]>;

  private readonly searchText: string;
  private readonly sort: Sort[] | undefined;
  private total: number | undefined;
  private cursor: string | undefined;

  private fetchedData: AggregatedEntry[];
  private subscription!: Subscription;

  constructor(searchService: SearchService, searchText: string, sort: Sort[]) {
    super();

    this.searchService = searchService;
    this.searchText = searchText;
    this.sort = sort;
    this.cursor = undefined;

    this.pageSize = 5;
    this.fetchedPages = new Set();
    this.dataStream = new ReplaySubject<(AggregatedEntry | undefined)[]>(1);
    this.fetchedData = [];
  }

  connect(collectionViewer: CollectionViewer): Observable<(AggregatedEntry | undefined)[]> {
    // tslint:disable-next-line: no-floating-promises
    this.fetchPage(0, true);

    this.subscription = collectionViewer.viewChange.subscribe(({ start, end }) => {
      this.fetchRange(start, end);
    });

    return this.dataStream;
  }

  disconnect(): void {
    this.subscription.unsubscribe();
  }

  private fetchRange(start: number, end: number): void {
    const startPage = this.getPageForIndex(start);
    const endPage = this.getPageForIndex(end - 1);

    for (let i = startPage; i <= endPage; i++) {
      // tslint:disable-next-line: no-floating-promises
      this.fetchPage(i);
    }
  }

  private getPageForIndex(index: number): number {
    return Math.floor(index / this.pageSize);
  }

  private async fetchPage(page: number, first: boolean = false): Promise<void> {
    if (this.fetchedPages.has(page)) {
      return;
    }

    this.fetchedPages.add(page);

    if ((page > 0) && !this.fetchedPages.has(page - 1)) {
      await this.fetchPage(page - 1);
    }

    if (page > 0 && this.cursor == undefined) {
      return;
    }

    const searchQuery: TextSearchQuery = {
      text: this.searchText,
      limit: this.pageSize,
      cursor: this.cursor,
      sort: this.sort
    };

    const { total, cursor, items } = await this.searchService.textSearch(searchQuery).toPromise();

    this.cursor = cursor;
    this.fetchedData = this.fetchedData.concat(items);

    if (first) {
      this.total = total;
    }

    const loadingSize = Math.min(Math.max(0, ((this.total != undefined) ? this.total : 0) - this.fetchedData.length), this.fetchedData.length + this.pageSize);
    const data = this.fetchedData.concat(new Array(loadingSize));

    this.dataStream.next(data);
  }
}
