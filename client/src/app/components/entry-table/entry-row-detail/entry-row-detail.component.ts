import { Component, OnInit, Input } from '@angular/core';

import { IndexedEntry } from '../../../common/model';

@Component({
  selector: '[mvw-entry-row-detail]',
  templateUrl: './entry-row-detail.component.html',
  styleUrls: ['./entry-row-detail.component.scss']
})
export class EntryRowDetailComponent implements OnInit {
  @Input() entry: IndexedEntry;

  constructor() {
  }

  ngOnInit() {
  }
}
