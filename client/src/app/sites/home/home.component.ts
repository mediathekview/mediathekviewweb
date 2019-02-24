import { DataSource } from '@angular/cdk/table';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { EntrySearchDataSource } from 'src/app/datasources/entry-search-datasource';
import { AggregatedEntry, Field } from '../../common/model';
import { Order } from '../../common/search-engine/query';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'mvw-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private readonly searchService: SearchService;

  readonly entriesDataSource: ReplaySubject<DataSource<AggregatedEntry | undefined>>;
  readonly error$: ReplaySubject<Error | undefined>;

  constructor(searchService: SearchService) {
    this.searchService = searchService;

    this.error$ = new ReplaySubject();
    this.entriesDataSource = new ReplaySubject();
  }

  async searchStringChanged(searchString: string): Promise<void> {
    const sort = [{ field: Field.Date, order: Order.Descending }, { field: Field.Id, order: Order.Descending }];
    const dataSource = new EntrySearchDataSource(this.searchService, searchString, sort);

    this.entriesDataSource.next(dataSource);
  }
}
