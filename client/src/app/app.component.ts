import { Component } from '@angular/core';
import { SearchService } from './services/search.service';

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
    const result = await this.searchService.search(searchString);
    console.log(result);
  }
}
