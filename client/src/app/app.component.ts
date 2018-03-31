import { Component } from '@angular/core';

import { SearchService } from './services/search.service';
import { throttle } from './common/utils';
import { SearchResult } from './common/search-engine';
import { AggregatedEntry } from './common/model';

@Component({
  selector: 'mvw-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
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
        this.searchResult = await this.searchService.search(searchString);
        console.log('search result', this.searchResult);
      })();
    }, 25);

    this.throttledSearch = throttled;
    this.throttledSearch(searchString);
  }
}
