import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { MVWAPIService } from '../../mvw-api.service';
import { Settings, SettingsObject, SettingKeys } from '../../settings';

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
  offset: number = 0;

  constructor(private api: MVWAPIService, private router: Router, private route: ActivatedRoute) {
    this.settings = Settings.getNamespace('search');

    route.queryParams.subscribe((queryParams) => this.onQueryParamsChange(queryParams));
  }

  onQueryParamsChange(queryParams) {
    let queryObj: SettingsObject = {
      queryText: (queryParams[SettingKeys.QueryText] != undefined) ? queryParams[SettingKeys.QueryText] : '',
      everywhere: queryParams[SettingKeys.Everywhere] == 'true',
      future: queryParams[SettingKeys.Future] == 'true',
      defaultQuality: this.settings.defaultQuality,
      pageSize: this.settings.pageSize,
      minDurationString: (queryParams[SettingKeys.MinDurationString] != undefined) ? queryParams[SettingKeys.MinDurationString] : '',
      maxDurationString: (queryParams[SettingKeys.MaxDurationString] != undefined) ? queryParams[SettingKeys.MaxDurationString] : '',
    }

    this.settings.setQueryObj(queryObj);

    if (queryParams['offset'] != undefined) {
      this.offset = parseInt(queryParams['offset']);
    }
  }

  onPaginationNavigate(offset: number) {
    this.offset = offset;
    this.settings.future = false;
  }

  setQueryParams() {
    let queryObj = this.settings.getQueryObj();

    if (this.offset > 0) {
      queryObj['offset'] = this.offset;
    }

    delete queryObj[SettingKeys.PageSize]; //not needed, as offset is independent of pageSize

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
