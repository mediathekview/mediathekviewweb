import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { MVWAPIService } from '../../mvw-api.service';
import { Settings, SettingsObject } from '../../settings';

import { Query, Entry, Video, Quality } from '../../model/';

@Component({
  selector: 'mvw-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  settings: SettingsObject;

  entries: Entry[] = [];
  totalItems: number = 0;
  selectedIndex: number = 0;

  constructor(private api: MVWAPIService, private router: Router, private route: ActivatedRoute) {
    this.settings = Settings.getNamespace('search');

    route.queryParams.subscribe((queryParams) => { console.log(queryParams); this.settings.setQueryObj(queryParams); });
  }

  onPaginationNavigate(index: number) {
    this.selectedIndex = index;
    this.settings.future = false;
  }

  setQueryParams() {
    console.log('query');
    let queryObj = this.settings.getQueryObj();

    this.router.navigate([], { queryParams: queryObj, relativeTo: this.route, replaceUrl: true });
  }

  async onQuery(query: Query) {
    this.setQueryParams();

    try {
      let response = await this.api.query(query);
      this.entries = response.entries;
      this.totalItems = response.queryInfo.totalResults;
    }
    catch (error) {
      console.error(error);
    }
  }
}
