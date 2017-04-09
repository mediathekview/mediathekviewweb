import { Component, Input, OnChanges } from '@angular/core';

import { BroadcasterService } from '../../../broadcaster.service';
import { Utils } from '../../../utils';

import { Entry } from '../../../model';

@Component({
  selector: '[mvw-entry]',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.css']
})
export class EntryComponent implements OnChanges {
  @Input() entry: Entry;

  utils = Utils;

  bestVideoUrl: string = null;

  showDescription = false;
  playButtonClicked = false;

  constructor(private broadcaster: BroadcasterService) { }

  ngOnChanges() {
    if (this.entry.videos.length > 0) {
      this.bestVideoUrl = this.entry.videos.sort((a, b) => b.quality - a.quality)[0].url;
    }
  }

  toggleDescription() {
    this.showDescription = !this.showDescription;
  }

  playVideo() {
    this.broadcaster.playVideo(this.entry);
    this.playButtonClicked = false;
    setTimeout(() => this.playButtonClicked = true, 50);
  }
}
