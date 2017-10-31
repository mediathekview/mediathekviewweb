import { Component, OnInit, Input } from '@angular/core';

import { Entry } from '../../../common/model';

@Component({
  selector: '[mvw-entry-row-detail]',
  templateUrl: './entry-row-detail.component.html',
  styleUrls: ['./entry-row-detail.component.scss']
})
export class EntryRowDetailComponent implements OnInit {
  @Input() entry: Entry;

  constructor() {
  }

  ngOnInit() {
  }
}
