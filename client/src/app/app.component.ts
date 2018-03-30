import { Component } from '@angular/core';

import { SearchService } from './services/search.service';
import { throttle } from './common/utils';

@Component({
  selector: 'mvw-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private readonly searchService: SearchService;

  constructor(searchService: SearchService) {
    this.searchService = searchService;
  }

  async onSearchStringChanged(searchString: string) {
    this.throttledSearch(searchString);
  }

  private throttledSearch(searchString: string) {
    const throttled = throttle((searchString: string) => {
      (async () => {
        const result = await this.searchService.search(searchString);
        console.log('search result', result);
      })();
    }, 250);

    this.throttledSearch = throttled;

    this.throttledSearch(searchString);
  }
}
