import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
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
  cancleFade: boolean = false;

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
    let src = this.entry.videos[0].url;
    this.cancleFade = true;
    this.video.src(src);
    this.hide = false;
  }

  @HostListener('window:keydown.escape', ['$event'])
  keydown(event: KeyboardEvent) {
    if (this.video.isFullscreen() == false) {
      this.close();
    }
  }

  doubleClicked() {
    if (this.video.isFullscreen() == false) {
      this.video.requestFullscreen();
    } else {
      this.video.exitFullscreen();
    }
  }

  close() {
    this.hide = true;
    this.cancleFade = false;

    let initialVolume = this.video.volume();

    this.fadeOutVolume(initialVolume, 500, () => setTimeout(() => {
      if (this.cancleFade == false) {
        this.video.src('');
      }

      this.video.volume(initialVolume);
    }, 500), () => this.video.volume(initialVolume));
  }

  fadeOutVolume(initialVolume: number, duration: number, finishedCallback: () => void, cancledCallback: () => void, begin: number = Date.now()) {
    if (this.cancleFade == true) {
      cancledCallback();
      return;
    }

    let t = (Date.now() - begin) / (duration * initialVolume);
    let volume = Math.max(this.easeOut(1 - t), 0);

    this.video.volume(volume);

    if (volume > 0) {
      setTimeout(() => this.fadeOutVolume(initialVolume, duration, finishedCallback, cancledCallback, begin), 1);
    } else {
      finishedCallback();
    }
  }

  easeOut(t: number): number {
    return t * (2 - t);
  }
}
