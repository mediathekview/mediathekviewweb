import { Component, Input } from '@angular/core';

import { Entry, Quality } from '../model';

@Component({
  selector: 'mvw-entries',
  templateUrl: './entries.component.html',
  styleUrls: ['./entries.component.css']
})
export class EntriesComponent {
  @Input() entries: Entry[];

  constructor() {

  }
}
