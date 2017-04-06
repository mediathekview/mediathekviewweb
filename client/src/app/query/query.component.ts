import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';

import { Settings, SettingsObject } from '../settings';

import { Utils } from '../utils';
import { QueryHelper } from './query-helper';

import { Query, Match, IFilter, Field, SortOrder, RangeFilter } from '../model';

@Component({
  selector: 'mvw-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
})
export class QueryComponent implements OnChanges {
  @Input() settingsNamespace: string;

  @Output() onQuery = new EventEmitter();

  settings: SettingsObject;

  instanceID: number;
  showSettings: boolean = false;

  text: string = '';

  constructor() {
    this.instanceID = Utils.getInstanceID();
    this.settings = Settings.getNamespace('global');
  }

  ngOnChanges() {
    this.settings = Settings.getNamespace(this.settingsNamespace);

    this.showSettings = false;
    this.text = '';
  }

  parametersChanged() {
    this.query();
    this.settings.save();
  }

  query() {
    console.log(this.buildQuery());
  }

  buildQuery(): Query {
    let query: Query = {
      matches: QueryHelper.createMatches(this.text.trim(), this.settings.everywhere),
      filters: QueryHelper.createFilters(this.settings.future),
      sortField: Field.Timestamp,
      sortOrder: SortOrder.Descending,
      offset: 0,
      size: 15
    }

    return query;
  }
}
