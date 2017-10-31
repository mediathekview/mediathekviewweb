import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { BoolQueryBuilder, TextQueryBuilder, QueryBuilder, Query } from '../../common/search-engine/';

@Component({
  selector: 'mvw-query-builder',
  templateUrl: './query-builder.component.html',
  styleUrls: ['./query-builder.component.scss']
})
export class QueryBuilderComponent implements OnInit {
  @Output() onQuery = new EventEmitter<Query>();

  showOptions: boolean = false;

  constructor() { }

  ngOnInit() {
  }
}
