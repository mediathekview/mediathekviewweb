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
  @Input() offset: number;

  @Output() onQuery = new EventEmitter();

  settings: SettingsObject;

  instanceID: number;
  showSettings: boolean = false;
  saveButtonClicked: boolean = false;

  text: string = '';
  minLengthText: string = '';

  constructor() {
    this.instanceID = Utils.getInstanceID();
    this.settings = Settings.getNamespace('global');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['settingsNamespace']) {
      this.settings = Settings.getNamespace(this.settingsNamespace);
      this.showSettings = false;
      this.text = '';
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

  parametersChanged() {
    this.query();
  }

  query() {
    let query = this.buildQuery();
    console.log(JSON.stringify(query, null, 1));

    this.onQuery.emit(query);
  }

  buildQuery(): Query {
    let query: Query = {
      matches: QueryHelper.createMatches(this.text.trim(), this.settings),
      filters: QueryHelper.createFilters(this.settings),
      sortField: Field.Timestamp,
      sortOrder: SortOrder.Descending,
      offset: this.offset,
      size: 15
    }

    return query;
  }
}
