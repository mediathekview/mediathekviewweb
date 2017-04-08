import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

import { Settings, SettingsObject } from '../../settings';

import { Utils } from '../../utils';
import { QueryHelper } from './query-helper';

import { Query, Match, IFilter, Field, SortOrder, RangeFilter } from '../../model';

@Component({
  selector: 'mvw-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
})
export class QueryComponent implements OnChanges {
  @Input() settingsNamespace: string;
  @Input() offset: number = 0;

  @Output() onQuery = new EventEmitter();
  @Output() onQueryTextChanged = new EventEmitter();

  settings: SettingsObject;

  instanceID: number;
  showSettings: boolean = false;
  saveButtonClicked: boolean = false;

  constructor() {
    this.instanceID = Utils.getInstanceID();
    this.settings = Settings.getNamespace('global');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['settingsNamespace']) {
      this.settings = Settings.getNamespace(this.settingsNamespace);
      this.showSettings = false;
    }

    if (changes['offset']) {
      this.parametersChanged();
    }
  }

  save() {
    this.settings.save();

    this.saveButtonClicked = false;
    setTimeout(() => this.saveButtonClicked = true, 50);
  }

  textChanged() {
    this.onQueryTextChanged.emit(this.settings.queryText);

    this.parametersChanged();
  }

  parametersChanged() {
    this.query();
  }

  query() {
    let query = this.buildQuery();

    this.onQuery.emit(query);
  }

  buildQuery(): Query {
    let query: Query = {
      matches: QueryHelper.createMatches(this.settings.queryText, this.settings),
      filters: QueryHelper.createFilters(this.settings),
      sortField: Field.Timestamp,
      sortOrder: SortOrder.Descending,
      offset: this.offset,
      size: this.settings.pageSize
    }

    return query;
  }
}
