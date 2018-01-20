import { Component, OnInit, Input } from '@angular/core';

import { IndexedEntry } from '../../../common/model';

@Component({
  selector: '[mvw-entry-row-overview]',
  templateUrl: './entry-row-overview.component.html',
  styleUrls: ['./entry-row-overview.component.scss']
})
export class EntryRowOverviewComponent implements OnInit {
  @Input() entry: IndexedEntry;

  constructor() { }

  ngOnInit() {
  }
}
