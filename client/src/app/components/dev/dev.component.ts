import { Component, OnInit } from '@angular/core';

import { Field } from '../../common/model';
import { Order } from '../../common/search-engine';
import { MatchAllQueryBuilder, RangeQueryBuilder, TimeQueryValueBuilder, TimeUnit } from '../../common/search-engine/query/builder';
import { SearchQueryBuilder } from '../../common/search-engine/query/builder/search';
import { SortBuilder } from '../../common/search-engine/query/builder/sort';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'mvw-dev',
  templateUrl: './dev.component.html',
  styleUrls: ['./dev.component.scss']
})
export class DevComponent implements OnInit {
  readonly searchService: SearchService;

  queryString: string;
  searchResult: string;

  constructor(searchService: SearchService) {
    this.searchService = searchService;
    this.searchResult = '';
    this.queryString = this.buildDefaultQueryString();
  }

  onInputChanged() {
    this.search();
  }

  ngOnInit() {
    this.search();
  }

  private buildDefaultQueryString(): string {
    const time = new TimeQueryValueBuilder()
      .time('now', TimeUnit.Minute);

    const rangeQuery = new RangeQueryBuilder()
      .field(Field.Timestamp)
      .lte(time);

    const sort = new SortBuilder()
      .add(Field.Timestamp, Order.Descending);

    const builder = new SearchQueryBuilder()
      .body(rangeQuery)
      .skip(0)
      .limit(10)
      .sort(sort);

    const query = builder.build();
    const queryString = JSON.stringify(query, null, 3);

    return queryString;
  }

  private async search() {
    try {
      const query = JSON.parse(this.queryString);
      const searchResultJson = await this.searchService.search(query);
      this.searchResult = JSON.stringify(searchResultJson, null, 3);
    } catch (error) {
      this.searchResult = (error as Error).message;
    }
  }
}
