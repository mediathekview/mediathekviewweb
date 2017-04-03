import { Component, Input, OnChanges } from '@angular/core';

import { Entry } from '../../model';

@Component({
  selector: 'mvw-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.css']
})
export class EntryComponent implements OnChanges {
  @Input() entry: Entry;

  bestVideoUrl: string;

  showDescription = false;

  constructor() { }

  ngOnChanges() {
    this.bestVideoUrl = this.entry.videos.sort((a, b) => b.quality - a.quality)[0].url;
  }

  toggleDescription() {
    this.showDescription = !this.showDescription;
  }


}
