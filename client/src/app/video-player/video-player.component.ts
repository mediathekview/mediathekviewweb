import { Component, Input, OnChanges, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import * as VideoJS from 'video.js';

import { Entry, Video } from '../model';
import { Utils } from '../utils';

@Component({
  selector: 'mvw-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @Input() entry: Entry;

  instanceID: number;
  videoID: string;

  video: VideoJS.Player;

  constructor() {
    this.instanceID = Utils.getInstanceID();
    this.videoID = `video-player-${this.instanceID}`;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    let options = {
      preload: 'auto',
      chromecast: {
        appId: 'MediathekViewWeb',
        title: 'hi'//this.entry.title
      }
    };

    this.video = VideoJS(this.videoID, options);
  }

  ngOnDestroy() {
    //this.video.dispose();
  }

  keydown(a) {
    console.log(a);
  }
}
