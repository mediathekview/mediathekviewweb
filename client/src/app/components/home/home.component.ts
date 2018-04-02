import { Component } from '@angular/core';

import { AggregatedEntry } from '../../common/model';
import { SearchResult } from '../../common/search-engine';
import { throttle } from '../../common/utils';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'mvw-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  private readonly searchService: SearchService;

  searchResult: SearchResult<AggregatedEntry> | null;

  constructor(searchService: SearchService) {
    this.searchService = searchService;
    this.searchResult = { total: 0, milliseconds: 0, items: [] };
  }

  async onSearchStringChanged(searchString: string) {
    this.throttledSearch(searchString);
  }

  private throttledSearch(searchString: string) {
    const throttled = throttle((searchString: string) => {
      (async () => {
        this.searchResult = await this.searchService.searchByString(searchString);
        console.log('search result', this.searchResult);
      })();
    }, 25);

    this.throttledSearch = throttled;
    this.throttledSearch(searchString);
  }
}
