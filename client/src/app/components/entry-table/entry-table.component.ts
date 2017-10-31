import { Component, OnInit, Input } from '@angular/core';

import { Entry } from '../../common/model';

@Component({
  selector: 'mvw-entry-table',
  templateUrl: './entry-table.component.html',
  styleUrls: ['./entry-table.component.scss']
})
export class EntryTableComponent implements OnInit {
  @Input() entries: Entry[] = [];
  detailedEntry: Entry | null = null;

  constructor() { }

  ngOnInit() {
  }

  showDetails(entry: Entry) {
    this.detailedEntry = entry === this.detailedEntry ? null : entry;
  }

  equals(a: any, b: any) {
    return a === b;
  }
}
