import { Component, OnInit, Input } from '@angular/core';

import { IndexedEntry } from '../../common/model';

@Component({
  selector: 'mvw-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss']
})
export class EntryComponent implements OnInit {
  @Input() entry: IndexedEntry;

  constructor() { }

  ngOnInit() {
  }

}
