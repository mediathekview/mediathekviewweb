import { Component, OnInit } from '@angular/core';

import { BoolQueryBuilder, TextQueryBuilder, IQueryBuilder } from '../../common/search-engine/';

@Component({
  selector: 'mvw-query-builder',
  templateUrl: './query-builder.component.html',
  styleUrls: ['./query-builder.component.scss']
})
export class QueryBuilderComponent implements OnInit {
  showOptions: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
