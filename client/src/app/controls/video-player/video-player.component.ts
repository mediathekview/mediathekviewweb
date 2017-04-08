import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import * as VideoJS from 'video.js';

import { BroadcasterService } from '../../broadcaster.service';

import { Entry, Video } from '../../model';
import { Utils } from '../../utils';

@Component({
  selector: 'mvw-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  entry: Entry;

  instanceID: number;
  videoID: string;

  video: VideoJS.Player;
  hide: boolean = true;

  constructor(private broadcaster: BroadcasterService) {
    this.instanceID = Utils.getInstanceID();
    this.videoID = `video-player-${this.instanceID}`;
  }

  ngOnInit() {
    this.subscribe();
  }

  ngAfterViewInit() {
    let options = {
      preload: 'auto',
      chromecast: {
        appId: 'MediathekViewWeb',
        title: 'MediathekViewWeb'
      }
    };

    this.video = VideoJS(this.videoID, options);
  }

  ngOnDestroy() {
    this.video.dispose();
  }

  subscribe() {
    this.broadcaster.onPlayVideo().subscribe((entry) => {
      this.entry = entry;
      this.playVideo();
    });
  }

  playVideo() {
    this.video.src(this.entry.videos[0]);
    this.hide = false;
  }

  keydown(a) {
    console.log(a);
  }

  close() {
    this.hide = true;
  }
}
